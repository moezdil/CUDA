# Mimari ve Nesil

Bu derste GPU mimarisi ile GPU nesli arasındaki farkı göreceksin. İki terim birbirine benziyor ama farklı şeyleri anlatıyor.

## GPU ve CUDA

GPU (Graphics Processing Unit, grafik işlem birimi), aynı anda çok sayıda işlem çalıştırmak için tasarlanmış bir işlemcidir. İlk olarak grafik için yapıldı. Bugün yapay zekâda, simülasyonlarda, veri işlemede ve büyük ölçekli hesaplamalarda da kullanılıyor.

CUDA, Nvidia'nın GPU'ları programlama yoludur. GPU'yu sadece grafik için değil, genel hesaplama için de kullanmanı sağlar.

## Mimari

Mimari, GPU çipinin iç tasarımıdır. Sadece çekirdekleri değil, şunları da belirler:

- çekirdeklerin nasıl düzenlendiğini  
- verinin nasıl aktığını  
- belleğe nasıl erişildiğini  
- paralel işin nasıl yürütüldüğünü  

Bunu bir motorun tasarımı gibi düşün. İki GPU dışarıdan birbirine benzeyebilir, ama mimarileri farklıysa çok farklı davranabilir.

Mimari şunları doğrudan etkiler:

- performans  
- verimlilik  
- desteklenen özellikler  

Her yeni mimari genelde küçük bir yükseltme değil, gerçek bir değişimdir. Bazı mimariler ham performansı artırdı, bazıları verimliliğe odaklandı. Yenileri ise yapay zekâya ve büyük ölçekli iş yüklerine odaklanıyor. Ray tracing ve yapay zekâ hızlandırma gibi özellikler mimariyle birlikte gelir.

Nvidia aşağı yukarı bir ya da iki yılda bir yeni mimari çıkarır. GPU'ların bu kadar hızlı gelişmesinin başlıca nedenlerinden biri de budur.

## Nesil

Nesil, GPU'nun nasıl tasarlandığıyla değil, nerede kullanıldığıyla ilgilidir.

Nvidia GPU'ları iki ana dünyaya hizmet eder. Birincisi günlük kullanıcıların dünyası:

- oyun  
- içerik üretimi  
- genel grafik  

İkincisi ise şunların dünyası:

- bulut sistemleri  
- veri merkezleri  
- yapay zekâ eğitimi  
- bilimsel hesaplama  

Bu ikinci dünyaya HPC (High Performance Computing, yüksek performanslı hesaplama) denir.

## Ürün Adları

Nvidia, GPU'nun kullanıldığı yere göre farklı adlar kullanır:

- Tegra: mobil ve gömülü sistemler için.  
- GeForce: tüketici GPU'ları için.  
- RTX: profesyonel iş yükleri için.  
- Data Center GPU'lar: sunucular için. Bugün A100, H100 ve daha yeni modeller var.  

> [!NOTE]
> Eski iki ada hâlâ rastlayabilirsin. Quadro, profesyonel GPU'ların eski markasıydı; yerini RTX aldı. Veri merkezi GPU'ları da eskiden "Tesla" adını taşıyordu, ama bu ad artık neredeyse hiç kullanılmıyor.

Bu adlar, genel hesaplamadan yapay zekâya ve bulut altyapısına doğru bir kaymayı gösteriyor.

## Mimari ve Nesil Birbirinden Bağımsızdır

Mimari, GPU'nun nasıl tasarlandığını anlatır; nesil ise nerede kullanıldığını. Bu yüzden aynı mimari çok farklı ürünlerde karşına çıkabilir.

Örneğin RTX 3090 da A100 de Ampere tabanlıdır. RTX 3090 kişisel kullanım için, A100 büyük ölçekli hesaplama için yapılmıştır. Aynı mimariyi paylaşırlar ama farklı amaçlara hizmet ederler.

<arch-matrix></arch-matrix>

## GPU Kategorileri

GPU'lar farklı ortamlar için üretilir:

- küçük, taşınabilir sistemler  
- kişisel bilgisayarlar  
- profesyonel iş yükleri  
- büyük veri merkezleri  

Her ortamın ihtiyaçları, sınırları ve öncelikleri farklıdır. Nvidia aynı mimariyi hepsine uyacak şekilde uyarlar.

## Basit Bir Kural

- GPU nasıl tasarlanmış? → mimari  
- GPU nerede kullanılıyor? → nesil  

## Bu Neden Önemli

Bu kural, GPU adlarını okumayı kolaylaştırır. Ayrıca yaygın bir hatanın da önüne geçer: iki GPU'yu sırf aynı mimariyi paylaşıyorlar diye benzer sanmak. CUDA ile GPU programlamaya başladığında bu farklar çok önemli hâle gelir.

## Sözlük

- GPU: aynı anda çok sayıda işlem çalıştırmak için tasarlanmış bir işlemci.
- CUDA: Nvidia'nın, GPU'ları sadece grafik için değil genel hesaplama için de programlama yolu.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi büyük ölçüde dev matris hesaplarıdır, GPU'ların bu alanda bu kadar önemli olmasının nedeni de budur.
- mimari (architecture): GPU çipinin iç tasarımı, bir motorun tasarımı gibi.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- ray tracing: 3D sahneleri ışık ışınlarının sekişini takip ederek çizme yöntemi; gerçekçi gölgeler ve yansımalar verir. RTX GPU'larda bunun için özel donanım vardır.
- nesil (generation): bir GPU'nun nerede kullanıldığı, örneğin oyun ya da veri merkezleri.
- veri merkezleri (data centers): çoğu zaman binlerce GPU barındıran, bulut servislerini ve yapay zekâ eğitimini çalıştıran, sunucularla dolu binalar.
- HPC (High Performance Computing): yüksek performanslı hesaplama; bulut sistemleri, veri merkezleri, yapay zekâ eğitimi ve bilimsel hesaplama.
- Tegra: Nvidia'nın mobil ve gömülü sistemlerdeki GPU'lar için kullandığı ürün adı.
- gömülü sistem (embedded system): bir cihazın içine yerleştirilmiş küçük bilgisayar, örneğin bir robotta, arabada ya da drone'da.
- GeForce: Nvidia'nın oyun ve kişisel bilgisayarlar için tüketici GPU markası.
- RTX: Nvidia'nın ray tracing donanımı olan GPU'lara verdiği ad; hem GeForce kartlarında (RTX 3090) hem profesyonel kartlarda kullanılır.
- Data Center GPU: sunucular için tasarlanmış bir Nvidia GPU'su, örneğin A100 ya da H100.
- Ampere: hem RTX 3090'da hem A100'de kullanılan bir Nvidia mimarisi.
- A100: Nvidia'nın 2020'de çıkardığı, Ampere tabanlı, yapay zekâ eğitimi ve HPC için tasarlanmış veri merkezi GPU'su.
