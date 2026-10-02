# 00 > CPU 与 GPU 基础

这一课讲 GPU（Graphics Processing Unit，图形处理器）和 CPU（Central Processing Unit，中央处理器）有什么区别。我们还会打开一块 GPU，看看里面都有哪些部件。后面每一课都建立在这些概念之上。

## 光把代码搬到 GPU 上还不够

把代码从 CPU 搬到 GPU 上运行，并不会让它自动变快。只有理解了 GPU 的工作方式，你才能获得好的性能。

## 目标不同

CPU 和 GPU 都能处理数据、执行指令。但两者的设计目标截然不同。

CPU 的设计重点是：

- 响应快  
- 能处理复杂逻辑  
- 顺序执行（一步接一步）  

GPU 的设计重点是同时处理很多事情。

- CPU：一个复杂任务，做得非常快  
- GPU：很多简单任务，并行完成  

## 内存

CPU 使用系统内存（RAM，Random Access Memory，随机存取存储器）。所有数据都经过同一块共享的内存空间。

GPU 有自己的内存，叫作 VRAM，也就是显存。游戏显卡用的是 GDDR（Graphics Double Data Rate）显存，数据中心 GPU 用的是 HBM（High Bandwidth Memory，高带宽内存）。这意味着：

- CPU 和 GPU 不会自动共享数据  
- 数据必须在两者之间复制  

这一步复制可能成为瓶颈。以 NVIDIA L40S 为例：它读取自己 48 GB 的 GDDR6 显存，速度是 864 GB/s；它和 CPU 之间走 PCIe 4.0 x16，每个方向大约 32 GB/s。通过 PCIe 搬 1 GB 数据要 1 / 32 = 0.031 秒，约 31 毫秒。从显存读同样的 1 GB 只要 1 / 864 = 0.0012 秒，约 1.2 毫秒。复制要慢 864 / 32 = 27 倍。

> [!WARNING]
> CPU 和 GPU 之间的数据复制，往往是 GPU 程序里最慢的一步。复制一次，在 GPU 上做大量计算，再把结果复制回来一次。

## 缓存与共享内存

缓存是一块很小、速度很快的存储，离处理器很近。CPU 和 GPU 都有缓存，但用法不一样。

> [!NOTE]
> CPU 依赖多级缓存：L1、L2 和 L3。它们容量小，但速度非常快。

GPU 也有缓存，此外还多了一样东西：共享内存。GPU 里的线程靠它协作、交换数据。共享内存是 GPU 优化最重要的手段之一。

## 核心速度

GPU 强，并不是因为它的每个核心更快。单个 CPU 核心的时钟频率通常更高：台式机 CPU 的单核加速频率常常能到 5 GHz（吉赫兹）甚至更高。GPU 核心要慢一些：2025 年的顶级游戏显卡 GeForce RTX 5090，加速频率是 2.41 GHz。如果单核对单核比，CPU 会赢。

## GPU 的算力从哪里来

GPU 有很多简单的核心。它把工作拆成许多小块，同时运行。它的算力来自大量核心协同工作，而不是单个核心有多强。

比如 L40S 有 142 个 SM，每个 SM 有 128 个核心，一共 142 * 128 = 18,176 个核心。一颗 16 核的台式机 CPU，核心数只有它的 1 / 1,136（18,176 / 16 = 1,136）。就算每个 CPU 核心快一倍，也补不上一千多倍的差距。

只有当问题能拆成可以并行的小块时，GPU 才有优势。如果任务只能顺序执行，CPU 完全可能比 GPU 更快。

<cpu-vs-gpu></cpu-vs-gpu>

## CPU 和 GPU 如何配合

GPU 并不是单独工作的。在典型的系统里：

- CPU 负责管理程序  
- GPU 负责运行并行任务  

两者通过 PCIe（PCI Express）之类的连接通信，数据流向大致如下：

CPU → 把数据发给 GPU  
GPU → 处理数据  
GPU → 把结果发回来  

如果这个流程处理得不好，性能就会下降。

## 流式多处理器（SM）

GPU 内部最重要的单元是 SM（Streaming Multiprocessor，流式多处理器）。SM 是一个小型处理单元。一块 GPU 就是许多个 SM 协同工作。

每个 SM 都具备运行并行任务所需的全部部件：

- 寄存器，速度最快的存储  
- 共享内存，线程在这里交换数据  
- 控制单元，决定运行什么、什么时候运行  
- 执行单元，负责实际的计算  

## 执行单元

每个 SM 里有多种计算单元，每种各有专长：

- 浮点单元，在图形和 AI（artificial intelligence，人工智能）中用得很多  
- 整数单元  
- Tensor Core，用于矩阵运算，对 AI 至关重要  
- 特殊函数单元（SFU），用于更复杂的数学运算  
- 加载/存储单元，负责在显存和计算单元之间搬运数据  

所以 GPU 不只是“很多核心”，而是由各种专用单元有序组织起来的系统。

> [!TIP]
> 规格表上写的“18,176 个 CUDA 核心”，只统计了浮点单元。Tensor Core 和其他单元是另外列出的。[第 03 课](../Lesson-03/notes.md)会教你怎么读这些数字。

## L2 缓存

L2 缓存是整个 GPU 共用的一层缓存。它不像 L1 或共享内存那样属于某一个 SM。它容量更大，但速度更慢，作用是降低访问显存的开销。

<gpu-anatomy></gpu-anatomy>

## 为什么这很重要

CUDA（Compute Unified Device Architecture，统一计算设备架构）不只是写代码，更是要理解硬件。想用好 GPU，你需要知道：

- 显存是怎么工作的  
- 并行执行是怎么工作的  
- 数据是怎么流动的  

GPU 编程意味着用并行的方式思考。后面所有的 CUDA 内容都建立在这个思路之上。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：拥有成千上万个简单核心的处理器，专门用来并行处理大量任务。
- CPU（Central Processing Unit，中央处理器）：计算机的主处理器，擅长快速响应、复杂逻辑和顺序执行的工作。
- 顺序执行（sequential execution）：一步接一步地执行，每一步都要等前一步做完。
- 并行（parallel）：很多任务同时运行，而不是一个接一个。
- 系统内存（RAM，Random Access Memory）：计算机主板上的主内存，供 CPU 使用。
- VRAM（显存）：GPU 自己的内存，和 CPU 使用的系统内存是分开的。
- GDDR（Graphics Double Data Rate）：游戏显卡和很多工作站 GPU 上用的显存类型，比如 L40S 上的 GDDR6。
- HBM（High Bandwidth Memory，高带宽内存）：数据中心 GPU 上的堆叠式显存，比 GDDR 快得多。
- 瓶颈（bottleneck）：一连串步骤中最慢的那一步，整个流程的速度都受它限制。
- L40S：NVIDIA 的一款数据中心 GPU（Ada Lovelace 架构），有 142 个 SM、18,176 个核心和 48 GB GDDR6 显存。
- 缓存（cache）：一块很小、速度很快的存储，离处理器很近。
- L1 缓存（L1）：最小、最快的一级缓存，紧挨着核心（在 GPU 上位于每个 SM 内部）。
- 共享内存（shared memory）：GPU 上供线程协作、交换数据的一块内存。
- 线程（thread）：一条指令流；GPU 可以同时运行成千上万个线程。
- 核心（core）：执行指令的一个处理单元；CPU 有几个强大的核心，GPU 有成千上万个简单的核心。
- 时钟频率（clock speed）：单个核心运行的速度，CPU 上常常有好几 GHz。
- GHz（吉赫兹）：每秒十亿个时钟周期，所以 3 GHz 的核心每秒要走 30 亿个时钟周期。
- PCIe（PCI Express）：CPU 和 GPU 之间互相传送数据的一种连接；PCIe 4.0 x16 每个方向大约 32 GB/s。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 里最重要的处理单元，一块 GPU 由许多个 SM 组成。
- 寄存器（register）：SM 里速度最快的存储；每个线程把自己的变量放在寄存器里。
- 浮点单元（floating-point unit）：对带小数点的数（比如 3.14）做运算的单元；规格表上把它们叫作 CUDA 核心。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；训练和运行它主要都是矩阵运算。
- Tensor Core：SM 里专门做矩阵运算的计算单元，对 AI 至关重要。
- 特殊函数单元（special function unit，SFU）：用硬件计算正弦、余弦、平方根等函数的单元。
- 加载/存储单元（load/store unit）：在内存和计算单元之间搬运数据的单元。
- L2 缓存：更大但更慢的缓存，整个 GPU 共用，不属于某一个 SM。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的通用程序。
