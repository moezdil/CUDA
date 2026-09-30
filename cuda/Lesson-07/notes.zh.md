# 第 07 课：线程束编号

这节课讲线程束，也就是 CUDA 层级结构里的第三层。第 01 课和第 02 课讲了线程块编号和线程编号。这节课你会学到，线程在核函数里怎样找到自己所在的线程束。

> [!NOTE]
> 本页的所有输出都来自一块 NVIDIA L40S，环境是 Ubuntu 24 上的 CUDA 13.0。

## CUDA 层级结构

CUDA 在软件上的层级是：

<cuda-hierarchy warps></cuda-hierarchy>

线程块的数量和每个线程块的线程数，由你通过 `<<<num_blocks, threads_per_block>>>` 来选择（见第 01 课、第 02 课）。在 NVIDIA GPU 上，线程束大小始终是 32。它是硬件固定的，不能修改。线程束才是 GPU 上真正的调度单位。GPU 不会一个一个地运行线程，而是 32 个一组地运行。

> [!NOTE]
> 线程束相关的限制取决于硬件。下面这些值是在 L40S 上用 `cudaGetDeviceProperties` 测出来的：
>
> - 每个线程块最多线程束数：32（最多 1024 个线程 / 32，所有 GPU 都适用）
> - 每个 SM 最多同时运行的线程束数：48
> - SM 数量：142
> - 整块 GPU 最多同时运行的线程束数：6,816

## warp_id 不是内置变量

`blockIdx.x` 和 `threadIdx.x` 是 GPU 为每个线程填好的，你只需要读取它们。线程束编号没有这样的变量，你要在核函数里自己算：

```c
int warp_id = threadIdx.x / 32;
```

两边都是整数，所以 `/` 是整数除法，余数会被丢掉。这就是为什么每 32 个线程一组，得到的结果都一样。在一个有 128 个线程的线程块里：

- 线程 0-31 → 线程束 0
- 线程 32-63 → 线程束 1
- 线程 64-95 → 线程束 2
- 线程 96-127 → 线程束 3

也就是 128 / 32 = 4 个线程束。

## 1024 个线程时会怎样

用 1 个线程块、1024 个线程（`<<<1, 1024>>>`）启动时，线程束编号从 0 到 31。这是对的，因为 1024 / 32 = 32 个线程束。每个线程束编号正好对应 32 个线程。程序打印了下面的内容（有删节）：

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

每个 `...` 代表省略掉的行。线程块编号始终是 0，因为只有一个线程块。在线程 31 和线程 32 之间，线程束编号从 0 变成 1，因为 32 / 32 = 1。最后一个线程束从线程 992 开始，因为 992 / 32 = 31。线程 1023 是最后一个线程，1023 / 32 仍然是 31。

在机器上验证过：线程束 0-31，每个正好 32 个线程，一共 1024 行。下面按线程束编号统计了输出行数，可以看出这一点：

```
32 warp 0
32 warp 1
...
32 warp 31
```

每一行先是数量，然后是线程束编号。每个数量都是 32，因为每个线程束正好有 32 个线程。这样的行一共有 32 行，32 × 32 = 1024。

## 线程束编号在每个线程块里重新开始

线程束编号在每个线程块里都从 0 开始。有 2 个线程块时，两个线程块里都有线程束 0 和线程束 1。所以光看线程束编号 0，你分不出它属于哪个线程块，还需要线程块编号。用 `<<<2, 64>>>` 启动时，每个线程块有 64 个线程，也就是 2 个线程束。`warp_id=0` 会出现两次，线程块 0 里一次，线程块 1 里一次。

## 通道编号（练习）

每个线程束有 32 个线程。一个线程在它的线程束里的位置（0 到 31）就是它的通道编号（lane ID）。用取模运算 `threadIdx.x % 32` 就能得到它。比如线程 33 在线程束 1 里，通道编号是 1（33 % 32 = 1）。线程 0、32 和 64 在不同的线程束里，但通道编号都是 0。所以取模得不到线程束编号。要得到线程束编号，需要用除法（`/`）。

## 代码

这个核函数用 1 个线程块、128 个线程运行。`test01` 函数在 GPU 上运行。每个线程用 `threadIdx.x / 32` 算出自己的 `warp_id`，然后打印自己的线程块编号、线程编号和线程束编号。启动之后，`cudaDeviceSynchronize()` 让 CPU 等待 GPU，这样程序结束时输出就不会丢失。

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
- `#include <stdio.h>`：标准 C 头文件，提供 `printf`。
- `__global__`：把这个函数标记为核函数。由 CPU 调用，在 GPU 上运行。
- `int warp_id = threadIdx.x / 32;`：每个线程算出自己的线程束编号。线程 0-31 → 0，线程 32-63 → 1，依此类推。
- `printf(...)`：每个线程打印自己的线程块编号、线程编号和线程束编号。
- `test01<<<1, 128>>>();`：用 1 个线程块、128 个线程启动核函数。
- `cudaDeviceSynchronize();`：让 CPU 一直等到所有 GPU 线程执行完，并且输出已经写出。

## warp_ids_2blocks.cu

这个文件用的核函数和 `warp_ids.cu` 一样，只是启动配置不同，是 `<<<2, 64>>>`。也就是 2 个线程块，每个 64 个线程，所以每个线程块有 64 / 32 = 2 个线程束。这个文件展示了线程束编号在每个线程块里都会重新开始。

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

- `test01<<<2, 64>>>();`：用 2 个线程块、每个 64 个线程启动核函数。一共 128 个线程、4 个线程束，分布在 2 个线程块里。
- 其他各行都和 `warp_ids.cu` 一样。

## 编译和运行

两个文件都在 `code/` 目录里。把它们分别编译成各自的程序并运行，这样你就能对比两种启动配置：

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
- `-arch=sm_89` 为计算能力 8.9 编译，也就是 L40S。为正确的架构编译的代码，可以用上它的全部特性。
- `-o warp_ids` 把程序命名为 `warp_ids`。不加这个参数的话，程序名是 `a.out`，第二次编译会覆盖第一个程序。
- `warp_ids.cu` 是源文件。
- `./warp_ids` 运行当前文件夹里的这个程序。

## 输出：`<<<1, 128>>>`

下面是 `./warp_ids` 的输出。一共 128 行，每个线程一行，共 4 个线程束。这是在 L40S 上真实运行的输出。线程的顺序没有保证，所以下面的列表是排过序的。

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

线程块编号始终是 0，因为只有一个线程块。线程束编号在线程 32、64 和 96 处各加一，因为它们每一个都是 32 的一个新倍数。每个 `...` 代表省略掉的行。

## 输出：`<<<2, 64>>>`

下面是 `./warp_ids_2blocks` 的输出。一共 128 行，2 个线程块，每个线程块 2 个线程束。线程束编号在每个线程块里都重新开始。

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

线程编号最大只到 63，因为每个线程块有 64 个线程。线程块 1 里又出现了 warp_id 0，因为 `threadIdx.x` 在每个线程块里都从 0 开始，而线程束编号是由它算出来的。整块 GPU 没有一个全局的线程束编号。`<- resets to zero` 这个标记是手动加上的，程序并不会打印它。
## 图示

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## 术语表

- 线程束（warp）：GPU 作为一个整体运行的 32 个线程。GPU 调度的是线程束，而不是单个线程。
- 线程束大小（warp size）：在 NVIDIA GPU 上始终是 32，软件无法修改。
- 线程束编号（warp ID）：线程在它的线程块里属于哪个线程束，等于 `threadIdx.x / 32`。
- 通道编号（lane ID）：线程在它的线程束里的位置，从 0 到 31，等于 `threadIdx.x % 32`。用它得不到线程束编号。
- 每个线程块的线程束数：`(threads per block) / 32`。每个线程块 128 个线程 → 每个线程块 4 个线程束。
- 线程束编号重置：线程束编号和 `threadIdx.x` 一样，在每个线程块里都从 0 开始。整块 GPU 没有全局的线程束编号。
