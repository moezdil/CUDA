# 05 > Mimari ve Çipler

Bir mimari tek bir çip değildir. Aynı temel tasarımı paylaşan bir çip ailesidir ve her çip de sonunda birkaç farklı ürüne girer. Bu derste mimarinin, çipin ve son GPU'nun (Graphics Processing Unit, grafik işlem birimi) nasıl birbirine bağlandığını Ada Lovelace ve Blackwell örnekleriyle göreceksin.

## Bir Mimari, Birçok Çip

Ada Lovelace mimarisini (2022) ele al. Şu gibi farklı çipleri içerir:

- AD102  
- AD103  
- AD104  

"AD" ön eki hepsini aynı mimariye bağlar. Daha hiçbir özelliğe bakmadan aynı aileden olduklarını bilirsin.

Güncel tüketici nesli de aynı şekilde çalışır. Blackwell tüketici çipleri "GB" ile başlar: RTX 5090'da GB202, RTX 5080'de GB203, RTX 5070'te GB205.

## Aynı Tasarım, Farklı Ölçek

Aynı mimariden gelen çipler farklı şekillerde kullanılır. Bazıları üst seviye GPU'lar içindir, bazıları orta seviye ya da daha küçük sistemler için.

Bir çipin büyüklüğü, çekirdekleri barındıran yapı taşları olan SM'lerle (Streaming Multiprocessor) sayılır. Tam bir AD102'de 144 SM, tam bir AD103'te 80, tam bir AD104'te 60 SM vardır. Bu yüzden AD102 en üst seviye GPU'lara, AD104 ise RTX 4070 Ti gibi daha küçük ve daha verimli kartlara girer. Nvidia tek bir tasarımı farklı boyutlara ve yeteneklere ölçekler.

## Farklı Mimariler, Farklı İşler

Her mimari aynı tür iş için yapılmaz. Ada Lovelace ile Hopper'ı karşılaştır:

- Ada çoğunlukla oyun, masaüstü ve yaratıcı işler gibi tüketici GPU'ları içindir; L40S gibi birkaç sunucu kartı da vardır.  
- Hopper veri merkezleri, yapay zekâ (AI, artificial intelligence) eğitimi ve büyük ölçekli hesaplama içindir.  

Yani fark yalnızca performansta değil, amaçtadır. Bazı mimariler grafik ve etkileşimli işleri hedefler, bazıları ise çok büyük paralel hesaplamayı. Normal PC'lerde Hopper tabanlı GPU görmemenin nedeni budur.

> [!NOTE]
> Blackwell iki dünyayı da kapsar ama farklı çiplerle. B200 veri merkezi GPU'su ve RTX 5090 ikisi de Blackwell'dir, yine de farklı çipler kullanırlar ve CUDA'ya (Compute Unified Device Architecture) farklı CC (Compute Capability, hesaplama yeteneği) numaraları bildirirler: B200 için 10.0, RTX 5090 için 12.0.

## Görsel Bir İpucu

Veri merkezi GPU'ları genelde çok sade görünür, görünür bir fanları yoktur. Sunucuların içinde dururlar; soğutma hava akışından, kabinlerden ve sistemin tamamından gelir.

Tüketici GPU'larının büyük soğutma sistemleri ve birkaç fanı vardır. Normal bir PC (Personal Computer, kişisel bilgisayar) kasasında çalıştıkları için kendi ısılarıyla kendileri başa çıkmak zorundadır.

Bir kartın görünüşü yararlı bir ipucudur, katı bir kural değil.

## Aynı Çip Farklı Davranabilir

Bir çip tek bir amaç demek değildir. Aynı çip farklı biçimlerde karşına çıkabilir. Bir üretici:

- bazı çekirdekleri kapatabilir  
- güç sınırlarını değiştirebilir  
- saat hızını ayarlayabilir  

Yani aynı çipe sahip iki GPU aynı davranmayabilir. AD102 gerçek bir örnek:

- RTX 4090: 144 SM'den 128'i açık, 450 W güç sınırı, 24 GB GDDR6X bellek.  
- L40S: 144 SM'den 142'si açık, 350 W güç sınırı, 48 GB GDDR6 bellek.  

RTX 4090'da 144 − 128 = 16 SM kapalıdır, bu da çipin 16 / 144 ≈ %11'i eder. Birkaç SM'si arızalı çipler, o SM'ler kapatılarak bu şekilde yine satılabilir.

## Kart Üreticisi Ortaklar

Nvidia her son GPU'yu kendisi üretmez. ASUS, MSI ya da Gigabyte gibi şirketler aynı çipi alıp kendi sürümlerini yapar. Şunları değiştirirler:

- soğutma tasarımı  
- güç yapılandırması  
- boost davranışı  

Temel çip aynı, sonuç biraz farklı.

<arch-family></arch-family>

## Resmin Tamamı

Mimari bir temel tasarımdır. Farklı kullanımlar için ölçeklenmiş birkaç çip içerir. Üreticiler de üstüne kendi değişikliklerini ekler. Yani bir GPU şunlardan oluşur:

- bir mimari  
- belirli bir çip  
- üreticiye özgü bir uygulama  

> [!TIP]
> Herhangi bir GPU'yu çözmek için şu üç soruyu sırayla sor: hangi mimari, hangi çip, hangi kart. RTX 5090 için cevap Blackwell, GB202 ve Nvidia'nın ya da kart üreticisi ortaklarından birinin yaptığı bir kart.

## Bu Neden Önemli

Bu bilgi GPU adlarını okumayı kolaylaştırır. İki GPU'nun neden farklı davrandığını ve bir GPU'nun nereye oturduğunu görmeni sağlar. Bunu bilmeden CUDA'da derinleştikçe performansı ve donanım davranışını yanlış anlamak çok kolaydır.

## Sözlük

- mimari (architecture): bir çip ailesinin paylaştığı temel tasarım.
- ön ek (prefix): çip adının ilk harfleri, örneğin AD ya da GB; çipi mimarisine bağlar.
- GPU (Graphics Processing Unit): bir çipin etrafına kurulmuş, belleği, güç parçaları ve soğutmasıyla birlikte ürünün tamamı.
- Ada Lovelace: 2022'den kalma, çoğunlukla tüketici GPU'larında kullanılan, AD102 gibi çiplere sahip bir Nvidia mimarisi.
- AD102: Ada Lovelace'in 144 SM'li en büyük çipi; GeForce RTX 4090'da ve L40S'te kullanılır.
- AD104: Ada Lovelace'in 60 SM'li daha küçük çiplerinden biri; RTX 4070 Ti gibi kartlarda kullanılır.
- Blackwell: Nvidia'nın güncel mimarisi; veri merkezi çipleri (B200) ve tüketici çipleri (RTX 5090'daki GB202) vardır.
- GB202: en büyük tüketici Blackwell çipi; RTX 5090'da kullanılır.
- SM (Streaming Multiprocessor): Nvidia GPU'sunun çekirdekleri barındıran yapı taşı; çip büyüklüğü SM sayısıyla ölçülür.
- Hopper: veri merkezleri, yapay zekâ eğitimi ve büyük ölçekli hesaplama için bir Nvidia mimarisi; H100 bunu kullanır.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitimi çoğunlukla dev matris hesabıdır, bu da GPU'lara çok uygundur.
- veri merkezi (data center): GPU'ların, sistemin tamamının hava akışıyla soğutulduğu, sunucularla dolu bina.
- performans (performance): bir GPU'nun gerçek işi ne kadar hızlı bitirdiği; sadece mimariye değil, çipe, saat hızına, güce ve soğutmaya da bağlıdır.
- CC (Compute Capability): bir GPU'nun CUDA'ya bildirdiği sürüm numarası, örneğin Ada Lovelace için 8.9, RTX 5090 için 12.0.
- soğutma (cooling): GPU'nun ürettiği ısıyı kartın kendi fanlarıyla ya da sunucunun hava akışıyla uzaklaştırmak.
- hava akışı (airflow): sunucunun kendi fanlarıyla içinden geçirdiği hava; içerideki fansız GPU'ları soğutur.
- kabin (rack): veri merkezinde çok sayıda sunucuyu üst üste tutan uzun bir çerçeve.
- PC (Personal Computer) kasası: masaüstü bilgisayarın parçalarını tutan kutu; tüketici GPU'su içinde kendini soğutmak zorundadır.
- çekirdek (core): çip üzerindeki bir hesaplama birimi; üretici bazılarını kapatabilir, örneğin birkaç çekirdeği arızalı çipleri de satabilmek için.
- güç sınırı (power limit): bir GPU'nun en fazla kaç watt çekebileceği; sınır düştükçe ısı azalır ama hız da düşer.
- saat hızı (clock speed): üreticinin ayarlayabildiği bir değer; bu yüzden aynı çipe sahip GPU'lar farklı davranabilir.
- kart üreticisi ortak (board partner): Nvidia çipinden kendi GPU'sunu yapan ASUS, MSI ya da Gigabyte gibi bir şirket.
- boost (boost clock): güç ve sıcaklık izin verdiği sürece GPU'nun kendiliğinden çıktığı daha yüksek saat hızı.
- üreticiye özgü (vendor-specific implementation): bir üreticinin, bir çipin etrafına kurduğu kendi GPU sürümü.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform; aynı CUDA kodu yeni mimarilerin hepsinin çiplerinde çalışır.
