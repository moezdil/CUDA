# 第 01 课：一个线程块，四个线程

这节课只在第 00 课的基础上改了一处：线程数从 1 变成 4，线程块数还是 1。四个线程同时运行同一个核函数，每个线程的 `threadIdx.x` 都不一样。

## 改了什么

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

GPU 会同时运行 4 份 `printIDs`。每一份都有自己的 `threadIdx.x`，分别是 0、1、2 或 3。它们的 `blockIdx.x` 都是 0，因为仍然只有一个线程块。

## SIMT（单指令多线程）

每个线程都独立运行。线程之间不会互相等待，也不会互相配合。它们同时执行相同的指令，只是各自的编号不同。这种模型叫 SIMT（Single Instruction, Multiple Threads，单指令多线程）。

## 线程束

GPU 以 32 个线程为一组来运行线程，这样的一组叫线程束（warp）。硬件调度的是线程束，而不是线程块。当你启动 4 个线程时，GPU 会生成一个完整的 32 通道线程束，但只用其中 4 个。这里 4 个线程做的是同一件事，所以它们都走同一条执行路径。

> [!NOTE]
> 如果同一个线程束里的线程走进了 if/else 的不同分支，GPU 会一个接一个地执行这些路径。这叫线程束分化（warp divergence）。本课不会出现这种情况。

## 为什么输出顺序会变

核函数里的 `printf` 不会马上打印。每个线程会把内容写进 GPU 显存里的一个共享环形缓冲区。调用 `cudaDeviceSynchronize()` 时，这个缓冲区才会被打印出来。线程写入的先后顺序是不固定的，即使在同一个线程束里也是如此。所以每次运行，输出顺序都可能不同。

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

第一条命令把代码编译成程序，第二条命令运行它。

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc` 是 CUDA 编译器。它会同时编译文件里的 CPU 部分和 GPU 部分。
- `first_kernel.cu` 是包含上面代码的源文件。CUDA 源文件以 `.cu` 结尾。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个参数的话，程序名是 `a.out`。
- `./first_kernel` 运行程序。`./` 告诉 shell 在当前文件夹里找这个程序。

程序会打印 4 行，每个线程一行：

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- 一共 4 行，因为运行了 4 个线程，每个线程打印一次。
- `Block ID` 始终是 0，因为只有一个线程块。
- 从 0 到 3 的每个 `Thread ID` 都正好出现一次，因为每个线程都有自己的 `threadIdx.x`。
- 这里的顺序是 2、0、3、1，但你运行时可能是别的顺序。原因上面讲过：线程写入 printf 缓冲区的顺序是不固定的。

## 图示

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## 术语表

- 线程束（warp）：GPU 作为一个整体一起运行的 32 个线程。GPU 调度的是线程束，而不是单个线程。
- SIMT（Single Instruction, Multiple Threads，单指令多线程）：线程束里每个活跃线程在同一个时钟周期执行同一条指令。每个线程有自己的数据和编号。
- 线程束分化（warp divergence）：同一个线程束里的线程走了不同的路径。比如线程 0 进入了 if 分支，线程 1 没有进入。这时 GPU 会一个接一个地执行两条路径，速度会变慢。
- printf 缓冲区：GPU 上的 printf 不会直接输出到屏幕，而是写进 GPU 显存里的一个缓冲区。只有调用 `cudaDeviceSynchronize()` 时，缓冲区的内容才会显示到屏幕上。
