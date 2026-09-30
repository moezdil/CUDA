# Windows'ta Linux Çalıştırmak (WSL ile Pratik Bir Kurulum)

Bu ders, WSL ile Windows'un içinde Linux'un nasıl çalıştırılacağını anlatıyor. GPU'nun ve CUDA'nın WSL içinde nasıl çalıştığını da gösteriyor.

## Neden Linux

Ciddi CUDA çalışmaları genelde Linux'a çıkar. Windows hâlâ işe yarıyor, ama GPU ekosistemi yıllardır Linux etrafında kuruluyor. Çoğu araç, belge ve gerçek kurulum Linux bekler. 2026'da yapay zekâ ve yüksek performanslı hesaplama için kullanılan modern GPU sistemleri neredeyse her zaman Linux kullanıyor.

## WSL nedir

WSL (Windows Subsystem for Linux), Windows'un içinde gerçek bir Linux ortamı çalıştırır. Eski çözümler gibi bir emülasyon katmanı değildir. WSL2 gerçek bir Linux çekirdeği (kernel) çalıştırır. Bu da davranışta, uyumlulukta ve performansta büyük fark yaratır. Artık birçok geliştirme iş akışı WSL kullanıyor.

## WSL'i kur

Windows'ta bir terminal aç ve tek bir komut çalıştır: `wsl --install`

2026 itibarıyla her zaman WSL2 kullan. Çünkü WSL1'in uyumluluğu daha düşük ve işe yarar bir GPU hızlandırması yok. WSL2 modern iş yükleri için yapılmış ve Windows'ta CUDA'nın temeli. WSL2 olmadan birçok GPU özelliği beklendiği gibi çalışmaz.

## İlk açılış

Linux dağıtımını ilk kez başlattığında bir kullanıcı adı ve parola oluşturursun. Bu, aynı makinedeki ayrı bir Linux ortamıdır, Windows ortamın değil. Kendi kullanıcıları, kendi dosya sistemi ve kendi paket yöneticisi vardır. Bundan sonra aynı anda iki sistemde çalışırsın.

## GPU erişimi

WSL2 ile Linux, GPU'yu Windows driver'ı (sürücüsü) üzerinden kullanabilir. CUDA uygulamaları WSL içinde neredeyse doğrudan Linux kurulu bir sistemdeki gibi çalışır. Yani Linux'ta geliştirme yapıp Windows'u ana sistemin olarak kullanmaya devam edebilirsin.

GPU driver'ı WSL'in içine değil, Windows tarafına kurulur. WSL, ana sistemin driver'ını kullanır. Kendi NVIDIA driver'ına ihtiyacı yoktur. Kararlı bir kurulum için bu ayrımı aklında tut.

> [!WARNING]
> WSL içine Linux GPU driver'ı kurmak genelde çakışmalara yol açar, o yüzden bunu yapma.

<wsl-layers></wsl-layers>

## WSL'de CUDA kurmak

WSL içinde CUDA Toolkit'in Windows sürümünü değil, Linux sürümünü kurarsın. Ama WSL özel paketler kullanır. Bu paketler ortak driver ile çalışır ve ana sistemle çakışmayı önler. Yani kurulum normal Linux gibi görünür ama aynı değildir.

## 2026'da WSL

WSL artık sadece kolaylık sağlayan bir araç değil, ciddi bir geliştirme ortamı. CUDA 12.x ve yeni 13.x serisi, WSL içinde Hopper ve Blackwell'i tam olarak destekliyor. GPU erişimi kararlı, bellek yönetimi daha iyi ve container desteği daha tutarlı. Çoğu durumda WSL artık doğrudan Linux kurulumuna yakın.

Yine de beklentilerini gerçekçi tut. WSL'in birkaç katmanı var. Bir sorun Windows ayarlarından, WSL'in kendisinden, Linux dağıtımından ya da CUDA kurulumundan gelebilir. Bu sorunları çözmek, sistemin nasıl çalıştığını öğrenmenin bir parçası.

## Özet

WSL pratik bir köprü. Windows'ta kalırsın ve Linux tabanlı GPU araçlarını gerçek canlı sistemlere yakın bir şekilde kullanırsın. Başlamanın en doğal yollarından biri.

> [!NOTE]
> Bu sadece genel bilgi içindi. “windows” adı bu repoda hiçbir koşulda kullanılmayacak.

## Sözlük

- WSL: Windows Subsystem for Linux. Windows'un içinde gerçek bir Linux ortamı çalıştırır.
- WSL2: gerçek bir Linux çekirdeği çalıştıran WSL sürümü. Windows'ta CUDA'nın temeli.
- WSL1: uyumluluğu daha düşük ve işe yarar GPU hızlandırması olmayan eski WSL sürümü.
- `wsl --install`: WSL'i kurmak için Windows terminalinde çalıştırdığın tek komut.
- Linux dağıtımı (Linux distribution): kendi kullanıcıları, dosya sistemi ve paket yöneticisi olan ayrı bir Linux ortamı.
- ana sistem driver'ı (host driver): Windows tarafındaki GPU driver'ı. WSL onu kullanır ve kendine ait bir NVIDIA driver'ına ihtiyaç duymaz.
- WSL CUDA paketleri (WSL CUDA packages): ortak driver ile çalışan ve ana sistemle çakışmayı önleyen özel Linux CUDA paketleri.
