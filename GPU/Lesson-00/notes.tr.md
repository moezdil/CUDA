# CPU ve GPU Temelleri

Bu derste GPU'nun CPU'dan nasıl ayrıldığını ve içinde neler olduğunu göreceksin.

## Kodu GPU'ya Taşımak Yetmez

Kodu CPU yerine GPU'da çalıştırmak, onu tek başına hızlandırmaz. İyi performans ancak GPU'nun nasıl çalıştığını anladığında gelir.

## Farklı Hedefler

CPU da GPU da veri işler ve komut çalıştırır. Ama ikisi çok farklı amaçlar için tasarlanmıştır.

CPU şunlar için tasarlanır:

- hızlı yanıt  
- karmaşık mantık  
- sıralı çalışma (adımlar birbiri ardına)  

GPU ise aynı anda çok sayıda iş yapmak için tasarlanır:

- CPU: tek bir karmaşık işi çok hızlı yapar  
- GPU: çok sayıda basit işi paralel yapar  

## Bellek

CPU sistem RAM'ini kullanır. Her şey aynı ortak bellekten geçer.

GPU'nun ise VRAM adı verilen kendi belleği vardır. Bunun anlamı şu:

- CPU ile GPU veriyi kendiliğinden paylaşmaz  
- veri ikisi arasında kopyalanmak zorundadır  

Bu kopyalama darboğaza dönüşebilir, o yüzden dikkat ister.

## Önbellek ve Paylaşımlı Bellek

Önbellek (cache), işlemcinin hemen yanında duran küçük ve çok hızlı bir bellektir. Hem CPU'larda hem GPU'larda önbellek bulunur, ama ikisi onu farklı şekilde kullanır.

> [!NOTE]
> CPU'lar birkaç önbellek seviyesine dayanır: L1, L2 ve L3. Bunlar küçük ama çok hızlıdır.

GPU'larda da önbellek vardır. Bunun yanında bir şey daha bulunur: paylaşımlı bellek (shared memory). GPU'daki thread'ler (iş parçacıkları) birlikte çalışmak ve veri paylaşmak için onu kullanır. Paylaşımlı bellek, GPU optimizasyonunun en önemli araçlarından biridir.

## Çekirdek Hızı

GPU'yu güçlü yapan, çekirdeklerinin daha hızlı olması değildir. Tek bir CPU çekirdeği genelde daha yüksek bir saat hızında, çoğu zaman birkaç GHz'de çalışır. Tek bir GPU çekirdeği daha yavaştır. Çekirdek çekirdeğe karşılaştırırsan CPU kazanır.

## GPU'nun Gücü Nereden Gelir

GPU'da çok sayıda basit çekirdek vardır. İşi küçük parçalara böler ve hepsini aynı anda çalıştırır. Gücü tek tek çekirdeklerin kuvvetinden değil, birlikte çalışan çekirdeklerin sayısından gelir.

GPU'lar ancak bir problem paralel parçalara bölünebildiğinde öne geçer. Sıralı bir işte CPU, GPU'dan rahatlıkla daha hızlı olabilir.

<cpu-vs-gpu></cpu-vs-gpu>

## CPU ve GPU Nasıl Birlikte Çalışır

GPU tek başına çalışmaz. Tipik bir sistemde:

- CPU programı yönetir  
- GPU paralel işi çalıştırır  

İkisi PCIe gibi bir bağlantı üzerinden haberleşir. Veri şöyle akar:

CPU → veriyi GPU'ya gönderir  
GPU → veriyi işler  
GPU → sonuçları geri gönderir  

Bu akış iyi yönetilmezse performans düşer.

## Streaming Multiprocessor (SM)

GPU'nun içindeki en önemli birim Streaming Multiprocessor'dır (SM). SM küçük bir işlemcidir. GPU ise birlikte çalışan çok sayıda SM'den oluşur.

Her SM'de paralel iş için gereken her şey vardır:

- register'lar (yazmaçlar), en hızlı depolama alanı  
- paylaşımlı bellek, thread'lerin veri alışverişi yaptığı yer  
- hangi işin ne zaman çalışacağına karar veren kontrol birimleri  
- asıl işi yapan yürütme birimleri  

## Yürütme Birimleri

Her SM'de farklı türde hesaplama birimleri vardır ve her biri belli bir işte uzmandır:

- kayan noktalı sayı birimleri: grafikte ve yapay zekâda çok kullanılır  
- tam sayı birimleri  
- Tensor Core'lar: matris hesapları için, yapay zekâda kritiktir  
- özel fonksiyon birimleri: daha karmaşık matematik için  
- load/store birimleri: veriyi bellek ile hesaplama birimleri arasında taşır  

Yani GPU sadece "çok sayıda çekirdek" değildir; uzmanlaşmış birimlerden oluşan düzenli bir sistemdir.

## L2 Önbellek

L2 önbellek, bütün GPU'nun ortak kullandığı bir önbellek katmanıdır. L1 ya da paylaşımlı bellek gibi tek bir SM'ye bağlı değildir. Daha büyüktür ama daha yavaştır. Bellek erişiminin maliyetini düşürmeye yardım eder.

<gpu-anatomy></gpu-anatomy>

## Bu Neden Önemli

CUDA sadece kod yazmak değil, donanımı anlamaktır. Bir GPU'yu iyi kullanmak için şunları bilmen gerekir:

- belleğin nasıl çalıştığını  
- paralel çalışmanın nasıl işlediğini  
- verinin nasıl taşındığını  

GPU programlamak, paralel düşünmek demektir. Bu fikir, CUDA'da bundan sonra öğreneceğin her şeyin temelidir.

## Sözlük

- GPU (Graphics Processing Unit): binlerce basit çekirdeğiyle çok sayıda işi paralel çalıştırmak için tasarlanmış işlemci.
- CPU (Central Processing Unit): bilgisayarın ana işlemcisi; hızlı tepki, karmaşık mantık ve sıralı iş için tasarlanmıştır.
- sıralı çalışma (sequential execution): adımların birbiri ardına çalışması; her adım bir öncekini bekler.
- paralel (parallel): birçok işin birbiri ardına değil, aynı anda çalışması.
- sistem RAM (system RAM): bilgisayarın anakart üzerindeki ana belleği; CPU bunu kullanır.
- VRAM: GPU'nun kendi belleği, CPU'nun kullandığı sistem RAM'inden ayrıdır.
- darboğaz (bottleneck): bir zincirin en yavaş adımı; bütün zincirin hızını o belirler.
- önbellek (cache): işlemciye yakın, küçük ve çok hızlı bir bellek.
- L1 önbellek (L1): en küçük ve en hızlı önbellek seviyesi, çekirdeğin hemen yanındadır (GPU'da her SM'nin içinde).
- paylaşımlı bellek (shared memory): thread'lerin birlikte çalışmak ve veri paylaşmak için kullandığı GPU belleği.
- thread: tek bir komut akışı; GPU aynı anda binlerce thread çalıştırır.
- çekirdek (core): komut çalıştıran tek bir işlem birimi; CPU'da birkaç güçlü, GPU'da binlerce basit çekirdek vardır.
- saat hızı (clock speed): tek bir çekirdeğin ne kadar hızlı çalıştığı; CPU'da çoğu zaman birkaç GHz.
- GHz (gigahertz): saniyede bir milyar saat döngüsü; 3 GHz'lik bir çekirdek saniyede 3 milyar kez tıklar.
- PCIe (PCI Express): CPU ile GPU'nun birbirine veri göndermek için kullandığı bağlantı.
- SM (Streaming Multiprocessor): GPU'nun içindeki en önemli işlem birimi, GPU çok sayıda SM'den oluşur.
- register (yazmaç): SM'deki en hızlı depolama alanı; her thread kendi değişkenlerini register'larda tutar.
- kayan noktalı sayı birimleri (floating-point units): 3,14 gibi ondalıklı sayılarla hesap yapan birimler.
- Tensor Core: SM'nin içinde matris hesapları için tasarlanmış birim; yapay zekâ için kritiktir.
- özel fonksiyon birimleri (special function units, SFU): sinüs, kosinüs, karekök gibi fonksiyonları donanımda hesaplayan birimler.
- load/store birimleri (load/store units): veriyi bellek ile hesaplama birimleri arasında taşıyan birimler.
- L2 önbellek: tüm GPU için ortak, daha büyük ama daha yavaş bir önbellek, tek bir SM'ye bağlı değildir.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan genel programlar yazmak için sunduğu platform.
