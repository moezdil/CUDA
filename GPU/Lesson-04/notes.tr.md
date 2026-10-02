# 04 > NVIDIA GPU Mimarileri

Fermi, Ampere, Hopper, Blackwell ve Rubin, NVIDIA GPU mimarilerinin adlarıdır. Bu derste 2010'dan 2028 yol haritasına kadar hepsini sırayla geziyorsun ve GPU'ların grafikten genel hesaplamaya, oradan da büyük ölçekli yapay zekâya nasıl geçtiğini görüyorsun. Güncel CUDA sürümünün bunlardan hangilerini hâlâ desteklediğini de öğreneceksin.

## Mimariler Neden Önemli

Fermi, Ampere ve Hopper gibi adlar birer etiketten fazlasıdır. Amaç onları ezberlemek değil. Amaç GPU'ların zaman içinde nasıl değiştiğini anlamak.

## "Mimari" Ne Demek

GPU mimarisi, GPU'nun planıdır. Çipin içindeki her şeyin nasıl kurulacağını belirler.

Yalnızca çekirdekleri kapsamaz. Şunları da belirler:

- verinin nasıl aktığı  
- belleğe nasıl erişildiği  
- hangi tür işlemlerin hızlı olduğu  
- GPU'nun neye göre optimize edildiği  

Yeni bir mimari genelde küçük bir yükseltme değildir. Çoğu zaman tasarım önceliklerinde bir kaymadır.

## Erken Modern Dönem

Zaman çizelgesini bir hikâye gibi okumak işini kolaylaştırır. Erken modern GPU'lar genel hesaplamaya ve grafiğe odaklanıyordu.

Bu mimariler performansı ve verimliliği adım adım artırdı:

- Fermi (2010)  
- Kepler (2012)  
- Maxwell (2014)  
- Pascal (2016)  

Bu dönemdeki hedef, GPU'ları genel iş yüklerinde daha hızlı ve daha verimli yapmaktı.

## Yapay Zekâ Merkeze Geçiyor

Volta (2017, V100) net bir dönüm noktasıdır. NVIDIA, Volta ile yapay zekâya özel donanımı öne çıkarmaya başladı: ilk Tensor Core'lar, yani her SM'nin içinde küçük matrisleri tek adımda çarpan birimler.

Ondan sonra:

- Turing (2018, RTX 20 serisi) Tensor Core'ları ve ışın izleme birimlerini tüketici kartlarına getirdi  
- Ampere (2020, A100 ve RTX 30 serisi) bu fikri daha da büyüttü  
- Ada Lovelace (2022, RTX 40 serisi ve L40S) bu birimleri Hopper'la aynı yıl tüketici ve iş istasyonu kartlarına getirdi  
- Hopper (2022, H100) yapay zekâ iş yükleri, özellikle transformer'lar için yoğun biçimde optimize edildi ve FP8 hesabını getirdi  

Buradan sonra GPU'lar artık yalnızca grafik donanımı değildi. Tam birer hesaplama platformuna dönüştüler.

## Yakın Dönem Mimarileri

### Blackwell (2024 ile 2025 arası)

Blackwell 2024'te duyuruldu ve büyük ölçekli yapay zekâ iş yükleri etrafında tasarlandı. B200 veri merkezi GPU'su iki çipi tek pakette birleştirir ve 8 TB/s'ye kadar bant genişliği veren HBM3e kullanır. Ayrıca yapay zekâ için 4 bitlik bir sayı biçimi olan NVFP4'ü getirdi. Blackwell Ultra (B300, 2025) GPU başına belleği 288 GB'a çıkardı. Tüketici tarafında RTX 50 serisi (2025) de Blackwell kullanır.

Gerçek performans kazançları her durumda aynı değildir. Şunlara bağlıdır:

- iş yükü  
- duyarlılık  
- sistem kurulumu  

Yani "daha hızlı GPU" her zaman basit bir ifade değildir.

### Rubin (2026, Teslimatlar Başladı)

Rubin, Blackwell'den sonraki mimaridir. Tam üretimdedir ve Rubin GPU'larını NVIDIA'nın Vera CPU'suyla eşleştiren ilk Vera Rubin sistemleri Eylül 2026'da sevk edilmeye başladı; 10.7 olan compute capability değeri CUDA 13.4'te zaten destekleniyor.

Her Rubin GPU'su şunları getirir:

- daha yeni Tensor Core tasarımları  
- 288 GB'a kadar HBM4 bellek  
- 22 TB/s'ye kadar bellek bant genişliği  

Blackwell'le karşılaştır: 22 / 8 = 2,75, yani bir Rubin GPU'su saniyede neredeyse 3 kat fazla bayt taşıyabilir.

### Rubin Ultra ve Feynman (Duyuruldu)

> [!NOTE]
> Bunlar yol haritası maddeleri, satın alabileceğin ürünler değil. Rubin Ultra 2027'nin ikinci yarısı, Feynman ise 2028 için duyuruldu. Ayrıntılar hâlâ değişebilir.

Yön aynı kalıyor. Her şey daha büyük ve daha uzmanlaşmış yapay zekâ sistemlerine doğru ilerliyor.

<arch-timeline focus="Volta"></arch-timeline>

## Hesaplama Yeteneği

CUDA mimari adlarını kullanmaz. Her GPU, 8.9 gibi bir sürüm numarası olan bir CC bildirir. Ana numara genelde mimariyi izler ama her zaman bire bir değil:

- Ampere: 8.0 (A100) ve 8.6 (RTX 30 serisi)  
- Ada Lovelace: 8.9 (RTX 40 serisi, L40S)  
- Hopper: 9.0 (H100)  
- Blackwell: 10.0 (B200), 10.3 (B300) ve 12.0 (RTX 50 serisi)  
- Rubin: 10.7 (CUDA 13.4'te destekleniyor)  

Yani Ada (8.9), 8 ana numarasını Ampere'le paylaşır; Blackwell ise iki farklı ana numara kullanır.

> [!WARNING]
> Güncel CUDA 13 sürümleri (CUDA 13.4, Eylül 2026'da çıktı) yalnızca Turing (CC 7.5) ve sonrasını destekler. Maxwell, Pascal ve Volta GPU'ları için daha eski bir CUDA 12 araç seti gerekir.

## Performans Bağlama Bağlıdır

Basit sayılar kötü bir karşılaştırma ölçüsüdür. Örnekler:

- TFLOPS  
- saat hızı  

Bu sayılar hikâyenin tamamını anlatmaz. Performans şunlara bağlıdır:

- hangi tür iş yükünü çalıştırdığın  
- hangi duyarlılığı kullandığın  
- belleğin nasıl davrandığı  
- mimarinin nasıl tasarlandığı  

Bir GPU kâğıt üzerinde çok güçlü görünüp belirli bir işte kötü performans gösterebilir. Ham sayıları daha düşük başka bir GPU ise gerçek kullanımda daha iyi olabilir.

## Adlandırma da Değişti

V100'e kadarki veri merkezi GPU'ları, Tesla V100 gibi "Tesla" markasını taşıyordu. 2020'deki A100'den itibaren NVIDIA bu markayı bıraktı ve onlara Data Center GPU diyor.

Bu, odağın genel hesaplamadan yapay zekâya ve bulut sistemlerine kaydığını gösterir.

## Mimariler Tasarım Kararlarıdır

Mimarileri sürüm olarak değil, tasarım kararları olarak görmek daha iyidir. Her mimari tek bir soruya cevap verir: Şu anda ne tür problemleri çözmek istiyoruz?

Bu bakış açısıyla GPU adları daha anlamlı hâle gelir. Performans farkları mantıklı görünür. CUDA kavramları birbirine daha kolay bağlanır.

## Özet

GPU mimarileri, hesaplamanın kendisinin nasıl değiştiğini gösterir. Yol grafikten hesaplamaya, oradan da büyük ölçekli yapay zekâya gider ve neredeyse her yıl yeni bir veri merkezi mimarisi gelir: Hopper, Blackwell, Rubin. Bu kaymayı anlamak, CUDA'da derinleşmeden önce önemli bir adımdır.

## Sözlük

- mimari (architecture): çipin içindeki her şeyin nasıl kurulacağını belirleyen GPU planı.
- GPU (Graphics Processing Unit): bu derslerin konusu olan, paralel çalışan çok sayıda küçük çekirdekten oluşan işlemci.
- Fermi: NVIDIA'nın 2010 mimarisi; genel GPU hesaplaması düşünülerek tasarlanan ilk mimari, gerçek bir L1/L2 önbellek hiyerarşisi getirdi.
- Ampere: NVIDIA'nın 2020 mimarisi (A100, RTX 30 serisi); yapay zekâ için Tensor Core'ları büyüttü.
- Hopper: NVIDIA'nın yapay zekâ için tasarladığı 2022 mimarisi (H100); 8 bitlik sayılarla çalışabilen bir Transformer Engine'i vardır.
- çekirdek (core): aritmetik yapan birim; çekirdek sayısı mimarinin sadece bir parçasıdır.
- verimli (efficient): harcadığı her watt güç başına çok iş çıkaran.
- Kepler / Maxwell / Pascal: NVIDIA'nın 2012, 2014 ve 2016 mimarileri; GPU'ları adım adım daha hızlı ve daha az güç harcayan hâle getirdiler.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir model eğitmek ya da bir oyunu çizmek.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitimi büyük ölçüde dev matris hesaplarıdır, bu da GPU'lara çok uyar.
- Volta: NVIDIA'nın yapay zekâya özel donanımı öne çıkarmaya başladığı 2017 mimarisi (V100); ilk Tensor Core'lar onunla geldi.
- Turing: Tensor Core'ları ve ışın izleme birimlerini tüketici GPU'larına getiren 2018 mimarisi (RTX 20 serisi); CC 7.5.
- Ada Lovelace: 2022'nin tüketici ve iş istasyonu mimarisi (RTX 40 serisi, L40S); CC 8.9.
- transformer: modern dil modellerinin arkasındaki sinir ağı tasarımı; büyük ölçüde dev matris çarpımlarından oluşur.
- FP8 / NVFP4: yapay zekâ için 8 bitlik ve 4 bitlik sayı biçimleri; FP8'i Hopper, NVFP4'ü Blackwell getirdi.
- Blackwell: büyük ölçekli yapay zekâ iş yükleri etrafında tasarlanmış 2024 ile 2025 arası mimari (B200, B300, RTX 50 serisi).
- Blackwell Ultra: Blackwell'in 2025 yükseltmesi (B300); GPU başına 288 GB HBM3e.
- bant genişliği (bandwidth): bellek ile çip arasında saniyede kaç bayt taşınabildiği.
- duyarlılık (precision): her sayının kaç bit kullandığı, örneğin FP32, FP16 ya da FP8; bit azaldıkça hesap hızlanır ama hassasiyet düşer.
- Rubin: Blackwell'den sonraki mimari; tam üretimde ve 2026'nın ikinci yarısında bulut sağlayıcılarına teslim ediliyor.
- CPU (Central Processing Unit, merkezi işlem birimi): bir bilgisayarın ana işlemcisi; Vera, NVIDIA'nın Rubin GPU'larıyla eşleştirdiği kendi CPU'sudur.
- Tensor Core: her SM'nin içinde küçük matris çarpımlarını tek adımda yapan birim; yapay zekâ hızının kalbi.
- HBM3e / HBM4 (High Bandwidth Memory): çipin hemen yanına istiflenmiş bellek; Blackwell HBM3e, Rubin HBM4 kullanır.
- SM (Streaming Multiprocessor): NVIDIA GPU'sunun yapı taşı; çekirdekleri, Tensor Core'ları ve paylaşımlı belleği içinde barındırır.
- bulut (cloud): bir sağlayıcının veri merkezlerinden internet üzerinden kiralanan bilgisayarlar.
- Rubin Ultra / Feynman: Rubin'den sonra gelecek, 2027 ve 2028 için duyurulmuş mimariler.
- CC (Compute Capability): bir GPU'nun CUDA'ya bildirdiği sürüm numarası, örneğin Ada Lovelace için 8.9, B200 için 10.0.
- TFLOPS (trillions of floating-point operations per second): tek başına hikâyenin tamamını anlatmayan basit bir performans sayısı.
- saat hızı (clock speed): tek başına kötü bir karşılaştırma sağlayan başka bir basit sayı.
- Tesla: NVIDIA veri merkezi GPU'larının V100'e kadar kullanılan eski markası; A100'den itibaren bırakıldı.
- Data Center GPU: NVIDIA'nın sunucu GPU'ları için bugünkü adı, örneğin A100, H100 ve Blackwell ürünleri.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform; CUDA 13, Turing ve sonrasındaki tüm mimarileri destekler.
