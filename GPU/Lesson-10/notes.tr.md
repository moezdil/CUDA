# 10 > GPU White Paper'larını Okumak

Bu derste GPU (Graphics Processing Unit, grafik işlem birimi) white paper'larının (teknik raporlarının) ne olduğunu, onları nasıl bulacağını ve nasıl okuyacağını göreceksin. Yeni bir GPU neslinde gerçekte neyin değiştiğini öğrenmenin en iyi yolu bir white paper'dır.

## White Paper Nedir

White paper, bir GPU mimarisi hakkındaki resmî teknik belgedir. İlk başta ağır ve fazla ayrıntılı gelebilir, ama bir GPU hakkındaki en doğru kaynaktır: içinde pazarlama da basitleştirme de yoktur ve donanımın gerçekte nasıl tasarlandığını gösterir.

## White Paper Bulmak

Çip adını al ve yanına "white paper" ekle, örneğin `GA100 white paper` ya da `H100 white paper`. En yeni mimarilerde NVIDIA bu belgeye çoğu zaman technical brief der, örneğin "NVIDIA Blackwell Architecture Technical Brief"; o adla da ara.

> [!TIP]
> Her sonuç işe yaramaz. Blog yazıları, özetler ve karşılaştırmalar yardımcı olabilir ama yetmez. Her zaman resmî PDF'i ara.

## Tutarlı Bir Yapı

NVIDIA white paper'ları tutarlı bir yapı izler. Her yeni mimari genelde bir öncekiyle karşılaştırılarak anlatılır. Yani bir white paper hem neyin yeni olduğunu hem de neyin değiştiğini gösterir. Örneğin Hopper white paper'ı, H100'ü tablo tablo A100 ile karşılaştırır. Aynı tabloların farklı white paper'larda karşına çıkmasının nedeni de budur.

Bir white paper'ı iyi anladığında diğerlerini okumak çok daha kolaylaşır.

## GPU Mimarilerinin Yönü

2026 itibarıyla GPU mimarileri net bir yön gösteriyor:

- Pascal hâlâ büyük ölçüde genel amaçlı bir hesaplama mimarisiydi.
- Volta, Tensor Core'ları getirdi; GPU'lar açıkça yapay zekâ (AI, artificial intelligence) iş yükleri için optimize edilmeye başlandı.
- Ampere bunu daha fazla throughput, daha iyi verimlilik ve sparsity (seyreklik) desteği gibi özelliklerle genişletti.
- Hopper, büyük ölçekli yapay zekâ sistemleri için FP8'i (8 bit kayan noktalı sayı) ve yeni yürütme modellerini ekledi.
- Blackwell, NVFP4 (NVIDIA 4 bit kayan noktalı sayı) gibi yeni formatlar ekliyor. Bunlar çok düşük duyarlılığı doğrudan donanıma taşıyor ve büyük modellerin devreye alınma ve ölçeklenme biçimini değiştiriyor.
- Blackwell Ultra (B300, 2025), GPU başına 288 GB HBM3e (High Bandwidth Memory) ile daha fazla bellek ve daha yüksek NVFP4 hacmi getiriyor.
- Sırada Rubin var. Rubin GPU'ları ve HBM4 bellekli ilk rack'lerin sevkiyatı Eylül 2026'da başladı.

GPU'lar artık sadece hesaplama cihazı değil, yapay zekâ sistemlerinin altyapısı.

<arch-timeline focus="Pascal"></arch-timeline>

## Streaming Multiprocessor (SM)

Bir white paper'daki en önemli bölüm Streaming Multiprocessor (SM) bölümüdür. SM, GPU'nun kalbidir ve şunları bir araya getirir:

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

Her adım, GPU'nun ne için tasarlandığını değiştiriyor.

## Bölümlerin Sırası

Mimariler değişiyor ama belgelenme biçimleri aynı kalıyor. Sıra şöyle:

1. Yeni özellikler
2. SM tasarımı
3. Performans karşılaştırmaları
4. Teknik özellikler

Bu tutarlılık bilinçli bir tercih; nesiller arasındaki gelişimi takip etmeyi kolaylaştırıyor.

<whitepaper-map></whitepaper-map>

## Nasıl Okunur

White paper okumak sayıları ezberlemek değil, değişimi anlamaktır. SM'ye bak, yeni donanım birimlerini bul ve onları bir önceki nesille karşılaştır.

## Sözlük

- white paper: bir GPU'nun gerçekte nasıl tasarlandığını pazarlama olmadan gösteren resmî teknik belge.
- GPU (Graphics Processing Unit): çok sayıda basit işi paralel çalıştırmak için tasarlanmış işlemci.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Ampere ya da Hopper; her birinin kendi white paper'ı vardır.
- çip adı (chip name): GPU'nun içindeki silikonun adı; aradığın ad budur, örneğin GA100.
- GA100: A100'ün içindeki Ampere çipi.
- H100: Nvidia'nın 2022'de çıkardığı, Hopper tabanlı veri merkezi GPU'su.
- Pascal: büyük ölçüde genel amaçlı bir hesaplama mimarisi; Tensor Core'u yok.
- Tensor Core'lar: Volta'nın getirdiği donanım birimleri; GPU'ları açıkça yapay zekâ iş yükleri için optimize edilmiş hâle getirdiler.
- throughput: GPU'nun belirli bir sürede ne kadar iş bitirebildiği.
- sparsity (seyreklik): sıfırları sabit bir "4'te 2" düzeniyle atlayan bir Ampere özelliği; böyle verilerde Tensor Core throughput'unu iki katına çıkarır.
- FP8 (8 bit kayan noktalı sayı): Hopper'ın büyük ölçekli yapay zekâ sistemleri için eklediği sayı formatı.
- NVFP4 (NVIDIA 4 bit kayan noktalı sayı): çok düşük duyarlılığı doğrudan donanıma taşıyan bir Blackwell formatı.
- Blackwell Ultra: B300 ve GB300; GPU başına 288 GB HBM3e bellekli, geliştirilmiş Blackwell.
- HBM3e (High Bandwidth Memory): veri merkezi GPU'larında çipin yanına üst üste yığılmış çok hızlı bellek.
- Rubin: Blackwell'den sonraki mimari; Eylül 2026'dan beri veri merkezi rack'lerinde sevk ediliyor.
- technical brief (teknik özet): NVIDIA'nın, Blackwell gibi en yeni GPU'larının mimari belgesi için kullandığı ad.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitilmesi büyük ölçüde dev matris hesabıdır.
- duyarlılık (precision): her sayının kaç bit kullandığı; bit azaldıkça hesap hızlanır ve bellek azalır ama hassasiyet düşer.
- Streaming Multiprocessor (SM): GPU'nun kalbi; CUDA core'ları, Tensor Core'ları, zamanlamayı ve bellek erişimini bir araya getirir.
- CUDA core: her SM'nin içindeki genel amaçlı aritmetik birimler.
- zamanlama (scheduling): SM'nin birimlerinde sırada hangi thread grubunun çalışacağına karar vermek; her SM'de bunu her döngüde yapan birkaç zamanlayıcı vardır.
- transformer: modern dil modellerinin arkasındaki sinir ağı tasarımı; büyük ölçüde dev matris çarpımlarından oluşur.
- nesil (generation): GPU sürümlerindeki bir adım; white paper her yeni mimariyi bir önceki nesille karşılaştırır.
