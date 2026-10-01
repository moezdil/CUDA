# Ders 02: İki Block, Her Birinde 1024 Thread

Bir block en fazla 1024 thread alabilir. Daha fazla thread çalıştırmak için daha fazla block eklersin. Bu ders 2 block x 1024 thread = 2048 thread başlatır ve her thread'in tüm grid'de benzersiz olan bir ID'yi nasıl aldığını gösterir.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## 1024 Thread Sınırı

Tek bir block'ta en fazla 1024 thread olabilir. Bu, compute capability'nin sabit bir kuralıdır. Compute capability, GPU'nun (Graphics Processing Unit, grafik işlem birimi) sürüm numarasıdır ve [Ders 03](../Lesson-03/notes.md)'te anlatılır. Bu sınır, 2010'dan beri üretilen her NVIDIA GPU'sunda 1024'tür.

Bu sınır "bir SM'nin alabileceği en fazla thread" değildir. Bir SM (Streaming Multiprocessor, akış çoklu işlemcisi), birkaç block'a dağılmış olarak aynı anda bundan daha fazla thread tutabilir. L40S'te bir SM en fazla 1536 thread tutar, örneğin her biri 512 thread'li 3 block. A100 veya H100 gibi veri merkezi GPU'larında bir SM en fazla 2048 thread tutar.

## Streaming Multiprocessor'lar (SM'ler)

SM, GPU'nun içindeki fiziksel bir işlem birimidir. Her SM'de CUDA (Compute Unified Device Architecture) çekirdekleri, bir register file (yazmaç dosyası), shared memory (paylaşımlı bellek), L1 cache (level 1 cache, birinci seviye önbellek) ve warp zamanlayıcıları bulunur. Başlatmada block'lar SM'lere dağıtılır. Bir SM, her block'un ne kadar kaynağa ihtiyaç duyduğuna bağlı olarak aynı anda bir veya daha fazla block çalıştırabilir. Bir block her zaman tek bir SM'de kalır.

> [!NOTE]
> SM sayısı GPU'ya göre değişir. L40S'te 142 SM vardır. RTX 3080 gibi orta seviye bir GPU'da 68 tane vardır.

## Birden Fazla Block ile Thread ID'leri

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

Block 0'da 0-1023 arası thread'ler var. Block 1'in de kendi 0-1023 arası thread'leri var. Thread ID'leri her block'ta 0'dan yeniden başlar. Bu yüzden `threadIdx.x` tek başına, ID'si 5 olan iki thread'i birbirinden ayıramaz. Benzersiz bir global ID almak için şu formülü kullan:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` yerleşik bir değişkendir. Başlatmada belirlenen block başına thread sayısını tutar. Burada 1024'tür. Her block, kendisinden önceki block'ların tüm thread'lerini atlar:

- block 0'daki thread 5: 0 * 1024 + 5 = 5
- block 1'deki thread 5: 1 * 1024 + 5 = 1029
- block 1'deki thread 1023: 1 * 1024 + 1023 = 2047, 2048 thread'in sonuncusu

Daha küçük sayılarla görmek daha kolay. Block başına 4 thread ile block 2'deki thread 3, 2 * 4 + 3 = 11 alır. Global ID'ler block 0'da 0'dan 3'e, block 1'de 4'ten 7'ye ve block 2'de 8'den 11'e gider. Kaydırıcıları oynat ve formülü sayılarıyla görmek için imleci bir thread'in üzerine getir:

<global-id></global-id>

Dizilerle çalışan kernel'lar, her thread'e bir eleman vermek için bu formülü kullanır. Thread 1029, 1029. eleman üzerinde çalışır.

## Sessiz Hata: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

Bu satır hatasız derlenir. Compiler başlatma ayarını kontrol etmez. CUDA runtime onu kernel başlarken kontrol eder, tek bir block'ta 2048 thread görür ve tüm kernel çağrısını iptal eder.

> [!WARNING]
> Geçersiz bir başlatma hiç çıktı vermez, çökmez ve hata mesajı göstermez. Program sadece biter. Hatayı görmek için başlatmanın hemen ardından `cudaGetLastError()`'ı çağır, burada hata `invalid configuration argument` olur. [Ders 08](../Lesson-08/notes.md) bunu bir `CHECK` makrosu ile yapar.

> [!TIP]
> Satırın yorumunu kaldır, çalıştır ve çıktıyı karşılaştır.

## Block Zamanlaması

Block'ların SM'lerde çalışma sırası non-deterministic'tir (belirlenemez), yani sabit değildir. Her block, ona yer olan bir SM'ye gider. Block 0 ve Block 1 aynı anda farklı SM'lerde çalışabilir. Bu yüzden çıktı satırları her çalıştırmada farklı bir sırayla karışır.

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

## Kod

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printIDs()
{
    printf("\nBlock ID: %d  ===  Thread ID: %d", blockIdx.x, threadIdx.x);
}

int main()
{
    // printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit, launches nothing at runtime
    printIDs<<<2, 1024>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- Yorum satırı, yukarıdaki bölümde anlatılan geçersiz başlatmadır. Program çalışsın diye yorum olarak kalır.
- `printIDs<<<2, 1024>>>();`, her biri 1024 thread'li 2 block başlatır. Bu, sınırın içinde kalır ve yine de 2048 thread çalıştırır.
- Geri kalanı [Ders 00](../Lesson-00/notes.md) ve [Ders 01](../Lesson-01/notes.md) ile aynıdır.

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA compiler'ıdır. Dosyanın hem CPU (Central Processing Unit, merkezi işlem birimi) kısmını hem GPU kısmını derler.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Program, her thread için bir tane olmak üzere 2048 satır yazdırır. İşte ilk birkaçı:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- `...`, 2048 satırın geri kalanı yerine geçer.
- `Block ID` 0 veya 1'dir, çünkü iki block var.
- 0'dan 1023'e kadar her `Thread ID` iki kez görünür, her block'ta bir kez. Thread ID'leri her block'ta 0'dan yeniden başlar.
- Block 0 ile Block 1'in satırları karışır ve sıra çalıştırmadan çalıştırmaya değişir. Block Zamanlaması bölümünde anlatıldığı gibi, iki block aynı anda farklı SM'lerde çalışabilir.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içindeki fiziksel bir işlemci. Block'lar SM'lerde çalışır. Yeterli kaynağı varsa bir SM aynı anda birkaç block çalıştırabilir.
- L1 cache (level 1 cache, birinci seviye önbellek): her SM'nin içinde, son kullanılan veriyi çekirdeklere yakın tutan küçük ve hızlı bir bellek.
- `blockDim.x`: block başına thread sayısını tutan yerleşik değişken. `<<<blocks, threads>>>` içindeki ikinci sayıdır.
- global thread ID: tüm grid'deki her thread için benzersiz bir ID. `blockIdx.x * blockDim.x + threadIdx.x` ile hesaplanır. Thread ID'leri block'lar arasında tekrar eder. Global ID'ler etmez.
- `cudaGetLastError()`: son CUDA hata kodunu döndürür. Mesaj vermeden iptal edilen geçersiz bir başlatma ayarı gibi sessiz hataları yakalar.
- non-deterministic (belirlenemez): sonuç veya sıra önceden tahmin edilemez. Block zamanlaması, başlatma anında hangi SM'de yer olduğuna bağlıdır.
