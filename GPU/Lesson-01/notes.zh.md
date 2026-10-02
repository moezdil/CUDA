# 01 > GPU 简史

这一课讲 GPU（Graphics Processing Unit，图形处理器）是怎样从简单的图形芯片，一步步成长为今天 AI 背后的计算平台的。内容从 1993 年一直讲到当前这一代产品，以及 NVIDIA 已经公布的下一代。在写 CUDA 代码之前，先了解这些背景会很有帮助。

## 早期

NVIDIA 成立于 1993 年 4 月。它的第一款产品 NV1 在 1995 年推出。

> [!NOTE]
> NVIDIA 由黄仁勋（Jensen Huang）、Chris Malachowsky 和 Curtis Priem 创立。黄仁勋至今仍是公司的 CEO（chief executive officer，首席执行官）。

和今天相比，当时的硬件非常简陋：

- 显存非常小  
- 数据带宽非常有限  
- 几乎没有真正的并行能力  

## 现代 GPU

今天的 GPU 完全是另一个量级。它们：

- 有几千个，甚至几万个核心  
- 有大容量显存  
- 运行频率高得多  

拿 1999 年的 GeForce 256 和 2025 年的 GeForce RTX 5090 比一比。显存从 32 MB 变成了 32 GB，多了 32 GB / 32 MB = 1,000 倍。芯片频率从 120 MHz 提高到 2.41 GHz（2,410 MHz），快了 2,410 / 120 = 约 20 倍。原来的 4 条像素管线，变成了 21,760 个 CUDA 核心。

它们的角色也变了。

## 不只是图形

GPU 最初是为渲染图像而造的。如今这只是它工作中很小的一部分。现在 GPU 被广泛用于：

- AI（artificial intelligence，人工智能）  
- 大规模数据处理  
- 仿真  
- 科学计算  

所以现代 GPU 是一个计算平台，而不只是图形设备。

## 第一个转折点

一个关键时刻，是 GPU 开始支持真正的 3D 加速。NVIDIA 的 RIVA 128（1997）把高速 3D 和 2D 放进了同一块芯片。这让 3D 不再只是专业人士的工具，用的人迅速多了起来。

## GeForce

两年后的 1999 年，NVIDIA 推出了 GeForce 256，并把它宣传为第一款 GPU。它用硬件完成 T&L（transform and lighting，变换与光照），也就是摆放 3D 形状并给它们打光的那部分计算，而不再交给 CPU（Central Processing Unit，中央处理器）。GeForce 系列由此开始，GPU 也第一次变得随处都能买到。由于起点还很低，核心数或显存哪怕只多一点点，带来的差别都很大。

## 稳步增长

此后，进步越来越快。2007 年 NVIDIA 发布了 CUDA，让它的 GPU（从 2006 年的 GeForce 8 系列开始）可以运行通用程序，而不只是图形。每一代新架构都在性能、能效或功能上有所提升：Fermi（2010）、Kepler（2012）、Maxwell（2014）、Pascal（2016）、Volta（2017，第一次加入 Tensor Core）、Turing（2018）、Ampere（2020）、Ada Lovelace 和 Hopper（2022）、Blackwell（2024）。这些进步日积月累。现代 GPU 的强大来自多年里的许多小步，而不是一次大跳跃。

## 今天的位置

截至 2026 年 10 月，NVIDIA 在这些领域扮演着核心角色：

- 游戏  
- AI 基础设施  
- 云计算  
- HPC（high-performance computing，高性能计算）  

当前的产品是面向 PC 的 GeForce RTX 50 系列（Blackwell，2025），以及数据中心里的 Blackwell Ultra（B300，2025）。下一代架构 Rubin 已在 2026 年 9 月随首批 Vera Rubin NVL72 机柜开始出货。当前的 CUDA 版本是 CUDA 13.4。

> [!NOTE]
> NVIDIA 现在大约每年推出一代新的数据中心架构。Rubin Ultra（2027）和 Feynman（2028）只是已公布，还没有出货。它们的日期请当作计划来看。

在很多场景里，GPU 已经成为现代 AI 系统的主要驱动力。

<gpu-history></gpu-history>

## 学 CUDA 之前为什么要了解这些

了解 GPU 的演变，能帮你理解：

- 架构为什么是现在这样设计的  
- 不同 GPU 的性能为什么不同  
- 现代 GPU 为什么会有这些功能  

这样再学 CUDA 就会更容易。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：拥有成千上万个简单核心的处理器，专门用来并行处理大量任务。
- NVIDIA：成立于 1993 年的公司，生产 GeForce 和数据中心 GPU，并推出了 CUDA。
- NV1：NVIDIA 的第一款产品，1995 年推出。
- 数据带宽（data bandwidth）：GPU 每秒能搬运的数据量，早期硬件在这方面非常有限。
- 并行（parallelism）：同时做很多事情，早期 GPU 几乎做不到这一点。
- 核心（core）：真正干活的单元，现代 GPU 有几千个。
- 频率（frequency）：芯片每秒运行多少个时钟周期，单位是 MHz（百万）或 GHz（十亿）。
- GeForce RTX 5090：2025 年基于 Blackwell 的 GeForce GPU，有 21,760 个 CUDA 核心和 32 GB 显存。
- 渲染（render）：把对场景的描述（形状、颜色、光照）变成你在屏幕上看到的像素。
- AI（artificial intelligence，人工智能）：从数据中学习的软件，比如图像识别或聊天机器人；训练它主要是海量的矩阵运算，正适合 GPU。
- 计算平台（compute platform）：用于通用计算的设备，而不只是用于图形。
- 3D 加速（3D acceleration）：GPU 对 3D 图形的硬件支持，它让更多人用得上 GPU。
- RIVA 128：NVIDIA 1997 年的芯片，集 3D 和 2D 于一身，让 NVIDIA 广为人知。
- GeForce 256：NVIDIA 在 1999 年宣传为第一款 GPU 的显卡，有 32 MB 显存，频率 120 MHz。
- T&L（transform and lighting，变换与光照）：摆放 3D 形状并给它们打光的计算，GeForce 256 把它从 CPU 移到了 GPU 上。
- GeForce：NVIDIA 的消费级 GPU 系列，它让 GPU 变得随处都能买到。
- 能效（efficiency）：GPU 每消耗一瓦电能完成多少工作。
- Tensor Core：为 AI 的矩阵运算而造的单元，最早出现在 Volta（2017）上。
- 云计算（cloud computing）：通过互联网租用服务商数据中心里的计算机（包括 GPU），而不是自己购买硬件。
- HPC（high-performance computing，高性能计算）：许多强大的处理器协同解决大型问题，比如天气或物理仿真。
- Blackwell：NVIDIA 2024 年的架构，用在 RTX 50 系列、B200 和 B300 上。
- Rubin：Blackwell 之后的 NVIDIA 架构，2026 年 9 月随 Vera Rubin NVL72 机柜首次出货。
- 架构（architecture）：GPU 的整体设计，也就是它的核心、显存和各种单元是怎样组织的。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的通用程序，2007 年首次发布。
