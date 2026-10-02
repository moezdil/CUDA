# 07 > Warp ID'leri

[Ders 01](../Lesson-01/notes.md) ve [Ders 02](../Lesson-02/notes.md) block ve thread ID'lerini anlattı. Bu ders, GPU'nun gerçekte zamanladığı 32 thread'lik grup olan warp'u ekliyor. Bir thread'in kernel içinde kendi warp ID'sini ve lane ID'sini nasıl hesapladığını da göreceksin.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## CUDA Hiyerarşisi

CUDA'daki seviyeler grid, grid'in içindeki block'lar, her block'un içindeki warp'lar ve her warp'un içindeki thread'lerdir.

<cuda-hierarchy warps></cuda-hierarchy>

Block sayısını ve block başına thread sayısını `<<<num_blocks, threads_per_block>>>` ile sen seçersin (bkz. [Ders 01](../Lesson-01/notes.md) ve [Ders 02](../Lesson-02/notes.md)). Warp boyutu ise NVIDIA GPU'larında her zaman 32'dir. Donanımda sabittir ve değiştirilemez. Warp, GPU'daki gerçek zamanlama birimidir. GPU thread'leri tek tek değil, 32'lik gruplar hâlinde çalıştırır.

> [!NOTE]
> Warp sınırları donanıma bağlıdır. Bu değerler L40S'te `cudaGetDeviceProperties` ile ölçüldü.
>
> - Bir block en fazla 32 warp tutar (en fazla 1024 thread / 32, tüm GPU'lar için geçerli)
> - Bir SM aynı anda en fazla 48 warp çalıştırır, yani 48 × 32 = 1536 thread
> - GPU'da 142 SM var
> - Tüm GPU aynı anda en fazla 142 × 48 = 6.816 warp çalıştırır
>
> L40S'in compute capability'si 8.9'dur. CC 8.6, 8.9 ve 12.0 olan GPU'lar SM başına 48 warp tutar. A100 (CC 8.0) ve H100 (CC 9.0) gibi veri merkezi GPU'ları ise SM başına 64 warp, yani 2048 thread tutar ([Ders 03](../Lesson-03/notes.md)).

## `warp_id` Yerleşik Bir Değişken Değil

`blockIdx.x` ve `threadIdx.x`, her thread için GPU tarafından doldurulur. Senin işin yalnızca onları okumak. Warp ID'si için böyle bir değişken yoktur, onu kernel'ın içinde kendin hesaplarsın.

```c
int warp_id = threadIdx.x / 32;
```

İki taraf da tam sayı olduğu için `/` tam sayı bölmesidir ve kalan atılır. Her 32 thread'lik grubun aynı sonucu almasının sebebi budur. 128 thread'lik bir block şöyle bölünür.

- 0-31 arası thread'ler → warp 0
- 32-63 arası thread'ler → warp 1
- 64-95 arası thread'ler → warp 2
- 96-127 arası thread'ler → warp 3

Bu, 128 / 32 = 4 warp eder.

## 1024 Thread ile Ne Olur

1024 thread'lik 1 block ile (`<<<1, 1024>>>`) warp ID'leri 0'dan 31'e gider. Bu doğru, çünkü 1024 / 32 = 32 warp eder ve her warp ID'sinde tam 32 thread vardır. Programın yazdırdığı çıktı aşağıda, kısaltılmış hâliyle.

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

Her `...`, atlanan satırların yerini tutar. Block ID'si her zaman 0'dır, çünkü yalnızca bir block var. Warp ID'si thread 31 ile thread 32 arasında 0'dan 1'e geçer, çünkü 32 / 32 = 1. Son warp thread 992'de başlar, çünkü 992 / 32 = 31. Thread 1023 son thread'dir ve 1023 / 32 hâlâ 31'dir.

Makinede kontrol edildi, warp'lar 0'dan 31'e, her birinde tam 32 thread, toplam 1024 satır. Her warp ID'si için çıktı satırlarını sayan şu döküm bunu gösteriyor.

```
32 warp 0
32 warp 1
...
32 warp 31
```

Her satırda önce bir sayı, sonra warp ID'si var. Her sayı 32'dir, çünkü her warp tam 32 thread tutar. Böyle 32 satır var ve 32 × 32 = 1024.

## Warp ID'si Her Block'ta Sıfırlanır

Warp ID'si her block'ta sıfırdan başlar. `<<<2, 64>>>` ile her block'ta 64 thread, yani 2 warp vardır. Bu yüzden iki block'ta da birer warp 0 ve warp 1 bulunur. `warp_id = 0` iki kez görünür, bir kez block 0'da, bir kez block 1'de.

> [!WARNING]
> Warp ID'si tek başına, bir thread'in bütün başlatmada hangi warp'ta olduğunu söylemez. Onu her zaman block ID'siyle birlikte oku. Block 0'daki thread 40 ile block 1'deki thread 40'ın ikisi de warp ID'si olarak 40 / 32 = 1 alır, ama farklı warp'lardadırlar.

## Lane ID

Her warp'ta 32 thread var. Bir thread'in kendi warp'u içindeki 0 ile 31 arasındaki konumu, onun lane ID'sidir. Onu bölmenin kalanını veren mod operatörüyle, `threadIdx.x % 32` ile bulursun. Bölme warp'u, kalan da warp'un içindeki yeri verir.

| `threadIdx.x` | warp ID (`/ 32`) | lane ID (`% 32`) |
|---|---|---|
| 0 | 0 | 0 |
| 31 | 0 | 31 |
| 32 | 1 | 0 |
| 33 | 1 | 1 |
| 70 | 2 | 6 |
| 127 | 3 | 31 |

Thread 70 için 70 / 32 = 2, kalan 6, çünkü 2 × 32 + 6 = 70. Thread 0, 32 ve 64 farklı warp'lardadır ama hepsinin lane ID'si 0'dır. Yani mod, warp ID'sini vermez. Warp ID'si için bölme (`/`) gerekir.

Block boyutunu değiştirmek için kaydırıcıyı oynat. İki sayıyı da görmek için imleci bir thread'in üzerine getir.

<warp-lane></warp-lane>

## Kod

### `warp_ids.cu`

Kernel, 128 thread'lik 1 block ile çalışır. `test01` fonksiyonu GPU'da çalışır. Her thread `warp_id`'sini `threadIdx.x / 32` ile hesaplar ve block ID'sini, thread ID'sini ve warp ID'sini yazdırır. Başlatmadan sonra `cudaDeviceSynchronize()`, CPU'nun GPU'yu beklemesini sağlar, böylece program bittiğinde çıktı kaybolmaz.

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

- `#include "cuda_runtime.h"`, CUDA fonksiyonları için header'dır.
- `#include "device_launch_parameters.h"`, `blockIdx` ve `threadIdx` gibi GPU yerleşik değişkenlerini tanımlar.
- `#include <stdio.h>`, `printf` için standart C header'ıdır.
- `__global__` fonksiyonu kernel olarak işaretler. CPU onu çağırır, GPU çalıştırır.
- `int warp_id = threadIdx.x / 32;` ile her thread kendi warp ID'sini hesaplar. 0-31 arası thread'ler → 0, 32-63 arası thread'ler → 1, ve böyle devam eder.
- `printf(...)` ile her thread block ID'sini, thread ID'sini ve warp ID'sini yazdırır.
- `test01<<<1, 128>>>();` kernel'ı 128 thread'lik 1 block ile başlatır.
- `cudaDeviceSynchronize();` bütün GPU thread'leri bitip çıktı yazılana kadar CPU'yu bekletir.

#### Kod Gezintisi

`warp_ids.cu`'yu yazacağın sırayla adım adım geç.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header'lar.** CUDA runtime, yerleşik değişkenler ve `printf` için `stdio.h`. Warp ID'si hesaplamak ek bir header gerektirmez.
2. `5-6,10 gpu` **Boş kernel.** `__global__ void test01()` ve süslü parantezlerini yaz. Kernel hiç argüman almaz, çünkü her şeyi `threadIdx.x`'ten hesaplar.
3. `7 gpu` **Warp ID'si.** Yerleşik bir warp ID'si yok, bu yüzden onu `int warp_id = threadIdx.x / 32;` ile hesapla. Tam sayı bölmesi thread'leri 32'şerli gruplara ayırır. Sık yapılan bir hata `/` yerine `%` kullanmaktır, oysa `threadIdx.x % 32` warp ID'sini değil, lane ID'sini verir.
4. `8-9 gpu` **Yazdırma.** Block ID'sini, thread ID'sini ve warp ID'sini yazdır. Warp ID'sini her zaman block ID'siyle birlikte yazdır, çünkü warp ID'si her block'ta yeniden başlar.
5. `12-13,17-18 cpu` **main fonksiyonu.** `main`'i, sonunda `return 0;` olacak şekilde yaz. Başlatma ve bekleme aralarına gelir.
6. `14-15 cpu` **Başlatma.** Önce planı yorum olarak yaz, 128 thread / 32 = 4 warp. Sonra `<<<1, 128>>>` başlatmasını yaz. 32'nin katı olan bir block boyutu her warp'u tam doldurur.
7. `16 cpu` **GPU'yu bekle.** Başlatmadan sonra `cudaDeviceSynchronize();` ekle. Bu satır 128 satırın hepsi yazdırılana kadar programı açık tutar.

</div>

### `warp_ids_2blocks.cu`

Bu dosya `warp_ids.cu` ile aynı kernel'ı kullanır, yalnızca `<<<2, 64>>>` başlatma ayarı farklı. Bu, 64 thread'lik 2 block demek, yani her block'ta 64 / 32 = 2 warp var. Dosya, warp ID'sinin her block'ta sıfırlandığını gösteriyor.

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

- `test01<<<2, 64>>>();` kernel'ı 64 thread'lik 2 block ile başlatır. 2 block'a bölünmüş toplam 128 thread ve 4 warp eder.
- Diğer tüm satırlar `warp_ids.cu` ile aynı.

#### Kod Gezintisi

`warp_ids_2blocks.cu` da aynı şekilde yazılır, yalnızca başlatma yeni.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header'lar.** `warp_ids.cu`'daki üç satırın aynısı. İkinci dosyaya ilkinin bir kopyası olarak başla.
2. `5-10 gpu` **Aynı kernel.** Tek bir karakter bile değişmez. Warp ID'si hiçbir ek kod olmadan her block'ta sıfırlanır, çünkü `threadIdx.x` her block'ta sıfırlanır.
3. `12-13,16-18 cpu` **Aynı main fonksiyonu.** `main`, bekleme ve `return 0;` olduğu gibi kalır. İki block ile de bekleme aynı derecede önemlidir.
4. `14-15 cpu` **Yeni başlatma.** `<<<2, 64>>>` yine 128 thread başlatır, ama 2'şer warp'lık 2 block olarak. Yorum beklenen sonucu yazar, böylece çıktıyı onunla karşılaştırabilirsin.

</div>

## Derle ve Çalıştır

İki dosya da `code/` klasöründe. İki başlatma ayarını karşılaştırabilmek için her birini ayrı bir programa derle ve çalıştır.

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

- `#` ile başlayan satırlar yorumdur, shell onları yok sayar.
- `nvcc`, CUDA derleyicisidir.
- `-arch=sm_89`, compute capability 8.9, yani L40S için derler. Doğru mimari için derlenen kod, o mimarinin bütün özelliklerini kullanabilir.
- `-o warp_ids`, programa `warp_ids` adını verir. Bu olmazsa ad `a.out` olur ve ikinci derleme ilk programın üzerine yazar.
- `warp_ids.cu`, kaynak dosyadır.
- `./warp_ids`, programı bulunduğun klasörden çalıştırır.

## Çıktı

### `<<<1, 128>>>`

Bu, `./warp_ids`'in çıktısı. Her thread için bir satır olmak üzere 128 satır ve 4 warp. Bu gerçek L40S çıktısıdır. Thread sırası garanti olmadığı için aşağıdaki liste sıralanmıştır.

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

Block ID'si her zaman 0'dır, çünkü yalnızca bir block var. Warp ID'si thread 32, 64 ve 96'da birer artar, çünkü bunların her biri 32'nin yeni bir katıdır. Her `...`, atlanan satırların yerini tutar.

### `<<<2, 64>>>`

Bu, `./warp_ids_2blocks`'un çıktısı. 128 satır ve 2 block var, block başına warp sayısı 2. Warp ID'si her block'ta sıfırlanır.

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

Thread ID'si yalnızca 63'e kadar çıkar, çünkü her block'ta 64 thread var. Block 1'de warp_id yeniden 0 olur, çünkü `threadIdx.x` her block'ta sıfırdan başlar ve warp ID'si ondan hesaplanır. Bütün GPU için genel bir warp numarası yoktur. `<- resets to zero` işareti elle eklendi, program onu yazdırmaz.

## Görsel

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## Kendin Dene

- `test01<<<1, 100>>>()` ile başlat. 100, 32'nin katı olmadığı için son warp yalnızca kısmen dolar. Warp 0, 1 ve 2'de 32'şer thread var, warp 3'te ise yalnızca 96 ile 99 arası thread'ler. GPU yine de onun için 32'lik tam bir warp zamanlar ve 28 lane boşta kalır.
- Kernel'a `int lane_id = threadIdx.x % 32;` ekle ve onu yazdır. Thread 70'in lane ID'si olarak 6 yazdırması gerekir.

## Kendin Yaz

Hem warp ID'sini hem lane ID'sini hesapla. Lane ID'sini kullanarak her warp'tan bir thread seç.

1. Aşağıdaki iskeletle `warp_starts.cu` oluştur.
2. Kernel'da `warp_id`'yi `/` ile, `lane_id`'yi `%` ile hesapla.
3. Her warp'un yalnızca lane 0'ı kendi block'unu, warp ID'sini ve thread ID'sini yazdırsın.
4. 96 thread'li 2 block başlat.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void warpStarts()
{
    // TODO: compute warp_id and lane_id from threadIdx.x
    // TODO: if this is lane 0, print "block b, warp w starts at thread t"
}

int main()
{
    // TODO: launch warpStarts with 2 blocks of 96 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "İpucu"
    `threadIdx.x / 32` warp ID'si, `threadIdx.x % 32` de lane ID'sidir. Bir warp'un ilk thread'inin lane ID'si 0'dır.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void warpStarts()
    {
        int warp_id = threadIdx.x / 32;
        int lane_id = threadIdx.x % 32;
        if (lane_id == 0) {
            printf("block %d, warp %d starts at thread %d\n", blockIdx.x, warp_id, threadIdx.x);
        }
    }

    int main()
    {
        warpStarts<<<2, 96>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    `nvcc -arch=sm_89 -o warp_starts warp_starts.cu` ve `./warp_starts` ile derle ve çalıştır. Herhangi bir sırayla 6 satır görmelisin. 2 block'un her birinde warp 0 thread 0'da, warp 1 thread 32'de ve warp 2 thread 64'te başlar.

## Sözlük

- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): bilgisayarın ana işlemcisi, kernel'ları başlatır ve GPU'yu bekler.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içinde block'ları ve onların warp'larını çalıştıran işlemci. L40S'te 142 tane var.
- warp: GPU'nun tek bir birim olarak çalıştırdığı 32 thread'lik grup. GPU tek tek thread'leri değil, warp'ları zamanlar.
- warp boyutu: NVIDIA GPU'larında her zaman 32, yazılım onu değiştiremez.
- warp ID: bir thread'in kendi block'u içinde ait olduğu warp. Değeri `threadIdx.x / 32`.
- lane ID: bir thread'in kendi warp'u içindeki 0 ile 31 arası konumu. Değeri `threadIdx.x % 32`. Warp ID'sini vermez.
- block başına warp: `(block başına thread) / 32`, yani 128 thread/block → 4 warp/block.
- warp ID sıfırlanması / sıfırlanır: warp ID'leri, `threadIdx.x` gibi her block'ta sıfırdan başlar. Bütün GPU için genel bir warp ID'si yoktur.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, kendi kodunu GPU'da çalıştırmanı sağlayan platformu.
- block: bir SM'de çalışan bir grup thread. Hiyerarşide grid ile warp'lar arasında durur.
- thread: kernel'ın çalışan bir kopyası, hiyerarşinin en alt seviyesi.
- `cudaGetDeviceProperties`: bir GPU'nun sınırlarını, örneğin `maxThreadsPerBlock` ve `multiProcessorCount` (SM sayısı) değerlerini bir `cudaDeviceProp` struct'ına dolduran runtime çağrısı.
- compute capability (CC, hesaplama yeteneği): bir GPU neslinin sürüm numarası, L40S'te 8.9 ([Ders 03](../Lesson-03/notes.md)).
- tam sayı bölmesi (integer division): tam sayılar arasındaki `/` kalanı atar, yani 70 / 32 = 2.
- mod operatörü (modulo, `%`): bir bölmenin kalanı. 70 % 32 = 6, çünkü 2 × 32 + 6 = 70.
- `__global__`: bir fonksiyonu kernel olarak işaretler. CPU onu başlatır, GPU çalıştırır.
- `cudaDeviceSynchronize()`: GPU işini bitirene kadar CPU'yu bekletir, böylece çıktı kaybolmaz.
- başlatma ayarı (launch configuration): bir başlatmanın `<<<blocks, threads>>>` sayıları.
- `nvcc`: CUDA derleyicisi. Bir `.cu` dosyasının CPU ve GPU kısımlarını tek bir programa derler.
- `-arch=sm_89`: compute capability 8.9 için, yani L40S için derler.
- `-o`: çıkan programın adını belirler. O olmadan ad `a.out` olur.
