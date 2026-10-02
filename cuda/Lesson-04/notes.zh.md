# 04 > 内置变量

每个核函数都有五个只读的内置变量：`gridDim`、`blockDim`、`blockIdx`、`threadIdx` 和 `warpSize`。你不需要传递或声明它们。启动时，GPU（Graphics Processing Unit，图形处理器）会根据启动配置，为每个线程填好这些值。这节课让每个线程把这五个变量全部打印出来，这样你就能看到哪些会变，哪些保持不变。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，环境是 CUDA 13.0 和 Ubuntu 24。

## gridDim

`gridDim` 保存每个方向上的线程块数量。在 `<<<2, 4>>>` 下，`gridDim.x` 是 2，`gridDim.y` 和 `gridDim.z` 是 1。网格大小在启动时就确定了，所以每个线程看到的 `gridDim` 都一样。

## blockDim

`blockDim` 保存每个方向上每个线程块的线程数。在 `<<<2, 4>>>` 下，`blockDim.x` 是 4，`blockDim.y` 和 `blockDim.z` 是 1。每个线程看到的 `blockDim` 都一样。

[第 02 课](../Lesson-02/notes.md)里的全局线程 ID 公式就用到了它：`blockIdx.x * blockDim.x + threadIdx.x`。在 `<<<2, 4>>>` 下，线程块 1 里的线程 3 得到 1 * 4 + 3 = 7，也就是 8 个线程中的最后一个。

<global-id></global-id>

## blockIdx

`blockIdx` 是线程所在线程块的编号。有 2 个线程块时，线程块 0 里所有线程的 `blockIdx.x` 都是 0，线程块 1 里所有线程的都是 1。它总是小于 `gridDim.x`。

## threadIdx

`threadIdx` 是线程在它的线程块里的编号。它在每个线程块里都从 0 重新开始。在一个有 4 个线程的线程块里，`threadIdx.x` 是 0、1、2、3。它总是小于 `blockDim.x`。

`gridDim`、`blockDim`、`blockIdx` 和 `threadIdx` 都有 `.x`、`.y`、`.z` 三个字段。`gridDim` 和 `blockDim` 的类型是 `dim3`。如果你在 `<<<2, 4>>>` 里写的是普通数字，CUDA（Compute Unified Device Architecture，统一计算设备架构）会自动把 `.y = 1` 和 `.z = 1` 设好。所以 `<<<2, 4>>>` 和 `<<<dim3(2, 1, 1), dim3(4, 1, 1)>>>` 是一样的。

## warpSize

`warpSize` 是每个线程束的线程数。到目前为止，在每一款 NVIDIA GPU 上它都是 32。CUDA 把它作为变量提供给你，这样你的代码就不必手动写死 32 这个数字。

> [!TIP]
> 现在直接写 32 也能用。读取 `warpSize`，能让你的代码在将来某款 GPU 使用别的大小时依然正确。

## 硬件上限

运行核函数之前，CUDA 运行时会拿启动配置和硬件上限做比较。只要有一个值太大，核函数就不会启动。下面是 CC（compute capability，计算能力）3.0 及以后版本的上限，从 Kepler 到 Blackwell 都适用：

| 变量          | 维度         | 最大值    |
|---------------|--------------|-----------|
| `gridDim.x`   | x 方向线程块 | 2^31 - 1  |
| `gridDim.y`   | y 方向线程块 | 65535     |
| `gridDim.z`   | z 方向线程块 | 65535     |
| `blockDim.x`  | x 方向线程   | 1024      |
| `blockDim.y`  | y 方向线程   | 1024      |
| `blockDim.z`  | z 方向线程   | 64        |
| 每线程块线程数 | 总数         | 1024      |

`blockDim.x * blockDim.y * blockDim.z` 不能超过 1024，即使每个单独的值都在各自的上限之内。这就是[第 02 课](../Lesson-02/notes.md)里讲过的每个线程块 1024 个线程的上限。举两个例子：

- `dim3(16, 16, 4)`：每个值都在上限之内，而且 16 x 16 x 4 = 1024 个线程。有效。
- `dim3(32, 32, 2)`：每个值都在上限之内，但 32 x 32 x 2 = 2048 个线程。无效，核函数不会运行。

> [!WARNING]
> 超出上限的启动能编译，运行时也没有任何提示，但核函数根本不会开始执行。启动之后检查 `cudaGetLastError()`，就像[第 08 课](../Lesson-08/notes.md)里做的那样。

输入你自己的线程块大小和网格大小，看看这次启动是否有效：

<block-limits></block-limits>

## 代码

这个程序启动一个核函数，让每个线程打印全部五个内置变量，这样你就能看到哪些值会变，哪些保持不变。

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

- 两个 CUDA 头文件声明了运行时函数（比如 `cudaDeviceSynchronize`）和内置变量。`stdio.h` 提供 `printf`。
- `__global__` 把 `printBuiltins` 标记为核函数。它在 GPU 上运行，由 CPU（Central Processing Unit，中央处理器）启动。
- 核函数里的 `printf` 每个线程运行一次。每个 `%d` 依次用格式字符串下面列出的一个字段来填充。
- `printBuiltins<<<2, 4>>>()` 启动 2 个线程块，每块 4 个线程，所以有 8 个线程运行这个核函数，打印 8 行。
- `cudaDeviceSynchronize()` 让 CPU 一直等到核函数执行完。核函数启动会立刻返回，所以如果不等待，`main` 可能在 GPU 的输出出现之前就结束了。

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## 代码逐步讲解

按照你写代码的顺序，一步一步看这个程序。主要的工作在那个很长的 `printf` 里：一个格式字符串，然后每个 `%d` 对应一个值。

<div class="code-walk" markdown>

1. `1-3 cpu` **头文件。** 和前几课一样的三行 `#include`。用 `nvcc` 时，内置变量不需要任何头文件，但 `device_launch_parameters.h` 能让某些编辑器也认识它们。
2. `5-6,13 gpu` **空的核函数。** 写出 `__global__ void printBuiltins()` 和它的花括号。这个核函数不接收参数，因为它打印的全是 GPU 为每个线程填好的内置变量。
3. `7 gpu` **格式字符串。** 写出带 13 个 `%d` 占位符的文本：四个变量各有 `.x`、`.y` 和 `.z`，每个变量 3 个，再加上 `warpSize` 的 1 个。以 `\n` 开头，让每个线程的输出各占一行。这一行以逗号结尾，因为后面跟着各个值。
4. `8-12 gpu` **各个值。** 按照占位符的顺序列出 13 个值，每行一个变量，这样顺序很容易检查。规则是：每个 `%d` 对应一个值，顺序一致。少一个值时程序仍可能通过编译，然后 `printf` 会打印出错误的数字，所以两边都要数一数。
5. `15-16,19-20 cpu` **main 函数。** 写好 `main`，最后是 `return 0;`。框架和前几课一样。
6. `17 cpu` **启动核函数。** `<<<2, 4>>>` 把 `gridDim.x` 设为 2，把 `blockDim.x` 设为 4。普通数字会让 `.y` 和 `.z` 方向的大小保持为 1。
7. `18 cpu` **等待 GPU。** `cudaDeviceSynchronize();` 让程序一直运行到全部 8 行都打印出来。没有它，`main` 可能在 GPU 的输出出现之前就结束了。

</div>

## 编译和运行

第一条命令把代码编译成程序。第二条命令运行它。

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` 是 CUDA 编译器。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个参数的话，程序名是 `a.out`。
- `first_kernel.cu` 是包含上面代码的源文件。
- `./first_kernel` 从当前文件夹运行程序。

## 输出

程序打印 8 行，每个线程一行：

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

- `gridDim` 和 `blockDim` 在每一行都一样，因为所有线程的启动配置都相同。
- `blockIdx` 随线程块变化。`threadIdx` 随线程变化，并在第二个线程块里从 0 重新开始。
- `.y` 和 `.z` 方向的大小是 1，`.y` 和 `.z` 方向的编号是 0，因为 `<<<2, 4>>>` 用的是普通数字。
- `warpSize` 始终是 32。
- 这里线程块 1 比线程块 0 先打印。GPU 独立地运行各个线程块，顺序不固定，所以线程块之间的顺序，以及每个线程块内部线程的顺序，每次运行都可能不同。

## 自己动手写

读取内置变量来算出一次启动的规模，并用 `dim3` 值传入各个大小。

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
    检查 `blockIdx.x == 0 && threadIdx.x == 0`。线程总数是 `gridDim.x * blockDim.x`。`dim3` 在启动配置里的用法和数字一样：`<<<grid, block>>>`。

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

    用 `nvcc -o launch_size launch_size.cu` 和 `./launch_size` 编译并运行。你应该会看到一行：`blocks: 3, threads per block: 64, total threads: 192, warp size: 32`。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 并启动核函数的主处理器。
- CC（compute capability，计算能力）：GPU 某一代产品的版本号。它规定了上表中的各项上限（[第 03 课](../Lesson-03/notes.md)）。
- `gridDim`：每个方向（x、y、z）上的线程块数量。同一次启动中每个线程看到的值都一样。
- `blockDim`：每个方向上每个线程块的线程数。同一次启动中每个线程看到的值都一样。
- `blockIdx`：线程所在线程块的编号。在每个方向上都总是小于 `gridDim`。
- `threadIdx`：线程在它的线程块里的编号。在每个线程块里都从 0 重新开始。
- `warpSize`：每个线程束的线程数。在目前所有硬件上都是 32。
- `dim3`：一个 CUDA 结构体，有 `.x`、`.y`、`.z` 三个整数字段，用来表示网格和线程块的大小。`<<<>>>` 里的普通数字会变成一个 `.y=1`、`.z=1` 的 `dim3`。
