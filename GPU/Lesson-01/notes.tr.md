# GPU'ların Kısa Tarihi

Bu derste GPU'ların nasıl güçlü hesaplama platformlarına dönüştüğünü göreceksin. Bu arka plan, CUDA kodu yazmaya başlamadan önce işine yarar.

## İlk Yıllar

Nvidia 90'ların başında kuruldu ve kısa süre içinde ilk ürününü çıkardı.

> [!NOTE]
> Nvidia, bugünün büyük teknoloji şirketlerinin çoğuyla aşağı yukarı aynı dönemde kuruldu.

O ilk donanım, bugünküyle karşılaştırıldığında çok basitti:

- çok küçük bellek  
- çok sınırlı veri bant genişliği  
- neredeyse hiç gerçek paralellik yok  

## Modern GPU'lar

Bugünün GPU'ları bambaşka bir ölçekte:

- binlerce, hatta on binlerce çekirdek barındırıyor  
- çok büyük miktarda belleğe sahip  
- çok daha yüksek frekanslarda çalışıyor  

Rolleri de değişti.

## Grafikten Fazlası

GPU'lar ilk olarak görüntü oluşturmak için tasarlandı. Bugün bu, yaptıkları işin küçük bir kısmı. Artık şu alanlarda da yaygın olarak kullanılıyorlar:

- yapay zekâ  
- büyük ölçekli veri işleme  
- simülasyonlar  
- bilimsel hesaplama  

Yani modern bir GPU sadece bir grafik cihazı değil, bir hesaplama platformudur.

## İlk Dönüm Noktası

Önemli bir dönüm noktası, GPU'ların gerçek 3D hızlandırmayı desteklemeye başlamasıyla geldi. Böylece GPU'lar sadece uzmanlar için değil, çok daha fazla insan için kullanışlı hâle geldi ve kullanım hızla arttı.

## GeForce

Kısa süre sonra Nvidia GeForce serisini tanıttı ve GPU'lar ilk kez geniş kitlelere ulaştı. İlk GeForce kartları bile daha fazla paralellik, daha fazla bellek ve yeni özellikler getirdi. Başlangıç noktası çok düşük olduğu için çekirdek sayısındaki ya da bellekteki küçük artışlar bile büyük fark yarattı.

## İstikrarlı Büyüme

Bundan sonra ilerleme hızlandı. Her nesil performansta, verimlilikte ya da özelliklerde bir adım öne geçti. Bu kazanımlar zamanla birikti. Modern GPU'lar güçlerini tek bir büyük sıçramaya değil, yıllar boyunca atılan birçok adıma borçlu.

## Bugün Neredeyiz

Bugün Nvidia şu alanlarda merkezi bir rol oynuyor:

- oyun  
- yapay zekâ altyapısı  
- bulut bilişim  
- yüksek performanslı hesaplama  

Birçok durumda GPU'lar artık modern yapay zekâ sistemlerinin itici gücü.

<gpu-history></gpu-history>

## CUDA'dan Önce Bu Neden Önemli

GPU'ların nasıl geliştiğini bilmek şunları anlamana yardım eder:

- mimarinin neden bu şekilde tasarlandığını  
- GPU'lar arasında performansın neden farklı olduğunu  
- modern GPU özelliklerinin neden var olduğunu  

Bu da CUDA'ya geçişi kolaylaştırır.

## Sözlük

- GPU (Graphics Processing Unit): binlerce basit çekirdeğiyle çok sayıda işi paralel çalıştırmak için tasarlanmış işlemci.
- Nvidia: 1993'te kurulan, GeForce ve veri merkezi GPU'larını üreten ve CUDA'yı yaratan şirket.
- veri bant genişliği (data bandwidth): bir GPU'nun ne kadar veri taşıyabildiği; ilk donanımlarda çok sınırlıydı.
- paralellik (parallelism): birçok işi aynı anda yapmak; ilk GPU'larda neredeyse yoktu.
- çekirdek (core): işi yapan birim; modern GPU'larda binlercesi var.
- frekans (frequency): bir GPU'nun ne kadar hızlı çalıştığı; modern GPU'lar çok daha yüksek frekanslarda çalışır.
- görüntü oluşturma (render): bir sahnenin tarifini (şekiller, renkler, ışık) ekranda gördüğün piksellere dönüştürmek.
- yapay zekâ (AI): veriden öğrenen yazılım, örneğin görüntü tanıma ya da sohbet botları; eğitimi büyük ölçüde dev matris hesaplarıdır, bu da GPU'lara çok uyar.
- hesaplama platformu (compute platform): sadece grafik için değil, genel hesaplama için kullanılan bir cihaz.
- 3D hızlandırma (3D acceleration): GPU'ların 3D grafik desteği; GPU'ları çok daha fazla insan için kullanışlı yaptı.
- GeForce: GPU'ları ilk kez geniş kitlelere ulaştıran Nvidia GPU serisi.
- nesil (generation): GPU sürümlerindeki bir adım; her biri performansı, verimliliği ya da özellikleri geliştirir.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- bulut bilişim (cloud computing): donanımı satın almak yerine GPU'lar dahil bilgisayarları bir sağlayıcının veri merkezlerinden internet üzerinden kiralamak.
- yüksek performanslı hesaplama (HPC): hava tahmini ya da fizik simülasyonları gibi büyük problemler üzerinde birlikte çalışan çok sayıda güçlü işlemci.
- mimari (architecture): bir GPU'nun genel tasarımı, yani çekirdeklerinin, belleğinin ve birimlerinin nasıl düzenlendiği.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan genel programlar yazmak için sunduğu platform; ilk kez 2007'de çıktı.
