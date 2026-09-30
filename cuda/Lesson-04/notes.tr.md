# Ders 04: Yerleşik Değişkenler

Her kernel'ın salt okunur beş yerleşik değişkeni vardır: `gridDim`, `blockDim`, `blockIdx`, `threadIdx` ve `warpSize`. Bunları sen geçirmezsin ya da tanımlamazsın. Donanım, başlatma anında başlatma ayarına göre onları doldurur.

## gridDim

`gridDim`, her yöndeki block (blok) sayısını tutar. `<<<2, 4>>>` ile `gridDim.x` 2 olur, `gridDim.y` ve `gridDim.z` ise 1 olur. Grid boyutu başlatma anında sabitlenir, bu yüzden her thread (iş parçacığı) aynı `gridDim`'i görür.

## blockDim

`blockDim`, her yöndeki block başına thread sayısını tutar. `<<<2, 4>>>` ile `blockDim.x` 4 olur, `blockDim.y` ve `blockDim.z` ise 1 olur. Ders 02'deki global ID formülü onu kullanır: `blockIdx.x * blockDim.x + threadIdx.x`.

## blockIdx

`blockIdx`, thread'in bulunduğu block'un indeksidir. 2 block varsa `blockIdx.x`, block 0'daki tüm thread'ler için 0, block 1'deki tüm thread'ler için 1'dir. Her zaman `gridDim.x`'ten küçüktür.

## threadIdx

`threadIdx`, thread'in kendi block'u içindeki indeksidir. Her block'ta 0'dan yeniden başlar. 4 thread'lik bir block'ta `threadIdx.x` 0, 1, 2, 3 olur.

`gridDim`, `blockDim`, `blockIdx` ve `threadIdx`'in hepsi `.x`, `.y`, `.z` alanları olan `dim3` struct'larıdır. `<<<2, 4>>>` gibi düz sayılar yazarsan CUDA senin yerine `.y = 1` ve `.z = 1` yapar.

## warpSize

`warpSize`, warp başına thread sayısıdır. Bugünkü tüm GPU'larda 32'dir. Sabit bir değer değil de değişken olmasının sebebi, NVIDIA'nın gelecekteki bir mimaride bunu değiştirebilecek olmasıdır.

> [!TIP]
> Bugün 32 yazmak işe yarar. `warpSize`'ı okumak ise bu değer bir gün değişirse de doğru kalır.

## Donanım sınırları

Driver, bir kernel'ı çalıştırmadan önce başlatma ayarını donanım sınırlarıyla karşılaştırır. Değerlerden biri bile fazla büyükse kernel başlatılmaz. CC 3.0 ve sonrası (Kepler'den Blackwell'e) için sınırlar şunlar:

| Değişken      | Boyut          | En büyük değer |
|---------------|----------------|----------------|
| `gridDim.x`   | x'teki block   | 2^31 - 1       |
| `gridDim.y`   | y'deki block   | 65535          |
| `gridDim.z`   | z'deki block   | 65535          |
| `blockDim.x`  | x'teki thread  | 1024           |
| `blockDim.y`  | y'deki thread  | 1024           |
| `blockDim.z`  | z'deki thread  | 64             |
| thread/block  | toplam         | 1024           |

Değerlerin her biri tek tek kendi sınırının içinde olsa bile `blockDim.x * blockDim.y * blockDim.z` 1024'ü geçmemelidir. Bu, Ders 02'deki block başına 1024 thread sınırının aynısıdır.

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
- `__global__`, `printBuiltins`'i bir kernel olarak işaretler. GPU'da çalışır ve CPU'dan başlatılır.
- Kernel içindeki `printf` her thread için bir kez çalışır. Her `%d`, biçim metninin altında sıralanan alanlardan biriyle, aynı sırayla doldurulur.
- `printBuiltins<<<2, 4>>>()`, 4 thread'lik 2 block başlatır. Böylece kernel'ı 8 thread çalıştırır ve 8 satır yazdırılır.
- `cudaDeviceSynchronize()`, CPU'nun kernel bitene kadar beklemesini sağlar. Kernel başlatma hemen geri döner, bu yüzden bu bekleme olmazsa `main`, GPU çıktısı gelmeden bitebilir.

## Derle ve çalıştır

Kaynak dosyayı derleyip bir programa dönüştür, sonra yazdırılan değerleri görmek için çalıştır.

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc`, CUDA compiler'ıdır (derleyici).
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

Program aşağıdaki çıktıyı yazdırır. Her thread için bir tane olmak üzere 8 satır var.

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

`gridDim` ve `blockDim` her satırda aynı, çünkü başlatma ayarı tüm thread'ler için aynı. `blockIdx` block'a göre değişir. `threadIdx` thread'e göre değişir ve ikinci block'ta 0'dan yeniden başlar. `.y` ve `.z` boyutları 1, `.y` ve `.z` indeksleri 0, çünkü `<<<2, 4>>>` düz sayılar kullandı. `warpSize` her zaman 32.

Burada block 1, block 0'dan önce yazdırdı. GPU block'ları birbirinden bağımsız ve sabit olmayan bir sırayla çalıştırır. Bu yüzden block'ların sırası da, her block içindeki thread'lerin sırası da çalıştırmadan çalıştırmaya değişebilir.

## Görsel

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## Sözlük

- `gridDim`: her yöndeki (x, y, z) block sayısı. Başlatmadaki her thread için aynıdır.
- `blockDim`: her yöndeki block başına thread sayısı. Başlatmadaki her thread için aynıdır.
- `blockIdx`: thread'in bulunduğu block'un indeksi. Her yönde her zaman `gridDim`'den küçüktür.
- `threadIdx`: thread'in kendi block'u içindeki indeksi. Her block'ta sıfırdan yeniden başlar.
- `warpSize`: warp başına thread sayısı. Bugünkü donanımda her zaman 32'dir.
- `dim3`: `.x`, `.y`, `.z` tam sayı alanları olan bir CUDA struct'ı. Dört indeks ve boyut değişkeni bu türü kullanır. `<<<>>>` içindeki düz sayılar, `.y=1` ve `.z=1` olan bir `dim3`'e dönüşür.
