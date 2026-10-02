# 08 > Warp'lar ve Gecikme Gizleme

Bir GPU thread'lerini tek tek çalıştırmaz. Onları warp denen 32'lik gruplar hâlinde çalıştırır ve yavaş belleği beklemek yerine warp'lar arasında geçiş yaparak gizler. Bu derste bunun nasıl çalıştığını, bir GPU'nun neden çekirdek sayısından çok daha fazla thread istediğini ve doluluk oranının ne demek olduğunu göreceksin.

## SIMT, Tek Komutla Çok Thread

NVIDIA kendi çalışma modeline SIMT der. Kernel'i tek bir thread için yazıyormuş gibi yazarsın, GPU da aynı kodla çok sayıda thread çalıştırır. Her thread'in kendi register'ları ve kendi verisi vardır, örneğin bir dizideki kendi elemanı.

Donanım komutu her thread için ayrı ayrı getirip çözmez. Bunu bir thread grubu için bir kez yapar ve gruptaki bütün thread'ler komutu birlikte, her biri kendi verisi üzerinde çalıştırır. Bu, çip alanından ve güçten çok tasarruf sağlar. GPU'ya bu kadar çok çekirdek sığabilmesinin nedeni budur.

SIMT, bir CPU'daki SIMD'ye benzer. SIMD'de tek bir komut kısa bir vektör üzerinde çalışır. Fark şurada. SIMT'de her thread için sıradan skaler kod yazarsın, thread'leri gruplamayı donanım senin yerine yapar.

## Warp

Bir komutu birlikte çalıştıran gruba warp denir. Bugüne kadarki bütün NVIDIA GPU'larında bir warp 32 thread'dir. 256 thread'lik bir block 256 / 32 = 8 warp'tır, 100 thread'lik bir block ise yine 4 warp tutar, çünkü son warp yalnızca kısmen doludur (100 = 3 × 32 + 4).

Bir warp'ın içindeki thread'lere lane denir ve 0'dan 31'e kadar numaralanır. CUDA Pratik serisinde [Ders 07](../../cuda/Lesson-07/notes.md), bir thread'in kendi warp ID'sini ve lane ID'sini nasıl bulduğunu gösteriyor.

## Warp Zamanlayıcıları

[Ders 00](../Lesson-00/notes.md), GPU'yu oluşturan küçük işlemci olan SM'yi tanıttı. L40S, CC 8.9 olan bir Ada Lovelace GPU'sudur ve her SM'si 4 bölüme ayrılır. Her bölümde bir warp zamanlayıcı, register dosyasının 64 KB'lık bir dilimi ve 32 FP32 lane bulunur.

Her saat döngüsünde her warp zamanlayıcı hazır olan bir warp seçer ve onun bir sonraki komutunu gönderir. Yani bir SM döngü başına en fazla 4 warp komutu başlatabilir, her zamanlayıcıdan bir tane.

L40S'te bir SM aynı anda en fazla 48 warp tutabilir, bu da 48 × 32 = 1.536 thread eder. Bunlar SM'nin yerleşik warp'larıdır. 4 zamanlayıcıya bölününce her zamanlayıcının seçebileceği 48 / 4 = 12 warp olur.

## Bir Warp Belleği Beklediğinde

VRAM'den bir okuma yüzlerce saat döngüsü sürer. [Ders 07](../Lesson-07/notes.md) bunun arkasındaki bellek hiyerarşisini anlatıyor. Bir warp henüz gelmemiş bir değere ihtiyaç duyarsa bir sonraki komutunu çalıştıramaz. Warp durur.

Bir CPU çekirdeği bunu büyük önbelleklerle ve önceden tahmin yürüterek önlemeye çalışır. GPU daha basit bir şey yapar. Warp zamanlayıcı duran warp'ı atlar ve hazır olan başka bir warp'tan komut gönderir. Veri gelince ilk warp yeniden hazır olur ve sırası daha sonra gelir.

Bu geçişin hiçbir maliyeti yoktur. Her yerleşik warp kendi register'larını her zaman register dosyasında tutar, yani kaydedilecek ya da geri yüklenecek hiçbir şey yoktur. Bir CPU'da thread'ler arasında geçiş yapmak, register'ları belleğe yazıp başkalarını okumak demektir ve çok daha uzun sürer.

Buna gecikme gizleme denir. Bellek yine yavaştır, ama bir warp beklerken diğerleri işe yarar bir şey yapar ve zamanlayıcı meşgul kalır.

Aşağıdaki diyagram tek bir warp zamanlayıcının basitleştirilmiş bir modelidir. Her warp 2 döngü komut gönderir, sonra bellek için 8 döngü bekler. Kaç warp'ın yerleşik olduğunu değiştirmek için kaydırıcıyı oynat.

<latency-hiding></latency-hiding>

1 warp'la zamanlayıcı her 10 döngünün yalnızca 2'sinde komut gönderir, yani %20 meşguldür. Her ek warp bir boşluğu doldurur. (2 + 8) / 2 = 5 warp olduğunda her zaman hazır bir warp vardır ve zamanlayıcı zamanın %100'ünde meşguldür. Altıncı bir warp hiçbir şey katmaz, çünkü yalnızca sırasını bekler.

Gerçek sayılar daha büyüktür. VRAM'den bir okuma yüzlerce döngü sürer, bu yüzden zamanlayıcının bunu örtmesi için çok sayıda warp'a ve her warp'ta birbirinden bağımsız çok sayıda komuta ihtiyacı vardır.

## GPU Neden Çekirdekten Fazla Thread İster

Gecikme gizleme ancak geçilecek başka warp'lar varsa işe yarar. Bu yüzden GPU'nun çekirdek sayısından çok daha fazla thread başlatırsın.

L40S ile hesaplanmış bir örneğe bakalım.

- 142 SM × 128 = 18.176 FP32 çekirdeği
- 142 SM × 1.536 = 218.112 yerleşik thread
- 218.112 / 18.176 = çekirdek başına yerleşik olabilen 12 thread

Bu thread'lerin çoğu her an bekliyordur. Bunda sorun yok. Boşa gitmiyorlar, diğerleri belleği beklerken zamanlayıcıların seçim yaptığı havuz onlardır.

## Doluluk Oranı

Doluluk oranı, bir SM'nin warp'larla ne kadar dolu olduğunu ölçer.

doluluk oranı = aktif warp'lar / SM başına en fazla warp

L40S'te en fazla değer 48'dir. Bir kernel'in SM başına 32 aktif warp'ı varsa doluluk oranı 32 / 48 = %67'dir. 48'in hepsi varsa %100'dür.

Doluluk oranı yükseldikçe her zamanlayıcının seçebileceği warp sayısı artar, böylece hazır bir warp bulma şansı da artar.

## Doluluk Oranını Ne Sınırlar

SM her block'a register, shared memory ve bir yuva verir. Bunlardan biri bittiğinde, warp sınırına ulaşılmamış olsa bile daha fazla block sığmaz. L40S'te en önemli üç sınır şunlardır.

### Thread Başına Register

Bir SM'de 65.536 tane 32 bitlik register vardır ve bütün yerleşik thread'ler bunları paylaşır. Tam doluluk için 1.536 thread'in hepsi sığmalıdır.

65.536 / 1.536 = 42,7, yani thread başına yaklaşık 42 register

Thread başına daha fazla register isteyen bir kernel'e daha az warp sığar.

- 64 register ile 64 × 32 = warp başına 2.048 register ve 65.536 / 2.048 = 32 warp, yani 32 / 48 = %67
- 128 register ile 128 × 32 = warp başına 4.096 ve 65.536 / 4.096 = 16 warp, yani 16 / 48 = %33

> [!NOTE]
> Donanım register'ları warp başına 256'lık parçalar hâlinde dağıtır. 42 register kullanan bir kernel warp başına 42 × 32 = 1.344 register ister. Bu 1.536'ya yuvarlanır ve 48 × 1.536 = 73.728, 65.536'dan fazladır. Yani L40S'te %100 için gerçek sınır 40 register'dır, çünkü 40 × 32 = 1.280 ve 48 × 1.280 = 61.440 sığar.

### Block Başına Shared Memory

Shared memory, SM'nin içinde bulunan ve bir block'un thread'lerinin paylaştığı hızlı bellektir. L40S'te bir SM'de bundan en fazla 100 KB vardır ve tek bir block en fazla 99 KB kullanabilir.

Her biri 40 KB shared memory kullanan 256 thread'lik (8 warp) block'lar düşün. 100 KB'a yalnızca 2 block sığar, yani SM 2 × 8 = 16 warp tutar, bu da 16 / 48 = %33 eder.

### Block Boyutu

L40S'te bir SM en fazla 24 block tutar. Çok küçük block'lar önce bu sınıra takılır. Block başına 32 thread (1 warp) ile 24 block yalnızca 24 warp verir, yani 24 / 48 = %50.

Büyük block'lar da yer israf edebilir. 1.024 thread'lik bir block 32 warp'tır. Yalnızca biri sığar, çünkü iki tanesi 64 warp ister, böylece SM 32 / 48 = %67 tutar. 128, 256 ya da 512 thread'lik block'lar 1.536'yı tam böler ve register'lar ile shared memory izin verirse %100'e ulaşabilir.

Üç sınırdan en düşüğü kazanır.

## Dallanma Ayrışması

Bir warp'ın 32 thread'i tek bir komut akışını paylaşır. Bir `if` bazı lane'leri bir yöne, geri kalanları öbür yöne gönderirse warp iki yolu art arda çalıştırır ve her yolda o yolu seçmeyen lane'ler boşta bekler. Buna dallanma ayrışması denir. Volta'dan beri her thread'in kendi program sayacı vardır. Böylece ayrışan thread'ler sırayla iç içe çalışabilir ve birbirini güvenle bekleyebilir, ama yollar yine de aynı anda çalışmaz. Ayrışma yalnızca aynı warp'taki lane'ler farklı yol seçtiğinde zaman kaybettirir. Bir warp'ın bütün lane'leri aynı dalı seçerse hiçbir maliyet yoktur.

## Daha Yüksek Doluluk Her Zaman Daha Hızlı Değildir

Doluluk oranı bir araçtır, amaç değil. Zamanlayıcıların bekleyişi örtecek kadar hazır warp'ı olduğunda, diyagramdaki altıncı warp'ın gösterdiği gibi, daha fazla warp hiçbir şeyi değiştirmez.

Bir warp gecikmeyi kendi başına da gizleyebilir. Sonraki komutları hâlâ yolda olan değere bağlı değilse zamanlayıcı onları göndermeye devam edebilir. Buna ILP denir. Daha fazla veriyi register'larda tutan ve her thread'e daha fazla bağımsız iş veren bir kernel, %33 doluluk oranında %100'deki daha basit bir kernel'den daha hızlı çalışabilir.

> [!WARNING]
> Doluluk oranını artırmak için bir kernel'i daha az register'a zorlamak onu yavaşlatabilir. Artık sığmayan değerler local memory'ye taşar. Local memory VRAM'dedir ve her taşma, gizlemek istediğin bellek trafiğinin ta kendisini ekler.

## Bunun CUDA İçin Önemi

Bir kernel'de yaptığın her seçim buna etki eder. Başlatırken seçtiğin block boyutu, derleyicinin kernel'ine verdiği register'lar ve tanımladığın shared memory, her SM'ye kaç warp sığacağını belirler. Belleği bekleyen bir kernel'in bu bekleyişi gizleyecek kadar warp'a ihtiyacı vardır. Bir kernel'in bellek mi yoksa hesap mı sınırlı olduğunu nasıl anlayacağını [Ders 09](../Lesson-09/notes.md) gösteriyor.

Block boyutunu 32'nin katı seç, böylece hiçbir warp kısmen boş kalmaz. L40S'te 128 ya da 256 iyi bir varsayılandır. Elinden geldiğince aynı warp'taki lane'leri aynı dalda tut.

> [!TIP]
> `nvcc -arch=sm_89 -Xptxas -v -o NAME NAME.cu` ile derlersen nvcc her kernel'in kullandığı register'ları ve shared memory'yi yazdırır. Bu sayılarla doluluk oranını yukarıdaki gibi elle hesaplayabilirsin.

## Özet

Bir warp, tek bir komutu birlikte çalıştıran 32 thread'dir. Her warp zamanlayıcı döngü başına bir warp komutu gönderir ve belleği bekleyen warp'ları hiçbir maliyet olmadan atlar, çünkü her warp kendi register'larını tutar. GPU'nun çekirdekten çok daha fazla thread istemesinin nedeni budur. Doluluk oranı kaç warp'ın yerleşik olduğunu ölçer. Register'lar, shared memory ve block boyutu onu sınırlar. Gecikmeyi gizlemek için yeterli doluluk gerekir, ama daha fazlası kendiliğinden daha hızlı demek değildir.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): bu serinin konusu olan, thread'leri paralel çalıştıran çok sayıda SM'den oluşan işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): bilgisayarın birkaç hızlı çekirdeği olan ana işlemcisi.
- SIMT (Single Instruction, Multiple Threads, tek komut çok thread): kodu tek bir thread için yazdığın, donanımın ise onu bir thread grubu için aynı anda çalıştırdığı NVIDIA çalışma modeli.
- SIMD (Single Instruction, Multiple Data, tek komut çok veri): CPU vektör birimlerindeki gibi, kısa bir değer vektörü üzerinde çalışan tek bir komut.
- kernel: GPU'da her thread için bir kez çalışan fonksiyon.
- thread: bir kernel'in kendi register'ları ve verisi olan tek bir örneği.
- warp: aynı komutu birlikte çalıştıran 32 thread'lik grup.
- lane: bir thread'in warp'ı içindeki 0'dan 31'e kadar olan konumu.
- block: aynı SM'de birlikte başlatılan ve shared memory kullanabilen thread grubu.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'yu oluşturan küçük işlemci. L40S'te 142 tane vardır.
- CC (compute capability, hesaplama yeteneği): bir GPU'nun özelliklerinin sürüm numarası, L40S'te 8.9.
- warp zamanlayıcı (warp scheduler): her saat döngüsünde hazır bir warp seçip bir sonraki komutunu gönderen birim. Bir Ada SM'sinde 4 tane vardır.
- gönderme (issue): bir warp'ın bir sonraki komutunu çalışmaya yollamak. Her warp zamanlayıcı döngü başına en fazla bir tane gönderir.
- yerleşik warp (resident warp): bir SM'nin aynı anda tuttuğu warp'lar, L40S'te en fazla 48.
- register: SM'deki en hızlı depolama. Her thread kendi değişkenlerini register'larda tutar.
- register dosyası: bir SM'nin bütün register'ları, L40S'te 65.536 tane 32 bitlik register.
- FP32 (32-bit floating point, 32 bit kayan nokta): GPU hesaplarının standart sayı biçimi.
- KB (kilobyte, kilobayt): 1.024 bayt.
- VRAM (GPU belleği): GPU kartındaki büyük bellek. Ondan bir okuma yüzlerce saat döngüsü sürer.
- duran warp (stall): örneğin belleği beklediği için bir sonraki komutunu gönderemeyen warp.
- gecikme gizleme (latency hiding): yavaş işlemler sürerken başka warp'lardan komut göndererek GPU'yu meşgul tutmak.
- doluluk oranı (occupancy): aktif warp'ların SM başına en fazla warp sayısına bölümü.
- shared memory: SM'nin içinde, bir block'un thread'lerinin paylaştığı hızlı bellek, L40S'te SM başına en fazla 100 KB.
- dallanma ayrışması (branch divergence): bir warp'ın lane'lerinin farklı yollar seçmesi, böylece warp'ın bu yolları art arda çalıştırması.
- program sayacı (program counter): bir sonraki komutun adresi. Volta'dan beri her thread'in kendine ait bir tane vardır.
- ILP (instruction-level parallelism, komut düzeyinde paralellik): tek bir thread içinde birbirini beklemeden gönderilebilen bağımsız komutlar.
- taşma (spill): register'lara artık sığmayan bir değerin VRAM'deki local memory'ye taşınması.
- local memory: VRAM'de bulunan, thread'e özel bellek. Taşan değerler için kullanılır.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın kendi GPU'larında çalışan programlar yazmak için sunduğu platform.
- nvcc (NVIDIA CUDA Compiler, NVIDIA CUDA derleyicisi): CUDA kodunu GPU programlarına çeviren derleyici. `-Xptxas -v` ona register kullanımını yazdırır.
