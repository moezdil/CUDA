# 03 > Compute Capability

Compute capability, bir GPU neslinin sürüm numarasıdır. Ders 00 ile 02 arasında gördüğün özellikleri ve donanım sınırlarını, örneğin 32'lik warp boyutunu ve 1024 thread'lik block sınırını, bu numara belirler. Her CUDA özelliği en az belirli bir compute capability ister; bu yüzden bu sayı, kodunun neleri kullanabileceğini söyler.

## Sayı Ne Anlama Geliyor

Biçim major.minor'dır, örneğin Hopper için 9.0 ya da bu derslerde kullanılan L40S için 8.9. Yeni bir major sürüm, yeni donanımla gelen yeni bir mimari nesli demektir; yeni bir minor sürüm ise aynı nesil içindeki bir revizyondur.

CC 7.0 için derlenen kod, CC'si 7.0 ya da daha yüksek olan her GPU'da çalışır; CC 9.0 özelliklerini kullanan kod ise eski GPU'larda çalışmaz. Örneğin CC 8.0 isteyen bir program L40S'te çalışır (8.9, 8.0'dan büyüktür), ama CC 9.0 isteyen bir program çalışmaz.

<cc-explorer></cc-explorer>

> [!TIP]
> Kendi GPU'nun compute capability'sini bulmak için `nvidia-smi --query-gpu=name,compute_cap --format=csv` çalıştır.

## GPU Nesilleri

Tablo, Pascal'dan Blackwell'e kadar veri merkezi GPU'larını ve bu derslerdeki çıktıların alındığı L40S'i gösteriyor.

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

SM, Streaming Multiprocessor demektir; GPU'nun içinde block'ların çalıştığı işlemcidir. FP32, 32 bitlik kayan noktalı sayı, KB ise kilobayt demektir.

H100 ve B100'ün SM başına thread ve bellek sınırları aynıdır. SM başına register sayısı ise bu nesiller boyunca hiç değişmedi.

<cc-progress></cc-progress>

> [!NOTE]
> Blackwell yine de Hopper'dan hızlıdır. Nedenleri: daha fazla SM (B200'de 148, H100 SXM5'te 132), 5. nesil Tensor Core'lar, daha hızlı HBM3e ve NVIDIA'nın GPU'lar arası bağlantısı NVLink 5.0.

## Warp Başına Thread

Warp, GPU'nun birlikte çalıştırdığı 32 thread'lik bir gruptur ([Ders 01](../Lesson-01/notes.md)). 32 sayısı donanımda sabittir ve compute capability tanımının bir parçasıdır. GPU tek tek thread'leri asla zamanlamaz, her zaman 32'lik warp'ların tamamını zamanlar.

32'lik warp boyutu, ilk CUDA GPU'larından (CC 1.0) beri değişmedi.

## SM Başına Warp ve Thread

SM, block'ların üzerinde çalıştığı fiziksel işlemcidir ([Ders 02](../Lesson-02/notes.md)). Tablodaki veri merkezi GPU'ları SM başına en fazla 64 aktif warp tutar, bu da 64 x 32 = 2048 thread eder. L40S farklıdır: CC 8.9, SM başına 48 warp'a izin verir, yani 48 x 32 = 1536 thread.

Bazı warp'lar belleği beklerken warp zamanlayıcısı başka warp'ları seçebilir. Aktif warp sayısı arttıkça çalışmaya hazır bir warp bulunma ihtimali de artar ve yürütme birimleri boş kalmaz.

> [!WARNING]
> "SM başına 64 warp" her GPU için doğru değildir: CC 8.6, 8.9 ve 12.0 yalnızca 48'e izin verir. Plan yapmadan önce kendi GPU'nun değerini kontrol et.

## Block Boyutu Sınırı

[Ders 02](../Lesson-02/notes.md)'de `<<<1, 2048>>>` derlendi ama hiçbir şey başlatmadı. Nedeni, en fazla 1024 olan block boyutu. Bu, compute capability tanımında sabit bir kuraldır; tablonun her sütununda aynı 1024 değerini görürsün.

Sınır SM başına değil, block başınadır. Bir SM, birkaç block'tan geldiği sürece tek bir block'un alabileceğinden daha fazla thread tutabilir. L40S'te bir SM'ye 1536 thread sığar, örneğin 512'şer thread'li 3 block olarak; A100'de ise 2048 thread sığar, örneğin 1024'er thread'li 2 block olarak.

## SM Başına FP32 Çekirdek

FP32, bildiğin `float` tipidir. Pascal, Volta ve Ampere veri merkezi GPU'larında SM başına 64, Ada Lovelace (L40S), Hopper ve Blackwell'de 128 FP32 çekirdek vardır. Daha fazla FP32 çekirdek, her SM'de saat döngüsü başına daha fazla kayan noktalı işlem demektir.

## SM Başına Shared Memory

Shared memory, her SM'nin içindeki hızlı bir bellektir ve bir block'taki bütün thread'ler onu kullanabilir. Nesiller boyunca büyüdü:

- Pascal: 64 KB
- Volta: 96 KB'a kadar
- Ampere (A100): 164 KB'a kadar
- Ada Lovelace (L40S): 100 KB'a kadar
- Hopper ve Blackwell: 228 KB'a kadar

Daha fazla shared memory, bir kernel'ın global memory'ye gitmek yerine daha fazla veriyi çipin üzerinde tutabilmesi demektir.

## Sözlük

- compute capability (CC, hesaplama yeteneği): bir sürüm numarası (major.minor); bir GPU'nun hangi CUDA özelliklerini desteklediğini ve donanım sınırlarını söyler.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içindeki fiziksel işlemci; bütün thread'ler SM'lerde çalışır.
- warp: GPU'nun birlikte zamanladığı ve çalıştırdığı 32 thread'lik grup.
- aktif warp (active warps per SM): bir SM'nin aynı anda tutabileceği warp sayısı; çoğu veri merkezi GPU'sunda 64, CC 8.6, 8.9 ve 12.0'da 48.
- FP32 (32-bit floating point, 32 bitlik kayan noktalı sayı) çekirdeği: saat döngüsü başına bir adet 32 bitlik kayan nokta işlemi yapan donanım birimi.
- shared memory (paylaşımlı bellek): her SM'nin içinde, bir block'taki bütün thread'lerin paylaştığı hızlı, çip üstü bellek; global (device) bellekten çok daha hızlıdır.
- register (yazmaç): SM'nin register file'ındaki hızlı bir depolama yeri; bir thread'in yerel bir değişkenini tutar. Bir SM'de 65536 adet 32 bitlik register vardır ve bir thread en fazla 255 tanesini kullanabilir.
- KB (kilobayt): 1024 bayt.
- HBM3e (High Bandwidth Memory 3e, yüksek bant genişlikli bellek): HBM'in yeni bir nesli; B200 gibi veri merkezi GPU'larındaki hızlı, üst üste yığılmış bellek.
- major sürüm (major version): CC'nin ilk sayısı, örneğin 8.9'daki 8; yeni bir major sürüm, yeni bir mimari nesli demektir.
- minor sürüm (minor version): CC'nin ikinci sayısı, örneğin 8.9'daki 9; aynı nesil içindeki bir revizyonu gösterir.
- mimari (architecture): bir GPU neslinin tasarımı. NVIDIA onlara bilim insanlarının adını verir: Pascal, Volta, Ampere, Ada Lovelace, Hopper, Blackwell.
- `nvidia-smi`: driver ile birlikte gelen NVIDIA komut satırı aracı; GPU'larını listeler, `--query-gpu=compute_cap` ile compute capability değerlerini de yazdırır.
- warp boyutu (warp size): bir warp'taki thread sayısı, şimdiye kadarki her NVIDIA GPU'sunda 32; kernel onu `warpSize` olarak okuyabilir.
- warp zamanlayıcı (warp scheduler): her SM'de çalışmaya hazır bir warp'ı seçen birim; bir warp belleği beklerken başka bir warp'a geçer.
- block boyutu (thread block size): bir block'taki thread sayısı, `<<<blocks, threads>>>` içindeki ikinci sayı; tablodaki her GPU'da en fazla 1024.
- saat döngüsü (clock cycle): işlemci saatinin bir tıkı; 2 GHz'lik bir saatte saniyede 2 milyar döngü vardır.
- global memory (genel bellek): GPU'nun büyük ana belleği; L40S'te GDDR6, H100'de HBM. Her thread ona erişebilir ama shared memory'den çok daha yavaştır.
- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran, binlerce küçük çekirdekli işlemci.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, kendi kodunu GPU'da çalıştırmanı sağlayan platformu.
