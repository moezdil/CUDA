# 09 > 多个线程块、网格大小与计时

[第 08 课](../Lesson-08/notes.md)用一个线程块把两个各含 1024 个元素的向量相加。本课把大小翻倍到 2048 个元素，单个线程块已经装不下了。你会学到几乎每个 CUDA 核函数都在用的索引公式，学会如何为任意长度的向量选择网格大小，弄清你的启动实际让多少个 SM 忙了起来，以及怎样给核函数计时才不会自欺欺人。

> [!NOTE]
> 代码面向 Ubuntu 24 上的 CUDA 13，以及这些课一直使用的 NVIDIA L40S（CC 8.9，142 个 SM）。耗时取决于 GPU，所以请在你自己的 GPU 上运行程序，亲手比较不同的配置。

## 从 1024 个元素到 2048 个元素

现在每个向量有 2048 个元素。每个元素一个线程，就需要 2048 个线程。可是一个线程块最多只能有 1024 个线程。这个上限属于计算能力的规定，[第 03 课](../Lesson-03/notes.md)讲过，所以 `<<<1, 2048>>>` 在启动时就会被拒绝（[第 02 课](../Lesson-02/notes.md)）。

解决办法是用更多的线程块。最简单的分法是 2 个线程块，每块 1024 个线程，即 `<<<2, 1024>>>`。

- 线程块 0 负责元素 0 到 1023
- 线程块 1 负责元素 1024 到 2047

第 08 课的核函数用的是 `int i = threadIdx.x;`，现在这样已经不行了。在线程块 1 里，`threadIdx.x` 又从 0 开始，所以线程块 1 会把元素 0 到 1023 再加一遍，而元素 1024 到 2047 根本没人处理。

## 全局线程 ID

每个线程需要找到自己在整个向量里对应的元素，而不只是在线程块内的位置。算出它的公式叫作全局索引。

```c
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

- `blockIdx.x` 表示这个线程位于哪个线程块。
- `blockDim.x` 表示每个线程块有多少个线程，这里是 1024。
- `threadIdx.x` 表示线程在所属线程块内的位置。

`blockIdx.x * blockDim.x` 会跳过当前线程块之前所有线程块里的线程。用 `<<<2, 1024>>>` 的真实数字验证一下。

- 线程块 0 的线程 2 得到 0 * 1024 + 2 = 2
- 线程块 1 的线程 0 得到 1 * 1024 + 0 = 1024，后半段的第一个元素
- 线程块 1 的线程 1023 得到 1 * 1024 + 1023 = 2047，最后一个元素

从 0 到 2047，每个元素都正好分到一个线程。拖动滑块，再把鼠标悬停在某个线程上，就能看到任意启动配置下的公式。

<global-id></global-id>

> [!TIP]
> 把这一行背下来。几乎每个处理数组的核函数都以 `int i = blockIdx.x * blockDim.x + threadIdx.x;` 开头。

## 选择网格大小

工作怎么切分由你决定。对 2048 个元素来说，下面几种启动都正好产生 2048 个线程。

| 启动 | 线程块数 | 每块线程数 | 线程总数 |
|---|---|---|---|
| `<<<2, 1024>>>` | 2 | 1024 | 2048 |
| `<<<8, 256>>>` | 8 | 256 | 2048 |
| `<<<64, 32>>>` | 64 | 32 | 2048 |

线程块越多，每块的线程就越少，反之亦然。两者的乘积必须覆盖每一个元素。

实际的向量长度很少是这么整的数。假设向量有 2000 个元素，而你想让每块有 256 个线程。2000 / 256 等于 7.8，而 C 语言的整数除法会直接丢掉小数部分。

- `2000 / 256` 得到 7 个线程块，也就是 7 * 256 = 1792 个线程。最后 208 个元素永远不会被相加。

所以要改为向上取整。标准做法是下面这个公式。

```c
int blocks = (N + threads - 1) / threads;
```

- `(2000 + 256 - 1) / 256` = 2255 / 256 = 8 个线程块，也就是 8 * 256 = 2048 个线程。

现在多出了 48 个线程（2048 - 2000）。它们的全局索引是 2000 到 2047，已经超出了向量末尾。这正是核函数里要保留第 08 课那个边界检查的原因。

```c
if (i < n) {
    c[i] = a[i] + b[i];
}
```

多出来的 48 个线程发现 `i < n` 不成立，于是什么也不做。

> [!WARNING]
> 没有 `if (i < n)`，这 48 个线程就会读写数组末尾之外的内存。程序可能照样打印出正确结果，因为这些错误的写入可能落在没人检查的内存里，这让 bug 很难被发现。网格要向上取整，索引一定要加保护。

> [!NOTE]
> 线程块大小最好选 32 的倍数，也就是线程束的大小（[第 07 课](../Lesson-07/notes.md)）。GPU 以线程束为单位运行线程，每个线程束 32 个线程。100 个线程的线程块会变成 4 个线程束（128 个通道），最后一个线程束的 32 个通道里只有 4 个在干活。每块 128 或 256 个线程是常见又稳妥的选择。

## 这次启动用了多少个 SM？

一个线程块总是在一个 SM 上运行，而一个 SM 可以同时容纳多个线程块。在 L40S 上，一个 SM 最多容纳 1536 个线程（48 个线程束），最多 24 个线程块。哪个 SM 分到哪个线程块，由硬件调度器决定。在空闲的 GPU 上，调度器通常会先把线程块分散开，每个 SM 一个，但这一点并没有保证。

现在以有 142 个 SM 的 L40S 为例算一算。

- `<<<2, 1024>>>` 有 2 个线程块，所以最多 2 个 SM 在工作，占 142 个的大约 1.4%。其余 140 个 SM 都闲着。
- `<<<64, 32>>>` 有 64 个线程块，所以最多 64 个 SM 在工作，大约占 45%。但每个 SM 只分到一个线程束，而它本可以运行 48 个。

真正的问题在于任务太小。L40S 同时能容纳 142 * 1536 = 218,112 个线程，2048 个线程还不到其中的 1%。工作量这么少，无论怎样布置网格都填不满一块 GPU。只有元素多到几十万、几百万个时，GPU 才真正划算。

选一个线程块大小，看看网格如何分布到 L40S 的 142 个 SM 上。

<grid-size n="2048" sms="142"></grid-size>

> [!NOTE]
> `nvidia-smi` 里的“GPU utilization”并不统计 SM，它显示的是有核函数在运行的时间所占的比例。一个只在一个 SM 上跑一个线程块的核函数，在这里也可能显示 100%。想知道核函数实际用了芯片的多少资源，需要借助 Nsight Compute 这样的性能分析工具（见[第 05 课](../Lesson-05/notes.md)）。

## 用 CUDA 事件计时

要比较 `<<<2, 1024>>>` 和 `<<<64, 32>>>`，就得给核函数计时。核函数启动后会立即返回，GPU 在后台工作（[第 00 课](../Lesson-00/notes.md)），所以在启动语句前后用普通的 CPU 时钟计时，几乎什么也量不到。CUDA 事件能解决这个问题。事件是你放进 GPU 工作队列里的一个标记，GPU 执行到这个标记时，会记下当时的时间。

这个固定写法分为五个部分。

```c
cudaEvent_t start, stop;
cudaEventCreate(&start);            // 1. create two events
cudaEventCreate(&stop);
cudaEventRecord(start);             // 2. marker before the work
kernel<<<blocks, threads>>>(...);   // 3. the work
cudaEventRecord(stop);              // 4. marker after the work
cudaEventSynchronize(stop);         // 5. wait until the GPU reached stop
float ms;
cudaEventElapsedTime(&ms, start, stop);
```

`cudaEventElapsedTime` 给出两个标记之间的时间，单位是毫秒。1 毫秒等于 1000 微秒。

逐步走一遍计时的写法，然后打开两个经典错误中的一个看看。

<event-timing></event-timing>

> [!WARNING]
> 不要省掉 `cudaEventSynchronize(stop)`。`cudaEventRecord` 会立即返回，如果不等待，CPU 会在 GPU 到达 `stop` 之前就去读取时间。这时 `cudaEventElapsedTime` 不会给出时间，而是以 `cudaErrorNotReady` 报错。

另外还有两个习惯能让测得的数字更可信。

- **先预热。** 程序里的第一次启动要承担一次性的准备开销，比如把核函数加载到 GPU 上。开始计时之前，先运行一次核函数，并用 `cudaDeviceSynchronize()` 等它结束。
- **重复多次取平均。** 这个核函数单次启动的时间非常短，而时钟的分辨率大约是半微秒。测 100 次启动再除以 100，结果比只测一次稳定得多。

> [!TIP]
> 想要精确的核函数耗时，就用性能分析工具。Nsight Systems 不用改代码就能测量每个核函数，`nsys profile --stats=true ./vector_add_blocks 256` 会打印一张表，列出每个核函数的耗时。

## 你会看到什么

只有 2048 个元素时，核函数内部的工作量非常小。每次启动的大部分时间都花在启动本身。CPU 把核函数交给驱动程序，GPU 做好准备并开始执行。这部分启动开销无论是 2 个线程块还是 64 个线程块都差不多。所以在这里，各种配置的结果应该很接近，每次运行之间也会有小幅波动。

这是一个结论，而不是失败。它说明任务必须足够大，网格布局才开始变得重要。下面的“动手试试”一节会把向量放大 8192 倍，让你看到差距如何拉开。

## 代码

完整的程序在 `code/vector_add_blocks.cu` 里。它从命令行读取每块的线程数，计算网格大小，先预热，再测量 100 次启动的时间，最后检查结果。

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include <stdlib.h>

#define N 2048
#define RUNS 100

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
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}

int main(int argc, char **argv)
{
    // threads per block from the command line, 1024 if none is given
    int threads = (argc > 1) ? atoi(argv[1]) : 1024;
    int blocks = (N + threads - 1) / threads;
    size_t bytes = N * sizeof(int);

    int *h_a = (int *)malloc(bytes);
    int *h_b = (int *)malloc(bytes);
    int *h_c = (int *)malloc(bytes);
    int *d_a, *d_b, *d_c;
    CHECK(cudaMalloc(&d_a, bytes));
    CHECK(cudaMalloc(&d_b, bytes));
    CHECK(cudaMalloc(&d_c, bytes));

    for (int i = 0; i < N; i++) {
        h_a[i] = i;
        h_b[i] = N - i;
    }
    CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

    // warm-up: the first launch pays one-time setup costs, so it is not timed
    vectorAdd<<<blocks, threads>>>(d_a, d_b, d_c, N);
    CHECK(cudaGetLastError());
    CHECK(cudaDeviceSynchronize());

    // time RUNS launches with two CUDA events
    cudaEvent_t start, stop;
    CHECK(cudaEventCreate(&start));
    CHECK(cudaEventCreate(&stop));
    CHECK(cudaEventRecord(start));
    for (int r = 0; r < RUNS; r++) {
        vectorAdd<<<blocks, threads>>>(d_a, d_b, d_c, N);
    }
    CHECK(cudaEventRecord(stop));
    CHECK(cudaEventSynchronize(stop));
    CHECK(cudaGetLastError());
    float ms = 0.0f;
    CHECK(cudaEventElapsedTime(&ms, start, stop));

    CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));
    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != h_a[i] + h_b[i]) {
            errors++;
        }
    }
    printf("<<<%d, %d>>>: %d threads for %d elements\n", blocks, threads, blocks * threads, N);
    printf("average time per launch: %.2f us\n", ms * 1000.0f / RUNS);
    printf("errors: %d\n", errors);

    CHECK(cudaEventDestroy(start));
    CHECK(cudaEventDestroy(stop));
    CHECK(cudaFree(d_a));
    CHECK(cudaFree(d_b));
    CHECK(cudaFree(d_c));
    free(h_a);
    free(h_b);
    free(h_c);
    return 0;
}
```

- 在 `int main(int argc, char **argv)` 里，`argc` 是命令行里的单词个数，`argv` 保存这些单词。运行 `./vector_add_blocks 256` 时，`argc` = 2，`argv[1]` = `"256"`。
- `atoi(argv[1])` 把文本 `"256"` 转换成数字 256。没有参数时，程序使用 1024。
- `int blocks = (N + threads - 1) / threads;` 就是上面讲的向上取整公式。
- `int i = blockIdx.x * blockDim.x + threadIdx.x;` 就是全局索引。核函数的其余部分和第 08 课相同。
- 预热启动只运行一次，不计时。`cudaDeviceSynchronize()` 确保它在计时开始前已经执行完毕。
- `for` 循环在两个事件标记之间启动核函数 100 次。CPU 只负责把这些启动放进队列，GPU 再逐个运行它们。
- `ms * 1000.0f / RUNS` 把总毫秒数换算成每次启动的微秒数。
- `cudaEventDestroy` 销毁事件，就像 `cudaFree` 释放内存一样。

## 代码逐步讲解

按照你写程序的顺序，逐步过一遍。大部分内容来自第 08 课，新增的是全局索引、从命令行读取的网格大小，以及计时。

<div class="code-walk" markdown>

1. `1-4 cpu` **头文件。** 和第 08 课相同的四个头文件。这次仍然需要 `stdlib.h`，而且还要用到其中的 `atoi`，它把命令行文本转换成数字。
2. `6-7 cpu` **大小。** `N` 是向量长度，现在是 2048。`RUNS` 是要计时的启动次数。两者都定义在文件开头，想试别的值时，只需改一个地方。
3. `9-18 cpu` **CHECK 宏。** 从第 08 课原样复制过来。这个程序里的每个 CUDA 调用都经过它，所以一旦出错，程序会报出文件名和行号并停下，而不是给出错误的数字。
4. `20-21,26 gpu` **核函数的框架。** 先写函数签名和花括号。参数和第 08 课一样，两个输入、一个输出，以及长度 `n`。
5. `22 gpu` **全局索引。** 唯一改动的就是这一行。`blockIdx.x * blockDim.x` 跳过前面所有线程块的线程，`threadIdx.x` 再加上线程在本线程块内的位置。以每块 1024 个线程的启动为例，线程块 1 的线程 0 得到 1 * 1024 + 0 = 1024。常见的错误是仍然只用 `threadIdx.x`，结果每个线程块都去处理开头那几个相同的元素。
6. `23-25 gpu` **加保护再相加。** 现在边界检查真正派上了用场。网格向上取整后，最后一个线程块里可能有超出末尾的线程。只有满足 `i < n` 的线程才去相加自己负责的那一对元素。
7. `28-29,88-89 cpu` **main 的框架。** 这次 `main` 接收 `argc` 和 `argv`，这样程序就能从命令行读取线程块大小。马上写好 `return 0;` 和右花括号。
8. `30-31 cpu` **每块线程数。** 如果有参数，就用 `atoi` 把它转换成数字，否则程序使用 1024。`? :` 运算符是简写的 if/else。先写条件，然后是条件为真时的值，最后是条件为假时的值。
9. `32 cpu` **网格大小。** 用 `(N + threads - 1) / threads` 向上取整。每块 1000 个线程时，(2048 + 999) / 1000 = 3 个线程块。如果直接写 `N / threads`，只会得到 2 个线程块，也就是 2000 个线程，最后 48 个元素就被漏掉了。
10. `33,35-41,82-87 cpu` **分配和释放。** 写出以字节为单位的大小、三个 `malloc` 和三个 `cudaMalloc` 调用，然后马上在 `main` 末尾写好与之配对的 `cudaFree` 和 `free`。每一对都一起写，就永远不会漏掉。
11. `43-48 cpu` **填充并复制到设备端。** 在主机端填好 `a` 和 `b`，再复制到设备端，和第 08 课的第 2、3 步完全一样。`c` 的每个元素最后都应该是 2048。
12. `50-53 cpu` **预热。** 一次不计时的启动，用 `cudaGetLastError()` 检查，再用 `cudaDeviceSynchronize()` 等它结束。启动语句本身在 CPU 上运行，它只是把核函数交给 GPU。
13. `55-59,80-81 cpu` **创建事件并开始计时。** 声明 `start` 和 `stop`，创建它们，再把 `start` 标记放进 GPU 队列。现在就把两行 `cudaEventDestroy` 加到末尾，和其他清理语句放在一起。
14. `60-62 cpu` **计时的启动。** 这个循环把 100 次启动放进队列。CPU 早早就跑完了这个循环，GPU 却要很久之后才执行完这些核函数。
15. `63-67 cpu` **停止并读取时间。** 把 `stop` 标记放进队列，用 `cudaEventSynchronize` 等 GPU 执行到它，检查启动错误，然后读出两个标记之间的毫秒数。忘了写同步这一行是经典错误，因为这时时间还没准备好。
16. `69-75 cpu` **复制回来并检查。** 把 `c` 复制回来，统计出错的元素个数。结果不对的核函数再快也毫无价值，所以一定要检查。
17. `76-78 cpu` **打印报告。** 启动配置、以微秒为单位的平均每次启动耗时，以及错误个数。

</div>

## 编译和运行

```bash
nvcc -arch=sm_89 -o vector_add_blocks vector_add_blocks.cu
./vector_add_blocks 1024
./vector_add_blocks 32
./vector_add_blocks 1000
```

- `nvcc -arch=sm_89 ...` 为 L40S 编译，和[第 06 课](../Lesson-06/notes.md)一样。
- `./vector_add_blocks 1024` 运行 2 个线程块，每块 1024 个线程。
- `./vector_add_blocks 32` 运行 64 个线程块，每块 32 个线程。
- `./vector_add_blocks 1000` 运行 3 个线程块，每块 1000 个线程，用 3000 个线程处理 2048 个元素。边界检查会拦住多出来的 952 个线程。

## 输出

这是 `./vector_add_blocks 1000` 的输出。耗时写成 `...`，因为它取决于 GPU。

```
<<<3, 1000>>>: 3000 threads for 2048 elements
average time per launch: ... us
errors: 0
```

下面说说怎么看这段输出。

- `<<<3, 1000>>>` 说明向上取整公式得出 3 个线程块。
- `3000 threads for 2048 elements` 说明有 952 个线程无事可做，边界检查让它们碰不到内存。
- `average time per launch` 这一行填的是你自己测得的数字，可以在三次运行之间比较一下。
- `errors: 0` 说明即使线程块大小不能整除 2048，2048 个和也全部正确。

## 动手试试

1. **把任务变大。** 把 `#define N 2048` 改成 `#define N (1 << 24)`，也就是 16,777,216 个元素（每个向量 64 MB）。分别用每块 32、256 和 1024 个线程运行。现在工作量足以填满 GPU，线程块大小开始带来可以测出来的差别。
2. **去掉保护。** 删掉 `if (i < n)` 这一行和对应的右花括号，编译后运行 `compute-sanitizer ./vector_add_blocks 1000`。即使打印的结果看起来没问题，Compute Sanitizer 也会报告多余线程对全局内存的非法写入。
3. **故意弄坏计时。** 删掉 `CHECK(cudaEventSynchronize(stop));` 这一行再运行。程序应该会在 `cudaEventElapsedTime` 那一行报出 `CUDA error` 并停下，因为时间还没准备好。

## 自己动手写

为 SAXPY 写一个核函数，这是一个经典的 GPU 测试，对 5000 个 float 计算 `y[i] = a * x[i] + y[i]`，每块 256 个线程。5000 不是 256 的倍数，所以你需要向上取整，也需要边界保护。

1. 写出带全局索引和边界检查的核函数。
2. 用向上取整公式算出线程块数。
3. 启动核函数，再把 `y` 复制回来。

```c
#include "cuda_runtime.h"
#include <stdio.h>
#include <stdlib.h>

#define N 5000

__global__ void saxpy(float a, const float *x, float *y, int n)
{
    // TODO: compute the global index i
    // TODO: if i is inside the vector, set y[i] = a * x[i] + y[i]
}

int main()
{
    size_t bytes = N * sizeof(float);
    float *h_x = (float *)malloc(bytes);
    float *h_y = (float *)malloc(bytes);
    for (int i = 0; i < N; i++) {
        h_x[i] = 1.0f;
        h_y[i] = 2.0f;
    }

    float *d_x, *d_y;
    cudaMalloc(&d_x, bytes);
    cudaMalloc(&d_y, bytes);
    cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(d_y, h_y, bytes, cudaMemcpyHostToDevice);

    int threads = 256;
    // TODO: compute blocks so that blocks * threads >= N
    // TODO: launch saxpy with a = 3.0f
    // TODO: copy d_y back into h_y

    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_y[i] != 5.0f) {
            errors++;
        }
    }
    printf("y[0] = %.1f, y[%d] = %.1f, errors: %d\n", h_y[0], N - 1, h_y[N - 1], errors);

    cudaFree(d_x);
    cudaFree(d_y);
    free(h_x);
    free(h_y);
    return 0;
}
```

??? tip "提示"
    索引那一行和本课核函数里的一样。网格方面，(5000 + 256 - 1) / 256 = 20 个线程块，也就是 5120 个线程，多出的 120 个线程必须由边界保护拦住。每个 `y[i]` 都应该变成 3 * 1 + 2 = 5。

??? note "答案"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>
    #include <stdlib.h>

    #define N 5000

    __global__ void saxpy(float a, const float *x, float *y, int n)
    {
        int i = blockIdx.x * blockDim.x + threadIdx.x;
        if (i < n) {
            y[i] = a * x[i] + y[i];
        }
    }

    int main()
    {
        size_t bytes = N * sizeof(float);
        float *h_x = (float *)malloc(bytes);
        float *h_y = (float *)malloc(bytes);
        for (int i = 0; i < N; i++) {
            h_x[i] = 1.0f;
            h_y[i] = 2.0f;
        }

        float *d_x, *d_y;
        cudaMalloc(&d_x, bytes);
        cudaMalloc(&d_y, bytes);
        cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);
        cudaMemcpy(d_y, h_y, bytes, cudaMemcpyHostToDevice);

        int threads = 256;
        int blocks = (N + threads - 1) / threads;
        saxpy<<<blocks, threads>>>(3.0f, d_x, d_y, N);
        cudaMemcpy(h_y, d_y, bytes, cudaMemcpyDeviceToHost);

        int errors = 0;
        for (int i = 0; i < N; i++) {
            if (h_y[i] != 5.0f) {
                errors++;
            }
        }
        printf("y[0] = %.1f, y[%d] = %.1f, errors: %d\n", h_y[0], N - 1, h_y[N - 1], errors);

        cudaFree(d_x);
        cudaFree(d_y);
        free(h_x);
        free(h_y);
        return 0;
    }
    ```

    用 `nvcc -arch=sm_89 -o saxpy saxpy.cu` 编译，再运行 `./saxpy`。你应该会看到 `y[0] = 5.0, y[4999] = 5.0, errors: 0`。如果忘了边界保护，结果可能看起来仍然正确，但 `compute-sanitizer ./saxpy` 会报告那 120 个多余线程的写入。

## 术语表

- 全局索引（global index）：线程在整个网格中的位置，即 `blockIdx.x * blockDim.x + threadIdx.x`。它让每个线程对应一个元素。
- 网格大小（grid size）：一次启动中的线程块数，也就是 `<<<blocks, threads>>>` 里的第一个数。
- 向上取整公式（round-up formula）：`(N + threads - 1) / threads`，算出让 `blocks * threads` 至少等于 `N` 所需的线程块数。
- 边界检查（bounds check）：`if (i < n)`，防止向上取整后网格里多出来的线程访问末尾之外的内存。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 内部运行线程块的处理器。一个线程块在一个 SM 上运行，一个 SM 可以容纳多个线程块。L40S 有 142 个。
- `nvidia-smi` GPU utilization：有核函数在运行的时间所占的比例。它无法说明有多少个 SM 在忙。
- CUDA 事件（`cudaEvent_t`）：GPU 工作队列中的一个标记。GPU 执行到这个标记时会记下时间。
- `cudaEventRecord`：把一个事件标记放进队列。它会立即返回。
- `cudaEventSynchronize`：让 CPU 一直等到 GPU 执行到指定的事件。
- `cudaEventElapsedTime`：两个已记录事件之间的时间，单位是毫秒。
- 预热（warm-up）：第一次不计时的启动，用来消化一次性的准备开销。
- 启动开销（launch overhead）：把核函数交给 GPU 并开始执行所需的固定时间。核函数本身很小时，它占了大头。
- SAXPY（Single-precision A times X Plus Y）：在 float 向量上计算 `y = a * x + y`，是经典的入门级 GPU 核函数。
- Compute Sanitizer：NVIDIA 提供的工具，用来发现核函数里的内存错误，比如写到数组末尾之外。
- 计算能力（compute capability，CC）：一代 GPU 的版本号，L40S 是 8.9。它规定了每个线程块最多 1024 个线程之类的上限（[第 03 课](../Lesson-03/notes.md)）。
- `blockIdx.x`：线程所属线程块在网格中的编号。
- `blockDim.x`：每个线程块的线程数，也就是 `<<<blocks, threads>>>` 里的第二个数。
- `threadIdx.x`：线程在所属线程块内的位置。它在每个线程块里都从 0 重新开始。
- 驱动程序（driver）：位于你的程序和 GPU 之间的 NVIDIA 软件。它接收每一次核函数启动，并在 GPU 上做好准备。
- 微秒（µs）：百万分之一秒。1 毫秒（ms）等于 1000 µs。
- `argc` / `argv`：`main` 的参数。`argc` 是命令行里的单词个数，`argv` 以文本形式保存这些单词，`argv[0]` 是程序名。
- `nvcc`：CUDA 编译器。它把 `.cu` 文件里的 CPU 部分和 GPU 部分编译成一个程序。
- `-arch=sm_89`：为计算能力 8.9 编译，也就是 L40S。
