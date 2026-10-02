# 04 > 内置变量

每个核函数都有五个只读的内置变量：`gridDim`、`blockDim`、`blockIdx`、`threadIdx` 和 `warpSize`。它们不用你传入，也不用声明。启动时，GPU 会根据启动配置为每个线程填好这些值。这一课让每个线程把这五个变量全部打印出来，你就能看出哪些会变、哪些不变。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，环境是 CUDA 13.0 和 Ubuntu 24。

## gridDim

`gridDim` 保存每个方向上的线程块数量。在 `<<<2, 4>>>` 下，`gridDim.x` 是 2，`gridDim.y` 和 `gridDim.z` 是 1。网格大小在启动时就定下来了，所以每个线程看到的 `gridDim` 都相同。

## blockDim

`blockDim` 保存每个线程块在每个方向上的线程数。在 `<<<2, 4>>>` 下，`blockDim.x` 是 4，`blockDim.y` 和 `blockDim.z` 是 1。每个线程看到的 `blockDim` 都相同。

[第 02 课](../Lesson-02/notes.md)的全局线程 ID 公式就用到了它：`blockIdx.x * blockDim.x + threadIdx.x`。在 `<<<2, 4>>>` 下，线程块 1 里的线程 3 得到 1 * 4 + 3 = 7，也就是 8 个线程里的最后一个。

<global-id></global-id>

## blockIdx

`blockIdx` 是线程所在线程块的编号。有 2 个线程块时，线程块 0 里所有线程的 `blockIdx.x` 都是 0，线程块 1 里的都是 1。它总是小于 `gridDim.x`。

## threadIdx

`threadIdx` 是线程在所在线程块里的编号，在每个线程块里都从 0 重新开始。在一个有 4 个线程的线程块里，`threadIdx.x` 依次是 0、1、2、3。它总是小于 `blockDim.x`。

`gridDim`、`blockDim`、`blockIdx` 和 `threadIdx` 都有 `.x`、`.y`、`.z` 三个字段。`gridDim` 和 `blockDim` 的类型是 `dim3`。如果你在 `<<<2, 4>>>` 里写的是普通数字，CUDA 会自动把 `.y = 1` 和 `.z = 1` 设好，所以 `<<<2, 4>>>` 和 `<<<dim3(2, 1, 1), dim3(4, 1, 1)>>>` 是等价的。

## warpSize

`warpSize` 是每个线程束的线程数，到目前为止在每一款 NVIDIA GPU 上都是 32。CUDA 把它作为变量提供出来，这样你的代码就不必把 32 写死。

> [!TIP]
> 现在直接写 32 也没问题。但读取 `warpSize` 的话，哪天某款 GPU 换了别的大小，你的代码依然正确。

## 硬件上限

运行核函数之前，CUDA 运行时会把启动配置和硬件上限做比较，只要有一个值超标，核函数就不会启动。下面是计算能力 3.0 及以后版本的上限，从 Kepler 到 Blackwell 都适用：

| 变量          | 维度         | 最大值    |
|---------------|--------------|-----------|
| `gridDim.x`   | x 方向线程块 | 2^31 - 1  |
| `gridDim.y`   | y 方向线程块 | 65535     |
| `gridDim.z`   | z 方向线程块 | 65535     |
| `blockDim.x`  | x 方向线程   | 1024      |
| `blockDim.y`  | y 方向线程   | 1024      |
| `blockDim.z`  | z 方向线程   | 64        |
| 每线程块线程数 | 总数         | 1024      |

即使每个值都没超出各自的上限，`blockDim.x * blockDim.y * blockDim.z` 也不能超过 1024。这就是[第 02 课](../Lesson-02/notes.md)讲过的每个线程块 1024 个线程的上限。看两个例子：

- `dim3(16, 16, 4)`：每个值都在上限之内，而且 16 x 16 x 4 = 1024 个线程，有效。
- `dim3(32, 32, 2)`：每个值都在上限之内，但 32 x 32 x 2 = 2048 个线程，无效，核函数不会运行。

> [!WARNING]
> 超出上限的启动能通过编译，运行时也没有任何提示，但核函数根本不会开始执行。启动之后要检查 `cudaGetLastError()`，就像[第 08 课](../Lesson-08/notes.md)里那样。

输入你自己的线程块大小和网格大小，看看这次启动是否有效：

<block-limits></block-limits>

## 代码

这个程序启动一个核函数，让每个线程打印全部五个内置变量，你就能看出哪些值会变、哪些不变。

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printBuiltins()
{
    printf("\ngridDim=(%d,%d,%d)  blockDim=(%d,%d,%d)  blockIdx=(%d,%d,%d)  threadIdx=(%d,%d,%d)  warpSize=%d",
        gridDim.x,   gridDim.y,   gridDim.z,
        blockDim.x,  blockDim.y,  blockDim.z,
        blockIdx.x,  blockIdx.y,  blockIdx.z,
        threadIdx.x, threadIdx.y, threadIdx.z,
        warpSize);
}

int main()
{
    printBuiltins<<<2, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- 两个 CUDA 头文件声明了运行时函数（比如 `cudaDeviceSynchronize`）和内置变量，`stdio.h` 提供 `printf`。
- `__global__` 把 `printBuiltins` 标记为核函数，它在 GPU 上运行，由 CPU 启动。
- 核函数里的 `printf` 在每个线程里运行一次。每个 `%d` 依次由格式字符串下面列出的一个字段填入。
- `printBuiltins<<<2, 4>>>()` 启动 2 个线程块，每块 4 个线程，所以一共 8 个线程运行这个核函数，打印 8 行。
- `cudaDeviceSynchronize()` 让 CPU 一直等到核函数执行完。核函数启动会立即返回，如果不等待，GPU 的输出还没出来，`main` 可能就已经结束了。

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## 代码逐步讲解

按照写代码的顺序，一步一步看这个程序。主要的工作都在那个很长的 `printf` 里：先是一个格式字符串，然后每个 `%d` 对应一个值。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** 和前几课一样的三行 `#include`。用 `nvcc` 编译时，内置变量不需要任何头文件，但有了 `device_launch_parameters.h`，某些编辑器也能认出它们。
2. `5-6,13 gpu` **空的核函数。** 写出 `__global__ void printBuiltins()` 和它的花括号。这个核函数不接收参数，因为它打印的全是 GPU 为每个线程填好的内置变量。
3. `7 gpu` **格式字符串。** 写出带 13 个 `%d` 占位符的文本：四个变量各有 `.x`、`.y` 和 `.z` 三个，再加上 `warpSize` 的 1 个。开头写 `\n`，让每个线程的输出各占一行。这一行以逗号结尾，因为后面还要跟各个值。
4. `8-12 gpu` **各个值。** 按占位符的顺序列出 13 个值，每行一个变量，这样顺序一目了然。规则是：每个 `%d` 对应一个值，顺序一致。少写一个值，程序可能照样能编译，`printf` 却会打印出错误的数字，所以两边都要数一数。
5. `15-16,19-20 cpu` **main 函数。** 写好 `main`，最后是 `return 0;`。框架和前几课相同。
6. `17 cpu` **启动核函数。** `<<<2, 4>>>` 把 `gridDim.x` 设为 2，把 `blockDim.x` 设为 4。写普通数字时，`.y` 和 `.z` 方向的大小保持为 1。
7. `18 cpu` **等待 GPU。** `cudaDeviceSynchronize();` 让程序一直等到 8 行全部打印出来。少了它，GPU 的输出还没出来，`main` 可能就已经结束了。

</div>

## 编译和运行

第一条命令把代码编译成程序，第二条命令运行它。

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` 是 CUDA 编译器。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个选项，程序名默认是 `a.out`。
- `first_kernel.cu` 是包含上面代码的源文件。
- `./first_kernel` 运行当前目录下的程序。

## 输出

程序会打印 8 行，每个线程一行：

```
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(3,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(3,0,0)  warpSize=32
```

- `gridDim` 和 `blockDim` 在每一行都相同，因为所有线程的启动配置都一样。
- `blockIdx` 随线程块变化。`threadIdx` 随线程变化，到第二个线程块又从 0 开始。
- `.y` 和 `.z` 方向的大小是 1，`.y` 和 `.z` 方向的编号是 0，因为 `<<<2, 4>>>` 用的是普通数字。
- `warpSize` 始终是 32。
- 这里线程块 1 比线程块 0 先打印。GPU 独立运行各个线程块，顺序不固定，所以线程块之间的顺序，以及每个线程块内部线程的顺序，每次运行都可能不同。

## 自己动手写

读取内置变量算出一次启动的规模，并用 `dim3` 值传入各个大小。

1. 用下面的框架创建 `launch_size.cu`。
2. 只让线程块 0 的线程 0 打印，这样这一行只出现一次。
3. 打印线程块数量、每个线程块的线程数、线程总数和线程束大小。
4. 用 `dim3 grid(3)` 和 `dim3 block(64)` 启动。

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void launchSize()
{
    // TODO: only the first thread of the first block prints
    // TODO: print blocks, threads per block, total threads and warp size
}

int main()
{
    // TODO: make a dim3 grid of 3 blocks and a dim3 block of 64 threads
    // TODO: launch launchSize with them
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "提示"
    检查 `blockIdx.x == 0 && threadIdx.x == 0`。线程总数是 `gridDim.x * blockDim.x`。`dim3` 在启动配置里的用法和数字相同：`<<<grid, block>>>`。

??? note "答案"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void launchSize()
    {
        if (blockIdx.x == 0 && threadIdx.x == 0) {
            printf("blocks: %d, threads per block: %d, total threads: %d, warp size: %d\n",
                   gridDim.x, blockDim.x, gridDim.x * blockDim.x, warpSize);
        }
    }

    int main()
    {
        dim3 grid(3);
        dim3 block(64);
        launchSize<<<grid, block>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    用 `nvcc -o launch_size launch_size.cu` 编译，再用 `./launch_size` 运行。你应该会看到一行：`blocks: 3, threads per block: 64, total threads: 192, warp size: 32`。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 并启动核函数的主处理器。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台和语言扩展，用来编写在 GPU 上运行的程序。
- 计算能力（compute capability，CC）：一代 GPU 的版本号，上表中的各项上限都由它规定（[第 03 课](../Lesson-03/notes.md)）。
- `gridDim`：每个方向（x、y、z）上的线程块数量。同一次启动中，每个线程看到的值都相同。
- `blockDim`：每个线程块在每个方向上的线程数。同一次启动中，每个线程看到的值都相同。
- `blockIdx`：线程所在线程块的编号，在每个方向上都小于 `gridDim`。
- `threadIdx`：线程在所在线程块里的编号，在每个线程块里都从 0 重新开始。
- `warpSize`：每个线程束的线程数，在目前所有硬件上都是 32。
- `dim3`：CUDA 的一个结构体，有 `.x`、`.y`、`.z` 三个整数字段，用来表示网格和线程块的大小。`<<<>>>` 里的普通数字会变成一个 `.y=1`、`.z=1` 的 `dim3`。
- 启动配置（launch configuration）：一次启动里的 `<<<blocks, threads>>>` 部分，GPU 会把它填进 `gridDim` 和 `blockDim`。
- 网格（grid）：一次启动的全部线程块，它的大小就是 `gridDim`。
- 线程束（warp）：GPU 一起运行的 32 个线程（[第 01 课](../Lesson-01/notes.md)）。
- CUDA 运行时（CUDA runtime）：`cudaDeviceSynchronize()` 这类调用背后的库，它会把启动配置和硬件上限做比较。
- `cudaGetLastError()`：返回最近一次的 CUDA 错误，比如一次超出上限的启动。
- `__global__`：把一个函数标记为核函数，由 CPU 启动，在 GPU 上运行。
- 格式字符串（format string）：`printf` 的第一个参数，里面的每个 `%d` 依次由后面的参数替换。
- `cudaDeviceSynchronize()`：让 CPU 一直等到 GPU 完成工作。启动本身会立即返回。
- `nvcc`：CUDA 编译器。它把 `.cu` 文件里的 CPU 部分和 GPU 部分编译成一个程序。
- `-o`：设置输出程序的名字。不加时，名字是 `a.out`。
