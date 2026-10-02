# 03 > GPU Özelliklerini Okumak

Bir özellik sayfası onlarca sayı listeler ve bunların çoğu ilk gün işine yaramaz. Bu derste herhangi bir GPU'nun özelliklerini nerede bulacağını, önce hangi üç soruyu cevaplaman gerektiğini ve sayfadaki en büyük sayının, yani çekirdek sayısının, neden çoğu zaman yanılttığını göreceksin. Sonunda bu sitedeki her örneği çalıştıran L40S'i birlikte okuyacağız.

## Özellikleri Bulmak

En hızlı yol, GPU adını "TechPowerUp" ile birlikte aramaktır, örneğin "A100 TechPowerUp" ya da "RTX 5090 TechPowerUp". TechPowerUp, her üreticiden ayrıntılı özellikler toplayan büyük bir GPU veritabanı tutar. İki site birbirini tutmadığında NVIDIA'nın kendi ürün sayfası ve veri sayfası resmi kaynaktır.

Sayfada bir sürü sayı göreceksin. Şimdilik hepsini anlamaya çalışma. Çip adı, mimari ve ürün kategorisiyle başla.

> [!TIP]
> CUDA'nın önemsediği sayı olan ve [Ders 05](../Lesson-05/notes.md)'in konusu olan CC için NVIDIA'nın developer.nvidia.com/cuda-gpus listesine bak. NVIDIA GPU'lu bir makinede `nvidia-smi --query-gpu=name,compute_cap --format=csv`, içindeki her GPU'nun adını ve CC'sini yazdırır. Bu sitenin makinesinde satır `NVIDIA L40S, 8.9` olarak çıkar.

## Mimari ve Kategori

[Ders 02](../Lesson-02/notes.md) bu iki kelimeyi açıkladı. Kısaca hatırlayalım.

- Mimari → GPU'nun nasıl yapıldığı (Ampere, Ada Lovelace, Hopper, Blackwell).
- Kategori → nerede kullanıldığı, bu dersler buna nesil de der (GeForce, Data Center GPU).

RTX 3090 ile A100, 2020'den klasik bir ikilidir. İkisi de Ampere kullanır, yani teknik tasarımları aynıdır. RTX 3090 masaüstü, dizüstü bilgisayar ve iş istasyonu için bir GeForce kartıdır ve oyun, içerik üretimi ve genel GPU işlerinde kullanılır. A100 ise sunucular, veri merkezleri ve süper bilgisayarlar için bir Data Center GPU'dur.

Aynı mimari aynı amaç demek değildir, özellikler de bunu gösterir.

> [!NOTE]
> Eski kaynaklar veri merkezi kategorisine çoğu zaman "Tesla" der. NVIDIA bu adı A100 ile bıraktı ve veri merkezi ürünlerini artık H100, B200 ya da B300 gibi çip adlarıyla adlandırıyor.

## RTX 3090 ile A100'ü Karşılaştırmak

Önce çip adını oku. RTX 3090 → GA102, A100 → GA100. "GA", Ampere demektir. Bir mimarinin nasıl birkaç çipe bölündüğünü [Ders 02](../Lesson-02/notes.md) gösteriyor.

Sonra çekirdek sayısına bak.

- RTX 3090 → 10.496 çekirdek
- A100 → 6.912 çekirdek

Bu sayı basitçe SM sayısı çarpı SM başına çekirdek sayısıdır. Hesaplayalım.

- RTX 3090 → 82 SM * 128 çekirdek = 10.496
- A100 → 108 SM * 64 çekirdek = 6.912

Yani RTX 3090'ın SM'i daha az, ama her SM'i iki kat çekirdek sayıyor. Bu onu daha güçlü GPU yapmaz. Bu "çekirdekler" yalnızca tek duyarlıklı çekirdeklerdir ve NVIDIA bunlara CUDA çekirdeği der. Standart kayan noktalı sayı hesabını yaparlar ve GPU'daki çekirdeklerin hepsi değildirler.

Modern GPU'larda tam sayı hesabı için çekirdekler, çift duyarlıklı hesap için çekirdekler ve yapay zekânın arkasındaki matris hesabı için Tensor Core'lar da vardır. A100'de 432 Tensor Core var, RTX 3090'da 328. Çift duyarlıkta A100 9,7 TFLOPS yaparken RTX 3090 yaklaşık 0,56 TFLOPS yapar, yani 9,7 / 0,56 = yaklaşık 17 kat daha hızlı.

Bellek de farklı. A100'de 1.555 GB/s hızında 40 GB HBM2, RTX 3090'da 936 GB/s hızında 24 GB GDDR6X var. Bellek bant genişliğinin neden çoğu zaman hızı belirlediğini [Ders 06](../Lesson-06/notes.md) anlatıyor.

<gpu-compare></gpu-compare>

## Bugün de Aynı Desen

Bugünkü ikili RTX 5090 ve B200. İkisi de Blackwell kullanır. RTX 5090 oyun, içerik üreticiler ve yerel yapay zekâ için bir GeForce kartıdır. B200 ise sunucularda yapay zekâ eğitimi ve çıkarımı için bir veri merkezi GPU'sudur.

| | RTX 5090 | B200 |
|---|---|---|
| Kategori | GeForce (tüketici) | Veri merkezi |
| Çip | GB202 | tek pakette iki GB100 kalıbı |
| CUDA çekirdeği | 21.760 | 18.944 |
| Bellek | 32 GB GDDR7 | 180 GB HBM3e |
| Bellek bant genişliği | 1.792 GB/s | 8 TB/s |
| Transistör | yaklaşık 92 milyar | 208 milyar |

Tüketici kartında daha çok CUDA çekirdeği var. Veri merkezi GPU'sunun belleği 180 / 32 = yaklaşık 5,6 kat, bant genişliği 8.000 / 1.792 = yaklaşık 4,5 kat. Büyük yapay zekâ modellerinde bellek ve bant genişliği, çekirdek sayısından daha belirleyicidir.

## Sadece Çekirdek Sayılarını Karşılaştırma

6.912 ya da 21.760 gibi bir çekirdek sayısı ikna edici görünür, ama genelde tek bir birim türünü, yani FP32 CUDA çekirdeklerini sayar. Tensor Core'ları, çift duyarlıklı birimleri ve diğer özel birimleri dışarıda bırakır.

Modern GPU'lar, özellikle Hopper ve Blackwell, güçlerinin büyük bir kısmını bu diğer birimlere ayırır. B200'de RTX 5090'dan daha az CUDA çekirdeği var, ama büyük yapay zekâ modellerini çok daha hızlı eğitir, çünkü Tensor Core'ları ve bellek sistemi tam olarak bu iş için yapılmıştır. Yani bir GPU'yu asla yalnızca çekirdek sayısına bakarak değerlendirme.

## Görünüşünden Ayırt Etmek

Çoğu zaman kategoriyi karta bakarak anlayabilirsin.

P100, V100, A100, H100 ya da B200 gibi veri merkezi GPU'larının genelde kendi fanı yoktur. Kompakt ve fansızdırlar, güçlü dış soğutmaya sahip veri merkezlerinde çalışırlar. Sunucu havayı bir soğutucunun içinden iter ya da sıvı bir soğutma plakasından geçer.

> [!NOTE]
> Birçok veri merkezi GPU'su takılabilir bir kart bile değildir. A100, H100 ve B200 çoğunlukla sunucu kartına düz monte edilen SXM modülleri olarak gelir ve yeni rack'lerde çoğu zaman sıvıyla soğutulur.

GeForce kartlarında büyük fanlar ve soğutucular bulunur. Kendi ısısını kendi yönetmek zorunda olan masaüstü bilgisayarlarda ve kişisel iş istasyonlarında çalışırlar, bu yüzden kart kendini soğutur.

Buradan basit bir kısayol çıkar.

- Büyük, görünür fanlar → büyük ihtimalle tüketici GPU'su.
- Kompakt bir modül ya da fansız bir kart → muhtemelen veri merkezi GPU'su.

> [!WARNING]
> Bu bir kural değil, pratik bir ipucudur. Bazı veri merkezi GPU'ları normal PCIe kartı olarak gelir. L40S bunlardan biri. Fansız, pasif soğutmalı, iki yuvalık bir PCIe kartıdır ve onu sunucu soğutur. Her zaman ürün adıyla doğrula.

<spec-reader></spec-reader>

## L40S'i Okumak

Hepsini bu sitedeki her örneğin arkasındaki GPU üzerinde birleştir. "L40S TechPowerUp" diye ara ya da NVIDIA'nın veri sayfasını aç ve üç soruyu cevapla.

- Mimari → Ada Lovelace, çip AD102, CC 8.9.
- Kategori → Data Center GPU, pasif soğutmalı bir PCIe kartı.
- Ne için yapılmış → sunucularda yapay zekâ çıkarımı ve grafik.

Şimdi sayılar. L40S'te her birinde 128 FP32 çekirdeği olan 142 SM var, yani 142 * 128 = 18.176 CUDA çekirdeği. Ayrıca 568 Tensor Core'u (SM başına 4, 142 * 4 = 568) ve 864 GB/s hızında 48 GB GDDR6 belleği var. H100 SXM'in CUDA çekirdeği daha az (16.896), ama 3,35 TB/s hızında HBM3 kullanır. Bu yaklaşık 3,9 kat bant genişliği demek ve eğitim için daha hızlı seçim olmasının nedeni bu.

## Doğru Soruları Sor

Her sayıyı anlaman gerekmez. Bunun yerine şu soruları sor.

- Bu GPU hangi mimariyi kullanıyor?
- Hangi kategoriye ait?
- Hangi tür problemi çözmek için tasarlanmış?

Bu cevaplarla özelliklerin geri kalanı anlam kazanır. CUDA çalışmasında CC hangi özellikleri kullanabileceğini söyler ([Ders 05](../Lesson-05/notes.md)). SM sayısı ve bellek bant genişliği ise bir kernel'in GPU'yu meşgul tutmak için ne kadar iş gerektirdiğini söyler ([Ders 06](../Lesson-06/notes.md)).

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): binlerce küçük hesabı aynı anda yapan çip. Önce grafik için yapıldı, bugün yapay zekâ ve bilim için de kullanılır.
- özellik (specification): bir GPU'nun yayımlanan teknik sayılarından biri, örneğin çekirdek sayısı, bellek boyutu ya da saat hızı.
- TechPowerUp: büyük bir GPU veritabanı olan site. Sayfasını bulmak için GPU adını "TechPowerUp" ile ara.
- veri sayfası (datasheet): üreticinin bir ürün için yayımladığı resmi özellik belgesi, iki site birbirini tutmadığında güvenilecek kaynak.
- CC (compute capability, hesaplama yeteneği): NVIDIA'nın bir GPU'nun özellik setine verdiği sürüm numarası, örneğin A100 için 8.0, L40S için 8.9 ([Ders 05](../Lesson-05/notes.md)).
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, hem GeForce hem veri merkezi GPU'larında çalışan programlar yazmak için platformu.
- nvidia-smi: bir makinedeki GPU'ları ve durumlarını listeleyen NVIDIA komut satırı aracı.
- mimari (architecture): GPU'nun nasıl yapıldığı, örneğin Ampere ya da Blackwell.
- kategori (category): GPU'nun nerede kullanıldığı, örneğin tüketici kullanımı ya da veri merkezi. Bu dersler buna nesil de der.
- nesil (generation): bu derslerde bir GPU'nun ait olduğu ürün ailesi, örneğin GeForce ya da Data Center GPU.
- Ampere: RTX 3090 ile A100'ün paylaştığı 2020 mimarisi.
- RTX 3090: 2020'den, Ampere tabanlı, 82 SM, 10.496 çekirdek ve 24 GB GDDR6X belleğe sahip bir GeForce GPU'su.
- A100: 2020'den, Ampere tabanlı, 108 SM, 6.912 tek duyarlıklı çekirdek ve 432 Tensor Core'a sahip bir NVIDIA veri merkezi GPU'su.
- GeForce: NVIDIA'nın oyun ve kişisel iş istasyonları için, kendi fanı olan tüketici GPU'ları.
- iş istasyonu (workstation): 3D tasarım ya da mühendislik gibi profesyonel işler için güçlü bir masaüstü bilgisayar.
- Data Center GPU (veri merkezi GPU'su): A100 ya da B200 gibi, sunucular için yapılmış, genelde kendi fanı olmayan NVIDIA GPU'su.
- Tesla: NVIDIA veri merkezi GPU'larının eski adı, V100 ve T4'e kadar kullanıldı.
- veri merkezi (data center): güçlü fanlar, klima ya da sıvı soğutmayla soğutulan, sunucularla dolu bir bina.
- süper bilgisayar (supercomputer): dev problemler üzerinde tek bir makine gibi birlikte çalışan binlerce bağlı sunucu.
- çip adı (chip name): bir GPU'nun içindeki çipin adı, örneğin A100 için GA100, L40S için AD102.
- çekirdek sayısı (core count): özelliklerdeki çekirdek sayısı. Genelde tek bir türü sayar ve hikâyenin tamamını anlatmaz.
- SM (Streaming Multiprocessor, akış çok işlemcisi): GPU'nun içindeki bir çekirdek bloğu, çekirdek sayısı = SM sayısı * SM başına çekirdek.
- tek duyarlıklı çekirdekler (single-precision cores): 32 bit kayan noktalı sayı hesabı yapan çekirdekler. Çekirdek sayısı genelde yalnızca bunları sayar.
- CUDA çekirdeği (CUDA cores): NVIDIA'nın bir GPU'daki FP32 birimlerine verdiği ad. L40S'te 18.176 tane var.
- kayan noktalı sayı (floating-point): 3,14 gibi ondalık noktalı sayılar. Tek duyarlık bir sayıyı 32 bitte, çift duyarlık 64 bitte saklar.
- FP32 (32 bit kayan noktalı sayı): tek duyarlıklı hesap, çekirdek sayısının genelde saydığı birim türü.
- çift duyarlıklı (double-precision): bilimsel işlerde kullanılan 64 bit kayan noktalı sayı hesabı. A100 bunda RTX 3090'dan yaklaşık 17 kat hızlıdır.
- Tensor Core: yapay zekânın arkasındaki matris hesabını yapan birimler. Çekirdek sayısı bunları dışarıda bırakır.
- yapay zekâ (AI, artificial intelligence): verilerden öğrenen yazılım. Onu eğitmek çoğunlukla devasa matris hesabıdır.
- TFLOPS (teraFLOPS): saniyede bir trilyon kayan nokta işlemi.
- HBM2 / HBM3 / HBM3e (High Bandwidth Memory, yüksek bant genişlikli bellek): veri merkezi GPU'larında çipin yanına istiflenen, GeForce kartlarındaki GDDR bellekten daha hızlı bellek. HBM2, HBM3 ve HBM3e sürümleridir.
- bant genişliği (memory bandwidth): belleğin saniyede ne kadar veri verebildiği, örneğin L40S'te 864 GB/s, B200'de 8 TB/s.
- RTX 5090: 2025'ten, Blackwell tabanlı, 21.760 CUDA çekirdeği ve 32 GB GDDR7 belleğe sahip bir GeForce GPU'su.
- B200: iki kalıplı, 208 milyar transistörlü ve 180 GB HBM3e belleğe sahip bir Blackwell veri merkezi GPU'su.
- Blackwell: RTX 50 serisinde, RTX PRO kartlarında ve B200'de kullanılan, 2024 ve 2025'ten NVIDIA mimarisi.
- GDDR7 (Graphics Double Data Rate 7): RTX 50 serisinin grafik belleği. Hızlıdır ama veri merkezi GPU'larının HBM'inden çok daha küçük ve yavaştır.
- Hopper: NVIDIA'nın H100'de kullanılan, Tensor Core'larla dolu 2022 veri merkezi mimarisi.
- fansız (fanless): yalnızca soğutucusu olan, fanı olmayan kart. Havayı sunucunun kendi fanları içinden iter.
- soğutma (cooling): GPU'nun ürettiği ısıyı kartın kendi fanlarıyla, sunucunun hava akışıyla ya da sıvıyla uzaklaştırmak.
- V100 / P100: Volta (2017) ve Pascal (2016) tabanlı eski NVIDIA veri merkezi GPU'ları.
- SXM (Server PCI Express Module): NVIDIA'nın veri merkezi GPU'ları için, PCIe yuvası yerine doğrudan sunucu kartına düz monte edilen modül biçimi.
- PCIe (Peripheral Component Interconnect Express): bir kartı bilgisayarın geri kalanına bağlayan standart yuva ve bağlantı. L40S PCIe 4.0 x16 kullanır.
- pasif (passive): kartta fan olmadan yalnızca soğutucuyla soğutma. L40S bu şekilde soğutulur.
- L40S: bu sitede kullanılan veri merkezi GPU'su, Ada Lovelace mimarili, CC 8.9, 142 SM'li ve 864 GB/s hızında 48 GB GDDR6 bellekli.
- Ada Lovelace: NVIDIA'nın RTX 40 serisi ve L40S için 2022 mimarisi.
- H100: bir Hopper veri merkezi GPU'su. SXM sürümünde 132 SM, 16.896 CUDA çekirdeği ve 3,35 TB/s hızında HBM3 var.
- kernel: GPU'da çalışan, CPU'nun başlattığı ve çok sayıda thread'e dağıtılan fonksiyon.
