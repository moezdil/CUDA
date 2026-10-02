# GPU Özelliklerini Okumak

Bu derste bir GPU'nun neslini ve mimarisini nasıl bulacağını göreceksin. Örnek olarak RTX 3090 ve A100'ü kullanacağız.

## GPU Özelliklerini Bulmak

En kolay yol bir Google araması, örneğin:

"A100 GPU TechPowerUp"

TechPowerUp, birçok üreticinin ayrıntılı GPU özelliklerini bir araya getiren bir web sitesi ve GPU ayrıntılarına bakmanın en kolay yollarından biri. Diğer GPU'ları da aynı şekilde arayabilirsin:

"RTX 3090 TechPowerUp"

Bütün özellikleri görmek için sayfayı aç.

## Basit Bir Karşılaştırma

İki GPU'yu karşılaştıralım:

- RTX 3090  
- A100  

Önce çip adına bak, örneğin A100 → GA100.

> [!NOTE]
> Çip tasarımına sonraki bir derste geleceğiz. Şimdilik adını okumak yeterli.

Sonra çekirdek sayısına bak:

- A100 → yaklaşık 7.000 çekirdek  
- RTX 3090 → 10.000'den fazla çekirdek  

Bu, RTX 3090'ın her zaman daha güçlü olduğu anlamına gelmez, çünkü bu sayı her türden çekirdeği kapsamaz.

## Çekirdek Sayıları

"6.912 çekirdek" (A100) gibi bir sayı genelde sadece tek duyarlıklı (single-precision) çekirdekleri sayar. Bu çekirdekler standart kayan noktalı sayı hesaplarını yapar. GPU'daki bütün çekirdekler bu sayıya dahil değildir.

Modern GPU'larda başka türde çekirdekler de vardır, örneğin:

- tam sayı işlemleri için çekirdekler  
- çift duyarlıklı (double-precision) işlemler için çekirdekler  
- yapay zekâ için özel çekirdekler (tensor core'lar)

Yani bir GPU'yu yalnızca bu sayıya bakarak değerlendirme.

## Nesil ve Mimari

### RTX 3090

- Nesil → GeForce  
- Mimari → Ampere  

GeForce GPU'lar günlük kullanıcılar için, şu cihazlarda kullanılmak üzere tasarlanır:

- masaüstü bilgisayarlar  
- dizüstü bilgisayarlar  
- iş istasyonları  

Ana kullanım alanları:

- oyun  
- içerik üretimi  
- genel GPU işleri  

### A100

- Nesil → (eskiden Tesla, şimdi Data Center GPU'lar)  
- Mimari → Ampere  

Bu GPU'lar şunlar için tasarlanır:

- sunucular  
- veri merkezleri  
- süper bilgisayarlar  

## Ana Fikir

- RTX 3090 ve A100 AYNI mimariyi kullanır (Ampere)  
- ama tamamen farklı kullanım alanları için tasarlanmıştır  

Aynı mimari ≠ aynı amaç.

Hatırlatma:
- Mimari → teknik tasarım
- Nesil → kullanım kategorisi

<gpu-compare></gpu-compare>

## Görünüşten Ayırt Etmek

Çoğu zaman farkı sadece karta bakarak anlayabilirsin.

### Data Center GPU'lar (A100, V100, P100)

- genelde dahili fan YOK  
- kompakt, fansız tasarım

Güçlü harici soğutması olan veri merkezlerinde çalışırlar; soğutmayı GPU değil, sunucu üstlenir.

### GeForce GPU'lar (RTX serisi)

- dahili fanları var  
- tek başına çalışan sistemler için tasarlanmış  

Şuralarda çalışırlar:

- masaüstü PC'ler  
- kişisel iş istasyonları  

Bu sistemler soğutmayı kendileri sağlamak zorundadır, o yüzden kartın fanı olmalıdır.

## Özet

- Data Center GPU'lar → fan yok  
- GeForce GPU'lar → dahili fan  

Farklı ortamların soğutma ihtiyaçları da farklıdır. Bunu bilmek şunlarda işine yarar:

- GPU özelliklerini okumak  
- doğru donanımı seçmek  
- yaygın acemi hatalarından kaçınmak  

CUDA'da derinleştikçe bu daha da önemli hâle gelir.

## Sözlük

- özellikler (specs): bir GPU'nun yayımlanmış teknik değerleri, örneğin çekirdek sayısı, bellek boyutu ve saat hızı.
- TechPowerUp: birçok üreticinin ayrıntılı GPU özelliklerini bir araya getiren bir web sitesi.
- RTX 3090: 2020'de çıkan, 10.496 çekirdekli ve 24 GB bellekli, Ampere tabanlı bir GeForce GPU'su.
- A100: Nvidia'nın 2020'de çıkardığı, 6.912 tek duyarlıklı çekirdeğe sahip, Ampere tabanlı veri merkezi GPU'su.
- çip adı (chip name): GPU'nun içindeki çipin adı, örneğin A100 için GA100.
- çekirdek sayısı (core count): özelliklerde yazan çekirdek sayısı; her türden çekirdeği kapsamaz.
- tek duyarlıklı (single-precision): standart kayan noktalı sayı hesapları yapan çekirdekler; çekirdek sayısında genelde sadece bunlar yer alır.
- kayan noktalı sayı (floating-point): 3,14 gibi ondalıklı sayılar; tek duyarlık bir sayıyı 32 bitte, çift duyarlık 64 bitte saklar.
- çift duyarlıklı (double-precision): bilimsel işlerde kullanılan 64 bitlik kayan noktalı sayı hesapları; A100 bu konuda RTX 3090'dan çok daha hızlıdır.
- tensor core'lar: modern GPU'larda yapay zekâ için tasarlanmış özel çekirdekler.
- mimari (architecture): bir GPU'nun teknik tasarımı.
- nesil (generation): bir GPU'nun kullanım kategorisi, örneğin GeForce ya da Data Center GPU'lar.
- Ampere: RTX 3090 ile A100'ün paylaştığı mimari.
- GeForce: Nvidia'nın masaüstü, dizüstü bilgisayarlar ve iş istasyonları için dahili fanlı tüketici GPU'ları.
- iş istasyonları (workstations): 3D tasarım ya da mühendislik gibi profesyonel işler için güçlü masaüstü bilgisayarlar.
- Tesla: Nvidia'nın veri merkezi GPU'larının eski adı; artık Data Center GPU deniyor.
- Data Center GPU: sunucular için tasarlanmış bir Nvidia GPU'su, örneğin A100; genelde kendi fanı yoktur.
- veri merkezleri (data centers): güçlü fanlar ve klimalarla soğutulan, sunucularla dolu binalar.
- süper bilgisayar (supercomputer): dev problemler üzerinde tek bir makine gibi birlikte çalışan binlerce bağlı sunucu.
- V100 / P100: Volta (2017) ve Pascal (2016) tabanlı, daha eski Nvidia veri merkezi GPU'ları.
- fansız (fanless): sadece soğutucusu olan, fanı olmayan kart; havayı onun içinden sunucunun kendi fanları geçirir.
- soğutma (cooling): GPU'nun ürettiği ısıyı uzaklaştırmak; GeForce kartı kendi fanlarını kullanır, veri merkezi kartı sunucuya güvenir.
