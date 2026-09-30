# GPU ve GPU Çipi

Bu ders, GPU çipi ile GPU arasındaki farkı anlatıyor. İkisi birbiriyle ilişkili ama aynı şey değil.

## GPU Çipi

GPU çipi, tüm hesaplamanın yapıldığı asıl silikondur. Üzerinde soğutma, konnektör ya da harici bellek modülü yoktur.

Çipin içinde şunları bulursun:

- paralel iş yapan hesaplama birimleri  
- verinin nasıl taşınacağını yöneten denetleyiciler  
- her şeyi koordine eden iç mantık  

Çip, asıl "motor"dur.

## Çip Adları

Çip adları bir çipi mimarisine bağlar. Örneğin:

- GF100 → Fermi  
- GA100 → Ampere  

Ön ek mimariyi gösterir.

> [!NOTE]
> Bu adlandırma düzeni 2026 civarındaki modern GPU'larda da geçerli.

## GPU

GPU, senin kullandığın ürünün tamamıdır. Çipin etrafına kurulmuş eksiksiz bir sistemdir. Şunları içerir:

- çipin kendisi  
- VRAM (çipe bağlı bellek)  
- güç dağıtım bileşenleri  
- çıkış arayüzleri (HDMI ya da DisplayPort gibi)  
- bir soğutma sistemi  

Yani GPU, çip artı onu kullanılabilir yapan her şeydir.

## Tüketici GPU'ları

GeForce GPU'lar normal ortamlar için üretilir:

- masaüstü bilgisayarlar  
- dizüstü bilgisayarlar  
- kişisel iş istasyonları  

Bu sistemlerde özel bir soğutma yoktur. GPU kendi ısısıyla kendisi başa çıkmalıdır. Bu yüzden çoğu tüketici GPU'sunda şunlar vardır:

- büyük soğutucular (heatsink)  
- birden fazla fan  
- gözle görülen soğutma tasarımları  

Kendi kendine yeten cihazlardır ve sıradan bir PC kasasının içinde çalışmak zorundadırlar.

## Data Center GPU'lar

A100, Ampere tabanlıdır ve çipi GA100'dür. Ama GPU'nun bütünü bir GeForce kartından çok farklı görünür. Fanı yoktur.

Veri merkezi GPU'ları sunucu kabinlerinin (server rack) içinde durur. Burada soğutma GPU'nun dışında yapılır:

- hava akışı sistemden gelir  
- soğutma kabin seviyesinde yapılır  

Bu, GPU'yu daha basit, daha kompakt ve ölçeklemeye daha uygun hâle getirir.

<chip-vs-gpu></chip-vs-gpu>

## Çipi İnternetten Kontrol Etmek

> [!TIP]
> TechPowerUp gibi özellik siteleri bunu netleştirir. "A100 TechPowerUp" diye ara, çip adını göreceksin → GA100. O bağlantıya tıklarsan çipin kendisini görürsün, soğutması ve ekstraları olmadan.

## Kısaca Fark

GPU çipi beyindir. GPU ise sistemin tamamıdır.

çip = motor  
GPU = eksiksiz makine  

## Bu Neden Önemli

- mimari ürünün tamamını değil, çipi anlatır  
- performans çip seviyesinde başlar  
- gerçek dünyadaki davranış GPU sisteminin tamamına bağlıdır  

Bunları karıştırırsan şunları yanlış anlayabilirsin:

- özellikleri  
- performans karşılaştırmalarını  
- hatta CUDA'nın davranışını  

Bu da ileri CUDA konularını takip etmeyi kolaylaştırır.

## Sözlük

- GPU çipi (GPU chip): tüm hesaplamanın yapıldığı asıl silikon, soğutması ya da konnektörü yoktur.
- GPU: çipin etrafına kurulmuş ürünün tamamı, belleği, güç parçaları, çıkışları ve soğutmasıyla birlikte.
- VRAM: GPU çipine bağlı bellek.
- çip adı ön eki (chip name prefix): çip adının ilk harfleri, mimariyi gösterir, örneğin Ampere için GA.
- Fermi: çiplerinin adı GF100 gibi olan bir Nvidia mimarisi.
- çıkış arayüzleri (output interfaces): GPU üzerindeki HDMI ya da DisplayPort gibi portlar.
- soğutucu (heatsink): tüketici GPU'larının kendi ısılarıyla başa çıkmak için kullandığı soğutma parçası.
- sunucu kabini (server rack): veri merkezi GPU'larının durduğu yer, soğutma GPU'da değil kabin seviyesinde yapılır.
