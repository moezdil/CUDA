# 09 > Hesap mı Bellek mi Sınırlıyor

Her kernel iki şeyden biri tarafından yavaşlatılır, GPU'nun ne kadar hızlı hesap yapabildiği ya da veriyi ne kadar hızlı taşıyabildiği. Bu derste hangisi olduğunu tek bir sayıyla, aritmetik yoğunlukla, ve roofline denen basit bir grafikle nasıl anlayacağını göreceksin. Bütün örneklerde bu derslerdeki programları çalıştıran NVIDIA L40S kullanılıyor.

## Her Kernel'in İki Sınırı

Bir kernel'in bitmesi için hesabının çekirdekler tarafından yapılması ve verisinin bellek ile çekirdekler arasında taşınması gerekir.

İkisi de zaman alır ve GPU'da ikisi aynı anda olur. Bazı warp'lar veri beklerken diğerleri hesap yapar (bkz. [Ders 08](../Lesson-08/notes.md)). Bu yüzden kernel yaklaşık olarak ikisinden yavaş olanı kadar sürer.

- hesap süresi = FLOPs / tepe FLOPS
- veri süresi = taşınan bayt / bellek bant genişliği

Hangisi büyükse süreyi o belirler. Veri kısmı büyükse kernel bellek sınırlıdır. Hesap kısmı büyükse hesap sınırlıdır.

## FLOP Saymak

Bir FLOP, kayan noktalı sayılar üzerinde bir toplama, çıkarma, çarpma ya da bölmedir. FLOPS ise bir hızdır, saniyede kaç tane yapıldığını söyler.

[Ders 06](../Lesson-06/notes.md) tepe değerin nereden geldiğini gösterdi. Değer çekirdek × saat hızı × 2'dir, çünkü bir FMA 2 FLOP sayılır. L40S için bu 18.176 FP32 çekirdek × 2,52 GHz × 2 ≈ 91,6 TFLOPS eder, bu da NVIDIA'nın özellik sayfasındaki FP32 değeridir.

> [!NOTE]
> Küçük s ile yazılan FLOPs bir iş miktarıdır. Büyük S ile yazılan FLOPS bir hızdır. 1.000 FLOP yapan bir kernel, 91,6 TFLOPS'a ulaşan bir GPU'da yalnızca hesabı için en az 1.000 / 91,6 trilyon saniye harcar.

Bir kernel'in FLOP sayısını bulmak için bir thread'in yaptığı hesabı say ve thread sayısıyla çarp. `c[i] = a[i] + b[i]` eleman başına 1 FLOP'tur. `y[i] = a * x[i] + y[i]` eleman başına 2 FLOP'tur, bir çarpma ve bir toplama.

## Bayt Saymak

Taşınan bayt, GPU belleği ile çip arasında gidip gelen baytlardır. Bir `float` 4 bayttır. Bir thread'in bellekten okuduğu ve belleğe geri yazdığı her değeri say.

`c[i] = a[i] + b[i]` için her thread `a[i]` ve `b[i]` okur, `c[i]` yazar, yani 3 float × 4 bayt = eleman başına 12 bayt.

Bu tarafın hız sınırı [Ders 06](../Lesson-06/notes.md)'daki bellek bant genişliğidir. L40S'te 48 GB GDDR6 bellek ve 864 GB/s bant genişliği vardır.

## Aritmetik Yoğunluk

İki sayıyı bir araya getirince bu dersin en işe yarar sayısını elde edersin.

aritmetik yoğunluk = FLOPs / taşınan bayt

Birimi FLOP/bayt'tır ve bir kernel'in içeri aldığı her bayt için ne kadar hesap yaptığını söyler. Yalnızca kernel'e bağlıdır, GPU'ya değil. Yoğunluğu düşük bir kernel zamanının çoğunu veri bekleyerek geçirir. Yoğunluğu yüksek bir kernel her baytı defalarca kullanır.

Vektör toplamada 12 bayt başına 1 FLOP vardır, yani 1 / 12 ≈ 0,083 FLOP/bayt. Bu çok düşüktür.

## Kırılma Noktası

GPU'nun da karşılaştırma için kendi sayısı vardır. Tepe FLOPS'u bellek bant genişliğine böl.

kırılma noktası = tepe FLOPS / bellek bant genişliği

L40S için bu 91.600 GFLOPS / 864 GB/s ≈ 106 FLOP/bayt eder. FP32 çekirdeklerini meşgul tutmak için bir kernel'in okuduğu her bayt başına yaklaşık 106 FLOP yapması gerekir. Daha azında çekirdekler belleği bekler.

> [!TIP]
> Hızlı test için kernel'in aritmetik yoğunluğunu GPU'nun kırılma noktasıyla karşılaştır. Altındaysa bellek sınırlı, üstündeyse hesap sınırlıdır.

Farklı GPU'ların kırılma noktaları çok farklıdır.

| GPU | Tepe FP32 | Bant genişliği | Kırılma noktası |
|---|---|---|---|
| L40S | 91,6 TFLOPS | 864 GB/s | ≈ 106 FLOP/bayt |
| H100 SXM | 67 TFLOPS | 3.350 GB/s | ≈ 20 FLOP/bayt |
| RTX 5090 | 104,8 TFLOPS | 1.792 GB/s | ≈ 58 FLOP/bayt |

H100'ün FP32 hesap gücüne göre bant genişliği çok daha fazladır, bu yüzden oldukça hafif kernel'ler bile onun FP32 tavanına ulaşır. L40S'in FP32 hesap gücü yüksektir ama belleği GDDR6'dır, bu yüzden birçok kernel önce bellek sınırına çarpar.

## Roofline Modeli

Roofline modeli bunların hepsini tek bir grafikte çizer. x ekseni aritmetik yoğunluk, y ekseni ulaşılabilir GFLOPS'tur. İki eksen de logaritmiktir, yani her adım bir kattır.

ulaşılabilir GFLOPS = min(tepe GFLOPS, aritmetik yoğunluk × bant genişliği)

Grafikte kırılma noktasında buluşan iki çizgi vardır. Solda eğik bir çizgi var, bant genişliği × yoğunluk, yani bellek tavanı. Sağda düz bir çizgi var, tepe değer, yani hesap tavanı. Bir kernel tavanın altında bir noktadır. Tavanın üstüne asla çıkamaz.

<roofline-chart></roofline-chart>

Bir GPU ve bir kernel seç. Eğik kısımdaki nokta bellek sınırlı, düz kısımdaki nokta hesap sınırlıdır.

## Sayılarla Vektör Toplama

L40S'te dizi başına 100 milyon float ile vektör toplamayı al (N = 100.000.000).

- Eleman başına 1 FLOP, yani 100.000.000 FLOP.
- Eleman başına 12 bayt, yani 1.200.000.000 bayt = 1,2 GB.
- Hesap süresi 100.000.000 / 91,6 trilyon ≈ 0,0011 ms (yaklaşık 1,1 µs).
- Veri süresi 1,2 GB / 864 GB/s ≈ 1,39 ms.

Veri kısmı yaklaşık 1.270 kat daha uzundur. Roofline aynı cevabı verir, 0,083 × 864 ≈ 72 GFLOPS ulaşılabilir, bu da 91.600 GFLOPS tepe değerin %0,1'inden az. Vektör toplama her GPU'da ağır biçimde bellek sınırlıdır. Bu, CUDA Pratik bölümündeki vektör toplama dersinin programıdır ([CUDA Ders 08](../../cuda/Lesson-08/notes.md)).

## Sayılarla SAXPY ve İç Çarpım

SAXPY `y[i] = a * x[i] + y[i]` hesaplar. Eleman başına 2 FLOP (bir FMA) yapar ve 12 bayt taşır, çünkü `x[i]` ve `y[i]` okur, `y[i]` yazar. Aritmetik yoğunluğu 2 / 12 ≈ 0,167 FLOP/bayttır, yani L40S'te 0,167 × 864 ≈ 144 GFLOPS ulaşılabilir.

İç çarpım iki dizi üzerinde `s += x[i] * y[i]` hesaplar. Eleman başına 2 FLOP yapar ve 8 bayt okur, eleman başına hiçbir şey yazmaz. Aritmetik yoğunluğu 2 / 8 = 0,25 FLOP/bayttır, yani L40S'te 0,25 × 864 = 216 GFLOPS ulaşılabilir.

İkisi de vektör toplamadan biraz iyidir ama ikisi de 106 olan kırılma noktasının çok altındadır. Bellek sınırlıdırlar. Hesabı hızlandırmak sürelerini hiç değiştirmez.

## Sayılarla Matris Çarpımı

İki N × N matrisin matris çarpımı `C = A × B` farklıdır. C'nin her elemanı N çarpımın toplamıdır, yani N çarpma ve N toplama ister.

- FLOP sayısı N × N eleman × 2N = 2N³.
- Her matris bellekten yalnızca bir kez geçerse A ve B okunur, C yazılır, yani bayt sayısı 3 × N² float × 4 bayt = 12N².
- Aritmetik yoğunluk 2N³ / 12N² = N / 6.

Yoğunluk N ile büyür, çünkü okunan her sayı N kez kullanılır. N = 4.096 için sayılar şöyle.

- FLOP sayısı 2 × 4.096³ = 137.438.953.472 (yaklaşık 137 milyar).
- Bayt sayısı 12 × 4.096² = 201.326.592 (yaklaşık 201 MB).
- Aritmetik yoğunluk 4.096 / 6 ≈ 683 FLOP/bayt.

683, 106'nın çok üstündedir, bu yüzden L40S'te bu matris çarpımı hesap sınırlıdır. Hesap süresi 137,4 milyar / 91,6 trilyon ≈ 1,5 ms, veri süresi 201 MB / 864 GB/s ≈ 0,23 ms. N = 256 için yoğunluk yalnızca 256 / 6 ≈ 43'tür, yani L40S'te bellek sınırlı (kırılma 106), H100'de ise hesap sınırlı (kırılma 20).

> [!WARNING]
> N / 6, her matrisin bellekten bir kez geçtiği en iyi durumdur. Basit bir kernel aynı satır ve sütunları tekrar tekrar okur ve çok daha fazla bayt taşır, bu da gerçek yoğunluğunu düşürür. Veriyi çip üstü bellekten, örneğin paylaşımlı bellek ve önbelleklerden ([Ders 07](../Lesson-07/notes.md)) yeniden kullanmak, gerçek bir kernel'in N / 6'ya yaklaşmasını sağlar.

## Sonuç Ne Anlama Geliyor

Cevap, emeğini nereye harcaman gerektiğini söyler.

- Bellek sınırlı bir kernel'de veri taşımayı iyileştir. Her baytı bir kez oku, büyük ve hizalı parçalar halinde, birleşik erişimle oku, tekrar kullanılan veriyi paylaşımlı bellekte ya da register'larda tut, daha az bayt taşınsın diye daha küçük sayı formatları kullan ve kernel'leri birleştir ki ara veri dışarı yazılıp geri okunmasın.
- Hesap sınırlı bir kernel'de hesabı iyileştir. Tensor Core'ları kullan, doğruluk izin verdiğinde daha ucuz formatlar seç ve gerekmeyen işi kaldır.

Yanlış tarafı iyileştirmek hiçbir şey kazandırmaz. Vektör toplamanın hesabını iki kat hızlandırsan da süresi yaklaşık 1,39 ms kalır, çünkü sınır hiçbir zaman hesap değildi.

## Tensor Core'larla Daha Yüksek Bir Tavan

Yukarıdaki tavanlar sıradan çekirdeklerdeki FP32 içindir. Tensor Core'lar matris hesabı için çok daha yüksek bir hesap tavanı verir. L40S, Tensor Core'larında seyreklik olmadan FP16 ile 362 TFLOPS'a ulaşır, FP32 tepe değerinin yaklaşık 4 katı. Bant genişliği yine 864 GB/s olduğundan kırılma noktası yaklaşık 362.000 / 864 ≈ 419 FLOP/bayt'a çıkar.

Daha yüksek bir tavan yalnızca hesap sınırlı kernel'lere yardım eder. Vektör toplama, tavan ne olursa olsun 72 GFLOPS'ta kalır. [Ders 10](../Lesson-10/notes.md) sayı formatlarını ve Tensor Core'ları anlatıyor.

## Bunun CUDA İçin Önemi

Bir kernel'i ayarlamadan önce FLOP'larını ve baytlarını say. Tek satırlık bir hesap, bellek erişimi üzerinde mi yoksa hesap üzerinde mi çalışman gerektiğini ve kernel'in bu GPU'nun yapabileceğinin en iyisinden ne kadar uzak olduğunu söyler.

İlk yazdığın basit kernel'lerin çoğu, örneğin vektör toplama, ölçekleme, kopyalama ve indirgeme, bellek sınırlıdır. Bunlarda hedef TFLOPS değil, bellek bant genişliğine ulaşmaktır. 1,2 GB'ını 864 GB/s'ye yakın bir hızla taşıyan bir vektör toplama, tepe FLOPS'un %0,1'inden azını kullansa bile çok iyi bir kernel'dir.

## Sözlük

- GPU (Graphics Processing Unit): bu derslerin konusu olan, paralel çalışan çok sayıda çekirdekten oluşan işlemci.
- kernel: GPU'da çalışan, her thread için bir kopyası olan fonksiyon.
- warp: birlikte çalışan 32 thread'lik grup. Bazı warp'lar veri beklerken diğerleri hesap yapar.
- bellek sınırlı (memory bound): süresini hesabın değil veri taşımanın belirlediği kernel. Roofline'ın eğik kısmında durur.
- hesap sınırlı (compute bound): süresini veri taşımanın değil hesabın belirlediği kernel. Roofline'ın düz kısmında durur.
- FLOP (floating-point operation): kayan noktalı sayılar üzerinde bir toplama, çıkarma, çarpma ya da bölme. Küçük s ile yazılan FLOPs bunların sayısıdır.
- FLOPS (floating-point operations per second): bir hız. GFLOPS saniyede milyar, TFLOPS saniyede trilyon FLOP demektir.
- FMA (fused multiply-add): a × b + c hesaplayan ve 2 FLOP sayılan tek komut.
- FP32 (32-bit floating point): GPU hesabının standart sayı formatı, bir `float` 4 bayttır.
- tepe FLOPS (peak FLOPS): çekirdek × saat hızı × 2, L40S için FP32'de 91,6 TFLOPS.
- taşınan bayt (bytes moved): GPU belleği ile çip arasında gidip gelen baytlar, her okuma ve her yazma sayılır.
- bellek bant genişliği (memory bandwidth): belleğin saniyede kaç bayt verebildiği, L40S'te 864 GB/s.
- GB/s (gigabytes per second): saniyede taşınan milyar bayt, bellek bant genişliğinin birimi.
- GDDR6 (Graphics Double Data Rate 6): L40S'teki bellek türü, H100 gibi veri merkezi GPU'larındaki HBM'den (High Bandwidth Memory) yavaştır.
- aritmetik yoğunluk (arithmetic intensity): FLOP sayısının taşınan bayta bölümü, FLOP/bayt cinsinden. GPU'ya değil kernel'e bağlıdır.
- kırılma noktası (ridge point): tepe FLOPS'un bellek bant genişliğine bölümü, L40S'te yaklaşık 106 FLOP/bayt, H100 SXM'de 20.
- roofline modeli (roofline model): ulaşılabilir FLOPS'u aritmetik yoğunluğa karşı çizen, eğik bir bellek tavanı ve düz bir hesap tavanı olan log-log grafik.
- ulaşılabilir GFLOPS (attainable GFLOPS): bir kernel'in en fazla ulaşabileceği değer, min(tepe, yoğunluk × bant genişliği).
- vektör toplama (vector add): `c[i] = a[i] + b[i]`, 12 bayt başına 1 FLOP.
- SAXPY (Single-precision A times X Plus Y): `y[i] = a * x[i] + y[i]`, 12 bayt başına 2 FLOP.
- iç çarpım (dot product): iki dizi üzerinde `x[i] * y[i]` toplamı, 8 bayt başına 2 FLOP.
- matris çarpımı (matrix multiply): `C = A × B`, N × N FP32 matrisler için en az 12N² bayt üzerinden 2N³ FLOP, yani yoğunluk N / 6.
- paylaşımlı bellek (shared memory): bir block'un thread'lerinin paylaştığı hızlı çip üstü bellek. Kernel'in veriyi tekrar okumadan yeniden kullanmasını sağlar.
- birleşik erişim (coalesced access): komşu thread'lerin komşu adresleri okuması, böylece bellek onlara birkaç büyük aktarımla hizmet eder.
- indirgeme (reduction): toplam ya da en büyük değer gibi, birçok değeri tek bir değere indirmek.
- Tensor Core: matris hesabı için yapılmış, tavanı çok daha yüksek birimler, L40S'te seyreklik olmadan FP16'da 362 TFLOPS.
- FP16 (16-bit floating point): 2 baytlık sayı formatı. Tensor Core'lar onu FP32 çekirdeklerin FP32'yi çalıştırdığından çok daha hızlı çalıştırır.
- seyreklik (sparsity): Tensor Core'ların sabit bir desende sıfırları atlaması. Özellik sayfaları çoğu zaman bununla verilen, yoğun değerin iki katı olan sayıları gösterir.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın kendi GPU'larında çalışan programlar yazmak için platformu.
