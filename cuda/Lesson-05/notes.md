# 05 > The CUDA Platform Stack

Lessons 00 to 04 used one small part of CUDA, a kernel written in C/C++ and compiled with `nvcc`. This lesson steps back and shows the whole platform as it ships with CUDA Toolkit 13. Knowing the layers helps you see where each new tool or library you meet later fits in.

## The Five Layers

The CUDA platform has five layers. The languages you write in sit at the top, the GPU hardware sits near the bottom, and the AI libraries build on all of them. Click a layer or an item to read about it.

<cuda-stack></cuda-stack>

1. Programming languages are how you write GPU code.
2. Development tools find slow parts and bugs.
3. The compiler toolchain turns your source code into GPU instructions.
4. Hardware capabilities are the special units and features of the GPU itself.
5. The AI framework layer holds ready-made libraries that deep learning frameworks use.

## Programming Languages

- CUDA C/C++ is the main language for writing kernels. Lessons 00 to 04 all used it.
- CUDA Fortran lets Fortran programmers write kernels in Fortran instead of C++.
- OpenACC works the other way. You add short annotations to normal C, C++ or Fortran loops, and the compiler turns those loops into GPU code. You never write a kernel by hand.
- Python reaches the GPU through libraries. CuPy gives you NumPy-style arrays that live on the GPU. Numba compiles Python functions into GPU kernels. NVIDIA's own CUDA Python packages (`cuda-python`) give Python direct access to the CUDA driver and runtime APIs.

All of them end up running on the same GPU hardware, with the same blocks, threads and warps you met in Lessons 00 to 04.

## Development Tools

- Nsight Systems records a timeline of CPU and GPU work for the whole program. It shows where the time goes, for example whether the GPU sits idle while the CPU copies data.
- Nsight Compute looks at one kernel in detail and shows how well it uses the hardware.
- Compute Sanitizer runs the program and reports memory errors inside kernels, such as a thread that writes past the end of an array.

> [!TIP]
> Start with Nsight Systems to find the slow part of a program, then use Nsight Compute on that one kernel. Measuring a kernel that only takes 1% of the run time is wasted effort.

## Compiler Toolchain

`nvcc` compiles `.cu` files. Every lesson so far used it in the compile step. It splits the file in two.

- Host code, the part that runs on the CPU, goes to the normal C++ compiler, which is `gcc` or `clang` on Linux and MSVC on Windows.
- Device code, the kernels, is compiled by NVIDIA's own tools in two stages. First it becomes PTX, a virtual instruction set that is not tied to one GPU. Then PTX becomes SASS, the real machine instructions of one GPU generation.

<nvcc-pipeline></nvcc-pipeline>

The program file can hold both the SASS and the PTX. When the program starts, the driver picks the SASS that fits the GPU. If there is none, it compiles the PTX into SASS on the spot. This is called JIT compilation.

As a worked example, Lesson 06 builds with `-arch=sm_89`. That stores SASS and PTX for compute capability 8.9 in the program.

- On the L40S (CC 8.9), the driver runs the stored SASS directly.
- On a newer GPU, for example one with CC 12.0, there is no SASS for 12.0. The driver compiles the stored PTX into SASS for CC 12.0 at startup, and the program still runs.
- On an older GPU, for example one with CC 8.0, neither fits, because PTX for CC 8.9 may use features that CC 8.0 does not have. The program fails to launch its kernels.

> [!NOTE]
> JIT compilation takes time when the program starts, and the driver can only use the features of the PTX version it was given. For the best speed on a GPU, build SASS for that GPU's compute capability (Lesson 03).

## Hardware Capabilities

- Tensor Cores are units inside each SM built for matrix math. They are separate from the FP32 cores you counted in Lesson 03, and much faster for matrix work in smaller number formats such as FP16 and FP8. Deep learning uses them heavily.
- MIG splits one data center GPU into up to seven isolated parts. Each part has its own SMs and memory and acts like its own GPU. For example, an 80 GB A100 can be split into seven parts of about 10 GB each, so seven users share one card without slowing each other down.
- Dynamic Parallelism lets a running kernel launch another kernel from the GPU. In Lessons 00 to 04 only the CPU launched kernels. Dynamic Parallelism moves that step onto the GPU, so a kernel can start more work without a round trip to the CPU.
- GPUDirect lets GPUs move data to each other, to a network card, or to storage directly, without a detour through CPU memory.
- NVLink is NVIDIA's fast direct link between GPUs. It is much faster than PCIe, the normal slot a GPU sits in.

Smaller number formats matter because they save memory and time. One FP32 number takes 4 bytes, one FP16 number 2 bytes, and one FP8 number 1 byte. A model with 1 billion numbers needs 4 GB in FP32, 2 GB in FP16 and 1 GB in FP8. A Tensor Core also does more FP8 math per second than FP16 math.

> [!NOTE]
> Not every GPU has every feature. The L40S used in these lessons has FP8 Tensor Cores, but no MIG, no NVLink, and GDDR6 memory instead of the HBM of GPUs such as the H100 and B200. Check the data sheet of your own GPU.

## AI Framework Layer

- cuBLAS is NVIDIA's library for matrix and vector math on the GPU. It ships with the CUDA Toolkit.
- cuDNN is a library of GPU operations for deep learning, such as convolutions and attention. PyTorch and TensorFlow call it under the hood.
- TensorRT takes a trained model and rebuilds it to run as fast as possible on one specific GPU.
- NCCL, pronounced "nickel", moves data between GPUs, for example to add up results from eight GPUs that train one model together. It uses NVLink and GPUDirect when they are available.

You rarely call these libraries yourself when you use PyTorch. They are still the reason a single line of PyTorch code can run fast on the GPU.

## Glossary

- CUDA (Compute Unified Device Architecture): NVIDIA's platform for running general programs on the GPU.
- CUDA Fortran: Fortran with extensions for writing GPU kernels.
- OpenACC (Open Accelerators): annotations for C, C++ and Fortran loops that let the compiler create GPU code for you.
- CuPy: Python library with NumPy-style arrays on the GPU.
- Numba: Python compiler that can turn Python functions into GPU kernels.
- CUDA Python (`cuda-python`): NVIDIA's Python packages for direct access to the CUDA driver and runtime APIs.
- API (Application Programming Interface): the set of functions a library offers to your code.
- `nvcc` (NVIDIA CUDA Compiler): the CUDA compiler. It handles host and device code in the same `.cu` file.
- MSVC (Microsoft Visual C++): the C++ compiler `nvcc` uses for host code on Windows.
- PTX (Parallel Thread Execution): the virtual instruction set device code is compiled to first. It is not tied to one GPU.
- SASS (Streaming ASSembler): the real machine code for one GPU generation.
- JIT (just-in-time) compilation: the driver compiles PTX into SASS when the program starts, if no matching SASS is stored.
- Nsight Systems: profiler that shows a timeline of CPU and GPU work for the whole program.
- Nsight Compute: profiler that measures how well one kernel uses the GPU hardware.
- Compute Sanitizer: tool that finds memory errors inside kernels while the program runs.
- annotation: a short note added to normal code that tells the compiler what to do with it, for example to run a loop on the GPU.
- compute capability (CC): the version number of a GPU generation, such as 8.9 for the L40S. It decides which features and machine code the GPU supports.
- SM (Streaming Multiprocessor): one of the processor blocks a GPU is built from. Each SM has its own cores, Tensor Cores and fast on-chip memory.
- GB (gigabyte): about one billion bytes.
- Tensor Core: matrix math unit inside each SM. Much faster than the FP32 cores for matrix work.
- FP32 / FP16 / FP8 (32-, 16- and 8-bit floating point): 32-, 16- and 8-bit floating point numbers. They take 4, 2 and 1 bytes.
- MIG (Multi-Instance GPU): splits one physical GPU into up to seven isolated parts. Each part acts as its own GPU.
- Dynamic Parallelism: a kernel on the GPU can launch another kernel without going back to the CPU.
- GPUDirect: lets GPUs move data to each other, to a network card or to storage without going through CPU memory.
- NVLink: NVIDIA's fast direct connection between GPUs.
- PCIe (Peripheral Component Interconnect Express): the standard slot and bus that connects a GPU to the rest of the computer.
- HBM (High Bandwidth Memory): very fast GPU memory used on data center GPUs such as the H100 and B200.
- cuBLAS (CUDA Basic Linear Algebra Subprograms): NVIDIA's GPU library for matrix and vector math.
- cuDNN (CUDA Deep Neural Network library): library of GPU operations for deep learning. PyTorch and TensorFlow use it under the hood.
- TensorRT: makes a trained model run fast on a specific GPU.
- NCCL (NVIDIA Collective Communications Library): library for moving data between GPUs. Used for training on many GPUs.
- GPU (Graphics Processing Unit): the processor that runs kernels, with thousands of small cores.
- CPU (Central Processing Unit): the main processor. It runs host code and launches kernels.
- AI (Artificial Intelligence): software that learns from data. Today it mostly means deep learning models, which are trained and run on GPUs.
