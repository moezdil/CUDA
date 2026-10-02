# 00 > CPU vs GPU Basics

This lesson explains how a GPU (Graphics Processing Unit) differs from a CPU (Central Processing Unit). It also opens up a GPU and shows the parts inside it. Every later lesson builds on these ideas.

## Moving Code to the GPU Is Not Enough

Running code on a GPU instead of a CPU does not make it fast by itself. You get good performance only when you understand how the GPU works.

## Different Goals

CPUs and GPUs both process data and run instructions. But they are built for very different goals.

A CPU is built for:

- fast response  
- complex logic  
- sequential execution (one step after another)  

A GPU is built to process many things at the same time.

- CPU: one complex task, done very fast  
- GPU: many simple tasks, done in parallel  

## Memory

A CPU uses system RAM (Random Access Memory). Everything goes through the same shared memory space.

A GPU has its own memory, called VRAM (the GPU's own RAM). Gaming cards use GDDR (Graphics Double Data Rate) memory, and data center GPUs use HBM (High Bandwidth Memory). This means:

- CPU and GPU do not share data automatically  
- data must be copied between them  

This copy can become a bottleneck. Take the NVIDIA L40S, which reads its own 48 GB of GDDR6 at 864 GB/s and talks to the CPU over PCIe 4.0 x16 at about 32 GB/s in each direction. Moving 1 GB over PCIe takes 1 / 32 = 0.031 s, about 31 ms. Reading the same 1 GB from VRAM takes 1 / 864 = 0.0012 s, about 1.2 ms. The copy is 864 / 32 = 27 times slower.

> [!WARNING]
> Copying data between CPU and GPU is often the slowest step of a GPU program. Copy once, do a lot of work on the GPU, and copy the results back once.

## Cache and Shared Memory

A cache is a small, very fast memory close to the processor. Both CPUs and GPUs have caches, but they use them differently.

> [!NOTE]
> CPUs rely on several cache levels: L1, L2 and L3. These are small but very fast.

GPUs also have cache. They add one more thing called shared memory. Threads inside the GPU use it to work together and share data. Shared memory is one of the key tools for GPU optimization.

## Core Speed

A GPU is not stronger because each core is faster. A single CPU core usually runs at a higher clock speed: a desktop CPU core often boosts to 5 GHz (gigahertz) or more. A GPU core is slower: the GeForce RTX 5090, a top gaming GPU from 2025, boosts to 2.41 GHz. In a one-core against one-core test, the CPU wins.

## Where GPU Power Comes From

A GPU has many simple cores. It splits the work into many small parts and runs them at the same time. Its power comes from the number of cores working together, not from the strength of each one.

For example, the L40S has 142 SMs with 128 cores each, so 142 * 128 = 18,176 cores. A 16-core desktop CPU has 18,176 / 16 = 1,136 times fewer cores. Even if each CPU core runs twice as fast, that cannot close a gap of more than a thousand.

GPUs are only better when a problem can be split into parallel parts. For a sequential task, a CPU can easily be faster than a GPU.

<cpu-vs-gpu></cpu-vs-gpu>

## How CPU and GPU Work Together

The GPU does not work alone. In a typical system:

- the CPU manages the program  
- the GPU runs the parallel work  

They talk through a connection such as PCIe (PCI Express). The data flow looks like this:

CPU → sends data to GPU  
GPU → processes it  
GPU → sends results back  

If this flow is handled badly, performance drops.

## The Streaming Multiprocessor (SM)

The most important unit inside a GPU is the SM (Streaming Multiprocessor). An SM is a small processing unit. A GPU is many SMs working together.

Each SM has everything needed to run parallel work:

- registers, the fastest storage available  
- shared memory, where threads exchange data  
- control units that decide what runs and when  
- execution units that do the actual work  

## Execution Units

Each SM has different types of compute units. Each type is specialized:

- floating-point units, used a lot in graphics and AI (artificial intelligence)  
- integer units  
- Tensor Cores, for matrix math, which is critical for AI  
- special function units (SFU), for more complex math  
- load/store units, which move data between memory and compute units  

So a GPU is not just "many cores". It is a structured system of specialized units.

> [!TIP]
> When a spec sheet says "18,176 CUDA cores", it counts only the floating-point units. The Tensor Cores and the other units are listed separately. [Lesson 03](../Lesson-03/notes.md) shows how to read these numbers.

## L2 Cache

L2 cache is a cache layer for the whole GPU. It is not tied to one SM like L1 or shared memory. It is larger but slower. It helps reduce the cost of memory access.

<gpu-anatomy></gpu-anatomy>

## Why This Matters

CUDA (Compute Unified Device Architecture) is not only about writing code. It is about understanding the hardware. To use a GPU well, you need to know:

- how memory works  
- how parallel execution works  
- how data moves  

GPU programming means thinking in parallel. This idea is the base for everything that follows in CUDA.

## Glossary

- GPU (Graphics Processing Unit): a processor with thousands of simple cores, built to run many tasks in parallel.
- CPU (Central Processing Unit): the main processor of a computer, built for fast response, complex logic and sequential work.
- sequential execution: running steps one after another, where each step waits for the one before it.
- parallel: many tasks running at the same time instead of one after another.
- system RAM (Random Access Memory): the computer's main memory on the motherboard, used by the CPU.
- VRAM: the GPU's own memory, separate from the system RAM the CPU uses.
- GDDR (Graphics Double Data Rate): the memory type on gaming and many workstation GPUs, such as GDDR6 on the L40S.
- HBM (High Bandwidth Memory): stacked memory on data center GPUs, much faster than GDDR.
- bottleneck: the slowest step in a chain, which limits the speed of the whole chain.
- L40S: an NVIDIA data center GPU (Ada Lovelace architecture) with 142 SMs, 18,176 cores and 48 GB of GDDR6.
- cache: a small, very fast memory close to the processor.
- L1 cache (L1): the smallest and fastest cache level, right next to a core (on a GPU, inside each SM).
- shared memory: GPU memory that threads use to work together and share data.
- thread: one stream of instructions; a GPU runs thousands of threads at the same time.
- core: one processing unit that runs instructions; a CPU has a few strong ones, a GPU thousands of simple ones.
- clock speed: how fast a single core runs, often several GHz on a CPU.
- GHz (gigahertz): one billion clock cycles per second, so a 3 GHz core ticks 3 billion times a second.
- PCIe (PCI Express): a connection the CPU and GPU use to send data to each other; PCIe 4.0 x16 moves about 32 GB/s in each direction.
- SM (Streaming Multiprocessor): the most important processing unit inside a GPU, and a GPU is many SMs.
- register: the fastest storage in an SM; each thread keeps its own variables in registers.
- floating-point unit: a unit that does math on numbers with a decimal point, such as 3.14; spec sheets call these CUDA cores.
- AI (artificial intelligence): software that learns from data; training and running it is mostly matrix math.
- Tensor Core: a compute unit inside an SM built for matrix math, which is critical for AI.
- special function unit (SFU): a unit that computes sine, cosine, square root and similar functions in hardware.
- load/store unit: a unit that moves data between memory and the compute units.
- L2 cache: a larger but slower cache for the whole GPU, not tied to one SM.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing general programs that run on its GPUs.
