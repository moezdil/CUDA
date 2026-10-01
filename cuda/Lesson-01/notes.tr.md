# Ders 01: Bir Block, Dört Thread

Bu ders, [Ders 00](../Lesson-00/notes.md)'a tek bir değişiklik yapar. Thread sayısı 1'den 4'e çıkar, block sayısı 1 kalır. Dört thread aynı kernel'ı aynı anda çalıştırır ve her birinin `threadIdx.x` değeri farklıdır.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## Ne Değişiyor

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

GPU (Graphics Processing Unit, grafik işlem birimi), `printIDs`'in 4 kopyasını aynı anda çalıştırır. Her kopya kendi `threadIdx.x` değerini alır: 0, 1, 2 veya 3. `blockIdx.x` hepsi için 0'dır, çünkü hâlâ tek bir block var.

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## SIMT (Single Instruction, Multiple Threads)

4 thread'in hepsi aynı komutları çalıştırır, ama her birinin kendi ID'si ve kendi değişkenleri vardır. Thread 2, `threadIdx.x`'i okuyunca 2 alır, thread 3 ise 3 alır. Bu yüzden aynı `printf` satırı her thread'de farklı bir sayı yazdırır. Bu kernel'da thread'ler birbirini beklemez ve hiç veri paylaşmaz. Bu modele SIMT (Single Instruction, Multiple Threads, tek komut çoklu thread) denir.

## Warp'lar

GPU, thread'leri warp denen 32'lik gruplar halinde çalıştırır. Donanım tek tek thread'leri değil, warp'ları zamanlar. 4 thread başlattığında GPU 32 lane'li bir warp oluşturur, ama bunların sadece 4'ünü kullanır. Diğer 28 lane boşta kalır.

Bir block'un warp sayısı, thread sayısının 32'ye bölünüp yukarı yuvarlanmasıyla bulunur. Örneğin 100 thread'li bir block 4 warp'a ihtiyaç duyar: 32'lik üç tam warp (96 thread) ve sadece 4 aktif thread'i olan bir warp.

> [!TIP]
> 128 veya 256 gibi 32'nin katı olan bir block boyutu seç. O zaman hiçbir warp'ta boşta lane kalmaz.

> [!NOTE]
> Bir warp'taki thread'ler bir if/else'in farklı taraflarına giderse, GPU bu yolları art arda çalıştırır. Buna warp divergence (warp ayrışması) denir. Bu derste olmaz, çünkü 4 thread'in hepsi aynı satırı çalıştırır.

## Çıktı Sırası Neden Değişiyor

Kernel içindeki `printf` hemen yazdırmaz. Her thread kendi satırını GPU belleğindeki bir buffer'a (tampon) yazar. Buffer, CPU GPU'yu beklediğinde yazdırılır, burada `cudaDeviceSynchronize()`'da. Thread'lerin yazma sırası sabit değildir, tek bir warp'un içinde bile. Bu yüzden çıktı sırası çalıştırmadan çalıştırmaya değişebilir.

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

Bu, Ders 00'ın kodu, tek bir değişiklikle. Başlatma satırı artık `printIDs<<<1, 4>>>();`, yani kernel'ı dört thread çalıştırır.

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA (Compute Unified Device Architecture) compiler'ıdır. Dosyanın hem CPU (Central Processing Unit, merkezi işlem birimi) kısmını hem GPU kısmını derler.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Program, her thread için bir tane olmak üzere 4 satır yazdırır:

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- 4 satır var, çünkü 4 thread çalışır ve her biri bir kez yazdırır.
- `Block ID` her zaman 0, çünkü tek bir block var.
- 0'dan 3'e kadar her `Thread ID` tam bir kez görünür, çünkü her thread'in kendi `threadIdx.x` değeri var.
- Buradaki sıra 2, 0, 3, 1, ama senin çalıştırmanda başka bir sıra çıkabilir. Yukarıda anlatıldığı gibi, thread'ler printf buffer'ına sabit olmayan bir sırayla yazar.

## Dene

- Başlatmayı `<<<1, 32>>>` yap. 0'dan 31'e kadar thread ID'leriyle 32 satır alırsın, yine sabit olmayan bir sırayla. Bu tam olarak bir dolu warp'tur.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): `main()`'i çalıştıran ana işlemci.
- warp: GPU'nun tek bir birim olarak birlikte çalıştırdığı 32 thread'lik grup. GPU tek tek thread'leri değil, warp'ları zamanlar.
- lane: bir warp'taki 32 yuvadan biri. Her aktif lane bir thread çalıştırır.
- SIMT (Single Instruction, Multiple Threads, tek komut çoklu thread): bir warp'taki her aktif thread aynı komutu çalıştırır. Her thread'in kendi verisi ve kendi ID'si vardır.
- warp divergence (warp ayrışması): bir warp'taki thread'ler farklı yollara gider. Örneğin thread 0 bir if dalına girer, thread 1 girmez. GPU o zaman iki yolu art arda çalıştırır, bu da daha yavaştır.
- printf buffer'ı: GPU'daki `printf` doğrudan ekrana yazmaz. GPU belleğindeki bir buffer'a yazar. Buffer, CPU GPU'yu beklediğinde ekrana gelir, örneğin `cudaDeviceSynchronize()`'da.
