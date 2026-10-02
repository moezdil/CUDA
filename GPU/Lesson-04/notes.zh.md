# 04 > NVIDIA GPU 架构

Fermi、Ampere、Hopper、Blackwell 和 Rubin 都是 NVIDIA GPU 架构的名字。这一课按时间顺序把它们走一遍，从 2010 年一直到 2028 年的路线图，看看 GPU 是怎样从图形走向通用计算、再走向大规模 AI 的。你还会看到，当前的 CUDA 版本还支持其中哪些架构。

## 为什么架构很重要

Fermi、Ampere、Hopper 这些名字不只是标签。目的不是把它们背下来，而是理解 GPU 是怎样随时间变化的。

## “架构”是什么意思

GPU 架构就是 GPU 的蓝图，它规定了芯片内部的一切如何构建。

它涵盖的不只是核心，还规定了：

- 数据如何流动  
- 显存如何访问  
- 哪类运算比较快  
- GPU 针对什么做了优化  

新架构通常不是小修小补，而往往意味着设计重点的转变。

## 早期现代阶段

把时间线当成一个故事来读会更容易。早期的现代 GPU 侧重通用计算和图形。

这些架构一步步提升了性能和能效：

- Fermi（2010 年）  
- Kepler（2012 年）  
- Maxwell（2014 年）  
- Pascal（2016 年）  

这一阶段的目标，是让 GPU 在通用工作负载上更快、更高效。

## AI 成为核心

Volta（2017 年，V100）标志着一次明确的转向。从 Volta 开始，NVIDIA 大力推进 AI 专用硬件：第一代 Tensor Core，也就是每个 SM 里一步就能完成小矩阵乘法的单元。

在那之后：

- Turing（2018 年，RTX 20 系列）把 Tensor Core 和光线追踪单元带到了消费级显卡上  
- Ampere（2020 年，A100 和 RTX 30 系列）把这个思路进一步放大  
- Ada Lovelace（2022 年，RTX 40 系列和 L40S）与 Hopper 同年，把这些单元带到消费级和工作站显卡上  
- Hopper（2022 年，H100）针对 AI 工作负载做了深度优化，尤其是 Transformer，并支持 FP8 运算  

从这里开始，GPU 不再只是图形硬件，而成了完整的计算平台。

## 近期架构

### Blackwell（2024 至 2025 年）

Blackwell 于 2024 年发布，围绕大规模 AI 工作负载设计。B200 数据中心 GPU 把两颗芯片封装在一起，使用 HBM3e，带宽最高 8 TB/s。它还新增了 NVFP4，一种面向 AI 的 4 位数值格式。Blackwell Ultra（B300，2025 年）把每块 GPU 的显存提高到 288 GB。在消费级市场，RTX 50 系列（2025 年）同样采用 Blackwell。

实际的性能提升并不是在所有情况下都一样，它取决于：

- 工作负载  
- 精度  
- 系统配置  

所以 “更快的 GPU” 并不总是一句简单的话。

### Rubin（2026 年，已开始出货）

Rubin 是 Blackwell 之后的架构。它已全面投产，首批把 Rubin GPU 和 NVIDIA 的 Vera CPU 配在一起的 Vera Rubin 系统已于 2026 年 9 月开始出货，CUDA 13.4 也已支持它的计算能力 10.7。

每块 Rubin GPU 带来：

- 更新的 Tensor Core 设计  
- 最高 288 GB 的 HBM4 显存  
- 最高 22 TB/s 的显存带宽  

和 Blackwell 比一下：22 / 8 = 2.75，所以一块 Rubin GPU 每秒能搬运的字节数接近 Blackwell 的 3 倍。

### Rubin Ultra 和 Feynman（已公布）

> [!NOTE]
> 这些是路线图上的项目，还不是能买到的产品。Rubin Ultra 计划于 2027 年下半年推出，Feynman 计划于 2028 年推出，细节仍可能变化。

方向始终不变：一切都在朝更大、更专门化的 AI 系统发展。

<arch-timeline focus="Volta"></arch-timeline>

## 计算能力

CUDA 不使用架构名称。每块 GPU 都会报告一个 CC，这是一个像 8.9 这样的版本号。主版本号通常跟着架构走，但并不总是一一对应：

- Ampere：8.0（A100）和 8.6（RTX 30 系列）  
- Ada Lovelace：8.9（RTX 40 系列、L40S）  
- Hopper：9.0（H100）  
- Blackwell：10.0（B200）、10.3（B300）和 12.0（RTX 50 系列）  
- Rubin：10.7（CUDA 13.4 已支持）  

所以 Ada（8.9）和 Ampere 共用主版本号 8，而 Blackwell 用了两个不同的主版本号。

> [!WARNING]
> 当前的 CUDA 13 系列版本（CUDA 13.4 于 2026 年 9 月发布）只支持 Turing（CC 7.5）及更新的架构。Maxwell、Pascal 和 Volta GPU 需要使用较早的 CUDA 12 工具包。

## 性能取决于具体情况

简单的数字很难用来比较，比如：

- TFLOPS  
- 时钟频率  

这些数字说明不了全部。性能取决于：

- 你运行的是哪类工作负载  
- 你使用的是什么精度  
- 显存的表现如何  
- 架构是怎样设计的  

一块 GPU 在纸面上可能非常强大，在某个具体任务上却表现很差；另一块纸面数字更低的 GPU，在实际使用中反而可能更好。

## 命名也变了

V100 及之前的数据中心 GPU 都带有 “Tesla” 品牌，比如 Tesla V100。从 2020 年的 A100 开始，NVIDIA 不再使用这个品牌，改称 Data Center GPU。

这反映了重点的转变：从通用计算转向 AI 和云系统。

## 架构是设计决策

与其把架构看成一个个版本，不如把它们看成设计决策。每一种架构都在回答同一个问题：我们现在想解决什么样的问题？

从这个角度看，GPU 的名字更有意义，性能差异也变得合乎逻辑，CUDA 的概念更容易串起来。

## 总结

GPU 架构展示了计算本身正在怎样变化。这条路从图形走到计算，再走到大规模 AI，而且数据中心架构差不多每年更新一代：Hopper、Blackwell、Rubin。理解这个转变，是深入学习 CUDA 之前重要的一步。

## 术语表

- 架构（architecture）：GPU 的蓝图，规定了芯片内部的一切如何构建。
- GPU（Graphics Processing Unit，图形处理器）：这些课讲的处理器，由许多并行工作的小核心组成。
- Fermi：NVIDIA 2010 年推出的架构，也是第一个专为通用 GPU 计算设计的架构，引入了真正的 L1/L2 缓存层次结构。
- Ampere：NVIDIA 2020 年推出的架构（A100、RTX 30 系列），大幅扩充了用于 AI 的 Tensor Core。
- Hopper：NVIDIA 2022 年为 AI 打造的架构（H100），配有能使用 8 位数值的 Transformer Engine。
- 核心（core）：执行算术运算的单元；核心数量只是架构的一个方面。
- 能效（efficiency）：GPU 每消耗一瓦电能完成多少工作。
- Kepler / Maxwell / Pascal：NVIDIA 分别于 2012、2014 和 2016 年推出的架构，让 GPU 稳步变得更快、更省电。
- 工作负载（workload）：程序交给 GPU 的那类工作，比如训练模型或渲染游戏。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；训练它主要是海量的矩阵运算，正适合 GPU。
- Volta：2017 年推出的架构（V100），NVIDIA 从它开始大力推进 AI 专用硬件，首次加入了 Tensor Core。
- Turing：2018 年推出的架构（RTX 20 系列），把 Tensor Core 和光线追踪单元带到了消费级 GPU 上；CC 7.5。
- Ada Lovelace：2022 年推出的消费级和工作站架构（RTX 40 系列、L40S）；CC 8.9。
- Transformer：现代语言模型背后的神经网络结构；它主要由大型矩阵乘法组成。
- FP8 / NVFP4（8-bit floating point / NVIDIA 4-bit floating point）：面向 AI 的 8 位和 4 位数值格式；Hopper 加入了 FP8，Blackwell 加入了 NVFP4。
- Blackwell：2024 至 2025 年推出的架构（B200、B300、RTX 50 系列），围绕大规模 AI 工作负载设计。
- Blackwell Ultra：Blackwell 在 2025 年的升级版（B300），每块 GPU 配有 288 GB HBM3e。
- 带宽（bandwidth）：每秒能在显存和芯片之间搬运多少字节。
- 精度（precision）：每个数用多少位来存储，比如 FP32、FP16 或 FP8；位数越少，运算越快，但精确度越低。
- Rubin：Blackwell 之后的架构，已全面投产，2026 年下半年开始交付给云服务商。
- CPU（Central Processing Unit，中央处理器）：计算机的主处理器；Vera 是 NVIDIA 自己的 CPU，与 Rubin GPU 搭配使用。
- Tensor Core：每个 SM 里一步就能完成小矩阵乘法的单元，是 AI 计算速度的关键。
- HBM3e / HBM4（High Bandwidth Memory，高带宽显存）：紧挨着芯片堆叠的显存；Blackwell 使用 HBM3e，Rubin 使用 HBM4。
- SM（Streaming Multiprocessor，流式多处理器）：NVIDIA GPU 的基本构件，里面有核心、Tensor Core 和共享内存。
- 云（cloud）：通过互联网从服务商的数据中心租用的计算机。
- Rubin Ultra / Feynman：Rubin 之后已公布的架构，计划分别于 2027 年和 2028 年推出。
- CC（Compute Capability，计算能力）：GPU 向 CUDA 报告的版本号，比如 Ada Lovelace 是 8.9，B200 是 10.0。
- TFLOPS（trillions of floating-point operations per second，每秒万亿次浮点运算）：一个简单的性能数字，反映不了全貌。
- 时钟频率（clock speed）：另一个简单的数字，单独拿来比较并不靠谱。
- Tesla：NVIDIA 数据中心 GPU 在 V100 及之前使用的旧品牌，从 A100 开始不再使用。
- Data Center GPU（数据中心 GPU）：NVIDIA 现在给服务器 GPU 用的名字，比如 A100、H100 和 Blackwell 系列产品。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的程序；CUDA 13 支持 Turing 及之后的所有架构。
