# 17 > Linux'ta CUDA Toolkit Kurmak

Bu derste WSL'deki Linux'a CUDA Toolkit'i nasıl kuracağını göreceksin. Bundan sonra sistemin GPU üzerinde kod derleyip çalıştırabilir. Adımlar, NVIDIA'nın Ekim 2026 itibarıyla geçerli kurulum kılavuzunu izliyor.

## Platformuna uygun olanı seç

Bir CUDA kurulumu platformuna tam olarak uymalı. WSL'de NVIDIA'nın WSL-Ubuntu deposunu kullan. Bu depodaki paketlerde toolkit var ama Linux driver'ı yok, bu yüzden Windows'tan gelen driver'ın üzerine yazamazlar. Doğrudan kurulu Ubuntu'da ise Ubuntu sürümüne ait depoyu kullanırsın, örneğin Ubuntu 24.04 için `ubuntu2404`.

## Önce GPU'yu kontrol et

CUDA'yı kurmadan önce sisteminin GPU'yu görebildiğinden emin ol.

```bash
nvidia-smi
```

- `nvidia-smi`, driver'a GPU hakkında soru soran NVIDIA komut satırı aracıdır. GPU'nun adını, driver sürümünü ve bellek kullanımını yazdırır.
- WSL'de de çalışır, çünkü driver Windows tarafında durur. WSL bu aracı Windows'tan `/usr/lib/wsl/lib` altına eşler.

Bu komut hata verirse dur ve önce GPU kurulumunu düzelt. O olmadan CUDA çalışmaz, çünkü toolkit GPU ile driver üzerinden konuşur.

## NVIDIA deposundan kur

WSL için resmî NVIDIA deposunu kullan. Bu depoda, ortak driver ile çalışacak şekilde hazırlanmış güncel toolkit'ler bulunur.

> [!WARNING]
> `apt install nvidia-cuda-toolkit` kullanma. O, Ubuntu'nun kendi paketidir ve çok geriden gelir. Ubuntu 24.04'te CUDA 12.0'dır.

Şu komutları çalıştır. Önce paket yöneticisine NVIDIA'nın deposunu tanıtır, sonra toolkit'i oradan kurarlar.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-3
```

- `wget` bir URL'den dosya indirir. Adresteki `wsl-ubuntu/x86_64` kısmı, 64 bitlik Intel ya da AMD CPU üzerindeki WSL için olan depoyu seçer.
- `cuda-keyring_1.1-1_all.deb` küçük bir pakettir. NVIDIA'nın imza anahtarını ve deponun adresini içerir, böylece sistemin NVIDIA'nın paketlerine güvenir.
- `sudo` bir komutu yönetici yetkileriyle çalıştırır. Paket kurmak sistemi değiştirir, bu yüzden bu yetkiler gerekir.
- `dpkg -i` yerel bir `.deb` dosyasını kurar, burada da keyring'i kurar.
- `apt-get update` paket listelerini yeniler. Bu adım olmadan apt yeni depodaki paketlerden haberdar olmaz.
- `apt-get -y install` bir paket kurar. `-y`, onay sorusuna kendiliğinden "evet" der.
- `cuda-toolkit-13-3`, CUDA 13.3'ün toolkit paketidir. Sürüm adın içinde yazar, `13-3`, 13.3 demektir ve dosyalar `/usr/local/cuda-13.3` altına kurulur. Yalnızca toolkit'i içerir, bu yüzden hiçbir driver kurulmaz.

Bu komutlar CUDA Toolkit 13.3'ü kurar. İçinde aşağıdaki parçalar var.

* CUDA compiler nvcc
* CUDA runtime
* temel kütüphaneler

> [!NOTE]
> En yeni CUDA 13.4, ama Ekim 2026'da NVIDIA'nın WSL-Ubuntu deposu 13.3'e kadar gidiyor. Bu sayfanın `cuda-toolkit-13-3` kurmasının nedeni bu. Orada `cuda-toolkit-13-4` çıktığında sadece numarayı değiştir. WSL'de asla `cuda` ya da `cuda-drivers` paketlerini kurma, çünkü bunlar bir Linux driver'ı kurmaya çalışır.

## Kurulumu doğrula

Derleyicinin kurulu olduğunu ve shell'in onu bulabildiğini kontrol et.

```bash
nvcc --version
```

- `nvcc`, CUDA derleyicisidir.
- `--version`, hiçbir şey derlemeden sürüm bilgisini yazdırıp çıkmasını sağlar.

Çıktının son satırlarında release 13.3 yazmalı, çünkü `cuda-toolkit-13-3` kurdun.

Komut bulunamazsa PATH doğru ayarlanmamış demektir. PATH, shell'in programları aradığı klasörlerin listesidir. CUDA klasörünü ona ekle.

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export`, bu shell ve onun başlattığı programlar için bir değişken ayarlar.
- `/usr/local/cuda/bin`, `nvcc`'nin bulunduğu klasördür. `/usr/local/cuda` ise kurulu sürüme giden bir bağlantıdır, burada `/usr/local/cuda-13.3`.
- `:$PATH`, eski listeyi yeni klasörün arkasına ekler, böylece hiçbir şey kaybolmaz ve shell önce CUDA klasörüne bakar.

> [!TIP]
> Bu ayar yalnızca açık olan terminal için geçerlidir. Kalıcı olmasını istiyorsan satırı `.bashrc` ya da `.zshrc` dosyana ekle. Bir de `sudo apt-get -y install build-essential` ile bir host derleyicisi kur, çünkü `nvcc` her programın CPU kısmını `g++`'ya verir ve yeni kurulmuş bir Ubuntu'da o yoktur.

<install-steps></install-steps>

## Sürüm neden önemli

CUDA, GPU mimarisine sıkı sıkıya bağlıdır. Her yeni mimari, onu tanıyan bir CUDA sürümü ister.

* Hopper'da FP8, CUDA 11.8'den beri
* Blackwell'de FP4, CUDA 12.8'den beri
* Rubin (compute capability 10,7) için kütüphane desteği, CUDA 13.4'ten beri

Kullandığın CUDA sürümü bunları desteklemiyorsa kodun yine çalışır, ama donanımdan tam olarak yararlanamaz ya da en yeni GPU'yu hiç hedefleyemez.

## Diğer araçların altındaki CUDA

CUDA nadiren tek başına kullanılır. Aşağıdaki gibi sistemlerin altında çalışır.

* PyTorch
* TensorFlow
* Triton
* özel CUDA kernel'ları

`pip` ile kurulan PyTorch, CUDA kütüphanelerinin kendi kopyasını getirir, bu yüzden yalnızca driver'a ihtiyaç duyar. Kendi kernel'ların ise bu sayfadaki toolkit'e ihtiyaç duyar.

## Hazır

Sistemin artık hazır. Aşağıdakilerin hepsi elinde.

* bir Linux ortamı, burada WSL
* GPU erişimi
* CUDA Toolkit 13.3
* çalışan bir CUDA derleyicisi

Artık gerçek CUDA programları yazıp çalıştırabilirsin. Bu sayfadaki komutlar [NVIDIA'nın WSL-Ubuntu indirme sayfasından](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network) geliyor.

## Sözlük

- Linux: ücretsiz, açık kaynaklı bir işletim sistemi. Burada WSL üzerinden Windows'un içinde çalışıyor.
- WSL (Windows Subsystem for Linux): Windows'un içinde gerçek bir Linux sistemi çalıştırır. GPU driver'ı ise Windows tarafında kalır.
- GPU (Graphics Processing Unit): CUDA programlarının üzerinde çalıştığı, binlerce küçük çekirdeği olan işlemci.
- Ubuntu: popüler bir Linux dağıtımı. NVIDIA'nın WSL içinde çalışan Ubuntu için ayrı bir CUDA deposu var (wsl-ubuntu).
- depo (NVIDIA repository): çevrim içi bir paket kaynağı. NVIDIA'nın WSL için olan deposunda driver'sız toolkit bulunur.
- doğrudan kurulu Ubuntu (native Ubuntu): WSL içinde değil, doğrudan makineye kurulu Ubuntu. `ubuntu2404` gibi bir depo kullanır.
- `nvidia-smi`: driver'a GPU adını, driver sürümünü ve bellek kullanımını soran NVIDIA komut satırı aracı.
- driver (GPU driver): sistemin GPU ile konuşmasını sağlayan yazılım. WSL'de Windows'tan gelir, bu yüzden Linux içine asla driver kurmazsın.
- apt (paket yöneticisi): Ubuntu'nun, paketleri depolardan indirip bağımlılıklarıyla birlikte kuran aracı.
- `cuda-keyring_1.1-1_all.deb`: NVIDIA'nın imza anahtarını ve depo adresini içeren küçük paket. Sistemin NVIDIA paketlerine güvenmesini sağlar.
- `sudo`: bir komutu yönetici yetkileriyle çalıştırır. Paket kurmak bu yetkileri gerektirir.
- `apt-get update`: paket listelerini yeniler, böylece apt yeni depodaki paketlerden haberdar olur.
- `cuda-toolkit-13-3`: driver içermeyen, yalnızca CUDA 13.3 toolkit'ini kuran paket ve WSL'de güvenli seçim.
- CPU (Central Processing Unit): ana işlemci. `x86_64`, 64 bitlik bir Intel ya da AMD CPU demektir.
- CUDA Toolkit: NVIDIA'nın CUDA programları derlemek için derleyicisi, runtime'ı ve temel kütüphaneleri. Bu sayfada 13.3 sürümü.
- derleyici (compiler): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program.
- `nvcc`: CUDA derleyicisi. `nvcc --version` hiçbir şey derlemeden sürümünü yazdırır.
- shell: terminalde yazdığın komutları okuyan program, örneğin bash ya da zsh.
- PATH: shell'in programları aradığı klasörlerin listesi.
- `export`: bu shell ve onun başlattığı programlar için bir değişken ayarlar.
- `.bashrc`: shell'in her yeni terminalde çalıştırdığı başlangıç dosyası. Oraya yazılan export satırı her seferinde ayarlanır.
- `build-essential`: `gcc`, `g++` ve `make` içeren Ubuntu paketi. `nvcc`, host derleyicisi olarak `g++`'ya ihtiyaç duyar.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Hopper ya da Blackwell. Eski CUDA sürümleri en yenilerini tanımaz.
- Hopper / Blackwell / Rubin: NVIDIA'nın 2022, 2024 ve 2026 GPU mimarileri. Yeni özelliklerini kullanmak için güncel bir CUDA sürümü gerekir.
- FP8 / FP4: 8 bit ve 4 bit kayan nokta formatları. Hopper'ın Tensor Core'ları FP8'i, Blackwell'inkiler FP4'ü ekledi.
- compute capability (hesaplama yeteneği): bir GPU mimarisinin sürüm numarası, örneğin L40S için 8,9, Rubin için 10,7.
- CUDA sürümü (CUDA version): toolkit'in sürüm numarası, örneğin 13.3. Kodunun hangi GPU'ları ve özellikleri kullanabileceğini belirler.
- PyTorch: matematiğini CUDA üzerinden GPU'da çalıştıran popüler bir Python derin öğrenme kütüphanesi.
- TensorFlow: Google'ın derin öğrenme kütüphanesi. NVIDIA GPU'larında o da CUDA kullanır.
- Triton: OpenAI'ın, CUDA C++'ı elle yazmadan hızlı GPU kernel'ları yazmak için geliştirdiği Python tabanlı dil.
- `pip`: Python'un paket kurucusu. Onunla kurulan PyTorch kendi CUDA kütüphanelerini getirir.
- kernel: GPU üzerinde çalışan fonksiyon. Özel kernel'lar senin kendi yazdıklarındır.
