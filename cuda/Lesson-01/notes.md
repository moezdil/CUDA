# 01 > One Block, Four Threads

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

## Code Walkthrough

Step through the program in the order you would write it. Most of it is the [Lesson 00](../Lesson-00/notes.md) program, so the focus is on the launch.

<div class="code-walk" markdown>

1. `1-3 cpu` **Headers.** The same three `#include` lines as in Lesson 00. `stdio.h` is the one you cannot drop, because the kernel calls `printf`.
2. `5-8 gpu` **The kernel.** Write the kernel exactly as before. You do not change it to get more threads: every thread runs this same code, and each reads its own `threadIdx.x`. The rule: you write the code for one thread, and the launch decides how many copies run.
3. `10-11,14-15 cpu` **The main function.** Write `main` with `return 0;` at the end, as in Lesson 00. The two lines in the middle are the only host code that talks to the GPU.
4. `12 cpu` **The launch with 4 threads.** The second number in `<<<1, 4>>>` is the threads per block, so 4 threads run. A common mistake is to swap the numbers: `<<<4, 1>>>` also starts 4 threads, but as 4 blocks of 1 thread, so every `threadIdx.x` is 0.
5. `13 cpu` **Wait for the GPU.** `cudaDeviceSynchronize();` makes the CPU wait, and this is also when the printf buffer is written to the screen. The 4 lines come out in no fixed order.

</div>

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

## Write It Yourself

Write a kernel where each thread uses its own `threadIdx.x` to compute a different result.

1. Create `square.cu` with the skeleton below.
2. In the kernel, store `threadIdx.x` in a variable `i` and print `i` and `i * i`.
3. Launch 1 block of 5 threads.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void square()
{
    // TODO: read this thread's ID into an int i
    // TODO: print "thread i: i * i = result"
}

int main()
{
    // TODO: launch square with 1 block of 5 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "Hint"
    `int i = threadIdx.x;` gives each thread its own `i`. The threads per block is the second number: `<<<1, 5>>>`.

??? note "Solution"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void square()
    {
        int i = threadIdx.x;
        printf("thread %d: %d * %d = %d\n", i, i, i, i * i);
    }

    int main()
    {
        square<<<1, 5>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Compile and run it with `nvcc -o square square.cu` and `./square`. You should see 5 lines, one for each thread 0 to 4, such as `thread 3: 3 * 3 = 9`. The order of the lines can change between runs.

## Glossary

- GPU (Graphics Processing Unit): the processor that runs kernels.
- CPU (Central Processing Unit): the main processor that runs `main()`.
- warp: a group of 32 threads the GPU runs together as one unit. The GPU schedules warps, not single threads.
- lane: one of the 32 slots in a warp. Each active lane runs one thread.
- SIMT (Single Instruction, Multiple Threads): every active thread in a warp runs the same instruction. Each thread has its own data and its own ID.
- warp divergence: threads in one warp take different paths. For example, thread 0 enters an if-branch and thread 1 does not. The GPU then runs both paths one after the other, which is slower.
- printf buffer: GPU `printf` does not write to the screen directly. It writes to a buffer in GPU memory. The buffer goes to the screen when the CPU waits for the GPU, for example at `cudaDeviceSynchronize()`.
- kernel: a function marked `__global__` that runs on the GPU. One launch runs one copy of it per thread.
- thread: one running copy of the kernel, with its own `threadIdx.x` and its own variables.
- block: a group of threads that is launched together. `<<<1, 4>>>` makes 1 block of 4 threads.
- `threadIdx.x`: the thread's index inside its block, from 0 to (threads per block - 1). Here 0 to 3.
- `blockIdx.x`: the index of the thread's block. With a single block it is 0 for every thread.
- launch: the line `name<<<blocks, threads>>>();` that starts a kernel on the GPU. The first number is the block count, the second the threads per block.
- `cudaDeviceSynchronize()`: makes the CPU wait until the GPU has finished. This is also when the printf buffer reaches the screen.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for running your own code on the GPU.
- `nvcc`: the CUDA compiler. It compiles the CPU and GPU parts of a `.cu` file into one program.
- `-o`: sets the name of the output program. Without it the name is `a.out`.
