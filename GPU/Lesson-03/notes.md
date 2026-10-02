# 03 > Reading GPU Specs

A spec page lists dozens of numbers, and most of them do not matter on day one. This lesson shows where to find the specs of any GPU, which three questions to answer first, and why the biggest number on the page, the core count, often misleads, and ends by reading the L40S that runs every example on this site.

## Finding the Specs

The quickest way is a web search for the GPU name plus "TechPowerUp", for example "A100 TechPowerUp" or "RTX 5090 TechPowerUp". TechPowerUp keeps a large GPU database with detailed specs from every manufacturer. NVIDIA's own product page and datasheet are the official source when two sites disagree.

The page shows many numbers. Do not try to understand all of them yet. Start with the chip name, the architecture and the product category.

> [!TIP]
> For the CC, the number CUDA cares about and the topic of [Lesson 05](../Lesson-05/notes.md), check NVIDIA's list at developer.nvidia.com/cuda-gpus. On a machine with an NVIDIA GPU, `nvidia-smi --query-gpu=name,compute_cap --format=csv` prints the name and CC of every GPU in it; on this site's machine the line reads `NVIDIA L40S, 8.9`.

## Architecture and Category

[Lesson 02](../Lesson-02/notes.md) explained the two words. As a reminder:

- Architecture → how the GPU is built (Ampere, Ada Lovelace, Hopper, Blackwell).
- Category → where it is used, which these lessons also call the generation (GeForce, Data Center GPU).

The RTX 3090 and the A100 are a classic pair from 2020. Both use Ampere, so they share the technical design. The RTX 3090 is a GeForce card for desktops, laptops and workstations: gaming, content creation and general GPU tasks. The A100 is a Data Center GPU for servers, data centers and supercomputers.

Same architecture does not mean same purpose, and the specs show it.

> [!NOTE]
> Older material often calls the data center category "Tesla". NVIDIA dropped that name with the A100 and now names data center products by chip, such as H100, B200 or B300.

## Comparing RTX 3090 and A100

First, read the chip name: RTX 3090 → GA102, A100 → GA100. "GA" stands for Ampere. [Lesson 02](../Lesson-02/notes.md) shows how one architecture is cut into several chips.

Next, the core count:

- RTX 3090 → 10,496 cores
- A100 → 6,912 cores

That number is simply SMs times cores per SM. A worked example:

- RTX 3090: 82 SMs * 128 cores = 10,496
- A100: 108 SMs * 64 cores = 6,912

So the RTX 3090 has fewer SMs, but each of its SMs counts twice as many cores. This does not make it the stronger GPU. These "cores" are only the single-precision cores, which NVIDIA calls CUDA cores. They do standard floating-point math, and they are not every core in the GPU.

Modern GPUs also have cores for integer math, cores for double-precision math, and Tensor Cores built for the matrix math behind AI. The A100 has 432 Tensor Cores against 328 on the RTX 3090, and in double precision it does 9.7 TFLOPS while the RTX 3090 does about 0.56 TFLOPS: 9.7 / 0.56 = about 17 times faster.

Memory differs too: 40 GB of HBM2 at 1,555 GB/s on the A100, against 24 GB of GDDR6X at 936 GB/s on the RTX 3090. [Lesson 06](../Lesson-06/notes.md) explains why memory bandwidth often decides speed.

<gpu-compare></gpu-compare>

## The Same Pattern Today

The current pair is the RTX 5090 and the B200. Both use Blackwell. The RTX 5090 is a GeForce card for gaming, creators and local AI; the B200 is a data center GPU for AI training and inference in servers.

| | RTX 5090 | B200 |
|---|---|---|
| Category | GeForce (consumer) | Data center |
| Chip | GB202 | two GB100 dies in one package |
| CUDA cores | 21,760 | 18,944 |
| Memory | 32 GB GDDR7 | 180 GB HBM3e |
| Memory bandwidth | 1,792 GB/s | 8 TB/s |
| Transistors | about 92 billion | 208 billion |

The consumer card has more CUDA cores. The data center GPU has 180 / 32 = about 5.6 times the memory and 8,000 / 1,792 = about 4.5 times the bandwidth. For large AI models, memory and bandwidth decide more than the core count.

## Do Not Compare Only Core Counts

A core count like 6,912 or 21,760 looks convincing, but it usually counts one kind of unit only: the FP32 CUDA cores. It leaves out the Tensor Cores, the double-precision units and other special units.

Modern GPUs, especially Hopper and Blackwell, put a large part of their power into those other units. The B200 has fewer CUDA cores than the RTX 5090, yet it trains large AI models far faster, because its Tensor Cores and its memory system are built for exactly that job. So never judge a GPU by the core count alone.

## Telling Them Apart by Looks

You can often tell the category just by looking at the card.

Data center GPUs such as the P100, V100, A100, H100 or B200 usually have no fan of their own. They are compact and fanless, and they run in data centers with strong external cooling: the server pushes air through a heatsink, or liquid flows through a cold plate.

> [!NOTE]
> Many data center GPUs are not plug-in cards at all. The A100, H100 and B200 mostly come as SXM modules mounted flat on the server board, often with liquid cooling in newer racks.

GeForce cards have large fans and heatsinks. They run in desktop PCs and personal workstations, which must handle their own heat, so the card cools itself.

This gives a simple shortcut:

- Large visible fans → most likely a consumer GPU.
- A compact module or a card without fans → probably a data center GPU.

> [!WARNING]
> This is a rule of thumb, not a law. Some data center GPUs come as normal PCIe cards. The L40S is one: a passive, dual-slot PCIe card with no fan, cooled by the server. Always confirm with the product name.

<spec-reader></spec-reader>

## Reading the L40S

Put it together on the GPU behind every example on this site. Search "L40S TechPowerUp" or open NVIDIA's datasheet and answer the three questions:

- Architecture → Ada Lovelace, chip AD102, CC 8.9.
- Category → Data Center GPU, a passive PCIe card.
- Built for → AI inference and graphics in servers.

Now the numbers. The L40S has 142 SMs with 128 FP32 cores each: 142 * 128 = 18,176 CUDA cores. It also has 568 Tensor Cores (4 per SM: 142 * 4 = 568) and 48 GB of GDDR6 at 864 GB/s. The H100 SXM has fewer CUDA cores (16,896) but HBM3 at 3.35 TB/s, about 3.9 times the bandwidth, which is why it is the faster choice for training.

## Ask the Right Questions

You do not need every number. Ask these questions instead:

- What architecture does this GPU use?
- What category does it belong to?
- What kind of problem is it designed to solve?

With these answers, the rest of the specs make sense. For CUDA work, the CC tells you which features you can use ([Lesson 05](../Lesson-05/notes.md)), and the SM count and memory bandwidth tell you how much work a kernel needs to keep the GPU busy ([Lesson 06](../Lesson-06/notes.md)).

## Glossary

- GPU (Graphics Processing Unit): the chip that runs thousands of small calculations at once, first built for graphics and now used for AI and science.
- spec (specification): one published technical number of a GPU, such as its core count, memory size or clock speed.
- TechPowerUp: a website with a large GPU database. Search the GPU name with "TechPowerUp" to find its page.
- datasheet: the manufacturer's official spec document for a product, the source to trust when two sites disagree.
- CC (compute capability): NVIDIA's version number for a GPU's feature set, such as 8.0 for the A100 and 8.9 for the L40S ([Lesson 05](../Lesson-05/notes.md)).
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs, both GeForce and data center ones.
- nvidia-smi: NVIDIA's command-line tool that lists the GPUs in a machine and their state.
- architecture: how the GPU is built, such as Ampere or Blackwell.
- category: where the GPU is used, such as consumer use or the data center; these lessons also call it the generation.
- generation: in these lessons, the product family of a GPU, such as GeForce or Data Center GPU.
- Ampere: the 2020 architecture shared by the RTX 3090 and the A100.
- RTX 3090: a GeForce GPU from 2020 with 82 SMs, 10,496 cores and 24 GB of GDDR6X memory, based on Ampere.
- A100: an NVIDIA data center GPU from 2020 with 108 SMs, 6,912 single-precision cores and 432 Tensor Cores, based on Ampere.
- GeForce: NVIDIA's consumer GPUs for gaming and personal workstations, with built-in fans.
- workstation: a powerful desktop computer for professional work such as 3D design or engineering.
- Data Center GPU: an NVIDIA GPU for servers, such as the A100 or B200, usually without a fan of its own.
- Tesla: the old name of NVIDIA's data center GPUs, used up to the V100 and T4.
- data center: a building full of servers, cooled by strong fans, air conditioning or liquid cooling.
- supercomputer: thousands of connected servers that work together as one machine on huge problems.
- chip name: the name of the chip inside a GPU, such as GA100 for the A100 or AD102 for the L40S.
- core count: the number of cores in the specs, usually of one type only; it does not tell the full story.
- SM (Streaming Multiprocessor): a block of cores inside a GPU; core count = SMs * cores per SM.
- single-precision cores: cores for 32-bit floating-point math, usually the only ones in the core count.
- CUDA cores: NVIDIA's name for the FP32 units of a GPU, 18,176 on the L40S.
- floating-point: numbers with a decimal point, such as 3.14; single precision stores one in 32 bits, double precision in 64 bits.
- FP32 (32-bit floating point): single-precision math, the kind of unit a core count usually counts.
- double-precision: 64-bit floating-point math, used in scientific work; the A100 is about 17 times faster at it than the RTX 3090.
- Tensor Cores: units that do the matrix math behind AI; the core count leaves them out.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math.
- TFLOPS (teraFLOPS): a trillion floating-point operations per second.
- HBM2 / HBM3 / HBM3e (High Bandwidth Memory): stacked memory next to the chip on data center GPUs, faster than the GDDR memory on GeForce cards; HBM2, HBM3 and HBM3e are its versions.
- memory bandwidth: how much data the memory can deliver per second, for example 864 GB/s on the L40S and 8 TB/s on the B200.
- RTX 5090: a GeForce GPU from 2025 based on Blackwell, with 21,760 CUDA cores and 32 GB of GDDR7 memory.
- B200: a Blackwell data center GPU with two dies, 208 billion transistors and 180 GB of HBM3e memory.
- Blackwell: the NVIDIA architecture from 2024 and 2025 used in the RTX 50 series, the RTX PRO cards and the B200.
- GDDR7: the graphics memory of the RTX 50 series, fast but far smaller and slower than the HBM of data center GPUs.
- Hopper: NVIDIA's 2022 data center architecture, used in the H100, full of Tensor Cores.
- fanless: a card with only a heatsink and no fan; the server's own fans push air through it.
- cooling: removing the heat a GPU makes, with the card's own fans, the server's airflow or liquid.
- V100 / P100: older NVIDIA data center GPUs, based on Volta (2017) and Pascal (2016).
- SXM (Server PCI Express Module): NVIDIA's module form for data center GPUs, mounted flat on the server board instead of in a PCIe slot.
- PCIe (Peripheral Component Interconnect Express): the standard slot and link that connects a card to the rest of the computer; the L40S uses PCIe 4.0 x16.
- passive: cooling with a heatsink only, no fan on the card; the L40S is cooled this way.
- L40S: the data center GPU used on this site: Ada Lovelace, CC 8.9, 142 SMs, 48 GB of GDDR6 at 864 GB/s.
- Ada Lovelace: NVIDIA's 2022 architecture for the RTX 40 series and the L40S.
- H100: a Hopper data center GPU; the SXM version has 132 SMs, 16,896 CUDA cores and HBM3 at 3.35 TB/s.
- kernel: a function that runs on the GPU, started by the CPU across many threads.
