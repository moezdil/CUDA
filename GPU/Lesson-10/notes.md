# 10 > Reading GPU White Papers

This lesson explains what GPU (Graphics Processing Unit) white papers are, how to find them, and how to read them. A white paper is the best place to learn what really changed in a new GPU generation.

## What a White Paper Is

A white paper is an official technical document about a GPU architecture. It can feel heavy and too detailed at first. It is the most accurate source about a GPU. It has no marketing and no simplification. It shows how the hardware is actually built.

## Finding a White Paper

Take the chip name and add "white paper". For example: `GA100 white paper` or `H100 white paper`. For the newest architectures NVIDIA often calls the document a technical brief, such as the "NVIDIA Blackwell Architecture Technical Brief", so search for that name too.

> [!TIP]
> Not every result is useful. Blog posts, summaries and comparisons can help, but they are not enough. Always look for the official PDF.

## A Consistent Structure

NVIDIA white papers follow a consistent structure. Each new architecture is usually explained against the previous one. So a white paper shows both what is new and what changed. For example, the Hopper white paper compares the H100 with the A100 in table after table. This is why the same tables appear in different white papers.

Once you understand one white paper well, the others become much easier to read.

## The Direction of GPU Architectures

As of 2026, GPU architectures show a clear direction:

- Pascal was still mostly a general-purpose compute architecture.
- Volta introduced Tensor Cores. GPUs became explicitly optimized for AI (artificial intelligence) workloads.
- Ampere expanded this with more throughput, better efficiency, and features like sparsity support.
- Hopper added FP8 (8-bit floating point) and new execution models for large-scale AI systems.
- Blackwell adds new formats like NVFP4 (NVIDIA 4-bit floating point), which bring ultra-low precision directly into hardware. This changes how large models are deployed and scaled.
- Blackwell Ultra (the B300, 2025) adds more memory, 288 GB of HBM3e (High Bandwidth Memory) per GPU, and more NVFP4 throughput.
- Rubin is next. The first racks with Rubin GPUs and HBM4 memory started shipping in September 2026.

GPUs are no longer just compute devices. They are infrastructure for AI systems.

<arch-timeline focus="Pascal"></arch-timeline>

## The Streaming Multiprocessor (SM)

The most important section in a white paper is the Streaming Multiprocessor (SM). The SM is the core of the GPU. It brings together:

* CUDA cores
* Tensor cores
* Scheduling
* Memory access

To see what really changed in an architecture, look at the SM. The evolution is clear:

- Pascal has no Tensor Cores.
- Volta introduces them.
- Ampere improves and scales them.
- Hopper optimizes them for transformer workloads.
- Blackwell extends them with new precision formats and instructions.

Each step changes what the GPU is designed to do.

## The Order of Sections

Architectures change, but the way they are documented stays the same. The order is:

1. New features
2. SM design
3. Performance comparisons
4. Technical specifications

This consistency is on purpose. It makes the evolution across generations easier to follow.

<whitepaper-map></whitepaper-map>

## How to Read One

Reading white papers is not about memorizing numbers. It is about understanding change. Look at the SM, find the new hardware units, and compare them with the previous generation.

## Glossary

- white paper: an official technical document that shows how a GPU is actually built, without marketing.
- GPU (Graphics Processing Unit): a processor built to run many simple tasks in parallel.
- architecture: the hardware design of a GPU family, such as Ampere or Hopper; each one gets its own white paper.
- chip name: the name of the silicon inside a GPU, which is what you search for, such as GA100.
- GA100: the Ampere chip inside the A100.
- H100: Nvidia's Hopper data center GPU from 2022.
- Pascal: a mostly general-purpose compute architecture. It has no Tensor Cores.
- Tensor Cores: hardware units that Volta introduced. They made GPUs explicitly optimized for AI workloads.
- throughput: how much work the GPU can finish in a given time.
- sparsity support: an Ampere feature that skips zeros in a fixed 2-out-of-4 pattern, doubling Tensor Core throughput for such data.
- FP8 (8-bit floating point): a number format Hopper added for large-scale AI systems.
- NVFP4 (NVIDIA 4-bit floating point): a Blackwell format that brings ultra-low precision directly into hardware.
- Blackwell Ultra: the B300 and GB300, an upgraded Blackwell with 288 GB of HBM3e per GPU.
- HBM3e (High Bandwidth Memory): very fast memory stacked next to the GPU chip in data center GPUs.
- Rubin: the architecture after Blackwell, shipping in data center racks since September 2026.
- technical brief: the name NVIDIA uses for the architecture document of its newest GPUs, such as Blackwell.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math.
- precision: how many bits each number uses; fewer bits means faster math and less memory, but less accuracy.
- Streaming Multiprocessor (SM): the core of the GPU. It brings together CUDA cores, Tensor Cores, scheduling and memory access.
- CUDA cores: the general-purpose arithmetic units inside each SM.
- scheduling: deciding which group of threads runs next on the SM's units; each SM has several schedulers doing this every cycle.
- transformer: the neural network design behind modern language models, built mostly from large matrix multiplications.
- generation: one release step of GPUs; a white paper compares each new architecture with the previous generation.
