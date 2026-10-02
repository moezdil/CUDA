# 02 > Mimari ve Nesil

Bu ders, GPU mimarisi ile GPU nesli arasındaki farkı anlatıyor. İki terim birbirine benziyor ama farklı şeyler anlatıyor. İkisini de bilirsen herhangi bir NVIDIA ürün adını okuyup içinde nasıl bir çip olduğunu anlayabilirsin.

## GPU ve CUDA

GPU (Graphics Processing Unit, grafik işlem birimi), aynı anda çok sayıda işlem çalıştırmak için tasarlanmış bir işlemcidir. İlk başta grafik için yapıldı. Bugün yapay zekâ (AI, artificial intelligence), simülasyonlar, veri işleme ve büyük ölçekli hesaplama için de kullanılıyor.

CUDA (Compute Unified Device Architecture), NVIDIA'nın GPU'ları programlama yoludur. GPU'yu sadece grafik için değil, genel hesaplama için de kullanmanı sağlar.

## Mimari

Mimari, GPU çipinin iç tasarımıdır. Sadece çekirdekleri değil, şunları da belirler:

- çekirdeklerin nasıl düzenlendiğini  
- verinin nasıl aktığını  
- belleğe nasıl erişildiğini  
- paralel işin nasıl çalıştırıldığını  

Bunu bir motorun tasarımı gibi düşün. İki GPU dışarıdan birbirine benzeyebilir ama mimarileri yüzünden çok farklı davranabilir.

Mimari doğrudan şunları etkiler:

- performans  
- verimlilik  
- desteklenen özellikler  

Her yeni mimari genelde küçük bir yükseltme değil, gerçek bir değişimdir. Bazı mimariler ham performansı artırdı. Bazıları verimliliğe odaklandı. Yenileri yapay zekâya ve büyük ölçekli iş yüklerine odaklanıyor. Ray tracing ve yapay zekâ hızlandırma gibi özellikler mimari düzeyinde gelir.

NVIDIA eskiden aşağı yukarı iki yılda bir yeni mimari çıkarırdı. Veri merkezi GPU'larında artık yaklaşık yılda bir: Blackwell (2024), Blackwell Ultra (2025), Rubin (2026'dan beri teslim ediliyor); Rubin Ultra (2027) ve Feynman (2028) ise duyuruldu. GPU'ların bu kadar hızlı gelişmesinin ana nedenlerinden biri bu.

## Nesil

Bu derslerde nesil, GPU'nun nasıl yapıldığıyla ilgili değildir. GPU'nun nerede kullanıldığıyla ilgilidir.

> [!NOTE]
> Bu derslerin dışında insanlar "nesil" kelimesini çoğu zaman mimari için de kullanır, örneğin "Blackwell nesli". Burada ise bir GPU'nun ait olduğu ürün ailesi kastediliyor, örneğin GeForce ya da Data Center.

NVIDIA GPU'ları iki ana dünyaya hizmet eder. Birincisi günlük kullanıcılar:

- oyun  
- içerik üretimi  
- genel grafik  

İkincisi:

- bulut sistemleri  
- veri merkezleri  
- yapay zekâ eğitimi  
- bilimsel hesaplama  

Bu ikinci dünyaya HPC (High Performance Computing, yüksek performanslı hesaplama) denir.

## Ürün Adları

NVIDIA, GPU'nun nerede kullanıldığına göre farklı adlar kullanır:

- Jetson robotlar ve gömülü sistemler içindir. Çiplerine Tegra denir; en yeni modül Jetson AGX Thor (2025) Blackwell kullanır.  
- GeForce tüketici GPU'ları içindir. Güncel kartlar GeForce RTX 50 serisi, örneğin RTX 5090.  
- RTX PRO profesyonel iş istasyonları içindir, örneğin RTX PRO 6000 Blackwell (2025).  
- Data Center GPU'lar sunucular içindir: A100 (Ampere), H100 ve H200 (Hopper), B200 ve B300 (Blackwell) ve artık Rubin.  

> [!NOTE]
> Eski adları hâlâ görebilirsin. Quadro, profesyonel GPU'ların eski markasıydı; önce "NVIDIA RTX" (RTX A6000, RTX 6000 Ada), 2025'te de "RTX PRO" oldu. Veri merkezi GPU'ları V100 ve T4'e kadar "Tesla" adıyla satıldı; A100 bu adı bıraktı.

Bu da genel hesaplamadan yapay zekâ ve bulut altyapısına doğru bir kaymayı gösterir.

## Mimari ve Nesil Birbirinden Bağımsızdır

Mimari, GPU'nun nasıl yapıldığını anlatır. Nesil, nerede kullanıldığını anlatır. Bu yüzden aynı mimari çok farklı ürünlerde karşına çıkabilir.

Örneğin RTX 3090 ve A100'ün ikisi de Ampere tabanlıdır. RTX 3090 kişisel kullanım içindir. A100 büyük ölçekli hesaplama içindir. Mimarileri aynı ama amaçları farklı. Bugün de durum aynı: RTX 5090, RTX PRO 6000, B200 ve Jetson AGX Thor'un hepsi Blackwell.

<arch-matrix></arch-matrix>

Aynı mimari, aynı CC (compute capability, hesaplama yeteneği) anlamına bile gelmez; CC, CUDA'nın bir çipin özelliklerine verdiği sürüm numarasıdır. A100 CC 8.0, RTX 3090 CC 8.6; ikisi de Ampere. B200 CC 10.0, RTX 5090 CC 12.0; ikisi de Blackwell.

> [!TIP]
> Bir GPU'nun hangi CUDA özelliklerini desteklediğine ürün adı değil, CC karar verir. CUDA kodu derlerken de hedef olarak bir CC seçersin.

## GPU Kategorileri

GPU'lar farklı ortamlar için yapılır:

- küçük, taşınabilir sistemler  
- kişisel bilgisayarlar  
- profesyonel iş yükleri  
- büyük veri merkezleri  

Her ortamın ihtiyaçları, sınırları ve öncelikleri farklıdır. NVIDIA aynı mimariyi hepsine uyacak şekilde uyarlar.

## Basit Bir Kural

- GPU nasıl yapılmış? → mimari  
- GPU nerede kullanılıyor? → nesil  

## Bu Neden Önemli

Bu kural GPU adlarını okumayı kolaylaştırır. Ayrıca sık yapılan bir hatayı da önler: iki GPU'yu sırf aynı mimariyi paylaşıyorlar diye benzer sanmak. CUDA ile GPU programlamaya başladığında bu farklar çok önemli hâle gelir.

## Sözlük

- GPU (Graphics Processing Unit): aynı anda çok sayıda işlem çalıştırmak için tasarlanmış bir işlemci.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'ları sadece grafik için değil genel hesaplama için de programlama yolu.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi büyük ölçüde dev matris hesaplarıdır, GPU'ların bu alanda bu kadar önemli olmasının nedeni de budur.
- mimari (architecture): GPU çipinin iç tasarımı, bir motorun tasarımı gibi.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- ray tracing: 3D sahneleri ışık ışınlarının sekişini takip ederek çizme yöntemi; gerçekçi gölgeler ve yansımalar verir. RTX GPU'larda bunun için özel donanım vardır.
- Blackwell: RTX 50 serisinde, RTX PRO 6000'de, B200'de, B300'de ve Jetson AGX Thor'da kullanılan 2024 tarihli NVIDIA mimarisi.
- Rubin: Blackwell'den sonraki NVIDIA veri merkezi mimarisi; 2026'dan beri teslim ediliyor.
- nesil (generation): bu derslerde bir GPU'nun nerede kullanıldığı, örneğin oyun ya da veri merkezleri.
- veri merkezleri (data centers): çoğu zaman binlerce GPU barındıran, bulut servislerini ve yapay zekâ eğitimini çalıştıran, sunucularla dolu binalar.
- HPC (High Performance Computing): yüksek performanslı hesaplama; bulut sistemleri, veri merkezleri, yapay zekâ eğitimi ve bilimsel hesaplama.
- Jetson: NVIDIA'nın Tegra çiplerine dayanan, robotlar ve gömülü sistemler için ürün ailesi.
- Tegra: NVIDIA'nın Jetson modüllerinde CPU ile GPU'yu birleştiren çiplerine verdiği ad.
- gömülü sistem (embedded system): bir cihazın içine yerleştirilmiş küçük bilgisayar, örneğin bir robotta, arabada ya da drone'da.
- GeForce: NVIDIA'nın oyun ve kişisel bilgisayarlar için tüketici GPU markası.
- RTX PRO: NVIDIA'nın 2025'ten beri profesyonel iş istasyonu GPU'ları için kullandığı marka; Quadro'nun halefi.
- Quadro: NVIDIA'nın profesyonel GPU'larının eski markası; önce NVIDIA RTX, sonra RTX PRO oldu.
- Data Center GPU: sunucular için tasarlanmış bir NVIDIA GPU'su, örneğin A100, H100 ya da B200.
- Tesla: NVIDIA'nın veri merkezi GPU'larının eski adı; en son V100 ve T4'te kullanıldı.
- Ampere: hem RTX 3090'da hem A100'de kullanılan bir NVIDIA mimarisi.
- A100: NVIDIA'nın 2020'de çıkardığı, Ampere tabanlı, yapay zekâ eğitimi ve HPC için tasarlanmış veri merkezi GPU'su.
- CC (compute capability): CUDA'nın bir GPU'nun özellik setine verdiği sürüm numarası, örneğin A100 için 8.0, RTX 5090 için 12.0.
