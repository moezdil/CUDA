# A Short History of GPUs

This lesson gives the background of how GPUs grew into powerful compute platforms. This context helps before writing CUDA code.

## The Early Days

Nvidia was founded in the early 90s. It released its first product within a short time.

> [!NOTE]
> Nvidia started around the same time as many of today's big tech companies.

That early hardware was very basic compared to today:

- very small memory  
- very limited data bandwidth  
- almost no real parallelism  

## Modern GPUs

Today's GPUs are on a completely different scale. They:

- have thousands, or even tens of thousands, of cores  
- have large amounts of memory  
- run at a much higher frequency  

Their role has also changed.

## More Than Graphics

GPUs were first built to render images. Today that is only a small part of their work. GPUs are now widely used for:

- artificial intelligence  
- large-scale data processing  
- simulations  
- scientific computing  

So a modern GPU is a compute platform, not just a graphics device.

## The First Turning Point

A key moment came when GPUs started to support real 3D acceleration. This made GPUs useful for many more people, not just specialists. Adoption grew fast.

## GeForce

Soon after, Nvidia introduced the GeForce series. For the first time, GPUs became widely available. Even early GeForce cards brought more parallelism, more memory and more features. Small gains in core count or memory made a big difference, because the starting point was still very low.

## Steady Growth

After that, progress sped up. Each generation improved performance, efficiency or features. These gains added up over time. Modern GPUs are powerful because of many steps over many years, not one big jump.

## Where We Are Today

Today, Nvidia plays a central role in:

- gaming  
- AI infrastructure  
- cloud computing  
- high-performance computing  

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
- Nvidia: the company founded in 1993 that makes GeForce and data center GPUs and created CUDA.
- data bandwidth: how much data a GPU can move, which was very limited in early hardware.
- parallelism: doing many things at the same time, which early GPUs almost lacked.
- core: a unit that does the work, and modern GPUs have thousands of them.
- frequency: how fast a GPU runs, and modern GPUs run at a much higher frequency.
- render: turn a description of a scene (shapes, colors, light) into the pixels you see on screen.
- AI (artificial intelligence): software that learns from data, such as image recognition or chatbots; training it is mostly huge matrix math, which suits GPUs.
- compute platform: a device used for general computation, not just graphics.
- 3D acceleration: GPU support for 3D graphics that made GPUs useful for many more people.
- GeForce: the Nvidia GPU series that first made GPUs widely available.
- generation: one step in GPU releases, each improving performance, efficiency or features.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- cloud computing: renting computers, including GPUs, from a provider's data centers over the internet instead of buying the hardware.
- HPC (high-performance computing): many powerful processors working together on big problems, such as weather or physics simulations.
- architecture: the overall design of a GPU, meaning how its cores, memory and units are organized.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing general programs that run on its GPUs, first released in 2007.
