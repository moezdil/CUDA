# 02 > Architecture vs Generation

This lesson explains the difference between a GPU architecture and a GPU generation. The two terms sound similar, but they mean different things. Knowing both lets you read any NVIDIA product name and tell what kind of chip is inside.

## GPU and CUDA

A GPU (Graphics Processing Unit) is a processor built to run many operations at the same time. It was first made for graphics. Today it is also used for AI (artificial intelligence), simulations, data processing and large-scale computation.

CUDA (Compute Unified Device Architecture) is NVIDIA's way of programming GPUs. It lets you use the GPU for general computation, not just graphics.

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

NVIDIA used to release a new architecture every two years or so. For data center GPUs it now moves about once a year: Blackwell (2024), Blackwell Ultra (2025), Rubin (shipping since 2026), with Rubin Ultra (2027) and Feynman (2028) announced. This is one main reason GPUs evolve so fast.

## Generation

In these lessons, generation is not about how the GPU is built. It is about where the GPU is used.

> [!NOTE]
> Outside these lessons, people often say "generation" for an architecture too, as in "the Blackwell generation". Here it means the product family a GPU belongs to, such as GeForce or Data Center.

NVIDIA GPUs serve two main worlds. The first is everyday users:

- gaming  
- content creation  
- general graphics  

The second is:

- cloud systems  
- data centers  
- AI training  
- scientific computing  

This second world is called HPC (High Performance Computing).

## Product Names

NVIDIA uses different names depending on where the GPU is used:

- Jetson is for robots and embedded systems. Its chips are called Tegra, and the newest module, Jetson AGX Thor (2025), uses Blackwell.  
- GeForce is for consumer GPUs. The current cards are the GeForce RTX 50 series, such as the RTX 5090.  
- RTX PRO is for professional workstations, such as the RTX PRO 6000 Blackwell (2025).  
- Data Center GPUs are for servers: A100 (Ampere), H100 and H200 (Hopper), B200 and B300 (Blackwell), and now Rubin.  

> [!NOTE]
> You may still see older names. Quadro was the old brand for professional GPUs; it became "NVIDIA RTX" (RTX A6000, RTX 6000 Ada) and in 2025 "RTX PRO". Data center GPUs were sold under the "Tesla" name up to the V100 and T4; the A100 dropped it.

This shows a shift from general compute to AI and cloud infrastructure.

## Architecture and Generation Are Independent

Architecture describes how the GPU is built. Generation describes where it is used. So the same architecture can appear in very different products.

For example, the RTX 3090 and the A100 are both based on Ampere. The RTX 3090 is for personal use. The A100 is for large-scale computing. They share an architecture but serve different purposes. The same holds today: the RTX 5090, the RTX PRO 6000, the B200 and Jetson AGX Thor are all Blackwell.

<arch-matrix></arch-matrix>

Same architecture does not even mean the same CC (compute capability), the version number CUDA uses for a chip's features. The A100 is CC 8.0 and the RTX 3090 is CC 8.6, both Ampere. The B200 is CC 10.0 and the RTX 5090 is CC 12.0, both Blackwell.

> [!TIP]
> The CC, not the product name, decides which CUDA features a GPU supports. When you compile CUDA code, you target a CC.

## GPU Categories

GPUs are built for different environments:

- small, portable systems  
- personal computers  
- professional workloads  
- large data centers  

Each environment has different needs, limits and priorities. NVIDIA adapts the same architecture to fit all of them.

## A Simple Rule

- How is the GPU built? → architecture  
- Where is the GPU used? → generation  

## Why This Matters

This rule makes GPU names easier to read. It also prevents a common mistake, which is thinking two GPUs are similar just because they share an architecture. These differences matter a lot once you start programming GPUs with CUDA.

## Glossary

- GPU (Graphics Processing Unit): a processor built to run many operations at the same time.
- CUDA (Compute Unified Device Architecture): NVIDIA's way of programming GPUs for general computation, not just graphics.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math, which is why GPUs matter so much for it.
- architecture: the internal design of the GPU chip, like the design of an engine.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- ray tracing: a way to draw 3D scenes by following rays of light as they bounce, giving realistic shadows and reflections; RTX GPUs have dedicated hardware for it.
- Blackwell: the NVIDIA architecture from 2024, used in the RTX 50 series, RTX PRO 6000, B200, B300 and Jetson AGX Thor.
- Rubin: the NVIDIA data center architecture after Blackwell, shipping since 2026.
- generation: in these lessons, where a GPU is used, such as gaming or data centers.
- data center: a building full of servers, often with thousands of GPUs, that runs cloud services and AI training.
- HPC (High Performance Computing): cloud systems, data centers, AI training and scientific computing.
- Jetson: NVIDIA's product line for robots and embedded systems, built on Tegra chips.
- Tegra: NVIDIA's name for the chips that combine CPU and GPU in Jetson modules.
- embedded system: a small computer built into a device, such as a robot, a car or a drone.
- GeForce: NVIDIA's brand for consumer GPUs, used for gaming and personal computers.
- RTX PRO: NVIDIA's brand for professional workstation GPUs since 2025, the successor of Quadro.
- Quadro: the old brand of NVIDIA's professional GPUs, replaced by NVIDIA RTX and then RTX PRO.
- Data Center GPU: an NVIDIA GPU for servers, such as the A100, H100 or B200.
- Tesla: the old name of NVIDIA's data center GPUs, last used for the V100 and T4.
- Ampere: an NVIDIA architecture used in both the RTX 3090 and the A100.
- A100: an NVIDIA data center GPU from 2020, based on Ampere and built for AI training and HPC.
- CC (compute capability): the version number CUDA gives a GPU's feature set, such as 8.0 for the A100 or 12.0 for the RTX 5090.
