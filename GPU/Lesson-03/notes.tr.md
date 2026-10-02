# 03 > GPU Özelliklerini Okumak

Bu ders bir GPU'nun neslini ve mimarisini nasıl bulacağını ve özelliklerini (specs) nasıl okuyacağını gösteriyor. Örnek olarak 2020 çıkışlı iki Ampere GPU'su olan RTX 3090 ile A100'ü kullanıyor. Aynı adımlar bugünün Blackwell kartları dahil her GPU için işe yarar.

## GPU Özelliklerini Bulmak

En kolay yol bir web araması. Örneğin:

"A100 GPU TechPowerUp"

TechPowerUp, birçok üreticinin ayrıntılı GPU özelliklerini toplayan bir GPU veritabanı tutar. GPU ayrıntılarına bakmak için en kolay yerlerden biridir. Başka GPU'ları da aynı şekilde arayabilirsin:

"RTX 3090 TechPowerUp"

Sayfayı açınca bütün özellikleri görürsün.

> [!TIP]
> CUDA'nın önem verdiği sayı olan CC (compute capability, hesaplama yeteneği) için NVIDIA'nın kendi listesine bak: developer.nvidia.com/cuda-gpus. NVIDIA GPU'lu bir makinede `nvidia-smi --query-gpu=name,compute_cap --format=csv` içindeki her GPU'nun adını ve CC'sini yazdırır.

## Basit Bir Karşılaştırma

İki GPU'yu karşılaştıralım:

- RTX 3090  
- A100  

Önce çip adına bak. Örneğin A100 → GA100, RTX 3090 → GA102. "GA", Ampere demek.

> [!NOTE]
> Çip tasarımı ileriki bir derste geliyor. Şimdilik sadece adı oku.

Sonra çekirdek sayısına bak:

- A100 → 6.912 çekirdek  
- RTX 3090 → 10.496 çekirdek  

Bu, RTX 3090'ın her zaman daha güçlü olduğu anlamına gelmez, çünkü çekirdek sayısı her türden çekirdeği göstermez.

## Çekirdek Sayıları

"6.912 çekirdek" (A100) gibi bir sayı genelde sadece tek duyarlıklı çekirdekleri sayar; NVIDIA bunlara CUDA çekirdeği der. Bu çekirdekler standart kayan noktalı sayı hesaplarını yapar. Sayı, GPU'daki bütün çekirdekleri kapsamaz.

Bu sayı basitçe SM (Streaming Multiprocessor) sayısı çarpı SM başına çekirdek sayısıdır. A100'de her birinde 64 çekirdek olan 108 SM vardır: 108 * 64 = 6.912. RTX 3090'da her birinde 128 çekirdek olan 82 SM vardır: 82 * 128 = 10.496. Yani RTX 3090'ın SM'si daha az ama her SM'si iki kat fazla çekirdek sayıyor.

Modern GPU'larda başka türden çekirdekler de vardır, örneğin:

- tam sayı işlemleri için çekirdekler  
- çift duyarlıklı işlemler için çekirdekler  
- yapay zekâ (AI, artificial intelligence) için tensor core'lar denen özel çekirdekler  

Burada A100 açıkça kazanır. Çift duyarlıkta 9,7 TFLOPS (saniyede trilyon kayan noktalı işlem) yapar, RTX 3090 ise yaklaşık 0,56 TFLOPS; yani A100 9,7 / 0,56 = yaklaşık 17 kat hızlıdır. Bellek de farklı: A100'de 1.555 GB/s hızında 40 GB HBM2 (High Bandwidth Memory, yüksek bant genişlikli bellek), RTX 3090'da 936 GB/s hızında 24 GB GDDR6X var.

Yani bir GPU'yu sadece bu sayıya bakarak değerlendirme.

## Nesil ve Mimari

### RTX 3090

- Nesil → GeForce  
- Mimari → Ampere  

GeForce GPU'ları günlük kullanıcılar için şuralarda kullanılmak üzere yapılır:

- masaüstü bilgisayarlar  
- dizüstü bilgisayarlar  
- iş istasyonları  

Ana kullanım alanları:

- oyun  
- içerik üretimi  
- genel GPU işleri  

### A100

- Nesil → Data Center GPU (bir zamanlar Tesla denen ürün ailesi)  
- Mimari → Ampere  

Bu GPU'lar şunlar için yapılır:

- sunucular  
- veri merkezleri  
- süper bilgisayarlar  

## Ana Fikir

- RTX 3090 ve A100 AYNI mimariyi (Ampere) kullanır  
- ama tamamen farklı kullanım alanları için yapılmışlardır  

Aynı mimari ≠ aynı amaç.

Hatırlatma:
- Mimari → teknik tasarım
- Nesil → kullanım kategorisi

<gpu-compare></gpu-compare>

## Görünüşten Ayırt Etmek

Çoğu durumda farkı sadece karta bakarak anlayabilirsin.

### Data Center GPU'lar (A100, V100, P100)

- genelde kendi fanı YOK  
- kompakt, fansız tasarım

Güçlü dış soğutması olan veri merkezlerinde çalışırlar. Soğutmayı GPU değil, sunucu yapar.

> [!NOTE]
> Birçok veri merkezi GPU'su takılabilir bir kart bile değildir. A100, H100 ve B200 çoğunlukla sunucu kartına düz monte edilen SXM modülleri olarak gelir; yeni kabinlerde sıklıkla sıvı soğutma kullanılır.

### GeForce GPU'lar (RTX serisi)

- dahili fanları var  
- bağımsız sistemler için tasarlanmış  

Şuralarda çalışırlar:

- masaüstü PC'ler  
- kişisel iş istasyonları  

Bu sistemlerin kendi soğutmasına ihtiyacı vardır, bu yüzden kartın fanı olması gerekir.

## Özet

- Data Center GPU'lar → fan yok  
- GeForce GPU'lar → dahili fan  

Farklı ortamların farklı soğutma ihtiyaçları vardır. Bunu bilmek şunlarda işine yarar:

- GPU özelliklerini okumak  
- doğru donanımı seçmek  
- sık yapılan başlangıç hatalarından kaçınmak  

CUDA'da derinleştikçe bu daha da önemli hâle gelir.

## Sözlük

- özellikler (specs): bir GPU'nun yayımlanmış teknik değerleri, örneğin çekirdek sayısı, bellek boyutu ve saat hızı.
- TechPowerUp: birçok üreticinin ayrıntılı GPU özelliklerini bir araya getiren GPU veritabanlı bir web sitesi.
- CC (compute capability): CUDA'nın bir GPU'nun özellik setine verdiği sürüm numarası, örneğin A100 için 8.0, RTX 3090 için 8.6.
- nvidia-smi: bir makinedeki GPU'ları ve durumlarını listeleyen NVIDIA komut satırı aracı.
- RTX 3090: 2020'de çıkan, 82 SM'li, 10.496 çekirdekli ve 24 GB GDDR6X bellekli, Ampere tabanlı bir GeForce GPU'su.
- A100: NVIDIA'nın 2020'de çıkardığı, 108 SM'li ve 6.912 tek duyarlıklı çekirdeğe sahip, Ampere tabanlı veri merkezi GPU'su.
- çip adı (chip name): GPU'nun içindeki çipin adı, örneğin A100 için GA100.
- çekirdek sayısı (core count): özelliklerde yazan çekirdek sayısı; her türden çekirdeği kapsamaz.
- tek duyarlıklı (single-precision): standart kayan noktalı sayı hesapları yapan çekirdekler; çekirdek sayısında genelde sadece bunlar yer alır.
- SM (Streaming Multiprocessor): GPU'nun içindeki bir çekirdek grubu; çekirdek sayısı = SM sayısı * SM başına çekirdek.
- kayan noktalı sayı (floating-point): 3,14 gibi ondalıklı sayılar; tek duyarlık bir sayıyı 32 bitte, çift duyarlık 64 bitte saklar.
- çift duyarlıklı (double-precision): bilimsel işlerde kullanılan 64 bitlik kayan noktalı sayı hesapları; A100 bu konuda RTX 3090'dan yaklaşık 17 kat hızlıdır.
- tensor core'lar: modern GPU'larda yapay zekâ için tasarlanmış özel çekirdekler.
- TFLOPS (teraFLOPS): saniyede bir trilyon kayan noktalı işlem.
- HBM (High Bandwidth Memory): veri merkezi GPU'larındaki üst üste yığılmış bellek; GeForce kartlarındaki GDDR bellekten daha hızlıdır.
- mimari (architecture): bir GPU'nun teknik tasarımı.
- nesil (generation): bir GPU'nun kullanım kategorisi, örneğin GeForce ya da Data Center GPU'lar.
- Ampere: RTX 3090 ile A100'ün paylaştığı mimari.
- GeForce: NVIDIA'nın masaüstü, dizüstü bilgisayarlar ve iş istasyonları için dahili fanlı tüketici GPU'ları.
- iş istasyonları (workstations): 3D tasarım ya da mühendislik gibi profesyonel işler için güçlü masaüstü bilgisayarlar.
- Tesla: NVIDIA'nın veri merkezi GPU'larının eski adı; artık Data Center GPU deniyor.
- Data Center GPU: sunucular için tasarlanmış bir NVIDIA GPU'su, örneğin A100; genelde kendi fanı yoktur.
- veri merkezleri (data centers): güçlü fanlar, klimalar ya da sıvı soğutmayla soğutulan, sunucularla dolu binalar.
- süper bilgisayar (supercomputer): dev problemler üzerinde tek bir makine gibi birlikte çalışan binlerce bağlı sunucu.
- V100 / P100: Volta (2017) ve Pascal (2016) tabanlı, daha eski NVIDIA veri merkezi GPU'ları.
- SXM: NVIDIA'nın veri merkezi GPU'ları için modül biçimi; PCIe yuvasına takılmak yerine doğrudan sunucu kartına monte edilir.
- fansız (fanless): sadece soğutucusu olan, fanı olmayan kart; havayı onun içinden sunucunun kendi fanları geçirir.
- soğutma (cooling): GPU'nun ürettiği ısıyı uzaklaştırmak; GeForce kartı kendi fanlarını kullanır, veri merkezi kartı sunucuya güvenir.
