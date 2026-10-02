# 12 > 多 GPU 协同

大型 AI 模型要同时用几百甚至几千块 GPU 来训练。这一课讲为什么一块 GPU 不够用，GPU 在一台服务器、一个机柜和整个集群里是怎样连在一起的，以及工作怎样分给它们。最后反过来看：把一块大 GPU 切成几块小 GPU。

## 为什么一块 GPU 不够

用多块 GPU 有两个原因：模型放不进一块 GPU 的显存，或者用一块 GPU 训练要花太久。

拿一个有 700 亿个参数的模型来说。用 BF16 存储时，每个参数占 2 字节，见 [第 10 课](../Lesson-10/notes.md)：

- 只算权重：70 × 10⁹ × 2 字节 = 140 GB。这已经超过 H100 的 80 GB，差不多是 L40S 48 GB 的 3 倍。
- 训练需要的多得多。一种常见做法是每个参数大约占 16 字节：BF16 权重 2 字节，梯度 2 字节，FP32 的权重主副本 4 字节，再加上 Adam 优化器为每个参数保存的两个值 8 字节。合计 70 × 10⁹ × 16 = 1,120 GB。
- 1,120 GB / 80 GB = 14。所以光是放下这些状态就至少要 14 块 H100，这还没存任何一个激活值。

> [!NOTE]
> 激活值会随批大小和序列长度增长，输入很长时，它们占的显存可能比权重还多。这就是为什么真实的训练任务用的 GPU 远多于这里估算的 14 块。

第二个原因是时间。训练一个大模型需要的计算量是固定的。如果一块 GPU 要算好几年，那么 1,000 块 GPU 理论上几天就能算完，但前提是它们交换结果的速度足够快。这一课剩下的部分讲的就是这种交换。

## 纵向扩展与横向扩展

GPU 在两个层面上相连：

- 纵向扩展：离得很近的 GPU，在同一台服务器或同一个机柜里，用非常快的 NVLink 连接。对程序来说，它们几乎就像一块大 GPU。
- 横向扩展：许多服务器或机柜通过网络相连，也就是 InfiniBand 或以太网。按每块 GPU 算，这个网络要慢得多，但它能扩展到几千台服务器。

下面的图展示了从一块 GPU 到多个机柜组成的集群这四种规模，以及每一层的连接类型和每块 GPU 能分到的带宽。

<multi-gpu></multi-gpu>

## PCIe 与 NVLink

每块 GPU 都通过 PCIe 和 CPU 通信，见 [第 11 课](../Lesson-11/notes.md)。这些课一直使用的 L40S 是 PCIe 4.0 x16，两个方向加起来 64 GB/s，每个方向 32 GB/s。同一台服务器里的两块 L40S 只能通过 PCIe 通信，L40S 没有 NVLink。

NVLink 是 NVIDIA 的 GPU 到 GPU 直连链路。每一代都把每块 GPU 的带宽大约翻一倍，两个方向合在一起算。最新的几代已经达到好几 TB/s：

| NVLink | 架构 | 示例 GPU | 每块 GPU 的带宽 |
|---|---|---|---|
| 1 | Pascal | P100 | 160 GB/s |
| 2 | Volta | V100 | 300 GB/s |
| 3 | Ampere | A100 | 600 GB/s |
| 4 | Hopper | H100 | 900 GB/s |
| 5 | Blackwell | B200 | 1.8 TB/s |
| 6 | Rubin | Rubin | 3.6 TB/s |

H100 用 18 条各 50 GB/s 的 NVLink 链路凑出 900 GB/s。B200 同样有 18 条链路，每条 100 GB/s。使用 NVLink 6 的 Rubin 系统从 2026 年下半年开始出货。

> [!TIP]
> 互连带宽的数字通常把两个方向加在一起。H100 的 900 GB/s 是同时发送 450 GB/s 加接收 450 GB/s。算传输时间时，要除以单向的数字。

## NVSwitch 与 8 卡服务器

有 8 块 GPU 时，如果让每块 GPU 直接连到其他每一块，它的 18 条链路就会被分成很小的几组。所以实际做法是所有 GPU 都连到 NVSwitch 芯片上。NVSwitch 是 NVLink 的交换机：任何一块 GPU 都能通过它以链路的全速访问任何另一块 GPU。

一台 DGX H100 服务器在一块主板上有 8 块 H100 和 4 颗 NVSwitch 芯片。任意两块 GPU 之间都能以 900 GB/s 通信，而且 8 块可以同时这样做。8 卡 B200 服务器的原理一样，每块 GPU 1.8 TB/s。

## NVL72 机柜

GB200 NVL72 把同样的思路从一台服务器扩展到整个机柜。它在 18 个计算托盘里装了 72 块 Blackwell GPU 和 36 颗 Grace CPU，机柜中间还有 9 个 NVLink 交换托盘。这 72 块 GPU 构成一个 NVLink 域：每块 GPU 都能以 1.8 TB/s 访问其他任何一块。加起来是 72 × 1.8 TB/s ≈ 130 TB/s。

因为一个 NVLink 域里的每条链路都这么快，72 块 GPU 可以分担那种需要不停通信的工作，这种工作放到网络上就会慢得没法用。Vera Rubin NVL72 仍然是每个域 72 块 GPU，但用 NVLink 6 把每块 GPU 的链路翻倍到 3.6 TB/s。

## 服务器之间：InfiniBand 与以太网

超出一个 NVLink 域之后，服务器和机柜通过网络相连。AI 数据中心用 InfiniBand 或高速以太网。通常每块 GPU 有自己的网卡：DGX H100 有 8 块 400 Gb/s 的 ConnectX-7 网卡，每块 GPU 一块；GB300 NVL72 用 ConnectX-8 给每块 GPU 800 Gb/s。

> [!WARNING]
> 网络速度按比特计，写作 Gb/s；GPU 链路按字节计，写作 GB/s。要除以 8：400 Gb/s = 50 GB/s，800 Gb/s = 100 GB/s，都是单向。所以 H100 通过 NVLink 能发送 450 GB/s，通过网卡却只有 50 GB/s，少了 9 倍。

这个差距决定了多 GPU 程序的一切：把通信最多的工作放在一个 NVLink 域里，只把必须跨网络的数据送出去。

## NCCL 与集合通信

多块 GPU 一起训练一个模型时，必须一次又一次地合并各自的结果。一组 GPU 全部参与的一次交换叫做集合通信。最重要的是 all-reduce：每块 GPU 一开始有自己的一串数字，结束时每块 GPU 都拿到所有这些数字串的总和。

在 NVIDIA GPU 上做这件事的库是 NCCL。它会找出最快的路径，NVLink、PCIe 或网络，然后执行 all-reduce、broadcast 和 all-gather 等集合通信。

all-reduce 的一种常见做法是环。GPU 围成一个圈，每块都把数据块发给邻居，绕圈两轮之后，每块 GPU 都有了完整的总和。有 N 块 GPU、数据大小为 S 时，每块 GPU 发送 2 × (N - 1) / N × S。不管环里有多少块 GPU，这都接近 2 × S。

## 算一算：PCIe 与 NVLink 上的 all-reduce

拿一个 70 亿参数的模型，在 8 块 GPU 上训练。每一步之后，BF16 格式的梯度都要在 8 块 GPU 之间求和：

- 数据大小：7 × 10⁹ × 2 字节 = 14 GB。
- 每块 GPU 发送 2 × (8 - 1) / 8 × 14 GB = 2 × 0.875 × 14 GB = 24.5 GB，同时接收同样多的数据。

现在除以每种链路的单向带宽：

| 链路 | 单向 | 24.5 GB 所需时间 |
|---|---|---|
| PCIe 4.0 x16 (L40S) | 32 GB/s | 24.5 / 32 ≈ 0.77 s |
| 400 Gb/s 网络 | 50 GB/s | 24.5 / 50 = 0.49 s |
| NVLink 4 (H100) | 450 GB/s | 24.5 / 450 ≈ 0.054 s |
| NVLink 5 (B200) | 900 GB/s | 24.5 / 900 ≈ 0.027 s |

这些都是纸面上的最好情况。在真实的 8 卡 PCIe 服务器里，几块卡共用同一组 PCIe 交换芯片和 CPU 链路，所以还会更慢。如果一个训练步的计算要 0.5 s，PCIe 服务器花在交换梯度上的时间就比计算还多。NVLink 让这次交换缩短到大约 1/14。

## 三种拆分工作的方式

数据并行：每块 GPU 都有完整的模型，各自处理批次中不同的一部分。每一步之后用 all-reduce 把梯度加起来，让所有副本保持一致。这是最简单的方法，但每块 GPU 都必须放得下整个模型。FSDP 这类变体把权重和优化器的值分散到各块 GPU 上，只在需要时再收集。

张量并行：把每一层的大矩阵切成几块，每块 GPU 计算每一层中属于自己的那块。GPU 在每一层里都要交换部分结果，每一步要交换很多次，所以张量并行总是放在一个 NVLink 域里。

流水线并行：把各层分成几个阶段，比如第 1 到 20 层放在第一块 GPU，第 21 到 40 层放在第二块。激活值像流水线一样一站一站往下传。只有阶段边界上的激活值需要传输，所以慢一些的链路也够用；但除非把批次切成很小的微批次，否则各阶段会互相等待。

大型训练任务把三种方式结合起来：服务器或机柜内部用张量并行，跨服务器或机柜分流水线阶段，整个集群上用数据并行。

## 反过来：MIG

有时一块 GPU 太大了。一个小模型或一个写 notebook 的用户可能只需要 H100 的一小部分。MIG 把一块 GPU 切成最多 7 个相互隔离的实例。每个实例有自己的 SM、自己那部分 L2 缓存和自己那部分显存，所以一个用户既不能拖慢另一个用户，也读不到对方的数据。比如一块 H100 80 GB 可以变成 7 个各 10 GB 的实例。

从 Ampere 开始的数据中心 GPU 都有 MIG：A100、H100、H200 和 B200 最多 7 个实例，A30 最多 4 个。RTX PRO 6000 Blackwell 把 MIG 带到了工作站显卡上，最多 4 个实例。

> [!NOTE]
> L40S 既没有 MIG，也没有 NVLink。多个程序仍然可以共用它，但只能轮流使用，也就是时间片，没有硬件隔离。

## 这对 CUDA 意味着什么

在 CUDA 里，一个核函数总是运行在一块 GPU 上。使用多块 GPU 的程序用 `cudaSetDevice` 选中每一块，再在每一块上启动核函数。数据用 `cudaMemcpyPeer` 在 GPU 之间搬运，有 NVLink 时走 NVLink，没有时走 PCIe。all-reduce 和其他集合通信直接调用 NCCL，不用自己写。

通信应该和计算重叠：一块 GPU 在计算某一层梯度的同时，NCCL 已经可以发送上一层的梯度。在 MIG 实例上，`cudaGetDeviceProperties` 只报告这个实例的 SM 数量，所以核函数应该按报告的 SM 数来决定网格大小，就像 [第 05 课](../Lesson-05/notes.md) 那样，而不是写死 132 这样的数字。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：这条学习路线讲的处理器；这一课把很多块连在一起。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；正是大型 AI 模型让 GPU 成千上万地连在一起。
- 参数（parameter）：模型学到的一个数；700 亿参数的模型有 70 × 10⁹ 个。
- BF16（brain floating point，16 位脑浮点）：训练中用于权重和梯度的 2 字节数值格式。
- FP32（32-bit floating point，32 位浮点）：4 字节数值格式；训练时常用它保存权重的主副本。
- 梯度（gradient）：一个训练步之后每个参数应该改变多少；数据并行会在 GPU 之间把它们加起来。
- 激活值（activation）：某一层的中间结果；它占的显存可能比权重还多。
- 纵向扩展 / 横向扩展（scale up / scale out）：用 NVLink 连接离得近的 GPU，或用网络连接服务器。
- PCIe（Peripheral Component Interconnect Express，高速外设互连）：CPU 和 GPU 之间的链路；PCIe 4.0 x16 每个方向 32 GB/s。
- CPU（Central Processing Unit，中央处理器）：服务器的主处理器；GPU 通过 PCIe 访问它。
- NVLink：NVIDIA 的 GPU 到 GPU 直连链路；H100 每块 GPU 900 GB/s，B200 是 1.8 TB/s。
- GB/s（gigabytes per second，吉字节每秒）/ Gb/s（gigabits per second，吉比特每秒）：每秒的字节数或比特数；8 Gb/s = 1 GB/s。
- TB/s（terabytes per second，太字节每秒）：1,000 GB/s；NVLink 5 给 B200 1.8 TB/s。
- NVSwitch：NVLink 的交换芯片，让每块 GPU 都能以全速访问其他每一块 GPU。
- NVL72：一个机柜里 72 块 GPU 组成一个 NVLink 域，比如 GB200 NVL72。
- NVLink 域（NVLink domain）：一组全部通过 NVLink 互相访问的 GPU。
- InfiniBand / 以太网（Ethernet）：连接服务器和机柜的网络；每块 GPU 400 或 800 Gb/s。
- 集合通信（collective）：一组 GPU 全部参与的一次交换，比如 all-reduce。
- all-reduce：一种集合通信，结束后每块 GPU 都拿到所有 GPU 数据的总和。
- NCCL（NVIDIA Collective Communications Library，NVIDIA 集合通信库）：在 NVIDIA GPU 上执行集合通信的库。
- broadcast：一种集合通信，一块 GPU 把同样的数据发给其他所有 GPU。
- all-gather：一种集合通信，结束后每块 GPU 都拿到每块 GPU 的那一份。
- 环（ring）：一种 all-reduce 方法，GPU 沿着一个圈传递数据块；每块 GPU 大约发送 2 倍的数据量。
- 数据并行（data parallelism）：每块 GPU 都有整个模型，各自处理批次中不同的一部分。
- FSDP（Fully Sharded Data Parallel，完全分片数据并行）：把权重和优化器的值分散到各块 GPU 上的数据并行。
- 张量并行（tensor parallelism）：把每一层的矩阵分到多块 GPU 上，它们在每一层里都要通信。
- 流水线并行（pipeline parallelism）：把各层分成几个阶段放到不同的 GPU 上，就像流水线。
- MIG（Multi-Instance GPU，多实例 GPU）：把一块 GPU 切成最多 7 个相互隔离的实例。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 的基本组成单元；每个 MIG 实例有自己的 SM。
- 时间片（time slicing）：多个程序轮流使用一块 GPU，没有隔离。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 用来编写在 GPU 上运行的程序的平台。
