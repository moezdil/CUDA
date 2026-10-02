# 11 > Reading the Volta White Paper

This lesson walks through the V100 white paper. It shows what Volta changed and why it matters for GPUs (Graphics Processing Units) today.

## Why Read a Real White Paper

A white paper shows the hardware design directly, without simplification. Volta is one of the most important examples. The V100 white paper shows the moment GPUs changed direction.

## Start With Key Features

Do not jump straight into diagrams or numbers. Start with the "Key Features" section. It is short and shows what the architecture is trying to do.

For Volta, the focus is clear. The architecture is built for AI (artificial intelligence). This is a change in purpose, not just an improvement over the previous generation.

## Tensor Cores

The most important change in Volta is Tensor Cores.

Before Volta, GPUs ran matrix operations on general CUDA cores. That worked, but it was not efficient. Volta gives matrix operations their own dedicated hardware: the V100 has 640 Tensor Cores, 8 in each of its 80 SMs.

From here, the GPU is no longer just a general compute device. It is designed for AI workloads from the ground up.

## The Streaming Multiprocessor (SM)

The Streaming Multiprocessor (SM) is the core building block of the GPU. Volta has a redesigned SM, split into four processing blocks, each with its own warp scheduler.

A key improvement is that different types of operations can run at the same time. In Pascal, integer and floating point operations shared one execution path and had to take turns. In Volta, they run in parallel.

Modern workloads often mix different types of operations. So this change makes better use of the hardware.

<volta-shift></volta-shift>

## Instruction Speed

A new architecture does not only add cores. It also makes existing operations faster.

In Volta, many instructions finish in fewer cycles than in Pascal. Ampere and Hopper improve this further. This pattern continues into 2026. Progress is about efficiency, not only scale.

## Memory

Volta uses HBM2 (High Bandwidth Memory 2) memory: 16 or 32 GB at 900 GB/s on the V100. That is higher memory bandwidth than earlier generations.

Modern GPU workloads are often limited by how fast data moves, not only by how fast it is processed. Higher bandwidth feeds more data to the compute units without waiting.

## NVLink

Volta introduces the second generation of NVLink. NVLink connects GPUs to each other at high speed.

Volta increases both the number of links and their speed: the V100 has six NVLink links with 300 GB/s in total. This makes multi-GPU systems much more efficient.

> [!NOTE]
> In 2026, large AI systems based on Hopper and Blackwell depend on this idea even more. Volta was one of the first steps in that direction.

## Transistor Count

The transistor count shows how much hardware is inside a GPU. The V100 has around 21 billion transistors.

> [!NOTE]
> Hopper reaches around 80 billion transistors in the H100. Blackwell goes further: the B200 puts 208 billion transistors on two dies that work as one GPU.

This growth is not only about size. It reflects new units, new memory systems and more advanced execution models.

## The Same Structure Every Time

White papers for different architectures use a similar structure:

1. New features
2. SM design
3. Performance comparisons
4. Technical specifications

Once you can read one white paper, the others become much easier.

## Volta's Role

Looking back from 2026, Volta is more than a strong GPU of its time. It is the point where GPUs became AI-focused. Ampere, Hopper and now Blackwell all build on this idea and push it further.

Reading the V100 white paper helps you understand why GPUs look the way they do today.

> [!TIP]
> An example: https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf

## Glossary

- white paper: an official technical document that shows how a GPU architecture is built, without simplification.
- Volta: Nvidia's 2017 architecture (V100, CC 7.0), the first one with Tensor Cores.
- V100: the Volta GPU whose white paper this lesson walks through.
- Key Features: a short white paper section that shows what the architecture is trying to do.
- architecture: the hardware design of a GPU family; Volta, Ampere and Hopper are architectures.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math.
- generation: one release step of GPUs; Volta followed the Pascal generation.
- Tensor Cores: dedicated hardware for matrix operations. Volta was the first to have them.
- matrix operations: math on whole grids of numbers, mainly matrix multiplication, which is most of the work in AI.
- CUDA cores: the general-purpose arithmetic units of the GPU, which ran matrix math before Tensor Cores existed.
- workload: the kind of work a program gives the GPU, such as training a neural network.
- Streaming Multiprocessor (SM): the core building block of the GPU. Volta has a redesigned SM.
- Pascal: Nvidia's 2016 architecture (P100), the generation before Volta.
- integer: a whole number such as 7 or -3; GPU code uses integer math all the time for indexes and addresses.
- floating point: a number with a decimal point, such as 3.14; most graphics and AI math uses it.
- parallel: running at the same time, here integer and floating point operations side by side.
- instruction: one basic command the GPU runs, such as an add or a multiply.
- cycle: one tick of the GPU clock; at 1.5 GHz there are 1.5 billion cycles every second.
- efficiency: getting more work done with the same hardware, time or power.
- Ampere / Hopper / Blackwell: the Nvidia architectures after Volta (2020, 2022, 2024), each building on its Tensor Cores.
- HBM2 (High Bandwidth Memory 2): the memory Volta uses, 900 GB/s on the V100, higher than earlier generations.
- GB/s: gigabytes per second, the unit of memory and link speed.
- warp scheduler: the unit that picks which group of 32 threads runs next; each Volta SM has four.
- GPU (Graphics Processing Unit): a processor built to run many simple tasks in parallel.
- memory bandwidth: how fast data moves to the compute units. Higher bandwidth means less waiting.
- NVLink: a high-speed link that connects GPUs to each other. Volta has its second generation.
- multi-GPU: several GPUs in one machine working on one job and constantly exchanging data.
- transistor count: how much hardware is inside a GPU. The V100 has around 21 billion transistors, the B200 208 billion.
