# 01 > GPU'ların Kısa Tarihi

Bu ders, GPU'ların (Graphics Processing Unit, grafik işlem birimi) basit grafik çiplerinden bugünkü yapay zekânın arkasındaki hesaplama platformlarına nasıl dönüştüğünü anlatıyor. 1993'ten bugünkü nesle ve NVIDIA'nın sırada diye duyurduğu ürünlere kadar önemli adımları görürsün. Bu arka plan, CUDA kodu yazmadan önce işine yarar.

## İlk Yıllar

NVIDIA Nisan 1993'te kuruldu. İlk ürünü NV1, 1995'te çıktı.

> [!NOTE]
> NVIDIA'yı Jensen Huang, Chris Malachowsky ve Curtis Priem kurdu. Jensen Huang hâlâ şirketin CEO'su (chief executive officer, üst yönetici).

O ilk donanım bugünle kıyaslanınca çok basitti:

- çok küçük bellek  
- çok sınırlı veri bant genişliği  
- neredeyse hiç gerçek paralellik yok  

## Modern GPU'lar

Bugünün GPU'ları bambaşka bir ölçekte. Bunlar:

- binlerce, hatta on binlerce çekirdeğe sahip  
- büyük miktarda belleğe sahip  
- çok daha yüksek frekansta çalışıyor  

1999'un GeForce 256'sını 2025'in GeForce RTX 5090'ıyla karşılaştır. Bellek 32 MB'tan 32 GB'a çıktı, yani 32 GB / 32 MB = 1.000 kat arttı. Çip saati 120 MHz'ten 2,41 GHz'e (2.410 MHz) çıktı, yani 2.410 / 120 = yaklaşık 20 kat hızlandı. 4 piksel hattı da 21.760 CUDA çekirdeğine dönüştü.

Rolleri de değişti.

## Grafikten Fazlası

GPU'lar ilk başta görüntü oluşturmak için yapıldı. Bugün bu, yaptıkları işin küçük bir parçası. GPU'lar artık yaygın olarak şunlar için kullanılıyor:

- yapay zekâ (AI, artificial intelligence)  
- büyük ölçekli veri işleme  
- simülasyonlar  
- bilimsel hesaplama  

Yani modern bir GPU sadece bir grafik cihazı değil, bir hesaplama platformudur.

## İlk Dönüm Noktası

Önemli bir an, GPU'ların gerçek 3D hızlandırmayı desteklemeye başlamasıyla geldi. NVIDIA'nın RIVA 128'i (1997) hızlı 3D ile 2D'yi tek bir çipte birleştirdi. Bu, 3D'yi sadece uzmanlar için değil, çok daha fazla insan için kullanışlı yaptı. Yaygınlaşma hızla arttı.

## GeForce

İki yıl sonra, 1999'da NVIDIA GeForce 256'yı çıkardı ve onu ilk GPU olarak tanıttı. 3D şekilleri yerleştiren ve aydınlatan hesap olan T&L'yi (transform and lighting, dönüştürme ve aydınlatma) CPU (Central Processing Unit, merkezi işlem birimi) yerine donanımda yapıyordu. GeForce serisi böyle başladı ve GPU'lar geniş kitlelere ulaştı. Başlangıç noktası hâlâ çok düşük olduğu için çekirdek sayısındaki ya da bellekteki küçük artışlar bile büyük fark yarattı.

## İstikrarlı Büyüme

Ondan sonra ilerleme hızlandı. NVIDIA 2007'de CUDA'yı çıkardı; böylece 2006'daki GeForce 8 serisinden itibaren GPU'ları sadece grafik değil, genel programlar da çalıştırabildi. Her yeni mimari performans, verimlilik ya da özellikler açısından bir adım attı: Fermi (2010), Kepler (2012), Maxwell (2014), Pascal (2016), Volta (2017, ilk Tensor Core'lar), Turing (2018), Ampere (2020), Ada Lovelace ve Hopper (2022), Blackwell (2024). Bu kazanımlar zamanla birikti. Modern GPU'lar tek bir büyük sıçrama sayesinde değil, yıllar boyunca atılan birçok adım sayesinde güçlü.

## Bugün Neredeyiz

Ekim 2026 itibarıyla NVIDIA şu alanlarda merkezi bir rol oynuyor:

- oyun  
- yapay zekâ altyapısı  
- bulut bilişim  
- HPC (high-performance computing, yüksek performanslı hesaplama)  

Güncel ürünler PC'ler için GeForce RTX 50 serisi (Blackwell, 2025) ve veri merkezlerinde Blackwell Ultra (B300, 2025). Sıradaki mimari Rubin, Eylül 2026'da ilk Vera Rubin NVL72 kabinleriyle teslim edilmeye başladı. Güncel CUDA sürümü CUDA 13.4.

> [!NOTE]
> NVIDIA artık yaklaşık her yıl yeni bir veri merkezi mimarisi çıkarıyor. Rubin Ultra (2027) ve Feynman (2028) duyuruldu ama henüz satışta değil. Tarihlerini plan olarak gör.

Birçok durumda GPU'lar artık modern yapay zekâ sistemlerinin ana itici gücü.

<gpu-history></gpu-history>

## CUDA'dan Önce Bu Neden Önemli

GPU'ların nasıl geliştiğini bilmek şunları anlamana yardım eder:

- mimarinin neden böyle tasarlandığını  
- GPU'lar arasında performansın neden farklı olduğunu  
- modern GPU özelliklerinin neden var olduğunu  

Bu da CUDA'ya geçişi kolaylaştırır.

## Sözlük

- GPU (Graphics Processing Unit): binlerce basit çekirdeğiyle çok sayıda işi paralel çalıştırmak için tasarlanmış işlemci.
- NVIDIA: 1993'te kurulan, GeForce ve veri merkezi GPU'larını üreten ve CUDA'yı yaratan şirket.
- NV1: NVIDIA'nın 1995'te çıkan ilk ürünü.
- veri bant genişliği (data bandwidth): bir GPU'nun saniyede ne kadar veri taşıyabildiği; ilk donanımlarda çok sınırlıydı.
- paralellik (parallelism): birçok işi aynı anda yapmak; ilk GPU'larda neredeyse yoktu.
- çekirdek (core): işi yapan birim; modern GPU'larda binlercesi var.
- frekans (frequency): bir çipin saniyede kaç saat döngüsü çalıştığı; MHz (milyon) ya da GHz (milyar) ile ölçülür.
- GeForce RTX 5090: 21.760 CUDA çekirdekli ve 32 GB bellekli, Blackwell tabanlı, 2025 çıkışlı bir GeForce GPU'su.
- görüntü oluşturma (render): bir sahnenin tarifini (şekiller, renkler, ışık) ekranda gördüğün piksellere dönüştürmek.
- yapay zekâ (AI): veriden öğrenen yazılım, örneğin görüntü tanıma ya da sohbet botları; eğitimi büyük ölçüde dev matris hesaplarıdır, bu da GPU'lara çok uyar.
- hesaplama platformu (compute platform): sadece grafik için değil, genel hesaplama için kullanılan bir cihaz.
- 3D hızlandırma (3D acceleration): GPU'ların 3D grafik desteği; GPU'ları çok daha fazla insan için kullanışlı yaptı.
- RIVA 128: NVIDIA'nın 3D ile 2D'yi birleştiren ve şirketi tanınır yapan 1997 tarihli çipi.
- GeForce 256: NVIDIA'nın 1999'da ilk GPU olarak tanıttığı, 32 MB bellekli ve 120 MHz saatli kart.
- T&L (transform and lighting): 3D şekilleri yerleştiren ve aydınlatan hesap; GeForce 256 bunu CPU'dan GPU'ya taşıdı.
- GeForce: GPU'ları ilk kez geniş kitlelere ulaştıran NVIDIA tüketici GPU serisi.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- Tensor Core: yapay zekânın matris hesapları için yapılmış birimler; ilk kez Volta'da (2017) geldi.
- bulut bilişim (cloud computing): donanımı satın almak yerine GPU'lar dahil bilgisayarları bir sağlayıcının veri merkezlerinden internet üzerinden kiralamak.
- HPC (high-performance computing): hava tahmini ya da fizik simülasyonları gibi büyük problemler üzerinde birlikte çalışan çok sayıda güçlü işlemci.
- Blackwell: RTX 50 serisinin, B200'ün ve B300'ün arkasındaki 2024 tarihli NVIDIA mimarisi.
- Rubin: Blackwell'den sonraki NVIDIA mimarisi; ilk kez Eylül 2026'da Vera Rubin NVL72 kabinleriyle teslim edildi.
- mimari (architecture): bir GPU'nun genel tasarımı, yani çekirdeklerinin, belleğinin ve birimlerinin nasıl düzenlendiği.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan genel programlar yazmak için sunduğu platform; ilk kez 2007'de çıktı.
