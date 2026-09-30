# 第 06 课：在 Linux 上编译 CUDA

这节课教你在 Linux 上编译和运行 CUDA 程序。它还会告诉你，为什么少了 `cudaDeviceSynchronize()`，核函数可能什么都打印不出来。

> [!NOTE]
> 视频里用的是 Windows 11 + WSL2（Ubuntu）和 CUDA 11.5。本页用的是原生 Linux（Ubuntu 24）、CUDA 13.0 和一块 NVIDIA L40S（46 GB，Ada Lovelace，sm_89）。两个版本的编译命令是一样的。

## 源文件：`project001.cu`

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

这次启动用了 2 个线程块，每个 64 个线程，一共 128 个线程。每个线程块有 64 / 32 = 2 个线程束。

- 三行 `#include` 引入了 CUDA 运行时函数、`blockIdx` 和 `threadIdx` 这样的内置变量，以及 `printf`。
- `__global__` 把 `test01` 标记为核函数。由 CPU 启动，在 GPU 上运行。
- `threadIdx.x / 32` 得到线程束编号，因为一个线程束是 32 个线程。线程 0-31 得到 0，线程 32-63 得到 1。
- `test01 <<<2, 64>>> ();` 用 2 个线程块、每个 64 个线程来启动核函数。
- `cudaDeviceSynchronize();` 让 CPU 等待 GPU。下面讲同步的那一节会说明这一行为什么重要。

## 第 1 步：检查 nvcc

先确认 CUDA 编译器已经安装好，并看看它的版本。如果这条命令失败了，这节课后面的内容都做不了。

```bash
nvcc --version
```

- `nvcc` 是 CUDA 编译器。
- `--version` 打印编译器版本后就退出，不会编译任何东西。

在这台机器上的输出：

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Aug_20_01:58:59_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.88
Build cuda_13.0.r13.0/compiler.36424714_0
```

最重要的是 `release 13.0, V13.0.88` 这一行，它说明这是 CUDA 13.0。其他几行分别是工具名称、版权信息，以及编译器的构建日期和编号。

## 第 2 步：编译

现在把源文件变成机器能运行的程序。

```bash
nvcc -o project001 project001.cu
```

- `nvcc` 会同时编译 `.cu` 文件里的 CPU 代码和 GPU 代码。
- `-o project001` 设置输出程序的名字。不加 `-o` 的话，程序名是 `a.out`。每次都加上 `-o`，可以避免混淆。
- `project001.cu` 是源文件。

> [!WARNING]
> 如果已经有一个叫 `project001` 的文件，`-o project001` 会直接覆盖它，不会问你。

检查程序文件是否已经生成：

```bash
ls -lh project001
```

- `ls` 列出文件。
- `-l` 用长格式显示，包括权限、所有者、大小和日期。
- `-h` 用容易看懂的单位显示大小，比如 `K` 或 `M`。

```
-rwxrwxr-x 1 ubuntu ubuntu 966K Jun  9 21:58 project001
```

这一行以 `-` 开头，说明它是一个普通文件。`rwxrwxr-x` 里的 `x` 表示这个文件可以运行。`ubuntu ubuntu` 是所有者和所属组。`966K` 是程序的大小。后面是它的构建日期、时间和文件名。如果编译失败了，`ls` 会提示这个文件不存在。

## 第 3 步：运行

运行你刚刚编译好的程序。

```bash
./project001
```

- `./` 的意思是“在当前文件夹里”。Linux 默认不会在当前文件夹里找程序，所以你必须写明。
- `project001` 是你用 `-o` 设置的程序名。

## 同步问题

执行到启动核函数的那一行时，CPU 把核函数发给 GPU。它不会等待，而是直接执行下一行。如果下一行是 `return 0`，程序会在 GPU 打印任何内容之前就结束。

想亲眼看看的话，删掉 `cudaDeviceSynchronize();` 这一行，重新编译，然后运行程序三次。在这台机器上，程序一次都没有打印出任何内容：

```bash
$ ./project001
$
$ ./project001
$
$ ./project001
$
```

`$` 是 shell 提示符，不是命令的一部分。每次 `./project001` 之后，下一行都是空的提示符，说明三次运行都没有打印任何内容。核函数其实在 GPU 上运行了。但程序在 GPU 的打印缓冲区被刷新（也就是输出到终端）之前就结束了。

> [!NOTE]
> 在视频里（CUDA 11.5，WSL2），输出有时会出现，有时不会，取决于时机。在这台机器上（CUDA 13.0，L40S，原生 Ubuntu），输出从来没有出现过。

`cudaDeviceSynchronize()` 让 CPU 停在这一行，一直等到所有 GPU 线程执行完。它返回时，打印缓冲区已经刷新，所有输出都显示在终端上了。这样每次运行都会打印出完整的输出。

把这一行加回去，然后重新编译并运行：

```bash
nvcc -o project001 project001.cu
./project001
```

- 第一行重新编译程序，让源文件里的改动生效。如果运行旧程序，看到的还是旧的行为。
- 第二行运行新程序。

<kernel-sync cmd="./project001" out="The block ID is 0 --- The thread ID is 0 --- The warp ID 0|The block ID is 0 --- The thread ID is 1 --- The warp ID 0|... 128 lines in total"></kernel-sync>

## 输出

下面是加上 `cudaDeviceSynchronize()`、用 `<<<2, 64>>>` 启动时 `./project001` 的完整输出（128 行）。每一行都来自一个 GPU 线程。

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

- 一共 128 行，因为 2 个线程块 × 64 个线程 = 128 个线程，每个线程调用一次 `printf`。
- 在线程块 0 里，线程编号从 0 数到 63，到了线程块 1 又从 0 开始。`threadIdx.x` 是在一个线程块内部计数的，不是在整次启动里计数。
- 线程 0-31 的线程束编号是 0，线程 32-63 是 1，因为 `threadIdx.x / 32` 是整数除法。线程编号在每个线程块里都重新开始，所以线程束编号也一样。

在这台机器上，两次运行都是线程块 0 先于线程块 1 打印。第二次运行得到的 128 行，顺序也完全一样。但在其他运行或其他机器上，线程块的顺序仍然没有保证。

## 调试编译错误

想看看编译器是怎么报错的，就把 `warp_ID_Value = threadIdx.x / 32` 末尾的 `;` 删掉（第 10 行），然后重新编译：

```bash
nvcc -o project001 project001.cu
```

这和之前的编译命令一样。只是这次会失败，所以不会生成新的程序。

在这台机器上的输出：

```
project001.cu(9): error: expected a ";"
      printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
      ^

1 error detected in the compilation of "project001.cu".
```

怎么看这段输出：

- `project001.cu(9)` 是文件名，括号里是行号。
- `error: expected a ";"` 说明编译器本来在找什么。
- 下一行把那行源代码重复了一遍，`^` 标出了编译器发现问题的位置。
- 最后一行统计了这个文件里的错误数量。

错误指向的是 `printf` 那一行，而不是缺少分号的那一行。因为编译器要读到下一个词，才会发现问题，而那个词在 `printf` 那一行。所以，一定要检查编译器报告的那一行的前一行。

> [!NOTE]
> 这段输出是在核函数里加上两行注释之前截取的，所以显示的是第 9 行。按上面给出的文件，缺少分号的是第 10 行，错误会指向第 11 行。

把分号加回去，重新编译，确认没有错误。

## L40S 相关说明

| 参数 | 视频 | 这台机器 |
|---|---|---|
| CUDA 版本 | 11.5 | 13.0 |
| GPU | 通用 | NVIDIA L40S (sm_89) |
| 操作系统 | WSL2 (Ubuntu) | 原生 Ubuntu 24 |
| Shell | cmd.exe + wsl | 直接 SSH |

在 L40S 上编译时，最好指明 GPU 架构。不加 `-arch` 的话，NVCC 会选一个安全、通用的默认值。`-arch=sm_89` 直接针对这块 GPU，可以避免意外。

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

- `-arch=sm_89` 为计算能力 8.9 编译，也就是 L40S。
- `-o project001` 和 `project001.cu` 和之前一样。

检查这个工具包是否支持 sm_89：

```bash
nvcc --help | grep sm_89
```

- `nvcc --help` 打印编译器的所有选项和它们允许的取值。
- `|` 把这些文字交给下一条命令，而不是显示在屏幕上。
- `grep sm_89` 只保留包含 `sm_89` 的行。

```
        'sm_75','sm_80','sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
        'sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
```

每一行都是帮助文本里某个取值列表的一部分。`grep` 会打印所有匹配的行，所以 `sm_89` 出现了两次。只要有匹配，就说明这个工具包可以为 L40S 编译。如果没有任何输出，`-arch=sm_89` 就不能用于这个 nvcc。

## 小结

| 步骤 | 命令 |
|---|---|
| 检查编译器 | `nvcc --version` |
| 编译 | `nvcc -o project001 project001.cu` |
| 编译（L40S） | `nvcc -arch=sm_89 -o project001 project001.cu` |
| 运行 | `./project001` |

如果程序结束前 CPU 需要拿到 GPU 的输出或结果，就在启动核函数之后加上 `cudaDeviceSynchronize()`。不加的话，这台机器什么都不会打印。

## 术语表

- `nvcc`：CUDA 编译器驱动程序。它能处理同一个 `.cu` 文件里的主机端代码和设备端代码。
- `-o`：设置输出程序的名字，默认是 `a.out`。
- `-arch=sm_89`：为计算能力 8.9 编译，也就是 L40S（Ada Lovelace）。
- `cudaDeviceSynchronize()`：让 CPU 一直等到目前为止启动的所有 GPU 工作都完成。
- 线程束编号（warp ID）：线程在它的线程块里属于哪个线程束，等于 `threadIdx.x / 32`。
