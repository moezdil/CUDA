# 阅读 GPU 白皮书

这一课讲什么是 GPU 白皮书、怎样找到它们，以及怎样阅读它们。

## 什么是白皮书

白皮书是关于 GPU 的官方技术文档。刚开始读，你可能会觉得它很厚重、细节太多。但它是关于 GPU 最准确的资料。里面没有营销，也没有简化。它展示的是硬件实际上是怎么构建的。

## 找到白皮书

用芯片名称加上 “white paper” 搜索。例如：`GA100 white paper` 或 `H100 white paper`

> [!TIP]
> 并不是每个搜索结果都有用。博客文章、总结和对比可以帮上忙，但还不够。一定要找官方的 PDF。

## 统一的结构

NVIDIA 的白皮书遵循统一的结构。每个新架构通常都会和上一个架构对比着来讲。所以白皮书既会告诉你哪些是新的，也会告诉你哪些变了。这就是为什么同样的表格会出现在不同的白皮书里。

只要你把一份白皮书读透，其他的就好读多了。

## GPU 架构的发展方向

到 2026 年，GPU 架构呈现出清晰的方向：

- Pascal 基本上还是一个通用计算架构。
- Volta 引入了 Tensor Core。GPU 开始明确地针对 AI 工作负载做优化。
- Ampere 进一步扩展了这一点，带来更高的吞吐量、更好的能效，以及稀疏性支持等功能。
- Hopper 为大规模 AI 系统加入了 FP8 和新的执行模型。
- Blackwell 加入了 NVFP4 这样的新格式，把超低精度直接做进硬件。这改变了大模型部署和扩展的方式。

GPU 不再只是计算设备，它们是 AI 系统的基础设施。

<arch-timeline focus="Pascal"></arch-timeline>

## 流式多处理器（SM）

白皮书里最重要的部分是流式多处理器（Streaming Multiprocessor，SM）。SM 是 GPU 的核心。它把这些东西集中在一起：

* CUDA 核心
* Tensor Core
* 调度
* 显存访问

想看出一个架构到底改了什么，就看 SM。演变过程一目了然：

- Pascal 没有 Tensor Core。
- Volta 引入了 Tensor Core。
- Ampere 改进并扩大了 Tensor Core 的规模。
- Hopper 针对 Transformer 工作负载优化了 Tensor Core。
- Blackwell 用新的精度格式和指令扩展了 Tensor Core。

每一步都改变了 GPU 的设计目标。

## 各部分的顺序

架构在变，但记录它们的方式没变。顺序是：

1. 新功能
2. SM 设计
3. 性能对比
4. 技术规格

这种一致性是有意为之的。它让你更容易跟上各代之间的演变。

<whitepaper-map></whitepaper-map>

## 怎样读一份白皮书

读白皮书不是为了背数字，而是为了理解变化。看 SM，找出新的硬件单元，再和上一代比较。

## 术语表

- 白皮书（white paper）：官方技术文档，展示 GPU 实际上是怎么构建的，没有营销内容。
- 流式多处理器（Streaming Multiprocessor，SM）：GPU 的核心，把 CUDA 核心、Tensor Core、调度和显存访问集中在一起。
- Tensor Core：Volta 引入的硬件单元，让 GPU 开始明确地针对 AI 工作负载做优化。
- Pascal：一个基本上属于通用计算的架构，没有 Tensor Core。
- 稀疏性支持（sparsity support）：Ampere 加入的一项功能，同时还带来了更高的吞吐量和更好的能效。
- FP8：Hopper 为大规模 AI 系统加入的一种格式。
- NVFP4：Blackwell 的一种格式，把超低精度直接做进硬件。
