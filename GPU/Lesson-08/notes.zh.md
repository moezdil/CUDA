# 08 > 认识一块真实的 GPU

这一课教你在几分钟内查出一块真实 GPU（Graphics Processing Unit，图形处理器）的架构和类别。你还会明白为什么核心数量会误导人，以及在看任何参数之前，显卡的外观设计就能给你哪些提示。

## 查一下这块 GPU

把 GPU 的名字和“TechPowerUp”一起搜索，例如“RTX 5090 TechPowerUp”或“B200 TechPowerUp”，然后打开搜索结果。TechPowerUp 维护着一个很大的 GPU 参数数据库。

页面上会有很多数字和参数。不要试图全部看懂，只关注两件事：架构和产品类别。

> [!TIP]
> 想查一块 GPU 的计算能力（CC，[第 09 课](../Lesson-09/notes.md)会讲），可以看 NVIDIA 官方的“CUDA GPUs”页面，那里列出了每张卡的 CC 编号。

## 架构与类别

看两块当前的 GPU。GeForce RTX 5090 使用 Blackwell 架构，属于 GeForce 系列，面向消费级用途，比如游戏或个人工作站。B200 同样使用 Blackwell，但它是数据中心 GPU，用于在服务器里训练人工智能（AI，artificial intelligence）模型和做推理。

- 架构告诉你 GPU 是怎么造出来的。
- 类别告诉你它用在哪里。

同一个架构，两个完全不同的世界。参数说明了一切：

| | RTX 5090 | B200 |
|---|---|---|
| 架构 | Blackwell | Blackwell |
| 类别 | GeForce（消费级） | 数据中心 |
| CUDA 核心 | 21,760 | 18,944 |
| 显存 | 32 GB GDDR7 | 180 GB HBM3e |
| 显存带宽 | 1,792 GB/s | 8 TB/s |
| 晶体管 | 约 920 亿 | 2080 亿（两个裸片） |

消费级显卡的 CUDA 核心更多，但数据中心 GPU 的显存是它的五倍多，带宽约为它的四倍。对大型 AI 模型来说，显存和带宽比核心数量更关键。上一代也是同样的情况：RTX 3090 和 A100 都是 Ampere 架构。

> [!NOTE]
> 较早的资料常把数据中心类别叫作“Tesla”。现在 NVIDIA 直接称其为数据中心 GPU，并按芯片命名产品，比如 H100、B200 或 B300。

## 不要只比较核心数量

7,000 或 21,760 这样的核心数量看起来很有说服力，但会误导人。它们通常只统计一种单元，也就是 FP32（32 位浮点）CUDA 核心，而把负责 AI 矩阵运算的 Tensor Core 和其他专用单元排除在外。

现代 GPU，尤其是 Hopper 和 Blackwell，把很大一部分算力放在这些其他单元上。举个具体例子：上面的 B200 的 CUDA 核心比 RTX 5090 少，但训练大型 AI 模型要快得多，因为它的 Tensor Core 和显存系统正是为这项工作而设计的。只看核心数量说明不了全部问题。

## 外观设计能给你提示

A100、H100 或 B200 这类数据中心 GPU 通常看不到风扇。很多是 SXM 模块（Server PCI Express Module），一块直接平装在服务器主板上的扁平电路板。它们运行在服务器里，由服务器负责散热。

GeForce 显卡带有大风扇和散热系统。它们是为台式机和工作站设计的，必须自己处理发热。

由此可以得到一个简单的判断方法：

- 有大型、显眼的散热器，多半是消费级 GPU。
- 没有风扇的紧凑模块，多半是数据中心 GPU。

> [!WARNING]
> 这是经验法则，不是定律。有些数据中心 GPU 以普通 PCIe（Peripheral Component Interconnect Express）卡的形式出现，最新的机架也会用液冷代替风冷。最终一定要用产品名称来确认。

<spec-reader></spec-reader>

## 问对问题

你不需要看懂每个数字，只要问这几个问题：

- 这块 GPU 用的是什么架构？  
- 它属于哪个类别？  
- 它是为解决哪类问题而设计的？  

有了这些答案，其余参数就更容易理解了。做 CUDA（Compute Unified Device Architecture）和 GPU 开发时，了解一块 GPU 的用途和了解它的参数同样重要。

## 术语表

- GPU（Graphics Processing Unit）：为并行运行大量简单任务而设计的处理器。
- TechPowerUp：一个拥有大型 GPU 参数数据库的网站；把 GPU 名字和“TechPowerUp”一起搜索就能找到它的页面。
- 参数：GPU 公布的某一项技术数值，比如核心数量、显存大小或时钟频率。
- 计算能力（CC，compute capability）：NVIDIA 用来表示 GPU 能做什么的版本号，第 09 课会讲。
- RTX 5090：2025 年推出的 GeForce GPU，基于 Blackwell，有 21,760 个 CUDA 核心和 32 GB GDDR7 显存。
- B200：一块 Blackwell 数据中心 GPU，由两个裸片组成，有 2080 亿个晶体管和 180 GB HBM3e 显存。
- RTX 3090 / A100：2020 年的两块 Ampere GPU，一块是 GeForce 显卡，一块是数据中心 GPU；是上一代的同样组合。
- 架构：GPU 的构造方式；RTX 5090 和 B200 都使用 Blackwell。
- Blackwell：NVIDIA 2024 至 2025 年的架构，用于 RTX 50 系列、RTX PRO 显卡和 B200。
- 类别：GPU 的使用场景，比如消费级或数据中心。
- GeForce：NVIDIA 面向消费级用途（如游戏或个人工作站）的 GPU 系列。
- 工作站：用于 3D 设计或工程等专业工作的高性能台式电脑。
- 数据中心 GPU：为 AI、云和大型系统打造的 GPU；较早的资料把这一类叫作“Tesla”。
- 人工智能（AI，artificial intelligence）：从数据中学习的软件；训练它主要是海量的矩阵运算。
- CUDA 核心：GPU 中通用的 FP32 运算单元，核心数量通常统计的就是它们。
- GDDR7：RTX 50 系列使用的显存，速度快，但比数据中心 GPU 的 HBM 小得多、慢得多。
- HBM3e（High Bandwidth Memory）：堆叠在数据中心 GPU 芯片旁边的超高速显存。
- 显存带宽：显存每秒能提供多少数据，例如 B200 为 8 TB/s。
- 核心数量：核心的个数，往往只统计一种核心；说明不了全部问题。
- FP32（32 位浮点）：单精度运算，核心数量通常统计的单元类型。
- Tensor Core：为 AI 做矩阵运算的单元；核心数量不包括它们。
- Hopper / Blackwell：NVIDIA 2022 年和 2024 年的数据中心架构，配备大量 Tensor Core。
- SXM（Server PCI Express Module）：一种数据中心 GPU 形态，平装在服务器主板上而不是插在 PCIe 插槽里，由服务器散热。
- PCIe（Peripheral Component Interconnect Express）：把扩展卡连接到电脑其他部分的标准插槽和总线。
- 散热：带走 GPU 产生的热量，靠显卡自带的风扇、服务器的气流或液冷。
- CUDA（Compute Unified Device Architecture）：NVIDIA 的平台，用来编写在其 GPU 上运行的程序，GeForce 和数据中心 GPU 都适用。
