# 计算能力

这一课讲计算能力（Compute Capability）是什么、它的编号怎么看，以及它怎样决定你能用哪些功能和哪些 CUDA Toolkit 版本。

## 什么是计算能力

计算能力（Compute Capability，CC）是 NVIDIA 用来描述 GPU 功能和处理能力的一套体系。有时它也被叫作版本号。

它不是营销分数，也不是跑分。它准确地说明了一个 GPU 架构能做什么、不能做什么。你可以把它看作浓缩成一个数字的规格表。

## 编号规则

计算能力是一个版本号，比如 3.0、5.1 或 7.5。所有代的规则都一样：

- 小数点前面的数字表示一次重大的架构变化
- 小数点后面的数字表示小的改进或扩展

所以从 7.x 到 8.x 不只是速度上的小提升。它意味着一个不同的架构，带有新的硬件单元和新的能力。

## 各个架构

### Volta → CC 7.x

Volta 引入了 Tensor Core。这是一种特殊的单元，能加速 AI 和深度学习中用到的矩阵运算。在 Volta 之前，这些运算都跑在通用的 CUDA 核心上。从 Volta 开始，它们有了专用硬件。

### Ampere → CC 8.x

Ampere 带来了更强大、更高效的 Tensor Core，更高的显存带宽，以及更好的能效。它完善并扩展了 Volta 的思路。

### Hopper → CC 9.x

Hopper 又是一大步。它引入了新的执行模型，把 AI 性能又往前推了一步。

> [!WARNING]
> Hopper 需要 CUDA Toolkit 11.8 或更高版本。版本太低会报兼容性错误。

### Blackwell → CC 10.0（B200/GB200）和 12.0（RTX PRO / RTX 50 系列）

到 2026 年，Blackwell 是当前这一代。它有第 5 代 Tensor Core，还有一种叫 NVFP4 的新精度格式。在大模型推理中，NVFP4 的吞吐量是 FP8 的两倍。更早的架构上没有 FP4 加速。想要为 Blackwell 原生编译，你需要 CUDA Toolkit 12.8。

## 功能支持

官方 CUDA 文档里有一些表格，把各项功能和计算能力版本对应起来。从这些表格里能看出清晰的规律：

- CC 5.0 的 GPU 不支持半精度（FP16）运算
- Tensor Core 从 CC 7.x 才开始出现
- FP8 Tensor Core 随 CC 8.9（Ada Lovelace）和 9.0（Hopper）到来
- NVFP4 需要 CC 10.0 或更高

缺少的功能就是完全没有，因为功能就是硬件单元。如果你的 GPU 没有 Tensor Core，你就用不了它。没有软件上的变通办法，也没有模拟。硬件要么有这个单元，要么没有。

所以在写对性能敏感的 CUDA 代码之前，先问：“我的 GPU 支持我需要的功能吗？”这个问题要排在“我的 GPU 够快吗？”之前。

## 软件兼容性

计算能力还决定了你能用哪些 CUDA Toolkit 版本。计算能力越高，能用的 Toolkit 越新；而越新的 Toolkit 带来的功能越多，优化也越好。

一些例子：

- Maxwell（CC 5.x）- 需要 CUDA 6.5 或更高版本
- Hopper（CC 9.x）- 需要 CUDA 11.8 或更高版本
- Blackwell（CC 10.0）- 需要 CUDA 12.8 才能原生支持 cubin

如果 Toolkit 版本低于你的架构要求的最低版本，就会直接报错。代码要么编译不过，要么在运行时失败。

流程永远是这样：

1. 查出你的 GPU 的计算能力。
2. 选择你的 CUDA 版本。
3. 编写代码。

<cc-explorer></cc-explorer>

## 底层（PTX）

CUDA 代码不会直接在 GPU 上运行。它会先被编译成 PTX。PTX 是一种底层的中间语言，类似 NVIDIA GPU 的汇编语言。

有些 PTX 指令需要特定的硬件单元，而这些单元只有达到某个计算能力才有。线程束洗牌（warp shuffle）函数就是一个例子。

> [!NOTE]
> 线程束洗牌函数让同一个线程束（warp）里的线程无需借助共享内存或全局内存就能交换数据。从 CC 3.0（Kepler）开始就有线程束洗牌。

如果你的 GPU 低于最低要求，这些指令就无法运行，因为芯片上根本没有对应的硬件。

## 小结

同样的规则适用于机器学习流水线、物理仿真，以及自定义的 CUDA 核函数（kernel）。你的 GPU 的计算能力，就是硬件和代码之间的约定。

搞清楚你的 CC 编号，对照 CUDA 文档检查，选对 Toolkit 版本，然后再动手构建。性能调优、优化和功能选择，都从这里开始。

> 计算能力不只是一个版本号。它定义了你的 GPU 实际上能做什么。

## 术语表

- 计算能力（compute capability，CC）：NVIDIA 的版本号，说明一个 GPU 架构能做什么、不能做什么。
- 跑分（benchmark）：测量速度的测试程序；计算能力不是速度分数。
- 架构（architecture）：一个 GPU 家族的硬件设计；每个架构都有自己的计算能力主版本号。
- 小数点前面的数字（major number）：表示一次重大的架构变化，比如 Ampere 是 8，Hopper 是 9。
- 小数点后面的数字（minor number）：表示小的改进或扩展，比如 8.x 家族里的 8.6 或 8.9。
- Tensor Core：加速 AI 矩阵运算的特殊单元，从 CC 7.x 开始出现。
- CUDA 核心（CUDA cores）：NVIDIA GPU 里通用的算术单元，也就是核心数量里统计的那些。
- Toolkit（CUDA Toolkit）：NVIDIA 的软件包，包含 nvcc 编译器、库和工具；每个版本支持一定范围的计算能力。
- Hopper：Nvidia 2022 年的数据中心架构（H100），CC 9.0。
- Blackwell：Nvidia 当前的架构，B200 这样的数据中心芯片是 CC 10.0，RTX 50 系列显卡是 12.0。
- NVFP4：Blackwell 的一种精度格式，在大模型推理中吞吐量是 FP8 的两倍。
- FP8：8 位浮点格式；没有 FP16 精确，但在支持它的 Tensor Core 上快一倍。
- 推理（inference）：用训练好的 AI 模型得出答案，而不是训练它。
- FP16：半精度运算。CC 5.0 的 GPU 不支持。
- 模拟（emulation）：用软件模仿缺少的硬件，通常慢得多，或者根本做不到。
- Maxwell：Nvidia 2014 年的架构，CC 5.x。
- cubin：为某一个计算能力编译好的 GPU 二进制文件；PTX 则不同，它还能再为更新的 GPU 编译。
- 运行时（runtime）：程序正在运行的时候，和编译时相对。
- PTX：一种底层的中间语言，类似 NVIDIA GPU 的汇编。CUDA 代码会先被编译成它。
- 汇编语言（assembly language）：处理器执行的基本指令的可读形式，每行一条指令。
- 线程束洗牌（warp shuffle）：一类函数，让同一个线程束里的线程无需借助共享内存或全局内存就能交换数据。
- 线程束（warp）：32 个线程组成的一组，它们一起执行同一条指令。
- 全局内存（global memory）：GPU 的主显存（VRAM），所有线程都能访问，但比共享内存慢得多。
- 核函数（kernel）：在 GPU 上运行的函数，由 CPU 上的代码启动。
