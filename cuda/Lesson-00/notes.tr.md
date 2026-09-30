# Ders 00: Bir Block, Bir Thread

Bu derste olabilecek en basit kernel'ı çalıştırıyoruz. Bir block ve bir thread kullanıyor, hiç paralellik yok. Böylece işler karmaşıklaşmadan ilk çıktıyı görebilirsin.

## GPU ve CPU

CPU'da bir fonksiyon tek bir çekirdekte bir kez çalışır. GPU'da ise bir kernel paralel olarak birçok kez çalışır. Her kopya kendi thread'inde (iş parçacığı) çalışır. Kaç thread çalışacağını iki sayı belirler. Bunlar block (blok) sayısı ve thread sayısıdır.

## `__global__` ne demek

```c
__global__ void printIDs() { ... }
```

`__global__`, bir fonksiyonu GPU kernel'ı olarak işaretler. Compiler (derleyici) onu CPU için değil, GPU için derler. Onu CPU çağırır, ama GPU'da çalışır. 
> [!NOTE]
> İki niteleyici daha var. `__device__` GPU'da çalışır ve yalnızca GPU kodundan çağrılabilir. `__host__` normal bir CPU fonksiyonudur ve yalnızca CPU'dan çağrılabilir.

## Başlatma ayarı `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

`<<<...>>>` sözdizimi çalıştırma ayarıdır (execution configuration). Fonksiyon adı ile argüman listesinin arasına yazılır. İlk sayı block sayısıdır. İkinci sayı block başına thread sayısıdır. `<<<1, 1>>>`, tek thread'li tek bir block demektir. Toplam thread sayısı 1 x 1 = 1'dir.

## Thread, Block, Grid

Her kernel başlatması üç seviye oluşturur:

- thread: en küçük birim. Bir thread, kernel'ın bir kopyasını çalıştırır.
- block: aynı fiziksel işlemcideki bir grup thread. Bellek paylaşabilirler.
- grid (ızgara): bir kernel başlatmasındaki tüm block'lar. Bir başlatma, bir grid.

<cuda-hierarchy></cuda-hierarchy>

## `blockIdx.x` ve `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x`, bu thread'in içinde bulunduğu block'un indeksidir. `threadIdx.x`, bu thread'in kendi block'u içindeki indeksidir. İkisinin de `.x`, `.y` ve `.z` parçaları var, çünkü grid'ler ve block'lar 1D, 2D veya 3D olabilir. 1D işlerde sadece `.x` kullanırsın. `<<<1, 1>>>` ile ikisi de her zaman 0'dır.

## Header dosyaları

- `cuda_runtime.h`: CUDA runtime API'si. `cudaDeviceSynchronize()` ve hata kontrol fonksiyonları bunun içinde.
- `stdio.h`: standart C, `printf` için gerekli.

> [!NOTE]
> MSVC ya da bazı IDE'leri kullanırken `device_launch_parameters.h`, kernel'ların içinde `blockIdx`, `threadIdx`, `blockDim` ve `gridDim`'i kullanılabilir hale getirir.

## `cudaDeviceSynchronize()`

Kernel başlatmaları asenkrondur. CPU kernel'ı başlatır ve hemen bir sonraki satıra geçer. `cudaDeviceSynchronize()` olmadan `main()` biter ve program, GPU daha hiçbir şey yazdırmadan kapanır. Bu fonksiyon, CPU'nun tüm GPU işleri bitene kadar beklemesini sağlar.

<kernel-sync></kernel-sync>

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
    printIDs<<<1, 1>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- Üç `#include` satırı, yukarıda anlatılan header'ları yükler.
- `printIDs` kernel'dır. Her thread kendi block ID'sini ve thread ID'sini yazdırır. Metnin başındaki `\n`, her satırın yeni bir satırda başlamasını sağlar.
- `printIDs<<<1, 1>>>();`, kernel'ı tek thread'li tek bir block ile başlatır.
- `cudaDeviceSynchronize();` GPU'yu bekler. Böylece yazdırılanlar program bitmeden ekrana gelir.

## Derle ve çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc`, CUDA compiler'ıdır. Dosyanın hem CPU kısmını hem GPU kısmını derler.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır. CUDA kaynak dosyaları `.cu` ile biter.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `./first_kernel` programı çalıştırır. `./`, shell'e programı bulunduğun klasörde aramasını söyler.

Program şunu yazdırır:

```
Block ID: 0  ===  Thread ID: 0
```

Tek satır var, çünkü tek thread var ve her thread bir kez yazdırır. İki ID de 0, çünkü tek block ve tek thread 0 indeksini alır. Çıktı her çalıştırmada aynıdır, çünkü tek thread'in yarışacağı başka bir thread yok.

## Görsel

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## Sözlük

- kernel: GPU'da çalışan bir fonksiyon. Onu bir kez yazarsın, GPU onu aynı anda birçok thread'de çalıştırır.
- thread: en küçük çalışma birimi. Bir thread, kernel'ın çalışan bir kopyasıdır ve kendi ID'si vardır.
- block: aynı fiziksel işlemcideki bir grup thread. Paylaşımlı bellek (shared memory) üzerinden veri paylaşabilirler.
- grid: tek bir kernel çağrısıyla başlatılan tüm block'lar.
- `__global__`: compiler'a bu fonksiyonun bir GPU kernel'ı olduğunu söyler. CPU onu çağırır, GPU çalıştırır.
- `blockIdx.x`: o anki thread'in içinde bulunduğu block'un indeksi. 0'dan başlar.
- `threadIdx.x`: o anki thread'in kendi block'u içindeki indeksi. 0'dan başlar.
- `cudaDeviceSynchronize()`: CPU'nun, GPU tüm işini bitirene kadar beklemesini sağlar.
- asenkron: CPU beklemez. GPU'ya bir komut gönderir ve hemen yoluna devam eder.
