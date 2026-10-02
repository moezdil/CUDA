# 12 > Many GPUs Together

Big AI models are trained on hundreds or thousands of GPUs at once. This lesson shows why one GPU is not enough, how GPUs are wired together inside a server, a rack and a whole cluster, and how the work is split between them. At the end it goes the other way, with one big GPU split into several small ones.

## Why One GPU Is Not Enough

There are two reasons to use more than one GPU. The model does not fit into the memory of one GPU, or training on one GPU would take far too long.

Take a model with 70 billion parameters. Stored in BF16, each parameter takes 2 bytes, see [Lesson 10](../Lesson-10/notes.md).

- The weights alone take 70 × 10⁹ × 2 bytes = 140 GB. That is already more than the 80 GB of an H100 and almost 3 times the 48 GB of the L40S.
- Training needs much more. A common recipe keeps about 16 bytes per parameter, 2 for the BF16 weights, 2 for the gradients, 4 for an FP32 master copy of the weights and 8 for the two values the Adam optimizer keeps per parameter. That is 70 × 10⁹ × 16 = 1,120 GB.
- 1,120 GB / 80 GB = 14. So at least 14 H100 GPUs are needed just to hold this state, before a single activation is stored.

> [!NOTE]
> Activations grow with the batch size and the sequence length, and for long inputs they can need more memory than the weights. This is why real training runs use far more GPUs than the 14 from this estimate.

Time is the second reason. Training a large model takes a fixed amount of math. If one GPU would need years for it, 1,000 GPUs could in principle do it in days, but only if they can exchange results fast enough. The rest of this lesson is about that exchange.

## Scale Up and Scale Out

GPUs are connected at two levels.

- Scale up means that GPUs sitting close together, in one server or one rack, are joined by a very fast link, NVLink. To a program they behave almost like one big GPU.
- Scale out means that many servers or racks are joined by a network, InfiniBand or Ethernet. This network is much slower per GPU, but it can grow to thousands of servers.

The diagram shows four sizes, from one GPU to a cluster of racks, with the link type and the bandwidth each GPU gets at that level.

<multi-gpu></multi-gpu>

## PCIe and NVLink

Every GPU talks to the CPU over PCIe, see [Lesson 11](../Lesson-11/notes.md). The L40S used across these lessons has PCIe 4.0 x16, which gives 64 GB/s in both directions together, 32 GB/s each way. Two L40S cards in one server can only talk over PCIe. The L40S has no NVLink.

NVLink is NVIDIA's direct link from GPU to GPU. Each generation roughly doubled the bandwidth per GPU, both directions counted together. The newest ones reach several TB/s.

| NVLink | Architecture | Example GPU | Bandwidth per GPU |
|---|---|---|---|
| 1 | Pascal | P100 | 160 GB/s |
| 2 | Volta | V100 | 300 GB/s |
| 3 | Ampere | A100 | 600 GB/s |
| 4 | Hopper | H100 | 900 GB/s |
| 5 | Blackwell | B200 | 1.8 TB/s |
| 6 | Rubin | Rubin | 3.6 TB/s |

The H100 reaches its 900 GB/s with 18 NVLink links of 50 GB/s each. The B200 also has 18 links, at 100 GB/s each. Rubin systems with NVLink 6 have been shipping since the second half of 2026.

> [!TIP]
> Interconnect numbers usually count both directions together. The H100's 900 GB/s is 450 GB/s sending plus 450 GB/s receiving at the same time. For a transfer time, divide by the one-way number.

## NVSwitch and the 8-GPU Server

With 8 GPUs, wiring each GPU directly to every other one would split its 18 links into small groups. Instead, all GPUs connect to NVSwitch chips. An NVSwitch is a switch for NVLink, and any GPU can reach any other GPU through it at the full rate of its links.

A DGX H100 server has 8 H100 GPUs and 4 NVSwitch chips on one board. Every pair of GPUs can talk at 900 GB/s, and all 8 can do it at the same time. An 8-GPU B200 server works the same way at 1.8 TB/s per GPU.

## The NVL72 Rack

The GB200 NVL72 takes the same idea from one server to a whole rack. It holds 72 Blackwell GPUs and 36 Grace CPUs in 18 compute trays, plus 9 NVLink switch trays in the middle of the rack. All 72 GPUs are one NVLink domain, so every GPU reaches every other GPU at 1.8 TB/s. Together that is 72 × 1.8 TB/s ≈ 130 TB/s.

Because every link inside one NVLink domain is this fast, the 72 GPUs can share work that needs constant talking, which would be far too slow over a network. The Vera Rubin NVL72 keeps 72 GPUs per domain and doubles the link to 3.6 TB/s per GPU with NVLink 6.

## InfiniBand and Ethernet Between Servers

Beyond one NVLink domain, servers and racks are joined by a network. Data centers for AI use InfiniBand or a fast Ethernet. Each GPU usually gets its own network card. A DGX H100 has 8 ConnectX-7 cards at 400 Gb/s, one per GPU, and a GB300 NVL72 gives each GPU 800 Gb/s with ConnectX-8.

> [!WARNING]
> Network speeds count bits and are written Gb/s, GPU links count bytes and are written GB/s. Divide by 8, so 400 Gb/s = 50 GB/s and 800 Gb/s = 100 GB/s per direction. So an H100 can send 450 GB/s over NVLink but only 50 GB/s over its network card, 9 times less.

This gap shapes everything about multi-GPU programs. Put the most talkative work inside one NVLink domain, and send only what must cross the network.

## NCCL and Collectives

When GPUs train one model together, they must combine their results again and again. A pattern where all GPUs of a group take part in one exchange is called a collective. The most important one is all-reduce. Every GPU starts with its own list of numbers, and at the end every GPU holds the sum of all the lists.

The library that does this on NVIDIA GPUs is NCCL. It finds the fastest path, NVLink, PCIe or the network, and runs collectives such as all-reduce, broadcast and all-gather.

A common way to run all-reduce is the ring. The GPUs form a circle, each one sends pieces to its neighbour, and after two rounds around the circle every GPU has the full sum. With N GPUs and data of size S, each GPU sends 2 × (N - 1) / N × S. That is almost 2 × S, no matter how many GPUs are in the ring.

## All-Reduce over PCIe and NVLink, Worked Out

Take a model with 7 billion parameters, trained on 8 GPUs. After each step, the gradients in BF16 must be summed across all 8 GPUs.

- The data size is 7 × 10⁹ × 2 bytes = 14 GB.
- Each GPU sends 2 × (8 - 1) / 8 × 14 GB = 2 × 0.875 × 14 GB = 24.5 GB, and receives the same amount at the same time.

Now divide by the one-way bandwidth of each link.

| Link | One way | Time for 24.5 GB |
|---|---|---|
| PCIe 4.0 x16 (L40S) | 32 GB/s | 24.5 / 32 ≈ 0.77 s |
| Network at 400 Gb/s | 50 GB/s | 24.5 / 50 = 0.49 s |
| NVLink 4 (H100) | 450 GB/s | 24.5 / 450 ≈ 0.054 s |
| NVLink 5 (B200) | 900 GB/s | 24.5 / 900 ≈ 0.027 s |

These are the best cases on paper. In a real 8-GPU PCIe server, several cards share the same PCIe switches and CPU links, so it is slower still. If one training step computes for 0.5 s, the PCIe server would spend more time exchanging gradients than computing. NVLink makes the exchange about 14 times shorter.

## Three Ways to Split the Work

In data parallelism, every GPU holds the full model and works on a different part of the batch. After each step, an all-reduce sums the gradients, so all copies stay the same. It is the simplest method, but every GPU must fit the whole model. Variants such as FSDP split the weights and optimizer values across GPUs and gather them only when needed.

In tensor parallelism, each layer's large matrices are cut into pieces, and every GPU computes its piece of every layer. The GPUs must exchange partial results inside every layer, many times per step, so tensor parallelism is kept inside one NVLink domain.

In pipeline parallelism, the layers are split into stages, for example layers 1 to 20 on the first GPU and 21 to 40 on the second. Activations flow from stage to stage like on an assembly line. Only the activations at stage borders travel, so a slower link is fine, but stages wait for each other unless the batch is cut into small micro-batches.

Large training runs combine all three, with tensor parallelism inside a server or rack, pipeline stages across them, and data parallelism over the whole cluster.

## MIG Goes the Other Direction

Sometimes one GPU is too big. A small model or a notebook user may need only a fraction of an H100. MIG splits one GPU into up to 7 isolated instances. Each instance gets its own SMs, its own part of the L2 cache and its own part of the memory, so one user cannot slow down or read the data of another. An H100 80 GB, for example, can become 7 instances with 10 GB each.

MIG exists on data center GPUs since Ampere. The A100, H100, H200 and B200 allow up to 7 instances, the A30 up to 4. The RTX PRO 6000 Blackwell brings MIG to a workstation card, with up to 4 instances.

> [!NOTE]
> The L40S has no MIG and no NVLink. Several programs can still share it by taking turns, which is called time slicing, but without hardware isolation.

## Why This Matters for CUDA

In CUDA, a kernel always runs on one GPU. A program that uses several GPUs selects each one with `cudaSetDevice` and launches kernels on each. Data moves between GPUs with `cudaMemcpyPeer`, over NVLink when it exists and over PCIe when it does not. For all-reduce and other collectives, programs call NCCL instead of writing their own.

Communication should overlap with computation. While a GPU computes the gradients of one layer, NCCL can already send those of the previous layer. On a MIG instance, `cudaGetDeviceProperties` reports only the SMs of that instance, so a kernel should size its grid from the reported SM count, as in [Lesson 05](../Lesson-05/notes.md), never from a hardcoded number like 132.

## Glossary

- GPU (Graphics Processing Unit): the processor this track is about. This lesson connects many of them.
- AI (artificial intelligence): software that learns from data. Large AI models are why GPUs are connected in thousands.
- parameter: a number the model learns. A 70-billion-parameter model has 70 × 10⁹ of them.
- BF16 (brain floating point, 16 bits): a 2-byte number format used for weights and gradients in training.
- FP32 (32-bit floating point): a 4-byte number format. Training often keeps a master copy of the weights in it.
- gradient: how much each parameter should change after a training step. Data parallelism sums them across GPUs.
- activation: the intermediate result of a layer. It can need more memory than the weights.
- scale up / scale out: connecting GPUs close together with NVLink, or connecting servers with a network.
- PCIe (Peripheral Component Interconnect Express): the link between CPU and GPU. PCIe 4.0 x16 gives 32 GB/s each way.
- CPU (Central Processing Unit): the main processor of the server. GPUs reach it over PCIe.
- NVLink: NVIDIA's direct GPU-to-GPU link. It gives 900 GB/s per GPU on the H100 and 1.8 TB/s on the B200.
- GB/s (gigabytes per second) / Gb/s (gigabits per second): bytes or bits per second. 8 Gb/s = 1 GB/s.
- TB/s (terabytes per second): 1,000 GB/s. NVLink 5 gives a B200 1.8 TB/s.
- NVSwitch: a switch chip for NVLink that lets every GPU reach every other GPU at full rate.
- NVL72: a rack with 72 GPUs in one NVLink domain, such as the GB200 NVL72.
- NVLink domain: a group of GPUs that all reach each other over NVLink.
- InfiniBand / Ethernet: the networks that join servers and racks. Each GPU gets 400 or 800 Gb/s.
- collective: an exchange in which all GPUs of a group take part, such as all-reduce.
- all-reduce: a collective after which every GPU holds the sum of all GPUs' data.
- NCCL (NVIDIA Collective Communications Library): the library that runs collectives on NVIDIA GPUs.
- broadcast: a collective in which one GPU sends the same data to all others.
- all-gather: a collective after which every GPU holds every GPU's part.
- ring: an all-reduce method where GPUs pass pieces around a circle. Each sends about 2 × the data size.
- data parallelism: every GPU holds the whole model and works on a different part of the batch.
- FSDP (Fully Sharded Data Parallel): data parallelism that splits weights and optimizer values across GPUs.
- tensor parallelism: each layer's matrices are split across GPUs, which talk inside every layer.
- pipeline parallelism: the layers are split into stages on different GPUs, like an assembly line.
- MIG (Multi-Instance GPU): splitting one GPU into up to 7 isolated instances.
- SM (Streaming Multiprocessor): a GPU's building block. A MIG instance gets its own SMs.
- time slicing: programs sharing a GPU by taking turns, without isolation.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on the GPU.
