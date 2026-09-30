# Ders 01: Bir Block, Dört Thread

Bu ders, Ders 00'da tek bir şeyi değiştiriyor. Thread (iş parçacığı) sayısı 1'den 4'e çıkıyor, block (blok) sayısı 1'de kalıyor. Dört thread aynı kernel'ı aynı anda çalıştırıyor ve her birinin `threadIdx.x` değeri farklı.

## Ne değişiyor

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

GPU, `printIDs`'in 4 kopyasını aynı anda çalıştırır. Her kopya kendi `threadIdx.x` değerini alır: 0, 1, 2 veya 3. `blockIdx.x` hepsinde 0'dır, çünkü hâlâ tek bir block var.

## SIMT (Single Instruction, Multiple Threads)

Her thread kendi başına çalışır. Thread'ler birbirini beklemez ve birlikte çalışmaz. Hepsi aynı komutları aynı anda çalıştırır, ama farklı ID değerleriyle. Bu modelin adı SIMT'dir (Single Instruction, Multiple Threads, yani tek komut, çok thread).

## Warp'lar

GPU, thread'leri warp adı verilen 32'lik gruplar halinde çalıştırır. Donanım block'ları değil, warp'ları zamanlar. 4 thread başlattığında GPU 32 şeritlik tam bir warp oluşturur, ama bunların sadece 4'ünü kullanır. Burada 4 thread aynı işi yapıyor, bu yüzden hepsi aynı yolda kalıyor.

> [!NOTE]
> Bir warp'taki thread'ler bir if/else'in farklı taraflarına giderse, GPU bu yolları sırayla, biri bittikten sonra diğerini çalıştırır. Buna warp divergence (warp ayrışması) denir. Bu derste bu olmaz.

## Çıktının sırası neden değişiyor

Kernel içindeki `printf` hemen yazdırmaz. Her thread, GPU belleğindeki ortak, döngüsel bir buffer'a yazar. Buffer, `cudaDeviceSynchronize()` çağrıldığında ekrana basılır. Thread'lerin yazma sırası sabit değildir, tek bir warp'ın içinde bile. Bu yüzden çıktının sırası her çalıştırmada değişir.

<printf-order threads="4"></printf-order>

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
    printIDs<<<1, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

Bu, Ders 00'daki kodun aynısı, tek bir farkla. Başlatma satırı artık `printIDs<<<1, 4>>>();`, yani kernel'ı dört thread çalıştırıyor.

## Derle ve çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc`, CUDA compiler'ıdır (derleyici). Dosyanın hem CPU kısmını hem GPU kısmını derler.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır. CUDA kaynak dosyaları `.cu` ile biter.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `./first_kernel` programı çalıştırır. `./`, shell'e programı bulunduğun klasörde aramasını söyler.

Program, her thread için bir tane olmak üzere 4 satır yazdırır:

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- 4 satır var, çünkü 4 thread çalışıyor ve her biri bir kez yazdırıyor.
- `Block ID` her zaman 0, çünkü tek bir block var.
- 0'dan 3'e kadar her `Thread ID` tam olarak bir kez görünüyor, çünkü her thread'in kendi `threadIdx.x` değeri var.
- Buradaki sıra 2, 0, 3, 1. Ama senin çalıştırmanda başka bir sıra çıkabilir. Yukarıda anlatıldığı gibi, thread'ler printf buffer'ına sabit olmayan bir sırayla yazar.

## Görsel

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## Sözlük

- warp: GPU'nun tek bir birim olarak birlikte çalıştırdığı 32 thread'lik grup. GPU tek tek thread'leri değil, warp'ları zamanlar.
- SIMT (Single Instruction, Multiple Threads): bir warp'taki her aktif thread, aynı saat döngüsünde aynı komutu çalıştırır. Her thread'in kendi verisi ve kendi ID'si vardır.
- warp divergence: bir warp'taki thread'lerin farklı yollara gitmesi. Örneğin thread 0 bir if dalına girer, thread 1 girmez. GPU o zaman iki yolu da sırayla çalıştırır, bu da daha yavaştır.
- printf buffer'ı: GPU'daki printf ekrana doğrudan yazmaz. GPU belleğindeki bir buffer'a yazar. Buffer ekrana ancak `cudaDeviceSynchronize()` çağırdığında gelir.
