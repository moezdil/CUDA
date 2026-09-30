# Ders 03: Compute Capability

Compute capability (hesaplama yeteneği, kısaca CC), bir GPU neslinin sürüm numarasıdır. Ders 00 ile 02 arasında gördüğün warp'lar ve 1024 thread'lik block sınırı gibi özellikleri ve donanım sınırlarını o belirler. Her CUDA özelliği, en az belirli bir compute capability ister.

## Numara ne anlama geliyor

Biçim major.minor şeklindedir, örneğin Hopper için 9.0. Yeni bir major sürüm, yeni donanımla gelen yeni bir mimari nesildir. Yeni bir minor sürüm ise aynı nesil içindeki bir revizyondur. CC 7.0 için derlenen kod, CC 7.0 veya daha yüksek her GPU'da çalışır. CC 9.0 özelliklerini kullanan kod eski GPU'larda çalışmaz.

<cc-explorer></cc-explorer>

## GPU nesilleri

Tablo, Pascal'dan Blackwell'e kadar veri merkezi GPU'larını kapsıyor.

> [!NOTE]
> Değerler NVIDIA CUDA Programming Guide, Blackwell Tuning Guide ve Hopper Tuning Guide'dan alındı (CUDA Toolkit 13.2, 2025-2026).

| Özellik                | P100 (CC 6.0)     | V100 (CC 7.0)     | A100 (CC 8.0)     | H100 (CC 9.0)     | B100 (CC 10.0)    |
|------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| GPU                    | Tesla P100        | Tesla V100        | A100              | H100              | B100              |
| Kod adı                | GP100             | GV100             | GA100             | GH100             | GB100             |
| Mimari                 | Pascal            | Volta             | Ampere            | Hopper            | Blackwell         |
| Thread / Warp          | 32                | 32                | 32                | 32                | 32                |
| Maks. Warp / SM        | 64                | 64                | 64                | 64                | 64                |
| Maks. Thread / SM      | 2048              | 2048              | 2048              | 2048              | 2048              |
| Maks. Block / SM       | 32                | 32                | 32                | 32                | 32                |
| Maks. Register / SM    | 65536             | 65536             | 65536             | 65536             | 65536             |
| Maks. Register / Block | 65536             | 65536             | 65536             | 65536             | 65536             |
| Maks. Register / Thread| 255               | 255               | 255               | 255               | 255               |
| Maks. Block Boyutu     | 1024              | 1024              | 1024              | 1024              | 1024              |
| FP32 Core / SM         | 64                | 64                | 64                | 128               | 128               |
| Paylaşımlı Bellek / SM | 64 KB             | 96 KB'a kadar     | 164 KB'a kadar    | 228 KB'a kadar    | 228 KB'a kadar    |

H100 ve B100'ün SM başına thread ve bellek sınırları aynı. SM başına thread ve register sayıları değişmedi.

> [!NOTE]
> Blackwell yine de Hopper'dan daha hızlı. Sebebi daha fazla SM (B200'de 148, H100 SXM5'te 132), 5. nesil Tensor Core'lar, HBM3e bant genişliği ve NVLink 5.0.

## Warp başına thread

Warp, GPU'nun birlikte çalıştırdığı 32 thread'lik bir gruptur (Ders-01). 32 sayısı donanım tarafından sabitlenmiştir ve compute capability tanımının bir parçasıdır. GPU hiçbir zaman tek tek thread'leri zamanlamaz. Her zaman 32'lik tam warp'ları zamanlar.

> [!NOTE]
> 32'lik warp boyutu, ilk CUDA GPU'larından (CC 1.0) beri hiç değişmedi.

## SM başına warp ve thread

SM, block'ların üzerinde çalıştığı fiziksel işlemcidir (Ders-02). Her SM en fazla 64 aktif warp, yani 2048 thread taşıyabilir. Bazı warp'lar belleği beklerken warp zamanlayıcısı başka warp'ları seçebilir. Daha fazla aktif warp, çalışma birimlerini meşgul tutar, çünkü çalışmaya hazır bir warp bulunma ihtimali artar.

## Block boyutu sınırı

Ders-02'de `<<<1, 2048>>>` derlendi ama hiçbir şey başlatmadı. Sebebi 1024'lük maksimum block boyutu. Bu, compute capability tanımından gelen katı bir sınır. Bir block tek bir SM'ye sığmak zorunda ve SM'nin sabit register bütçesi, tek bir block'un ne kadar büyük olabileceğini sınırlıyor.

## SM başına FP32 core

Pascal, Volta ve Ampere'de SM başına 64 FP32 core var. Hopper ve Blackwell'de 128. Daha fazla FP32 core, her SM'de saat döngüsü başına daha fazla kayan noktalı işlem demek.

## SM başına paylaşımlı bellek

Paylaşımlı bellek (shared memory), her SM'nin içindeki hızlı bellektir. Bir block'taki tüm thread'ler onu kullanabilir. Nesiller boyunca büyüdü:

- Pascal: 64 KB
- Volta: 96 KB'a kadar
- Ampere: 164 KB'a kadar
- Hopper ve Blackwell: 228 KB'a kadar

Daha fazla paylaşımlı bellek, bir kernel'ın global belleğe gitmek yerine daha fazla veriyi çipin üzerinde tutmasını sağlar.

## Görsel

<cc-progress></cc-progress>

## Sözlük

- compute capability: bir sürüm numarası (major.minor). Bir GPU'nun hangi CUDA özelliklerini desteklediğini ve donanım sınırlarının ne olduğunu söyler.
- SM (Streaming Multiprocessor): GPU'nun içindeki fiziksel işlemci. Tüm thread'ler SM'lerde çalışır.
- warp: GPU'nun birlikte zamanlayıp çalıştırdığı 32 thread'lik grup.
- FP32 core: saat döngüsü başına bir adet 32 bit kayan noktalı işlem yapan donanım birimi.
- paylaşımlı bellek: her SM'nin içinde, çipin üzerindeki hızlı bellek. Bir block'taki tüm thread'ler onu paylaşır. Global (device) bellekten çok daha hızlıdır.
- register dosyası: her SM'de, her thread'in yerel değişkenleri için ayrılmış hızlı depolama alanı. Gösterilen tüm nesillerde SM başına 65536 register vardır.
- CUDA Toolkit 12.8+: Blackwell (CC 10.0) için kod derlemek için gerekli.
