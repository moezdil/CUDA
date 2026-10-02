# 04 > Built-in Variables

Every kernel has five read-only built-in variables: `gridDim`, `blockDim`, `blockIdx`, `threadIdx`, and `warpSize`. You do not pass or declare them. The GPU (Graphics Processing Unit) fills them in for each thread at launch, based on the launch configuration. This lesson prints all five from every thread, so you can see which ones change and which stay the same.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## gridDim

`gridDim` holds the number of blocks in each direction. With `<<<2, 4>>>`, `gridDim.x` is 2, and `gridDim.y` and `gridDim.z` are 1. The grid size is fixed at launch, so every thread sees the same `gridDim`.

## blockDim

`blockDim` holds the number of threads per block in each direction. With `<<<2, 4>>>`, `blockDim.x` is 4, and `blockDim.y` and `blockDim.z` are 1. Every thread sees the same `blockDim`.

The global ID formula from [Lesson 02](../Lesson-02/notes.md) uses it: `blockIdx.x * blockDim.x + threadIdx.x`. With `<<<2, 4>>>`, thread 3 in block 1 gets 1 * 4 + 3 = 7, the last of the 8 threads.

<global-id></global-id>

## blockIdx

`blockIdx` is the index of the thread's block. With 2 blocks, `blockIdx.x` is 0 for all threads in block 0 and 1 for all threads in block 1. It is always less than `gridDim.x`.

## threadIdx

`threadIdx` is the index of the thread inside its block. It restarts at 0 in every block. In a block of 4 threads, `threadIdx.x` is 0, 1, 2, 3. It is always less than `blockDim.x`.

`gridDim`, `blockDim`, `blockIdx`, and `threadIdx` all have `.x`, `.y`, `.z` fields. `gridDim` and `blockDim` are of type `dim3`. If you write `<<<2, 4>>>` with plain numbers, CUDA (Compute Unified Device Architecture) sets `.y = 1` and `.z = 1` for you. So `<<<2, 4>>>` is the same as `<<<dim3(2, 1, 1), dim3(4, 1, 1)>>>`.

## warpSize

`warpSize` is the number of threads per warp. It is 32 on every NVIDIA GPU so far. CUDA gives it to you as a variable, so your code does not have to write the number 32 by hand.

> [!TIP]
> Writing 32 works today. Reading `warpSize` keeps your code correct even if a future GPU uses another size.

## Hardware Limits

Before running a kernel, the CUDA runtime checks the launch configuration against hardware limits. If any value is too large, the kernel does not launch. These are the limits for CC (compute capability) 3.0 and later, from Kepler to Blackwell:

| Variable      | Dimension    | Max value |
|---------------|--------------|-----------|
| `gridDim.x`   | blocks in x  | 2^31 - 1  |
| `gridDim.y`   | blocks in y  | 65535     |
| `gridDim.z`   | blocks in z  | 65535     |
| `blockDim.x`  | threads in x | 1024      |
| `blockDim.y`  | threads in y | 1024      |
| `blockDim.z`  | threads in z | 64        |
| threads/block | total        | 1024      |

`blockDim.x * blockDim.y * blockDim.z` must not be more than 1024, even if each single value is within its limit. This is the same 1024 threads-per-block limit from [Lesson 02](../Lesson-02/notes.md). Two examples:

- `dim3(16, 16, 4)`: every value is within its limit, and 16 x 16 x 4 = 1024 threads. Valid.
- `dim3(32, 32, 2)`: every value is within its limit, but 32 x 32 x 2 = 2048 threads. Invalid, the kernel does not run.

> [!WARNING]
> A launch that breaks a limit compiles and runs without any message, but the kernel never starts. Check `cudaGetLastError()` after the launch, as [Lesson 08](../Lesson-08/notes.md) does.

Enter your own block and grid sizes to see if the launch is valid:

<block-limits></block-limits>

## Code

This program launches one kernel that prints all five built-in variables from every thread, so you can see which values change and which stay the same.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printBuiltins()
{
    printf("\ngridDim=(%d,%d,%d)  blockDim=(%d,%d,%d)  blockIdx=(%d,%d,%d)  threadIdx=(%d,%d,%d)  warpSize=%d",
        gridDim.x,   gridDim.y,   gridDim.z,
        blockDim.x,  blockDim.y,  blockDim.z,
        blockIdx.x,  blockIdx.y,  blockIdx.z,
        threadIdx.x, threadIdx.y, threadIdx.z,
        warpSize);
}

int main()
{
    printBuiltins<<<2, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- The two CUDA headers declare the runtime functions (such as `cudaDeviceSynchronize`) and the built-in variables. `stdio.h` provides `printf`.
- `__global__` marks `printBuiltins` as a kernel. It runs on the GPU and is launched from the CPU (Central Processing Unit).
- The `printf` inside the kernel runs once per thread. Each `%d` is filled with one field, in the order listed below the format string.
- `printBuiltins<<<2, 4>>>()` launches 2 blocks of 4 threads, so 8 threads run the kernel and print 8 lines.
- `cudaDeviceSynchronize()` makes the CPU wait until the kernel is done. A kernel launch returns right away, so without this wait `main` could end before the GPU output appears.

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## Code Walkthrough

Step through the program in the order you would write it. The work is in the long `printf`: one format string, then one value for each `%d`.

<div class="code-walk" markdown>

1. `1-3 cpu` **Headers.** The same three `#include` lines as in the earlier lessons. The built-in variables need no header with `nvcc`, but `device_launch_parameters.h` lets some editors know them too.
2. `5-6,13 gpu` **The empty kernel.** Write `__global__ void printBuiltins()` and its braces. The kernel takes no arguments, because everything it prints is a built-in variable that the GPU fills in for each thread.
3. `7 gpu` **The format string.** Write the text with 13 `%d` placeholders: 3 for each of the four variables with `.x`, `.y` and `.z`, and 1 for `warpSize`. Start with `\n` so each thread's output goes on its own line. End the line with a comma, because the values follow.
4. `8-12 gpu` **The values.** List the 13 values in the same order as the placeholders, one variable per line so the order is easy to check. The rule: one value per `%d`, in order. A missing value can still compile, and then `printf` prints wrong numbers, so count both sides.
5. `15-16,19-20 cpu` **The main function.** Write `main` with `return 0;` at the end. It is the same frame as in the earlier lessons.
6. `17 cpu` **The launch.** `<<<2, 4>>>` sets `gridDim.x` to 2 and `blockDim.x` to 4. Plain numbers leave the `.y` and `.z` sizes at 1.
7. `18 cpu` **Wait for the GPU.** `cudaDeviceSynchronize();` keeps the program alive until all 8 lines are printed. Without it, `main` can end before the GPU output appears.

</div>

## Compile and Run

The first command compiles the code into a program. The second command runs it.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` is the CUDA compiler.
- `-o first_kernel` names the program `first_kernel`. Without it the name is `a.out`.
- `first_kernel.cu` is the source file with the code above.
- `./first_kernel` runs the program from the current folder.

## Output

The program prints 8 lines, one per thread:

```
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(3,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(3,0,0)  warpSize=32
```

- `gridDim` and `blockDim` are the same on every line, because the launch configuration is the same for all threads.
- `blockIdx` changes per block. `threadIdx` changes per thread and restarts at 0 in the second block.
- The `.y` and `.z` sizes are 1 and the `.y` and `.z` indices are 0, because `<<<2, 4>>>` used plain numbers.
- `warpSize` is always 32.
- Block 1 printed before block 0 here. The GPU runs blocks independently and in no fixed order, so the order of blocks, and of threads inside each block, can change between runs.

## Write It Yourself

Read the built-in variables to work out the size of a launch, and pass the sizes as `dim3` values.

1. Create `launch_size.cu` with the skeleton below.
2. Let only thread 0 of block 0 print, so the line appears once.
3. Print the number of blocks, the threads per block, the total thread count and the warp size.
4. Launch with `dim3 grid(3)` and `dim3 block(64)`.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void launchSize()
{
    // TODO: only the first thread of the first block prints
    // TODO: print blocks, threads per block, total threads and warp size
}

int main()
{
    // TODO: make a dim3 grid of 3 blocks and a dim3 block of 64 threads
    // TODO: launch launchSize with them
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "Hint"
    Check `blockIdx.x == 0 && threadIdx.x == 0`. The total thread count is `gridDim.x * blockDim.x`. A `dim3` goes into the launch like a number: `<<<grid, block>>>`.

??? note "Solution"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void launchSize()
    {
        if (blockIdx.x == 0 && threadIdx.x == 0) {
            printf("blocks: %d, threads per block: %d, total threads: %d, warp size: %d\n",
                   gridDim.x, blockDim.x, gridDim.x * blockDim.x, warpSize);
        }
    }

    int main()
    {
        dim3 grid(3);
        dim3 block(64);
        launchSize<<<grid, block>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Compile and run it with `nvcc -o launch_size launch_size.cu` and `./launch_size`. You should see one line: `blocks: 3, threads per block: 64, total threads: 192, warp size: 32`.

## Glossary

- GPU (Graphics Processing Unit): the processor that runs kernels.
- CPU (Central Processing Unit): the main processor that runs `main()` and launches kernels.
- CC (compute capability): the version number of a GPU generation. It sets the limits in the table above ([Lesson 03](../Lesson-03/notes.md)).
- `gridDim`: number of blocks in each direction (x, y, z). Same for every thread in the launch.
- `blockDim`: number of threads per block in each direction. Same for every thread in the launch.
- `blockIdx`: index of the thread's block. Always less than `gridDim` in each direction.
- `threadIdx`: index of the thread inside its block. Restarts at zero in every block.
- `warpSize`: number of threads per warp. 32 on all current hardware.
- `dim3`: a CUDA struct with `.x`, `.y`, `.z` integer fields, used for grid and block sizes. Plain numbers in `<<<>>>` become a `dim3` with `.y=1` and `.z=1`.
- launch configuration: the `<<<blocks, threads>>>` part of a launch. The GPU copies it into `gridDim` and `blockDim`.
- grid: all blocks of one launch. Its size is `gridDim`.
- warp: a group of 32 threads that the GPU runs together ([Lesson 01](../Lesson-01/notes.md)).
- CUDA runtime: the library behind calls such as `cudaDeviceSynchronize()`. It checks the launch configuration against the hardware limits.
- `cudaGetLastError()`: returns the last CUDA error, for example from a launch that broke a limit.
- `__global__`: marks a function as a kernel, launched from the CPU and run on the GPU.
- format string: the first argument of `printf`. Each `%d` in it is replaced by the next argument, in order.
- `cudaDeviceSynchronize()`: makes the CPU wait until the GPU has finished. A launch alone returns right away.
- `nvcc`: the CUDA compiler. It compiles the CPU and GPU parts of a `.cu` file into one program.
- `-o`: sets the name of the output program. Without it the name is `a.out`.
