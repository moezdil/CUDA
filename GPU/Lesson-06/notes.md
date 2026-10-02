# 06 > Memory Bandwidth, Cores and Clock Speed

What makes a GPU fast is not one number. This lesson covers memory bandwidth, core count, clock speed, energy and specialized hardware, and works through each one with real numbers from current GPUs.

## Memory Bandwidth

A GPU needs data to work on, and that data comes from memory. Memory bandwidth is how much data can move between memory and the GPU every second, usually given in GB/s or TB/s.

## A Small Example

Take a GPU with 4 cores. Each core needs data before it can start.

Suppose the memory can send data to only one core at a time. The first core starts working and the other three wait. Then the second core gets data, then the third, then the fourth. So only one of the 4 cores works at a time. The GPU is not used efficiently.

Now suppose the memory can send data to all 4 cores at once. All cores start together and run in parallel. Nothing waits.

A GPU is only fast if it gets data fast enough. Otherwise, it waits. This is called a "memory bottleneck".

<bandwidth-sim></bandwidth-sim>

## Consumer GPUs and Data Center GPUs

There are two kinds of modern GPUs:

- Consumer GPUs, like the RTX 50 series, are made for gaming and general use.
- Data center GPUs, like the H100, the Blackwell B200 or the new Rubin GPUs, are made for AI and large-scale computation.

Both kinds can have many cores and sometimes similar architectures. The big difference is memory.

Data center GPUs use HBM. HBM is stacked memory that sits right next to the GPU chip in the same package. It can deliver huge amounts of data very quickly.

> [!NOTE]
> HBM comes in generations: the H100 uses HBM3 (3.35 TB/s), the B200 uses HBM3e (up to 8 TB/s), and Rubin GPUs, shipping since the second half of 2026, use HBM4 (up to 22 TB/s).

Consumer GPUs use GDDR memory: GDDR6X on the RTX 4090 and GDDR7 on the RTX 50 series. This is fast, but not as fast as HBM.

Two GPUs can look similar on paper. The one with higher memory bandwidth keeps its cores busy. The other may wait for data. This is one main reason why data center GPUs are so strong in AI workloads.

## What Affects Memory Bandwidth

Three main factors affect memory bandwidth:

- Bus width is like the width of a road. A wider road moves more data at the same time.
- Memory speed is like the speed limit on the road. Even a wide road causes delays if traffic is slow.
- Memory technology is where modern GPUs differ most. HBM is like a high-speed highway built only for data. GDDR is more general-purpose.

<bandwidth-calc></bandwidth-calc>

> [!TIP]
> Bandwidth = bus width in bits × speed per pin in Gbps / 8. The RTX 4090 has a 384-bit bus at 21 Gbps: 384 × 21 / 8 = 1,008 GB/s. The RTX 5090 has a 512-bit bus at 28 Gbps: 512 × 28 / 8 = 1,792 GB/s, about 78% more.

GPU performance is not only about cores. It is also about how fast the cores get data. Even the strongest GPU becomes weak if it waits for memory.

## More Cores Is Not Always Faster

Once data arrives, the GPU must process it. Each core executes instructions. It seems natural that more cores means better performance, but this is not always true.

Take two GPUs. The first has 100 cores. The second has 200 cores. Both run the same task with 200 operations.

- The first GPU processes 100 operations at a time, so it needs two rounds.
- The second GPU processes all 200 operations in one round.

Now add the time per round:

- The first GPU needs one second per round, so it finishes in 2 × 1 = 2 seconds.
- The second GPU needs four seconds per round, so it finishes in 1 × 4 = 4 seconds.

The second GPU has more cores, but it is slower. So we also need to know how fast the cores are.

## Clock Speed

Clock speed is how quickly each core executes instructions, given in GHz.

Performance depends on two things together:

- More cores give more parallelism.
- Higher clock speed makes each core faster.

If one of them is too low, it limits the whole system. The goal is balance.

<cores-clock></cores-clock>

## Two Design Directions

GPUs follow two design directions. Some are built for gaming and general use. Others are built for AI and large-scale computation.

- Data center GPUs often run at lower clock speeds and spend their chip area and power on Tensor Cores and memory bandwidth.
- Consumer GPUs often run at higher clock speeds for graphics.

The RTX 4090 and the H100 SXM show this. They have almost the same number of FP32 cores, 16,384 and 16,896. The RTX 4090 boosts to 2.52 GHz, the H100 only to 1.98 GHz. But the H100 moves 3.35 TB/s from memory, more than 3 times the 1,008 GB/s of the RTX 4090.

Neither is better in general. Each is optimized for different workloads.

## Energy

Performance is always tied to energy. More cores and higher clock speed also mean more power use. An RTX 5090 is rated for up to 575 W, and an H100 SXM for up to 700 W. So there is always a trade-off between performance and efficiency.

"Which GPU is better?" is the wrong question. The better question is "Better for what?"

## Specialized Hardware

Modern GPUs are not just groups of general-purpose cores. They also have specialized hardware.

Tensor Cores are one example. They are units built for matrix math, especially in AI. With the right workload, they can speed things up a lot. This only works if the workload matches the hardware.

## Throughput

Core count, clock speed and TFLOPS alone do not tell the full story. A better question is how much work the GPU can finish in a given time. This is called "throughput".

Peak FP32 TFLOPS come from cores × clock × 2, because one FMA counts as 2 operations. For the RTX 4090: 16,384 × 2.52 GHz × 2 ≈ 82.6 TFLOPS. For the H100 SXM: 16,896 × 1.98 GHz × 2 ≈ 66.9 TFLOPS. On this number the RTX 4090 wins, yet the H100 is far faster for AI training, thanks to its Tensor Cores and memory bandwidth.

> [!WARNING]
> TFLOPS on a spec sheet is a peak that assumes every core does an FMA on every cycle. Real programs reach only part of it, and a program that waits for memory reaches much less.

Throughput also depends on many things, such as the type of computation, the precision and the architecture. No single number defines everything.

## Summary

A GPU needs fast memory, enough cores, enough speed, reasonable energy use, and sometimes specialized hardware. Real performance comes only when these are balanced.

GPU performance is not a single number. It is a system where memory, compute power, efficiency and specialized hardware work together. Knowing this makes specifications easier to read and CUDA concepts easier to understand. The next lessons go deeper: the memory levels inside a GPU in [Lesson 07](../Lesson-07/notes.md), and how to tell whether a kernel is limited by memory or by math in [Lesson 09](../Lesson-09/notes.md).

## Glossary

- GPU (Graphics Processing Unit): the processor this track is about, built from many cores that work in parallel.
- memory bandwidth: how much data can move between memory and the GPU every second.
- GB/s (gigabytes per second) / TB/s (terabytes per second): a billion or a trillion bytes moving every second; an RTX 4090 reaches 1,008 GB/s, an H100 3.35 TB/s.
- core: a unit that executes instructions; like a worker, it needs data before it can start.
- parallel: many cores working at the same time instead of one after another.
- memory bottleneck: when GPU cores wait because memory cannot send data fast enough.
- RTX: NVIDIA's consumer GPU line for gaming and general use, such as the RTX 4090 and the RTX 5090.
- H100: NVIDIA's Hopper data center GPU from 2022, with 80 GB of HBM3 memory.
- Blackwell: NVIDIA's architecture after Hopper; the B200 data center GPU and the RTX 50 series use it.
- Rubin: NVIDIA's architecture after Blackwell, with HBM4 memory, shipping since the second half of 2026.
- AI (artificial intelligence): software that learns from data; training it moves huge amounts of data, so memory bandwidth matters a lot.
- HBM (High Bandwidth Memory): extremely fast stacked memory that sits right next to the GPU chip in data center GPUs; HBM3, HBM3e and HBM4 are its recent generations.
- GDDR (Graphics Double Data Rate) / GDDR6X / GDDR7: the memory family used in consumer GPUs; fast, but not as fast as HBM.
- workload: the kind of work a program gives the GPU, such as training a model or running a game.
- bus width: how many bits memory can move at the same time, like the width of a road.
- memory speed: how fast each memory pin sends data, given in Gbps.
- Gbps (gigabits per second): a billion bits per second; the RTX 4090 memory runs at 21 Gbps per pin.
- instruction: one basic command a core runs, such as an add or a multiply.
- clock speed: how quickly each core executes instructions, given in GHz.
- GHz (gigahertz): a billion clock cycles per second; the RTX 4090 boosts to 2.52 GHz.
- FP32 (32-bit floating point): the standard number format for GPU math; FP32 cores are what spec sheets count as "CUDA cores".
- efficiency: how much work a GPU gets done for each watt of power it uses.
- trade-off: giving up some of one thing to get more of another, such as speed for lower power use.
- Tensor Cores: specialized hardware built for matrix math, especially in AI.
- TFLOPS (trillions of floating-point operations per second): a peak number that real programs rarely reach.
- FMA (fused multiply-add): one instruction that computes a × b + c and counts as 2 floating-point operations.
- throughput: how much work the GPU can finish in a given time.
- precision: how many bits each number uses, such as FP32 or FP16; fewer bits give more throughput but less accuracy.
- architecture: the overall design of a GPU, which decides how cores, memory and special units work together.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
