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
- mimari (architecture): GPU'nun nasıl üretildiği. RTX 3090 da A100 de Ampere kullanır.
- kategori (category): GPU'nun nerede kullanıldığı, örneğin tüketici kullanımı ya da veri merkezi.
- GeForce: oyun ya da kişisel iş istasyonları gibi tüketici kullanımı için üretilen NVIDIA GPU ailesi.
- veri merkezi GPU'su (data center GPU): yapay zekâ, bulut ve büyük sistemler için üretilmiş bir GPU. Eski kaynaklar bu kategoriye "Tesla" der.
- çekirdek sayısı (core count): çekirdeklerin sayısı, çoğu zaman sadece tek bir türün. Hikâyenin tamamını anlatmaz.
