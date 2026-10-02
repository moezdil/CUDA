# 08 > Vektör Toplama

Ders 00 ile 07 arasındaki kernel'lar yalnızca kendi ID'lerini yazdırıyordu. Bu derste veri üzerinde gerçek iş yapan ilk CUDA programını yazacaksın. Program GPU'da 1024 sayılık iki vektörü toplayacak. Bu arada, bellek ayırmaktan belleği serbest bırakmaya kadar neredeyse her CUDA programının izlediği altı adımı da tanıyacaksın.

> [!NOTE]
> Kod, önceki derslerdeki gibi Ubuntu 24 üzerinde CUDA 13'ü ve NVIDIA L40S'i (`sm_89`) hedefliyor. Program kendi sonucunu kontrol ettiği için onu herhangi bir NVIDIA GPU'da çalıştırıp doğru çalışıp çalışmadığını görebilirsin.

## Görev

`a` ve `b` diye iki vektör al. Her biri 0 ile 1023 arasındaki indekslerde 1024 tam sayı tutuyor. Hedef, her elemanı aynı indeksteki iki elemanın toplamı olan üçüncü bir vektör, `c`.

```
c[0]    = a[0]    + b[0]
c[1]    = a[1]    + b[1]
...
c[1023] = a[1023] + b[1023]
```

Buna eleman bazlı işlem denir. Her toplam yalnızca kendi iki girdisine ihtiyaç duyar ve hiçbir toplam bir başkasını beklemek zorunda değildir. Bu da vektör toplamayı bir GPU için mükemmel bir ilk iş yapıyor.

## CPU'da, Her Seferinde Bir Eleman

CPU'da düz C ile bir döngü yazarsın.

```c
for (int i = 0; i < 1024; i++) {
    c[i] = a[i] + b[i];
}
```

Döngü, art arda 1024 tur döner. Tur 500, tur 499 bitmeden başlayamaz, oysa iki turun birbiriyle hiçbir ilgisi yoktur. Bu iş paralel çalışabilirdi, ama düz bir döngü onu asla öyle çalıştırmaz.

## GPU'da, Her Eleman için Bir Thread

GPU'da döngüyü kaldırırsın. Onun yerine eleman sayısı kadar thread başlatır ve her thread'e bir indeks verirsin.

En basit başlatmayla başla, 1024 thread'lik 1 block, `<<<1, 1024>>>`. Block ID'si her zaman 0 olduğu için burada sana bir şey söylemez. Thread ID'leri 0'dan 1023'e gider ve bunlar tam olarak vektörlerin indeksleridir. Yani thread 0 eleman 0'ı, thread 1 eleman 1'i, thread 1023 de sonuncuyu alır.

<cuda-launch blocks="1" threads="1024" fn="vectorAdd"></cuda-launch>

Her thread aynı tek satırı, `c[i] = a[i] + b[i]` satırını çalıştırır. Yalnızca `i` farklıdır. GPU 1024 thread'i çekirdeklerine dağıtır, 32'şerli warp'lar hâlinde (bkz. [Ders 07](../Lesson-07/notes.md)), ve onları paralel çalıştırır. Farklı veriler üzerinde çalışan birçok thread için tek komut fikri CUDA'nın kalbidir. Buna [Ders 01](../Lesson-01/notes.md)'deki gibi SIMT denir.

İki yolu 16 elemanla karşılaştır. CPU döngüsü her eleman için bir adım olmak üzere 16 adım ister, GPU thread'leri ise 16 elemanın hepsini tek adımda doldurur.

<vector-add n="16"></vector-add>

> [!NOTE]
> "Tek adım" bir fikirdir, kesin bir zamanlama değil. Bir block tek bir SM üzerinde çalışır. SM bu block'un 32 warp'unun hepsini aynı anda tutar ve onları hızlıca sırayla çalıştırır, böylece hiçbir thread, bir döngünün kendi indeksine gelmesini beklemez. Aşağıdaki altı adımda göreceğin gibi, GPU'ya giden ve GPU'dan gelen kopyalar da zaman alır.

## Kernel

```c
__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}
```

- `__global__`, `vectorAdd`'i kernel olarak işaretler. CPU onu başlatır, GPU çalıştırır.
- `const int *a, const int *b` iki girdi vektörüdür. `const`, kernel'ın onları yalnızca okuduğu anlamına gelir.
- `int *c` çıktı vektörüdür. Kernel toplamları buraya yazar.
- `int n` eleman sayısıdır, burada 1024.
- `int i = threadIdx.x;` ile her thread kendi ID'sini okur. Bu, onun eleman indeksidir.
- `if (i < n)` bir sınır kontrolüdür. Tam 1024 thread varken hiçbir zaman başarısız olmaz. Vektör boyutu thread sayısıyla uyuşmadığında önem kazanır ve bu bir sonraki dersin konusu. Bunu ilk günden yazmak iyi bir alışkanlıktır.
- `c[i] = a[i] + b[i];` asıl iştir. Thread başına bir toplama.

`c[threadIdx.x] = a[threadIdx.x] + b[threadIdx.x];` diye tek satırda da yazabilirdin. Ama ayrı bir `i` daha kolay okunur ve ileride indeksin block ID'sine de ihtiyaç duyduğunda genişletmesi kolaydır.

## Host ve Device Belleği

CPU'nun ve GPU'nun her birinin kendi belleği vardır. CUDA'da CPU tarafına host, GPU tarafına device denir. Bir kernel yalnızca device belleğini, CPU da yalnızca host belleğini okuyabilir. Bu yüzden verinin ikisi arasında bilinçli olarak kopyalanması gerekir.

Kod iki tarafı isimleriyle ayırır. `h_a` host'ta, `d_a` device'ta durur. Bu `h_` ve `d_` öneki yaygın bir alışkanlıktır ve seni bir kernel'a yanlışlıkla CPU pointer'ı vermekten korur.

> [!TIP]
> CUDA'da unified memory (`cudaMallocManaged`) de var. Tek bir pointer iki tarafta da çalışır ve veriyi driver senin yerine taşır. Kullanışlıdır ama olan biteni gizler. Bu derste her kopyayı elle yapıyoruz, böylece her adımı görebilirsin.

## Altı Adım

Neredeyse her CUDA programı aynı altı adımı izler.

1. Host'ta ve device'ta bellek ayır.
2. Girdileri host'ta doldur.
3. Girdileri host'tan device'a kopyala.
4. Kernel'ı başlat.
5. Sonucu device'tan host'a geri kopyala.
6. İki taraftaki belleği de serbest bırak.

Adım 2 ve 6 normal bir C programında da var. Adım 1, 3, 4 ve 5 ise CUDA'nın devreye girdiği yerler. Her dizinin host'ta ya da device'ta belirmesini, kopyalanmasını ve yeniden kaybolmasını görmek için adımları tek tek ilerlet.

<host-device-flow></host-device-flow>

## Kod

Programın tamamı `code/vector_add.cu` dosyasında.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include <stdlib.h>

#define N 1024

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
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}

int main()
{
    size_t bytes = N * sizeof(int);

    // 1. allocate memory on the host (CPU) and on the device (GPU)
    int *h_a = (int *)malloc(bytes);
    int *h_b = (int *)malloc(bytes);
    int *h_c = (int *)malloc(bytes);
    int *d_a, *d_b, *d_c;
    CHECK(cudaMalloc(&d_a, bytes));
    CHECK(cudaMalloc(&d_b, bytes));
    CHECK(cudaMalloc(&d_c, bytes));

    // 2. fill the inputs on the host
    for (int i = 0; i < N; i++) {
        h_a[i] = i;
        h_b[i] = N - i;
    }

    // 3. copy the inputs to the device
    CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

    // 4. launch the kernel: 1 block, N threads, one thread per element
    vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);
    CHECK(cudaGetLastError());

    // 5. copy the result back to the host
    CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));

    // check every element, then print a few
    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != h_a[i] + h_b[i]) {
            errors++;
        }
    }
    for (int i = 0; i < 4; i++) {
        printf("%d + %d = %d\n", h_a[i], h_b[i], h_c[i]);
    }
    printf("...\n");
    printf("%d + %d = %d\n", h_a[N - 1], h_b[N - 1], h_c[N - 1]);
    printf("errors: %d\n", errors);

    // 6. free memory on both sides
    CHECK(cudaFree(d_a));
    CHECK(cudaFree(d_b));
    CHECK(cudaFree(d_c));
    free(h_a);
    free(h_b);
    free(h_c);
    return 0;
}
```

### Hazırlık satırları

- `#include <stdlib.h>`, `malloc`, `free` ve `exit` için gerekli.
- `#define N 1024` vektör boyutudur, en üstte bir kez tanımlanır. Başka bir boyut denemek için yalnızca bu satırı değiştir.
- `CHECK(...)` gerekir, çünkü neredeyse her CUDA fonksiyonu bir hata kodu döndürür. Başarısız bir çağrı programı kendiliğinden durdurmaz ve program bozuk veriyle devam eder ([Ders 02](../Lesson-02/notes.md) tek kelime söylemeden başarısız olan bir başlatma göstermişti). `CHECK` bu koda bakar. Kod `cudaSuccess` değilse sebebi dosya ve satırla birlikte yazdırır ve programı durdurur.
- `size_t bytes = N * sizeof(int);` gerekir, çünkü bellek fonksiyonları eleman değil bayt sayar. Her biri 4 bayt olan 1024 sayı 4096 bayt eder.

### Adım 1, ayır

- `malloc(bytes)` normal C'deki gibi host'ta bellek ayırır.
- `cudaMalloc(&d_a, bytes)` device'ta bellek ayırır. Pointer'ın adresini (`&d_a`) alır, çünkü yeni GPU adresini onun içine yazar.

### Adım 2, girdileri doldur

- `h_a[i] = i;` ile `a`, 0, 1, 2, ... 1023 değerlerini alır.
- `h_b[i] = N - i;` ile `b`, 1024, 1023, 1022, ... 1 değerlerini alır.

Bu seçim, sonucu gözle kontrol etmeyi kolaylaştırır. Her toplam `i + (1024 - i)`, yani `c`'nin her elemanı 1024 olmalı. `c`'yi doldurmuyoruz, çünkü onu kernel yazacak.

### Adım 3, device'a kopyala

- `cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice)`, `h_a`'dan `d_a`'ya `bytes` bayt kopyalar. Sıra, C'deki `memcpy` gibi her zaman önce hedef, sonra kaynaktır. Son argüman yönü belirtir, burada host'tan device'a.
- `c` kopyalanmaz, çünkü hiçbir girdi tutmaz.

### Adım 4, başlat

- `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);` kernel adını, başlatma ayarını (1 block, 1024 thread) ve ardından argümanları içerir. Kernel'a verilen bütün pointer'lar `d_` pointer'larıdır.
- `CHECK(cudaGetLastError());` gerekir, çünkü başlatma hiçbir şey döndürmez, bu yüzden kabul edilip edilmediğini sonradan sorarsın. Block başına 1024'ten fazla thread gibi hatalı bir ayar burada ortaya çıkar.

### Adım 5, sonucu geri kopyala

- `cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost)`, adım 3'teki fonksiyonun aynısı, ama yön tersine çevrilmiş. İkisini karşılaştır. Orada `h_` ikinci sıradaydı, burada ilk sırada, çünkü artık hedef host.
- [Ders 06](../Lesson-06/notes.md)'nın aksine burada `cudaDeviceSynchronize()` yok. Bu `cudaMemcpy`, kernel bitene kadar kendiliğinden bekler, çünkü henüz var olmayan bir sonucu kopyalayamaz.

### Kontrol

- İlk döngü her elemanı CPU'daki toplamla karşılaştırır ve hataları sayar. 1024 satır yazdırıp hepsini gözle okumak ölçeklenmez. Programın kendini kontrol etmesi ise ölçeklenir.
- Diğer satırlar ilk dört toplamı ve sonuncuyu yazdırır, düzeni görmek için bu yeterli.

### Adım 6, serbest bırak

- `cudaFree(d_a)` device belleğini geri verir. Program çalışırken GPU belleği senin yerine serbest bırakılmaz, bu yüzden bunu unutan uzun bir program GPU belleğini tüketmeye devam eder.
- `free(h_a)` normal C'deki gibi host belleğini geri verir. İsimler bilerek eşleşiyor, `cudaMalloc` için `cudaFree`, `malloc` için `free`.

## Kod Gezintisi

Programı yazacağın sırayla adım adım geç. Önce yardımcıları ve kernel'ı yaz, sonra `main`'i altı adımla doldur. Serbest bırakma satırlarını ayırma satırlarının hemen ardından yaz, böylece onları unutamazsın.

<div class="code-walk" markdown>

1. `1-4 cpu` **Header'lar.** Her zamanki üç satır ve `malloc`, `free` ve `exit`'i tanımlayan `stdlib.h`. Bu olmadan host belleği çağrıları derlenmez.
2. `6 cpu` **Boyut.** `#define N 1024`, vektör boyutunu tek bir yerde tanımlar. Sonraki her satır `N`'yi kullanır, bu yüzden yeni bir boyut için yalnızca bu satırı değiştirmek yeter.
3. `8-17 cpu` **Hata kontrolü.** `CHECK` makrosunu herhangi bir CUDA çağrısından önce yaz, böylece her çağrı onu baştan kullanabilir. Makro çağrıyı çalıştırır, sonucu `cudaSuccess` ile karşılaştırır ve farklıysa hata metni, dosya ve satırla programı durdurur. Her satırın sonundaki `\`, makroyu bir sonraki satırda sürdürür, bu yüzden eksik bir `\` bütün makroyu bozar.
4. `19-20,25 gpu` **Kernel imzası.** `__global__ void vectorAdd(...)`, iki girdiyi `const int *`, çıktıyı `int *` ve uzunluğu `n` olarak alır. Ona verdiğin pointer'lar device pointer'ları olmalı, çünkü kernel GPU'da çalışır.
5. `21-24 gpu` **Kernel gövdesi.** Her thread indeksini `threadIdx.x`'ten alır, onu `n` ile karşılaştırır ve bir eleman çiftini toplar. Kural basit, bir thread, bir eleman, döngü yok. Sınır kontrolü tek satırdır ve thread sayısı `n` ile eşleşmediğinde seni korur.
6. `27-28,78-79 cpu` **main fonksiyonu.** `main`'i, sonunda `return 0;` olacak şekilde yaz. Altı adım aralarına gelir.
7. `29 cpu` **Eleman değil, bayt.** Her bellek çağrısı bayt sayar, bu yüzden `N * sizeof(int)`'i bir kez hesapla. Sık yapılan bir hata yalnızca `N` vermektir. O zaman verinin yalnızca dörtte biri ayrılır ve kopyalanır.
8. `31-38 cpu` **Adım 1, ayır.** Host dizileri için üç `malloc`, device dizileri için üç `cudaMalloc` çağrısı. `cudaMalloc`, `&d_a`'yı, yani pointer'ın adresini alır, çünkü yeni device adresini onun içine yazar.
9. `71-77 cpu` **Adım 6, serbest bırak.** Ayırma satırları hâlâ gözünün önündeyken serbest bırakma satırlarını şimdi, `main`'in sonuna yaz. Her `d_` pointer'ı için `cudaFree`, her `h_` pointer'ı için `free`. Bunları karıştırmak, örneğin `free(d_a)` yazmak, bir hatadır.
10. `40-44 cpu` **Adım 2, girdileri doldur.** Bir döngü `h_a[i] = i` ve `h_b[i] = N - i` değerlerini atar, böylece her doğru toplam 1024 olur. Sonucunu önceden bildiğin girdiler seç. `h_c` boş kalır, çünkü onu kernel yazar.
11. `46-48 cpu` **Adım 3, device'a kopyala.** `cudaMemcpy` önce hedefi, sonra kaynağı, boyutu ve yönü alır. Burada bu, `cudaMemcpyHostToDevice` ile `h_a`'dan `d_a`'ya kopyalamak demek.
12. `50-52 cpu` **Adım 4, başlat.** `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N)`, her eleman için bir thread başlatır ve yalnızca `d_` pointer'larını verir. Bir başlatma hata kodu döndürmez, bu yüzden sonraki satırdaki `CHECK(cudaGetLastError())` başlatmanın kabul edilip edilmediğini sorar.
13. `54-55 cpu` **Adım 5, sonucu geri kopyala.** Aynı `cudaMemcpy`, bu kez hedef olarak `h_c` ve `cudaMemcpyDeviceToHost` ile. Bu kopya kernel'ın bitmesini bekler, bu yüzden `cudaDeviceSynchronize()` gerekmez.
14. `57-63 cpu` **Her elemanı kontrol et.** CPU'da her `h_c[i]`'yi `h_a[i] + h_b[i]` ile karşılaştır ve uyuşmayanları say. Programın kendini kontrol etmesi, yalnızca yazdırdığın birkaç elemandaki değil, 1024 elemanın hepsindeki hataları yakalar.
15. `64-69 cpu` **Bir örnek yazdır.** İlk dört toplamı, bir `...` satırını, son toplamı ve hata sayısını yazdır. Bakman gereken satır hata sayısıdır ve 0, her elemanın doğru olduğu anlamına gelir.

</div>

## Derle ve Çalıştır

```bash
nvcc -arch=sm_89 -o vector_add vector_add.cu
./vector_add
```

- `nvcc`, CUDA derleyicisidir.
- `-arch=sm_89`, L40S için derler. Başka bir GPU'da onun kendi compute capability'sini kullan, örneğin compute capability 8.0 için `-arch=sm_80` (bkz. [Ders 03](../Lesson-03/notes.md) ve [Ders 06](../Lesson-06/notes.md)).
- `-o vector_add`, programa `vector_add` adını verir.
- `./vector_add`, programı bulunduğun klasörden çalıştırır.

## Çıktı

Programın çıktısı bu. Her toplam, Adım 2'de verilen girdilerden çıkıyor.

```
0 + 1024 = 1024
1 + 1023 = 1024
2 + 1022 = 1024
3 + 1021 = 1024
...
1023 + 1 = 1024
errors: 0
```

Çıktıyı şöyle okuyabilirsin.

- Her satır `a[i] + b[i] = c[i]` biçiminde. İlk dört satır 0 ile 3 arası indeksler, `...` satırını programın kendisi yazdırıyor ve son toplam satırı ise indeks 1023.
- Adım 2'de planlandığı gibi her toplam 1024. İndeks 3 için `a[3] = 3`, `b[3] = 1024 - 3 = 1021` ve 3 + 1021 = 1024.
- `errors: 0`, yalnızca ekrandaki beş elemanın değil, 1024 elemanın hepsinin doğru olduğunu söyler.
- Bunun yerine `CUDA error:` görürsen, mesaj başarısız olan çağrıyı, dosyayı ve satırı belirtir.

## Kendin Dene

> [!WARNING]
> `N`'yi 2048 yap ve programı yeniden çalıştır. Bir block'ta 1024'ten fazla thread olamayacağı için başlatma reddedilir ve `CHECK(cudaGetLastError())` programı `CUDA error: invalid configuration argument` ile durdurmalıdır. Bu kontrol olmasaydı kernel hiç çalışmaz ama program devam ederdi. Kernel'ın hiç yazmadığı device belleğini geri kopyalar ve büyük bir hata sayısı bildirirdi. Çözüm birden fazla block kullanmaktır ve bu bir sonraki dersin konusu.

## Kendin Yaz

`c[i] = 2 * a[i] + b[i]` hesaplayan yeni bir kernel ile altı adımın hepsini kendin yaz.

1. Aşağıdaki iskeletle `scale_add.cu` oluştur. Header'lar, `N`, `CHECK` ve sondaki yazdırma satırları hazır.
2. Kernel gövdesini yaz.
3. `main`'deki altı adımı `h_a[i] = i` ve `h_b[i] = 1` ile doldur.

```c
#include "cuda_runtime.h"
#include <stdio.h>
#include <stdlib.h>

#define N 256

#define CHECK(call)                                                  \
    do {                                                             \
        cudaError_t err = (call);                                    \
        if (err != cudaSuccess) {                                    \
            printf("CUDA error: %s (%s:%d)\n",                       \
                   cudaGetErrorString(err), __FILE__, __LINE__);     \
            exit(1);                                                 \
        }                                                            \
    } while (0)

__global__ void scaleAdd(const int *a, const int *b, int *c, int n)
{
    // TODO: one thread per element: c[i] = 2 * a[i] + b[i], with a bounds check
}

int main()
{
    size_t bytes = N * sizeof(int);
    int *h_a, *h_b, *h_c, *d_a, *d_b, *d_c;

    // TODO 1: allocate h_a, h_b, h_c with malloc and d_a, d_b, d_c with cudaMalloc
    // TODO 2: fill h_a[i] = i and h_b[i] = 1
    // TODO 3: copy h_a and h_b to the device
    // TODO 4: launch scaleAdd with 1 block of N threads, then check the launch
    // TODO 5: copy d_c back to h_c

    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != 2 * h_a[i] + h_b[i]) {
            errors++;
        }
    }
    printf("c[0] = %d, c[1] = %d, c[%d] = %d\n", h_c[0], h_c[1], N - 1, h_c[N - 1]);
    printf("errors: %d\n", errors);

    // TODO 6: free the device and host memory
    return 0;
}
```

??? tip "İpucu"
    Kernel gövdesi, tek bir satırı değişmiş Ders 08 kernel'ıdır, değişen satır `c[i] = 2 * a[i] + b[i];`. `main`'deki her adım, dizi başına bir satırdır ve yukarıdaki programdan adlar değiştirilerek kopyalanır. `cudaMemcpy(destination, source, bytes, direction)` sırasını unutma.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>
    #include <stdlib.h>

    #define N 256

    #define CHECK(call)                                                  \
        do {                                                             \
            cudaError_t err = (call);                                    \
            if (err != cudaSuccess) {                                    \
                printf("CUDA error: %s (%s:%d)\n",                       \
                       cudaGetErrorString(err), __FILE__, __LINE__);     \
                exit(1);                                                 \
            }                                                            \
        } while (0)

    __global__ void scaleAdd(const int *a, const int *b, int *c, int n)
    {
        int i = threadIdx.x;
        if (i < n) {
            c[i] = 2 * a[i] + b[i];
        }
    }

    int main()
    {
        size_t bytes = N * sizeof(int);
        int *h_a, *h_b, *h_c, *d_a, *d_b, *d_c;

        // 1. allocate
        h_a = (int *)malloc(bytes);
        h_b = (int *)malloc(bytes);
        h_c = (int *)malloc(bytes);
        CHECK(cudaMalloc(&d_a, bytes));
        CHECK(cudaMalloc(&d_b, bytes));
        CHECK(cudaMalloc(&d_c, bytes));

        // 2. fill the inputs
        for (int i = 0; i < N; i++) {
            h_a[i] = i;
            h_b[i] = 1;
        }

        // 3. copy to the device
        CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
        CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

        // 4. launch and check
        scaleAdd<<<1, N>>>(d_a, d_b, d_c, N);
        CHECK(cudaGetLastError());

        // 5. copy the result back
        CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));

        int errors = 0;
        for (int i = 0; i < N; i++) {
            if (h_c[i] != 2 * h_a[i] + h_b[i]) {
                errors++;
            }
        }
        printf("c[0] = %d, c[1] = %d, c[%d] = %d\n", h_c[0], h_c[1], N - 1, h_c[N - 1]);
        printf("errors: %d\n", errors);

        // 6. free
        CHECK(cudaFree(d_a));
        CHECK(cudaFree(d_b));
        CHECK(cudaFree(d_c));
        free(h_a);
        free(h_b);
        free(h_c);
        return 0;
    }
    ```

    `nvcc -arch=sm_89 -o scale_add scale_add.cu` ve `./scale_add` ile derle ve çalıştır. Her adım doğruysa `c[0] = 1, c[1] = 3, c[255] = 511` ve `errors: 0` görmelisin, çünkü 2 * 255 + 1 = 511.

## Sözlük

- CUDA (Compute Unified Device Architecture): NVIDIA'nın GPU'da genel amaçlı programlar çalıştırmak için sunduğu platform.
- vektör toplama: iki vektörü eleman eleman toplamak, `c[i] = a[i] + b[i]`.
- SIMT (Single Instruction, Multiple Threads, tek komut çoklu thread): birçok thread aynı komutu, her biri kendi verisi üzerinde çalıştırır.
- eleman bazlı (element-wise): her çıktı elemanı yalnızca aynı indeksteki girdi elemanlarına bağlıdır. Böyle bir iş paralel olarak iyi çalışır.
- host: CPU (Central Processing Unit, merkezi işlem birimi) ve onun belleği.
- device: GPU (Graphics Processing Unit, grafik işlem birimi) ve onun belleği.
- `h_` / `d_`: bir isimlendirme alışkanlığı. `h_a` host belleğini, `d_a` device belleğini gösterir.
- `cudaMalloc`: device'ta bellek ayırır.
- `cudaMemcpy`: host ile device arasında bayt kopyalar. Sıra hedef, kaynak, boyut ve yöndür.
- `cudaMemcpyHostToDevice` / `cudaMemcpyDeviceToHost`: bir kopyanın yönü.
- `cudaFree`: device belleğini geri verir.
- `cudaGetLastError`: son kernel başlatmasının kabul edilip edilmediğini söyler.
- sınır kontrolü: `if (i < n)`, böylece bir thread asla bir vektörün sonunu aşıp okumaz ya da yazmaz.
- unified memory (birleşik bellek): `cudaMallocManaged` ile alınan, iki tarafın da tek bir pointer ile kullanabildiği bellek.
- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran, binlerce küçük çekirdekli işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): `main()`'i çalıştıran ve kernel'ları başlatan ana işlemci.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'nun içinde block'ları çalıştıran işlemci. Bir block her zaman tek bir SM'de çalışır.
- compute capability (CC, hesaplama yeteneği): bir GPU neslinin sürüm numarası, L40S'te 8.9. `-arch=sm_XX` değerini o belirler.
- indeks (index): bir elemanın dizideki konumu, 0'dan sayılır. `c[3]`, `c`'nin dördüncü elemanıdır.
- paralel (parallel): sırayla tek tek değil, birçok çekirdekte aynı anda.
- `__global__`: bir fonksiyonu kernel olarak işaretler. CPU onu başlatır, GPU çalıştırır.
- `const`: salt okunur veri için bir C anahtar kelimesi. `const int *a` ile kernel `a[i]`'yi okuyabilir ama ona yazamaz.
- `threadIdx.x`: thread'in kendi block'u içindeki indeksi. 1024 thread'lik tek bir block'ta 0'dan 1023'e gider, her eleman için bir değer.
- `CHECK`: bu programdaki hata kontrol makrosu. Bir CUDA çağrısını sarar ve çağrı `cudaSuccess` döndürmezse dosya, satır ve sebeple durur.
- `nvcc`: CUDA derleyicisi. Bir `.cu` dosyasının CPU ve GPU kısımlarını tek bir programa derler.
- `-arch=sm_89`: compute capability 8.9 için, yani L40S için derler.
