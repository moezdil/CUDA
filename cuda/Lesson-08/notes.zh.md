# 第 08 课：向量加法

第 00 课到第 07 课启动的核函数都只是打印自己的编号。这节课要写第一个真正处理数据的 CUDA（Compute Unified Device Architecture，统一计算设备架构）程序：在 GPU（Graphics Processing Unit，图形处理器）上把两个各有 1024 个数字的向量相加。在这个过程中，你会认识几乎每个 CUDA 程序都要经历的六个步骤，从分配内存一直到释放内存。

> [!NOTE]
> 这段代码面向的是前几课用过的 CUDA 13、Ubuntu 24 和 NVIDIA L40S（`sm_89`）。它的输出还没有在那台机器上截取过。下面给出的输出是根据输入推算出来的预期结果。程序会自己检查结果，所以你可以在任何一块 NVIDIA GPU 上运行它，看看是否成功。

## 任务

取两个向量 `a` 和 `b`。每个向量有 1024 个整数，下标从 0 到 1023。目标是得到第三个向量 `c`，其中每个元素都是两个向量在同一下标上的元素之和：

```
c[0]    = a[0]    + b[0]
c[1]    = a[1]    + b[1]
...
c[1023] = a[1023] + b[1023]
```

这叫作逐元素（element-wise）运算。每个和只需要它自己的两个输入，没有哪个和需要等另一个和算完。所以向量加法非常适合作为 GPU 的第一个任务。

## 在 CPU 上：一次一个元素

在 CPU（Central Processing Unit，中央处理器）上用普通的 C 语言，你会写一个循环：

```c
for (int i = 0; i < 1024; i++) {
    c[i] = a[i] + b[i];
}
```

这个循环要一轮接一轮地跑 1024 轮。第 499 轮没做完，第 500 轮就不能开始，尽管这两轮彼此毫无关系。这些工作本来可以并行执行，但普通的循环永远不会这样跑。

## 在 GPU 上：每个元素一个线程

在 GPU 上，你要去掉这个循环。取而代之的是，有多少个元素就启动多少个线程，每个线程负责一个下标。

先从最简单的启动方式开始：1 个有 1024 个线程的线程块，`<<<1, 1024>>>`。线程块编号始终是 0，所以在这里它不提供任何信息。线程编号从 0 到 1023，正好就是向量的下标。所以线程 0 负责元素 0，线程 1 负责元素 1，线程 1023 负责最后一个元素。

<cuda-launch blocks="1" threads="1024" fn="vectorAdd"></cuda-launch>

每个线程都运行同样的一行代码 `c[i] = a[i] + b[i]`，只有 `i` 不同。GPU 把这 1024 个线程分配到它的核心上，以线程束为单位每次 32 个（见[第 07 课](../Lesson-07/notes.md)），并行地运行它们。这个思路，也就是一条指令交给许多线程、各自处理不同的数据，正是 CUDA 的核心。它叫作 SIMT（Single Instruction, Multiple Threads，单指令多线程），和[第 01 课](../Lesson-01/notes.md)里讲的一样。

用 16 个元素比较一下这两种方式。CPU 循环需要 16 步，每个元素一步。GPU 线程一步就填满了全部 16 个元素：

<vector-add n="16"></vector-add>

> [!NOTE]
> “一步”只是一个概念，并不是精确的耗时。一个线程块在一个 SM（Streaming Multiprocessor，流式多处理器）上运行。这个 SM 同时容纳了这个线程块的全部 32 个线程束，并快速地轮流运行它们，所以没有哪个线程需要等循环走到它的下标。数据复制到 GPU 和从 GPU 复制回来也要花时间，下面的六个步骤会说明这一点。

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

- `__global__`：把 `vectorAdd` 标记为核函数。由 CPU 启动，由 GPU 运行。
- `const int *a, const int *b`：两个输入向量。`const` 表示核函数只读取它们。
- `int *c`：输出向量。核函数把和写到这里。
- `int n`：元素个数，这里是 1024。
- `int i = threadIdx.x;`：每个线程读取自己的编号，这就是它负责的元素下标。
- `if (i < n)`：边界检查。线程正好是 1024 个时，这个条件永远成立。当向量大小和线程数对不上时，它才开始起作用，这是下一课的主题。从一开始就写上它是个好习惯。
- `c[i] = a[i] + b[i];`：真正的工作。每个线程做一次加法。

你也可以写成一行 `c[threadIdx.x] = a[threadIdx.x] + b[threadIdx.x];`。单独用一个 `i` 更容易读，以后下标还要用到线程块编号时，也更容易扩展。

## 主机端内存和设备端内存

CPU 和 GPU 各有自己的内存。在 CUDA 里，CPU 这一侧叫作主机端（host），GPU 这一侧叫作设备端（device）。核函数只能读取设备端内存，CPU 只能读取主机端内存。所以数据必须有意识地在两者之间复制。

代码通过名字把两侧区分开：`h_a` 在主机端，`d_a` 在设备端。`h_` 和 `d_` 这种前缀是常见的约定，它能避免你不小心把 CPU 指针传给核函数。

> [!TIP]
> CUDA 还有统一内存（`cudaMallocManaged`），同一个指针在两侧都能用，驱动程序会替你搬运数据。它很方便，但会把实际发生的事情藏起来。这节课每次复制都手动完成，好让你看清每一步。

## 六个步骤

几乎每个 CUDA 程序都遵循同样的六个步骤：

1. 在主机端和设备端分配内存。
2. 在主机端填好输入数据。
3. 把输入数据从主机端复制到设备端。
4. 启动核函数。
5. 把结果从设备端复制回主机端。
6. 释放两侧的内存。

第 2 步和第 6 步在普通的 C 程序里也有。第 1、3、4、5 步才是 CUDA 发挥作用的地方。一步一步点下去，就能看到每个数组在主机端或设备端出现、被复制，然后再次消失：

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
- `#define N 1024`：向量大小，在文件开头定义一次。想换一个大小，只需要改这一行。
- `CHECK(...)`：几乎每个 CUDA 函数都会返回一个错误码。调用失败并不会自己让程序停下来，程序会带着错误的数据继续运行（[第 02 课](../Lesson-02/notes.md)展示过一次悄无声息就失败了的启动）。`CHECK` 会查看这个错误码，如果它不是 `cudaSuccess`，就打印出原因以及文件和行号，然后停止程序。
- `size_t bytes = N * sizeof(int);`：内存函数按字节计数，而不是按元素个数。1024 个每个 4 字节的数字就是 4096 字节。

### 第 1 步：分配内存

- `malloc(bytes)`：在主机端申请内存，和普通 C 程序一样。
- `cudaMalloc(&d_a, bytes)`：在设备端申请内存。它接收的是指针的地址 `&d_a`，因为它要把新的 GPU 地址写进这个指针。

### 第 2 步：填好输入数据

- `h_a[i] = i;`：`a` 得到 0, 1, 2, ... 1023。
- `h_b[i] = N - i;`：`b` 得到 1024, 1023, 1022, ... 1。

这样选择输入，用眼睛就很容易检查结果：每个和都是 `i + (1024 - i)`，所以 `c` 的每个元素都必须是 1024。`c` 不用填，因为核函数会写它。

### 第 3 步：复制到设备端

- `cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice)`：把 `bytes` 个字节从 `h_a` 复制到 `d_a`。顺序永远是先写目标，再写来源，和 C 里的 `memcpy` 一样。最后一个参数指明方向：从主机端到设备端。
- `c` 不用复制，因为它不包含输入数据。

### 第 4 步：启动

- `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);`：先是核函数名，然后是启动配置（1 个线程块，1024 个线程），最后是参数。传给核函数的所有指针都是 `d_` 指针。
- `CHECK(cudaGetLastError());`：启动核函数不会返回任何东西，所以你要在之后问一下它有没有被接受。错误的配置，比如每个线程块超过 1024 个线程，会在这里暴露出来。

### 第 5 步：把结果复制回来

- `cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost)`：和第 3 步是同一个函数，只是方向反了过来。对比一下：在第 3 步里，`h_` 排在第二位。在这里，`h_` 排在第一位，因为现在主机端是目标。
- 这里没有 `cudaDeviceSynchronize()`，这和[第 06 课](../Lesson-06/notes.md)不同。这个 `cudaMemcpy` 会自己等到核函数执行完毕，因为它没法复制一个还不存在的结果。

### 检查结果

- 第一个循环把每个元素和 CPU 算出的和做比较，并统计错误个数。打印 1024 行再用眼睛逐行看，这种做法撑不了多久。让程序自己检查才行得通。
- 其他几行打印前四个和以及最后一个和，这足以看出规律。

### 第 6 步：释放内存

- `cudaFree(d_a)`：归还设备端内存。程序运行期间，GPU 内存不会自动替你释放，所以一个忘了这一步、又长时间运行的程序会不断吃掉 GPU 内存。
- `free(h_a)`：归还主机端内存，和普通 C 程序一样。这些名字是有意对应的：`cudaFree` 对应 `cudaMalloc`，`free` 对应 `malloc`。

## 代码逐步讲解

按照你写代码的顺序，一步一步看这个程序。先写辅助代码和核函数，然后用六个步骤填好 `main`。分配内存之后马上写好释放内存的代码，这样你就不会忘记。

<div class="code-walk" markdown>

1. `1-4 cpu` **头文件。** 常用的三行，再加上 `stdlib.h`，它声明了 `malloc`、`free` 和 `exit`。没有它，主机端内存相关的调用就无法通过编译。
2. `6 cpu` **大小。** `#define N 1024` 把向量大小放在一个地方。后面每一行都用 `N`，所以换一个大小只需要改这一处。
3. `8-17 cpu` **错误检查。** 在任何 CUDA 调用之前先写好 `CHECK` 宏，这样每个调用从一开始就能用它。它执行这个调用，把结果和 `cudaSuccess` 比较，如果不同，就打印错误信息、文件和行号，然后停止程序。每行末尾的 `\` 让宏在下一行继续，所以漏掉一个就会让整个宏出错。
4. `19-20,25 gpu` **核函数签名。** `__global__ void vectorAdd(...)` 用 `const int *` 接收两个输入，用 `int *` 接收输出，还有长度 `n`。之后传进来的指针必须是设备端指针，因为核函数在 GPU 上运行。
5. `21-24 gpu` **核函数的函数体。** 每个线程从 `threadIdx.x` 得到自己的下标，拿它和 `n` 做比较，然后把一对元素相加。规则是：一个线程，一个元素，没有循环。边界检查只要一行，等线程数和 `n` 对不上时，它就能保护你。
6. `27-28,78-79 cpu` **main 函数。** 写好 `main`，最后是 `return 0;`。六个步骤写在它们中间。
7. `29 cpu` **字节，而不是元素个数。** 每个内存函数都按字节计数，所以先算一次 `N * sizeof(int)`。一个常见的错误是传入 `N`，这样只会分配和复制四分之一的数据。
8. `31-38 cpu` **第 1 步：分配内存。** 三个 `malloc` 调用分配主机端数组，三个 `cudaMalloc` 调用分配设备端数组。`cudaMalloc` 接收的是 `&d_a`，也就是指针的地址，因为它要把新的设备端地址写进这个指针。
9. `71-77 cpu` **第 6 步：释放内存。** 现在就在 `main` 的末尾写好释放内存的代码，趁你还能看到分配的部分：每个 `d_` 指针用 `cudaFree`，每个 `h_` 指针用 `free`。把它们搞混，比如写成 `free(d_a)`，就是一个错误。
10. `40-44 cpu` **第 2 步：填好输入数据。** 一个循环设置 `h_a[i] = i` 和 `h_b[i] = N - i`，所以每个正确的和都是 1024。要选那些你事先就知道结果的输入。`h_c` 保持为空，因为核函数会写它。
11. `46-48 cpu` **第 3 步：复制到设备端。** `cudaMemcpy` 先接收目标，然后是来源、大小和方向。这里就是用 `cudaMemcpyHostToDevice` 把 `h_a` 复制到 `d_a`。
12. `50-52 cpu` **第 4 步：启动。** `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N)` 为每个元素启动一个线程，并且只传入 `d_` 指针。启动不会返回错误码，所以下一行的 `CHECK(cudaGetLastError())` 会问一下它有没有被接受。
13. `54-55 cpu` **第 5 步：把结果复制回来。** 同样是 `cudaMemcpy`，目标是 `h_c`，方向是 `cudaMemcpyDeviceToHost`。这次复制会等核函数执行完毕，所以不需要 `cudaDeviceSynchronize()`。
14. `57-63 cpu` **检查每个元素。** 在 CPU 上把每个 `h_c[i]` 和 `h_a[i] + h_b[i]` 做比较，并统计不一致的个数。程序自己检查能发现全部 1024 个元素里的错误，而不只是你打印出来的那几个。
15. `64-69 cpu` **打印一部分结果。** 打印前四个和、一行 `...`、最后一个和，以及错误个数。要看的是错误个数这一行：0 表示每个元素都是对的。

</div>

## 编译和运行

```bash
nvcc -arch=sm_89 -o vector_add vector_add.cu
./vector_add
```

- `nvcc` 是 CUDA 编译器。
- `-arch=sm_89` 为 L40S 编译。换成其他 GPU 时，就用它自己的计算能力，比如 CC（compute capability，计算能力）8.0 就用 `-arch=sm_80`（见[第 03 课](../Lesson-03/notes.md)和[第 06 课](../Lesson-06/notes.md)）。
- `-o vector_add` 给程序命名。
- `./vector_add` 从当前文件夹运行它。

## 输出

这是预期的输出。它是根据第 2 步设定的输入推算出来的，还没有在 L40S 上截取过。

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

- 每一行都是 `a[i] + b[i] = c[i]`。前四行是下标 0 到 3，`...` 这一行是程序自己打印的，最后一个和对应下标 1023。
- 每个和都是 1024，正如第 2 步设计的那样。以下标 3 为例：`a[3] = 3`，`b[3] = 1024 - 3 = 1021`，而 3 + 1021 = 1024。
- `errors: 0` 告诉你全部 1024 个元素都是对的，而不只是屏幕上的那五个。
- 如果你看到的是 `CUDA error:`，这条消息会指出失败的调用、文件和行号。

## 动手试试

> [!WARNING]
> 把 `N` 设为 2048 再运行一次。一个线程块不能超过 1024 个线程，所以这次启动会被拒绝，`CHECK(cudaGetLastError())` 应该会以 `CUDA error: invalid configuration argument` 停止程序。如果没有这个检查，核函数根本不会运行，但程序会继续执行：它会把核函数从没写过的设备端内存复制回来，应该会报告大量错误。解决办法是使用多个线程块，这就是下一课的内容。

## 自己动手写

用一个计算 `c[i] = 2 * a[i] + b[i]` 的新核函数，自己把六个步骤都走一遍。

1. 用下面的框架创建 `scale_add.cu`。头文件、`N`、`CHECK` 和最后的打印部分都已经给出。
2. 写出核函数的函数体。
3. 在 `main` 里填好六个步骤，其中 `h_a[i] = i`，`h_b[i] = 1`。

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
    核函数的函数体就是第 08 课的核函数，只改了一行：`c[i] = 2 * a[i] + b[i];`。`main` 里的每个步骤都是每个数组一行，从上面的程序复制过来，再改一下名字。记住：`cudaMemcpy(destination, source, bytes, direction)`。

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

    用 `nvcc -arch=sm_89 -o scale_add scale_add.cu` 和 `./scale_add` 编译并运行。如果每一步都对，你应该会看到 `c[0] = 1, c[1] = 3, c[255] = 511` 和 `errors: 0`，因为 2 * 255 + 1 = 511。

## 术语表

- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 让通用程序在 GPU 上运行的平台。
- 向量加法（vector addition）：把两个向量逐元素相加，`c[i] = a[i] + b[i]`。
- SIMT（Single Instruction, Multiple Threads，单指令多线程）：许多线程运行同一条指令，各自处理自己的数据。
- 逐元素（element-wise）：每个输出元素只依赖同一下标上的输入元素。这类工作很适合并行运行。
- 主机端（host）：CPU（Central Processing Unit，中央处理器）和它的内存。
- 设备端（device）：GPU（Graphics Processing Unit，图形处理器）和它的内存。
- `h_` / `d_`：一种命名习惯。`h_a` 指向主机端内存，`d_a` 指向设备端内存。
- `cudaMalloc`：在设备端申请内存。
- `cudaMemcpy`：在主机端和设备端之间复制字节。先写目标，再写来源，然后是大小，最后是方向。
- `cudaMemcpyHostToDevice` / `cudaMemcpyDeviceToHost`：复制的方向。
- `cudaFree`：归还设备端内存。
- `cudaGetLastError`：告诉你上一次核函数启动有没有被接受。
- 边界检查（bounds check）：`if (i < n)`，这样线程就不会读写到向量末尾之外。
- 统一内存（unified memory）：用 `cudaMallocManaged` 分配的内存，两侧都能用同一个指针访问。
