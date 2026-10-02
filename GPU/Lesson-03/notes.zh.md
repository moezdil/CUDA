# 03 > 看懂 GPU 规格

这一课教你怎样查出一块 GPU 的代和架构，以及怎样读懂它的规格（specs）。我们拿 RTX 3090 和 A100 这两块 2020 年的 Ampere GPU 当例子。同样的步骤适用于任何 GPU，包括今天的 Blackwell 显卡。

## 查找 GPU 规格

最简单的办法是上网搜索。例如：

"A100 GPU TechPowerUp"

TechPowerUp 有一个 GPU 数据库，收录了众多厂商 GPU 的详细规格。它是查 GPU 参数最方便的地方之一。其他 GPU 也可以用同样的方式搜索：

"RTX 3090 TechPowerUp"

打开页面就能看到全部规格。

> [!TIP]
> 想查 CC（compute capability，计算能力），也就是 CUDA 关心的那个数字，可以看 NVIDIA 自己的列表 developer.nvidia.com/cuda-gpus。在装有 NVIDIA GPU 的机器上，`nvidia-smi --query-gpu=name,compute_cap --format=csv` 会打印出每块 GPU 的名字和计算能力。

## 简单比较

比较两块 GPU：

- RTX 3090  
- A100  

先看芯片名称。例如 A100 → GA100，RTX 3090 → GA102。“GA” 代表 Ampere。

> [!NOTE]
> 芯片设计会在后面的课里讲。现在只要会读这个名字就行。

再看核心数量：

- A100 → 6,912 个核心  
- RTX 3090 → 10,496 个核心  

这并不代表 RTX 3090 总是更强，因为核心数量并没有涵盖所有种类的核心。

## 核心数量

像“6,912 个核心”（A100）这样的数字，通常只统计单精度核心，NVIDIA 把它们叫作 CUDA 核心。这些核心负责标准的浮点运算。这个数字并不包括 GPU 里的所有核心。

这个数字就是 SM（Streaming Multiprocessor，流式多处理器）的个数乘以每个 SM 的核心数。A100 有 108 个 SM，每个 64 个核心：108 * 64 = 6,912。RTX 3090 有 82 个 SM，每个 128 个核心：82 * 128 = 10,496。所以 RTX 3090 的 SM 更少，但每个 SM 统计的核心数是 A100 的两倍。

现代 GPU 还有其他类型的核心，例如：

- 做整数运算的核心  
- 做双精度运算的核心  
- 为 AI（artificial intelligence，人工智能）打造的特殊核心，叫 Tensor Core  

在这些方面 A100 明显胜出。它的双精度性能是 9.7 TFLOPS（每秒万亿次浮点运算），RTX 3090 约为 0.56 TFLOPS，所以 A100 快了 9.7 / 0.56 = 约 17 倍。显存也不一样：A100 是 40 GB HBM2（High Bandwidth Memory，高带宽内存），带宽 1,555 GB/s；RTX 3090 是 24 GB GDDR6X，带宽 936 GB/s。

所以不要只凭这个数字来评判一块 GPU。

## 代与架构

### RTX 3090

- 代 → GeForce  
- 架构 → Ampere  

GeForce GPU 面向普通用户，用在：

- 台式机  
- 笔记本电脑  
- 工作站  

主要用途：

- 游戏  
- 内容创作  
- 一般的 GPU 任务  

### A100

- 代 → Data Center GPU（这条产品线以前叫 Tesla）  
- 架构 → Ampere  

这类 GPU 面向：

- 服务器  
- 数据中心  
- 超级计算机  

## 要点

- RTX 3090 和 A100 用的是同一种架构（Ampere）  
- 但它们面向完全不同的用途  

架构相同 ≠ 用途相同。

提醒：
- 架构 → 技术设计
- 代 → 使用类别

<gpu-compare></gpu-compare>

## 从外观分辨

很多时候，只看显卡本身就能分辨出来。

### 数据中心 GPU（A100、V100、P100）

- 通常没有自带风扇  
- 结构紧凑，无风扇设计

它们运行在散热能力很强的数据中心里。散热由服务器负责，而不是 GPU 自己。

> [!NOTE]
> 很多数据中心 GPU 根本不是插卡。A100、H100 和 B200 大多是 SXM 模块，平装在服务器主板上，较新的机柜还常常用液冷。

### GeForce GPU（RTX 系列）

- 自带风扇  
- 为独立的系统设计  

它们用在：

- 台式电脑  
- 个人工作站  

这些系统需要自己散热，所以显卡要带风扇。

## 小结

- 数据中心 GPU → 没有风扇  
- GeForce GPU → 自带风扇  

不同的环境有不同的散热需求。了解这一点能帮你：

- 读懂 GPU 规格  
- 选对硬件  
- 避免初学者常犯的错误  

随着你深入学习 CUDA，这一点会越来越重要。

## 术语表

- 规格（specs）：GPU 公开的技术参数，比如核心数量、显存大小和时钟频率。
- TechPowerUp：一个有 GPU 数据库的网站，收录了众多厂商 GPU 的详细规格。
- 计算能力（CC，compute capability）：CUDA 给 GPU 功能集标的版本号，比如 A100 是 8.0，RTX 3090 是 8.6。
- nvidia-smi：NVIDIA 的命令行工具，列出机器里的 GPU 及其状态。
- RTX 3090：2020 年推出的 GeForce GPU，基于 Ampere，有 82 个 SM、10,496 个核心和 24 GB GDDR6X 显存。
- A100：NVIDIA 2020 年推出的数据中心 GPU，基于 Ampere，有 108 个 SM 和 6,912 个单精度核心。
- 芯片名称（chip name）：GPU 内部芯片的名字，比如 A100 的芯片叫 GA100。
- 核心数量（core count）：规格里列出的核心数，并没有涵盖所有种类的核心。
- 单精度核心（single-precision cores）：负责标准浮点运算的核心，核心数量通常只统计它们。
- SM（Streaming Multiprocessor，流式多处理器）：GPU 里的一组核心；核心数量 = SM 个数 * 每个 SM 的核心数。
- 浮点（floating-point）：带小数点的数，比如 3.14；单精度用 32 位存一个数，双精度用 64 位。
- 双精度（double-precision）：64 位浮点运算，用于科学计算；A100 在这方面比 RTX 3090 快约 17 倍。
- Tensor Core：现代 GPU 里专门为 AI 打造的特殊核心。
- TFLOPS（teraFLOPS）：每秒万亿次浮点运算。
- HBM（High Bandwidth Memory，高带宽内存）：数据中心 GPU 上的堆叠式显存，比 GeForce 显卡上的 GDDR 显存更快。
- 架构（architecture）：GPU 的技术设计。
- 代（generation）：GPU 的使用类别，比如 GeForce 或 Data Center GPU。
- Ampere：RTX 3090 和 A100 共用的架构。
- GeForce：NVIDIA 面向台式机、笔记本电脑和工作站的消费级 GPU，自带风扇。
- 工作站（workstation）：用于专业工作（比如 3D 设计或工程计算）的高性能台式电脑。
- Tesla：NVIDIA 数据中心 GPU 以前的名字，现在叫 Data Center GPU。
- Data Center GPU（数据中心 GPU）：NVIDIA 用于服务器的 GPU，比如 A100，通常没有自己的风扇。
- 数据中心（data center）：放满服务器的机房，靠强力风扇、空调或液冷散热。
- 超级计算机（supercomputer）：成千上万台互联的服务器，像一台机器一样协同处理超大规模的问题。
- V100 / P100：较早的 NVIDIA 数据中心 GPU，分别基于 Volta（2017）和 Pascal（2016）。
- SXM：NVIDIA 数据中心 GPU 的模块形态，直接装在服务器主板上，而不是插在 PCIe 插槽里。
- 无风扇（fanless）：显卡上只有散热片，没有风扇；靠服务器自己的风扇把气流吹过散热片。
- 散热（cooling）：把 GPU 产生的热量带走；GeForce 显卡靠自己的风扇，数据中心显卡则依靠服务器。
