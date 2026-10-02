# 03 > Reading GPU Specs

This lesson shows how to find the generation and architecture of a GPU and how to read its specs (specifications). It uses the RTX 3090 and the A100, two Ampere GPUs from 2020, as examples. The same steps work for any GPU, including today's Blackwell cards.

## Finding GPU Specs

The easiest way is a web search. For example:

"A100 GPU TechPowerUp"

TechPowerUp keeps a GPU database that collects detailed specs from many manufacturers. It is one of the easiest places to check GPU details. You can search other GPUs the same way:

"RTX 3090 TechPowerUp"

Open the page to see all the specs.

> [!TIP]
> For the CC (compute capability), the number CUDA cares about, check NVIDIA's own list at developer.nvidia.com/cuda-gpus. On a machine with an NVIDIA GPU, `nvidia-smi --query-gpu=name,compute_cap --format=csv` prints the name and CC of every GPU in it.

## A Simple Comparison

Compare two GPUs:

- RTX 3090  
- A100  

First, look at the chip name. For example, A100 → GA100, RTX 3090 → GA102. The "GA" stands for Ampere.

> [!NOTE]
> Chip design comes in a later lesson. For now, just read the name.

Next, look at the number of cores:

- A100 → 6,912 cores  
- RTX 3090 → 10,496 cores  

This does not mean the RTX 3090 is always stronger, because the core count does not show every kind of core.

## Core Counts

A number like "6,912 cores" (the A100) usually counts only single-precision cores, which NVIDIA calls CUDA cores. These cores handle standard floating-point math. The number does not include all cores in the GPU.

The count is simply SMs (Streaming Multiprocessors) times cores per SM. The A100 has 108 SMs with 64 cores each: 108 * 64 = 6,912. The RTX 3090 has 82 SMs with 128 cores each: 82 * 128 = 10,496. So the RTX 3090 has fewer SMs, but each of its SMs counts twice as many cores.

Modern GPUs have other types of cores too, for example:

- cores for integer operations  
- cores for double-precision operations  
- special cores for AI (artificial intelligence), called tensor cores  

Here the A100 wins clearly. It does 9.7 TFLOPS (trillion floating-point operations per second) in double precision, while the RTX 3090 does about 0.56 TFLOPS, so the A100 is 9.7 / 0.56 = about 17 times faster. Memory differs too: 40 GB of HBM2 (High Bandwidth Memory) at 1,555 GB/s on the A100 against 24 GB of GDDR6X at 936 GB/s on the RTX 3090.

So do not judge a GPU by this number alone.

## Generation and Architecture

### RTX 3090

- Generation → GeForce  
- Architecture → Ampere  

GeForce GPUs are built for everyday users in:

- desktops  
- laptops  
- workstations  

Main use cases:

- gaming  
- content creation  
- general GPU tasks  

### A100

- Generation → Data Center GPU (the line once called Tesla)  
- Architecture → Ampere  

These GPUs are built for:

- servers  
- data centers  
- supercomputers  

## Key Point

- RTX 3090 and A100 use the SAME architecture (Ampere)  
- but they are built for completely different use cases  

Same architecture ≠ same purpose.

Reminder:
- Architecture → technical design
- Generation → usage category

<gpu-compare></gpu-compare>

## Telling Them Apart by Looks

In many cases, you can tell the difference just by looking at the card.

### Data Center GPUs (A100, V100, P100)

- usually NO built-in fan  
- compact, fanless design

They run in data centers with strong external cooling. The server handles the cooling, not the GPU.

> [!NOTE]
> Many data center GPUs are not plug-in cards at all. The A100, H100 and B200 mostly come as SXM modules mounted flat on the server board, often with liquid cooling in newer racks.

### GeForce GPUs (RTX series)

- have built-in fans  
- designed for standalone systems  

They run in:

- desktop PCs  
- personal workstations  

These systems need their own cooling, so the card needs fans.

## Summary

- Data Center GPUs → no fan  
- GeForce GPUs → built-in fan  

Different environments have different cooling needs. Knowing this helps you:

- read GPU specs  
- choose the right hardware  
- avoid common beginner mistakes  

This becomes more important as you go deeper into CUDA.

## Glossary

- specs (specifications): the published technical numbers of a GPU, such as core count, memory size and clock speed.
- TechPowerUp: a website with a GPU database that collects detailed specs from many manufacturers.
- CC (compute capability): the version number CUDA gives a GPU's feature set, such as 8.0 for the A100 and 8.6 for the RTX 3090.
- nvidia-smi: NVIDIA's command-line tool that lists the GPUs in a machine and their state.
- RTX 3090: a GeForce GPU from 2020 with 82 SMs, 10,496 cores and 24 GB of GDDR6X memory, based on Ampere.
- A100: an NVIDIA data center GPU from 2020 with 108 SMs and 6,912 single-precision cores, based on Ampere.
- chip name: the name of the chip inside a GPU, such as GA100 for the A100.
- core count: the number of cores in the specs, which does not show every kind of core.
- single-precision cores: cores for standard floating-point math, usually the only ones in the core count.
- SM (Streaming Multiprocessor): a block of cores inside a GPU; core count = SMs * cores per SM.
- floating-point: numbers with a decimal point, such as 3.14; single precision stores one in 32 bits, double precision in 64 bits.
- double-precision: 64-bit floating-point math, used in scientific work; the A100 is about 17 times faster at it than the RTX 3090.
- tensor cores: special cores in modern GPUs built for AI.
- TFLOPS (teraFLOPS): a trillion floating-point operations per second.
- HBM (High Bandwidth Memory): stacked memory on data center GPUs, faster than the GDDR memory on GeForce cards.
- architecture: the technical design of a GPU.
- generation: the usage category of a GPU, such as GeForce or Data Center GPUs.
- Ampere: the architecture shared by the RTX 3090 and the A100.
- GeForce: NVIDIA's consumer GPUs for desktops, laptops and workstations, with built-in fans.
- workstation: a powerful desktop computer for professional work such as 3D design or engineering.
- Tesla: the old name of NVIDIA's data center GPUs, now called Data Center GPUs.
- Data Center GPU: an NVIDIA GPU for servers, such as the A100, usually without a fan of its own.
- data center: a building full of servers, cooled by strong fans, air conditioning or liquid cooling.
- supercomputer: thousands of connected servers that work together as one machine on huge problems.
- V100 / P100: older NVIDIA data center GPUs, based on Volta (2017) and Pascal (2016).
- SXM: NVIDIA's module form for data center GPUs, mounted directly on the server board instead of in a PCIe slot.
- fanless: a card with only a heatsink and no fan; the server's own fans push air through it.
- cooling: removing the heat a GPU makes; a GeForce card uses its own fans, a data center card relies on the server.
