# 05 > CUDA 平台技术栈

第 00 课到第 04 课只用到了 CUDA（Compute Unified Device Architecture，统一计算设备架构）的一小部分：用 C/C++ 写一个核函数，再用 `nvcc` 编译。这一课先跳出来，从整体上看看 CUDA Toolkit 13 自带的完整平台。弄清这几层之后，以后再遇到新的工具或库，你就知道它属于哪一层。

## 五个层次

CUDA 平台分为五层。你写代码用的编程语言在最上层，GPU（Graphics Processing Unit，图形处理器）硬件靠近底层，AI（Artificial Intelligence，人工智能）库则建立在其余各层之上。点击某一层或其中的某一项，就能看到对应的介绍。

<cuda-stack></cuda-stack>

1. 编程语言：你用什么写 GPU 代码。
2. 开发工具：怎样找出程序里慢的地方和 bug。
3. 编译器工具链：源代码怎样变成 GPU 指令。
4. 硬件功能：GPU 本身的专用单元和特性。
5. AI 框架层：深度学习框架使用的现成库。

## 编程语言

- CUDA C/C++ 是编写核函数的主要语言。第 00 课到第 04 课用的都是它。
- CUDA Fortran 让 Fortran 程序员用 Fortran 而不是 C++ 来写核函数。
- OpenACC（Open Accelerators，开放加速器）的思路正好相反：你在普通的 C、C++ 或 Fortran 循环上加几行简短的注解，编译器就会把这些循环变成 GPU 代码。你完全不用手写核函数。
- Python 通过库来使用 GPU。CuPy 提供存放在 GPU 上、用法和 NumPy 一样的数组。Numba 能把 Python 函数编译成 GPU 核函数。NVIDIA 官方的 CUDA Python 软件包（`cuda-python`）让 Python 能直接调用 CUDA 驱动程序和运行时的 API（Application Programming Interface，应用程序编程接口）。

这些语言最终都运行在同样的 GPU 硬件上，用的也是你在第 00 课到第 04 课里见过的线程块、线程和线程束。

## 开发工具

- Nsight Systems 会记录整个程序中 CPU（Central Processing Unit，中央处理器）和 GPU 工作的时间线。从中能看出时间花在了哪里，比如 CPU 复制数据时 GPU 是不是在空等。
- Nsight Compute 会深入分析单个核函数，告诉你它把硬件用得怎么样。
- Compute Sanitizer 会运行程序，报告核函数里的内存错误，比如某个线程越过数组末尾写了数据。

> [!TIP]
> 先用 Nsight Systems 找出程序里慢的地方，再用 Nsight Compute 分析那一个核函数。一个核函数只占运行时间的 1%，花力气去测它就是白费功夫。

## 编译器工具链

`nvcc`（NVIDIA CUDA Compiler，NVIDIA CUDA 编译器）负责编译 `.cu` 文件。到目前为止，每一课的编译步骤用的都是它。它会把文件拆成两部分：

- 主机端代码，也就是在 CPU 上运行的部分，交给普通的 C++ 编译器处理：Linux 上是 `gcc` 或 `clang`，Windows 上是 MSVC（Microsoft Visual C++）。
- 设备端代码，也就是核函数，由 NVIDIA 自己的工具分两步编译。第一步编译成 PTX（Parallel Thread Execution，并行线程执行），这是一种虚拟指令集，不绑定某一款 GPU。第二步把 PTX 变成 SASS（Streaming ASSembler），也就是某一代 GPU 真正执行的机器指令。

<nvcc-pipeline></nvcc-pipeline>

程序文件里可以同时保存 SASS 和 PTX。程序启动时，驱动程序会挑出适合这块 GPU 的 SASS。如果找不到，就当场把 PTX 编译成 SASS。这叫作 JIT（just-in-time，即时）编译。

举个例子：第 06 课用 `-arch=sm_89` 编译。这样程序里会同时保存计算能力（compute capability，CC）8.9 的 SASS 和 CC 8.9 的 PTX。

- 在 L40S（CC 8.9）上，驱动程序直接运行保存好的 SASS。
- 在更新的 GPU 上，比如 CC 12.0 的 GPU，没有 12.0 的 SASS。驱动程序会在启动时把保存的 PTX 编译成 CC 12.0 的 SASS，程序照样能运行。
- 在更旧的 GPU 上，比如 CC 8.0 的 GPU，两者都用不了，因为 CC 8.9 的 PTX 可能用到了 CC 8.0 没有的功能。程序里的核函数无法启动。

> [!NOTE]
> JIT 编译会拖慢程序启动，而且驱动程序只能用上它拿到的那个 PTX 版本所支持的功能。想在某块 GPU 上跑出最快的速度，就要针对这块 GPU 的计算能力编译 SASS（第 03 课）。

## 硬件功能

- Tensor Core 是每个 SM（Streaming Multiprocessor，流式多处理器）内部专门做矩阵运算的单元。它和你在第 03 课里数过的 FP32（32 位浮点数）核心是两套硬件。用 FP16（16 位浮点数）、FP8（8 位浮点数）这类更小的数字格式做矩阵运算时，它要快得多。深度学习大量依赖它。
- MIG（Multi-Instance GPU，多实例 GPU）能把一块数据中心 GPU 切分成最多七个互相隔离的部分。每个部分都有自己的 SM 和显存，用起来就像一块独立的 GPU。比如，一块 80 GB（gigabyte，吉字节）的 A100 可以切成七份，每份约 10 GB，这样七个用户共用一张卡，也不会互相拖慢。
- 动态并行（Dynamic Parallelism）让正在运行的核函数直接在 GPU 上启动另一个核函数。在第 00 课到第 04 课里，只有 CPU 会启动核函数。动态并行把这一步挪到了 GPU 上，核函数不必绕回 CPU 就能启动更多工作。
- GPUDirect 让 GPU 与 GPU、GPU 与网卡、GPU 与存储设备之间直接传输数据，不用绕道 CPU 内存。
- NVLink 是 NVIDIA 用来直连 GPU 的高速通道。它比 PCIe（Peripheral Component Interconnect Express）快得多，PCIe 就是平时插 GPU 的那种普通插槽。

更小的数字格式之所以重要，是因为它们既省显存又省时间。一个 FP32 数占 4 字节，一个 FP16 数占 2 字节，一个 FP8 数占 1 字节。一个包含 10 亿个数的模型，用 FP32 需要 4 GB，用 FP16 需要 2 GB，用 FP8 只需要 1 GB。另外，Tensor Core 每秒能完成的 FP8 运算也比 FP16 运算多。

> [!NOTE]
> 并不是每块 GPU 都具备所有这些功能。这些课用的 L40S 有 FP8 Tensor Core，但没有 MIG，也没有 NVLink，显存是 GDDR6，而不是 H100、B200 这类 GPU 上的 HBM（High Bandwidth Memory，高带宽内存）。请查一下你自己那块 GPU 的数据手册。

## AI 框架层

- cuBLAS（CUDA Basic Linear Algebra Subprograms，CUDA 基础线性代数子程序库）是 NVIDIA 在 GPU 上做矩阵和向量运算的库，随 CUDA Toolkit 一起提供。
- cuDNN（CUDA Deep Neural Network library，CUDA 深度神经网络库）是面向深度学习的 GPU 算子库，包含卷积、注意力等运算。PyTorch 和 TensorFlow 在底层都会调用它。
- TensorRT 会把训练好的模型重新构建一遍，让它在某一款特定的 GPU 上跑得尽可能快。
- NCCL（NVIDIA Collective Communications Library，NVIDIA 集合通信库，读作“nickel”）负责在 GPU 之间传输数据，比如八块 GPU 一起训练同一个模型时，把它们各自算出的结果加起来。如果有 NVLink 和 GPUDirect 可用，它就会用上。

用 PyTorch 时，你很少需要亲自调用这些库。但正是有了它们，一行 PyTorch 代码才能在 GPU 上跑得飞快。

## 术语表

- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 让通用程序在 GPU 上运行的平台。
- CUDA Fortran：带有扩展的 Fortran，可以用来写 GPU 核函数。
- OpenACC（Open Accelerators，开放加速器）：加在 C、C++ 和 Fortran 循环上的注解，让编译器替你生成 GPU 代码。
- CuPy：Python 库，在 GPU 上提供 NumPy 风格的数组。
- Numba：Python 编译器，可以把 Python 函数变成 GPU 核函数。
- CUDA Python（`cuda-python`）：NVIDIA 的 Python 软件包，可以直接调用 CUDA 驱动程序和运行时的 API。
- API（Application Programming Interface，应用程序编程接口）：一个库提供给你的代码调用的那组函数。
- `nvcc`（NVIDIA CUDA Compiler，NVIDIA CUDA 编译器）：CUDA 编译器。它能处理同一个 `.cu` 文件里的主机端代码和设备端代码。
- MSVC（Microsoft Visual C++）：在 Windows 上，`nvcc` 用来编译主机端代码的 C++ 编译器。
- PTX（Parallel Thread Execution，并行线程执行）：设备端代码第一步被编译成的虚拟指令集。它不绑定某一款 GPU。
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
- HBM（High Bandwidth Memory，高带宽内存）：速度极快的显存，用在 H100、B200 这类数据中心 GPU 上。
- cuBLAS（CUDA Basic Linear Algebra Subprograms，CUDA 基础线性代数子程序库）：NVIDIA 做矩阵和向量运算的 GPU 库。
- cuDNN（CUDA Deep Neural Network library，CUDA 深度神经网络库）：面向深度学习的 GPU 算子库。PyTorch 和 TensorFlow 在底层都会用到它。
- TensorRT：让训练好的模型在某一款 GPU 上跑得很快。
- NCCL（NVIDIA Collective Communications Library，NVIDIA 集合通信库）：在 GPU 之间传输数据的库，常用于多 GPU 训练。
- GPU（Graphics Processing Unit，图形处理器）：拥有成千上万个小核心、负责运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：主处理器。它运行主机端代码并启动核函数。
- AI（Artificial Intelligence，人工智能）：从数据中学习的软件。如今主要指深度学习模型，它们在 GPU 上训练和运行。
