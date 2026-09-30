# 第 04 课：内置变量

每个核函数都有五个只读的内置变量：`gridDim`、`blockDim`、`blockIdx`、`threadIdx` 和 `warpSize`。你不需要传入它们，也不需要声明它们。硬件会在启动时根据启动配置设置好它们的值。

## gridDim

`gridDim` 保存每个方向上的线程块数量。用 `<<<2, 4>>>` 启动时，`gridDim.x` 是 2，`gridDim.y` 和 `gridDim.z` 是 1。网格大小在启动时就定下来了，所以每个线程看到的 `gridDim` 都一样。

## blockDim

`blockDim` 保存每个方向上每个线程块的线程数。用 `<<<2, 4>>>` 启动时，`blockDim.x` 是 4，`blockDim.y` 和 `blockDim.z` 是 1。第 02 课里的全局编号公式就用到了它：`blockIdx.x * blockDim.x + threadIdx.x`。

## blockIdx

`blockIdx` 是线程所在线程块的编号。有 2 个线程块时，线程块 0 里所有线程的 `blockIdx.x` 都是 0，线程块 1 里所有线程的 `blockIdx.x` 都是 1。它总是小于 `gridDim.x`。

## threadIdx

`threadIdx` 是线程在它的线程块里的编号。每个线程块里都从 0 重新开始。在一个有 4 个线程的线程块里，`threadIdx.x` 是 0、1、2、3。

`gridDim`、`blockDim`、`blockIdx` 和 `threadIdx` 都是 `dim3` 结构体，带有 `.x`、`.y`、`.z` 三个字段。如果你直接用数字写 `<<<2, 4>>>`，CUDA 会自动帮你设置 `.y = 1` 和 `.z = 1`。

## warpSize

`warpSize` 是每个线程束的线程数。在目前所有的 GPU 上，它都是 32。它之所以是一个变量而不是固定常量，是因为 NVIDIA 将来可能会在新架构里改变它。

> [!TIP]
> 现在直接写 32 也能用。但读取 `warpSize` 的写法，即使将来这个值变了，也依然正确。

## 硬件限制

在运行核函数之前，驱动程序会拿启动配置和硬件限制做比较。只要有一个值太大，核函数就不会启动。下面是 CC 3.0 及以后（从 Kepler 到 Blackwell）的限制：

| 变量          | 维度               | 最大值    |
|---------------|--------------------|-----------|
| `gridDim.x`   | x 方向的线程块数   | 2^31 - 1  |
| `gridDim.y`   | y 方向的线程块数   | 65535     |
| `gridDim.z`   | z 方向的线程块数   | 65535     |
| `blockDim.x`  | x 方向的线程数     | 1024      |
| `blockDim.y`  | y 方向的线程数     | 1024      |
| `blockDim.z`  | z 方向的线程数     | 64        |
| 每个线程块的线程数 | 总数          | 1024      |

即使每个单独的值都没超出限制，`blockDim.x * blockDim.y * blockDim.z` 也不能超过 1024。这就是第 02 课讲过的每个线程块最多 1024 个线程的上限。

## 代码

这个程序启动一个核函数，让每个线程都打印出全部五个内置变量。这样你就能看出哪些值会变，哪些值保持不变。

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

- 两个 CUDA 头文件声明了运行时函数（比如 `cudaDeviceSynchronize`）和内置变量。`stdio.h` 提供了 `printf`。
- `__global__` 把 `printBuiltins` 标记为核函数。它在 GPU 上运行，由 CPU 启动。
- 核函数里的 `printf` 每个线程运行一次。每个 `%d` 按格式字符串后面列出的顺序，填入一个字段的值。
- `printBuiltins<<<2, 4>>>()` 启动 2 个线程块，每个 4 个线程，所以一共 8 个线程运行这个核函数，打印 8 行。
- `cudaDeviceSynchronize()` 让 CPU 一直等到核函数执行完。核函数启动后会马上返回，所以如果不等待，`main` 可能在 GPU 输出出现之前就结束了。

## 编译和运行

把源文件编译成程序，然后运行它，看看打印出来的值。

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc` 是 CUDA 编译器。
- `first_kernel.cu` 是包含上面代码的源文件。
- `-o first_kernel` 把程序命名为 `first_kernel`。不加这个参数的话，程序名是 `a.out`。
- `./first_kernel` 运行当前文件夹里的这个程序。

程序会打印下面的输出，一共 8 行，每个线程一行。

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

每一行的 `gridDim` 和 `blockDim` 都一样，因为所有线程的启动配置都相同。`blockIdx` 随线程块变化。`threadIdx` 随线程变化，并且在第二个线程块里从 0 重新开始。`.y` 和 `.z` 方向的大小是 1，`.y` 和 `.z` 方向的编号是 0，因为 `<<<2, 4>>>` 用的是普通数字。`warpSize` 始终是 32。

这里线程块 1 比线程块 0 先打印。GPU 独立运行各个线程块，顺序不固定。所以线程块之间的顺序，以及每个线程块内部线程的顺序，每次运行都可能不同。

## 图示

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## 术语表

- `gridDim`：每个方向（x、y、z）上的线程块数量。同一次启动里，每个线程看到的值都一样。
- `blockDim`：每个方向上每个线程块的线程数。同一次启动里，每个线程看到的值都一样。
- `blockIdx`：线程所在线程块的编号。在每个方向上都小于 `gridDim`。
- `threadIdx`：线程在它的线程块里的编号。每个线程块里都从 0 重新开始。
- `warpSize`：每个线程束的线程数。在目前的硬件上始终是 32。
- `dim3`：一个 CUDA 结构体，带有 `.x`、`.y`、`.z` 三个整数字段。四个编号和大小变量都是这个类型。`<<<>>>` 里的普通数字会变成 `.y=1`、`.z=1` 的 `dim3`。
