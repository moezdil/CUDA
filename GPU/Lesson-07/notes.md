# 07 > The Memory Hierarchy

A GPU (Graphics Processing Unit) does not have one memory. It has a ladder of them: a few tiny, very fast ones close to the cores and one huge, slow one far away. This lesson walks down that ladder on the L40S, shows who can see each level and how big and fast it is, and counts how much data fits where.

## One Ladder, Three Questions

[Lesson 00](../Lesson-00/notes.md) introduced registers, shared memory and the L2 cache, and [Lesson 06](../Lesson-06/notes.md) showed why memory bandwidth limits a GPU. This lesson puts all of them in order. That order is called the memory hierarchy.

For every level, ask three questions:

- Where is it? Inside an SM (Streaming Multiprocessor), elsewhere on the GPU chip, or on separate memory chips next to it.
- Who can see it? One thread, one block (all threads of a thread block), or the whole GPU (every thread of every block).
- How big and how fast is it? Small levels are fast, big levels are slow. No level is both big and fast.

Speed comes in two flavors. Bandwidth is how many bytes per second a level can deliver. Latency is how long one load waits before its data arrives, counted in clock cycles (ticks of the GPU clock).

<mem-hierarchy></mem-hierarchy>

## Registers

Registers sit inside each SM, right next to the cores. Each thread gets its own registers for its local variables, and no other thread can read them. Using a register costs no extra wait: the core reads it as part of the instruction.

The register file of one L40S SM holds 65,536 registers of 32 bits, which is 256 KB (kilobytes). One thread can use at most 255 of them. The H100 has the same 256 KB per SM.

> [!NOTE]
> Added up over the chip, registers are not small. The L40S has 142 SMs × 256 KB = 36,352 KB of registers, about 35.5 MB (megabytes), more than its 142 × 100 KB = 14,200 KB of shared memory.

## Shared Memory and L1

Each SM also has one pool of fast on-chip memory, split between two jobs:

- shared memory, which a kernel manages by hand. All threads of one block can read and write it, so they use it to share data. Threads of other blocks cannot see it.
- the L1 cache (Level 1 cache), which the hardware manages. It keeps recently loaded global memory data close to the SM, so a second load of the same data is fast.

On the L40S, a CC (compute capability) 8.9 GPU, the pool is 128 KB per SM. A kernel picks the split, called the carveout: 0, 8, 16, 32, 64 or 100 KB of shared memory, the rest is L1. CUDA (Compute Unified Device Architecture) keeps 1 KB per block for itself, so one block can use at most 99 KB. On the H100 the pool is 256 KB per SM, with up to 228 KB of shared memory.

Published microbenchmarks on an RTX 4090, which uses the same AD102 chip as the L40S, measured about 30 cycles for a shared memory load and about 43 cycles for an L1 hit.

## L2 Cache

The L2 cache (Level 2 cache) sits on the GPU chip but outside the SMs. All SMs share it, so it serves the whole GPU. Every read from and write to global memory passes through it.

The L40S has 96 MB of L2. The H100 has 50 MB. The same microbenchmarks measured about 273 cycles for an L2 hit on the RTX 4090, roughly 9 times a shared memory load.

## Global Memory

Global memory is the GPU's main memory, the 48 GB of VRAM (GPU memory) on the L40S. It lives on separate memory chips, so every thread of every block can reach it, and the CPU (Central Processing Unit) copies data in and out of it. Data in global memory also stays there between kernel launches.

On the L40S it is GDDR6 (Graphics Double Data Rate 6) at 864 GB/s (gigabytes per second). The H100 SXM has 80 GB of HBM3 (High Bandwidth Memory 3) at 3.35 TB/s (terabytes per second). Global memory is the slowest level: about 541 cycles per load on the RTX 4090, twice an L2 hit and about 18 times a shared memory load.

## Constant and Texture Memory

Two special views of global memory have their own small caches.

Constant memory is 64 KB of read-only data. Each SM caches 8 KB of it. When every thread of a warp (a group of 32 threads that run together) reads the same address, one read is broadcast to all 32. When they read different addresses, the reads are done one after another.

Texture memory is a read-only path through the L1 cache, built for graphics, where nearby threads read nearby pixels. On Ada and Hopper the texture cache and L1 are one unit, so most CUDA code simply reads global memory and lets L1 cache it.

## Local Memory and Register Spills

Local memory is private to one thread, like a register, but it lives in global memory. It is cached in L1 and L2, but a miss costs as much as any global memory load. Each thread can use up to 512 KB of it.

The compiler puts data in local memory when registers run out. This is called a register spill. It also happens for an array that a thread indexes with a value known only at run time, because registers cannot be indexed that way.

> [!WARNING]
> "Local" means private, not close. Local memory is off-chip and as slow as global memory. Compile with `-Xptxas -v` and the compiler reports each kernel's registers and its spill stores and spill loads in bytes.

## At a Glance

| Level | Where | Who sees it | L40S | H100 SXM | Load wait (cycles) |
|---|---|---|---|---|---|
| Registers | inside each SM | one thread | 256 KB per SM | 256 KB per SM | none |
| Shared memory | inside each SM | one block | up to 100 KB per SM | up to 228 KB per SM | about 30 |
| L1 cache | inside each SM | one SM | rest of 128 KB | rest of 256 KB | about 43 |
| L2 cache | on the chip | whole GPU | 96 MB | 50 MB | about 273 |
| Global memory | memory chips | whole GPU | 48 GB GDDR6 | 80 GB HBM3 | about 541 |

The cycles were measured on an RTX 4090. An H800, a Hopper GPU like the H100, measured almost the same: 29, 41, 263 and 479 cycles.

## Worked Example: What Fits Where

A float (a 32-bit floating point number) takes 4 bytes. In CUDA's tables 1 KB is 1,024 bytes and 1 MB is 1,024 KB.

One L40S SM has up to 100 KB of shared memory:

- 100 × 1,024 = 102,400 bytes.
- 102,400 / 4 = 25,600 floats.
- A 32 × 32 tile of floats is 32 × 32 × 4 = 4,096 bytes = 4 KB, so 100 / 4 = 25 such tiles fit in one SM.
- One block can use at most 99 KB: 99 × 1,024 / 4 = 25,344 floats.

On the H100, 228 KB per SM holds 228 × 1,024 / 4 = 58,368 floats, more than twice as many.

The L40S L2 cache holds 96 MB:

- 96 × 1,024 × 1,024 = 100,663,296 bytes.
- 100,663,296 / 4 = 25,165,824 floats, about 25.2 million.
- A 5,000 × 5,000 matrix of floats is 25,000,000 floats, so it just fits. A 6,000 × 6,000 matrix (36,000,000 floats) does not.

> [!TIP]
> Registers are shared among all threads on an SM. To run the full 1,536 threads on one L40S SM, each thread gets 65,536 / 1,536 ≈ 42.7 registers. The hardware hands out registers to each warp in chunks of 256, so the real limit is 40 per thread: 40 × 32 = 1,280 = 5 chunks, and 48 warps × 1,280 = 61,440 fits in 65,536.

## Why This Matters for CUDA

When you write a kernel, you pick the level for each piece of data:

- Plain local variables go to registers. Keep them few, or they spill to local memory and run as slowly as global memory.
- Data that the threads of a block read many times goes to shared memory, declared with `__shared__`. Load it from global memory once, then reuse it at about 30 cycles instead of about 541.
- Big arrays live in global memory. Read them so that the 32 threads of a warp touch neighboring addresses; then L1 and L2 can serve them in a few wide transactions.

A load from global memory takes hundreds of cycles. A GPU hides that wait by switching to other warps, which is the topic of [Lesson 08](../Lesson-08/notes.md). [Lesson 09](../Lesson-09/notes.md) then shows how to tell whether a kernel is limited by its math or by its memory.

## Glossary

- GPU (Graphics Processing Unit): the processor this track is about, built from many SMs that run threads in parallel.
- CPU (Central Processing Unit): the main processor of the computer; it copies data into and out of global memory.
- memory hierarchy: the ladder of GPU memories, from small and fast registers to big and slow global memory.
- SM (Streaming Multiprocessor): a processing unit inside the GPU with its own cores, registers, shared memory and L1 cache; the L40S has 142.
- thread: one stream of instructions; each thread has its own registers and local memory.
- block: a group of threads that runs on one SM and can share data through shared memory.
- warp: a group of 32 threads that the SM runs together.
- kernel: a function that runs on the GPU, launched over many threads.
- bandwidth: how many bytes per second a memory level can deliver.
- latency: how long one load waits before its data arrives.
- clock cycle: one tick of the GPU clock; latencies on this page are counted in cycles.
- register: the fastest storage, private to one thread; an L40S SM has 65,536 of 32 bits.
- register file: all the registers of one SM, 256 KB on the L40S and on the H100.
- KB (kilobyte) / MB (megabyte): 1,024 bytes and 1,024 KB in CUDA's tables.
- on-chip: built into the GPU chip itself, like registers, shared memory, L1 and L2.
- shared memory: fast on-chip memory in each SM that all threads of one block can read and write.
- L1 cache (Level 1 cache): the hardware-managed part of each SM's on-chip pool that keeps recently used data close.
- carveout: how the on-chip pool is split between shared memory and L1, chosen per kernel.
- CC (compute capability): the version number of a GPU's features; the L40S is CC 8.9.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
- microbenchmark: a tiny test program that measures one thing, such as the latency of one memory level.
- L2 cache (Level 2 cache): the on-chip cache that all SMs share; 96 MB on the L40S, 50 MB on the H100.
- global memory: the GPU's main memory, visible to every thread and to copies from the CPU; the slowest level.
- VRAM (GPU memory): the memory chips on a GPU card that hold global memory.
- GDDR6 (Graphics Double Data Rate 6): the memory type of the L40S, 48 GB at 864 GB/s.
- HBM3 (High Bandwidth Memory 3): stacked memory in the same package as the GPU chip; the H100 SXM has 80 GB at 3.35 TB/s.
- GB/s (gigabytes per second) / TB/s (terabytes per second): units of bandwidth.
- constant memory: 64 KB of read-only data with an 8 KB cache in each SM; fast when a whole warp reads one address.
- broadcast: one read whose value goes to all 32 threads of a warp at once.
- texture memory: a read-only path through the L1 cache, built for graphics.
- local memory: per-thread memory that lives in global memory; up to 512 KB per thread.
- register spill: moving data from registers to local memory because registers ran out.
- float: a 32-bit floating point number, 4 bytes.
- tile: a small square piece of a bigger array, loaded into shared memory to be reused.
