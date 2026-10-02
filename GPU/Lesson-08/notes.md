# Identifying a Real GPU

This lesson shows how to find the architecture and category of a real GPU. It also explains why core counts can mislead and how physical design gives hints.

## Look Up the GPU

Search for the GPU name together with "TechPowerUp". For example, search "A100 TechPowerUp" or "RTX 3090 TechPowerUp" and open a result.

The page shows many numbers and specs. Do not try to understand all of them. Focus on two things, the architecture and the product category.

## Architecture and Category

The RTX 3090 uses the Ampere architecture. It belongs to the GeForce family. This means it is built for consumer use, like gaming or personal workstations.

The A100 also uses Ampere. Both GPUs share the same architecture, but they serve different purposes.

- The architecture tells you how the GPU is built.
- The category tells you where it is used.

> [!NOTE]
> Older materials often call the data center category "Tesla". Newer Nvidia terms (around 2026) are Data Center GPU or AI GPU.

So the RTX 3090 and the A100 are both Ampere, but they are made for different worlds. The RTX 3090 is optimized for gaming and everyday use. The A100 is built for AI workloads, cloud infrastructure and large-scale systems.

## Do Not Compare Only Core Counts

Core counts like 7000 or 10000 look convincing, but they mislead. The reason is that they usually count only one type of core, often single-precision units. They do not cover everything inside the GPU.

Modern GPUs have different types of compute units, especially newer architectures like Hopper and Blackwell. Core count alone does not tell the full story.

## Physical Design Gives Hints

Data center GPUs like A100 or H100 often have no visible fans. They run inside servers, and the server handles cooling.

RTX GPUs have large fans and cooling systems. They are built for desktops and workstations, so they must manage their own heat.

This gives a simple shortcut:

- Large visible cooling means the GPU is most likely for consumer use.
- A compact module without fans probably means a data center GPU.

> [!TIP]
> This is not a strict rule, but it works often.

<spec-reader></spec-reader>

## Ask the Right Questions

You do not need to understand every number. Ask these questions instead:

- What architecture does this GPU use?  
- What category does it belong to?  
- What kind of problem is it designed to solve?  

With these answers, the rest of the specs make more sense. For CUDA and GPU work, knowing the purpose of a GPU is as important as knowing its specs.

## Glossary

- TechPowerUp: a website with GPU specs. Search the GPU name with "TechPowerUp" to find its page.
- spec: one published technical number of a GPU, such as its core count, memory size or clock speed.
- RTX 3090: a GeForce GPU from 2020 based on Ampere, with 10,496 cores and 24 GB of GDDR6X memory.
- A100: an Ampere data center GPU from 2020 with 6,912 single-precision cores and 40 or 80 GB of HBM memory.
- architecture: how the GPU is built. The RTX 3090 and the A100 both use Ampere.
- Ampere: the Nvidia architecture from 2020 used in both the RTX 30 series and the A100.
- category: where the GPU is used, such as consumer use or the data center.
- GeForce: the NVIDIA GPU family built for consumer use, like gaming or personal workstations.
- workstation: a powerful desktop computer for professional work such as 3D design or engineering.
- data center GPU: a GPU built for AI, cloud and large systems. Older materials call this category "Tesla".
- workload: the kind of work a program gives the GPU, such as training an AI model.
- core count: the number of cores, often of only one type. It does not tell the full story.
- single-precision: 32-bit floating-point math (FP32), the kind of unit a core count usually counts.
- Hopper / Blackwell: Nvidia data center architectures from 2022 and 2024, full of Tensor Cores that the core count leaves out.
- H100: a Hopper data center GPU from 2022, built for AI and HPC.
- cooling: removing the heat a GPU makes, with the card's own fans or with the server's airflow.
- module (SXM): a data center GPU form that sits flat on the server board instead of in a PCIe slot, cooled by the server.
- CUDA: NVIDIA's platform for writing programs that run on its GPUs, both GeForce and data center ones.
