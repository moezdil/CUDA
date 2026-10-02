# 03 > 读懂 GPU 参数

一份规格页面会列出几十个数字，其中大部分你一开始根本用不上。这一课告诉你去哪里查任何一块 GPU 的参数、先回答哪三个问题，以及为什么页面上最大的那个数字，也就是核心数量，常常会误导人。最后我们一起读懂本站所有例子都在用的 L40S。

## 查找参数

最快的办法是把 GPU 名字加上“TechPowerUp”去搜索，例如“A100 TechPowerUp”或“RTX 5090 TechPowerUp”。TechPowerUp 维护着一个很大的 GPU 数据库，收录了各家厂商的详细参数。两个网站说法不一致时，以 NVIDIA 自己的产品页和数据手册为准。

页面上会有很多数字。现在不要试图全部看懂，先看芯片名称、架构和产品类别。

> [!TIP]
> 想查 CC，也就是 CUDA 关心的那个数字、[第 05 课](../Lesson-05/notes.md)的主题，可以看 NVIDIA 的列表 developer.nvidia.com/cuda-gpus。在装有 NVIDIA GPU 的机器上，`nvidia-smi --query-gpu=name,compute_cap --format=csv` 会打印出每块 GPU 的名字和 CC；在本站的机器上，这一行是 `NVIDIA L40S, 8.9`。

## 架构与类别

[第 02 课](../Lesson-02/notes.md)已经解释过这两个词。再提醒一下：

- 架构 → GPU 是怎么造出来的（Ampere、Ada Lovelace、Hopper、Blackwell）。
- 类别 → 它用在哪里，这几课也把它叫作“代”（GeForce、Data Center GPU）。

RTX 3090 和 A100 是 2020 年的一对经典组合。两者都用 Ampere，所以技术设计相同。RTX 3090 是 GeForce 显卡，用在台式机、笔记本电脑和工作站上：游戏、内容创作和一般的 GPU 任务。A100 是 Data Center GPU，用在服务器、数据中心和超级计算机里。

架构相同不等于用途相同，参数会说明这一点。

> [!NOTE]
> 较早的资料常把数据中心类别叫作“Tesla”。NVIDIA 从 A100 起不再用这个名字，现在按芯片给数据中心产品命名，比如 H100、B200 或 B300。

## 比较 RTX 3090 和 A100

先看芯片名称：RTX 3090 → GA102，A100 → GA100。“GA” 代表 Ampere。[第 02 课](../Lesson-02/notes.md)讲了一个架构怎样被做成好几种芯片。

再看核心数量：

- RTX 3090 → 10,496 个核心
- A100 → 6,912 个核心

这个数字就是 SM 的个数乘以每个 SM 的核心数。算一下：

- RTX 3090：82 个 SM * 128 个核心 = 10,496
- A100：108 个 SM * 64 个核心 = 6,912

所以 RTX 3090 的 SM 更少，但每个 SM 统计的核心数是 A100 的两倍。这并不说明它是更强的 GPU。这些“核心”只是单精度核心，NVIDIA 把它们叫作 CUDA 核心。它们负责标准的浮点运算，并不是 GPU 里的全部核心。

现代 GPU 还有做整数运算的核心、做双精度运算的核心，以及为 AI 背后的矩阵运算打造的 Tensor Core。A100 有 432 个 Tensor Core，RTX 3090 有 328 个；双精度性能上 A100 是 9.7 TFLOPS，RTX 3090 约为 0.56 TFLOPS：9.7 / 0.56 = 约 17 倍。

显存也不一样：A100 是 40 GB HBM2，带宽 1,555 GB/s；RTX 3090 是 24 GB GDDR6X，带宽 936 GB/s。[第 06 课](../Lesson-06/notes.md)会解释为什么显存带宽常常决定速度。

<gpu-compare></gpu-compare>

## 今天还是同样的规律

现在的一对是 RTX 5090 和 B200，两者都用 Blackwell。RTX 5090 是 GeForce 显卡，面向游戏、创作者和本地 AI；B200 是数据中心 GPU，用于在服务器里做 AI 训练和推理。

| | RTX 5090 | B200 |
|---|---|---|
| 类别 | GeForce（消费级） | 数据中心 |
| 芯片 | GB202 | 一个封装里的两个 GB100 裸片 |
| CUDA 核心 | 21,760 | 18,944 |
| 显存 | 32 GB GDDR7 | 180 GB HBM3e |
| 显存带宽 | 1,792 GB/s | 8 TB/s |
| 晶体管 | 约 920 亿 | 2080 亿 |

消费级显卡的 CUDA 核心更多。数据中心 GPU 的显存是它的 180 / 32 = 约 5.6 倍，带宽是 8,000 / 1,792 = 约 4.5 倍。对大型 AI 模型来说，显存和带宽比核心数量更关键。

## 不要只比较核心数量

6,912 或 21,760 这样的核心数量看起来很有说服力，但它通常只统计一种单元：FP32 CUDA 核心。Tensor Core、双精度单元和其他专用单元都不在里面。

现代 GPU，尤其是 Hopper 和 Blackwell，把很大一部分算力放在这些其他单元上。B200 的 CUDA 核心比 RTX 5090 少，但训练大型 AI 模型要快得多，因为它的 Tensor Core 和显存系统正是为这项工作设计的。所以永远不要只凭核心数量评判一块 GPU。

## 从外观分辨

很多时候，只看显卡本身就能分辨出类别。

P100、V100、A100、H100 或 B200 这类数据中心 GPU 通常没有自己的风扇。它们结构紧凑、无风扇，运行在散热能力很强的数据中心里：服务器把气流吹过散热片，或者让液体流过冷板。

> [!NOTE]
> 很多数据中心 GPU 根本不是插卡。A100、H100 和 B200 大多是 SXM 模块，平装在服务器主板上，较新的机柜还常常用液冷。

GeForce 显卡带有大风扇和散热片。它们用在台式电脑和个人工作站里，这些系统必须自己处理发热，所以显卡要自己散热。

由此可以得到一个简单的判断方法：

- 有显眼的大风扇 → 多半是消费级 GPU。
- 紧凑的模块或没有风扇的卡 → 多半是数据中心 GPU。

> [!WARNING]
> 这是经验法则，不是定律。有些数据中心 GPU 是普通的 PCIe 卡。L40S 就是一例：一张被动散热的双槽 PCIe 卡，没有风扇，由服务器散热。最终一定要用产品名称来确认。

<spec-reader></spec-reader>

## 读懂 L40S

把这些用在本站所有例子背后的那块 GPU 上。搜索“L40S TechPowerUp”或打开 NVIDIA 的数据手册，回答三个问题：

- 架构 → Ada Lovelace，芯片 AD102，CC 8.9。
- 类别 → Data Center GPU，一张被动散热的 PCIe 卡。
- 用途 → 在服务器里做 AI 推理和图形处理。

再看数字。L40S 有 142 个 SM，每个 128 个 FP32 核心：142 * 128 = 18,176 个 CUDA 核心。它还有 568 个 Tensor Core（每个 SM 4 个：142 * 4 = 568），以及带宽 864 GB/s 的 48 GB GDDR6 显存。H100 SXM 的 CUDA 核心更少（16,896 个），但用的是 3.35 TB/s 的 HBM3，带宽约为 L40S 的 3.9 倍，所以做训练时它是更快的选择。

## 问对问题

你不需要看懂每个数字，只要问这几个问题：

- 这块 GPU 用的是什么架构？
- 它属于哪个类别？
- 它是为解决哪类问题而设计的？

有了这些答案，其余参数就讲得通了。做 CUDA 开发时，CC 告诉你能用哪些功能（[第 05 课](../Lesson-05/notes.md)），SM 数量和显存带宽告诉你一个核函数需要多少工作量才能让 GPU 忙起来（[第 06 课](../Lesson-06/notes.md)）。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：能同时进行成千上万次小计算的芯片，最早为图形而造，如今也用于 AI 和科学计算。
- 规格（spec，specification）：GPU 公布的某一项技术数值，比如核心数量、显存大小或时钟频率。
- TechPowerUp：一个拥有大型 GPU 数据库的网站；把 GPU 名字和“TechPowerUp”一起搜索就能找到它的页面。
- 数据手册（datasheet）：厂商为产品发布的官方参数文档，两个网站说法不一致时以它为准。
- CC（compute capability，计算能力）：NVIDIA 表示 GPU 功能集的版本号，比如 A100 是 8.0，L40S 是 8.9（[第 05 课](../Lesson-05/notes.md)）。
- CUDA（Compute Unified Device Architecture）：NVIDIA 的平台，用来编写在其 GPU 上运行的程序，GeForce 和数据中心 GPU 都适用。
- nvidia-smi：NVIDIA 的命令行工具，列出机器里的 GPU 及其状态。
- 架构（architecture）：GPU 的构造方式，比如 Ampere 或 Blackwell。
- 类别（category）：GPU 的使用场景，比如消费级或数据中心；这几课也把它叫作“代”。
- 代（generation）：在这几课里指 GPU 所属的产品系列，比如 GeForce 或 Data Center GPU。
- Ampere：2020 年的架构，RTX 3090 和 A100 都基于它。
- RTX 3090：2020 年推出的 GeForce GPU，基于 Ampere，有 82 个 SM、10,496 个核心和 24 GB GDDR6X 显存。
- A100：NVIDIA 2020 年推出的数据中心 GPU，基于 Ampere，有 108 个 SM、6,912 个单精度核心和 432 个 Tensor Core。
- GeForce：NVIDIA 面向游戏和个人工作站的消费级 GPU，自带风扇。
- 工作站（workstation）：用于 3D 设计或工程等专业工作的高性能台式电脑。
- Data Center GPU（数据中心 GPU）：NVIDIA 用于服务器的 GPU，比如 A100 或 B200，通常没有自己的风扇。
- Tesla：NVIDIA 数据中心 GPU 以前的名字，一直用到 V100 和 T4。
- 数据中心（data center）：放满服务器的机房，靠强力风扇、空调或液冷散热。
- 超级计算机（supercomputer）：成千上万台互联的服务器，像一台机器一样协同处理超大规模的问题。
- 芯片名称（chip name）：GPU 内部芯片的名字，比如 A100 的 GA100 或 L40S 的 AD102。
- 核心数量（core count）：规格里列出的核心数，往往只统计一种核心；说明不了全部问题。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 里的一组核心；核心数量 = SM 个数 * 每个 SM 的核心数。
- 单精度核心（single-precision cores）：负责 32 位浮点运算的核心，核心数量通常只统计它们。
- CUDA 核心（CUDA cores）：NVIDIA 对 GPU 中 FP32 单元的叫法，L40S 有 18,176 个。
- 浮点（floating-point）：带小数点的数，比如 3.14；单精度用 32 位存一个数，双精度用 64 位。
- FP32（32 位浮点）：单精度运算，核心数量通常统计的单元类型。
- 双精度（double-precision）：64 位浮点运算，用于科学计算；A100 在这方面比 RTX 3090 快约 17 倍。
- Tensor Core：做 AI 背后矩阵运算的单元；核心数量不包括它们。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；训练它主要是海量的矩阵运算。
- TFLOPS（teraFLOPS）：每秒万亿次浮点运算。
- HBM2 / HBM3 / HBM3e（High Bandwidth Memory，高带宽内存）：数据中心 GPU 上堆叠在芯片旁边的显存，比 GeForce 显卡上的 GDDR 显存更快；HBM2、HBM3 和 HBM3e 是它的不同版本。
- 显存带宽（memory bandwidth）：显存每秒能提供多少数据，例如 L40S 为 864 GB/s，B200 为 8 TB/s。
- RTX 5090：2025 年推出的 GeForce GPU，基于 Blackwell，有 21,760 个 CUDA 核心和 32 GB GDDR7 显存。
- B200：一块 Blackwell 数据中心 GPU，由两个裸片组成，有 2080 亿个晶体管和 180 GB HBM3e 显存。
- Blackwell：NVIDIA 2024 至 2025 年的架构，用于 RTX 50 系列、RTX PRO 显卡和 B200。
- GDDR7：RTX 50 系列使用的显存，速度快，但比数据中心 GPU 的 HBM 小得多、慢得多。
- Hopper：NVIDIA 2022 年的数据中心架构，用于 H100，配备大量 Tensor Core。
- 无风扇（fanless）：显卡上只有散热片，没有风扇；靠服务器自己的风扇把气流吹过散热片。
- 散热（cooling）：带走 GPU 产生的热量，靠显卡自带的风扇、服务器的气流或液冷。
- V100 / P100：较早的 NVIDIA 数据中心 GPU，分别基于 Volta（2017）和 Pascal（2016）。
- SXM（Server PCI Express Module）：NVIDIA 数据中心 GPU 的模块形态，平装在服务器主板上，而不是插在 PCIe 插槽里。
- PCIe（Peripheral Component Interconnect Express）：把扩展卡连接到电脑其他部分的标准插槽和总线；L40S 用的是 PCIe 4.0 x16。
- 被动散热（passive）：只靠散热片、卡上没有风扇的散热方式；L40S 就是这样散热的。
- L40S：本站使用的数据中心 GPU：Ada Lovelace，CC 8.9，142 个 SM，48 GB GDDR6，带宽 864 GB/s。
- Ada Lovelace：NVIDIA 2022 年的架构，用于 RTX 40 系列和 L40S。
- H100：一块 Hopper 数据中心 GPU；SXM 版本有 132 个 SM、16,896 个 CUDA 核心和 3.35 TB/s 的 HBM3。
- 核函数（kernel）：在 GPU 上运行的函数，由 CPU 启动，分给大量线程执行。
