# Windows'ta Linux Çalıştırmak (WSL ile Pratik Bir Kurulum)

Bu derste WSL ile Windows'un içinde Linux'u nasıl çalıştıracağını göreceksin. GPU'nun ve CUDA'nın WSL içinde nasıl çalıştığını da öğreneceksin.

## Neden Linux

Ciddi CUDA çalışmaları genelde Linux'ta yapılır. Windows hâlâ işe yarar, ama GPU ekosistemi yıllardır Linux etrafında gelişiyor; araçların, belgelerin ve gerçek kurulumların çoğu Linux bekler. 2026'da yapay zekâ ve yüksek performanslı hesaplama için kullanılan modern GPU sistemleri neredeyse her zaman Linux kullanıyor.

## WSL nedir

WSL (Windows Subsystem for Linux), Windows'un içinde gerçek bir Linux ortamı çalıştırır. Eski çözümler gibi bir emülasyon katmanı değildir: WSL2 gerçek bir Linux çekirdeği (kernel) çalıştırır ve bu, davranışta, uyumlulukta ve performansta büyük fark yaratır. Bugün birçok geliştirme iş akışı WSL kullanıyor.

## WSL'i kur

Windows'ta bir terminal aç ve tek bir komut çalıştır: `wsl --install`

2026 itibarıyla her zaman WSL2 kullan, çünkü WSL1'in uyumluluğu daha düşüktür ve işe yarar bir GPU hızlandırması yoktur. WSL2 modern iş yükleri için yapılmıştır ve Windows'ta CUDA'nın temelidir; WSL2 olmadan birçok GPU özelliği beklendiği gibi çalışmaz.

## İlk açılış

Linux dağıtımını ilk kez başlattığında bir kullanıcı adı ve parola oluşturursun. Bu, Windows ortamın değil, aynı makinedeki ayrı bir Linux ortamıdır: kendi kullanıcıları, kendi dosya sistemi ve kendi paket yöneticisi vardır. Bundan sonra aynı anda iki sistemde çalışırsın.

## GPU erişimi

WSL2 ile Linux, GPU'yu Windows driver'ı (sürücüsü) üzerinden kullanabilir. CUDA uygulamaları WSL içinde neredeyse doğrudan Linux kurulu bir sistemdeki gibi çalışır. Yani Linux'ta geliştirme yapıp Windows'u ana sistemin olarak kullanmaya devam edebilirsin.

GPU driver'ı WSL'in içine değil, Windows tarafına kurulur. WSL, ana sistemin driver'ını kullanır ve kendi NVIDIA driver'ına ihtiyaç duymaz. Kararlı bir kurulum için bu ayrımı aklında tut.

> [!WARNING]
> WSL içine Linux GPU driver'ı kurmak genelde çakışmalara yol açar, o yüzden bunu yapma.

<wsl-layers></wsl-layers>

## WSL'de CUDA kurmak

WSL içinde CUDA Toolkit'in Windows sürümünü değil, Linux sürümünü kurarsın. Ama WSL için özel paketler kullanılır: bunlar ortak driver ile çalışır ve ana sistemle çakışmayı önler. Yani kurulum normal Linux'a benzer ama tamamen aynı değildir.

## 2026'da WSL

WSL artık sadece kolaylık sağlayan bir araç değil, ciddi bir geliştirme ortamı. CUDA 12.x ve yeni 13.x serisi, WSL içinde Hopper ve Blackwell'i tam olarak destekliyor. GPU erişimi kararlı, bellek yönetimi daha iyi ve container desteği daha tutarlı. Çoğu durumda WSL artık doğrudan Linux kurulumuna yakın bir deneyim sunuyor.

Yine de beklentilerini gerçekçi tut. WSL birkaç katmandan oluşur: bir sorun Windows ayarlarından, WSL'in kendisinden, Linux dağıtımından ya da CUDA kurulumundan gelebilir. Bu sorunları çözmek, sistemin nasıl çalıştığını öğrenmenin bir parçası.

## Özet

WSL pratik bir köprü: Windows'ta kalırsın ve Linux tabanlı GPU araçlarını gerçek canlı sistemlere yakın bir şekilde kullanırsın. Başlamanın en doğal yollarından biri.

> [!NOTE]
> Bu sadece genel bilgi içindi. “windows” adı bu repoda hiçbir koşulda kullanılmayacak.

## Sözlük

- Linux: ücretsiz, açık kaynaklı bir işletim sistemi; GPU sunucularının ve CUDA araçlarının çoğu onun etrafında kurulur.
- ekosistem (ecosystem): bir platformun, örneğin GPU'nun, etrafında gelişen tüm araçlar, kütüphaneler, belgeler ve driver'lar.
- yüksek performanslı hesaplama (HPC): hava tahmini ya da fizik simülasyonları gibi büyük problemler üzerinde birlikte çalışan çok sayıda güçlü işlemci.
- WSL: Windows Subsystem for Linux; Windows'un içinde gerçek bir Linux ortamı çalıştırır.
- emülasyon (emulation): başka bir sistemi gerçekten çalıştırmak yerine yazılımla taklit etmek; genelde daha yavaş ve daha az uyumludur.
- WSL2: gerçek bir Linux çekirdeği çalıştıran WSL sürümü; Windows'ta CUDA'nın temeli.
- Linux çekirdeği (Linux kernel): belleği, süreçleri ve donanımı yöneten Linux işletim sisteminin kalbi; CUDA kernel'ı ile aynı şey değildir.
- terminal: komut yazdığın metin penceresi; örneğin PowerShell ya da Windows Terminal.
- `wsl --install`: WSL'i kurmak için Windows terminalinde çalıştırdığın tek komut.
- WSL1: uyumluluğu daha düşük ve işe yarar GPU hızlandırması olmayan eski WSL sürümü.
- GPU hızlandırması (GPU acceleration): işi GPU'da çalıştırıp yalnızca CPU'dakinden daha hızlı bitirmek.
- Linux dağıtımı (Linux distribution): kendi kullanıcıları, dosya sistemi ve paket yöneticisi olan ayrı bir Linux ortamı; CUDA için genelde Ubuntu seçilir.
- dosya sistemi (file system): işletim sisteminin dosyaları saklama ve düzenleme şekli; bir WSL dağıtımının Windows disklerinden ayrı, kendi dosya sistemi vardır.
- paket yöneticisi (package manager): yazılımları çevrim içi listelerden kuran ve güncelleyen araç; örneğin Ubuntu'daki apt.
- driver (GPU driver): işletim sisteminin GPU ile konuşmasını sağlayan yazılım; WSL için sadece Windows tarafına kurulur.
- doğrudan Linux (native Linux): başka bir sistemin içinde değil, doğrudan makineye kurulu Linux.
- ana sistem (host): WSL'in üzerinde çalıştığı Windows sistemi; WSL onun GPU driver'ını kullanır, kendine ait bir NVIDIA driver'ına ihtiyaç duymaz.
- CUDA Toolkit: NVIDIA'nın derleyicisi, kütüphaneleri ve araçları; WSL içinde WSL için hazırlanmış Linux sürümünü kurarsın.
- özel paketler (special packages): ortak driver ile çalışan ve ana sistemle çakışmayı önleyen, WSL için hazırlanmış Linux CUDA paketleri.
- Hopper / Blackwell: Nvidia'nın 2022 ve 2024 GPU mimarileri; WSL içinde CUDA 12.x ve 13.x tarafından tam olarak desteklenir.
- container: bir uygulamanın bütün kütüphaneleriyle birlikte paketlenip sistemin geri kalanından yalıtılmış çalışan hâli; örneğin Docker ile.
- canlı sistem (production): bitmiş yazılımın kullanıcıları için gerçekten çalıştığı sistemler.
