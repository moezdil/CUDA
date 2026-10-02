# 在 Windows 上运行 Linux（用 WSL 搭建实用环境）

这一课讲怎样用 WSL 在 Windows 里运行 Linux，并介绍 GPU 和 CUDA 在 WSL 里是怎样工作的。

## 为什么是 Linux

认真做 CUDA 开发，最终通常都会走向 Linux。Windows 也能用，但多年来 GPU 生态一直是围绕 Linux 建立的，大多数工具、文档和实际部署都默认使用 Linux。2026 年，用于 AI 和高性能计算的现代 GPU 系统几乎全都运行 Linux。

## WSL 是什么

WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）在 Windows 里运行一个真正的 Linux 环境。它不像早期的一些方案那样只是一个模拟层：WSL2 运行的是真正的 Linux 内核，这让它在行为、兼容性和性能上都大不一样。如今很多开发工作流都在用 WSL。

## 安装 WSL

在 Windows 上打开一个终端，运行一条命令：`wsl --install`

截至 2026 年，一定要用 WSL2。WSL1 兼容性较差，也没有实用的 GPU 加速。WSL2 为现代工作负载而设计，是在 Windows 上使用 CUDA 的基础。没有 WSL2，很多 GPU 功能都无法按预期工作。

## 第一次启动

第一次启动 Linux 发行版时，你需要创建一个用户名和密码。这是同一台机器上一个独立的 Linux 环境，和你的 Windows 环境是分开的。它有自己的用户、文件系统和包管理器。从现在起，你要同时在两个系统里工作。

## 访问 GPU

有了 WSL2，Linux 就能通过 Windows 的驱动程序使用 GPU。CUDA 应用在 WSL 里运行，几乎和在原生 Linux 系统上一样。所以你可以在 Linux 里开发，同时继续把 Windows 当作主系统。

GPU 驱动程序装在 Windows 一侧，而不是 WSL 里。WSL 使用宿主系统的驱动程序，不需要自己的 NVIDIA 驱动程序。想要环境稳定，就要记住这种分工。

> [!WARNING]
> 在 WSL 里安装 Linux 版的 GPU 驱动程序通常会引起冲突，所以不要这样做。

<wsl-layers></wsl-layers>

## 在 WSL 里安装 CUDA

在 WSL 里，你要安装 Linux 版的 CUDA Toolkit，而不是 Windows 版。不过 WSL 用的是专门的软件包，它们能和共享的驱动程序配合，避免与宿主系统冲突。所以安装过程看起来和普通 Linux 一样，实际上并不完全相同。

## 2026 年的 WSL

WSL 如今已经是一个正经的开发环境，而不只是图方便的小工具。CUDA 12.x 和新的 13.x 系列在 WSL 里完整支持 Hopper 和 Blackwell。GPU 访问很稳定，显存管理有所改进，容器支持也更一致。很多情况下，WSL 已经接近原生 Linux 环境。

不过，期望还是要实际一些。WSL 包含好几层，问题可能出在 Windows 的配置、WSL 本身、Linux 发行版，或者 CUDA 的安装配置上。排查这些问题，也是了解整个系统如何运作的一部分。

## 小结

WSL 是一座实用的桥梁：你可以留在 Windows 里，以接近真实生产系统的方式使用基于 Linux 的 GPU 工具。这是最自然的入门方式之一。

> [!NOTE]
> 以上内容只作一般性介绍。本仓库在任何情况下都不会使用“windows”这个名字。

## 术语表

- Linux：免费、开源的操作系统；大多数 GPU 服务器和 CUDA 工具都是围绕它建立的。
- 生态（ecosystem）：围绕一个平台（比如 GPU）发展起来的所有工具、库、文档和驱动程序。
- 高性能计算（high-performance computing，HPC）：许多强大的处理器协同解决大型问题，比如天气或物理仿真。
- WSL：Windows Subsystem for Linux（适用于 Linux 的 Windows 子系统），在 Windows 里运行一个真正的 Linux 环境。
- 模拟（emulation）：用软件模仿另一个系统，而不是真正运行它，通常更慢，兼容性也更差。
- WSL2：运行真正 Linux 内核的 WSL 版本，是在 Windows 上使用 CUDA 的基础。
- Linux 内核（Linux kernel）：Linux 操作系统的核心，负责管理内存、进程和硬件；它和 CUDA 的核函数不是一回事。
- 终端（terminal）：输入命令的文本窗口，比如 PowerShell 或 Windows Terminal。
- `wsl --install`：在 Windows 终端里运行的那一条命令，用来安装 WSL。
- WSL1：较老的 WSL 版本，兼容性更差，也没有实用的 GPU 加速。
- GPU 加速（GPU acceleration）：把工作放到 GPU 上运行，让它比只用 CPU 更快完成。
- Linux 发行版（Linux distribution）：一个独立的 Linux 环境，有自己的用户、文件系统和包管理器；做 CUDA 通常选 Ubuntu。
- 文件系统（file system）：操作系统存储和组织文件的方式；WSL 发行版有自己的文件系统，和 Windows 的磁盘分开。
- 包管理器（package manager）：从在线软件列表安装和更新软件的工具，比如 Ubuntu 上的 apt。
- 驱动程序（GPU driver）：让操作系统和 GPU 通信的软件；对 WSL 来说，它只装在 Windows 这一侧。
- 原生 Linux（native Linux）：直接装在机器上的 Linux，而不是运行在另一个系统里面。
- 宿主系统（host）：WSL 所运行的 Windows 系统。WSL 使用它的 GPU 驱动程序，不需要自己的 NVIDIA 驱动程序。
- CUDA Toolkit：NVIDIA 的编译器、库和工具；在 WSL 里你要安装专为 WSL 准备的 Linux 版。
- 专门的软件包（special packages）：为 WSL 准备的 Linux 版 CUDA 软件包，能和共享的驱动程序配合，避免和宿主系统冲突。
- Hopper / Blackwell：Nvidia 2022 年和 2024 年的 GPU 架构，CUDA 12.x 和 13.x 在 WSL 里完整支持它们。
- 容器（container）：把应用和它需要的所有库打包在一起，与系统其他部分隔离运行，比如用 Docker。
- 生产系统（production）：完成的软件真正为用户运行的系统。
