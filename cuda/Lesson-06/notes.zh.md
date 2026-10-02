# 06 > 在 Linux 上编译 CUDA

第 00 课到第 04 课都只用一条简短的命令来编译程序。这节课会一步一步讲清楚在 Linux 上构建和运行 CUDA（Compute Unified Device Architecture，统一计算设备架构）程序的全过程，还会加上 `-arch` 选项，用来指定你要为哪款 GPU（Graphics Processing Unit，图形处理器）编译。这节课也会说明，为什么缺少 `cudaDeviceSynchronize()` 时，核函数可能什么都不打印。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，使用 CUDA 13.0，系统是 Ubuntu 24。

## 代码

程序在 `code/project001.cu` 里：

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

这次启动用了 2 个线程块，每个线程块 64 个线程，所以一共是 2 × 64 = 128 个线程。每个线程块有 64 / 32 = 2 个线程束。

- 三行 `#include` 引入了 CUDA 运行时函数、`blockIdx` 和 `threadIdx` 这样的内置变量，以及 `printf`。
- `__global__` 把 `test01` 标记为核函数。由 CPU（Central Processing Unit，中央处理器）启动，由 GPU 运行。
- 一个线程束有 32 个线程，所以 `threadIdx.x / 32` 得到的就是线程束编号。两边都是整数，所以余数会被丢掉。比如线程 45 得到 45 / 32 = 1。线程 0-31 得到 0，线程 32-63 得到 1。
- `test01 <<<2, 64>>> ();` 用 2 个各有 64 个线程的线程块启动核函数。
- `cudaDeviceSynchronize();` 让 CPU 等待 GPU。下面讲同步的那一节会说明这一行为什么重要。

## 代码逐步讲解

按照你写代码的顺序，一步一步看这个程序。新的部分是线程束编号，核函数用 `threadIdx.x` 把它算出来。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** CUDA 运行时、内置变量，以及 `printf` 需要的 `stdio.h`。这些课里的每个程序都以这三行开头。
2. `5-6,13 gpu` **空的核函数。** 先写出 `__global__ void test01()` 和它的花括号，然后一行一行地填函数体。
3. `7-8 gpu` **用注释写下计划。** 在写代码之前，先写下核函数要做什么，以及它依赖的数字：每个线程束 32 个线程，所以 64 个线程就是每个线程块 2 个线程束。注释在运行时没有任何开销，还能让下一行很容易检查。
4. `9-10 gpu` **线程束编号。** 先声明 `warp_ID_Value`，再把它设为 `threadIdx.x / 32`。两边都是整数，所以除法会丢掉余数：线程 45 得到 1。每一行都以 `;` 结尾。下面的“编译错误”一节展示了漏掉一个分号会怎样。
5. `11-12 gpu` **打印。** 一个带三个 `%d` 的 `printf`，依次由线程块编号、线程编号和线程束编号来填。一个很长的调用可以分成两行写，因为编译器会把直到 `;` 为止的内容读成一条语句。
6. `15-16,20-21 cpu` **main 函数。** 写好 `main`，最后是 `return 0;`。它里面的所有代码都在 CPU 上运行。
7. `17-18 cpu` **启动核函数。** 注释重复了 `kernel_name<<<num_of_blocks, num_of_threads_per_block>>>` 这个模式，下一行用 2 个线程块、每块 64 个线程把它填好。`<<<2, 64>>>` 两边的空格是允许的，编译器会忽略它们。
8. `19 cpu` **等待 GPU。** `cudaDeviceSynchronize();` 就是这节课故意删掉的那一行。在这台机器上，没有它时程序什么都没打印。

</div>

## 编译和运行

### 第 1 步：检查 nvcc

先确认 CUDA 编译器已经安装好，并看看它是哪个版本。如果这条命令失败，这节课后面的内容都没法进行。

```bash
nvcc --version
```

- `nvcc`（NVIDIA CUDA Compiler，NVIDIA CUDA 编译器）就是 CUDA 编译器。
- `--version` 打印编译器版本后就退出，不会编译任何东西。

这台机器上的输出：

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Aug_20_01:58:59_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.88
Build cuda_13.0.r13.0/compiler.36424714_0
```

最重要的是 `release 13.0, V13.0.88` 这一行。它说明这是 CUDA 13.0。其他几行是工具名称、版权信息，以及编译器的构建日期和编号。

### 第 2 步：编译

现在把源文件变成机器可以运行的程序。这和第 00 课到第 05 课用的是同一条命令：

```bash
nvcc -o project001 project001.cu
```

- `nvcc` 会同时编译 `.cu` 文件里的 CPU 代码和 GPU 代码。
- `-o project001` 设置输出程序的名字。不加 `-o` 的话，名字是 `a.out`。始终加上 `-o` 可以避免混淆。
- `project001.cu` 是源文件。

> [!WARNING]
> 如果已经有一个名叫 `project001` 的文件，`-o project001` 会直接覆盖它，不会询问你。

检查程序文件是否存在：

```bash
ls -lh project001
```

- `ls` 列出文件。
- `-l` 用长格式显示，包括权限、所有者、大小和日期。
- `-h` 用人容易读的单位显示大小，比如 `K` 或 `M`。

```
-rwxrwxr-x 1 ubuntu ubuntu 966K Jun  9 21:58 project001
```

这一行以 `-` 开头，说明它是一个普通文件。`rwxrwxr-x` 里的 `x` 表示这个文件可以运行。`ubuntu ubuntu` 是所有者和所属组。`966K` 是程序的大小，大约 966 KB（kilobytes，千字节）。后面是它的构建日期、时间和文件名。如果编译失败了，`ls` 会报告这个文件不存在。

### 第 3 步：指定 GPU 架构

不加 `-arch` 时，`nvcc` 会选一个保险的通用默认目标。最好还是明确指定你要为哪款 GPU 编译。L40S 的计算能力（CC，compute capability）是 8.9（见[第 03 课](../Lesson-03/notes.md)），它的架构名是 `sm_89`：

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

- `-arch=sm_89` 为计算能力 8.9，也就是 L40S 编译。这个数字就是去掉小数点的 CC：8.9 变成 `89`。
- `-o project001` 和 `project001.cu` 跟之前一样。

从这里开始，每节课都用 `-arch=sm_89` 来编译。换成其他 GPU 时，就填它自己的 CC，比如 CC 8.0 就用 `-arch=sm_80`。[第 05 课](../Lesson-05/notes.md)讲了编译器为这个目标生成了什么。

检查这个工具包是否支持 sm_89：

```bash
nvcc --help | grep sm_89
```

- `nvcc --help` 打印编译器的所有选项以及它们允许的取值。
- `|` 把这些文字交给下一条命令，而不是显示在屏幕上。
- `grep sm_89` 只保留包含 `sm_89` 的行。

```
        'sm_75','sm_80','sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
        'sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
```

每一行都是帮助文字里某个允许取值列表的一部分。`grep` 会打印所有匹配的行，所以 `sm_89` 出现了两次。只要有匹配，就说明这个工具包能为 L40S 编译。如果没有任何输出，`-arch=sm_89` 就不能和这个 `nvcc` 一起用。

### 第 4 步：运行

运行你刚刚构建好的程序。

```bash
./project001
```

- `./` 的意思是“在当前文件夹里”。Linux 默认不会在当前文件夹里查找程序，所以你必须写明。
- `project001` 是你用 `-o` 设置的程序名。

## 同步问题

执行到启动核函数的那一行时，CPU 会把核函数交给 GPU。它不会等待，而是直接去执行下一行。如果下一行是 `return 0`，程序就会在 GPU 打印任何东西之前结束。

想亲眼看看，就删掉 `cudaDeviceSynchronize();` 这一行，重新编译，然后把程序运行三次。在这台机器上，程序一次都没有打印出任何内容：

```bash
$ ./project001
$
$ ./project001
$
$ ./project001
$
```

`$` 是 shell 的提示符，不是命令的一部分。每次 `./project001` 之后，下一行都是一个空的提示符，所以三次运行都没有打印出任何东西。核函数确实在 GPU 上运行了。但程序在 GPU 的打印缓冲区被刷新（也就是写到终端上）之前就结束了。

> [!WARNING]
> 输出会不会丢失取决于时机。在这台机器上它从来没有出现过，但换一台机器、一个驱动或一个 OS（operating system，操作系统），你可能在某些运行中看到部分或全部的输出行。千万不要依赖这一点：没有 `cudaDeviceSynchronize()`，CPU 就不会等待 GPU。

`cudaDeviceSynchronize()` 让 CPU 停在这一行，直到所有 GPU 线程都执行完毕。它返回时，打印缓冲区已经被刷新，所有输出都已经显示在终端上。这样每次运行都会打印出完整的输出。

把这一行加回去，然后重新编译并运行：

```bash
nvcc -arch=sm_89 -o project001 project001.cu
./project001
```

- 第一行重新构建程序，这样源文件里的改动才会生效。运行旧程序的话，看到的还是旧的行为。
- 第二行运行新程序。

<kernel-sync cmd="./project001" out="The block ID is 0 --- The thread ID is 0 --- The warp ID 0|The block ID is 0 --- The thread ID is 1 --- The warp ID 0|... 128 lines in total"></kernel-sync>

## 输出

下面是带有 `cudaDeviceSynchronize()` 和 `<<<2, 64>>>` 时 `./project001` 的完整输出（128 行）。每一行都来自一个 GPU 线程。

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

怎么看这段输出：

- 一共有 128 行，因为 2 个线程块 × 64 个线程 = 128 个线程，每个线程调用一次 `printf`。
- 在线程块 0 里，线程编号从 0 到 63，到了线程块 1 又从 0 开始。`threadIdx.x` 是在线程块内部计数的，不是在整次启动范围内计数。
- 线程 0-31 的线程束编号是 0，线程 32-63 的是 1，因为 `threadIdx.x / 32` 是整数除法。线程编号在每个线程块里都会重新开始，所以线程束编号也一样。

在这台机器上，两次运行中线程块 0 都在线程块 1 之前打印。第二次运行得到了同样顺序的同样 128 行。但在其他运行或其他机器上，线程块的顺序仍然没有保证。

## 编译错误

想看看编译器是怎么报告错误的，就删掉 `warp_ID_Value = threadIdx.x / 32` 末尾的 `;`（第 10 行），然后重新编译：

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

这和之前是同一条编译命令。这次它会失败，所以不会写出新的程序。

这台机器上的输出：

```
project001.cu(9): error: expected a ";"
      printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
      ^

1 error detected in the compilation of "project001.cu".
```

怎么看这段输出：

- `project001.cu(9)` 是文件名，括号里是行号。
- `error: expected a ";"` 说明编译器在找什么。
- 下一行重复了那一行源代码，`^` 标出了编译器发现问题的位置。
- 最后一行统计这个文件里的错误数。

错误指向的是 `printf` 那一行，而不是缺少分号的那一行。编译器要读到下一个词才会发现问题，而那个词在 `printf` 那一行上。

> [!TIP]
> 如果编译器在一行看起来没问题的代码上报错，就检查一下它的上一行。缺少的 `;` 或 `)` 通常会晚一行才被发现。

> [!NOTE]
> 这段输出是在核函数里加上那两行注释之前截取的，所以显示的是第 9 行。按照上面给出的文件，缺少分号的是第 10 行，错误会指向第 11 行。

把分号加回去，重新编译，确认构建没有错误。

## 这台机器

| 设置 | 值 |
|---|---|
| CUDA 版本 | 13.0 |
| GPU | NVIDIA L40S（46 GB，Ada Lovelace，CC 8.9，`sm_89`） |
| OS | 原生 Ubuntu 24 |
| 访问方式 | 从另一台电脑通过 SSH（Secure Shell，安全外壳协议）登录 |

这节课的命令在其他 Linux 机器上也一样能用。只有 `-arch` 的值会随 GPU 而变。

## 小结

| 步骤 | 命令 |
|---|---|
| 检查编译器 | `nvcc --version` |
| 编译 | `nvcc -o project001 project001.cu` |
| 编译（L40S） | `nvcc -arch=sm_89 -o project001 project001.cu` |
| 运行 | `./project001` |

如果 CPU 需要在程序结束前拿到 GPU 的输出或结果，就在启动核函数之后加上 `cudaDeviceSynchronize()`。没有它，这台机器上什么都不会打印。

## 自己动手写

用这节课的完整流程，自己写、编译并运行一个程序。

1. 用下面的框架创建 `warps.cu`。
2. 在核函数里，只让每个线程块的线程 0 打印它的线程块有多少个线程束，用 `blockDim.x / 32` 来算。
3. 启动 3 个线程块，每块 96 个线程。
4. 用 `-arch=sm_89`（或者你自己 GPU 对应的值）编译，然后运行。
5. 删掉 `cudaDeviceSynchronize();`，重新编译，再运行几次，看看有什么变化。

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

??? tip "提示"
    `if (threadIdx.x == 0)` 在每个线程块里选出一个线程，因为每个线程块都有自己的线程 0。用 `nvcc -arch=sm_89 -o warps warps.cu` 编译。

??? note "答案"
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

    用 `nvcc -arch=sm_89 -o warps warps.cu` 和 `./warps` 编译并运行。你应该会看到 3 行：`block 0 has 3 warps`、`block 1 has 3 warps` 和 `block 2 has 3 warps`，顺序任意，因为 96 / 32 = 3。

## 术语表

- `nvcc`（NVIDIA CUDA Compiler，NVIDIA CUDA 编译器）：CUDA 编译器驱动程序。它能处理同一个 `.cu` 文件里的主机端代码和设备端代码。
- `-o`：设置输出程序的名字。默认是 `a.out`。
- `-arch=sm_89`：为计算能力 8.9 编译，也就是 L40S（Ada Lovelace）。
- CC（compute capability，计算能力）：一代 GPU 的版本号，比如 8.9。见[第 03 课](../Lesson-03/notes.md)。
- `cudaDeviceSynchronize()`：让 CPU 等待，直到目前已启动的所有 GPU 工作都完成。
- 线程束编号（warp ID）：线程在自己的线程块里属于哪个线程束。它等于 `threadIdx.x / 32`。
- SSH（Secure Shell，安全外壳协议）：通过网络登录另一台电脑并在上面运行命令的方式。
- CUDA 运行时（CUDA runtime）：`cudaDeviceSynchronize()` 这类调用背后的库。头文件 `cuda_runtime.h` 声明了它的函数。
- `__global__`：把一个函数标记为核函数，由 CPU 启动，在 GPU 上运行。
- 线程束（warp）：GPU 一起运行的 32 个线程。每个线程块 64 个线程就是 2 个线程束。
- 整数除法（integer division）：两个整数相除并丢掉余数。45 / 32 = 1，63 / 32 = 1，而 64 / 32 = 2。
- `printf`：C 的打印函数。在核函数里每个线程都会运行它，输出的行先进入打印缓冲区。
- 打印缓冲区（print buffer）：GPU 内存里存放核函数 `printf` 输出行的地方。它在 `cudaDeviceSynchronize()` 时被刷新到终端上。
- 提示符（shell prompt）：shell 等待命令时显示的文字，通常以 `$` 结尾。你不用输入它。
- OS（operating system，操作系统）：电脑的基础软件。这里是 Ubuntu 24，一个 Linux 系统。
- 分号（semicolon）：每条 C 和 C++ 语句末尾的 `;`。少了一个时，编译器会在下一条语句的开头报错。
- L40S：这些课运行所用的 NVIDIA 数据中心 GPU，Ada Lovelace 架构，CC 8.9，142 个 SM。
- Ada Lovelace：NVIDIA 2022 年推出的 GPU 架构，CC 8.9，用于 L40S 和 GeForce RTX 40 系列。
