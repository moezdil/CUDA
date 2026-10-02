# 13 > White Paper Okumak

Bu derste GPU (Graphics Processing Unit, grafik işlem birimi) white paper'larının (teknik raporlarının) ne olduğunu, onları nasıl bulacağını ve nasıl okuyacağını göreceksin. Yeni bir GPU neslinde gerçekte neyin değiştiğini öğrenmenin en iyi yolu bir white paper'dır. İkinci yarıda gerçek bir tanesini, GPU'ların yapay zekâya (AI, artificial intelligence) döndüğü anı belgeleyen V100 white paper'ını adım adım okuyacağız.

## White Paper Nedir

White paper, bir GPU mimarisi hakkındaki resmî teknik belgedir. İlk başta ağır ve fazla ayrıntılı gelebilir, ama bir GPU hakkındaki en doğru kaynaktır. İçinde pazarlama da basitleştirme de yoktur ve donanımın gerçekte nasıl tasarlandığını gösterir.

## White Paper Bulmak

Çip adını al ve yanına "white paper" ekle, örneğin `GA100 white paper` ya da `H100 white paper`. En yeni mimarilerde NVIDIA bu belgeye çoğu zaman technical brief der, örneğin "NVIDIA Blackwell Architecture Technical Brief"; o adla da ara. Bir ürünün arkasındaki çip adını nasıl bulacağını [Ders 03](../Lesson-03/notes.md) gösteriyor.

> [!TIP]
> Her sonuç işe yaramaz. Blog yazıları, özetler ve karşılaştırmalar yardımcı olabilir ama yetmez. Her zaman NVIDIA'nın resmî PDF (Portable Document Format) dosyasını ara.

## Tutarlı Bir Yapı

NVIDIA white paper'ları tutarlı bir yapı izler. Her yeni mimari bir önceki nesille karşılaştırılarak anlatılır, yani bir white paper hem neyin yeni olduğunu hem de neyin değiştiğini gösterir. Hopper white paper'ı H100'ü tablo tablo A100 ile, V100 white paper'ı da V100'ü P100 ile karşılaştırır. Aynı tabloların farklı white paper'larda karşına çıkmasının nedeni budur.

Mimariler değişiyor ama bölümlerin sırası aynı kalıyor:

1. Yeni özellikler
2. SM tasarımı
3. Performans karşılaştırmaları
4. Teknik özellikler

Bu tutarlılık bilinçli bir tercih. Bir white paper'ı iyi anladığında diğerlerini okumak çok daha kolaylaşır.

<whitepaper-map></whitepaper-map>

## Streaming Multiprocessor (SM)

Bir white paper'daki en önemli bölüm Streaming Multiprocessor (SM) bölümüdür. SM, GPU'nun temel yapı taşıdır ve CUDA (Compute Unified Device Architecture) core'larını, Tensor Core'ları, zamanlamayı (scheduling) ve bellek erişimini bir araya getirir.

Bir mimaride gerçekten neyin değiştiğini görmek için SM'ye bak. Nesiller boyunca hikâyeyi Tensor Core'lar anlatır:

- Pascal'da Tensor Core yok. Hâlâ büyük ölçüde genel amaçlı bir hesaplama mimarisi.
- Volta onları getiriyor. GPU'lar açıkça yapay zekâ iş yükleri için optimize edilmeye başlıyor.
- Ampere onları geliştirip ölçekliyor; daha fazla throughput, daha iyi verimlilik ve sparsity (seyreklik) desteği getiriyor.
- Hopper onları transformer iş yükleri için optimize ediyor ve FP8'i (8 bit kayan noktalı sayı) ekliyor.
- Blackwell onları yeni komutlarla ve NVFP4 (NVIDIA 4 bit kayan noktalı sayı) gibi formatlarla genişletiyor; bunlar çok düşük duyarlılık (precision) seviyesini doğrudan donanıma taşıyor.
- Blackwell Ultra (B300, 2025), GPU başına 288 GB HBM3e (High Bandwidth Memory 3e) ile daha fazla bellek ve daha yüksek NVFP4 throughput'u getiriyor.
- Sırada HBM4 bellekli Rubin var; 2026'da nerede olduğunu [Ders 04](../Lesson-04/notes.md) anlatıyor.

Her adım, GPU'nun ne için tasarlandığını değiştiriyor. GPU'lar artık sadece hesaplama cihazı değil, yapay zekâ sistemlerinin altyapısı.

<arch-timeline focus="Pascal"></arch-timeline>

## Örnek: Volta White Paper'ı

Volta (2017), alıştırma için en iyi white paper'dır, çünkü GPU'ların yön değiştirdiği anı gösterir. PDF şurada: https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf. Bu bölümü okurken yanında açık tut.

### Key Features ile Başla

Hemen diyagramlara ya da sayılara dalma. "Key Features" (Temel Özellikler) bölümüyle başla; kısadır ve mimarinin ne yapmaya çalıştığını gösterir. Volta'da odak çok net: mimari yapay zekâ için tasarlanmış. Bu, Pascal nesline göre sadece bir iyileştirme değil, amaçta bir değişim.

### Tensor Core'lar

Volta'daki en önemli değişiklik Tensor Core'lardır. Volta'dan önce GPU'lar matris işlemlerini genel amaçlı CUDA core'larında çalıştırıyordu. Bu işe yarıyordu ama verimli değildi. Volta, matris işlemlerine kendilerine ayrılmış donanım veriyor: V100'de her birinde 8 Tensor Core olan 80 SM var, yani 80 * 8 = 640 Tensor Core.

White paper, kendi manşet rakamını kontrol etmene yetecek sayıları veriyor. Her Tensor Core saat başına 64 FMA (fused multiply-add, birleşik çarp-topla) işlemi yapar ve bir FMA 2 kayan noktalı sayı işlemi sayılır:

- Tensor Core'lar: 640 * 64 * 2 = saat başına 81.920 işlem. 1,53 GHz boost saatinde bu 81.920 * 1,53 milyar ≈ 125 TFLOPS (tera floating point operations per second, saniyede trilyon kayan noktalı sayı işlemi) eder.
- CUDA core'lar: 80 SM * 64 FP32 (32 bit kayan noktalı sayı) core = 5.120 core. 5.120 * 2 * 1,53 milyar ≈ 15,7 TFLOPS.

Yani matris hesabında Tensor Core'lar aynı çipin CUDA core'larının 125 / 15,7 ≈ 8 katı tepe performans sunuyor. Bu noktadan sonra GPU artık sadece genel bir hesaplama cihazı değil; en baştan yapay zekâ iş yükleri düşünülerek tasarlanıyor. Tensor Core'ların ve sayı formatlarının nasıl çalıştığını [Ders 10](../Lesson-10/notes.md) anlatıyor.

### SM

Volta'da SM yeniden tasarlandı. Her biri kendi warp zamanlayıcısına, 16 FP32 core'una, 16 INT32 (32 bit tam sayı) core'una ve 2 Tensor Core'una sahip dört işlem bloğuna bölündü.

Önemli bir iyileştirme, farklı türdeki işlemlerin aynı anda çalışabilmesi. Pascal, FP32 ve INT32 komutlarını aynı anda çalıştıramıyordu; tam sayı ve kayan noktalı sayı işleri sırayla çalışmak zorundaydı. Volta'da ayrı yollar var, bu yüzden paralel çalışıyorlar. Modern iş yükleri ikisini sürekli karıştırır, çünkü her dizi indeksi ve adres bir tam sayı hesabıdır; bu değişiklik donanımın daha iyi kullanılmasını sağlıyor.

<volta-shift></volta-shift>

Diyagramda 10 komut geliyor: 6 kayan noktalı sayı, 4 tam sayı. Pascal'ın ortak yolunda 6 + 4 = 10 döngü gerekiyor. Volta'nın iki yolunda max(6, 4) = 6 döngü yetiyor. Bu basitleştirilmiş bir resim, ama kazanç gerçek.

### Komut Hızı

Yeni bir mimari sadece core eklemez, var olan işlemleri de hızlandırır. White paper'a göre birbirine bağımlı bir FMA, Pascal'da 6 döngü sürerken Volta'da 4 döngü sürer. Ampere ve Hopper bu tür ayrıntıları daha da iyileştiriyor. İlerleme sadece ölçekle değil, verimlilikle de ilgili.

### Bellek

Volta, HBM2 (High Bandwidth Memory 2) bellek kullanır: V100'de 16 ya da 32 GB, 900 GB/s hızla; önceki nesillerden daha yüksek bir bellek bant genişliği. Modern GPU iş yükleri çoğu zaman sadece verinin ne kadar hızlı işlendiğiyle değil, ne kadar hızlı taşındığıyla da sınırlıdır. Bellek bant genişliğini [Ders 06](../Lesson-06/notes.md) ayrıntılı anlatıyor.

### NVLink

Volta, GPU'ları birbirine yüksek hızda bağlayan NVLink'in ikinci neslini getiriyor. V100'de toplam 300 GB/s taşıyan altı NVLink bağlantısı var; bu da çoklu GPU sistemlerini çok daha verimli hâle getiriyor. Büyük Hopper ve Blackwell sistemleri bu fikre daha da fazla dayanıyor; birçok GPU'nun birlikte nasıl çalıştığını [Ders 12](../Lesson-12/notes.md) gösteriyor.

### Transistör Sayısı

Transistör sayısı, bir GPU'nun içinde ne kadar donanım olduğunu gösterir. V100'de 21,1 milyar transistör var.

> [!NOTE]
> H100 yaklaşık 80 milyar transistöre ulaşıyor. B200, tek bir GPU gibi çalışan iki kalıpta 208 milyar transistör barındırıyor. Bu, yedi yılda V100'ün neredeyse 10 katı; ve büyüme sadece boyutla değil, yeni birimler, yeni bellek sistemleri ve yeni yürütme modelleriyle ilgili.

### Volta'nın Rolü

2026'dan geriye bakınca Volta, kendi döneminin güçlü bir GPU'sundan fazlasıdır: GPU'ların yapay zekâ odaklı hâle geldiği noktadır. Ampere, Hopper ve Blackwell hep bu fikrin üzerine kurulup onu daha ileri taşıyor. V100 white paper'ını okumak, GPU'ların bugün neden böyle göründüğünü anlamana yardım eder.

> [!WARNING]
> CC (compute capability) değeri 7.0 olan Volta bir tarih dersi, hedef değil. CUDA 13 yalnızca Turing (CC 7.5) ve sonrasını destekliyor, yani bir V100 için daha eski bir CUDA 12 toolkit'i gerekir. Compute capability'yi [Ders 05](../Lesson-05/notes.md) anlatıyor.

## CUDA İçin Neden Önemli

Kendi GPU'nun white paper'ı, bir kernel'in her SM'den ne bekleyebileceğini söyler. Bu makinedeki L40S için bu Ada Lovelace white paper'ı. Onun SM'si de Volta'daki gibi dört işlem bloğuna bölünmüş, ama her blokta yalnızca FP32 yapan 16 core ve FP32 ya da INT32 yapabilen 16 core var. SM başına bu 4 * 32 = 128 FP32 core, bütün L40S için 142 * 128 = 18.176 eder.

İşin püf noktası "ya da" kelimesinde. Ortak yarının tam sayı indeks hesabı yaptığı bir döngüde, o SM'de kayan noktalı sayı işini yalnızca FP32'ye ayrılmış 64 core yapar. Teknik özellik sayfası ise 128'inin hepsini sayar. Döngünün gerçekte hangi sayıyı göreceğini white paper'dan öğrenirsin.

> [!TIP]
> Yeni bir GPU ile karşılaştığında, ona kernel yazmadan önce white paper'ının SM bölümünü oku. L40S, RTX 4090 ve RTX 6000 Ada için doğru belge NVIDIA Ada GPU Architecture white paper'ıdır.

## Nasıl Okunur

White paper okumak sayıları ezberlemek değil, değişimi anlamaktır. Amacı öğrenmek için Key Features'ı oku, SM'ye bakıp yeni donanım birimlerini bul, tablolarda onları bir önceki nesille karşılaştır ve Volta örneğindeki gibi manşet rakamları kendin kontrol et.

## Sözlük

- white paper: bir GPU mimarisinin gerçekte nasıl kurulduğunu pazarlama ve basitleştirme olmadan gösteren resmî teknik belge.
- GPU (Graphics Processing Unit): çok sayıda basit işi paralel çalıştırmak için tasarlanmış işlemci.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Volta, Ampere ya da Hopper; her birinin kendi white paper'ı vardır.
- nesil (generation): GPU sürümlerindeki bir adım; white paper her yeni mimariyi bir önceki nesille karşılaştırır.
- çip adı (chip name): GPU'nun içindeki silikonun adı; aradığın ad budur, örneğin GA100.
- H100: NVIDIA'nın 2022'de çıkardığı, Hopper tabanlı veri merkezi GPU'su.
- technical brief: NVIDIA'nın, Blackwell gibi en yeni GPU'larının mimari belgesi için kullandığı ad.
- Key Features: mimarinin ne yapmaya çalıştığını gösteren kısa bir white paper bölümü.
- Streaming Multiprocessor (SM): GPU'nun temel yapı taşı; CUDA core'ları, Tensor Core'ları, zamanlamayı ve bellek erişimini bir araya getirir.
- CUDA core: her SM'nin içindeki genel amaçlı aritmetik birimler; Tensor Core'lardan önce matris hesapları bunlarda çalışıyordu.
- Tensor Core: matris işlemleri için ayrılmış donanım; ilk kez Volta'da geldi.
- zamanlama (scheduling): SM'nin birimlerinde sırada hangi thread grubunun çalışacağına karar vermek; her SM'de bunu her döngüde yapan birkaç zamanlayıcı vardır.
- warp zamanlayıcısı (warp scheduler): sıradaki 32 thread'lik grubu seçen birim; her Volta SM'sinde, işlem bloğu başına bir tane olmak üzere dört tane var.
- işlem bloğu (processing block): Volta'dan beri SM'nin bölündüğü dört parçadan biri; her birinin kendi warp zamanlayıcısı ve core'ları var.
- Pascal: NVIDIA'nın 2016 mimarisi (P100); büyük ölçüde genel amaçlı, Tensor Core'u yok; Volta'dan önceki nesil.
- Volta: NVIDIA'nın 2017 mimarisi (V100, CC 7.0); Tensor Core'ları olan ilk mimari.
- V100: bu derste white paper'ı incelenen Volta GPU'su: 80 SM, 640 Tensor Core, 21,1 milyar transistör.
- Ampere / Hopper / Blackwell: Volta'dan sonra gelen NVIDIA mimarileri (2020, 2022, 2024); hepsi onun Tensor Core'ları üzerine kurulur.
- Blackwell Ultra: B300 ve GB300; GPU başına 288 GB HBM3e bellekli, geliştirilmiş Blackwell.
- Rubin: Blackwell'den sonraki mimari; HBM4 bellekli, 2026'da veri merkezlerine geliyor.
- Ada Lovelace: L40S'nin ve RTX 40 serisinin 2022 mimarisi; NVIDIA Ada GPU Architecture white paper'ında anlatılıyor.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitilmesi büyük ölçüde dev matris hesabıdır.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir sinir ağı eğitmek.
- transformer: modern dil modellerinin arkasındaki sinir ağı tasarımı; büyük ölçüde dev matris çarpımlarından oluşur.
- matris işlemleri (matrix operations): bütün bir sayı tablosu üzerinde yapılan hesaplar, özellikle matris çarpımı; yapay zekâdaki işin çoğu budur.
- throughput: GPU'nun belirli bir sürede ne kadar iş bitirebildiği.
- sparsity (seyreklik): sıfırları sabit bir "4'te 2" düzeniyle atlayan bir Ampere özelliği; böyle verilerde Tensor Core throughput'unu iki katına çıkarır.
- duyarlılık (precision): her sayının kaç bit kullandığı; bit azaldıkça hesap hızlanır ve bellek azalır ama hassasiyet düşer.
- FP32 (32 bit kayan noktalı sayı): CUDA core'larında çalışan standart tek duyarlıklı sayı formatı.
- FP8 (8 bit kayan noktalı sayı): Hopper'ın büyük ölçekli yapay zekâ sistemleri için eklediği sayı formatı.
- NVFP4 (NVIDIA 4 bit kayan noktalı sayı): çok düşük duyarlılığı doğrudan donanıma taşıyan bir Blackwell formatı.
- INT32 (32 bit tam sayı): indeksler ve adresler için kullanılan tam sayı formatı.
- tam sayı (integer): 7 ya da -3 gibi ondalıksız bir sayı; GPU kodu indeksler ve adresler için sürekli tam sayı hesabı yapar.
- kayan noktalı sayı (floating point): 3,14 gibi ondalıklı bir sayı; grafik ve yapay zekâ hesaplarının çoğu bununla yapılır.
- FMA (fused multiply-add): a * b + c hesaplayan tek bir komut; 2 kayan noktalı sayı işlemi sayılır.
- TFLOPS (tera floating point operations per second): saniyede trilyon kayan noktalı sayı işlemi; tepe hesaplama gücünün birimi.
- döngü (cycle): GPU saatinin bir tıkı; 1,53 GHz'de saniyede 1,53 milyar döngü olur.
- HBM2 (High Bandwidth Memory 2): Volta'nın kullandığı bellek; V100'de 900 GB/s, önceki nesillerden daha yüksek.
- HBM3e (High Bandwidth Memory 3e): bugünün veri merkezi GPU'larında çipin yanına üst üste yığılmış çok hızlı bellek.
- bellek bant genişliği (memory bandwidth): verinin hesaplama birimlerine ne kadar hızlı taşındığı; daha yüksek bant genişliği daha az bekleme demektir.
- NVLink: GPU'ları birbirine bağlayan yüksek hızlı bağlantı; Volta'da ikinci nesli var.
- çoklu GPU (multi-GPU): aynı makinede tek bir iş üzerinde çalışan ve sürekli veri alışverişi yapan birkaç GPU.
- transistör sayısı (transistor count): bir GPU'nun içinde ne kadar donanım olduğu; V100'de 21,1 milyar, B200'de 208 milyar transistör var.
