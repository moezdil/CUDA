# 06 > 显存带宽、核心与时钟频率

让 GPU（Graphics Processing Unit，图形处理器）变快的，并不是某一个数字。这一课讲显存带宽、核心数量、时钟频率、能耗和专用硬件，并用当前 GPU 的真实数字把每一项算一遍。

## 显存带宽

GPU 要有数据才能干活，而数据来自显存。显存带宽指的是每秒能在显存和 GPU 之间搬运多少数据，单位通常是 GB/s（gigabytes per second，吉字节每秒）或 TB/s（terabytes per second，太字节每秒）。

## 一个小例子

假设一块 GPU 有 4 个核心，每个核心都要先拿到数据才能开始工作。

如果显存一次只能给一个核心送数据，那么第一个核心开始干活时，另外三个只能干等。接着第二个核心拿到数据，然后是第三个、第四个。这样 4 个核心里每次只有 1 个在工作，GPU 的利用率很低。

现在假设显存能同时给 4 个核心送数据。所有核心一起开始，并行运行，谁都不用等。

数据来得足够快，GPU 才能快起来；否则它只能等。这就叫 “显存瓶颈”。

<bandwidth-sim></bandwidth-sim>

## 消费级 GPU 与数据中心 GPU

现代 GPU 有两类：

- 消费级 GPU，比如 RTX 50 系列，用于游戏和日常使用。
- 数据中心 GPU，比如 H100、Blackwell B200 或新的 Rubin GPU，用于 AI（artificial intelligence，人工智能）和大规模计算。

两类 GPU 都可能有很多核心，有时架构也相近。最大的区别在于显存。

数据中心 GPU 使用 HBM（High Bandwidth Memory，高带宽显存）。HBM 是堆叠起来的显存，和 GPU 芯片紧挨着放在同一个封装里，能在极短时间内送出海量数据。

> [!NOTE]
> HBM 有好几代：H100 用 HBM3（3.35 TB/s），B200 用 HBM3e（最高 8 TB/s），2026 年下半年开始出货的 Rubin GPU 用 HBM4（最高 22 TB/s）。

消费级 GPU 使用 GDDR（Graphics Double Data Rate，图形双倍数据速率）显存：RTX 4090 用 GDDR6X，RTX 50 系列用 GDDR7。它们也很快，但比不上 HBM。

两块 GPU 的纸面参数可能差不多，但显存带宽更高的那块能让核心一直有活干，另一块则可能在等数据。这正是数据中心 GPU 在 AI 工作负载上如此强大的主要原因之一。

## 影响显存带宽的因素

影响显存带宽的主要因素有三个：

- 总线位宽就像道路的宽度。路越宽，同一时间能通过的数据越多。
- 显存速度就像道路的限速。路再宽，车开得慢也会堵。
- 显存技术是现代 GPU 差别最大的地方。HBM 像一条专为数据修建的高速公路，GDDR 则更通用。

<bandwidth-calc></bandwidth-calc>

> [!TIP]
> 带宽 = 总线位宽（位）× 每个引脚的速度（Gbps，gigabits per second，吉比特每秒）/ 8。RTX 4090 是 384 位总线、21 Gbps：384 × 21 / 8 = 1,008 GB/s。RTX 5090 是 512 位总线、28 Gbps：512 × 28 / 8 = 1,792 GB/s，多了约 78%。

GPU 的性能不只取决于核心，还取决于核心拿到数据的速度。再强的 GPU，如果一直在等显存，也会变弱。

## 核心越多不一定越快

数据到了之后，GPU 还得处理它。每个核心执行指令。核心越多性能越好，听起来理所当然，但并不总是这样。

拿两块 GPU 来说。第一块有 100 个核心，第二块有 200 个核心。两块都运行同一个包含 200 次运算的任务。

- 第一块 GPU 一次处理 100 次运算，所以需要两轮。
- 第二块 GPU 一轮就能处理完全部 200 次运算。

现在加上每一轮的时间：

- 第一块 GPU 每轮需要 1 秒，所以 2 × 1 = 2 秒完成。
- 第二块 GPU 每轮需要 4 秒，所以 1 × 4 = 4 秒完成。

第二块 GPU 核心更多，却更慢。所以我们还得知道核心有多快。

## 时钟频率

时钟频率就是每个核心执行指令的快慢，单位是 GHz（gigahertz，吉赫兹，每秒十亿个周期）。

性能同时取决于两件事：

- 核心越多，并行度越高。
- 时钟频率越高，每个核心越快。

其中任何一个太低，都会拖累整个系统。目标是平衡。

<cores-clock></cores-clock>

## 两种设计方向

GPU 沿着两种设计方向发展：一种为游戏和日常使用打造，另一种为 AI 和大规模计算打造。

- 数据中心 GPU 往往时钟频率较低，把芯片面积和功耗花在 Tensor Core 和显存带宽上。
- 消费级 GPU 往往为了图形运行在更高的时钟频率上。

RTX 4090 和 H100 SXM 就是例子。它们的 FP32（32-bit floating point，32 位浮点）核心数量几乎一样，分别是 16,384 和 16,896 个。RTX 4090 加速频率可达 2.52 GHz，H100 只有 1.98 GHz。但 H100 的显存带宽是 3.35 TB/s，是 RTX 4090 的 1,008 GB/s 的 3 倍多。

没有哪一种绝对更好，各自针对不同的工作负载做了优化。

## 能耗

性能总是和能耗绑在一起。核心更多、时钟频率更高，耗电也更多。RTX 5090 的额定功耗最高 575 W，H100 SXM 最高 700 W。所以性能和能效之间永远存在取舍。

“哪块 GPU 更好？” 是个错误的问题。更好的问题是 “对什么来说更好？”

## 专用硬件

现代 GPU 不只是一堆通用核心，它们还有专用硬件。

Tensor Core 就是一个例子。它们是专为矩阵运算打造的单元，尤其用于 AI。遇到合适的工作负载，它们能大幅提速；但前提是工作负载和硬件对得上。

## 吞吐量

单看核心数量、时钟频率和 TFLOPS（trillions of floating-point operations per second，每秒万亿次浮点运算）说明不了全部。更好的问题是：GPU 在一定时间内能完成多少工作？这就叫 “吞吐量”。

FP32 峰值 TFLOPS 等于核心数 × 时钟频率 × 2，因为一次 FMA（fused multiply-add，乘加融合）算作 2 次运算。RTX 4090：16,384 × 2.52 GHz × 2 ≈ 82.6 TFLOPS。H100 SXM：16,896 × 1.98 GHz × 2 ≈ 66.9 TFLOPS。按这个数字 RTX 4090 胜出，但训练 AI 时 H100 要快得多，靠的是它的 Tensor Core 和显存带宽。

> [!WARNING]
> 规格表上的 TFLOPS 是峰值，前提是每个核心在每个周期都做一次 FMA。实际程序只能达到其中一部分，一直在等显存的程序达到的更少。

吞吐量还取决于很多因素，比如计算类型、精度和架构。没有哪一个数字能决定一切。

## 总结

GPU 需要快速的显存、足够的核心、足够的速度、合理的能耗，有时还需要专用硬件。只有这些因素平衡时，才能发挥出真正的性能。

GPU 性能不是一个单一的数字，而是一个系统：显存、算力、能效和专用硬件协同工作。明白了这一点，规格表会更好读，CUDA（Compute Unified Device Architecture，统一计算设备架构）的概念也更容易理解。接下来的几课会更深入：[第 07 课](../Lesson-07/notes.md)讲 GPU 内部的各层存储，[第 09 课](../Lesson-09/notes.md)讲如何判断一个核函数受限于访存还是计算。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：这些课讲的处理器，由许多并行工作的核心组成。
- 显存带宽（memory bandwidth）：每秒能在显存和 GPU 之间搬运的数据量。
- GB/s（gigabytes per second，吉字节每秒）/ TB/s（terabytes per second，太字节每秒）：每秒搬运十亿或一万亿字节；RTX 4090 是 1,008 GB/s，H100 是 3.35 TB/s。
- 核心（core）：执行指令的单元；它就像一个工人，要先拿到数据才能开工。
- 并行（parallel）：很多核心同时工作，而不是一个接一个。
- 显存瓶颈（memory bottleneck）：显存送数据的速度跟不上，GPU 核心只能干等。
- RTX：NVIDIA 面向游戏和日常使用的消费级 GPU 系列，比如 RTX 4090 和 RTX 5090。
- H100：NVIDIA 2022 年推出的 Hopper 架构数据中心 GPU，配有 80 GB HBM3 显存。
- Blackwell：NVIDIA 在 Hopper 之后的架构；B200 数据中心 GPU 和 RTX 50 系列都基于它。
- Rubin：NVIDIA 在 Blackwell 之后的架构，使用 HBM4 显存，2026 年下半年开始出货。
- AI（artificial intelligence，人工智能）：从数据中学习的软件；训练时要搬运海量数据，所以显存带宽非常重要。
- HBM（High Bandwidth Memory，高带宽显存）：数据中心 GPU 使用的极快的堆叠显存，紧挨着 GPU 芯片；HBM3、HBM3e 和 HBM4 是它最近的几代。
- GDDR（Graphics Double Data Rate，图形双倍数据速率）/ GDDR6X / GDDR7：消费级 GPU 使用的显存家族；很快，但比不上 HBM。
- 工作负载（workload）：程序交给 GPU 的那类工作，比如训练模型或运行游戏。
- 总线位宽（bus width）：显存同一时刻能搬运多少位数据，就像道路的宽度。
- 显存速度（memory speed）：每个显存引脚传送数据的速度，单位是 Gbps（gigabits per second，吉比特每秒）。
- 指令（instruction）：核心执行的一条基本命令，比如一次加法或乘法。
- 时钟频率（clock speed）：每个核心执行指令的快慢，单位是 GHz（gigahertz，吉赫兹）。
- FP32（32-bit floating point，32 位浮点）：GPU 运算的标准数值格式；规格表里的 “CUDA 核心” 指的就是 FP32 核心。
- 能效（efficiency）：GPU 每消耗一瓦电能完成多少工作。
- 取舍（trade-off）：为了多得到一样东西而牺牲另一样，比如牺牲速度换取更低的功耗。
- Tensor Core：专为矩阵运算打造的专用硬件，尤其用于 AI。
- TFLOPS（trillions of floating-point operations per second，每秒万亿次浮点运算）：一个峰值指标，实际程序很少能达到。
- FMA（fused multiply-add，乘加融合）：一条计算 a × b + c 的指令，算作 2 次浮点运算。
- 吞吐量（throughput）：GPU 在一定时间内能完成的工作量。
- 精度（precision）：每个数用多少位来存储，比如 FP32 或 FP16；位数越少，吞吐量越高，但精确度越低。
- 架构（architecture）：GPU 的整体设计，决定了核心、显存和专用单元怎样配合工作。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的程序。
