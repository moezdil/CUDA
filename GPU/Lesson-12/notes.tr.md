# CUDA Toolkit, GPU Programlamanın Temeli

Bu ders CUDA Toolkit'in ne olduğunu ve sana neler verdiğini anlatıyor. CUDA Toolkit, GPU üzerinde program yazmak, çalıştırmak ve incelemek için kullandığın ortamdır.

## CUDA nedir

CUDA, NVIDIA'nın paralel hesaplama platformudur. Kodunu GPU'ya bağlar. O olmadan GPU'yu tam olarak kontrol edemezsin.

## Compiler: nvcc

Toolkit'in merkezinde compiler (derleyici), yani `nvcc` var. CUDA kodunu GPU'nun çalıştırabileceği koda çevirir.

Bu iki adımda olur. Önce kodun bir ara biçime dönüşür, genelde PTX'e. Sonra PTX, belirli bir GPU mimarisi için makine koduna dönüşür.

<nvcc-pipeline></nvcc-pipeline>

2026 itibarıyla bu adım eskisinden daha önemli. Ampere, Hopper ve Blackwell gibi mimarilerin komutları, veri türleri ve yürütme modelleri farklı. Bu yüzden doğru mimari için derlemen gerekir. Aynı kod farklı GPU'larda çalışabilir. Ama doğru derleme hedefi olmadan aynı şekilde davranmaz ya da aynı hıza ulaşmaz.

## Kütüphaneler

Toolkit sana optimize edilmiş kütüphaneler de verir. Bunlar GPU'yu iyi kullanır, böylece her şeyi kendin yazmak zorunda kalmazsın. Şunlar için kütüphaneler var:

- lineer cebir
- Fourier dönüşümleri
- rastgele sayı üretimi
- derin öğrenme

Bu kütüphaneler yeni donanımlar için güncellenir. Hopper ve Blackwell için çıkan yeni CUDA sürümleri FP8 ve hatta FP4 gibi yeni veri formatlarını destekliyor. Modern yapay zekâ iş yükleri bu düşük duyarlıklı formatları kullanıyor.

## Runtime API

Programın GPU ile CUDA runtime API üzerinden konuşur. Açık API çağrılarıyla programın:

- GPU'da bellek ayırır
- veriyi CPU ile GPU arasında taşır
- kernel'ları başlatır

Veri taşıma çoğu zaman GPU programlarındaki ana darboğazdır. Bu yüzden verinin ne zaman ve nasıl taşındığını bilmek, kernel'ı yazmak kadar önemlidir.

## Profiling ve hata ayıklama araçları

Programının nasıl davrandığını da görmen gerekir. Toolkit'te GPU uygulamalarında profiling (performans ölçümü), hata ayıklama ve analiz için araçlar var. Bu araçlar performansı ölçer, darboğazları ve bellek sorunlarını bulur. 2026'da iş yükleri büyük ve karmaşık, bu yüzden performans ayarı geliştirmenin zorunlu bir parçası.

## Örnek programlar

Toolkit örnek programlarla birlikte gelir. Bunlar belleğin nasıl yönetildiğini, kernel'ların nasıl başlatıldığını ve performansın nasıl iyileştirileceğini gösterir. Onları incelemek, teoriden gerçek anlayışa geçmenin hızlı bir yoludur.

## Toolkit donanımı takip eder

Toolkit artık GPU mimarisine sıkı sıkıya bağlı. Her yeni mimari yeni donanım özellikleri getirir, toolkit de onlara destek ekler.

- Hopper ve Blackwell'i tam olarak desteklemek için CUDA 12.x ve 13.x gerekir. Bunlar yeni komutlar, yeni duyarlılık formatları ve daha gelişmiş yürütme özellikleri ekler.

CUDA artık her şeyi eşit şekilde desteklemeye çalışmıyor. Modern donanımı tam olarak kullanmayı hedefliyor.

> [!WARNING]
> Eski mimarilerin desteği yavaş yavaş kaldırılıyor. Maxwell, Pascal ve hatta Volta artık yeni sürümlerin ana hedefi değil.

> [!NOTE]
> Toolkit artık tek, sabit bir paket de değil. Compiler, kütüphaneler ve profiling araçları artık birbirinden daha bağımsız değişiyor. Bu, ekosistemin ne kadar karmaşık hâle geldiğini gösteriyor. CUDA bugün başlı başına bir platform.

## Özet

CUDA Toolkit, GPU programlama için eksiksiz bir ortam. Onunla kod yazar, derler, çalıştırır, analiz eder ve iyileştirirsin. 2026 itibarıyla GPU'larla ciddi şekilde çalışmak için CUDA'yı anlaman gerekiyor. Geri kalan her şey onun üzerine kurulu.

## Sözlük

- CUDA: NVIDIA'nın paralel hesaplama platformu. Kodunu GPU'ya bağlar.
- CUDA Toolkit: GPU programlarını yazmak, derlemek, çalıştırmak, analiz etmek ve iyileştirmek için eksiksiz ortam.
- `nvcc`: toolkit'in merkezindeki compiler. CUDA kodunu GPU'nun çalıştırabileceği koda çevirir.
- PTX: `nvcc`'nin, tek bir GPU mimarisi için makine kodundan önce genelde ilk ürettiği ara biçim.
- derleme hedefi (compile target): derlediğin GPU mimarisi. Yanlış hedef davranışı ve hızı değiştirebilir.
- runtime API: programının GPU belleği ayırmak, veri taşımak ve kernel başlatmak için kullandığı çağrılar.
- profiling araçları (profiling tools): performansı ölçen, darboğazları ve bellek sorunlarını bulan toolkit araçları.
- FP8 ve FP4: modern yapay zekâ iş yüklerinin Hopper ve Blackwell üzerinde kullandığı düşük duyarlıklı veri formatları.
