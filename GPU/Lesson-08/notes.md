# 08 > Warps and Latency Hiding

A GPU does not run its threads one by one. It runs them in groups of 32 called warps, and it hides slow memory by switching between warps instead of waiting. This lesson explains how that works, why a GPU wants far more threads than it has cores, and what occupancy means.

## SIMT: One Instruction, Many Threads

NVIDIA calls its execution model SIMT. You write a kernel as if for one thread, and the GPU runs many threads with that same code. Each thread has its own registers and its own data, for example its own element of an array.

The hardware does not fetch and decode the instruction once per thread. It does it once for a group of threads, and all threads in the group execute it together, each on its own data. This saves a lot of chip area and power, which is why a GPU can fit so many cores.

SIMT looks like SIMD on a CPU, where one instruction works on a short vector. The difference is that in SIMT you write ordinary scalar code per thread, and the hardware groups the threads for you.

## The Warp

The group that runs one instruction together is the warp. On every NVIDIA GPU so far, a warp is 32 threads. A block of 256 threads is 256 / 32 = 8 warps, and a block of 100 threads still takes 4 warps, because the last warp is only partly filled (100 = 3 × 32 + 4).

The threads inside a warp are called lanes, numbered 0 to 31. In the CUDA Practice track, [Lesson 07](../../cuda/Lesson-07/notes.md) shows how a thread works out its own warp ID and lane ID.

## Warp Schedulers

[Lesson 00](../Lesson-00/notes.md) introduced the SM, the small processor a GPU is built from. The L40S is an Ada Lovelace GPU with CC 8.9, and each of its SMs is split into 4 partitions. Each partition has one warp scheduler, a 64 KB slice of the register file and 32 FP32 lanes.

On every clock cycle, each warp scheduler picks one warp that is ready and issues its next instruction. So one SM can start up to 4 warp instructions per cycle, one per scheduler.

An SM can hold up to 48 warps at the same time on the L40S, which is 48 × 32 = 1,536 threads. These are its resident warps. Spread over 4 schedulers, that is 48 / 4 = 12 warps for each scheduler to choose from.

## When a Warp Waits for Memory

A load from VRAM takes hundreds of clock cycles. [Lesson 07](../Lesson-07/notes.md) shows the memory hierarchy behind this. When a warp needs a value that has not arrived yet, it cannot run its next instruction. The warp stalls.

A CPU core would try to avoid this with big caches and by guessing ahead. A GPU does something simpler: the warp scheduler skips the stalled warp and issues an instruction from another warp that is ready. When the data arrives, the first warp becomes ready again and gets its turn later.

This switch costs nothing. Every resident warp keeps its own registers in the register file the whole time, so there is nothing to save or restore. On a CPU, switching between threads means saving registers to memory and loading others, which takes much longer.

This is called latency hiding. The memory is still slow, but while one warp waits, others do useful work, so the scheduler stays busy.

The diagram below is a simplified model of one warp scheduler. Each warp issues for 2 cycles, then waits 8 cycles for memory. Move the slider to change how many warps are resident.

<latency-hiding></latency-hiding>

With 1 warp the scheduler issues on only 2 of every 10 cycles, which is 20% busy. Each extra warp fills a gap. With (2 + 8) / 2 = 5 warps there is always one ready, and the scheduler is busy 100% of the time. A sixth warp adds nothing: it only waits its turn.

Real numbers are larger. A load from VRAM takes hundreds of cycles, so the scheduler needs many warps, and many independent instructions in each warp, to cover it.

## Why a GPU Wants More Threads Than Cores

Latency hiding only works if there are other warps to switch to. That is why you launch far more threads than the GPU has cores.

A worked example with the L40S:

- FP32 cores: 142 SMs × 128 = 18,176
- resident threads: 142 SMs × 1,536 = 218,112
- 218,112 / 18,176 = 12 threads that can be resident per core

Most of those threads are waiting at any moment. That is fine. They are not wasted, they are the pool the schedulers pick from while the others wait for memory.

## Occupancy

Occupancy measures how full an SM is with warps:

occupancy = active warps / maximum warps per SM

The maximum on the L40S is 48. If a kernel has 32 active warps per SM, its occupancy is 32 / 48 = 67%. If it has all 48, it is 100%.

Higher occupancy gives each scheduler more warps to choose from, so it has a better chance of always finding one that is ready.

## What Limits Occupancy

The SM gives each block registers, shared memory and a slot. When one of these runs out, no more blocks fit, even if the warp limit is not reached. Three limits matter most on the L40S.

### Registers per Thread

An SM has 65,536 32-bit registers, shared by all its resident threads. For full occupancy, all 1,536 threads must fit:

65,536 / 1,536 = 42.7, so about 42 registers per thread

A kernel that needs more registers per thread fits fewer warps:

- 64 registers: 64 × 32 = 2,048 registers per warp, and 65,536 / 2,048 = 32 warps, so 32 / 48 = 67%
- 128 registers: 128 × 32 = 4,096 per warp, and 65,536 / 4,096 = 16 warps, so 16 / 48 = 33%

> [!NOTE]
> The hardware hands out registers in chunks of 256 per warp. A kernel with 42 registers needs 42 × 32 = 1,344 per warp, which rounds up to 1,536, and 48 × 1,536 = 73,728 is more than 65,536. So the real limit for 100% on the L40S is 40 registers: 40 × 32 = 1,280, and 48 × 1,280 = 61,440 fits.

### Shared Memory per Block

Shared memory is fast memory inside the SM that the threads of one block share. On the L40S an SM has up to 100 KB of it, and one block can use up to 99 KB.

Take blocks of 256 threads (8 warps) that each use 40 KB of shared memory. Only 2 blocks fit in 100 KB, so the SM holds 2 × 8 = 16 warps, which is 16 / 48 = 33%.

### Block Size

An SM on the L40S holds at most 24 blocks. Tiny blocks hit this limit first: with 32 threads per block (1 warp), 24 blocks give only 24 warps, which is 24 / 48 = 50%.

Large blocks can waste space too. A block of 1,024 threads is 32 warps. Only one fits, because two would need 64 warps, so the SM holds 32 / 48 = 67%. Blocks of 128, 256 or 512 threads divide 1,536 evenly and can reach 100% if registers and shared memory allow it.

The lowest of the three limits wins.

## Branch Divergence

All 32 threads of a warp share one instruction stream. If an `if` sends some lanes one way and the rest the other way, the warp runs both paths one after the other, and on each path the lanes that did not take it sit idle. This is called branch divergence. Since Volta every thread has its own program counter, so divergent threads can interleave and wait on each other safely, but the paths still do not run at the same time. Divergence costs time when lanes of the same warp disagree. If every lane of a warp takes the same branch, there is no cost.

## More Occupancy Is Not Always Faster

Occupancy is a means, not the goal. Once the schedulers have enough ready warps to cover the waiting, more warps change nothing, as the sixth warp in the diagram shows.

A warp can also hide latency on its own. If its next instructions do not depend on the value still on its way, the scheduler can keep issuing them. This is ILP. A kernel that keeps more data in registers and gives each thread more independent work can run faster at 33% occupancy than a simpler kernel at 100%.

> [!WARNING]
> Forcing a kernel down to fewer registers to raise occupancy can make it slower. Values that no longer fit are spilled to local memory, which lives in VRAM, and every spill adds the very memory traffic you wanted to hide.

## Why This Matters for CUDA

Every choice you make in a kernel feeds into this. The block size you launch with, the registers the compiler gives your kernel and the shared memory you declare decide how many warps fit on each SM. A kernel that waits for memory needs enough warps to hide that wait, and [Lesson 09](../Lesson-09/notes.md) shows how to tell whether a kernel is limited by memory or by compute.

Choose a block size that is a multiple of 32, so no warp is partly empty. 128 or 256 is a good default on the L40S. Keep lanes of the same warp on the same branch where you can.

> [!TIP]
> Compile with `nvcc -arch=sm_89 -Xptxas -v -o NAME NAME.cu` and nvcc prints the registers and shared memory each kernel uses. With those numbers you can work out occupancy by hand, as above.

## Summary

A warp is 32 threads that run one instruction together. Each warp scheduler issues one warp instruction per cycle and skips warps that wait for memory, at no cost, because every warp keeps its registers. That is why a GPU wants many more threads than cores. Occupancy measures how many warps are resident, and registers, shared memory and block size limit it. Enough occupancy is needed to hide latency, but more is not automatically faster.

## Glossary

- GPU (Graphics Processing Unit): the processor this track is about, built from many SMs that run threads in parallel.
- CPU (Central Processing Unit): the main processor of a computer, with a few fast cores.
- SIMT (Single Instruction, Multiple Threads): NVIDIA's execution model, where you write code for one thread and the hardware runs it for a group of threads at once.
- SIMD (Single Instruction, Multiple Data): one instruction that works on a short vector of values, as in CPU vector units.
- kernel: a function that runs on the GPU, once per thread.
- thread: one instance of a kernel, with its own registers and data.
- warp: a group of 32 threads that run the same instruction together.
- lane: one thread's position inside its warp, from 0 to 31.
- block: a group of threads launched together on one SM; it can use shared memory.
- SM (Streaming Multiprocessor): the small processor a GPU is built from; the L40S has 142.
- CC (compute capability): the version number of a GPU's features; the L40S is 8.9.
- warp scheduler: the unit that picks a ready warp and issues its next instruction each clock cycle; an Ada SM has 4.
- issue: to send a warp's next instruction off to run; each warp scheduler issues at most one per clock cycle.
- resident warps: the warps an SM holds at the same time; at most 48 on the L40S.
- register: the fastest storage in an SM; each thread keeps its own variables in registers.
- register file: all registers of an SM, 65,536 32-bit registers on the L40S.
- FP32 (32-bit floating point): the standard number format for GPU math.
- KB (kilobyte): 1,024 bytes.
- VRAM (GPU memory): the large memory on the GPU card; a load from it takes hundreds of clock cycles.
- stall: when a warp cannot issue its next instruction because it waits, for example for memory.
- latency hiding: keeping the GPU busy during slow operations by issuing from other warps.
- occupancy: active warps divided by the maximum warps per SM.
- shared memory: fast memory inside an SM that the threads of one block share; up to 100 KB per SM on the L40S.
- branch divergence: when lanes of one warp take different paths, so the warp runs the paths one after the other.
- program counter: the address of the next instruction; since Volta each thread has its own.
- ILP (instruction-level parallelism): independent instructions inside one thread that can be issued without waiting for each other.
- spill: a value that no longer fits in registers and is moved to local memory in VRAM.
- local memory: per-thread memory that lives in VRAM, used for spills.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
- nvcc (NVIDIA CUDA Compiler): the compiler that turns CUDA code into GPU programs; `-Xptxas -v` makes it print register use.
