# 01 > 一个线程块，四个线程

这一课只在[第 00 课](../Lesson-00/notes.md)的基础上改了一处，线程数从 1 变成 4，线程块数仍然是 1。四个线程同时运行同一个核函数，每个线程的 `threadIdx.x` 各不相同。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，环境是 CUDA 13.0 和 Ubuntu 24。

## 改了什么

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

GPU 会同时运行 4 份 `printIDs`。每一份都有自己的 `threadIdx.x`，分别是 0、1、2、3。它们的 `blockIdx.x` 都是 0，因为仍然只有一个线程块。

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## SIMT

4 个线程执行的是同样的指令，但每个线程都有自己的编号和自己的变量。线程 2 读取 `threadIdx.x` 得到 2，线程 3 得到 3，所以同一行 `printf` 在不同线程里会打印出不同的数字。在这个核函数里，线程之间既不互相等待，也不共享任何数据。这种模型叫作 SIMT。

## 线程束

GPU 以 32 个线程为一组来运行线程，这样的一组叫作线程束。硬件调度的单位是线程束，而不是单个线程。启动 4 个线程时，GPU 会建立一个有 32 个通道的线程束，但只用到其中 4 个，其余 28 个通道都闲着。

一个线程块有多少个线程束，等于线程数除以 32 再向上取整。比如一个 100 个线程的线程块需要 4 个线程束，其中三个是各有 32 个线程的满线程束（共 96 个），另一个只有 4 个活跃线程。

> [!TIP]
> 线程块大小最好选 32 的倍数，比如 128 或 256。这样就不会有线程束留着空闲的通道。

> [!NOTE]
> 如果一个线程束里的线程在 if/else 中走了不同的分支，GPU 会把这几条路径一条接一条地执行。这叫作线程束分化。这一课不会出现这种情况，因为 4 个线程运行的都是同一行代码。

## 为什么输出顺序会变

核函数里的 `printf` 并不会立刻打印。每个线程先把自己的那一行写进显存里的一个缓冲区，等到 CPU 等待 GPU 时，也就是这里的 `cudaDeviceSynchronize()`，缓冲区的内容才会打印出来。线程写入的先后顺序是不固定的，即使在同一个线程束里也是如此，所以每次运行的输出顺序都可能不同。

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

这就是第 00 课的代码，只改了一处，启动那一行现在是 `printIDs<<<1, 4>>>();`，所以会有四个线程运行这个核函数。

## 代码逐步讲解

按照写代码的顺序，一步一步看这个程序。大部分内容和[第 00 课](../Lesson-00/notes.md)的程序相同，所以重点放在启动这一行。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** 和第 00 课相同的三行 `#include`。`stdio.h` 不能删，因为核函数要调用 `printf`。
2. `5-8 gpu` **核函数。** 核函数和之前一字不差。想要更多线程，不用改它，因为每个线程都运行这同一份代码，各自读取自己的 `threadIdx.x`。要记住的规则是，你只为一个线程写代码，运行多少份副本由启动配置决定。
3. `10-11,14-15 cpu` **main 函数。** 和第 00 课一样，写好 `main`，最后是 `return 0;`。中间那两行是主机端仅有的和 GPU 打交道的代码。
4. `12 cpu` **用 4 个线程启动。** `<<<1, 4>>>` 中的第二个数是每个线程块的线程数，所以会运行 4 个线程。常见的错误是把两个数写反。`<<<4, 1>>>` 同样启动 4 个线程，但那是 4 个线程块、每块 1 个线程，所以每个 `threadIdx.x` 都是 0。
5. `13 cpu` **等待 GPU。** `cudaDeviceSynchronize();` 让 CPU 等待，printf 缓冲区的内容也正是在这时显示到屏幕上。这 4 行输出的顺序不固定。

</div>

## 编译和运行

第一条命令把代码编译成程序，第二条命令运行它。

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` 是 CUDA 编译器，它会把文件里的 CPU 部分和 GPU 部分一起编译。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个选项，程序名默认是 `a.out`。
- `first_kernel.cu` 是包含上面代码的源文件。
- `./first_kernel` 运行当前目录下的程序。

## 输出

程序会打印 4 行，每个线程一行。

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- 一共 4 行，因为运行了 4 个线程，每个线程打印一次。
- `Block ID` 始终是 0，因为只有一个线程块。
- 0 到 3 的每个 `Thread ID` 都恰好出现一次，因为每个线程都有自己的 `threadIdx.x`。
- 这里的顺序是 2、0、3、1，你运行时可能是别的顺序。原因上面已经讲过，线程写入 printf 缓冲区的顺序是不固定的。

## 动手试试

- 把启动配置改成 `<<<1, 32>>>`。你会得到 32 行，线程编号从 0 到 31，顺序同样不固定。这正好是一个满的线程束。

## 自己动手写

写一个核函数，让每个线程根据自己的 `threadIdx.x` 算出不同的结果。

1. 用下面的框架创建 `square.cu`。
2. 在核函数里，把 `threadIdx.x` 存进变量 `i`，然后打印 `i` 和 `i * i`。
3. 启动 1 个线程块，每块 5 个线程。

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
    `int i = threadIdx.x;` 让每个线程都有自己的 `i`。每个线程块的线程数是第二个数，比如 `<<<1, 5>>>`。

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

    用 `nvcc -o square square.cu` 编译，再用 `./square` 运行。你应该会看到 5 行，线程 0 到 4 各一行，比如 `thread 3: 3 * 3 = 9`。每次运行，这几行的顺序都可能不同。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 的主处理器。
- 线程束（warp）：GPU 当作一个整体来运行的 32 个线程。GPU 调度的是线程束，而不是单个线程。
- 通道（lane）：线程束里 32 个位置中的一个。每个活跃的通道运行一个线程。
- SIMT（Single Instruction, Multiple Threads，单指令多线程）：线程束里所有活跃线程都执行同一条指令，但每个线程有自己的数据和自己的编号。
- 线程束分化（warp divergence）：同一个线程束里的线程走了不同的路径，比如线程 0 进入了 if 分支，线程 1 没有。这时 GPU 要把两条路径一条接一条地执行，速度就会变慢。
- printf 缓冲区：GPU 上的 `printf` 不会直接写到屏幕上，而是先写进显存里的一个缓冲区。等 CPU 等待 GPU 时（比如在 `cudaDeviceSynchronize()` 处），缓冲区的内容才会显示到屏幕上。
- 核函数（kernel）：用 `__global__` 标记、在 GPU 上运行的函数。一次启动会为每个线程运行它的一份副本。
- 线程（thread）：核函数的一份运行中的副本，有自己的 `threadIdx.x` 和自己的变量。
- 线程块（block）：一起启动的一组线程。`<<<1, 4>>>` 会建立 1 个线程块，里面有 4 个线程。
- `threadIdx.x`：线程在自己线程块里的编号，从 0 到（每块线程数 - 1）。这里是 0 到 3。
- `blockIdx.x`：线程所在线程块的编号。只有一个线程块时，每个线程的值都是 0。
- 启动（launch）：在 GPU 上启动核函数的那一行 `name<<<blocks, threads>>>();`。第一个数是线程块数，第二个数是每个线程块的线程数。
- `cudaDeviceSynchronize()`：让 CPU 一直等到 GPU 完成工作。printf 缓冲区的内容也是在这时显示到屏幕上的。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，让你在 GPU 上运行自己的代码。
- `nvcc`：CUDA 编译器。它把 `.cu` 文件里的 CPU 部分和 GPU 部分编译成一个程序。
- `-o`：设置输出程序的名字。不加时，名字是 `a.out`。
