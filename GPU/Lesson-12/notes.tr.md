# CUDA Toolkit, GPU Programlamanın Temeli

Bu derste CUDA Toolkit'in ne olduğunu ve sana neler sunduğunu göreceksin. CUDA Toolkit, GPU üzerinde program yazmak, çalıştırmak ve incelemek için kullandığın ortamdır.

## CUDA nedir

CUDA, NVIDIA'nın paralel hesaplama platformudur ve kodunu GPU'ya bağlar. O olmadan GPU'yu tam olarak kontrol edemezsin.

## Derleyici: nvcc

Toolkit'in merkezinde derleyici (compiler), yani `nvcc` bulunur. CUDA kodunu GPU'nun çalıştırabileceği koda çevirir.

Bu iki adımda olur: önce kodun bir ara biçime, genelde PTX'e dönüşür; sonra PTX, belirli bir GPU mimarisi için makine koduna çevrilir.

<nvcc-pipeline></nvcc-pipeline>

2026 itibarıyla bu adım eskisinden daha önemli. Ampere, Hopper ve Blackwell gibi mimarilerin komutları, veri türleri ve yürütme modelleri farklıdır, bu yüzden doğru mimari için derlemen gerekir. Aynı kod farklı GPU'larda çalışabilir, ama doğru derleme hedefi olmadan aynı şekilde davranmaz ya da aynı hıza ulaşmaz.

## Kütüphaneler

Toolkit sana optimize edilmiş kütüphaneler de sunar. Bunlar GPU'yu iyi kullanır, böylece her şeyi kendin yazmak zorunda kalmazsın. Şu alanlar için kütüphaneler var:

- lineer cebir
- Fourier dönüşümleri
- rastgele sayı üretimi
- derin öğrenme

Bu kütüphaneler yeni donanımlar için güncellenir. Hopper ve Blackwell için çıkan yeni CUDA sürümleri FP8 ve hatta FP4 gibi yeni veri formatlarını destekliyor; modern yapay zekâ iş yükleri bu düşük duyarlıklı formatları kullanıyor.

## Runtime API

Programın GPU ile CUDA runtime API üzerinden konuşur. Açık API çağrılarıyla programın:

- GPU'da bellek ayırır
- veriyi CPU ile GPU arasında taşır
- kernel'ları başlatır

Veri taşıma çoğu zaman GPU programlarındaki asıl darboğazdır. Bu yüzden verinin ne zaman ve nasıl taşındığını bilmek, kernel'ı yazmak kadar önemlidir.

## Profiling ve hata ayıklama araçları

Programının nasıl davrandığını da görmen gerekir. Toolkit'te GPU uygulamalarında profiling (performans ölçümü), hata ayıklama ve analiz için araçlar var. Bu araçlar performansı ölçer, darboğazları ve bellek sorunlarını bulur. 2026'da iş yükleri büyük ve karmaşık olduğu için performans ayarı, geliştirmenin zorunlu bir parçası.

## Örnek programlar

Toolkit örnek programlarla birlikte gelir. Bunlar belleğin nasıl yönetildiğini, kernel'ların nasıl başlatıldığını ve performansın nasıl iyileştirileceğini gösterir. Onları incelemek, teoriden gerçek anlayışa geçmenin hızlı bir yoludur.

## Toolkit donanımı takip eder

Toolkit artık GPU mimarisine sıkı sıkıya bağlı: her yeni mimari yeni donanım özellikleri getirir, toolkit de onlara destek ekler.

- Hopper ve Blackwell'i tam olarak desteklemek için CUDA 12.x ya da 13.x gerekir. Bunlar yeni komutlar, yeni duyarlılık formatları ve daha gelişmiş yürütme özellikleri ekler.

CUDA artık her şeyi eşit şekilde desteklemeye çalışmıyor; modern donanımı tam olarak kullanmayı hedefliyor.

> [!WARNING]
> Eski mimarilerin desteği yavaş yavaş kaldırılıyor. Maxwell, Pascal ve hatta Volta artık yeni sürümlerin hedefi değil.

> [!NOTE]
> Toolkit artık tek ve sabit bir paket de değil: derleyici, kütüphaneler ve profiling araçları birbirinden daha bağımsız gelişiyor. Bu, ekosistemin ne kadar karmaşık hâle geldiğini gösteriyor. CUDA bugün başlı başına bir platform.

## Özet

CUDA Toolkit, GPU programlama için eksiksiz bir ortam: onunla kod yazar, derler, çalıştırır, analiz eder ve iyileştirirsin. 2026 itibarıyla GPU'larla ciddi şekilde çalışmak için CUDA'yı anlaman gerekiyor; geri kalan her şey onun üzerine kurulu.

## Sözlük

- CUDA: NVIDIA'nın paralel hesaplama platformu; kodunu GPU'ya bağlar.
- paralel hesaplama (parallel computing): işi aynı anda çalışan birçok küçük parçaya bölmek.
- toolkit (CUDA Toolkit): GPU programlarını yazmak, derlemek, çalıştırmak, analiz etmek ve iyileştirmek için eksiksiz ortam.
- compiler (derleyici): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program.
- `nvcc`: toolkit'in merkezindeki derleyici; CUDA kodunu GPU'nun çalıştırabileceği koda çevirir.
- PTX: `nvcc`'nin, tek bir GPU mimarisi için makine kodundan önce genelde ilk ürettiği ara biçim.
- makine kodu (machine code): belirli bir işlemcinin doğrudan çalıştırdığı ikili komutlar; NVIDIA GPU'larında buna SASS denir.
- mimari (architecture): bir GPU ailesinin donanım tasarımı; CUDA'da compute capability ile gösterilir, örneğin sm_89.
- Ampere / Hopper / Blackwell: Nvidia'nın 2020, 2022 ve 2024 GPU mimarileri; her birinin kendi komutları ve veri türleri var.
- derleme hedefi (compile target): derlediğin GPU mimarisi; yanlış hedef davranışı ve hızı değiştirebilir.
- kütüphane (library): programından çağırdığın hazır ve test edilmiş kod, örneğin lineer cebir için cuBLAS ya da Fourier dönüşümleri için cuFFT.
- lineer cebir (linear algebra): vektörler ve matrislerle yapılan matematik, örneğin vektör toplamak ya da matris çarpmak.
- Fourier dönüşümleri (Fourier transforms): bir sinyali frekanslarına ayırma yöntemi; ses, görüntü ve fizik hesaplarında kullanılır.
- derin öğrenme (deep learning): çok katmanlı sinir ağlarından kurulan yapay zekâ; cuDNN, NVIDIA'nın bunun için sunduğu kütüphane.
- FP8 / FP4: modern yapay zekâ iş yüklerinin Hopper ve Blackwell üzerinde kullandığı düşük duyarlıklı veri formatları.
- duyarlılık (precision): her sayının kaç bit kullandığı; FP32 32 bit, FP8 yalnızca 8 bit kullanır. Bu daha hızlıdır ama daha az hassastır.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir model eğitmek.
- runtime API: programının GPU belleği ayırmak, veri taşımak ve kernel başlatmak için kullandığı çağrılar.
- CPU: ana işlemci; bir CUDA programında ana kodu çalıştırır ve işi GPU'ya gönderir.
- kernel: GPU üzerinde çalışan, CPU'daki koddan başlatılan fonksiyon.
- darboğaz (bottleneck): bütün programın hızını sınırlayan en yavaş adım; çoğu zaman CPU ile GPU arasındaki kopyalama.
- profiling: bir programın zamanını nerede harcadığını ölçmek; Nsight Systems ve Nsight Compute, toolkit'in profiling araçlarıdır.
- hata ayıklama (debugging): hataları bulup düzeltmek; toolkit'te GPU kodunu adım adım izlemek için cuda-gdb, bellek hataları için Compute Sanitizer var.
- örnek programlar (sample programs): NVIDIA'nın küçük CUDA örnek programları; CUDA 11.6'dan beri GitHub'daki cuda-samples deposunda duruyorlar.
- Maxwell / Pascal / Volta: eski mimariler (2014, 2016, 2017); CUDA 13 artık onlar için kod derleyemiyor.
