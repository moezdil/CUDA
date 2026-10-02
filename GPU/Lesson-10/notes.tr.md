# GPU White Paper'larını Okumak

Bu ders, GPU white paper'larının (teknik raporlarının) ne olduğunu, onları nasıl bulacağını ve nasıl okuyacağını anlatıyor.

## White Paper Nedir

White paper, bir GPU mimarisi hakkındaki resmî teknik belgedir. İlk başta ağır ve fazla ayrıntılı gelebilir. Bir GPU hakkındaki en doğru kaynaktır. İçinde pazarlama da basitleştirme de yoktur. Donanımın gerçekte nasıl üretildiğini gösterir.

## White Paper Bulmak

Çip adını al ve yanına "white paper" ekle. Örneğin: `GA100 white paper` ya da `H100 white paper`

> [!TIP]
> Her sonuç işe yaramaz. Blog yazıları, özetler ve karşılaştırmalar yardımcı olabilir ama yeterli değildir. Her zaman resmî PDF'i ara.

## Tutarlı Bir Yapı

NVIDIA white paper'ları tutarlı bir yapı izler. Her yeni mimari genelde bir öncekiyle karşılaştırılarak anlatılır. Yani bir white paper hem neyin yeni olduğunu hem de neyin değiştiğini gösterir. Aynı tabloların farklı white paper'larda karşına çıkmasının nedeni budur.

Bir white paper'ı iyi anladığında diğerlerini okumak çok daha kolay olur.

## GPU Mimarilerinin Yönü

2026 itibarıyla GPU mimarileri net bir yön gösteriyor:

- Pascal hâlâ büyük ölçüde genel amaçlı bir hesaplama mimarisiydi.
- Volta, Tensor Core'ları getirdi. GPU'lar açıkça yapay zekâ iş yükleri için optimize edilmeye başlandı.
- Ampere bunu daha fazla throughput, daha iyi verimlilik ve sparsity (seyreklik) desteği gibi özelliklerle genişletti.
- Hopper, büyük ölçekli yapay zekâ sistemleri için FP8'i ve yeni yürütme modellerini ekledi.
- Blackwell, NVFP4 gibi yeni formatlar ekliyor. Bunlar çok düşük duyarlılığı doğrudan donanıma taşıyor. Bu da büyük modellerin kullanıma alınma ve ölçeklenme şeklini değiştiriyor.

GPU'lar artık sadece hesaplama cihazı değil. Yapay zekâ sistemlerinin altyapısı.

<arch-timeline focus="Pascal"></arch-timeline>

## Streaming Multiprocessor (SM)

Bir white paper'daki en önemli bölüm Streaming Multiprocessor'dır (SM). SM, GPU'nun çekirdeğidir. Şunları bir araya getirir:

* CUDA core'lar
* Tensor core'lar
* Zamanlama (scheduling)
* Bellek erişimi

Bir mimaride gerçekten neyin değiştiğini görmek için SM'ye bak. Gelişim çok net:

- Pascal'da Tensor Core yok.
- Volta onları getiriyor.
- Ampere onları geliştirip ölçekliyor.
- Hopper onları transformer iş yükleri için optimize ediyor.
- Blackwell onları yeni duyarlılık formatları ve komutlarla genişletiyor.

Her adım GPU'nun ne yapmak için tasarlandığını değiştiriyor.

## Bölümlerin Sırası

Mimariler değişiyor ama belgelenme şekilleri aynı kalıyor. Sıra şöyle:

1. Yeni özellikler
2. SM tasarımı
3. Performans karşılaştırmaları
4. Teknik özellikler

Bu tutarlılık bilerek yapılıyor. Nesiller arasındaki gelişimi takip etmeyi kolaylaştırıyor.

<whitepaper-map></whitepaper-map>

## Nasıl Okunur

White paper okumak sayıları ezberlemek değildir. Değişimi anlamaktır. SM'ye bak, yeni donanım birimlerini bul ve onları bir önceki nesille karşılaştır.

## Sözlük

- white paper: bir GPU'nun gerçekte nasıl üretildiğini pazarlama olmadan gösteren resmî teknik belge.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Ampere ya da Hopper; her birinin kendi white paper'ı vardır.
- çip adı (chip name): GPU'nun içindeki silikonun adı, aradığın ad budur, örneğin GA100.
- GA100: A100'ün içindeki Ampere çipi.
- H100: Nvidia'nın 2022'den, Hopper tabanlı veri merkezi GPU'su.
- Pascal: büyük ölçüde genel amaçlı bir hesaplama mimarisi. Tensor Core'u yok.
- Tensor Core'lar: Volta'nın getirdiği donanım birimleri. GPU'ları açıkça yapay zekâ iş yükleri için optimize edilmiş hâle getirdiler.
- throughput: GPU'nun belirli bir sürede ne kadar iş bitirebildiği.
- sparsity (seyreklik): sıfırları sabit bir "4'te 2" düzeniyle atlayan bir Ampere özelliği, böyle verilerde Tensor Core throughput'unu iki katına çıkarır.
- FP8: Hopper'ın büyük ölçekli yapay zekâ sistemleri için eklediği 8 bitlik bir kayan noktalı sayı formatı.
- NVFP4: çok düşük duyarlılığı doğrudan donanıma taşıyan bir Blackwell formatı.
- duyarlılık (precision): her sayının kaç bit kullandığı; bit azaldıkça hesap hızlanır ve bellek azalır ama hassasiyet düşer.
- Streaming Multiprocessor (SM): GPU'nun çekirdeği. CUDA core'ları, Tensor Core'ları, zamanlamayı ve bellek erişimini bir araya getirir.
- CUDA core: her SM'nin içindeki genel amaçlı aritmetik birimler.
- zamanlama (scheduling): SM'nin birimlerinde sırada hangi thread grubunun çalışacağına karar vermek; her SM'de bunu her döngüde yapan birkaç zamanlayıcı vardır.
- transformer: modern dil modellerinin arkasındaki sinir ağı tasarımı, büyük ölçüde dev matris çarpımlarından oluşur.
- nesil (generation): GPU sürümlerindeki bir adım; white paper her yeni mimariyi bir önceki nesille karşılaştırır.
