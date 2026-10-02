# 00 > CPU ve GPU Temelleri

Bu derste GPU'nun CPU'dan nasıl ayrıldığını göreceksin. Bir GPU'nun içini açıp içindeki parçalara da bakacağız. Sonraki bütün dersler bu fikirlerin üzerine kurulur.

## Kodu GPU'ya Taşımak Yetmez

Kodu CPU yerine GPU'da çalıştırmak, onu tek başına hızlandırmaz. İyi performans ancak GPU'nun nasıl çalıştığını anladığında gelir.

## Farklı Hedefler

CPU da GPU da veri işler ve komut çalıştırır. Ama ikisi çok farklı amaçlar için tasarlanmıştır.

CPU şunlar için tasarlanır:

- hızlı yanıt  
- karmaşık mantık  
- sıralı çalışma  

GPU ise aynı anda çok sayıda iş yapmak için tasarlanır:

- CPU: tek bir karmaşık işi çok hızlı yapar  
- GPU: çok sayıda basit işi paralel yapar  

## Bellek

CPU sistem RAM'ini kullanır. Her şey aynı ortak bellekten geçer.

GPU'nun ise VRAM adı verilen kendi belleği vardır. Oyun kartları GDDR bellek, veri merkezi GPU'ları ise HBM kullanır. Bunun anlamı şu:

- CPU ile GPU veriyi kendiliğinden paylaşmaz  
- veri ikisi arasında kopyalanmak zorundadır  

Bu kopyalama darboğaza dönüşebilir. NVIDIA L40S'i ele al: kendi 48 GB'lık GDDR6 belleğini 864 GB/s hızla okur, CPU ile ise PCIe 4.0 x16 üzerinden her yönde yaklaşık 32 GB/s hızla konuşur. PCIe üzerinden 1 GB taşımak 1 / 32 = 0,031 s, yani yaklaşık 31 ms sürer. Aynı 1 GB'ı VRAM'den okumak 1 / 864 = 0,0012 s, yani yaklaşık 1,2 ms sürer. Kopyalama 864 / 32 = 27 kat daha yavaştır.

> [!WARNING]
> CPU ile GPU arasında veri kopyalamak, çoğu zaman bir GPU programının en yavaş adımıdır. Bir kez kopyala, GPU'da bol iş yap, sonuçları da bir kez geri kopyala.

## Önbellek ve Paylaşımlı Bellek

Önbellek, işlemcinin hemen yanında duran küçük ve çok hızlı bir bellektir. Hem CPU'larda hem GPU'larda önbellek bulunur, ama ikisi onu farklı şekilde kullanır.

> [!NOTE]
> CPU'lar birkaç önbellek seviyesine dayanır: L1, L2 ve L3. Bunlar küçük ama çok hızlıdır.

GPU'larda da önbellek vardır. Bunun yanında bir şey daha bulunur: paylaşımlı bellek. GPU'daki thread'ler birlikte çalışmak ve veri paylaşmak için onu kullanır. Paylaşımlı bellek, GPU optimizasyonunun en önemli araçlarından biridir.

## Çekirdek Hızı

GPU'yu güçlü yapan, çekirdeklerinin daha hızlı olması değildir. Tek bir CPU çekirdeği genelde daha yüksek bir saat hızında çalışır: bir masaüstü CPU çekirdeği çoğu zaman 5 GHz'e ya da üstüne çıkar. Bir GPU çekirdeği daha yavaştır: 2025'in en güçlü oyun GPU'larından GeForce RTX 5090, 2,41 GHz'e çıkar. Çekirdek çekirdeğe karşılaştırırsan CPU kazanır.

## GPU'nun Gücü Nereden Gelir

GPU'da çok sayıda basit çekirdek vardır. İşi küçük parçalara böler ve hepsini aynı anda çalıştırır. Gücü tek tek çekirdeklerin kuvvetinden değil, birlikte çalışan çekirdeklerin sayısından gelir.

Örneğin L40S'te her birinde 128 çekirdek olan 142 SM vardır, yani 142 * 128 = 18.176 çekirdek. 16 çekirdekli bir masaüstü CPU'sunda 18.176 / 16 = 1.136 kat daha az çekirdek bulunur. Her CPU çekirdeği iki kat hızlı çalışsa bile bu, binden fazla katlık farkı kapatamaz.

GPU'lar ancak bir problem paralel parçalara bölünebildiğinde öne geçer. Sıralı bir işte CPU, GPU'dan rahatlıkla daha hızlı olabilir.

<cpu-vs-gpu></cpu-vs-gpu>

## CPU ve GPU Nasıl Birlikte Çalışır

GPU tek başına çalışmaz. Tipik bir sistemde:

- CPU programı yönetir  
- GPU paralel işi çalıştırır  

İkisi PCIe gibi bir bağlantı üzerinden konuşur. Veri akışı şöyledir:

CPU → veriyi GPU'ya gönderir  
GPU → veriyi işler  
GPU → sonuçları geri gönderir  

Bu akış kötü yönetilirse performans düşer.

<cpu-gpu-trip></cpu-gpu-trip>

## Streaming Multiprocessor

GPU'nun içindeki en önemli birim SM'dir. SM küçük bir işlem birimidir. Bir GPU, birlikte çalışan çok sayıda SM'den oluşur.

Her SM'de paralel iş çalıştırmak için gereken her şey bulunur:

- register'lar, mevcut en hızlı depolama alanı  
- paylaşımlı bellek, thread'lerin veri alışverişi yaptığı yer  
- neyin ne zaman çalışacağına karar veren kontrol birimleri  
- asıl işi yapan yürütme birimleri  

<sm-inside></sm-inside>

## Yürütme Birimleri

Her SM'de farklı türde hesaplama birimleri vardır. Her tür belirli bir işte uzmanlaşmıştır:

- kayan noktalı sayı birimleri, grafikte ve yapay zekâda çok kullanılır  
- tam sayı birimleri  
- Tensor Core'lar, yapay zekâ için kritik olan matris hesapları için  
- özel fonksiyon birimleri, daha karmaşık matematik için  
- load/store birimleri, veriyi bellek ile hesaplama birimleri arasında taşır  

Yani GPU sadece "çok sayıda çekirdek" değildir. Uzmanlaşmış birimlerden oluşan, düzenli bir sistemdir.

> [!TIP]
> Bir özellik tablosunda "18.176 CUDA çekirdeği" yazıyorsa, sadece kayan noktalı sayı birimleri sayılmıştır. Tensor Core'lar ve diğer birimler ayrıca listelenir. Bu sayıları nasıl okuyacağını [Ders 03](../Lesson-03/notes.md) gösteriyor.

## L2 Önbellek

L2 önbellek, tüm GPU için ortak bir önbellek katmanıdır. L1 ya da paylaşımlı bellek gibi tek bir SM'ye bağlı değildir. Daha büyüktür ama daha yavaştır. Bellek erişiminin maliyetini azaltmaya yardım eder. [Ders 07](../Lesson-07/notes.md) her bellek seviyesini gerçek boyutlarıyla gösteriyor.

<gpu-anatomy></gpu-anatomy>

## Bu Neden Önemli

CUDA sadece kod yazmak değildir. Donanımı anlamaktır. Bir GPU'yu iyi kullanmak için şunları bilmen gerekir:

- belleğin nasıl çalıştığını  
- paralel çalışmanın nasıl işlediğini  
- verinin nasıl hareket ettiğini  

GPU programlamak, paralel düşünmek demektir. CUDA'da bundan sonra gelen her şey bu fikrin üzerine kurulur.

## Sözlük

- GPU (Graphics Processing Unit): binlerce basit çekirdeğiyle çok sayıda işi paralel çalıştırmak için tasarlanmış işlemci.
- CPU (Central Processing Unit): bilgisayarın ana işlemcisi; hızlı tepki, karmaşık mantık ve sıralı iş için tasarlanmıştır.
- sıralı çalışma (sequential execution): adımların birbiri ardına çalışması; her adım bir öncekini bekler.
- paralel (parallel): birçok işin birbiri ardına değil, aynı anda çalışması.
- sistem RAM (Random Access Memory): bilgisayarın anakart üzerindeki ana belleği; CPU bunu kullanır.
- VRAM: GPU'nun kendi belleği, CPU'nun kullandığı sistem RAM'inden ayrıdır.
- GDDR (Graphics Double Data Rate): oyun kartlarında ve birçok iş istasyonu GPU'sunda kullanılan bellek türü, örneğin L40S'teki GDDR6.
- HBM (High Bandwidth Memory): veri merkezi GPU'larındaki üst üste yığılmış bellek; GDDR'dan çok daha hızlıdır.
- darboğaz (bottleneck): bir zincirin en yavaş adımı; bütün zincirin hızını o belirler.
- L40S: 142 SM'li, 18.176 çekirdekli ve 48 GB GDDR6 bellekli bir NVIDIA veri merkezi GPU'su (Ada Lovelace mimarisi).
- önbellek (cache): işlemciye yakın, küçük ve çok hızlı bir bellek.
- L1 önbellek (L1): en küçük ve en hızlı önbellek seviyesi, çekirdeğin hemen yanındadır (GPU'da her SM'nin içinde).
- paylaşımlı bellek (shared memory): thread'lerin birlikte çalışmak ve veri paylaşmak için kullandığı GPU belleği.
- thread: tek bir komut akışı; GPU aynı anda binlerce thread çalıştırır.
- çekirdek (core): komut çalıştıran tek bir işlem birimi; CPU'da birkaç güçlü, GPU'da binlerce basit çekirdek vardır.
- saat hızı (clock speed): tek bir çekirdeğin ne kadar hızlı çalıştığı; CPU'da çoğu zaman birkaç GHz.
- GHz (gigahertz): saniyede bir milyar saat döngüsü; 3 GHz'lik bir çekirdek saniyede 3 milyar kez tıklar.
- PCIe (Peripheral Component Interconnect Express): CPU ile GPU'nun birbirine veri göndermek için kullandığı bağlantı; PCIe 4.0 x16 her yönde yaklaşık 32 GB/s taşır.
- SM (Streaming Multiprocessor): GPU'nun içindeki en önemli işlem birimi, GPU çok sayıda SM'den oluşur.
- register (yazmaç): SM'deki en hızlı depolama alanı; her thread kendi değişkenlerini register'larda tutar.
- kayan noktalı sayı birimleri (floating-point units): 3,14 gibi ondalıklı sayılarla hesap yapan birimler; özellik tablolarında CUDA çekirdeği diye geçer.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitilmesi de çalıştırılması da büyük ölçüde matris hesabıdır.
- Tensor Core: SM'nin içinde matris hesapları için tasarlanmış birim; yapay zekâ için kritiktir.
- özel fonksiyon birimleri (special function units, SFU): sinüs, kosinüs, karekök gibi fonksiyonları donanımda hesaplayan birimler.
- load/store birimleri (load/store units): veriyi bellek ile hesaplama birimleri arasında taşıyan birimler.
- L2 önbellek: tüm GPU için ortak, daha büyük ama daha yavaş bir önbellek, tek bir SM'ye bağlı değildir.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan genel programlar yazmak için sunduğu platform.
