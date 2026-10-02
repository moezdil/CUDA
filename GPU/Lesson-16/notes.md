# 16 > Running Linux on Windows (A Practical Setup with WSL)

This lesson explains how to run Linux inside Windows with WSL (Windows Subsystem for Linux). It also shows how the GPU (Graphics Processing Unit) and CUDA work inside WSL, and where the limits are.

## Why Linux

Serious CUDA work usually leads to Linux. Windows still works, but the GPU ecosystem has been built around Linux for years. Most tools, docs and real deployments expect Linux. GPU systems for AI (Artificial Intelligence) and HPC (High-Performance Computing) almost always run Linux.

## What WSL is

WSL runs a real Linux environment inside Windows. It is not an emulation layer like older solutions. WSL2 runs a real Linux kernel in a small, lightweight virtual machine. This makes a big difference in behavior, compatibility and performance.

## Install WSL

Open a terminal on Windows, such as PowerShell, and run:

```bash
wsl --install
wsl --update
```

- `wsl --install` turns on WSL and installs Ubuntu, the default distribution.
- `wsl --update` brings the WSL kernel to the newest version.

Always use WSL2. WSL1 has lower compatibility and no GPU support at all. New installs use WSL2 by default. To check, run `wsl -l -v`: the VERSION column must show 2 for your distribution.

## First start

When you start your Linux distribution the first time, you create a username and password. This is a separate Linux environment on the same machine, not your Windows environment. It has its own users, its own file system and its own package manager. From now on, you work in two systems at once.

## GPU access

With WSL2, Linux can use the GPU through the Windows driver. CUDA apps run inside WSL almost like on a native Linux system. So you can develop in Linux and still use Windows as your main system.

The GPU driver is installed on the Windows side, not inside WSL. You install the normal NVIDIA driver for Windows, and WSL uses that driver from the host. Inside WSL, the CUDA driver shows up as a library called `libcuda.so`, mapped in from Windows.

> [!WARNING]
> Never install a Linux NVIDIA driver inside WSL. It overwrites the driver mapped in from Windows and breaks GPU access.

<wsl-layers></wsl-layers>

## Installing CUDA in WSL

Inside WSL, you install the Linux version of the CUDA Toolkit, not the Windows one. NVIDIA has a separate WSL-Ubuntu repository for it. Its packages contain the toolkit but no driver, so they cannot overwrite the driver from the host. So the install looks like normal Linux, but it is not the same. [Lesson 17](../Lesson-17/notes.md) walks through it.

## Limits of WSL

WSL is a serious development environment. Still, a few things work differently from native Linux:

- GPU support needs a GeForce or RTX card in WDDM (Windows Display Driver Model) mode, the normal mode for a desktop card. Data center GPUs are not supported.
- Unified memory is limited. The CPU (Central Processing Unit) and the GPU cannot access the same managed memory at the same time.
- `nvidia-smi` cannot show every value, for example GPU utilization.

Also check that your GPU fits CUDA 13. WSL itself works with Pascal and newer, but CUDA 13 needs compute capability 7.5 or higher. A GeForce GTX 1080 is compute capability 6.1, and 6.1 is below 7.5, so CUDA 13 cannot build code for it. A GeForce RTX 2060 is compute capability 7.5, so it works.

> [!TIP]
> When something breaks, check the layers from the bottom up: the Windows driver, then WSL itself (`wsl --update`), then the Linux distribution, then the CUDA Toolkit.

## Summary

WSL is a practical bridge. You stay in Windows and use Linux-based GPU tools in a way close to real production systems. It is one of the most natural ways to start.

> [!NOTE]
> From here on, these lessons work only inside Linux. Windows appears only as the host that holds the driver.

## Glossary

- Linux: a free, open-source operating system; most GPU servers and CUDA tools are built around it.
- GPU (Graphics Processing Unit): the processor with thousands of small cores that CUDA programs run on.
- ecosystem: all the tools, libraries, docs and drivers that grow around a platform such as the GPU.
- AI (Artificial Intelligence): software that learns from data, such as language models; most of it is trained on GPUs.
- HPC (High-Performance Computing): many powerful processors working together on big problems, such as weather or physics simulations.
- WSL (Windows Subsystem for Linux): runs a real Linux environment inside Windows.
- emulation: software that imitates another system instead of running it for real, which is usually slower and less compatible.
- WSL2: the WSL version that runs a real Linux kernel. It is the base for CUDA on Windows.
- Linux kernel: the core of the Linux operating system that manages memory, processes and hardware; not the same as a CUDA kernel.
- virtual machine: a complete computer simulated in software, with its own operating system, running on a real machine.
- terminal: a text window where you type commands, such as PowerShell or Windows Terminal.
- `wsl --install`: the command you run in a Windows terminal to install WSL and Ubuntu.
- `wsl --update`: updates the WSL kernel to the newest version.
- WSL1: the older WSL version with lower compatibility and no GPU support.
- Linux distribution: a separate Linux environment with its own users, file system and package manager; Ubuntu is the usual choice for CUDA.
- file system: the way an operating system stores and organizes files; a WSL distribution has its own, separate from the Windows drives.
- package manager: a tool that installs and updates software from online lists, such as apt on Ubuntu.
- driver (GPU driver): the software that lets the operating system talk to the GPU; for WSL it is installed only on the Windows side.
- native Linux: Linux installed directly on the machine, not running inside another system.
- host: the Windows system WSL runs on. WSL uses its GPU driver and needs no NVIDIA driver of its own.
- `libcuda.so`: the CUDA driver library; inside WSL it is mapped in from the Windows driver.
- CUDA Toolkit: NVIDIA's compiler, libraries and tools; inside WSL you install the Linux version from the WSL-Ubuntu repository.
- WSL-Ubuntu repository: NVIDIA's package source for CUDA in WSL; its packages hold the toolkit without a driver.
- WDDM (Windows Display Driver Model): the normal Windows driver mode for desktop graphics cards; WSL GPU support needs it.
- unified memory: memory that the CPU and the GPU share through one pointer; only partly supported in WSL.
- CPU (Central Processing Unit): the main processor of the computer.
- `nvidia-smi`: NVIDIA's command line tool that shows the GPU, the driver and the memory use.
- compute capability: the version number of a GPU architecture, such as 7.5 for Turing; CUDA 13 needs 7.5 or higher.
- Pascal: NVIDIA's 2016 architecture, such as the GTX 1080; WSL runs it, CUDA 13 cannot build for it.
- production: the real systems where finished software runs for its users.
