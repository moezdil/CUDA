# 阅读 Volta 白皮书

这一课带你读一遍 V100 白皮书。你会看到 Volta 改变了什么，以及它为什么对今天的 GPU 很重要。

## 为什么要读一份真实的白皮书

白皮书直接展示硬件设计，不做任何简化。Volta 是最重要的例子之一。V100 白皮书记录了 GPU 转变方向的那一刻。

## 从关键特性开始

不要一上来就钻进图表或数字里。先看 “Key Features”（关键特性）这一部分。它很短，能告诉你这个架构想做什么。

Volta 的重点很明确：这个架构是为人工智能打造的。这是用途上的改变，而不只是比上一代有所提升。

## Tensor Core

Volta 最重要的变化就是 Tensor Core。

在 Volta 之前，GPU 在通用的 CUDA 核心上执行矩阵运算。这样能用，但效率不高。Volta 为矩阵运算提供了专用硬件。

从这里开始，GPU 不再只是一个通用计算设备。它从底层开始就是为 AI 工作负载设计的。

## 流式多处理器（SM）

流式多处理器（Streaming Multiprocessor，SM）是 GPU 的核心组成单元。Volta 重新设计了 SM。

一个关键的改进是，不同类型的运算可以同时进行。在 Pascal 里，整数运算和浮点运算共用一条执行通路，只能轮流来。在 Volta 里，它们可以并行运行。

现代工作负载经常混合着不同类型的运算。所以这个改变能更好地利用硬件。

<volta-shift></volta-shift>

## 指令速度

新架构不只是增加核心，它还会让已有的运算变得更快。

在 Volta 上，很多指令用的周期数比 Pascal 更少。Ampere 和 Hopper 又做了进一步改进。这个趋势一直延续到 2026 年。进步不只在于规模，更在于效率。

## 显存

Volta 使用 HBM2 显存，它的显存带宽比前几代更高。

现代 GPU 工作负载常常受限于数据移动的速度，而不只是处理的速度。带宽越高，就能给计算单元送去更多数据，不用等待。

## NVLink

Volta 引入了第二代 NVLink。NVLink 让 GPU 之间高速互联。

Volta 同时增加了链路的数量和速度。这让多 GPU 系统的效率大大提高。

> [!NOTE]
> 到了 2026 年，基于 Hopper 和 Blackwell 的大型 AI 系统更加依赖这个思路。Volta 是朝这个方向迈出的最早几步之一。

## 晶体管数量

晶体管数量能说明一个 GPU 里有多少硬件。V100 大约有 210 亿个晶体管。

> [!NOTE]
> Hopper 达到了大约 800 亿个晶体管。Blackwell 的设计更复杂，走得更远。

这种增长不只是尺寸上的。它反映的是新的单元、新的显存系统和更先进的执行模型。

## 每次都是同样的结构

不同架构的白皮书使用相似的结构：

1. 新功能
2. SM 设计
3. 性能对比
4. 技术规格

只要你能读懂一份白皮书，其他的就会容易得多。

## Volta 的地位

站在 2026 年回头看，Volta 不只是当年一块很强的 GPU。它是 GPU 开始以 AI 为重心的转折点。Ampere、Hopper，以及现在的 Blackwell，都建立在这个思路之上，并把它推得更远。

读 V100 白皮书，能帮你理解 GPU 为什么会变成今天的样子。

> [!TIP]
> 一个例子：https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf

## 术语表

- V100：Volta 架构的 GPU，这一课读的就是它的白皮书。
- Key Features（关键特性）：白皮书里很短的一部分，告诉你这个架构想做什么。
- Tensor Core：做矩阵运算的专用硬件。Volta 是第一个拥有它的架构。
- 流式多处理器（Streaming Multiprocessor，SM）：GPU 的核心组成单元。Volta 重新设计了 SM。
- HBM2：Volta 使用的显存，显存带宽比前几代更高。
- 显存带宽（memory bandwidth）：数据送到计算单元的速度。带宽越高，等待越少。
- NVLink：让 GPU 之间互联的高速链路。Volta 用的是第二代。
- 晶体管数量（transistor count）：一个 GPU 里有多少硬件。V100 大约有 210 亿个晶体管。
