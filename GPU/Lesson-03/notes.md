# Reading GPU Specs

This lesson shows how to find the generation and architecture of a GPU. It uses the RTX 3090 and the A100 as examples.

## Finding GPU Specs

The easiest way is a Google search. For example:

"A100 GPU TechPowerUp"

TechPowerUp is a website that collects detailed GPU specs from many manufacturers. It is one of the easiest places to check GPU details. You can search other GPUs the same way:

"RTX 3090 TechPowerUp"

Open the page to see all the specs.

## A Simple Comparison

Compare two GPUs:

- RTX 3090  
- A100  

First, look at the chip name. For example, A100 → GA100.

> [!NOTE]
> Chip design comes in a later lesson. For now, just read the name.

Next, look at the number of cores:

- A100 → around 7,000 cores  
- RTX 3090 → more than 10,000 cores  

This does not mean the RTX 3090 is always stronger, because the core count does not show every kind of core.

## Core Counts

A number like "6,912 cores" (the A100) usually counts only single-precision cores. These cores handle standard floating-point math. The number does not include all cores in the GPU.

Modern GPUs have other types of cores too, for example:

- cores for integer operations  
- cores for double-precision operations  
- special cores for AI (tensor cores)

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

- Generation → (historically Tesla, now Data Center GPUs)  
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
- TechPowerUp: a website that collects detailed GPU specs from many manufacturers.
- RTX 3090: a GeForce GPU from 2020 with 10,496 cores and 24 GB of memory, based on Ampere.
- A100: an Nvidia data center GPU from 2020 with 6,912 single-precision cores, based on Ampere.
- chip name: the name of the chip inside a GPU, such as GA100 for the A100.
- core count: the number of cores in the specs, which does not show every kind of core.
- single-precision cores: cores for standard floating-point math, usually the only ones in the core count.
- floating-point: numbers with a decimal point, such as 3.14; single precision stores one in 32 bits, double precision in 64 bits.
- double-precision: 64-bit floating-point math, used in scientific work; the A100 is far faster at it than the RTX 3090.
- tensor cores: special cores in modern GPUs built for AI.
- architecture: the technical design of a GPU.
- generation: the usage category of a GPU, such as GeForce or Data Center GPUs.
- Ampere: the architecture shared by the RTX 3090 and the A100.
- GeForce: Nvidia's consumer GPUs for desktops, laptops and workstations, with built-in fans.
- workstation: a powerful desktop computer for professional work such as 3D design or engineering.
- Tesla: the old name of Nvidia's data center GPUs, now called Data Center GPUs.
- Data Center GPU: an Nvidia GPU for servers, such as the A100, usually without a fan of its own.
- data center: a building full of servers, cooled by strong fans and air conditioning.
- supercomputer: thousands of connected servers that work together as one machine on huge problems.
- V100 / P100: older Nvidia data center GPUs, based on Volta (2017) and Pascal (2016).
- fanless: a card with only a heatsink and no fan; the server's own fans push air through it.
- cooling: removing the heat a GPU makes; a GeForce card uses its own fans, a data center card relies on the server.
