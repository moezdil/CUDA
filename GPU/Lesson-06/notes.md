# Nvidia GPU Architectures

This lesson explains what Nvidia GPU architecture names like Fermi, Ampere and Hopper mean. It shows how GPUs evolved and why they look the way they do today.

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

- Fermi  
- Kepler  
- Maxwell  
- Pascal  

The goal in this period was to make GPUs faster and more efficient for general workloads.

## AI Becomes Central

Volta marks a clear shift. With Volta, Nvidia started to push AI-specific hardware.

After that:

- Ampere scaled this idea further  
- Hopper optimized heavily for AI workloads (especially transformers)  

From here, GPUs were no longer just graphics hardware. They became full compute platforms.

## Recent Architectures

### Blackwell (2024–2025)

Blackwell is designed around large-scale AI workloads. It brings more compute, more bandwidth and more density.

The real performance gains are not the same for every case. They depend on:

- the workload  
- the precision  
- the system setup  

So "faster GPU" is not always a simple statement.

### Rubin (2026, Now Entering Deployment)

Rubin goes beyond scaling. It pushes AI systems even further.

From what is known so far, Rubin brings:

- newer Tensor Core designs  
- support for HBM4 memory  
- very high SM counts  
- higher overall compute density  

Rubin is not just a concept. It is already entering real systems and cloud environments.

### Rubin Ultra and Beyond

> [!NOTE]
> Nvidia's roadmap continues. Rubin Ultra is expected to push things further. After that, Feynman is on the roadmap.

The direction stays the same. Everything moves toward larger, more specialized AI systems.

<arch-timeline focus="Volta"></arch-timeline>

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

> [!NOTE]
> Older data center GPUs were often labeled "Tesla". Newer ones are called Data Center GPUs.

This shows a change in focus, from generic compute to AI and cloud systems.

## Architectures Are Design Decisions

It is better to see architectures as design decisions, not versions. Each architecture answers one question. What kind of problems do we want to solve now?

With this view, GPU names make more sense. Performance differences become logical. CUDA concepts connect more easily.

## Summary

GPU architectures show how computing itself is changing. The path goes from graphics, to compute, to AI at scale. Understanding this shift is an important step before going deeper into CUDA.

## Glossary

- architecture: the blueprint of the GPU that defines how everything inside the chip is built.
- Fermi: an Nvidia architecture from 2010, the first one designed with general GPU computing in mind, adding a real L1/L2 cache hierarchy.
- Ampere: an Nvidia architecture from 2020 (A100, RTX 30 series) that scaled up Tensor Cores for AI.
- Hopper: an Nvidia architecture from 2022 (H100) built for AI, with a Transformer Engine that can use 8-bit numbers.
- core: a unit that does arithmetic; the core count is only one part of an architecture.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- Kepler / Maxwell / Pascal: Nvidia architectures from 2012, 2014 and 2016 that made GPUs steadily faster and more power efficient.
- workload: the kind of work a program gives the GPU, such as training a model or rendering a game.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math, which suits GPUs.
- Volta: the 2017 architecture (V100) where Nvidia started to push AI-specific hardware, with the first Tensor Cores.
- transformer: the neural network design behind modern language models; it is built mostly from large matrix multiplications.
- Blackwell: a 2024 to 2025 architecture designed around large-scale AI workloads.
- bandwidth: how many bytes per second can move between memory and the chip.
- precision: how many bits each number uses, such as FP32, FP16 or FP8; fewer bits means faster math but less accuracy.
- Rubin: a 2026 architecture now entering real systems, with newer Tensor Core designs.
- Tensor Core: a unit inside each SM that does small matrix multiplications in one step, the core of AI speed.
- HBM4: a memory type that Rubin supports.
- SM (Streaming Multiprocessor): the building block of an Nvidia GPU that holds its cores, Tensor Cores and shared memory.
- cloud: computers rented over the internet from a provider's data centers.
- TFLOPS: a simple performance number that does not tell the full story.
- clock speed: another simple number that makes a poor comparison on its own.
- Tesla: the old label for Nvidia data center GPUs, which are now called Data Center GPUs.
- Data Center GPU: Nvidia's current name for its server GPUs, such as the A100, H100 and the Blackwell parts.
- CUDA: NVIDIA's platform for writing programs that run on its GPUs; it works across all of these architectures.
