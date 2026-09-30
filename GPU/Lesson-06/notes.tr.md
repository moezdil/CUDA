# Nvidia GPU Mimarileri

Bu ders, Fermi, Ampere ve Hopper gibi Nvidia GPU mimari adlarının ne anlama geldiğini anlatıyor. GPU'ların nasıl geliştiğini ve bugün neden böyle göründüklerini gösteriyor.

## Mimariler Neden Önemli

Fermi, Ampere ve Hopper gibi adlar birer etiketten fazlasıdır. Amaç bunları ezberlemek değil. Amaç, GPU'ların zaman içinde nasıl değiştiğini anlamak.

## "Mimari" Ne Demek

GPU mimarisi, GPU'nun planıdır. Çipin içindeki her şeyin nasıl kurulacağını belirler.

Çekirdeklerden fazlasını kapsar. Şunları da belirler:

- verinin nasıl aktığını  
- belleğe nasıl erişildiğini  
- hangi tür işlemlerin hızlı olduğunu  
- GPU'nun neye göre optimize edildiğini  

Yeni bir mimari genelde küçük bir yükseltme değildir. Çoğu zaman tasarım önceliklerinde bir değişimdir.

## Erken Modern Dönem

Zaman çizelgesini bir hikâye gibi okumak işine yarar. Erken modern GPU'lar genel hesaplamaya ve grafiğe odaklanıyordu.

Bu mimariler performansı ve verimliliği adım adım geliştirdi:

- Fermi  
- Kepler  
- Maxwell  
- Pascal  

Bu dönemde amaç, GPU'ları genel iş yükleri için daha hızlı ve daha verimli yapmaktı.

## Yapay Zekâ Merkeze Geçiyor

Volta açık bir değişimi işaret eder. Nvidia, Volta ile birlikte yapay zekâya özel donanımı öne çıkarmaya başladı.

Ondan sonra:

- Ampere bu fikri daha da büyüttü  
- Hopper yapay zekâ iş yükleri için (özellikle transformer'lar) yoğun şekilde optimize edildi  

Buradan itibaren GPU'lar artık sadece grafik donanımı değildi. Tam birer hesaplama platformu oldular.

## Yeni Mimariler

### Blackwell (2024–2025)

Blackwell, büyük ölçekli yapay zekâ iş yükleri etrafında tasarlandı. Daha fazla hesaplama gücü, daha fazla bant genişliği ve daha fazla yoğunluk getiriyor.

Gerçek performans kazançları her durumda aynı değil. Şunlara bağlılar:

- iş yüküne  
- duyarlılığa (precision)  
- sistem kurulumuna  

Yani "daha hızlı GPU" her zaman basit bir ifade değildir.

### Rubin (2026, Şu An Kullanıma Giriyor)

Rubin ölçeklemenin ötesine geçiyor. Yapay zekâ sistemlerini daha da ileri taşıyor.

Şimdiye kadar bilinenlere göre Rubin şunları getiriyor:

- daha yeni Tensor Core tasarımları  
- HBM4 bellek desteği  
- çok yüksek SM sayıları  
- daha yüksek genel hesaplama yoğunluğu  

Rubin sadece bir kavram değil. Şimdiden gerçek sistemlere ve bulut ortamlarına giriyor.

### Rubin Ultra ve Sonrası

> [!NOTE]
> Nvidia'nın yol haritası devam ediyor. Rubin Ultra'nın işleri daha da ileri götürmesi bekleniyor. Ondan sonra yol haritasında Feynman var.

Yön aynı kalıyor. Her şey daha büyük ve daha uzmanlaşmış yapay zekâ sistemlerine doğru gidiyor.

<arch-timeline focus="Volta"></arch-timeline>

## Performans Bağlama Bağlıdır

Basit sayılar kötü bir karşılaştırma sağlar. Örnekler:

- TFLOPS  
- saat hızı  

Bu sayılar hikâyenin tamamını anlatmaz. Performans şunlara bağlıdır:

- ne tür bir iş yükü çalıştırdığına  
- hangi duyarlılığı kullandığına  
- belleğin nasıl davrandığına  
- mimarinin nasıl tasarlandığına  

Bir GPU kâğıt üzerinde çok güçlü görünüp belirli bir işte kötü performans gösterebilir. Ham sayıları daha düşük başka bir GPU gerçek kullanımda daha iyi olabilir.

## Adlandırma da Değişti

> [!NOTE]
> Eski veri merkezi GPU'larına çoğu zaman "Tesla" etiketi verilirdi. Yenilerine Data Center GPU deniyor.

Bu, odağın genel hesaplamadan yapay zekâya ve bulut sistemlerine kaydığını gösteriyor.

## Mimariler Tasarım Kararlarıdır

Mimarileri sürüm olarak değil, tasarım kararları olarak görmek daha doğru. Her mimari tek bir soruya cevap verir: Şimdi ne tür problemleri çözmek istiyoruz?

Bu bakışla GPU adları daha anlamlı gelir. Performans farkları mantıklı hâle gelir. CUDA kavramları birbirine daha kolay bağlanır.

## Özet

GPU mimarileri, hesaplamanın kendisinin nasıl değiştiğini gösteriyor. Yol grafikten hesaplamaya, oradan da büyük ölçekli yapay zekâya gidiyor. Bu değişimi anlamak, CUDA'da derine inmeden önce önemli bir adım.

## Sözlük

- mimari (architecture): çipin içindeki her şeyin nasıl kurulacağını belirleyen GPU planı.
- Volta: Nvidia'nın yapay zekâya özel donanımı öne çıkarmaya başladığı mimari.
- Blackwell: büyük ölçekli yapay zekâ iş yükleri etrafında tasarlanmış, 2024 ile 2025 arasına ait bir mimari.
- Rubin: daha yeni Tensor Core tasarımlarıyla, şu an gerçek sistemlere giren 2026 mimarisi.
- HBM4: Rubin'in desteklediği bir bellek türü.
- TFLOPS: hikâyenin tamamını anlatmayan basit bir performans sayısı.
- saat hızı (clock speed): tek başına kötü bir karşılaştırma sağlayan başka bir basit sayı.
- Tesla: Nvidia veri merkezi GPU'larının eski etiketi, bunlara artık Data Center GPU deniyor.
