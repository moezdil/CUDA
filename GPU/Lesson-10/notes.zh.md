# 阅读 GPU 白皮书

这一课讲什么是 GPU 白皮书、怎样找到白皮书，以及怎样读懂它。

## 什么是白皮书

白皮书是介绍 GPU 架构的官方技术文档。刚开始读时，你可能会觉得它内容厚重、细节太多。但它是关于 GPU 最准确的资料：没有营销话术，也没有简化，展示的是硬件真实的构建方式。

## 找到白皮书

用芯片名称加上“white paper”搜索，例如：`GA100 white paper` 或 `H100 white paper`

> [!TIP]
> 并非每个搜索结果都有用。博客文章、总结和对比能帮上一些忙，但还不够。一定要找官方的 PDF。

## 统一的结构

NVIDIA 的白皮书结构很统一。每个新架构通常都会拿上一代架构来对比讲解，所以白皮书既告诉你哪些是新的，也告诉你哪些变了。这也是同样的表格会出现在不同白皮书里的原因。

只要把一份白皮书读透，其他的读起来就容易多了。

## GPU 架构的发展方向

截至 2026 年，GPU 架构的发展方向已经很清晰：

- Pascal 基本上还是一个通用计算架构。
- Volta 引入了 Tensor Core。GPU 开始明确地针对 AI 工作负载做优化。
- Ampere 在此基础上进一步扩展，带来更高的吞吐量、更好的能效，以及稀疏性支持等功能。
- Hopper 为大规模 AI 系统加入了 FP8 和新的执行模型。
- Blackwell 加入了 NVFP4 这样的新格式，把超低精度直接做进硬件。这改变了大模型部署和扩展的方式。

GPU 不再只是计算设备，而是 AI 系统的基础设施。

<arch-timeline focus="Pascal"></arch-timeline>

## 流式多处理器（SM）

白皮书里最重要的部分是流式多处理器（Streaming Multiprocessor，SM）。SM 是 GPU 的核心，它集中了以下几部分：

* CUDA 核心
* Tensor Core
* 调度
* 显存访问

想看出一个架构到底改了什么，就看 SM。演变脉络一目了然：

- Pascal 没有 Tensor Core。
- Volta 引入了 Tensor Core。
- Ampere 改进并扩大了 Tensor Core 的规模。
- Hopper 针对 Transformer 工作负载优化了 Tensor Core。
- Blackwell 用新的精度格式和指令扩展了 Tensor Core。

每一步都改变了 GPU 的设计目标。

## 各部分的顺序

架构在变，但白皮书的写法一直没变。顺序是：

1. 新功能
2. SM 设计
3. 性能对比
4. 技术规格

这种一致性是刻意为之的，能让你更容易看清各代之间的演变。

<whitepaper-map></whitepaper-map>

## 怎样读一份白皮书

读白皮书不是为了背数字，而是为了理解变化。看 SM，找出新的硬件单元，再和上一代比较。

## 术语表

- 白皮书（white paper）：官方技术文档，展示 GPU 实际上是怎么构建的，没有营销内容。
- 架构（architecture）：一个 GPU 系列的硬件设计，比如 Ampere 或 Hopper；每种架构都有自己的白皮书。
- 芯片名称（chip name）：GPU 里那块硅片的名字，也就是你要搜索的名字，比如 GA100。
- GA100：A100 里的 Ampere 芯片。
- H100：Nvidia 2022 年基于 Hopper 的数据中心 GPU。
- Pascal：一个以通用计算为主的架构，没有 Tensor Core。
- Tensor Core：Volta 引入的硬件单元，让 GPU 开始明确地针对 AI 工作负载做优化。
- 吞吐量（throughput）：GPU 在一定时间内能完成多少工作。
- 稀疏性支持（sparsity support）：Ampere 的一项功能，按固定的“4 个里 2 个”模式跳过零值，让这类数据的 Tensor Core 吞吐量翻倍。
- FP8：Hopper 为大规模 AI 系统加入的一种 8 位浮点格式。
- NVFP4：Blackwell 的一种格式，把超低精度直接做进硬件。
- 精度（precision）：每个数字用多少位来存；位数越少，运算越快、越省显存，但越不精确。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 的核心，把 CUDA 核心、Tensor Core、调度和显存访问集中在一起。
- CUDA 核心（CUDA cores）：每个 SM 里的通用算术单元。
- 调度（scheduling）：决定下一步由哪组线程使用 SM 的执行单元；每个 SM 有好几个调度器，每个周期都在做这件事。
- Transformer：现代语言模型背后的神经网络结构，主要由大型矩阵乘法组成。
- 代（generation）：GPU 产品更新的一个阶段；白皮书会拿每个新架构和上一代作比较。
