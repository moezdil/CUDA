# 02 > Two Blocks, 1024 Threads Each

A block can hold at most 1024 threads. To run more threads, you add more blocks. This lesson launches 2 blocks x 1024 threads = 2048 threads and shows how each thread gets an ID that is unique in the whole grid.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## The 1024-Thread Limit

A single block may have at most 1024 threads. This is a fixed rule of the compute capability, the version number of the GPU that [Lesson 03](../Lesson-03/notes.md) explains. It has been 1024 on every NVIDIA GPU made since 2010.

The limit is not "the most threads an SM can hold". One SM can hold more threads than that at once, spread over several blocks. On the L40S, one SM holds up to 1536 threads, for example 3 blocks of 512 threads each. On data center GPUs such as the A100 or H100, one SM holds up to 2048 threads.

## Streaming Multiprocessors

An SM is a physical processing unit inside the GPU. Each SM has CUDA cores, a register file, shared memory, L1 cache, and warp schedulers. At launch, the blocks are spread across the SMs. One SM can run one or more blocks at the same time, depending on how many resources each block needs. A block always stays on one SM.

> [!NOTE]
> The SM count depends on the GPU. The L40S has 142 SMs. A mid-range GPU like the RTX 3080 has 68.

## Thread IDs with Multiple Blocks

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

Block 0 has threads 0-1023. Block 1 has its own threads 0-1023. Thread IDs restart at 0 in every block. So `threadIdx.x` alone does not tell the two threads with ID 5 apart. To get a unique global ID, use this formula:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` is a built-in variable. It holds the number of threads per block set at launch. Here it is 1024. Each block skips over all threads of the blocks before it:

- thread 5 in block 0: 0 * 1024 + 5 = 5
- thread 5 in block 1: 1 * 1024 + 5 = 1029
- thread 1023 in block 1: 1 * 1024 + 1023 = 2047, the last of the 2048 threads

With smaller numbers it is easier to see. With 4 threads per block, thread 3 in block 2 gets 2 * 4 + 3 = 11. The global IDs run 0 to 3 in block 0, 4 to 7 in block 1, and 8 to 11 in block 2. Move the sliders and hover over a thread to see the formula with its numbers:

<global-id></global-id>

Kernels that work on arrays use this formula to give each thread one element. Thread 1029 works on element 1029.

## The Silent Failure: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

This line compiles without error. The compiler does not check the launch configuration. The CUDA runtime checks it when the kernel starts, sees 2048 threads in one block, and drops the whole kernel call.

> [!WARNING]
> An invalid launch gives no output, no crash, and no error message. The program just ends. Call `cudaGetLastError()` right after the launch to see the error, here `invalid configuration argument`. [Lesson 08](../Lesson-08/notes.md) does this with a `CHECK` macro.

> [!TIP]
> Uncomment the line, run it, and compare the output.

## Block Scheduling

The order in which blocks run on SMs is non-deterministic, which means it is not fixed. Each block goes to an SM that has room for it. Block 0 and Block 1 can run at the same time on different SMs. So their output lines mix in a different order on every run.

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

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
    // printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit, launches nothing at runtime
    printIDs<<<2, 1024>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- The commented line is the invalid launch from the section above. It stays commented out so the program works.
- `printIDs<<<2, 1024>>>();` starts 2 blocks of 1024 threads each. This stays inside the limit and still runs 2048 threads.
- The rest is the same as in [Lesson 00](../Lesson-00/notes.md) and [Lesson 01](../Lesson-01/notes.md).

## Code Walkthrough

Step through the program in the order you would write it. The new part is the launch with two blocks.

<div class="code-walk" markdown>

1. `1-3 cpu` **Headers.** The same three `#include` lines as before: the CUDA runtime, the built-in variables, and `printf`. Adding blocks needs no new header.
2. `5-8 gpu` **The kernel.** The kernel does not change when you add blocks. Each thread prints `blockIdx.x` and `threadIdx.x`, and now `blockIdx.x` is 0 or 1. Remember that `threadIdx.x` restarts at 0 in every block, so it alone is not unique.
3. `10-11,15-16 cpu` **The main function.** Write `main` with `return 0;` at the end. The launch lines go in between.
4. `13 cpu` **The launch with 2 blocks.** To get 2048 threads, write `<<<2, 1024>>>`: 2 blocks times 1024 threads. The rule: keep the second number at 1024 or less, and raise the first number when you need more threads.
5. `14 cpu` **Wait for the GPU.** `cudaDeviceSynchronize();` waits for both blocks. Without it you may see no lines at all.
6. `12 cpu` **The invalid launch, as a comment.** Add this line last, as a reminder of what not to write. `<<<1, 2048>>>` compiles, but the runtime drops it. If you remove the `//`, that launch prints no lines and no error message, so the mistake is easy to miss.

</div>

## Compile and Run

The first command compiles the code into a program. The second command runs it.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` is the CUDA compiler. It builds the CPU part and the GPU part of the file.
- `-o first_kernel` names the program `first_kernel`. Without it the name is `a.out`.
- `first_kernel.cu` is the source file with the code above.
- `./first_kernel` runs the program from the current folder.

## Output

The program prints 2048 lines, one per thread. Here are the first few:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- The `...` stands for the rest of the 2048 lines.
- `Block ID` is 0 or 1, because there are two blocks.
- Every `Thread ID` from 0 to 1023 shows up twice, once in each block. Thread IDs restart at 0 in every block.
- The lines of Block 0 and Block 1 mix, and the order changes between runs. The two blocks can run at the same time on different SMs, as explained in Block Scheduling.

## Write It Yourself

Compute the global thread ID yourself, so every thread in the grid gets a unique number.

1. Create `global_id.cu` with the skeleton below.
2. In the kernel, compute `id` with the formula from this lesson and print it with the block ID and thread ID.
3. Launch 3 blocks of 4 threads.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void printGlobalIDs()
{
    // TODO: compute the global ID: block index times block size plus thread index
    // TODO: print "block b, thread t -> global ID id"
}

int main()
{
    // TODO: launch printGlobalIDs with 3 blocks of 4 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "Hint"
    The formula is `blockIdx.x * blockDim.x + threadIdx.x`. Blocks come first in the launch: `<<<3, 4>>>`.

??? note "Solution"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void printGlobalIDs()
    {
        int id = blockIdx.x * blockDim.x + threadIdx.x;
        printf("block %d, thread %d -> global ID %d\n", blockIdx.x, threadIdx.x, id);
    }

    int main()
    {
        printGlobalIDs<<<3, 4>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Compile and run it with `nvcc -o global_id global_id.cu` and `./global_id`. You should see 12 lines with each global ID from 0 to 11 exactly once, in no fixed order. Thread 3 in block 2 prints global ID 11, because 2 * 4 + 3 = 11.

## Glossary

- GPU (Graphics Processing Unit): the processor that runs kernels.
- SM (Streaming Multiprocessor): a physical processor inside the GPU. Blocks run on SMs. One SM can run several blocks at once if it has enough resources.
- L1 cache (level 1 cache): a small, fast memory inside each SM that keeps recently used data close to the cores.
- `blockDim.x`: built-in variable with the number of threads per block. It is the second number in `<<<blocks, threads>>>`.
- global thread ID: a unique ID for each thread in the whole grid. It is `blockIdx.x * blockDim.x + threadIdx.x`. Thread IDs repeat across blocks. Global IDs do not.
- `cudaGetLastError()`: returns the last CUDA error code. It catches silent failures, such as an invalid launch configuration that is dropped without a message.
- non-deterministic: the result or order cannot be predicted. Block scheduling depends on which SM has room at launch time.
- CPU (Central Processing Unit): the main processor that runs `main()` and launches kernels.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for running your own code on the GPU.
- compute capability: the version number of a GPU generation, 8.9 on the L40S. It fixes limits such as 1024 threads per block ([Lesson 03](../Lesson-03/notes.md)).
- register file: the fast storage in each SM that holds the threads' local variables. On the L40S it has 65536 32-bit registers per SM.
- shared memory: fast memory inside each SM that the threads of one block can share.
- warp scheduler: the unit in an SM that picks which warp runs next. Each SM has several of them.
- block: a group of up to 1024 threads that runs on one SM. Thread IDs start at 0 again in every block.
- grid: all blocks of one launch. `<<<2, 1024>>>` makes a grid of 2 blocks, 2048 threads in total.
- `blockIdx.x`: the index of the thread's block, 0 or 1 in this lesson.
- `threadIdx.x`: the thread's index inside its block, 0 to 1023 here. It restarts at 0 in every block.
- launch configuration: the two numbers in `<<<blocks, threads>>>`. The compiler does not check them. The CUDA runtime does, when the kernel starts.
- CUDA runtime: the library your program calls for GPU work, such as `cudaDeviceSynchronize()`. It also checks every launch configuration.
- invalid launch: a launch that breaks a limit, such as `<<<1, 2048>>>`. The kernel never runs, and only `cudaGetLastError()` shows the error (`invalid configuration argument`).
- `nvcc`: the CUDA compiler. It compiles the CPU and GPU parts of a `.cu` file into one program.
- `-o`: sets the name of the output program. Without it the name is `a.out`.
