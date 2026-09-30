# Ders 07: Warp ID'leri

Bu ders, CUDA hiyerarşisinin üçüncü seviyesi olan warp'ları anlatıyor. Ders-01 ve Ders-02, block (blok) ve thread (iş parçacığı) ID'lerini anlattı. Burada bir thread'in kernel içinde kendi warp'ını nasıl bulduğunu öğreneceksin.

> [!NOTE]
> Bu sayfadaki tüm çıktılar Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## CUDA Hiyerarşisi

CUDA'daki yazılım seviyeleri şunlar:

<cuda-hierarchy warps></cuda-hierarchy>

Block sayısını ve block başına thread sayısını `<<<num_blocks, threads_per_block>>>` ile sen seçersin (bkz. Ders-01, Ders-02). NVIDIA GPU'larında warp boyutu her zaman 32'dir. Donanımda sabittir ve değiştirilemez. GPU'daki gerçek zamanlama birimi warp'tır. GPU thread'leri tek tek çalıştırmaz. Onları 32'lik gruplar halinde çalıştırır.

> [!NOTE]
> Warp sınırları donanıma bağlıdır. Bu değerler L40S'te `cudaGetDeviceProperties` ile ölçüldü:
>
> - Block başına en fazla warp: 32 (en fazla 1024 thread / 32, tüm GPU'lar için geçerli)
> - SM başına aynı anda en fazla warp: 48
> - SM sayısı: 142
> - Tüm GPU'da aynı anda en fazla warp: 6.816

## warp_id Yerleşik Bir Değişken Değil

`blockIdx.x` ve `threadIdx.x`, her thread için GPU tarafından doldurulur. Sen sadece onları okursun. Warp ID için böyle bir değişken yok. Onu kernel içinde kendin hesaplarsın:

```c
int warp_id = threadIdx.x / 32;
```

İki taraf da tam sayı, bu yüzden `/` tam sayı bölmesidir ve kalan atılır. İşte bu yüzden her 32 thread'lik grup aynı sonucu alır. 128 thread'lik bir block'ta:

- thread 0-31 → warp 0
- thread 32-63 → warp 1
- thread 64-95 → warp 2
- thread 96-127 → warp 3

Bu, 128 / 32 = 4 warp eder.

## 1024 Thread ile Ne Olur

1024 thread'lik 1 block ile (`<<<1, 1024>>>`) warp ID'leri 0'dan 31'e gider. Bu doğrudur, çünkü 1024 / 32 = 32 warp. Her warp ID'de tam olarak 32 thread vardır. Program şunu yazdırdı (kısaltılmış):

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

Her `...`, çıkarılmış satırların yerine konmuştur. Block ID her zaman 0, çünkü tek bir block var. Warp ID, thread 31 ile thread 32 arasında 0'dan 1'e geçer, çünkü 32 / 32 = 1. Son warp thread 992'de başlar, çünkü 992 / 32 = 31. Thread 1023 son thread'dir ve 1023 / 32 yine 31'dir.

Makinede kontrol edildi: 0-31 arası warp'lar, her birinde tam 32 thread, toplam 1024 satır. Warp ID başına çıktı satırlarının bu sayımı bunu gösteriyor:

```
32 warp 0
32 warp 1
...
32 warp 31
```

Her satırda önce bir sayı, sonra warp ID var. Her sayı 32, çünkü her warp tam olarak 32 thread tutuyor. Bunun gibi 32 satır var ve 32 × 32 = 1024.

## Warp ID Her Block'ta Sıfırlanır

Warp ID her block'ta sıfırdan başlar. 2 block varsa iki block'ta da warp 0 ve warp 1 bulunur. Yani warp ID 0 tek başına sana block'u söylemez. Block ID'ye de ihtiyacın var. `<<<2, 64>>>` ile her block'ta 64 thread, yani 2 warp olur. `warp_id=0` iki kez görünür: bir kez block 0'da, bir kez block 1'de.

## Lane ID (Alıştırma)

Her warp'ta 32 thread var. Bir thread'in kendi warp'ı içindeki 0'dan 31'e kadar olan konumu, onun lane ID'sidir (şerit numarası). Onu mod operatörü `threadIdx.x % 32` ile bulursun. Örneğin thread 33, warp 1'dedir ve lane ID'si 1'dir (33 % 32 = 1). Thread 0, 32 ve 64 farklı warp'lardadır, ama hepsinin lane ID'si 0'dır. Yani mod işlemi warp ID'yi vermez. Warp ID için bölme (`/`) gerekir.

## Kod

Kernel, 128 thread'lik 1 block ile çalışır. `test01` fonksiyonu GPU'da çalışır. Her thread `warp_id`'sini `threadIdx.x / 32` ile hesaplar ve block ID'sini, thread ID'sini ve warp ID'sini yazdırır. Başlatmadan sonra `cudaDeviceSynchronize()`, CPU'nun GPU'yu beklemesini sağlar. Böylece program biterken çıktı kaybolmaz.

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

- `#include "cuda_runtime.h"`: CUDA fonksiyonlarının header'ı.
- `#include "device_launch_parameters.h"`: `blockIdx` ve `threadIdx` gibi GPU yerleşik değişkenlerini tanımlar.
- `#include <stdio.h>`: `printf` için standart C header'ı.
- `__global__`: fonksiyonu bir kernel olarak işaretler. CPU onu çağırır, GPU çalıştırır.
- `int warp_id = threadIdx.x / 32;`: her thread kendi warp ID'sini hesaplar. Thread 0-31 → 0, thread 32-63 → 1, ve böyle devam eder.
- `printf(...)`: her thread kendi block ID'sini, thread ID'sini ve warp ID'sini yazdırır.
- `test01<<<1, 128>>>();`: kernel'ı 128 thread'lik 1 block ile başlatır.
- `cudaDeviceSynchronize();`: CPU'nun, tüm GPU thread'leri bitene ve çıktı yazılana kadar beklemesini sağlar.

## warp_ids_2blocks.cu

Bu dosya, `warp_ids.cu` ile aynı kernel'ı kullanıyor. Sadece başlatma ayarı farklı: `<<<2, 64>>>`. Bu, 64 thread'lik 2 block demek, yani her block'ta 64 / 32 = 2 warp var. Dosya, warp ID'nin her block'ta sıfırlandığını gösteriyor.

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

- `test01<<<2, 64>>>();`: kernel'ı 64 thread'lik 2 block ile başlatır. Bu, 2 block'a bölünmüş toplam 128 thread ve 4 warp demek.
- Diğer tüm satırlar `warp_ids.cu`'dakiyle aynı.

## Derle ve Çalıştır

İki dosya da `code/` klasöründe. İki başlatma ayarını karşılaştırabilmek için her birini ayrı bir programa derle ve çalıştır:

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

- `#` ile başlayan satırlar yorumdur. Shell onları görmezden gelir.
- `nvcc`, CUDA compiler'ıdır (derleyici).
- `-arch=sm_89`, compute capability (hesaplama yeteneği) 8.9 için, yani L40S için derler. Doğru mimari için derlenen kod, o mimarinin tüm özelliklerini kullanabilir.
- `-o warp_ids`, programa `warp_ids` adını verir. Bu olmazsa adı `a.out` olur ve ikinci derleme ilk programın üzerine yazar.
- `warp_ids.cu`, kaynak dosyadır.
- `./warp_ids`, programı bulunduğun klasörden çalıştırır.

## Çıktı: `<<<1, 128>>>`

Bu, `./warp_ids`'in çıktısı. Her thread için bir tane olmak üzere 128 satır ve 4 warp var. Bu gerçek L40S çıktısı. Thread sırası garanti olmadığı için aşağıdaki liste sıralanmıştır.

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

Block ID her zaman 0, çünkü tek bir block var. Warp ID thread 32, 64 ve 96'da birer artıyor, çünkü bunların her biri 32'nin yeni bir katı. Her `...`, çıkarılmış satırların yerine konmuştur.

## Çıktı: `<<<2, 64>>>`

Bu, `./warp_ids_2blocks`'un çıktısı. 128 satır, 2 block ve block başına 2 warp var. Warp ID her block'ta sıfırlanıyor.

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

Thread ID sadece 63'e kadar gidiyor, çünkü her block'ta 64 thread var. Block 1'de warp_id yine 0 görünüyor, çünkü `threadIdx.x` her block'ta sıfırdan başlıyor ve warp ID ondan hesaplanıyor. Tüm GPU için global bir warp numarası yok. `<- resets to zero` işareti elle eklendi. Program bunu yazdırmıyor.
## Görsel

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## Sözlük

- warp: GPU'nun tek bir birim olarak çalıştırdığı 32 thread'lik grup. GPU tek tek thread'leri değil, warp'ları zamanlar.
- warp boyutu: NVIDIA GPU'larında her zaman 32. Yazılım bunu değiştiremez.
- warp ID: bir thread'in kendi block'u içinde ait olduğu warp. Değeri `threadIdx.x / 32`'dir.
- lane ID: bir thread'in kendi warp'ı içindeki 0'dan 31'e kadar olan konumu. Değeri `threadIdx.x % 32`'dir. Warp ID'yi vermez.
- block başına warp: `(block başına thread) / 32`. 128 thread/block → 4 warp/block.
- warp ID sıfırlanması: warp ID'leri, `threadIdx.x` gibi her block'ta sıfırdan başlar. Tüm GPU için global bir warp ID yoktur.
