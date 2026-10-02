# 04 > GPU vs GPU Chip

People say "GPU" (Graphics Processing Unit) for two different things: the piece of silicon that does the math, and the whole card or module you install. This lesson separates the two. Once you can tell them apart, spec sheets, chip names and data center hardware become much easier to read.

## The GPU Chip

The GPU chip is the actual silicon where all computation happens. On its own it has no cooling, no connectors and no external memory modules.

Inside the chip you find:

- compute units doing parallel work  
- controllers managing how data moves  
- internal logic coordinating everything  

The chip is the real "engine". The GA100 chip inside the A100, for example, is one piece of silicon with about 54 billion transistors.

## Chip Names

Nvidia chip names link a chip to its architecture. The first letter is G (for GPU), the next letter or two name the architecture, and the number is the chip's place in that family:

- GF100 → Fermi  
- GA100 → Ampere  
- AD102 → Ada Lovelace (RTX 4090, L40S)  
- GB202 → Blackwell (RTX 5090)  

Read GB202 like this: G (GPU) + B (Blackwell) + 202 (one chip of the Blackwell family). So the prefix tells you the architecture before you look at any spec.

> [!WARNING]
> Not every name with these letters is a single GPU chip. GB200 is a "superchip": one Grace CPU (Central Processing Unit) and two Blackwell GPUs on one board. GH200 is the same idea with Hopper. When a name looks odd, check what it really is.

## The GPU

A GPU is the full product you use. It is a complete system built around the chip. It includes:

- the chip itself  
- VRAM, the GPU's own memory attached next to the chip  
- power delivery components  
- output interfaces (like HDMI (High-Definition Multimedia Interface) or DisplayPort)  
- a cooling system  

So a GPU is the chip plus everything needed to make it usable.

## Consumer GPUs

GeForce GPUs, such as the RTX 40 and RTX 50 series, are built for normal environments:

- desktops  
- laptops  
- personal workstations  

These systems have no special cooling. The GPU must handle its own heat, and that heat is large: an RTX 5090 is rated for up to 575 W. That is why most consumer GPUs have:

- large heatsinks  
- multiple fans  
- visible cooling designs  

They are self-contained and must work inside a regular PC (Personal Computer) case.

## Data Center GPUs

The A100 is based on Ampere, and its chip is GA100. But the full GPU looks very different from a GeForce card. It has no fan and no display outputs.

Data center GPUs live inside server racks, where cooling is handled outside the GPU:

- airflow comes from the fans of the server  
- cooling is handled at rack level  
- the newest racks, such as the GB200 NVL72 with 72 Blackwell GPUs, use liquid cooling  

This makes the GPU simpler, more compact and better suited for scale.

<chip-vs-gpu></chip-vs-gpu>

## Checking the Chip Online

> [!TIP]
> Spec sites like TechPowerUp make this clear. Search for "A100 TechPowerUp" and you will see the chip name → GA100. Follow that link to see the chip itself, with no cooling and no extras.

## The Difference in Short

The GPU chip is the brain. The GPU is the full system.

chip = engine  
GPU = complete machine  

One chip can even end up in very different GPUs. The AD102 chip sits in the RTX 4090, a GeForce card with fans and HDMI ports, and in the L40S, a fanless data center card.

## Why This Matters

- architecture describes the chip, not the full product  
- performance starts at the chip level  
- real-world behavior depends on the full GPU system  

If you mix these up, you can misunderstand:

- specs  
- performance comparisons  
- even CUDA (Compute Unified Device Architecture) behavior  

This makes deeper CUDA topics easier to follow.

## Glossary

- GPU chip: the actual silicon where all computation happens, with no cooling or connectors.
- silicon: the material chips are made from; the GA100 is one piece of silicon with about 54 billion transistors.
- architecture: the design of the chip, meaning how its units, memory paths and controllers are organized.
- prefix (chip name prefix): the first letters of a chip name, which show its architecture, like GA for Ampere or GB for Blackwell.
- Fermi: an Nvidia architecture from 2010 whose chips have names like GF100.
- Ampere: an Nvidia architecture from 2020 whose chips start with GA, such as the GA100 in the A100.
- GA100: the chip inside the A100; the G stands for GPU and the A for Ampere.
- AD102: the largest Ada Lovelace chip, used in the RTX 4090 and the L40S.
- GB202: the largest consumer Blackwell chip, used in the RTX 5090.
- superchip: a board that joins a CPU and GPUs, such as GB200 (one Grace CPU and two Blackwell GPUs).
- GPU (Graphics Processing Unit): the full product built around the chip, with memory, power parts, outputs and cooling.
- VRAM: the GPU's own memory, attached next to the chip; an RTX 5090 has 32 GB of it.
- power delivery: the parts on the card that turn power from the power supply into the steady voltages the chip needs.
- output interfaces: ports on a GPU such as HDMI or DisplayPort.
- cooling: removing the heat the chip makes, with fans on the card, airflow from the server or liquid.
- GeForce: Nvidia's consumer GPUs, such as the RTX 5090, which carry their own heatsinks and fans.
- heatsink: a cooling part that consumer GPUs use to handle their own heat.
- PC (Personal Computer) case: the box that holds a desktop computer's parts; a consumer GPU must cool itself inside it.
- A100: an Nvidia data center GPU built on the GA100 chip, with no fan of its own.
- server rack: where data center GPUs live, with cooling handled at rack level instead of on the GPU.
- airflow: air pushed through a server by its own fans, which cools the fanless GPUs inside.
- liquid cooling: cooling with liquid that flows through plates on the chips, used in dense racks such as the GB200 NVL72.
- spec: a published technical number of a GPU, such as its chip name, core count or memory size.
- TechPowerUp: a website that lists GPU specs and links each GPU to the chip it uses.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
