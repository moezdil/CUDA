# 11 > 阅读 Volta 白皮书

这一课带你通读 V100 白皮书，看看 Volta 改变了什么，以及这些改变为什么对今天的 GPU（Graphics Processing Unit，图形处理器）依然重要。

## 为什么要读一份真实的白皮书

白皮书直接展示硬件设计，不做任何简化。Volta 是其中最重要的例子之一，V100 白皮书记录了 GPU 转变方向的那一刻。

## 从关键特性开始

不要一上来就钻进图表或数字里。先看“Key Features”（关键特性）这一部分。它很短，能告诉你这个架构想做什么。

Volta 的重点很明确：这个架构是为人工智能（AI，artificial intelligence）打造的。这是用途上的转变，而不只是比上一代有所改进。

## Tensor Core

Volta 最重要的变化就是 Tensor Core。

在 Volta 之前，GPU 用通用的 CUDA 核心来执行矩阵运算。这样可行，但效率不高。Volta 为矩阵运算配备了专用硬件：V100 有 640 个 Tensor Core，80 个 SM 中每个各 8 个。

从这时起，GPU 不再只是通用计算设备，而是从底层开始就为 AI 工作负载而设计。

## 流式多处理器（SM）

流式多处理器（Streaming Multiprocessor，SM）是 GPU 的核心组成单元。Volta 重新设计了 SM，把它分成四个处理块，每块都有自己的线程束调度器。

一项关键改进是，不同类型的运算可以同时执行。在 Pascal 中，整数运算和浮点运算共用一条执行通路，只能轮流进行；在 Volta 中，它们可以并行执行。

现代工作负载常常混合多种类型的运算，所以这一改变能更充分地利用硬件。

<volta-shift></volta-shift>

## 指令速度

新架构不只是增加核心，它还会让已有的运算变得更快。

在 Volta 上，很多指令完成所需的周期数比 Pascal 更少，Ampere 和 Hopper 又做了进一步改进。这个趋势一直延续到 2026 年。进步不只在于规模，更在于效率。

## 显存

Volta 使用 HBM2（High Bandwidth Memory 2）显存：V100 有 16 或 32 GB，显存带宽 900 GB/s，比前几代更高。

现代 GPU 工作负载的瓶颈常常在于数据搬运的速度，而不只是处理的速度。带宽越高，就能给计算单元送去更多数据，让它们不必等待。

## NVLink

Volta 引入了第二代 NVLink。NVLink 让 GPU 之间高速互联。

Volta 同时提高了链路的数量和速度：V100 有六条 NVLink 链路，总带宽 300 GB/s，让多 GPU 系统的效率大大提升。

> [!NOTE]
> 到了 2026 年，基于 Hopper 和 Blackwell 的大型 AI 系统更加依赖这一思路。Volta 是朝这个方向迈出的最早几步之一。

## 晶体管数量

晶体管数量能说明一块 GPU 里有多少硬件。V100 大约有 210 亿个晶体管。

> [!NOTE]
> Hopper 的 H100 达到了大约 800 亿个晶体管。Blackwell 走得更远：B200 在两个协同工作、如同一块 GPU 的裸片上集成了 2080 亿个晶体管。

这种增长不只是尺寸变大，它反映的是新的单元、新的显存系统和更先进的执行模型。

## 每次都是同样的结构

不同架构的白皮书使用相似的结构：

1. 新功能
2. SM 设计
3. 性能对比
4. 技术规格

只要能读懂一份白皮书，其他的读起来就容易多了。

## Volta 的地位

站在 2026 年回头看，Volta 不只是当年一块很强的 GPU。它是 GPU 开始以 AI 为重心的转折点。Ampere、Hopper，以及现在的 Blackwell，都建立在这个思路之上，并把它推得更远。

读 V100 白皮书，能帮你理解 GPU 为什么会变成今天的样子。

> [!TIP]
> 一个例子：https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf

## 术语表

- 白皮书（white paper）：官方技术文档，不做简化，直接展示一个 GPU 架构是怎么构建的。
- Volta：Nvidia 2017 年的架构（V100，CC 7.0），第一个拥有 Tensor Core 的架构。
- V100：Volta 架构的 GPU，这一课读的就是它的白皮书。
- Key Features（关键特性）：白皮书里很短的一部分，告诉你这个架构想做什么。
- 架构（architecture）：一个 GPU 系列的硬件设计；Volta、Ampere 和 Hopper 都是架构。
- AI（人工智能）：从数据中学习的软件；训练它主要是海量的矩阵运算。
- 代（generation）：GPU 产品更新的一个阶段；Volta 的上一代是 Pascal。
- Tensor Core：做矩阵运算的专用硬件。Volta 是第一个拥有它的架构。
- 矩阵运算（matrix operations）：对整个数字阵列做的运算，主要是矩阵乘法，占了 AI 计算的大部分。
- CUDA 核心（CUDA cores）：GPU 里的通用算术单元。在有 Tensor Core 之前，矩阵运算就在它们上面执行。
- 工作负载（workload）：程序交给 GPU 的那类工作，比如训练神经网络。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 的核心组成单元。Volta 重新设计了 SM。
- Pascal：Nvidia 2016 年的架构（P100），是 Volta 的上一代。
- 整数（integer）：不带小数部分的数，比如 7 或 -3；GPU 代码经常用整数运算来计算下标和地址。
- 浮点（floating point）：带小数点的数，比如 3.14；图形和 AI 的大部分运算都用它。
- 并行（parallel）：同时运行，这里指整数运算和浮点运算并排进行。
- 指令（instruction）：GPU 执行的一条基本命令，比如一次加法或乘法。
- 周期（cycle）：GPU 时钟的一次跳动；在 1.5 GHz 下，每秒有 15 亿个周期。
- 效率（efficiency）：用同样的硬件、时间或功耗完成更多工作。
- Ampere / Hopper / Blackwell：Volta 之后的 Nvidia 架构（2020、2022、2024），都在它的 Tensor Core 基础上继续发展。
- HBM2（High Bandwidth Memory 2）：Volta 使用的显存，V100 上为 900 GB/s，比前几代更高。
- GB/s：每秒千兆字节，显存和链路速度的单位。
- 线程束调度器（warp scheduler）：挑选下一个运行的 32 线程组的单元；每个 Volta SM 有四个。
- GPU（Graphics Processing Unit）：为并行运行大量简单任务而设计的处理器。
- 显存带宽（memory bandwidth）：数据送到计算单元的速度。带宽越高，等待越少。
- NVLink：让 GPU 之间互联的高速链路。Volta 用的是第二代。
- 多 GPU（multi-GPU）：一台机器里的几个 GPU 一起处理同一个任务，并不断交换数据。
- 晶体管数量（transistor count）：一块 GPU 里有多少硬件。V100 大约有 210 亿个晶体管，B200 有 2080 亿个。
