# 05 > 架构与芯片

架构并不是某一颗芯片，而是共用同一套基础设计的一个芯片家族，而每颗芯片又会出现在好几款不同的产品里。这一课以 Ada Lovelace 和 Blackwell 为例，讲清楚架构、芯片和最终的 GPU（Graphics Processing Unit，图形处理器）是怎样对应起来的。

## 一种架构，多颗芯片

以 Ada Lovelace 架构（2022 年）为例，它包括几颗不同的芯片，比如：

- AD102  
- AD103  
- AD104  

前缀 “AD” 把它们都和同一种架构联系起来。还没看任何规格，你就知道它们是一家人。

当前这一代消费级产品也是同样的规律。Blackwell 消费级芯片以 “GB” 开头：RTX 5090 用 GB202，RTX 5080 用 GB203，RTX 5070 用 GB205。

## 同一设计，不同规模

同一架构的芯片有不同的用途：有的用在高端 GPU 上，有的用在中端或更小的系统里。

芯片的大小用 SM（Streaming Multiprocessor，流式多处理器）的数量来衡量，SM 是容纳核心的基本构件。完整的 AD102 有 144 个 SM，完整的 AD103 有 80 个，完整的 AD104 有 60 个。所以 AD102 用在顶级 GPU 上，AD104 用在 RTX 4070 Ti 这样更小、更省电的显卡上。Nvidia 就是这样把一套设计缩放成不同的大小和能力。

## 不同架构，不同工作

并不是所有架构都为同一类工作而生。对比一下 Ada Lovelace 和 Hopper：

- Ada 主要用于消费级 GPU，比如游戏、台式机和创作，也有 L40S 这样的少数服务器显卡。  
- Hopper 用于数据中心、AI（人工智能）训练和大规模计算。  

所以区别在于用途，而不只是性能。有些架构面向图形和交互式工作，有些面向大规模并行计算。这就是为什么你在普通 PC 里见不到基于 Hopper 的 GPU。

> [!NOTE]
> Blackwell 同时覆盖了这两个世界，但用的是不同的芯片。B200 数据中心 GPU 和 RTX 5090 都属于 Blackwell，却用着不同的芯片，向 CUDA（Compute Unified Device Architecture，统一计算设备架构）报告的 CC（Compute Capability，计算能力）也不一样：B200 是 10.0，RTX 5090 是 12.0。

## 一个外观上的线索

数据中心 GPU 通常看起来很朴素，看不到风扇。它们装在服务器里，靠气流、机架和整套系统来散热。

消费级 GPU 有庞大的散热系统和好几个风扇。它们在普通的 PC（Personal Computer，个人电脑）机箱里运行，所以必须自己处理发热。

显卡的外观是一个有用的线索，但不是严格的规则。

## 同一颗芯片，表现可以不同

一颗芯片不等于一种用途。同一颗芯片可以以不同的形式出现。厂商可以：

- 关闭一部分核心  
- 修改功耗上限  
- 调整时钟频率  

所以用同一颗芯片的两块 GPU，表现未必相同。AD102 就是一个真实的例子：

- RTX 4090：144 个 SM 中开启 128 个，功耗上限 450 W，24 GB GDDR6X 显存。  
- L40S：144 个 SM 中开启 142 个，功耗上限 350 W，48 GB GDDR6 显存。  

在 RTX 4090 上，144 − 128 = 16 个 SM 被关闭，占整颗芯片的 16 / 144 ≈ 11%。这样一来，带有少量坏 SM 的芯片关掉这些 SM 后照样可以出售。

## 板卡合作伙伴

Nvidia 并不自己制造每一块最终的 GPU。ASUS、MSI、Gigabyte 这样的公司拿到同一颗芯片，做出自己的版本。它们会改动：

- 散热设计  
- 供电配置  
- 加速频率的行为  

基础芯片相同，结果略有不同。

<arch-family></arch-family>

## 完整的图景

架构是一套基础设计，包含好几颗针对不同用途缩放过的芯片，厂商再加上各自的改动。所以一块 GPU 由以下三部分组成：

- 一种架构  
- 一颗具体的芯片  
- 厂商自己的实现  

> [!TIP]
> 想看懂任何一块 GPU，按顺序问三个问题：什么架构、什么芯片、什么显卡。对 RTX 5090 来说，答案是 Blackwell、GB202，以及 Nvidia 或某个板卡合作伙伴做的显卡。

## 为什么这很重要

这能让 GPU 的名字更好读懂，帮你看清两块 GPU 为什么表现不同、一块 GPU 处在什么位置。不明白这一点，深入学习 CUDA 时就很容易误解性能和硬件行为。

## 术语表

- 架构（architecture）：一个芯片家族共用的基础设计。
- 前缀（prefix）：芯片名称开头的几个字母，比如 AD 或 GB，它表明芯片属于哪种架构。
- GPU（Graphics Processing Unit，图形处理器）：围绕芯片搭建的完整产品，带有显存、供电部件和散热。
- Ada Lovelace：Nvidia 2022 年推出的架构，主要用于消费级 GPU，芯片有 AD102 等。
- AD102：Ada Lovelace 中最大的芯片，有 144 个 SM，用在 GeForce RTX 4090 和 L40S 上。
- AD104：Ada Lovelace 中较小的芯片，有 60 个 SM，用在 RTX 4070 Ti 这样的显卡上。
- Blackwell：Nvidia 当前的架构，既有数据中心芯片（B200），也有消费级芯片（RTX 5090 里的 GB202）。
- GB202：消费级 Blackwell 芯片中最大的一块，用在 RTX 5090 上。
- SM（Streaming Multiprocessor，流式多处理器）：Nvidia GPU 的基本构件，里面装着核心；芯片的大小用 SM 数量来衡量。
- Hopper：Nvidia 的一种架构，用于数据中心、AI 训练和大规模计算，H100 就基于它。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；训练它主要是海量的矩阵运算，正适合 GPU。
- 数据中心（data center）：放满服务器的机房，GPU 靠整套系统的气流散热。
- 性能（performance）：GPU 完成实际工作的快慢；它取决于芯片、频率、功耗和散热，而不只是架构。
- CC（Compute Capability，计算能力）：GPU 向 CUDA 报告的版本号，比如 Ada Lovelace 是 8.9，RTX 5090 是 12.0。
- 散热（cooling）：把 GPU 产生的热量带走，要么靠显卡自己的风扇，要么靠服务器里的气流。
- 气流（airflow）：服务器自身风扇吹过机身的空气，用来给里面无风扇的 GPU 散热。
- 机架（rack）：数据中心里把很多台服务器上下叠放在一起的高架子。
- PC（Personal Computer，个人电脑）机箱（PC case）：容纳台式电脑各个部件的箱子；消费级 GPU 必须在机箱里自己散热。
- 核心（core）：芯片上的一个计算单元；厂商可以关闭其中一部分，比如让带有少量坏核心的芯片也能出售。
- 功耗上限（power limit）：GPU 最多能消耗的功率，单位是瓦；上限越低，发热越少，速度也越慢。
- 时钟频率（clock speed）：厂商可以调整的一项设置，所以用同一颗芯片的 GPU 表现可能不同。
- 板卡合作伙伴（board partner）：ASUS、MSI、Gigabyte 这类公司，用 Nvidia 的芯片做出自己的 GPU。
- 加速频率（boost）：在功耗和温度允许的范围内，GPU 自动提升到的更高时钟频率。
- 厂商自己的实现（vendor-specific implementation）：某个厂商围绕一颗芯片做出的自家版本 GPU。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的程序；同一份 CUDA 代码可以在所有较新架构的芯片上运行。
