# Linux'ta CUDA Toolkit Kurmak

Bu ders, WSL'deki Linux'a CUDA Toolkit'in nasıl kurulacağını gösteriyor. Bundan sonra sistemin GPU üzerinde kod derleyip çalıştırabilir.

## Platformuna uygun olanı seç

Bir CUDA kurulumu platformuna tam olarak uymalı. WSL'de, WSL'e özel depoyu (repository) kullan. Standart Ubuntu depoları ya hata verir ya da modern GPU mimarilerini desteklemeyen eski sürümleri kurar.

## Önce GPU'yu kontrol et

CUDA'yı kurmadan önce sisteminin GPU'yu görebildiğinden emin ol:

```bash
nvidia-smi
```

- `nvidia-smi`, driver'a (sürücüye) GPU hakkında soru soran, NVIDIA'nın komut satırı aracı. GPU'nun adını, driver sürümünü ve bellek kullanımını yazdırır.
- WSL'de çalışır, çünkü driver Windows tarafında durur ve WSL onu kullanır.

Bu komut hata verirse dur ve önce GPU kurulumunu düzelt. O olmadan CUDA çalışmaz, çünkü toolkit GPU ile driver üzerinden konuşur.

## NVIDIA deposundan kur

WSL için resmî NVIDIA deposunu kullan. İçinde ortak driver ile çalışacak şekilde hazırlanmış güncel toolkit var.

> [!WARNING]
> `apt install nvidia-cuda-toolkit` kullanma. O paket eski ve modern geliştirme için uygun değil.

Şu komutları çalıştır. Önce paket yöneticisine NVIDIA'nın deposunu tanıtırlar, sonra toolkit'i oradan kurarlar.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-2
```

- `wget` bir URL'den dosya indirir. Adresteki `wsl-ubuntu/x86_64` kısmı, 64 bit Intel ya da AMD CPU üzerindeki WSL için olan depoyu seçer.
- `cuda-keyring_1.1-1_all.deb` küçük bir paket. NVIDIA'nın imza anahtarını ve deponun adresini içerir, böylece sistemin NVIDIA'nın paketlerine güvenir.
- `sudo` bir komutu yönetici yetkileriyle çalıştırır. Paket kurmak sistemi değiştirir, bu yüzden bu yetkiler gerekir.
- `dpkg -i` yerel bir `.deb` dosyasını kurar, burada keyring'i.
- `apt-get update` paket listelerini yeniler. Bu olmadan apt yeni depodaki paketlerden haberdar olmaz.
- `apt-get -y install` bir paket kurar. `-y` onay sorusuna "evet" cevabını verir.
- `cuda-toolkit-13-2`, CUDA 13.2'nin toolkit paketi. Sadece toolkit'i içerir, bu yüzden hiçbir driver kurulmaz.

Bu, modern GPU mimarilerine uyan CUDA Toolkit 13.2'yi kurar. İçinde şunlar var:

* CUDA compiler (nvcc)
* CUDA runtime
* temel kütüphaneler

GPU driver'ı kurmaz. WSL'de driver Windows tarafından gelir.

## Kurulumu doğrula

Compiler'ın (derleyici) kurulu olduğunu ve shell'in onu bulabildiğini kontrol et:

```bash
nvcc --version
```

- `nvcc`, CUDA compiler'ıdır.
- `--version`, hiçbir şey derlemeden sürümünü yazdırıp çıkmasını sağlar.

Çıktıda CUDA 13.x görünmeli, çünkü 13.2'yi kurdun.

Komut bulunamazsa PATH doğru ayarlanmamış demektir. PATH, shell'in programları aradığı klasörlerin listesidir. CUDA klasörünü ona ekle:

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export`, bu shell ve onun başlattığı programlar için bir değişken ayarlar.
- `/usr/local/cuda/bin`, `nvcc`'nin bulunduğu klasördür.
- `:$PATH` eski listeyi yeni klasörün arkasına ekler, böylece hiçbir şey kaybolmaz. Shell önce CUDA klasörüne bakar.

> [!TIP]
> Bu ayar sadece açık olan terminal için geçerli. Kalıcı olsun istiyorsan `.bashrc` ya da `.zshrc` dosyana ekle.

## Sürüm neden önemli

CUDA, GPU mimarisine sıkı sıkıya bağlıdır. Hopper ve Blackwell yeni özellikler getiriyor:

* FP8 yürütme yolları
* FP4 desteği (Blackwell)
* daha iyi zamanlama ve bellek davranışı

Kullandığın CUDA sürümü bunları desteklemiyorsa kodun yine çalışır ama donanımı iyi kullanmaz.

## Diğer araçların altındaki CUDA

CUDA nadiren tek başına kullanılır. Şu gibi sistemlerin altında çalışır:

* PyTorch
* TensorFlow
* Triton
* özel CUDA kernel'ları

Doğru bir CUDA kurulumu hepsinin düzgün çalışmasını sağlar.

<install-steps></install-steps>

## Hazır

Sistemin artık hazır. Elinde şunlar var:

* bir Linux ortamı (WSL)
* GPU erişimi
* CUDA Toolkit 13.2
* çalışan bir CUDA compiler'ı

Artık gerçek CUDA programları yazıp çalıştırabilirsin.

https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network

## Sözlük

- Linux: ücretsiz, açık kaynaklı bir işletim sistemi; burada WSL aracılığıyla Windows'un içinde çalışıyor.
- WSL (Windows Subsystem for Linux): Windows'un içinde gerçek bir Linux sistemi çalıştırır, GPU driver'ı ise Windows tarafında kalır.
- Ubuntu: yaygın bir Linux dağıtımı; NVIDIA'nın WSL'de çalışan Ubuntu için ayrı bir CUDA deposu var (wsl-ubuntu).
- depo (NVIDIA repository): çevrim içi bir paket kaynağı; NVIDIA'nın WSL deposunda ortak driver için hazırlanmış güncel toolkit var.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Hopper ya da Blackwell; eski CUDA sürümleri en yenilerini tanımaz.
- `nvidia-smi`: driver'dan GPU adını, driver sürümünü ve bellek kullanımını soran NVIDIA komut satırı aracı.
- driver (GPU driver): sistemin GPU ile konuşmasını sağlayan yazılım; WSL'de Windows'tan gelir, bu yüzden Linux'un içine asla ayrıca kurmazsın.
- apt (paket yöneticisi): paketleri depolardan indirip ihtiyaç duydukları her şeyle birlikte kuran Ubuntu aracı.
- `cuda-keyring_1.1-1_all.deb`: NVIDIA'nın imza anahtarını ve depo adresini içeren küçük bir paket, böylece sistemin NVIDIA'nın paketlerine güvenir.
- `sudo`: bir komutu yönetici yetkileriyle çalıştırır. Paket kurmak için bu yetkiler gerekir.
- `apt-get update`: paket listelerini yeniler, böylece apt yeni depodaki paketlerden haberdar olur.
- CUDA Toolkit: CUDA programları derlemek için NVIDIA'nın compiler'ı, runtime'ı ve temel kütüphaneleri, bu sayfada 13.2 sürümü.
- compiler (derleyici): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program.
- `nvcc`: CUDA compiler'ı. `nvcc --version` hiçbir şey derlemeden sürümünü yazdırır.
- shell: terminalde yazdığın komutları okuyan program, örneğin bash ya da zsh.
- PATH: shell'in programları aradığı klasörlerin listesi.
- `export`: bu shell ve onun başlattığı programlar için bir değişken ayarlar.
- `.bashrc`: shell'in her yeni terminalde çalıştırdığı başlangıç dosyası, bu yüzden buraya yazılan export satırı her seferinde ayarlanır.
- Hopper / Blackwell: Nvidia'nın 2022 ve 2024 GPU mimarileri; yeni özelliklerini kullanmak için güncel bir CUDA sürümü gerekir.
- FP8 / FP4: 8 ve 4 bitlik kayan noktalı sayı formatları; Hopper'ın Tensor Core'ları FP8'i, Blackwell'inkiler FP4'ü ekledi.
- zamanlama (scheduling): GPU'nun, birimlerinde sırada hangi thread grubunun çalışacağına karar verme şekli.
- CUDA sürümü (CUDA version): toolkit'in sürüm numarası, örneğin 13.2; kodunun hangi GPU'ları ve özellikleri kullanabileceğini belirler.
- PyTorch: matematiğini CUDA üzerinden GPU'da çalıştıran, derin öğrenme için popüler bir Python kütüphanesi.
- TensorFlow: Google'ın derin öğrenme kütüphanesi, NVIDIA GPU'larında o da CUDA kullanır.
- Triton: OpenAI'ın, CUDA C++'ı elle yazmadan hızlı GPU kernel'ları yazmak için Python tabanlı dili.
- kernel: GPU üzerinde çalışan fonksiyon; özel kernel'lar senin kendi yazdıklarındır.
