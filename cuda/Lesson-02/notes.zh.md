# 02 > 两个线程块，每块 1024 个线程

一个线程块最多只能有 1024 个线程，想运行更多线程，就得增加线程块。这一课启动 2 个线程块 x 1024 个线程 = 2048 个线程，并演示每个线程怎样得到一个在整个网格里唯一的编号。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，环境是 CUDA 13.0 和 Ubuntu 24。

## 1024 个线程的上限

单个线程块最多只能有 1024 个线程，这是计算能力（compute capability）规定的硬性规则。计算能力是 GPU（Graphics Processing Unit，图形处理器）的版本号，[第 03 课](../Lesson-03/notes.md)会详细讲。从 2010 年起，NVIDIA 生产的每一款 GPU 上这个值都是 1024。

这个上限并不是“一个 SM 最多能容纳多少线程”。只要分布在多个线程块里，一个 SM（Streaming Multiprocessor，流式多处理器）可以同时容纳更多线程。在 L40S 上，一个 SM 最多容纳 1536 个线程，比如 3 个线程块、每块 512 个线程。在 A100、H100 这样的数据中心 GPU 上，一个 SM 最多容纳 2048 个线程。

## 流式多处理器（SM）

SM 是 GPU 内部的一个物理处理单元。每个 SM 都有 CUDA（Compute Unified Device Architecture，统一计算设备架构）核心、寄存器堆、共享内存、L1 缓存（一级缓存）和线程束调度器。启动核函数时，线程块会被分配到各个 SM 上。一个 SM 能同时运行一个还是多个线程块，取决于每个线程块需要多少资源。一个线程块从头到尾都待在同一个 SM 上。

> [!NOTE]
> SM 的数量因 GPU 而异。L40S 有 142 个 SM，RTX 3080 这样的中端 GPU 有 68 个。

## 多个线程块时的线程编号

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

线程块 0 有线程 0-1023，线程块 1 也有自己的线程 0-1023，线程编号在每个线程块里都从 0 重新开始。所以只看 `threadIdx.x`，没法区分两个编号都是 5 的线程。要得到唯一的全局线程 ID，就用下面这个公式：

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` 是一个内置变量，保存启动时设定的每个线程块的线程数，这里是 1024。每个线程块都要跳过排在它前面的所有线程块的线程：

- 线程块 0 里的线程 5：0 * 1024 + 5 = 5
- 线程块 1 里的线程 5：1 * 1024 + 5 = 1029
- 线程块 1 里的线程 1023：1 * 1024 + 1023 = 2047，也就是 2048 个线程中的最后一个

换成小一点的数就更好理解了。假设每个线程块有 4 个线程，那么线程块 2 里的线程 3 得到 2 * 4 + 3 = 11。全局线程 ID 在线程块 0 里是 0 到 3，在线程块 1 里是 4 到 7，在线程块 2 里是 8 到 11。拖动滑块，再把鼠标悬停在某个线程上，就能看到代入具体数字后的公式：

<global-id></global-id>

处理数组的核函数就靠这个公式让每个线程负责一个元素，比如线程 1029 处理第 1029 个元素。

## 无声的失败：`<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

这一行编译时不会报错，因为编译器不检查启动配置。CUDA 运行时会在核函数启动时检查，一看一个线程块里有 2048 个线程，就把这次核函数调用整个丢掉。

> [!WARNING]
> 无效的启动不会有输出，不会崩溃，也没有任何错误信息，程序就这么结束了。在启动之后马上调用 `cudaGetLastError()`，才能看到错误，这里是 `invalid configuration argument`。[第 08 课](../Lesson-08/notes.md)会用一个 `CHECK` 宏来做这件事。

> [!TIP]
> 把这一行的注释去掉，运行一下，再对比输出。

## 线程块调度

线程块在 SM 上的运行顺序是非确定性的，也就是说顺序不固定。每个线程块会被分配到一个还有空间容纳它的 SM 上，线程块 0 和线程块 1 可以同时在不同的 SM 上运行。所以每次运行，它们的输出行都会以不同的顺序交错在一起。

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

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

- 被注释掉的那一行就是上一节讲的无效启动。它一直保持注释状态，程序才能正常工作。
- `printIDs<<<2, 1024>>>();` 启动 2 个线程块，每块 1024 个线程。这样没有超出上限，同样运行了 2048 个线程。
- 其余部分和[第 00 课](../Lesson-00/notes.md)、[第 01 课](../Lesson-01/notes.md)相同。

## 代码逐步讲解

按照写代码的顺序，一步一步看这个程序。新内容是用两个线程块来启动。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** 和之前一样的三行 `#include`：CUDA 运行时、内置变量和 `printf`。增加线程块不需要新的头文件。
2. `5-8 gpu` **核函数。** 增加线程块时，核函数不用改。每个线程打印 `blockIdx.x` 和 `threadIdx.x`，现在 `blockIdx.x` 是 0 或 1。记住，`threadIdx.x` 在每个线程块里都从 0 重新开始，单看它并不唯一。
3. `10-11,15-16 cpu` **main 函数。** 写好 `main`，最后是 `return 0;`。和启动相关的几行写在中间。
4. `13 cpu` **用 2 个线程块启动。** 要得到 2048 个线程，就写 `<<<2, 1024>>>`：2 个线程块乘以 1024 个线程。规则是：第二个数不超过 1024，需要更多线程时就加大第一个数。
5. `14 cpu` **等待 GPU。** `cudaDeviceSynchronize();` 会一直等到两个线程块都执行完。少了它，你可能一行输出都看不到。
6. `12 cpu` **写成注释的无效启动。** 最后加上这一行，提醒自己别这样写。`<<<1, 2048>>>` 能通过编译，但运行时会被丢弃。如果去掉 `//`，这次启动既不打印任何内容，也不报错，所以这种错误很容易被忽略。

</div>

## 编译和运行

第一条命令把代码编译成程序，第二条命令运行它。

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` 是 CUDA 编译器，它会把文件里的 CPU（Central Processing Unit，中央处理器）部分和 GPU 部分一起编译。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个选项，程序名默认是 `a.out`。
- `first_kernel.cu` 是包含上面代码的源文件。
- `./first_kernel` 运行当前目录下的程序。

## 输出

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
- 0 到 1023 的每个 `Thread ID` 都出现两次，每个线程块各一次，因为线程编号在每个线程块里都从 0 重新开始。
- 线程块 0 和线程块 1 的输出行交错在一起，而且每次运行的顺序都不一样。原因在“线程块调度”一节讲过：两个线程块可以同时在不同的 SM 上运行。

## 自己动手写

自己算出全局线程 ID，让网格里的每个线程都有一个唯一的编号。

1. 用下面的框架创建 `global_id.cu`。
2. 在核函数里，用这一课的公式算出 `id`，再把它和线程块编号、线程编号一起打印出来。
3. 启动 3 个线程块，每块 4 个线程。

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void printGlobalIDs()
{
    // TODO: compute the global ID: block index times block size plus thread index
    // TODO: print "block b, thread t -> global ID id"
}

int main()
{
    // TODO: launch printGlobalIDs with 3 blocks of 4 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "提示"
    公式是 `blockIdx.x * blockDim.x + threadIdx.x`。启动配置里线程块数在前：`<<<3, 4>>>`。

??? note "答案"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void printGlobalIDs()
    {
        int id = blockIdx.x * blockDim.x + threadIdx.x;
        printf("block %d, thread %d -> global ID %d\n", blockIdx.x, threadIdx.x, id);
    }

    int main()
    {
        printGlobalIDs<<<3, 4>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    用 `nvcc -o global_id global_id.cu` 编译，再用 `./global_id` 运行。你应该会看到 12 行，0 到 11 的每个全局 ID 恰好出现一次，顺序不固定。线程块 2 里的线程 3 会打印全局 ID 11，因为 2 * 4 + 3 = 11。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 内部的物理处理器，线程块就在 SM 上运行。只要资源够，一个 SM 可以同时运行多个线程块。
- L1 缓存（level 1 cache，一级缓存）：每个 SM 内部一块又小又快的存储，把最近用过的数据放在离核心很近的地方。
- `blockDim.x`：内置变量，保存每个线程块的线程数，也就是 `<<<blocks, threads>>>` 中的第二个数。
- 全局线程 ID（global thread ID）：整个网格里每个线程独有的编号，算法是 `blockIdx.x * blockDim.x + threadIdx.x`。线程编号在不同线程块之间会重复，全局线程 ID 不会。
- `cudaGetLastError()`：返回最近一次的 CUDA 错误码。它能发现无声的失败，比如被悄悄丢弃、没有任何提示的无效启动配置。
- 非确定性（non-deterministic）：结果或顺序无法预测。线程块怎么调度，取决于启动时哪个 SM 还有空间。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 并启动核函数的主处理器。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，让你在 GPU 上运行自己的代码。
- 计算能力（compute capability）：一代 GPU 的版本号，L40S 是 8.9。每个线程块最多 1024 个线程这样的上限就由它规定（[第 03 课](../Lesson-03/notes.md)）。
- 寄存器堆（register file）：每个 SM 里的高速存储，存放线程的局部变量。L40S 每个 SM 有 65536 个 32 位寄存器。
- 共享内存（shared memory）：每个 SM 内部的高速内存，同一个线程块里的线程可以共用它。
- 线程束调度器（warp scheduler）：SM 里负责决定下一个运行哪个线程束的单元，每个 SM 有好几个。
- 线程块（block）：由最多 1024 个线程组成的一组，在一个 SM 上运行。每个线程块里的线程编号都从 0 重新开始。
- 网格（grid）：一次启动的全部线程块。`<<<2, 1024>>>` 会建立一个有 2 个线程块、共 2048 个线程的网格。
- `blockIdx.x`：线程所在线程块的编号，这一课里是 0 或 1。
- `threadIdx.x`：线程在自己线程块里的编号，这里是 0 到 1023。它在每个线程块里都从 0 重新开始。
- 启动配置（launch configuration）：`<<<blocks, threads>>>` 里的两个数。编译器不检查它们，由 CUDA 运行时在核函数启动时检查。
- CUDA 运行时（CUDA runtime）：程序让 GPU 干活时调用的库，比如 `cudaDeviceSynchronize()`。每一个启动配置也由它来检查。
- 无效启动（invalid launch）：违反了某个上限的启动，比如 `<<<1, 2048>>>`。核函数根本不会运行，只有 `cudaGetLastError()` 会报出错误（`invalid configuration argument`）。
- `nvcc`：CUDA 编译器。它把 `.cu` 文件里的 CPU 部分和 GPU 部分编译成一个程序。
- `-o`：设置输出程序的名字。不加时，名字是 `a.out`。
