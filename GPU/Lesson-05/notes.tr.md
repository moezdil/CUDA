# Mimariler ve Çipler

Bu ders, bir mimarinin GPU'ların içindeki gerçek çiplerle nasıl ilişkili olduğunu anlatıyor. Bir mimari tek bir çip değildir. Aynı temel tasarımı paylaşan bir çip ailesidir.

## Tek Mimari, Çok Çip

Ada Lovelace mimarisini ele al. Bu mimaride şu gibi farklı çipler var:

- AD102  
- AD103  
- AD104  

"AD" ön eki hepsini aynı mimariye bağlar. Hiçbir özelliğe bakmadan bunların aynı aileden olduğunu anlarsın.

## Aynı Tasarım, Farklı Ölçek

Aynı mimariden gelen çipler farklı şekillerde kullanılır. Bazıları üst seviye GPU'lar içindir. Bazıları orta seviye ya da daha küçük sistemler içindir.

Örneğin AD102 genelde en üst seviye GPU'lara girer. AD104 ise daha çok küçük ve daha verimli kartlarda kullanılır. Yani Nvidia tek bir tasarımı farklı boyutlara ve yeteneklere göre ölçekler.

## Farklı Mimariler, Farklı İşler

Her mimari aynı tür iş için üretilmez. Ada Lovelace ile Hopper'ı karşılaştır:

- Ada çoğunlukla oyun, masaüstü ve yaratıcı işler gibi tüketici GPU'ları içindir.  
- Hopper veri merkezleri, yapay zekâ eğitimi ve büyük ölçekli hesaplama içindir.  

Yani fark sadece performansla değil, amaçla ilgili. Bazı mimariler grafiği ve etkileşimli işleri hedefler. Bazıları devasa paralel hesaplamayı hedefler. Bu yüzden normal PC'lerde Hopper tabanlı GPU görmezsin.

## Görsel Bir İpucu

> [!NOTE]
> Kartın görünüşü faydalı bir ipucudur, kesin bir kural değildir.

Veri merkezi GPU'ları çoğu zaman çok sade görünür, üzerlerinde görünür bir fan yoktur. Sunucuların içinde dururlar. Soğutma hava akışından, kabinlerden ve tüm sistemden gelir.

Tüketici GPU'larında büyük soğutma sistemleri ve birkaç fan vardır. Normal bir PC kasasının içinde çalışırlar, bu yüzden kendi ısılarıyla kendileri başa çıkmak zorundadırlar.

## Tek Çip Farklı Davranabilir

Tek çip, tek amaç demek değildir. Aynı çip farklı biçimlerde karşına çıkabilir. Bir üretici şunları yapabilir:

- bazı çekirdekleri devre dışı bırakmak  
- güç sınırlarını değiştirmek  
- saat hızlarını ayarlamak  

Yani aynı çipe sahip iki GPU aynı şekilde davranmayabilir.

## Kart Üreticisi Ortaklar

Nvidia son GPU'ların hepsini kendisi üretmez. ASUS, MSI ya da Gigabyte gibi şirketler aynı çipi alır ve kendi sürümlerini yapar. Şunları değiştirirler:

- soğutma tasarımı  
- güç yapılandırması  
- boost davranışı  

Temel çip aynı, sonuç biraz farklı.

<arch-family></arch-family>

## Resmin Tamamı

Mimari bir temel tasarımdır. İçinde farklı kullanımlar için ölçeklenmiş birkaç çip vardır. Üreticiler de buna kendi farklılıklarını ekler. Yani bir GPU şunlardan oluşur:

- bir mimari  
- belirli bir çip  
- üreticiye özgü bir uygulama  

## Bu Neden Önemli

Bu, GPU adlarını okumayı kolaylaştırır. İki GPU'nun neden farklı davrandığını ve bir GPU'nun nereye oturduğunu görmene yardım eder. Bu bilgi olmadan, CUDA'da derine indiğinde performansı ve donanımın davranışını yanlış anlamak kolaydır.

## Sözlük

- mimari (architecture): bir çip ailesinin paylaştığı temel tasarım.
- ön ek (prefix): çip adının ilk harfleri, örneğin AD, çipi mimarisine bağlar.
- Ada Lovelace: çoğunlukla tüketici GPU'ları için olan, AD102 gibi çipleri olan bir Nvidia mimarisi.
- Hopper: veri merkezleri, yapay zekâ eğitimi ve büyük ölçekli hesaplama için bir Nvidia mimarisi.
- saat hızı (clock speed): üreticinin ayarlayabildiği bir değer, bu yüzden aynı çipe sahip GPU'lar farklı davranabilir.
- kart üreticisi ortak (board partner): Nvidia çipinden kendi GPU'sunu yapan ASUS, MSI ya da Gigabyte gibi bir şirket.
- üreticiye özgü uygulama (vendor-specific implementation): bir üreticinin, bir çipin etrafına kurduğu kendi GPU sürümü.
