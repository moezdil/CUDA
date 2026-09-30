# 第 05 课：CUDA 平台技术栈

这节课介绍 Toolkit 13.x 为 Blackwell 提供的完整 CUDA 平台。它分为五层：最上面是编程语言，最下面是硬件，中间是各种工具。

## 编程语言

- CUDA C/C++ 是编写核函数的主要语言。第 00 课到第 04 课用的都是它。
- OpenACC 和 CUDA Fortran 通过代码注解来支持 GPU，所以你不用手写核函数。
- Python 通过 CuPy 和 Numba 这样的库来使用 GPU。

这四种语言都运行在同样的 GPU 硬件上。

## 开发工具

- Nsight Systems 记录 CPU 和 GPU 工作的时间线，告诉你应用程序把时间花在了哪里。
- Nsight Compute 专门分析一个核函数，告诉你它对硬件的利用程度如何。
- Compute Sanitizer 运行程序，并报告核函数里的内存错误。

## 编译器工具链

`nvcc` 负责编译 `.cu` 文件。到目前为止，每节课的编译步骤都调用了它。它把主机端代码交给普通的 C++ 编译器，把设备端代码交给 NVIDIA 编译器。设备端代码先变成 PTX，这是一种虚拟指令集，不绑定某一款 GPU。之后 GPU 驱动程序再把 PTX 转换成 SASS，也就是那款 GPU 真正执行的指令。二进制文件里保存了 PTX，所以同一个程序不用重新编译，就能在未来的 GPU 上运行。

<nvcc-pipeline></nvcc-pipeline>

## 硬件功能

- Tensor Core 是每个 SM 内部专门做矩阵运算的单元。它和 FP32 核心是分开的，做 FP16 和 FP8 矩阵运算时要快得多。
- MIG 可以把一块 GPU 切分成最多七个独立的部分。每个部分都像一块单独的 GPU。
- 动态并行（Dynamic Parallelism）让一个正在运行的核函数直接在 GPU 上启动另一个核函数，不用回到 CPU。在第 00 课里，是由 CPU 启动核函数的。动态并行把这一步搬到了 GPU 上。
- GPU Direct 让 GPU 之间、或者 GPU 和网卡之间直接传输数据，不用经过系统内存。

> [!NOTE]
> SM 是线程块运行所在的物理处理器（第 02 课）。第 03 课列出了每个 SM 的 FP32 核心数。

## AI 框架层

- cuDNN 是一个面向深度学习的 GPU 运算库。PyTorch 和 TensorFlow 用它来做卷积、注意力等运算。
- TensorRT 接收一个训练好的模型，让它在某一款 GPU 上跑得更快。
- NCCL 负责 GPU 之间的通信。想同时用多块 GPU 训练，就需要它。

## 图示

![CUDA 平台技术栈](05.png)

## 术语表

- PTX（Parallel Thread Execution）：CUDA 先把设备端代码编译成的中间指令集。它不绑定某一款 GPU。驱动程序会在运行时把它转换成真正的 GPU 指令。
- SASS（Streaming ASSembler）：某一款 GPU 真正的机器码。PTX 在运行之前会先变成 SASS。
- `nvcc`：CUDA 编译器。它能处理同一个 `.cu` 文件里的主机端代码和设备端代码。
- Nsight Systems：性能分析工具，展示整个应用程序里 CPU 和 GPU 工作的时间线。
- Nsight Compute：性能分析工具，测量一个核函数对 GPU 硬件的利用程度。
- Compute Sanitizer：在程序运行时找出核函数里内存错误的工具。
- MIG（Multi-Instance GPU，多实例 GPU）：把一块物理 GPU 切分成互相隔离的几个部分。每个部分都像一块单独的 GPU。
- Tensor Core：每个 SM 内部的矩阵乘法单元。做矩阵运算时比普通的 FP32 核心更快。
- 动态并行（Dynamic Parallelism）：GPU 上的核函数可以启动另一个核函数，不用回到 CPU。
- GPU Direct：让 GPU 之间、或者 GPU 和网卡之间传输数据，不用经过 CPU。
- NCCL：GPU 之间的通信库，用于分布式训练。
- cuDNN：面向深度学习的 GPU 运算库。PyTorch 和 TensorFlow 在底层都用它。
- TensorRT：让训练好的模型在某一款 GPU 上跑得更快。
