# 15 > 搭建 CUDA 开发环境（使用 JetBrains 的现代工作流）

这一课讲怎样搭建 CUDA 工作环境：在 CUDA Toolkit 之上使用 JetBrains 的工具，主要是 CLion。从 2025 年 5 月起，CLion 对非商业用途（比如学习和开源项目）免费。

## 为什么选 JetBrains 和 CLion

你需要一套每天都能顺手使用、不用跟工具较劲的环境。这个仓库就是围绕 CLion 这个 IDE（Integrated Development Environment，集成开发环境）搭建这套环境的。

原因在于现代开发的方式。GPU（Graphics Processing Unit，图形处理器）架构和工具包更新得很快，项目也不再绑定在单一平台上。你可能在 Linux 上开发，在远程 GPU 上测试，再部署到别处。像 Visual Studio 这样绑定在单一系统上的 IDE，会限制这种工作方式。

JetBrains 的工具以 CMake（Cross-platform Make，跨平台构建工具）为核心。CMake 是一个用来描述如何构建项目的工具。CMake 项目不绑定在某一个环境上：你可以在不同的系统上、用不同的编译器构建它，项目结构保持不变。真实的 GPU 系统就是这样构建的。

## 先有 CUDA Toolkit

CUDA Toolkit 是一切的基础，没有它什么都构建不了。它提供了编译器、运行时，以及和 GPU 通信的库。它不是编辑器，而是让 GPU 能够执行代码的那一层。

这一层依赖硬件。Hopper 和 Blackwell 带来了新的指令、新的精度格式和新的执行行为，要用上它们，就需要较新的 CUDA 版本。截至 2026 年 10 月，最新的是 CUDA 13.4。旧版本也许还能用，但发挥不出硬件的全部能力。所以，你选择的 CUDA 版本决定了代码能做什么。

## CLion 的位置

CLion 位于 Toolkit 之上，既不会取代它，也不会把它藏起来。它为你提供一个整洁的地方来写代码、组织项目。构建时，CLion 调用 CMake，CMake 再调用 CUDA 编译器 `nvcc`。中间没有任何隐藏步骤，所以你始终清楚发生了什么。

<toolchain-stack></toolchain-stack>

CMake 把 CUDA 当作一种语言来支持。只有一个 CUDA 文件的最小 `CMakeLists.txt` 是这样的：

```cmake
cmake_minimum_required(VERSION 3.24)
project(hello LANGUAGES CXX CUDA)
set(CMAKE_CUDA_ARCHITECTURES 89)
add_executable(hello hello.cu)
```

`CMAKE_CUDA_ARCHITECTURES 89` 和 `nvcc -arch=sm_89` 是同一个目标：计算能力 8.9，也就是这些课程用的 L40S。换成 Hopper H100 就写 `90`，Blackwell B200 就写 `100`。

## Windows 上的 Visual Studio

> [!NOTE]
> 在 Windows 上，即使你从不打开 Visual Studio，`nvcc` 也需要 MSVC（Microsoft Visual C++）编译器。CUDA 13.4 支持 Visual Studio 2019、2022 和 2026。所以 Visual Studio 只是一个依赖项，而不是你的工作区。装一次，之后就可以忘掉它。

你所有真正的工作都在 CLion 里完成。

## GPU 驱动程序

CUDA 依赖 GPU 驱动程序。从 Windows 上的 CUDA 13.1 和 Linux 上的 CUDA 13.4 起，Toolkit 安装包不再附带驱动程序。你要自己安装驱动程序，并保持更新。

每个 CUDA 版本都对应一个驱动分支。580 或更新分支的驱动，可以运行用任何 CUDA 13.x 构建的程序。要用 CUDA 13.4 的新功能，需要 615 或更新的分支。所以 575 的驱动运行不了 CUDA 13 程序，580 的驱动可以运行，615 的驱动还能让你用上 13.4 的全部新功能。

> [!WARNING]
> 如果驱动程序太旧，你可能会遇到一些难以解释的问题：代码也许能编译通过，运行时却出错，有些功能也可能用不了。

## 工作流程

一切就绪之后，工作流程很简单：

- 打开 CLion，编写代码。
- 用 CMake 构建。
- CUDA Toolkit 负责编译。
- GPU 负责运行。

环境搭对了，这几步就能顺畅地配合起来。

## 小结

CUDA 开发的关键不是选哪个编辑器，而是理解工具链。JetBrains 的工具之所以合适，是因为它们让系统的每个部分各司其职。这让整个环境更干净、更稳定，也更接近生产环境。这个仓库使用的就是这套环境。

## 术语表

- JetBrains：开发 CLion、PyCharm、IntelliJ IDEA 等开发工具的公司。
- CLion：JetBrains 面向 C、C++ 和 CUDA 的 IDE。它位于 CUDA Toolkit 之上，非商业用途免费。
- IDE（Integrated Development Environment，集成开发环境）：把编辑器、构建工具和调试器合在一起的一个应用。
- GPU（Graphics Processing Unit）：拥有成千上万个小核心的处理器，CUDA 程序就在它上面运行。
- 架构（architecture）：一个 GPU 系列的硬件设计，比如 Hopper 或 Blackwell；越新的架构需要越新的工具包和驱动程序。
- Linux：大多数 GPU 服务器运行的操作系统，也是 CUDA 支持最好的平台。
- 远程 GPU（remote GPU）：另一台机器上的 GPU，比如云服务器上的，你通过网络来使用它。
- CMake（Cross-platform Make）：一个描述如何构建项目的工具，不绑定在某一个环境上。
- `CMakeLists.txt`：CMake 从中读取如何构建项目的文件。
- `CMAKE_CUDA_ARCHITECTURES`：CMake 里指定编译目标计算能力的设置，比如 89 对应 `sm_89`。
- 计算能力（compute capability）：GPU 架构的版本号，比如 L40S 是 8.9，H100 是 9.0。
- 构建（build）：通过编译和链接，把源文件变成可以运行的程序。
- 编译器（compiler）：把源代码变成处理器能运行的代码的程序；CUDA 用的是 `nvcc`。
- Toolkit（CUDA Toolkit）：基础层，包含编译器、运行时，以及和 GPU 通信的库。
- 运行时（runtime）：程序运行时调用的 CUDA 库，用来管理 GPU 显存、在 GPU 上启动工作。
- 库（libraries）：随 Toolkit 提供的、现成且经过测试的代码，比如做矩阵运算的 cuBLAS。
- Hopper / Blackwell：NVIDIA 2022 年和 2024 年的架构，要用上它们的新功能，需要较新的 CUDA 版本。
- 精度（precision）：每个数字用多少位来存，比如 FP32、FP16 或 FP8。
- CUDA 版本（CUDA version）：Toolkit 的版本号，比如 13.4；它决定了你的代码能面向哪些 GPU、用上哪些功能。
- 工具链（toolchain）：构建代码的一连串工具。CLion 调用 CMake，CMake 再调用 CUDA 编译器。
- Visual Studio：Microsoft 在 Windows 上的 IDE；CUDA 需要安装它，是因为要用它的 C++ 编译器。
- MSVC（Microsoft Visual C++）：Visual Studio 里的 C++ 编译器；在 Windows 上，`nvcc` 会把代码中 CPU（Central Processing Unit，中央处理器）的部分交给它。
- 依赖项（dependency）：另一个程序要正常工作就必须先装好的东西。
- 驱动程序（GPU driver）：让操作系统和 GPU 通信的软件；和 Toolkit 分开安装。
- 驱动分支（driver branch）：驱动的一条发布线，比如 580 或 615；每个 CUDA 版本都要求一个最低分支。
- 生产环境（production）：完成的软件真正为用户运行的环境。
