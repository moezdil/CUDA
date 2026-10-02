# 14 > CUDA Toolkit, GPU Programlamanın Temeli

Bu derste CUDA Toolkit'in ne olduğunu ve sana neler sunduğunu göreceksin. CUDA Toolkit, GPU üzerinde program yazmak, derlemek, çalıştırmak ve incelemek için kullandığın ortamdır. Ekim 2026 itibarıyla en yeni sürüm CUDA 13.4.

## CUDA nedir

CUDA, NVIDIA'nın paralel hesaplama platformudur ve kodunu GPU'ya bağlar. O olmadan bir NVIDIA GPU'yu tam olarak kontrol edemezsin.

## nvcc derleyicisi

Toolkit'in merkezinde derleyici, yani `nvcc` bulunur. CUDA kodunu GPU'nun çalıştırabileceği koda çevirir.

Bu iki adımda olur. Önce kodun bir ara biçime, PTX'e dönüşür, sonra PTX, belirli bir GPU mimarisi için makine koduna çevrilir. Bu makine koduna SASS denir.

<nvcc-pipeline></nvcc-pipeline>

Bu mimariyi compute capability numarasıyla belirtirsin. `-arch=sm_89` bayrağı compute capability 8,9 demektir, yani ana sürüm 8, alt sürüm 9. Bu Ada nesli, örneğin L40S. Hopper H100 `sm_90` (9,0), Blackwell B200 ise `sm_100` (10,0).

Ampere, Hopper ve Blackwell gibi mimarilerin komutları, veri türleri ve yürütme modelleri farklıdır, bu yüzden doğru mimari için derlemen gerekir. Aynı kod farklı GPU'larda çalışabilir, ama doğru derleme hedefi olmadan aynı şekilde davranmaz ya da aynı hıza ulaşmaz.

## Kütüphaneler

Toolkit sana optimize edilmiş kütüphaneler de sunar. Bunlar GPU'yu iyi kullanır, böylece her şeyi kendin yazmak zorunda kalmazsın. Şu alanlar için kütüphaneler var.

- lineer cebir (cuBLAS)
- Fourier dönüşümleri (cuFFT)
- rastgele sayı üretimi (cuRAND)
- seyrek matrisler (cuSPARSE)

Derin öğrenme için NVIDIA'nın cuDNN kütüphanesi var. Ayrı indirilir, toolkit'in parçası değildir.

Bu kütüphaneler yeni donanımlar için güncellenir. Yeni CUDA sürümleri Hopper'da FP8, Blackwell'de FP4 gibi düşük duyarlıklı formatları destekliyor. Modern yapay zekâ iş yükleri bu formatları kullanıyor.

## Runtime API

Programın GPU ile CUDA runtime API üzerinden konuşur. Açık API çağrılarıyla programın şu üç işi yapar.

- GPU'da bellek ayırır
- veriyi CPU ile GPU arasında taşır
- kernel'ları başlatır

Veri taşıma çoğu zaman GPU programlarındaki asıl darboğazdır. Bu yüzden verinin ne zaman ve nasıl taşındığını bilmek, kernel'ı yazmak kadar önemlidir.

## Profiling ve hata ayıklama araçları

Programının nasıl davrandığını da görmen gerekir. Toolkit'te GPU uygulamalarında profiling, hata ayıklama ve analiz için araçlar var. Başlıcaları Nsight Systems, Nsight Compute, cuda-gdb ve Compute Sanitizer. Bu araçlar performansı ölçer, darboğazları ve bellek sorunlarını bulur. İş yükleri büyüdükçe performans ayarı, geliştirmenin zorunlu bir parçası olur.

## Örnek programlar

NVIDIA örnek programlar da yayınlar. Bunlar belleğin nasıl yönetildiğini, kernel'ların nasıl başlatıldığını ve performansın nasıl iyileştirileceğini gösterir. CUDA 11.6'dan beri toolkit'in içinde gelmiyorlar. Onları GitHub'daki cuda-samples deposundan alırsın. Onları incelemek, teoriden gerçek anlayışa geçmenin hızlı bir yoludur.

## Toolkit donanımı takip eder

Toolkit, GPU mimarisine sıkı sıkıya bağlı. Her yeni mimari yeni donanım özellikleri getirir, toolkit de onlara destek ekler.

- CUDA 13.0 Ağustos 2025'te çıktı. Güncel sürüm CUDA 13.4.
- CUDA 13, Turing'i (compute capability 7,5) ve ondan yeni bütün mimarileri, Blackwell (10.x ve 12.x) dahil, destekler. CUDA 13.4, kütüphanelerine Rubin (10,7) desteğini ekledi. Rubin veri merkezi GPU'ları 2026'nın ikinci yarısında teslim edilmeye başladı.

> [!WARNING]
> CUDA 13.0, Maxwell, Pascal ve Volta'yı, yani compute capability 7,5'in altındaki bütün GPU'ları kaldırdı. CUDA 13 artık onlar için kod derleyemiyor. Bu GPU'lar için CUDA 12.x'te kalman gerekir.

> [!NOTE]
> Toolkit artık tek ve sabit bir paket değil, parçalarının kendi sürüm numaraları var. CUDA 13.4 Update 1'de `nvcc` 13.4.92 sürümünde, cuBLAS ise 13.8.0.4 sürümünde. GPU sürücüsü de artık paketle gelmiyor, Windows'ta CUDA 13.1'den, Linux'ta CUDA 13.4'ten beri. Sürücüyü ayrıca kurarsın.

## Özet

CUDA Toolkit, GPU programlama için eksiksiz bir ortamdır. Onunla kod yazar, derler, çalıştırır, analiz eder ve iyileştirirsin. NVIDIA GPU'larıyla ciddi şekilde çalışmak için CUDA'yı anlaman gerekiyor, çünkü geri kalan her şey onun üzerine kurulu.

## Sözlük

- CUDA (Compute Unified Device Architecture): NVIDIA'nın paralel hesaplama platformu. Kodunu GPU'ya bağlar.
- GPU (Graphics Processing Unit, grafik işlemci): CUDA programlarının üzerinde çalıştığı, binlerce küçük çekirdeği olan işlemci.
- paralel hesaplama (parallel computing): işi aynı anda çalışan birçok küçük parçaya bölmek.
- toolkit (CUDA Toolkit): GPU programlarını yazmak, derlemek, çalıştırmak, analiz etmek ve iyileştirmek için eksiksiz ortam. Güncel sürüm 13.4.
- derleyici (compiler): kaynak kodu bir işlemcinin çalıştırabileceği koda çeviren program.
- `nvcc` (NVIDIA CUDA Compiler): toolkit'in merkezindeki derleyici. CUDA kodunu GPU'nun çalıştırabileceği koda çevirir.
- PTX (Parallel Thread Execution): `nvcc`'nin, tek bir GPU mimarisi için makine kodundan önce ilk ürettiği ara biçim.
- makine kodu (machine code): belirli bir işlemcinin doğrudan çalıştırdığı ikili komutlar. NVIDIA GPU'larında buna SASS (Streaming Assembler) denir.
- SASS (Streaming Assembler): NVIDIA GPU'larının makine kodu. PTX'ten tek bir mimari için üretilir.
- mimari (architecture): bir GPU ailesinin donanım tasarımı, örneğin Ampere, Hopper ya da Blackwell.
- compute capability (hesaplama yeteneği): bir GPU mimarisinin sürüm numarası, örneğin 8,9. `sm_89` aynı sayının `-arch` için yazılışı.
- Ampere / Hopper / Blackwell / Rubin: NVIDIA'nın 2020, 2022, 2024 ve 2026 GPU mimarileri. Her birinin kendi komutları ve veri türleri var.
- derleme hedefi (compile target): derlediğin GPU mimarisi. Yanlış hedef davranışı ve hızı değiştirebilir.
- kütüphane (library): programından çağırdığın hazır ve test edilmiş kod, örneğin cuBLAS ya da cuFFT.
- lineer cebir (linear algebra): vektörler ve matrislerle yapılan matematik, örneğin vektör toplamak ya da matris çarpmak.
- Fourier dönüşümleri (Fourier transforms): bir sinyali frekanslarına ayırma yöntemi. Ses, görüntü ve fizik hesaplarında kullanılır.
- derin öğrenme (deep learning): çok katmanlı sinir ağlarından kurulan yapay zekâ. NVIDIA'nın bunun için sunduğu, ayrı indirilen kütüphane cuDNN'dir.
- FP8 / FP4 (8 bit / 4 bit kayan nokta): 8 bit ve 4 bit kayan nokta formatları. Hopper FP8'i, Blackwell FP4'ü ekledi.
- yapay zekâ (AI, Artificial Intelligence): veriden öğrenen yazılım, örneğin dil modelleri. Çoğu GPU üzerinde çalışır.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir model eğitmek.
- runtime API (Application Programming Interface, uygulama programlama arayüzü): programının GPU belleği ayırmak, veri taşımak ve kernel başlatmak için kullandığı çağrılar.
- CPU (Central Processing Unit, merkezi işlemci): ana işlemci. Bir CUDA programında ana kodu çalıştırır ve işi GPU'ya gönderir.
- kernel: GPU üzerinde çalışan, CPU'daki koddan başlatılan fonksiyon.
- darboğaz (bottleneck): bütün programın hızını sınırlayan en yavaş adım. Çoğu zaman bu, CPU ile GPU arasındaki kopyalamadır.
- profiling (performans ölçümü): bir programın zamanını nerede harcadığını ölçmek. Nsight Systems ve Nsight Compute, toolkit'in profiling araçlarıdır.
- hata ayıklama (debugging): hataları bulup düzeltmek. Bunun için cuda-gdb GPU kodunu adım adım izler, Compute Sanitizer da bellek hatalarını bulur.
- örnek programlar (sample programs): NVIDIA'nın küçük CUDA örnek programları. CUDA 11.6'dan beri GitHub'daki cuda-samples deposunda duruyorlar.
- Turing: compute capability 7,5 olan 2018 mimarisi. CUDA 13'ün desteklediği en eski mimaridir.
- Maxwell / Pascal / Volta: eski mimariler (2014, 2016, 2017). CUDA 13 artık onlar için kod derleyemiyor.
- sürücü (GPU driver): işletim sisteminin GPU ile konuşmasını sağlayan yazılım. Toolkit'ten ayrı kurulur.
