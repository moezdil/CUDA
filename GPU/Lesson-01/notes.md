# 01 > A Short History of GPUs

This lesson shows how GPUs (Graphics Processing Units) grew from simple graphics chips into the compute platforms behind today's AI. It covers the key products from 1993 to the current generation and the ones NVIDIA has announced next. This context helps before you write CUDA code.

## The Early Days

NVIDIA was founded in April 1993. Its first product, the NV1, came out in 1995.

> [!NOTE]
> NVIDIA was founded by Jensen Huang, Chris Malachowsky and Curtis Priem. Jensen Huang is still its CEO (chief executive officer).

That early hardware was very basic compared to today:

- very small memory  
- very limited data bandwidth  
- almost no real parallelism  

## Modern GPUs

Today's GPUs are on a completely different scale. They:

- have thousands, or even tens of thousands, of cores  
- have large amounts of memory  
- run at a much higher frequency  

Compare the GeForce 256 from 1999 with the GeForce RTX 5090 from 2025. Memory went from 32 MB to 32 GB, which is 32 GB / 32 MB = 1,000 times more. The chip clock went from 120 MHz to 2.41 GHz (2,410 MHz), so 2,410 / 120 = about 20 times faster. And 4 pixel pipelines became 21,760 CUDA cores.

Their role has also changed.

## More Than Graphics

GPUs were first built to render images. Today that is only a small part of their work. GPUs are now widely used for:

- AI (artificial intelligence)  
- large-scale data processing  
- simulations  
- scientific computing  

So a modern GPU is a compute platform, not just a graphics device.

## The First Turning Point

A key moment came when GPUs started to support real 3D acceleration. NVIDIA's RIVA 128 (1997) put fast 3D and 2D on one chip. This made 3D useful for many more people, not just specialists. Adoption grew fast.

## GeForce

Two years later, in 1999, NVIDIA introduced the GeForce 256 and marketed it as the first GPU. It did T&L (transform and lighting), the math that places and lights 3D shapes, in hardware instead of on the CPU (Central Processing Unit). It started the GeForce series, which made GPUs widely available. Small gains in core count or memory made a big difference, because the starting point was still very low.

## Steady Growth

After that, progress sped up. In 2007 NVIDIA released CUDA, which let its GPUs, starting with the GeForce 8 series from 2006, run general programs and not only graphics. Each new architecture improved performance, efficiency or features: Fermi (2010), Kepler (2012), Maxwell (2014), Pascal (2016), Volta (2017, the first Tensor Cores), Turing (2018), Ampere (2020), Ada Lovelace and Hopper (2022), Blackwell (2024). These gains added up over time. Modern GPUs are powerful because of many steps over many years, not one big jump.

## Where We Are Today

As of October 2026, NVIDIA plays a central role in:

- gaming  
- AI infrastructure  
- cloud computing  
- HPC (high-performance computing)  

The current products are the GeForce RTX 50 series (Blackwell, 2025) for PCs and Blackwell Ultra (B300, 2025) in data centers. The next architecture, Rubin, started shipping in its first Vera Rubin NVL72 racks in September 2026. The current CUDA release is CUDA 13.4.

> [!NOTE]
> NVIDIA now releases a new data center architecture about once a year. Rubin Ultra (2027) and Feynman (2028) are announced, not shipping. Treat their dates as plans.

In many cases, GPUs are now the main driver of modern AI systems.

<gpu-history></gpu-history>

## Why This Matters Before CUDA

Knowing how GPUs evolved helps you understand:

- why the architecture is designed the way it is  
- why performance differs between GPUs  
- why modern GPU features exist  

This makes it easier to move on to CUDA.

## Glossary

- GPU (Graphics Processing Unit): a processor with thousands of simple cores, built to run many tasks in parallel.
- NVIDIA: the company founded in 1993 that makes GeForce and data center GPUs and created CUDA.
- NV1: NVIDIA's first product, released in 1995.
- data bandwidth: how much data a GPU can move per second, which was very limited in early hardware.
- parallelism: doing many things at the same time, which early GPUs almost lacked.
- core: a unit that does the work, and modern GPUs have thousands of them.
- frequency: how many clock cycles a chip runs per second, measured in MHz (millions) or GHz (billions).
- GeForce RTX 5090: a 2025 GeForce GPU on Blackwell with 21,760 CUDA cores and 32 GB of memory.
- render: turn a description of a scene (shapes, colors, light) into the pixels you see on screen.
- AI (artificial intelligence): software that learns from data, such as image recognition or chatbots; training it is mostly huge matrix math, which suits GPUs.
- compute platform: a device used for general computation, not just graphics.
- 3D acceleration: GPU support for 3D graphics that made GPUs useful for many more people.
- RIVA 128: NVIDIA's 1997 chip that combined 3D and 2D and made NVIDIA well known.
- GeForce 256: the 1999 card NVIDIA marketed as the first GPU, with 32 MB of memory and a 120 MHz clock.
- T&L (transform and lighting): the math that positions and lights 3D shapes, moved from the CPU to the GPU by the GeForce 256.
- GeForce: NVIDIA's consumer GPU series, which made GPUs widely available.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- Tensor Cores: units built for the matrix math of AI, first added in Volta (2017).
- cloud computing: renting computers, including GPUs, from a provider's data centers over the internet instead of buying the hardware.
- HPC (high-performance computing): many powerful processors working together on big problems, such as weather or physics simulations.
- Blackwell: the NVIDIA architecture from 2024 behind the RTX 50 series, B200 and B300.
- Rubin: the NVIDIA architecture after Blackwell, first shipped in Vera Rubin NVL72 racks in September 2026.
- architecture: the overall design of a GPU, meaning how its cores, memory and units are organized.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing general programs that run on its GPUs, first released in 2007.
