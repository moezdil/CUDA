# Ders 02: İki Block, Her Birinde 1024 Thread

Bir block (blok) en fazla 1024 thread (iş parçacığı) alabilir. Daha fazla thread çalıştırmak için daha fazla block eklersin. Bu ders 2 block x 1024 thread = 2048 thread başlatıyor.

## 1024 thread sınırı

Bir block, tek bir streaming multiprocessor'a (SM) sığmak zorundadır. Bir SM'nin sabit sayıda register'ı (yazmaç), sabit miktarda paylaşımlı belleği ve sabit bir warp zamanlayıcı kapasitesi vardır. Bir block 1024'ten fazla thread isterse SM onu taşıyamaz. CUDA driver'ı da bu başlatmayı reddeder.

## Streaming Multiprocessor'lar (SM'ler)

SM, GPU'nun içindeki fiziksel işlem birimidir. Her SM'de CUDA core'lar, bir register dosyası, paylaşımlı bellek, L1 önbelleği ve warp zamanlayıcıları bulunur. Başlatma anında driver, block'ları boştaki SM'lere dağıtır. Bir SM, her block'un ne kadar kaynak istediğine bağlı olarak bir ya da daha fazla block çalıştırabilir.

> [!NOTE]
> SM sayısı GPU'ya göre değişir. RTX 3080 gibi orta seviye bir GPU'da 68 SM vardır.

## Birden fazla block ile thread ID'leri

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

Block 0'da 0-1023 arası thread'ler var. Block 1'in de kendi 0-1023 arası thread'leri var. Thread ID'leri her block'ta 0'dan yeniden başlar. Benzersiz bir global ID elde etmek için şu formülü kullan:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` yerleşik bir değişkendir. Başlatırken belirlenen block başına thread sayısını tutar. Burada bu sayı 1024. Diziler üzerinde çalışan kernel'lar, her thread'e bir eleman vermek için bu formülü kullanır.

## Sessiz hata: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

Bu satır hatasız derlenir. 1024 sınırını compiler değil, driver çalışma anında kontrol eder. Başlatma anında driver geçersiz ayarı görür ve kernel çağrısını tamamen düşürür. Ne çıktı olur, ne çökme, ne de hata mesajı. Bunu yakalamak için kernel'dan sonra `cudaGetLastError()` çağır.

> [!TIP]
> Satırın yorumunu kaldır, çalıştır ve çıktıyı karşılaştır.

## Block zamanlaması

Block'ların SM'lerde çalışma sırası belirsizdir (non-deterministic). Driver her block'u, ilk hangi SM boşalırsa ona verir. Block 0 ve Block 1 farklı SM'lerde aynı anda çalışabilir. Bu yüzden çıktı satırları her çalıştırmada farklı bir sırayla karışır.

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
    // printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit, launches nothing at runtime
    printIDs<<<2, 1024>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- Yorum satırı, yukarıdaki bölümde anlatılan geçersiz başlatmadır. Program çalışsın diye yorum olarak bırakıldı.
- `printIDs<<<2, 1024>>>();`, her birinde 1024 thread olan 2 block başlatır. Bu, sınırın içinde kalır ve yine de 2048 thread çalıştırır.
- Geri kalanı Ders 00 ve Ders 01'deki ile aynı.

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

Program, her thread için bir tane olmak üzere 2048 satır yazdırır. İlk birkaçı şöyle:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- `...`, 2048 satırın geri kalanı yerine konmuştur.
- `Block ID` 0 veya 1'dir, çünkü iki block var.
- 0'dan 1023'e kadar her `Thread ID` iki kez görünür, her block'ta bir kez. Thread ID'leri her block'ta 0'dan yeniden başlar.
- Block 0 ile Block 1'in satırları karışır ve sıra her çalıştırmada değişir. Block zamanlaması bölümünde anlatıldığı gibi, iki block farklı SM'lerde aynı anda çalışabilir.

## Görsel

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

## Sözlük

- SM (Streaming Multiprocessor): GPU'nun içindeki fiziksel işlemci. Block'lar SM'lerde çalışır. Yeterli kaynağı varsa bir SM aynı anda birkaç block çalıştırabilir.
- `blockDim.x`: block başına thread sayısını tutan yerleşik değişken. `<<<blocks, threads>>>` içindeki ikinci sayıdır.
- global thread ID: tüm grid içinde her thread'e ait benzersiz bir ID. Değeri `blockIdx.x * blockDim.x + threadIdx.x`'tir. Thread ID'leri block'lar arasında tekrar eder. Global ID'ler etmez.
- `cudaGetLastError()`: son CUDA hata kodunu döndürür. Driver'ın mesaj vermeden düşürdüğü geçersiz bir başlatma ayarı gibi sessiz hataları yakalar.
- belirsiz (non-deterministic): sonuç ya da sıra önceden tahmin edilemez. Block zamanlaması, başlatma anında hangi SM'nin boş olduğuna bağlıdır.
