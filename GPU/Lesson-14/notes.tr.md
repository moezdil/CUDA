# 14 > Windows'ta Linux Çalıştırmak (WSL ile Pratik Bir Kurulum)

Bu derste WSL (Windows Subsystem for Linux) ile Windows'un içinde Linux'u nasıl çalıştıracağını göreceksin. GPU'nun (Graphics Processing Unit, grafik işlemci) ve CUDA'nın WSL içinde nasıl çalıştığını ve sınırların nerede olduğunu da öğreneceksin.

## Neden Linux

Ciddi CUDA çalışmaları genelde Linux'ta yapılır. Windows hâlâ işe yarar, ama GPU ekosistemi yıllardır Linux etrafında gelişiyor; araçların, belgelerin ve gerçek kurulumların çoğu Linux bekler. Yapay zekâ (AI, Artificial Intelligence) ve HPC (High-Performance Computing, yüksek performanslı hesaplama) için kullanılan GPU sistemleri neredeyse her zaman Linux çalıştırır.

## WSL nedir

WSL, Windows'un içinde gerçek bir Linux ortamı çalıştırır. Eski çözümler gibi bir emülasyon katmanı değildir: WSL2, küçük ve hafif bir sanal makinede gerçek bir Linux çekirdeği (kernel) çalıştırır. Bu, davranışta, uyumlulukta ve performansta büyük fark yaratır.

## WSL'i kur

Windows'ta PowerShell gibi bir terminal aç ve şunu çalıştır:

```bash
wsl --install
wsl --update
```

- `wsl --install`, WSL'i açar ve varsayılan dağıtım olan Ubuntu'yu kurar.
- `wsl --update`, WSL çekirdeğini en yeni sürüme getirir.

Her zaman WSL2 kullan. WSL1'in uyumluluğu daha düşüktür ve hiç GPU desteği yoktur. Yeni kurulumlar varsayılan olarak WSL2 kullanır. Kontrol etmek için `wsl -l -v` çalıştır: dağıtımının VERSION sütununda 2 yazmalı.

## İlk açılış

Linux dağıtımını ilk kez başlattığında bir kullanıcı adı ve parola oluşturursun. Bu, Windows ortamın değil, aynı makinedeki ayrı bir Linux ortamıdır: kendi kullanıcıları, kendi dosya sistemi ve kendi paket yöneticisi vardır. Bundan sonra aynı anda iki sistemde çalışırsın.

## GPU erişimi

WSL2 ile Linux, GPU'yu Windows driver'ı (sürücüsü) üzerinden kullanabilir. CUDA uygulamaları WSL içinde neredeyse doğrudan Linux kurulu bir sistemdeki gibi çalışır. Yani Linux'ta geliştirme yapıp Windows'u ana sistemin olarak kullanmaya devam edebilirsin.

GPU driver'ı WSL'in içine değil, Windows tarafına kurulur. Windows için normal NVIDIA driver'ını kurarsın, WSL de ana sistemdeki bu driver'ı kullanır. WSL içinde CUDA driver'ı, Windows'tan eşlenen `libcuda.so` adlı bir kütüphane olarak görünür.

> [!WARNING]
> WSL içine asla Linux NVIDIA driver'ı kurma. Windows'tan eşlenen driver'ın üzerine yazar ve GPU erişimini bozar.

<wsl-layers></wsl-layers>

## WSL'de CUDA kurmak

WSL içinde CUDA Toolkit'in Windows sürümünü değil, Linux sürümünü kurarsın. NVIDIA'nın bunun için ayrı bir WSL-Ubuntu deposu var. Bu depodaki paketlerde toolkit var ama driver yok, bu yüzden ana sistemden gelen driver'ın üzerine yazamazlar. Yani kurulum normal Linux'a benzer ama tamamen aynı değildir. [Ders 15](../Lesson-15/notes.md) seni adım adım götürür.

## WSL'in sınırları

WSL ciddi bir geliştirme ortamı. Yine de birkaç şey doğrudan Linux'tan farklı çalışır:

- GPU desteği, WDDM (Windows Display Driver Model) modunda bir GeForce ya da RTX kart ister; bu, masaüstü kartların normal modudur. Veri merkezi GPU'ları desteklenmez.
- Unified memory (birleşik bellek) sınırlıdır. CPU (Central Processing Unit, merkezi işlemci) ve GPU aynı yönetilen belleğe aynı anda erişemez.
- `nvidia-smi` her değeri gösteremez, örneğin GPU kullanım oranını.

GPU'nun CUDA 13'e uyduğunu da kontrol et. WSL'in kendisi Pascal ve sonrasıyla çalışır, ama CUDA 13 compute capability 7,5 veya üstünü ister. GeForce GTX 1080'in compute capability değeri 6,1'dir ve 6,1, 7,5'ten küçüktür; bu yüzden CUDA 13 onun için kod derleyemez. GeForce RTX 2060'ınki 7,5'tir, yani çalışır.

> [!TIP]
> Bir şey bozulduğunda katmanları aşağıdan yukarı kontrol et: önce Windows driver'ı, sonra WSL'in kendisi (`wsl --update`), sonra Linux dağıtımı, en son CUDA Toolkit.

## Özet

WSL pratik bir köprü: Windows'ta kalırsın ve Linux tabanlı GPU araçlarını gerçek canlı sistemlere yakın bir şekilde kullanırsın. Başlamanın en doğal yollarından biri.

> [!NOTE]
> Bundan sonra bu dersler yalnızca Linux içinde ilerliyor. Windows sadece driver'ı taşıyan ana sistem olarak kalıyor.

## Sözlük

- Linux: ücretsiz, açık kaynaklı bir işletim sistemi; GPU sunucularının ve CUDA araçlarının çoğu onun etrafında kurulur.
- GPU (Graphics Processing Unit): CUDA programlarının üzerinde çalıştığı, binlerce küçük çekirdeği olan işlemci.
- ekosistem (ecosystem): bir platformun, örneğin GPU'nun, etrafında gelişen tüm araçlar, kütüphaneler, belgeler ve driver'lar.
- yapay zekâ (AI): veriden öğrenen yazılım, örneğin dil modelleri; çoğu GPU'larda eğitilir.
- HPC (High-Performance Computing): hava tahmini ya da fizik simülasyonları gibi büyük problemler üzerinde birlikte çalışan çok sayıda güçlü işlemci.
- WSL (Windows Subsystem for Linux): Windows'un içinde gerçek bir Linux ortamı çalıştırır.
- emülasyon (emulation): başka bir sistemi gerçekten çalıştırmak yerine yazılımla taklit etmek; genelde daha yavaş ve daha az uyumludur.
- WSL2: gerçek bir Linux çekirdeği çalıştıran WSL sürümü; Windows'ta CUDA'nın temeli.
- Linux çekirdeği (Linux kernel): belleği, süreçleri ve donanımı yöneten Linux işletim sisteminin kalbi; CUDA kernel'ı ile aynı şey değildir.
- sanal makine (virtual machine): yazılımla taklit edilen, kendi işletim sistemi olan ve gerçek bir makinede çalışan tam bir bilgisayar.
- terminal: komut yazdığın metin penceresi; örneğin PowerShell ya da Windows Terminal.
- `wsl --install`: WSL'i ve Ubuntu'yu kurmak için Windows terminalinde çalıştırdığın komut.
- `wsl --update`: WSL çekirdeğini en yeni sürüme günceller.
- WSL1: uyumluluğu daha düşük ve GPU desteği olmayan eski WSL sürümü.
- Linux dağıtımı (Linux distribution): kendi kullanıcıları, dosya sistemi ve paket yöneticisi olan ayrı bir Linux ortamı; CUDA için genelde Ubuntu seçilir.
- dosya sistemi (file system): işletim sisteminin dosyaları saklama ve düzenleme şekli; bir WSL dağıtımının Windows disklerinden ayrı, kendi dosya sistemi vardır.
- paket yöneticisi (package manager): yazılımları çevrim içi listelerden kuran ve güncelleyen araç; örneğin Ubuntu'daki apt.
- driver (GPU driver): işletim sisteminin GPU ile konuşmasını sağlayan yazılım; WSL için sadece Windows tarafına kurulur.
- doğrudan Linux (native Linux): başka bir sistemin içinde değil, doğrudan makineye kurulu Linux.
- ana sistem (host): WSL'in üzerinde çalıştığı Windows sistemi; WSL onun GPU driver'ını kullanır, kendine ait bir NVIDIA driver'ına ihtiyaç duymaz.
- `libcuda.so`: CUDA driver kütüphanesi; WSL içinde Windows driver'ından eşlenir.
- CUDA Toolkit: NVIDIA'nın derleyicisi, kütüphaneleri ve araçları; WSL içinde Linux sürümünü WSL-Ubuntu deposundan kurarsın.
- WSL-Ubuntu deposu (WSL-Ubuntu repository): NVIDIA'nın WSL'de CUDA için paket kaynağı; paketlerinde toolkit var, driver yok.
- WDDM (Windows Display Driver Model): masaüstü ekran kartları için normal Windows driver modu; WSL'deki GPU desteği bunu ister.
- unified memory (birleşik bellek): CPU ile GPU'nun tek bir pointer üzerinden paylaştığı bellek; WSL'de yalnızca kısmen desteklenir.
- CPU (Central Processing Unit): bilgisayarın ana işlemcisi.
- `nvidia-smi`: GPU'yu, driver'ı ve bellek kullanımını gösteren NVIDIA komut satırı aracı.
- compute capability (hesaplama yeteneği): bir GPU mimarisinin sürüm numarası, örneğin Turing için 7,5; CUDA 13, 7,5 veya üstünü ister.
- Pascal: NVIDIA'nın 2016 mimarisi, örneğin GTX 1080; WSL onu çalıştırır, CUDA 13 onun için derleyemez.
- canlı sistem (production): bitmiş yazılımın kullanıcıları için gerçekten çalıştığı sistemler.
