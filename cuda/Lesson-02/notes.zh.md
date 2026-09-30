# 第 02 课：两个线程块，每个 1024 个线程

一个线程块最多只能有 1024 个线程。想运行更多线程，就要增加线程块。这节课启动 2 个线程块 x 1024 个线程 = 2048 个线程。

## 1024 个线程的上限

一个线程块必须放进一个流式多处理器（SM）里。SM 的寄存器数量、共享内存大小和线程束调度器的容量都是固定的。如果一个线程块要求超过 1024 个线程，SM 就装不下它。这时 CUDA 驱动程序会拒绝这次启动。

## 流式多处理器（SM）

SM 是 GPU 内部的物理处理单元。每个 SM 都有 CUDA 核心、寄存器文件、共享内存、L1 缓存和线程束调度器。启动核函数时，驱动程序会把线程块分配到空闲的 SM 上。一个 SM 可以运行一个或多个线程块，具体取决于每个线程块需要多少资源。

> [!NOTE]
> SM 的数量取决于 GPU。像 RTX 3080 这样的中端 GPU 有 68 个 SM。

## 多个线程块时的线程编号

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

线程块 0 有线程 0-1023。线程块 1 也有自己的线程 0-1023。每个线程块里的线程编号都从 0 重新开始。要得到一个唯一的全局编号，用这个公式：

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` 是一个内置变量，保存的是启动时设定的每个线程块的线程数。这里是 1024。处理数组的核函数会用这个公式，让每个线程负责一个元素。

## 静默失败：`<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

这一行能正常编译，不会报错。1024 的上限是驱动程序在运行时检查的，不是编译器检查的。启动时，驱动程序发现配置无效，就会丢弃整个核函数调用。没有输出，没有崩溃，也没有错误信息。在核函数后面调用 `cudaGetLastError()` 就能发现这个问题。

> [!TIP]
> 把这一行的注释去掉，运行一下，对比输出。

## 线程块调度

线程块在 SM 上的运行顺序是不确定的。驱动程序会把每个线程块交给最先空闲的 SM。线程块 0 和线程块 1 可以同时在不同的 SM 上运行。所以每次运行，它们的输出行都会以不同的顺序混在一起。

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
    // printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit, launches nothing at runtime
    printIDs<<<2, 1024>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- 被注释掉的那一行，就是上一节讲的无效启动。它一直保持注释状态，这样程序才能正常工作。
- `printIDs<<<2, 1024>>>();` 启动 2 个线程块，每个 1024 个线程。这没有超出上限，照样运行了 2048 个线程。
- 其余部分和第 00 课、第 01 课一样。

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

程序会打印 2048 行，每个线程一行。下面是开头几行：

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- `...` 代表 2048 行里剩下的部分。
- `Block ID` 是 0 或 1，因为有两个线程块。
- 从 0 到 1023 的每个 `Thread ID` 都出现两次，每个线程块各一次。每个线程块里的线程编号都从 0 重新开始。
- 线程块 0 和线程块 1 的输出行混在一起，每次运行的顺序都不同。原因在“线程块调度”一节讲过：两个线程块可以同时在不同的 SM 上运行。

## 图示

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

## 术语表

- SM（Streaming Multiprocessor，流式多处理器）：GPU 内部的物理处理器。线程块在 SM 上运行。如果资源足够，一个 SM 可以同时运行多个线程块。
- `blockDim.x`：内置变量，保存每个线程块的线程数。它就是 `<<<blocks, threads>>>` 里的第二个数字。
- 全局线程编号：整个网格里每个线程独有的编号，等于 `blockIdx.x * blockDim.x + threadIdx.x`。线程编号在不同线程块之间会重复，全局编号不会。
- `cudaGetLastError()`：返回最近一次的 CUDA 错误码。它能发现静默失败，比如驱动程序悄悄丢弃的无效启动配置。
- 不确定（non-deterministic）：结果或顺序无法预测。线程块调度取决于启动时哪个 SM 是空闲的。
