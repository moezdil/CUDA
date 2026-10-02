# 02 > 架构、代与芯片

人们说 “GPU”时，指的可能是好几样不同的东西，比如一套设计、一条产品线、一块硅片，或者你装进机器里的那张显卡。这一课把它们拆成架构、代、芯片和 GPU 四个概念。分得清它们，你就能读懂任何一个 NVIDIA 产品名、规格表或数据中心部件，知道里面到底装的是什么。这些对 CUDA 都很重要，它是 NVIDIA 提供的 GPU 编程方式，用于通用计算，而不只是图形处理。

## 架构

架构是 GPU 芯片的内部设计。它规定的不只是核心，还包括下面四点。

- 核心如何组织  
- 数据如何流动  
- 显存如何访问  
- 并行任务如何执行  

可以把它想成发动机的设计。两块 GPU 从外面看可能差不多，但因为架构不同，表现可能天差地别。架构直接影响性能、能效和支持的功能。光线追踪和 AI 加速这类功能，都是在架构层面引入的。

NVIDIA 过去大约每两年推出一代新架构。在数据中心 GPU 上，现在大约每年一代，依次是 Blackwell（2024）、Blackwell Ultra（2025）和 Rubin（2026 年下半年起出货），Rubin Ultra（2027）和 Feynman（2028）则已经公布。[第 04 课](../Lesson-04/notes.md)会把它们逐一讲一遍。

## 代

在这些课里，“代”说的不是 GPU 怎么造，而是 GPU 用在哪里。

> [!NOTE]
> 在这些课之外，人们也常用“代”来指架构，比如“Blackwell 这一代”。这里的“代”指的是 GPU 所属的产品线，比如 GeForce 或数据中心。

NVIDIA 的 GPU 服务于两个主要领域。第一个是普通用户，包括游戏、内容创作和通用图形。第二个是云系统、数据中心、AI 训练和科学计算。第二个领域叫作 HPC。

## 产品名称

NVIDIA 会根据 GPU 的用途使用不同的名字。

- Jetson 面向机器人和嵌入式系统。它的芯片叫 Tegra，最新的模块 Jetson AGX Thor（2025）用的是 Blackwell。  
- GeForce 面向消费级 GPU。当前的显卡是 GeForce RTX 50 系列，比如 RTX 5090。  
- RTX PRO 面向专业工作站，比如 RTX PRO 6000 Blackwell（2025）。  
- Data Center GPU 面向服务器，比如 A100（Ampere）、L40S（Ada Lovelace）、H100 和 H200（Hopper）、B200 和 B300（Blackwell），以及现在的 Rubin。  

你可能还会看到一些旧名字。Quadro 是以前专业 GPU 的品牌，后来改成“NVIDIA RTX”（RTX A6000、RTX 6000 Ada），2025 年又改成“RTX PRO”。数据中心 GPU 直到 V100 和 T4 都用“Tesla”这个名字销售，从 A100 起不再使用。

## 架构和代互不相干

架构描述 GPU 是怎么造的，代描述它用在哪里。所以同一种架构可以出现在用途完全不同的产品里。面向个人使用的 RTX 3090 和面向大规模计算的 A100 都是 Ampere。今天的 RTX 5090、RTX PRO 6000、B200 和 Jetson AGX Thor 也都是 Blackwell。

<arch-matrix></arch-matrix>

架构相同，甚至连 CC 都可能不同。CC 是 CUDA 用来标记芯片功能的版本号。A100 是 CC 8.0，RTX 3090 是 CC 8.6，两者都是 Ampere。B200 是 CC 10.0，RTX 5090 是 CC 12.0，两者都是 Blackwell，因为它们用的是不同的芯片。[第 05 课](../Lesson-05/notes.md)会深入讲 CC。

> [!TIP]
> 决定一块 GPU 支持哪些 CUDA 功能的是 CC，而不是产品名。编译 CUDA 代码时，你针对的也是 CC。

并不是每种架构都同时覆盖这两个领域。Ada Lovelace 主要用于消费级 GPU，也有 L40S 这样的少数服务器显卡。Hopper 只用于数据中心和 AI 训练，所以你在普通 PC 里见不到 Hopper GPU。区别在于用途，而不只是性能。

## GPU 芯片

GPU 芯片就是实实在在的那块硅片，所有计算都在这里完成。它本身没有散热装置和接口，也没有外接的显存模块。芯片内部有执行并行任务的计算单元、管理数据流动的控制器，以及协调一切的内部逻辑。

芯片才是真正的 “引擎”。比如 A100 里的 GA100 芯片，就是一块集成了大约 540 亿个晶体管的硅片。

## 芯片名称

NVIDIA 的芯片名称把芯片和它的架构联系在一起。第一个字母 G 代表 GPU，后面一两个字母代表架构，数字表示这块芯片在家族里的位置。

- GF100 → Fermi  
- GA100 → Ampere  
- AD102 → Ada Lovelace（RTX 4090、L40S）  
- GB202 → Blackwell（RTX 5090）  

GB202 可以这样拆开读。G 代表 GPU，B 代表 Blackwell，202 是 Blackwell 家族中的一块芯片。所以不用看任何规格，前缀就告诉了你架构。

> [!WARNING]
> 并不是带这些字母的名字都指一块 GPU 芯片。GB200 是一个 “超级芯片”，一块板上有一颗 Grace CPU 和两块 Blackwell GPU。GH200 是同样的思路，只是换成了 Hopper。名字看起来不对劲时，先查清它到底是什么。

## GPU

GPU 是你实际使用的完整产品，是围绕芯片搭建起来的一整套系统。它包括下面五个部分。

- 芯片本身  
- VRAM，也就是 GPU 自己的内存，紧挨着芯片  
- 供电部件  
- 输出接口，比如 HDMI 或 DisplayPort  
- 散热系统  

GeForce 显卡装在普通的 PC 机箱里，没有专门的散热设施，所以必须自己处理发热，而且热量不小，RTX 5090 的额定功耗高达 575 W。这就是它们带着大块散热片和好几个风扇的原因。

A100 或 L40S 这样的数据中心 GPU 自己没有风扇。它们装在服务器机架里，气流来自服务器的风扇，散热在机架层面解决。最新的机架，比如装有 72 块 Blackwell GPU 的 GB200 NVL72，采用液冷。这让 GPU 更简单、更紧凑，也更适合大规模部署。

<chip-vs-gpu></chip-vs-gpu>

TechPowerUp 这样的规格网站能把这种区分看得很清楚。A100 的页面写着它的芯片 GA100，并链接到这块裸芯片自己的页面。一句话，芯片 = 引擎，GPU = 整台机器。

## 一种架构，多颗芯片

架构并不是某一颗芯片，而是共用同一套基础设计的一个芯片家族。Ada Lovelace（2022）包括 AD102、AD103 和 AD104，还没看任何规格，前缀 “AD” 就把它们联系在一起。Blackwell 消费级芯片以 “GB” 开头，RTX 5090 用 GB202，RTX 5080 用 GB203，RTX 5070 用 GB205。

芯片的大小用 SM 的数量来衡量，SM 是容纳核心的基本构件（见[第 00 课](../Lesson-00/notes.md)）。完整的 AD102 有 144 个 SM，完整的 AD103 有 80 个，完整的 AD104 有 60 个。所以 AD102 用在顶级 GPU 上，AD104 用在 RTX 4070 Ti 这样更小、更省电的显卡上。

## 同一颗芯片，不同的 GPU

同一颗芯片可以出现在截然不同的 GPU 里。厂商可以关闭一部分核心、修改功耗上限、调整时钟频率。AD102 就是一个真实的例子。

- RTX 4090 是带风扇和 HDMI 的 GeForce 显卡，144 个 SM 中开启 128 个，功耗上限 450 W，24 GB GDDR6X 显存。  
- L40S 是无风扇的数据中心显卡，144 个 SM 中开启 142 个，功耗上限 350 W，48 GB GDDR6 显存。  

在 RTX 4090 上，144 − 128 = 16 个 SM 被关闭，占整颗芯片的 16 / 144 ≈ 11%。L40S 上只关了 144 − 142 = 2 个。每个 Ada SM 有 128 个 FP32 核心，所以 L40S 有 142 × 128 = 18,176 个，RTX 4090 有 128 × 128 = 16,384 个。这样一来，带有少量坏 SM 的芯片关掉这些 SM 后照样可以出售。

NVIDIA 也并不自己制造每一块最终的 GPU。ASUS、MSI、Gigabyte 这样的板卡合作伙伴拿到同一颗芯片，改动散热设计、供电配置和加速频率的行为。基础芯片相同，结果略有不同。

<arch-family></arch-family>

## 完整的图景

一块 GPU 由一种架构、一颗具体的芯片和厂商自己的实现组成，并且属于某一代，说明它用在哪里。

> [!TIP]
> 想看懂任何一块 GPU，就问它是什么架构、什么芯片、什么显卡、哪一代这四个问题。对这个网站用的 L40S 来说，答案是 Ada Lovelace、开启 142 个 SM 的 AD102、一张无风扇的 NVIDIA 显卡，以及数据中心。对 RTX 5090 来说，是 Blackwell、GB202、NVIDIA 或某个板卡合作伙伴做的显卡，以及 GeForce。

## 为什么这很重要

架构描述的是芯片，而不是整个产品。性能从芯片开始，但实际表现取决于开启了多少 SM、功耗上限、频率和散热。架构相同、甚至芯片相同的两块 GPU，也可能差得很远。CUDA 通过 CC 和 SM 数量来认识芯片，所以[第 03 课](../Lesson-03/notes.md)读规格表时先看芯片。

## 术语表

- GPU（Graphics Processing Unit，图形处理器）：围绕芯片搭建的完整产品，带有显存、供电部件、输出接口和散热。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的通用程序。
- AI（artificial intelligence，人工智能）：从数据中学习的软件。训练它主要是海量的矩阵运算，正适合 GPU。
- 架构（architecture）：一个芯片家族共用的内部设计，就像发动机的设计。
- 能效（efficiency）：GPU 每消耗一瓦电能完成多少工作。
- 光线追踪（ray tracing）：通过追踪光线的反弹来绘制 3D 场景的方法，RTX GPU 有专门的硬件来做这件事。
- Blackwell：NVIDIA 2024 年的架构，既有数据中心芯片（B200），也有消费级芯片（RTX 5090 里的 GB202）。
- Rubin：Blackwell 之后的 NVIDIA 数据中心架构，2026 年下半年起出货。
- 代（generation）：在这些课里，指 GPU 的使用场景，比如游戏或数据中心。
- 数据中心（data center）：放满服务器的机房，往往装有成千上万块 GPU，用来运行云服务和 AI 训练。
- HPC（High Performance Computing，高性能计算）：指云系统、数据中心、AI 训练和科学计算。
- Jetson：NVIDIA 面向机器人和嵌入式系统的产品线，基于 Tegra 芯片。
- Tegra：NVIDIA 给 Jetson 模块里集成了 CPU 和 GPU 的芯片起的名字。
- 嵌入式系统（embedded system）：内置在设备里的小型计算机，比如机器人、汽车或无人机里的那种。
- GeForce：NVIDIA 面向消费级 GPU 的品牌，这些显卡自带散热片和风扇。
- RTX PRO：NVIDIA 从 2025 年起用于专业工作站 GPU 的品牌，是 Quadro 的继任者。
- Quadro：NVIDIA 专业 GPU 的旧品牌，先被 NVIDIA RTX 取代，后来又改为 RTX PRO。
- Data Center GPU（数据中心 GPU）：NVIDIA 用于服务器的 GPU，比如 A100、L40S、H100 或 B200。
- Tesla：NVIDIA 数据中心 GPU 以前的名字，最后用在 V100 和 T4 上。
- Ampere：NVIDIA 2020 年推出的架构，芯片名称以 GA 开头，RTX 3090 和 A100 都用它。
- A100：NVIDIA 2020 年推出的数据中心 GPU，使用 GA100 芯片，自己没有风扇。
- CC（Compute Capability，计算能力）：GPU 向 CUDA 报告的版本号，比如 L40S 是 8.9，RTX 5090 是 12.0。
- Ada Lovelace：NVIDIA 2022 年推出的架构，主要用于消费级 GPU，芯片有 AD102 等。
- Hopper：NVIDIA 只用于数据中心和 AI 训练的架构，H100 就基于它。
- GPU 芯片（GPU chip）：实实在在的那块硅片，所有计算都在这里完成，没有散热装置也没有接口。
- 硅片（silicon）：制造芯片的材料。GA100 就是一块集成了大约 540 亿个晶体管的硅片。
- 前缀（prefix）：芯片名称开头的几个字母，比如 GA、AD 或 GB，它表明芯片属于哪种架构。
- Fermi：NVIDIA 2010 年推出的架构，芯片名称形如 GF100。
- GA100：A100 里的芯片，G 代表 GPU，A 代表 Ampere。
- AD102：Ada Lovelace 中最大的芯片，有 144 个 SM，用在 RTX 4090 和 L40S 上。
- AD104：Ada Lovelace 中较小的芯片，有 60 个 SM，用在 RTX 4070 Ti 这样的显卡上。
- GB202：消费级 Blackwell 芯片中最大的一块，用在 RTX 5090 上。
- 超级芯片（superchip）：把 CPU 和 GPU 组合在一块板上的产品，比如 GB200（一颗 Grace CPU 加两块 Blackwell GPU）。
- CPU（Central Processing Unit，中央处理器）：计算机的主处理器。Grace 是 NVIDIA 自己的数据中心 CPU。
- VRAM（显存）：GPU 自己的内存，紧挨着芯片，L40S 有 48 GB 显存。
- 供电部件（power delivery）：显卡上的一组部件，把电源送来的电转换成芯片所需的稳定电压。
- 输出接口（output interfaces）：GPU 上的端口，比如 HDMI 或 DisplayPort。
- HDMI（High-Definition Multimedia Interface，高清多媒体接口）：把画面和声音送到显示器或电视的常用接口。
- 散热（cooling）：把芯片产生的热量带走，可以靠显卡上的风扇、服务器里的气流，或者液体。
- 散热片（heatsink）：一块带金属鳍片的部件，消费级 GPU 用它给自己散热。
- PC（Personal Computer，个人电脑）机箱（PC case）：容纳台式电脑各个部件的箱子。消费级 GPU 必须在机箱里自己散热。
- 服务器机架（server rack）：数据中心里放置很多台服务器的高架子，散热在机架层面解决。
- 气流（airflow）：服务器自身风扇吹过机身的空气，用来给里面无风扇的 GPU 散热。
- 液冷（liquid cooling）：让液体流过贴在芯片上的冷板来散热，用在 GB200 NVL72 这类高密度机架里。
- TechPowerUp：列出 GPU 规格的网站，每款 GPU 的页面都链接到它所用的芯片。
- SM（Streaming Multiprocessor，流式多处理器）：NVIDIA GPU 的基本构件，里面装着核心。芯片的大小用 SM 数量来衡量。
- FP32（32-bit floating point，32 位浮点）：用 32 位存储的带小数点的数。规格表把 FP32 核心算作 CUDA 核心。
- 核心（core）：芯片上的一个计算单元。厂商可以关闭其中一部分，比如让带有少量坏核心的芯片也能出售。
- 功耗上限（power limit）：GPU 最多能消耗的功率，单位是瓦。上限越低，发热越少，速度也越慢。
- 时钟频率（clock speed）：芯片每秒运行的周期数，是厂商可以调整的一项设置。
- 板卡合作伙伴（board partner）：ASUS、MSI、Gigabyte 这类公司，用 NVIDIA 的芯片做出自己的 GPU。
- 加速频率（boost）：在功耗和温度允许的范围内，GPU 自动提升到的更高时钟频率。
- 厂商自己的实现（vendor-specific implementation）：某个厂商围绕一颗芯片做出的自家版本 GPU。
