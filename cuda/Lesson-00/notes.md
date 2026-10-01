# Lesson 00: One Block, One Thread

This lesson runs the simplest possible CUDA (Compute Unified Device Architecture) program. Its kernel uses one block and one thread, with no parallelism, so you can see the first output before anything gets complex. Every later lesson changes this program a little.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## GPU vs CPU

On the CPU (Central Processing Unit), a function runs once on one core. On the GPU (Graphics Processing Unit), a kernel runs many times in parallel. A kernel is a function that runs on the GPU. Each running copy of it is called a thread. Two numbers set how many threads run: the number of blocks and the number of threads per block.

For example, 2 blocks of 3 threads each start 2 x 3 = 6 threads. All 6 run the same kernel code.

## What `__global__` Means

```c
__global__ void printIDs() { ... }
```

`__global__` marks a function as a GPU kernel. The compiler builds it for the GPU, not the CPU. The CPU calls it, but it runs on the GPU.

> [!NOTE]
> Two other qualifiers exist. `__device__` runs on the GPU and can be called only from GPU code. `__host__` is a normal CPU function that can be called only from the CPU.

## Launch Configuration `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

The `<<<...>>>` syntax is the execution configuration. It goes between the function name and the argument list. The first number is the number of blocks. The second number is the threads per block. `<<<1, 1>>>` means one block with one thread. Total threads are 1 x 1 = 1.

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## Thread, Block, Grid

Every kernel launch creates three levels:

- thread: the smallest unit. One thread runs one copy of the kernel.
- block: a group of threads that runs on one SM (Streaming Multiprocessor). An SM is one of the many small processors inside a GPU. The threads of a block can share memory.
- grid: all blocks of one kernel launch. One launch, one grid.

<cuda-hierarchy></cuda-hierarchy>

> [!NOTE]
> A GPU has many SMs. The L40S used in these lessons has 142. A block never splits across two SMs, but different blocks can run on different SMs at the same time. [Lesson 02](../Lesson-02/notes.md) uses this.

## `blockIdx.x` and `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x` is the index of the block this thread is in. `threadIdx.x` is the index of this thread inside its block. Both start at 0. Both have `.x`, `.y` and `.z` parts, because grids and blocks can be 1D, 2D or 3D (one-, two- or three-dimensional). For 1D work, you only use `.x`. With `<<<1, 1>>>`, both are always 0.

## Header Files

- `cuda_runtime.h`: the CUDA runtime API (Application Programming Interface). It declares `cudaDeviceSynchronize()` and the error-checking functions.
- `stdio.h`: standard C, needed for `printf`.
- `device_launch_parameters.h`: makes `blockIdx`, `threadIdx`, `blockDim` and `gridDim` known to the editor when you use MSVC (Microsoft Visual C++) or certain IDEs (Integrated Development Environments). `nvcc` does not need it, but it does no harm.

## `cudaDeviceSynchronize()`

Kernel launches are asynchronous. The CPU starts the kernel and goes to the next line at once. Without `cudaDeviceSynchronize()`, `main()` returns and the program exits before the GPU prints anything. This function makes the CPU wait until all GPU work is done.

<kernel-sync></kernel-sync>

> [!WARNING]
> If you forget `cudaDeviceSynchronize()`, the program still compiles and runs without an error. It just prints nothing.

## Code

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printIDs()
{
    printf("\nBlock ID: %d  ===  Thread ID: %d", blockIdx.x, threadIdx.x);
}

int main()
{
    printIDs<<<1, 1>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- The three `#include` lines load the headers described above.
- `printIDs` is the kernel. Each thread prints its block ID and its thread ID. The `\n` at the start of the string puts each line on a new line.
- `printIDs<<<1, 1>>>();` starts the kernel with one block of one thread.
- `cudaDeviceSynchronize();` waits for the GPU, so the print shows up before the program ends.

## Compile and Run

The first command compiles the code into a program. The second command runs it.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` is the CUDA compiler. It builds the CPU part and the GPU part of the file.
- `-o first_kernel` names the program `first_kernel`. Without it the name is `a.out`.
- `first_kernel.cu` is the source file with the code above. CUDA source files end in `.cu`.
- `./first_kernel` runs the program. The `./` tells the shell to look in the current folder.

## Output

```
Block ID: 0  ===  Thread ID: 0
```

- There is one line because there is one thread, and each thread prints once.
- Both IDs are 0 because the only block and the only thread each get index 0.
- The output is the same on every run, because one thread has no other thread to race with.

## Glossary

- CUDA (Compute Unified Device Architecture): NVIDIA's platform for running your own code on the GPU.
- GPU (Graphics Processing Unit): the processor with thousands of small cores that runs kernels.
- CPU (Central Processing Unit): the main processor. It runs `main()` and starts kernels.
- kernel: a function that runs on the GPU. You write it once, and the GPU runs it on many threads at the same time.
- thread: the smallest unit of execution. One thread is one running copy of the kernel, with its own ID.
- block: a group of threads that runs on one SM. They can share data through shared memory.
- grid: all blocks started by one kernel call.
- SM (Streaming Multiprocessor): one of the processors inside the GPU. Blocks run on SMs.
- `__global__`: tells the compiler this function is a GPU kernel. The CPU calls it and the GPU runs it.
- `blockIdx.x`: the index of the block the current thread is in. Starts at 0.
- `threadIdx.x`: the index of the current thread inside its block. Starts at 0.
- `cudaDeviceSynchronize()`: makes the CPU wait until the GPU finishes all its work.
- asynchronous: the CPU does not wait. It sends a command to the GPU and moves on at once.
- API (Application Programming Interface): the set of functions a library offers, here the CUDA runtime functions.
