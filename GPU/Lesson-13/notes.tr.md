# CUDA Geliştirme Ortamını Kurmak (JetBrains ile Modern Bir İş Akışı)

Bu ders bir CUDA çalışma ortamının nasıl kurulacağını anlatıyor. CUDA Toolkit'in üzerinde JetBrains araçlarını, özellikle CLion'u kullanıyor.

## Neden JetBrains ve CLion

Araçlarla boğuşmadan her gün kullanabileceğin bir kuruluma ihtiyacın var. Bu repo o kurulumu CLion etrafında kuruyor.

Nedeni modern geliştirmenin işleyiş şekli. GPU mimarileri ve toolkit'ler artık daha hızlı değişiyor. Projeler artık tek bir platforma bağlı değil. Linux'ta geliştirip uzaktaki bir GPU'da test edebilir, başka bir yerde de kullanıma alabilirsin. Visual Studio gibi sıkı sıkıya bağlı bir IDE bu tür çalışmayı kısıtlar.

JetBrains araçları CMake etrafında kurulu. CMake, bir projenin nasıl derleneceğini tarif eden bir araç. Bir CMake projesi tek bir ortama bağlı değildir. Onu farklı sistemlerde, farklı compiler'larla derleyip aynı yapıyı koruyabilirsin. Gerçek GPU sistemleri de böyle kurulur.

## Önce CUDA Toolkit gelir

CUDA Toolkit her şeyin temelidir. O olmadan hiçbir şey çalışmaz. Sana compiler'ı (derleyici), runtime'ı ve GPU ile konuşan kütüphaneleri verir. Bir editör değildir. GPU'da çalıştırmayı mümkün kılan katmandır.

2026 itibarıyla bu katman donanıma daha fazla bağlı. Hopper ve Blackwell yeni komutlar, yeni duyarlılık formatları ve yeni yürütme davranışları getiriyor. Bunları kullanmak için güncel bir CUDA sürümüne ihtiyacın var. Eski sürümler yine çalışabilir ama donanımın yapabildiklerini kullanmaz. Yani seçtiğin CUDA sürümü, kodunun neler yapabileceğini belirler.

## CLion'un yeri

CLion toolkit'in üzerinde durur. Onun yerini almaz ya da onu gizlemez. Kod yazman ve projeni düzenlemen için sana temiz bir alan verir. Derleme yaptığında CLion CMake'i çağırır, CMake de CUDA compiler'ını çağırır. Gizli hiçbir şey olmaz, bu yüzden neler olup bittiğini her zaman bilirsin.

<toolchain-stack></toolchain-stack>

## Windows'ta Visual Studio

> [!NOTE]
> Windows'ta, kullanmasan bile Visual Studio'nun bazı parçalarının kurulu olması gerekebilir. CUDA toolchain'i arka planda Microsoft compiler'ını kullanır. Yani Visual Studio senin çalışma alanın değil, bir bağımlılık. Bir kez kurarsın, sonra unutursun.

Asıl işinin hepsi CLion'da olur.

## GPU driver'ı

CUDA, GPU driver'ına (sürücüsüne) bağlıdır. 2026'da mimariler hızlı değişiyor, bu yüzden driver'ı güncel tutmak kurulumun bir parçası.

> [!WARNING]
> Driver çok eskiyse açıklaması zor sorunlarla karşılaşabilirsin. Kod derlenip doğru çalışmayabilir. Bazı özellikler kullanılamayabilir.

## İş akışı

Her şey yerindeyken iş akışı basit:

- CLion'u açar ve kodunu yazarsın.
- CMake ile derlersin.
- CUDA Toolkit kodu derler.
- GPU onu çalıştırır.

Kurulum doğru olduğunda bu adımlar sorunsuz şekilde birlikte çalışır.

## Özet

CUDA geliştirme bir editör seçmekle ilgili değil. Toolchain'i anlamakla ilgili. JetBrains araçları iyi uyuyor, çünkü sistemin her parçasının kendi işini yapmasına izin veriyor. Bu da kurulumu daha temiz, daha kararlı ve canlı ortama (production) daha yakın yapıyor. Bu repo bu kurulumu kullanıyor.

## Sözlük

- JetBrains: CLion, PyCharm, IntelliJ IDEA ve başka geliştirme araçlarını yapan şirket.
- CLion: kod yazmak ve projeleri düzenlemek için bir JetBrains aracı. CUDA Toolkit'in üzerinde durur.
- IDE (Integrated Development Environment): editörü, derleme araçlarını ve hata ayıklayıcıyı bir araya getiren tek bir uygulama.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Hopper ya da Blackwell; yeni olanlar daha yeni toolkit ve driver ister.
- Linux: GPU sunucularının çoğunun çalıştırdığı işletim sistemi, CUDA için en iyi desteklenen platform.
- uzaktaki bir GPU (remote GPU): başka bir makinedeki, örneğin bir bulut sunucusundaki, ağ üzerinden kullandığın GPU.
- CMake: bir projenin nasıl derleneceğini tarif eden bir araç. Tek bir ortama bağlı değildir.
- derleme (build): kaynak dosyaları derleyip bağlayarak çalıştırabileceğin bir programa dönüştürmek.
- compiler (derleyici): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program; CUDA'da bu nvcc'dir.
- toolkit (CUDA Toolkit): compiler'ı, runtime'ı ve GPU ile konuşan kütüphaneleri içeren temel katman.
- runtime: programının çalışırken çağırdığı, GPU belleğini yöneten ve GPU'da iş başlatan CUDA kütüphanesi.
- kütüphane (libraries): toolkit ile gelen hazır ve test edilmiş kod, örneğin matris hesapları için cuBLAS.
- Hopper / Blackwell: Nvidia'nın 2022 ve 2024 mimarileri, yeni özellikleri için güncel CUDA sürümleri gerekir.
- duyarlılık (precision): her sayının kaç bit kullandığı, örneğin FP32, FP16 ya da FP8.
- CUDA sürümü (CUDA version): toolkit'in sürüm numarası, örneğin 13.0; hangi GPU'ları ve özellikleri hedefleyebileceğini belirler.
- toolchain: kodunu derleyen araçlar zinciri. CLion CMake'i çağırır, CMake de CUDA compiler'ını çağırır.
- Visual Studio: bir Windows bağımlılığı, çünkü CUDA toolchain'i arka planda Microsoft compiler'ını kullanır.
- Microsoft compiler (MSVC): Visual Studio'nun C++ derleyicisi; Windows'ta nvcc, kodunun CPU kısmını ona verir.
- bağımlılık (dependency): başka bir programın çalışabilmesi için kurulu olması gereken şey.
- driver (GPU driver): CUDA ona bağlıdır. Çok eskiyse kod derlenip doğru çalışmayabilir.
- canlı ortam (production): bitmiş yazılımın kullanıcıları için gerçekten çalıştığı ortam.
