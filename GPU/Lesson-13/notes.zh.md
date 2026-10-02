# 搭建 CUDA 开发环境（使用 JetBrains 的现代工作流）

这一课讲怎样搭建 CUDA 的工作环境。我们在 CUDA Toolkit 之上使用 JetBrains 的工具，主要是 CLion。

## 为什么选 JetBrains 和 CLion

你需要一套每天都能顺手使用、不用和工具较劲的环境。这个仓库就是围绕 CLion 来搭建这套环境的。

原因在于现代开发的方式。现在 GPU 架构和工具包更新得更快了。项目也不再绑定在一个平台上。你可能在 Linux 上开发，在远程 GPU 上测试，再部署到别的地方。像 Visual Studio 这样和环境紧密绑定的 IDE，会限制这种工作方式。

JetBrains 的工具是围绕 CMake 构建的。CMake 是一个描述如何构建项目的工具。CMake 项目不绑定在某一个环境上。你可以在不同的系统上、用不同的编译器来构建它，同时保持相同的结构。真实的 GPU 系统就是这样构建的。

## 先有 CUDA Toolkit

CUDA Toolkit 是一切的基础，没有它什么都跑不起来。它提供了编译器、运行时，以及和 GPU 通信的库。它不是编辑器，而是让 GPU 执行成为可能的那一层。

到 2026 年，这一层更加依赖硬件。Hopper 和 Blackwell 带来了新的指令、新的精度格式和新的执行行为。你需要较新的 CUDA 版本才能用上它们。旧版本也许还能用，但发挥不出硬件的能力。所以你选择的 CUDA 版本决定了你的代码能做什么。

## CLion 的位置

CLion 位于 Toolkit 之上。它不会取代 Toolkit，也不会把它藏起来。它给你一个干净的地方来写代码、组织项目。构建时，CLion 调用 CMake，CMake 再调用 CUDA 编译器。中间没有任何隐藏的步骤，所以你总能清楚地知道发生了什么。

<toolchain-stack></toolchain-stack>

## Windows 上的 Visual Studio

> [!NOTE]
> 在 Windows 上，即使你不用 Visual Studio，可能仍然需要安装它的一部分组件。CUDA 工具链会在后台使用 Microsoft 的编译器。所以 Visual Studio 是一个依赖项，而不是你的工作区。装一次，然后就可以忘掉它。

你所有真正的工作都在 CLion 里完成。

## GPU 驱动程序

CUDA 依赖 GPU 驱动程序。到 2026 年，架构变化很快，所以及时更新驱动程序也是环境搭建的一部分。

> [!WARNING]
> 如果驱动程序太旧，你可能会遇到很难解释的问题。代码也许能编译，但运行不正常。有些功能可能用不了。

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
- CLion：JetBrains 的一个工具，用来写代码和组织项目。它位于 CUDA Toolkit 之上。
- IDE（集成开发环境）：把编辑器、构建工具和调试器合在一起的一个应用。
- 架构（architecture）：一个 GPU 家族的硬件设计，比如 Hopper 或 Blackwell；越新的架构需要越新的工具包和驱动程序。
- Linux：大多数 GPU 服务器运行的操作系统，也是 CUDA 支持最好的平台。
- 远程 GPU（remote GPU）：另一台机器上的 GPU，比如云服务器上的，你通过网络来使用它。
- CMake：一个描述如何构建项目的工具，不绑定在某一个环境上。
- 构建（build）：通过编译和链接，把源文件变成可以运行的程序。
- 编译器（compiler）：把源代码变成处理器能运行的代码的程序；CUDA 用的是 nvcc。
- Toolkit（CUDA Toolkit）：基础层，包含编译器、运行时，以及和 GPU 通信的库。
- 运行时（runtime）：程序运行时调用的 CUDA 库，用来管理 GPU 显存、在 GPU 上启动工作。
- 库（libraries）：随 Toolkit 提供的、现成且经过测试的代码，比如做矩阵运算的 cuBLAS。
- Hopper / Blackwell：Nvidia 2022 年和 2024 年的架构，要用上它们的新功能，需要较新的 CUDA 版本。
- 精度（precision）：每个数字用多少位来存，比如 FP32、FP16 或 FP8。
- CUDA 版本（CUDA version）：Toolkit 的版本号，比如 13.0；它决定了你能针对哪些 GPU 和功能。
- 工具链（toolchain）：构建代码的一连串工具。CLion 调用 CMake，CMake 再调用 CUDA 编译器。
- Visual Studio：Windows 上的一个依赖项，因为 CUDA 工具链会在后台使用 Microsoft 的编译器。
- Microsoft 的编译器（MSVC）：Visual Studio 里的 C++ 编译器；在 Windows 上，nvcc 会把代码中 CPU 的部分交给它。
- 依赖项（dependency）：另一个程序要正常工作就必须先装好的东西。
- 驱动程序（GPU driver）：CUDA 依赖它。如果它太旧，代码也许能编译，但运行不正常。
- 生产环境（production）：完成的软件真正为用户运行的环境。
