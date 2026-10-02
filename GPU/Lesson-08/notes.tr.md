# 08 > Gerçek Bir GPU'yu Tanımak

Bu derste gerçek bir GPU'nun (Graphics Processing Unit, grafik işlem birimi) mimarisini ve kategorisini birkaç dakikada nasıl bulacağını göreceksin. Çekirdek sayılarının neden yanıltabildiğini ve tek bir özelliğe bakmadan önce kartın fiziksel tasarımının sana nasıl ipucu verdiğini de öğreneceksin.

## GPU'yu Araştır

GPU'nun adını "TechPowerUp" ile birlikte ara, örneğin "RTX 5090 TechPowerUp" ya da "B200 TechPowerUp", ve çıkan sonucu aç. TechPowerUp, GPU özelliklerinden oluşan büyük bir veritabanı tutar.

Sayfada bir sürü sayı ve özellik göreceksin. Hepsini anlamaya çalışma. İki şeye odaklan: mimariye ve ürün kategorisine.

> [!TIP]
> Bir GPU'nun compute capability değerini (CC, [Ders 09](../Lesson-09/notes.md) anlatıyor) bulmak için NVIDIA'nın kendi "CUDA GPUs" sayfasına bak; orada her kart CC numarasıyla listelenir.

## Mimari ve Kategori

Güncel iki GPU'yu ele al. GeForce RTX 5090, Blackwell mimarisini kullanır ve GeForce ailesindendir; yani oyun ya da kişisel iş istasyonu gibi tüketici kullanımı için yapılmıştır. B200 de Blackwell kullanır, ama o bir veri merkezi GPU'sudur; sunucularda yapay zekâ (AI, artificial intelligence) eğitimi ve çıkarımı için yapılmıştır.

- Mimari, GPU'nun nasıl yapıldığını söyler.
- Kategori, nerede kullanıldığını söyler.

Aynı mimari, iki farklı dünya. Özellikleri bunu gösterir:

| | RTX 5090 | B200 |
|---|---|---|
| Mimari | Blackwell | Blackwell |
| Kategori | GeForce (tüketici) | Veri merkezi |
| CUDA çekirdeği | 21.760 | 18.944 |
| Bellek | 32 GB GDDR7 | 180 GB HBM3e |
| Bellek bant genişliği | 1.792 GB/s | 8 TB/s |
| Transistör | yaklaşık 92 milyar | 208 milyar (iki kalıp) |

Tüketici kartında daha çok CUDA çekirdeği var, ama veri merkezi GPU'sunun belleği beş kattan fazla, bant genişliği de yaklaşık dört kat. Büyük yapay zekâ modellerinde bellek ve bant genişliği, çekirdek sayısından daha belirleyicidir. Bir nesil önce de durum aynıydı: RTX 3090 ile A100 ikisi de Ampere'di.

> [!NOTE]
> Eski kaynaklar veri merkezi kategorisine çoğu zaman "Tesla" der. Bugün NVIDIA sadece veri merkezi GPU'su diyor ve ürünleri H100, B200 ya da B300 gibi çip adlarıyla adlandırıyor.

## Sadece Çekirdek Sayılarını Karşılaştırma

7.000 ya da 21.760 gibi çekirdek sayıları ikna edici görünür, ama yanıltır. Genelde tek bir birim türünü, FP32 (32 bit kayan noktalı sayı) CUDA çekirdeklerini sayarlar. Yapay zekânın arkasındaki matris hesabını yapan Tensor Core'ları ve diğer özel birimleri dışarıda bırakırlar.

Modern GPU'lar, özellikle Hopper ve Blackwell, güçlerinin büyük bir kısmını bu diğer birimlere ayırır. Somut bir örnek: yukarıdaki B200'de RTX 5090'dan daha az CUDA çekirdeği var, ama büyük yapay zekâ modellerini eğitmede çok daha hızlıdır, çünkü Tensor Core'ları ve bellek sistemi tam olarak bu iş için yapılmıştır. Çekirdek sayısı tek başına hikâyenin tamamını anlatmaz.

## Fiziksel Tasarım İpucu Verir

A100, H100 ya da B200 gibi veri merkezi GPU'larında çoğu zaman görünür bir fan yoktur. Birçoğu SXM modülüdür (Server PCI Express Module): sunucunun ana kartına doğrudan oturan düz kartlar. Sunucuların içinde çalışırlar ve soğutmayı sunucu üstlenir.

GeForce kartlarında büyük fanlar ve soğutma sistemleri bulunur. Masaüstü bilgisayarlar ve iş istasyonları için yapıldıklarından kendi ısılarını kendileri yönetmek zorundadırlar.

Buradan basit bir kısayol çıkar:

- Büyük ve görünür bir soğutma varsa GPU büyük ihtimalle tüketici kullanımı içindir.
- Fansız, kompakt bir modül büyük ihtimalle bir veri merkezi GPU'sudur.

> [!WARNING]
> Bu bir kural değil, pratik bir ipucudur. Bazı veri merkezi kartları normal PCIe (Peripheral Component Interconnect Express) kartı olarak gelir, en yeni rack'ler de GPU'ları hava yerine sıvıyla soğutur. Her zaman ürün adıyla doğrula.

<spec-reader></spec-reader>

## Doğru Soruları Sor

Her sayıyı anlaman gerekmez. Bunun yerine şu soruları sor:

- Bu GPU hangi mimariyi kullanıyor?  
- Hangi kategoriye ait?  
- Hangi tür problemi çözmek için tasarlanmış?  

Bu cevaplarla özelliklerin geri kalanı daha anlamlı hâle gelir. CUDA (Compute Unified Device Architecture) ve GPU çalışmasında bir GPU'nun amacını bilmek, özelliklerini bilmek kadar önemlidir.

## Sözlük

- GPU (Graphics Processing Unit): çok sayıda basit işi paralel çalıştırmak için tasarlanmış işlemci.
- TechPowerUp: büyük bir GPU özellik veritabanı olan web sitesi; sayfasını bulmak için GPU adını "TechPowerUp" ile ara.
- özellik: bir GPU'nun yayımlanmış teknik sayılarından biri; çekirdek sayısı, bellek boyutu ya da saat hızı gibi.
- compute capability (CC): NVIDIA'nın bir GPU'nun neler yapabildiğini gösteren sürüm numarası; Ders 09'da anlatılıyor.
- RTX 5090: 2025'te çıkan, Blackwell tabanlı, 21.760 CUDA çekirdekli ve 32 GB GDDR7 bellekli bir GeForce GPU'su.
- B200: iki kalıplı, 208 milyar transistörlü ve 180 GB HBM3e bellekli bir Blackwell veri merkezi GPU'su.
- RTX 3090 / A100: 2020'den iki Ampere GPU'su, biri GeForce kartı biri veri merkezi GPU'su; bir nesil önceki aynı ikili.
- mimari: GPU'nun nasıl yapıldığı; RTX 5090 ile B200 ikisi de Blackwell kullanır.
- Blackwell: RTX 50 serisinde, RTX PRO kartlarında ve B200'de kullanılan 2024-2025 NVIDIA mimarisi.
- kategori: GPU'nun nerede kullanıldığı; tüketici kullanımı ya da veri merkezi gibi.
- GeForce: NVIDIA'nın oyun ya da kişisel iş istasyonu gibi tüketici kullanımı için yaptığı GPU ailesi.
- iş istasyonu: 3D tasarım ya da mühendislik gibi profesyonel işler için güçlü bir masaüstü bilgisayar.
- veri merkezi GPU'su: yapay zekâ, bulut ve büyük sistemler için yapılmış GPU; eski kaynaklar bu kategoriye "Tesla" der.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitilmesi büyük ölçüde dev matris hesabıdır.
- CUDA çekirdeği: GPU'nun genel amaçlı FP32 birimleri; çekirdek sayısı genelde bunları sayar.
- GDDR7: RTX 50 serisinin grafik belleği; hızlıdır, ama veri merkezi GPU'larındaki HBM'den çok daha küçük ve yavaştır.
- HBM3e (High Bandwidth Memory): veri merkezi GPU'larında çipin yanına üst üste yığılmış çok hızlı bellek.
- bant genişliği: belleğin saniyede ne kadar veri verebildiği; örneğin B200'de 8 TB/s.
- çekirdek sayısı: çekirdeklerin sayısı, çoğu zaman tek bir türün; hikâyenin tamamını anlatmaz.
- FP32 (32 bit kayan noktalı sayı): tek duyarlıklı hesap; çekirdek sayısının genelde saydığı birim türü.
- Tensor Core: yapay zekâ için matris hesabı yapan birimler; çekirdek sayısı bunları dışarıda bırakır.
- Hopper / Blackwell: 2022 ve 2024'ten, Tensor Core'larla dolu NVIDIA veri merkezi mimarileri.
- SXM (Server PCI Express Module): PCIe yuvası yerine sunucu kartına düz oturan, sunucu tarafından soğutulan veri merkezi GPU biçimi.
- PCIe (Peripheral Component Interconnect Express): bir kartı bilgisayarın geri kalanına bağlayan standart yuva ve bağlantı.
- soğutma: GPU'nun ürettiği ısıyı uzaklaştırmak; kartın kendi fanlarıyla, sunucunun hava akışıyla ya da sıvıyla.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, hem GeForce hem veri merkezi GPU'larında çalışan programlar yazmak için sunduğu platform.
