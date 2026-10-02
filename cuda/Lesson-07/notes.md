# 07 > Warp IDs

[Lesson 01](../Lesson-01/notes.md) and [Lesson 02](../Lesson-02/notes.md) covered block and thread IDs. This lesson adds the warp, the group of 32 threads that the GPU (Graphics Processing Unit) really schedules, and shows how a thread works out its own warp ID and lane ID inside the kernel.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## The CUDA Hierarchy

The levels in CUDA (Compute Unified Device Architecture) are the grid, the blocks inside it, the warps inside each block, and the threads inside each warp:

<cuda-hierarchy warps></cuda-hierarchy>

You choose the number of blocks and threads per block with `<<<num_blocks, threads_per_block>>>` (see [Lesson 01](../Lesson-01/notes.md) and [Lesson 02](../Lesson-02/notes.md)). The warp size is always 32 on NVIDIA GPUs. It is fixed in the hardware and cannot be changed. The warp is the real scheduling unit on the GPU. The GPU does not run threads one by one. It runs them in groups of 32.

> [!NOTE]
> Warp limits depend on the hardware. These values were measured on the L40S with `cudaGetDeviceProperties`:
>
> - Max warps per block: 32 (max 1024 threads / 32, applies to all GPUs)
> - Max concurrent warps per SM (Streaming Multiprocessor): 48, which is 48 × 32 = 1536 threads
> - SM count: 142
> - Max concurrent warps across the entire GPU: 142 × 48 = 6,816
>
> The L40S has compute capability (CC) 8.9. GPUs with CC 8.6, 8.9 and 12.0 hold 48 warps per SM. Data center GPUs such as the A100 (CC 8.0) and H100 (CC 9.0) hold 64 warps, which is 2048 threads, per SM ([Lesson 03](../Lesson-03/notes.md)).

## `warp_id` Is Not a Built-in Variable

`blockIdx.x` and `threadIdx.x` are filled in by the GPU for each thread. You only read them. There is no such variable for the warp ID. You calculate it yourself inside the kernel:

```c
int warp_id = threadIdx.x / 32;
```

Both sides are whole numbers, so `/` is integer division and the remainder is dropped. That is why every group of 32 threads gets the same result. In a block of 128 threads:

- threads 0-31 → warp 0
- threads 32-63 → warp 1
- threads 64-95 → warp 2
- threads 96-127 → warp 3

That is 128 / 32 = 4 warps.

## What Happens with 1024 Threads

With 1 block of 1024 threads (`<<<1, 1024>>>`), warp IDs go from 0 to 31. This is correct, because 1024 / 32 = 32 warps. Each warp ID has exactly 32 threads. The program printed this (shortened):

```
Block ID: 0 --- Thread ID:    0 --- Warp ID:  0
Block ID: 0 --- Thread ID:    1 --- Warp ID:  0
...
Block ID: 0 --- Thread ID:   31 --- Warp ID:  0
Block ID: 0 --- Thread ID:   32 --- Warp ID:  1
...
Block ID: 0 --- Thread ID:  992 --- Warp ID: 31
...
Block ID: 0 --- Thread ID: 1023 --- Warp ID: 31
```

Each `...` stands for lines that were left out. The block ID is always 0 because there is only one block. The warp ID changes from 0 to 1 between thread 31 and thread 32, because 32 / 32 = 1. The last warp starts at thread 992, because 992 / 32 = 31. Thread 1023 is the last thread, and 1023 / 32 is still 31.

Checked on the machine: warps 0-31, exactly 32 threads each, 1024 lines in total. This count of output lines per warp ID shows it:

```
32 warp 0
32 warp 1
...
32 warp 31
```

Each line gives a count, then the warp ID. Every count is 32 because each warp holds exactly 32 threads. There are 32 such lines, and 32 × 32 = 1024.

## Warp ID Resets per Block

The warp ID starts at zero in every block. With `<<<2, 64>>>`, each block has 64 threads, which is 2 warps. So both blocks have a warp 0 and a warp 1, and `warp_id = 0` appears twice, once in block 0 and once in block 1.

> [!WARNING]
> The warp ID alone does not tell you which warp of the whole launch a thread is in. Always read it together with the block ID. Thread 40 of block 0 and thread 40 of block 1 both get warp ID 40 / 32 = 1, but they are in different warps.

## Lane ID

Each warp has 32 threads. A thread's position inside its warp, from 0 to 31, is its lane ID. You get it with the modulo operator, `threadIdx.x % 32`, which gives the remainder of the division. Division gives the warp, the remainder gives the place inside it:

| `threadIdx.x` | warp ID (`/ 32`) | lane ID (`% 32`) |
|---|---|---|
| 0 | 0 | 0 |
| 31 | 0 | 31 |
| 32 | 1 | 0 |
| 33 | 1 | 1 |
| 70 | 2 | 6 |
| 127 | 3 | 31 |

For thread 70: 70 / 32 = 2 with remainder 6, because 2 × 32 + 6 = 70. Threads 0, 32 and 64 are in different warps but all have lane ID 0. So modulo does not give the warp ID. For the warp ID you need division (`/`).

Move the slider to change the block size, and hover a thread to see both numbers:

<warp-lane></warp-lane>

## Code

### `warp_ids.cu`

The kernel runs with 1 block of 128 threads. The `test01` function runs on the GPU. Each thread computes its `warp_id` with `threadIdx.x / 32` and prints its block ID, thread ID, and warp ID. After the launch, `cudaDeviceSynchronize()` makes the CPU (Central Processing Unit) wait for the GPU, so the output is not lost when the program ends.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 1 block, 128 threads -> 4 warps (IDs: 0,1,2,3)
    test01<<<1, 128>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `#include "cuda_runtime.h"`: header for CUDA functions.
- `#include "device_launch_parameters.h"`: defines GPU built-in variables like `blockIdx` and `threadIdx`.
- `#include <stdio.h>`: standard C header for `printf`.
- `__global__`: marks the function as a kernel. The CPU calls it and the GPU runs it.
- `int warp_id = threadIdx.x / 32;`: each thread computes its own warp ID. Threads 0-31 → 0, threads 32-63 → 1, and so on.
- `printf(...)`: each thread prints its block ID, thread ID, and warp ID.
- `test01<<<1, 128>>>();`: launches the kernel with 1 block of 128 threads.
- `cudaDeviceSynchronize();`: makes the CPU wait until all GPU threads finish and the output is written.

#### Code Walkthrough

Step through `warp_ids.cu` in the order you would write it.

<div class="code-walk" markdown>

1. `1-3 cpu` **Headers.** The CUDA runtime, the built-in variables, and `stdio.h` for `printf`. Computing a warp ID needs no extra header.
2. `5-6,10 gpu` **The empty kernel.** Write `__global__ void test01()` and its braces. The kernel needs no arguments, because it computes everything from `threadIdx.x`.
3. `7 gpu` **The warp ID.** There is no built-in warp ID, so compute it: `int warp_id = threadIdx.x / 32;`. Integer division groups the threads by 32. A common mistake is `%` instead of `/`: `threadIdx.x % 32` gives the lane ID, not the warp ID.
4. `8-9 gpu` **The print.** Print the block ID, the thread ID and the warp ID. Always print the block ID with the warp ID, because the warp ID restarts in every block.
5. `12-13,17-18 cpu` **The main function.** Write `main` with `return 0;` at the end. The launch and the wait go in between.
6. `14-15 cpu` **The launch.** First write the plan as a comment: 128 threads / 32 = 4 warps. Then the launch `<<<1, 128>>>`. A block size that is a multiple of 32 fills every warp.
7. `16 cpu` **Wait for the GPU.** Add `cudaDeviceSynchronize();` after the launch. It keeps the program alive until all 128 lines are printed.

</div>

### `warp_ids_2blocks.cu`

This file uses the same kernel as `warp_ids.cu`. Only the launch config is different, `<<<2, 64>>>`. That is 2 blocks of 64 threads, so each block has 64 / 32 = 2 warps. The file shows that the warp ID resets in each block.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 2 blocks, 64 threads/block -> 2 warps per block, warp ID resets per block
    test01<<<2, 64>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `test01<<<2, 64>>>();`: launches the kernel with 2 blocks of 64 threads. That is 128 threads and 4 warps in total, split across 2 blocks.
- All other lines are the same as in `warp_ids.cu`.

#### Code Walkthrough

`warp_ids_2blocks.cu` is written the same way. Only the launch is new.

<div class="code-walk" markdown>

1. `1-3 cpu` **Headers.** The same three lines as in `warp_ids.cu`. Start the second file as a copy of the first.
2. `5-10 gpu` **The same kernel.** Not a single character changes. The warp ID resets per block without any extra code, because `threadIdx.x` resets per block.
3. `12-13,16-18 cpu` **The same main function.** `main`, the wait and `return 0;` stay as they were. The wait matters just as much with two blocks.
4. `14-15 cpu` **The new launch.** `<<<2, 64>>>` still starts 128 threads, but as 2 blocks of 2 warps each. The comment states the result to expect, so you can check the output against it.

</div>

## Compile and Run

Both files are in the `code/` directory. Compile each one into its own program and run it, so you can compare the two launch configs:

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

- Lines that start with `#` are comments. The shell ignores them.
- `nvcc` is the CUDA compiler.
- `-arch=sm_89` builds for compute capability 8.9, the L40S. Code built for the right architecture can use all of its features.
- `-o warp_ids` names the program `warp_ids`. Without it the name is `a.out`, and the second compile would overwrite the first program.
- `warp_ids.cu` is the source file.
- `./warp_ids` runs the program from the current folder.

## Output

### `<<<1, 128>>>`

This is the output of `./warp_ids`. There are 128 lines, one per thread, and 4 warps. This is real L40S output. Thread order is not guaranteed, so the listing below is sorted.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
Block ID: 0 --- Thread ID:  1 --- Warp ID: 0
Block ID: 0 --- Thread ID:  2 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
Block ID: 0 --- Thread ID: 33 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 0 --- Thread ID: 64 --- Warp ID: 2
...
Block ID: 0 --- Thread ID: 95 --- Warp ID: 2
Block ID: 0 --- Thread ID: 96 --- Warp ID: 3
...
Block ID: 0 --- Thread ID: 127 --- Warp ID: 3
```

The block ID is always 0 because there is only one block. The warp ID goes up by one at threads 32, 64, and 96, because each of those is a new multiple of 32. Each `...` stands for lines that were left out.

### `<<<2, 64>>>`

This is the output of `./warp_ids_2blocks`. There are 128 lines, 2 blocks, and 2 warps per block. The warp ID resets in each block.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 1 --- Thread ID:  0 --- Warp ID: 0   <- resets to zero
...
Block ID: 1 --- Thread ID: 31 --- Warp ID: 0
Block ID: 1 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 1 --- Thread ID: 63 --- Warp ID: 1
```

The thread ID only goes up to 63 because each block has 64 threads. Block 1 shows warp_id 0 again because `threadIdx.x` starts at zero in every block, and the warp ID is computed from it. There is no global warp number for the whole GPU. The `<- resets to zero` mark was added by hand. The program does not print it.

## Visual

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## Try It

- Launch `test01<<<1, 100>>>()`. 100 is not a multiple of 32, so the last warp is only partly full: warps 0, 1 and 2 have 32 threads each, and warp 3 has only threads 96 to 99. The GPU still schedules a full warp of 32 for it, and 28 lanes stay idle.
- Add `int lane_id = threadIdx.x % 32;` to the kernel and print it. Thread 70 should print lane ID 6.

## Write It Yourself

Compute both the warp ID and the lane ID, and use the lane ID to pick one thread per warp.

1. Create `warp_starts.cu` with the skeleton below.
2. In the kernel, compute `warp_id` with `/` and `lane_id` with `%`.
3. Let only lane 0 of each warp print its block, its warp ID and its thread ID.
4. Launch 2 blocks of 96 threads.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void warpStarts()
{
    // TODO: compute warp_id and lane_id from threadIdx.x
    // TODO: if this is lane 0, print "block b, warp w starts at thread t"
}

int main()
{
    // TODO: launch warpStarts with 2 blocks of 96 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "Hint"
    `threadIdx.x / 32` is the warp ID and `threadIdx.x % 32` is the lane ID. The first thread of a warp has lane ID 0.

??? note "Solution"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void warpStarts()
    {
        int warp_id = threadIdx.x / 32;
        int lane_id = threadIdx.x % 32;
        if (lane_id == 0) {
            printf("block %d, warp %d starts at thread %d\n", blockIdx.x, warp_id, threadIdx.x);
        }
    }

    int main()
    {
        warpStarts<<<2, 96>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Compile and run it with `nvcc -arch=sm_89 -o warp_starts warp_starts.cu` and `./warp_starts`. You should see 6 lines in any order: in each of the 2 blocks, warp 0 starts at thread 0, warp 1 at thread 32 and warp 2 at thread 64.

## Glossary

- GPU (Graphics Processing Unit): the processor that runs the kernels.
- SM (Streaming Multiprocessor): the processor inside the GPU that runs blocks and their warps. The L40S has 142.
- warp: a group of 32 threads that the GPU runs as one unit. The GPU schedules warps, not single threads.
- warp size: always 32 on NVIDIA GPUs. Software cannot change it.
- warp ID: the warp a thread belongs to inside its block. It is `threadIdx.x / 32`.
- lane ID: a thread's position inside its warp, from 0 to 31. It is `threadIdx.x % 32`. It does not give the warp ID.
- warps per block: `(threads per block) / 32`. 128 threads/block → 4 warps/block.
- warp ID reset: warp IDs start at zero in every block, like `threadIdx.x`. There is no global warp ID for the whole GPU.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for running your own code on the GPU.
- block: a group of threads that runs on one SM. In the hierarchy it sits between the grid and the warps.
- thread: one running copy of the kernel, the lowest level of the hierarchy.
- `cudaGetDeviceProperties`: a runtime call that fills a `cudaDeviceProp` struct with the limits of a GPU, such as `maxThreadsPerBlock` and `multiProcessorCount` (the SM count).
- compute capability (CC): the version number of a GPU generation, 8.9 on the L40S ([Lesson 03](../Lesson-03/notes.md)).
- integer division: `/` between whole numbers drops the remainder, so 70 / 32 = 2.
- modulo (`%`): the remainder of a division. 70 % 32 = 6, because 2 × 32 + 6 = 70.
- `__global__`: marks a function as a kernel, launched from the CPU and run on the GPU.
- `cudaDeviceSynchronize()`: makes the CPU wait until the GPU has finished, so no output is lost.
- launch config (launch configuration): the `<<<blocks, threads>>>` numbers of a launch.
- `nvcc`: the CUDA compiler. It compiles the CPU and GPU parts of a `.cu` file into one program.
- `-arch=sm_89`: builds for compute capability 8.9, the L40S.
- `-o`: sets the name of the output program. Without it the name is `a.out`.
