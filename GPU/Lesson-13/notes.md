# 13 > Reading White Papers

This lesson explains what GPU white papers are, how to find them and how to read them. A white paper is the best place to learn what really changed in a new GPU generation. The second half walks through a real one, the V100 white paper, which documents the moment GPUs turned toward AI.

## What a White Paper Is

A white paper is an official technical document about a GPU architecture. It can feel heavy and too detailed at first, but it is the most accurate source about a GPU. It has no marketing and no simplification, and it shows how the hardware is actually built.

## Finding a White Paper

Take the chip name and add "white paper", for example `GA100 white paper` or `H100 white paper`. For the newest architectures NVIDIA often calls the document a technical brief, such as the "NVIDIA Blackwell Architecture Technical Brief", so search for that name too. [Lesson 03](../Lesson-03/notes.md) shows how to find the chip name behind a product.

> [!TIP]
> Not every result is useful. Blog posts, summaries and comparisons can help, but they are not enough. Always look for the official PDF file from NVIDIA.

## A Consistent Structure

NVIDIA white papers follow a consistent structure. Each new architecture is explained against the previous generation, so a white paper shows both what is new and what changed. The Hopper white paper compares the H100 with the A100 in table after table, and the V100 white paper compares the V100 with the P100. This is why the same tables appear in different white papers.

Architectures change, but the order of the sections stays the same.

1. New features
2. SM design
3. Performance comparisons
4. Technical specifications

This consistency is on purpose. Once you understand one white paper well, the others become much easier to read.

<whitepaper-map></whitepaper-map>

## The Streaming Multiprocessor

The most important section in a white paper is the Streaming Multiprocessor. The SM is the core building block of the GPU. It brings together the CUDA cores, the Tensor Cores, scheduling and memory access.

To see what really changed in an architecture, look at the SM. Across generations the Tensor Cores tell the story.

- Pascal has no Tensor Cores. It is still mostly a general-purpose compute architecture.
- Volta introduces them. GPUs become explicitly optimized for AI workloads.
- Ampere improves and scales them, with more throughput, better efficiency and sparsity support.
- Hopper optimizes them for transformer workloads and adds FP8.
- Blackwell extends them with new instructions and formats like NVFP4, which bring ultra-low precision directly into hardware.
- Blackwell Ultra (the B300, 2025) adds more memory, 288 GB of HBM3e per GPU, and more NVFP4 throughput.
- Rubin is next, with HBM4 memory. [Lesson 04](../Lesson-04/notes.md) covers where it stands in 2026.

Each step changes what the GPU is designed to do. GPUs are no longer just compute devices. They are infrastructure for AI systems.

<arch-timeline focus="Pascal"></arch-timeline>

## The Volta White Paper as a Worked Example

Volta (2017) is the best white paper to practise on, because it shows the moment GPUs changed direction. The PDF is at https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf. Read it next to this section.

### Start With Key Features

Do not jump straight into diagrams or numbers. Start with the "Key Features" section. It is short and shows what the architecture is trying to do. For Volta the focus is clear, the architecture is built for AI. This is a change in purpose, not just an improvement over the Pascal generation.

### Tensor Cores

The most important change in Volta is Tensor Cores. Before Volta, GPUs ran matrix operations on the general CUDA cores. That worked, but it was not efficient. Volta gives matrix operations their own dedicated hardware. The V100 has 80 SMs with 8 Tensor Cores each, so 80 * 8 = 640 Tensor Cores.

The white paper gives enough numbers to check its own headline. Each Tensor Core does 64 FMA operations per clock, and one FMA counts as 2 floating point operations.

- Tensor Cores do 640 * 64 * 2 = 81,920 operations per clock. At the 1.53 GHz boost clock that is 81,920 * 1.53 billion ≈ 125 TFLOPS.
- CUDA cores number 80 SMs * 64 FP32 cores = 5,120 cores. 5,120 * 2 * 1.53 billion ≈ 15.7 TFLOPS.

So for matrix math the Tensor Cores offer 125 / 15.7 ≈ 8 times the peak of the same chip's CUDA cores. From here the GPU is no longer just a general compute device. It is designed for AI workloads from the ground up. [Lesson 10](../Lesson-10/notes.md) explains how Tensor Cores and their number formats work.

### The SM

Volta has a redesigned SM. It is split into four processing blocks, each with its own warp scheduler, 16 FP32 cores, 16 INT32 cores and 2 Tensor Cores.

A key improvement is that different types of operations can run at the same time. Pascal could not run FP32 and INT32 instructions at the same time, so integer and floating point work had to take turns. Volta has separate paths, so they run in parallel. Modern workloads mix both all the time, since every array index and address is integer math, so this change makes better use of the hardware.

<volta-shift></volta-shift>

In the diagram, 10 instructions arrive, 6 floating point and 4 integer. On the shared Pascal path they need 6 + 4 = 10 cycles. On Volta's two paths they need max(6, 4) = 6 cycles. This is a simplified picture, but the saving is real.

### Instruction Speed

A new architecture does not only add cores. It also makes existing operations faster. The white paper states that a dependent FMA needs 4 cycles on Volta, compared to 6 cycles on Pascal. Ampere and Hopper improve such details further. Progress is about efficiency, not only scale.

### Memory

Volta uses HBM2, with 16 or 32 GB at 900 GB/s on the V100, higher memory bandwidth than earlier generations. Modern GPU workloads are often limited by how fast data moves, not only by how fast it is processed. [Lesson 06](../Lesson-06/notes.md) explains memory bandwidth in detail.

### NVLink

Volta introduces the second generation of NVLink, the link that connects GPUs to each other at high speed. The V100 has six NVLink links with 300 GB/s in total, which makes multi-GPU systems much more efficient. Large Hopper and Blackwell systems depend on this idea even more. [Lesson 12](../Lesson-12/notes.md) shows how many GPUs work together.

### Transistor Count

The transistor count shows how much hardware is inside a GPU. The V100 has 21.1 billion transistors.

> [!NOTE]
> The H100 reaches about 80 billion transistors. The B200 puts 208 billion transistors on two dies that work as one GPU. That is almost 10 times the V100 in seven years, and the growth reflects new units, new memory systems and new execution models, not only size.

### Volta's Role

Looking back from 2026, Volta is more than a strong GPU of its time. It is the point where GPUs became AI-focused. Ampere, Hopper and Blackwell all build on this idea and push it further. Reading the V100 white paper helps you understand why GPUs look the way they do today.

> [!WARNING]
> Volta, with compute capability 7.0, is a history lesson, not a target. CUDA 13 supports only Turing (CC 7.5) and newer, so a V100 needs an older CUDA 12 toolkit. [Lesson 05](../Lesson-05/notes.md) explains compute capability.

## Why This Matters for CUDA

The white paper of your own GPU tells you what a kernel can expect from each SM. For the L40S on this machine that is the Ada Lovelace white paper. Its SM has the same four processing blocks as Volta, but each block has 16 FP32-only cores and 16 cores that run either FP32 or INT32. Per SM that is 4 * 32 = 128 FP32 cores, and 142 * 128 = 18,176 for the whole L40S.

The catch is in the word "or". In a cycle where the shared half runs integer index math, only the 64 FP32-only cores of that SM do floating point work. The spec sheet counts all 128. The white paper is where you learn which number your loop will really see.

> [!TIP]
> When you meet a new GPU, read its white paper's SM section before writing kernels for it. The NVIDIA Ada GPU Architecture white paper is the one for the L40S, RTX 4090 and RTX 6000 Ada.

## How to Read One

Reading white papers is not about memorizing numbers. It is about understanding change. Read the Key Features to learn the purpose, look at the SM and find the new hardware units, compare them with the previous generation in the tables, and check the headline numbers yourself, as in the Volta example.

## Glossary

- white paper: an official technical document that shows how a GPU architecture is actually built, without marketing or simplification.
- GPU (Graphics Processing Unit): a processor built to run many simple tasks in parallel.
- architecture: the hardware design of a GPU family, such as Volta, Ampere or Hopper. Each one gets its own white paper.
- generation: one release step of GPUs. A white paper compares each new architecture with the previous generation.
- chip name: the name of the silicon inside a GPU, which is what you search for, such as GA100.
- H100: NVIDIA's Hopper data center GPU from 2022.
- technical brief: the name NVIDIA uses for the architecture document of its newest GPUs, such as Blackwell.
- PDF (Portable Document Format): the file format NVIDIA publishes its white papers in.
- Key Features: a short white paper section that shows what the architecture is trying to do.
- Streaming Multiprocessor (SM): the core building block of the GPU. It brings together CUDA cores, Tensor Cores, scheduling and memory access.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for programs that run on the GPU. It also gives the CUDA cores their name.
- CUDA cores: the general-purpose arithmetic units inside each SM, which ran matrix math before Tensor Cores existed.
- Tensor Cores: dedicated hardware for matrix operations. Volta was the first architecture to have them.
- scheduling: deciding which group of threads runs next on the SM's units. Each SM has several schedulers doing this every cycle.
- warp scheduler: the unit that picks which group of 32 threads runs next. Each Volta SM has four, one per processing block.
- processing block: one of the four parts an SM is split into since Volta, each with its own warp scheduler and cores.
- Pascal: NVIDIA's 2016 architecture (P100), mostly general-purpose, with no Tensor Cores. It is the generation before Volta.
- Volta: NVIDIA's 2017 architecture (V100, CC 7.0), the first one with Tensor Cores.
- compute capability (CC): the version number of a GPU's feature set. Volta is 7.0, Turing 7.5, the L40S 8.9.
- V100: the Volta GPU whose white paper this lesson walks through, with 80 SMs, 640 Tensor Cores, 21.1 billion transistors.
- Ampere / Hopper / Blackwell: the NVIDIA architectures after Volta (2020, 2022, 2024), each building on its Tensor Cores.
- Blackwell Ultra: the B300 and GB300, an upgraded Blackwell with 288 GB of HBM3e per GPU.
- Rubin: the architecture after Blackwell, with HBM4 memory, arriving in data centers in 2026.
- Ada Lovelace: the 2022 architecture of the L40S and RTX 40 series, described in the NVIDIA Ada GPU Architecture white paper.
- AI (artificial intelligence): software that learns from data. Training it is mostly huge matrix math.
- workload: the kind of work a program gives the GPU, such as training a neural network.
- transformer: the neural network design behind modern language models, built mostly from large matrix multiplications.
- matrix operations: math on whole grids of numbers, mainly matrix multiplication, which is most of the work in AI.
- throughput: how much work the GPU can finish in a given time.
- sparsity support: an Ampere feature that skips zeros in a fixed 2-out-of-4 pattern, doubling Tensor Core throughput for such data.
- precision: how many bits each number uses. Fewer bits means faster math and less memory, but less accuracy.
- FP32 (32-bit floating point): the standard single precision number format, run on the CUDA cores.
- FP8 (8-bit floating point): a number format Hopper added for large-scale AI systems.
- NVFP4 (NVIDIA 4-bit floating point): a Blackwell format that brings ultra-low precision directly into hardware.
- INT32 (32-bit integer): the whole number format used for indexes and addresses.
- integer: a whole number such as 7 or -3. GPU code uses integer math all the time for indexes and addresses.
- floating point: a number with a decimal point, such as 3.14. Most graphics and AI math uses it.
- FMA (fused multiply-add): one instruction that computes a * b + c. It counts as 2 floating point operations.
- TFLOPS (tera floating point operations per second): trillions of floating point operations per second, the unit of peak compute.
- cycle: one tick of the GPU clock. At 1.53 GHz there are 1.53 billion cycles every second.
- HBM2 (High Bandwidth Memory 2): the memory Volta uses, 900 GB/s on the V100, higher than earlier generations.
- HBM3e (High Bandwidth Memory 3e): very fast memory stacked next to the GPU chip in current data center GPUs.
- memory bandwidth: how fast data moves to the compute units. Higher bandwidth means less waiting.
- NVLink: a high-speed link that connects GPUs to each other. Volta has its second generation.
- multi-GPU: several GPUs in one machine working on one job and constantly exchanging data.
- transistor count: how much hardware is inside a GPU. The V100 has 21.1 billion transistors, the B200 208 billion.
