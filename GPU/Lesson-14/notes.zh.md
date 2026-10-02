# 14 > CUDA Toolkit，GPU 编程的基础

这一课讲什么是 CUDA Toolkit，以及它能为你提供什么。在 GPU 上编写、编译、运行和研究程序，靠的就是这个环境。截至 2026 年 10 月，最新版本是 CUDA 13.4。

## CUDA 是什么

CUDA 是 NVIDIA 的并行计算平台，它把你的代码和 GPU 连接起来。没有它，你就无法完全掌控 NVIDIA GPU。

## nvcc 编译器

Toolkit 的核心是编译器 `nvcc`。它把你的 CUDA 代码转换成 GPU 能运行的代码。

这个过程分两步。先把代码转换成一种中间形式 PTX，再把 PTX 转换成针对某一种 GPU 架构的机器码，叫作 SASS。

<nvcc-pipeline></nvcc-pipeline>

你用计算能力来指定这个架构。参数 `-arch=sm_89` 表示计算能力 8.9，主版本号是 8，次版本号是 9。这是 Ada 一代，比如 L40S。Hopper 的 H100 是 `sm_90`（9.0），Blackwell 的 B200 是 `sm_100`（10.0）。

Ampere、Hopper、Blackwell 等架构的指令、数据类型和执行模型各不相同，所以你必须针对正确的架构编译。同一份代码也许能在不同的 GPU 上运行，但如果编译目标不对，它的行为就会不一样，速度也达不到应有的水平。

## 库

Toolkit 还提供了经过优化的库。这些库能充分利用 GPU，你不必什么都自己写。涵盖的领域如下。

- 线性代数（cuBLAS）
- 傅里叶变换（cuFFT）
- 随机数生成（cuRAND）
- 稀疏矩阵（cuSPARSE）

深度学习方面，NVIDIA 提供 cuDNN。它需要单独下载，不包含在 Toolkit 里。

这些库会随新硬件不断更新。新版 CUDA 支持低精度格式，比如 Hopper 上的 FP8 和 Blackwell 上的 FP4。现代 AI 工作负载用的正是这些格式。

## 运行时 API

你的程序通过 CUDA 运行时 API 和 GPU 打交道。借助显式的 API 调用，程序可以做三件事。

- 在 GPU 上分配显存
- 在 CPU 和 GPU 之间搬运数据
- 启动核函数

数据搬运常常是 GPU 程序的主要瓶颈，所以弄清数据在何时、以何种方式移动，和编写核函数一样重要。

## 性能分析与调试工具

你还需要了解程序实际的运行情况。Toolkit 提供了用于性能分析、调试和诊断 GPU 应用的工具，主要有 Nsight Systems、Nsight Compute、cuda-gdb 和 Compute Sanitizer。它们可以测量性能、找出瓶颈、发现显存问题。工作负载越大，性能调优就越是开发中必不可少的一环。

## 示例程序

NVIDIA 还发布了示例程序，展示如何管理显存、如何启动核函数，以及如何提升性能。从 CUDA 11.6 起，它们不再随 Toolkit 一起安装。你要从 GitHub 上的 cuda-samples 仓库获取。研究这些示例，是从理论走向真正理解的捷径。

## Toolkit 紧跟硬件

Toolkit 和 GPU 架构紧密绑定。每一代新架构都会带来新的硬件功能，Toolkit 也会随之加入相应的支持。

- CUDA 13.0 于 2025 年 8 月发布，CUDA 13.4 是当前版本。
- CUDA 13 支持 Turing（计算能力 7.5）及之后的所有架构，包括 Blackwell（10.x 和 12.x）。CUDA 13.4 的库加入了对 Rubin（10.7）的支持。Rubin 数据中心 GPU 于 2026 年下半年开始出货。

> [!WARNING]
> CUDA 13.0 移除了 Maxwell、Pascal 和 Volta，也就是计算能力低于 7.5 的所有 GPU。CUDA 13 已经不能再为它们编译代码。这些 GPU 只能继续用 CUDA 12.x。

> [!NOTE]
> Toolkit 不再是一个固定不变的整体包，各个组件有自己的版本号。在 CUDA 13.4 Update 1 里，`nvcc` 的版本是 13.4.92，cuBLAS 的版本却是 13.8.0.4。GPU 驱动也不再捆绑在里面，Windows 从 CUDA 13.1 起，Linux 从 CUDA 13.4 起。驱动需要单独安装。

## 小结

CUDA Toolkit 是 GPU 编程的完整环境。有了它，你可以编写、编译、运行、分析和改进代码。想认真使用 NVIDIA GPU，就必须理解 CUDA，其他一切都建立在它之上。

## 术语表

- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的并行计算平台，把你的代码和 GPU 连接起来。
- GPU（Graphics Processing Unit，图形处理器）：拥有成千上万个小核心的处理器，CUDA 程序就在它上面运行。
- 并行计算（parallel computing）：把工作拆成很多小块，让它们同时运行。
- Toolkit（CUDA Toolkit，工具包）：用于编写、编译、运行、分析和改进 GPU 程序的完整环境。当前版本是 13.4。
- 编译器（compiler）：把源代码变成处理器能运行的代码的程序。
- `nvcc`（NVIDIA CUDA Compiler）：Toolkit 核心的编译器，把 CUDA 代码变成 GPU 能运行的代码。
- PTX（Parallel Thread Execution，并行线程执行）：`nvcc` 先生成的中间形式，之后才会变成针对某个 GPU 架构的机器码。
- 机器码（machine code）：某个具体处理器直接执行的二进制指令。在 NVIDIA GPU 上它叫 SASS（Streaming Assembler）。
- SASS（Streaming Assembler）：NVIDIA GPU 的机器码，由 PTX 针对某一种架构生成。
- 架构（architecture）：一个 GPU 系列的硬件设计，比如 Ampere、Hopper 或 Blackwell。
- 计算能力（compute capability）：GPU 架构的版本号，比如 8.9。`sm_89` 是写给 `-arch` 的同一个数字。
- Ampere / Hopper / Blackwell / Rubin：NVIDIA 2020、2022、2024 和 2026 年的 GPU 架构，各有自己的指令和数据类型。
- 编译目标（compile target）：你编译时针对的 GPU 架构。选错了会改变行为和速度。
- 库（library）：现成的、经过测试的代码，可以在程序里直接调用，比如 cuBLAS 或 cuFFT。
- 线性代数（linear algebra）：关于向量和矩阵的数学，比如向量相加或矩阵相乘。
- 傅里叶变换（Fourier transforms）：把信号拆分成各个频率的方法，用于音频、图像和物理计算。
- 深度学习（deep learning）：由多层神经网络构成的 AI。cuDNN 是 NVIDIA 为它准备的库，需要单独下载。
- FP8 / FP4（8 位 / 4 位浮点）：8 位和 4 位浮点格式。Hopper 加入了 FP8，Blackwell 加入了 FP4。
- AI（Artificial Intelligence，人工智能）：从数据中学习的软件，比如语言模型。大部分在 GPU 上运行。
- 工作负载（workload）：程序交给 GPU 的那类工作，比如训练模型。
- 运行时 API（runtime API，Application Programming Interface，应用程序编程接口）：程序用来分配 GPU 显存、搬运数据和启动核函数的调用。
- CPU（Central Processing Unit，中央处理器）：主处理器。在 CUDA 程序里，它运行主代码，并把工作交给 GPU。
- 核函数（kernel）：在 GPU 上运行的函数，由 CPU 上的代码启动。
- 瓶颈（bottleneck）：最慢的那一步，它限制了整个程序的速度。常常是 CPU 和 GPU 之间的复制。
- 性能分析（profiling）：测量程序把时间花在了哪里。Nsight Systems 和 Nsight Compute 是 Toolkit 里的性能分析工具。
- 调试（debugging）：找出并修复错误。cuda-gdb 可以逐步调试 GPU 代码，Compute Sanitizer 可以检查显存错误。
- 示例程序（sample programs）：NVIDIA 提供的小型 CUDA 示例程序。从 CUDA 11.6 起，它们放在 GitHub 上的 cuda-samples 仓库里。
- Turing：2018 年的架构，计算能力 7.5，是 CUDA 13 支持的最老架构。
- Maxwell / Pascal / Volta：较老的架构（2014、2016、2017）。CUDA 13 已经不能再为它们编译代码。
- 驱动（GPU driver）：让操作系统和 GPU 通信的软件。它和 Toolkit 分开安装。
