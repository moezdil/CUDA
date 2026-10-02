# 06 > Compiling CUDA on Linux

Lessons 00 to 04 compiled their programs with one short command. This lesson goes through every step of building and running a CUDA (Compute Unified Device Architecture) program on Linux, and adds the `-arch` flag that names the GPU (Graphics Processing Unit) you build for. It also shows why a kernel can print nothing when `cudaDeviceSynchronize()` is missing.

> [!NOTE]
> All outputs on this page come from an NVIDIA L40S with CUDA 13.0 on Ubuntu 24.

## Code

The program is in `code/project001.cu`:

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    // print the blocks and threads IDs
    // warp = 32 threads. (64 threads/block) --> (64/32 = 2 warps/block)
    int warp_ID_Value = 0;
    warp_ID_Value = threadIdx.x / 32;
    printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
           blockIdx.x, threadIdx.x, warp_ID_Value);
}

int main()
{
    // kernel_name<<<num_of_blocks, num_of_threads_per_block>>>();
    test01 <<<2, 64>>> ();
    cudaDeviceSynchronize();
    return 0;
}
```

The launch uses 2 blocks with 64 threads each, so 2 × 64 = 128 threads in total. Each block has 64 / 32 = 2 warps.

- The three `#include` lines bring in the CUDA runtime functions, the built-in variables like `blockIdx` and `threadIdx`, and `printf`.
- `__global__` marks `test01` as a kernel. The CPU (Central Processing Unit) launches it and the GPU runs it.
- `threadIdx.x / 32` gives the warp ID, because a warp is 32 threads. Both sides are whole numbers, so the remainder is dropped. Thread 45, for example, gets 45 / 32 = 1. Threads 0-31 get 0 and threads 32-63 get 1.
- `test01 <<<2, 64>>> ();` launches the kernel with 2 blocks of 64 threads.
- `cudaDeviceSynchronize();` makes the CPU wait for the GPU. The section on synchronization below shows why this line matters.

## Code Walkthrough

Step through the program in the order you would write it. The new part is the warp ID, which the kernel computes from `threadIdx.x`.

<div class="code-walk" markdown>

1. `1-3 cpu` **Headers.** The CUDA runtime, the built-in variables, and `stdio.h` for `printf`. These three lines start every program in these lessons.
2. `5-6,13 gpu` **The empty kernel.** Write `__global__ void test01()` and its braces first. Then fill the body line by line.
3. `7-8 gpu` **A plan in comments.** Before the code, write down what the kernel does and the numbers it relies on: 32 threads per warp, so 64 threads make 2 warps per block. Comments cost nothing at run time and make the next line easy to check.
4. `9-10 gpu` **The warp ID.** Declare `warp_ID_Value`, then set it to `threadIdx.x / 32`. Both sides are integers, so the division drops the remainder: thread 45 gets 1. End each line with `;`. The Compilation Errors section below shows what a missing one does.
5. `11-12 gpu` **The print.** One `printf` with three `%d`, filled by the block ID, the thread ID and the warp ID, in that order. A long call can go over two lines, because the compiler reads up to the `;` as one statement.
6. `15-16,20-21 cpu` **The main function.** Write `main` with `return 0;` at the end. Everything in it runs on the CPU.
7. `17-18 cpu` **The launch.** The comment repeats the pattern `kernel_name<<<num_of_blocks, num_of_threads_per_block>>>`, and the next line fills it in with 2 blocks of 64 threads. The spaces around `<<<2, 64>>>` are allowed. The compiler ignores them.
8. `19 cpu` **Wait for the GPU.** `cudaDeviceSynchronize();` is the line this lesson removes on purpose. On this machine the program printed nothing without it.

</div>

## Compile and Run

### Step 1: verify nvcc

First check that the CUDA compiler is installed and see which version it is. If this command fails, nothing else in this lesson will work.

```bash
nvcc --version
```

- `nvcc` (NVIDIA CUDA Compiler) is the CUDA compiler.
- `--version` prints the compiler version and exits. It does not compile anything.

Output on this machine:

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Aug_20_01:58:59_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.88
Build cuda_13.0.r13.0/compiler.36424714_0
```

The important line is `release 13.0, V13.0.88`. It says this is CUDA 13.0. The other lines are the tool name, the copyright, and the build date and ID of the compiler.

### Step 2: compile

Now turn the source file into a program the machine can run. This is the same command as in Lessons 00 to 05:

```bash
nvcc -o project001 project001.cu
```

- `nvcc` compiles both the CPU code and the GPU code in the `.cu` file.
- `-o project001` sets the name of the output program. Without `-o`, the name is `a.out`. Always using `-o` avoids confusion.
- `project001.cu` is the source file.

> [!WARNING]
> If a file named `project001` already exists, `-o project001` overwrites it without asking.

Check that the program file exists:

```bash
ls -lh project001
```

- `ls` lists files.
- `-l` shows the long format with permissions, owner, size, and date.
- `-h` shows the size in a human-readable unit, like `K` or `M`.

```
-rwxrwxr-x 1 ubuntu ubuntu 966K Jun  9 21:58 project001
```

The line starts with `-`, so it is a normal file. The `x` letters in `rwxrwxr-x` mean the file can be run. `ubuntu ubuntu` is the owner and group. `966K` is the size of the program, about 966 KB (kilobytes). Then come the date and time it was built and its name. If the compile had failed, `ls` would report that the file does not exist.

### Step 3: name the GPU architecture

Without `-arch`, `nvcc` picks a safe, generic default target. It is better to name the GPU you build for. The L40S has compute capability (CC) 8.9 (see [Lesson 03](../Lesson-03/notes.md)), and its architecture name is `sm_89`:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

- `-arch=sm_89` builds for compute capability 8.9, the L40S. The number is the CC without the dot: 8.9 becomes `89`.
- `-o project001` and `project001.cu` are the same as before.

From here on, every lesson compiles with `-arch=sm_89`. On another GPU, put in its own CC, for example `-arch=sm_80` for CC 8.0. [Lesson 05](../Lesson-05/notes.md) explains what the compiler builds for this target.

Check that this toolkit supports sm_89:

```bash
nvcc --help | grep sm_89
```

- `nvcc --help` prints all compiler options and their allowed values.
- `|` sends that text to the next command instead of the screen.
- `grep sm_89` keeps only the lines that contain `sm_89`.

```
        'sm_75','sm_80','sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
        'sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
```

Each line is part of a list of allowed values in the help text. `grep` prints every line that matches, so `sm_89` shows up twice. Any match means this toolkit can build for the L40S. If there were no output, `-arch=sm_89` would not work with this `nvcc`.

### Step 4: run

Run the program you just built.

```bash
./project001
```

- `./` means "in the current folder". Linux does not look in the current folder for programs by default, so you have to say it.
- `project001` is the program name you set with `-o`.

## The Synchronization Problem

At the kernel launch line, the CPU sends the kernel to the GPU. It does not wait. It goes straight to the next line. If that line is `return 0`, the program ends before the GPU prints anything.

To see this, remove the `cudaDeviceSynchronize();` line, compile again, and run the program three times. On this machine the program never printed anything:

```bash
$ ./project001
$
$ ./project001
$
$ ./project001
$
```

The `$` is the shell prompt. It is not part of the command. After each `./project001` the next line is an empty prompt, so none of the three runs printed anything. The kernel did run on the GPU. But the program ended before the GPU's print buffer was flushed (written out to the terminal).

> [!WARNING]
> Missing output depends on timing. On this machine it never appeared, but on another machine, driver or OS (operating system) you may see some or all of the lines in some runs. Never rely on that: without `cudaDeviceSynchronize()`, the CPU does not wait for the GPU.

`cudaDeviceSynchronize()` makes the CPU wait at that line until all GPU threads finish. When it returns, the print buffer is flushed and all output is on the terminal. Every run then prints the full output.

Put the line back, then compile and run again:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
./project001
```

- The first line rebuilds the program, so the change in the source file is included. Running the old program would still show the old behavior.
- The second line runs the new program.

<kernel-sync cmd="./project001" out="The block ID is 0 --- The thread ID is 0 --- The warp ID 0|The block ID is 0 --- The thread ID is 1 --- The warp ID 0|... 128 lines in total"></kernel-sync>

## Output

This is the full output of `./project001` with `cudaDeviceSynchronize()` and `<<<2, 64>>>` (128 lines). Each line comes from one GPU thread.

```
The block ID is 0 --- The thread ID is 0 --- The warp ID 0
The block ID is 0 --- The thread ID is 1 --- The warp ID 0
The block ID is 0 --- The thread ID is 2 --- The warp ID 0
The block ID is 0 --- The thread ID is 3 --- The warp ID 0
The block ID is 0 --- The thread ID is 4 --- The warp ID 0
The block ID is 0 --- The thread ID is 5 --- The warp ID 0
The block ID is 0 --- The thread ID is 6 --- The warp ID 0
The block ID is 0 --- The thread ID is 7 --- The warp ID 0
The block ID is 0 --- The thread ID is 8 --- The warp ID 0
The block ID is 0 --- The thread ID is 9 --- The warp ID 0
The block ID is 0 --- The thread ID is 10 --- The warp ID 0
The block ID is 0 --- The thread ID is 11 --- The warp ID 0
The block ID is 0 --- The thread ID is 12 --- The warp ID 0
The block ID is 0 --- The thread ID is 13 --- The warp ID 0
The block ID is 0 --- The thread ID is 14 --- The warp ID 0
The block ID is 0 --- The thread ID is 15 --- The warp ID 0
The block ID is 0 --- The thread ID is 16 --- The warp ID 0
The block ID is 0 --- The thread ID is 17 --- The warp ID 0
The block ID is 0 --- The thread ID is 18 --- The warp ID 0
The block ID is 0 --- The thread ID is 19 --- The warp ID 0
The block ID is 0 --- The thread ID is 20 --- The warp ID 0
The block ID is 0 --- The thread ID is 21 --- The warp ID 0
The block ID is 0 --- The thread ID is 22 --- The warp ID 0
The block ID is 0 --- The thread ID is 23 --- The warp ID 0
The block ID is 0 --- The thread ID is 24 --- The warp ID 0
The block ID is 0 --- The thread ID is 25 --- The warp ID 0
The block ID is 0 --- The thread ID is 26 --- The warp ID 0
The block ID is 0 --- The thread ID is 27 --- The warp ID 0
The block ID is 0 --- The thread ID is 28 --- The warp ID 0
The block ID is 0 --- The thread ID is 29 --- The warp ID 0
The block ID is 0 --- The thread ID is 30 --- The warp ID 0
The block ID is 0 --- The thread ID is 31 --- The warp ID 0
The block ID is 0 --- The thread ID is 32 --- The warp ID 1
The block ID is 0 --- The thread ID is 33 --- The warp ID 1
The block ID is 0 --- The thread ID is 34 --- The warp ID 1
The block ID is 0 --- The thread ID is 35 --- The warp ID 1
The block ID is 0 --- The thread ID is 36 --- The warp ID 1
The block ID is 0 --- The thread ID is 37 --- The warp ID 1
The block ID is 0 --- The thread ID is 38 --- The warp ID 1
The block ID is 0 --- The thread ID is 39 --- The warp ID 1
The block ID is 0 --- The thread ID is 40 --- The warp ID 1
The block ID is 0 --- The thread ID is 41 --- The warp ID 1
The block ID is 0 --- The thread ID is 42 --- The warp ID 1
The block ID is 0 --- The thread ID is 43 --- The warp ID 1
The block ID is 0 --- The thread ID is 44 --- The warp ID 1
The block ID is 0 --- The thread ID is 45 --- The warp ID 1
The block ID is 0 --- The thread ID is 46 --- The warp ID 1
The block ID is 0 --- The thread ID is 47 --- The warp ID 1
The block ID is 0 --- The thread ID is 48 --- The warp ID 1
The block ID is 0 --- The thread ID is 49 --- The warp ID 1
The block ID is 0 --- The thread ID is 50 --- The warp ID 1
The block ID is 0 --- The thread ID is 51 --- The warp ID 1
The block ID is 0 --- The thread ID is 52 --- The warp ID 1
The block ID is 0 --- The thread ID is 53 --- The warp ID 1
The block ID is 0 --- The thread ID is 54 --- The warp ID 1
The block ID is 0 --- The thread ID is 55 --- The warp ID 1
The block ID is 0 --- The thread ID is 56 --- The warp ID 1
The block ID is 0 --- The thread ID is 57 --- The warp ID 1
The block ID is 0 --- The thread ID is 58 --- The warp ID 1
The block ID is 0 --- The thread ID is 59 --- The warp ID 1
The block ID is 0 --- The thread ID is 60 --- The warp ID 1
The block ID is 0 --- The thread ID is 61 --- The warp ID 1
The block ID is 0 --- The thread ID is 62 --- The warp ID 1
The block ID is 0 --- The thread ID is 63 --- The warp ID 1
The block ID is 1 --- The thread ID is 0 --- The warp ID 0
The block ID is 1 --- The thread ID is 1 --- The warp ID 0
The block ID is 1 --- The thread ID is 2 --- The warp ID 0
The block ID is 1 --- The thread ID is 3 --- The warp ID 0
The block ID is 1 --- The thread ID is 4 --- The warp ID 0
The block ID is 1 --- The thread ID is 5 --- The warp ID 0
The block ID is 1 --- The thread ID is 6 --- The warp ID 0
The block ID is 1 --- The thread ID is 7 --- The warp ID 0
The block ID is 1 --- The thread ID is 8 --- The warp ID 0
The block ID is 1 --- The thread ID is 9 --- The warp ID 0
The block ID is 1 --- The thread ID is 10 --- The warp ID 0
The block ID is 1 --- The thread ID is 11 --- The warp ID 0
The block ID is 1 --- The thread ID is 12 --- The warp ID 0
The block ID is 1 --- The thread ID is 13 --- The warp ID 0
The block ID is 1 --- The thread ID is 14 --- The warp ID 0
The block ID is 1 --- The thread ID is 15 --- The warp ID 0
The block ID is 1 --- The thread ID is 16 --- The warp ID 0
The block ID is 1 --- The thread ID is 17 --- The warp ID 0
The block ID is 1 --- The thread ID is 18 --- The warp ID 0
The block ID is 1 --- The thread ID is 19 --- The warp ID 0
The block ID is 1 --- The thread ID is 20 --- The warp ID 0
The block ID is 1 --- The thread ID is 21 --- The warp ID 0
The block ID is 1 --- The thread ID is 22 --- The warp ID 0
The block ID is 1 --- The thread ID is 23 --- The warp ID 0
The block ID is 1 --- The thread ID is 24 --- The warp ID 0
The block ID is 1 --- The thread ID is 25 --- The warp ID 0
The block ID is 1 --- The thread ID is 26 --- The warp ID 0
The block ID is 1 --- The thread ID is 27 --- The warp ID 0
The block ID is 1 --- The thread ID is 28 --- The warp ID 0
The block ID is 1 --- The thread ID is 29 --- The warp ID 0
The block ID is 1 --- The thread ID is 30 --- The warp ID 0
The block ID is 1 --- The thread ID is 31 --- The warp ID 0
The block ID is 1 --- The thread ID is 32 --- The warp ID 1
The block ID is 1 --- The thread ID is 33 --- The warp ID 1
The block ID is 1 --- The thread ID is 34 --- The warp ID 1
The block ID is 1 --- The thread ID is 35 --- The warp ID 1
The block ID is 1 --- The thread ID is 36 --- The warp ID 1
The block ID is 1 --- The thread ID is 37 --- The warp ID 1
The block ID is 1 --- The thread ID is 38 --- The warp ID 1
The block ID is 1 --- The thread ID is 39 --- The warp ID 1
The block ID is 1 --- The thread ID is 40 --- The warp ID 1
The block ID is 1 --- The thread ID is 41 --- The warp ID 1
The block ID is 1 --- The thread ID is 42 --- The warp ID 1
The block ID is 1 --- The thread ID is 43 --- The warp ID 1
The block ID is 1 --- The thread ID is 44 --- The warp ID 1
The block ID is 1 --- The thread ID is 45 --- The warp ID 1
The block ID is 1 --- The thread ID is 46 --- The warp ID 1
The block ID is 1 --- The thread ID is 47 --- The warp ID 1
The block ID is 1 --- The thread ID is 48 --- The warp ID 1
The block ID is 1 --- The thread ID is 49 --- The warp ID 1
The block ID is 1 --- The thread ID is 50 --- The warp ID 1
The block ID is 1 --- The thread ID is 51 --- The warp ID 1
The block ID is 1 --- The thread ID is 52 --- The warp ID 1
The block ID is 1 --- The thread ID is 53 --- The warp ID 1
The block ID is 1 --- The thread ID is 54 --- The warp ID 1
The block ID is 1 --- The thread ID is 55 --- The warp ID 1
The block ID is 1 --- The thread ID is 56 --- The warp ID 1
The block ID is 1 --- The thread ID is 57 --- The warp ID 1
The block ID is 1 --- The thread ID is 58 --- The warp ID 1
The block ID is 1 --- The thread ID is 59 --- The warp ID 1
The block ID is 1 --- The thread ID is 60 --- The warp ID 1
The block ID is 1 --- The thread ID is 61 --- The warp ID 1
The block ID is 1 --- The thread ID is 62 --- The warp ID 1
The block ID is 1 --- The thread ID is 63 --- The warp ID 1
```

How to read it:

- There are 128 lines because 2 blocks × 64 threads = 128 threads, and each thread calls `printf` once.
- The thread ID goes from 0 to 63 in block 0 and then starts at 0 again in block 1. `threadIdx.x` counts inside a block, not across the whole launch.
- The warp ID is 0 for threads 0-31 and 1 for threads 32-63, because `threadIdx.x / 32` is integer division. Since the thread ID restarts in each block, the warp ID does too.

On this machine, block 0 printed before block 1 in both runs. A second run gave the same 128 lines in the same order. Block order is still not guaranteed on other runs or machines.

## Compilation Errors

To see how the compiler reports errors, remove the `;` at the end of `warp_ID_Value = threadIdx.x / 32` (line 10). Then compile again:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

This is the same compile command as before. This time it fails, so no new program is written.

Output on this machine:

```
project001.cu(9): error: expected a ";"
      printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
      ^

1 error detected in the compilation of "project001.cu".
```

How to read it:

- `project001.cu(9)` is the file name and the line number, in brackets.
- `error: expected a ";"` says what the compiler was looking for.
- The next line repeats the source line, and the `^` marks the spot where the compiler noticed the problem.
- The last line counts the errors in the file.

The error points to the `printf` line, not the line where the semicolon is missing. The compiler only sees the problem when it reaches the next word, which is on the `printf` line.

> [!TIP]
> When the compiler reports an error on a line that looks fine, check the line just before it. A missing `;` or `)` is usually found one line too late.

> [!NOTE]
> This capture was made before the two comment lines were added to the kernel, so it says line 9. With the file shown above, the semicolon is missing on line 10 and the error points to line 11.

Put the semicolon back, compile again, and check that the build has no errors.

## This Machine

| Setting | Value |
|---|---|
| CUDA release | 13.0 |
| GPU | NVIDIA L40S (46 GB, Ada Lovelace, CC 8.9, `sm_89`) |
| OS | native Ubuntu 24 |
| Access | SSH (Secure Shell) from another computer |

The commands in this lesson work the same way on other Linux machines. Only the `-arch` value changes with the GPU.

## Summary

| Step | Command |
|---|---|
| Check compiler | `nvcc --version` |
| Compile | `nvcc -o project001 project001.cu` |
| Compile (L40S) | `nvcc -arch=sm_89 -o project001 project001.cu` |
| Run | `./project001` |

Add `cudaDeviceSynchronize()` after a kernel launch when the CPU needs the GPU's output or results before the program ends. Without it, this machine prints nothing at all.

## Write It Yourself

Write, compile and run a program of your own with the full cycle from this lesson.

1. Create `warps.cu` with the skeleton below.
2. In the kernel, let only thread 0 of each block print how many warps its block has, using `blockDim.x / 32`.
3. Launch 3 blocks of 96 threads.
4. Compile with `-arch=sm_89` (or your own GPU's value), then run it.
5. Remove `cudaDeviceSynchronize();`, compile again, and run it a few times to see what changes.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void countWarps()
{
    // TODO: only thread 0 of each block prints
    // TODO: print "block b has w warps", with w = threads per block / 32
}

int main()
{
    // TODO: launch countWarps with 3 blocks of 96 threads
    // TODO: wait for the GPU
    return 0;
}
```

??? tip "Hint"
    `if (threadIdx.x == 0)` picks one thread per block, because every block has its own thread 0. Compile with `nvcc -arch=sm_89 -o warps warps.cu`.

??? note "Solution"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void countWarps()
    {
        if (threadIdx.x == 0) {
            printf("block %d has %d warps\n", blockIdx.x, blockDim.x / 32);
        }
    }

    int main()
    {
        countWarps<<<3, 96>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Compile and run it with `nvcc -arch=sm_89 -o warps warps.cu` and `./warps`. You should see 3 lines, `block 0 has 3 warps`, `block 1 has 3 warps` and `block 2 has 3 warps`, in any order, because 96 / 32 = 3.

## Glossary

- `nvcc` (NVIDIA CUDA Compiler): the CUDA compiler driver. It handles host and device code in the same `.cu` file.
- `-o`: sets the output program name. The default is `a.out`.
- `-arch=sm_89`: compile for compute capability 8.9, which is the L40S (Ada Lovelace).
- CC (compute capability): the version number of a GPU generation, such as 8.9. See [Lesson 03](../Lesson-03/notes.md).
- `cudaDeviceSynchronize()`: makes the CPU wait until all GPU work launched so far is done.
- warp ID: the warp a thread belongs to inside its block. It is `threadIdx.x / 32`.
- SSH (Secure Shell): a way to log in to another computer over the network and run commands there.
- CUDA runtime: the library behind calls such as `cudaDeviceSynchronize()`. The header `cuda_runtime.h` declares its functions.
- `__global__`: marks a function as a kernel, launched from the CPU and run on the GPU.
- warp: a group of 32 threads that the GPU runs together. 64 threads per block make 2 warps.
- integer division: a division of two whole numbers that drops the remainder. 45 / 32 = 1 and 63 / 32 = 1, but 64 / 32 = 2.
- `printf`: C's print function. In a kernel every thread runs it, and its lines go to the print buffer first.
- print buffer: the GPU memory where kernel `printf` lines wait. It is flushed to the terminal at `cudaDeviceSynchronize()`.
- shell prompt: the text the shell shows while it waits for a command, often ending in `$`. You do not type it.
- OS (operating system): the base software of a computer. Here it is Ubuntu 24, a Linux system.
- semicolon: the `;` that ends every C and C++ statement. If one is missing, the compiler reports the error at the start of the next statement.
- L40S: the NVIDIA data center GPU these lessons run on, with the Ada Lovelace architecture, CC 8.9 and 142 SMs.
- Ada Lovelace: NVIDIA's GPU architecture from 2022 with CC 8.9, used in the L40S and the GeForce RTX 40 series.
