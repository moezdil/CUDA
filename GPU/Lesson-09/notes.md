# 09 > Compute or Memory Bound

Every kernel is held back by one of two things, how fast the GPU can do math or how fast it can move data. This lesson shows how to tell which one with a single number, arithmetic intensity, and a simple chart called the roofline. All examples use the NVIDIA L40S that runs the programs in these lessons.

## Two Limits on Every Kernel

A kernel needs two things to finish. It needs its math done by the cores, and it needs its data moved between memory and the cores.

Both take time, and both happen at the same time on a GPU. While some warps wait for data, others compute (see [Lesson 08](../Lesson-08/notes.md)). So the kernel takes about as long as the slower of the two.

- time for math = FLOPs / peak FLOPS
- time for data = bytes moved / memory bandwidth

Whichever is bigger sets the time. If the data part is bigger, the kernel is memory bound. If the math part is bigger, it is compute bound.

## Counting FLOPs

A FLOP is one add, subtract, multiply or divide on floating-point numbers. FLOPS is a speed, how many of them happen every second.

[Lesson 06](../Lesson-06/notes.md) showed where the peak comes from. It is cores × clock × 2, because one FMA counts as 2 FLOPs. For the L40S that gives 18,176 FP32 cores × 2.52 GHz × 2 ≈ 91.6 TFLOPS, which is the FP32 number on NVIDIA's spec sheet.

> [!NOTE]
> FLOPs with a lowercase s is a count of work. FLOPS with a capital S is a speed. A kernel that does 1,000 FLOPs on a GPU that reaches 91.6 TFLOPS needs at least 1,000 / 91.6 trillion seconds for its math.

To count the FLOPs of a kernel, count the math in one thread and multiply by the number of threads. `c[i] = a[i] + b[i]` is 1 FLOP per element. `y[i] = a * x[i] + y[i]` is 2 FLOPs per element, a multiply and an add.

## Counting Bytes

Bytes moved means the bytes that travel between GPU memory and the chip. One `float` is 4 bytes. Count every value a thread reads from memory and every value it writes back.

For `c[i] = a[i] + b[i]` each thread reads `a[i]` and `b[i]` and writes `c[i]`, so 3 floats × 4 bytes = 12 bytes per element.

The speed limit for this side is the memory bandwidth from [Lesson 06](../Lesson-06/notes.md). The L40S has 48 GB of GDDR6 memory with a bandwidth of 864 GB/s.

## Arithmetic Intensity

Put the two counts together and you get the most useful number in this lesson.

arithmetic intensity = FLOPs / bytes moved

It is measured in FLOP/byte and says how much math a kernel does for every byte it brings in. It depends only on the kernel, not on the GPU. A kernel with low intensity spends most of its time waiting for data. A kernel with high intensity reuses each byte many times.

Vector add has 1 FLOP per 12 bytes, so 1 / 12 ≈ 0.083 FLOP/byte. That is very low.

## The Ridge Point

The GPU has its own number to compare against. Divide peak FLOPS by memory bandwidth.

ridge point = peak FLOPS / memory bandwidth

For the L40S that is 91,600 GFLOPS / 864 GB/s ≈ 106 FLOP/byte. To keep its FP32 cores busy, a kernel must do about 106 FLOPs for every byte it loads. With less, the cores wait for memory.

> [!TIP]
> The quick test is to compare the kernel's arithmetic intensity with the GPU's ridge point. Below the ridge point it is memory bound, above it is compute bound.

Different GPUs have very different ridge points.

| GPU | Peak FP32 | Bandwidth | Ridge point |
|---|---|---|---|
| L40S | 91.6 TFLOPS | 864 GB/s | ≈ 106 FLOP/byte |
| H100 SXM | 67 TFLOPS | 3,350 GB/s | ≈ 20 FLOP/byte |
| RTX 5090 | 104.8 TFLOPS | 1,792 GB/s | ≈ 58 FLOP/byte |

The H100 has far more bandwidth for its FP32 compute, so even fairly light kernels reach its FP32 roof. The L40S has a lot of FP32 compute but GDDR6 memory, so many kernels hit its memory limit first.

## The Roofline Model

The roofline model draws all of this as one chart. The x axis is arithmetic intensity, the y axis is attainable GFLOPS. Both axes are logarithmic, so each step is a multiple.

attainable GFLOPS = min(peak GFLOPS, arithmetic intensity × bandwidth)

The chart has two lines that meet at the ridge point. On the left is a slanted line, bandwidth × intensity, which is the memory roof. On the right is a flat line, the peak, which is the compute roof. A kernel is a dot under the roof. It can never go above it.

<roofline-chart></roofline-chart>

Pick a GPU and a kernel. A dot on the slanted part is memory bound, a dot on the flat part is compute bound.

## Vector Add in Numbers

Take vector add on the L40S with 100 million floats per array (N = 100,000,000).

- 1 FLOP per element, so 100,000,000 FLOPs.
- 12 bytes per element, so 1,200,000,000 bytes = 1.2 GB.
- The math takes 100,000,000 / 91.6 trillion ≈ 0.0011 ms (about 1.1 µs).
- The data takes 1.2 GB / 864 GB/s ≈ 1.39 ms.

The data part is about 1,270 times longer. The roofline gives the same answer, 0.083 × 864 ≈ 72 GFLOPS attainable, under 0.1% of the 91,600 GFLOPS peak. Vector add is deeply memory bound on every GPU. It is the program from the vector addition lesson in the CUDA Practice track ([CUDA Lesson 08](../../cuda/Lesson-08/notes.md)).

## SAXPY and Dot Product in Numbers

SAXPY computes `y[i] = a * x[i] + y[i]`. Per element it does 2 FLOPs (one FMA) and moves 12 bytes, because it reads `x[i]` and `y[i]` and writes `y[i]`. Its arithmetic intensity is 2 / 12 ≈ 0.167 FLOP/byte, so on the L40S 0.167 × 864 ≈ 144 GFLOPS are attainable.

A dot product computes `s += x[i] * y[i]` over two arrays. Per element it does 2 FLOPs and reads 8 bytes, with nothing written per element. Its arithmetic intensity is 2 / 8 = 0.25 FLOP/byte, so on the L40S 0.25 × 864 = 216 GFLOPS are attainable.

Both are a little better than vector add, and both are still far below the ridge point of 106. They are memory bound. Doing the math faster would not change their time at all.

## Matrix Multiply in Numbers

A matrix multiply `C = A × B` of two N × N matrices is different. Every element of C is a sum of N products, so it takes N multiplies and N adds.

- The FLOPs are N × N elements × 2N = 2N³.
- If each matrix travels only once, A and B are read and C is written, so the bytes are 3 × N² floats × 4 bytes = 12N².
- The arithmetic intensity is 2N³ / 12N² = N / 6.

The intensity grows with N, because each loaded number is used N times. Here is N = 4,096.

- The FLOPs are 2 × 4,096³ = 137,438,953,472 (about 137 billion).
- The bytes are 12 × 4,096² = 201,326,592 (about 201 MB).
- The arithmetic intensity is 4,096 / 6 ≈ 683 FLOP/byte.

683 is far above 106, so on the L40S this matrix multiply is compute bound. The math takes 137.4 billion / 91.6 trillion ≈ 1.5 ms and the data takes 201 MB / 864 GB/s ≈ 0.23 ms. For N = 256 the intensity is only 256 / 6 ≈ 43, which is memory bound on the L40S (ridge 106) but compute bound on the H100 (ridge 20).

> [!WARNING]
> N / 6 is the best case, where every matrix crosses memory once. A naive kernel loads the same rows and columns again and again and moves far more bytes, which pulls its real intensity down. Reusing data from on-chip memory, such as shared memory and caches ([Lesson 07](../Lesson-07/notes.md)), is what lets a real kernel get close to N / 6.

## What the Result Means

The answer tells you where to spend your effort.

- A memory bound kernel needs better data movement. Read each byte once, read it in large aligned chunks for coalesced access, keep reused data in shared memory or registers, use smaller number formats so fewer bytes travel, and fuse kernels so data is not written out and read back in between.
- A compute bound kernel needs better math. Use Tensor Cores, use cheaper formats where accuracy allows, and remove work that does not need to happen.

Optimizing the wrong side does nothing. Making vector add do its math twice as fast leaves its time at about 1.39 ms, because the math was never the limit.

## A Higher Roof with Tensor Cores

The roofs above are FP32 on the regular cores. Tensor Cores give a much higher compute roof for matrix math. The L40S reaches 362 TFLOPS in FP16 on its Tensor Cores without sparsity, about 4 times its FP32 peak. With the same 864 GB/s, the ridge point moves up to about 362,000 / 864 ≈ 419 FLOP/byte.

A higher roof only helps kernels that are compute bound. Vector add stays at 72 GFLOPS whatever the roof. [Lesson 10](../Lesson-10/notes.md) explains number formats and Tensor Cores.

## Why This Matters for CUDA

Before you tune a kernel, count its FLOPs and bytes. One line of arithmetic tells you whether to work on memory access or on math, and how far the kernel is from the best this GPU can do.

Most simple kernels you write first, such as vector add, scaling, copying and reductions, are memory bound. For those, the goal is to reach the memory bandwidth, not the TFLOPS. A vector add that moves its 1.2 GB at close to 864 GB/s is already a very good kernel, even though it uses less than 0.1% of the peak FLOPS.

## Glossary

- GPU (Graphics Processing Unit): the processor this track is about, built from many cores that work in parallel.
- kernel: a function that runs on the GPU, one copy per thread.
- warp: a group of 32 threads that run together. While some warps wait for data, others compute.
- memory bound: a kernel whose time is set by moving data, not by math. It sits on the slanted part of the roofline.
- compute bound: a kernel whose time is set by math, not by moving data. It sits on the flat part of the roofline.
- FLOP (floating-point operation): one add, subtract, multiply or divide on floating-point numbers. FLOPs with a lowercase s counts them.
- FLOPS (floating-point operations per second): a speed. GFLOPS is billions and TFLOPS trillions of FLOPs every second.
- FMA (fused multiply-add): one instruction that computes a × b + c and counts as 2 FLOPs.
- FP32 (32-bit floating point): the standard number format for GPU math, where one `float` is 4 bytes.
- peak FLOPS: cores × clock × 2, which for the L40S is 91.6 TFLOPS in FP32.
- bytes moved: the bytes that travel between GPU memory and the chip, counting every read and every write.
- memory bandwidth: how many bytes per second memory can deliver, 864 GB/s on the L40S.
- GB/s (gigabytes per second): billions of bytes moved every second, the unit of memory bandwidth.
- GDDR6 (Graphics Double Data Rate 6): the memory type on the L40S, slower than the HBM (High Bandwidth Memory) of data center GPUs like the H100.
- arithmetic intensity: FLOPs divided by bytes moved, in FLOP/byte. It depends on the kernel, not the GPU.
- ridge point: peak FLOPS divided by memory bandwidth, about 106 FLOP/byte on the L40S and 20 on the H100 SXM.
- roofline model: a log-log chart of attainable FLOPS against arithmetic intensity, with a slanted memory roof and a flat compute roof.
- attainable GFLOPS: the most a kernel can reach, min(peak, intensity × bandwidth).
- vector add: `c[i] = a[i] + b[i]`, 1 FLOP per 12 bytes.
- SAXPY (Single-precision A times X Plus Y): `y[i] = a * x[i] + y[i]`, 2 FLOPs per 12 bytes.
- dot product: the sum of `x[i] * y[i]` over two arrays, 2 FLOPs per 8 bytes.
- matrix multiply: `C = A × B`, which does 2N³ FLOPs over at least 12N² bytes for N × N FP32 matrices, so intensity N / 6.
- shared memory: fast on-chip memory that the threads of one block share. It lets a kernel reuse data instead of loading it again.
- coalesced access: neighbouring threads reading neighbouring addresses, so memory serves them in a few large transfers.
- reduction: combining many values into one, such as a sum or a maximum.
- Tensor Cores: units built for matrix math with a much higher roof, 362 TFLOPS in FP16 on the L40S without sparsity.
- FP16 (16-bit floating point): a 2-byte number format that Tensor Cores run far faster than FP32 cores run FP32.
- sparsity: a Tensor Core feature that skips zeros in a fixed pattern. Spec sheets often quote numbers with it, which are twice the dense numbers.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
