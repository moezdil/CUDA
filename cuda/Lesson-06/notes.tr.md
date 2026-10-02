# 06 > Linux'ta CUDA Derlemek

Ders 00 ile 04 arasındaki programları tek bir kısa komutla derledin. Bu derste, Linux'ta bir CUDA (Compute Unified Device Architecture, birleşik hesaplama aygıt mimarisi) programını derleyip çalıştırmanın her adımından geçeceğiz. Ayrıca hangi GPU (Graphics Processing Unit, grafik işlem birimi) için derlediğini belirten `-arch` seçeneğini ekleyeceğiz. Son olarak, `cudaDeviceSynchronize()` eksikken bir kernel'ın neden hiçbir şey yazdıramayabileceğini göreceksin.

> [!NOTE]
> Bu sayfadaki tüm çıktılar, Ubuntu 24 üzerinde CUDA 13.0 ile çalışan bir NVIDIA L40S'ten alındı.

## Kod

Program `code/project001.cu` dosyasında:

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    // print the blocks and threads IDs
    // warp = 32 threads. (64 threads/block) --> (64/32 = 2 warps/block)
    int warp_ID_Value = 0;
    warp_ID_Value = threadIdx.x / 32;
    printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
           blockIdx.x, threadIdx.x, warp_ID_Value);
}

int main()
{
    // kernel_name<<<num_of_blocks, num_of_threads_per_block>>>();
    test01 <<<2, 64>>> ();
    cudaDeviceSynchronize();
    return 0;
}
```

Başlatmada 64'er thread'li 2 block kullanılıyor, yani toplam 2 × 64 = 128 thread. Her block'ta 64 / 32 = 2 warp var.

- Üç `#include` satırı şunları getirir: CUDA runtime fonksiyonlarını, `blockIdx` ve `threadIdx` gibi yerleşik değişkenleri ve `printf`'i.
- `__global__`, `test01`'i bir kernel olarak işaretler. CPU (Central Processing Unit, merkezi işlem birimi) onu başlatır, GPU çalıştırır.
- `threadIdx.x / 32` warp ID'sini verir, çünkü bir warp 32 thread'dir. İki taraf da tam sayı olduğu için kalan atılır: örneğin thread 45, 45 / 32 = 1 alır. 0-31 arası thread'ler 0, 32-63 arası thread'ler 1 alır.
- `test01 <<<2, 64>>> ();`, kernel'ı 64 thread'lik 2 block ile başlatır.
- `cudaDeviceSynchronize();`, CPU'nun GPU'yu beklemesini sağlar. Bu satırın neden önemli olduğunu aşağıdaki senkronizasyon bölümünde göreceksin.

## Kod Gezintisi

Programı yazacağın sırayla adım adım geç. Yeni olan kısım, kernel'ın `threadIdx.x`'ten hesapladığı warp ID'si.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header'lar.** CUDA runtime, yerleşik değişkenler ve `printf` için `stdio.h`. Bu derslerdeki her program bu üç satırla başlar.
2. `5-6,13 gpu` **Boş kernel.** Önce `__global__ void test01()` ve süslü parantezlerini yaz. Sonra gövdeyi satır satır doldur.
3. `7-8 gpu` **Yorumlarla bir plan.** Koddan önce kernel'ın ne yaptığını ve dayandığı sayıları yaz: warp başına 32 thread, yani block başına 64 thread 2 warp eder. Yorumların çalışma anında hiçbir maliyeti yoktur ve sonraki satırı kontrol etmeyi kolaylaştırır.
4. `9-10 gpu` **Warp ID'si.** `warp_ID_Value`'yu tanımla, sonra ona `threadIdx.x / 32` ata. İki taraf da tam sayı olduğu için bölme kalanı atar: thread 45, 1 alır. Her satırı `;` ile bitir; eksik bir `;`'ün ne yaptığını aşağıdaki Derleme Hataları bölümünde göreceksin.
5. `11-12 gpu` **Yazdırma.** Üç `%d` içeren tek bir `printf`; sırasıyla block ID'si, thread ID'si ve warp ID'siyle doldurulur. Uzun bir çağrı iki satıra yayılabilir, çünkü derleyici `;`'e kadar olan her şeyi tek bir ifade olarak okur.
6. `15-16,20-21 cpu` **main fonksiyonu.** `main`'i, sonunda `return 0;` olacak şekilde yaz. İçindeki her şey CPU'da çalışır.
7. `17-18 cpu` **Başlatma.** Yorum `kernel_name<<<num_of_blocks, num_of_threads_per_block>>>` kalıbını hatırlatır, sonraki satır da onu 64 thread'li 2 block ile doldurur. `<<<2, 64>>>` etrafındaki boşluklar serbesttir; derleyici onları yok sayar.
8. `19 cpu` **GPU'yu bekle.** `cudaDeviceSynchronize();`, bu derste bilerek kaldıracağımız satırdır. Bu makinede program o satır olmadan hiçbir şey yazdırmadı.

</div>

## Derle ve Çalıştır

### Adım 1: nvcc'yi kontrol et

Önce CUDA derleyicisinin kurulu olduğunu kontrol et ve sürümüne bak. Bu komut başarısız olursa bu dersteki hiçbir şey çalışmaz.

```bash
nvcc --version
```

- `nvcc` (NVIDIA CUDA Compiler, NVIDIA CUDA derleyicisi), CUDA derleyicisidir.
- `--version`, derleyicinin sürümünü yazdırır ve çıkar; hiçbir şey derlemez.

Bu makinedeki çıktı:

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Aug_20_01:58:59_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.88
Build cuda_13.0.r13.0/compiler.36424714_0
```

Önemli olan satır `release 13.0, V13.0.88`; sürümün CUDA 13.0 olduğunu söylüyor. Diğer satırlar aracın adı, telif hakkı ve derleyicinin derlenme tarihiyle ID'si.

### Adım 2: derle

Şimdi kaynak dosyayı makinenin çalıştırabileceği bir programa dönüştür. Bu, Ders 00 ile 05 arasında kullandığımız komutun aynısı:

```bash
nvcc -o project001 project001.cu
```

- `nvcc`, `.cu` dosyasındaki hem CPU hem GPU kodunu derler.
- `-o project001`, çıkan programın adını belirler. `-o` olmazsa ad `a.out` olur; her zaman `-o` kullanmak karışıklığı önler.
- `project001.cu`, kaynak dosyadır.

> [!WARNING]
> `project001` adında bir dosya zaten varsa `-o project001` onu sormadan üzerine yazar.

Program dosyasının oluştuğunu kontrol et:

```bash
ls -lh project001
```

- `ls`, dosyaları listeler.
- `-l`, izinler, sahip, boyut ve tarihle birlikte uzun biçimi gösterir.
- `-h`, boyutu `K` ya da `M` gibi okunması kolay bir birimle gösterir.

```
-rwxrwxr-x 1 ubuntu ubuntu 966K Jun  9 21:58 project001
```

Satır `-` ile başlıyor, yani bu normal bir dosya. `rwxrwxr-x` içindeki `x` harfleri dosyanın çalıştırılabildiğini gösterir. `ubuntu ubuntu` sahip ve grup, `966K` ise programın boyutu, yaklaşık 966 KB (kilobayt). Ardından derlendiği tarih, saat ve dosyanın adı geliyor. Derleme başarısız olsaydı `ls`, dosyanın bulunmadığını söylerdi.

### Adım 3: GPU mimarisini belirt

`-arch` olmadan `nvcc`, güvenli ve genel bir varsayılan hedef seçer. Hangi GPU için derlediğini açıkça belirtmek daha iyidir. L40S'in compute capability'si (CC, hesaplama yeteneği) 8.9'dur (bkz. [Ders 03](../Lesson-03/notes.md)) ve mimari adı `sm_89`:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

- `-arch=sm_89`, compute capability 8.9 için, yani L40S için derler. Sayı, CC'nin noktasız hâlidir: 8.9, `89` olur.
- `-o project001` ve `project001.cu` öncekiyle aynı.

Bundan sonraki her ders `-arch=sm_89` ile derliyor. Başka bir GPU'da onun kendi CC'sini yaz, örneğin CC 8.0 için `-arch=sm_80`. Derleyicinin bu hedef için ne ürettiğini [Ders 05](../Lesson-05/notes.md)'te görmüştün.

Bu toolkit'in sm_89'u desteklediğini kontrol et:

```bash
nvcc --help | grep sm_89
```

- `nvcc --help`, derleyicinin bütün seçeneklerini ve izin verilen değerlerini yazdırır.
- `|`, bu metni ekrana değil bir sonraki komuta gönderir.
- `grep sm_89`, yalnızca `sm_89` içeren satırları tutar.

```
        'sm_75','sm_80','sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
        'sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
```

Her satır, yardım metnindeki izin verilen değerler listesinin bir parçası. `grep` eşleşen her satırı yazdırır, bu yüzden `sm_89` iki kez görünüyor. Tek bir eşleşme bile bu toolkit'in L40S için derleyebildiği anlamına gelir. Hiç çıktı olmasaydı `-arch=sm_89` bu `nvcc` ile çalışmazdı.

### Adım 4: çalıştır

Az önce derlediğin programı çalıştır.

```bash
./project001
```

- `./`, "bulunduğun klasörde" demektir. Linux varsayılan olarak programları bulunduğun klasörde aramaz, bu yüzden bunu açıkça söylemen gerekir.
- `project001`, `-o` ile verdiğin program adı.

## Senkronizasyon Sorunu

Kernel başlatma satırında CPU, kernel'ı GPU'ya gönderir ve beklemeden doğrudan bir sonraki satıra geçer. O satır `return 0` ise program, GPU bir şey yazdıramadan biter.

Bunu görmek için `cudaDeviceSynchronize();` satırını sil, yeniden derle ve programı üç kez çalıştır. Bu makinede program bir kez bile bir şey yazdırmadı:

```bash
$ ./project001
$
$ ./project001
$
$ ./project001
$
```

`$`, shell'in komut istemidir ve komutun parçası değildir. Her `./project001` satırından sonra boş bir istem geliyor, yani üç çalıştırmanın hiçbiri bir şey yazdırmadı. Kernel GPU'da gerçekten çalıştı, ama program GPU'nun yazdırma tamponu boşaltılmadan (terminale yazılmadan) bitti.

> [!WARNING]
> Çıktının kaybolması zamanlamaya bağlıdır. Bu makinede hiç görünmedi, ama başka bir makinede, driver'da ya da OS'te (operating system, işletim sistemi) bazı çalıştırmalarda satırların bir kısmını ya da tamamını görebilirsin. Buna asla güvenme: `cudaDeviceSynchronize()` olmadan CPU, GPU'yu beklemez.

`cudaDeviceSynchronize()`, bütün GPU thread'leri bitene kadar CPU'yu o satırda bekletir. Fonksiyon döndüğünde yazdırma tamponu boşaltılmış ve bütün çıktı terminale yazılmış olur. Artık her çalıştırma tam çıktıyı verir.

Satırı geri koy, sonra yeniden derle ve çalıştır:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
./project001
```

- İlk satır programı yeniden derler, böylece kaynak dosyadaki değişiklik programa girer. Eski programı çalıştırsaydın eski davranışı görmeye devam ederdin.
- İkinci satır yeni programı çalıştırır.

<kernel-sync cmd="./project001" out="The block ID is 0 --- The thread ID is 0 --- The warp ID 0|The block ID is 0 --- The thread ID is 1 --- The warp ID 0|... 128 lines in total"></kernel-sync>

## Çıktı

Bu, `cudaDeviceSynchronize()` ve `<<<2, 64>>>` ile `./project001`'in tam çıktısı (128 satır). Her satır bir GPU thread'inden geliyor.

```
The block ID is 0 --- The thread ID is 0 --- The warp ID 0
The block ID is 0 --- The thread ID is 1 --- The warp ID 0
The block ID is 0 --- The thread ID is 2 --- The warp ID 0
The block ID is 0 --- The thread ID is 3 --- The warp ID 0
The block ID is 0 --- The thread ID is 4 --- The warp ID 0
The block ID is 0 --- The thread ID is 5 --- The warp ID 0
The block ID is 0 --- The thread ID is 6 --- The warp ID 0
The block ID is 0 --- The thread ID is 7 --- The warp ID 0
The block ID is 0 --- The thread ID is 8 --- The warp ID 0
The block ID is 0 --- The thread ID is 9 --- The warp ID 0
The block ID is 0 --- The thread ID is 10 --- The warp ID 0
The block ID is 0 --- The thread ID is 11 --- The warp ID 0
The block ID is 0 --- The thread ID is 12 --- The warp ID 0
The block ID is 0 --- The thread ID is 13 --- The warp ID 0
The block ID is 0 --- The thread ID is 14 --- The warp ID 0
The block ID is 0 --- The thread ID is 15 --- The warp ID 0
The block ID is 0 --- The thread ID is 16 --- The warp ID 0
The block ID is 0 --- The thread ID is 17 --- The warp ID 0
The block ID is 0 --- The thread ID is 18 --- The warp ID 0
The block ID is 0 --- The thread ID is 19 --- The warp ID 0
The block ID is 0 --- The thread ID is 20 --- The warp ID 0
The block ID is 0 --- The thread ID is 21 --- The warp ID 0
The block ID is 0 --- The thread ID is 22 --- The warp ID 0
The block ID is 0 --- The thread ID is 23 --- The warp ID 0
The block ID is 0 --- The thread ID is 24 --- The warp ID 0
The block ID is 0 --- The thread ID is 25 --- The warp ID 0
The block ID is 0 --- The thread ID is 26 --- The warp ID 0
The block ID is 0 --- The thread ID is 27 --- The warp ID 0
The block ID is 0 --- The thread ID is 28 --- The warp ID 0
The block ID is 0 --- The thread ID is 29 --- The warp ID 0
The block ID is 0 --- The thread ID is 30 --- The warp ID 0
The block ID is 0 --- The thread ID is 31 --- The warp ID 0
The block ID is 0 --- The thread ID is 32 --- The warp ID 1
The block ID is 0 --- The thread ID is 33 --- The warp ID 1
The block ID is 0 --- The thread ID is 34 --- The warp ID 1
The block ID is 0 --- The thread ID is 35 --- The warp ID 1
The block ID is 0 --- The thread ID is 36 --- The warp ID 1
The block ID is 0 --- The thread ID is 37 --- The warp ID 1
The block ID is 0 --- The thread ID is 38 --- The warp ID 1
The block ID is 0 --- The thread ID is 39 --- The warp ID 1
The block ID is 0 --- The thread ID is 40 --- The warp ID 1
The block ID is 0 --- The thread ID is 41 --- The warp ID 1
The block ID is 0 --- The thread ID is 42 --- The warp ID 1
The block ID is 0 --- The thread ID is 43 --- The warp ID 1
The block ID is 0 --- The thread ID is 44 --- The warp ID 1
The block ID is 0 --- The thread ID is 45 --- The warp ID 1
The block ID is 0 --- The thread ID is 46 --- The warp ID 1
The block ID is 0 --- The thread ID is 47 --- The warp ID 1
The block ID is 0 --- The thread ID is 48 --- The warp ID 1
The block ID is 0 --- The thread ID is 49 --- The warp ID 1
The block ID is 0 --- The thread ID is 50 --- The warp ID 1
The block ID is 0 --- The thread ID is 51 --- The warp ID 1
The block ID is 0 --- The thread ID is 52 --- The warp ID 1
The block ID is 0 --- The thread ID is 53 --- The warp ID 1
The block ID is 0 --- The thread ID is 54 --- The warp ID 1
The block ID is 0 --- The thread ID is 55 --- The warp ID 1
The block ID is 0 --- The thread ID is 56 --- The warp ID 1
The block ID is 0 --- The thread ID is 57 --- The warp ID 1
The block ID is 0 --- The thread ID is 58 --- The warp ID 1
The block ID is 0 --- The thread ID is 59 --- The warp ID 1
The block ID is 0 --- The thread ID is 60 --- The warp ID 1
The block ID is 0 --- The thread ID is 61 --- The warp ID 1
The block ID is 0 --- The thread ID is 62 --- The warp ID 1
The block ID is 0 --- The thread ID is 63 --- The warp ID 1
The block ID is 1 --- The thread ID is 0 --- The warp ID 0
The block ID is 1 --- The thread ID is 1 --- The warp ID 0
The block ID is 1 --- The thread ID is 2 --- The warp ID 0
The block ID is 1 --- The thread ID is 3 --- The warp ID 0
The block ID is 1 --- The thread ID is 4 --- The warp ID 0
The block ID is 1 --- The thread ID is 5 --- The warp ID 0
The block ID is 1 --- The thread ID is 6 --- The warp ID 0
The block ID is 1 --- The thread ID is 7 --- The warp ID 0
The block ID is 1 --- The thread ID is 8 --- The warp ID 0
The block ID is 1 --- The thread ID is 9 --- The warp ID 0
The block ID is 1 --- The thread ID is 10 --- The warp ID 0
The block ID is 1 --- The thread ID is 11 --- The warp ID 0
The block ID is 1 --- The thread ID is 12 --- The warp ID 0
The block ID is 1 --- The thread ID is 13 --- The warp ID 0
The block ID is 1 --- The thread ID is 14 --- The warp ID 0
The block ID is 1 --- The thread ID is 15 --- The warp ID 0
The block ID is 1 --- The thread ID is 16 --- The warp ID 0
The block ID is 1 --- The thread ID is 17 --- The warp ID 0
The block ID is 1 --- The thread ID is 18 --- The warp ID 0
The block ID is 1 --- The thread ID is 19 --- The warp ID 0
The block ID is 1 --- The thread ID is 20 --- The warp ID 0
The block ID is 1 --- The thread ID is 21 --- The warp ID 0
The block ID is 1 --- The thread ID is 22 --- The warp ID 0
The block ID is 1 --- The thread ID is 23 --- The warp ID 0
The block ID is 1 --- The thread ID is 24 --- The warp ID 0
The block ID is 1 --- The thread ID is 25 --- The warp ID 0
The block ID is 1 --- The thread ID is 26 --- The warp ID 0
The block ID is 1 --- The thread ID is 27 --- The warp ID 0
The block ID is 1 --- The thread ID is 28 --- The warp ID 0
The block ID is 1 --- The thread ID is 29 --- The warp ID 0
The block ID is 1 --- The thread ID is 30 --- The warp ID 0
The block ID is 1 --- The thread ID is 31 --- The warp ID 0
The block ID is 1 --- The thread ID is 32 --- The warp ID 1
The block ID is 1 --- The thread ID is 33 --- The warp ID 1
The block ID is 1 --- The thread ID is 34 --- The warp ID 1
The block ID is 1 --- The thread ID is 35 --- The warp ID 1
The block ID is 1 --- The thread ID is 36 --- The warp ID 1
The block ID is 1 --- The thread ID is 37 --- The warp ID 1
The block ID is 1 --- The thread ID is 38 --- The warp ID 1
The block ID is 1 --- The thread ID is 39 --- The warp ID 1
The block ID is 1 --- The thread ID is 40 --- The warp ID 1
The block ID is 1 --- The thread ID is 41 --- The warp ID 1
The block ID is 1 --- The thread ID is 42 --- The warp ID 1
The block ID is 1 --- The thread ID is 43 --- The warp ID 1
The block ID is 1 --- The thread ID is 44 --- The warp ID 1
The block ID is 1 --- The thread ID is 45 --- The warp ID 1
The block ID is 1 --- The thread ID is 46 --- The warp ID 1
The block ID is 1 --- The thread ID is 47 --- The warp ID 1
The block ID is 1 --- The thread ID is 48 --- The warp ID 1
The block ID is 1 --- The thread ID is 49 --- The warp ID 1
The block ID is 1 --- The thread ID is 50 --- The warp ID 1
The block ID is 1 --- The thread ID is 51 --- The warp ID 1
The block ID is 1 --- The thread ID is 52 --- The warp ID 1
The block ID is 1 --- The thread ID is 53 --- The warp ID 1
The block ID is 1 --- The thread ID is 54 --- The warp ID 1
The block ID is 1 --- The thread ID is 55 --- The warp ID 1
The block ID is 1 --- The thread ID is 56 --- The warp ID 1
The block ID is 1 --- The thread ID is 57 --- The warp ID 1
The block ID is 1 --- The thread ID is 58 --- The warp ID 1
The block ID is 1 --- The thread ID is 59 --- The warp ID 1
The block ID is 1 --- The thread ID is 60 --- The warp ID 1
The block ID is 1 --- The thread ID is 61 --- The warp ID 1
The block ID is 1 --- The thread ID is 62 --- The warp ID 1
The block ID is 1 --- The thread ID is 63 --- The warp ID 1
```

Nasıl okunur:

- 128 satır var, çünkü 2 block × 64 thread = 128 thread ve her thread `printf`'i bir kez çağırıyor.
- Thread ID'si block 0'da 0'dan 63'e gidiyor, sonra block 1'de yeniden 0'dan başlıyor; çünkü `threadIdx.x` bütün başlatma boyunca değil, bir block'un içinde sayar.
- Warp ID'si 0-31 arası thread'ler için 0, 32-63 arası thread'ler için 1, çünkü `threadIdx.x / 32` tam sayı bölmesidir. Thread ID'si her block'ta yeniden başladığı için warp ID'si de yeniden başlar.

Bu makinede iki çalıştırmada da block 0, block 1'den önce yazdırdı; ikinci çalıştırma aynı 128 satırı aynı sırayla verdi. Yine de block sırası başka çalıştırmalarda ya da makinelerde garanti değildir.

## Derleme Hataları

Derleyicinin hataları nasıl bildirdiğini görmek için `warp_ID_Value = threadIdx.x / 32` satırının (satır 10) sonundaki `;` işaretini sil ve yeniden derle:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

Bu, öncekiyle aynı derleme komutu. Bu sefer başarısız olur, bu yüzden yeni bir program oluşmaz.

Bu makinedeki çıktı:

```
project001.cu(9): error: expected a ";"
      printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
      ^

1 error detected in the compilation of "project001.cu".
```

Nasıl okunur:

- `project001.cu(9)`, dosya adı ve parantez içinde satır numarası.
- `error: expected a ";"`, derleyicinin ne beklediğini söylüyor.
- Sonraki satır kaynak satırı tekrarlıyor; `^` ise derleyicinin sorunu fark ettiği yeri gösteriyor.
- Son satır dosyadaki hataları sayıyor.

Hata, noktalı virgülün eksik olduğu satırı değil, `printf` satırını gösteriyor. Çünkü derleyici sorunu ancak bir sonraki kelimeye geldiğinde fark eder ve o kelime `printf` satırındadır.

> [!TIP]
> Derleyici sorunsuz görünen bir satırda hata bildirirse hemen önceki satıra bak. Eksik bir `;` ya da `)` genellikle bir satır geç fark edilir.

> [!NOTE]
> Bu çıktı, kernel'a iki yorum satırı eklenmeden önce alındı, bu yüzden satır 9 diyor. Yukarıdaki dosyada noktalı virgül satır 10'da eksik ve hata satır 11'i gösteriyor.

Noktalı virgülü geri koy, yeniden derle ve derlemenin hatasız olduğunu kontrol et.

## Bu Makine

| Ayar | Değer |
|---|---|
| CUDA sürümü | 13.0 |
| GPU | NVIDIA L40S (46 GB, Ada Lovelace, CC 8.9, `sm_89`) |
| OS | doğrudan Ubuntu 24 |
| Erişim | başka bir bilgisayardan SSH (Secure Shell, güvenli kabuk) |

Bu dersteki komutlar diğer Linux makinelerinde de aynı şekilde çalışır; GPU'ya göre yalnızca `-arch` değeri değişir.

## Özet

| Adım | Komut |
|---|---|
| Derleyiciyi kontrol et | `nvcc --version` |
| Derle | `nvcc -o project001 project001.cu` |
| Derle (L40S) | `nvcc -arch=sm_89 -o project001 project001.cu` |
| Çalıştır | `./project001` |

Program bitmeden önce CPU'nun GPU'nun çıktısına ya da sonuçlarına ihtiyacı varsa, kernel başlatmasından sonra `cudaDeviceSynchronize()` ekle. Bu satır olmadan bu makinede hiçbir şey yazdırılmıyor.

## Kendin Yaz

Bu dersteki tam döngüyle kendi programını yaz, derle ve çalıştır.

1. Aşağıdaki iskeletle `warps.cu` oluştur.
2. Kernel'da her block'un yalnızca thread 0'ı, `blockDim.x / 32` ile kendi block'unda kaç warp olduğunu yazdırsın.
3. 96 thread'li 3 block başlat.
4. `-arch=sm_89` (ya da kendi GPU'nun değeri) ile derle, sonra çalıştır.
5. `cudaDeviceSynchronize();` satırını kaldır, yeniden derle ve neyin değiştiğini görmek için birkaç kez çalıştır.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void countWarps()
{
    // TODO: only thread 0 of each block prints
    // TODO: print "block b has w warps", with w = threads per block / 32
}

int main()
{
    // TODO: launch countWarps with 3 blocks of 96 threads
    // TODO: wait for the GPU
    return 0;
}
```

??? tip "İpucu"
    `if (threadIdx.x == 0)` her block'tan bir thread seçer, çünkü her block'un kendi thread 0'ı vardır. `nvcc -arch=sm_89 -o warps warps.cu` ile derle.

??? note "Çözüm"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void countWarps()
    {
        if (threadIdx.x == 0) {
            printf("block %d has %d warps\n", blockIdx.x, blockDim.x / 32);
        }
    }

    int main()
    {
        countWarps<<<3, 96>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    `nvcc -arch=sm_89 -o warps warps.cu` ve `./warps` ile derle ve çalıştır. Herhangi bir sırayla 3 satır görmelisin: `block 0 has 3 warps`, `block 1 has 3 warps` ve `block 2 has 3 warps`, çünkü 96 / 32 = 3.

## Sözlük

- `nvcc` (NVIDIA CUDA Compiler): CUDA derleyici sürücüsü (compiler driver); aynı `.cu` dosyasındaki host ve device kodunu birlikte işler.
- `-o`: çıkan programın adını belirler; varsayılan ad `a.out`.
- `-arch=sm_89`: compute capability 8.9 için, yani L40S (Ada Lovelace) için derler.
- CC (compute capability, hesaplama yeteneği): 8.9 gibi, bir GPU neslinin sürüm numarası; bkz. [Ders 03](../Lesson-03/notes.md).
- `cudaDeviceSynchronize()`: o ana kadar başlatılan bütün GPU işleri bitene kadar CPU'yu bekletir.
- warp ID: bir thread'in kendi block'u içinde ait olduğu warp; değeri `threadIdx.x / 32`.
- SSH (Secure Shell): ağ üzerinden başka bir bilgisayara girip orada komut çalıştırmanın bir yolu.
- CUDA runtime: `cudaDeviceSynchronize()` gibi çağrıların arkasındaki kütüphane; fonksiyonlarını `cuda_runtime.h` başlık dosyası tanımlar.
- `__global__`: bir fonksiyonu kernel olarak işaretler; CPU onu başlatır, GPU çalıştırır.
- warp: GPU'nun birlikte çalıştırdığı 32 thread'lik grup; block başına 64 thread, 2 warp eder.
- tam sayı bölmesi (integer division): iki tam sayının kalanı atan bölmesi. 45 / 32 = 1 ve 63 / 32 = 1, ama 64 / 32 = 2.
- `printf`: C'nin yazdırma fonksiyonu; kernel'da her thread onu çalıştırır ve satırlar önce yazdırma tamponuna gider.
- yazdırma tamponu (print buffer): kernel'daki `printf` satırlarının beklediği GPU belleği; `cudaDeviceSynchronize()` anında terminale boşaltılır.
- komut istemi (shell prompt): shell'in bir komut beklerken gösterdiği, genellikle `$` ile biten metin; onu sen yazmazsın.
- OS (operating system, işletim sistemi): bir bilgisayarın temel yazılımı; burada bir Linux sistemi olan Ubuntu 24.
- noktalı virgül (semicolon): her C ve C++ ifadesini bitiren `;`; biri eksikse derleyici hatayı bir sonraki ifadenin başında bildirir.
- L40S: bu derslerde kullanılan NVIDIA veri merkezi GPU'su; Ada Lovelace mimarisi, CC 8.9 ve 142 SM.
- Ada Lovelace: NVIDIA'nın 2022'de çıkan, CC 8.9'lu GPU mimarisi. L40S'te ve GeForce RTX 40 serisinde kullanılır.
