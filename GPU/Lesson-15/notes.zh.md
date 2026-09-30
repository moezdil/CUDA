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

- `nvidia-smi`：NVIDIA 的命令行工具，向驱动程序查询 GPU 名称、驱动程序版本和显存使用情况。
- NVIDIA 软件源（NVIDIA repository）：NVIDIA 官方为 WSL 提供的软件包来源，里面是为共享驱动程序构建的最新 Toolkit。
- `cuda-keyring_1.1-1_all.deb`：一个很小的软件包，包含 NVIDIA 的签名密钥和软件源地址，让你的系统信任 NVIDIA 的软件包。
- `sudo`：以管理员权限运行命令。安装软件包需要管理员权限。
- `apt-get update`：刷新软件包列表，让 apt 知道新软件源里有哪些软件包。
- `nvcc`：CUDA 编译器。`nvcc --version` 会打印它的版本号，不会编译任何东西。
- PATH：shell 查找程序的文件夹列表。
- `export`：为当前 shell 以及它启动的程序设置一个变量。
