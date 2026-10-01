# 第 07 课：线程束编号

[第 01 课](../Lesson-01/notes.md)和[第 02 课](../Lesson-02/notes.md)讲了线程块编号和线程编号。这节课加上线程束（warp），也就是 GPU（Graphics Processing Unit，图形处理器）真正调度的 32 个线程一组的单位，并说明一个线程怎样在核函数里算出自己的线程束编号和通道编号。

> [!NOTE]
> 本页所有输出都来自一块 NVIDIA L40S，使用 CUDA 13.0，系统是 Ubuntu 24。

## CUDA 的层次结构

CUDA（Compute Unified Device Architecture，统一计算设备架构）的层次是：网格，网格里的线程块，每个线程块里的线程束，以及每个线程束里的线程：

<cuda-hierarchy warps></cuda-hierarchy>

线程块的数量和每个线程块的线程数由你通过 `<<<num_blocks, threads_per_block>>>` 来选择（见[第 01 课](../Lesson-01/notes.md)和[第 02 课](../Lesson-02/notes.md)）。在 NVIDIA GPU 上，线程束的大小永远是 32。它是硬件固定的，不能更改。线程束才是 GPU 上真正的调度单位。GPU 不会一个一个地运行线程，而是 32 个一组地运行。

> [!NOTE]
> 线程束的上限取决于硬件。下面这些值是在 L40S 上用 `cudaGetDeviceProperties` 测出来的：
>
> - 每个线程块最多的线程束数：32（最多 1024 个线程 / 32，适用于所有 GPU）
> - 每个 SM（Streaming Multiprocessor，流式多处理器）同时驻留的最多线程束数：48，也就是 48 × 32 = 1536 个线程
> - SM 数量：142
> - 整块 GPU 同时驻留的最多线程束数：142 × 48 = 6,816
>
> L40S 的计算能力（CC，compute capability）是 8.9。CC 8.6、8.9 和 12.0 的 GPU 每个 SM 可容纳 48 个线程束。A100（CC 8.0）和 H100（CC 9.0）这类数据中心 GPU 每个 SM 可容纳 64 个线程束，也就是 2048 个线程（[第 03 课](../Lesson-03/notes.md)）。

## `warp_id` 不是内置变量

`blockIdx.x` 和 `threadIdx.x` 由 GPU 为每个线程填好，你只需要读取它们。线程束编号没有这样的变量，你要在核函数里自己算：

```c
int warp_id = threadIdx.x / 32;
```

两边都是整数，所以 `/` 是整数除法，余数会被丢掉。正因为这样，每 32 个线程一组会得到同样的结果。在一个有 128 个线程的线程块里：

- 线程 0-31 → 线程束 0
- 线程 32-63 → 线程束 1
- 线程 64-95 → 线程束 2
- 线程 96-127 → 线程束 3

一共是 128 / 32 = 4 个线程束。

## 1024 个线程时会怎样

用 1 个有 1024 个线程的线程块（`<<<1, 1024>>>`）时，线程束编号从 0 到 31。这是对的，因为 1024 / 32 = 32 个线程束。每个线程束编号正好对应 32 个线程。程序打印了下面这些内容（有删减）：

```
Block ID: 0 --- Thread ID:    0 --- Warp ID:  0
Block ID: 0 --- Thread ID:    1 --- Warp ID:  0
...
Block ID: 0 --- Thread ID:   31 --- Warp ID:  0
Block ID: 0 --- Thread ID:   32 --- Warp ID:  1
...
Block ID: 0 --- Thread ID:  992 --- Warp ID: 31
...
Block ID: 0 --- Thread ID: 1023 --- Warp ID: 31
```

每个 `...` 代表省略掉的行。线程块编号始终是 0，因为只有一个线程块。线程束编号在线程 31 和线程 32 之间从 0 变成 1，因为 32 / 32 = 1。最后一个线程束从线程 992 开始，因为 992 / 32 = 31。线程 1023 是最后一个线程，1023 / 32 仍然是 31。

在机器上验证过：线程束 0-31，每个正好 32 个线程，一共 1024 行。下面按线程束编号统计的输出行数可以说明这一点：

```
32 warp 0
32 warp 1
...
32 warp 31
```

每一行先给出数量，再给出线程束编号。每个数量都是 32，因为每个线程束正好有 32 个线程。这样的行一共有 32 行，而 32 × 32 = 1024。

## 线程束编号在每个线程块里重新开始

线程束编号在每个线程块里都从零开始。用 `<<<2, 64>>>` 时，每个线程块有 64 个线程，也就是 2 个线程束。所以两个线程块都有线程束 0 和线程束 1，`warp_id = 0` 出现了两次，一次在线程块 0，一次在线程块 1。

> [!WARNING]
> 光看线程束编号，并不能知道一个线程属于整次启动中的哪个线程束。一定要把它和线程块编号放在一起看。线程块 0 的线程 40 和线程块 1 的线程 40 得到的线程束编号都是 40 / 32 = 1，但它们在不同的线程束里。

## 通道编号

每个线程束有 32 个线程。一个线程在自己线程束里的位置，从 0 到 31，就是它的通道编号（lane ID）。用取模运算符 `threadIdx.x % 32` 就能得到它，结果是除法的余数。除法得到线程束，余数得到它在线程束里的位置：

| `threadIdx.x` | 线程束编号（`/ 32`） | 通道编号（`% 32`） |
|---|---|---|
| 0 | 0 | 0 |
| 31 | 0 | 31 |
| 32 | 1 | 0 |
| 33 | 1 | 1 |
| 70 | 2 | 6 |
| 127 | 3 | 31 |

以线程 70 为例：70 / 32 = 2，余数是 6，因为 2 × 32 + 6 = 70。线程 0、32 和 64 在不同的线程束里，但通道编号都是 0。所以取模得不到线程束编号。要得到线程束编号，需要用除法（`/`）。

拖动滑块可以改变线程块的大小，把鼠标悬停在某个线程上，就能看到这两个数字：

<warp-lane></warp-lane>

## 代码

### `warp_ids.cu`

核函数用 1 个有 128 个线程的线程块运行。`test01` 函数在 GPU 上运行。每个线程用 `threadIdx.x / 32` 算出自己的 `warp_id`，然后打印自己的线程块编号、线程编号和线程束编号。启动之后，`cudaDeviceSynchronize()` 让 CPU（Central Processing Unit，中央处理器）等待 GPU，这样程序结束时输出就不会丢失。

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 1 block, 128 threads -> 4 warps (IDs: 0,1,2,3)
    test01<<<1, 128>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `#include "cuda_runtime.h"`：CUDA 函数的头文件。
- `#include "device_launch_parameters.h"`：定义了 `blockIdx` 和 `threadIdx` 这样的 GPU 内置变量。
- `#include <stdio.h>`：提供 `printf` 的标准 C 头文件。
- `__global__`：把这个函数标记为核函数。由 CPU 调用，由 GPU 运行。
- `int warp_id = threadIdx.x / 32;`：每个线程算出自己的线程束编号。线程 0-31 → 0，线程 32-63 → 1，以此类推。
- `printf(...)`：每个线程打印自己的线程块编号、线程编号和线程束编号。
- `test01<<<1, 128>>>();`：用 1 个有 128 个线程的线程块启动核函数。
- `cudaDeviceSynchronize();`：让 CPU 等待，直到所有 GPU 线程都执行完毕、输出也都写出来。

### `warp_ids_2blocks.cu`

这个文件用的核函数和 `warp_ids.cu` 一样。只有启动配置不同，是 `<<<2, 64>>>`。也就是 2 个线程块，每个 64 个线程，所以每个线程块有 64 / 32 = 2 个线程束。这个文件说明线程束编号在每个线程块里都会重新开始。

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 2 blocks, 64 threads/block -> 2 warps per block, warp ID resets per block
    test01<<<2, 64>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `test01<<<2, 64>>>();`：用 2 个各有 64 个线程的线程块启动核函数。一共 128 个线程、4 个线程束，分布在 2 个线程块里。
- 其他各行都和 `warp_ids.cu` 一样。

## 编译和运行

两个文件都在 `code/` 目录里。把它们分别编译成各自的程序再运行，这样就能比较两种启动配置：

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

- 以 `#` 开头的行是注释，shell 会忽略它们。
- `nvcc` 是 CUDA 编译器。
- `-arch=sm_89` 为计算能力 8.9，也就是 L40S 编译。为正确的架构编译的代码可以用上它的所有功能。
- `-o warp_ids` 把程序命名为 `warp_ids`。不加的话名字是 `a.out`，第二次编译就会覆盖第一个程序。
- `warp_ids.cu` 是源文件。
- `./warp_ids` 从当前文件夹运行这个程序。

## 输出

### `<<<1, 128>>>`

这是 `./warp_ids` 的输出。一共 128 行，每个线程一行，有 4 个线程束。这是 L40S 上的真实输出。线程的顺序没有保证，所以下面的列表是排过序的。

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
Block ID: 0 --- Thread ID:  1 --- Warp ID: 0
Block ID: 0 --- Thread ID:  2 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
Block ID: 0 --- Thread ID: 33 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 0 --- Thread ID: 64 --- Warp ID: 2
...
Block ID: 0 --- Thread ID: 95 --- Warp ID: 2
Block ID: 0 --- Thread ID: 96 --- Warp ID: 3
...
Block ID: 0 --- Thread ID: 127 --- Warp ID: 3
```

线程块编号始终是 0，因为只有一个线程块。线程束编号在线程 32、64 和 96 处各加一，因为它们都是新的 32 的倍数。每个 `...` 代表省略掉的行。

### `<<<2, 64>>>`

这是 `./warp_ids_2blocks` 的输出。一共 128 行，2 个线程块，每个线程块 2 个线程束。线程束编号在每个线程块里重新开始。

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 1 --- Thread ID:  0 --- Warp ID: 0   <- resets to zero
...
Block ID: 1 --- Thread ID: 31 --- Warp ID: 0
Block ID: 1 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 1 --- Thread ID: 63 --- Warp ID: 1
```

线程编号最大只到 63，因为每个线程块有 64 个线程。线程块 1 又显示 warp_id 0，因为 `threadIdx.x` 在每个线程块里都从零开始，而线程束编号是从它算出来的。整块 GPU 并没有一个全局的线程束编号。`<- resets to zero` 这个标记是手动加上的，程序并不会打印它。

## 图示

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## 动手试试

- 启动 `test01<<<1, 100>>>()`。100 不是 32 的倍数，所以最后一个线程束只填满了一部分：线程束 0、1 和 2 各有 32 个线程，线程束 3 只有线程 96 到 99。GPU 仍然会为它调度一个完整的 32 线程的线程束，其中 28 个通道处于空闲状态。
- 在核函数里加上 `int lane_id = threadIdx.x % 32;` 并把它打印出来。线程 70 应该打印出通道编号 6。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 内部运行线程块及其线程束的处理器。L40S 有 142 个。
- 线程束（warp）：GPU 作为一个整体来运行的 32 个线程。GPU 调度的是线程束，而不是单个线程。
- 线程束大小（warp size）：在 NVIDIA GPU 上永远是 32。软件无法更改。
- 线程束编号（warp ID）：线程在自己的线程块里属于哪个线程束。它等于 `threadIdx.x / 32`。
- 通道编号（lane ID）：线程在自己线程束里的位置，从 0 到 31。它等于 `threadIdx.x % 32`。它得不到线程束编号。
- 每个线程块的线程束数：`(threads per block) / 32`。每个线程块 128 个线程 → 每个线程块 4 个线程束。
- 线程束编号重置：线程束编号在每个线程块里都从零开始，和 `threadIdx.x` 一样。整块 GPU 没有全局的线程束编号。
