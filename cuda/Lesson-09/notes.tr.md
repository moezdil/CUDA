# 09 > Çok Sayıda Block, Grid Boyutu ve Zaman Ölçümü

[Ders 08](../Lesson-08/notes.md), 1024 elemanlı iki vektörü tek bir block ile topladı. Bu derste boyut iki katına, 2048 elemana çıkıyor ve bunu tek bir block karşılayamıyor. Neredeyse her CUDA kernel'ının kullandığı index formülünü, her vektör uzunluğu için grid boyutunu nasıl seçeceğini, başlattığın işin gerçekte kaç SM'yi (Streaming Multiprocessor, akış çoklu işlemcisi) meşgul ettiğini ve bir kernel'ın süresini kendini kandırmadan nasıl ölçeceğini öğreniyorsun.

> [!NOTE]
> Kod, Ubuntu 24 üzerinde CUDA 13'ü ve bu derslerde kullanılan NVIDIA L40S'i (CC 8.9, 142 SM) hedefliyor. Süreler GPU'ya bağlı, bu yüzden programı kendi GPU'nda çalıştır ve ayarları kendin karşılaştır.

## 1024'ten 2048 Elemana

Vektörler artık 2048'er eleman tutuyor. Eleman başına bir thread demek 2048 thread demek. Tek bir block en fazla 1024 thread alabilir. Bu sınır, [Ders 03](../Lesson-03/notes.md)'te gördüğün gibi compute capability'nin (CC, hesaplama yeteneği) bir parçası. Bu yüzden `<<<1, 2048>>>` başlatılırken reddedilir ([Ders 02](../Lesson-02/notes.md)).

Çıkış yolu daha fazla block. En basit bölme, 1024 thread'lik 2 block, yani `<<<2, 1024>>>`:

- block 0, 0 ile 1023 arasındaki elemanları alır
- block 1, 1024 ile 2047 arasındaki elemanları alır

Ders 08'deki kernel `int i = threadIdx.x;` kullanıyordu. Bu artık işe yaramaz. block 1'de `threadIdx.x` yeniden 0'dan başlar, yani block 1, 0 ile 1023 arasındaki elemanları ikinci kez toplar ve 1024 ile 2047 arasındaki elemanlara hiç dokunulmaz.

## Global Index

Her thread'in yalnızca kendi block'u içinde değil, bütün vektörde kendine ait bir elemana ihtiyacı var. Bunun formülü global index'tir:

```c
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

- `blockIdx.x`: bu thread'in hangi block'ta olduğu.
- `blockDim.x`: her block'ta kaç thread olduğu, burada 1024.
- `threadIdx.x`: thread'in kendi block'u içindeki yeri.

`blockIdx.x * blockDim.x`, bu block'tan önceki block'ların bütün thread'lerini atlar. `<<<2, 1024>>>` için gerçek sayılarla kontrol et:

- block 0, thread 2: 0 * 1024 + 2 = 2
- block 1, thread 0: 1 * 1024 + 0 = 1024, ikinci yarının ilk elemanı
- block 1, thread 1023: 1 * 1024 + 1023 = 2047, son eleman

0'dan 2047'ye kadar her eleman tam olarak bir thread alır. Kaydırıcıları oynat ve herhangi bir başlatma için formülü görmek üzere bir thread'in üzerine gel:

<global-id></global-id>

> [!TIP]
> Bu satırı ezberle. Bir dizi üzerinde çalışan neredeyse her kernel `int i = blockIdx.x * blockDim.x + threadIdx.x;` ile başlar.

## Grid Boyutunu Seçmek

İşi nasıl böleceğine sen karar verirsin. 2048 eleman için bunların hepsi tam olarak 2048 thread başlatır:

| Başlatma | Block | Block başına thread | Toplam thread |
|---|---|---|---|
| `<<<2, 1024>>>` | 2 | 1024 | 2048 |
| `<<<8, 256>>>` | 8 | 256 | 2048 |
| `<<<64, 32>>>` | 64 | 32 | 2048 |

Daha çok block, block başına daha az thread demek, tersi de geçerli. Çarpım her elemanı kapsamalı.

Gerçek vektör uzunlukları nadiren bu kadar yuvarlak sayılardır. Vektörün 2000 elemanı olsun ve block başına 256 thread istiyor ol. 2000 / 256 = 7,8 eder ve C'deki tam sayı bölmesi kesirli kısmı atar:

- `2000 / 256` sonucu 7 block, yani 7 * 256 = 1792 thread. Son 208 eleman hiç toplanmaz.

Bu yüzden yukarı yuvarla. Bunun standart yolu şu formül:

```c
int blocks = (N + threads - 1) / threads;
```

- `(2000 + 256 - 1) / 256` = 2255 / 256 = 8 block, yani 8 * 256 = 2048 thread.

Şimdi 48 thread fazla var (2048 - 2000). Bunların global index'i 2000 ile 2047 arası, yani vektörlerin sonunun ötesinde. Kernel'daki Ders 08'den gelen sınır kontrolü tam da bu yüzden var:

```c
if (i < n) {
    c[i] = a[i] + b[i];
}
```

Fazladan 48 thread için `i < n` yanlış çıkar ve hiçbir şey yapmazlar.

> [!WARNING]
> `if (i < n)` olmadan bu 48 thread dizilerin sonunun ötesini okur ve oraya yazar. Program yine de doğru sonucu yazdırabilir, çünkü hatalı yazmalar kimsenin kontrol etmediği bir belleğe düşebilir. Bu da hatayı bulmayı zorlaştırır. Grid'i yukarı yuvarla ve index'i her zaman koru.

> [!NOTE]
> Block boyutunu warp boyutu olan 32'nin katı seç ([Ders 07](../Lesson-07/notes.md)). GPU thread'leri 32'lik warp'lar halinde çalıştırır. 100 thread'lik bir block 4 warp olur (128 lane) ve son warp'ın 32 lane'inden yalnızca 4'ü çalışır. Block başına 128 ya da 256 thread yaygın ve güvenli bir seçimdir.

## Başlatma Kaç SM Kullanıyor?

Bir block her zaman tek bir SM'de çalışır. Bir SM aynı anda birden fazla block tutabilir. L40S'te bir SM en fazla 1536 thread (48 warp) ve en fazla 24 block tutar. Hangi SM'nin hangi block'u alacağına donanımdaki zamanlayıcı karar verir. Boştaki bir GPU'da block'ları genellikle önce her SM'ye bir tane olacak şekilde dağıtır, ama bunun garantisi yoktur.

Şimdi 142 SM'li L40S için say:

- `<<<2, 1024>>>`: 2 block, yani en fazla 2 SM çalışır. Bu 142'de 2, yaklaşık %1,4. Diğer 140 SM boş bekler.
- `<<<64, 32>>>`: 64 block, yani 64'e kadar SM çalışır, yaklaşık %45. Ama her biri yalnızca tek bir warp tutar, oysa 48 tane çalıştırabilir.

Asıl sorun işin büyüklüğü. L40S aynı anda 142 * 1536 = 218.112 thread tutabilir. 2048 thread bunun %1'inden az. Bu kadar az işle hiçbir grid düzeni bir GPU'yu dolduramaz. GPU'lar yüz binlerce ya da milyonlarca eleman olduğunda kendini gösterir.

Bir block boyutu seç ve grid'in L40S'in 142 SM'sine nasıl yerleştiğini gör:

<grid-size n="2048" sms="142"></grid-size>

> [!NOTE]
> `nvidia-smi`'deki "GPU utilization" SM saymaz. Herhangi bir kernel'ın çalıştığı zamanın oranını gösterir. Tek bir SM'de tek bir block çalıştıran bir kernel bile orada %100 görünebilir. Bir kernel'ın çipin gerçekte ne kadarını kullandığını görmek için Nsight Compute gibi bir profiler gerekir ([Ders 05](../Lesson-05/notes.md)'e bak).

## CUDA Event'leriyle Süre Ölçmek

`<<<2, 1024>>>` ile `<<<64, 32>>>`'yi karşılaştırmak için kernel'ın süresini ölçmen gerekir. Bir kernel başlatması hemen geri döner ve GPU arka planda çalışır ([Ders 00](../Lesson-00/notes.md)), bu yüzden başlatma satırının etrafına konan normal bir CPU saati neredeyse hiçbir şey ölçmez. CUDA event'leri bu sorunu çözer. Bir event, GPU'nun iş kuyruğuna koyduğun bir işarettir. GPU bu işarete geldiğinde zamanı not eder.

Kalıp beş parçadan oluşur:

```c
cudaEvent_t start, stop;
cudaEventCreate(&start);            // 1. create two events
cudaEventCreate(&stop);
cudaEventRecord(start);             // 2. marker before the work
kernel<<<blocks, threads>>>(...);   // 3. the work
cudaEventRecord(stop);              // 4. marker after the work
cudaEventSynchronize(stop);         // 5. wait until the GPU reached stop
float ms;
cudaEventElapsedTime(&ms, start, stop);
```

`cudaEventElapsedTime`, iki işaret arasındaki süreyi milisaniye olarak verir. 1 milisaniye 1000 mikrosaniyedir (µs).

Ölçüm kalıbını adım adım geç, sonra iki klasik hatadan birini aç:

<event-timing></event-timing>

> [!WARNING]
> `cudaEventSynchronize(stop)` satırını atlama. `cudaEventRecord` hemen geri döner, bu yüzden beklemeden CPU süreyi GPU `stop`'a varmadan önce sorar. O zaman `cudaEventElapsedTime` sana bir süre vermek yerine `cudaErrorNotReady` hatasıyla döner.

Sayıları güvenilir yapan iki alışkanlık daha var:

- **Önce ısındır.** Bir programdaki ilk başlatma, kernel'ın GPU'ya yüklenmesi gibi tek seferlik kurulum maliyetlerini öder. Ölçüme başlamadan önce kernel'ı bir kez çalıştır ve `cudaDeviceSynchronize()` ile bitmesini bekle.
- **Tekrarla ve ortalamasını al.** Bu kernel'ın tek bir başlatması çok kısadır ve saatin çözünürlüğü yaklaşık yarım mikrosaniyedir. 100 başlatmayı ölçüp 100'e bölmek, tek bir başlatmayı ölçmekten çok daha kararlı bir sayı verir.

> [!TIP]
> Kesin kernel süreleri için bir profiler kullan. Nsight Systems, koduna dokunmadan her kernel'ı ölçer: `nsys profile --stats=true ./vector_add_blocks 256` her kernel'ın süresini gösteren bir tablo yazdırır.

## Ne Beklemelisin

Yalnızca 2048 elemanla kernel'ın içindeki iş çok küçük. Başlatma başına sürenin çoğu başlatmanın kendisine gider: CPU kernel'ı sürücüye verir, GPU onu hazırlar ve başlatır. Bu maliyet 2 block için de 64 block için de aşağı yukarı aynı. Bu yüzden burada ayarların birbirine yakın çıkmasını ve çalıştırmadan çalıştırmaya küçük değişiklikler görmeyi bekle.

Bu bir başarısızlık değil, bir sonuç. Grid düzeninin önem kazanması için bir GPU'nun büyük bir işe ihtiyacı olduğunu gösteriyor. Aşağıdaki Kendin Dene bölümü vektörleri 8192 kat büyütüyor, böylece farkın büyüdüğünü görebilirsin.

## Kod

Programın tamamı `code/vector_add_blocks.cu` dosyasında. Block başına thread sayısını komut satırından okur, grid boyutunu hesaplar, ısınır, 100 başlatmayı ölçer ve sonucu kontrol eder:

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include <stdlib.h>

#define N 2048
#define RUNS 100

// stop the program with a readable message if a CUDA call fails
#define CHECK(call)                                                  \
    do {                                                             \
        cudaError_t err = (call);                                    \
        if (err != cudaSuccess) {                                    \
            printf("CUDA error: %s (%s:%d)\n",                       \
                   cudaGetErrorString(err), __FILE__, __LINE__);     \
            exit(1);                                                 \
        }                                                            \
    } while (0)

__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}

int main(int argc, char **argv)
{
    // threads per block from the command line, 1024 if none is given
    int threads = (argc > 1) ? atoi(argv[1]) : 1024;
    int blocks = (N + threads - 1) / threads;
    size_t bytes = N * sizeof(int);

    int *h_a = (int *)malloc(bytes);
    int *h_b = (int *)malloc(bytes);
    int *h_c = (int *)malloc(bytes);
    int *d_a, *d_b, *d_c;
    CHECK(cudaMalloc(&d_a, bytes));
    CHECK(cudaMalloc(&d_b, bytes));
    CHECK(cudaMalloc(&d_c, bytes));

    for (int i = 0; i < N; i++) {
        h_a[i] = i;
        h_b[i] = N - i;
    }
    CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

    // warm-up: the first launch pays one-time setup costs, so it is not timed
    vectorAdd<<<blocks, threads>>>(d_a, d_b, d_c, N);
    CHECK(cudaGetLastError());
    CHECK(cudaDeviceSynchronize());

    // time RUNS launches with two CUDA events
    cudaEvent_t start, stop;
    CHECK(cudaEventCreate(&start));
    CHECK(cudaEventCreate(&stop));
    CHECK(cudaEventRecord(start));
    for (int r = 0; r < RUNS; r++) {
        vectorAdd<<<blocks, threads>>>(d_a, d_b, d_c, N);
    }
    CHECK(cudaEventRecord(stop));
    CHECK(cudaEventSynchronize(stop));
    CHECK(cudaGetLastError());
    float ms = 0.0f;
    CHECK(cudaEventElapsedTime(&ms, start, stop));

    CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));
    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != h_a[i] + h_b[i]) {
            errors++;
        }
    }
    printf("<<<%d, %d>>>: %d threads for %d elements\n", blocks, threads, blocks * threads, N);
    printf("average time per launch: %.2f us\n", ms * 1000.0f / RUNS);
    printf("errors: %d\n", errors);

    CHECK(cudaEventDestroy(start));
    CHECK(cudaEventDestroy(stop));
    CHECK(cudaFree(d_a));
    CHECK(cudaFree(d_b));
    CHECK(cudaFree(d_c));
    free(h_a);
    free(h_b);
    free(h_c);
    return 0;
}
```

- `int main(int argc, char **argv)`: `argc` komut satırındaki kelimeleri sayar, `argv` onları tutar. `./vector_add_blocks 256` için `argc` = 2 ve `argv[1]` = `"256"` olur.
- `atoi(argv[1])`: `"256"` metnini 256 sayısına çevirir. Argüman yoksa program 1024 kullanır.
- `int blocks = (N + threads - 1) / threads;`: yukarıdaki yukarı yuvarlama formülü.
- `int i = blockIdx.x * blockDim.x + threadIdx.x;`: global index. Kernel'ın geri kalanı Ders 08'dekiyle aynı.
- Isınma başlatması bir kez çalışır ve ölçülmez. `cudaDeviceSynchronize()`, ölçüm başlamadan önce bittiğinden emin olur.
- `for` döngüsü kernel'ı iki event işareti arasında 100 kez başlatır. CPU başlatmaları yalnızca kuyruğa koyar. GPU onları birbiri ardına çalıştırır.
- `ms * 1000.0f / RUNS`: toplam milisaniyeyi başlatma başına mikrosaniyeye çevirir.
- `cudaEventDestroy`: event'leri serbest bırakır, tıpkı `cudaFree`'nin belleği serbest bırakması gibi.

## Kod Gezintisi

Programı yazacağın sırayla adım adım geç. Çoğu Ders 08'den geliyor. Yeni olan kısımlar global index, komut satırından gelen grid boyutu ve zaman ölçümü.

<div class="code-walk" markdown>

1. `1-4 cpu` **Header'lar.** Ders 08'deki dört header'ın aynısı. `stdlib.h` yine gerekli, bu kez komut satırındaki metni sayıya çeviren `atoi` için de.
2. `6-7 cpu` **Boyutlar.** `N` vektör uzunluğu, artık 2048. `RUNS` kaç başlatmayı ölçeceğin. İkisini en üstte tanımlamak, başka değerler denemek istediğinde tek yerde tek değişiklik demek.
3. `9-18 cpu` **CHECK makrosu.** Ders 08'den olduğu gibi kopyala. Bu programdaki her CUDA çağrısı ondan geçer, böylece bir hata yanlış sayılar vermek yerine dosya ve satırla programı durdurur.
4. `20-21,26 gpu` **Kernel'ın iskeleti.** Önce imzayı ve süslü parantezleri yaz. Parametreler Ders 08'dekiyle aynı: iki girdi, bir çıktı ve uzunluk `n`.
5. `22 gpu` **Global index.** Değişen satır bu. `blockIdx.x * blockDim.x` önceki block'ların bütün thread'lerini atlar, `threadIdx.x` de bu block içindeki yeri ekler. 1024 thread'lik bir başlatmada block 1, thread 0 için: 1 * 1024 + 0 = 1024. Sık yapılan hata `threadIdx.x`'i tek başına bırakmaktır, o zaman her block aynı ilk elemanlar üzerinde çalışır.
6. `23-25 gpu` **Koru ve topla.** Sınır kontrolü artık gerçekten önemli: yukarı yuvarlanmış bir grid'de son block'un sonun ötesinde thread'leri olabilir. Yalnızca `i < n` olan thread'ler kendi çiftini toplar.
7. `28-29,88-89 cpu` **main'in iskeleti.** Bu kez `main`, `argc` ve `argv` alıyor, böylece program block boyutunu komut satırından okuyabiliyor. `return 0;` satırını ve kapanan süslü parantezi hemen yaz.
8. `30-31 cpu` **Block başına thread.** Bir argüman varsa `atoi` onu sayıya çevirir, yoksa program 1024 kullanır. `? :` operatörü kısa bir if/else'tir: önce koşul, sonra doğruysa değer, sonra yanlışsa değer.
9. `32 cpu` **Grid boyutu.** `(N + threads - 1) / threads` ile yukarı yuvarla. 1000 thread ile: (2048 + 999) / 1000 = 3 block. Düz `N / threads` 2 block, yani yalnızca 2000 thread verirdi ve son 48 eleman atlanırdı.
10. `33,35-41,82-87 cpu` **Ayır ve serbest bırak.** Bayt cinsinden boyutu, üç `malloc` ve üç `cudaMalloc` çağrısını yaz ve hemen ardından `main`'in sonundaki `cudaFree` ve `free` eşlerini ekle. Her çifti birlikte yazmak hiçbirini unutmaman demek.
11. `43-48 cpu` **Doldur ve kopyala.** `a` ve `b`'yi host'ta doldur ve device'a kopyala, tıpkı Ders 08'deki 2. ve 3. adımlar gibi. `c`'nin her elemanı 2048 çıkmalı.
12. `50-53 cpu` **Isınma.** Ölçülmeyen tek bir başlatma, `cudaGetLastError()` ile kontrol edilir, sonra `cudaDeviceSynchronize()` bitmesini bekler. Başlatma satırının kendisi CPU'da çalışır: kernel'ı yalnızca GPU'ya teslim eder.
13. `55-59,80-81 cpu` **Event'leri oluştur ve başlat.** `start` ve `stop`'u tanımla, oluştur ve `start` işaretini GPU kuyruğuna koy. İki `cudaEventDestroy` satırını da şimdi, diğer temizlik satırlarının yanına, sona ekle.
14. `60-62 cpu` **Ölçülen başlatmalar.** Döngü 100 başlatmayı kuyruğa koyar. CPU bu döngüyü, GPU kernel'ları bitirmeden çok önce bitirir.
15. `63-67 cpu` **Durdur ve süreyi oku.** `stop` işaretini kuyruğa koy, `cudaEventSynchronize` ile GPU'nun ona varmasını bekle, başlatma hatalarını kontrol et, sonra iki işaret arasındaki milisaniyeyi oku. Synchronize satırını unutmak klasik hatadır: süre henüz hazır değildir.
16. `69-75 cpu` **Geri kopyala ve kontrol et.** `c`'yi geri kopyala ve yanlış elemanları say. Sonuçları yanlış olan hızlı bir kernel hiçbir işe yaramaz, bu yüzden her zaman kontrol et.
17. `76-78 cpu` **Raporu yazdır.** Başlatmanın şekli, mikrosaniye cinsinden başlatma başına ortalama süre ve hata sayısı.

</div>

## Derle ve Çalıştır

```bash
nvcc -arch=sm_89 -o vector_add_blocks vector_add_blocks.cu
./vector_add_blocks 1024
./vector_add_blocks 32
./vector_add_blocks 1000
```

- `nvcc -arch=sm_89 ...`: [Ders 06](../Lesson-06/notes.md)'daki gibi L40S için derler.
- `./vector_add_blocks 1024`: 1024 thread'lik 2 block.
- `./vector_add_blocks 32`: 32 thread'lik 64 block.
- `./vector_add_blocks 1000`: 1000 thread'lik 3 block, 2048 eleman için 3000 thread. Sınır kontrolü fazladan 952 thread'i durdurur.

## Çıktı

Bu, `./vector_add_blocks 1000` çıktısı. Süre `...` olarak gösterildi, çünkü GPU'ya bağlı:

```
<<<3, 1000>>>: 3000 threads for 2048 elements
average time per launch: ... us
errors: 0
```

Nasıl okunur:

- `<<<3, 1000>>>`: yukarı yuvarlama formülü 3 block verdi.
- `3000 threads for 2048 elements`: 952 thread'in yapacak işi yok. Sınır kontrolü onları bellekten uzak tutar.
- `average time per launch`: buraya senin sayın gelir. Üç çalıştırma arasında karşılaştır.
- `errors: 0`: 2048'i bölmeyen bir block boyutunda bile 2048 toplamın hepsi doğru.

## Kendin Dene

1. **İşi büyüt.** `#define N 2048` satırını `#define N (1 << 24)` yap, yani 16.777.216 eleman (vektör başına 64 MB). 32, 256 ve 1024 thread ile çalıştır. Artık GPU'yu dolduracak kadar iş var ve block boyutu ölçebileceğin bir fark yaratmaya başlıyor.
2. **Korumayı kaldır.** `if (i < n)` satırını ve kapanan süslü parantezini sil, derle ve `compute-sanitizer ./vector_add_blocks 1000` çalıştır. Compute Sanitizer, yazdırılan sonuç doğru görünse bile fazladan thread'lerin geçersiz global yazmalarını bildirir.
3. **Ölçümü bilerek boz.** `CHECK(cudaEventSynchronize(stop));` satırını kaldır ve tekrar çalıştır. Program `cudaEventElapsedTime` satırından gelen bir `CUDA error` ile durmalı, çünkü süre hazır değil.

## Kendin Yaz

GPU'lar için klasik bir test olan SAXPY için bir kernel yaz: 5000 float için `y[i] = a * x[i] + y[i]`, block başına 256 thread ile. 5000, 256'nın katı değil, bu yüzden yukarı yuvarlamaya ve korumaya ihtiyacın var.

1. Kernel'ı global index ve sınır kontrolüyle yaz.
2. Block sayısını yukarı yuvarlama formülüyle hesapla.
3. Kernel'ı başlat ve `y`'yi geri kopyala.

```c
#include "cuda_runtime.h"
#include <stdio.h>
#include <stdlib.h>

#define N 5000

__global__ void saxpy(float a, const float *x, float *y, int n)
{
    // TODO: compute the global index i
    // TODO: if i is inside the vector, set y[i] = a * x[i] + y[i]
}

int main()
{
    size_t bytes = N * sizeof(float);
    float *h_x = (float *)malloc(bytes);
    float *h_y = (float *)malloc(bytes);
    for (int i = 0; i < N; i++) {
        h_x[i] = 1.0f;
        h_y[i] = 2.0f;
    }

    float *d_x, *d_y;
    cudaMalloc(&d_x, bytes);
    cudaMalloc(&d_y, bytes);
    cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(d_y, h_y, bytes, cudaMemcpyHostToDevice);

    int threads = 256;
    // TODO: compute blocks so that blocks * threads >= N
    // TODO: launch saxpy with a = 3.0f
    // TODO: copy d_y back into h_y

    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_y[i] != 5.0f) {
            errors++;
        }
    }
    printf("y[0] = %.1f, y[%d] = %.1f, errors: %d\n", h_y[0], N - 1, h_y[N - 1], errors);

    cudaFree(d_x);
    cudaFree(d_y);
    free(h_x);
    free(h_y);
    return 0;
}
```

??? tip "İpucu"
    Index satırı bu dersteki kernel'dakiyle aynı. Grid için (5000 + 256 - 1) / 256 = 20 block, yani 5120 thread ve korumanın durdurması gereken 120 fazla thread. Her `y[i]` 3 * 1 + 2 = 5 olmalı.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>
    #include <stdlib.h>

    #define N 5000

    __global__ void saxpy(float a, const float *x, float *y, int n)
    {
        int i = blockIdx.x * blockDim.x + threadIdx.x;
        if (i < n) {
            y[i] = a * x[i] + y[i];
        }
    }

    int main()
    {
        size_t bytes = N * sizeof(float);
        float *h_x = (float *)malloc(bytes);
        float *h_y = (float *)malloc(bytes);
        for (int i = 0; i < N; i++) {
            h_x[i] = 1.0f;
            h_y[i] = 2.0f;
        }

        float *d_x, *d_y;
        cudaMalloc(&d_x, bytes);
        cudaMalloc(&d_y, bytes);
        cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);
        cudaMemcpy(d_y, h_y, bytes, cudaMemcpyHostToDevice);

        int threads = 256;
        int blocks = (N + threads - 1) / threads;
        saxpy<<<blocks, threads>>>(3.0f, d_x, d_y, N);
        cudaMemcpy(h_y, d_y, bytes, cudaMemcpyDeviceToHost);

        int errors = 0;
        for (int i = 0; i < N; i++) {
            if (h_y[i] != 5.0f) {
                errors++;
            }
        }
        printf("y[0] = %.1f, y[%d] = %.1f, errors: %d\n", h_y[0], N - 1, h_y[N - 1], errors);

        cudaFree(d_x);
        cudaFree(d_y);
        free(h_x);
        free(h_y);
        return 0;
    }
    ```

    `nvcc -arch=sm_89 -o saxpy saxpy.cu` ile derle ve `./saxpy` çalıştır. `y[0] = 5.0, y[4999] = 5.0, errors: 0` görmelisin. Korumayı unuttuysan sonuç yine doğru görünebilir, ama `compute-sanitizer ./saxpy` fazladan 120 thread'in yazmalarını bildirir.

## Sözlük

- global index: bir thread'in bütün grid'deki yeri, `blockIdx.x * blockDim.x + threadIdx.x`. Her thread'i bir elemana eşler.
- grid boyutu: bir başlatmadaki block sayısı, `<<<blocks, threads>>>` içindeki ilk sayı.
- yukarı yuvarlayan bölme: `(N + threads - 1) / threads`, `blocks * threads` en az `N` olsun diye gereken block sayısı.
- sınır kontrolü: `if (i < n)`, yukarı yuvarlanmış bir grid'in fazladan thread'lerinin sonun ötesindeki belleğe dokunmasını engeller.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içinde block'ları çalıştıran işlemci. Bir block tek bir SM'de çalışır; bir SM birden fazla block tutabilir. L40S'te 142 tane var.
- `nvidia-smi` GPU utilization: bir kernel'ın çalıştığı zamanın oranı. Kaç SM'nin meşgul olduğunu söylemez.
- CUDA event (`cudaEvent_t`): GPU'nun iş kuyruğundaki bir işaret. GPU işarete vardığında zamanı not eder.
- `cudaEventRecord`: kuyruğa bir event işareti koyar. Hemen geri döner.
- `cudaEventSynchronize`: CPU'yu, GPU belirli bir event'e varana kadar bekletir.
- `cudaEventElapsedTime`: kaydedilmiş iki event arasındaki milisaniye cinsinden süre.
- ısınma: tek seferlik kurulum maliyetlerini üstlenen, ölçülmeyen ilk başlatma.
- başlatma maliyeti: bir kernel'ı GPU'ya teslim edip başlatmanın sabit süresi. Kernel'ın kendisi çok küçük olduğunda süreye o hakim olur.
- SAXPY (Single-precision A times X Plus Y): float vektörler üzerinde `y = a * x + y`, klasik bir ilk GPU kernel'ı.
- Compute Sanitizer: NVIDIA'nın kernel'lardaki bellek hatalarını, örneğin bir dizinin sonunun ötesine yazmayı, bulan aracı.
