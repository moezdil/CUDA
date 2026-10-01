# Ders 04: Yerleşik Değişkenler

Her kernel'ın salt okunur beş yerleşik değişkeni vardır: `gridDim`, `blockDim`, `blockIdx`, `threadIdx` ve `warpSize`. Bunları ne parametre olarak verirsin ne de tanımlarsın. GPU (Graphics Processing Unit, grafik işlem birimi), başlatma anında başlatma ayarına göre her thread için bunları doldurur. Bu ders beşini de her thread'den yazdırır. Böylece hangilerinin değiştiğini, hangilerinin aynı kaldığını görebilirsin.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## gridDim

`gridDim`, her yöndeki block sayısını tutar. `<<<2, 4>>>` ile `gridDim.x` 2'dir, `gridDim.y` ve `gridDim.z` ise 1'dir. Grid boyutu başlatmada sabitlenir, bu yüzden her thread aynı `gridDim`'i görür.

## blockDim

`blockDim`, her yöndeki block başına thread sayısını tutar. `<<<2, 4>>>` ile `blockDim.x` 4'tür, `blockDim.y` ve `blockDim.z` ise 1'dir. Her thread aynı `blockDim`'i görür.

[Ders 02](../Lesson-02/notes.md)'deki global ID formülü onu kullanır: `blockIdx.x * blockDim.x + threadIdx.x`. `<<<2, 4>>>` ile block 1'deki thread 3, 1 * 4 + 3 = 7 alır. Bu, 8 thread'in sonuncusudur.

<global-id></global-id>

## blockIdx

`blockIdx`, thread'in bulunduğu block'un indeksidir. 2 block varken `blockIdx.x`, block 0'daki tüm thread'ler için 0, block 1'deki tüm thread'ler için 1'dir. Her zaman `gridDim.x`'ten küçüktür.

## threadIdx

`threadIdx`, thread'in kendi block'u içindeki indeksidir. Her block'ta 0'dan yeniden başlar. 4 thread'li bir block'ta `threadIdx.x` 0, 1, 2, 3 olur. Her zaman `blockDim.x`'ten küçüktür.

`gridDim`, `blockDim`, `blockIdx` ve `threadIdx`'in hepsinin `.x`, `.y`, `.z` alanları vardır. `gridDim` ve `blockDim`, `dim3` tipindedir. `<<<2, 4>>>`'ü düz sayılarla yazarsan CUDA (Compute Unified Device Architecture) senin için `.y = 1` ve `.z = 1` ayarlar. Yani `<<<2, 4>>>`, `<<<dim3(2, 1, 1), dim3(4, 1, 1)>>>` ile aynıdır.

## warpSize

`warpSize`, warp başına thread sayısıdır. Şimdiye kadarki her NVIDIA GPU'sunda 32'dir. CUDA onu sana bir değişken olarak verir, böylece kodunda 32 sayısını elle yazmak zorunda kalmazsın.

> [!TIP]
> Bugün 32 yazmak işe yarar. `warpSize`'ı okumak ise gelecekteki bir GPU başka bir boyut kullansa bile kodunu doğru tutar.

## Donanım Sınırları

CUDA runtime, bir kernel'ı çalıştırmadan önce başlatma ayarını donanım sınırlarıyla karşılaştırır. Herhangi bir değer fazla büyükse kernel başlamaz. Kepler'den Blackwell'e kadar CC (compute capability, hesaplama yeteneği) 3.0 ve sonrası için sınırlar şunlardır:

| Değişken      | Boyut        | En fazla  |
|---------------|--------------|-----------|
| `gridDim.x`   | x'te block   | 2^31 - 1  |
| `gridDim.y`   | y'de block   | 65535     |
| `gridDim.z`   | z'de block   | 65535     |
| `blockDim.x`  | x'te thread  | 1024      |
| `blockDim.y`  | y'de thread  | 1024      |
| `blockDim.z`  | z'de thread  | 64        |
| thread/block  | toplam       | 1024      |

Her değer tek başına kendi sınırının içinde olsa bile `blockDim.x * blockDim.y * blockDim.z` 1024'ü geçmemelidir. Bu, [Ders 02](../Lesson-02/notes.md)'deki aynı block başına 1024 thread sınırıdır. İki örnek:

- `dim3(16, 16, 4)`: her değer kendi sınırının içinde ve 16 x 16 x 4 = 1024 thread. Geçerli.
- `dim3(32, 32, 2)`: her değer kendi sınırının içinde, ama 32 x 32 x 2 = 2048 thread. Geçersiz, kernel çalışmaz.

> [!WARNING]
> Bir sınırı aşan başlatma hiçbir mesaj vermeden derlenir ve çalışır, ama kernel hiç başlamaz. [Ders 08](../Lesson-08/notes.md)'de yapıldığı gibi, başlatmadan sonra `cudaGetLastError()`'ı kontrol et.

Başlatmanın geçerli olup olmadığını görmek için kendi block ve grid boyutlarını gir:

<block-limits></block-limits>

## Kod

Bu program, beş yerleşik değişkenin hepsini her thread'den yazdıran tek bir kernel başlatır. Böylece hangi değerlerin değiştiğini, hangilerinin aynı kaldığını görebilirsin.

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

- İki CUDA header'ı, runtime fonksiyonlarını (`cudaDeviceSynchronize` gibi) ve yerleşik değişkenleri tanımlar. `stdio.h`, `printf`'i sağlar.
- `__global__`, `printBuiltins`'i bir kernel olarak işaretler. GPU'da çalışır ve CPU'dan (Central Processing Unit, merkezi işlem birimi) başlatılır.
- Kernel içindeki `printf` her thread için bir kez çalışır. Her `%d`, biçim metninin altında sıralanan alanlardan biriyle, aynı sırayla doldurulur.
- `printBuiltins<<<2, 4>>>()`, 4 thread'li 2 block başlatır. Yani kernel'ı 8 thread çalıştırır ve 8 satır yazdırır.
- `cudaDeviceSynchronize()`, CPU'nun kernel bitene kadar beklemesini sağlar. Kernel başlatması hemen geri döner, bu yüzden bu bekleme olmadan `main`, GPU çıktısı görünmeden bitebilir.

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA compiler'ıdır.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Program, her thread için bir tane olmak üzere 8 satır yazdırır:

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

- `gridDim` ve `blockDim` her satırda aynıdır, çünkü başlatma ayarı tüm thread'ler için aynıdır.
- `blockIdx` block'a göre değişir. `threadIdx` thread'e göre değişir ve ikinci block'ta 0'dan yeniden başlar.
- `.y` ve `.z` boyutları 1, `.y` ve `.z` indeksleri ise 0'dır, çünkü `<<<2, 4>>>` düz sayılarla yazıldı.
- `warpSize` her zaman 32'dir.
- Burada block 1, block 0'dan önce yazdırdı. GPU block'ları birbirinden bağımsız ve sabit olmayan bir sırayla çalıştırır. Bu yüzden block'ların ve her block'un içindeki thread'lerin sırası çalıştırmadan çalıştırmaya değişebilir.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): `main()`'i çalıştıran ve kernel'ları başlatan ana işlemci.
- CC (compute capability, hesaplama yeteneği): bir GPU neslinin sürüm numarası. Yukarıdaki tablodaki sınırları belirler ([Ders 03](../Lesson-03/notes.md)).
- `gridDim`: her yöndeki (x, y, z) block sayısı. Başlatmadaki her thread için aynıdır.
- `blockDim`: her yöndeki block başına thread sayısı. Başlatmadaki her thread için aynıdır.
- `blockIdx`: thread'in bulunduğu block'un indeksi. Her yönde her zaman `gridDim`'den küçüktür.
- `threadIdx`: thread'in kendi block'u içindeki indeksi. Her block'ta sıfırdan yeniden başlar.
- `warpSize`: warp başına thread sayısı. Bugünkü tüm donanımlarda 32.
- `dim3`: grid ve block boyutları için kullanılan, `.x`, `.y`, `.z` tam sayı alanlarına sahip bir CUDA struct'ı. `<<<>>>` içindeki düz sayılar, `.y=1` ve `.z=1` olan bir `dim3`'e dönüşür.
