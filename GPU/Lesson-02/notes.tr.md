# 02 > Mimari, Nesil ve Çipler

"GPU" derken insanlar birkaç farklı şeyi kastediyor: bir tasarımı, bir ürün ailesini, bir silikon parçasını ve makineye taktığın kartı. Bu derste bunları mimari, nesil, çip ve GPU olarak birbirinden ayırıyorsun. Farkı bir kez gördüğünde herhangi bir NVIDIA ürün adını, özellik tablosunu ya da veri merkezi parçasını okuyup içinde gerçekte ne olduğunu anlarsın. Bunların hepsi CUDA için önemli; CUDA, NVIDIA'nın GPU'ları sadece grafik için değil genel hesaplama için de programlama yoludur.

## Mimari

Mimari, GPU çipinin iç tasarımıdır. Sadece çekirdekleri değil, şunları da belirler:

- çekirdeklerin nasıl düzenlendiğini  
- verinin nasıl aktığını  
- belleğe nasıl erişildiğini  
- paralel işin nasıl çalıştırıldığını  

Bunu bir motorun tasarımı gibi düşün. İki GPU dışarıdan birbirine benzeyebilir ama mimarileri yüzünden çok farklı davranabilir. Mimari; performans, verimlilik ve desteklenen özellikler üzerinde doğrudan etkilidir. Ray tracing ve yapay zekâ hızlandırma gibi özellikler mimari düzeyinde gelir.

NVIDIA eskiden aşağı yukarı iki yılda bir yeni mimari çıkarırdı. Veri merkezi GPU'larında artık yaklaşık yılda bir: Blackwell (2024), Blackwell Ultra (2025) ve Rubin (2026'nın ikinci yarısından beri teslim ediliyor); Rubin Ultra (2027) ve Feynman (2028) ise duyuruldu. [Ders 04](../Lesson-04/notes.md) hepsini tek tek anlatıyor.

## Nesil

Bu derslerde nesil, GPU'nun nasıl yapıldığıyla ilgili değildir. GPU'nun nerede kullanıldığıyla ilgilidir.

> [!NOTE]
> Bu derslerin dışında insanlar "nesil" kelimesini çoğu zaman mimari için de kullanır, örneğin "Blackwell nesli". Burada ise bir GPU'nun ait olduğu ürün ailesi kastediliyor, örneğin GeForce ya da Data Center.

NVIDIA GPU'ları iki ana dünyaya hizmet eder. Birincisi günlük kullanıcılar: oyun, içerik üretimi ve genel grafik. İkincisi bulut sistemleri, veri merkezleri, yapay zekâ eğitimi ve bilimsel hesaplama. Bu ikinci dünyaya HPC denir.

## Ürün Adları

NVIDIA, GPU'nun nerede kullanıldığına göre farklı adlar kullanır:

- Jetson robotlar ve gömülü sistemler içindir. Çiplerine Tegra denir; en yeni modül Jetson AGX Thor (2025) Blackwell kullanır.  
- GeForce tüketici GPU'ları içindir. Güncel kartlar GeForce RTX 50 serisi, örneğin RTX 5090.  
- RTX PRO profesyonel iş istasyonları içindir, örneğin RTX PRO 6000 Blackwell (2025).  
- Data Center GPU'lar sunucular içindir: A100 (Ampere), L40S (Ada Lovelace), H100 ve H200 (Hopper), B200 ve B300 (Blackwell) ve artık Rubin.  

Eski adları hâlâ görebilirsin. Quadro, profesyonel GPU'ların eski markasıydı; önce "NVIDIA RTX" (RTX A6000, RTX 6000 Ada), 2025'te de "RTX PRO" oldu. Veri merkezi GPU'ları V100 ve T4'e kadar "Tesla" adıyla satıldı; A100 bu adı bıraktı.

## Mimari ve Nesil Birbirinden Bağımsızdır

Mimari, GPU'nun nasıl yapıldığını anlatır. Nesil, nerede kullanıldığını anlatır. Bu yüzden aynı mimari çok farklı ürünlerde karşına çıkabilir. Kişisel kullanım için RTX 3090 ve büyük ölçekli hesaplama için A100, ikisi de Ampere'dir. Bugün de RTX 5090, RTX PRO 6000, B200 ve Jetson AGX Thor'un hepsi Blackwell.

<arch-matrix></arch-matrix>

Aynı mimari, aynı CC anlamına bile gelmez; CC, CUDA'nın bir çipin özelliklerine verdiği sürüm numarasıdır. A100 CC 8.0, RTX 3090 CC 8.6; ikisi de Ampere. B200 CC 10.0, RTX 5090 CC 12.0; ikisi de Blackwell, çünkü farklı çipler kullanırlar. [Ders 05](../Lesson-05/notes.md) CC'yi derinlemesine anlatıyor.

> [!TIP]
> Bir GPU'nun hangi CUDA özelliklerini desteklediğine ürün adı değil, CC karar verir. CUDA kodu derlerken de hedef olarak bir CC seçersin.

Her mimari iki dünyayı birden kapsamaz. Ada Lovelace çoğunlukla tüketici GPU'ları içindir; L40S gibi birkaç sunucu kartı da vardır. Hopper yalnızca veri merkezleri ve yapay zekâ eğitimi içindir; normal PC'lerde Hopper GPU görmemenin nedeni budur. Fark yalnızca performansta değil, amaçtadır.

## GPU Çipi

GPU çipi, bütün hesaplamanın yapıldığı asıl silikondur. Tek başına ne soğutması ne konnektörü ne de harici bellek modülü vardır. İçinde paralel iş yapan hesaplama birimleri, verinin nasıl taşınacağını yöneten denetleyiciler ve her şeyi koordine eden iç mantık bulunur.

Asıl "motor" çiptir. Örneğin A100'ün içindeki GA100 çipi, yaklaşık 54 milyar transistörlü tek bir silikon parçasıdır.

## Çip Adları

NVIDIA'nın çip adları, çipi mimarisine bağlar. İlk harf GPU'yu gösteren G'dir, sonraki bir iki harf mimariyi, sayı ise çipin o ailedeki yerini gösterir:

- GF100 → Fermi  
- GA100 → Ampere  
- AD102 → Ada Lovelace (RTX 4090, L40S)  
- GB202 → Blackwell (RTX 5090)  

GB202'yi şöyle oku: G GPU'yu, B Blackwell'i, 202 ise Blackwell ailesinden bir çipi gösterir. Yani herhangi bir özelliğe bakmadan önce ön ek sana mimariyi söyler.

> [!WARNING]
> Bu harfleri taşıyan her ad tek bir GPU çipi değildir. GB200 bir "süper çip"tir: tek kart üzerinde bir Grace CPU ve iki Blackwell GPU. GH200 aynı fikrin Hopper'lı hâlidir. Bir ad tuhaf görünüyorsa, gerçekte ne olduğuna bak.

## GPU

GPU, kullandığın ürünün tamamıdır; çipin etrafına kurulmuş eksiksiz bir sistemdir. Şunları içerir:

- çipin kendisi  
- VRAM, yani GPU'nun çipin hemen yanındaki kendi belleği  
- güç dağıtım bileşenleri  
- HDMI ya da DisplayPort gibi çıkış arayüzleri  
- bir soğutma sistemi  

GeForce kartları özel soğutması olmayan normal bir PC kasasında durur; bu yüzden kendi ısılarıyla kendileri başa çıkmak zorundadır ve bu ısı küçük değildir: RTX 5090 en fazla 575 W için derecelendirilmiştir. Büyük soğutucular ve birkaç fan taşımalarının nedeni budur.

A100 ya da L40S gibi veri merkezi GPU'larının kendi fanı yoktur. Bir sunucu kabininde dururlar; hava akışı sunucunun fanlarından gelir ve soğutma kabin seviyesinde yapılır. 72 Blackwell GPU'lu GB200 NVL72 gibi en yeni kabinler sıvı soğutma kullanır. Bu da GPU'yu daha basit, daha kompakt ve ölçeklemeye daha uygun hâle getirir.

<chip-vs-gpu></chip-vs-gpu>

TechPowerUp gibi özellik siteleri bu ayrımı görünür kılar: A100'ün sayfası çipinin adını, GA100'ü verir ve çıplak çipin kendi sayfasına bağlantı verir. Kısacası çip = motor, GPU = eksiksiz makine.

## Bir Mimari, Birçok Çip

Bir mimari tek bir çip değildir. Aynı temel tasarımı paylaşan bir çip ailesidir. Ada Lovelace (2022) AD102, AD103 ve AD104'ü içerir; "AD" ön eki, daha hiçbir özelliğe bakmadan onları birbirine bağlar. Blackwell tüketici çipleri "GB" ile başlar: RTX 5090'da GB202, RTX 5080'de GB203, RTX 5070'te GB205.

Bir çipin büyüklüğü, çekirdekleri barındıran yapı taşları olan SM'lerle sayılır (bkz. [Ders 00](../Lesson-00/notes.md)). Tam bir AD102'de 144 SM, tam bir AD103'te 80, tam bir AD104'te 60 SM vardır. Bu yüzden AD102 en üst seviye GPU'lara, AD104 ise RTX 4070 Ti gibi daha küçük ve daha verimli kartlara girer.

## Aynı Çip, Farklı GPU'lar

Aynı çip birbirinden çok farklı GPU'lara girebilir. Bir üretici bazı çekirdekleri kapatabilir, güç sınırlarını değiştirebilir ve saat hızını ayarlayabilir. AD102 gerçek bir örnek:

- RTX 4090: fanlı ve HDMI'lı bir GeForce kartı, 144 SM'den 128'i açık, 450 W güç sınırı, 24 GB GDDR6X bellek.  
- L40S: fansız bir veri merkezi kartı, 144 SM'den 142'si açık, 350 W güç sınırı, 48 GB GDDR6 bellek.  

RTX 4090'da 144 − 128 = 16 SM kapalıdır, bu da çipin 16 / 144 ≈ %11'i eder. L40S'te yalnızca 144 − 142 = 2 SM kapalıdır. Her Ada SM'sinde 128 FP32 çekirdek vardır; yani L40S'te 142 × 128 = 18,176, RTX 4090'da 128 × 128 = 16,384 tane bulunur. Birkaç SM'si arızalı çipler, o SM'ler kapatılarak bu şekilde yine satılabilir.

NVIDIA her son GPU'yu kendisi de üretmez. ASUS, MSI ya da Gigabyte gibi kart üreticisi ortaklar aynı çipi alıp soğutma tasarımını, güç yapılandırmasını ve boost davranışını değiştirir. Temel çip aynı, sonuç biraz farklı.

<arch-family></arch-family>

## Resmin Tamamı

Bir GPU bir mimariden, belirli bir çipten ve üreticiye özgü bir uygulamadan oluşur; ayrıca nerede kullanıldığını söyleyen bir nesle aittir.

> [!TIP]
> Herhangi bir GPU'yu çözmek için dört soru sor: hangi mimari, hangi çip, hangi kart, hangi nesil. Bu sitede kullanılan L40S için cevap Ada Lovelace, 142 SM'si açık bir AD102, fansız bir NVIDIA kartı ve Data Center. RTX 5090 için Blackwell, GB202, NVIDIA'nın ya da bir kart üreticisi ortağın yaptığı bir kart ve GeForce.

## Bu Neden Önemli

Mimari ürünün tamamını değil, çipi tanımlar. Performans çipte başlar ama gerçek davranış kaç SM'nin açık olduğuna, güç sınırına, saat hızına ve soğutmaya bağlıdır. Aynı mimariye, hatta aynı çipe sahip iki GPU birbirinden çok uzak olabilir. CUDA çipi CC'si ve SM sayısı üzerinden görür; [Ders 03](../Lesson-03/notes.md) özellik tablolarını bu yüzden önce çipten başlayarak okur.

## Sözlük

- GPU (Graphics Processing Unit): çipin etrafına kurulmuş ürünün tamamı; belleği, güç parçaları, çıkışları ve soğutmasıyla birlikte.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan genel programlar yazmak için sunduğu platform.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi çoğunlukla dev matris hesabıdır, bu da GPU'lara çok uygundur.
- mimari (architecture): bir çip ailesinin paylaştığı iç tasarım, bir motorun tasarımı gibi.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- ray tracing: 3D sahneleri ışık ışınlarının sekişini takip ederek çizme yöntemi; RTX GPU'larda bunun için özel donanım vardır.
- Blackwell: 2024 tarihli NVIDIA mimarisi; veri merkezi çipleri (B200) ve tüketici çipleri (RTX 5090'daki GB202) vardır.
- Rubin: Blackwell'den sonraki NVIDIA veri merkezi mimarisi; 2026'nın ikinci yarısından beri teslim ediliyor.
- nesil (generation): bu derslerde bir GPU'nun nerede kullanıldığı, örneğin oyun ya da veri merkezleri.
- veri merkezi (data center): çoğu zaman binlerce GPU barındıran, bulut servislerini ve yapay zekâ eğitimini çalıştıran, sunucularla dolu bina.
- HPC (High Performance Computing): yüksek performanslı hesaplama; bulut sistemleri, veri merkezleri, yapay zekâ eğitimi ve bilimsel hesaplama.
- Jetson: NVIDIA'nın Tegra çiplerine dayanan, robotlar ve gömülü sistemler için ürün ailesi.
- Tegra: NVIDIA'nın Jetson modüllerinde CPU ile GPU'yu birleştiren çiplerine verdiği ad.
- gömülü sistem (embedded system): bir cihazın içine yerleştirilmiş küçük bilgisayar, örneğin bir robotta, arabada ya da drone'da.
- GeForce: NVIDIA'nın kendi soğutucusu ve fanları olan tüketici GPU markası.
- RTX PRO: NVIDIA'nın 2025'ten beri profesyonel iş istasyonu GPU'ları için kullandığı marka; Quadro'nun halefi.
- Quadro: NVIDIA'nın profesyonel GPU'larının eski markası; önce NVIDIA RTX, sonra RTX PRO oldu.
- Data Center GPU: sunucular için tasarlanmış bir NVIDIA GPU'su, örneğin A100, L40S, H100 ya da B200.
- Tesla: NVIDIA'nın veri merkezi GPU'larının eski adı; en son V100 ve T4'te kullanıldı.
- Ampere: 2020'den kalma, çip adları GA ile başlayan, hem RTX 3090'da hem A100'de kullanılan bir NVIDIA mimarisi.
- A100: NVIDIA'nın 2020'de çıkardığı, GA100 çipini kullanan, kendi fanı olmayan veri merkezi GPU'su.
- CC (Compute Capability): bir GPU'nun CUDA'ya bildirdiği sürüm numarası, örneğin L40S için 8.9, RTX 5090 için 12.0.
- Ada Lovelace: 2022'den kalma, çoğunlukla tüketici GPU'larında kullanılan, AD102 gibi çiplere sahip bir NVIDIA mimarisi.
- Hopper: yalnızca veri merkezleri ve yapay zekâ eğitimi için bir NVIDIA mimarisi; H100 bunu kullanır.
- GPU çipi (GPU chip): bütün hesaplamanın yapıldığı asıl silikon; soğutması ya da konnektörü yoktur.
- silikon (silicon): çiplerin yapıldığı malzeme; GA100 yaklaşık 54 milyar transistörlü tek bir silikon parçasıdır.
- ön ek (prefix): çip adının ilk harfleri, örneğin GA, AD ya da GB; çipi mimarisine bağlar.
- Fermi: 2010'dan kalma, çiplerinin adı GF100 gibi olan bir NVIDIA mimarisi.
- GA100: A100'ün içindeki çip; G, GPU'yu, A ise Ampere'i gösterir.
- AD102: Ada Lovelace'in 144 SM'li en büyük çipi; RTX 4090'da ve L40S'te kullanılır.
- AD104: Ada Lovelace'in 60 SM'li daha küçük çiplerinden biri; RTX 4070 Ti gibi kartlarda kullanılır.
- GB202: en büyük tüketici Blackwell çipi; RTX 5090'da kullanılır.
- süper çip (superchip): bir CPU ile GPU'ları tek kartta birleştiren ürün, örneğin GB200 (bir Grace CPU ve iki Blackwell GPU).
- CPU (Central Processing Unit): bilgisayarın ana işlemcisi; Grace, NVIDIA'nın kendi veri merkezi CPU'sudur.
- VRAM (GPU belleği): GPU'nun çipin hemen yanındaki kendi belleği; L40S'te 48 GB VRAM var.
- güç dağıtım bileşenleri (power delivery): karttaki, güç kaynağından gelen elektriği çipin ihtiyaç duyduğu sabit gerilimlere çeviren parçalar.
- çıkış arayüzleri (output interfaces): GPU üzerindeki HDMI ya da DisplayPort gibi portlar.
- HDMI (High-Definition Multimedia Interface): görüntüyü ve sesi monitöre ya da televizyona gönderen yaygın port.
- soğutma (cooling): çipin ürettiği ısıyı uzaklaştırmak; karttaki fanlarla, sunucudan gelen hava akışıyla ya da sıvıyla.
- soğutucu (heatsink): tüketici GPU'larının kendi ısılarından kurtulmak için kullandığı metal kanatçıklı blok.
- PC (Personal Computer) kasası: masaüstü bilgisayarın parçalarını tutan kutu; tüketici GPU'su içinde kendini soğutmak zorundadır.
- sunucu kabini (server rack): veri merkezinde çok sayıda sunucuyu tutan uzun bir çerçeve; soğutma kabin seviyesinde yapılır.
- hava akışı (airflow): sunucunun kendi fanlarıyla içinden geçirdiği hava; içerideki fansız GPU'ları soğutur.
- sıvı soğutma (liquid cooling): çiplerin üstündeki plakalardan sıvı geçirerek soğutma; GB200 NVL72 gibi yoğun kabinlerde kullanılır.
- TechPowerUp: GPU özelliklerini listeleyen ve her GPU'yu kullandığı çipe bağlayan bir web sitesi.
- SM (Streaming Multiprocessor): NVIDIA GPU'sunun çekirdekleri barındıran yapı taşı; çip büyüklüğü SM sayısıyla ölçülür.
- FP32 (32-bit floating point): 32 bitte saklanan ondalıklı sayı; özellik tabloları FP32 çekirdeklerini CUDA çekirdeği diye sayar.
- çekirdek (core): çip üzerindeki bir hesaplama birimi; üretici bazılarını kapatabilir, örneğin birkaç çekirdeği arızalı çipleri de satabilmek için.
- güç sınırı (power limit): bir GPU'nun en fazla kaç watt çekebileceği; sınır düştükçe ısı azalır ama hız da düşer.
- saat hızı (clock speed): çipin saniyede kaç döngü çalıştığı; üreticinin ayarlayabildiği bir değer.
- kart üreticisi ortak (board partner): NVIDIA çipinden kendi GPU'sunu yapan ASUS, MSI ya da Gigabyte gibi bir şirket.
- boost (boost clock): güç ve sıcaklık izin verdiği sürece GPU'nun kendiliğinden çıktığı daha yüksek saat hızı.
- üreticiye özgü (vendor-specific implementation): bir üreticinin, bir çipin etrafına kurduğu kendi GPU sürümü.
