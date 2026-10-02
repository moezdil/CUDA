# Architecture vs Generation

This lesson explains the difference between a GPU architecture and a GPU generation. The two terms sound similar, but they mean different things.

## GPU and CUDA

A GPU (Graphics Processing Unit) is a processor built to run many operations at the same time. It was first made for graphics. Today it is also used for AI, simulations, data processing and large-scale computation.

CUDA is Nvidia's way of programming GPUs. It lets you use the GPU for general computation, not just graphics.

## Architecture

Architecture is the internal design of the GPU chip. It defines not only the cores, but also:

- how they are organized  
- how data flows  
- how memory is accessed  
- how parallel work is executed  

Think of it as the engine design. Two GPUs can look alike from the outside but behave very differently because of their architecture.

Architecture directly affects:

- performance  
- efficiency  
- supported features  

Each new architecture is usually a real shift, not a small upgrade. Some architectures improved raw performance. Others focused on efficiency. Newer ones focus on AI and large-scale workloads. Features like ray tracing and AI acceleration are introduced at the architecture level.

Nvidia releases a new architecture about every one or two years. This is one main reason GPUs evolve so fast.

## Generation

Generation is not about how the GPU is built. It is about where the GPU is used.

Nvidia GPUs serve two main worlds. The first is everyday users:

- gaming  
- content creation  
- general graphics  

The second is:

- cloud systems  
- data centers  
- AI training  
- scientific computing  

This second world is called HPC, or High Performance Computing.

## Product Names

Nvidia uses different names depending on where the GPU is used:

- Tegra is for mobile and embedded systems.  
- GeForce is for consumer GPUs.  
- RTX is for professional workloads.  
- Data Center GPUs are for servers. Today we see models like A100, H100 and newer ones.  

> [!NOTE]
> You may still see two older names. Quadro was the old brand for professional GPUs, and RTX replaced it. Data center GPUs used the "Tesla" name in the past, but that name is mostly gone.

This shows a shift from general compute to AI and cloud infrastructure.

## Architecture and Generation Are Independent

Architecture describes how the GPU is built. Generation describes where it is used. So the same architecture can appear in very different products.

For example, the RTX 3090 and the A100 are both based on Ampere. The RTX 3090 is for personal use. The A100 is for large-scale computing. They share an architecture but serve different purposes.

<arch-matrix></arch-matrix>

## GPU Categories

GPUs are built for different environments:

- small, portable systems  
- personal computers  
- professional workloads  
- large data centers  

Each environment has different needs, limits and priorities. Nvidia adapts the same architecture to fit all of them.

## A Simple Rule

- How is the GPU built? → architecture  
- Where is the GPU used? → generation  

## Why This Matters

This rule makes GPU names easier to read. It also prevents a common mistake, which is thinking two GPUs are similar just because they share an architecture. These differences matter a lot once you start programming GPUs with CUDA.

## Glossary

- GPU (Graphics Processing Unit): a processor built to run many operations at the same time.
- CUDA: Nvidia's way of programming GPUs for general computation, not just graphics.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math, which is why GPUs matter so much for it.
- architecture: the internal design of the GPU chip, like the design of an engine.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- ray tracing: a way to draw 3D scenes by following rays of light as they bounce, giving realistic shadows and reflections; RTX GPUs have dedicated hardware for it.
- generation: where a GPU is used, such as gaming or data centers.
- data center: a building full of servers, often with thousands of GPUs, that runs cloud services and AI training.
- HPC: High Performance Computing, meaning cloud systems, data centers, AI training and scientific computing.
- Tegra: Nvidia's product name for GPUs in mobile and embedded systems.
- embedded system: a small computer built into a device, such as a robot, a car or a drone.
- GeForce: Nvidia's brand for consumer GPUs, used for gaming and personal computers.
- RTX: Nvidia's name for GPUs with ray tracing hardware, used for both GeForce cards (RTX 3090) and professional cards.
- Data Center GPU: an Nvidia GPU for servers, such as the A100 or H100.
- Ampere: an Nvidia architecture used in both the RTX 3090 and the A100.
- A100: an Nvidia data center GPU from 2020, based on Ampere and built for AI training and HPC.
