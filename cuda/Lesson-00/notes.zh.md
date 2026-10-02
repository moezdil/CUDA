# 00 > 一个线程块，一个线程

这一课会运行一个最简单的 CUDA（Compute Unified Device Architecture，统一计算设备架构）程序。它的核函数只用一个线程块、一个线程，完全没有并行。这样在内容变复杂之前，你就能先看到第一行输出。后面每一课都会在这个程序的基础上做一点小改动。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，环境是 CUDA 13.0 和 Ubuntu 24。

## GPU 和 CPU 的区别

在 CPU（Central Processing Unit，中央处理器）上，一个函数只在一个核心上运行一次。在 GPU（Graphics Processing Unit，图形处理器）上，一个核函数会并行运行很多次。核函数就是在 GPU 上运行的函数，它的每一份运行中的副本叫作一个线程。运行多少个线程由两个数决定：线程块的数量，以及每个线程块里的线程数。

比如 2 个线程块、每块 3 个线程，一共会启动 2 x 3 = 6 个线程。这 6 个线程运行的是同一份核函数代码。

## `__global__` 是什么意思

```c
__global__ void printIDs() { ... }
```

`__global__` 把一个函数标记为 GPU 核函数。编译器会为 GPU 而不是 CPU 编译它。它由 CPU 调用，却在 GPU 上运行。

> [!NOTE]
> 另外还有两个限定符。`__device__` 函数在 GPU 上运行，只能由 GPU 代码调用。`__host__` 就是普通的 CPU 函数，只能在 CPU 上调用。

## 启动配置 `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

`<<<...>>>` 这种写法叫作执行配置，写在函数名和参数列表之间。第一个数是线程块的数量，第二个数是每个线程块里的线程数。`<<<1, 1>>>` 表示一个线程块，里面只有一个线程。线程总数是 1 x 1 = 1。

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## 线程、线程块、网格

每次启动核函数，都会形成三个层级：

- 线程（thread）：最小的单位。一个线程运行核函数的一份副本。
- 线程块（block）：在同一个 SM（Streaming Multiprocessor，流式多处理器）上运行的一组线程。SM 是 GPU 内部众多小处理器中的一个。同一个线程块里的线程可以共享内存。
- 网格（grid）：一次核函数启动中的全部线程块。启动一次，就有一个网格。

<cuda-hierarchy></cuda-hierarchy>

> [!NOTE]
> 一块 GPU 有很多个 SM。这些课使用的 L40S 有 142 个。一个线程块永远不会被拆到两个 SM 上，但不同的线程块可以同时在不同的 SM 上运行。[第 02 课](../Lesson-02/notes.md)会用到这一点。

## `blockIdx.x` 和 `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x` 是当前线程所在线程块的编号，`threadIdx.x` 是当前线程在所在线程块里的编号，两者都从 0 开始。它们都有 `.x`、`.y` 和 `.z` 三个分量，因为网格和线程块可以是 1D、2D 或 3D（一维、二维或三维）的。处理一维的工作时，只用 `.x` 就够了。在 `<<<1, 1>>>` 下，两者始终为 0。

## 头文件

- `cuda_runtime.h`：CUDA 运行时 API（Application Programming Interface，应用程序编程接口）。它声明了 `cudaDeviceSynchronize()` 和各种错误检查函数。
- `stdio.h`：标准 C 头文件，`printf` 需要它。
- `device_launch_parameters.h`：使用 MSVC（Microsoft Visual C++）或某些 IDE（Integrated Development Environment，集成开发环境）时，有了它，编辑器才能认出 `blockIdx`、`threadIdx`、`blockDim` 和 `gridDim`。`nvcc` 不需要它，但加上也没有坏处。

## `cudaDeviceSynchronize()`

核函数的启动是异步的：CPU 启动核函数后，会马上执行下一行。如果没有 `cudaDeviceSynchronize()`，`main()` 会直接返回，GPU 还没来得及打印，程序就已经退出了。这个函数让 CPU 一直等到 GPU 上的工作全部完成。

<kernel-sync></kernel-sync>

> [!WARNING]
> 如果忘了写 `cudaDeviceSynchronize()`，程序照样能编译，运行时也不会报错，只是什么都不打印。

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

- 三行 `#include` 引入了上面介绍的头文件。
- `printIDs` 是核函数。每个线程打印自己的线程块编号和线程编号。字符串开头的 `\n` 让每条输出单独占一行。
- `printIDs<<<1, 1>>>();` 用一个线程块、一个线程启动核函数。
- `cudaDeviceSynchronize();` 等待 GPU 执行完毕，这样打印的内容才能在程序结束前显示出来。

## 代码逐步讲解

按照从空文件开始写代码的顺序，一步一步看这个程序。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** 先写三行 `#include`，因为后面的代码都要用到它们声明的名字。`cuda_runtime.h` 提供 `cudaDeviceSynchronize()`，`stdio.h` 提供 `printf`。少了 `stdio.h`，核函数里的 `printf` 就无法通过编译。
2. `5-6,8 gpu` **空的核函数。** 先搭核函数的框架，再写函数体：`__global__`、返回类型 `void`、函数名，以及一对空的花括号。核函数必须返回 `void`，因为没有调用者在等它的返回值。如果漏掉 `__global__`，编译器会把它当成普通的 CPU 函数来编译，后面启动核函数的那一行就会编译失败。
3. `7 gpu` **核函数的函数体。** 加一行 `printf`，打印 `blockIdx.x` 和 `threadIdx.x`。这一行会在 GPU 上的每个线程里各运行一次。每个 `%d` 依次由字符串后面列出的值填入。
4. `10-11,14-15 cpu` **main 函数。** 先写好 `main`、它的花括号和 `return 0;`，再填中间的部分。这是在 CPU 上运行的普通 C 代码。
5. `12 cpu` **启动核函数。** 先写核函数名，接着写 `<<<1, 1>>>`，最后是参数列表 `()`。规则是：线程块数量在前，每个线程块的线程数在后。`printIDs` 虽然不接收任何参数，空的 `()` 也不能省。
6. `13 cpu` **等待 GPU。** 启动会立即返回，所以要紧接着加上 `cudaDeviceSynchronize();`。这是新手最常犯的第一个错误：少了它，程序照样能编译、能运行，却什么也不打印。

</div>

## 编译和运行

第一条命令把代码编译成程序，第二条命令运行它。

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` 是 CUDA 编译器，它会把文件里的 CPU 部分和 GPU 部分一起编译。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个选项，程序名默认是 `a.out`。
- `first_kernel.cu` 是包含上面代码的源文件。CUDA 源文件以 `.cu` 结尾。
- `./first_kernel` 运行程序。`./` 告诉 shell 在当前目录里找这个程序。

## 输出

```
Block ID: 0  ===  Thread ID: 0
```

- 只有一行输出，因为只有一个线程，而每个线程只打印一次。
- 两个编号都是 0，因为唯一的线程块和唯一的线程，编号都是 0。
- 每次运行的输出都相同，因为只有一个线程，不存在和其他线程抢先后的问题。

## 自己动手写

从零写一个只有一个线程的核函数，让它从 GPU 向你问好。

1. 用下面的框架创建文件 `hello.cu`。
2. 写出核函数 `hello`，用 `blockIdx.x` 和 `threadIdx.x` 打印出 `Hello from block 0, thread 0`。
3. 用一个线程块、一个线程启动它，并让 CPU 等它完成。

```c
#include "cuda_runtime.h"
#include <stdio.h>

// TODO: write the kernel hello() that prints its block ID and thread ID

int main()
{
    // TODO: launch hello with 1 block of 1 thread
    // TODO: wait for the GPU to finish
    return 0;
}
```

??? tip "提示"
    核函数以 `__global__ void` 开头。启动写作 `hello<<<1, 1>>>();`，等待写作 `cudaDeviceSynchronize();`。

??? note "答案"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void hello()
    {
        printf("Hello from block %d, thread %d\n", blockIdx.x, threadIdx.x);
    }

    int main()
    {
        hello<<<1, 1>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    用 `nvcc -o hello hello.cu` 编译，再用 `./hello` 运行。你应该会看到一行输出：`Hello from block 0, thread 0`。

## 术语表

- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，让你在 GPU 上运行自己的代码。
- GPU（Graphics Processing Unit，图形处理器）：拥有成千上万个小核心、用来运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：主处理器，负责运行 `main()` 并启动核函数。
- 核函数（kernel）：在 GPU 上运行的函数。你只写一次，GPU 就会在很多线程上同时运行它。
- 线程（thread）：最小的执行单位。一个线程就是核函数的一份正在运行的副本，有自己的编号。
- 线程块（block）：一组在同一个 SM 上运行的线程。它们可以通过共享内存共享数据。
- 网格（grid）：一次核函数调用所启动的全部线程块。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 内部的处理器之一。线程块在 SM 上运行。
- `__global__`：告诉编译器这个函数是 GPU 核函数，由 CPU 调用，在 GPU 上运行。
- `blockIdx.x`：当前线程所在线程块的编号，从 0 开始。
- `threadIdx.x`：当前线程在线程块里的编号，从 0 开始。
- `cudaDeviceSynchronize()`：让 CPU 一直等到 GPU 完成所有工作。
- 异步（asynchronous）：CPU 不等待，向 GPU 发出命令后就立刻往下执行。
- API（Application Programming Interface，应用程序编程接口）：一个库对外提供的一组函数，这里指 CUDA 运行时函数。
