# 第 00 课：一个线程块，一个线程

这节课运行一个最简单的核函数（kernel）。它只用一个线程块和一个线程，没有任何并行。这样在内容变复杂之前，你就能先看到第一行输出。

## GPU 和 CPU 的区别

在 CPU 上，一个函数只在一个核心上运行一次。在 GPU 上，一个核函数会并行运行很多次。每一份副本都在自己的线程上运行。运行多少个线程，由两个数字决定：线程块的数量和线程的数量。

## `__global__` 是什么意思

```c
__global__ void printIDs() { ... }
```

`__global__` 把一个函数标记为 GPU 核函数。编译器会为 GPU 编译它，而不是为 CPU。它由 CPU 调用，但在 GPU 上运行。
> [!NOTE]
> 另外还有两个限定符。`__device__` 在 GPU 上运行，只能被 GPU 代码调用。`__host__` 是普通的 CPU 函数，只能从 CPU 调用。

## 启动配置 `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

`<<<...>>>` 这种写法叫执行配置。它写在函数名和参数列表之间。第一个数字是线程块的数量，第二个数字是每个线程块里的线程数。`<<<1, 1>>>` 表示一个线程块，里面有一个线程。线程总数是 1 x 1 = 1。

## 线程、线程块、网格

每次启动核函数，都会产生三个层级：

- 线程（thread）：最小的单位。一个线程运行核函数的一份副本。
- 线程块（block）：一组位于同一个物理处理器上的线程。它们可以共享内存。
- 网格（grid）：一次核函数启动中的所有线程块。启动一次，就有一个网格。

<cuda-hierarchy></cuda-hierarchy>

## `blockIdx.x` 和 `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x` 是当前线程所在线程块的编号。`threadIdx.x` 是当前线程在它的线程块里的编号。两者都有 `.x`、`.y` 和 `.z` 三个分量，因为网格和线程块可以是一维、二维或三维的。做一维的工作时，你只用 `.x` 就够了。在 `<<<1, 1>>>` 下，两者始终都是 0。

## 头文件

- `cuda_runtime.h`：CUDA 运行时 API，包含 `cudaDeviceSynchronize()` 和错误检查函数。
- `stdio.h`：标准 C 头文件，`printf` 需要它。

> [!NOTE]
> 当你使用 MSVC 或某些 IDE 时，`device_launch_parameters.h` 能让核函数里用上 `blockIdx`、`threadIdx`、`blockDim` 和 `gridDim`。

## `cudaDeviceSynchronize()`

核函数的启动是异步的。CPU 启动核函数后，会马上执行下一行。如果没有 `cudaDeviceSynchronize()`，`main()` 会直接返回，程序在 GPU 打印任何内容之前就退出了。这个函数会让 CPU 一直等到 GPU 的所有工作完成。

<kernel-sync></kernel-sync>

## 代码

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

- 三行 `#include` 加载了上面介绍的头文件。
- `printIDs` 是核函数。每个线程打印自己的线程块编号和线程编号。字符串开头的 `\n` 让每条输出各占一行。
- `printIDs<<<1, 1>>>();` 用一个线程块、一个线程启动核函数。
- `cudaDeviceSynchronize();` 等待 GPU 完成，这样打印内容会在程序结束前显示出来。

## 编译和运行

第一条命令把代码编译成程序，第二条命令运行它。

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc` 是 CUDA 编译器。它会同时编译文件里的 CPU 部分和 GPU 部分。
- `first_kernel.cu` 是包含上面代码的源文件。CUDA 源文件以 `.cu` 结尾。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个参数的话，程序名是 `a.out`。
- `./first_kernel` 运行程序。`./` 告诉 shell 在当前文件夹里找这个程序。

程序会打印：

```
Block ID: 0  ===  Thread ID: 0
```

只有一行，因为只有一个线程，而每个线程只打印一次。两个编号都是 0，因为唯一的线程块和唯一的线程编号都是 0。每次运行的输出都一样，因为只有一个线程，没有别的线程和它抢先后。

## 图示

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## 术语表

- 核函数（kernel）：在 GPU 上运行的函数。你只写一次，GPU 会在很多线程上同时运行它。
- 线程（thread）：最小的执行单位。一个线程就是核函数的一份正在运行的副本，有自己的编号。
- 线程块（block）：一组位于同一个物理处理器上的线程。它们可以通过共享内存共享数据。
- 网格（grid）：一次核函数调用启动的所有线程块。
- `__global__`：告诉编译器这个函数是 GPU 核函数。由 CPU 调用，在 GPU 上运行。
- `blockIdx.x`：当前线程所在线程块的编号，从 0 开始。
- `threadIdx.x`：当前线程在线程块里的编号，从 0 开始。
- `cudaDeviceSynchronize()`：让 CPU 一直等到 GPU 完成所有工作。
- 异步（asynchronous）：CPU 不等待。它向 GPU 发出命令后，马上继续往下执行。
