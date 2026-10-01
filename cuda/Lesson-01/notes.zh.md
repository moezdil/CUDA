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

## 代码逐步讲解

按照你写代码的顺序，一步一步看这个程序。大部分内容和[第 00 课](../Lesson-00/notes.md)的程序一样，所以重点放在启动上。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** 和第 00 课一样的三行 `#include`。`stdio.h` 不能删，因为核函数要调用 `printf`。
2. `5-8 gpu` **核函数。** 核函数和之前写得一模一样。想要更多线程，不需要改它：每个线程都运行这份相同的代码，并各自读取自己的 `threadIdx.x`。规则是：你只为一个线程写代码，由启动配置决定运行多少份副本。
3. `10-11,14-15 cpu` **main 函数。** 和第 00 课一样，写好 `main`，最后是 `return 0;`。中间那两行是主机端唯一和 GPU 打交道的代码。
4. `12 cpu` **用 4 个线程启动。** `<<<1, 4>>>` 中的第二个数字是每个线程块的线程数，所以会运行 4 个线程。一个常见的错误是把两个数字写反：`<<<4, 1>>>` 也会启动 4 个线程，但它们是 4 个线程块、每块 1 个线程，所以每个 `threadIdx.x` 都是 0。
5. `13 cpu` **等待 GPU。** `cudaDeviceSynchronize();` 让 CPU 等待，printf 缓冲区的内容也是在这时才显示到屏幕上。这 4 行输出的顺序不固定。

</div>

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

## 自己动手写

写一个核函数，让每个线程用自己的 `threadIdx.x` 算出不同的结果。

1. 用下面的框架创建 `square.cu`。
2. 在核函数里，把 `threadIdx.x` 存进变量 `i`，然后打印 `i` 和 `i * i`。
3. 启动 1 个线程块，里面有 5 个线程。

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void square()
{
    // TODO: read this thread's ID into an int i
    // TODO: print "thread i: i * i = result"
}

int main()
{
    // TODO: launch square with 1 block of 5 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "提示"
    `int i = threadIdx.x;` 让每个线程都有自己的 `i`。每个线程块的线程数是第二个数字：`<<<1, 5>>>`。

??? note "答案"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void square()
    {
        int i = threadIdx.x;
        printf("thread %d: %d * %d = %d\n", i, i, i, i * i);
    }

    int main()
    {
        square<<<1, 5>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    用 `nvcc -o square square.cu` 和 `./square` 编译并运行。你应该会看到 5 行，线程 0 到 4 各一行，比如 `thread 3: 3 * 3 = 9`。每次运行，这些行的顺序都可能不同。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 的主处理器。
- 线程束（warp）：GPU 作为一个整体一起运行的 32 个线程。GPU 调度的是线程束，而不是单个线程。
- 通道（lane）：线程束里 32 个位置中的一个。每个活跃的通道运行一个线程。
- SIMT（Single Instruction, Multiple Threads，单指令多线程）：线程束里每个活跃线程都执行同一条指令。每个线程有自己的数据和自己的编号。
- 线程束分化（warp divergence）：同一个线程束里的线程走了不同的路径。例如，线程 0 进入了 if 分支，而线程 1 没有。这时 GPU 会一条接一条地执行两条路径，速度会变慢。
- printf 缓冲区：GPU 上的 `printf` 不会直接写到屏幕上。它写进 GPU 内存里的一个缓冲区。当 CPU 等待 GPU 时，比如在 `cudaDeviceSynchronize()` 处，缓冲区的内容才会显示到屏幕上。
