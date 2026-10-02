# Lesson 09: Many Blocks, Grid Size and Timing

[Lesson 08](../Lesson-08/notes.md) added two vectors of 1024 elements with one block. This lesson doubles the size to 2048 elements, which no single block can cover. You learn the index formula that almost every CUDA kernel uses, how to pick the grid size for any vector length, how many SMs (Streaming Multiprocessors) your launch really keeps busy, and how to time a kernel without fooling yourself.

> [!NOTE]
> The code targets CUDA 13 on Ubuntu 24 and the NVIDIA L40S (CC 8.9, 142 SMs) used in these lessons. Timings depend on the GPU, so run the program on yours and compare the configurations yourself.

## From 1024 to 2048 Elements

The vectors now hold 2048 elements each. One thread per element means 2048 threads. A single block can hold at most 1024 threads. This limit is part of the compute capability (CC), as [Lesson 03](../Lesson-03/notes.md) showed, so `<<<1, 2048>>>` is rejected at launch ([Lesson 02](../Lesson-02/notes.md)).

The way out is more blocks. The simplest split is 2 blocks of 1024 threads, `<<<2, 1024>>>`:

- block 0 handles elements 0 to 1023
- block 1 handles elements 1024 to 2047

The kernel from Lesson 08 used `int i = threadIdx.x;`. That no longer works. In block 1, `threadIdx.x` starts at 0 again, so block 1 would add elements 0 to 1023 a second time, and elements 1024 to 2047 would never be touched.

## The Global Index

Each thread needs its own element in the whole vector, not just inside its block. The formula for that is the global index:

```c
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

- `blockIdx.x`: which block this thread is in.
- `blockDim.x`: how many threads each block has, here 1024.
- `threadIdx.x`: the thread's position inside its block.

`blockIdx.x * blockDim.x` skips over all threads of the blocks before this one. Check it with real numbers for `<<<2, 1024>>>`:

- block 0, thread 2: 0 * 1024 + 2 = 2
- block 1, thread 0: 1 * 1024 + 0 = 1024, the first element of the second half
- block 1, thread 1023: 1 * 1024 + 1023 = 2047, the last element

Every element from 0 to 2047 gets exactly one thread. Move the sliders and hover over a thread to see the formula for any launch:

<global-id></global-id>

> [!TIP]
> Learn this line by heart. Almost every kernel that works on an array starts with `int i = blockIdx.x * blockDim.x + threadIdx.x;`.

## Choosing the Grid Size

You decide how to split the work. For 2048 elements, all of these launch exactly 2048 threads:

| Launch | Blocks | Threads per block | Total threads |
|---|---|---|---|
| `<<<2, 1024>>>` | 2 | 1024 | 2048 |
| `<<<8, 256>>>` | 8 | 256 | 2048 |
| `<<<64, 32>>>` | 64 | 32 | 2048 |

More blocks means fewer threads per block, and the other way round. The product must cover every element.

Real vector lengths are rarely such round numbers. Say the vector has 2000 elements and you want 256 threads per block. 2000 / 256 is 7.8, and integer division in C drops the fraction:

- `2000 / 256` gives 7 blocks, which is 7 * 256 = 1792 threads. The last 208 elements are never added.

So round up instead. This formula is the standard way to do it:

```c
int blocks = (N + threads - 1) / threads;
```

- `(2000 + 256 - 1) / 256` = 2255 / 256 = 8 blocks, which is 8 * 256 = 2048 threads.

Now there are 48 threads too many (2048 - 2000). Their global index is 2000 to 2047, past the end of the vectors. This is exactly why the kernel has the bounds check from Lesson 08:

```c
if (i < n) {
    c[i] = a[i] + b[i];
}
```

The 48 extra threads see `i < n` fail and do nothing.

> [!WARNING]
> Without `if (i < n)`, those 48 threads read and write past the end of the arrays. The program may still print the right answer, because the bad writes can land in memory nobody checks. That makes the bug hard to find. Round up the grid, and always guard the index.

> [!NOTE]
> Pick a block size that is a multiple of 32, the warp size ([Lesson 07](../Lesson-07/notes.md)). The GPU runs threads in warps of 32. A block of 100 threads becomes 4 warps (128 lanes), and the last warp has only 4 of its 32 lanes busy. 128 or 256 threads per block is a common, safe choice.

## How Many SMs Does the Launch Use?

A block always runs on one SM. One SM can hold several blocks at the same time. On the L40S, one SM holds at most 1536 threads (48 warps) and at most 24 blocks. Which SM gets which block is decided by the hardware scheduler. On an idle GPU it usually spreads the blocks out, one per SM first, but that is not guaranteed.

Now count for the L40S with its 142 SMs:

- `<<<2, 1024>>>`: 2 blocks, so at most 2 SMs work. That is 2 of 142, about 1.4%. The other 140 SMs sit idle.
- `<<<64, 32>>>`: 64 blocks, so up to 64 SMs work, about 45%. But each of them holds a single warp, while it could run 48.

The real problem is the size of the job. The L40S can hold 142 * 1536 = 218,112 threads at the same time. 2048 threads is less than 1% of that. No grid layout can fill a GPU with so little work. GPUs pay off when there are hundreds of thousands or millions of elements.

Pick a block size and see how the grid lands on the 142 SMs of the L40S:

<grid-size n="2048" sms="142"></grid-size>

> [!NOTE]
> "GPU utilization" in `nvidia-smi` does not count SMs. It shows the share of time in which any kernel was running. A kernel with a single block on a single SM can still show 100% there. To see how much of the chip a kernel really uses, you need a profiler such as Nsight Compute (see [Lesson 05](../Lesson-05/notes.md)).

## Measuring Time with CUDA Events

To compare `<<<2, 1024>>>` with `<<<64, 32>>>`, you need to time the kernel. A kernel launch returns at once and the GPU works in the background ([Lesson 00](../Lesson-00/notes.md)), so a normal CPU clock around the launch line measures almost nothing. CUDA events solve this. An event is a marker that you put into the GPU's queue of work. When the GPU reaches the marker, it writes down the time.

The pattern has five parts:

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

`cudaEventElapsedTime` gives the time between the two markers in milliseconds. 1 millisecond is 1000 microseconds (µs).

Step through the timing pattern, then switch on one of the two classic mistakes:

<event-timing></event-timing>

> [!WARNING]
> Do not skip `cudaEventSynchronize(stop)`. `cudaEventRecord` returns at once, so without the wait the CPU asks for the time before the GPU has reached `stop`. `cudaEventElapsedTime` then fails with `cudaErrorNotReady` instead of giving you a time.

Two more habits make the numbers trustworthy:

- **Warm up first.** The very first launch in a program pays one-time setup costs, such as loading the kernel onto the GPU. Run the kernel once before you start timing, and wait for it with `cudaDeviceSynchronize()`.
- **Repeat and average.** One launch of this kernel is very short, and the clock has a resolution of about half a microsecond. Timing 100 launches and dividing by 100 gives a much steadier number than timing one.

> [!TIP]
> For exact kernel times, use a profiler. Nsight Systems measures every kernel without changes to your code: `nsys profile --stats=true ./vector_add_blocks 256` prints a table with the time of each kernel.

## What to Expect

With only 2048 elements, the work inside the kernel is tiny. Most of the time per launch goes to the launch itself: the CPU hands the kernel to the driver, and the GPU sets it up and starts it. That cost is about the same for 2 blocks and for 64 blocks. So expect the configurations to come out close to each other here, with small changes from run to run.

That is a result, not a failure. It shows that a GPU needs a big job before the grid layout starts to matter. The Try It section below makes the vectors 8192 times bigger, so you can see the difference grow.

## Code

The whole program is in `code/vector_add_blocks.cu`. It reads the threads per block from the command line, computes the grid size, warms up, times 100 launches and checks the result:

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

- `int main(int argc, char **argv)`: `argc` counts the words on the command line, `argv` holds them. `./vector_add_blocks 256` gives `argc` = 2 and `argv[1]` = `"256"`.
- `atoi(argv[1])`: turns the text `"256"` into the number 256. Without an argument, the program uses 1024.
- `int blocks = (N + threads - 1) / threads;`: the round-up formula from above.
- `int i = blockIdx.x * blockDim.x + threadIdx.x;`: the global index. The rest of the kernel is the same as in Lesson 08.
- The warm-up launch runs once and is not timed. `cudaDeviceSynchronize()` makes sure it has finished before the timing starts.
- The `for` loop launches the kernel 100 times between the two event markers. The CPU only queues the launches. The GPU runs them one after another.
- `ms * 1000.0f / RUNS`: turns the total milliseconds into microseconds per launch.
- `cudaEventDestroy`: frees the events, like `cudaFree` frees memory.

## Code Walkthrough

Step through the program in the order you would write it. Most of it is Lesson 08. The new parts are the global index, the grid size from the command line, and the timing.

<div class="code-walk" markdown>

1. `1-4 cpu` **Headers.** The same four headers as in Lesson 08. `stdlib.h` is needed again, now also for `atoi`, which turns command-line text into a number.
2. `6-7 cpu` **Sizes.** `N` is the vector length, now 2048. `RUNS` is how many launches you time. Defining both at the top means one change in one place when you want to try other values.
3. `9-18 cpu` **The CHECK macro.** Copy it from Lesson 08 unchanged. Every CUDA call in this program goes through it, so a failure stops the program with the file and line instead of giving wrong numbers.
4. `20-21,26 gpu` **The kernel shell.** Write the signature and the braces first. The parameters are the same as in Lesson 08: two inputs, one output, and the length `n`.
5. `22 gpu` **The global index.** This is the line that changes. `blockIdx.x * blockDim.x` skips all threads of the earlier blocks, and `threadIdx.x` adds the position inside this block. For block 1, thread 0 of a 1024-thread launch: 1 * 1024 + 0 = 1024. A common mistake is to keep `threadIdx.x` alone, which makes every block work on the same first elements.
6. `23-25 gpu` **Guard and add.** The bounds check now really matters: with a rounded-up grid, the last block can have threads past the end. Only threads with `i < n` add their pair.
7. `28-29,88-89 cpu` **The main shell.** This time `main` takes `argc` and `argv`, so the program can read the block size from the command line. Write `return 0;` and the closing brace right away.
8. `30-31 cpu` **Threads per block.** If there is an argument, `atoi` turns it into a number, otherwise the program uses 1024. The `? :` operator is a short if/else: condition, then the value if true, then the value if false.
9. `32 cpu` **The grid size.** Round up with `(N + threads - 1) / threads`. With 1000 threads: (2048 + 999) / 1000 = 3 blocks. Plain `N / threads` would give 2 blocks, only 2000 threads, and the last 48 elements would be missed.
10. `33,35-41,82-87 cpu` **Allocate and free.** Write the size in bytes, the three `malloc` and three `cudaMalloc` calls, and right away their `cudaFree` and `free` partners at the end of `main`. Writing each pair together means you never forget one.
11. `43-48 cpu` **Fill and copy in.** Fill `a` and `b` on the host and copy them to the device, exactly like steps 2 and 3 in Lesson 08. Every element of `c` should come out as 2048.
12. `50-53 cpu` **Warm-up.** One untimed launch, checked with `cudaGetLastError()`, then `cudaDeviceSynchronize()` waits until it is done. The launch line itself runs on the CPU: it only hands the kernel to the GPU.
13. `55-59,80-81 cpu` **Create and start the events.** Declare `start` and `stop`, create them, and put the `start` marker into the GPU queue. Add the two `cudaEventDestroy` lines at the end now, next to the other cleanup.
14. `60-62 cpu` **The timed launches.** The loop queues 100 launches. The CPU finishes this loop long before the GPU finishes the kernels.
15. `63-67 cpu` **Stop and read the time.** Put the `stop` marker into the queue, wait for the GPU to reach it with `cudaEventSynchronize`, check for launch errors, then read the milliseconds between the markers. Forgetting the synchronize line is the classic mistake: the time is not ready yet.
16. `69-75 cpu` **Copy back and check.** Copy `c` back and count wrong elements. A fast kernel with wrong results is worth nothing, so always check.
17. `76-78 cpu` **Print the report.** The launch shape, the average time per launch in microseconds, and the error count.

</div>

## Compile and Run

```bash
nvcc -arch=sm_89 -o vector_add_blocks vector_add_blocks.cu
./vector_add_blocks 1024
./vector_add_blocks 32
./vector_add_blocks 1000
```

- `nvcc -arch=sm_89 ...`: compiles for the L40S, as in [Lesson 06](../Lesson-06/notes.md).
- `./vector_add_blocks 1024`: 2 blocks of 1024 threads.
- `./vector_add_blocks 32`: 64 blocks of 32 threads.
- `./vector_add_blocks 1000`: 3 blocks of 1000 threads, 3000 threads for 2048 elements. The bounds check stops the extra 952 threads.

## Output

This is the output of `./vector_add_blocks 1000`. The time is shown as `...`, because it depends on the GPU:

```
<<<3, 1000>>>: 3000 threads for 2048 elements
average time per launch: ... us
errors: 0
```

How to read it:

- `<<<3, 1000>>>`: the round-up formula gave 3 blocks.
- `3000 threads for 2048 elements`: 952 threads have nothing to do. The bounds check keeps them out of memory.
- `average time per launch`: your number goes here. Compare it across the three runs.
- `errors: 0`: all 2048 sums are right, even with a block size that does not divide 2048.

## Try It

1. **Make the job big.** Change `#define N 2048` to `#define N (1 << 24)`, which is 16,777,216 elements (64 MB per vector). Run with 32, 256 and 1024 threads per block. Now there is enough work to fill the GPU, and the block size starts to make a difference you can measure.
2. **Remove the guard.** Delete the `if (i < n)` line and its closing brace, compile, and run `compute-sanitizer ./vector_add_blocks 1000`. Compute Sanitizer reports the invalid global writes of the extra threads, even if the printed result looks fine.
3. **Break the timing on purpose.** Remove the `CHECK(cudaEventSynchronize(stop));` line and run again. The program should stop with a `CUDA error` from the `cudaEventElapsedTime` line, because the time is not ready.

## Write It Yourself

Write a kernel for SAXPY, a classic GPU test: `y[i] = a * x[i] + y[i]` for 5000 floats, with 256 threads per block. 5000 is not a multiple of 256, so you need the round-up and the guard.

1. Write the kernel with the global index and the bounds check.
2. Compute the number of blocks with the round-up formula.
3. Launch the kernel and copy `y` back.

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

??? tip "Hint"
    The index line is the same as in this lesson's kernel. For the grid, (5000 + 256 - 1) / 256 = 20 blocks, so 5120 threads and 120 extra threads that the guard must stop. Every `y[i]` should become 3 * 1 + 2 = 5.

??? note "Solution"
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

    Compile with `nvcc -arch=sm_89 -o saxpy saxpy.cu` and run `./saxpy`. You should see `y[0] = 5.0, y[4999] = 5.0, errors: 0`. If you forgot the guard, the result may still look right, but `compute-sanitizer ./saxpy` will report the writes of the 120 extra threads.

## Glossary

- global index: a thread's position in the whole grid, `blockIdx.x * blockDim.x + threadIdx.x`. It maps each thread to one element.
- grid size: the number of blocks in a launch, the first number in `<<<blocks, threads>>>`.
- round-up division: `(N + threads - 1) / threads`, the number of blocks needed so that `blocks * threads` is at least `N`.
- bounds check: `if (i < n)`, which stops the extra threads of a rounded-up grid from touching memory past the end.
- SM (Streaming Multiprocessor): the processor inside the GPU that runs blocks. A block runs on one SM; one SM can hold several blocks. The L40S has 142.
- `nvidia-smi` GPU utilization: the share of time in which a kernel was running. It does not tell how many SMs were busy.
- CUDA event (`cudaEvent_t`): a marker in the GPU's work queue. The GPU writes down the time when it reaches the marker.
- `cudaEventRecord`: puts an event marker into the queue. It returns at once.
- `cudaEventSynchronize`: makes the CPU wait until the GPU has reached a given event.
- `cudaEventElapsedTime`: the time in milliseconds between two recorded events.
- warm-up: an untimed first launch that absorbs one-time setup costs.
- launch overhead: the fixed time to hand a kernel to the GPU and start it. It dominates when the kernel itself is tiny.
- SAXPY (Single-precision A times X Plus Y): `y = a * x + y` on float vectors, a classic first GPU kernel.
- Compute Sanitizer: NVIDIA's tool that finds memory errors in kernels, such as writes past the end of an array.
