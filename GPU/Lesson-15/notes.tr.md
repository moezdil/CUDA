# 15 > CUDA Geliştirme Ortamını Kurmak (JetBrains ile Modern Bir İş Akışı)

Bu derste bir CUDA çalışma ortamının nasıl kurulacağını göreceksin: CUDA Toolkit'in üzerine JetBrains araçları, özellikle CLion. CLion, Mayıs 2025'ten beri öğrenme ve açık kaynak gibi ticari olmayan kullanımlar için ücretsiz.

## Neden JetBrains ve CLion

Araçlarla boğuşmadan her gün kullanabileceğin bir kuruluma ihtiyacın var. Bu repo o kurulumu bir IDE (Integrated Development Environment, tümleşik geliştirme ortamı) olan CLion etrafında kuruyor.

Nedeni, modern geliştirmenin işleyiş biçimi. GPU (Graphics Processing Unit, grafik işlemci) mimarileri ve toolkit'ler hızlı değişiyor ve projeler tek bir platforma bağlı değil. Linux'ta geliştirip uzaktaki bir GPU'da test edebilir, başka bir yerde de devreye alabilirsin. Visual Studio gibi tek bir sisteme bağlı bir IDE bu tür çalışmayı kısıtlar.

JetBrains araçları CMake (Cross-platform Make) üzerine kurulu. CMake, bir projenin nasıl derleneceğini tarif eden bir araçtır ve bir CMake projesi tek bir ortama bağlı değildir. Onu farklı sistemlerde, farklı derleyicilerle derleyip aynı yapıyı koruyabilirsin. Gerçek GPU sistemleri de böyle kurulur.

## Önce CUDA Toolkit gelir

CUDA Toolkit her şeyin temelidir; o olmadan hiçbir şey derlenmez. Sana derleyiciyi (compiler), runtime'ı ve GPU ile konuşan kütüphaneleri verir. Bir editör değil, GPU'da çalıştırmayı mümkün kılan katmandır.

Bu katman donanıma bağlı. Hopper ve Blackwell yeni komutlar, yeni duyarlılık formatları ve yeni yürütme davranışları getiriyor; bunları kullanmak için güncel bir CUDA sürümüne ihtiyacın var. Ekim 2026 itibarıyla en yenisi CUDA 13.4. Eski sürümler yine çalışabilir ama donanımın yapabildiklerinden yararlanamaz. Yani seçtiğin CUDA sürümü, kodunun neler yapabileceğini belirler.

## CLion'un yeri

CLion toolkit'in üzerinde durur; onun yerini almaz ya da onu gizlemez. Kod yazman ve projeni düzenlemen için sana temiz bir alan sunar. Derleme yaptığında CLion CMake'i, CMake de CUDA derleyicisi `nvcc`'yi çağırır. Hiçbir şey gizli kalmaz, bu yüzden neler olup bittiğini her zaman bilirsin.

<toolchain-stack></toolchain-stack>

CMake, CUDA'yı bir dil olarak tanır. Tek bir CUDA dosyası için en küçük `CMakeLists.txt` şöyle görünür:

```cmake
cmake_minimum_required(VERSION 3.24)
project(hello LANGUAGES CXX CUDA)
set(CMAKE_CUDA_ARCHITECTURES 89)
add_executable(hello hello.cu)
```

`CMAKE_CUDA_ARCHITECTURES 89`, `nvcc -arch=sm_89` ile aynı hedeftir: compute capability 8,9, yani bu derslerde kullanılan L40S. Hopper H100 için `90`, Blackwell B200 için `100` yazarsın.

## Windows'ta Visual Studio

> [!NOTE]
> Windows'ta, Visual Studio'yu hiç açmasan bile `nvcc` MSVC (Microsoft Visual C++) derleyicisine ihtiyaç duyar. CUDA 13.4, Visual Studio 2019, 2022 ve 2026 ile çalışır. Yani Visual Studio senin çalışma alanın değil, bir bağımlılık: bir kez kurarsın, sonra unutursun.

Asıl işinin hepsini CLion'da yaparsın.

## GPU driver'ı

CUDA, GPU driver'ına (sürücüsüne) bağlıdır. Windows'ta CUDA 13.1'den, Linux'ta CUDA 13.4'ten beri toolkit kurulumu driver içermiyor. Driver'ı kendin kurar ve güncel tutarsın.

Her CUDA sürümünün bir driver dalı vardır. 580 veya daha yeni daldan bir driver, herhangi bir CUDA 13.x ile derlenmiş programları çalıştırır. CUDA 13.4'ün yeni özelliklerini kullanmak için 615 veya daha yeni dal gerekir. Yani 575 driver'ı bir CUDA 13 programını çalıştıramaz, 580 driver'ı çalıştırır, 615 driver'ı ise sana 13.4'teki bütün yenilikleri de verir.

> [!WARNING]
> Driver çok eskiyse açıklaması zor sorunlarla karşılaşabilirsin: kod derlenip çalışırken hata verebilir ya da bazı özellikler kullanılamayabilir.

## İş akışı

Her şey yerindeyse iş akışı basittir:

- CLion'u açar ve kodunu yazarsın.
- CMake ile derlersin.
- CUDA Toolkit kodu derler.
- GPU onu çalıştırır.

Kurulum doğruysa bu adımlar sorunsuz bir şekilde birlikte çalışır.

## Özet

CUDA geliştirmek bir editör seçmekle değil, toolchain'i anlamakla ilgili. JetBrains araçları bu yüzden iyi uyuyor: sistemin her parçasının kendi işini yapmasına izin veriyor. Bu da kurulumu daha temiz, daha kararlı ve canlı ortama (production) daha yakın kılıyor. Bu repo da bu kurulumu kullanıyor.

## Sözlük

- JetBrains: CLion, PyCharm, IntelliJ IDEA ve başka geliştirme araçlarını yapan şirket.
- CLion: C, C++ ve CUDA için bir JetBrains IDE'si; CUDA Toolkit'in üzerinde durur ve ticari olmayan kullanım için ücretsizdir.
- IDE (Integrated Development Environment): editörü, derleme araçlarını ve hata ayıklayıcıyı bir araya getiren tek bir uygulama.
- GPU (Graphics Processing Unit): CUDA programlarının üzerinde çalıştığı, binlerce küçük çekirdeği olan işlemci.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Hopper ya da Blackwell; yeni olanlar daha yeni toolkit ve driver ister.
- Linux: GPU sunucularının çoğunun çalıştırdığı işletim sistemi; CUDA için en iyi desteklenen platform.
- uzaktaki bir GPU (remote GPU): başka bir makinedeki, örneğin bir bulut sunucusundaki, ağ üzerinden kullandığın GPU.
- CMake (Cross-platform Make): bir projenin nasıl derleneceğini tarif eden bir araç; tek bir ortama bağlı değildir.
- `CMakeLists.txt`: CMake'in projenin nasıl derleneceğini okuduğu dosya.
- `CMAKE_CUDA_ARCHITECTURES`: hangi compute capability için derleneceğini belirten CMake ayarı, örneğin `sm_89` için 89.
- compute capability (hesaplama yeteneği): bir GPU mimarisinin sürüm numarası, örneğin L40S için 8,9, H100 için 9,0.
- derleme (build): kaynak dosyaları derleyip bağlayarak çalıştırabileceğin bir programa dönüştürmek.
- compiler (derleyici): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program; CUDA'da bu `nvcc`'dir.
- toolkit (CUDA Toolkit): compiler'ı, runtime'ı ve GPU ile konuşan kütüphaneleri içeren temel katman.
- runtime: programının çalışırken çağırdığı, GPU belleğini yöneten ve GPU'da iş başlatan CUDA kütüphanesi.
- kütüphane (libraries): toolkit ile gelen hazır ve test edilmiş kod, örneğin matris hesapları için cuBLAS.
- Hopper / Blackwell: NVIDIA'nın 2022 ve 2024 mimarileri; yeni özellikleri için güncel CUDA sürümleri gerekir.
- duyarlılık (precision): her sayının kaç bit kullandığı, örneğin FP32, FP16 ya da FP8.
- CUDA sürümü (CUDA version): toolkit'in sürüm numarası, örneğin 13.4; hangi GPU'ları ve özellikleri hedefleyebileceğini belirler.
- toolchain: kodunu derleyen araçlar zinciri; CLion CMake'i, CMake de CUDA derleyicisini çağırır.
- Visual Studio: Microsoft'un Windows için IDE'si; CUDA, içindeki C++ derleyicisi yüzünden onun kurulu olmasını ister.
- MSVC (Microsoft Visual C++): Visual Studio'nun C++ derleyicisi; Windows'ta `nvcc`, kodunun CPU (Central Processing Unit, merkezi işlemci) kısmını ona verir.
- bağımlılık (dependency): başka bir programın çalışabilmesi için kurulu olması gereken şey.
- driver (GPU driver): işletim sisteminin GPU ile konuşmasını sağlayan yazılım; toolkit'ten ayrı kurulur.
- driver dalı (driver branch): 580 ya da 615 gibi bir driver sürüm hattı; her CUDA sürümü en düşük bir dal ister.
- canlı ortam (production): bitmiş yazılımın kullanıcıları için gerçekten çalıştığı ortam.
