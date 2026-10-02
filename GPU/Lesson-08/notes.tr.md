# Gerçek Bir GPU'yu Tanımak

Bu derste gerçek bir GPU'nun mimarisini ve kategorisini nasıl bulacağını göreceksin. Çekirdek sayılarının neden yanıltıcı olabildiğini ve fiziksel tasarımın nasıl ipucu verdiğini de öğreneceksin.

## GPU'yu Araştır

GPU'nun adını "TechPowerUp" ile birlikte ara, örneğin "A100 TechPowerUp" ya da "RTX 3090 TechPowerUp", ve çıkan sonuçlardan birini aç.

Sayfada bir sürü sayı ve özellik göreceksin. Hepsini anlamaya çalışma; iki şeye odaklan: mimari ve ürün kategorisi.

## Mimari ve Kategori

RTX 3090, Ampere mimarisini kullanır ve GeForce ailesine aittir. Yani oyun ya da kişisel iş istasyonları gibi tüketici kullanımı için tasarlanmıştır.

A100 de Ampere kullanır. İki GPU aynı mimariyi paylaşır ama farklı amaçlara hizmet eder.

- Mimari, GPU'nun nasıl tasarlandığını söyler.
- Kategori, nerede kullanıldığını söyler.

> [!NOTE]
> Eski kaynaklar veri merkezi kategorisine çoğu zaman "Tesla" der. Nvidia'nın bugünkü terimleri ise Data Center GPU ya da AI GPU.

Yani RTX 3090 da A100 de Ampere, ama farklı dünyalar için yapılmışlar. RTX 3090 oyun ve günlük kullanım için optimize edilmiştir; A100 ise yapay zekâ iş yükleri, bulut altyapısı ve büyük ölçekli sistemler için tasarlanmıştır.

## Sadece Çekirdek Sayılarını Karşılaştırma

7.000 ya da 10.000 gibi çekirdek sayıları ikna edici görünür ama yanıltır. Çünkü genelde tek bir çekirdek türünü, çoğu zaman tek duyarlıklı (single-precision) birimleri sayarlar ve GPU'nun içindeki her şeyi kapsamazlar.

Modern GPU'larda, özellikle Hopper ve Blackwell gibi yeni mimarilerde, farklı türde hesaplama birimleri bulunur. Çekirdek sayısı tek başına hikâyenin tamamını anlatmaz.

## Fiziksel Tasarım İpucu Verir

A100 ya da H100 gibi veri merkezi GPU'larında çoğu zaman görünür bir fan yoktur. Sunucuların içinde çalışırlar ve soğutmayı sunucu üstlenir.

RTX GPU'larında büyük fanlar ve soğutma sistemleri vardır. Masaüstü bilgisayarlar ve iş istasyonları için tasarlandıklarından, kendi ısılarını kendileri yönetmek zorundadırlar.

Bu da basit bir kestirme sunar:

- Büyük ve görünür bir soğutma sistemi, GPU'nun büyük ihtimalle tüketici kullanımı için olduğunu gösterir.
- Fansız, kompakt bir modül muhtemelen bir veri merkezi GPU'sudur.

> [!TIP]
> Bu kesin bir kural değil, ama çoğu zaman işe yarar.

<spec-reader></spec-reader>

## Doğru Soruları Sor

Her sayıyı anlaman gerekmiyor. Bunun yerine şu soruları sor:

- Bu GPU hangi mimariyi kullanıyor?  
- Hangi kategoriye ait?  
- Ne tür bir problemi çözmek için tasarlanmış?  

Bu cevaplar sayesinde özelliklerin geri kalanı daha anlamlı gelir. CUDA ve GPU çalışmalarında bir GPU'nun amacını bilmek, özelliklerini bilmek kadar önemlidir.

## Sözlük

- TechPowerUp: GPU özelliklerinin listelendiği bir web sitesi; bir GPU'nun sayfasını bulmak için adını "TechPowerUp" ile ara.
- özellik (spec): bir GPU'nun yayımlanmış teknik değerlerinden biri, örneğin çekirdek sayısı, bellek boyutu ya da saat hızı.
- RTX 3090: 2020'de çıkan, Ampere tabanlı, 10.496 çekirdekli ve 24 GB GDDR6X bellekli bir GeForce GPU'su.
- A100: 2020'de çıkan, Ampere tabanlı, 6.912 tek duyarlıklı çekirdeğe ve 40 ya da 80 GB HBM belleğe sahip bir veri merkezi GPU'su.
- mimari (architecture): GPU'nun nasıl tasarlandığı; RTX 3090 da A100 de Ampere kullanır.
- Ampere: Nvidia'nın 2020 mimarisi; hem RTX 30 serisinde hem A100'de kullanılır.
- kategori (category): GPU'nun nerede kullanıldığı, örneğin tüketici kullanımı ya da veri merkezi.
- GeForce: oyun ya da kişisel iş istasyonları gibi tüketici kullanımı için tasarlanmış NVIDIA GPU ailesi.
- iş istasyonları (workstations): 3D tasarım ya da mühendislik gibi profesyonel işler için güçlü masaüstü bilgisayarlar.
- veri merkezi GPU (data center GPU): yapay zekâ, bulut ve büyük sistemler için tasarlanmış GPU; eski kaynaklar bu kategoriye "Tesla" der.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir yapay zekâ modeli eğitmek.
- çekirdek sayısı (core count): çekirdeklerin sayısı, çoğu zaman yalnızca tek bir türünkü; hikâyenin tamamını anlatmaz.
- tek duyarlıklı (single-precision): 32 bitlik kayan noktalı sayı hesabı (FP32); çekirdek sayısının genelde saydığı birim türü.
- Hopper / Blackwell: Nvidia'nın 2022 ve 2024 veri merkezi mimarileri; çekirdek sayısının dışarıda bıraktığı çok sayıda Tensor Core içerir.
- H100: 2022'de çıkan, yapay zekâ ve HPC için tasarlanmış, Hopper tabanlı bir veri merkezi GPU'su.
- soğutma (cooling): GPU'nun ürettiği ısıyı kartın kendi fanlarıyla ya da sunucunun hava akışıyla uzaklaştırmak.
- modül (module, SXM): sunucu kartına PCIe yuvası yerine düz oturan, sunucu tarafından soğutulan bir veri merkezi GPU biçimi.
- CUDA: NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform; hem GeForce hem veri merkezi GPU'larında çalışır.
