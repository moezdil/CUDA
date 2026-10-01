# Lesson 01: One Block, Four Threads

This lesson makes one change to [Lesson 00](../Lesson-00/notes.md). The thread count goes from 1 to 4, and the block count stays 1. Four threads run the same kernel at the same time, each with a different `threadIdx.x`.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## What Changes

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

The GPU (Graphics Processing Unit) runs 4 copies of `printIDs` at the same time. Each copy gets its own `threadIdx.x` of 0, 1, 2 or 3. `blockIdx.x` is 0 for all of them, because there is still only one block.

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## SIMT (Single Instruction, Multiple Threads)

All 4 threads run the same instructions, but each one has its own ID and its own variables. Thread 2 reads `threadIdx.x` and gets 2, thread 3 gets 3. So the same `printf` line prints a different number in each thread. In this kernel the threads do not wait for each other or share any data. This model is called SIMT (Single Instruction, Multiple Threads).

## Warps

The GPU runs threads in groups of 32 called warps. The hardware schedules warps, not single threads. When you launch 4 threads, the GPU makes one warp of 32 lanes but uses only 4 of them. The other 28 lanes stay idle.

The warp count of a block is the thread count divided by 32, rounded up. For example, a block of 100 threads needs 4 warps: three full warps of 32 (96 threads) and one warp with only 4 active threads.

> [!TIP]
> Pick a block size that is a multiple of 32, such as 128 or 256. Then no warp has idle lanes.

> [!NOTE]
> If threads in a warp take different sides of an if/else, the GPU runs the paths one after the other. This is called warp divergence. It does not happen in this lesson, because all 4 threads run the same line.

## Why the Output Order Changes

`printf` in a kernel does not print right away. Each thread writes its line into a buffer in GPU memory. The buffer is printed when the CPU waits for the GPU, here at `cudaDeviceSynchronize()`. The order in which threads write is not fixed, even inside one warp. So the output order can change between runs.

<printf-order threads="4"></printf-order>

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
    printIDs<<<1, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

This is the Lesson 00 code with one change. The launch line is now `printIDs<<<1, 4>>>();`, so four threads run the kernel.

## Compile and Run

The first command compiles the code into a program. The second command runs it.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` is the CUDA (Compute Unified Device Architecture) compiler. It builds the CPU (Central Processing Unit) part and the GPU part of the file.
- `-o first_kernel` names the program `first_kernel`. Without it the name is `a.out`.
- `first_kernel.cu` is the source file with the code above.
- `./first_kernel` runs the program from the current folder.

## Output

The program prints 4 lines, one per thread:

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- There are 4 lines because 4 threads run and each prints once.
- `Block ID` is always 0 because there is only one block.
- Each `Thread ID` from 0 to 3 shows up exactly once, because each thread has its own `threadIdx.x`.
- The order here is 2, 0, 3, 1, but your run may show another order. The threads write to the printf buffer in no fixed order, as explained above.

## Try It

- Change the launch to `<<<1, 32>>>`. You get 32 lines with thread IDs 0 to 31, still in no fixed order. That is exactly one full warp.

## Glossary

- GPU (Graphics Processing Unit): the processor that runs kernels.
- CPU (Central Processing Unit): the main processor that runs `main()`.
- warp: a group of 32 threads the GPU runs together as one unit. The GPU schedules warps, not single threads.
- lane: one of the 32 slots in a warp. Each active lane runs one thread.
- SIMT (Single Instruction, Multiple Threads): every active thread in a warp runs the same instruction. Each thread has its own data and its own ID.
- warp divergence: threads in one warp take different paths. For example, thread 0 enters an if-branch and thread 1 does not. The GPU then runs both paths one after the other, which is slower.
- printf buffer: GPU `printf` does not write to the screen directly. It writes to a buffer in GPU memory. The buffer goes to the screen when the CPU waits for the GPU, for example at `cudaDeviceSynchronize()`.
