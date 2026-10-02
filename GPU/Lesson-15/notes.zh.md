# 在 Linux 上安装 CUDA Toolkit

这一课教你在 WSL 的 Linux 里安装 CUDA Toolkit。装好之后，你的系统就能在 GPU 上编译和运行代码了。

## 和你的平台对应

CUDA 的安装必须和你的平台完全对应。在 WSL 上，要使用 WSL 专用的软件源。标准的 Ubuntu 软件源要么会安装失败，要么会装上不支持现代 GPU 架构的旧版本。

## 先检查 GPU

安装 CUDA 之前，先确认你的系统能看到 GPU：

```bash
nvidia-smi
```

- `nvidia-smi` 是 NVIDIA 的命令行工具，它向驱动程序查询 GPU 的信息。它会打印 GPU 名称、驱动程序版本和显存使用情况。
- 在 WSL 里它也能用，因为驱动程序在 Windows 那一侧，WSL 会使用它。

如果这条命令失败，就先停下来，把 GPU 环境修好。没有它，CUDA 就无法工作，因为 Toolkit 是通过驱动程序和 GPU 通信的。

## 从 NVIDIA 软件源安装

使用 NVIDIA 官方为 WSL 提供的软件源。里面是最新的 Toolkit，专门为配合共享的驱动程序而构建。

> [!WARNING]
> 不要用 `apt install nvidia-cuda-toolkit`。那个软件包很旧，不适合现代开发。

运行下面这些命令。它们先把 NVIDIA 的软件源告诉包管理器，再从这个软件源安装 Toolkit。

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-2
```

- `wget` 从一个 URL 下载文件。地址里的 `wsl-ubuntu/x86_64` 部分，选的是适用于 WSL、64 位 Intel 或 AMD CPU 的软件源。
- `cuda-keyring_1.1-1_all.deb` 是一个很小的软件包。它包含 NVIDIA 的签名密钥和软件源地址，让你的系统信任 NVIDIA 的软件包。
- `sudo` 以管理员权限运行命令。安装软件包会改动系统，所以需要管理员权限。
- `dpkg -i` 安装一个本地的 `.deb` 文件，这里安装的是 keyring。
- `apt-get update` 刷新软件包列表。不运行它，apt 就不知道新软件源里有哪些软件包。
- `apt-get -y install` 安装一个软件包。`-y` 会自动对确认问题回答 “yes”。
- `cuda-toolkit-13-2` 是 CUDA 13.2 的 Toolkit 软件包。它只包含 Toolkit，所以不会安装驱动程序。

这样就装好了 CUDA Toolkit 13.2，它适用于现代 GPU 架构。其中包括：

* CUDA 编译器（nvcc）
* CUDA 运行时
* 核心库

它不会安装 GPU 驱动程序。在 WSL 里，驱动程序来自 Windows 那一侧。

## 验证安装

检查编译器是否已经安装，以及你的 shell 能不能找到它：

```bash
nvcc --version
```

- `nvcc` 是 CUDA 编译器。
- `--version` 让它打印版本号后退出，不会编译任何东西。

输出应该显示 CUDA 13.x，因为你装的是 13.2。

如果提示找不到命令，说明你的 PATH 没有设置对。PATH 是 shell 查找程序的文件夹列表。把 CUDA 的文件夹加进去：

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export` 为当前 shell 以及它启动的程序设置一个变量。
- `/usr/local/cuda/bin` 是存放 `nvcc` 的文件夹。
- `:$PATH` 把原来的列表接在新文件夹后面，所以什么都不会丢。shell 会先在 CUDA 文件夹里查找。

> [!TIP]
> 这个设置只对当前终端有效。想让它一直生效，就把它加到你的 `.bashrc` 或 `.zshrc` 里。

## 为什么版本很重要

CUDA 和 GPU 架构紧密相连。Hopper 和 Blackwell 带来了新功能：

* FP8 执行路径
* FP4 支持（Blackwell）
* 改进的调度和显存行为

如果你的 CUDA 版本不支持这些功能，代码照样能运行，但无法充分利用硬件。

## 其他工具底下的 CUDA

CUDA 很少被单独使用。它运行在这些系统的底层：

* PyTorch
* TensorFlow
* Triton
* 自定义的 CUDA 核函数

CUDA 装对了，这些工具才能正常工作。

<install-steps></install-steps>

## 准备就绪

你的系统现在已经准备好了。你有了：

* 一个 Linux 环境（WSL）
* GPU 访问
* CUDA Toolkit 13.2
* 一个能用的 CUDA 编译器

现在你可以编写并运行真正的 CUDA 程序了。

https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network

## 术语表

- Linux：免费、开源的操作系统；这里它通过 WSL 运行在 Windows 里。
- WSL（Windows Subsystem for Linux）：在 Windows 里运行一个真正的 Linux 系统，而 GPU 驱动程序留在 Windows 那一侧。
- Ubuntu：常用的 Linux 发行版；NVIDIA 为运行在 WSL 里的 Ubuntu 准备了单独的 CUDA 软件源（wsl-ubuntu）。
- 软件源（NVIDIA repository）：在线的软件包来源；NVIDIA 为 WSL 提供的软件源里是为共享驱动程序构建的最新 Toolkit。
- 架构（architecture）：一个 GPU 家族的硬件设计，比如 Hopper 或 Blackwell；旧的 CUDA 版本不认识最新的架构。
- `nvidia-smi`：NVIDIA 的命令行工具，向驱动程序查询 GPU 名称、驱动程序版本和显存使用情况。
- 驱动程序（GPU driver）：让系统和 GPU 通信的软件；在 WSL 里它来自 Windows，所以永远不要在 Linux 里另装一个。
- apt（包管理器）：Ubuntu 的工具，从软件源下载软件包并安装，连同它们依赖的东西一起装好。
- `cuda-keyring_1.1-1_all.deb`：一个很小的软件包，包含 NVIDIA 的签名密钥和软件源地址，让你的系统信任 NVIDIA 的软件包。
- `sudo`：以管理员权限运行命令。安装软件包需要管理员权限。
- `apt-get update`：刷新软件包列表，让 apt 知道新软件源里有哪些软件包。
- CUDA Toolkit：NVIDIA 用来构建 CUDA 程序的编译器、运行时和核心库，本页安装的是 13.2 版。
- 编译器（compiler）：把源代码变成处理器能运行的代码的程序。
- `nvcc`：CUDA 编译器。`nvcc --version` 会打印它的版本号，不会编译任何东西。
- shell：读取你在终端里输入的命令的程序，比如 bash 或 zsh。
- PATH：shell 查找程序的文件夹列表。
- `export`：为当前 shell 以及它启动的程序设置一个变量。
- `.bashrc`：每打开一个新终端，shell 都会运行的启动文件，所以写在里面的 export 每次都会生效。
- Hopper / Blackwell：Nvidia 2022 年和 2024 年的 GPU 架构；要用上它们的新功能，需要较新的 CUDA 版本。
- FP8 / FP4：8 位和 4 位浮点格式；Hopper 的 Tensor Core 加入了 FP8，Blackwell 的加入了 FP4。
- 调度（scheduling）：GPU 决定下一步由哪组线程使用执行单元的方式。
- CUDA 版本（CUDA version）：Toolkit 的版本号，比如 13.2，它决定了你的代码能用哪些 GPU 和功能。
- PyTorch：很流行的深度学习 Python 库，通过 CUDA 在 GPU 上做运算。
- TensorFlow：Google 的深度学习库，在 NVIDIA GPU 上同样使用 CUDA。
- Triton：OpenAI 推出的基于 Python 的语言，不用手写 CUDA C++ 就能写出快速的 GPU 核函数。
- 核函数（kernel）：在 GPU 上运行的函数；自定义核函数就是你自己写的那些。
