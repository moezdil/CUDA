# Ders 00: Bir Block, Bir Thread

Bu ders, olabilecek en basit CUDA (Compute Unified Device Architecture) programını çalıştırır. Kernel'ı bir block ve bir thread kullanır, hiç paralellik yoktur. Böylece işler karmaşıklaşmadan ilk çıktıyı görebilirsin. Sonraki her ders bu programı biraz değiştirir.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## GPU ve CPU

CPU'da (Central Processing Unit, merkezi işlem birimi) bir fonksiyon tek bir çekirdekte bir kez çalışır. GPU'da (Graphics Processing Unit, grafik işlem birimi) ise bir kernel paralel olarak birçok kez çalışır. Kernel, GPU'da çalışan bir fonksiyondur. Onun çalışan her kopyasına thread denir. Kaç thread çalışacağını iki sayı belirler: block sayısı ve block başına thread sayısı.

Örneğin her biri 3 thread'li 2 block, 2 x 3 = 6 thread başlatır. Bu 6 thread'in hepsi aynı kernel kodunu çalıştırır.

## `__global__` Ne Demek

```c
__global__ void printIDs() { ... }
```

`__global__`, bir fonksiyonu GPU kernel'ı olarak işaretler. Compiler (derleyici) onu CPU için değil, GPU için derler. Onu CPU çağırır, ama GPU'da çalışır.

> [!NOTE]
> İki niteleyici daha var. `__device__` GPU'da çalışır ve yalnızca GPU kodundan çağrılabilir. `__host__` normal bir CPU fonksiyonudur ve yalnızca CPU'dan çağrılabilir.

## Başlatma Ayarı `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

`<<<...>>>` sözdizimi, çalıştırma ayarıdır (execution configuration). Fonksiyon adı ile argüman listesinin arasına yazılır. İlk sayı block sayısıdır. İkinci sayı block başına thread sayısıdır. `<<<1, 1>>>`, tek thread'li tek bir block demektir. Toplam thread sayısı 1 x 1 = 1'dir.

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## Thread, Block, Grid

Her kernel başlatması üç seviye oluşturur:

- thread: en küçük birim. Bir thread, kernel'ın bir kopyasını çalıştırır.
- block: tek bir SM (Streaming Multiprocessor, akış çoklu işlemcisi) üzerinde çalışan bir grup thread. SM, GPU'nun içindeki birçok küçük işlemciden biridir. Bir block'un thread'leri bellek paylaşabilir.
- grid (ızgara): bir kernel başlatmasındaki tüm block'lar. Bir başlatma, bir grid.

<cuda-hierarchy></cuda-hierarchy>

> [!NOTE]
> Bir GPU'da birçok SM vardır. Bu derslerde kullanılan L40S'te 142 tane var. Bir block asla iki SM'ye bölünmez, ama farklı block'lar aynı anda farklı SM'lerde çalışabilir. [Ders 02](../Lesson-02/notes.md) bundan yararlanır.

## `blockIdx.x` ve `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x`, bu thread'in içinde bulunduğu block'un indeksidir. `threadIdx.x`, bu thread'in kendi block'u içindeki indeksidir. İkisi de 0'dan başlar. İkisinin de `.x`, `.y` ve `.z` parçaları vardır, çünkü grid'ler ve block'lar 1D, 2D veya 3D (bir, iki veya üç boyutlu) olabilir. 1D işlerde sadece `.x` kullanırsın. `<<<1, 1>>>` ile ikisi de her zaman 0'dır.

## Header Dosyaları

- `cuda_runtime.h`: CUDA runtime API'si (Application Programming Interface, uygulama programlama arayüzü). `cudaDeviceSynchronize()` ve hata kontrol fonksiyonları burada tanımlanır.
- `stdio.h`: standart C, `printf` için gerekli.
- `device_launch_parameters.h`: MSVC (Microsoft Visual C++) ya da bazı IDE'leri (Integrated Development Environment, tümleşik geliştirme ortamı) kullanırken `blockIdx`, `threadIdx`, `blockDim` ve `gridDim`'i editöre tanıtır. `nvcc` buna ihtiyaç duymaz, ama bir zararı da yoktur.

## `cudaDeviceSynchronize()`

Kernel başlatmaları asenkrondur. CPU kernel'ı başlatır ve hemen bir sonraki satıra geçer. `cudaDeviceSynchronize()` olmadan `main()` biter ve program, GPU daha hiçbir şey yazdırmadan kapanır. Bu fonksiyon, CPU'nun tüm GPU işleri bitene kadar beklemesini sağlar.

<kernel-sync></kernel-sync>

> [!WARNING]
> `cudaDeviceSynchronize()`'ı unutursan program yine hatasız derlenir ve çalışır. Sadece hiçbir şey yazdırmaz.

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

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA compiler'ıdır. Dosyanın hem CPU kısmını hem GPU kısmını derler.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır. CUDA kaynak dosyaları `.cu` ile biter.
- `./first_kernel` programı çalıştırır. `./`, shell'e programı bulunduğun klasörde aramasını söyler.

## Çıktı

```
Block ID: 0  ===  Thread ID: 0
```

- Tek satır var, çünkü tek thread var ve her thread bir kez yazdırır.
- İki ID de 0, çünkü tek block ve tek thread 0 indeksini alır.
- Çıktı her çalıştırmada aynıdır, çünkü tek thread'in yarışacağı başka bir thread yok.

## Sözlük

- CUDA (Compute Unified Device Architecture): NVIDIA'nın, kendi kodunu GPU'da çalıştırmanı sağlayan platformu.
- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran, binlerce küçük çekirdekli işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): ana işlemci. `main()`'i çalıştırır ve kernel'ları başlatır.
- kernel: GPU'da çalışan bir fonksiyon. Onu bir kez yazarsın, GPU onu aynı anda birçok thread'de çalıştırır.
- thread: en küçük çalışma birimi. Bir thread, kernel'ın çalışan bir kopyasıdır ve kendi ID'si vardır.
- block: tek bir SM üzerinde çalışan bir grup thread. Paylaşımlı bellek (shared memory) üzerinden veri paylaşabilirler.
- grid: tek bir kernel çağrısıyla başlatılan tüm block'lar.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içindeki işlemcilerden biri. Block'lar SM'lerde çalışır.
- `__global__`: compiler'a bu fonksiyonun bir GPU kernel'ı olduğunu söyler. CPU onu çağırır, GPU çalıştırır.
- `blockIdx.x`: o anki thread'in içinde bulunduğu block'un indeksi. 0'dan başlar.
- `threadIdx.x`: o anki thread'in kendi block'u içindeki indeksi. 0'dan başlar.
- `cudaDeviceSynchronize()`: CPU'nun, GPU tüm işini bitirene kadar beklemesini sağlar.
- asenkron: CPU beklemez. GPU'ya bir komut gönderir ve hemen yoluna devam eder.
- API (Application Programming Interface, uygulama programlama arayüzü): bir kütüphanenin sunduğu fonksiyonlar kümesi, burada CUDA runtime fonksiyonları.
