# 11 > CPU to GPU Data Path

A kernel can only work on data that is already in GPU memory, and that data almost always starts in CPU memory. This lesson follows the bytes along the way: the PCIe link, pinned host memory, asynchronous copies, unified memory and the faster links on Grace Hopper and Grace Blackwell. [Lesson 00](../Lesson-00/notes.md) gave the short version; here you see why the path is slow and what you can do about it.

## Two Memories, One Link

A normal GPU server has two separate memories:

- host memory: the system RAM on the motherboard, next to the CPU
- device memory: the GPU's own memory, GDDR or HBM, on the GPU board

The CPU cannot read device memory like its own RAM, and a kernel cannot simply read host memory at full speed. Between them sits a link, on most machines PCIe. Every byte the GPU works on crosses that link at least once.

On the L40S used across these lessons, the two sides are very unequal. Its 48 GB of GDDR6 feeds the SMs at 864 GB/s. The PCIe 4.0 x16 link to the CPU moves about 31.5 GB/s in each direction. [Lesson 07](../Lesson-07/notes.md) shows what happens to data once it is inside the GPU; this lesson is about getting it there.

## The PCIe Link

PCIe is built from lanes. Each lane is a pair of wire pairs, one for each direction, so a link sends and receives at the same time, which is called full duplex. A GPU slot has 16 lanes, written x16. Each new generation doubles the speed of a lane, measured in GT/s:

| Generation | Per lane | x16, per direction | GPUs that use it |
|---|---|---|---|
| PCIe 3.0 | 8 GT/s | 15.8 GB/s | V100 |
| PCIe 4.0 | 16 GT/s | 31.5 GB/s | A100, L40S |
| PCIe 5.0 | 32 GT/s | 63 GB/s | H100, B200, RTX 5090 |
| PCIe 6.0 | 64 GT/s | about 121 GB/s | Blackwell Ultra (B300) |

The x16 numbers are per direction. A data sheet that says "PCIe Gen4 x16: 64 GB/s" adds both directions together. A copy to the GPU only uses one direction, so for one copy the useful number is the per direction one.

> [!NOTE]
> Spec sheets round: PCIe 4.0 x16 is 31.5 GB/s per direction, often written as 32 GB/s. A real copy reaches somewhat less, because each packet also carries headers and checks. PCIe 7.0 (128 GT/s per lane) was finalized in June 2025, but no GPU uses it yet.

<data-path></data-path>

## Worked Example: 4 GB to an L40S

Say a program needs 4 GB of input on an L40S. How long does the trip take, and how does that compare with reading the same bytes once they are on the GPU?

- over PCIe 4.0 x16: 4 GB / 31.5 GB/s = 0.127 s, about 127 ms
- from the L40S's own memory: 4 GB / 864 GB/s = 0.0046 s, about 4.6 ms
- ratio: 864 / 31.5 = 27.4, so the copy takes about 27 times longer than one full read on the GPU

On a PCIe 5.0 card such as the H100 PCIe or the RTX 5090, the copy halves: 4 / 63 = 0.063 s, about 63 ms. It is still far slower than the 1.8 TB/s or more those GPUs read from their own memory.

## When the Copy Dominates

Now add a kernel. Take a simple kernel that reads the 4 GB once and writes 4 GB of results. It moves 8 GB through device memory, so on the L40S it needs at least 8 / 864 = 0.0093 s, about 9.3 ms. Copying the input in and the result out costs 127 + 127 = 254 ms. The kernel is under 4% of the total time: 9.3 / (254 + 9.3) = 0.035.

The copy stops dominating only when the GPU does a lot of work per byte it receives:

- the kernel reuses the data many times, as in a matrix multiply, so its run time grows while the copy stays the same
- the data stays on the GPU across many kernels, so you pay the copy once and read it at 864 GB/s afterwards
- the CPU part of the program would take even longer than the copy

[Lesson 09](../Lesson-09/notes.md) measures "work per byte" as arithmetic intensity. The same idea applies to the link: a workload needs about 27 times more work per byte to hide a PCIe 4.0 copy than to hide a read from the L40S's memory.

> [!WARNING]
> Never time a kernel and quote that as the speedup of your program. If the data has to come from the CPU, the copy in and the copy out belong to the measurement, and for simple kernels they are most of it.

## Pageable and Pinned Host Memory

The copy itself is done by a DMA engine on the GPU: hardware that reads host memory over PCIe on its own, without the CPU moving each byte. A DMA engine needs a fixed physical address, and that is where the kind of host memory matters.

- pageable memory: what `malloc` or `new` gives you. The OS may move these pages to another place in RAM or swap them to disk at any time, so the DMA engine cannot safely read them.
- pinned memory: host memory that the OS promises never to move, also called page-locked memory. In CUDA you get it from `cudaMallocHost` or `cudaHostAlloc`, or you lock an existing buffer with `cudaHostRegister`.

When you copy from pageable memory, the driver works around the problem. It copies your data into a pinned staging buffer of its own with the CPU, then lets the DMA engine send that buffer to the GPU, piece by piece. Every byte is copied twice, once by the CPU and once over PCIe. From pinned memory the DMA engine reads your buffer directly, so the staging copy disappears and the link can run close to its peak.

> [!TIP]
> Pin the buffers you copy often, and allocate them once. Pinning is slow to set up and takes RAM away from the OS, so pinning many gigabytes "just in case" can slow the whole machine down.

## Synchronous and Asynchronous Copies

`cudaMemcpy` is the plain copy that [CUDA Lesson 08](../../cuda/Lesson-08/notes.md) uses. It is synchronous: the CPU thread waits until the copy is done, and the GPU runs nothing else from your program in the meantime. Copy, compute and copy back happen strictly one after another.

`cudaMemcpyAsync` only queues the copy and returns at once. Together with streams, it lets copies and kernels overlap. A stream is a queue of GPU work that runs in order; work in different streams may run at the same time. Because the GPU has separate copy engines, it can copy one chunk while the SMs compute on another.

A pipeline with 4 streams looks like this. Split the 4 GB into 4 chunks of 1 GB. Each chunk takes 1 / 31.5 = 0.032 s (32 ms) to copy. Say the kernel needs 12 ms per chunk. Done one after another: 4 × 32 + 4 × 12 = 176 ms. Overlapped, the kernel on chunk 1 runs while chunk 2 is copied, so the total drops to about 4 × 32 + 12 = 140 ms. The copy time is still there; only the kernel time hides behind it.

Asynchronous copies need pinned host memory. From pageable memory, `cudaMemcpyAsync` still has to stage through the driver's buffer and usually stops being asynchronous.

## Unified Memory

Unified memory gives you one pointer that works on both sides. You allocate it with `cudaMallocManaged`, write to it on the CPU, pass it to a kernel and read the result on the CPU, with no `cudaMemcpy` in your code.

The data still has to cross the link. Since Pascal, GPUs can take a page fault: when a kernel touches a page that is still in host memory, the GPU stops that access, the driver migrates the page to device memory, and the access continues. This page migration on demand is convenient, but many small faults are slower than one big copy. `cudaMemPrefetchAsync` tells the driver to move the pages in advance, which brings back most of the speed of an explicit copy.

## Coherent Links: Grace Hopper and Grace Blackwell

NVIDIA's superchips replace PCIe between CPU and GPU. The GH200 Grace Hopper Superchip puts a Grace CPU (Arm, with up to 480 GB of LPDDR5X memory) and a Hopper GPU on one board, joined by NVLink-C2C. The GB200 Grace Blackwell Superchip joins one Grace CPU to two B200 GPUs the same way.

NVLink-C2C moves 900 GB/s in total, 450 GB/s in each direction, about 7 times PCIe 5.0 x16. It is also coherent: the CPU and the GPU see one shared address space and keep their caches in agreement, so the GPU can read CPU memory directly, even ordinary memory from `malloc`, without staging. Copies still pay off for data the GPU reads again and again, because HBM is faster still, but the link is no longer the narrow point it is on PCIe.

## GPUDirect

GPUDirect is NVIDIA's name for paths that skip host memory altogether. GPUDirect P2P lets two GPUs in the same machine copy to each other directly. GPUDirect RDMA lets a NIC read and write GPU memory directly, so data from another server lands on the GPU without a stop in CPU RAM. GPUDirect Storage does the same for NVMe drives and network storage. [Lesson 12](../Lesson-12/notes.md) shows how many GPUs use these paths together.

## Why This Matters for CUDA

The fastest kernel cannot make up for a slow data path. When you write CUDA:

- copy once, keep the data on the GPU across as many kernels as you can, and copy back only the result
- use pinned host memory (`cudaMallocHost`) for buffers you copy often
- overlap copies and kernels with `cudaMemcpyAsync` and streams when the data does not fit the "copy once" pattern
- with `cudaMallocManaged`, prefetch instead of relying on page faults
- measure the copy time next to the kernel time, and compare both with the link bandwidth: 4 GB / 31.5 GB/s = 127 ms is the floor on an L40S

## Glossary

- host memory: the system RAM next to the CPU; in CUDA code, host buffers often start with `h_`.
- device memory: the GPU's own memory (GDDR or HBM); in CUDA code, device buffers often start with `d_`.
- RAM (Random Access Memory): the main memory of a computer; the CPU's RAM is the host memory.
- CPU (Central Processing Unit): the main processor; in CUDA it is the host that prepares data and launches kernels.
- GPU (Graphics Processing Unit): the processor with thousands of simple cores; in CUDA it is the device.
- GDDR (Graphics Double Data Rate): the memory on gaming and workstation GPUs, such as the 48 GB of GDDR6 on the L40S.
- HBM (High Bandwidth Memory): stacked memory next to the GPU chip on data center GPUs such as the H100 and B200.
- PCIe (Peripheral Component Interconnect Express): the standard link between the CPU and plug-in cards such as GPUs.
- SM (Streaming Multiprocessor): the processing unit of a GPU; the L40S has 142.
- lane: one PCIe connection with a wire pair for each direction; a GPU slot uses 16 lanes (x16).
- x16: a PCIe link with 16 lanes, the standard width for a GPU slot.
- full duplex: sending and receiving at the same time, at full speed in each direction.
- GT/s (gigatransfers per second): the raw signaling rate of one PCIe lane, 16 GT/s for PCIe 4.0.
- per direction: the bandwidth one way only; a copy to the GPU uses one direction, so 31.5 GB/s on PCIe 4.0 x16.
- L40S: the NVIDIA Ada Lovelace data center GPU used in these lessons, with 864 GB/s memory and PCIe 4.0 x16.
- kernel: a function that runs on the GPU, launched by the CPU.
- arithmetic intensity: the work done per byte moved; more work per byte hides a slow copy better.
- DMA (Direct Memory Access): hardware on the GPU that moves data over PCIe by itself, without the CPU copying each byte.
- pageable memory: normal host memory from `malloc` or `new`, which the OS may move or swap out.
- OS (operating system): the software, such as Linux, that manages memory and decides where pages live.
- swap: moving memory pages from RAM to disk when RAM runs short.
- pinned memory: host memory locked in place (page-locked), so the DMA engine can read it directly; from `cudaMallocHost`.
- staging buffer: a pinned buffer the driver copies pageable data into before sending it to the GPU.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
- `cudaMallocHost`: the CUDA call that allocates pinned host memory; free it with `cudaFreeHost`.
- `cudaMemcpy`: the synchronous CUDA copy; the CPU thread waits until it is done.
- `cudaMemcpyAsync`: a copy that is queued in a stream and returns at once; it needs pinned memory to really be asynchronous.
- stream: a queue of GPU work that runs in order; work in different streams can overlap.
- copy engine: a DMA engine on the GPU that runs copies while the SMs run kernels.
- unified memory: memory reachable through one pointer from both CPU and GPU; the driver moves the pages.
- `cudaMallocManaged`: the CUDA call that allocates unified memory.
- page fault: an access to a page that is not where it is needed; the access waits until the page is moved or mapped.
- page migration: moving a memory page from host memory to device memory or back.
- `cudaMemPrefetchAsync`: moves unified memory pages ahead of time, so the kernel does not stop on page faults.
- Grace Hopper (GH200): a superchip with a Grace CPU and a Hopper GPU joined by NVLink-C2C.
- Grace Blackwell (GB200): a superchip with one Grace CPU and two B200 GPUs joined by NVLink-C2C.
- LPDDR5X (Low-Power Double Data Rate 5X): the energy-efficient memory of the Grace CPU.
- NVLink-C2C (NVLink Chip-to-Chip): NVIDIA's coherent CPU-GPU link, 900 GB/s in total, 450 GB/s per direction.
- coherent: CPU and GPU share one address space and keep their caches in agreement, so each can read the other's memory.
- GPUDirect: NVIDIA's family of paths that move data to or from GPU memory without a stop in host memory.
- P2P (peer to peer): a direct copy between two GPUs in the same machine, without going through host memory.
- RDMA (Remote Direct Memory Access): reading or writing another machine's memory over the network without its CPU.
- NIC (Network Interface Card): the card that connects a server to the network.
- NVMe (Non-Volatile Memory Express): the fast interface for SSD (solid state drive) storage on PCIe.
