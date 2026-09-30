# Ders 05: CUDA Platform Katmanları

Bu ders, Blackwell için Toolkit 13.x ile gelen CUDA platformunun tamamını gösteriyor. Platformun beş katmanı var: en üstte diller, en altta donanım, arada da araçlar.

## Programlama dilleri

- CUDA C/C++, kernel yazmak için kullanılan ana dildir. Ders 00 ile 04 arasındaki tüm dersler bunu kullandı.
- OpenACC ve CUDA Fortran, GPU desteğini koda eklenen işaretlerle (annotation) sağlar. Böylece kernel'ları elle yazmazsın.
- Python, GPU'ya CuPy ve Numba gibi kütüphaneler üzerinden ulaşır.

Dördü de aynı GPU donanımında çalışır.

## Geliştirme araçları

- Nsight Systems, CPU ve GPU işlerinin bir zaman çizelgesini kaydeder. Uygulamanın zamanını nerede harcadığını gösterir.
- Nsight Compute tek bir kernel'a bakar ve donanımı ne kadar iyi kullandığını gösterir.
- Compute Sanitizer programı çalıştırır ve kernel'ların içindeki bellek hatalarını raporlar.

## Compiler araç zinciri

`nvcc`, `.cu` dosyalarını derler. Şimdiye kadarki her ders, derleme adımında onu çağırdı. Host (CPU tarafı) kodunu normal C++ compiler'ına (derleyici), device (GPU tarafı) kodunu ise NVIDIA compiler'ına gönderir. Device kodu önce PTX'e dönüşür. PTX, tek bir GPU'ya bağlı olmayan sanal bir komut setidir. Ardından GPU driver'ı PTX'i SASS'a, yani o GPU'nun gerçek komutlarına çevirir. Derlenen dosya PTX'i de saklar. Böylece aynı program, yeniden derlemeden gelecekteki GPU'larda çalışabilir.

<nvcc-pipeline></nvcc-pipeline>

## Donanım yetenekleri

- Tensor Core'lar, her SM'nin içinde matris hesabı için yapılmış birimlerdir. FP32 core'lardan ayrıdırlar ve FP16 ile FP8 matris işlerinde çok daha hızlıdırlar.
- MIG, tek bir GPU'yu en fazla yedi bağımsız parçaya böler. Her parça kendi başına bir GPU gibi davranır.
- Dynamic Parallelism, çalışan bir kernel'ın CPU'ya geri dönmeden GPU'dan başka bir kernel başlatmasını sağlar. Ders 00'da kernel'ları CPU başlattı. Dynamic Parallelism bu adımı GPU'ya taşır.
- GPU Direct, GPU'ların sistem belleğinden geçmeden birbirine ya da bir ağ kartına doğrudan veri göndermesini sağlar.

> [!NOTE]
> SM, block'ların üzerinde çalıştığı fiziksel işlemcidir (Ders 02). Ders 03, SM başına FP32 core sayılarını listeledi.

## Yapay zeka framework katmanı

- cuDNN, derin öğrenme için GPU işlemlerinden oluşan bir kütüphanedir. PyTorch ve TensorFlow onu konvolüsyon, attention ve benzeri işlemler için kullanır.
- TensorRT, eğitilmiş bir modeli alır ve belirli bir GPU'da hızlı çalışmasını sağlar.
- NCCL, GPU'lar arasındaki iletişimi yönetir. Aynı anda birden fazla GPU ile eğitim yapmak için ona ihtiyacın var.

## Görsel

![CUDA Platform Katmanları](05.png)

## Sözlük

- PTX (Parallel Thread Execution): CUDA'nın device kodunu ilk olarak derlediği ara komut seti. Tek bir GPU'ya bağlı değildir. Driver onu çalışma anında gerçek GPU komutlarına çevirir.
- SASS (Streaming ASSembler): belirli bir GPU'nun gerçek makine kodu. PTX, çalışmadan önce SASS'a dönüşür.
- `nvcc`: CUDA compiler'ı. Aynı `.cu` dosyasındaki host ve device kodunu birlikte işler.
- Nsight Systems: tüm uygulama için CPU ve GPU işlerinin zaman çizelgesini gösteren profiler.
- Nsight Compute: tek bir kernel'ın GPU donanımını ne kadar iyi kullandığını ölçen profiler.
- Compute Sanitizer: program çalışırken kernel'ların içindeki bellek hatalarını bulan araç.
- MIG (Multi-Instance GPU): tek bir fiziksel GPU'yu birbirinden yalıtılmış parçalara böler. Her parça kendi başına bir GPU gibi davranır.
- Tensor Core: her SM'nin içindeki matris çarpma birimi. Matris işlerinde normal FP32 core'lardan daha hızlıdır.
- Dynamic Parallelism: GPU'daki bir kernel, CPU'ya geri dönmeden başka bir kernel başlatabilir.
- GPU Direct: GPU'ların CPU'dan geçmeden birbirine ya da bir ağ kartına veri taşımasını sağlar.
- NCCL: GPU'lar arası iletişim kütüphanesi. Dağıtık eğitimde kullanılır.
- cuDNN: derin öğrenme için GPU işlemleri kütüphanesi. PyTorch ve TensorFlow onu arka planda kullanır.
- TensorRT: eğitilmiş bir modelin belirli bir GPU'da hızlı çalışmasını sağlar.
