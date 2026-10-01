# Ders 07: Warp ID'leri

[Ders 01](../Lesson-01/notes.md) ve [Ders 02](../Lesson-02/notes.md), block ve thread ID'lerini anlattı. Bu ders warp'u ekliyor. Warp, GPU'nun (Graphics Processing Unit, grafik işlem birimi) gerçekte zamanladığı 32 thread'lik gruptur. Ders ayrıca bir thread'in kernel içinde kendi warp ID'sini ve lane ID'sini nasıl hesapladığını gösteriyor.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 çalışan bir NVIDIA L40S'ten geliyor.

## CUDA Hiyerarşisi

CUDA'daki (Compute Unified Device Architecture, birleşik hesaplama aygıt mimarisi) seviyeler şunlar: grid, grid'in içindeki block'lar, her block'un içindeki warp'lar ve her warp'un içindeki thread'ler:

<cuda-hierarchy warps></cuda-hierarchy>

Block sayısını ve block başına thread sayısını `<<<num_blocks, threads_per_block>>>` ile sen seçersin (bkz. [Ders 01](../Lesson-01/notes.md) ve [Ders 02](../Lesson-02/notes.md)). Warp boyutu NVIDIA GPU'larında her zaman 32'dir. Donanımda sabittir ve değiştirilemez. Warp, GPU'daki gerçek zamanlama birimidir. GPU thread'leri tek tek çalıştırmaz. Onları 32'lik gruplar halinde çalıştırır.

> [!NOTE]
> Warp sınırları donanıma bağlıdır. Bu değerler L40S'te `cudaGetDeviceProperties` ile ölçüldü:
>
> - Block başına en fazla warp: 32 (en fazla 1024 thread / 32, tüm GPU'lar için geçerli)
> - SM (Streaming Multiprocessor, akış çoklu işlemcisi) başına aynı anda en fazla warp: 48, yani 48 × 32 = 1536 thread
> - SM sayısı: 142
> - Tüm GPU'da aynı anda en fazla warp: 142 × 48 = 6,816
>
> L40S'in compute capability'si (CC, hesaplama yeteneği) 8.9. CC 8.6, 8.9 ve 12.0 olan GPU'lar SM başına 48 warp tutar. A100 (CC 8.0) ve H100 (CC 9.0) gibi veri merkezi GPU'ları ise SM başına 64 warp, yani 2048 thread tutar ([Ders 03](../Lesson-03/notes.md)).

## `warp_id` Yerleşik Bir Değişken Değil

`blockIdx.x` ve `threadIdx.x`, her thread için GPU tarafından doldurulur. Senin işin yalnızca onları okumak. Warp ID'si için böyle bir değişken yok. Onu kernel'ın içinde kendin hesaplarsın:

```c
int warp_id = threadIdx.x / 32;
```

İki taraf da tam sayı, bu yüzden `/` tam sayı bölmesidir ve kalan atılır. Her 32 thread'lik grubun aynı sonucu almasının sebebi bu. 128 thread'lik bir block'ta:

- 0-31 arası thread'ler → warp 0
- 32-63 arası thread'ler → warp 1
- 64-95 arası thread'ler → warp 2
- 96-127 arası thread'ler → warp 3

Bu, 128 / 32 = 4 warp eder.

## 1024 Thread ile Ne Olur

1024 thread'lik 1 block ile (`<<<1, 1024>>>`) warp ID'leri 0'dan 31'e gider. Bu doğru, çünkü 1024 / 32 = 32 warp. Her warp ID'sinde tam 32 thread var. Program şunu yazdırdı (kısaltılmış):

```
Block ID: 0 --- Thread ID:    0 --- Warp ID:  0
Block ID: 0 --- Thread ID:    1 --- Warp ID:  0
...
Block ID: 0 --- Thread ID:   31 --- Warp ID:  0
Block ID: 0 --- Thread ID:   32 --- Warp ID:  1
...
Block ID: 0 --- Thread ID:  992 --- Warp ID: 31
...
Block ID: 0 --- Thread ID: 1023 --- Warp ID: 31
```

Her `...`, atlanan satırların yerini tutar. Block ID'si her zaman 0, çünkü yalnızca bir block var. Warp ID'si thread 31 ile thread 32 arasında 0'dan 1'e geçer, çünkü 32 / 32 = 1. Son warp thread 992'de başlar, çünkü 992 / 32 = 31. Thread 1023 son thread'dir ve 1023 / 32 hâlâ 31'dir.

Makinede kontrol edildi: warp 0-31, her birinde tam 32 thread, toplam 1024 satır. Her warp ID'si için çıktı satırlarının bu sayımı bunu gösteriyor:

```
32 warp 0
32 warp 1
...
32 warp 31
```

Her satır önce bir sayı, sonra warp ID'sini veriyor. Her sayı 32, çünkü her warp tam 32 thread tutar. Böyle 32 satır var ve 32 × 32 = 1024.

## Warp ID'si Her Block'ta Sıfırlanır

Warp ID'si her block'ta sıfırdan başlar. `<<<2, 64>>>` ile her block'ta 64 thread, yani 2 warp vardır. Bu yüzden iki block'ta da bir warp 0 ve bir warp 1 bulunur. `warp_id = 0` iki kez görünür: bir kez block 0'da, bir kez block 1'de.

> [!WARNING]
> Warp ID'si tek başına, bir thread'in tüm başlatmadaki hangi warp'ta olduğunu söylemez. Onu her zaman block ID'siyle birlikte oku. Block 0'daki thread 40 ve block 1'deki thread 40, ikisi de warp ID'si olarak 40 / 32 = 1 alır. Ama farklı warp'lardadırlar.

## Lane ID

Her warp'ta 32 thread var. Bir thread'in kendi warp'u içindeki 0 ile 31 arasındaki konumu, onun lane ID'sidir. Onu bölmenin kalanını veren mod operatörüyle, `threadIdx.x % 32` ile bulursun. Bölme warp'u verir, kalan da warp'un içindeki yeri:

| `threadIdx.x` | warp ID (`/ 32`) | lane ID (`% 32`) |
|---|---|---|
| 0 | 0 | 0 |
| 31 | 0 | 31 |
| 32 | 1 | 0 |
| 33 | 1 | 1 |
| 70 | 2 | 6 |
| 127 | 3 | 31 |

Thread 70 için: 70 / 32 = 2, kalan 6, çünkü 2 × 32 + 6 = 70. Thread 0, 32 ve 64 farklı warp'lardadır ama hepsinin lane ID'si 0'dır. Yani mod, warp ID'sini vermez. Warp ID'si için bölme (`/`) gerekir.

Block boyutunu değiştirmek için kaydırıcıyı oynat. İki sayıyı da görmek için farenle bir thread'in üzerine gel:

<warp-lane></warp-lane>

## Kod

### `warp_ids.cu`

Kernel, 128 thread'lik 1 block ile çalışır. `test01` fonksiyonu GPU'da çalışır. Her thread `warp_id`'sini `threadIdx.x / 32` ile hesaplar ve block ID'sini, thread ID'sini ve warp ID'sini yazdırır. Başlatmadan sonra `cudaDeviceSynchronize()`, CPU'nun (Central Processing Unit, merkezi işlem birimi) GPU'yu beklemesini sağlar. Böylece program bittiğinde çıktı kaybolmaz.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 1 block, 128 threads -> 4 warps (IDs: 0,1,2,3)
    test01<<<1, 128>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `#include "cuda_runtime.h"`: CUDA fonksiyonları için header.
- `#include "device_launch_parameters.h"`: `blockIdx` ve `threadIdx` gibi GPU yerleşik değişkenlerini tanımlar.
- `#include <stdio.h>`: `printf` için standart C header'ı.
- `__global__`: fonksiyonu kernel olarak işaretler. CPU onu çağırır, GPU çalıştırır.
- `int warp_id = threadIdx.x / 32;`: her thread kendi warp ID'sini hesaplar. 0-31 arası thread'ler → 0, 32-63 arası thread'ler → 1, böyle devam eder.
- `printf(...)`: her thread block ID'sini, thread ID'sini ve warp ID'sini yazdırır.
- `test01<<<1, 128>>>();`: kernel'ı 128 thread'lik 1 block ile başlatır.
- `cudaDeviceSynchronize();`: tüm GPU thread'leri bitip çıktı yazılana kadar CPU'yu bekletir.

### `warp_ids_2blocks.cu`

Bu dosya `warp_ids.cu` ile aynı kernel'ı kullanır. Yalnızca başlatma ayarı farklı: `<<<2, 64>>>`. Bu, 64 thread'lik 2 block demek, yani her block'ta 64 / 32 = 2 warp var. Dosya, warp ID'sinin her block'ta sıfırlandığını gösteriyor.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 2 blocks, 64 threads/block -> 2 warps per block, warp ID resets per block
    test01<<<2, 64>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `test01<<<2, 64>>>();`: kernel'ı 64 thread'lik 2 block ile başlatır. Bu, 2 block'a bölünmüş toplam 128 thread ve 4 warp eder.
- Diğer tüm satırlar `warp_ids.cu` ile aynı.

## Derle ve Çalıştır

İki dosya da `code/` klasöründe. İki başlatma ayarını karşılaştırabilmek için her birini kendi programına derle ve çalıştır:

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

- `#` ile başlayan satırlar yorumdur. Shell onları yok sayar.
- `nvcc`, CUDA compiler'ıdır (derleyici).
- `-arch=sm_89`, compute capability 8.9, yani L40S için derler. Doğru mimari için derlenen kod, onun tüm özelliklerini kullanabilir.
- `-o warp_ids`, programa `warp_ids` adını verir. Bu olmadan ad `a.out` olur ve ikinci derleme ilk programın üzerine yazar.
- `warp_ids.cu`, kaynak dosyadır.
- `./warp_ids`, programı bulunduğun klasörden çalıştırır.

## Çıktı

### `<<<1, 128>>>`

Bu, `./warp_ids`'in çıktısı. Her thread için bir tane olmak üzere 128 satır ve 4 warp var. Bu gerçek L40S çıktısı. Thread sırası garanti olmadığı için aşağıdaki liste sıralanmış.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
Block ID: 0 --- Thread ID:  1 --- Warp ID: 0
Block ID: 0 --- Thread ID:  2 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
Block ID: 0 --- Thread ID: 33 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 0 --- Thread ID: 64 --- Warp ID: 2
...
Block ID: 0 --- Thread ID: 95 --- Warp ID: 2
Block ID: 0 --- Thread ID: 96 --- Warp ID: 3
...
Block ID: 0 --- Thread ID: 127 --- Warp ID: 3
```

Block ID'si her zaman 0, çünkü yalnızca bir block var. Warp ID'si thread 32, 64 ve 96'da birer artar, çünkü bunların her biri 32'nin yeni bir katıdır. Her `...`, atlanan satırların yerini tutar.

### `<<<2, 64>>>`

Bu, `./warp_ids_2blocks`'un çıktısı. 128 satır, 2 block ve block başına 2 warp var. Warp ID'si her block'ta sıfırlanır.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 1 --- Thread ID:  0 --- Warp ID: 0   <- resets to zero
...
Block ID: 1 --- Thread ID: 31 --- Warp ID: 0
Block ID: 1 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 1 --- Thread ID: 63 --- Warp ID: 1
```

Thread ID'si yalnızca 63'e kadar çıkar, çünkü her block'ta 64 thread var. Block 1 yeniden warp_id 0 gösterir, çünkü `threadIdx.x` her block'ta sıfırdan başlar ve warp ID'si ondan hesaplanır. Tüm GPU için genel bir warp numarası yoktur. `<- resets to zero` işareti elle eklendi. Program onu yazdırmaz.

## Görsel

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## Kendin Dene

- `test01<<<1, 100>>>()` başlat. 100, 32'nin katı değil, bu yüzden son warp yalnızca kısmen dolu olur: warp 0, 1 ve 2'de 32'şer thread var, warp 3'te ise yalnızca 96 ile 99 arası thread'ler var. GPU yine de onun için 32'lik tam bir warp zamanlar ve 28 lane boşta kalır.
- Kernel'a `int lane_id = threadIdx.x % 32;` ekle ve onu yazdır. Thread 70, lane ID olarak 6 yazdırmalı.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içinde block'ları ve onların warp'larını çalıştıran işlemci. L40S'te 142 tane var.
- warp: GPU'nun tek bir birim olarak çalıştırdığı 32 thread'lik grup. GPU tek tek thread'leri değil, warp'ları zamanlar.
- warp boyutu: NVIDIA GPU'larında her zaman 32. Yazılım onu değiştiremez.
- warp ID: bir thread'in kendi block'u içinde ait olduğu warp. Değeri `threadIdx.x / 32`.
- lane ID: bir thread'in kendi warp'u içindeki 0 ile 31 arası konumu. Değeri `threadIdx.x % 32`. Warp ID'sini vermez.
- block başına warp: `(block başına thread) / 32`. 128 thread/block → 4 warp/block.
- warp ID sıfırlanması: warp ID'leri, `threadIdx.x` gibi her block'ta sıfırdan başlar. Tüm GPU için genel bir warp ID'si yoktur.
