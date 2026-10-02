# 02 > İki Block, Her Birinde 1024 Thread

Bir block en fazla 1024 thread alabilir; daha fazla thread çalıştırmak için daha fazla block eklersin. Bu ders 2 block x 1024 thread = 2048 thread başlatıyor ve her thread'in bütün grid'de benzersiz bir ID'yi nasıl aldığını gösteriyor.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## 1024 Thread Sınırı

Tek bir block'ta en fazla 1024 thread olabilir. Bu, compute capability'nin sabit bir kuralıdır. Compute capability, GPU'nun sürüm numarasıdır; onu [Ders 03](../Lesson-03/notes.md)'te göreceksin. Bu sınır, 2010'dan beri üretilen her NVIDIA GPU'sunda 1024'tür.

Bu sınır, "bir SM'nin alabileceği en fazla thread" değildir. Bir SM, birkaç block'a dağılmış olarak aynı anda bundan daha fazla thread tutabilir. L40S'te bir SM en fazla 1536 thread tutar, örneğin 512'şer thread'li 3 block. A100 ya da H100 gibi veri merkezi GPU'larında bir SM en fazla 2048 thread tutar.

## Streaming Multiprocessor'lar

SM, GPU'nun içindeki fiziksel bir işlem birimidir. Her SM'de CUDA çekirdekleri, bir register file, shared memory, L1 cache ve warp zamanlayıcıları bulunur. Başlatma sırasında block'lar SM'lere dağıtılır. Bir SM, block'ların ne kadar kaynağa ihtiyaç duyduğuna bağlı olarak aynı anda bir ya da daha fazla block çalıştırabilir. Bir block her zaman tek bir SM'de kalır.

> [!NOTE]
> SM sayısı GPU'ya göre değişir: L40S'te 142, RTX 3080 gibi orta seviye bir GPU'da 68 SM vardır.

## Birden Fazla Block ile Thread ID'leri

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

Block 0'da 0-1023 arası thread'ler var; block 1'in de kendi 0-1023 arası thread'leri var. Thread ID'leri her block'ta 0'dan yeniden başlar. Bu yüzden `threadIdx.x` tek başına, ID'si 5 olan iki thread'i birbirinden ayıramaz. Benzersiz bir global ID almak için şu formülü kullan:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` yerleşik bir değişkendir ve başlatmada belirlenen block başına thread sayısını tutar; burada 1024'tür. Her block, kendisinden önceki block'ların bütün thread'lerini atlar:

- block 0'daki thread 5: 0 * 1024 + 5 = 5
- block 1'deki thread 5: 1 * 1024 + 5 = 1029
- block 1'deki thread 1023: 1 * 1024 + 1023 = 2047, 2048 thread'in sonuncusu

Küçük sayılarla görmek daha kolay. Block başına 4 thread varken block 2'deki thread 3, 2 * 4 + 3 = 11 alır. Global ID'ler block 0'da 0'dan 3'e, block 1'de 4'ten 7'ye, block 2'de 8'den 11'e gider. Kaydırıcıları oynat ve formülü sayılarıyla görmek için imleci bir thread'in üzerine getir:

<global-id></global-id>

Dizilerle çalışan kernel'lar, her thread'e bir eleman vermek için bu formülü kullanır: thread 1029, 1029. eleman üzerinde çalışır.

## Sessiz Hata: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

Bu satır hatasız derlenir, çünkü derleyici başlatma ayarını kontrol etmez. CUDA runtime onu kernel başlarken kontrol eder, tek bir block'ta 2048 thread görür ve kernel çağrısının tamamını iptal eder.

> [!WARNING]
> Geçersiz bir başlatma hiç çıktı vermez, çökmez ve hata mesajı da göstermez; program sadece biter. Hatayı görmek için başlatmanın hemen ardından `cudaGetLastError()`'ı çağır; burada hata `invalid configuration argument` olur. [Ders 08](../Lesson-08/notes.md) bunu bir `CHECK` makrosuyla yapıyor.

> [!TIP]
> Satırın başındaki yorumu kaldır, programı çalıştır ve çıktıyı karşılaştır.

## Block Zamanlaması

Block'ların SM'lerde çalışma sırası non-deterministic'tir, yani sabit değildir. Her block, kendisine yer olan bir SM'ye gider. Block 0 ve Block 1 aynı anda farklı SM'lerde çalışabilir. Bu yüzden çıktı satırları her çalıştırmada farklı bir sırayla karışır.

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

- Yorum satırı, yukarıda anlatılan geçersiz başlatmadır. Program çalışsın diye yorum olarak bırakıldı.
- `printIDs<<<2, 1024>>>();`, her biri 1024 thread'li 2 block başlatır. Bu, sınırın içinde kalır ve yine de 2048 thread çalıştırır.
- Geri kalanı [Ders 00](../Lesson-00/notes.md) ve [Ders 01](../Lesson-01/notes.md) ile aynıdır.

## Kod Gezintisi

Programı yazacağın sırayla adım adım geç. Yeni olan kısım, iki block ile başlatma.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header'lar.** Öncekiyle aynı üç `#include` satırı: CUDA runtime, yerleşik değişkenler ve `printf`. Block eklemek yeni bir header gerektirmez.
2. `5-8 gpu` **Kernel.** Block eklediğinde kernel değişmez. Her thread `blockIdx.x` ve `threadIdx.x`'i yazdırır; artık `blockIdx.x` 0 ya da 1 olur. `threadIdx.x`'in her block'ta 0'dan yeniden başladığını unutma: tek başına benzersiz değildir.
3. `10-11,15-16 cpu` **main fonksiyonu.** `main`'i, sonunda `return 0;` olacak şekilde yaz; başlatma satırları aralarına gelir.
4. `13 cpu` **2 block ile başlatma.** 2048 thread elde etmek için `<<<2, 1024>>>` yaz: 2 block çarpı 1024 thread. Kural: ikinci sayıyı 1024 ya da daha az tut, daha fazla thread gerekiyorsa ilk sayıyı artır.
5. `14 cpu` **GPU'yu bekle.** `cudaDeviceSynchronize();` iki block'u da bekler. Bu satır olmadan hiç çıktı görmeyebilirsin.
6. `12 cpu` **Geçersiz başlatma, yorum olarak.** Neyin yazılmaması gerektiğini hatırlatmak için bu satırı en son ekle. `<<<1, 2048>>>` derlenir ama runtime onu reddeder. `//`'yi kaldırırsan bu başlatma ne bir satır ne de bir hata mesajı yazdırır; bu yüzden hatayı gözden kaçırmak kolaydır.

</div>

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA derleyicisidir. Dosyanın hem CPU hem GPU kısmını derler.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Program, her thread için bir satır olmak üzere 2048 satır yazdırır. İşte ilk birkaçı:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- `...`, 2048 satırın geri kalanı yerine geçer.
- `Block ID` 0 ya da 1'dir, çünkü iki block var.
- 0'dan 1023'e kadar her `Thread ID` iki kez görünür, her block'ta bir kez; çünkü thread ID'leri her block'ta 0'dan yeniden başlar.
- Block 0 ile Block 1'in satırları karışır ve sıra çalıştırmadan çalıştırmaya değişir. Block Zamanlaması bölümünde anlatıldığı gibi, iki block aynı anda farklı SM'lerde çalışabilir.

## Kendin Yaz

Global thread ID'sini kendin hesapla, böylece grid'deki her thread benzersiz bir sayı alsın.

1. Aşağıdaki iskeletle `global_id.cu` oluştur.
2. Kernel'da `id`'yi bu dersteki formülle hesapla ve onu block ID'si ve thread ID'siyle birlikte yazdır.
3. 4 thread'li 3 block başlat.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void printGlobalIDs()
{
    // TODO: compute the global ID: block index times block size plus thread index
    // TODO: print "block b, thread t -> global ID id"
}

int main()
{
    // TODO: launch printGlobalIDs with 3 blocks of 4 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "İpucu"
    Formül `blockIdx.x * blockDim.x + threadIdx.x`. Başlatmada önce block sayısı gelir: `<<<3, 4>>>`.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void printGlobalIDs()
    {
        int id = blockIdx.x * blockDim.x + threadIdx.x;
        printf("block %d, thread %d -> global ID %d\n", blockIdx.x, threadIdx.x, id);
    }

    int main()
    {
        printGlobalIDs<<<3, 4>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    `nvcc -o global_id global_id.cu` ve `./global_id` ile derle ve çalıştır. 0'dan 11'e kadar her global ID'nin tam bir kez göründüğü 12 satır görmelisin, sabit olmayan bir sırayla. Block 2'deki thread 3, global ID 11'i yazdırır, çünkü 2 * 4 + 3 = 11.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içindeki fiziksel bir işlemci; block'lar SM'lerde çalışır. Yeterli kaynağı varsa bir SM aynı anda birkaç block çalıştırabilir.
- L1 cache (level 1 cache, birinci seviye önbellek): her SM'nin içinde, son kullanılan veriyi çekirdeklere yakın tutan küçük ve hızlı bir bellek.
- `blockDim.x`: block başına thread sayısını tutan yerleşik değişken. `<<<blocks, threads>>>` içindeki ikinci sayıdır.
- global thread ID: bütün grid'deki her thread için benzersiz bir ID; `blockIdx.x * blockDim.x + threadIdx.x` ile hesaplanır. Thread ID'leri block'lar arasında tekrar eder, global ID'ler etmez.
- `cudaGetLastError()`: son CUDA hata kodunu döndürür; mesaj vermeden iptal edilen geçersiz bir başlatma ayarı gibi sessiz hataları yakalar.
- non-deterministic (belirlenemez): sonuç ya da sıra önceden tahmin edilemez; block zamanlaması, başlatma anında hangi SM'de yer olduğuna bağlıdır.
- CPU (Central Processing Unit, merkezi işlem birimi): `main()`'i çalıştıran ve kernel'ları başlatan ana işlemci.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, kendi kodunu GPU'da çalıştırmanı sağlayan platformu.
- compute capability (hesaplama yeteneği): bir GPU neslinin sürüm numarası, L40S'te 8.9; block başına en fazla 1024 thread gibi sınırları belirler ([Ders 03](../Lesson-03/notes.md)).
- register file (yazmaç dosyası): her SM'de thread'lerin yerel değişkenlerini tutan hızlı depolama; L40S'te SM başına 65536 adet 32 bitlik register vardır.
- shared memory (paylaşımlı bellek): her SM'nin içinde, bir block'un thread'lerinin paylaşabildiği hızlı bellek.
- warp zamanlayıcı (warp scheduler): bir SM'de sıradaki warp'ı seçen birim; her SM'de birkaç tane vardır.
- block: bir SM'de çalışan, en fazla 1024 thread'lik grup; thread ID'leri her block'ta yeniden 0'dan başlar.
- grid: bir başlatmadaki tüm block'lar. `<<<2, 1024>>>`, 2 block'luk, toplam 2048 thread'lik bir grid oluşturur.
- `blockIdx.x`: thread'in bulunduğu block'un indeksi, bu derste 0 ya da 1.
- `threadIdx.x`: thread'in kendi block'u içindeki indeksi, burada 0 ile 1023 arası. Her block'ta 0'dan yeniden başlar.
- başlatma ayarı (launch configuration): `<<<blocks, threads>>>` içindeki iki sayı. Derleyici onları kontrol etmez, kernel başlarken CUDA runtime kontrol eder.
- CUDA runtime: programının GPU işi için çağırdığı kütüphane, örneğin `cudaDeviceSynchronize()`. Her başlatma ayarını da o kontrol eder.
- geçersiz başlatma (invalid launch): bir sınırı aşan başlatma, örneğin `<<<1, 2048>>>`. Kernel hiç çalışmaz; hatayı (`invalid configuration argument`) yalnızca `cudaGetLastError()` gösterir.
- `nvcc`: CUDA derleyicisi; bir `.cu` dosyasının CPU ve GPU kısımlarını tek bir programa derler.
- `-o`: çıkan programın adını belirler. O olmadan ad `a.out` olur.
