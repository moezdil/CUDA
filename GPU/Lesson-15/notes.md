# 15 > Setting Up CUDA Development (A Modern Workflow with JetBrains)

This lesson explains how to set up a CUDA work environment. It uses JetBrains tools, mainly CLion, on top of the CUDA Toolkit. CLion has been free for non-commercial use, such as learning and open source, since May 2025.

## Why JetBrains and CLion

You need a setup you can use every day without fighting the tools. This repo builds that setup around CLion, an IDE (Integrated Development Environment).

The reason is how modern development works. GPU (Graphics Processing Unit) architectures and toolkits change fast. Projects are no longer tied to one platform. You might develop on Linux, test on a remote GPU and deploy somewhere else. An IDE tied to one system, like Visual Studio, limits this kind of work.

JetBrains tools are built around CMake (Cross-platform Make). CMake is a tool that describes how to build a project. A CMake project is not tied to one environment. You can build it on different systems with different compilers and keep the same structure. Real GPU systems are built this way.

## The CUDA Toolkit comes first

The CUDA Toolkit is the base of everything. Nothing builds without it. It gives you the compiler, the runtime and the libraries that talk to the GPU. It is not an editor. It is the layer that makes GPU execution possible.

This layer depends on the hardware. Hopper and Blackwell bring new instructions, new precision formats and new execution behavior. You need a recent CUDA version to use them. As of October 2026 the newest one is CUDA 13.4. Older versions may still work, but they will not use what the hardware can do. So the CUDA version you choose defines what your code can do.

## Where CLion fits

CLion sits on top of the toolkit. It does not replace or hide it. It gives you a clean place to write code and organize your project. When you build, CLion calls CMake, and CMake calls the CUDA compiler `nvcc`. Nothing hidden happens, so you always know what is going on.

<toolchain-stack></toolchain-stack>

CMake knows CUDA as a language. A minimal `CMakeLists.txt` for one CUDA file looks like this:

```cmake
cmake_minimum_required(VERSION 3.24)
project(hello LANGUAGES CXX CUDA)
set(CMAKE_CUDA_ARCHITECTURES 89)
add_executable(hello hello.cu)
```

`CMAKE_CUDA_ARCHITECTURES 89` is the same target as `nvcc -arch=sm_89`: compute capability 8.9, the L40S used in these lessons. For a Hopper H100 you would write `90`, for a Blackwell B200 `100`.

## Visual Studio on Windows

> [!NOTE]
> On Windows, `nvcc` needs the MSVC (Microsoft Visual C++) compiler, even if you never open Visual Studio. CUDA 13.4 works with Visual Studio 2019, 2022 and 2026. So Visual Studio is a dependency, not your workspace. You install it once and then forget it.

All your real work happens in CLion.

## The GPU driver

CUDA depends on the GPU driver. Since CUDA 13.1 on Windows and CUDA 13.4 on Linux, the toolkit installer no longer includes a driver. You install the driver yourself and keep it up to date.

Each CUDA release has a driver branch. A driver from branch 580 or newer runs programs built with any CUDA 13.x. To use the new features of CUDA 13.4, you need branch 615 or newer. So a 575 driver cannot run a CUDA 13 program, a 580 driver runs it, and a 615 driver also gives you everything new in 13.4.

> [!WARNING]
> If the driver is too old, you can get problems that are hard to explain. Code may compile but fail when it runs. Some features may not be available.

## The workflow

With everything in place, the workflow is simple:

- You open CLion and write your code.
- You build with CMake.
- The CUDA Toolkit compiles it.
- The GPU runs it.

When the setup is right, these steps work together smoothly.

## Summary

CUDA development is not about choosing an editor. It is about understanding the toolchain. JetBrains tools fit well because they let each part of the system do its own job. This makes the setup cleaner, more stable and closer to production. This repo uses this setup.

## Glossary

- JetBrains: the company behind CLion, PyCharm, IntelliJ IDEA and other development tools.
- CLion: a JetBrains IDE for C, C++ and CUDA. It sits on top of the CUDA Toolkit and is free for non-commercial use.
- IDE (Integrated Development Environment): one app that combines an editor, build tools and a debugger.
- GPU (Graphics Processing Unit): the processor with thousands of small cores that CUDA programs run on.
- architecture: the hardware design of a GPU family, such as Hopper or Blackwell; newer ones need newer toolkits and drivers.
- Linux: the operating system that most GPU servers run, and the best supported platform for CUDA.
- remote GPU: a GPU in another machine, such as a cloud server, that you use over the network.
- CMake (Cross-platform Make): a tool that describes how to build a project. It is not tied to one environment.
- `CMakeLists.txt`: the file in which CMake reads how to build your project.
- `CMAKE_CUDA_ARCHITECTURES`: the CMake setting for the compute capability to compile for, such as 89 for `sm_89`.
- compute capability: the version number of a GPU architecture, such as 8.9 for the L40S or 9.0 for the H100.
- build: turning source files into a program you can run, by compiling and linking them.
- compiler: a program that turns source code into code a processor can run; for CUDA it is `nvcc`.
- toolkit (CUDA Toolkit): the base layer with the compiler, the runtime and the libraries that talk to the GPU.
- runtime: the CUDA library your program calls while it runs, to manage GPU memory and launch work on the GPU.
- libraries: ready-made, tested code that ships with the toolkit, such as cuBLAS for matrix math.
- Hopper / Blackwell: NVIDIA's architectures from 2022 and 2024, which need recent CUDA versions for their new features.
- precision: how many bits each number uses, such as FP32, FP16 or FP8.
- CUDA version: the release number of the toolkit, such as 13.4; it decides which GPUs and features you can target.
- toolchain: the chain of tools that builds your code. CLion calls CMake, and CMake calls the CUDA compiler.
- Visual Studio: Microsoft's IDE for Windows; CUDA needs it installed because of its C++ compiler.
- MSVC (Microsoft Visual C++): the C++ compiler from Visual Studio; on Windows, `nvcc` hands the CPU (Central Processing Unit) part of your code to it.
- dependency: something another program needs to have installed in order to work.
- driver (GPU driver): the software that lets the operating system talk to the GPU; installed separately from the toolkit.
- driver branch: a driver release line such as 580 or 615; each CUDA release needs a minimum branch.
- production: the real environment where finished software runs for its users.
