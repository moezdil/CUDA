# 04 > Yerleşik Değişkenler

Her kernel'ın salt okunur beş yerleşik değişkeni vardır: `gridDim`, `blockDim`, `blockIdx`, `threadIdx` ve `warpSize`. Bunları ne parametre olarak verirsin ne de tanımlarsın; GPU (Graphics Processing Unit, grafik işlem birimi) başlatma anında, başlatma ayarına göre her thread için doldurur. Bu derste her thread beşini de yazdırıyor; böylece hangilerinin değiştiğini, hangilerinin aynı kaldığını görebilirsin.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## gridDim

`gridDim`, her yöndeki block sayısını tutar. `<<<2, 4>>>` ile `gridDim.x` 2, `gridDim.y` ve `gridDim.z` ise 1'dir. Grid boyutu başlatmada sabitlenir, bu yüzden her thread aynı `gridDim`'i görür.

## blockDim

`blockDim`, her yöndeki block başına thread sayısını tutar. `<<<2, 4>>>` ile `blockDim.x` 4, `blockDim.y` ve `blockDim.z` ise 1'dir. Her thread aynı `blockDim`'i görür.

[Ders 02](../Lesson-02/notes.md)'deki global ID formülü onu kullanır: `blockIdx.x * blockDim.x + threadIdx.x`. `<<<2, 4>>>` ile block 1'deki thread 3, 1 * 4 + 3 = 7 alır; bu, 8 thread'in sonuncusudur.

<global-id></global-id>

## blockIdx

`blockIdx`, thread'in bulunduğu block'un indeksidir. 2 block varken `blockIdx.x`, block 0'daki bütün thread'ler için 0, block 1'dekiler için 1'dir. Her zaman `gridDim.x`'ten küçüktür.

## threadIdx

`threadIdx`, thread'in kendi block'u içindeki indeksidir ve her block'ta 0'dan yeniden başlar. 4 thread'li bir block'ta `threadIdx.x` 0, 1, 2, 3 olur. Her zaman `blockDim.x`'ten küçüktür.

`gridDim`, `blockDim`, `blockIdx` ve `threadIdx`'in hepsinin `.x`, `.y`, `.z` alanları vardır; `gridDim` ve `blockDim` `dim3` tipindedir. `<<<2, 4>>>`'ü düz sayılarla yazarsan CUDA (Compute Unified Device Architecture) `.y = 1` ve `.z = 1` değerlerini senin yerine ayarlar. Yani `<<<2, 4>>>`, `<<<dim3(2, 1, 1), dim3(4, 1, 1)>>>` ile aynıdır.

## warpSize

`warpSize`, warp başına thread sayısıdır ve şimdiye kadarki her NVIDIA GPU'sunda 32'dir. CUDA onu sana bir değişken olarak verir, böylece kodunda 32 sayısını elle yazmak zorunda kalmazsın.

> [!TIP]
> Bugün 32 yazmak da işe yarar. Ama `warpSize`'ı okursan, ileride bir GPU başka bir boyut kullansa bile kodun doğru kalır.

## Donanım Sınırları

CUDA runtime, bir kernel'ı çalıştırmadan önce başlatma ayarını donanım sınırlarıyla karşılaştırır. Değerlerden biri fazla büyükse kernel başlamaz. Kepler'den Blackwell'e kadar, CC (compute capability, hesaplama yeteneği) 3.0 ve sonrası için sınırlar şunlardır:

| Değişken      | Boyut        | En fazla  |
|---------------|--------------|-----------|
| `gridDim.x`   | x'te block   | 2^31 - 1  |
| `gridDim.y`   | y'de block   | 65535     |
| `gridDim.z`   | z'de block   | 65535     |
| `blockDim.x`  | x'te thread  | 1024      |
| `blockDim.y`  | y'de thread  | 1024      |
| `blockDim.z`  | z'de thread  | 64        |
| thread/block  | toplam       | 1024      |

Her değer tek başına kendi sınırının içinde olsa bile `blockDim.x * blockDim.y * blockDim.z` 1024'ü geçmemelidir. Bu, [Ders 02](../Lesson-02/notes.md)'deki block başına 1024 thread sınırının ta kendisidir. İki örnek:

- `dim3(16, 16, 4)`: her değer kendi sınırının içinde ve 16 x 16 x 4 = 1024 thread. Geçerli.
- `dim3(32, 32, 2)`: her değer kendi sınırının içinde, ama 32 x 32 x 2 = 2048 thread. Geçersiz; kernel çalışmaz.

> [!WARNING]
> Bir sınırı aşan başlatma hiçbir mesaj vermeden derlenir ve çalışır, ama kernel hiç başlamaz. [Ders 08](../Lesson-08/notes.md)'deki gibi, başlatmadan sonra `cudaGetLastError()`'ı kontrol et.

Başlatmanın geçerli olup olmadığını görmek için kendi block ve grid boyutlarını gir:

<block-limits></block-limits>

## Kod

Bu program, her thread'in beş yerleşik değişkenin hepsini yazdırdığı tek bir kernel başlatır; böylece hangi değerlerin değiştiğini, hangilerinin aynı kaldığını görebilirsin.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printBuiltins()
{
    printf("\ngridDim=(%d,%d,%d)  blockDim=(%d,%d,%d)  blockIdx=(%d,%d,%d)  threadIdx=(%d,%d,%d)  warpSize=%d",
        gridDim.x,   gridDim.y,   gridDim.z,
        blockDim.x,  blockDim.y,  blockDim.z,
        blockIdx.x,  blockIdx.y,  blockIdx.z,
        threadIdx.x, threadIdx.y, threadIdx.z,
        warpSize);
}

int main()
{
    printBuiltins<<<2, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- İki CUDA header'ı, runtime fonksiyonlarını (`cudaDeviceSynchronize` gibi) ve yerleşik değişkenleri tanımlar; `stdio.h` ise `printf`'i sağlar.
- `__global__`, `printBuiltins`'i bir kernel olarak işaretler. GPU'da çalışır ve CPU'dan (Central Processing Unit, merkezi işlem birimi) başlatılır.
- Kernel içindeki `printf`, her thread için bir kez çalışır. Her `%d`, biçim metninin ardından sıralanan alanlardan biriyle, aynı sırayla doldurulur.
- `printBuiltins<<<2, 4>>>()`, 4'er thread'li 2 block başlatır. Yani kernel'ı 8 thread çalıştırır ve 8 satır yazdırılır.
- `cudaDeviceSynchronize()`, CPU'nun kernel bitene kadar beklemesini sağlar. Kernel başlatması hemen geri döner; bu bekleme olmadan `main`, GPU çıktısı görünmeden bitebilir.

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## Kod Gezintisi

Programı yazacağın sırayla adım adım geç. İşin çoğu uzun `printf` satırında: önce bir biçim metni, sonra her `%d` için bir değer.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header'lar.** Önceki derslerdeki üç `#include` satırının aynısı. `nvcc` ile yerleşik değişkenler için hiçbir header gerekmez, ama `device_launch_parameters.h` onları bazı editörlere de tanıtır.
2. `5-6,13 gpu` **Boş kernel.** `__global__ void printBuiltins()` ve süslü parantezlerini yaz. Kernel hiç argüman almaz, çünkü yazdırdığı her şey GPU'nun her thread için doldurduğu yerleşik bir değişkendir.
3. `7 gpu` **Biçim metni.** Metni 13 `%d` yer tutucusuyla yaz: dört değişkenin her biri için `.x`, `.y` ve `.z` olmak üzere 3, `warpSize` için de 1 tane. Her thread'in çıktısı kendi satırına gelsin diye metne `\n` ile başla. Değerler arkadan geleceği için satırı virgülle bitir.
4. `8-12 gpu` **Değerler.** 13 değeri yer tutucularla aynı sırayla listele; sırayı kontrol etmek kolay olsun diye her satıra bir değişken yaz. Kural: her `%d` için sırayla bir değer. Bir değeri unutursan kod yine derlenebilir ve `printf` yanlış sayılar yazdırır, bu yüzden iki tarafı da say.
5. `15-16,19-20 cpu` **main fonksiyonu.** `main`'i, sonunda `return 0;` olacak şekilde yaz; önceki derslerdekiyle aynı çerçeve.
6. `17 cpu` **Başlatma.** `<<<2, 4>>>`, `gridDim.x`'i 2'ye, `blockDim.x`'i 4'e ayarlar. Düz sayılar `.y` ve `.z` boyutlarını 1'de bırakır.
7. `18 cpu` **GPU'yu bekle.** `cudaDeviceSynchronize();` 8 satırın hepsi yazdırılana kadar programı açık tutar. Bu satır olmadan `main`, GPU çıktısı görünmeden bitebilir.

</div>

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA derleyicisidir.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Program, her thread için bir satır olmak üzere 8 satır yazdırır:

```
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(3,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(3,0,0)  warpSize=32
```

- `gridDim` ve `blockDim` her satırda aynıdır, çünkü başlatma ayarı bütün thread'ler için aynıdır.
- `blockIdx` block'a göre değişir. `threadIdx` thread'e göre değişir ve ikinci block'ta 0'dan yeniden başlar.
- `.y` ve `.z` boyutları 1, `.y` ve `.z` indeksleri ise 0'dır, çünkü `<<<2, 4>>>` düz sayılarla yazıldı.
- `warpSize` her zaman 32'dir.
- Burada block 1, block 0'dan önce yazdırdı. GPU block'ları birbirinden bağımsız ve sabit olmayan bir sırayla çalıştırır; bu yüzden block'ların ve her block'taki thread'lerin sırası çalıştırmadan çalıştırmaya değişebilir.

## Kendin Yaz

Bir başlatmanın boyutunu yerleşik değişkenlerden oku; boyutları da `dim3` değerleri olarak ver.

1. Aşağıdaki iskeletle `launch_size.cu` oluştur.
2. Satır bir kez görünsün diye yalnızca block 0'daki thread 0 yazdırsın.
3. Block sayısını, block başına thread sayısını, toplam thread sayısını ve warp boyutunu yazdır.
4. `dim3 grid(3)` ve `dim3 block(64)` ile başlat.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void launchSize()
{
    // TODO: only the first thread of the first block prints
    // TODO: print blocks, threads per block, total threads and warp size
}

int main()
{
    // TODO: make a dim3 grid of 3 blocks and a dim3 block of 64 threads
    // TODO: launch launchSize with them
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "İpucu"
    `blockIdx.x == 0 && threadIdx.x == 0` koşulunu kontrol et. Toplam thread sayısı `gridDim.x * blockDim.x`. Bir `dim3`, başlatmaya bir sayı gibi yazılır: `<<<grid, block>>>`.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void launchSize()
    {
        if (blockIdx.x == 0 && threadIdx.x == 0) {
            printf("blocks: %d, threads per block: %d, total threads: %d, warp size: %d\n",
                   gridDim.x, blockDim.x, gridDim.x * blockDim.x, warpSize);
        }
    }

    int main()
    {
        dim3 grid(3);
        dim3 block(64);
        launchSize<<<grid, block>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    `nvcc -o launch_size launch_size.cu` ve `./launch_size` ile derle ve çalıştır. Tek bir satır görmelisin: `blocks: 3, threads per block: 64, total threads: 192, warp size: 32`.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): `main()`'i çalıştıran ve kernel'ları başlatan ana işlemci.
- CC (compute capability, hesaplama yeteneği): bir GPU neslinin sürüm numarası; yukarıdaki tablodaki sınırları belirler ([Ders 03](../Lesson-03/notes.md)).
- `gridDim`: her yöndeki (x, y, z) block sayısı; başlatmadaki her thread için aynıdır.
- `blockDim`: her yöndeki block başına thread sayısı; başlatmadaki her thread için aynıdır.
- `blockIdx`: thread'in bulunduğu block'un indeksi; her yönde her zaman `gridDim`'den küçüktür.
- `threadIdx`: thread'in kendi block'u içindeki indeksi; her block'ta sıfırdan yeniden başlar.
- `warpSize`: warp başına thread sayısı; bugünkü bütün donanımlarda 32.
- `dim3`: grid ve block boyutları için kullanılan, `.x`, `.y`, `.z` tam sayı alanlarına sahip bir CUDA struct'ı; `<<<>>>` içindeki düz sayılar, `.y=1` ve `.z=1` olan bir `dim3`'e dönüşür.
- başlatma ayarı (launch configuration): bir başlatmanın `<<<blocks, threads>>>` kısmı; GPU onu `gridDim` ve `blockDim` içine kopyalar.
- grid: bir başlatmadaki bütün block'lar; boyutu `gridDim`'dir.
- warp: GPU'nun birlikte çalıştırdığı 32 thread'lik grup ([Ders 01](../Lesson-01/notes.md)).
- CUDA runtime: `cudaDeviceSynchronize()` gibi çağrıların arkasındaki kütüphane; başlatma ayarını donanım sınırlarıyla karşılaştırır.
- `cudaGetLastError()`: son CUDA hatasını döndürür; örneğin bir sınırı aşan başlatmanın hatasını.
- `__global__`: bir fonksiyonu kernel olarak işaretler; CPU onu başlatır, GPU çalıştırır.
- biçim metni (format string): `printf`'in ilk argümanı; içindeki her `%d`, sırayla bir sonraki argümanla değiştirilir.
- `cudaDeviceSynchronize()`: GPU işini bitirene kadar CPU'yu bekletir; başlatma tek başına hemen geri döner.
- `nvcc`: CUDA derleyicisi; bir `.cu` dosyasının CPU ve GPU kısımlarını tek bir programa derler.
- `-o`: çıkan programın adını belirler; o olmadan ad `a.out` olur.
