# 11 > CPU 到 GPU 的数据通路

核函数只能处理已经放在 GPU 显存里的数据，而这些数据几乎总是先在 CPU 内存里。这一课跟着字节走完这条路，依次经过 PCIe 链路、锁页主机内存、异步复制、统一内存，以及 Grace Hopper 和 Grace Blackwell 上更快的链路。[第 00 课](../Lesson-00/notes.md)给过简短版本。这里你会看到这条路为什么慢，以及你能怎么应对。

## 两块内存，一条链路

一台普通的 GPU 服务器有两块彼此独立的内存。

- 主机内存，即主板上、CPU 旁边的系统 RAM
- 设备内存，即 GPU 自己的显存，是 GPU 板卡上的 GDDR 或 HBM

CPU 不能像读自己的 RAM 那样读设备内存，核函数也不能全速直接读主机内存。两者之间隔着一条链路，大多数机器上是 PCIe。GPU 处理的每一个字节，至少要经过这条链路一次。

在这些课一直使用的 L40S 上，两边的差距非常大。它 48 GB 的 GDDR6 以 864 GB/s 的速度给 SM 供数据，而通往 CPU 的 PCIe 4.0 x16 链路每个方向只有大约 31.5 GB/s。[第 07 课](../Lesson-07/notes.md)讲数据进了 GPU 之后的事，这一课讲怎么把它送进去。

## PCIe 链路

PCIe 由通道组成。每条通道有两对线，每个方向一对，所以链路可以同时收发，这叫全双工。GPU 插槽有 16 条通道，写作 x16。每一代都把单条通道的速度翻一倍，单位是 GT/s。

| 代 | 单条通道 | x16，每个方向 | 使用它的 GPU |
|---|---|---|---|
| PCIe 3.0 | 8 GT/s | 15.8 GB/s | V100 |
| PCIe 4.0 | 16 GT/s | 31.5 GB/s | A100、L40S |
| PCIe 5.0 | 32 GT/s | 63 GB/s | H100、B200、RTX 5090 |
| PCIe 6.0 | 64 GT/s | 约 121 GB/s | Blackwell Ultra（B300） |

表里 x16 的数字都是单个方向的。数据手册上写的“PCIe Gen4 x16, 64 GB/s”是把两个方向加在一起。一次复制到 GPU 只用一个方向，所以对一次复制有用的是单方向的数字。

> [!NOTE]
> 规格表会取整。PCIe 4.0 x16 每个方向是 31.5 GB/s，常写成 32 GB/s。实际复制会再低一些，因为每个数据包还要带包头和校验。PCIe 7.0（每条通道 128 GT/s）已在 2025 年 6 月定稿，但目前还没有 GPU 使用它。

<data-path></data-path>

## 算一算把 4 GB 送到 L40S

假设程序要在 L40S 上用 4 GB 的输入。这一趟要多久？和数据到了 GPU 之后再读一遍相比又如何？

- 走 PCIe 4.0 x16，4 GB / 31.5 GB/s = 0.127 秒，约 127 毫秒
- 从 L40S 自己的显存读，4 GB / 864 GB/s = 0.0046 秒，约 4.6 毫秒
- 比值是 864 / 31.5 = 27.4，所以复制所花的时间大约是在 GPU 上完整读一遍的 27 倍

换成 PCIe 5.0 的卡，比如 H100 PCIe 或 RTX 5090，复制时间减半，4 / 63 = 0.063 秒，约 63 毫秒。但这仍然远远慢于这些 GPU 从自己显存读取的 1.8 TB/s 甚至更高的速度。

## 复制什么时候占大头

现在加上一个核函数。设它把 4 GB 读一遍，再写出 4 GB 的结果。它在设备内存上搬了 8 GB，所以在 L40S 上至少要 8 / 864 = 0.0093 秒，约 9.3 毫秒。而把输入复制进去、把结果复制回来要 127 + 127 = 254 毫秒。核函数只占总时间的不到 4%，因为 9.3 / (254 + 9.3) = 0.035。

只有当 GPU 对收到的每个字节做大量工作时，复制才不再占大头。

- 核函数把数据反复用很多次，比如矩阵乘法，这样它的运行时间变长，而复制时间不变
- 数据在多个核函数之间一直留在 GPU 上，复制只付一次，之后都以 864 GB/s 读取
- 程序里 CPU 那部分本来就比复制还慢

[第 09 课](../Lesson-09/notes.md)用算术强度来衡量“每个字节做多少工作”。同样的思路也适用于链路。要藏住一次 PCIe 4.0 复制，所需的每字节工作量大约是藏住一次 L40S 显存读取的 27 倍。

> [!WARNING]
> 不要只给核函数计时，然后把它当成整个程序的加速比。如果数据要从 CPU 过来，复制进去和复制回来都应该算进去，对简单的核函数来说，它们就是时间的大头。

## 可分页内存与锁页内存

复制本身由 GPU 上的 DMA 引擎完成。这是一块硬件，能自己通过 PCIe 读取主机内存，不需要 CPU 一个字节一个字节地搬。DMA 引擎需要固定的物理地址，主机内存的种类正是在这里起作用。

- 可分页内存是 `malloc` 或 `new` 给你的内存。OS 随时可能把这些页挪到 RAM 的别处，或者换出到磁盘，所以 DMA 引擎不能安全地读它们。
- 锁页内存是操作系统保证永远不会挪动的主机内存，也叫 page-locked 内存。在 CUDA 里，你可以用 `cudaMallocHost` 或 `cudaHostAlloc` 分配，或用 `cudaHostRegister` 锁住一块已有的缓冲区。

从可分页内存复制时，驱动会绕开这个问题。它先用 CPU 把你的数据复制到自己的一块锁页暂存缓冲区，再让 DMA 引擎把这块缓冲区一段一段地送到 GPU。每个字节被复制了两次，一次由 CPU，一次走 PCIe。从锁页内存复制时，DMA 引擎直接读你的缓冲区，暂存这一步没有了，链路可以跑到接近峰值。

> [!TIP]
> 把经常要复制的缓冲区设为锁页内存，并且只分配一次。锁页的建立很慢，还会从操作系统手里拿走 RAM，所以“以防万一”锁住好几 GB，可能会拖慢整台机器。

## 同步复制与异步复制

`cudaMemcpy` 就是 [CUDA 第 08 课](../../cuda/Lesson-08/notes.md)用的普通复制。它是同步的，CPU 线程要等复制完成，而这期间 GPU 不会运行你程序里的其他工作。复制、计算、复制回来，严格地一个接一个进行。

`cudaMemcpyAsync` 只把复制放进队列，然后立刻返回。配合流，复制和核函数就能重叠。流是一条按顺序执行的 GPU 工作队列，不同流里的工作可以同时进行。GPU 有独立的复制引擎，所以它可以一边复制一块数据，一边让 SM 计算另一块。

一个使用 4 个流的流水线是这样的。把 4 GB 分成 4 块，每块 1 GB。每块复制要 1 / 31.5 = 0.032 秒（32 毫秒）。假设核函数处理每块要 12 毫秒。一个接一个做要 4 × 32 + 4 × 12 = 176 毫秒。重叠起来，第 1 块的核函数在第 2 块复制时运行，总时间降到大约 4 × 32 + 12 = 140 毫秒。复制时间仍然都在，只是核函数的时间藏到了它后面。

异步复制需要锁页主机内存。从可分页内存出发，`cudaMemcpyAsync` 仍然要经过驱动的暂存缓冲区，通常就不再是异步的了。

## 统一内存

统一内存给你一个两边都能用的指针。你用 `cudaMallocManaged` 分配它，在 CPU 上写入，传给核函数，再在 CPU 上读结果，代码里不需要任何 `cudaMemcpy`。

数据仍然要走那条链路。从 Pascal 开始，GPU 能处理缺页。当核函数访问一个还在主机内存里的页时，GPU 先停下这次访问，驱动把这一页迁移到设备内存，然后访问继续。这种按需的页迁移很方便，但许多小的缺页比一次大复制要慢。`cudaMemPrefetchAsync` 让驱动提前搬这些页，可以找回显式复制的大部分速度。

## Grace Hopper 与 Grace Blackwell 上的一致性链路

NVIDIA 的超级芯片在 CPU 和 GPU 之间不再用 PCIe。GH200 Grace Hopper 超级芯片把一颗 Grace CPU（Arm 架构，最多 480 GB 的 LPDDR5X 内存）和一颗 Hopper GPU 放在一块板上，用 NVLink-C2C 连起来。GB200 Grace Blackwell 超级芯片用同样的方式把一颗 Grace CPU 和两颗 B200 GPU 连起来。

NVLink-C2C 总共 900 GB/s，每个方向 450 GB/s，大约是 PCIe 5.0 x16 的 7 倍。它还是一致性的。CPU 和 GPU 看到同一个地址空间，并保持各自的缓存一致，所以 GPU 可以直接读 CPU 内存，即使是 `malloc` 来的普通内存，也不需要暂存。对 GPU 要反复读取的数据，复制过去仍然划算，因为 HBM 还要更快，但链路已经不像 PCIe 上那样是最窄的地方了。

## GPUDirect

GPUDirect 是 NVIDIA 对一组完全绕开主机内存的通路的统称。GPUDirect P2P 让同一台机器里的两块 GPU 直接互相复制。GPUDirect RDMA 让 NIC 直接读写 GPU 显存，于是来自另一台服务器的数据不经过 CPU 的 RAM 就落到 GPU 上。GPUDirect Storage 对 NVMe 硬盘和网络存储做同样的事。[第 12 课](../Lesson-12/notes.md)讲多块 GPU 怎样一起使用这些通路。

## 这对 CUDA 意味着什么

再快的核函数也弥补不了慢的数据通路。写 CUDA 时要记住下面几点。

- 只复制一次，让数据尽可能在多个核函数之间留在 GPU 上，最后只把结果复制回来
- 对经常复制的缓冲区使用锁页主机内存（`cudaMallocHost`）
- 数据不符合“只复制一次”的模式时，用 `cudaMemcpyAsync` 和流让复制和核函数重叠
- 用 `cudaMallocManaged` 时要预取，不要依赖缺页
- 把复制时间和核函数时间放在一起测量，并都和链路带宽比较。在 L40S 上，4 GB / 31.5 GB/s = 127 毫秒就是下限

## 术语表

- 主机内存（host memory）：CPU 旁边的系统 RAM。在 CUDA 代码里，主机端缓冲区常以 `h_` 开头。
- 设备内存（device memory）：GPU 自己的显存（GDDR 或 HBM）。在 CUDA 代码里，设备端缓冲区常以 `d_` 开头。
- RAM（Random Access Memory，随机存取存储器）：计算机的主内存，CPU 的 RAM 就是主机内存。
- CPU（Central Processing Unit，中央处理器）：主处理器。在 CUDA 里它是主机端，负责准备数据和启动核函数。
- GPU（Graphics Processing Unit，图形处理器）：拥有成千上万个简单核心的处理器，在 CUDA 里它是设备端。
- GDDR（Graphics Double Data Rate，图形双倍数据速率）：游戏卡和工作站 GPU 上的显存，比如 L40S 上的 48 GB GDDR6。
- HBM（High Bandwidth Memory，高带宽内存）：数据中心 GPU（如 H100 和 B200）上紧挨着 GPU 芯片的堆叠内存。
- PCIe（Peripheral Component Interconnect Express，高速外设互连）：CPU 与 GPU 等插卡之间的标准链路。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 的处理单元，L40S 有 142 个。
- 通道（lane）：一条 PCIe 连接，每个方向各有一对线。GPU 插槽用 16 条通道（x16）。
- x16：有 16 条通道的 PCIe 链路，是 GPU 插槽的标准宽度。
- 全双工（full duplex）：同时发送和接收，每个方向都是全速。
- GT/s（gigatransfers per second，每秒十亿次传输）：单条 PCIe 通道的原始信号速率，PCIe 4.0 是 16 GT/s。
- 每个方向（per direction）：只算一个方向的带宽。复制到 GPU 只用一个方向，所以 PCIe 4.0 x16 是 31.5 GB/s。
- L40S：这些课使用的 NVIDIA Ada Lovelace 数据中心 GPU，显存带宽 864 GB/s，接口 PCIe 4.0 x16。
- 核函数（kernel）：在 GPU 上运行、由 CPU 启动的函数。
- 算术强度（arithmetic intensity）：每搬一个字节所做的工作量。每字节工作越多，越能藏住慢的复制。
- DMA（Direct Memory Access，直接内存访问）：GPU 上通过 PCIe 自行搬运数据的硬件，不需要 CPU 逐字节复制。
- 可分页内存（pageable memory）：`malloc` 或 `new` 得到的普通主机内存，操作系统可能挪动它或把它换出。
- OS（operating system，操作系统）：管理内存、决定每一页放在哪里的软件，比如 Linux。
- 换出（swap）：RAM 不够时把内存页挪到磁盘上。
- 锁页内存（pinned memory）：被锁定在原位的主机内存（page-locked），DMA 引擎可以直接读取，由 `cudaMallocHost` 分配。
- 暂存缓冲区（staging buffer）：驱动的一块锁页缓冲区，可分页数据先复制到这里，再送往 GPU。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在其 GPU 上运行的程序。
- `cudaMallocHost`：分配锁页主机内存的 CUDA 调用，用 `cudaFreeHost` 释放。
- `cudaMemcpy`：同步的 CUDA 复制，CPU 线程要等它完成。
- `cudaMemcpyAsync`：放进某个流里排队、立刻返回的复制。要真正异步，需要锁页内存。
- 流（stream）：按顺序执行的 GPU 工作队列，不同流里的工作可以重叠。
- 复制引擎（copy engine）：GPU 上的 DMA 引擎，在 SM 运行核函数的同时执行复制。
- 统一内存（unified memory）：CPU 和 GPU 都能通过同一个指针访问的内存，由驱动搬运内存页。
- `cudaMallocManaged`：分配统一内存的 CUDA 调用。
- 缺页（page fault）：访问的页不在需要的位置，这次访问要等到页被搬过来或映射好才继续。
- 页迁移（page migration）：把一个内存页从主机内存搬到设备内存，或者反过来。
- `cudaMemPrefetchAsync`：提前搬运统一内存的页，让核函数不会因缺页而停下。
- Grace Hopper（GH200）：一颗 Grace CPU 和一颗 Hopper GPU 通过 NVLink-C2C 相连的超级芯片。
- Grace Blackwell（GB200）：一颗 Grace CPU 和两颗 B200 GPU 通过 NVLink-C2C 相连的超级芯片。
- LPDDR5X（Low-Power Double Data Rate 5X，低功耗双倍数据速率 5X）：Grace CPU 使用的高能效内存。
- NVLink-C2C（NVLink Chip-to-Chip，芯片间 NVLink）：NVIDIA 的一致性 CPU-GPU 链路，总共 900 GB/s，每个方向 450 GB/s。
- 一致性（coherent）：CPU 和 GPU 共用一个地址空间并保持缓存一致，所以双方都能读对方的内存。
- GPUDirect：NVIDIA 的一组通路，让数据进出 GPU 显存时不必在主机内存停留。
- P2P（peer to peer，点对点）：同一台机器里两块 GPU 之间不经过主机内存的直接复制。
- RDMA（Remote Direct Memory Access，远程直接内存访问）：通过网络读写另一台机器的内存，不经过它的 CPU。
- NIC（Network Interface Card，网卡）：把服务器接入网络的板卡。
- NVMe（Non-Volatile Memory Express，非易失性内存主机控制器接口）：PCIe 上 SSD（solid state drive，固态硬盘）存储使用的高速接口。
