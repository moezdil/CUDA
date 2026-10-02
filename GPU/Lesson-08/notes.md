# 08 > Identifying a Real GPU

This lesson shows how to find the architecture and the category of a real GPU (Graphics Processing Unit) in a few minutes. You also learn why core counts can mislead, and how the physical design of a card gives you hints before you read a single spec.

## Look Up the GPU

Search for the GPU name together with "TechPowerUp", for example "RTX 5090 TechPowerUp" or "B200 TechPowerUp", and open the result. TechPowerUp keeps a large database of GPU specs.

The page shows many numbers and specs. Do not try to understand all of them. Focus on two things: the architecture and the product category.

> [!TIP]
> To find the compute capability (CC) of a GPU, which [Lesson 09](../Lesson-09/notes.md) explains, NVIDIA's own "CUDA GPUs" page lists every card with its CC number.

## Architecture and Category

Take two current GPUs. The GeForce RTX 5090 uses the Blackwell architecture and belongs to the GeForce family, so it is built for consumer use, like gaming or a personal workstation. The B200 also uses Blackwell, but it is a data center GPU, built for AI (artificial intelligence) training and inference in servers.

- The architecture tells you how the GPU is built.
- The category tells you where it is used.

Same architecture, two different worlds. Their specs show it:

| | RTX 5090 | B200 |
|---|---|---|
| Architecture | Blackwell | Blackwell |
| Category | GeForce (consumer) | Data center |
| CUDA cores | 21,760 | 18,944 |
| Memory | 32 GB GDDR7 | 180 GB HBM3e |
| Memory bandwidth | 1,792 GB/s | 8 TB/s |
| Transistors | about 92 billion | 208 billion (two dies) |

The consumer card has more CUDA cores, but the data center GPU has more than five times the memory and about four times the bandwidth. For large AI models, memory and bandwidth decide more than the core count. The same pattern held one generation earlier: the RTX 3090 and the A100 were both Ampere.

> [!NOTE]
> Older material often calls the data center category "Tesla". Today NVIDIA simply says data center GPU, and names the products by chip, such as H100, B200 or B300.

## Do Not Compare Only Core Counts

Core counts like 7,000 or 21,760 look convincing, but they mislead. They usually count only one type of unit, the FP32 (32-bit floating point) CUDA cores. They leave out Tensor Cores, which do the matrix math behind AI, and other special units.

Modern GPUs, especially Hopper and Blackwell, put a large part of their power into those other units. A worked example: the B200 above has fewer CUDA cores than the RTX 5090, yet it is far faster at training large AI models, because its Tensor Cores and its memory system are built for exactly that job. Core count alone does not tell the full story.

## Physical Design Gives Hints

Data center GPUs like the A100, H100 or B200 often have no visible fans. Many are SXM modules (Server PCI Express Module), flat boards that sit directly on the server's main board. They run inside servers, and the server handles cooling.

GeForce cards have large fans and cooling systems. They are built for desktops and workstations, so they must manage their own heat.

This gives a simple shortcut:

- Large visible cooling means the GPU is most likely for consumer use.
- A compact module without fans probably means a data center GPU.

> [!WARNING]
> This is a rule of thumb, not a law. Some data center cards come as normal PCIe (Peripheral Component Interconnect Express) cards, and the newest racks cool GPUs with liquid instead of air. Always confirm with the product name.

<spec-reader></spec-reader>

## Ask the Right Questions

You do not need to understand every number. Ask these questions instead:

- What architecture does this GPU use?  
- What category does it belong to?  
- What kind of problem is it designed to solve?  

With these answers, the rest of the specs make more sense. For CUDA (Compute Unified Device Architecture) and GPU work, knowing the purpose of a GPU is as important as knowing its specs.

## Glossary

- GPU (Graphics Processing Unit): a processor built to run many simple tasks in parallel.
- TechPowerUp: a website with a large database of GPU specs. Search the GPU name with "TechPowerUp" to find its page.
- spec: one published technical number of a GPU, such as its core count, memory size or clock speed.
- compute capability (CC): NVIDIA's version number for what a GPU can do, explained in Lesson 09.
- RTX 5090: a GeForce GPU from 2025 based on Blackwell, with 21,760 CUDA cores and 32 GB of GDDR7 memory.
- B200: a Blackwell data center GPU with two dies, 208 billion transistors and 180 GB of HBM3e memory.
- RTX 3090 / A100: two Ampere GPUs from 2020, one GeForce card and one data center GPU, the same pair one generation earlier.
- architecture: how the GPU is built. The RTX 5090 and the B200 both use Blackwell.
- Blackwell: the NVIDIA architecture from 2024 and 2025 used in the RTX 50 series, the RTX PRO cards and the B200.
- category: where the GPU is used, such as consumer use or the data center.
- GeForce: the NVIDIA GPU family built for consumer use, like gaming or personal workstations.
- workstation: a powerful desktop computer for professional work such as 3D design or engineering.
- data center GPU: a GPU built for AI, cloud and large systems. Older material calls this category "Tesla".
- AI (artificial intelligence): software that learns from data; training it is mostly huge matrix math.
- CUDA cores: the general-purpose FP32 units of a GPU, the ones a core count usually counts.
- GDDR7: the graphics memory of the RTX 50 series, fast but far smaller and slower than the HBM of data center GPUs.
- HBM3e (High Bandwidth Memory): very fast memory stacked next to the GPU chip in data center GPUs.
- memory bandwidth: how much data the memory can deliver per second, for example 8 TB/s on the B200.
- core count: the number of cores, often of only one type. It does not tell the full story.
- FP32 (32-bit floating point): single-precision math, the kind of unit a core count usually counts.
- Tensor Cores: units that do matrix math for AI; the core count leaves them out.
- Hopper / Blackwell: NVIDIA data center architectures from 2022 and 2024, full of Tensor Cores.
- SXM (Server PCI Express Module): a data center GPU form that sits flat on the server board instead of in a PCIe slot, cooled by the server.
- PCIe (Peripheral Component Interconnect Express): the standard slot and link that connects a card to the rest of the computer.
- cooling: removing the heat a GPU makes, with the card's own fans, the server's airflow or liquid.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs, both GeForce and data center ones.
