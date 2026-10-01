# Ders 05: CUDA Platform Katmanları

Ders 00 ile 04 arası, CUDA'nın (Compute Unified Device Architecture, birleşik hesaplama aygıt mimarisi) küçük bir parçasını kullandı: C/C++ ile yazılıp `nvcc` ile derlenen bir kernel. Bu ders bir adım geri çekilip, CUDA Toolkit 13 ile gelen platformun tamamını gösteriyor. Katmanları bilirsen, ileride karşına çıkan her yeni araç ya da kütüphanenin nereye oturduğunu kolayca görürsün.

## Beş Katman

CUDA platformunun beş katmanı var. Kod yazdığın diller en üstte durur. GPU (Graphics Processing Unit, grafik işlem birimi) donanımı alta yakın durur. AI (Artificial Intelligence, yapay zeka) kütüphaneleri ise hepsinin üzerine kurulur. Bir katmana ya da öğeye tıklayıp onunla ilgili açıklamayı okuyabilirsin.

<cuda-stack></cuda-stack>

1. Programlama dilleri: GPU kodunu nasıl yazdığın.
2. Geliştirme araçları: yavaş kısımları ve hataları nasıl bulduğun.
3. Compiler araç zinciri: kaynak kodunun nasıl GPU komutlarına dönüştüğü.
4. Donanım yetenekleri: GPU'nun kendisindeki özel birimler ve özellikler.
5. Yapay zeka framework katmanı: derin öğrenme framework'lerinin kullandığı hazır kütüphaneler.

## Programlama Dilleri

- CUDA C/C++, kernel yazmak için kullanılan ana dildir. Ders 00 ile 04 arasındaki tüm dersler bunu kullandı.
- CUDA Fortran, Fortran programcılarının kernel'ları C++ yerine Fortran ile yazmasını sağlar.
- OpenACC (Open Accelerators, açık hızlandırıcılar) tersten çalışır: normal C, C++ ya da Fortran döngülerine kısa işaretler (annotation) eklersin, compiler da bu döngüleri GPU koduna çevirir. Hiçbir kernel'ı elle yazmazsın.
- Python, GPU'ya kütüphaneler üzerinden ulaşır. CuPy sana GPU'da duran, NumPy tarzı diziler verir. Numba, Python fonksiyonlarını GPU kernel'larına derler. NVIDIA'nın kendi CUDA Python paketleri (`cuda-python`) ise Python'a CUDA driver ve runtime API'lerine (Application Programming Interfaces, uygulama programlama arayüzleri) doğrudan erişim verir.

Hepsi sonunda aynı GPU donanımında çalışır. Ders 00 ile 04 arasında tanıdığın block'lar, thread'ler ve warp'lar burada da aynıdır.

## Geliştirme Araçları

- Nsight Systems, tüm program için CPU (Central Processing Unit, merkezi işlem birimi) ve GPU işlerinin bir zaman çizelgesini kaydeder. Zamanın nereye gittiğini gösterir. Örneğin CPU veri kopyalarken GPU'nun boşta bekleyip beklemediğini görürsün.
- Nsight Compute tek bir kernel'a ayrıntılı bakar ve onun donanımı ne kadar iyi kullandığını gösterir.
- Compute Sanitizer programı çalıştırır ve kernel'ların içindeki bellek hatalarını raporlar. Örneğin bir dizinin sonunu aşıp yazan bir thread'i yakalar.

> [!TIP]
> Programın yavaş kısmını bulmak için önce Nsight Systems ile başla, sonra o tek kernel'a Nsight Compute ile bak. Çalışma süresinin yalnızca %1'ini alan bir kernel'ı ölçmek boşa harcanan emektir.

## Compiler Araç Zinciri

`nvcc` (NVIDIA CUDA Compiler, NVIDIA CUDA derleyicisi) `.cu` dosyalarını derler. Şimdiye kadarki her ders, derleme adımında onu kullandı. Dosyayı ikiye ayırır:

- Host kodu, yani CPU'da çalışan kısım, normal C++ compiler'ına gider: Linux'ta `gcc` ya da `clang`, Windows'ta MSVC (Microsoft Visual C++).
- Device kodu, yani kernel'lar, NVIDIA'nın kendi araçlarıyla iki aşamada derlenir. Önce PTX'e (Parallel Thread Execution, paralel thread yürütme) dönüşür. PTX, tek bir GPU'ya bağlı olmayan sanal bir komut setidir. Sonra PTX, SASS'a (Streaming ASSembler) dönüşür. SASS, tek bir GPU neslinin gerçek makine komutlarıdır.

<nvcc-pipeline></nvcc-pipeline>

Program dosyası hem SASS'ı hem de PTX'i tutabilir. Program başladığında driver, GPU'ya uyan SASS'ı seçer. Uyan yoksa PTX'i o anda SASS'a derler. Buna JIT (just-in-time, tam zamanında) derleme denir.

Bir örnek üzerinden gidelim: Ders 06, `-arch=sm_89` ile derleniyor. Bu, programın içine compute capability (CC, hesaplama yeteneği) 8.9 için SASS ve CC 8.9 için PTX koyar.

- L40S'te (CC 8.9) driver, saklanan SASS'ı doğrudan çalıştırır.
- Daha yeni bir GPU'da, örneğin CC 12.0 olan birinde, 12.0 için SASS yoktur. Driver, saklanan PTX'i açılışta CC 12.0 için SASS'a derler ve program yine çalışır.
- Daha eski bir GPU'da, örneğin CC 8.0 olan birinde, ikisi de uymaz. Çünkü CC 8.9 için PTX, CC 8.0'da olmayan özellikleri kullanıyor olabilir. Program kernel'larını başlatamaz.

> [!NOTE]
> JIT derleme, program başlarken zaman alır. Driver ayrıca yalnızca kendisine verilen PTX sürümünün özelliklerini kullanabilir. Bir GPU'da en iyi hızı istiyorsan, o GPU'nun compute capability'si için SASS derle (Ders 03).

## Donanım Yetenekleri

- Tensor Core'lar, her SM'nin (Streaming Multiprocessor, akış çoklu işlemcisi) içinde matris hesabı için yapılmış birimlerdir. Ders 03'te saydığın FP32 (32-bit floating point, 32 bit kayan noktalı sayı) core'lardan ayrıdırlar. FP16 (16-bit floating point, 16 bit kayan noktalı sayı) ve FP8 (8-bit floating point, 8 bit kayan noktalı sayı) gibi küçük sayı biçimlerindeki matris işlerinde çok daha hızlıdırlar. Derin öğrenme onları yoğun şekilde kullanır.
- MIG (Multi-Instance GPU, çok örnekli GPU), tek bir veri merkezi GPU'sunu en fazla yedi yalıtılmış parçaya böler. Her parçanın kendi SM'leri ve belleği vardır ve kendi başına bir GPU gibi davranır. Örneğin 80 GB'lık (gigabyte) bir A100, her biri yaklaşık 10 GB olan yedi parçaya bölünebilir. Böylece yedi kullanıcı tek bir kartı birbirini yavaşlatmadan paylaşır.
- Dynamic Parallelism, çalışan bir kernel'ın GPU'dan başka bir kernel başlatmasını sağlar. Ders 00 ile 04 arasında kernel'ları yalnızca CPU başlattı. Dynamic Parallelism bu adımı GPU'ya taşır. Böylece bir kernel, CPU'ya gidip gelmeden yeni iş başlatabilir.
- GPUDirect, GPU'ların CPU belleğine uğramadan birbirine, bir ağ kartına ya da depolamaya doğrudan veri taşımasını sağlar.
- NVLink, NVIDIA'nın GPU'lar arasındaki hızlı doğrudan bağlantısıdır. Bir GPU'nun takıldığı normal yuva olan PCIe'den (Peripheral Component Interconnect Express) çok daha hızlıdır.

Küçük sayı biçimleri önemlidir, çünkü bellekten ve zamandan tasarruf ettirir. Bir FP32 sayısı 4 byte, bir FP16 sayısı 2 byte, bir FP8 sayısı ise 1 byte yer kaplar. 1 milyar sayılık bir model FP32'de 4 GB, FP16'da 2 GB, FP8'de 1 GB ister. Bir Tensor Core ayrıca saniyede FP16'ya göre daha fazla FP8 hesabı yapar.

> [!NOTE]
> Her GPU'da her özellik yoktur. Bu derslerde kullanılan L40S'te FP8 Tensor Core'lar var. Ama MIG ve NVLink yok, ayrıca H100 ve B200 gibi GPU'lardaki HBM (High Bandwidth Memory, yüksek bant genişlikli bellek) yerine GDDR6 bellek kullanıyor. Kendi GPU'nun veri sayfasına bak.

## Yapay Zeka Framework Katmanı

- cuBLAS (CUDA Basic Linear Algebra Subprograms, CUDA temel doğrusal cebir alt programları), NVIDIA'nın GPU'da matris ve vektör hesabı için kütüphanesidir. CUDA Toolkit ile birlikte gelir.
- cuDNN (CUDA Deep Neural Network library, CUDA derin sinir ağı kütüphanesi), derin öğrenme için konvolüsyon ve attention gibi GPU işlemlerinden oluşan bir kütüphanedir. PyTorch ve TensorFlow onu arka planda çağırır.
- TensorRT, eğitilmiş bir modeli alır ve belirli bir GPU'da olabildiğince hızlı çalışacak şekilde yeniden kurar.
- NCCL (NVIDIA Collective Communications Library, NVIDIA toplu iletişim kütüphanesi, "nikel" diye okunur), GPU'lar arasında veri taşır. Örneğin tek bir modeli birlikte eğiten sekiz GPU'nun sonuçlarını toplar. Varsa NVLink ve GPUDirect'i kullanır.

PyTorch kullanırken bu kütüphaneleri nadiren kendin çağırırsın. Yine de tek satırlık bir PyTorch kodunun GPU'da hızlı çalışmasının sebebi onlardır.

## Sözlük

- CUDA (Compute Unified Device Architecture): NVIDIA'nın GPU'da genel amaçlı programlar çalıştırmak için platformu.
- CUDA Fortran: GPU kernel'ları yazmak için eklentileri olan Fortran.
- OpenACC (Open Accelerators): C, C++ ve Fortran döngüleri için işaretler. Compiler'ın GPU kodunu senin yerine üretmesini sağlar.
- CuPy: GPU'da NumPy tarzı diziler sunan Python kütüphanesi.
- Numba: Python fonksiyonlarını GPU kernel'larına çevirebilen Python compiler'ı.
- CUDA Python (`cuda-python`): CUDA driver ve runtime API'lerine doğrudan erişim için NVIDIA'nın Python paketleri.
- API (Application Programming Interface, uygulama programlama arayüzü): bir kütüphanenin koduna sunduğu fonksiyonlar kümesi.
- `nvcc` (NVIDIA CUDA Compiler): CUDA compiler'ı. Aynı `.cu` dosyasındaki host ve device kodunu birlikte işler.
- MSVC (Microsoft Visual C++): `nvcc`'nin Windows'ta host kodu için kullandığı C++ compiler'ı.
- PTX (Parallel Thread Execution): device kodunun ilk derlendiği sanal komut seti. Tek bir GPU'ya bağlı değildir.
- SASS (Streaming ASSembler): tek bir GPU neslinin gerçek makine kodu.
- JIT (just-in-time) derleme: saklanmış uygun bir SASS yoksa driver'ın program başlarken PTX'i SASS'a derlemesi.
- Nsight Systems: tüm program için CPU ve GPU işlerinin zaman çizelgesini gösteren profiler.
- Nsight Compute: tek bir kernel'ın GPU donanımını ne kadar iyi kullandığını ölçen profiler.
- Compute Sanitizer: program çalışırken kernel'ların içindeki bellek hatalarını bulan araç.
- Tensor Core: her SM'nin içindeki matris hesap birimi. Matris işlerinde FP32 core'lardan çok daha hızlıdır.
- FP32 / FP16 / FP8: 32, 16 ve 8 bitlik kayan noktalı sayılar. Sırasıyla 4, 2 ve 1 byte yer kaplarlar.
- MIG (Multi-Instance GPU): tek bir fiziksel GPU'yu en fazla yedi yalıtılmış parçaya böler. Her parça kendi başına bir GPU gibi davranır.
- Dynamic Parallelism: GPU'daki bir kernel, CPU'ya geri dönmeden başka bir kernel başlatabilir.
- GPUDirect: GPU'ların CPU belleğinden geçmeden birbirine, bir ağ kartına ya da depolamaya veri taşımasını sağlar.
- NVLink: NVIDIA'nın GPU'lar arasındaki hızlı doğrudan bağlantısı.
- PCIe (Peripheral Component Interconnect Express): GPU'yu bilgisayarın geri kalanına bağlayan standart yuva ve veri yolu.
- HBM (High Bandwidth Memory): H100 ve B200 gibi veri merkezi GPU'larında kullanılan çok hızlı GPU belleği.
- cuBLAS (CUDA Basic Linear Algebra Subprograms): NVIDIA'nın matris ve vektör hesabı için GPU kütüphanesi.
- cuDNN (CUDA Deep Neural Network library): derin öğrenme için GPU işlemleri kütüphanesi. PyTorch ve TensorFlow onu arka planda kullanır.
- TensorRT: eğitilmiş bir modelin belirli bir GPU'da hızlı çalışmasını sağlar.
- NCCL (NVIDIA Collective Communications Library): GPU'lar arasında veri taşıma kütüphanesi. Çok sayıda GPU ile eğitimde kullanılır.
