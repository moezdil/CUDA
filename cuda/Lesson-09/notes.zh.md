# 09 > 多个线程块、网格大小与计时

[第 08 课](../Lesson-08/notes.md) 用一个线程块把两个各有 1024 个元素的向量相加。这一课把大小翻倍到 2048 个元素，单个线程块已经装不下了。你会学到几乎每个 CUDA 核函数都会用到的索引公式，如何为任意长度的向量选择网格大小，你的启动真正让多少个 SM（Streaming Multiprocessor，流式多处理器）忙起来，以及如何在不自欺欺人的情况下给核函数计时。

> [!NOTE]
> 代码面向 Ubuntu 24 上的 CUDA 13，以及这些课里使用的 NVIDIA L40S（CC 8.9，142 个 SM）。时间取决于 GPU，所以请在你自己的 GPU 上运行程序，亲自比较不同的配置。

## 从 1024 个元素到 2048 个元素

现在每个向量有 2048 个元素。每个元素一个线程，就需要 2048 个线程。一个线程块最多只能有 1024 个线程。这个上限是计算能力（CC，compute capability）的一部分，[第 03 课](../Lesson-03/notes.md) 讲过，所以 `<<<1, 2048>>>` 在启动时会被拒绝（[第 02 课](../Lesson-02/notes.md)）。

办法是用更多的线程块。最简单的分法是 2 个线程块，每个 1024 个线程，也就是 `<<<2, 1024>>>`：

- 线程块 0 负责元素 0 到 1023
- 线程块 1 负责元素 1024 到 2047

第 08 课的核函数用的是 `int i = threadIdx.x;`。这样已经不行了。在线程块 1 里，`threadIdx.x` 又从 0 开始，所以线程块 1 会把元素 0 到 1023 再加一遍，而元素 1024 到 2047 根本没人碰。

## 全局线程 ID

每个线程需要的是整个向量里属于自己的那个元素，而不只是线程块内部的位置。算出它的公式叫全局线程 ID（全局索引）：

```c
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

- `blockIdx.x`：这个线程在哪个线程块里。
- `blockDim.x`：每个线程块有多少个线程，这里是 1024。
- `threadIdx.x`：线程在自己线程块里的位置。

`blockIdx.x * blockDim.x` 会跳过前面所有线程块的线程。用 `<<<2, 1024>>>` 的真实数字验证一下：

- 线程块 0，线程 2：0 * 1024 + 2 = 2
- 线程块 1，线程 0：1 * 1024 + 0 = 1024，后半段的第一个元素
- 线程块 1，线程 1023：1 * 1024 + 1023 = 2047，最后一个元素

从 0 到 2047 的每个元素都正好分到一个线程。拖动滑块，把鼠标停在某个线程上，就能看到任意启动配置下的公式：

<global-id></global-id>

> [!TIP]
> 把这一行背下来。几乎每个处理数组的核函数都以 `int i = blockIdx.x * blockDim.x + threadIdx.x;` 开头。

## 选择网格大小

怎么切分工作由你决定。对 2048 个元素来说，下面这些都正好启动 2048 个线程：

| 启动 | 线程块数 | 每块线程数 | 线程总数 |
|---|---|---|---|
| `<<<2, 1024>>>` | 2 | 1024 | 2048 |
| `<<<8, 256>>>` | 8 | 256 | 2048 |
| `<<<64, 32>>>` | 64 | 32 | 2048 |

线程块越多，每块的线程就越少，反过来也一样。乘积必须覆盖每一个元素。

真实的向量长度很少是这么整的数。假设向量有 2000 个元素，你想每块 256 个线程。2000 / 256 等于 7.8，而 C 语言的整数除法会直接丢掉小数部分：

- `2000 / 256` 得到 7 个线程块，也就是 7 * 256 = 1792 个线程。最后 208 个元素永远不会被相加。

所以要向上取整。标准写法是这个公式：

```c
int blocks = (N + threads - 1) / threads;
```

- `(2000 + 256 - 1) / 256` = 2255 / 256 = 8 个线程块，也就是 8 * 256 = 2048 个线程。

现在多出了 48 个线程（2048 - 2000）。它们的全局索引是 2000 到 2047，已经超出了向量的末尾。这正是核函数里保留第 08 课那个边界检查的原因：

```c
if (i < n) {
    c[i] = a[i] + b[i];
}
```

多出来的 48 个线程发现 `i < n` 不成立，就什么也不做。

> [!WARNING]
> 没有 `if (i < n)`，这 48 个线程就会读写数组末尾之外的内存。程序可能照样打印出正确结果，因为这些错误的写入可能落在没人检查的内存里。这让 bug 很难被发现。网格要向上取整，索引一定要加保护。

> [!NOTE]
> 线程块大小最好选 32 的倍数，也就是线程束大小（[第 07 课](../Lesson-07/notes.md)）。GPU 以 32 个线程为一个线程束来运行。100 个线程的线程块会变成 4 个线程束（128 个通道），最后一个线程束的 32 个通道里只有 4 个在干活。每块 128 或 256 个线程是常见又稳妥的选择。

## 这次启动用了多少个 SM？

一个线程块总是在一个 SM 上运行。一个 SM 可以同时容纳多个线程块。在 L40S 上，一个 SM 最多容纳 1536 个线程（48 个线程束），最多 24 个线程块。哪个 SM 拿到哪个线程块，由硬件调度器决定。在空闲的 GPU 上，它通常会先把线程块分散开，每个 SM 一个，但这并没有保证。

现在用有 142 个 SM 的 L40S 来算一算：

- `<<<2, 1024>>>`：2 个线程块，所以最多 2 个 SM 在工作。142 个里只有 2 个，大约 1.4%。其余 140 个 SM 都闲着。
- `<<<64, 32>>>`：64 个线程块，所以最多 64 个 SM 在工作，大约 45%。但每个 SM 只拿到一个线程束，而它本可以运行 48 个。

真正的问题是任务太小。L40S 同时能容纳 142 * 1536 = 218,112 个线程。2048 个线程还不到其中的 1%。工作这么少，任何网格布局都填不满一块 GPU。只有在有几十万、几百万个元素时，GPU 才真正划算。

选一个线程块大小，看看网格怎样落到 L40S 的 142 个 SM 上：

<grid-size n="2048" sms="142"></grid-size>

> [!NOTE]
> `nvidia-smi` 里的 “GPU utilization” 并不统计 SM。它显示的是有核函数在运行的时间所占的比例。一个只在一个 SM 上跑一个线程块的核函数，在那里也可能显示 100%。想知道核函数真正用了芯片的多少，需要用 Nsight Compute 这样的性能分析工具（见 [第 05 课](../Lesson-05/notes.md)）。

## 用 CUDA 事件计时

要比较 `<<<2, 1024>>>` 和 `<<<64, 32>>>`，就得给核函数计时。启动核函数会立刻返回，GPU 在后台工作（[第 00 课](../Lesson-00/notes.md)），所以在启动语句前后用普通的 CPU 时钟几乎什么也量不到。CUDA 事件解决了这个问题。事件是你放进 GPU 工作队列里的一个标记。GPU 走到这个标记时，会记下当时的时间。

这个套路有五个部分：

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

`cudaEventElapsedTime` 给出两个标记之间的时间，单位是毫秒。1 毫秒等于 1000 微秒（µs）。

一步一步走完计时的套路，然后打开两个经典错误中的一个看看：

<event-timing></event-timing>

> [!WARNING]
> 不要省掉 `cudaEventSynchronize(stop)`。`cudaEventRecord` 会立刻返回，如果不等待，CPU 会在 GPU 到达 `stop` 之前就去取时间。这时 `cudaEventElapsedTime` 不会给你时间，而是返回 `cudaErrorNotReady` 错误。

还有两个习惯能让数字更可信：

- **先预热。** 程序里的第一次启动要付出一次性的准备成本，比如把核函数加载到 GPU 上。开始计时之前先运行一次核函数，并用 `cudaDeviceSynchronize()` 等它结束。
- **重复并取平均。** 这个核函数单次启动非常短，而时钟的分辨率大约是半微秒。测 100 次启动再除以 100，比只测一次稳定得多。

> [!TIP]
> 想要精确的核函数时间，就用性能分析工具。Nsight Systems 不用改代码就能测量每个核函数：`nsys profile --stats=true ./vector_add_blocks 256` 会打印一张表，列出每个核函数的时间。

## 你应该预期什么

只有 2048 个元素时，核函数内部的工作量非常小。每次启动的大部分时间都花在启动本身上：CPU 把核函数交给驱动程序，GPU 准备好并开始执行。这部分启动开销对 2 个线程块和 64 个线程块来说差不多。所以在这里，不同配置的结果应该很接近，每次运行之间也会有小的波动。

这是一个结论，不是失败。它说明 GPU 需要足够大的任务，网格布局才开始变得重要。下面的 “动手试试” 部分会把向量放大 8192 倍，让你看到差距是怎么拉开的。

## 代码

完整程序在 `code/vector_add_blocks.cu` 里。它从命令行读取每块的线程数，计算网格大小，预热，测量 100 次启动，并检查结果：

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

- `int main(int argc, char **argv)`：`argc` 统计命令行里的单词数，`argv` 保存这些单词。`./vector_add_blocks 256` 会得到 `argc` = 2，`argv[1]` = `"256"`。
- `atoi(argv[1])`：把文本 `"256"` 转成数字 256。没有参数时，程序使用 1024。
- `int blocks = (N + threads - 1) / threads;`：上面讲的向上取整公式。
- `int i = blockIdx.x * blockDim.x + threadIdx.x;`：全局索引。核函数的其余部分和第 08 课一样。
- 预热启动只运行一次，不计时。`cudaDeviceSynchronize()` 确保它在计时开始前已经结束。
- `for` 循环在两个事件标记之间启动核函数 100 次。CPU 只是把这些启动排进队列，GPU 一个接一个地运行它们。
- `ms * 1000.0f / RUNS`：把总毫秒数换算成每次启动的微秒数。
- `cudaEventDestroy`：释放事件，就像 `cudaFree` 释放内存一样。

## 代码逐步讲解

按你写程序的顺序一步一步看。大部分来自第 08 课。新的部分是全局索引、来自命令行的网格大小，以及计时。

<div class="code-walk" markdown>

1. `1-4 cpu` **头文件。** 和第 08 课一样的四个头文件。这次仍然需要 `stdlib.h`，现在还要用它的 `atoi` 把命令行文本转成数字。
2. `6-7 cpu` **大小。** `N` 是向量长度，现在是 2048。`RUNS` 是要计时的启动次数。把两者都定义在最上面，想试别的值时只需在一个地方改一处。
3. `9-18 cpu` **CHECK 宏。** 从第 08 课原样复制。这个程序里的每个 CUDA 调用都经过它，出错时程序会带着文件名和行号停下来，而不是给出错误的数字。
4. `20-21,26 gpu` **核函数的骨架。** 先写函数签名和大括号。参数和第 08 课一样：两个输入，一个输出，以及长度 `n`。
5. `22 gpu` **全局索引。** 改变的就是这一行。`blockIdx.x * blockDim.x` 跳过前面所有线程块的线程，`threadIdx.x` 再加上在本线程块里的位置。在 1024 个线程的启动里，线程块 1 的线程 0：1 * 1024 + 0 = 1024。常见错误是只用 `threadIdx.x`，那样每个线程块都会处理同样的前几个元素。
6. `23-25 gpu` **保护并相加。** 现在边界检查真的很重要：网格向上取整后，最后一个线程块可能有超出末尾的线程。只有 `i < n` 的线程才去相加自己那一对。
7. `28-29,88-89 cpu` **main 的骨架。** 这次 `main` 接收 `argc` 和 `argv`，这样程序就能从命令行读取线程块大小。马上把 `return 0;` 和右大括号写好。
8. `30-31 cpu` **每块线程数。** 如果有参数，`atoi` 把它转成数字，否则程序用 1024。`? :` 运算符是简短的 if/else：先写条件，然后是条件为真时的值，最后是条件为假时的值。
9. `32 cpu` **网格大小。** 用 `(N + threads - 1) / threads` 向上取整。用 1000 个线程时：(2048 + 999) / 1000 = 3 个线程块。直接写 `N / threads` 只会得到 2 个线程块，也就是只有 2000 个线程，最后 48 个元素会被漏掉。
10. `33,35-41,82-87 cpu` **分配和释放。** 写出以字节为单位的大小、三个 `malloc` 和三个 `cudaMalloc` 调用，然后马上在 `main` 末尾写好对应的 `cudaFree` 和 `free`。成对地写，就永远不会漏掉哪一个。
11. `43-48 cpu` **填充并复制过去。** 在主机端填好 `a` 和 `b`，再复制到设备端，和第 08 课的第 2、3 步完全一样。`c` 的每个元素最后都应该是 2048。
12. `50-53 cpu` **预热。** 一次不计时的启动，用 `cudaGetLastError()` 检查，然后 `cudaDeviceSynchronize()` 等它结束。启动语句本身是在 CPU 上运行的：它只是把核函数交给 GPU。
13. `55-59,80-81 cpu` **创建并开始事件。** 声明 `start` 和 `stop`，创建它们，再把 `start` 标记放进 GPU 队列。现在就把两行 `cudaEventDestroy` 加到末尾，和其他清理语句放在一起。
14. `60-62 cpu` **计时的启动。** 这个循环把 100 次启动排进队列。CPU 跑完这个循环的时候，GPU 离跑完这些核函数还早着呢。
15. `63-67 cpu` **停止并读取时间。** 把 `stop` 标记放进队列，用 `cudaEventSynchronize` 等 GPU 走到它，检查启动错误，然后读出两个标记之间的毫秒数。忘了同步这一行是经典错误：时间还没准备好。
16. `69-75 cpu` **复制回来并检查。** 把 `c` 复制回来，数一数错误的元素。结果不对的快核函数毫无价值，所以一定要检查。
17. `76-78 cpu` **打印报告。** 启动的形状、以微秒为单位的每次启动平均时间，以及错误数。

</div>

## 编译和运行

```bash
nvcc -arch=sm_89 -o vector_add_blocks vector_add_blocks.cu
./vector_add_blocks 1024
./vector_add_blocks 32
./vector_add_blocks 1000
```

- `nvcc -arch=sm_89 ...`：为 L40S 编译，和 [第 06 课](../Lesson-06/notes.md) 一样。
- `./vector_add_blocks 1024`：2 个线程块，每块 1024 个线程。
- `./vector_add_blocks 32`：64 个线程块，每块 32 个线程。
- `./vector_add_blocks 1000`：3 个线程块，每块 1000 个线程，用 3000 个线程处理 2048 个元素。边界检查会挡住多出来的 952 个线程。

## 输出

这是 `./vector_add_blocks 1000` 的输出。时间写成 `...`，因为它取决于 GPU：

```
<<<3, 1000>>>: 3000 threads for 2048 elements
average time per launch: ... us
errors: 0
```

怎么看：

- `<<<3, 1000>>>`：向上取整公式得到 3 个线程块。
- `3000 threads for 2048 elements`：有 952 个线程无事可做。边界检查让它们碰不到内存。
- `average time per launch`：这里填你自己的数字。在三次运行之间比较一下。
- `errors: 0`：即使线程块大小不能整除 2048，2048 个和也全部正确。

## 动手试试

1. **把任务变大。** 把 `#define N 2048` 改成 `#define N (1 << 24)`，也就是 16,777,216 个元素（每个向量 64 MB）。分别用 32、256 和 1024 个线程运行。现在工作量足够填满 GPU，线程块大小开始带来你能测出来的差别。
2. **去掉保护。** 删掉 `if (i < n)` 这一行和它的右大括号，编译后运行 `compute-sanitizer ./vector_add_blocks 1000`。即使打印的结果看起来没问题，Compute Sanitizer 也会报告多余线程的非法全局写入。
3. **故意弄坏计时。** 删掉 `CHECK(cudaEventSynchronize(stop));` 这一行再运行。程序应该会在 `cudaEventElapsedTime` 那一行报出 `CUDA error` 并停下来，因为时间还没准备好。

## 自己动手写

为 SAXPY 写一个核函数，这是一个经典的 GPU 测试：对 5000 个 float 计算 `y[i] = a * x[i] + y[i]`，每块 256 个线程。5000 不是 256 的倍数，所以你需要向上取整和边界保护。

1. 写出带全局索引和边界检查的核函数。
2. 用向上取整公式算出线程块数。
3. 启动核函数，并把 `y` 复制回来。

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
    索引那一行和本课核函数里的一样。网格方面，(5000 + 256 - 1) / 256 = 20 个线程块，也就是 5120 个线程，其中 120 个多余的线程必须被边界保护挡住。每个 `y[i]` 都应该变成 3 * 1 + 2 = 5。

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

    用 `nvcc -arch=sm_89 -o saxpy saxpy.cu` 编译，再运行 `./saxpy`。你应该看到 `y[0] = 5.0, y[4999] = 5.0, errors: 0`。如果忘了边界保护，结果可能仍然看起来正确，但 `compute-sanitizer ./saxpy` 会报告那 120 个多余线程的写入。

## 术语表

- 全局索引（global index）：线程在整个网格中的位置，`blockIdx.x * blockDim.x + threadIdx.x`。它把每个线程对应到一个元素。
- 网格大小（grid size）：一次启动中的线程块数，也就是 `<<<blocks, threads>>>` 里的第一个数。
- 向上取整公式（round-up formula）：`(N + threads - 1) / threads`，让 `blocks * threads` 至少等于 `N` 所需的线程块数。
- 边界检查（bounds check）：`if (i < n)`，防止向上取整的网格里多出来的线程碰到末尾之外的内存。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 内部运行线程块的处理器。一个线程块在一个 SM 上运行；一个 SM 可以容纳多个线程块。L40S 有 142 个。
- `nvidia-smi` GPU utilization：有核函数在运行的时间所占的比例。它不能说明有多少个 SM 在忙。
- CUDA 事件（`cudaEvent_t`）：GPU 工作队列中的一个标记。GPU 到达这个标记时会记下时间。
- `cudaEventRecord`：把一个事件标记放进队列。它会立刻返回。
- `cudaEventSynchronize`：让 CPU 一直等到 GPU 到达指定的事件。
- `cudaEventElapsedTime`：两个已记录事件之间的时间，单位是毫秒。
- 预热（warm-up）：第一次不计时的启动，用来吸收一次性的准备成本。
- 启动开销（launch overhead）：把核函数交给 GPU 并启动所需的固定时间。核函数本身很小时，它占了大头。
- SAXPY（Single-precision A times X Plus Y）：在 float 向量上计算 `y = a * x + y`，一个经典的入门 GPU 核函数。
- Compute Sanitizer：NVIDIA 用来发现核函数内存错误的工具，比如写到数组末尾之外。
- 计算能力（compute capability，CC）：一代 GPU 的版本号，L40S 是 8.9。它规定了每个线程块最多 1024 个线程这样的上限（[第 03 课](../Lesson-03/notes.md)）。
- `blockIdx.x`：线程所在线程块在网格里的编号。
- `blockDim.x`：每个线程块的线程数，也就是 `<<<blocks, threads>>>` 里的第二个数。
- `threadIdx.x`：线程在自己线程块里的位置。它在每个线程块里都从 0 重新开始。
- 驱动程序（driver）：位于你的程序和 GPU 之间的 NVIDIA 软件。它接收每一次核函数启动，并在 GPU 上把它准备好。
- 微秒（µs）：百万分之一秒。1 毫秒（ms）等于 1000 µs。
- `argc` / `argv`：`main` 的参数。`argc` 统计命令行里的单词数，`argv` 以文本形式保存它们，`argv[0]` 是程序名。
- `nvcc`：CUDA 编译器。它把 `.cu` 文件里的 CPU 部分和 GPU 部分编译成一个程序。
- `-arch=sm_89`：为计算能力 8.9 编译，也就是 L40S。
