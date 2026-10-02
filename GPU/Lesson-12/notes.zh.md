# CUDA Toolkit：GPU 编程的基础

这一课讲什么是 CUDA Toolkit（工具包），以及它能为你提供什么。在 GPU 上编写、运行和研究程序，靠的就是这个环境。

## CUDA 是什么

CUDA 是 NVIDIA 的并行计算平台，它把你的代码和 GPU 连接起来。没有它，你就无法完全掌控 GPU。

## 编译器：nvcc

Toolkit 的核心是编译器 `nvcc`。它把你的 CUDA 代码转换成 GPU 能运行的代码。

这个过程分两步：先把代码转换成一种中间形式，通常是 PTX；再把 PTX 转换成针对某一种 GPU 架构的机器码。

<nvcc-pipeline></nvcc-pipeline>

截至 2026 年，这一步比以往更重要。Ampere、Hopper、Blackwell 等架构的指令、数据类型和执行模型各不相同，所以你必须针对正确的架构编译。同一份代码也许能在不同的 GPU 上运行，但如果编译目标不对，它的行为就会不一样，速度也达不到应有的水平。

## 库

Toolkit 还提供了经过优化的库。这些库能充分利用 GPU，你不必什么都自己写。涵盖的领域有：

- 线性代数
- 傅里叶变换
- 随机数生成
- 深度学习

这些库会随新硬件不断更新。面向 Hopper 和 Blackwell 的新版 CUDA 支持 FP8 甚至 FP4 等新数据格式，现代 AI 工作负载用的正是这些低精度格式。

## 运行时 API

你的程序通过 CUDA 运行时 API 和 GPU 打交道。借助显式的 API 调用，程序可以：

- 在 GPU 上分配显存
- 在 CPU 和 GPU 之间搬运数据
- 启动核函数（kernel）

数据搬运常常是 GPU 程序的主要瓶颈，所以弄清数据在何时、以何种方式移动，和编写核函数一样重要。

## 性能分析与调试工具

你还需要了解程序实际的运行情况。Toolkit 提供了一系列工具，用于对 GPU 应用做性能分析、调试和诊断。它们可以测量性能、找出瓶颈、发现显存问题。2026 年的工作负载又大又复杂，性能调优已经是开发中必不可少的一环。

## 示例程序

Toolkit 自带一些示例程序，展示了如何管理显存、如何启动核函数，以及如何提升性能。研究这些示例，是从理论走向真正理解的捷径。

## Toolkit 紧跟硬件

如今 Toolkit 和 GPU 架构紧密绑定。每一代新架构都会带来新的硬件功能，Toolkit 也会随之加入相应的支持。

- 要完整支持 Hopper 和 Blackwell，需要 CUDA 12.x 和 13.x。它们加入了新的指令、新的精度格式和更先进的执行功能。

CUDA 不再试图对所有硬件一视同仁，而是要把现代硬件的能力用足。

> [!WARNING]
> 对旧架构的支持正在逐步取消。Maxwell、Pascal，甚至 Volta，都已经不再是新版本的主要目标。

> [!NOTE]
> Toolkit 也不再是一个固定不变的整体包。编译器、库和性能分析工具如今更多是各自独立更新，可见整个生态已经变得相当复杂。今天的 CUDA 是一个完整的平台。

## 小结

CUDA Toolkit 是 GPU 编程的完整环境。有了它，你可以编写、编译、运行、分析和改进代码。截至 2026 年，想认真做 GPU 相关的工作，就必须理解 CUDA，其他一切都建立在它之上。

## 术语表

- CUDA：NVIDIA 的并行计算平台，把你的代码和 GPU 连接起来。
- 并行计算（parallel computing）：把工作拆成很多小块，让它们同时运行。
- Toolkit（CUDA Toolkit）：用于编写、编译、运行、分析和改进 GPU 程序的完整环境。
- 编译器（compiler）：把源代码变成处理器能运行的代码的程序。
- `nvcc`：Toolkit 核心的编译器，把 CUDA 代码变成 GPU 能运行的代码。
- PTX：`nvcc` 通常先生成的中间形式，之后才会变成针对某个 GPU 架构的机器码。
- 机器码（machine code）：某个具体处理器直接执行的二进制指令；在 NVIDIA GPU 上它叫 SASS。
- 架构（architecture）：一个 GPU 系列的硬件设计，在 CUDA 里用计算能力来标识，比如 sm_89。
- Ampere / Hopper / Blackwell：Nvidia 2020、2022 和 2024 年的 GPU 架构，各有自己的指令和数据类型。
- 编译目标（compile target）：你编译时针对的 GPU 架构。选错了会改变行为和速度。
- 库（library）：现成的、经过测试的代码，可以在程序里直接调用，比如做线性代数的 cuBLAS 或做傅里叶变换的 cuFFT。
- 线性代数（linear algebra）：关于向量和矩阵的数学，比如向量相加或矩阵相乘。
- 傅里叶变换（Fourier transforms）：把信号拆分成各个频率的方法，用于音频、图像和物理计算。
- 深度学习（deep learning）：由多层神经网络构成的 AI；cuDNN 是 NVIDIA 为它准备的库。
- FP8 / FP4：低精度数据格式，现代 AI 工作负载在 Hopper 和 Blackwell 上会用到它们。
- 精度（precision）：每个数字用多少位来存；FP32 用 32 位，FP8 只用 8 位，更快但没那么精确。
- 工作负载（workload）：程序交给 GPU 的那类工作，比如训练模型。
- 运行时 API（runtime API）：程序用来分配 GPU 显存、搬运数据和启动核函数的调用。
- CPU：主处理器；在 CUDA 程序里，它运行主代码，并把工作交给 GPU。
- 核函数（kernel）：在 GPU 上运行的函数，由 CPU 上的代码启动。
- 瓶颈（bottleneck）：最慢的那一步，它限制了整个程序的速度；常常是 CPU 和 GPU 之间的复制。
- 性能分析（profiling）：测量程序把时间花在了哪里；Nsight Systems 和 Nsight Compute 是 Toolkit 里的性能分析工具。
- 调试（debugging）：找出并修复错误；Toolkit 里有逐步调试 GPU 代码的 cuda-gdb，以及检查显存错误的 Compute Sanitizer。
- 示例程序（sample programs）：NVIDIA 提供的小型 CUDA 示例程序；从 CUDA 11.6 起，它们放在 GitHub 上的 cuda-samples 仓库里。
- Maxwell / Pascal / Volta：较老的架构（2014、2016、2017）；CUDA 13 已经不能再为它们编译代码。
