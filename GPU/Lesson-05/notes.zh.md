# 05 > 计算能力

这一课讲解什么是计算能力、它的编号规则，以及它如何决定你能使用哪些功能和哪些 CUDA 工具包版本。学完之后，你看到任何一块 GPU 都能说出它支持什么。

## 什么是计算能力

计算能力，简称 CC，是 NVIDIA 用来描述 GPU 功能的体系。它是硬件的版本号，而不是软件的版本号。

它不是营销分数，也不是基准测试成绩。它准确地说明一种 GPU 架构能做什么、不能做什么。可以把它看成浓缩成一个数字的规格表。

## 编号规则

计算能力是一个版本号，比如 7.5、8.9 或 12.0。所有代际都遵循同样的规则：

- 小数点前的数字表示重大的架构变化
- 小数点后的数字表示小幅改进或扩展

所以从 7.x 到 8.x 不只是提速，而是换了一种架构，带来了新的硬件单元和新的能力。举个具体例子：RTX 4090 是 CC 8.9，A100 是 CC 8.0。两者都属于 8.x 家族，核心设计相同，但 8.9 增加了 A100 没有的功能，比如 FP8 Tensor Core。

> [!TIP]
> 想查看你机器上 GPU 的 CC，运行 `nvidia-smi --query-gpu=name,compute_cap --format=csv`。NVIDIA 的“CUDA GPUs”网页列出了每张卡的 CC。

## 各个架构

### Volta → CC 7.0

Volta 引入了 Tensor Core。这是专门加速人工智能和深度学习中矩阵运算的单元。在 Volta 之前，这些运算在通用的 CUDA 核心上执行；从 Volta 开始，它们有了专用硬件。

### Turing 和 Ampere → CC 7.5 和 8.x

Turing（CC 7.5，RTX 20 系列）把 Tensor Core 带到了消费级显卡上。Ampere（A100 为 CC 8.0，RTX 30 系列为 8.6）带来了更强、更高效的 Tensor Core，更高的显存带宽和更好的能效。Ada Lovelace（CC 8.9，RTX 40 系列和 L40S）增加了 FP8 支持。

### Hopper → CC 9.0

Hopper（H100 和 H200）又是一大步。它为超大型 AI 模型引入了新的执行模型，进一步提升了 AI 性能。

### Blackwell → CC 10.x、11.0 和 12.x

Blackwell 是 2026 年主力出货的一代。它拥有第五代 Tensor Core 和一种名为 NVFP4 的新精度格式。在大模型推理中，NVFP4 的吞吐量是 FP8 的两倍。更早的架构没有 FP4 加速。

Blackwell 按芯片系列分为几种计算能力：

| CC | 产品 |
|---|---|
| 10.0 | B200、GB200（数据中心） |
| 10.3 | B300、GB300（Blackwell Ultra，数据中心） |
| 11.0 | Jetson Thor（机器人） |
| 12.0 | GeForce RTX 50 系列、RTX PRO Blackwell |
| 12.1 | GB10（DGX Spark 桌面机） |

> [!NOTE]
> 下一代架构 Rubin 的计算能力是 CC 10.7，与 B200、B300 同属 10.x 家族。首批 Vera Rubin NVL72 机架已于 2026 年 9 月开始出货。

## 功能支持

CUDA 官方文档中有把功能和计算能力版本对应起来的表格。这些表格呈现出清晰的规律：

- CC 5.0 的 GPU 不支持 FP16 运算
- Tensor Core 只在 CC 7.0 及以上出现
- FP8 Tensor Core 随 CC 8.9（Ada Lovelace）和 9.0（Hopper）到来
- NVFP4 需要 CC 10.0 或更高

缺少的硬件功能无法事后补上。如果你的 GPU 没有 Tensor Core，你就用不了它们。软件有时能通过模拟来模仿缺失的单元，但速度慢得多，而且大多数 Tensor Core 功能根本没有这条路。硬件要么有这个单元，要么没有。

所以在编写对性能敏感的 CUDA 代码之前，先问“我的 GPU 支持我需要的功能吗？”，再问“我的 GPU 够快吗？”

## 软件兼容性

计算能力还决定了你能使用哪些 CUDA 工具包版本。新架构需要认识它的工具包，而旧架构在若干年后会被新工具包移除。

一些例子：

- Hopper（CC 9.0）：需要 CUDA 11.8 或更高版本
- Blackwell（CC 10.0 和 12.0）：原生 cubin 支持需要 CUDA 12.8 或更高版本
- Blackwell Ultra（CC 10.3）：需要 CUDA 12.9 或更高版本
- Rubin（CC 10.7）：CUDA 13.4 已支持
- Maxwell、Pascal 和 Volta（CC 5.x 到 7.0）：CUDA 13 完全不支持；它们能用的最后一代工具包是 CUDA 12.x

> [!WARNING]
> CUDA 13（当前的主版本，截至 2026 年 9 月为 13.4）只支持 CC 7.5（Turing）及以上。在 GTX 1080（CC 6.1）这样的 Pascal 显卡上，你必须继续使用 CUDA 12.x。

低于你的架构最低要求的工具包，或者已经移除了你的架构的工具包，都会直接报错：代码要么无法编译，要么在运行时出错。

流程永远一样：

1. 查出你的 GPU 的计算能力。
2. 选择 CUDA 版本。
3. 编写代码。

<cc-explorer></cc-explorer>

## 底层

CUDA 代码并不直接在 GPU 上运行，而是先编译成 PTX。PTX 是一种底层中间语言，类似于 NVIDIA GPU 的汇编语言。

有些 PTX 指令需要的硬件单元只在某个计算能力之后才有。线程束洗牌函数就是一个例子。

> [!NOTE]
> 线程束洗牌函数让同一个线程束中的线程不经过共享内存或全局内存就能交换数据。它从 CC 3.0（Kepler）起就已存在。

如果你的 GPU 低于最低要求，这些指令就无法运行，因为芯片上根本没有对应的硬件。

## 小结

同样的规则适用于机器学习流水线、物理模拟和自定义 CUDA 核函数。GPU 的计算能力是硬件和代码之间的契约。

了解你的 CC 编号，对照 CUDA 文档，选择合适的工具包版本，然后再构建。性能调优、优化和功能选择都从这里开始。

> 计算能力不只是一个版本号，它定义了你的 GPU 真正能做什么。

## 术语表

- 计算能力（CC，compute capability）：NVIDIA 的版本号，说明一种 GPU 架构能做什么、不能做什么。
- GPU（Graphics Processing Unit）：为并行运行大量简单任务而设计的处理器。
- CUDA（Compute Unified Device Architecture）：NVIDIA 的平台，用来编写在其 GPU 上运行的程序。
- 基准测试：测量速度的测试程序；计算能力不是速度分数。
- 架构：一个 GPU 系列的硬件设计；每种架构都有自己的主 CC 编号。
- 小数点前的数字（主版本号）：表示重大的架构变化，比如 Ampere 是 8，Hopper 是 9。
- 小数点后的数字（次版本号）：表示小幅改进或扩展，比如 8.x 家族中的 8.6 或 8.9。
- `nvidia-smi`：NVIDIA 的命令行工具；配合 `--query-gpu=compute_cap` 可以打印每块 GPU 的 CC。
- Tensor Core：为 AI 加速矩阵运算的专用单元，从 CC 7.0 起出现。
- CUDA 核心：NVIDIA GPU 的通用运算单元，也就是核心数量里统计的那些。
- 人工智能（AI，artificial intelligence）：从数据中学习的软件；训练它主要是海量的矩阵运算。
- Turing：NVIDIA 2018 年的架构（RTX 20 系列），CC 7.5，是 CUDA 13 支持的最老架构。
- Ada Lovelace：NVIDIA 2022 年的架构（RTX 40 系列、L40S），CC 8.9。
- Hopper：NVIDIA 2022 年的数据中心架构（H100、H200），CC 9.0。
- Blackwell：NVIDIA 2026 年的主力架构，不同芯片对应 CC 10.0、10.3、11.0、12.0 和 12.1。
- Blackwell Ultra：B300 和 GB300，面向数据中心的升级版 Blackwell，CC 10.3。
- Rubin：Blackwell 之后的架构，CC 10.7，自 2026 年 9 月起随数据中心机架出货。
- NVFP4（NVIDIA 4 位浮点）：Blackwell 的精度格式，在大模型推理中吞吐量是 FP8 的两倍。
- FP8（8 位浮点）：比 FP16 精度低，但在支持它的 Tensor Core 上速度快一倍的数字格式。
- 推理：运行训练好的 AI 模型来得到答案，与训练相对。
- FP16（16-bit floating point）：半精度运算；CC 5.0 的 GPU 不支持。
- 模拟：用软件模仿缺失的硬件，通常慢得多，甚至根本做不到。
- 工具包（CUDA Toolkit）：NVIDIA 的软件包，包含 nvcc 编译器、库和工具；每个版本支持一定范围的计算能力。
- CUDA 13：当前的 CUDA 主版本，只支持 CC 7.5 及以上。
- Maxwell / Pascal / Volta：NVIDIA 2014、2016 和 2017 年的架构（CC 5.x 到 7.0），CUDA 13 已不再支持。
- cubin：针对某一个计算能力编译好的 GPU 二进制文件；PTX 则还能为更新的 GPU 再编译。
- 运行时：程序正在运行的阶段，与编译时相对。
- PTX（Parallel Thread Execution）：一种底层中间语言，类似 NVIDIA GPU 的汇编；CUDA 代码先编译成它。
- 汇编语言：处理器执行的基本指令的人类可读形式，每行一条指令。
- 线程束洗牌（warp shuffle）：让线程束中的线程不经过共享内存或全局内存就能交换数据的函数。
- 线程束（warp）：一起执行同一条指令的 32 个线程。
- 全局内存：GPU 的主显存（VRAM），所有线程都能访问，但比共享内存慢得多。
- 核函数（kernel）：在 GPU 上运行、由 CPU 端代码启动的函数。
