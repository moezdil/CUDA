# 在 Windows 上运行 Linux（用 WSL 搭建实用环境）

这一课讲怎样用 WSL 在 Windows 里运行 Linux。它还会介绍 GPU 和 CUDA 在 WSL 里是怎么工作的。

## 为什么是 Linux

认真做 CUDA 开发，最后通常都会用到 Linux。Windows 也能用，但多年来 GPU 生态一直是围绕 Linux 建立的。大多数工具、文档和真实部署都默认使用 Linux。到 2026 年，用于 AI 和高性能计算的现代 GPU 系统几乎都跑在 Linux 上。

## WSL 是什么

WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）在 Windows 里运行一个真正的 Linux 环境。它不像以前的一些方案那样只是模拟层。WSL2 运行的是真正的 Linux 内核。这在行为、兼容性和性能上都有很大的差别。现在很多开发工作流都在用 WSL。

## 安装 WSL

在 Windows 上打开一个终端，运行一条命令：`wsl --install`

到 2026 年，一定要用 WSL2，因为 WSL1 兼容性更差，也没有实用的 GPU 加速。WSL2 是为现代工作负载打造的，也是在 Windows 上使用 CUDA 的基础。没有 WSL2，很多 GPU 功能都无法按预期工作。

## 第一次启动

第一次启动你的 Linux 发行版时，你要创建一个用户名和密码。这是同一台机器上一个独立的 Linux 环境，而不是你的 Windows 环境。它有自己的用户、自己的文件系统和自己的包管理器。从现在起，你要同时在两个系统里工作。

## 访问 GPU

有了 WSL2，Linux 就能通过 Windows 的驱动程序使用 GPU。CUDA 应用在 WSL 里运行起来，几乎和在原生 Linux 系统上一样。所以你可以在 Linux 里开发，同时继续把 Windows 当作主系统。

GPU 驱动程序装在 Windows 这一侧，而不是装在 WSL 里。WSL 使用宿主系统的驱动程序，不需要自己的 NVIDIA 驱动程序。想要环境稳定，就要记住这种分工。

> [!WARNING]
> 在 WSL 里安装 Linux 版的 GPU 驱动程序通常会引起冲突，所以不要这样做。

<wsl-layers></wsl-layers>

## 在 WSL 里安装 CUDA

在 WSL 里，你要安装 Linux 版的 CUDA Toolkit，而不是 Windows 版。不过 WSL 使用的是专门的软件包。它们能和共享的驱动程序配合，避免和宿主系统冲突。所以安装过程看起来和普通 Linux 一样，但其实并不完全相同。

## 2026 年的 WSL

WSL 现在已经是一个正经的开发环境，而不只是一个图方便的工具。CUDA 12.x 和新的 13.x 系列在 WSL 里完整支持 Hopper 和 Blackwell。GPU 访问很稳定，显存管理更好了，容器支持也更一致。很多时候，WSL 已经接近原生的 Linux 环境。

不过，期望还是要现实一点。WSL 有好几层。问题可能来自 Windows 的配置、WSL 本身、Linux 发行版，或者 CUDA 的安装配置。解决这些问题，也是学习这个系统如何工作的一部分。

## 小结

WSL 是一座实用的桥梁。你可以留在 Windows 里，用接近真实生产系统的方式使用基于 Linux 的 GPU 工具。这是最自然的入门方式之一。

> [!NOTE]
> 这部分只是作为一般性的介绍。本仓库在任何情况下都不会使用 “windows” 这个名字。

## 术语表

- WSL：Windows Subsystem for Linux（适用于 Linux 的 Windows 子系统），在 Windows 里运行一个真正的 Linux 环境。
- WSL2：运行真正 Linux 内核的 WSL 版本，是在 Windows 上使用 CUDA 的基础。
- WSL1：较老的 WSL 版本，兼容性更差，也没有实用的 GPU 加速。
- `wsl --install`：在 Windows 终端里运行的那一条命令，用来安装 WSL。
- Linux 发行版（Linux distribution）：一个独立的 Linux 环境，有自己的用户、文件系统和包管理器。
- 宿主驱动程序（host driver）：Windows 这一侧的 GPU 驱动程序。WSL 使用它，不需要自己的 NVIDIA 驱动程序。
- WSL CUDA 软件包（WSL CUDA packages）：专门的 Linux 版 CUDA 软件包，能和共享的驱动程序配合，避免和宿主系统冲突。
