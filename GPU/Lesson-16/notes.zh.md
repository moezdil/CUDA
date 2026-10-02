# 16 > 用 WSL 在 Windows 上运行 Linux

这一课讲怎样用 WSL 在 Windows 里运行 Linux。它还会介绍 GPU 和 CUDA 在 WSL 里是怎样工作的，以及有哪些限制。

## 为什么是 Linux

认真做 CUDA 开发，最终通常都会走向 Linux。Windows 也能用，但多年来 GPU 生态一直是围绕 Linux 建立的，大多数工具、文档和实际部署都默认使用 Linux。用于 AI 和 HPC 的 GPU 系统几乎全都运行 Linux。

## WSL 是什么

WSL 在 Windows 里运行一个真正的 Linux 环境。它不像早期的一些方案那样只是一个模拟层：WSL2 在一个小巧、轻量的虚拟机里运行真正的 Linux 内核。这让它在行为、兼容性和性能上都大不一样。

## 安装 WSL

在 Windows 上打开一个终端，比如 PowerShell，然后运行：

```bash
wsl --install
wsl --update
```

- `wsl --install` 会启用 WSL，并安装默认的发行版 Ubuntu。
- `wsl --update` 把 WSL 内核更新到最新版本。

一定要用 WSL2。WSL1 兼容性较差，而且完全不支持 GPU。新安装默认就是 WSL2。想确认的话，运行 `wsl -l -v`：你的发行版在 VERSION 列里必须显示 2。

## 第一次启动

第一次启动 Linux 发行版时，你需要创建一个用户名和密码。这是同一台机器上一个独立的 Linux 环境，和你的 Windows 环境是分开的。它有自己的用户、文件系统和包管理器。从现在起，你要同时在两个系统里工作。

## 访问 GPU

有了 WSL2，Linux 就能通过 Windows 的驱动程序使用 GPU。CUDA 应用在 WSL 里运行，几乎和在原生 Linux 系统上一样。所以你可以在 Linux 里开发，同时继续把 Windows 当作主系统。

GPU 驱动程序装在 Windows 一侧，而不是 WSL 里。你安装普通的 Windows 版 NVIDIA 驱动程序，WSL 就会使用宿主系统上的这个驱动。在 WSL 里，CUDA 驱动表现为一个叫 `libcuda.so` 的库，它是从 Windows 映射进来的。

> [!WARNING]
> 永远不要在 WSL 里安装 Linux 版的 NVIDIA 驱动程序。它会覆盖从 Windows 映射进来的驱动，让 GPU 无法访问。

<wsl-layers></wsl-layers>

## 在 WSL 里安装 CUDA

在 WSL 里，你要安装 Linux 版的 CUDA Toolkit，而不是 Windows 版。NVIDIA 为此准备了单独的 WSL-Ubuntu 软件源。里面的软件包只有 Toolkit，没有驱动程序，所以不会覆盖宿主系统的驱动。安装过程看起来和普通 Linux 一样，实际上并不完全相同。[第 17 课](../Lesson-17/notes.md)会一步步带你完成安装。

## WSL 的限制

WSL 是一个正经的开发环境。不过，有几件事和原生 Linux 不一样：

- GPU 支持需要处于 WDDM 模式的 GeForce 或 RTX 显卡，这是桌面显卡的普通模式。数据中心 GPU 不受支持。
- 统一内存的功能有限。CPU 和 GPU 不能同时访问同一块托管内存。
- `nvidia-smi` 不能显示所有数值，比如 GPU 利用率。

还要确认你的 GPU 适用于 CUDA 13。WSL 本身支持 Pascal 及更新的架构，但 CUDA 13 要求计算能力 7.5 或更高。GeForce GTX 1080 的计算能力是 6.1，6.1 低于 7.5，所以 CUDA 13 不能为它编译代码。GeForce RTX 2060 的计算能力是 7.5，所以可以用。

> [!TIP]
> 出问题时，从下往上逐层检查：先是 Windows 驱动程序，然后是 WSL 本身（`wsl --update`），再是 Linux 发行版，最后是 CUDA Toolkit。

## 小结

WSL 是一座实用的桥梁：你可以留在 Windows 里，以接近真实生产系统的方式使用基于 Linux 的 GPU 工具。这是最自然的入门方式之一。

> [!NOTE]
> 从这里开始，这些课程只在 Linux 里进行。Windows 只作为装有驱动程序的宿主系统出现。

## 术语表

- Linux：免费、开源的操作系统；大多数 GPU 服务器和 CUDA 工具都是围绕它建立的。
- GPU（Graphics Processing Unit）：拥有成千上万个小核心的处理器，CUDA 程序就在它上面运行。
- 生态（ecosystem）：围绕一个平台（比如 GPU）发展起来的所有工具、库、文档和驱动程序。
- AI（Artificial Intelligence）：从数据中学习的软件，比如语言模型；大部分在 GPU 上训练。
- HPC（High-Performance Computing，高性能计算）：许多强大的处理器协同解决大型问题，比如天气或物理仿真。
- WSL（Windows Subsystem for Linux）：在 Windows 里运行一个真正的 Linux 环境。
- 模拟（emulation）：用软件模仿另一个系统，而不是真正运行它，通常更慢，兼容性也更差。
- WSL2（Windows Subsystem for Linux 2）：运行真正 Linux 内核的 WSL 版本，是在 Windows 上使用 CUDA 的基础。
- Linux 内核（Linux kernel）：Linux 操作系统的核心，负责管理内存、进程和硬件；它和 CUDA 的核函数不是一回事。
- 虚拟机（virtual machine）：用软件模拟出来的一整台计算机，有自己的操作系统，运行在真实的机器上。
- 终端（terminal）：输入命令的文本窗口，比如 PowerShell 或 Windows Terminal。
- `wsl --install`：在 Windows 终端里运行的命令，用来安装 WSL 和 Ubuntu。
- `wsl --update`：把 WSL 内核更新到最新版本。
- WSL1（Windows Subsystem for Linux 1）：较老的 WSL 版本，兼容性更差，也不支持 GPU。
- Linux 发行版（Linux distribution）：一个独立的 Linux 环境，有自己的用户、文件系统和包管理器；做 CUDA 通常选 Ubuntu。
- 文件系统（file system）：操作系统存储和组织文件的方式；WSL 发行版有自己的文件系统，和 Windows 的磁盘分开。
- 包管理器（package manager）：从在线软件列表安装和更新软件的工具，比如 Ubuntu 上的 apt。
- 驱动程序（GPU driver）：让操作系统和 GPU 通信的软件；对 WSL 来说，它只装在 Windows 这一侧。
- 原生 Linux（native Linux）：直接装在机器上的 Linux，而不是运行在另一个系统里面。
- 宿主系统（host）：WSL 所运行的 Windows 系统。WSL 使用它的 GPU 驱动程序，不需要自己的 NVIDIA 驱动程序。
- `libcuda.so`：CUDA 驱动库；在 WSL 里，它是从 Windows 驱动映射进来的。
- CUDA Toolkit：NVIDIA 的编译器、库和工具；在 WSL 里你要从 WSL-Ubuntu 软件源安装 Linux 版。
- WSL-Ubuntu 软件源（WSL-Ubuntu repository）：NVIDIA 为 WSL 中的 CUDA 提供的软件包来源；里面的软件包只有 Toolkit，没有驱动程序。
- WDDM（Windows Display Driver Model）：Windows 上桌面显卡的普通驱动模式；WSL 的 GPU 支持需要它。
- 统一内存（unified memory）：CPU 和 GPU 通过同一个指针共享的内存；在 WSL 里只得到部分支持。
- CPU（Central Processing Unit）：计算机的主处理器。
- `nvidia-smi`：NVIDIA 的命令行工具，显示 GPU、驱动程序和显存使用情况。
- 计算能力（compute capability）：GPU 架构的版本号，比如 Turing 是 7.5；CUDA 13 要求 7.5 或更高。
- Pascal：NVIDIA 2016 年的架构，比如 GTX 1080；WSL 能运行它，CUDA 13 却不能为它编译。
- 生产系统（production）：完成的软件真正为用户运行的系统。
