# 04 > GPU ve GPU Çipi

"GPU" (Graphics Processing Unit, grafik işlem birimi) derken insanlar iki farklı şeyi kastediyor: hesabı yapan silikon parçasını ve makineye taktığın kartın ya da modülün tamamını. Bu derste ikisini birbirinden ayırıyorsun. Farkı bir kez gördüğünde özellik tabloları, çip adları ve veri merkezi donanımı çok daha kolay okunur.

## GPU Çipi

GPU çipi, bütün hesaplamanın yapıldığı asıl silikondur. Tek başına ne soğutması ne konnektörü ne de harici bellek modülü vardır.

Çipin içinde şunlar bulunur:

- paralel iş yapan hesaplama birimleri  
- verinin nasıl taşınacağını yöneten denetleyiciler  
- her şeyi koordine eden iç mantık  

Asıl "motor" çiptir. Örneğin A100'ün içindeki GA100 çipi, yaklaşık 54 milyar transistörlü tek bir silikon parçasıdır.

## Çip Adları

Nvidia'nın çip adları, çipi mimarisine bağlar. İlk harf G'dir (GPU için), sonraki bir iki harf mimariyi, sayı ise çipin o ailedeki yerini gösterir:

- GF100 → Fermi  
- GA100 → Ampere  
- AD102 → Ada Lovelace (RTX 4090, L40S)  
- GB202 → Blackwell (RTX 5090)  

GB202'yi şöyle oku: G (GPU) + B (Blackwell) + 202 (Blackwell ailesinden bir çip). Yani herhangi bir özelliğe bakmadan önce ön ek sana mimariyi söyler.

> [!WARNING]
> Bu harfleri taşıyan her ad tek bir GPU çipi değildir. GB200 bir "süper çip"tir: tek kart üzerinde bir Grace CPU (Central Processing Unit, merkezi işlem birimi) ve iki Blackwell GPU. GH200 aynı fikrin Hopper'lı hâlidir. Bir ad tuhaf görünüyorsa, gerçekte ne olduğuna bak.

## GPU

GPU, kullandığın ürünün tamamıdır; çipin etrafına kurulmuş eksiksiz bir sistemdir. Şunları içerir:

- çipin kendisi  
- VRAM, yani GPU'nun çipin hemen yanındaki kendi belleği  
- güç dağıtım bileşenleri  
- çıkış arayüzleri (HDMI (High-Definition Multimedia Interface) ya da DisplayPort gibi)  
- bir soğutma sistemi  

Yani GPU, çip artı onu kullanılabilir yapan her şeydir.

## Tüketici GPU'ları

RTX 40 ve RTX 50 serisi gibi GeForce GPU'ları sıradan ortamlar için yapılır:

- masaüstü bilgisayarlar  
- dizüstü bilgisayarlar  
- kişisel iş istasyonları  

Bu sistemlerde özel bir soğutma yoktur. GPU kendi ısısıyla kendisi başa çıkmak zorundadır ve bu ısı küçük değildir: RTX 5090 en fazla 575 W için derecelendirilmiştir. Bu yüzden çoğu tüketici GPU'sunda şunlar vardır:

- büyük soğutucular  
- birden fazla fan  
- göze çarpan soğutma tasarımları  

Kendi kendine yeten kartlardır ve sıradan bir PC (Personal Computer, kişisel bilgisayar) kasasının içinde çalışmak zorundadır.

## Veri Merkezi GPU'ları

A100, Ampere tabanlıdır ve çipi GA100'dür. Ama GPU'nun tamamı bir GeForce kartından çok farklı görünür: fanı da ekran çıkışı da yoktur.

Veri merkezi GPU'ları bir sunucu kabininin içinde durur; soğutma GPU'nun dışında halledilir:

- hava akışı sunucunun fanlarından gelir  
- soğutma kabin seviyesinde yapılır  
- 72 Blackwell GPU'lu GB200 NVL72 gibi en yeni kabinler sıvı soğutma kullanır  

Bu da GPU'yu daha basit, daha kompakt ve ölçeklemeye daha uygun hâle getirir.

<chip-vs-gpu></chip-vs-gpu>

## Çipi İnternette Kontrol Etmek

> [!TIP]
> TechPowerUp gibi özellik siteleri bunu netleştirir. "A100 TechPowerUp" diye arat, çip adını göreceksin → GA100. O bağlantıyı takip edersen çipin kendisini görürsün; soğutma yok, ekstra yok.

## Kısaca Fark

GPU çipi beyindir. GPU ise sistemin tamamıdır.

çip = motor  
GPU = eksiksiz makine  

Aynı çip birbirinden çok farklı GPU'lara bile girebilir. AD102 çipi hem fanlı ve HDMI portlu bir GeForce kartı olan RTX 4090'da, hem de fansız bir veri merkezi kartı olan L40S'te bulunur.

## Bu Neden Önemli

- mimari ürünün tamamını değil, çipi tanımlar  
- performans çip seviyesinde başlar  
- gerçek dünyadaki davranış GPU sisteminin tamamına bağlıdır  

Bunları karıştırırsan şunları yanlış anlayabilirsin:

- özellikler  
- performans karşılaştırmaları  
- hatta CUDA (Compute Unified Device Architecture) davranışı  

Bu ayrım, daha derin CUDA konularını takip etmeyi kolaylaştırır.

## Sözlük

- GPU çipi (GPU chip): bütün hesaplamanın yapıldığı asıl silikon; soğutması ya da konnektörü yoktur.
- silikon (silicon): çiplerin yapıldığı malzeme; GA100 yaklaşık 54 milyar transistörlü tek bir silikon parçasıdır.
- mimari (architecture): çipin tasarımı, yani birimlerinin, bellek yollarının ve denetleyicilerinin nasıl düzenlendiği.
- ön ek (chip name prefix): çip adının ilk harfleri; mimariyi gösterir, örneğin Ampere için GA, Blackwell için GB.
- Fermi: 2010'dan kalma, çiplerinin adı GF100 gibi olan bir Nvidia mimarisi.
- Ampere: 2020'den kalma, çip adları GA ile başlayan bir Nvidia mimarisi, örneğin A100'deki GA100.
- GA100: A100'ün içindeki çip; G, GPU'yu, A ise Ampere'i gösterir.
- AD102: en büyük Ada Lovelace çipi; RTX 4090'da ve L40S'te kullanılır.
- GB202: en büyük tüketici Blackwell çipi; RTX 5090'da kullanılır.
- süper çip (superchip): bir CPU ile GPU'ları tek kartta birleştiren ürün, örneğin GB200 (bir Grace CPU ve iki Blackwell GPU).
- GPU (Graphics Processing Unit): çipin etrafına kurulmuş ürünün tamamı; belleği, güç parçaları, çıkışları ve soğutmasıyla birlikte.
- VRAM: GPU'nun çipin hemen yanındaki kendi belleği; RTX 5090'da 32 GB VRAM var.
- güç dağıtım bileşenleri (power delivery): karttaki, güç kaynağından gelen elektriği çipin ihtiyaç duyduğu sabit gerilimlere çeviren parçalar.
- çıkış arayüzleri (output interfaces): GPU üzerindeki HDMI ya da DisplayPort gibi portlar.
- soğutma (cooling): çipin ürettiği ısıyı uzaklaştırmak; karttaki fanlarla, sunucudan gelen hava akışıyla ya da sıvıyla.
- GeForce: Nvidia'nın RTX 5090 gibi, kendi soğutucusu ve fanları olan tüketici GPU'ları.
- soğutucu (heatsink): tüketici GPU'larının kendi ısılarıyla başa çıkmak için kullandığı soğutma parçası.
- PC (Personal Computer) kasası: masaüstü bilgisayarın parçalarını tutan kutu; tüketici GPU'su içinde kendini soğutmak zorundadır.
- A100: GA100 çipini kullanan, kendi fanı olmayan bir Nvidia veri merkezi GPU'su.
- sunucu kabini (server rack): veri merkezi GPU'larının durduğu yer; soğutma GPU'da değil, kabin seviyesinde yapılır.
- hava akışı (airflow): sunucunun kendi fanlarıyla içinden geçirdiği hava; içerideki fansız GPU'ları soğutur.
- sıvı soğutma (liquid cooling): çiplerin üstündeki plakalardan sıvı geçirerek soğutma; GB200 NVL72 gibi yoğun kabinlerde kullanılır.
- özellik (spec): bir GPU'nun yayımlanan teknik değeri, örneğin çip adı, çekirdek sayısı ya da bellek boyutu.
- TechPowerUp: GPU özelliklerini listeleyen ve her GPU'yu kullandığı çipe bağlayan bir web sitesi.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform.
