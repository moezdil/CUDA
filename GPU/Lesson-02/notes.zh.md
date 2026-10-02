# 02 > 架构与代

这一课讲 GPU 架构和 GPU 代之间的区别。这两个词听起来很像，意思却不一样。把两者都弄清楚，你就能读懂任何一个 NVIDIA 产品名，并判断里面装的是哪种芯片。

## GPU 与 CUDA

GPU（Graphics Processing Unit，图形处理器）是一种能同时执行大量运算的处理器。它最初是为图形而造的。如今它也用于 AI（artificial intelligence，人工智能）、仿真、数据处理和大规模计算。

CUDA（Compute Unified Device Architecture，统一计算设备架构）是 NVIDIA 提供的 GPU 编程方式。有了它，你可以把 GPU 用于通用计算，而不只是图形处理。

## 架构

架构是 GPU 芯片的内部设计。它规定的不只是核心，还包括：

- 核心如何组织  
- 数据如何流动  
- 显存如何访问  
- 并行任务如何执行  

可以把它想成发动机的设计。两块 GPU 从外面看可能差不多，但因为架构不同，表现可能天差地别。

架构直接影响：

- 性能  
- 能效  
- 支持的功能  

每一代新架构通常都是一次真正的转变，而不是小修小补。有些架构提升了原始性能，有些侧重能效，较新的架构则专注于 AI 和大规模任务。光线追踪和 AI 加速这类功能，都是在架构层面引入的。

NVIDIA 过去大约每两年推出一代新架构。在数据中心 GPU 上，现在大约每年一代：Blackwell（2024）、Blackwell Ultra（2025）、Rubin（2026 年起出货），Rubin Ultra（2027）和 Feynman（2028）则已经公布。这是 GPU 发展这么快的一个主要原因。

## 代

在这些课里，“代”说的不是 GPU 怎么造，而是 GPU 用在哪里。

> [!NOTE]
> 在这些课之外，人们也常用“代”来指架构，比如“Blackwell 这一代”。这里的“代”指的是 GPU 所属的产品线，比如 GeForce 或数据中心。

NVIDIA 的 GPU 服务于两个主要领域。第一个是普通用户：

- 游戏  
- 内容创作  
- 通用图形  

第二个是：

- 云系统  
- 数据中心  
- AI 训练  
- 科学计算  

第二个领域叫作 HPC（High Performance Computing，高性能计算）。

## 产品名称

NVIDIA 会根据 GPU 的用途使用不同的名字：

- Jetson 面向机器人和嵌入式系统。它的芯片叫 Tegra，最新的模块 Jetson AGX Thor（2025）用的是 Blackwell。  
- GeForce 面向消费级 GPU。当前的显卡是 GeForce RTX 50 系列，比如 RTX 5090。  
- RTX PRO 面向专业工作站，比如 RTX PRO 6000 Blackwell（2025）。  
- Data Center GPU（数据中心 GPU）面向服务器：A100（Ampere）、H100 和 H200（Hopper）、B200 和 B300（Blackwell），以及现在的 Rubin。  

> [!NOTE]
> 你可能还会看到一些旧名字。Quadro 是以前专业 GPU 的品牌，后来改成“NVIDIA RTX”（RTX A6000、RTX 6000 Ada），2025 年又改成“RTX PRO”。数据中心 GPU 直到 V100 和 T4 都用“Tesla”这个名字销售，从 A100 起不再使用。

这体现了从通用计算向 AI 和云基础设施的转变。

## 架构和代互不相干

架构描述 GPU 是怎么造的，代描述它用在哪里。所以同一种架构可以出现在用途完全不同的产品里。

例如，RTX 3090 和 A100 都基于 Ampere。RTX 3090 面向个人使用，A100 面向大规模计算。它们架构相同，用途却不同。今天也是一样：RTX 5090、RTX PRO 6000、B200 和 Jetson AGX Thor 都是 Blackwell。

<arch-matrix></arch-matrix>

架构相同，甚至连 CC（compute capability，计算能力）都可能不同。计算能力是 CUDA 用来标记芯片功能的版本号。A100 是 CC 8.0，RTX 3090 是 CC 8.6，两者都是 Ampere。B200 是 CC 10.0，RTX 5090 是 CC 12.0，两者都是 Blackwell。

> [!TIP]
> 决定一块 GPU 支持哪些 CUDA 功能的是计算能力，而不是产品名。编译 CUDA 代码时，你针对的也是计算能力。

## GPU 的类别

GPU 是为不同环境打造的：

- 小型便携系统  
- 个人电脑  
- 专业工作负载  
- 大型数据中心  

每种环境的需求、限制和优先级都不同。NVIDIA 会调整同一种架构，让它适应所有这些环境。

## 一条简单的规则

- GPU 是怎么造的？→ 架构  
- GPU 用在哪里？→ 代  

## 为什么这很重要

这条规则让 GPU 的名字更容易读懂。它还能避免一个常见错误：以为两块 GPU 只要架构相同就差不多。等你开始用 CUDA 编程，这些差别会变得非常重要。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：一种能同时执行大量运算的处理器。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 提供的 GPU 编程方式，用于通用计算，而不只是图形处理。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；训练它主要是海量的矩阵运算，所以 GPU 对它如此重要。
- 架构（architecture）：GPU 芯片的内部设计，就像发动机的设计。
- 能效（efficiency）：GPU 每消耗一瓦电能完成多少工作。
- 光线追踪（ray tracing）：通过追踪光线的反弹来绘制 3D 场景的方法，能得到逼真的阴影和反射；RTX GPU 有专门的硬件来做这件事。
- Blackwell：NVIDIA 2024 年的架构，用在 RTX 50 系列、RTX PRO 6000、B200、B300 和 Jetson AGX Thor 上。
- Rubin：Blackwell 之后的 NVIDIA 数据中心架构，2026 年起出货。
- 代（generation）：在这些课里，指 GPU 的使用场景，比如游戏或数据中心。
- 数据中心（data center）：放满服务器的机房，往往装有成千上万块 GPU，用来运行云服务和 AI 训练。
- HPC（High Performance Computing，高性能计算）：指云系统、数据中心、AI 训练和科学计算。
- Jetson：NVIDIA 面向机器人和嵌入式系统的产品线，基于 Tegra 芯片。
- Tegra：NVIDIA 给 Jetson 模块里集成了 CPU 和 GPU 的芯片起的名字。
- 嵌入式系统（embedded system）：内置在设备里的小型计算机，比如机器人、汽车或无人机里的那种。
- GeForce：NVIDIA 面向消费级 GPU 的品牌，用于游戏和个人电脑。
- RTX PRO：NVIDIA 从 2025 年起用于专业工作站 GPU 的品牌，是 Quadro 的继任者。
- Quadro：NVIDIA 专业 GPU 的旧品牌，先被 NVIDIA RTX 取代，后来又改为 RTX PRO。
- Data Center GPU（数据中心 GPU）：NVIDIA 用于服务器的 GPU，比如 A100、H100 或 B200。
- Tesla：NVIDIA 数据中心 GPU 以前的名字，最后用在 V100 和 T4 上。
- Ampere：NVIDIA 的一种架构，RTX 3090 和 A100 都用它。
- A100：NVIDIA 2020 年推出的数据中心 GPU，基于 Ampere，专为 AI 训练和 HPC 打造。
- 计算能力（CC，compute capability）：CUDA 给 GPU 功能集标的版本号，比如 A100 是 8.0，RTX 5090 是 12.0。
