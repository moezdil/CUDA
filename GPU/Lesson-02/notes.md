# 02 > Architecture, Generation and Chips

People say "GPU" (Graphics Processing Unit) for several different things: a design, a product family, a piece of silicon and the card you install. This lesson separates them into architecture, generation, chip and GPU. Once you can tell them apart, you can read any NVIDIA product name, spec sheet or data center part and know what is really inside. All of this matters for CUDA (Compute Unified Device Architecture), NVIDIA's way of programming GPUs for general computation, not just graphics.

## Architecture

Architecture is the internal design of the GPU chip. It defines not only the cores, but also:

- how they are organized  
- how data flows  
- how memory is accessed  
- how parallel work is executed  

Think of it as the engine design. Two GPUs can look alike from the outside but behave very differently because of their architecture. Architecture directly affects performance, efficiency and supported features. Features like ray tracing and AI (artificial intelligence) acceleration are introduced at the architecture level.

NVIDIA used to release a new architecture every two years or so. For data center GPUs it now moves about once a year: Blackwell (2024), Blackwell Ultra (2025) and Rubin (shipping since the second half of 2026), with Rubin Ultra (2027) and Feynman (2028) announced. [Lesson 04](../Lesson-04/notes.md) walks through all of them.

## Generation

In these lessons, generation is not about how the GPU is built. It is about where the GPU is used.

> [!NOTE]
> Outside these lessons, people often say "generation" for an architecture too, as in "the Blackwell generation". Here it means the product family a GPU belongs to, such as GeForce or Data Center.

NVIDIA GPUs serve two main worlds. The first is everyday users: gaming, content creation and general graphics. The second is cloud systems, data centers, AI training and scientific computing. This second world is called HPC (High Performance Computing).

## Product Names

NVIDIA uses different names depending on where the GPU is used:

- Jetson is for robots and embedded systems. Its chips are called Tegra, and the newest module, Jetson AGX Thor (2025), uses Blackwell.  
- GeForce is for consumer GPUs. The current cards are the GeForce RTX 50 series, such as the RTX 5090.  
- RTX PRO is for professional workstations, such as the RTX PRO 6000 Blackwell (2025).  
- Data Center GPUs are for servers: A100 (Ampere), L40S (Ada Lovelace), H100 and H200 (Hopper), B200 and B300 (Blackwell), and now Rubin.  

You may still see older names. Quadro was the old brand for professional GPUs; it became "NVIDIA RTX" (RTX A6000, RTX 6000 Ada) and in 2025 "RTX PRO". Data center GPUs were sold under the "Tesla" name up to the V100 and T4; the A100 dropped it.

## Architecture and Generation Are Independent

Architecture describes how the GPU is built. Generation describes where it is used. So the same architecture can appear in very different products. The RTX 3090 (personal use) and the A100 (large-scale computing) are both Ampere. Today the RTX 5090, the RTX PRO 6000, the B200 and Jetson AGX Thor are all Blackwell.

<arch-matrix></arch-matrix>

Same architecture does not even mean the same CC (Compute Capability), the version number CUDA uses for a chip's features. The A100 is CC 8.0 and the RTX 3090 is CC 8.6, both Ampere. The B200 is CC 10.0 and the RTX 5090 is CC 12.0, both Blackwell, because they use different chips. [Lesson 05](../Lesson-05/notes.md) covers CC in depth.

> [!TIP]
> The CC, not the product name, decides which CUDA features a GPU supports. When you compile CUDA code, you target a CC.

Not every architecture covers both worlds. Ada Lovelace is mostly for consumer GPUs, with some server cards like the L40S. Hopper is only for data centers and AI training, which is why you do not see Hopper GPUs in normal PCs (Personal Computers). The difference is about purpose, not only performance.

## The GPU Chip

The GPU chip is the actual silicon where all computation happens. On its own it has no cooling, no connectors and no external memory modules. Inside it you find compute units doing parallel work, controllers managing how data moves, and internal logic coordinating everything.

The chip is the real "engine". The GA100 chip inside the A100, for example, is one piece of silicon with about 54 billion transistors.

## Chip Names

NVIDIA chip names link a chip to its architecture. The first letter is G (for GPU), the next letter or two name the architecture, and the number is the chip's place in that family:

- GF100 → Fermi  
- GA100 → Ampere  
- AD102 → Ada Lovelace (RTX 4090, L40S)  
- GB202 → Blackwell (RTX 5090)  

Read GB202 like this: G (GPU) + B (Blackwell) + 202 (one chip of the Blackwell family). So the prefix tells you the architecture before you look at any spec.

> [!WARNING]
> Not every name with these letters is a single GPU chip. GB200 is a "superchip": one Grace CPU (Central Processing Unit) and two Blackwell GPUs on one board. GH200 is the same idea with Hopper. When a name looks odd, check what it really is.

## The GPU

A GPU is the full product you use, a complete system built around the chip. It includes:

- the chip itself  
- VRAM, the GPU's own memory attached next to the chip  
- power delivery components  
- output interfaces (like HDMI (High-Definition Multimedia Interface) or DisplayPort)  
- a cooling system  

GeForce cards live in a normal PC case with no special cooling, so they must handle their own heat, and that heat is large: an RTX 5090 is rated for up to 575 W. That is why they carry large heatsinks and several fans.

Data center GPUs such as the A100 or L40S have no fan of their own. They live in a server rack, where airflow comes from the server's fans and cooling is handled at rack level. The newest racks, such as the GB200 NVL72 with 72 Blackwell GPUs, use liquid cooling. This makes the GPU simpler, more compact and better suited for scale.

<chip-vs-gpu></chip-vs-gpu>

Spec sites like TechPowerUp make the split visible: the page for the A100 names its chip, GA100, and links to a page for the bare chip. In short, chip = engine and GPU = complete machine.

## One Architecture, Many Chips

An architecture is not one chip. It is a family of chips that share the same base design. Ada Lovelace (2022) includes AD102, AD103 and AD104; the prefix "AD" links them before you read any spec. Blackwell consumer chips start with "GB": GB202 in the RTX 5090, GB203 in the RTX 5080 and GB205 in the RTX 5070.

The size of a chip is counted in SMs (Streaming Multiprocessors), the building blocks that hold the cores (see [Lesson 00](../Lesson-00/notes.md)). A full AD102 has 144 SMs, a full AD103 has 80 and a full AD104 has 60. So AD102 goes into top-tier GPUs, and AD104 into smaller, more efficient cards such as the RTX 4070 Ti.

## Same Chip, Different GPUs

One chip can end up in very different GPUs. A manufacturer can disable some cores, change power limits and tune clock speeds. The AD102 is a real example:

- RTX 4090: GeForce card with fans and HDMI, 128 of 144 SMs on, 450 W power limit, 24 GB of GDDR6X memory.  
- L40S: fanless data center card, 142 of 144 SMs on, 350 W power limit, 48 GB of GDDR6 memory.  

On the RTX 4090, 144 − 128 = 16 SMs are off, which is 16 / 144 ≈ 11% of the chip. On the L40S only 144 − 142 = 2 are off. Each Ada SM has 128 FP32 (32-bit floating point) cores, so the L40S has 142 × 128 = 18,176 of them and the RTX 4090 has 128 × 128 = 16,384. Chips with a few faulty SMs can still be sold this way, with those SMs turned off.

NVIDIA also does not build every final GPU itself. Board partners like ASUS, MSI or Gigabyte take the same chip and change the cooling design, the power configuration and the boost behavior. Same base chip, slightly different result.

<arch-family></arch-family>

## The Full Picture

A GPU is made of an architecture, a specific chip and a vendor-specific implementation, and it belongs to a generation that says where it is used.

> [!TIP]
> To decode any GPU, ask four questions: which architecture, which chip, which card, which generation. For the L40S used on this site that is Ada Lovelace, AD102 with 142 SMs on, a fanless NVIDIA card, and Data Center. For the RTX 5090 it is Blackwell, GB202, a card from NVIDIA or a board partner, and GeForce.

## Why This Matters

The architecture describes the chip, not the full product. Performance starts at the chip, but real behavior depends on how many SMs are on, the power limit, the clocks and the cooling. Two GPUs with the same architecture, or even the same chip, can be far apart. CUDA sees the chip through its CC and its SM count, which is why [Lesson 03](../Lesson-03/notes.md) reads spec sheets chip first.

## Glossary

- GPU (Graphics Processing Unit): the full product built around a chip, with memory, power parts, outputs and cooling.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing general programs that run on its GPUs.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math, which suits GPUs.
- architecture: the internal design shared by a family of chips, like the design of an engine.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- ray tracing: drawing 3D scenes by following rays of light as they bounce; RTX GPUs have dedicated hardware for it.
- Blackwell: the NVIDIA architecture from 2024, with data center chips (B200) and consumer chips (GB202 in the RTX 5090).
- Rubin: the NVIDIA data center architecture after Blackwell, shipping since the second half of 2026.
- generation: in these lessons, where a GPU is used, such as gaming or data centers.
- data center: a building full of servers, often with thousands of GPUs, that runs cloud services and AI training.
- HPC (High Performance Computing): cloud systems, data centers, AI training and scientific computing.
- Jetson: NVIDIA's product line for robots and embedded systems, built on Tegra chips.
- Tegra: NVIDIA's name for the chips that combine CPU and GPU in Jetson modules.
- embedded system: a small computer built into a device, such as a robot, a car or a drone.
- GeForce: NVIDIA's brand for consumer GPUs, which carry their own heatsinks and fans.
- RTX PRO: NVIDIA's brand for professional workstation GPUs since 2025, the successor of Quadro.
- Quadro: the old brand of NVIDIA's professional GPUs, replaced by NVIDIA RTX and then RTX PRO.
- Data Center GPU: an NVIDIA GPU for servers, such as the A100, L40S, H100 or B200.
- Tesla: the old name of NVIDIA's data center GPUs, last used for the V100 and T4.
- Ampere: an NVIDIA architecture from 2020 whose chips start with GA, used in both the RTX 3090 and the A100.
- A100: an NVIDIA data center GPU from 2020, built on the GA100 chip, with no fan of its own.
- CC (Compute Capability): the version number a GPU reports to CUDA, such as 8.9 for the L40S or 12.0 for the RTX 5090.
- Ada Lovelace: an NVIDIA architecture from 2022, mostly for consumer GPUs, with chips like AD102.
- Hopper: an NVIDIA architecture only for data centers and AI training, used in the H100.
- GPU chip: the actual silicon where all computation happens, with no cooling or connectors.
- silicon: the material chips are made from; the GA100 is one piece of silicon with about 54 billion transistors.
- prefix: the first letters of a chip name, like GA, AD or GB, which link the chip to its architecture.
- Fermi: an NVIDIA architecture from 2010 whose chips have names like GF100.
- GA100: the chip inside the A100; the G stands for GPU and the A for Ampere.
- AD102: the largest Ada Lovelace chip, with 144 SMs, used in the RTX 4090 and the L40S.
- AD104: a smaller Ada Lovelace chip with 60 SMs, used in cards such as the RTX 4070 Ti.
- GB202: the largest consumer Blackwell chip, used in the RTX 5090.
- superchip: a board that joins a CPU and GPUs, such as GB200 (one Grace CPU and two Blackwell GPUs).
- VRAM: the GPU's own memory, attached next to the chip; an L40S has 48 GB of it.
- power delivery: the parts on the card that turn power from the power supply into the steady voltages the chip needs.
- output interfaces: ports on a GPU such as HDMI or DisplayPort.
- cooling: removing the heat the chip makes, with fans on the card, airflow from the server or liquid.
- heatsink: a block of metal fins that consumer GPUs use to get rid of their own heat.
- PC (Personal Computer) case: the box that holds a desktop computer's parts; a consumer GPU must cool itself inside it.
- server rack: a tall frame that holds many servers in a data center, with cooling handled at rack level.
- airflow: air pushed through a server by its own fans, which cools the fanless GPUs inside.
- liquid cooling: cooling with liquid that flows through plates on the chips, used in dense racks such as the GB200 NVL72.
- TechPowerUp: a website that lists GPU specs and links each GPU to the chip it uses.
- SM (Streaming Multiprocessor): the building block of an NVIDIA GPU that holds its cores; chip size is counted in SMs.
- core: one compute unit on the chip; a manufacturer can turn some off, for example to sell chips with a few faulty ones.
- power limit: the most power, in watts, a GPU may draw; a lower limit means less heat but also less speed.
- clock speed: how many cycles per second the chip runs, a setting a manufacturer can tune.
- board partner: a company like ASUS, MSI or Gigabyte that builds its own GPU from an NVIDIA chip.
- boost (boost clock): a higher clock speed the GPU reaches on its own while power and temperature allow it.
- vendor-specific implementation: one manufacturer's own version of a GPU built around a chip.
