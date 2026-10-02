# 13 > 阅读白皮书

这一课讲什么是 GPU 白皮书、怎样找到白皮书，以及怎样读懂它。想知道新一代 GPU 到底改变了什么，白皮书是最好的资料。后半部分带你通读一份真实的白皮书，也就是 V100 白皮书，它记录了 GPU 转向 AI 的那一刻。

## 什么是白皮书

白皮书是介绍 GPU 架构的官方技术文档。刚开始读时，你可能会觉得它内容厚重、细节太多，但它是关于 GPU 最准确的资料。它没有营销话术，也没有简化，展示的是硬件真实的构建方式。

## 找到白皮书

用芯片名称加上“white paper”搜索，例如 `GA100 white paper` 或 `H100 white paper`。对于最新的架构，NVIDIA 常把这份文档叫作技术简报，比如“NVIDIA Blackwell Architecture Technical Brief”，所以也要搜这个名字。[第 03 课](../Lesson-03/notes.md)讲了怎样找出一款产品背后的芯片名称。

> [!TIP]
> 并非每个搜索结果都有用。博客文章、总结和对比能帮上一些忙，但还不够。一定要找 NVIDIA 官方的 PDF 文件。

## 统一的结构

NVIDIA 的白皮书结构很统一。每个新架构都会拿上一代来对比讲解，所以白皮书既告诉你哪些是新的，也告诉你哪些变了。Hopper 白皮书用一张又一张表格把 H100 和 A100 作比较，V100 白皮书则把 V100 和 P100 作比较。这也是同样的表格会出现在不同白皮书里的原因。

架构在变，但各部分的顺序一直没变。

1. 新功能
2. SM 设计
3. 性能对比
4. 技术规格

这种一致性是刻意为之的。只要把一份白皮书读透，其他的读起来就容易多了。

<whitepaper-map></whitepaper-map>

## 流式多处理器

白皮书里最重要的部分是流式多处理器。SM 是 GPU 的核心组成单元，它把 CUDA 核心、Tensor Core、调度和显存访问集中在一起。

想看出一个架构到底改了什么，就看 SM。纵观各代，Tensor Core 最能说明问题。

- Pascal 没有 Tensor Core，基本上还是一个通用计算架构。
- Volta 引入了 Tensor Core，GPU 开始明确地针对 AI 工作负载做优化。
- Ampere 改进并扩大了 Tensor Core 的规模，带来更高的吞吐量、更好的能效和稀疏性支持。
- Hopper 针对 Transformer 工作负载优化了 Tensor Core，并加入了 FP8。
- Blackwell 用新的指令和 NVFP4 这样的格式扩展了 Tensor Core，把超低精度直接做进硬件。
- Blackwell Ultra（B300，2025 年）带来更大的显存，每块 GPU 288 GB HBM3e，以及更高的 NVFP4 吞吐量。
- 接下来是采用 HBM4 显存的 Rubin。它在 2026 年的进展见[第 04 课](../Lesson-04/notes.md)。

每一步都改变了 GPU 的设计目标。GPU 不再只是计算设备，而是 AI 系统的基础设施。

<arch-timeline focus="Pascal"></arch-timeline>

## 用 Volta 白皮书做实例

Volta（2017 年）是最适合拿来练手的白皮书，因为它记录了 GPU 转变方向的那一刻。PDF 在 https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf，读这一节时可以把它打开放在旁边。

### 从关键特性开始

不要一上来就钻进图表或数字里。先看“Key Features”这一部分。它很短，能告诉你这个架构想做什么。Volta 的重点很明确，这个架构是为 AI 打造的。这是用途上的转变，而不只是比 Pascal 那一代有所改进。

### Tensor Core

Volta 最重要的变化就是 Tensor Core。在 Volta 之前，GPU 用通用的 CUDA 核心执行矩阵运算。这样可行，但效率不高。Volta 为矩阵运算配备了专用硬件。V100 有 80 个 SM，每个 SM 有 8 个 Tensor Core，所以一共 80 * 8 = 640 个 Tensor Core。

白皮书给出的数字足够让你自己核对它的标题数据。每个 Tensor Core 每个时钟周期做 64 次 FMA，一次 FMA 算 2 次浮点运算。

- Tensor Core 每个时钟周期做 640 * 64 * 2 = 81,920 次运算。在 1.53 GHz 的加速频率下，就是 81,920 * 15.3 亿 ≈ 125 TFLOPS。
- CUDA 核心一共有 80 个 SM * 64 个 FP32 核心 = 5,120 个核心。5,120 * 2 * 15.3 亿 ≈ 15.7 TFLOPS。

所以做矩阵运算时，Tensor Core 的峰值是同一块芯片上 CUDA 核心的 125 / 15.7 ≈ 8 倍。从这时起，GPU 不再只是通用计算设备，而是从底层开始就为 AI 工作负载而设计。Tensor Core 和它的数字格式怎样工作，见[第 10 课](../Lesson-10/notes.md)。

### SM

Volta 重新设计了 SM。它被分成四个处理块，每块都有自己的线程束调度器、16 个 FP32 核心、16 个 INT32 核心和 2 个 Tensor Core。

一项关键改进是，不同类型的运算可以同时执行。Pascal 不能同时执行 FP32 和 INT32 指令，整数运算和浮点运算只能轮流进行。Volta 有各自独立的通路，所以它们可以并行执行。现代工作负载时时刻刻都在混用这两种运算，因为每个数组下标和地址都是整数运算，所以这一改变能更充分地利用硬件。

<volta-shift></volta-shift>

图中来了 10 条指令，6 条浮点、4 条整数。在 Pascal 的共用通路上，它们需要 6 + 4 = 10 个周期，在 Volta 的两条通路上，只需要 max(6, 4) = 6 个周期。这是一个简化的模型，但节省是真实存在的。

### 指令速度

新架构不只是增加核心，它还会让已有的运算变得更快。白皮书写明，一条有依赖的 FMA 在 Volta 上需要 4 个周期，在 Pascal 上需要 6 个周期。Ampere 和 Hopper 又在这类细节上做了进一步改进。进步不只在于规模，更在于效率。

### 显存

Volta 使用 HBM2 显存，V100 有 16 或 32 GB，速度 900 GB/s，显存带宽比前几代更高。现代 GPU 工作负载的瓶颈常常在于数据搬运的速度，而不只是处理的速度。[第 06 课](../Lesson-06/notes.md)会详细讲显存带宽。

### NVLink

Volta 引入了第二代 NVLink，也就是让 GPU 之间高速互联的链路。V100 有六条 NVLink 链路，总带宽 300 GB/s，让多 GPU 系统的效率大大提升。基于 Hopper 和 Blackwell 的大型系统更加依赖这一思路。多块 GPU 怎样协同工作，见[第 12 课](../Lesson-12/notes.md)。

### 晶体管数量

晶体管数量能说明一块 GPU 里有多少硬件。V100 有 211 亿个晶体管。

> [!NOTE]
> H100 达到了大约 800 亿个晶体管。B200 在两个协同工作、如同一块 GPU 的裸片上集成了 2080 亿个晶体管。七年里增长了将近 10 倍，而这种增长反映的是新的单元、新的显存系统和新的执行模型，不只是尺寸变大。

### Volta 的地位

站在 2026 年回头看，Volta 不只是当年一块很强的 GPU。它是 GPU 开始以 AI 为重心的转折点。Ampere、Hopper 和 Blackwell 都建立在这个思路之上，并把它推得更远。读 V100 白皮书，能帮你理解 GPU 为什么会变成今天的样子。

> [!WARNING]
> Volta 的计算能力是 7.0，它是一段历史，而不是你的编译目标。CUDA 13 只支持 Turing（CC 7.5）及更新的架构，所以 V100 需要较旧的 CUDA 12 工具包。计算能力见[第 05 课](../Lesson-05/notes.md)。

## 这对 CUDA 意味着什么

你自己那块 GPU 的白皮书，会告诉你核函数能从每个 SM 得到什么。这台机器上的 L40S 对应的是 Ada Lovelace 白皮书。它的 SM 和 Volta 一样分成四个处理块，但每块有 16 个只做 FP32 的核心，以及 16 个既能做 FP32 也能做 INT32 的核心。每个 SM 就是 4 * 32 = 128 个 FP32 核心，整块 L40S 是 142 * 128 = 18,176 个。

关键在“也能”这两个字。在共用的那一半执行整数下标运算的周期里，这个 SM 只有那 64 个专做 FP32 的核心在做浮点运算。规格表上却把 128 个全算了进去。你的循环实际能拿到哪个数字，要在白皮书里才看得到。

> [!TIP]
> 遇到一块新 GPU 时，先读它白皮书里的 SM 部分，再给它写核函数。L40S、RTX 4090 和 RTX 6000 Ada 对应的是 NVIDIA Ada GPU Architecture 白皮书。

## 怎样读一份白皮书

读白皮书不是为了背数字，而是为了理解变化。先读关键特性了解它的用途，再看 SM 找出新的硬件单元，然后借助表格和上一代比较，最后像 Volta 那个例子一样，自己核对一遍标题数据。

## 术语表

- 白皮书（white paper）：官方技术文档，不做营销也不做简化，展示一个 GPU 架构实际上是怎么构建的。
- GPU（Graphics Processing Unit）：为并行运行大量简单任务而设计的处理器。
- 架构（architecture）：一个 GPU 系列的硬件设计，比如 Volta、Ampere 或 Hopper。每种架构都有自己的白皮书。
- 代（generation）：GPU 产品更新的一个阶段。白皮书会拿每个新架构和上一代作比较。
- 芯片名称（chip name）：GPU 里那块硅片的名字，也就是你要搜索的名字，比如 GA100。
- H100：NVIDIA 2022 年基于 Hopper 的数据中心 GPU。
- 技术简报（technical brief）：NVIDIA 为 Blackwell 等最新 GPU 的架构文档使用的名称。
- PDF（Portable Document Format，便携式文档格式）：NVIDIA 发布白皮书所用的文件格式。
- Key Features（关键特性）：白皮书里很短的一部分，告诉你这个架构想做什么。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 的核心组成单元，把 CUDA 核心、Tensor Core、调度和显存访问集中在一起。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 用来编写在 GPU 上运行的程序的平台。CUDA 核心也因它得名。
- CUDA 核心（CUDA cores）：每个 SM 里的通用算术单元。在有 Tensor Core 之前，矩阵运算就在它们上面执行。
- Tensor Core：做矩阵运算的专用硬件。Volta 是第一个拥有它的架构。
- 调度（scheduling）：决定下一步由哪组线程使用 SM 的执行单元。每个 SM 有好几个调度器，每个周期都在做这件事。
- 线程束调度器（warp scheduler）：挑选下一个运行的 32 线程组的单元。每个 Volta SM 有四个，每个处理块一个。
- 处理块（processing block）：从 Volta 起 SM 被分成的四个部分之一，每块都有自己的线程束调度器和核心。
- Pascal：NVIDIA 2016 年的架构（P100），以通用计算为主，没有 Tensor Core。它是 Volta 的上一代。
- Volta：NVIDIA 2017 年的架构（V100，CC 7.0），第一个拥有 Tensor Core 的架构。
- 计算能力（compute capability，CC）：GPU 功能集的版本号。Volta 是 7.0，Turing 是 7.5，L40S 是 8.9。
- V100：这一课通读的白皮书所对应的 Volta GPU，有 80 个 SM、640 个 Tensor Core、211 亿个晶体管。
- Ampere / Hopper / Blackwell：Volta 之后的 NVIDIA 架构（2020、2022、2024），都在它的 Tensor Core 基础上继续发展。
- Blackwell Ultra：B300 和 GB300，每块 GPU 配 288 GB HBM3e 的升级版 Blackwell。
- Rubin：Blackwell 之后的架构，采用 HBM4 显存，2026 年开始进入数据中心。
- Ada Lovelace：L40S 和 RTX 40 系列所用的 2022 年架构，详见 NVIDIA Ada GPU Architecture 白皮书。
- AI（artificial intelligence，人工智能）：从数据中学习的软件。训练它主要是海量的矩阵运算。
- 工作负载（workload）：程序交给 GPU 的那类工作，比如训练神经网络。
- Transformer：现代语言模型背后的神经网络结构，主要由大型矩阵乘法组成。
- 矩阵运算（matrix operations）：对整个数字阵列做的运算，主要是矩阵乘法，占了 AI 计算的大部分。
- 吞吐量（throughput）：GPU 在一定时间内能完成多少工作。
- 稀疏性支持（sparsity support）：Ampere 的一项功能，按固定的“4 个里 2 个”模式跳过零值，让这类数据的 Tensor Core 吞吐量翻倍。
- 精度（precision）：每个数字用多少位来存。位数越少，运算越快、越省显存，但越不精确。
- FP32（32 位浮点）：标准的单精度数字格式，在 CUDA 核心上运行。
- FP8（8 位浮点）：Hopper 为大规模 AI 系统加入的一种数字格式。
- NVFP4（NVIDIA 4 位浮点）：Blackwell 的一种格式，把超低精度直接做进硬件。
- INT32（32 位整数）：用于下标和地址的整数格式。
- 整数（integer）：不带小数部分的数，比如 7 或 -3。GPU 代码经常用整数运算来计算下标和地址。
- 浮点（floating point）：带小数点的数，比如 3.14。图形和 AI 的大部分运算都用它。
- FMA（fused multiply-add，融合乘加）：一条计算 a * b + c 的指令，算作 2 次浮点运算。
- TFLOPS（tera floating point operations per second）：每秒万亿次浮点运算，峰值算力的单位。
- 周期（cycle）：GPU 时钟的一次跳动。在 1.53 GHz 下，每秒有 15.3 亿个周期。
- HBM2（High Bandwidth Memory 2）：Volta 使用的显存，V100 上为 900 GB/s，比前几代更高。
- HBM3e（High Bandwidth Memory 3e）：堆叠在当今数据中心 GPU 芯片旁边的超高速显存。
- 显存带宽（memory bandwidth）：数据送到计算单元的速度。带宽越高，等待越少。
- NVLink：让 GPU 之间互联的高速链路。Volta 用的是第二代。
- 多 GPU（multi-GPU）：一台机器里的几个 GPU 一起处理同一个任务，并不断交换数据。
- 晶体管数量（transistor count）：一块 GPU 里有多少硬件。V100 有 211 亿个晶体管，B200 有 2080 亿个。
