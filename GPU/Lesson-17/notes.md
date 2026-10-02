# 17 > Installing CUDA Toolkit on Linux

This lesson shows how to install the CUDA Toolkit on Linux in WSL (Windows Subsystem for Linux). After this, your system can compile and run code on the GPU (Graphics Processing Unit). The steps follow NVIDIA's installation guide as of October 2026.

## Match your platform

A CUDA install must match your platform exactly. On WSL, use NVIDIA's WSL-Ubuntu repository. Its packages hold the toolkit without a Linux driver, so they cannot overwrite the driver that comes from Windows. On native Ubuntu you would use the repository for your Ubuntu version instead, such as `ubuntu2404` for Ubuntu 24.04.

## Check the GPU first

Before you install CUDA, make sure your system can see the GPU:

```bash
nvidia-smi
```

- `nvidia-smi` is NVIDIA's command line tool that asks the driver about the GPU. It prints the GPU name, the driver version and the memory use.
- In WSL it works because the driver lives on the Windows side. WSL maps the tool in from Windows, under `/usr/lib/wsl/lib`.

If this command fails, stop and fix your GPU setup first. CUDA will not work without it, because the toolkit talks to the GPU through the driver.

## Install from the NVIDIA repository

Use the official NVIDIA repository for WSL. It has current toolkits, built to work with the shared driver.

> [!WARNING]
> Do not use `apt install nvidia-cuda-toolkit`. That is Ubuntu's own package, and it lags far behind: on Ubuntu 24.04 it is CUDA 12.0.

Run these commands. They first tell the package manager about NVIDIA's repository, then install the toolkit from it.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-3
```

- `wget` downloads a file from a URL. The `wsl-ubuntu/x86_64` part of the address picks the repository for WSL on a 64-bit Intel or AMD CPU (Central Processing Unit).
- `cuda-keyring_1.1-1_all.deb` is a small package. It holds NVIDIA's signing key and the address of the repository, so your system trusts NVIDIA's packages.
- `sudo` runs a command with admin rights. Installing packages changes the system, so it needs them.
- `dpkg -i` installs a local `.deb` file, here the keyring.
- `apt-get update` refreshes the package lists. Without it, apt does not know about the packages in the new repository.
- `apt-get -y install` installs a package. `-y` answers "yes" to the confirmation question.
- `cuda-toolkit-13-3` is the toolkit package for CUDA 13.3. The name encodes the version: `13-3` means 13.3, and the files land in `/usr/local/cuda-13.3`. It holds only the toolkit, which is why no driver is installed.

This installs CUDA Toolkit 13.3. It includes:

* CUDA compiler (nvcc)
* CUDA runtime
* core libraries

> [!NOTE]
> The newest CUDA is 13.4, but in October 2026 NVIDIA's WSL-Ubuntu repository goes up to 13.3. That is why this page installs `cuda-toolkit-13-3`. When `cuda-toolkit-13-4` appears there, change only the number. Never install the `cuda` or `cuda-drivers` packages in WSL: they try to install a Linux driver.

## Verify the install

Check that the compiler is installed and that your shell can find it:

```bash
nvcc --version
```

- `nvcc` is the CUDA compiler.
- `--version` makes it print its version and exit, without compiling anything.

The last lines of the output should name release 13.3, because you installed `cuda-toolkit-13-3`.

If the command is not found, your PATH is not set correctly. PATH is the list of folders where the shell looks for programs. Add the CUDA folder to it:

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export` sets a variable for this shell and for the programs it starts.
- `/usr/local/cuda/bin` is the folder that holds `nvcc`. `/usr/local/cuda` is a link to the installed version, here `/usr/local/cuda-13.3`.
- `:$PATH` adds the old list after the new folder, so nothing is lost. The shell searches the CUDA folder first.

> [!TIP]
> The setting lasts only for the current terminal. To keep it, add it to your `.bashrc` or `.zshrc`. Also install a host compiler with `sudo apt-get -y install build-essential`: `nvcc` hands the CPU part of every program to `g++`, and a fresh Ubuntu does not have it.

<install-steps></install-steps>

## Why the version matters

CUDA is closely tied to GPU architecture. Each new architecture needs a CUDA version that knows it:

* FP8 (8-bit floating point) on Hopper, since CUDA 11.8
* FP4 (4-bit floating point) on Blackwell, since CUDA 12.8
* Rubin (compute capability 10.7) in the libraries, since CUDA 13.4

If your CUDA version does not support them, your code still runs but does not use the hardware well, or cannot target the newest GPU at all.

## CUDA under other tools

CUDA is rarely used alone. It runs under systems such as:

* PyTorch
* TensorFlow
* Triton
* custom CUDA kernels

PyTorch installed with `pip` brings its own copy of the CUDA libraries, so it only needs the driver. Your own kernels need the toolkit from this page.

## Ready

Your system is now ready. You have:

* a Linux environment (WSL)
* GPU access
* CUDA Toolkit 13.3
* a working CUDA compiler

Now you can write and run real CUDA programs. The commands on this page come from [NVIDIA's download page for WSL-Ubuntu](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network).

## Glossary

- Linux: a free, open-source operating system; here it runs inside Windows through WSL.
- WSL (Windows Subsystem for Linux): runs a real Linux system inside Windows, while the GPU driver stays on the Windows side.
- GPU (Graphics Processing Unit): the processor with thousands of small cores that CUDA programs run on.
- Ubuntu: a popular Linux distribution; NVIDIA has a separate CUDA repository for Ubuntu running in WSL (wsl-ubuntu).
- repository (NVIDIA repository): an online source of packages; NVIDIA's one for WSL has the toolkit without a driver.
- native Ubuntu: Ubuntu installed directly on the machine, not inside WSL; it uses a repository such as `ubuntu2404`.
- `nvidia-smi`: NVIDIA's command line tool that asks the driver for the GPU name, driver version and memory use.
- driver (GPU driver): the software that lets the system talk to the GPU; in WSL it comes from Windows, so you never install one inside Linux.
- apt (package manager): Ubuntu's tool that downloads packages from repositories and installs them, together with what they depend on.
- `cuda-keyring_1.1-1_all.deb`: a small package with NVIDIA's signing key and repository address, so your system trusts NVIDIA's packages.
- `sudo`: runs a command with admin rights. Installing packages needs them.
- `apt-get update`: refreshes the package lists so apt knows about the packages in the new repository.
- `cuda-toolkit-13-3`: the package with only the CUDA 13.3 toolkit, no driver; the safe choice in WSL.
- CPU (Central Processing Unit): the main processor; `x86_64` means a 64-bit Intel or AMD CPU.
- CUDA Toolkit: NVIDIA's compiler, runtime and core libraries for building CUDA programs, version 13.3 on this page.
- compiler: a program that turns source code into code a processor can run.
- `nvcc`: the CUDA compiler. `nvcc --version` prints its version without compiling anything.
- shell: the program that reads the commands you type in a terminal, such as bash or zsh.
- PATH: the list of folders where the shell looks for programs.
- `export`: sets a variable for this shell and for the programs it starts.
- `.bashrc`: a startup file the shell runs in every new terminal, so an export line placed there is set every time.
- `build-essential`: the Ubuntu package with `gcc`, `g++` and `make`; `nvcc` needs `g++` as its host compiler.
- architecture: the hardware design of a GPU family, such as Hopper or Blackwell; old CUDA versions do not know the newest ones.
- Hopper / Blackwell / Rubin: NVIDIA's GPU architectures from 2022, 2024 and 2026; each needs a recent CUDA version for its new features.
- FP8 / FP4: 8-bit and 4-bit floating-point formats; Hopper's Tensor Cores added FP8, Blackwell's added FP4.
- compute capability: the version number of a GPU architecture, such as 8.9 for the L40S or 10.7 for Rubin.
- CUDA version: the toolkit release number, such as 13.3, which decides which GPUs and features your code can use.
- PyTorch: a popular Python library for deep learning that runs its math on the GPU through CUDA.
- TensorFlow: Google's deep learning library, which also uses CUDA on NVIDIA GPUs.
- Triton: a Python-based language from OpenAI for writing fast GPU kernels without writing CUDA C++ by hand.
- `pip`: Python's package installer; PyTorch installed with it ships its own CUDA libraries.
- kernel: a function that runs on the GPU; custom kernels are the ones you write yourself.
