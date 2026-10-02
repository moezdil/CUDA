# 05 > CUDA Platform Katmanları

Ders 00 ile 04 arası, CUDA'nın yalnızca küçük bir parçasını kullandı: C/C++ ile yazılıp `nvcc` ile derlenen bir kernel. Bu derste bir adım geri çekilip CUDA Toolkit 13 ile gelen platformun tamamına bakıyoruz. Katmanları bilirsen, ileride karşına çıkan her yeni araç ya da kütüphanenin nereye oturduğunu kolayca görürsün.

## Beş Katman

CUDA platformunun beş katmanı var. Kod yazdığın diller en üstte, GPU donanımı en altta durur; AI kütüphaneleri de hepsinin üzerine kurulur. Bir katmana ya da öğeye tıklayıp açıklamasını okuyabilirsin.

<cuda-stack></cuda-stack>

1. Programlama dilleri: GPU kodunu nasıl yazdığın.
2. Geliştirme araçları: yavaş kısımları ve hataları nasıl bulduğun.
3. Derleyici araç zinciri: kaynak kodunun GPU komutlarına nasıl dönüştüğü.
4. Donanım yetenekleri: GPU'nun kendisindeki özel birimler ve özellikler.
5. Yapay zekâ framework katmanı: derin öğrenme framework'lerinin kullandığı hazır kütüphaneler.

## Programlama Dilleri

- CUDA C/C++, kernel yazmak için kullanılan ana dildir; Ders 00 ile 04 arasındaki bütün dersler onu kullandı.
- CUDA Fortran, Fortran programcılarının kernel'ları C++ yerine Fortran ile yazmasını sağlar.
- OpenACC tersten çalışır: normal C, C++ ya da Fortran döngülerine kısa işaretler eklersin, derleyici de bu döngüleri GPU koduna çevirir. Hiçbir kernel'ı elle yazmazsın.
- Python, GPU'ya kütüphaneler üzerinden ulaşır. CuPy sana GPU'da duran, NumPy tarzı diziler verir; Numba, Python fonksiyonlarını GPU kernel'larına derler. NVIDIA'nın kendi CUDA Python paketleri (`cuda-python`) ise Python'a CUDA driver ve runtime API'lerine doğrudan erişim sağlar.

Hepsi sonunda aynı GPU donanımında çalışır; Ders 00 ile 04 arasında tanıdığın block'lar, thread'ler ve warp'lar burada da aynıdır.

## Geliştirme Araçları

- Nsight Systems, bütün program için CPU ve GPU işlerinin bir zaman çizelgesini kaydeder ve zamanın nereye gittiğini gösterir. Örneğin CPU veri kopyalarken GPU'nun boşta bekleyip beklemediğini görürsün.
- Nsight Compute tek bir kernel'a ayrıntılı bakar ve onun donanımı ne kadar iyi kullandığını gösterir.
- Compute Sanitizer programı çalıştırır ve kernel'ların içindeki bellek hatalarını raporlar; örneğin bir dizinin sonunu aşıp yazan bir thread'i yakalar.

> [!TIP]
> Programın yavaş kısmını bulmak için önce Nsight Systems'ı kullan, sonra o tek kernel'a Nsight Compute ile bak. Çalışma süresinin yalnızca %1'ini alan bir kernel'ı ölçmek boşa harcanmış emektir.

## Derleyici Araç Zinciri

`nvcc` `.cu` dosyalarını derler; şimdiye kadarki her derste derleme adımında onu kullandık. Dosyayı ikiye ayırır:

- Host kodu, yani CPU'da çalışan kısım, normal bir C++ derleyicisine gider: Linux'ta `gcc` ya da `clang`, Windows'ta MSVC.
- Device kodu, yani kernel'lar, NVIDIA'nın kendi araçlarıyla iki aşamada derlenir. Önce PTX'e dönüşür; PTX, tek bir GPU'ya bağlı olmayan sanal bir komut setidir. Sonra PTX, SASS'a dönüşür; SASS, tek bir GPU neslinin gerçek makine komutlarıdır.

<nvcc-pipeline></nvcc-pipeline>

Program dosyası hem SASS'ı hem de PTX'i tutabilir. Program başladığında driver, GPU'ya uyan SASS'ı seçer; uyan yoksa PTX'i o anda SASS'a derler. Buna JIT derleme denir.

Bir örnekle bakalım: Ders 06'da `-arch=sm_89` ile derliyoruz. Bu, programın içine compute capability 8.9 için hem SASS hem de PTX koyar.

- L40S'te (CC 8.9) driver, saklanan SASS'ı doğrudan çalıştırır.
- Daha yeni bir GPU'da, örneğin CC 12.0 olan birinde, 12.0 için SASS yoktur. Driver, saklanan PTX'i açılışta CC 12.0 için SASS'a derler ve program yine çalışır.
- Daha eski bir GPU'da, örneğin CC 8.0 olan birinde, ikisi de uymaz, çünkü CC 8.9 için PTX, CC 8.0'da olmayan özellikleri kullanıyor olabilir. Program kernel'larını başlatamaz.

> [!NOTE]
> JIT derleme, program başlarken zaman alır. Ayrıca driver yalnızca kendisine verilen PTX sürümünün özelliklerini kullanabilir. Bir GPU'da en iyi hızı istiyorsan, o GPU'nun compute capability'si için SASS derle (Ders 03).

## Donanım Yetenekleri

- Tensor Core'lar, her SM'nin içinde matris hesabı için tasarlanmış birimlerdir. Ders 03'te saydığın FP32 çekirdeklerinden ayrıdırlar ve FP16 ya da FP8 gibi küçük sayı biçimlerindeki matris işlerinde çok daha hızlıdırlar. Derin öğrenme onları yoğun şekilde kullanır.
- MIG, tek bir veri merkezi GPU'sunu en fazla yedi yalıtılmış parçaya böler. Her parçanın kendi SM'leri ve belleği vardır ve kendi başına bir GPU gibi davranır. Örneğin 80 GB'lık bir A100, her biri yaklaşık 10 GB olan yedi parçaya bölünebilir; böylece yedi kullanıcı tek bir kartı birbirini yavaşlatmadan paylaşır.
- Dynamic Parallelism, çalışan bir kernel'ın GPU üzerinden başka bir kernel başlatmasını sağlar. Ders 00 ile 04 arasında kernel'ları yalnızca CPU başlattı; Dynamic Parallelism bu adımı GPU'ya taşır. Böylece bir kernel, CPU'ya gidip gelmeden yeni iş başlatabilir.
- GPUDirect, GPU'ların CPU belleğine uğramadan birbirine, bir ağ kartına ya da depolamaya doğrudan veri taşımasını sağlar.
- NVLink, NVIDIA'nın GPU'lar arasındaki hızlı ve doğrudan bağlantısıdır. GPU'nun takıldığı standart yuva olan PCIe'den çok daha hızlıdır.

Küçük sayı biçimleri önemlidir, çünkü bellekten ve zamandan tasarruf sağlar. Bir FP32 sayısı 4 bayt, bir FP16 sayısı 2 bayt, bir FP8 sayısı ise 1 bayt yer kaplar. 1 milyar sayılık bir model FP32'de 4 GB, FP16'da 2 GB, FP8'de 1 GB ister. Ayrıca bir Tensor Core saniyede FP16'ya göre daha fazla FP8 hesabı yapar.

> [!NOTE]
> Her GPU'da her özellik yoktur. Bu derslerde kullanılan L40S'te FP8 Tensor Core'lar var, ama MIG ve NVLink yok; ayrıca H100 ve B200 gibi GPU'lardaki HBM yerine GDDR6 bellek kullanıyor. Kendi GPU'nun veri sayfasına bak.

## Yapay Zekâ Framework Katmanı

- cuBLAS, NVIDIA'nın GPU'da matris ve vektör hesabı için sunduğu kütüphanedir; CUDA Toolkit ile birlikte gelir.
- cuDNN, derin öğrenme için konvolüsyon ve attention gibi GPU işlemlerinden oluşan bir kütüphanedir; PyTorch ve TensorFlow onu arka planda çağırır.
- TensorRT, eğitilmiş bir modeli alır ve belirli bir GPU'da olabildiğince hızlı çalışacak şekilde yeniden kurar.
- "Nikel" diye okunan NCCL, GPU'lar arasında veri taşır; örneğin tek bir modeli birlikte eğiten sekiz GPU'nun sonuçlarını toplar. Varsa NVLink ve GPUDirect'i kullanır.

PyTorch kullanırken bu kütüphaneleri nadiren kendin çağırırsın, ama tek satırlık bir PyTorch kodunun GPU'da hızlı çalışmasının sebebi onlardır.

## Sözlük

- CUDA (Compute Unified Device Architecture): NVIDIA'nın GPU'da genel amaçlı programlar çalıştırmak için sunduğu platform.
- CUDA Fortran: GPU kernel'ları yazmak için eklentileri olan Fortran.
- OpenACC (Open Accelerators): C, C++ ve Fortran döngüleri için işaretler; derleyicinin GPU kodunu senin yerine üretmesini sağlar.
- CuPy: GPU'da NumPy tarzı diziler sunan Python kütüphanesi.
- Numba: Python fonksiyonlarını GPU kernel'larına çevirebilen Python derleyicisi.
- CUDA Python (`cuda-python`): CUDA driver ve runtime API'lerine doğrudan erişim için NVIDIA'nın Python paketleri.
- API (Application Programming Interface, uygulama programlama arayüzü): bir kütüphanenin koduna sunduğu fonksiyonlar kümesi.
- `nvcc` (NVIDIA CUDA Compiler): CUDA derleyicisi; aynı `.cu` dosyasındaki host ve device kodunu birlikte işler.
- MSVC (Microsoft Visual C++): `nvcc`'nin Windows'ta host kodu için kullandığı C++ derleyicisi.
- PTX (Parallel Thread Execution): device kodunun ilk derlendiği sanal komut seti; tek bir GPU'ya bağlı değildir.
- SASS (Streaming ASSembler): tek bir GPU neslinin gerçek makine kodu.
- JIT (just-in-time) derleme: saklanmış uygun bir SASS yoksa driver'ın program başlarken PTX'i SASS'a derlemesi.
- Nsight Systems: tüm program için CPU ve GPU işlerinin zaman çizelgesini gösteren profiler.
- Nsight Compute: tek bir kernel'ın GPU donanımını ne kadar iyi kullandığını ölçen profiler.
- Compute Sanitizer: program çalışırken kernel'ların içindeki bellek hatalarını bulan araç.
- işaret (annotation): normal koda eklenen ve derleyiciye onunla ne yapacağını söyleyen kısa not; örneğin bir döngüyü GPU'da çalıştırmasını.
- compute capability (CC, hesaplama yeteneği): bir GPU neslinin sürüm numarası, örneğin L40S için 8.9; GPU'nun hangi özellikleri ve makine kodunu desteklediğini belirler.
- SM (Streaming Multiprocessor, akış çoklu işlemcisi): GPU'yu oluşturan işlemci bloklarından biri; her SM'nin kendi çekirdekleri, Tensor Core'ları ve hızlı çip üstü belleği vardır.
- GB (gigabyte, gigabayt): yaklaşık bir milyar bayt.
- Tensor Core: her SM'nin içindeki matris hesap birimi; matris işlerinde FP32 çekirdeklerinden çok daha hızlıdır.
- FP32 / FP16 / FP8: 32, 16 ve 8 bitlik kayan noktalı sayılar; sırasıyla 4, 2 ve 1 bayt yer kaplarlar.
- MIG (Multi-Instance GPU): tek bir fiziksel GPU'yu en fazla yedi yalıtılmış parçaya böler; her parça kendi başına bir GPU gibi davranır.
- Dynamic Parallelism: GPU'daki bir kernel, CPU'ya geri dönmeden başka bir kernel başlatabilir.
- GPUDirect: GPU'ların CPU belleğinden geçmeden birbirine, bir ağ kartına ya da depolamaya veri taşımasını sağlar.
- NVLink: NVIDIA'nın GPU'lar arasındaki hızlı doğrudan bağlantısı.
- PCIe (Peripheral Component Interconnect Express): GPU'yu bilgisayarın geri kalanına bağlayan standart yuva ve veri yolu.
- HBM (High Bandwidth Memory): H100 ve B200 gibi veri merkezi GPU'larında kullanılan çok hızlı GPU belleği.
- cuBLAS (CUDA Basic Linear Algebra Subprograms): NVIDIA'nın matris ve vektör hesabı için GPU kütüphanesi.
- cuDNN (CUDA Deep Neural Network library): derin öğrenme için GPU işlemleri kütüphanesi; PyTorch ve TensorFlow onu arka planda kullanır.
- TensorRT: eğitilmiş bir modelin belirli bir GPU'da hızlı çalışmasını sağlar.
- NCCL (NVIDIA Collective Communications Library): GPU'lar arasında veri taşıma kütüphanesi; çok sayıda GPU ile eğitimde kullanılır.
- GPU (Graphics Processing Unit, grafik işlem birimi): kernel'ları çalıştıran, binlerce küçük çekirdekli işlemci.
- CPU (Central Processing Unit, merkezi işlem birimi): ana işlemci; host kodunu çalıştırır ve kernel'ları başlatır.
- AI (Artificial Intelligence, yapay zekâ): veriden öğrenen yazılım; bugün çoğunlukla GPU'larda eğitilen ve çalıştırılan derin öğrenme modelleri anlamına gelir.
