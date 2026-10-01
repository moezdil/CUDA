# Lesson 02: Two Blocks, 1024 Threads Each

A block can hold at most 1024 threads. To run more threads, you add more blocks. This lesson launches 2 blocks x 1024 threads = 2048 threads and shows how each thread gets an ID that is unique in the whole grid.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## The 1024-Thread Limit

A single block may have at most 1024 threads. This is a fixed rule of the compute capability, the version number of the GPU (Graphics Processing Unit) that [Lesson 03](../Lesson-03/notes.md) explains. It has been 1024 on every NVIDIA GPU made since 2010.

The limit is not "the most threads an SM can hold". One SM (Streaming Multiprocessor) can hold more threads than that at once, spread over several blocks. On the L40S, one SM holds up to 1536 threads, for example 3 blocks of 512 threads each. On data center GPUs such as the A100 or H100, one SM holds up to 2048 threads.

## Streaming Multiprocessors (SMs)

An SM is a physical processing unit inside the GPU. Each SM has CUDA (Compute Unified Device Architecture) cores, a register file, shared memory, L1 cache (level 1 cache), and warp schedulers. At launch, the blocks are spread across the SMs. One SM can run one or more blocks at the same time, depending on how many resources each block needs. A block always stays on one SM.

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

## Compile and Run

The first command compiles the code into a program. The second command runs it.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` is the CUDA compiler. It builds the CPU (Central Processing Unit) part and the GPU part of the file.
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

## Glossary

- GPU (Graphics Processing Unit): the processor that runs kernels.
- SM (Streaming Multiprocessor): a physical processor inside the GPU. Blocks run on SMs. One SM can run several blocks at once if it has enough resources.
- L1 cache (level 1 cache): a small, fast memory inside each SM that keeps recently used data close to the cores.
- `blockDim.x`: built-in variable with the number of threads per block. It is the second number in `<<<blocks, threads>>>`.
- global thread ID: a unique ID for each thread in the whole grid. It is `blockIdx.x * blockDim.x + threadIdx.x`. Thread IDs repeat across blocks. Global IDs do not.
- `cudaGetLastError()`: returns the last CUDA error code. It catches silent failures, such as an invalid launch configuration that is dropped without a message.
- non-deterministic: the result or order cannot be predicted. Block scheduling depends on which SM has room at launch time.
