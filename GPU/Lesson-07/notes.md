# Memory Bandwidth, Cores and Clock Speed

This lesson explains what makes a GPU fast. It covers memory bandwidth, core count, clock speed, energy and specialized hardware.

## Memory Bandwidth

A GPU needs data to work on, and that data comes from memory. Memory bandwidth is how much data can move between memory and the GPU every second, usually given in GB/s.

## A Small Example

Take a GPU with 4 cores. Each core needs data before it can start.

Suppose the memory can send data to only one core at a time. The first core starts working and the other three wait. Then the second core gets data, then the third, then the fourth. So only one of the 4 cores works at a time. The GPU is not used efficiently.

Now suppose the memory can send data to all 4 cores at once. All cores start together and run in parallel. Nothing waits.

A GPU is only fast if it gets data fast enough. Otherwise, it waits. This is called a "memory bottleneck".

<bandwidth-sim></bandwidth-sim>

## Consumer GPUs and Data Center GPUs

There are two kinds of modern GPUs:

- Consumer GPUs, like RTX cards, are made for gaming and general use.
- Data center GPUs, like H100 or newer Blackwell-based GPUs, are made for AI and large-scale computation.

Both kinds can have many cores and sometimes similar architectures. The big difference is memory.

Data center GPUs use "HBM memory". HBM is extremely fast and sits very close to the GPU chip. It can deliver huge amounts of data very quickly.

> [!NOTE]
> HBM comes in versions such as HBM3 and HBM3e, and HBM4 is coming soon.

Consumer GPUs usually use GDDR6 or GDDR6X memory. This is fast, but not as fast as HBM.

Two GPUs can look similar on paper. The one with higher memory bandwidth keeps its cores busy. The other may wait for data. This is one main reason why data center GPUs are so strong in AI workloads.

## What Affects Memory Bandwidth

Three main factors affect memory bandwidth:

- Bus width is like the width of a road. A wider road moves more data at the same time.
- Memory speed is like the speed limit on the road. Even a wide road causes delays if traffic is slow.
- Memory technology is where modern GPUs differ most. HBM is like a high-speed highway built only for data. GDDR is more general-purpose.

<bandwidth-calc></bandwidth-calc>

GPU performance is not only about cores. It is also about how fast the cores get data. Even the strongest GPU becomes weak if it waits for memory.

## More Cores Is Not Always Faster

Once data arrives, the GPU must process it. Each core executes instructions. It seems natural that more cores means better performance, but this is not always true.

Take two GPUs. The first has 100 cores. The second has 200 cores. Both run the same task with 200 operations.

- The first GPU processes 100 operations at a time, so it needs two rounds.
- The second GPU processes all 200 operations in one round.

Now add the time per round:

- The first GPU needs one second per round, so it finishes in two seconds.
- The second GPU needs four seconds per round, so it finishes in four seconds.

The second GPU has more cores, but it is slower. So we also need to know how fast the cores are.

## Clock Speed

Clock speed is how quickly each core executes instructions.

Performance depends on two things together:

- More cores give more parallelism.
- Higher clock speed makes each core faster.

If one of them is too low, it limits the whole system. The goal is balance.

<cores-clock></cores-clock>

## Two Design Directions

Around 2026, GPUs follow two design directions. Some are built for gaming and general use. Others are built for AI and large-scale computation.

- Data center GPUs often have very high core counts but lower clock speeds.
- Consumer GPUs often have higher clock speeds but fewer cores.

Neither is better in general. Each is optimized for different workloads.

## Energy

Performance is always tied to energy. More cores and higher clock speed also mean more power use. So there is always a trade-off between performance and efficiency.

"Which GPU is better?" is the wrong question. The better question is "Better for what?"

## Specialized Hardware

Modern GPUs are not just groups of general-purpose cores. They also have specialized hardware.

"Tensor Cores" are one example. They are units built for specific computations, especially in AI. With the right workload, they can speed things up a lot. This only works if the workload matches the hardware.

## Throughput

Core count, clock speed and TFLOPS alone do not tell the full story. A better question is how much work the GPU can finish in a given time. This is called "throughput".

Throughput also depends on many things, such as the type of computation, the precision and the architecture. No single number defines everything.

## Summary

A GPU needs fast memory, enough cores, enough speed, reasonable energy use, and sometimes specialized hardware. Real performance comes only when these are balanced.

GPU performance is not a single number. It is a system where memory, compute power, efficiency and specialized hardware work together. Knowing this makes specifications easier to read and CUDA concepts easier to understand.

## Glossary

- memory bandwidth: how much data can move between memory and the GPU every second.
- GB/s (gigabytes per second): a billion bytes moving every second; an RTX 4090 reaches about 1,000 GB/s, an H100 up to about 3,350 GB/s.
- core: a unit that executes instructions; like a worker, it needs data before it can start.
- parallel: many cores working at the same time instead of one after another.
- memory bottleneck: when GPU cores wait because memory cannot send data fast enough.
- RTX: Nvidia's consumer GPU line for gaming and general use, such as the RTX 4090.
- H100: Nvidia's Hopper data center GPU from 2022, with 80 GB of HBM3 memory.
- Blackwell: Nvidia's data center architecture after Hopper, built for large-scale AI.
- AI (artificial intelligence): software that learns from data; training it moves huge amounts of data, so memory bandwidth matters a lot.
- HBM (High Bandwidth Memory): extremely fast memory that sits very close to the GPU chip in data center GPUs.
- GDDR / GDDR6 / GDDR6X: the memory family used in consumer GPUs; fast, but not as fast as HBM.
- workload: the kind of work a program gives the GPU, such as training a model or running a game.
- bus width: how much data memory can move at the same time, like the width of a road.
- memory speed: how fast each memory pin sends data; for example, a 384-bit bus at 21 Gbps gives 384 × 21 / 8 = 1008 GB/s.
- instruction: one basic command a core runs, such as an add or a multiply.
- clock speed: how quickly each core executes instructions.
- efficiency: how much work a GPU gets done for each watt of power it uses.
- trade-off: giving up some of one thing to get more of another, such as speed for lower power use.
- Tensor Cores: specialized hardware built for specific computations, especially in AI.
- TFLOPS: trillions of floating-point operations per second, a peak number that real programs rarely reach.
- throughput: how much work the GPU can finish in a given time.
- precision: how many bits each number uses, such as FP32 or FP16; fewer bits give more throughput but less accuracy.
- architecture: the overall design of a GPU, which decides how cores, memory and special units work together.
- CUDA: NVIDIA's platform for writing programs that run on its GPUs.
