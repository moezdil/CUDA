# GPU'ların Kısa Tarihi

Bu ders, GPU'ların nasıl güçlü hesaplama platformlarına dönüştüğünü anlatıyor. Bu arka plan, CUDA kodu yazmadan önce işine yarar.

## İlk Yıllar

Nvidia 90'ların başında kuruldu. İlk ürününü kısa bir süre içinde çıkardı.

> [!NOTE]
> Nvidia, bugünün büyük teknoloji şirketlerinin çoğuyla aşağı yukarı aynı dönemde kuruldu.

O ilk donanım, bugünküyle karşılaştırınca çok basitti:

- çok küçük bellek  
- çok sınırlı veri bant genişliği  
- neredeyse hiç gerçek paralellik yok  

## Modern GPU'lar

Bugünün GPU'ları bambaşka bir ölçekte. Bu GPU'lar:

- binlerce, hatta on binlerce çekirdeğe sahip  
- çok miktarda belleğe sahip  
- çok daha yüksek frekanslarda çalışıyor  

Rolleri de değişti.

## Grafikten Fazlası

GPU'lar ilk olarak görüntü oluşturmak için üretildi. Bugün bu, yaptıkları işin sadece küçük bir kısmı. GPU'lar artık şu alanlarda yaygın olarak kullanılıyor:

- yapay zekâ  
- büyük ölçekli veri işleme  
- simülasyonlar  
- bilimsel hesaplama  

Yani modern bir GPU sadece bir grafik cihazı değil, bir hesaplama platformudur.

## İlk Dönüm Noktası

Önemli bir an, GPU'lar gerçek 3D hızlandırmayı desteklemeye başladığında geldi. Bu, GPU'ları sadece uzmanlar için değil, çok daha fazla insan için kullanışlı hâle getirdi. Kullanım hızla arttı.

## GeForce

Kısa süre sonra Nvidia GeForce serisini tanıttı. GPU'lar ilk kez geniş kitlelere ulaştı. İlk GeForce kartları bile daha fazla paralellik, daha fazla bellek ve daha fazla özellik getirdi. Çekirdek sayısındaki ya da bellekteki küçük artışlar büyük fark yarattı, çünkü başlangıç noktası hâlâ çok düşüktü.

## İstikrarlı Büyüme

Bundan sonra ilerleme hızlandı. Her nesil performansı, verimliliği ya da özellikleri geliştirdi. Bu kazanımlar zamanla birikti. Modern GPU'lar tek bir büyük sıçrama sayesinde değil, yıllar boyunca atılan birçok adım sayesinde güçlü.

## Bugün Neredeyiz

Bugün Nvidia şu alanlarda merkezi bir rol oynuyor:

- oyun  
- yapay zekâ altyapısı  
- bulut bilişim  
- yüksek performanslı hesaplama  

Birçok durumda GPU'lar artık modern yapay zekâ sistemlerinin ana itici gücü.

<gpu-history></gpu-history>

## CUDA'dan Önce Bu Neden Önemli

GPU'ların nasıl geliştiğini bilmek şunları anlamana yardım eder:

- mimarinin neden bu şekilde tasarlandığını  
- GPU'lar arasında performansın neden farklı olduğunu  
- modern GPU özelliklerinin neden var olduğunu  

Bu da CUDA'ya geçişi kolaylaştırır.

## Sözlük

- veri bant genişliği (data bandwidth): bir GPU'nun ne kadar veri taşıyabildiği, ilk donanımlarda çok sınırlıydı.
- paralellik (parallelism): birçok işi aynı anda yapmak, ilk GPU'larda neredeyse yoktu.
- çekirdek (core): işi yapan birim, modern GPU'larda binlercesi var.
- frekans (frequency): bir GPU'nun ne kadar hızlı çalıştığı, modern GPU'lar çok daha yüksek frekanslarda çalışır.
- 3D hızlandırma (3D acceleration): GPU'ların 3D grafik desteği, GPU'ları çok daha fazla insan için kullanışlı yaptı.
- GeForce: GPU'ları ilk kez geniş kitlelere ulaştıran Nvidia GPU serisi.
- nesil (generation): GPU sürümlerindeki bir adım, her biri performansı, verimliliği ya da özellikleri geliştirir.
- hesaplama platformu (compute platform): sadece grafik için değil, genel hesaplama için kullanılan bir cihaz.
