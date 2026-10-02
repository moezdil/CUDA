# Running Linux on Windows (A Practical Setup with WSL)

This lesson explains how to run Linux inside Windows with WSL. It also shows how the GPU and CUDA work inside WSL.

## Why Linux

Serious CUDA work usually leads to Linux. Windows still works, but the GPU ecosystem has been built around Linux for years. Most tools, docs and real deployments expect Linux. In 2026, modern GPU systems for AI and high-performance computing almost always use Linux.

## What WSL is

WSL (Windows Subsystem for Linux) runs a real Linux environment inside Windows. It is not an emulation layer like older solutions. WSL2 runs a real Linux kernel. This makes a big difference in behavior, compatibility and performance. Many development workflows now use WSL.

## Install WSL

Open a terminal on Windows and run one command: `wsl --install`

As of 2026, always use WSL2, because WSL1 has lower compatibility and no useful GPU acceleration. WSL2 is built for modern workloads and is the base for CUDA on Windows. Without WSL2, many GPU features will not work as expected.

## First start

When you start your Linux distribution the first time, you create a username and password. This is a separate Linux environment on the same machine, not your Windows environment. It has its own users, its own file system and its own package manager. From now on, you work in two systems at once.

## GPU access

With WSL2, Linux can use the GPU through the Windows driver. CUDA apps run inside WSL almost like on a native Linux system. So you can develop in Linux and still use Windows as your main system.

The GPU driver is installed on the Windows side, not inside WSL. WSL uses the driver of the host system. It does not need its own NVIDIA driver. Keep this separation in mind for a stable setup.

> [!WARNING]
> Installing a Linux GPU driver inside WSL usually causes conflicts, so do not do it.

<wsl-layers></wsl-layers>

## Installing CUDA in WSL

Inside WSL, you install the Linux version of the CUDA Toolkit, not the Windows one. But WSL uses special packages. They work with the shared driver and avoid conflicts with the host. So the install looks like normal Linux, but it is not the same.

## WSL in 2026

WSL is now a serious development environment, not just a convenience tool. CUDA 12.x and the new 13.x series fully support Hopper and Blackwell inside WSL. GPU access is stable, memory handling is better and container support is more consistent. In many cases, WSL is now close to a native Linux setup.

Still, keep your expectations realistic. WSL has several layers. A problem can come from Windows config, WSL itself, the Linux distribution or the CUDA setup. Fixing these problems is part of learning how the system works.

## Summary

WSL is a practical bridge. You stay in Windows and use Linux-based GPU tools in a way close to real production systems. It is one of the most natural ways to start.

> [!NOTE]
> This was just for general info. The name “windows” will not be used in this repo under any circumstances.

## Glossary

- Linux: a free, open-source operating system; most GPU servers and CUDA tools are built around it.
- ecosystem: all the tools, libraries, docs and drivers that grow around a platform such as the GPU.
- high-performance computing (HPC): many powerful processors working together on big problems, such as weather or physics simulations.
- WSL: Windows Subsystem for Linux. It runs a real Linux environment inside Windows.
- emulation: software that imitates another system instead of running it for real, which is usually slower and less compatible.
- WSL2: the WSL version that runs a real Linux kernel. It is the base for CUDA on Windows.
- Linux kernel: the core of the Linux operating system that manages memory, processes and hardware; not the same as a CUDA kernel.
- terminal: a text window where you type commands, such as PowerShell or Windows Terminal.
- `wsl --install`: the one command you run in a Windows terminal to install WSL.
- WSL1: the older WSL version with lower compatibility and no useful GPU acceleration.
- GPU acceleration: running work on the GPU so it finishes faster than on the CPU alone.
- Linux distribution: a separate Linux environment with its own users, file system and package manager; Ubuntu is the usual choice for CUDA.
- file system: the way an operating system stores and organizes files; a WSL distribution has its own, separate from the Windows drives.
- package manager: a tool that installs and updates software from online lists, such as apt on Ubuntu.
- driver (GPU driver): the software that lets the operating system talk to the GPU; for WSL it is installed only on the Windows side.
- native Linux: Linux installed directly on the machine, not running inside another system.
- host: the Windows system WSL runs on. WSL uses its GPU driver and needs no NVIDIA driver of its own.
- CUDA Toolkit: NVIDIA's compiler, libraries and tools; inside WSL you install the Linux version made for WSL.
- special packages: Linux CUDA packages made for WSL that work with the shared driver and avoid conflicts with the host.
- Hopper / Blackwell: Nvidia's GPU architectures from 2022 and 2024, fully supported in WSL by CUDA 12.x and 13.x.
- container: an app packed together with all its libraries that runs isolated from the rest of the system, for example with Docker.
- production: the real systems where finished software runs for its users.
