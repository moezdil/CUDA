# Gerçek Bir GPU'yu Tanımak

Bu ders, gerçek bir GPU'nun mimarisini ve kategorisini nasıl bulacağını gösteriyor. Çekirdek sayılarının neden yanıltıcı olabildiğini ve fiziksel tasarımın nasıl ipucu verdiğini de anlatıyor.

## GPU'yu Araştır

GPU'nun adını "TechPowerUp" ile birlikte ara. Örneğin "A100 TechPowerUp" ya da "RTX 3090 TechPowerUp" diye ara ve bir sonucu aç.

Sayfada bir sürü sayı ve özellik var. Hepsini anlamaya çalışma. İki şeye odaklan: mimari ve ürün kategorisi.

## Mimari ve Kategori

RTX 3090, Ampere mimarisini kullanır. GeForce ailesine aittir. Yani oyun ya da kişisel iş istasyonları gibi tüketici kullanımı için üretilmiştir.

A100 de Ampere kullanır. İki GPU aynı mimariyi paylaşır ama farklı amaçlara hizmet eder.

- Mimari, GPU'nun nasıl üretildiğini söyler.
- Kategori, nerede kullanıldığını söyler.

> [!NOTE]
> Eski kaynaklar veri merkezi kategorisine çoğu zaman "Tesla" der. Nvidia'nın yeni terimleri (2026 civarı) Data Center GPU ya da AI GPU.

Yani RTX 3090 da A100 de Ampere, ama farklı dünyalar için yapılmışlar. RTX 3090 oyun ve günlük kullanım için optimize edilmiş. A100 ise yapay zekâ iş yükleri, bulut altyapısı ve büyük ölçekli sistemler için üretilmiş.

## Sadece Çekirdek Sayılarını Karşılaştırma

7000 ya da 10000 gibi çekirdek sayıları ikna edici görünür ama yanıltır. Çünkü genelde sadece tek bir çekirdek türünü sayarlar, çoğu zaman tek duyarlıklı (single-precision) birimleri. GPU'nun içindeki her şeyi kapsamazlar.

Modern GPU'larda, özellikle Hopper ve Blackwell gibi yeni mimarilerde, farklı türde hesaplama birimleri var. Çekirdek sayısı tek başına hikâyenin tamamını anlatmaz.

## Fiziksel Tasarım İpucu Verir

A100 ya da H100 gibi veri merkezi GPU'larında çoğu zaman görünür bir fan yoktur. Sunucuların içinde çalışırlar ve soğutmayı sunucu üstlenir.

RTX GPU'larında büyük fanlar ve soğutma sistemleri vardır. Masaüstü bilgisayarlar ve iş istasyonları için üretilirler, bu yüzden kendi ısılarını kendileri yönetmek zorundadırlar.

Bu da basit bir kestirme yol sunar:

- Büyük ve görünür bir soğutma, GPU'nun büyük ihtimalle tüketici kullanımı için olduğu anlamına gelir.
- Fansız, kompakt bir modül muhtemelen bir veri merkezi GPU'sudur.

> [!TIP]
> Bu kesin bir kural değil, ama çoğu zaman işe yarar.

<spec-reader></spec-reader>

## Doğru Soruları Sor

Her sayıyı anlaman gerekmiyor. Onun yerine şu soruları sor:

- Bu GPU hangi mimariyi kullanıyor?  
- Hangi kategoriye ait?  
- Ne tür bir problemi çözmek için tasarlanmış?  

Bu cevaplarla özelliklerin geri kalanı daha anlamlı gelir. CUDA ve GPU çalışmalarında bir GPU'nun amacını bilmek, özelliklerini bilmek kadar önemlidir.

## Sözlük

- TechPowerUp: GPU özelliklerinin bulunduğu bir web sitesi. Sayfasını bulmak için GPU adını "TechPowerUp" ile ara.
- özellik (spec): bir GPU'nun yayımlanan tek bir teknik değeri, örneğin çekirdek sayısı, bellek boyutu ya da saat hızı.
- RTX 3090: 2020'den, Ampere tabanlı, 10.496 çekirdekli ve 24 GB GDDR6X bellekli bir GeForce GPU'su.
- A100: 2020'den, Ampere tabanlı, 6.912 tek duyarlıklı çekirdekli ve 40 ya da 80 GB HBM bellekli bir veri merkezi GPU'su.
- mimari (architecture): GPU'nun nasıl üretildiği. RTX 3090 da A100 de Ampere kullanır.
- Ampere: Nvidia'nın 2020 mimarisi, hem RTX 30 serisinde hem A100'de kullanılır.
- kategori (category): GPU'nun nerede kullanıldığı, örneğin tüketici kullanımı ya da veri merkezi.
- GeForce: oyun ya da kişisel iş istasyonları gibi tüketici kullanımı için üretilen NVIDIA GPU ailesi.
- iş istasyonları (workstations): 3D tasarım ya da mühendislik gibi profesyonel işler için güçlü masaüstü bilgisayarlar.
- veri merkezi GPU (data center GPU): yapay zekâ, bulut ve büyük sistemler için üretilmiş bir GPU. Eski kaynaklar bu kategoriye "Tesla" der.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir yapay zekâ modeli eğitmek.
- çekirdek sayısı (core count): çekirdeklerin sayısı, çoğu zaman sadece tek bir türün. Hikâyenin tamamını anlatmaz.
- tek duyarlıklı (single-precision): 32 bitlik kayan noktalı sayı hesabı (FP32), çekirdek sayısının genelde saydığı birim türü.
- Hopper / Blackwell: Nvidia'nın 2022 ve 2024 veri merkezi mimarileri, çekirdek sayısının dışarıda bıraktığı çok sayıda Tensor Core içerir.
- H100: 2022'den, yapay zekâ ve HPC için üretilmiş, Hopper tabanlı bir veri merkezi GPU'su.
- soğutma (cooling): GPU'nun ürettiği ısıyı kartın kendi fanlarıyla ya da sunucunun hava akışıyla uzaklaştırmak.
- modül (module, SXM): sunucu kartına PCIe yuvası yerine düz oturan, sunucu tarafından soğutulan bir veri merkezi GPU biçimi.
- CUDA: NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform, hem GeForce hem veri merkezi GPU'larında çalışır.
