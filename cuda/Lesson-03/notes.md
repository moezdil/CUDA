# 03 > Compute Capability

Compute capability (CC) is a version number for a GPU (Graphics Processing Unit) generation. It sets the features and hardware limits you met in Lessons 00 to 02, such as the warp size of 32 and the 1024-thread block limit. Every CUDA (Compute Unified Device Architecture) feature needs a minimum compute capability, so this number tells you what your code may use.

## What the Number Means

The format is major.minor, for example 9.0 for Hopper or 8.9 for the L40S used in these lessons. A new major version is a new architecture generation with new hardware. A new minor version is a revision inside the same generation.

Code built for CC 7.0 runs on any GPU with CC 7.0 or higher. Code that uses CC 9.0 features does not run on older GPUs. For example, a program that needs CC 8.0 runs on the L40S (8.9 is higher than 8.0), but a program that needs CC 9.0 does not.

<cc-explorer></cc-explorer>

> [!TIP]
> To find the compute capability of your own GPU, run `nvidia-smi --query-gpu=name,compute_cap --format=csv`.

## GPU Generations

The table covers data center GPUs from Pascal to Blackwell, plus the L40S that the outputs in these lessons come from.

| Spec                   | P100 (CC 6.0)     | V100 (CC 7.0)     | A100 (CC 8.0)     | L40S (CC 8.9)     | H100 (CC 9.0)     | B100 (CC 10.0)    |
|------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| GPU                    | Tesla P100        | Tesla V100        | A100              | L40S              | H100              | B100              |
| Codename               | GP100             | GV100             | GA100             | AD102             | GH100             | GB100             |
| Architecture           | Pascal            | Volta             | Ampere            | Ada Lovelace      | Hopper            | Blackwell         |
| Threads / Warp         | 32                | 32                | 32                | 32                | 32                | 32                |
| Max Warps / SM         | 64                | 64                | 64                | 48                | 64                | 64                |
| Max Threads / SM       | 2048              | 2048              | 2048              | 1536              | 2048              | 2048              |
| Max Thread Blocks / SM | 32                | 32                | 32                | 24                | 32                | 32                |
| Max Registers / SM     | 65536             | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max Registers / Block  | 65536             | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max Registers / Thread | 255               | 255               | 255               | 255               | 255               | 255               |
| Max Thread Block Size  | 1024              | 1024              | 1024              | 1024              | 1024              | 1024              |
| FP32 Cores / SM        | 64                | 64                | 64                | 128               | 128               | 128               |
| Shared Memory / SM     | 64 KB             | up to 96 KB       | up to 164 KB      | up to 100 KB      | up to 228 KB      | up to 228 KB      |

SM means Streaming Multiprocessor, the processor inside the GPU that blocks run on. FP32 means 32-bit floating point, and KB means kilobyte.

H100 and B100 have the same per-SM thread and memory limits. The per-SM register count did not change at all across these generations.

<cc-progress></cc-progress>

> [!NOTE]
> Blackwell is still faster than Hopper because of more SMs (148 on B200 vs 132 on H100 SXM5), 5th generation Tensor Cores, faster HBM3e (High Bandwidth Memory) and NVLink 5.0, NVIDIA's link between GPUs.

## Threads per Warp

A warp is a group of 32 threads that the GPU runs together ([Lesson 01](../Lesson-01/notes.md)). The number 32 is fixed by the hardware and is part of the compute capability spec. The GPU never schedules single threads. It always schedules whole warps of 32.

The warp size of 32 has not changed since the first CUDA GPUs (CC 1.0).

## Warps and Threads per SM

An SM is the physical processor that blocks run on ([Lesson 02](../Lesson-02/notes.md)). The data center GPUs in the table hold up to 64 active warps per SM, which is 64 x 32 = 2048 threads. The L40S is different: CC 8.9 allows 48 warps per SM, which is 48 x 32 = 1536 threads.

When some warps wait for memory, the warp scheduler can pick other warps. More active warps keep the execution units busy, because there is more often a warp that is ready to run.

> [!WARNING]
> "64 warps per SM" is not true for every GPU. CC 8.6, 8.9 and 12.0 allow only 48. Check the number for your own GPU before you plan around it.

## Thread Block Size Limit

In [Lesson 02](../Lesson-02/notes.md), `<<<1, 2048>>>` compiled but launched nothing. The reason is the max thread block size of 1024. It is a fixed rule in the compute capability spec, the same 1024 in every column of the table.

The limit is per block, not per SM. One SM can hold more threads than one block may have, as long as they come from several blocks. On the L40S, 1536 threads fit on one SM, for example as 3 blocks of 512 threads. On the A100, 2048 threads fit, for example as 2 blocks of 1024.

## FP32 Cores per SM

FP32 (32-bit floating point) is the usual `float` type. Pascal, Volta, and Ampere data center GPUs have 64 FP32 cores per SM. Ada Lovelace (the L40S), Hopper and Blackwell have 128. More FP32 cores means more floating-point operations per clock cycle on each SM.

## Shared Memory per SM

Shared memory is fast memory inside each SM. All threads in a block can use it. It grew over the generations:

- Pascal: 64 KB
- Volta: up to 96 KB
- Ampere (A100): up to 164 KB
- Ada Lovelace (L40S): up to 100 KB
- Hopper and Blackwell: up to 228 KB

More shared memory lets a kernel keep more data on-chip instead of going to global memory.

## Glossary

- compute capability (CC): a version number (major.minor). It tells which CUDA features a GPU supports and what its hardware limits are.
- SM (Streaming Multiprocessor): the physical processor inside the GPU. All threads run on SMs.
- warp: a group of 32 threads that the GPU schedules and runs together.
- active warps per SM: how many warps one SM can hold at the same time. 64 on most data center GPUs, 48 on CC 8.6, 8.9 and 12.0.
- FP32 (32-bit floating point) core: a hardware unit that does one 32-bit floating-point operation per clock cycle.
- shared memory: fast on-chip memory inside each SM, shared by all threads in a block. Much faster than global (device) memory.
- register file: a pool of fast storage per SM for each thread's local variables. It has 65536 registers per SM in all generations shown.
- KB (kilobyte): 1024 bytes.
- HBM (High Bandwidth Memory): the fast stacked memory on data center GPUs.
- CUDA Toolkit 12.8+: needed to compile code for Blackwell (CC 10.0).
