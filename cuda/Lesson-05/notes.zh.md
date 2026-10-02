# 05 > CUDA 平台技术栈

第 00 课到第 04 课只用到了 CUDA（Compute Unified Device Architecture，统一计算设备架构）的一小部分：用 C/C++ 写一个核函数，再用 `nvcc` 编译。这节课退后一步，看看 CUDA Toolkit 13 自带的整个平台。了解了这些层次，以后遇到新的工具或库，你就知道它属于哪一层。

## 五个层次

CUDA 平台分为五层。你写代码用的编程语言在最上面，GPU（Graphics Processing Unit，图形处理器）硬件在靠近底部的位置，AI（Artificial Intelligence，人工智能）库则建立在所有这些层之上。点击某一层或某一项，就能看到它的介绍。

<cuda-stack></cuda-stack>

1. 编程语言：你用什么写 GPU 代码。
2. 开发工具：你怎么找出慢的部分和 bug。
3. 编译器工具链：你的源代码怎么变成 GPU 指令。
4. 硬件功能：GPU 本身的专用单元和特性。
5. AI 框架层：深度学习框架使用的现成库。

## 编程语言

- CUDA C/C++ 是编写核函数的主要语言。第 00 课到第 04 课用的都是它。
- CUDA Fortran 让 Fortran 程序员用 Fortran 而不是 C++ 来写核函数。
- OpenACC（Open Accelerators，开放加速器）的思路正好相反：你在普通的 C、C++ 或 Fortran 循环上加几行简短的注解，编译器就会把这些循环变成 GPU 代码。你完全不用手写核函数。
- Python 通过库来使用 GPU。CuPy 提供存放在 GPU 上、用法和 NumPy 一样的数组。Numba 能把 Python 函数编译成 GPU 核函数。NVIDIA 自己的 CUDA Python 软件包（`cuda-python`）让 Python 可以直接调用 CUDA 驱动和运行时的 API（Application Programming Interface，应用程序编程接口）。

它们最后都运行在同样的 GPU 硬件上，用的也是你在第 00 课到第 04 课里见过的线程块、线程和线程束。

## 开发工具

- Nsight Systems 记录整个程序里 CPU（Central Processing Unit，中央处理器）和 GPU 工作的时间线。它能告诉你时间花在了哪里，比如 CPU 复制数据的时候 GPU 是不是在空等。
- Nsight Compute 详细分析一个核函数，告诉你它对硬件的利用程度如何。
- Compute Sanitizer 运行程序，并报告核函数里的内存错误，比如某个线程写到了数组末尾之外。

> [!TIP]
> 先用 Nsight Systems 找出程序里慢的部分，再用 Nsight Compute 去分析那一个核函数。去测量一个只占运行时间 1% 的核函数，只是白费力气。

## 编译器工具链

`nvcc`（NVIDIA CUDA Compiler，NVIDIA CUDA 编译器）负责编译 `.cu` 文件。到目前为止，每节课的编译步骤都用到了它。它把文件分成两部分：

- 主机端代码，也就是在 CPU 上运行的部分，交给普通的 C++ 编译器：Linux 上是 `gcc` 或 `clang`，Windows 上是 MSVC（Microsoft Visual C++）。
- 设备端代码，也就是核函数，由 NVIDIA 自己的工具分两步编译。先变成 PTX（Parallel Thread Execution，并行线程执行），这是一种虚拟指令集，不绑定某一款 GPU。然后 PTX 再变成 SASS（Streaming ASSembler），也就是某一代 GPU 真正的机器指令。

<nvcc-pipeline></nvcc-pipeline>

程序文件里可以同时保存 SASS 和 PTX。程序启动时，驱动程序会挑选适合这块 GPU 的 SASS。如果没有，就当场把 PTX 编译成 SASS。这叫作 JIT（just-in-time，即时）编译。

举个例子：第 06 课用 `-arch=sm_89` 来编译。这样程序里会保存计算能力（CC，compute capability）8.9 的 SASS，以及 CC 8.9 的 PTX。

- 在 L40S（CC 8.9）上，驱动程序直接运行保存好的 SASS。
- 在更新的 GPU 上，比如 CC 12.0 的 GPU，没有 12.0 的 SASS。驱动程序会在启动时把保存的 PTX 编译成 CC 12.0 的 SASS，程序照样能运行。
- 在更旧的 GPU 上，比如 CC 8.0 的 GPU，两者都不合适，因为 CC 8.9 的 PTX 可能用到了 CC 8.0 没有的功能。程序的核函数会启动失败。

> [!NOTE]
> JIT 编译会在程序启动时花一些时间，而且驱动程序只能用到它拿到的那个 PTX 版本的功能。想在某块 GPU 上达到最快速度，就为这块 GPU 的计算能力编译 SASS（第 03 课）。

## 硬件功能

- Tensor Core 是每个 SM（Streaming Multiprocessor，流式多处理器）内部专门做矩阵运算的单元。它和你在第 03 课里数过的 FP32（32 位浮点数）核心是分开的，用 FP16（16 位浮点数）和 FP8（8 位浮点数）这样更小的数字格式做矩阵运算时要快得多。深度学习大量用到它。
- MIG（Multi-Instance GPU，多实例 GPU）可以把一块数据中心 GPU 切分成最多七个互相隔离的部分。每个部分有自己的 SM 和内存，就像一块单独的 GPU。比如，一块 80 GB（gigabyte，吉字节）的 A100 可以分成七个各约 10 GB 的部分，这样七个用户共用一张卡，也不会互相拖慢。
- 动态并行（Dynamic Parallelism）让一个正在运行的核函数直接在 GPU 上启动另一个核函数。在第 00 课到第 04 课里，只有 CPU 启动核函数。动态并行把这一步搬到了 GPU 上，核函数不用绕回 CPU 就能启动更多工作。
- GPUDirect 让 GPU 之间、GPU 和网卡之间、或者 GPU 和存储之间直接传输数据，不用绕道 CPU 内存。
- NVLink 是 NVIDIA 在 GPU 之间的高速直连通道。它比 PCIe（Peripheral Component Interconnect Express）快得多，PCIe 就是 GPU 平时插的那种普通插槽。

更小的数字格式之所以重要，是因为它们能节省内存和时间。一个 FP32 数字占 4 字节，一个 FP16 数字占 2 字节，一个 FP8 数字占 1 字节。一个有 10 亿个数字的模型，用 FP32 需要 4 GB，用 FP16 需要 2 GB，用 FP8 只需要 1 GB。而且 Tensor Core 每秒能做的 FP8 运算也比 FP16 运算更多。

> [!NOTE]
> 不是每块 GPU 都有所有这些功能。这些课里用的 L40S 有 FP8 Tensor Core，但没有 MIG，也没有 NVLink，用的是 GDDR6 内存，而不是 H100、B200 这类 GPU 上的 HBM（High Bandwidth Memory，高带宽内存）。请查一下你自己那块 GPU 的数据手册。

## AI 框架层

- cuBLAS（CUDA Basic Linear Algebra Subprograms，CUDA 基础线性代数子程序库）是 NVIDIA 在 GPU 上做矩阵和向量运算的库。它随 CUDA Toolkit 一起提供。
- cuDNN（CUDA Deep Neural Network library，CUDA 深度神经网络库）是一个面向深度学习的 GPU 运算库，比如卷积和注意力运算。PyTorch 和 TensorFlow 在底层都会调用它。
- TensorRT 接收一个训练好的模型，把它重新构建，让它在某一款 GPU 上跑得尽可能快。
- NCCL（NVIDIA Collective Communications Library，NVIDIA 集合通信库，读作 "nickel"）负责在 GPU 之间传输数据，比如把八块一起训练同一个模型的 GPU 算出的结果加起来。只要有 NVLink 和 GPUDirect，它就会用上。

用 PyTorch 的时候，你很少会自己去调用这些库。但正是因为有它们，一行 PyTorch 代码才能在 GPU 上跑得很快。

## 术语表

- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 让通用程序在 GPU 上运行的平台。
- CUDA Fortran：带有扩展的 Fortran，可以用来写 GPU 核函数。
- OpenACC（Open Accelerators，开放加速器）：加在 C、C++ 和 Fortran 循环上的注解，让编译器替你生成 GPU 代码。
- CuPy：Python 库，在 GPU 上提供 NumPy 风格的数组。
- Numba：Python 编译器，可以把 Python 函数变成 GPU 核函数。
- CUDA Python（`cuda-python`）：NVIDIA 的 Python 软件包，可以直接调用 CUDA 驱动和运行时的 API。
- API（Application Programming Interface，应用程序编程接口）：一个库提供给你的代码调用的一组函数。
- `nvcc`（NVIDIA CUDA Compiler，NVIDIA CUDA 编译器）：CUDA 编译器。它能处理同一个 `.cu` 文件里的主机端代码和设备端代码。
- MSVC（Microsoft Visual C++）：在 Windows 上，`nvcc` 用来编译主机端代码的 C++ 编译器。
- PTX（Parallel Thread Execution，并行线程执行）：设备端代码先被编译成的虚拟指令集。它不绑定某一款 GPU。
- SASS（Streaming ASSembler）：某一代 GPU 真正的机器码。
- JIT（just-in-time，即时）编译：如果程序里没有匹配的 SASS，驱动程序会在程序启动时把 PTX 编译成 SASS。
- Nsight Systems：性能分析工具，展示整个程序里 CPU 和 GPU 工作的时间线。
- Nsight Compute：性能分析工具，测量一个核函数对 GPU 硬件的利用程度。
- Compute Sanitizer：在程序运行时找出核函数里内存错误的工具。
- Tensor Core：每个 SM 内部的矩阵运算单元。做矩阵运算时比 FP32 核心快得多。
- FP32 / FP16 / FP8：32 位、16 位和 8 位浮点数，分别占 4、2 和 1 字节。
- MIG（Multi-Instance GPU，多实例 GPU）：把一块物理 GPU 切分成最多七个互相隔离的部分。每个部分都像一块单独的 GPU。
- 动态并行（Dynamic Parallelism）：GPU 上的核函数可以启动另一个核函数，不用回到 CPU。
- GPUDirect：让 GPU 之间、GPU 和网卡之间、或者 GPU 和存储之间传输数据，不用经过 CPU 内存。
- NVLink：NVIDIA 在 GPU 之间的高速直连通道。
- PCIe（Peripheral Component Interconnect Express）：把 GPU 连接到电脑其他部分的标准插槽和总线。
- HBM（High Bandwidth Memory，高带宽内存）：非常快的 GPU 内存，用在 H100、B200 这类数据中心 GPU 上。
- cuBLAS（CUDA Basic Linear Algebra Subprograms，CUDA 基础线性代数子程序库）：NVIDIA 做矩阵和向量运算的 GPU 库。
- cuDNN（CUDA Deep Neural Network library，CUDA 深度神经网络库）：面向深度学习的 GPU 运算库。PyTorch 和 TensorFlow 在底层都用它。
- TensorRT：让训练好的模型在某一款 GPU 上跑得很快。
- NCCL（NVIDIA Collective Communications Library，NVIDIA 集合通信库）：在 GPU 之间传输数据的库。用于在多块 GPU 上训练。
