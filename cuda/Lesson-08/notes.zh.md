# 08 > 向量加法

第 00 课到第 07 课里的核函数只会打印自己的编号。本课要写出第一个真正处理数据的 CUDA（Compute Unified Device Architecture，统一计算设备架构）程序：在 GPU（Graphics Processing Unit，图形处理器）上把两个各含 1024 个数的向量相加。你还会顺带认识几乎所有 CUDA 程序都要走的六个步骤，从分配内存一直到释放内存。

> [!NOTE]
> 代码的目标环境和前几课一样：CUDA 13、Ubuntu 24 和 NVIDIA L40S（`sm_89`）。程序会自己检查结果，所以你可以在任何一块 NVIDIA GPU 上运行它，看看结果对不对。

## 任务

取两个向量 `a` 和 `b`，每个向量有 1024 个整数，下标从 0 到 1023。目标是得到第三个向量 `c`，它的每个元素都等于两个向量在同一下标上的元素之和：

```
c[0]    = a[0]    + b[0]
c[1]    = a[1]    + b[1]
...
c[1023] = a[1023] + b[1023]
```

这叫作逐元素（element-wise）运算。每个和只需要自己的两个输入，不必等待其他任何一个和。所以向量加法非常适合用作 GPU 的第一个任务。

## 在 CPU 上：一次一个元素

在 CPU（Central Processing Unit，中央处理器）上用普通的 C 语言，你会写一个循环：

```c
for (int i = 0; i < 1024; i++) {
    c[i] = a[i] + b[i];
}
```

这个循环要依次跑 1024 轮。第 499 轮没跑完，第 500 轮就不能开始，尽管这两轮之间毫无关系。这些工作本可以并行执行，但普通循环从来不会这样跑。

## 在 GPU 上：每个元素一个线程

在 GPU 上，你要去掉这个循环，改为有多少个元素就启动多少个线程，每个线程负责一个下标。

先从最简单的启动方式开始：1 个线程块，包含 1024 个线程，即 `<<<1, 1024>>>`。线程块编号始终是 0，所以这里它不提供任何信息。线程编号从 0 到 1023，正好就是向量的下标。于是线程 0 负责元素 0，线程 1 负责元素 1，线程 1023 负责最后一个元素。

<cuda-launch blocks="1" threads="1024" fn="vectorAdd"></cuda-launch>

每个线程都运行同一行代码 `c[i] = a[i] + b[i]`，只有 `i` 不同。GPU 把这 1024 个线程分配到各个核心上，以线程束为单位、每次 32 个（见[第 07 课](../Lesson-07/notes.md)），并行地运行它们。让许多线程执行同一条指令、各自处理不同的数据，这正是 CUDA 的核心思想，叫作 SIMT（Single Instruction, Multiple Threads，单指令多线程），[第 01 课](../Lesson-01/notes.md)里也讲过。

用 16 个元素对比一下这两种做法。CPU 循环要走 16 步，每个元素一步；GPU 线程只用一步就填满了全部 16 个元素：

<vector-add n="16"></vector-add>

> [!NOTE]
> “一步”只是示意，并不代表准确的耗时。一个线程块在一个 SM（Streaming Multiprocessor，流式多处理器）上运行。这个 SM 同时容纳该线程块的全部 32 个线程束，并快速轮流运行它们，所以没有哪个线程需要等循环走到自己的下标。数据复制到 GPU、再从 GPU 复制回来也要花时间，下面的六个步骤会讲到这一点。

## 核函数

```c
__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}
```

- `__global__`：把 `vectorAdd` 标记为核函数。它由 CPU 启动，在 GPU 上运行。
- `const int *a, const int *b`：两个输入向量。`const` 表示核函数只读取它们。
- `int *c`：输出向量。核函数把和写到这里。
- `int n`：元素个数，这里是 1024。
- `int i = threadIdx.x;`：每个线程读取自己的编号，这个编号就是它负责的元素下标。
- `if (i < n)`：边界检查。线程正好有 1024 个时，这个条件总是成立。等到向量大小和线程数对不上时，它才开始起作用，这是下一课的主题。从一开始就写上它，是个好习惯。
- `c[i] = a[i] + b[i];`：真正的工作。每个线程做一次加法。

你也可以只写一行：`c[threadIdx.x] = a[threadIdx.x] + b[threadIdx.x];`。单独用一个 `i` 更好读，以后下标还要用到线程块编号时，也更容易扩展。

## 主机端内存和设备端内存

CPU 和 GPU 各有自己的内存。在 CUDA 里，CPU 这一侧叫作主机端（host），GPU 这一侧叫作设备端（device）。核函数只能读取设备端内存，CPU 只能读取主机端内存，所以数据必须由你主动在两侧之间复制。

代码用名字区分两侧：`h_a` 位于主机端，`d_a` 位于设备端。`h_` 和 `d_` 前缀是一种常见约定，可以防止你不小心把 CPU 指针传给核函数。

> [!TIP]
> CUDA 还提供统一内存（`cudaMallocManaged`）：同一个指针在两侧都能用，驱动程序会替你搬运数据。它用起来方便，却把实际发生的事情藏了起来。本课的每次复制都手动完成，好让你看清每一步。

## 六个步骤

几乎每个 CUDA 程序都遵循同样的六个步骤：

1. 在主机端和设备端分配内存。
2. 在主机端填好输入数据。
3. 把输入数据从主机端复制到设备端。
4. 启动核函数。
5. 把结果从设备端复制回主机端。
6. 释放两侧的内存。

第 2 步和第 6 步在普通 C 程序里也有，第 1、3、4、5 步才是 CUDA 登场的地方。逐步点击下面的图示，可以看到每个数组如何在主机端或设备端出现、被复制，然后再次消失：

<host-device-flow></host-device-flow>

## 代码

完整的程序在 `code/vector_add.cu` 里：

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include <stdlib.h>

#define N 1024

// stop the program with a readable message if a CUDA call fails
#define CHECK(call)                                                  \
    do {                                                             \
        cudaError_t err = (call);                                    \
        if (err != cudaSuccess) {                                    \
            printf("CUDA error: %s (%s:%d)\n",                       \
                   cudaGetErrorString(err), __FILE__, __LINE__);     \
            exit(1);                                                 \
        }                                                            \
    } while (0)

__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}

int main()
{
    size_t bytes = N * sizeof(int);

    // 1. allocate memory on the host (CPU) and on the device (GPU)
    int *h_a = (int *)malloc(bytes);
    int *h_b = (int *)malloc(bytes);
    int *h_c = (int *)malloc(bytes);
    int *d_a, *d_b, *d_c;
    CHECK(cudaMalloc(&d_a, bytes));
    CHECK(cudaMalloc(&d_b, bytes));
    CHECK(cudaMalloc(&d_c, bytes));

    // 2. fill the inputs on the host
    for (int i = 0; i < N; i++) {
        h_a[i] = i;
        h_b[i] = N - i;
    }

    // 3. copy the inputs to the device
    CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

    // 4. launch the kernel: 1 block, N threads, one thread per element
    vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);
    CHECK(cudaGetLastError());

    // 5. copy the result back to the host
    CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));

    // check every element, then print a few
    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != h_a[i] + h_b[i]) {
            errors++;
        }
    }
    for (int i = 0; i < 4; i++) {
        printf("%d + %d = %d\n", h_a[i], h_b[i], h_c[i]);
    }
    printf("...\n");
    printf("%d + %d = %d\n", h_a[N - 1], h_b[N - 1], h_c[N - 1]);
    printf("errors: %d\n", errors);

    // 6. free memory on both sides
    CHECK(cudaFree(d_a));
    CHECK(cudaFree(d_b));
    CHECK(cudaFree(d_c));
    free(h_a);
    free(h_b);
    free(h_c);
    return 0;
}
```

### 准备部分

- `#include <stdlib.h>`：`malloc`、`free` 和 `exit` 需要它。
- `#define N 1024`：向量大小，在文件开头定义一次。想试别的大小，只改这一行就行。
- `CHECK(...)`：几乎每个 CUDA 函数都会返回一个错误码。调用失败并不会让程序自己停下来，程序只会带着错误的数据继续运行（[第 02 课](../Lesson-02/notes.md)就演示过一次悄无声息的启动失败）。`CHECK` 会检查这个错误码，如果它不是 `cudaSuccess`，就打印原因以及文件名和行号，然后停止程序。
- `size_t bytes = N * sizeof(int);`：内存函数按字节计数，而不是按元素个数。1024 个数，每个 4 字节，一共 4096 字节。

### 第 1 步：分配内存

- `malloc(bytes)`：在主机端申请内存，和普通 C 程序一样。
- `cudaMalloc(&d_a, bytes)`：在设备端申请内存。它接收的是指针的地址 `&d_a`，因为它要把新的 GPU 地址写进这个指针。

### 第 2 步：填好输入数据

- `h_a[i] = i;`：`a` 得到 0, 1, 2, ... 1023。
- `h_b[i] = N - i;`：`b` 得到 1024, 1023, 1022, ... 1。

这样选输入，用眼睛就能轻松检查结果：每个和都是 `i + (1024 - i)`，所以 `c` 的每个元素都必须是 1024。`c` 不需要填，因为核函数会写入它。

### 第 3 步：复制到设备端

- `cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice)`：把 `bytes` 个字节从 `h_a` 复制到 `d_a`。参数顺序永远是先目标、后来源，和 C 里的 `memcpy` 一样。最后一个参数指明方向：从主机端到设备端。
- `c` 不用复制，因为它不含输入数据。

### 第 4 步：启动

- `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);`：先写核函数名，再写启动配置（1 个线程块，1024 个线程），最后是参数。传给核函数的指针全是 `d_` 指针。
- `CHECK(cudaGetLastError());`：核函数启动没有返回值，所以要在启动之后问一句它是否被接受。配置有误时，比如每个线程块超过 1024 个线程，错误就会在这里暴露出来。

### 第 5 步：把结果复制回来

- `cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost)`：和第 3 步是同一个函数，只是方向反了过来。对比一下：第 3 步里 `h_` 排在第二位，这里 `h_` 排在第一位，因为现在主机端是目标。
- 这里没有 `cudaDeviceSynchronize()`，这一点和[第 06 课](../Lesson-06/notes.md)不同。这个 `cudaMemcpy` 会自己等到核函数执行完毕，因为它没法复制一个还不存在的结果。

### 检查结果

- 第一个循环把每个元素和 CPU 算出的和逐一比较，并统计错误个数。打印 1024 行再用眼睛逐行检查，数据一多就行不通了；让程序自己检查才靠得住。
- 其余几行打印前四个和以及最后一个和，足以看出规律。

### 第 6 步：释放内存

- `cudaFree(d_a)`：归还设备端内存。程序运行期间，显存不会自动替你释放，所以一个长时间运行、又忘了这一步的程序会不断吃掉显存。
- `free(h_a)`：归还主机端内存，和普通 C 程序一样。这些名字是有意成对的：`cudaFree` 对应 `cudaMalloc`，`free` 对应 `malloc`。

## 代码逐步讲解

按照你写代码的顺序，逐步过一遍这个程序。先写辅助代码和核函数，再用六个步骤填满 `main`。分配内存之后马上写好释放内存的代码，这样就不会忘。

<div class="code-walk" markdown>

1. `1-4 cpu` **头文件。** 常用的三行，再加上声明了 `malloc`、`free` 和 `exit` 的 `stdlib.h`。没有它，主机端内存相关的调用就无法通过编译。
2. `6 cpu` **大小。** `#define N 1024` 把向量大小集中在一处。后面每一行都用 `N`，所以换一个大小只需要改这一处。
3. `8-17 cpu` **错误检查。** 在写任何 CUDA 调用之前先写好 `CHECK` 宏，这样每个调用从一开始就能用上它。它执行这个调用，把结果和 `cudaSuccess` 比较，如果不一致，就打印错误信息、文件名和行号，然后停止程序。每行末尾的 `\` 让宏延续到下一行，漏掉一个，整个宏就会出错。
4. `19-20,25 gpu` **核函数签名。** `__global__ void vectorAdd(...)` 用 `const int *` 接收两个输入，用 `int *` 接收输出，另外还有长度 `n`。之后传入的指针必须是设备端指针，因为核函数在 GPU 上运行。
5. `21-24 gpu` **核函数的函数体。** 每个线程从 `threadIdx.x` 取得自己的下标，与 `n` 比较，然后把一对元素相加。规则是：一个线程，一个元素，没有循环。边界检查只占一行，一旦线程数和 `n` 不再相等，它就能保护你。
6. `27-28,78-79 cpu` **main 函数。** 写出 `main`，末尾是 `return 0;`。六个步骤都写在两者之间。
7. `29 cpu` **按字节，而不是按元素个数。** 所有内存函数都按字节计数，所以先算一次 `N * sizeof(int)`。常见的错误是直接传入 `N`，结果只分配和复制了四分之一的数据。
8. `31-38 cpu` **第 1 步：分配内存。** 三个 `malloc` 调用分配主机端数组，三个 `cudaMalloc` 调用分配设备端数组。`cudaMalloc` 接收 `&d_a`，也就是指针的地址，因为它要把新的设备端地址写进这个指针。
9. `71-77 cpu` **第 6 步：释放内存。** 趁分配内存的代码还在眼前，现在就在 `main` 末尾写好释放的代码：每个 `d_` 指针用 `cudaFree`，每个 `h_` 指针用 `free`。两者混用，比如写成 `free(d_a)`，就是 bug。
10. `40-44 cpu` **第 2 步：填好输入数据。** 用一个循环设置 `h_a[i] = i` 和 `h_b[i] = N - i`，这样每个正确的和都是 1024。要选择事先就知道结果的输入。`h_c` 保持为空，因为核函数会写入它。
11. `46-48 cpu` **第 3 步：复制到设备端。** `cudaMemcpy` 的参数依次是目标、来源、大小和方向。这里就是用 `cudaMemcpyHostToDevice` 把 `h_a` 复制到 `d_a`。
12. `50-52 cpu` **第 4 步：启动。** `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N)` 为每个元素启动一个线程，并且只传入 `d_` 指针。启动本身不返回错误码，所以下一行用 `CHECK(cudaGetLastError())` 询问它是否被接受。
13. `54-55 cpu` **第 5 步：把结果复制回来。** 同样调用 `cudaMemcpy`，目标是 `h_c`，方向是 `cudaMemcpyDeviceToHost`。这次复制会等核函数执行完毕，所以不需要 `cudaDeviceSynchronize()`。
14. `57-63 cpu` **检查每个元素。** 在 CPU 上把每个 `h_c[i]` 与 `h_a[i] + h_b[i]` 比较，并统计不一致的个数。让程序自己检查，能发现全部 1024 个元素里的错误，而不只是你打印出来的那几个。
15. `64-69 cpu` **打印部分结果。** 打印前四个和、一行 `...`、最后一个和以及错误个数。真正要看的是错误个数这一行：0 表示每个元素都正确。

</div>

## 编译和运行

```bash
nvcc -arch=sm_89 -o vector_add vector_add.cu
./vector_add
```

- `nvcc` 是 CUDA 编译器。
- `-arch=sm_89` 表示为 L40S 编译。换成别的 GPU 时，要用它自己的计算能力，例如 CC（compute capability，计算能力）8.0 就用 `-arch=sm_80`（见[第 03 课](../Lesson-03/notes.md)和[第 06 课](../Lesson-06/notes.md)）。
- `-o vector_add` 指定程序名。
- `./vector_add` 在当前目录下运行它。

## 输出

这就是程序的输出。每个和都由第 2 步设定的输入决定。

```
0 + 1024 = 1024
1 + 1023 = 1024
2 + 1022 = 1024
3 + 1021 = 1024
...
1023 + 1 = 1024
errors: 0
```

怎么看这段输出：

- 每一行都是 `a[i] + b[i] = c[i]`。前四行对应下标 0 到 3，`...` 这一行是程序自己打印的，最后一行和对应下标 1023。
- 每个和都是 1024，与第 2 步的设计一致。以下标 3 为例：`a[3] = 3`，`b[3] = 1024 - 3 = 1021`，而 3 + 1021 = 1024。
- `errors: 0` 说明全部 1024 个元素都正确，而不只是屏幕上的那五个。
- 如果看到的是 `CUDA error:`，消息里会写出失败的调用、文件名和行号。

## 动手试试

> [!WARNING]
> 把 `N` 改成 2048 再运行一次。一个线程块最多只能有 1024 个线程，所以这次启动会被拒绝，`CHECK(cudaGetLastError())` 应该会让程序停下，并打印 `CUDA error: invalid configuration argument`。如果没有这个检查，核函数根本不会运行，程序却会继续往下走：它把核函数从未写过的设备端内存复制回来，应该会报告大量错误。解决办法是使用多个线程块，这正是下一课的内容。

## 自己动手写

用一个计算 `c[i] = 2 * a[i] + b[i]` 的新核函数，自己把六个步骤完整走一遍。

1. 用下面的框架创建 `scale_add.cu`。头文件、`N`、`CHECK` 和最后的打印部分都已经写好。
2. 写出核函数的函数体。
3. 在 `main` 里填好六个步骤，令 `h_a[i] = i`、`h_b[i] = 1`。

```c
#include "cuda_runtime.h"
#include <stdio.h>
#include <stdlib.h>

#define N 256

#define CHECK(call)                                                  \
    do {                                                             \
        cudaError_t err = (call);                                    \
        if (err != cudaSuccess) {                                    \
            printf("CUDA error: %s (%s:%d)\n",                       \
                   cudaGetErrorString(err), __FILE__, __LINE__);     \
            exit(1);                                                 \
        }                                                            \
    } while (0)

__global__ void scaleAdd(const int *a, const int *b, int *c, int n)
{
    // TODO: one thread per element: c[i] = 2 * a[i] + b[i], with a bounds check
}

int main()
{
    size_t bytes = N * sizeof(int);
    int *h_a, *h_b, *h_c, *d_a, *d_b, *d_c;

    // TODO 1: allocate h_a, h_b, h_c with malloc and d_a, d_b, d_c with cudaMalloc
    // TODO 2: fill h_a[i] = i and h_b[i] = 1
    // TODO 3: copy h_a and h_b to the device
    // TODO 4: launch scaleAdd with 1 block of N threads, then check the launch
    // TODO 5: copy d_c back to h_c

    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != 2 * h_a[i] + h_b[i]) {
            errors++;
        }
    }
    printf("c[0] = %d, c[1] = %d, c[%d] = %d\n", h_c[0], h_c[1], N - 1, h_c[N - 1]);
    printf("errors: %d\n", errors);

    // TODO 6: free the device and host memory
    return 0;
}
```

??? tip "提示"
    核函数的函数体就是第 08 课的核函数，只改一行：`c[i] = 2 * a[i] + b[i];`。`main` 里的每个步骤都是每个数组写一行，照抄上面的程序，再改一下名字即可。记住：`cudaMemcpy(destination, source, bytes, direction)`。

??? note "答案"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>
    #include <stdlib.h>

    #define N 256

    #define CHECK(call)                                                  \
        do {                                                             \
            cudaError_t err = (call);                                    \
            if (err != cudaSuccess) {                                    \
                printf("CUDA error: %s (%s:%d)\n",                       \
                       cudaGetErrorString(err), __FILE__, __LINE__);     \
                exit(1);                                                 \
            }                                                            \
        } while (0)

    __global__ void scaleAdd(const int *a, const int *b, int *c, int n)
    {
        int i = threadIdx.x;
        if (i < n) {
            c[i] = 2 * a[i] + b[i];
        }
    }

    int main()
    {
        size_t bytes = N * sizeof(int);
        int *h_a, *h_b, *h_c, *d_a, *d_b, *d_c;

        // 1. allocate
        h_a = (int *)malloc(bytes);
        h_b = (int *)malloc(bytes);
        h_c = (int *)malloc(bytes);
        CHECK(cudaMalloc(&d_a, bytes));
        CHECK(cudaMalloc(&d_b, bytes));
        CHECK(cudaMalloc(&d_c, bytes));

        // 2. fill the inputs
        for (int i = 0; i < N; i++) {
            h_a[i] = i;
            h_b[i] = 1;
        }

        // 3. copy to the device
        CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
        CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

        // 4. launch and check
        scaleAdd<<<1, N>>>(d_a, d_b, d_c, N);
        CHECK(cudaGetLastError());

        // 5. copy the result back
        CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));

        int errors = 0;
        for (int i = 0; i < N; i++) {
            if (h_c[i] != 2 * h_a[i] + h_b[i]) {
                errors++;
            }
        }
        printf("c[0] = %d, c[1] = %d, c[%d] = %d\n", h_c[0], h_c[1], N - 1, h_c[N - 1]);
        printf("errors: %d\n", errors);

        // 6. free
        CHECK(cudaFree(d_a));
        CHECK(cudaFree(d_b));
        CHECK(cudaFree(d_c));
        free(h_a);
        free(h_b);
        free(h_c);
        return 0;
    }
    ```

    用 `nvcc -arch=sm_89 -o scale_add scale_add.cu` 编译，再用 `./scale_add` 运行。如果每一步都没错，你应该会看到 `c[0] = 1, c[1] = 3, c[255] = 511` 和 `errors: 0`，因为 2 * 255 + 1 = 511。

## 术语表

- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 推出的平台，用来在 GPU 上运行通用程序。
- 向量加法（vector addition）：把两个向量逐元素相加，`c[i] = a[i] + b[i]`。
- SIMT（Single Instruction, Multiple Threads，单指令多线程）：许多线程运行同一条指令，各自处理自己的数据。
- 逐元素（element-wise）：每个输出元素只取决于同一下标上的输入元素。这类工作很适合并行。
- 主机端（host）：CPU（Central Processing Unit，中央处理器）和它的内存。
- 设备端（device）：GPU（Graphics Processing Unit，图形处理器）和它的内存。
- `h_` / `d_`：一种命名习惯。`h_a` 指向主机端内存，`d_a` 指向设备端内存。
- `cudaMalloc`：在设备端申请内存。
- `cudaMemcpy`：在主机端和设备端之间复制字节。先写目标，再写来源，然后是大小，最后是方向。
- `cudaMemcpyHostToDevice` / `cudaMemcpyDeviceToHost`：复制的方向。
- `cudaFree`：归还设备端内存。
- `cudaGetLastError`：告诉你最近一次核函数启动是否被接受。
- 边界检查（bounds check）：`if (i < n)`，确保线程不会读写超出向量末尾的位置。
- 统一内存（unified memory）：用 `cudaMallocManaged` 分配的内存，两侧都能用同一个指针访问。
- GPU（Graphics Processing Unit，图形处理器）：运行核函数的处理器，拥有成千上万个小核心。
- CPU（Central Processing Unit，中央处理器）：运行 `main()` 并启动核函数的主处理器。
- 下标（index）：元素在数组里的位置，从 0 开始数。`c[3]` 是 `c` 的第四个元素。
- 并行（parallel）：在许多核心上同时进行，而不是一个接一个依次进行。
- `__global__`：把一个函数标记为核函数，由 CPU 启动，在 GPU 上运行。
- `const`：表示只读数据的 C 关键字。有了 `const int *a`，核函数可以读 `a[i]`，但不能写它。
- `threadIdx.x`：线程在所属线程块内的编号。一个线程块有 1024 个线程时，它的取值从 0 到 1023，每个元素对应一个值。
- `CHECK`：本程序里的错误检查宏。它包裹一次 CUDA 调用，如果调用没有返回 `cudaSuccess`，就打印文件名、行号和原因，然后停止程序。
- `nvcc`：CUDA 编译器。它把 `.cu` 文件里的 CPU 部分和 GPU 部分编译成一个程序。
- `-arch=sm_89`：为计算能力 8.9 编译，也就是 L40S。
