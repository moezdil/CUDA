# 第 01 课：一个线程块，四个线程

这节课只对[第 00 课](../Lesson-00/notes.md)做了一处改动。线程数从 1 变成 4，线程块数仍然是 1。四个线程同时运行同一个核函数，每个线程的 `threadIdx.x` 都不一样。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，环境是 CUDA 13.0 和 Ubuntu 24。

## 改了什么

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

GPU（Graphics Processing Unit，图形处理器）会同时运行 4 份 `printIDs`。每一份都有自己的 `threadIdx.x`，分别是 0、1、2 或 3。它们的 `blockIdx.x` 都是 0，因为仍然只有一个线程块。

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## SIMT（Single Instruction, Multiple Threads，单指令多线程）

4 个线程运行的是同样的指令，但每个线程都有自己的编号和自己的变量。线程 2 读取 `threadIdx.x` 得到 2，线程 3 得到 3。所以同一行 `printf` 在每个线程里打印出不同的数字。在这个核函数里，线程之间不会互相等待，也不共享任何数据。这种模型叫作 SIMT（Single Instruction, Multiple Threads，单指令多线程）。

## 线程束

GPU 以 32 个线程为一组来运行线程，这样的一组叫作线程束（warp）。硬件调度的是线程束，而不是单个线程。当你启动 4 个线程时，GPU 会建立一个有 32 个通道的线程束，但只用其中 4 个。另外 28 个通道处于空闲状态。

一个线程块的线程束数量，等于线程数除以 32，再向上取整。例如，一个有 100 个线程的线程块需要 4 个线程束：三个满的线程束，每个 32 个线程（共 96 个），再加一个只有 4 个活跃线程的线程束。

> [!TIP]
> 选择 32 的倍数作为线程块大小，比如 128 或 256。这样就不会有线程束存在空闲通道。

> [!NOTE]
> 如果一个线程束里的线程在 if/else 中走了不同的分支，GPU 会一条接一条地执行这些路径。这叫作线程束分化（warp divergence）。这节课不会出现这种情况，因为 4 个线程运行的都是同一行代码。

## 为什么输出顺序会变

核函数里的 `printf` 不会立刻打印。每个线程把自己的那一行写进 GPU 内存里的一个缓冲区。等 CPU 等待 GPU 时，也就是这里的 `cudaDeviceSynchronize()`，缓冲区才会被打印出来。线程写入的先后顺序是不固定的，即使在同一个线程束里也是如此。所以每次运行的输出顺序都可能不同。

<printf-order threads="4"></printf-order>

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
    printIDs<<<1, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

这就是第 00 课的代码，只改了一处。启动那一行现在是 `printIDs<<<1, 4>>>();`，所以有四个线程运行这个核函数。

## 编译和运行

第一条命令把代码编译成程序。第二条命令运行它。

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` 是 CUDA（Compute Unified Device Architecture，统一计算设备架构）编译器。它会同时编译文件里的 CPU（Central Processing Unit，中央处理器）部分和 GPU 部分。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个参数的话，程序名是 `a.out`。
- `first_kernel.cu` 是包含上面代码的源文件。
- `./first_kernel` 从当前文件夹运行程序。

## 输出

程序打印 4 行，每个线程一行：

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- 有 4 行，因为运行了 4 个线程，每个线程打印一次。
- `Block ID` 始终是 0，因为只有一个线程块。
- 从 0 到 3 的每个 `Thread ID` 都恰好出现一次，因为每个线程都有自己的 `threadIdx.x`。
- 这里的顺序是 2、0、3、1，但你运行时可能是别的顺序。正如上面所说，线程写入 printf 缓冲区的顺序是不固定的。

## 动手试试

- 把启动配置改成 `<<<1, 32>>>`。你会得到 32 行，线程编号从 0 到 31，顺序依然不固定。这正好是一个满的线程束。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 的主处理器。
- 线程束（warp）：GPU 作为一个整体一起运行的 32 个线程。GPU 调度的是线程束，而不是单个线程。
- 通道（lane）：线程束里 32 个位置中的一个。每个活跃的通道运行一个线程。
- SIMT（Single Instruction, Multiple Threads，单指令多线程）：线程束里每个活跃线程都执行同一条指令。每个线程有自己的数据和自己的编号。
- 线程束分化（warp divergence）：同一个线程束里的线程走了不同的路径。例如，线程 0 进入了 if 分支，而线程 1 没有。这时 GPU 会一条接一条地执行两条路径，速度会变慢。
- printf 缓冲区：GPU 上的 `printf` 不会直接写到屏幕上。它写进 GPU 内存里的一个缓冲区。当 CPU 等待 GPU 时，比如在 `cudaDeviceSynchronize()` 处，缓冲区的内容才会显示到屏幕上。
