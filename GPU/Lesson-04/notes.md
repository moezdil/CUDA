# 04 > NVIDIA GPU Architectures

Fermi, Ampere, Hopper, Blackwell and Rubin are names of NVIDIA GPU architectures. This lesson walks through them in order, from 2010 to the roadmap for 2028, and shows how GPUs moved from graphics to general compute to large-scale AI. It also shows which of them the current CUDA release still supports.

## Why Architectures Matter

Names like Fermi, Ampere and Hopper are more than labels. The goal is not to memorize them. The goal is to understand how GPUs changed over time.

## What "Architecture" Means

A GPU architecture is the blueprint of the GPU. It defines how everything inside the chip is built.

It covers more than the cores. It also defines:

- how data flows  
- how memory is accessed  
- what kind of operations are fast  
- what the GPU is optimized for  

A new architecture is usually not a small upgrade. It is often a shift in design priorities.

## The Early Modern Era

It helps to read the timeline like a story. Early modern GPUs focused on general compute and graphics.

These architectures improved performance and efficiency step by step:

- Fermi (2010)  
- Kepler (2012)  
- Maxwell (2014)  
- Pascal (2016)  

The goal in this period was to make GPUs faster and more efficient for general workloads.

## AI Becomes Central

Volta (2017, V100) marks a clear shift. With Volta, NVIDIA started to push AI-specific hardware: the first Tensor Cores, units inside each SM that multiply small matrices in one step.

After that:

- Turing (2018, RTX 20 series) brought Tensor Cores and ray tracing units to consumer cards  
- Ampere (2020, A100 and RTX 30 series) scaled this idea further  
- Ada Lovelace (2022, RTX 40 series and L40S) brought these units to consumer and workstation cards in the same year as Hopper  
- Hopper (2022, H100) optimized heavily for AI workloads, especially transformers, with FP8 math  

From here, GPUs were no longer just graphics hardware. They became full compute platforms.

## Recent Architectures

### Blackwell (2024 to 2025)

Blackwell was announced in 2024 and is designed around large-scale AI workloads. The B200 data center GPU joins two chips in one package and uses HBM3e with up to 8 TB/s. It also added NVFP4, a 4-bit number format for AI. Blackwell Ultra (B300, 2025) raised the memory to 288 GB per GPU. On the consumer side, the RTX 50 series (2025) uses Blackwell too.

The real performance gains are not the same for every case. They depend on:

- the workload  
- the precision  
- the system setup  

So "faster GPU" is not always a simple statement.

### Rubin (2026, Now Shipping)

Rubin is the architecture after Blackwell. It is in full production, and the first Vera Rubin systems, which pair Rubin GPUs with NVIDIA's Vera CPU, started shipping in September 2026, with its compute capability of 10.7 already supported in CUDA 13.4.

Each Rubin GPU brings:

- newer Tensor Core designs  
- up to 288 GB of HBM4 memory  
- up to 22 TB/s of memory bandwidth  

Compare that with Blackwell: 22 / 8 = 2.75, so a Rubin GPU can move almost 3 times as many bytes per second.

### Rubin Ultra and Feynman (Announced)

> [!NOTE]
> These are roadmap items, not products you can buy. Rubin Ultra is announced for the second half of 2027, and Feynman for 2028. Details can still change.

The direction stays the same. Everything moves toward larger, more specialized AI systems.

<arch-timeline focus="Volta"></arch-timeline>

## Compute Capability

CUDA does not use architecture names. Each GPU reports a CC, a version number like 8.9. The major number usually follows the architecture, but not always one to one:

- Ampere: 8.0 (A100) and 8.6 (RTX 30 series)  
- Ada Lovelace: 8.9 (RTX 40 series, L40S)  
- Hopper: 9.0 (H100)  
- Blackwell: 10.0 (B200), 10.3 (B300) and 12.0 (RTX 50 series)  
- Rubin: 10.7 (supported in CUDA 13.4)  

So Ada (8.9) shares the major number 8 with Ampere, and Blackwell uses two different major numbers.

> [!WARNING]
> The current CUDA 13 releases (CUDA 13.4 came out in September 2026) support only Turing (CC 7.5) and newer. Maxwell, Pascal and Volta GPUs need an older CUDA 12 toolkit.

## Performance Depends on Context

Simple numbers make a poor comparison. Examples are:

- TFLOPS  
- clock speed  

These numbers do not tell the full story. Performance depends on:

- what kind of workload you run  
- what precision you use  
- how memory behaves  
- how the architecture is designed  

A GPU can look very powerful on paper but perform poorly on a specific task. Another GPU with lower raw numbers can do better in real use.

## Naming Changed Too

Data center GPUs up to the V100 carried the "Tesla" brand, such as the Tesla V100. From the A100 in 2020 on, NVIDIA dropped it and calls them Data Center GPUs.

This shows a change in focus, from generic compute to AI and cloud systems.

## Architectures Are Design Decisions

It is better to see architectures as design decisions, not versions. Each architecture answers one question. What kind of problems do we want to solve now?

With this view, GPU names make more sense. Performance differences become logical. CUDA concepts connect more easily.

## Summary

GPU architectures show how computing itself is changing. The path goes from graphics, to compute, to AI at scale, with a new data center architecture about every year: Hopper, Blackwell, Rubin. Understanding this shift is an important step before going deeper into CUDA.

## Glossary

- architecture: the blueprint of the GPU that defines how everything inside the chip is built.
- GPU (Graphics Processing Unit): the processor this track is about, built from many small cores that work in parallel.
- Fermi: an NVIDIA architecture from 2010, the first one designed with general GPU computing in mind, adding a real L1/L2 cache hierarchy.
- Ampere: an NVIDIA architecture from 2020 (A100, RTX 30 series) that scaled up Tensor Cores for AI.
- Hopper: an NVIDIA architecture from 2022 (H100) built for AI, with a Transformer Engine that can use 8-bit numbers.
- core: a unit that does arithmetic; the core count is only one part of an architecture.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- Kepler / Maxwell / Pascal: NVIDIA architectures from 2012, 2014 and 2016 that made GPUs steadily faster and more power efficient.
- workload: the kind of work a program gives the GPU, such as training a model or rendering a game.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math, which suits GPUs.
- Volta: the 2017 architecture (V100) where NVIDIA started to push AI-specific hardware, with the first Tensor Cores.
- Turing: the 2018 architecture (RTX 20 series) that brought Tensor Cores and ray tracing units to consumer GPUs; CC 7.5.
- Ada Lovelace: the 2022 consumer and workstation architecture (RTX 40 series, L40S); CC 8.9.
- transformer: the neural network design behind modern language models; it is built mostly from large matrix multiplications.
- FP8 / NVFP4 (8-bit floating point / NVIDIA 4-bit floating point): 8-bit and 4-bit number formats for AI; Hopper added FP8 and Blackwell added NVFP4.
- Blackwell: the 2024 to 2025 architecture (B200, B300, RTX 50 series) designed around large-scale AI workloads.
- Blackwell Ultra: the 2025 upgrade of Blackwell (B300) with 288 GB of HBM3e per GPU.
- bandwidth: how many bytes per second can move between memory and the chip.
- precision: how many bits each number uses, such as FP32, FP16 or FP8; fewer bits means faster math but less accuracy.
- Rubin: the architecture after Blackwell, in full production and shipping to cloud providers in the second half of 2026.
- CPU (Central Processing Unit): the main processor of a computer; Vera is NVIDIA's own CPU, paired with Rubin GPUs.
- Tensor Core: a unit inside each SM that does small matrix multiplications in one step, the core of AI speed.
- HBM3e / HBM4 (High Bandwidth Memory): stacked memory next to the chip; Blackwell uses HBM3e, Rubin uses HBM4.
- SM (Streaming Multiprocessor): the building block of an NVIDIA GPU that holds its cores, Tensor Cores and shared memory.
- cloud: computers rented over the internet from a provider's data centers.
- Rubin Ultra / Feynman: announced architectures after Rubin, planned for 2027 and 2028.
- CC (Compute Capability): the version number a GPU reports to CUDA, such as 8.9 for Ada Lovelace or 10.0 for the B200.
- TFLOPS (trillions of floating-point operations per second): a simple performance number that does not tell the full story.
- clock speed: another simple number that makes a poor comparison on its own.
- Tesla: the old brand for NVIDIA data center GPUs up to the V100, dropped from the A100 on.
- Data Center GPU: NVIDIA's current name for its server GPUs, such as the A100, H100 and the Blackwell parts.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs; CUDA 13 supports Turing and every newer architecture.
