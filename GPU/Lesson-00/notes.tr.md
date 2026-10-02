# CPU ve GPU Temelleri

Bu derste GPU'nun CPU'dan nasıl ayrıldığını anlatıyoruz. GPU'nun içinde neler olduğunu da gösteriyoruz.

## Kodu GPU'ya Taşımak Yetmez

Kodu CPU yerine GPU'da çalıştırmak, onu tek başına hızlandırmaz. İyi performansı ancak GPU'nun nasıl çalıştığını anladığında alırsın.

## Farklı Hedefler

CPU'lar da GPU'lar da veri işler ve komut çalıştırır. Ama çok farklı hedefler için üretilirler.

CPU şunlar için üretilir:

- hızlı yanıt  
- karmaşık mantık  
- sıralı çalışma (adımlar birbiri ardına)  

GPU ise aynı anda çok sayıda işi yapmak için üretilir.

- CPU: tek bir karmaşık iş, çok hızlı yapılır  
- GPU: çok sayıda basit iş, paralel yapılır  

## Bellek

CPU sistem RAM'ini kullanır. Her şey aynı ortak bellek alanından geçer.

GPU'nun ise VRAM denen kendi belleği vardır. Bu şu demek:

- CPU ile GPU veriyi kendiliğinden paylaşmaz  
- veri ikisi arasında kopyalanmalıdır  

Bu kopyalama bir darboğaza dönüşebilir. O yüzden dikkat ister.

## Önbellek ve Paylaşımlı Bellek

Önbellek (cache), işlemciye yakın duran küçük ve çok hızlı bir bellektir. Hem CPU'larda hem GPU'larda önbellek vardır. Ama onu farklı şekilde kullanırlar.

> [!NOTE]
> CPU'lar birkaç önbellek seviyesine dayanır: L1, L2 ve L3. Bunlar küçüktür ama çok hızlıdır.

GPU'larda da önbellek var. Bunun yanına bir şey daha eklerler: paylaşımlı bellek (shared memory). GPU içindeki thread'ler (iş parçacıkları) birlikte çalışmak ve veri paylaşmak için onu kullanır. Paylaşımlı bellek, GPU optimizasyonunun en önemli araçlarından biridir.

## Çekirdek Hızı

GPU, her çekirdeği daha hızlı olduğu için güçlü değildir. Tek bir CPU çekirdeği genelde daha yüksek bir saat hızında çalışır, çoğu zaman birkaç GHz. Tek bir GPU çekirdeği daha yavaştır. Bir çekirdeğe karşı bir çekirdek testinde CPU kazanır.

## GPU'nun Gücü Nereden Gelir

GPU'da çok sayıda basit çekirdek vardır. İşi birçok küçük parçaya böler ve bunları aynı anda çalıştırır. Gücü, her çekirdeğin kuvvetinden değil, birlikte çalışan çekirdeklerin sayısından gelir.

GPU'lar sadece bir problem paralel parçalara bölünebildiğinde daha iyidir. Sıralı bir işte CPU, GPU'dan rahatça daha hızlı olabilir.

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

## Streaming Multiprocessor (SM)

GPU'nun içindeki en önemli birim Streaming Multiprocessor'dır (SM). SM küçük bir işlem birimidir. GPU ise birlikte çalışan çok sayıda SM'den oluşur.

Her SM'de paralel işi çalıştırmak için gereken her şey vardır:

- register'lar (yazmaçlar), en hızlı depolama alanı  
- paylaşımlı bellek, thread'lerin veri alışverişi yaptığı yer  
- neyin ne zaman çalışacağına karar veren kontrol birimleri  
- asıl işi yapan yürütme birimleri  

## Yürütme Birimleri

Her SM'de farklı türde hesaplama birimleri vardır. Her tür belli bir işte uzmandır:

- kayan noktalı sayı birimleri, grafikte ve yapay zekâda çok kullanılır  
- tam sayı birimleri  
- Tensor Core'lar, matris hesapları için, yapay zekâ için kritiktir  
- özel fonksiyon birimleri, daha karmaşık matematik için  
- load/store birimleri, veriyi bellek ile hesaplama birimleri arasında taşır  

Yani GPU sadece "çok sayıda çekirdek" değildir. Uzmanlaşmış birimlerden kurulmuş düzenli bir sistemdir.

## L2 Önbellek

L2 önbellek, tüm GPU için ortak bir önbellek katmanıdır. L1 ya da paylaşımlı bellek gibi tek bir SM'ye bağlı değildir. Daha büyüktür ama daha yavaştır. Bellek erişiminin maliyetini azaltmaya yardım eder.

<gpu-anatomy></gpu-anatomy>

## Bu Neden Önemli

CUDA sadece kod yazmak değildir. Donanımı anlamaktır. Bir GPU'yu iyi kullanmak için şunları bilmen gerekir:

- belleğin nasıl çalıştığını  
- paralel çalışmanın nasıl işlediğini  
- verinin nasıl taşındığını  

GPU programlamak paralel düşünmek demektir. Bu fikir, CUDA'da bundan sonra gelen her şeyin temelidir.

## Sözlük

- GPU (Graphics Processing Unit): binlerce basit çekirdeği olan, çok sayıda işi paralel çalıştırmak için üretilmiş işlemci.
- CPU (Central Processing Unit): bilgisayarın ana işlemcisi, hızlı yanıt, karmaşık mantık ve sıralı iş için üretilmiştir.
- sıralı çalışma (sequential execution): adımların birbiri ardına çalışması, her adım bir öncekini bekler.
- paralel (parallel): birçok işin birbiri ardına değil, aynı anda çalışması.
- sistem RAM (system RAM): bilgisayarın anakart üzerindeki ana belleği, CPU bunu kullanır.
- VRAM: GPU'nun kendi belleği, CPU'nun kullandığı sistem RAM'inden ayrıdır.
- darboğaz (bottleneck): bir zincirdeki en yavaş adım, tüm zincirin hızını o sınırlar.
- önbellek (cache): işlemciye yakın, küçük ve çok hızlı bir bellek.
- L1 önbellek (L1): en küçük ve en hızlı önbellek seviyesi, çekirdeğin hemen yanındadır (GPU'da her SM'nin içinde).
- paylaşımlı bellek (shared memory): thread'lerin birlikte çalışmak ve veri paylaşmak için kullandığı GPU belleği.
- thread: tek bir komut akışı; GPU aynı anda binlerce thread çalıştırır.
- çekirdek (core): komut çalıştıran tek bir işlem birimi; CPU'da birkaç güçlü, GPU'da binlerce basit çekirdek vardır.
- saat hızı (clock speed): tek bir çekirdeğin ne kadar hızlı çalıştığı, CPU'da çoğu zaman birkaç GHz.
- GHz (gigahertz): saniyede bir milyar saat döngüsü, yani 3 GHz'lik bir çekirdek saniyede 3 milyar kez tik atar.
- PCIe (PCI Express): CPU ile GPU'nun birbirine veri göndermek için kullandığı bağlantı.
- SM (Streaming Multiprocessor): GPU'nun içindeki en önemli işlem birimi, GPU çok sayıda SM'den oluşur.
- register (yazmaç): SM'deki en hızlı depolama alanı; her thread kendi değişkenlerini register'larda tutar.
- kayan noktalı sayı birimleri (floating-point units): 3.14 gibi ondalıklı sayılarla hesap yapan birimler.
- Tensor Core: SM'nin içinde matris hesapları için üretilmiş bir hesaplama birimi, yapay zekâ için kritiktir.
- özel fonksiyon birimleri (special function units, SFU): sinüs, kosinüs, karekök gibi fonksiyonları donanımda hesaplayan birimler.
- load/store birimleri (load/store units): veriyi bellek ile hesaplama birimleri arasında taşıyan birimler.
- L2 önbellek: tüm GPU için ortak, daha büyük ama daha yavaş bir önbellek, tek bir SM'ye bağlı değildir.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan genel programlar yazmak için sunduğu platform.
