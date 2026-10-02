# 04 > GPU 与 GPU 芯片

人们说 “GPU”（Graphics Processing Unit，图形处理器）时，其实指的是两样东西：一块负责计算的硅片，以及你装进机器里的整张显卡或整个模块。这一课把两者分开讲清楚。分得清它们，规格表、芯片名称和数据中心硬件都会好读得多。

## GPU 芯片

GPU 芯片就是实实在在的那块硅片，所有计算都在这里完成。它本身没有散热装置和接口，也没有外接的显存模块。

芯片内部包括：

- 执行并行任务的计算单元  
- 管理数据流动的控制器  
- 协调一切的内部逻辑  

芯片才是真正的 “引擎”。比如 A100 里的 GA100 芯片，就是一块集成了大约 540 亿个晶体管的硅片。

## 芯片名称

Nvidia 的芯片名称把芯片和它的架构联系在一起。第一个字母是 G（代表 GPU），后面一两个字母代表架构，数字表示这块芯片在家族里的位置：

- GF100 → Fermi  
- GA100 → Ampere  
- AD102 → Ada Lovelace（RTX 4090、L40S）  
- GB202 → Blackwell（RTX 5090）  

GB202 可以这样拆开读：G（GPU）+ B（Blackwell）+ 202（Blackwell 家族中的一块芯片）。所以不用看任何规格，前缀就告诉了你架构。

> [!WARNING]
> 并不是带这些字母的名字都指一块 GPU 芯片。GB200 是一个 “超级芯片”：一块板上有一颗 Grace CPU（Central Processing Unit，中央处理器）和两块 Blackwell GPU。GH200 是同样的思路，只是换成了 Hopper。名字看起来不对劲时，先查清它到底是什么。

## GPU

GPU 是你实际使用的完整产品，是围绕芯片搭建起来的一整套系统。它包括：

- 芯片本身  
- VRAM，也就是显存：GPU 自己的内存，紧挨着芯片  
- 供电部件  
- 输出接口（比如 HDMI（High-Definition Multimedia Interface，高清多媒体接口）或 DisplayPort）  
- 散热系统  

所以，GPU 就是芯片加上让它能用起来的一切。

## 消费级 GPU

GeForce GPU，比如 RTX 40 和 RTX 50 系列，是为普通环境打造的：

- 台式机  
- 笔记本电脑  
- 个人工作站  

这些机器没有专门的散热设施，GPU 必须自己处理发热，而且热量不小：RTX 5090 的额定功耗高达 575 W。所以大多数消费级 GPU 都有：

- 大块散热片  
- 多个风扇  
- 显眼的散热设计  

它们是自成一体的，必须能在普通的 PC（Personal Computer，个人电脑）机箱里正常工作。

## 数据中心 GPU

A100 基于 Ampere 架构，芯片是 GA100。但完整的 A100 看起来和 GeForce 显卡截然不同：它没有风扇，也没有显示输出接口。

数据中心 GPU 安装在服务器机架里，散热由 GPU 之外的系统负责：

- 气流来自服务器的风扇  
- 散热在机架层面解决  
- 最新的机架，比如装有 72 块 Blackwell GPU 的 GB200 NVL72，采用液冷  

这让 GPU 更简单、更紧凑，也更适合大规模部署。

<chip-vs-gpu></chip-vs-gpu>

## 在网上查芯片

> [!TIP]
> TechPowerUp 这样的规格网站能把这一点讲得很清楚。搜索 “A100 TechPowerUp”，你会看到芯片名称 → GA100。点进这个链接，就能看到芯片本身，没有散热，也没有其他附件。

## 一句话总结区别

GPU 芯片是大脑，GPU 是完整的系统。

芯片 = 引擎  
GPU = 整台机器  

同一块芯片甚至可以出现在截然不同的 GPU 里。AD102 芯片既用在 RTX 4090 上，这是一张带风扇和 HDMI 接口的 GeForce 显卡；也用在 L40S 上，这是一张没有风扇的数据中心显卡。

## 为什么这很重要

- 架构描述的是芯片，而不是整个产品  
- 性能从芯片层面开始  
- 实际表现取决于完整的 GPU 系统  

如果把两者混为一谈，你可能会误解：

- 规格  
- 性能对比  
- 甚至 CUDA（Compute Unified Device Architecture，统一计算设备架构）的行为  

分清它们，后面更深入的 CUDA 内容会更容易理解。

## 术语表

- GPU 芯片（GPU chip）：实实在在的那块硅片，所有计算都在这里完成，没有散热装置也没有接口。
- 硅片（silicon）：制造芯片的材料；GA100 就是一块集成了大约 540 亿个晶体管的硅片。
- 架构（architecture）：芯片的设计，也就是它的各种单元、显存通路和控制器是怎样组织的。
- 前缀（chip name prefix）：芯片名称开头的几个字母，代表它的架构，比如 GA 代表 Ampere，GB 代表 Blackwell。
- Fermi：Nvidia 2010 年推出的架构，芯片名称形如 GF100。
- Ampere：Nvidia 2020 年推出的架构，芯片名称以 GA 开头，比如 A100 里的 GA100。
- GA100：A100 里的芯片；G 代表 GPU，A 代表 Ampere。
- AD102：Ada Lovelace 架构中最大的芯片，用在 RTX 4090 和 L40S 上。
- GB202：消费级 Blackwell 芯片中最大的一块，用在 RTX 5090 上。
- 超级芯片（superchip）：把 CPU 和 GPU 组合在一块板上的产品，比如 GB200（一颗 Grace CPU 加两块 Blackwell GPU）。
- GPU（Graphics Processing Unit，图形处理器）：围绕芯片搭建的完整产品，带有显存、供电部件、输出接口和散热。
- VRAM（显存）：GPU 自己的内存，紧挨着芯片；RTX 5090 有 32 GB 显存。
- 供电部件（power delivery）：显卡上的一组部件，把电源送来的电转换成芯片所需的稳定电压。
- 输出接口（output interfaces）：GPU 上的端口，比如 HDMI 或 DisplayPort。
- 散热（cooling）：把芯片产生的热量带走，可以靠显卡上的风扇、服务器里的气流，或者液体。
- GeForce：Nvidia 的消费级 GPU，比如 RTX 5090，自带散热片和风扇。
- 散热片（heatsink）：消费级 GPU 用来给自己散热的部件。
- PC（Personal Computer，个人电脑）机箱（PC case）：容纳台式电脑各个部件的箱子；消费级 GPU 必须在机箱里自己散热。
- A100：Nvidia 的数据中心 GPU，使用 GA100 芯片，自己没有风扇。
- 服务器机架（server rack）：安装数据中心 GPU 的地方，散热在机架层面解决，而不是靠 GPU 自己。
- 气流（airflow）：服务器自身风扇吹过机身的空气，用来给里面无风扇的 GPU 散热。
- 液冷（liquid cooling）：让液体流过贴在芯片上的冷板来散热，用在 GB200 NVL72 这类高密度机架里。
- 规格（spec）：GPU 公开的技术参数，比如芯片名称、核心数量或显存大小。
- TechPowerUp：列出 GPU 规格的网站，每款 GPU 的页面都链接到它所用的芯片。
- CUDA（Compute Unified Device Architecture，统一计算设备架构）：NVIDIA 的平台，用来编写在 NVIDIA GPU 上运行的程序。
