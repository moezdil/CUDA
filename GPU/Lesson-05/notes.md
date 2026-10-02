# 05 > Architectures and Chips

An architecture is not one chip. It is a family of chips that share the same base design, and each chip then ends up in several different products. This lesson shows how architecture, chip and final GPU (Graphics Processing Unit) fit together, with Ada Lovelace and Blackwell as examples.

## One Architecture, Many Chips

Take the Ada Lovelace architecture (2022). It includes different chips such as:

- AD102  
- AD103  
- AD104  

The prefix "AD" links all of them to the same architecture. You know they belong together before you read any specs.

The current consumer generation works the same way. Blackwell consumer chips start with "GB": GB202 in the RTX 5090, GB203 in the RTX 5080 and GB205 in the RTX 5070.

## Same Design, Different Scale

Chips from the same architecture are used in different ways. Some are for high-end GPUs. Others are for mid-range or smaller systems.

The size of a chip is counted in SMs (Streaming Multiprocessors), the building blocks that hold the cores. A full AD102 has 144 SMs, a full AD103 has 80 and a full AD104 has 60. So AD102 goes into top-tier GPUs, and AD104 into smaller, more efficient cards such as the RTX 4070 Ti. Nvidia scales one design to different sizes and capabilities.

## Different Architectures, Different Work

Not all architectures are built for the same type of work. Compare Ada Lovelace and Hopper:

- Ada is mostly for consumer GPUs, such as gaming, desktops and creative work, with some server cards like the L40S.  
- Hopper is for data centers, AI (artificial intelligence) training and large-scale computation.  

So the difference is about purpose, not only performance. Some architectures target graphics and interactive work. Others target massive parallel computation. This is why you do not see Hopper-based GPUs in normal PCs.

> [!NOTE]
> Blackwell covers both worlds, but with different chips. The B200 data center GPU and the RTX 5090 are both Blackwell, yet they use different chips and even report different CC (Compute Capability) numbers to CUDA (Compute Unified Device Architecture): 10.0 for the B200 and 12.0 for the RTX 5090.

## A Visual Clue

Data center GPUs often look very plain, with no visible fans. They live inside servers, where cooling comes from airflow, racks and the whole system.

Consumer GPUs have large cooling systems and several fans. They run inside a normal PC (Personal Computer) case, so they must handle their own heat.

The look of a card is a helpful clue, not a strict rule.

## One Chip Can Behave Differently

One chip does not mean one purpose. The same chip can appear in different forms. A manufacturer can:

- disable some cores  
- change power limits  
- tune clock speeds  

So two GPUs with the same chip may not behave the same. The AD102 is a real example:

- RTX 4090: 128 of 144 SMs turned on, 450 W power limit, 24 GB of GDDR6X memory.  
- L40S: 142 of 144 SMs turned on, 350 W power limit, 48 GB of GDDR6 memory.  

On the RTX 4090, 144 − 128 = 16 SMs are off, which is 16 / 144 ≈ 11% of the chip. Chips with a few faulty SMs can still be sold this way, with those SMs turned off.

## Board Partners

Nvidia does not build every final GPU itself. Companies like ASUS, MSI or Gigabyte take the same chip and build their own versions. They change things like:

- cooling design  
- power configuration  
- boost behavior  

Same base chip, slightly different result.

<arch-family></arch-family>

## The Full Picture

An architecture is a base design. It contains several chips, scaled for different uses. Manufacturers then add their own variations. So a GPU is made of:

- an architecture  
- a specific chip  
- a vendor-specific implementation  

> [!TIP]
> To decode any GPU, ask three questions in this order: which architecture, which chip, which card. For the RTX 5090 that is Blackwell, GB202, and a card from Nvidia or one of its board partners.

## Why This Matters

This makes GPU names easier to read. It helps you see why two GPUs behave differently and where a GPU fits. Without it, it is easy to misunderstand performance and hardware behavior when you go deeper into CUDA.

## Glossary

- architecture: a base design shared by a family of chips.
- prefix: the first letters of a chip name, like AD or GB, which link the chip to its architecture.
- GPU (Graphics Processing Unit): the full product built around a chip, with memory, power parts and cooling.
- Ada Lovelace: an Nvidia architecture from 2022, mostly for consumer GPUs, with chips like AD102.
- AD102: the largest Ada Lovelace chip, with 144 SMs, used in the GeForce RTX 4090 and the L40S.
- AD104: a smaller Ada Lovelace chip with 60 SMs, used in cards such as the RTX 4070 Ti.
- Blackwell: Nvidia's current architecture, with data center chips (B200) and consumer chips (GB202 in the RTX 5090).
- GB202: the largest consumer Blackwell chip, used in the RTX 5090.
- SM (Streaming Multiprocessor): the building block of an Nvidia GPU that holds its cores; chip size is counted in SMs.
- Hopper: an Nvidia architecture for data centers, AI training and large-scale computation, used in the H100.
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math, which suits GPUs.
- data center: a building full of servers, where GPUs are cooled by the airflow of the whole system.
- performance: how fast a GPU finishes real work; it depends on the chip, clocks, power and cooling, not only the architecture.
- CC (Compute Capability): the version number a GPU reports to CUDA, such as 8.9 for Ada Lovelace or 12.0 for the RTX 5090.
- cooling: removing the heat a GPU makes, with the card's own fans or with the server's airflow.
- airflow: air pushed through a server by its own fans, which cools the fanless GPUs inside.
- rack: a tall frame that holds many servers stacked on top of each other in a data center.
- PC (Personal Computer) case: the box that holds a desktop computer's parts; a consumer GPU must cool itself inside it.
- core: one compute unit on the chip; a manufacturer can turn some off, for example to sell chips that have a few faulty cores.
- power limit: the most power, in watts, a GPU may draw; a lower limit means less heat but also less speed.
- clock speed: a setting a manufacturer can tune, so GPUs with the same chip may behave differently.
- board partner: a company like ASUS, MSI or Gigabyte that builds its own GPU from an Nvidia chip.
- boost (boost clock): a higher clock speed the GPU reaches on its own while power and temperature allow it.
- vendor-specific implementation: one manufacturer's own version of a GPU built around a chip.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs; the same CUDA code runs on chips of every recent architecture.
