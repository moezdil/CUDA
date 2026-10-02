# 17 > 在 Linux 上安装 CUDA Toolkit

这一课教你在 WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）的 Linux 环境里安装 CUDA Toolkit。装好之后，你的系统就能在 GPU（Graphics Processing Unit，图形处理器）上编译和运行代码了。这些步骤以 2026 年 10 月 NVIDIA 的安装指南为准。

## 匹配你的平台

CUDA 的安装必须和你的平台完全匹配。在 WSL 上，要使用 NVIDIA 的 WSL-Ubuntu 软件源。里面的软件包只有 Toolkit，没有 Linux 驱动程序，所以不会覆盖来自 Windows 的驱动。在原生 Ubuntu 上，你则要用对应 Ubuntu 版本的软件源，比如 Ubuntu 24.04 用 `ubuntu2404`。

## 先检查 GPU

安装 CUDA 之前，先确认你的系统能看到 GPU：

```bash
nvidia-smi
```

- `nvidia-smi` 是 NVIDIA 的命令行工具，通过驱动程序查询 GPU 的信息，会打印 GPU 名称、驱动程序版本和显存使用情况。
- 在 WSL 里它同样可用，因为驱动程序位于 Windows 一侧。WSL 把这个工具从 Windows 映射到 `/usr/lib/wsl/lib` 下。

如果这条命令失败，先停下来，把 GPU 环境修好。没有它，CUDA 无法工作，因为 Toolkit 要通过驱动程序和 GPU 通信。

## 从 NVIDIA 软件源安装

使用 NVIDIA 官方为 WSL 提供的软件源。里面是当前的 Toolkit，专门为配合共享驱动程序而构建。

> [!WARNING]
> 不要用 `apt install nvidia-cuda-toolkit`。那是 Ubuntu 自己的软件包，版本落后很多：在 Ubuntu 24.04 上它是 CUDA 12.0。

运行下面这些命令。它们先让包管理器知道 NVIDIA 的软件源，再从中安装 Toolkit。

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-3
```

- `wget` 从 URL 下载文件。地址中的 `wsl-ubuntu/x86_64` 部分，选择的是适用于 WSL、64 位 Intel 或 AMD CPU（Central Processing Unit，中央处理器）的软件源。
- `cuda-keyring_1.1-1_all.deb` 是一个很小的软件包。它包含 NVIDIA 的签名密钥和软件源地址，让你的系统信任 NVIDIA 的软件包。
- `sudo` 以管理员权限运行命令。安装软件包会改动系统，所以需要管理员权限。
- `dpkg -i` 安装一个本地的 `.deb` 文件，这里安装的是 keyring。
- `apt-get update` 刷新软件包列表。不运行它，apt 就不知道新软件源里有哪些软件包。
- `apt-get -y install` 安装一个软件包。`-y` 会自动对确认问题回答“yes”。
- `cuda-toolkit-13-3` 是 CUDA 13.3 的 Toolkit 软件包。名字里就写着版本：`13-3` 表示 13.3，文件会装到 `/usr/local/cuda-13.3`。它只包含 Toolkit，所以不会安装驱动程序。

这会安装 CUDA Toolkit 13.3，包括：

* CUDA 编译器（nvcc）
* CUDA 运行时
* 核心库

> [!NOTE]
> 最新的 CUDA 是 13.4，但在 2026 年 10 月，NVIDIA 的 WSL-Ubuntu 软件源只提供到 13.3。所以本页安装的是 `cuda-toolkit-13-3`。等那里出现 `cuda-toolkit-13-4`，只要改一下数字。在 WSL 里永远不要安装 `cuda` 或 `cuda-drivers` 软件包：它们会尝试安装 Linux 驱动程序。

## 验证安装

检查编译器是否已经安装，以及 shell 能否找到它：

```bash
nvcc --version
```

- `nvcc` 是 CUDA 编译器。
- `--version` 让它打印版本号后退出，不会编译任何东西。

输出的最后几行应该写着 release 13.3，因为你装的是 `cuda-toolkit-13-3`。

如果提示找不到命令，说明 PATH 没有设置正确。PATH 是 shell 查找程序时搜索的文件夹列表。把 CUDA 的文件夹加进去：

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export` 为当前 shell 以及它启动的程序设置一个变量。
- `/usr/local/cuda/bin` 是存放 `nvcc` 的文件夹。`/usr/local/cuda` 是指向已安装版本的链接，这里指向 `/usr/local/cuda-13.3`。
- `:$PATH` 把原来的列表接在新文件夹后面，原有内容一个都不会丢。shell 会先在 CUDA 文件夹里查找。

> [!TIP]
> 这个设置只对当前终端有效。想让它一直生效，就把它加到你的 `.bashrc` 或 `.zshrc` 里。另外，用 `sudo apt-get -y install build-essential` 装一个主机端编译器：`nvcc` 会把每个程序里 CPU 的部分交给 `g++`，而新装的 Ubuntu 里没有它。

<install-steps></install-steps>

## 为什么版本很重要

CUDA 和 GPU 架构紧密相关。每一代新架构都需要一个认识它的 CUDA 版本：

* Hopper 上的 FP8（8 位浮点），从 CUDA 11.8 起
* Blackwell 上的 FP4（4 位浮点），从 CUDA 12.8 起
* 库对 Rubin（计算能力 10.7）的支持，从 CUDA 13.4 起

如果你的 CUDA 版本不支持这些，代码照样能运行，但无法充分利用硬件，甚至根本无法面向最新的 GPU。

## 藏在其他工具底层的 CUDA

CUDA 很少单独使用，它通常运行在这些系统的底层：

* PyTorch
* TensorFlow
* Triton
* 自定义的 CUDA 核函数

用 `pip` 安装的 PyTorch 自带一份 CUDA 库，所以它只需要驱动程序。你自己写的核函数则需要本页安装的 Toolkit。

## 准备就绪

你的系统现在已经就绪，你拥有了：

* 一个 Linux 环境（WSL）
* GPU 访问
* CUDA Toolkit 13.3
* 一个可用的 CUDA 编译器

现在你可以编写并运行真正的 CUDA 程序了。本页的命令来自 [NVIDIA 面向 WSL-Ubuntu 的下载页面](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network)。

## 术语表

- Linux：免费、开源的操作系统；这里它通过 WSL 运行在 Windows 里。
- WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）：在 Windows 里运行一个真正的 Linux 系统，而 GPU 驱动程序留在 Windows 一侧。
- GPU（Graphics Processing Unit）：拥有成千上万个小核心的处理器，CUDA 程序就在它上面运行。
- Ubuntu：常用的 Linux 发行版；NVIDIA 为运行在 WSL 里的 Ubuntu 准备了单独的 CUDA 软件源（wsl-ubuntu）。
- 软件源（NVIDIA repository）：在线的软件包来源；NVIDIA 为 WSL 提供的软件源里只有 Toolkit，没有驱动程序。
- 原生 Ubuntu（native Ubuntu）：直接装在机器上、不在 WSL 里的 Ubuntu；它使用 `ubuntu2404` 这样的软件源。
- `nvidia-smi`：NVIDIA 的命令行工具，向驱动程序查询 GPU 名称、驱动程序版本和显存使用情况。
- 驱动程序（GPU driver）：让系统和 GPU 通信的软件；在 WSL 里它来自 Windows，所以永远不要在 Linux 里另装一个。
- apt（包管理器）：Ubuntu 的工具，从软件源下载软件包并安装，连同它们依赖的东西一起装好。
- `cuda-keyring_1.1-1_all.deb`：一个很小的软件包，包含 NVIDIA 的签名密钥和软件源地址，让你的系统信任 NVIDIA 的软件包。
- `sudo`：以管理员权限运行命令。安装软件包需要管理员权限。
- `apt-get update`：刷新软件包列表，让 apt 知道新软件源里有哪些软件包。
- `cuda-toolkit-13-3`：只包含 CUDA 13.3 Toolkit、不含驱动程序的软件包；在 WSL 里这是安全的选择。
- CPU（Central Processing Unit）：主处理器；`x86_64` 指 64 位的 Intel 或 AMD CPU。
- CUDA Toolkit：NVIDIA 用来构建 CUDA 程序的编译器、运行时和核心库，本页安装的是 13.3 版。
- 编译器（compiler）：把源代码变成处理器能运行的代码的程序。
- `nvcc`：CUDA 编译器。`nvcc --version` 会打印它的版本号，不会编译任何东西。
- shell：读取你在终端里输入的命令的程序，比如 bash 或 zsh。
- PATH：shell 查找程序的文件夹列表。
- `export`：为当前 shell 以及它启动的程序设置一个变量。
- `.bashrc`：每打开一个新终端，shell 都会运行的启动文件，所以写在里面的 export 行每次都会生效。
- `build-essential`：包含 `gcc`、`g++` 和 `make` 的 Ubuntu 软件包；`nvcc` 需要 `g++` 作为主机端编译器。
- 架构（architecture）：一个 GPU 系列的硬件设计，比如 Hopper 或 Blackwell；旧的 CUDA 版本不认识最新的架构。
- Hopper / Blackwell / Rubin：NVIDIA 2022、2024 和 2026 年的 GPU 架构；要用上它们的新功能，需要较新的 CUDA 版本。
- FP8 / FP4：8 位和 4 位浮点格式；Hopper 的 Tensor Core 加入了 FP8，Blackwell 的加入了 FP4。
- 计算能力（compute capability）：GPU 架构的版本号，比如 L40S 是 8.9，Rubin 是 10.7。
- CUDA 版本（CUDA version）：Toolkit 的版本号，比如 13.3，它决定了你的代码能用哪些 GPU 和功能。
- PyTorch：很流行的深度学习 Python 库，通过 CUDA 在 GPU 上做运算。
- TensorFlow：Google 的深度学习库，在 NVIDIA GPU 上同样使用 CUDA。
- Triton：OpenAI 推出的基于 Python 的语言，不用手写 CUDA C++ 就能写出快速的 GPU 核函数。
- `pip`：Python 的包安装工具；用它安装的 PyTorch 自带 CUDA 库。
- 核函数（kernel）：在 GPU 上运行的函数；自定义核函数就是你自己写的那些。
