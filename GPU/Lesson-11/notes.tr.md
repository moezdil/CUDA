# 11 > CPU'dan GPU'ya Veri Yolu

Bir kernel yalnızca zaten GPU belleğinde duran veriyle çalışabilir, o veri ise neredeyse her zaman CPU belleğinde başlar. Bu ders baytları yol boyunca PCIe bağlantısı, sabitlenmiş host belleği, asenkron kopyalar, birleşik bellek ve Grace Hopper ile Grace Blackwell'deki daha hızlı bağlantılar üzerinden takip ediyor. [Ders 00](../Lesson-00/notes.md) kısa halini anlatmıştı. Burada bu yolun neden yavaş olduğunu ve bununla ilgili neler yapabileceğini göreceksin.

## İki Bellek, Tek Bağlantı

Sıradan bir GPU sunucusunda birbirinden ayrı iki bellek vardır.

- host belleği, yani anakarttaki, CPU'nun yanındaki sistem RAM'i
- device belleği, yani GPU kartının üzerindeki, GPU'nun kendi GDDR ya da HBM belleği

CPU, device belleğini kendi RAM'i gibi okuyamaz, bir kernel de host belleğini tam hızda öylece okuyamaz. Aralarında bir bağlantı vardır, çoğu makinede PCIe. GPU'nun işlediği her bayt bu bağlantıdan en az bir kez geçer.

Bu derslerde kullanılan L40S'te iki taraf çok dengesizdir. 48 GB'lık GDDR6 belleği SM'leri 864 GB/s ile besler. CPU'ya giden PCIe 4.0 x16 bağlantısı ise her yönde yaklaşık 31,5 GB/s taşır. [Ders 07](../Lesson-07/notes.md) verinin GPU'ya girdikten sonra başına geleni anlatır, bu ders ise onu oraya ulaştırmakla ilgili.

## PCIe Bağlantısı

PCIe, lane'lerden oluşur. Her lane, her yön için bir tane olmak üzere iki tel çiftidir. Bu yüzden bağlantı aynı anda hem gönderir hem alır, buna full duplex denir. Bir GPU yuvasında 16 lane vardır, x16 diye yazılır. Her yeni nesil bir lane'in hızını ikiye katlar ve bu hız GT/s ile ölçülür.

| Nesil | Lane başına | x16, yön başına | Kullanan GPU'lar |
|---|---|---|---|
| PCIe 3.0 | 8 GT/s | 15,8 GB/s | V100 |
| PCIe 4.0 | 16 GT/s | 31,5 GB/s | A100, L40S |
| PCIe 5.0 | 32 GT/s | 63 GB/s | H100, B200, RTX 5090 |
| PCIe 6.0 | 64 GT/s | yaklaşık 121 GB/s | Blackwell Ultra (B300) |

x16 sayıları yön başınadır. "PCIe Gen4 x16, 64 GB/s" diyen bir veri sayfası iki yönü toplar. GPU'ya yapılan bir kopya yalnızca tek yönü kullanır, bu yüzden tek bir kopya için işe yarayan sayı yön başına olanıdır.

> [!NOTE]
> Spec sayfaları yuvarlar. PCIe 4.0 x16 yön başına 31,5 GB/s'dir, çoğu zaman 32 GB/s diye yazılır. Gerçek bir kopya biraz daha azına ulaşır, çünkü her paket ayrıca başlık ve kontrol bilgisi taşır. PCIe 7.0 (lane başına 128 GT/s) Haziran 2025'te kesinleşti, ama henüz onu kullanan bir GPU yok.

<data-path></data-path>

## L40S'e 4 GB Taşımak

Bir programın L40S üzerinde 4 GB girdiye ihtiyacı olsun. Bu yolculuk ne kadar sürer ve aynı baytları GPU'ya vardıktan sonra okumakla nasıl karşılaştırılır?

- PCIe 4.0 x16 üzerinden 4 GB / 31,5 GB/s = 0,127 s, yaklaşık 127 ms
- L40S'in kendi belleğinden 4 GB / 864 GB/s = 0,0046 s, yaklaşık 4,6 ms
- oran 864 / 31,5 = 27,4, yani kopya, GPU üzerinde tam bir okumadan yaklaşık 27 kat uzun sürer

H100 PCIe ya da RTX 5090 gibi PCIe 5.0 bir kartta kopya yarıya iner, yani 4 / 63 = 0,063 s, yaklaşık 63 ms. Bu yine de o GPU'ların kendi belleklerinden okuduğu 1,8 TB/s ve üzeri hızdan çok daha yavaştır.

## Kopya Ne Zaman Baskın Olur

Şimdi bir kernel ekle. 4 GB'ı bir kez okuyan ve 4 GB sonuç yazan basit bir kernel düşün. Device belleği üzerinden 8 GB taşır, yani L40S'te en az 8 / 864 = 0,0093 s, yaklaşık 9,3 ms sürer. Girdiyi içeri, sonucu dışarı kopyalamak ise 127 + 127 = 254 ms tutar. Kernel toplam sürenin %4'ünden azıdır, çünkü 9,3 / (254 + 9,3) = 0,035.

Kopya ancak GPU aldığı her bayt başına çok iş yaptığında baskın olmaktan çıkar.

- kernel veriyi matris çarpımındaki gibi defalarca yeniden kullanır, böylece çalışma süresi uzar ama kopya aynı kalır
- veri birçok kernel boyunca GPU'da kalır, böylece kopyayı bir kez ödersin, sonra 864 GB/s ile okursun
- programın CPU kısmı zaten kopyadan da uzun sürerdi

[Ders 09](../Lesson-09/notes.md) "bayt başına iş" fikrini aritmetik yoğunluk olarak ölçer. Aynı fikir bağlantı için de geçerli. Bir PCIe 4.0 kopyasını gizlemek için, L40S belleğinden bir okumayı gizlemekten yaklaşık 27 kat fazla bayt başına iş gerekir.

> [!WARNING]
> Asla yalnızca kernel'i ölçüp bunu programının hızlanması diye sunma. Veri CPU'dan gelmek zorundaysa, içeri ve dışarı kopyalar da ölçüme dahildir ve basit kernel'lerde sürenin çoğu onlardır.

## Pageable ve Pinned Host Belleği

Kopyanın kendisini GPU üzerindeki bir DMA motoru yapar. Bu, CPU her baytı tek tek taşımadan host belleğini PCIe üzerinden kendi başına okuyan bir donanımdır. DMA motorunun sabit bir fiziksel adrese ihtiyacı vardır ve host belleğinin türü tam burada önem kazanır.

- pageable bellek, `malloc` ya da `new` ile aldığın bellektir. OS bu sayfaları her an RAM'de başka bir yere taşıyabilir ya da swap ile diske atabilir, bu yüzden DMA motoru onları güvenle okuyamaz.
- pinned bellek, OS'in asla taşımayacağına söz verdiği host belleğidir ve buna page-locked bellek de denir. CUDA'da onu `cudaMallocHost` ya da `cudaHostAlloc` ile alırsın veya var olan bir tamponu `cudaHostRegister` ile kilitlersin.

Pageable bellekten kopyaladığında sürücü bu sorunun etrafından dolaşır. Verini önce CPU ile kendine ait pinned bir ara tampona kopyalar, sonra DMA motorunun o tamponu parça parça GPU'ya göndermesini sağlar. Her bayt iki kez kopyalanır, bir kez CPU tarafından, bir kez PCIe üzerinden. Pinned bellekten ise DMA motoru doğrudan senin tamponunu okur, ara kopya ortadan kalkar ve bağlantı tepe hızına yakın çalışabilir.

> [!TIP]
> Sık kopyaladığın tamponları pinned yap ve onları bir kez ayır. Sabitlemenin kurulumu yavaştır ve OS'ten RAM alır, bu yüzden "ne olur ne olmaz" diye gigabaytlarca bellek sabitlemek tüm makineyi yavaşlatabilir.

## Senkron ve Asenkron Kopyalar

`cudaMemcpy`, [CUDA Ders 08](../../cuda/Lesson-08/notes.md)'in kullandığı düz kopyadır. Senkrondur, yani CPU thread'i kopya bitene kadar bekler ve bu sırada GPU programından başka bir iş çalıştırmaz. Kopyala, hesapla, geri kopyala adımları kesinlikle sırayla olur.

`cudaMemcpyAsync` kopyayı yalnızca kuyruğa koyar ve hemen döner. Stream'lerle birlikte kopyaların ve kernel'lerin örtüşmesini sağlar. Stream, sırayla çalışan bir GPU iş kuyruğudur ve farklı stream'lerdeki işler aynı anda çalışabilir. GPU'nun ayrı copy engine'leri olduğu için, SM'ler bir parça üzerinde hesap yaparken başka bir parçayı kopyalayabilir.

4 stream'li bir boru hattı şöyle görünür. 4 GB'ı 1 GB'lık 4 parçaya böl. Her parçanın kopyası 1 / 31,5 = 0,032 s (32 ms) sürer. Kernel'in parça başına 12 ms'ye ihtiyacı olsun. Sırayla yapılırsa 4 × 32 + 4 × 12 = 176 ms sürer. Örtüştürülürse 1. parçanın kernel'i 2. parça kopyalanırken çalışır ve toplam yaklaşık 4 × 32 + 12 = 140 ms'ye düşer. Kopya süresi hâlâ oradadır, yalnızca kernel süresi onun arkasına saklanır.

Asenkron kopyalar pinned host belleği ister. Pageable bellekten `cudaMemcpyAsync` yine sürücünün tamponundan geçmek zorundadır ve genelde asenkron olmaktan çıkar.

## Birleşik Bellek

Birleşik bellek sana iki tarafta da çalışan tek bir pointer verir. Onu `cudaMallocManaged` ile ayırırsın, CPU'da içine yazarsın, bir kernel'e verirsin ve sonucu CPU'da okursun. Kodunda hiç `cudaMemcpy` olmaz.

Veri yine de bağlantıdan geçmek zorundadır. Pascal'dan beri GPU'lar page fault alabilir. Bir kernel hâlâ host belleğinde duran bir sayfaya dokunduğunda GPU o erişimi durdurur, sürücü sayfayı device belleğine taşır ve erişim devam eder. Bu isteğe bağlı page migration rahattır, ama çok sayıda küçük fault tek büyük bir kopyadan yavaştır. `cudaMemPrefetchAsync` sürücüye sayfaları önceden taşımasını söyler ve açık bir kopyanın hızının çoğunu geri getirir.

## Grace Hopper ve Grace Blackwell'de Coherent Bağlantılar

NVIDIA'nın süper çipleri CPU ile GPU arasındaki PCIe'yi kaldırır. GH200 Grace Hopper Superchip, bir Grace CPU'yu (Arm, 480 GB'a kadar LPDDR5X bellekle) ve bir Hopper GPU'yu tek kartta birleştirir ve NVLink-C2C ile bağlar. GB200 Grace Blackwell Superchip de bir Grace CPU'yu iki B200 GPU'ya aynı şekilde bağlar.

NVLink-C2C toplamda 900 GB/s, her yönde 450 GB/s taşır, bu da PCIe 5.0 x16'nın yaklaşık 7 katıdır. Ayrıca coherent'tır. CPU ve GPU tek bir ortak adres alanı görür ve önbelleklerini uyumlu tutar, bu sayede GPU, CPU belleğini doğrudan okuyabilir, `malloc` ile alınmış sıradan belleği bile, ara kopya olmadan. GPU'nun tekrar tekrar okuduğu veriyi kopyalamak yine de kazandırır, çünkü HBM daha da hızlıdır, ama bağlantı artık PCIe'deki gibi en dar nokta değildir.

## GPUDirect

GPUDirect, NVIDIA'nın host belleğini tamamen atlayan yollara verdiği addır. GPUDirect P2P aynı makinedeki iki GPU'nun doğrudan birbirine kopyalamasını sağlar. GPUDirect RDMA bir NIC'in GPU belleğini doğrudan okuyup yazmasını sağlar, böylece başka bir sunucudan gelen veri CPU RAM'inde durmadan GPU'ya ulaşır. GPUDirect Storage aynısını NVMe sürücüler ve ağ depolaması için yapar. [Ders 12](../Lesson-12/notes.md) birçok GPU'nun bu yolları birlikte nasıl kullandığını gösterir.

## Bunun CUDA İçin Önemi

En hızlı kernel bile yavaş bir veri yolunu telafi edemez. CUDA yazarken şunlara dikkat et.

- bir kez kopyala, veriyi olabildiğince çok kernel boyunca GPU'da tut ve yalnızca sonucu geri kopyala
- sık kopyaladığın tamponlar için pinned host belleği (`cudaMallocHost`) kullan
- veri "bir kez kopyala" kalıbına uymuyorsa kopyaları ve kernel'leri `cudaMemcpyAsync` ve stream'lerle örtüştür
- `cudaMallocManaged` kullanırken page fault'lara güvenmek yerine prefetch yap
- kopya süresini kernel süresinin yanında ölç ve ikisini de bağlantının bant genişliğiyle karşılaştır. L40S'te 4 GB / 31,5 GB/s = 127 ms alt sınırdır

## Sözlük

- host belleği (host memory): CPU'nun yanındaki sistem RAM'i. CUDA kodunda host tamponları genelde `h_` ile başlar.
- device belleği (device memory): GPU'nun kendi belleği (GDDR ya da HBM). CUDA kodunda device tamponları genelde `d_` ile başlar.
- RAM (Random Access Memory): bir bilgisayarın ana belleği. CPU'nun RAM'i host belleğidir.
- CPU (Central Processing Unit): ana işlemci. CUDA'da veriyi hazırlayan ve kernel'leri başlatan host'tur.
- GPU (Graphics Processing Unit): binlerce basit çekirdeği olan işlemci, CUDA'da device'tır.
- GDDR (Graphics Double Data Rate): oyun ve iş istasyonu GPU'larındaki bellek, örneğin L40S'teki 48 GB GDDR6.
- HBM (High Bandwidth Memory): H100 ve B200 gibi veri merkezi GPU'larında, GPU çipinin hemen yanındaki yığılmış bellek.
- PCIe (Peripheral Component Interconnect Express): CPU ile GPU gibi takılan kartlar arasındaki standart bağlantı.
- SM (Streaming Multiprocessor): GPU'nun işlem birimi. L40S'te 142 tane vardır.
- lane: her yön için bir tel çifti olan tek bir PCIe bağlantısı. Bir GPU yuvası 16 lane (x16) kullanır.
- x16: 16 lane'li PCIe bağlantısı, GPU yuvasının standart genişliği.
- full duplex: aynı anda, her yönde tam hızla hem göndermek hem almak.
- GT/s (gigatransfers per second): tek bir PCIe lane'inin ham sinyal hızı, PCIe 4.0'da 16 GT/s.
- yön başına (per direction): yalnızca tek yöndeki bant genişliği. GPU'ya kopya tek yön kullanır, yani PCIe 4.0 x16'da 31,5 GB/s.
- L40S: bu derslerde kullanılan, 864 GB/s bellekli ve PCIe 4.0 x16 bağlantılı NVIDIA Ada Lovelace veri merkezi GPU'su.
- kernel: GPU'da çalışan, CPU tarafından başlatılan fonksiyon.
- aritmetik yoğunluk (arithmetic intensity): taşınan bayt başına yapılan iş. Bayt başına iş arttıkça yavaş bir kopya daha iyi gizlenir.
- DMA (Direct Memory Access): CPU her baytı kopyalamadan, veriyi PCIe üzerinden kendi başına taşıyan GPU donanımı.
- pageable bellek (pageable memory): `malloc` ya da `new` ile alınan, OS'in taşıyabileceği ya da diske atabileceği sıradan host belleği.
- OS (operating system): belleği yöneten ve sayfaların nerede duracağına karar veren yazılım, örneğin Linux.
- swap: RAM yetmediğinde bellek sayfalarını diske taşımak.
- pinned bellek (pinned memory): yerine kilitlenmiş (page-locked) host belleği. DMA motoru onu doğrudan okuyabilir ve `cudaMallocHost` ile alınır.
- ara tampon (staging buffer): sürücünün, pageable veriyi GPU'ya göndermeden önce içine kopyaladığı pinned tampon.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform.
- `cudaMallocHost`: pinned host belleği ayıran CUDA çağrısı, `cudaFreeHost` ile serbest bırakılır.
- `cudaMemcpy`: senkron CUDA kopyası. CPU thread'i o bitene kadar bekler.
- `cudaMemcpyAsync`: bir stream'de kuyruğa alınan ve hemen dönen kopya. Gerçekten asenkron olması için pinned bellek ister.
- stream: sırayla çalışan bir GPU iş kuyruğu. Farklı stream'lerdeki işler örtüşebilir.
- copy engine: SM'ler kernel çalıştırırken kopyaları yürüten, GPU üzerindeki DMA motoru.
- birleşik bellek (unified memory): CPU'dan da GPU'dan da tek bir pointer ile erişilen bellek. Sayfaları sürücü taşır.
- `cudaMallocManaged`: birleşik bellek ayıran CUDA çağrısı.
- page fault (sayfa hatası): gereken yerde olmayan bir sayfaya erişim. Erişim, sayfa taşınana ya da eşlenene kadar bekler.
- page migration (sayfa taşıma): bir bellek sayfasını host belleğinden device belleğine ya da tersine taşımak.
- `cudaMemPrefetchAsync`: birleşik bellek sayfalarını önceden taşır, böylece kernel page fault'larda durmaz.
- Grace Hopper (GH200): bir Grace CPU ile bir Hopper GPU'nun NVLink-C2C ile bağlandığı süper çip.
- Grace Blackwell (GB200): bir Grace CPU ile iki B200 GPU'nun NVLink-C2C ile bağlandığı süper çip.
- LPDDR5X (Low-Power Double Data Rate 5X): Grace CPU'nun enerji verimli belleği.
- NVLink-C2C (NVLink Chip-to-Chip): NVIDIA'nın coherent CPU-GPU bağlantısı, toplam 900 GB/s, yön başına 450 GB/s.
- coherent (tutarlı): CPU ve GPU tek bir adres alanını paylaşır ve önbelleklerini uyumlu tutar, böylece her biri diğerinin belleğini okuyabilir.
- GPUDirect: veriyi host belleğinde durdurmadan GPU belleğine taşıyan ya da oradan alan NVIDIA yolları ailesi.
- P2P (peer to peer): aynı makinedeki iki GPU arasında, host belleğine uğramadan doğrudan kopya.
- RDMA (Remote Direct Memory Access): başka bir makinenin belleğini, onun CPU'su olmadan ağ üzerinden okumak ya da yazmak.
- NIC (Network Interface Card): bir sunucuyu ağa bağlayan kart.
- NVMe (Non-Volatile Memory Express): PCIe üzerindeki SSD (solid state drive) depolaması için hızlı arayüz.
