# 05 > Compute Capability

This lesson explains compute capability, how its numbers work, and how it decides which features and which CUDA toolkit versions you can use. By the end you can look at any GPU and tell what it supports.

## What Compute Capability Is

Compute capability, CC for short, is NVIDIA's system for describing the features of a GPU. It is a version number for the hardware, not for the software.

It is not a marketing score or a benchmark. It says exactly what a GPU architecture can and cannot do. Think of it as a specification sheet in a single number.

## How the Numbering Works

Compute capability is a version number, like 7.5, 8.9 or 12.0. The rule is the same for all generations:

- The number before the dot signals a major architectural change
- The number after the dot represents minor improvements or extensions

So going from 7.x to 8.x is not just a speed bump. It means a different architecture with new hardware units and new capabilities. A worked example: the RTX 4090 is CC 8.9 and the A100 is CC 8.0. Both belong to the 8.x family, so they share the core design, but 8.9 adds features the A100 does not have, such as FP8 Tensor Cores.

> [!TIP]
> To see the CC of the GPU in your machine, run `nvidia-smi --query-gpu=name,compute_cap --format=csv`. NVIDIA's "CUDA GPUs" web page lists the CC of every card.

## The Architectures

### Volta → CC 7.0

Volta introduced Tensor Cores. These are special units that speed up the matrix operations used in AI and deep learning. Before Volta, these operations ran on general-purpose CUDA cores. After Volta, they had dedicated hardware.

### Turing and Ampere → CC 7.5 and 8.x

Turing (CC 7.5, the RTX 20 series) brought Tensor Cores to consumer cards. Ampere (CC 8.0 for the A100, 8.6 for the RTX 30 series) brought more powerful and efficient Tensor Cores, higher memory bandwidth and better energy efficiency. Ada Lovelace (CC 8.9, the RTX 40 series and the L40S) added FP8 support.

### Hopper → CC 9.0

Hopper (the H100 and H200) was another major step. It introduced new execution models for very large AI models and pushed AI performance forward.

### Blackwell → CC 10.x, 11.0 and 12.x

Blackwell is the main shipping generation in 2026. It has 5th-generation Tensor Cores and a new precision format called NVFP4. NVFP4 doubles throughput compared to FP8 for large model inference. FP4 acceleration does not exist on earlier architectures.

Blackwell comes in several compute capabilities, one per chip family:

| CC | Products |
|---|---|
| 10.0 | B200, GB200 (data center) |
| 10.3 | B300, GB300 (Blackwell Ultra, data center) |
| 11.0 | Jetson Thor (robotics) |
| 12.0 | GeForce RTX 50 series, RTX PRO Blackwell |
| 12.1 | GB10 (DGX Spark desktop) |

> [!NOTE]
> The next architecture, Rubin, is CC 10.7. It belongs to the same 10.x family as the B200 and the B300. The first Vera Rubin NVL72 racks started shipping in September 2026.

## Feature Support

The official CUDA documentation has tables that map features to compute capability versions. These tables show clear patterns:

- GPUs at CC 5.0 do not support FP16 operations
- Tensor Cores appear only from CC 7.0 onward
- FP8 Tensor Cores arrive with CC 8.9 (Ada Lovelace) and 9.0 (Hopper)
- NVFP4 requires CC 10.0 or higher

A missing hardware feature cannot be added later. If your GPU has no Tensor Cores, you cannot use them. Software can sometimes imitate a missing unit through emulation, but it is far slower, and for most Tensor Core features there is no such path. The hardware either has the unit or it does not.

So before writing performance-sensitive CUDA code, ask "Does my GPU support what I need?" This comes before "Is my GPU fast enough?"

## Software Compatibility

Compute capability also decides which CUDA toolkit versions you can use. A new architecture needs a toolkit that knows it, and old architectures are dropped from new toolkits after some years.

Some examples:

- Hopper (CC 9.0): requires CUDA 11.8 or higher
- Blackwell (CC 10.0 and 12.0): requires CUDA 12.8 or higher for native cubin support
- Blackwell Ultra (CC 10.3): requires CUDA 12.9 or higher
- Rubin (CC 10.7): supported in CUDA 13.4
- Maxwell, Pascal and Volta (CC 5.x to 7.0): not supported by CUDA 13 at all; the last toolkits for them are CUDA 12.x

> [!WARNING]
> CUDA 13 (the current major version, 13.4 as of September 2026) supports CC 7.5 (Turing) and newer only. On a Pascal card such as a GTX 1080 (CC 6.1), you must stay on CUDA 12.x.

A toolkit below the minimum for your architecture, or a toolkit that has dropped your architecture, gives a hard error. The code will not compile, or it will fail at runtime.

The workflow is always the same:

1. Find your GPU's compute capability.
2. Choose your CUDA version.
3. Write your code.

<cc-explorer></cc-explorer>

## The Low-Level Layer

CUDA code does not run directly on the GPU. It compiles to PTX first. PTX is a low-level intermediate language, similar to an assembly language for NVIDIA GPUs.

Some PTX instructions need hardware units that exist only from a certain compute capability onward. Warp shuffle functions are one example.

> [!NOTE]
> Warp shuffle functions let threads in a warp share data without using shared or global memory. Warp shuffle exists since CC 3.0 (Kepler).

If your GPU is below the minimum, these instructions cannot run. The hardware for them is not on the chip.

## Summary

The same rule applies to machine learning pipelines, physics simulations and custom CUDA kernels. Your GPU's compute capability is the contract between your hardware and your code.

Know your CC number. Check it against the CUDA documentation. Choose the right toolkit version. Then build. Performance tuning, optimization and feature choice all start from there.

> Compute capability is not just a version number. It is the definition of what your GPU can actually do.

## Glossary

- compute capability (CC): NVIDIA's version number that says what a GPU architecture can and cannot do.
- GPU (Graphics Processing Unit): a processor built to run many simple tasks in parallel.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
- benchmark: a test program that measures speed; compute capability is not a speed score.
- architecture: the hardware design of a GPU family; each architecture gets its own major CC number.
- number before the dot (major number): it signals a major architectural change, such as 8 for Ampere and 9 for Hopper.
- number after the dot (minor number): it stands for minor improvements or extensions, such as 8.6 or 8.9 within the 8.x family.
- `nvidia-smi`: NVIDIA's command-line tool; with `--query-gpu=compute_cap` it prints the CC of each GPU.
- Tensor Cores: special units that speed up matrix operations for AI. They appear from CC 7.0 onward.
- CUDA cores: the general-purpose arithmetic units of an NVIDIA GPU, the ones counted in its core count.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math.
- Turing: NVIDIA's 2018 architecture (RTX 20 series), CC 7.5, the oldest one CUDA 13 supports.
- Ada Lovelace: NVIDIA's 2022 architecture (RTX 40 series, L40S), CC 8.9.
- Hopper: NVIDIA's 2022 data center architecture (H100, H200), CC 9.0.
- Blackwell: NVIDIA's main shipping architecture in 2026, with CC 10.0, 10.3, 11.0, 12.0 and 12.1 for its different chips.
- Blackwell Ultra: the B300 and GB300, an upgraded Blackwell for data centers, CC 10.3.
- Rubin: the architecture after Blackwell, CC 10.7, shipping in data center racks since September 2026.
- NVFP4 (NVIDIA 4-bit floating point): a Blackwell precision format that doubles throughput compared to FP8 for large model inference.
- FP8 (8-bit floating point): a number format less exact than FP16, but twice as fast on Tensor Cores that support it.
- inference: running a trained AI model to get answers, as opposed to training it.
- FP16 (16-bit floating point): half-precision operations. GPUs at CC 5.0 do not support them.
- emulation: imitating missing hardware in software, which is usually far slower or not possible at all.
- toolkit (CUDA Toolkit): NVIDIA's package with the nvcc compiler, libraries and tools; each version supports a range of compute capabilities.
- CUDA 13: the current major CUDA version; it supports CC 7.5 and newer only.
- Maxwell / Pascal / Volta: NVIDIA architectures from 2014, 2016 and 2017 (CC 5.x to 7.0) that CUDA 13 no longer supports.
- cubin: a compiled GPU binary for one specific compute capability, unlike PTX, which can still be compiled for newer GPUs.
- runtime: the time when the program is running, as opposed to compile time.
- PTX (Parallel Thread Execution): a low-level intermediate language, like assembly for NVIDIA GPUs. CUDA code compiles to it first.
- assembly language: a human-readable form of the basic instructions a processor runs, one line per instruction.
- warp shuffle: functions that let threads in a warp share data without using shared or global memory.
- warp: a group of 32 threads that run the same instruction together.
- global memory: the GPU's main memory (VRAM), visible to every thread but much slower than shared memory.
- kernel: a function that runs on the GPU, started from code on the CPU.
