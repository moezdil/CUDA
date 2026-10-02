# Mimari ve Nesil

Bu ders, GPU mimarisi ile GPU nesli arasındaki farkı anlatıyor. İki terim birbirine benziyor ama farklı şeyler anlatıyor.

## GPU ve CUDA

GPU (Graphics Processing Unit, grafik işlem birimi), aynı anda çok sayıda işlem çalıştırmak için üretilmiş bir işlemcidir. İlk olarak grafik için yapıldı. Bugün yapay zekâ, simülasyonlar, veri işleme ve büyük ölçekli hesaplamalar için de kullanılıyor.

CUDA, Nvidia'nın GPU programlama yoludur. GPU'yu sadece grafik için değil, genel hesaplama için kullanmanı sağlar.

## Mimari

Mimari, GPU çipinin iç tasarımıdır. Sadece çekirdekleri değil, şunları da belirler:

- çekirdeklerin nasıl düzenlendiğini  
- verinin nasıl aktığını  
- belleğe nasıl erişildiğini  
- paralel işin nasıl yürütüldüğünü  

Bunu motor tasarımı gibi düşün. İki GPU dışarıdan birbirine benzeyebilir ama mimarileri yüzünden çok farklı davranabilir.

Mimari şunları doğrudan etkiler:

- performans  
- verimlilik  
- desteklenen özellikler  

Her yeni mimari genelde küçük bir yükseltme değil, gerçek bir değişimdir. Bazı mimariler ham performansı artırdı. Bazıları verimliliğe odaklandı. Yenileri ise yapay zekâya ve büyük ölçekli iş yüklerine odaklanıyor. Ray tracing ve yapay zekâ hızlandırma gibi özellikler mimari seviyesinde gelir.

Nvidia yaklaşık her bir ya da iki yılda bir yeni mimari çıkarır. GPU'ların bu kadar hızlı gelişmesinin ana nedenlerinden biri budur.

## Nesil

Nesil, GPU'nun nasıl üretildiğiyle ilgili değildir. GPU'nun nerede kullanıldığıyla ilgilidir.

Nvidia GPU'ları iki ana dünyaya hizmet eder. Birincisi günlük kullanıcılardır:

- oyun  
- içerik üretimi  
- genel grafik  

İkincisi ise:

- bulut sistemleri  
- veri merkezleri  
- yapay zekâ eğitimi  
- bilimsel hesaplama  

Bu ikinci dünyaya HPC, yani High Performance Computing (yüksek performanslı hesaplama) denir.

## Ürün Adları

Nvidia, GPU'nun kullanıldığı yere göre farklı adlar kullanır:

- Tegra, mobil ve gömülü sistemler içindir.  
- GeForce, tüketici GPU'ları içindir.  
- RTX, profesyonel iş yükleri içindir.  
- Data Center GPU'lar sunucular içindir. Bugün A100, H100 ve daha yeni modelleri görüyoruz.  

> [!NOTE]
> İki eski ada hâlâ rastlayabilirsin. Quadro, profesyonel GPU'ların eski markasıydı ve yerini RTX aldı. Veri merkezi GPU'ları geçmişte "Tesla" adını kullanıyordu, ama bu ad artık büyük ölçüde kullanılmıyor.

Bu, genel hesaplamadan yapay zekâya ve bulut altyapısına doğru bir kaymayı gösteriyor.

## Mimari ve Nesil Birbirinden Bağımsızdır

Mimari, GPU'nun nasıl üretildiğini anlatır. Nesil, nerede kullanıldığını anlatır. Bu yüzden aynı mimari çok farklı ürünlerde karşına çıkabilir.

Örneğin RTX 3090 da A100 de Ampere tabanlıdır. RTX 3090 kişisel kullanım içindir. A100 büyük ölçekli hesaplama içindir. Aynı mimariyi paylaşırlar ama farklı amaçlara hizmet ederler.

<arch-matrix></arch-matrix>

## GPU Kategorileri

GPU'lar farklı ortamlar için üretilir:

- küçük, taşınabilir sistemler  
- kişisel bilgisayarlar  
- profesyonel iş yükleri  
- büyük veri merkezleri  

Her ortamın farklı ihtiyaçları, sınırları ve öncelikleri vardır. Nvidia aynı mimariyi hepsine uyacak şekilde uyarlar.

## Basit Bir Kural

- GPU nasıl üretilmiş? → mimari  
- GPU nerede kullanılıyor? → nesil  

## Bu Neden Önemli

Bu kural GPU adlarını okumayı kolaylaştırır. Ayrıca yaygın bir hatayı da önler: iki GPU'yu sırf aynı mimariyi paylaşıyorlar diye benzer sanmak. CUDA ile GPU programlamaya başladığında bu farklar çok önemli hâle gelir.

## Sözlük

- GPU: aynı anda çok sayıda işlem çalıştırmak için üretilmiş bir işlemci.
- CUDA: Nvidia'nın GPU'ları sadece grafik için değil, genel hesaplama için programlama yolu.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi büyük ölçüde dev matris hesaplarıdır, GPU'ların bu alanda bu kadar önemli olmasının nedeni de budur.
- mimari (architecture): GPU çipinin iç tasarımı, bir motorun tasarımı gibi.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- ray tracing: 3D sahneleri ışık ışınlarının sekişini takip ederek çizme yöntemi, gerçekçi gölge ve yansımalar verir; RTX GPU'larda bunun için özel donanım vardır.
- nesil (generation): bir GPU'nun nerede kullanıldığı, örneğin oyun ya da veri merkezleri.
- veri merkezleri (data centers): çoğu zaman binlerce GPU barındıran, bulut servislerini ve yapay zekâ eğitimini çalıştıran, sunucularla dolu binalar.
- HPC: High Performance Computing (yüksek performanslı hesaplama), yani bulut sistemleri, veri merkezleri, yapay zekâ eğitimi ve bilimsel hesaplama.
- Tegra: Nvidia'nın mobil ve gömülü sistemlerdeki GPU'lar için kullandığı ürün adı.
- gömülü sistem (embedded system): bir cihazın içine yerleştirilmiş küçük bilgisayar, örneğin bir robotta, arabada ya da drone'da.
- GeForce: Nvidia'nın oyun ve kişisel bilgisayarlar için tüketici GPU markası.
- RTX: Nvidia'nın ray tracing donanımı olan GPU'lara verdiği ad, hem GeForce kartlarında (RTX 3090) hem profesyonel kartlarda kullanılır.
- Data Center GPU: sunucular için üretilen bir Nvidia GPU'su, örneğin A100 ya da H100.
- Ampere: hem RTX 3090'da hem A100'de kullanılan bir Nvidia mimarisi.
- A100: Nvidia'nın 2020'de çıkardığı, Ampere tabanlı, yapay zekâ eğitimi ve HPC için üretilmiş veri merkezi GPU'su.
