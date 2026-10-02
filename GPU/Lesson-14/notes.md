# 14 > CUDA Toolkit, The Foundation of GPU Programming

This lesson explains what the CUDA Toolkit is and what it gives you. It is the environment you use to write, compile, run and study programs on a GPU (Graphics Processing Unit). As of October 2026 the newest release is CUDA 13.4.

## What CUDA is

CUDA (Compute Unified Device Architecture) is NVIDIA's platform for parallel computing. It connects your code to the GPU. Without it, you cannot fully control an NVIDIA GPU.

## The compiler: nvcc

The center of the toolkit is the compiler, `nvcc` (NVIDIA CUDA Compiler). It turns your CUDA code into code the GPU can run.

This happens in two steps. First your code becomes an intermediate form, PTX (Parallel Thread Execution). Then PTX becomes machine code, called SASS (Streaming Assembler), for one specific GPU architecture.

<nvcc-pipeline></nvcc-pipeline>

You name that architecture with its compute capability. The flag `-arch=sm_89` means compute capability 8.9: major version 8, minor version 9. That is the Ada generation, for example the L40S. A Hopper H100 is `sm_90` (9.0), a Blackwell B200 is `sm_100` (10.0).

Architectures such as Ampere, Hopper and Blackwell have different instructions, data types and execution models. So you must compile for the correct architecture. The same code may run on different GPUs. But without the right compile target, it will not behave the same or reach the same speed.

## Libraries

The toolkit also gives you optimized libraries. They use the GPU well, so you do not have to write everything yourself. There are libraries for:

- linear algebra (cuBLAS)
- Fourier transforms (cuFFT)
- random number generation (cuRAND)
- sparse matrices (cuSPARSE)

For deep learning, NVIDIA has cuDNN. It is a separate download, not part of the toolkit.

These libraries get updates for new hardware. Recent CUDA versions support low precision formats such as FP8 (8-bit floating point) on Hopper and FP4 (4-bit floating point) on Blackwell. Modern AI (Artificial Intelligence) workloads use these formats.

## The runtime API

Your program talks to the GPU through the CUDA runtime API (Application Programming Interface). With explicit API calls, your program:

- allocates memory on the GPU
- moves data between the CPU (Central Processing Unit) and the GPU
- launches kernels

Data movement is often a main bottleneck in GPU programs. So knowing when and how data moves is as important as writing the kernel.

## Tools for profiling and debugging

You also need to see how your program behaves. The toolkit has tools for profiling, debugging and analyzing GPU apps: Nsight Systems, Nsight Compute, cuda-gdb and Compute Sanitizer. They measure performance, find bottlenecks and find memory problems. Large workloads make performance tuning a required part of development.

## Sample programs

NVIDIA also publishes sample programs. They show how memory is managed, how kernels are launched and how to improve performance. Since CUDA 11.6 they no longer ship inside the toolkit. You get them from the cuda-samples repository on GitHub. Studying them is a fast way to go from theory to real understanding.

## The toolkit follows the hardware

The toolkit is closely tied to GPU architecture. Each new architecture brings new hardware features, and the toolkit adds support for them.

- CUDA 13.0 came out in August 2025. CUDA 13.4 is the current release.
- CUDA 13 supports Turing (compute capability 7.5) and everything newer, including Blackwell (10.x and 12.x). CUDA 13.4 adds Rubin (10.7) to its libraries. Rubin data center GPUs began shipping in the second half of 2026.

> [!WARNING]
> CUDA 13.0 removed Maxwell, Pascal and Volta, every GPU below compute capability 7.5. CUDA 13 can no longer build code for them. For those GPUs you have to stay on CUDA 12.x.

> [!NOTE]
> The toolkit is no longer one fixed package. Its parts carry their own version numbers: in CUDA 13.4 Update 1, `nvcc` is version 13.4.92 but cuBLAS is version 13.8.0.4. The GPU driver is not bundled any more either, on Windows since CUDA 13.1 and on Linux since CUDA 13.4. You install the driver separately.

## Summary

The CUDA Toolkit is the complete environment for GPU programming. With it you write code, compile it, run it, analyze it and improve it. To work seriously with NVIDIA GPUs, you need to understand CUDA. Everything else is built on it.

## Glossary

- CUDA (Compute Unified Device Architecture): NVIDIA's platform for parallel computing. It connects your code to the GPU.
- GPU (Graphics Processing Unit): the processor with thousands of small cores that CUDA programs run on.
- parallel computing: splitting work into many pieces that run at the same time.
- toolkit (CUDA Toolkit): the complete environment to write, compile, run, analyze and improve GPU programs; version 13.4 is current.
- compiler: a program that turns source code into code a processor can run.
- `nvcc` (NVIDIA CUDA Compiler): the compiler at the center of the toolkit. It turns CUDA code into code the GPU can run.
- PTX (Parallel Thread Execution): the intermediate form `nvcc` makes first, before machine code for one GPU architecture.
- machine code: the binary instructions one specific processor runs directly; for NVIDIA GPUs it is called SASS (Streaming Assembler).
- architecture: the hardware design of a GPU family, such as Ampere, Hopper or Blackwell.
- compute capability: the version number of a GPU architecture, such as 8.9; `sm_89` is the same number written for `-arch`.
- Ampere / Hopper / Blackwell / Rubin: NVIDIA GPU architectures from 2020, 2022, 2024 and 2026, each with its own instructions and data types.
- compile target: the GPU architecture you compile for. The wrong one can change behavior and speed.
- libraries: ready-made, tested code you call from your program, such as cuBLAS or cuFFT.
- linear algebra: math with vectors and matrices, such as adding vectors or multiplying matrices.
- Fourier transforms: a way to split a signal into its frequencies, used in audio, imaging and physics.
- deep learning: AI built from neural networks with many layers; cuDNN is NVIDIA's library for it, downloaded separately.
- FP8 / FP4: 8-bit and 4-bit floating-point formats; Hopper added FP8, Blackwell added FP4.
- AI (Artificial Intelligence): software that learns from data, such as language models; most of it runs on GPUs.
- workload: the kind of work a program gives the GPU, such as training a model.
- runtime API (Application Programming Interface): the calls your program uses to allocate GPU memory, move data and launch kernels.
- CPU (Central Processing Unit): the main processor; in a CUDA program it runs the main code and sends work to the GPU.
- kernel: a function that runs on the GPU, launched from code on the CPU.
- bottleneck: the slowest step, which limits the speed of the whole program; often the copy between CPU and GPU.
- profiling: measuring where a program spends its time; Nsight Systems and Nsight Compute are the toolkit's profilers.
- debugging: finding and fixing bugs; cuda-gdb steps through GPU code and Compute Sanitizer finds memory errors.
- sample programs: small example CUDA programs from NVIDIA; since CUDA 11.6 they live in the cuda-samples repository on GitHub.
- Turing: the 2018 architecture with compute capability 7.5, the oldest one CUDA 13 supports.
- Maxwell / Pascal / Volta: older architectures (2014, 2016, 2017); CUDA 13 can no longer build code for them.
- driver (GPU driver): the software that lets the operating system talk to the GPU; it is installed separately from the toolkit.
