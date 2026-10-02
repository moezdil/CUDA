# CUDA Geliştirme Ortamını Kurmak (JetBrains ile Modern Bir İş Akışı)

Bu derste bir CUDA çalışma ortamının nasıl kurulacağını göreceksin: CUDA Toolkit'in üzerine JetBrains araçları, özellikle CLion.

## Neden JetBrains ve CLion

Araçlarla boğuşmadan her gün kullanabileceğin bir kuruluma ihtiyacın var. Bu repo o kurulumu CLion etrafında kuruyor.

Nedeni, modern geliştirmenin işleyiş biçimi. GPU mimarileri ve toolkit'ler artık daha hızlı değişiyor ve projeler tek bir platforma bağlı değil. Linux'ta geliştirip uzaktaki bir GPU'da test edebilir, başka bir yerde de devreye alabilirsin. Visual Studio gibi bir ortama sıkı sıkıya bağlı bir IDE bu tür çalışmayı kısıtlar.

JetBrains araçları CMake üzerine kurulu. CMake, bir projenin nasıl derleneceğini tarif eden bir araçtır ve bir CMake projesi tek bir ortama bağlı değildir. Onu farklı sistemlerde, farklı derleyicilerle derleyip aynı yapıyı koruyabilirsin. Gerçek GPU sistemleri de böyle kurulur.

## Önce CUDA Toolkit gelir

CUDA Toolkit her şeyin temelidir; o olmadan hiçbir şey çalışmaz. Sana derleyiciyi (compiler), runtime'ı ve GPU ile konuşan kütüphaneleri verir. Bir editör değil, GPU'da çalıştırmayı mümkün kılan katmandır.

2026 itibarıyla bu katman donanıma daha sıkı bağlı. Hopper ve Blackwell yeni komutlar, yeni duyarlılık formatları ve yeni yürütme davranışları getiriyor; bunları kullanmak için güncel bir CUDA sürümüne ihtiyacın var. Eski sürümler yine çalışabilir ama donanımın yapabildiklerinden yararlanamaz. Yani seçtiğin CUDA sürümü, kodunun neler yapabileceğini belirler.

## CLion'un yeri

CLion toolkit'in üzerinde durur; onun yerini almaz ya da onu gizlemez. Kod yazman ve projeni düzenlemen için sana temiz bir alan sunar. Derleme yaptığında CLion CMake'i, CMake de CUDA derleyicisini çağırır. Hiçbir şey gizli kalmaz, bu yüzden neler olup bittiğini her zaman bilirsin.

<toolchain-stack></toolchain-stack>

## Windows'ta Visual Studio

> [!NOTE]
> Windows'ta, kullanmasan bile Visual Studio'nun bazı parçalarının kurulu olması gerekebilir, çünkü CUDA toolchain'i arka planda Microsoft compiler'ını kullanır. Yani Visual Studio senin çalışma alanın değil, bir bağımlılık: bir kez kurarsın, sonra unutursun.

Asıl işinin hepsini CLion'da yaparsın.

## GPU driver'ı

CUDA, GPU driver'ına (sürücüsüne) bağlıdır. 2026'da mimariler hızlı değiştiği için driver'ı güncel tutmak kurulumun bir parçası.

> [!WARNING]
> Driver çok eskiyse açıklaması zor sorunlarla karşılaşabilirsin: kod derlenip yine de doğru çalışmayabilir ya da bazı özellikler kullanılamayabilir.

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
- CLion: kod yazmak ve projeleri düzenlemek için bir JetBrains aracı; CUDA Toolkit'in üzerinde durur.
- IDE (Integrated Development Environment): editörü, derleme araçlarını ve hata ayıklayıcıyı bir araya getiren tek bir uygulama.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Hopper ya da Blackwell; yeni olanlar daha yeni toolkit ve driver ister.
- Linux: GPU sunucularının çoğunun çalıştırdığı işletim sistemi; CUDA için en iyi desteklenen platform.
- uzaktaki bir GPU (remote GPU): başka bir makinedeki, örneğin bir bulut sunucusundaki, ağ üzerinden kullandığın GPU.
- CMake: bir projenin nasıl derleneceğini tarif eden bir araç; tek bir ortama bağlı değildir.
- derleme (build): kaynak dosyaları derleyip bağlayarak çalıştırabileceğin bir programa dönüştürmek.
- compiler (derleyici): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program; CUDA'da bu nvcc'dir.
- toolkit (CUDA Toolkit): compiler'ı, runtime'ı ve GPU ile konuşan kütüphaneleri içeren temel katman.
- runtime: programının çalışırken çağırdığı, GPU belleğini yöneten ve GPU'da iş başlatan CUDA kütüphanesi.
- kütüphane (libraries): toolkit ile gelen hazır ve test edilmiş kod, örneğin matris hesapları için cuBLAS.
- Hopper / Blackwell: Nvidia'nın 2022 ve 2024 mimarileri; yeni özellikleri için güncel CUDA sürümleri gerekir.
- duyarlılık (precision): her sayının kaç bit kullandığı, örneğin FP32, FP16 ya da FP8.
- CUDA sürümü (CUDA version): toolkit'in sürüm numarası, örneğin 13.0; hangi GPU'ları ve özellikleri hedefleyebileceğini belirler.
- toolchain: kodunu derleyen araçlar zinciri; CLion CMake'i, CMake de CUDA derleyicisini çağırır.
- Visual Studio: bir Windows bağımlılığı, çünkü CUDA toolchain'i arka planda Microsoft compiler'ını kullanır.
- Microsoft compiler (MSVC): Visual Studio'nun C++ derleyicisi; Windows'ta nvcc, kodunun CPU kısmını ona verir.
- bağımlılık (dependency): başka bir programın çalışabilmesi için kurulu olması gereken şey.
- driver (GPU driver): CUDA'nın bağlı olduğu, işletim sisteminin GPU ile konuşmasını sağlayan yazılım; çok eskiyse kod derlenip yine de doğru çalışmayabilir.
- canlı ortam (production): bitmiş yazılımın kullanıcıları için gerçekten çalıştığı ortam.
