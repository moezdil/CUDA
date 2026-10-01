# Lesson 08: Vector Addition

Lessons 00 to 07 launched kernels that only printed their IDs. This lesson builds the first CUDA (Compute Unified Device Architecture) program that does real work on data: it adds two vectors of 1024 numbers on the GPU (Graphics Processing Unit). Along the way you meet the six steps that almost every CUDA program follows, from allocating memory to freeing it.

> [!NOTE]
> The code targets CUDA 13 on Ubuntu 24 and the NVIDIA L40S (`sm_89`) from the earlier lessons. Its output has not been captured on that machine yet. The output shown below is the expected result, worked out from the inputs. The program checks its own result, so you can run it on any NVIDIA GPU and see if it worked.

## The Task

Take two vectors, `a` and `b`. Each one holds 1024 whole numbers, at indices 0 to 1023. The goal is a third vector, `c`, where every element is the sum of the two elements at the same index:

```
c[0]    = a[0]    + b[0]
c[1]    = a[1]    + b[1]
...
c[1023] = a[1023] + b[1023]
```

This is called an element-wise operation. Each sum only needs its own two inputs. No sum has to wait for another one. That makes vector addition a perfect first job for a GPU.

## On the CPU: One Element at a Time

On the CPU (Central Processing Unit), in plain C, you write a loop:

```c
for (int i = 0; i < 1024; i++) {
    c[i] = a[i] + b[i];
}
```

The loop runs 1024 rounds, one after another. Round 500 cannot start before round 499 is done, even though the two rounds have nothing to do with each other. The work could run in parallel, but a plain loop never runs it that way.

## On the GPU: One Thread per Element

On the GPU, you remove the loop. Instead, you launch as many threads as there are elements and give each thread one index.

Start with the simplest launch: 1 block of 1024 threads, `<<<1, 1024>>>`. The block ID is always 0, so it tells you nothing here. The thread IDs go from 0 to 1023. Those are exactly the indices of the vectors. So thread 0 takes element 0, thread 1 takes element 1, and thread 1023 takes the last one.

<cuda-launch blocks="1" threads="1024" fn="vectorAdd"></cuda-launch>

Every thread runs the same single line, `c[i] = a[i] + b[i]`. Only `i` is different. The GPU spreads the 1024 threads over its cores, 32 at a time in warps (see [Lesson 07](../Lesson-07/notes.md)), and runs them in parallel. This idea, one instruction for many threads with different data, is the heart of CUDA. It is called SIMT (Single Instruction, Multiple Threads), as in [Lesson 01](../Lesson-01/notes.md).

Compare the two ways with 16 elements. The CPU loop needs 16 steps, one per element. The GPU threads fill all 16 elements in one step:

<vector-add n="16"></vector-add>

> [!NOTE]
> "One step" is the idea, not an exact timing. One block runs on one SM (Streaming Multiprocessor). The SM holds all 32 warps of this block at once and runs them in quick turns, so no thread waits for a loop to reach its index. The copies to and from the GPU also take time, as the six steps below show.

## The Kernel

```c
__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}
```

- `__global__`: marks `vectorAdd` as a kernel. The CPU launches it and the GPU runs it.
- `const int *a, const int *b`: the two input vectors. `const` means the kernel only reads them.
- `int *c`: the output vector. The kernel writes the sums here.
- `int n`: the number of elements, here 1024.
- `int i = threadIdx.x;`: each thread reads its own ID. This is its element index.
- `if (i < n)`: a bounds check. With exactly 1024 threads it never fails. It starts to matter when the vector size does not match the thread count, which is the topic of the next lesson. Writing it from day one is a good habit.
- `c[i] = a[i] + b[i];`: the actual work. One addition per thread.

You could write `c[threadIdx.x] = a[threadIdx.x] + b[threadIdx.x];` in one line. A separate `i` is easier to read, and it is easy to extend later, when the index also needs the block ID.

## Host and Device Memory

The CPU and the GPU each have their own memory. In CUDA, the CPU side is called the host, and the GPU side is called the device. A kernel can only read device memory. The CPU can only read host memory. So data has to be copied between them on purpose.

The code keeps the two sides apart by name: `h_a` lives on the host, `d_a` lives on the device. This `h_` and `d_` prefix is a common convention, and it saves you from passing a CPU pointer to a kernel by mistake.

> [!TIP]
> CUDA also has unified memory (`cudaMallocManaged`), where one pointer works on both sides and the driver moves the data for you. It is handy, but it hides what happens. This lesson does every copy by hand, so you can see each step.

## The Six Steps

Almost every CUDA program follows the same six steps:

1. Allocate memory on the host and on the device.
2. Fill the inputs on the host.
3. Copy the inputs from the host to the device.
4. Launch the kernel.
5. Copy the result from the device back to the host.
6. Free the memory on both sides.

Steps 2 and 6 also exist in a normal C program. Steps 1, 3, 4 and 5 are where CUDA comes in. Step through them to see each array appear on the host or the device, get copied, and disappear again:

<host-device-flow></host-device-flow>

## Code

The whole program is in `code/vector_add.cu`:

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

### The setup lines

- `#include <stdlib.h>`: needed for `malloc`, `free` and `exit`.
- `#define N 1024`: the vector size, defined once at the top. To try another size, change only this line.
- `CHECK(...)`: almost every CUDA function returns an error code. A failed call does not stop the program by itself. It just keeps going with bad data ([Lesson 02](../Lesson-02/notes.md) showed a launch that failed without a word). `CHECK` looks at the code, and if it is not `cudaSuccess`, it prints the reason with the file and line, then stops.
- `size_t bytes = N * sizeof(int);`: memory functions count bytes, not elements. 1024 numbers of 4 bytes each are 4096 bytes.

### Step 1: allocate

- `malloc(bytes)`: reserves memory on the host, as in normal C.
- `cudaMalloc(&d_a, bytes)`: reserves memory on the device. It takes the address of the pointer, `&d_a`, because it writes the new GPU address into it.

### Step 2: fill the inputs

- `h_a[i] = i;`: `a` gets 0, 1, 2, ... 1023.
- `h_b[i] = N - i;`: `b` gets 1024, 1023, 1022, ... 1.

This choice makes the result easy to check by eye: every sum is `i + (1024 - i)`, so every element of `c` must be 1024. `c` is not filled, because the kernel writes it.

### Step 3: copy to the device

- `cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice)`: copies `bytes` bytes from `h_a` to `d_a`. The order is always destination first, then source, like `memcpy` in C. The last argument names the direction: host to device.
- `c` is not copied, because it holds no input.

### Step 4: launch

- `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);`: the kernel name, the launch config (1 block, 1024 threads), then the arguments. All pointers passed to the kernel are `d_` pointers.
- `CHECK(cudaGetLastError());`: a launch returns nothing, so you ask afterwards if it was accepted. A bad config, such as more than 1024 threads per block, shows up here.

### Step 5: copy the result back

- `cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost)`: the same function as in step 3, but the direction is turned around. Compare the two: there, `h_` came second. Here, `h_` comes first, because the host is now the destination.
- There is no `cudaDeviceSynchronize()` here, unlike [Lesson 06](../Lesson-06/notes.md). This `cudaMemcpy` waits on its own until the kernel has finished, because it cannot copy a result that does not exist yet.

### The check

- The first loop compares every element with the CPU sum and counts the mistakes. Printing 1024 lines and reading them by eye does not scale. Letting the program check itself does.
- The other lines print the first four sums and the last one, which is enough to see the pattern.

### Step 6: free

- `cudaFree(d_a)`: gives the device memory back. GPU memory is not freed for you while the program runs, so a long program that forgets this keeps eating GPU memory.
- `free(h_a)`: gives the host memory back, as in normal C. The names match on purpose: `cudaFree` for `cudaMalloc`, `free` for `malloc`.

## Compile and Run

```bash
nvcc -arch=sm_89 -o vector_add vector_add.cu
./vector_add
```

- `nvcc` is the CUDA compiler.
- `-arch=sm_89` builds for the L40S. On another GPU, use its own compute capability, for example `-arch=sm_80` for CC (compute capability) 8.0 (see [Lesson 03](../Lesson-03/notes.md) and [Lesson 06](../Lesson-06/notes.md)).
- `-o vector_add` names the program.
- `./vector_add` runs it from the current folder.

## Output

This is the expected output. It follows from the inputs set in step 2 and has not been captured on the L40S yet.

```
0 + 1024 = 1024
1 + 1023 = 1024
2 + 1022 = 1024
3 + 1021 = 1024
...
1023 + 1 = 1024
errors: 0
```

How to read it:

- Each line is `a[i] + b[i] = c[i]`. The first four lines are indices 0 to 3, the `...` line is printed by the program itself, and the last sum line is index 1023.
- Every sum is 1024, as planned in step 2. For index 3: `a[3] = 3`, `b[3] = 1024 - 3 = 1021`, and 3 + 1021 = 1024.
- `errors: 0` tells you all 1024 elements are right, not only the five on screen.
- If you see `CUDA error:` instead, the message names the call that failed, the file and the line.

## Try It

> [!WARNING]
> Set `N` to 2048 and run again. A block cannot have more than 1024 threads, so the launch is rejected, and `CHECK(cudaGetLastError())` should stop the program with `CUDA error: invalid configuration argument`. Without that check, the kernel never runs but the program keeps going: it copies back device memory the kernel never wrote, and should report a large error count. The fix is to use more than one block, which is the next lesson.

## Glossary

- CUDA (Compute Unified Device Architecture): NVIDIA's platform for running general programs on the GPU.
- vector addition: adding two vectors element by element, `c[i] = a[i] + b[i]`.
- SIMT (Single Instruction, Multiple Threads): many threads run the same instruction, each on its own data.
- element-wise: each output element depends only on the input elements at the same index. Such work runs well in parallel.
- host: the CPU (Central Processing Unit) and its memory.
- device: the GPU (Graphics Processing Unit) and its memory.
- `h_` / `d_`: a naming habit. `h_a` points to host memory, `d_a` to device memory.
- `cudaMalloc`: reserves memory on the device.
- `cudaMemcpy`: copies bytes between host and device. Destination first, then source, then size, then direction.
- `cudaMemcpyHostToDevice` / `cudaMemcpyDeviceToHost`: the direction of a copy.
- `cudaFree`: gives device memory back.
- `cudaGetLastError`: tells you if the last kernel launch was accepted.
- bounds check: `if (i < n)`, so a thread never reads or writes past the end of a vector.
- unified memory: memory from `cudaMallocManaged` that both sides can use with one pointer.
