# 01 > Bir Block, Dört Thread

Bu ders [Ders 00](../Lesson-00/notes.md)'daki programda tek bir şeyi değiştiriyor: thread sayısı 1'den 4'e çıkıyor, block sayısı 1 kalıyor. Dört thread aynı kernel'ı aynı anda çalıştırır ve her birinin `threadIdx.x` değeri farklıdır.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## Ne Değişiyor

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

GPU (Graphics Processing Unit, grafik işlem birimi), `printIDs`'in 4 kopyasını aynı anda çalıştırır. Her kopya kendi `threadIdx.x` değerini alır: 0, 1, 2 ya da 3. `blockIdx.x` hepsi için 0'dır, çünkü hâlâ tek bir block var.

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## SIMT (Single Instruction, Multiple Threads)

4 thread'in hepsi aynı komutları çalıştırır, ama her birinin kendi ID'si ve kendi değişkenleri vardır. Thread 2, `threadIdx.x`'i okuyunca 2, thread 3 ise 3 alır. Bu yüzden aynı `printf` satırı her thread'de farklı bir sayı yazdırır. Bu kernel'da thread'ler birbirini beklemez ve veri paylaşmaz. Bu modele SIMT (Single Instruction, Multiple Threads, tek komut çoklu thread) denir.

## Warp'lar

GPU, thread'leri warp adı verilen 32'lik gruplar hâlinde çalıştırır. Donanım tek tek thread'leri değil, warp'ları zamanlar. 4 thread başlattığında GPU 32 lane'li bir warp oluşturur ama bunların yalnızca 4'ünü kullanır; diğer 28 lane boşta kalır.

Bir block'taki warp sayısı, thread sayısını 32'ye bölüp yukarı yuvarlayarak bulunur. Örneğin 100 thread'li bir block 4 warp'a ihtiyaç duyar: 32'şerlik üç tam warp (96 thread) ve yalnızca 4 aktif thread'i olan bir warp.

> [!TIP]
> 128 ya da 256 gibi 32'nin katı olan bir block boyutu seç; o zaman hiçbir warp'ta boşta lane kalmaz.

> [!NOTE]
> Bir warp'taki thread'ler bir if/else'in farklı dallarına giderse GPU bu yolları art arda çalıştırır. Buna warp divergence (warp ayrışması) denir. Bu derste olmaz, çünkü 4 thread'in hepsi aynı satırı çalıştırır.

## Çıktı Sırası Neden Değişiyor

Kernel içindeki `printf` hemen yazdırmaz. Her thread kendi satırını GPU belleğindeki bir buffer'a (tampon) yazar ve buffer, CPU GPU'yu beklediğinde (burada `cudaDeviceSynchronize()`'da) ekrana yazdırılır. Thread'lerin yazma sırası, tek bir warp'un içinde bile sabit değildir. Bu yüzden çıktı sırası çalıştırmadan çalıştırmaya değişebilir.

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

Bu, Ders 00'daki kodun tek bir değişiklikle aynısı: başlatma satırı artık `printIDs<<<1, 4>>>();`, yani kernel'ı dört thread çalıştırır.

## Kod Gezintisi

Programı yazacağın sırayla adım adım geç. Çoğu [Ders 00](../Lesson-00/notes.md)'daki programla aynı, bu yüzden odak başlatma satırında.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header'lar.** Ders 00'daki üç `#include` satırının aynısı. Çıkaramayacağın satır `stdio.h`'dir, çünkü kernel `printf`'i çağırır.
2. `5-8 gpu` **Kernel.** Kernel'ı tam olarak önceki gibi yaz. Daha fazla thread elde etmek için onu değiştirmen gerekmez: her thread aynı kodu çalıştırır ve kendi `threadIdx.x` değerini okur. Kural: kodu tek bir thread için yazarsın, kaç kopyanın çalışacağına başlatma karar verir.
3. `10-11,14-15 cpu` **main fonksiyonu.** Ders 00'daki gibi `main`'i, sonunda `return 0;` olacak şekilde yaz. Ortadaki iki satır, GPU ile konuşan tek host kodudur.
4. `12 cpu` **4 thread ile başlatma.** `<<<1, 4>>>` içindeki ikinci sayı block başına thread sayısıdır, yani 4 thread çalışır. Sık yapılan bir hata sayıların yerini karıştırmaktır: `<<<4, 1>>>` de 4 thread başlatır, ama 1 thread'li 4 block olarak; bu yüzden her `threadIdx.x` 0 olur.
5. `13 cpu` **GPU'yu bekle.** `cudaDeviceSynchronize();` CPU'yu bekletir; printf buffer'ı da bu anda ekrana yazılır. 4 satır sabit olmayan bir sırayla çıkar.

</div>

## Derle ve Çalıştır

İlk komut kodu derleyip bir programa dönüştürür. İkinci komut onu çalıştırır.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc`, CUDA (Compute Unified Device Architecture) derleyicisidir. Dosyanın hem CPU (Central Processing Unit, merkezi işlem birimi) hem GPU kısmını derler.
- `-o first_kernel`, programa `first_kernel` adını verir. Bu olmazsa adı `a.out` olur.
- `first_kernel.cu`, yukarıdaki kodu içeren kaynak dosyadır.
- `./first_kernel`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Program, her thread için bir satır olmak üzere 4 satır yazdırır:

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

## Kendin Dene

- Başlatmayı `<<<1, 32>>>` yap. 0'dan 31'e kadar thread ID'leriyle 32 satır görürsün, yine sabit olmayan bir sırayla. Bu, tam olarak bir dolu warp'tur.

## Kendin Yaz

Her thread'in kendi `threadIdx.x` değerini kullanarak farklı bir sonuç hesapladığı bir kernel yaz.

1. Aşağıdaki iskeletle `square.cu` oluştur.
2. Kernel'da `threadIdx.x`'i bir `i` değişkenine ata; `i` ve `i * i` değerlerini yazdır.
3. 5 thread'li 1 block başlat.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void square()
{
    // TODO: read this thread's ID into an int i
    // TODO: print "thread i: i * i = result"
}

int main()
{
    // TODO: launch square with 1 block of 5 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "İpucu"
    `int i = threadIdx.x;` her thread'e kendi `i` değerini verir. Block başına thread sayısı ikinci sayıdır: `<<<1, 5>>>`.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void square()
    {
        int i = threadIdx.x;
        printf("thread %d: %d * %d = %d\n", i, i, i, i * i);
    }

    int main()
    {
        square<<<1, 5>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    `nvcc -o square square.cu` ve `./square` ile derle ve çalıştır. 0'dan 4'e kadar her thread için bir tane olmak üzere 5 satır görmelisin, örneğin `thread 3: 3 * 3 = 9`. Satırların sırası çalıştırmadan çalıştırmaya değişebilir.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): `main()`'i çalıştıran ana işlemci.
- warp: GPU'nun tek bir birim olarak birlikte çalıştırdığı 32 thread'lik grup. GPU tek tek thread'leri değil, warp'ları zamanlar.
- lane: bir warp'taki 32 yuvadan biri. Her aktif lane bir thread çalıştırır.
- SIMT (Single Instruction, Multiple Threads, tek komut çoklu thread): bir warp'taki her aktif thread aynı komutu çalıştırır; her thread'in kendi verisi ve kendi ID'si vardır.
- warp divergence (warp ayrışması): bir warp'taki thread'ler farklı yollara gider. Örneğin thread 0 bir if dalına girer, thread 1 girmez. GPU o zaman iki yolu art arda çalıştırır, bu da daha yavaştır.
- printf buffer'ı: GPU'daki `printf` doğrudan ekrana yazmaz, GPU belleğindeki bir buffer'a yazar. Buffer, CPU GPU'yu beklediğinde, örneğin `cudaDeviceSynchronize()`'da, ekrana gelir.
- kernel: `__global__` ile işaretlenmiş, GPU'da çalışan fonksiyon. Bir başlatma, her thread için onun bir kopyasını çalıştırır.
- thread: kernel'ın çalışan bir kopyası. Kendi `threadIdx.x` değeri ve kendi değişkenleri vardır.
- block: birlikte başlatılan bir grup thread. `<<<1, 4>>>`, 4 thread'lik 1 block oluşturur.
- `threadIdx.x`: thread'in kendi block'u içindeki indeksi; 0'dan (block başına thread - 1)'e kadar, burada 0 ile 3 arası.
- `blockIdx.x`: thread'in bulunduğu block'un indeksi. Tek block varken her thread için 0'dır.
- başlatma (launch): bir kernel'ı GPU'da başlatan `name<<<blocks, threads>>>();` satırı. İlk sayı block sayısı, ikincisi block başına thread sayısıdır.
- `cudaDeviceSynchronize()`: GPU işini bitirene kadar CPU'yu bekletir. printf buffer'ı da bu anda ekrana gelir.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, kendi kodunu GPU'da çalıştırmanı sağlayan platformu.
- `nvcc`: CUDA derleyicisi; bir `.cu` dosyasının CPU ve GPU kısımlarını tek bir programa derler.
- `-o`: çıkan programın adını belirler. O olmadan ad `a.out` olur.
