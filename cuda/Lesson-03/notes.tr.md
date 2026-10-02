# 03 > Compute Capability

Compute capability (CC, hesaplama yeteneği), bir GPU (Graphics Processing Unit, grafik işlem birimi) neslinin sürüm numarasıdır. Ders 00 ile 02 arasında gördüğün özellikleri ve donanım sınırlarını belirler, örneğin 32'lik warp boyutunu ve 1024 thread'lik block sınırını. Her CUDA (Compute Unified Device Architecture) özelliği en düşük bir compute capability ister. Bu yüzden bu sayı, kodunun neleri kullanabileceğini söyler.

## Sayı Ne Anlama Geliyor

Biçim major.minor'dır (ana.alt sürüm), örneğin Hopper için 9.0 veya bu derslerde kullanılan L40S için 8.9. Yeni bir major sürüm, yeni donanımlı yeni bir mimari neslidir. Yeni bir minor sürüm, aynı nesil içindeki bir revizyondur.

CC 7.0 için derlenen kod, CC'si 7.0 veya daha yüksek olan her GPU'da çalışır. CC 9.0 özelliklerini kullanan kod eski GPU'larda çalışmaz. Örneğin CC 8.0 isteyen bir program L40S'te çalışır (8.9, 8.0'dan yüksektir), ama CC 9.0 isteyen bir program çalışmaz.

<cc-explorer></cc-explorer>

> [!TIP]
> Kendi GPU'nun compute capability'sini bulmak için `nvidia-smi --query-gpu=name,compute_cap --format=csv` çalıştır.

## GPU Nesilleri

Tablo, Pascal'dan Blackwell'e kadar veri merkezi GPU'larını ve bu derslerdeki çıktıların alındığı L40S'i kapsar.

| Özellik                | P100 (CC 6.0)     | V100 (CC 7.0)     | A100 (CC 8.0)     | L40S (CC 8.9)     | H100 (CC 9.0)     | B100 (CC 10.0)    |
|------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| GPU                    | Tesla P100        | Tesla V100        | A100              | L40S              | H100              | B100              |
| Kod adı                | GP100             | GV100             | GA100             | AD102             | GH100             | GB100             |
| Mimari                 | Pascal            | Volta             | Ampere            | Ada Lovelace      | Hopper            | Blackwell         |
| Thread / Warp          | 32                | 32                | 32                | 32                | 32                | 32                |
| En fazla Warp / SM     | 64                | 64                | 64                | 48                | 64                | 64                |
| En fazla Thread / SM   | 2048              | 2048              | 2048              | 1536              | 2048              | 2048              |
| En fazla Block / SM    | 32                | 32                | 32                | 24                | 32                | 32                |
| En fazla Register / SM | 65536             | 65536             | 65536             | 65536             | 65536             | 65536             |
| En fazla Register / Block | 65536          | 65536             | 65536             | 65536             | 65536             | 65536             |
| En fazla Register / Thread | 255           | 255               | 255               | 255               | 255               | 255               |
| En fazla Block Boyutu  | 1024              | 1024              | 1024              | 1024              | 1024              | 1024              |
| FP32 Çekirdek / SM     | 64                | 64                | 64                | 128               | 128               | 128               |
| Shared Memory / SM     | 64 KB             | 96 KB'a kadar     | 164 KB'a kadar    | 100 KB'a kadar    | 228 KB'a kadar    | 228 KB'a kadar    |

SM, Streaming Multiprocessor (akış çoklu işlemcisi) demektir, yani GPU'nun içinde block'ların çalıştığı işlemci. FP32, 32-bit kayan noktalı sayı (floating point) demektir. KB ise kilobayt demektir.

H100 ve B100'ün SM başına thread ve bellek sınırları aynıdır. SM başına register sayısı bu nesiller boyunca hiç değişmedi.

<cc-progress></cc-progress>

> [!NOTE]
> Blackwell yine de Hopper'dan hızlıdır. Bunun nedenleri daha fazla SM (B200'de 148, H100 SXM5'te 132), 5. nesil Tensor Core'lar, daha hızlı HBM3e (High Bandwidth Memory, yüksek bant genişlikli bellek) ve NVIDIA'nın GPU'lar arası bağlantısı NVLink 5.0'dır.

## Warp Başına Thread

Warp, GPU'nun birlikte çalıştırdığı 32 thread'lik bir gruptur ([Ders 01](../Lesson-01/notes.md)). 32 sayısı donanım tarafından sabitlenmiştir ve compute capability spesifikasyonunun bir parçasıdır. GPU tek tek thread'leri asla zamanlamaz. Her zaman 32'lik tam warp'ları zamanlar.

32'lik warp boyutu, ilk CUDA GPU'larından (CC 1.0) beri değişmedi.

## SM Başına Warp ve Thread

SM, block'ların üzerinde çalıştığı fiziksel işlemcidir ([Ders 02](../Lesson-02/notes.md)). Tablodaki veri merkezi GPU'ları SM başına en fazla 64 aktif warp tutar, bu da 64 x 32 = 2048 thread eder. L40S farklıdır: CC 8.9, SM başına 48 warp'a izin verir, bu da 48 x 32 = 1536 thread eder.

Bazı warp'lar belleği beklerken warp zamanlayıcısı başka warp'ları seçebilir. Daha fazla aktif warp, yürütme birimlerini meşgul tutar, çünkü çalışmaya hazır bir warp'un bulunma ihtimali artar.

> [!WARNING]
> "SM başına 64 warp" her GPU için doğru değildir. CC 8.6, 8.9 ve 12.0 yalnızca 48'e izin verir. Planını buna göre yapmadan önce kendi GPU'nun sayısını kontrol et.

## Block Boyutu Sınırı

[Ders 02](../Lesson-02/notes.md)'de `<<<1, 2048>>>` derlendi ama hiçbir şey başlatmadı. Nedeni, en fazla 1024 olan block boyutudur. Bu, compute capability spesifikasyonunda sabit bir kuraldır ve tablonun her sütununda aynı 1024 değerini görürsün.

Sınır SM başına değil, block başınadır. Birkaç block'tan geldikleri sürece bir SM, tek bir block'un alabileceğinden daha fazla thread tutabilir. L40S'te bir SM'ye 1536 thread sığar, örneğin 512 thread'li 3 block olarak. A100'de 2048 thread sığar, örneğin 1024'lük 2 block olarak.

## SM Başına FP32 Çekirdek

FP32 (32-bit floating point, 32 bitlik kayan noktalı sayı), bildiğin `float` tipidir. Pascal, Volta ve Ampere veri merkezi GPU'larında SM başına 64 FP32 çekirdek vardır. Ada Lovelace (L40S), Hopper ve Blackwell'de 128 tane vardır. Daha fazla FP32 çekirdek, her SM'de saat döngüsü başına daha fazla kayan nokta işlemi demektir.

## SM Başına Shared Memory

Shared memory (paylaşımlı bellek), her SM'nin içindeki hızlı bir bellektir. Bir block'taki tüm thread'ler onu kullanabilir. Nesiller boyunca büyüdü:

- Pascal: 64 KB
- Volta: 96 KB'a kadar
- Ampere (A100): 164 KB'a kadar
- Ada Lovelace (L40S): 100 KB'a kadar
- Hopper ve Blackwell: 228 KB'a kadar

Daha fazla shared memory, bir kernel'ın global memory'ye (genel bellek) gitmek yerine daha fazla veriyi çipin üzerinde tutmasını sağlar.

## Sözlük

- compute capability (CC, hesaplama yeteneği): bir sürüm numarası (major.minor). Bir GPU'nun hangi CUDA özelliklerini desteklediğini ve donanım sınırlarının ne olduğunu söyler.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içindeki fiziksel işlemci. Tüm thread'ler SM'lerde çalışır.
- warp: GPU'nun birlikte zamanladığı ve çalıştırdığı 32 thread'lik grup.
- aktif warp (active warps per SM): bir SM'nin aynı anda tutabileceği warp sayısı. Çoğu veri merkezi GPU'sunda 64, CC 8.6, 8.9 ve 12.0'da 48.
- FP32 (32-bit floating point, 32 bitlik kayan noktalı sayı) çekirdeği: saat döngüsü başına bir adet 32 bitlik kayan nokta işlemi yapan donanım birimi.
- shared memory (paylaşımlı bellek): her SM'nin içinde, bir block'taki tüm thread'lerin paylaştığı hızlı, çip üstü bellek. Global (device) bellekten çok daha hızlıdır.
- register (yazmaç): SM'nin register file'ındaki hızlı bir depolama yeri, bir thread'in yerel bir değişkenini tutar. Bir SM'de 65536 adet 32 bitlik register vardır, bir thread en fazla 255 tanesini kullanabilir.
- KB (kilobayt): 1024 bayt.
- HBM (High Bandwidth Memory, yüksek bant genişlikli bellek): veri merkezi GPU'larındaki hızlı, üst üste yığılmış bellek.
- major sürüm (major version): CC'nin ilk sayısı, örneğin 8.9'daki 8. Yeni bir major sürüm, yeni bir mimari nesli demektir.
- minor sürüm (minor version): CC'nin ikinci sayısı, örneğin 8.9'daki 9. Aynı nesil içindeki bir revizyonu gösterir.
- mimari (architecture): bir GPU neslinin tasarımı. NVIDIA onlara bilim insanlarının adını verir: Pascal, Volta, Ampere, Ada Lovelace, Hopper, Blackwell.
- `nvidia-smi`: driver ile birlikte gelen NVIDIA komut satırı aracı. GPU'larını listeler, `--query-gpu=compute_cap` ile de compute capability'lerini yazdırır.
- warp boyutu (warp size): bir warp'taki thread sayısı, şimdiye kadarki her NVIDIA GPU'sunda 32. Kernel onu `warpSize` olarak okuyabilir.
- warp zamanlayıcı (warp scheduler): her SM'de çalışmaya hazır bir warp'ı seçen birim. Bir warp belleği beklerken başka bir warp'a geçer.
- block boyutu (thread block size): bir block'taki thread sayısı, `<<<blocks, threads>>>` içindeki ikinci sayı. Tablodaki her GPU'da en fazla 1024.
- saat döngüsü (clock cycle): işlemci saatinin bir tıklaması. 2 GHz'lik bir saatte saniyede 2 milyar döngü vardır.
- global memory (genel bellek): GPU'nun büyük ana belleği, L40S'te GDDR6, H100'de HBM. Her thread ona erişebilir, ama shared memory'den çok daha yavaştır.
