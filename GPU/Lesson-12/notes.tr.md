# 12 > Birlikte Çalışan GPU'lar

Büyük yapay zekâ modelleri aynı anda yüzlerce, hatta binlerce GPU üzerinde eğitilir. Bu derste tek bir GPU'nun neden yetmediğini, GPU'ların bir sunucunun, bir rack'in ve koca bir cluster'ın içinde nasıl birbirine bağlandığını ve işin aralarında nasıl bölündüğünü göreceksin. Sonunda ters yöne bakıp büyük bir GPU'yu birkaç küçük GPU'ya böleceğiz.

## Tek GPU Neden Yetmez

Birden fazla GPU kullanmanın iki nedeni var. Ya model tek bir GPU'nun belleğine sığmaz ya da tek GPU ile eğitim çok uzun sürer.

70 milyar parametreli bir model düşün. BF16 ile saklandığında her parametre 2 bayt tutar, bkz. [Ders 10](../Lesson-10/notes.md).

- Yalnızca ağırlıklar 70 × 10⁹ × 2 bayt = 140 GB tutar. Bu, H100'ün 80 GB'ından zaten fazla ve L40S'in 48 GB'ının neredeyse 3 katı.
- Eğitim çok daha fazlasını ister. Yaygın bir yöntem parametre başına yaklaşık 16 bayt tutar. BF16 ağırlıklar için 2, gradyanlar için 2, ağırlıkların FP32 ana kopyası için 4 ve Adam optimizer'ının her parametre için tuttuğu iki değer için 8. Toplam 70 × 10⁹ × 16 = 1.120 GB.
- 1.120 GB / 80 GB = 14. Yani tek bir aktivasyon saklanmadan önce, sadece bu durumu tutmak için en az 14 H100 gerekir.

> [!NOTE]
> Aktivasyonlar batch boyutu ve dizi uzunluğuyla büyür ve uzun girdilerde ağırlıklardan bile fazla bellek isteyebilirler. Gerçek eğitimlerin bu tahmindeki 14'ten çok daha fazla GPU kullanmasının nedeni budur.

İkinci neden zaman. Büyük bir modeli eğitmek sabit miktarda hesap ister. Tek bir GPU buna yıllarca uğraşacaksa, 1.000 GPU bunu prensipte günler içinde bitirebilir, ama ancak sonuçlarını yeterince hızlı paylaşabilirlerse. Dersin geri kalanı bu paylaşımla ilgili.

## Scale Up ve Scale Out

GPU'lar iki seviyede bağlanır.

- Scale up'ta birbirine yakın duran GPU'lar, yani aynı sunucu ya da aynı rack içindekiler, çok hızlı bir bağlantıyla, NVLink ile birleştirilir. Bir program için neredeyse tek büyük bir GPU gibi davranırlar.
- Scale out'ta çok sayıda sunucu ya da rack bir ağla, InfiniBand ya da Ethernet ile birleştirilir. Bu ağ GPU başına çok daha yavaştır ama binlerce sunucuya kadar büyüyebilir.

Diyagram tek bir GPU'dan rack'lerden oluşan bir cluster'a kadar dört boyutu, her seviyedeki bağlantı türünü ve her GPU'nun aldığı bant genişliğini gösteriyor.

<multi-gpu></multi-gpu>

## PCIe ve NVLink

Her GPU, CPU ile PCIe üzerinden konuşur, bkz. [Ders 11](../Lesson-11/notes.md). Bu derslerde kullandığımız L40S'te PCIe 4.0 x16 var. İki yön birlikte 64 GB/s, her yönde 32 GB/s. Aynı sunucudaki iki L40S yalnızca PCIe üzerinden konuşabilir. L40S'te NVLink yok.

NVLink, NVIDIA'nın GPU'dan GPU'ya doğrudan bağlantısıdır. Her nesil GPU başına bant genişliğini kabaca ikiye katladı, iki yön birlikte sayılarak. En yeni nesiller birkaç TB/s'ye ulaşıyor.

| NVLink | Mimari | Örnek GPU | GPU başına bant genişliği |
|---|---|---|---|
| 1 | Pascal | P100 | 160 GB/s |
| 2 | Volta | V100 | 300 GB/s |
| 3 | Ampere | A100 | 600 GB/s |
| 4 | Hopper | H100 | 900 GB/s |
| 5 | Blackwell | B200 | 1,8 TB/s |
| 6 | Rubin | Rubin | 3,6 TB/s |

H100, 900 GB/s'ye her biri 50 GB/s olan 18 NVLink bağlantısıyla ulaşır. B200'de de 18 bağlantı var, her biri 100 GB/s. NVLink 6 kullanan Rubin sistemleri 2026'nın ikinci yarısından beri teslim ediliyor.

> [!TIP]
> Bağlantı hızları genelde iki yönü birlikte sayar. H100'ün 900 GB/s'si aynı anda 450 GB/s gönderme artı 450 GB/s almadır. Bir aktarım süresi hesaplarken tek yön sayısına böl.

## NVSwitch ve 8 GPU'lu Sunucu

8 GPU varken her GPU'yu diğer her birine doğrudan bağlamak, 18 bağlantısını küçük gruplara bölerdi. Bunun yerine bütün GPU'lar NVSwitch çiplerine bağlanır. NVSwitch, NVLink için bir switch'tir ve her GPU onun üzerinden diğer her GPU'ya bağlantılarının tam hızıyla ulaşabilir.

Bir DGX H100 sunucusunda tek bir kart üzerinde 8 H100 ve 4 NVSwitch çipi bulunur. Her GPU çifti 900 GB/s ile konuşabilir ve 8'i de bunu aynı anda yapabilir. 8 GPU'lu bir B200 sunucusu da aynı şekilde, GPU başına 1,8 TB/s ile çalışır.

## NVL72 Rack'i

GB200 NVL72 aynı fikri bir sunucudan koca bir rack'e taşır. 18 hesaplama tepsisinde 72 Blackwell GPU ve 36 Grace CPU, rack'in ortasında da 9 NVLink switch tepsisi bulunur. 72 GPU'nun hepsi tek bir NVLink alanıdır, yani her GPU diğer her GPU'ya 1,8 TB/s ile ulaşır. Toplamda 72 × 1,8 TB/s ≈ 130 TB/s eder.

Bir NVLink alanındaki her bağlantı bu kadar hızlı olduğu için 72 GPU, sürekli konuşmayı gerektiren ve bir ağ üzerinden fazlasıyla yavaş kalacak işleri paylaşabilir. Vera Rubin NVL72 alan başına 72 GPU'yu korur ve NVLink 6 ile bağlantıyı GPU başına 3,6 TB/s'ye çıkarır.

## Sunucular Arasında InfiniBand ve Ethernet

Bir NVLink alanının ötesinde sunucular ve rack'ler bir ağla birleştirilir. Yapay zekâ veri merkezleri InfiniBand ya da hızlı bir Ethernet kullanır. Genelde her GPU'nun kendi ağ kartı olur. Bir DGX H100'de GPU başına bir tane olmak üzere 400 Gb/s hızında 8 ConnectX-7 kartı var, GB300 NVL72 ise ConnectX-8 ile her GPU'ya 800 Gb/s verir.

> [!WARNING]
> Ağ hızları bit sayar ve Gb/s ile yazılır, GPU bağlantıları bayt sayar ve GB/s ile yazılır. 8'e böl, yani 400 Gb/s = 50 GB/s, 800 Gb/s = 100 GB/s, tek yönde. Yani bir H100 NVLink üzerinden 450 GB/s gönderebilir ama ağ kartı üzerinden yalnızca 50 GB/s, 9 kat daha az.

Bu fark çoklu GPU programlarındaki her şeyi belirler. En çok konuşan işi tek bir NVLink alanının içinde tut, ağı yalnızca geçmesi şart olan veri için kullan.

## NCCL ve Collective'ler

GPU'lar bir modeli birlikte eğitirken sonuçlarını tekrar tekrar birleştirmek zorundadır. Bir gruptaki bütün GPU'ların katıldığı bir paylaşım kalıbına collective denir. En önemlisi all-reduce'dur. Her GPU kendi sayı listesiyle başlar, sonunda her GPU bütün listelerin toplamını tutar.

NVIDIA GPU'larında bu işi yapan kütüphane NCCL'dir. En hızlı yolu, NVLink'i, PCIe'yi ya da ağı bulur ve all-reduce, broadcast ve all-gather gibi collective'leri çalıştırır.

all-reduce'u çalıştırmanın yaygın bir yolu ring'dir. GPU'lar bir çember oluşturur, her biri parçaları komşusuna gönderir ve çemberde iki tur sonra her GPU tam toplama sahip olur. N GPU ve S boyutunda veriyle her GPU 2 × (N - 1) / N × S gönderir. Halkada kaç GPU olursa olsun bu neredeyse 2 × S'dir.

## PCIe ve NVLink Üzerinde All-Reduce, Hesaplı Örnek

7 milyar parametreli bir modeli 8 GPU üzerinde eğittiğini düşün. Her adımdan sonra BF16 gradyanlar 8 GPU'nun hepsinde toplanmalıdır.

- Veri boyutu 7 × 10⁹ × 2 bayt = 14 GB.
- Her GPU 2 × (8 - 1) / 8 × 14 GB = 2 × 0,875 × 14 GB = 24,5 GB gönderir ve aynı anda aynı miktarı alır.

Şimdi her bağlantının tek yön bant genişliğine böl.

| Bağlantı | Tek yön | 24,5 GB için süre |
|---|---|---|
| PCIe 4.0 x16 (L40S) | 32 GB/s | 24,5 / 32 ≈ 0,77 s |
| 400 Gb/s ağ | 50 GB/s | 24,5 / 50 = 0,49 s |
| NVLink 4 (H100) | 450 GB/s | 24,5 / 450 ≈ 0,054 s |
| NVLink 5 (B200) | 900 GB/s | 24,5 / 900 ≈ 0,027 s |

Bunlar kâğıt üzerindeki en iyi durumlar. Gerçek bir 8 GPU'lu PCIe sunucusunda birkaç kart aynı PCIe switch'lerini ve CPU bağlantılarını paylaşır, bu yüzden daha da yavaştır. Bir eğitim adımı 0,5 s hesap yapıyorsa, PCIe sunucusu gradyan paylaşmaya hesaptan daha fazla zaman harcar. NVLink bu paylaşımı yaklaşık 14 kat kısaltır.

## İşi Bölmenin Üç Yolu

Veri paralelliğinde her GPU modelin tamamını tutar ve batch'in farklı bir parçası üzerinde çalışır. Her adımdan sonra bir all-reduce gradyanları toplar, böylece bütün kopyalar aynı kalır. En basit yöntemdir ama modelin tamamı her GPU'ya sığmalıdır. FSDP gibi türevler ağırlıkları ve optimizer değerlerini GPU'lara dağıtır ve yalnızca gerektiğinde toplar.

Tensör paralelliğinde her katmanın büyük matrisleri parçalara bölünür ve her GPU her katmanın kendi parçasını hesaplar. GPU'lar her katmanın içinde, adım başına defalarca kısmi sonuç paylaşmak zorundadır. Bu yüzden tensör paralelliği tek bir NVLink alanının içinde tutulur.

Pipeline paralelliğinde katmanlar aşamalara bölünür, örneğin 1-20. katmanlar ilk GPU'da, 21-40. katmanlar ikincisinde. Aktivasyonlar bir montaj hattındaki gibi aşamadan aşamaya akar. Yalnızca aşama sınırlarındaki aktivasyonlar taşındığı için daha yavaş bir bağlantı yeterlidir, ama batch küçük micro-batch'lere bölünmezse aşamalar birbirini bekler.

Büyük eğitimler üçünü birleştirir. Sunucu ya da rack içinde tensör paralelliği, bunlar arasında pipeline aşamaları, bütün cluster üzerinde de veri paralelliği kullanılır.

## MIG ile Ters Yön

Bazen tek bir GPU fazla büyüktür. Küçük bir model ya da notebook kullanan biri H100'ün yalnızca bir kısmına ihtiyaç duyabilir. MIG bir GPU'yu en fazla 7 izole örneğe böler. Her örneğin kendi SM'leri, L2 önbelleğinin kendi payı ve belleğin kendi payı olur, böylece bir kullanıcı diğerini yavaşlatamaz ya da verisini okuyamaz. Örneğin bir H100 80 GB, her biri 10 GB olan 7 örneğe dönüşebilir.

MIG, Ampere'den beri veri merkezi GPU'larında var. A100, H100, H200 ve B200 en fazla 7 örneğe, A30 en fazla 4 örneğe izin verir. RTX PRO 6000 Blackwell, MIG'i en fazla 4 örnekle bir iş istasyonu kartına getirir.

> [!NOTE]
> L40S'te ne MIG ne NVLink var. Birkaç program yine de onu sırayla kullanarak paylaşabilir, buna zaman dilimleme denir, ama donanım izolasyonu olmadan.

## Bunun CUDA İçin Önemi

CUDA'da bir kernel her zaman tek bir GPU üzerinde çalışır. Birden fazla GPU kullanan bir program her birini `cudaSetDevice` ile seçer ve her birinde kernel başlatır. Veri GPU'lar arasında `cudaMemcpyPeer` ile taşınır, NVLink varsa onun üzerinden, yoksa PCIe üzerinden. all-reduce ve diğer collective'ler için programlar kendileri yazmak yerine NCCL'i çağırır.

İletişim hesapla örtüşmelidir. Bir GPU bir katmanın gradyanlarını hesaplarken NCCL bir önceki katmanınkileri göndermeye başlayabilir. Bir MIG örneğinde `cudaGetDeviceProperties` yalnızca o örneğin SM'lerini bildirir, bu yüzden bir kernel grid boyutunu [Ders 05](../Lesson-05/notes.md)'teki gibi bildirilen SM sayısından almalı, asla 132 gibi sabit yazılmış bir sayıdan değil.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): bu bölümün konusu olan işlemci. Bu ders çok sayıda GPU'yu birbirine bağlar.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım. GPU'ların binlercesinin birbirine bağlanmasının nedeni büyük yapay zekâ modelleridir.
- parametre (parameter): modelin öğrendiği bir sayı. 70 milyar parametreli bir modelde 70 × 10⁹ tane vardır.
- BF16 (brain floating point, 16 bit): eğitimde ağırlıklar ve gradyanlar için kullanılan 2 baytlık sayı biçimi.
- FP32 (32-bit floating point, 32 bit kayan nokta): 4 baytlık sayı biçimi. Eğitim ağırlıkların ana kopyasını çoğu zaman bununla tutar.
- gradyan (gradient): bir eğitim adımından sonra her parametrenin ne kadar değişmesi gerektiği. Veri paralelliği bunları GPU'lar arasında toplar.
- aktivasyon (activation): bir katmanın ara sonucu. Ağırlıklardan fazla bellek isteyebilir.
- scale up / scale out (dikey büyütme / yatay büyütme): yakın GPU'ları NVLink ile ya da sunucuları bir ağla bağlamak.
- PCIe (Peripheral Component Interconnect Express): CPU ile GPU arasındaki bağlantı. PCIe 4.0 x16 her yönde 32 GB/s verir.
- CPU (Central Processing Unit, merkezi işlem birimi): sunucunun ana işlemcisi. GPU'lar ona PCIe üzerinden ulaşır.
- NVLink: NVIDIA'nın GPU'dan GPU'ya doğrudan bağlantısı. H100'de GPU başına 900 GB/s, B200'de 1,8 TB/s verir.
- GB/s (gigabytes per second, saniyede gigabayt) / Gb/s (gigabits per second, saniyede gigabit): saniyede bayt ya da bit. 8 Gb/s = 1 GB/s.
- TB/s (terabytes per second, saniyede terabayt): 1.000 GB/s. NVLink 5 bir B200'e 1,8 TB/s verir.
- NVSwitch: her GPU'nun diğer her GPU'ya tam hızla ulaşmasını sağlayan NVLink switch çipi.
- NVL72: tek bir NVLink alanında 72 GPU bulunan rack, örneğin GB200 NVL72.
- NVLink alanı (NVLink domain): hepsi birbirine NVLink üzerinden ulaşan bir GPU grubu.
- InfiniBand / Ethernet: sunucuları ve rack'leri birleştiren ağlar. GPU başına 400 ya da 800 Gb/s sağlarlar.
- collective: bir gruptaki bütün GPU'ların katıldığı paylaşım, örneğin all-reduce.
- all-reduce: sonunda her GPU'nun bütün GPU'ların verisinin toplamını tuttuğu collective.
- NCCL (NVIDIA Collective Communications Library): NVIDIA GPU'larında collective'leri çalıştıran kütüphane.
- broadcast: bir GPU'nun aynı veriyi diğer bütün GPU'lara gönderdiği collective.
- all-gather: sonunda her GPU'nun her GPU'nun parçasını tuttuğu collective.
- ring (halka): GPU'ların parçaları bir çember boyunca aktardığı all-reduce yöntemi. Her GPU veri boyutunun yaklaşık 2 katını gönderir.
- veri paralelliği (data parallelism): her GPU modelin tamamını tutar ve batch'in farklı bir parçası üzerinde çalışır.
- FSDP (Fully Sharded Data Parallel): ağırlıkları ve optimizer değerlerini GPU'lara dağıtan veri paralelliği.
- tensör paralelliği (tensor parallelism): her katmanın matrisleri GPU'lara bölünür. GPU'lar her katmanda konuşur.
- pipeline paralelliği (pipeline parallelism): katmanlar farklı GPU'lardaki aşamalara bölünür, bir montaj hattı gibi.
- MIG (Multi-Instance GPU, çoklu örnekli GPU): bir GPU'yu en fazla 7 izole örneğe bölmek.
- SM (Streaming Multiprocessor): GPU'nun yapı taşı. Her MIG örneği kendi SM'lerini alır.
- zaman dilimleme (time slicing): programların bir GPU'yu izolasyon olmadan sırayla paylaşması.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın GPU üzerinde çalışan programlar yazmak için sunduğu platform.
