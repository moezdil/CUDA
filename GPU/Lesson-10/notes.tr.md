# 10 > Sayı Biçimleri ve Tensor Core'lar

Bir GPU'nun üzerinde çalıştığı her sayı sabit sayıda bitte saklanır. Bu ders bu bitlerin nasıl bölündüğünü gösteriyor, FP64'ten 4 bitlik NVFP4'e kadar bugün kullanılan biçimleri tek tek geziyor ve sıradan CUDA çekirdeklerinin yanında duran, daha az biti çok daha fazla hıza çeviren Tensor Core'ları anlatıyor.

## Kayan Noktalı Bir Sayı Nasıl Saklanır

Kayan noktalı bir sayı, 2 tabanında bilimsel gösterim gibi saklanır. Üç parçası vardır:

- İşaret: 1 bit, pozitif için 0, negatif için 1.
- Üs: sayının ne kadar büyük olduğunu, yani 2'nin kuvvetini söyler. Bir sapma ile saklanır, böylece negatif kuvvetler kendi işaret bitleri olmadan sığar.
- Mantis: sayının basamakları, ne kadar hassas olduğu. Normal bir sayı hep "1." ile başlar, bu yüzden o 1 saklanmaz. Buna gizli bit denir.

value = (−1)^sign × 2^(exponent − bias) × 1.mantissa

Bir örnek: 6,5'i FP32 olarak sakla. FP32'de 1 işaret biti, 8 üs biti, 23 mantis biti vardır ve sapma 127'dir.

- 6,5 ikilik tabanda 110,1'dir, yani 1,101 × 2^2.
- İşaret: pozitif, yani 0.
- Üs: 2 + 127 = 129, ikilik tabanda 10000001.
- Mantis: "1." sonrasındaki basamaklar, yani 101 ve ardından 20 sıfır.
- Saklanan bitler: `0 10000001 10100000000000000000000`. Kontrol: 2^(129 − 127) × 1,625 = 4 × 1,625 = 6,5.

6,5 tam saklanır, çünkü 0,5 2'nin bir kuvvetidir. Ondalık sayıların çoğu öyle değildir.

> [!NOTE]
> 1/3'ün tam bir ondalık karşılığı olmadığı gibi, 0,1'in de tam bir ikilik karşılığı yoktur. FP32, elindeki en yakın değeri saklar: 0,100000001490116... Her biçim yuvarlar; mantis biti azaldıkça yuvarlama hatası büyür.

## Aralık ve Hassasiyet

Bir biçimin bitleri iki iş arasında paylaşılır:

- Daha çok üs biti daha geniş aralık verir: bir sayı ne kadar büyük ve ne kadar küçük olabilir.
- Daha çok mantis biti daha yüksek hassasiyet verir: komşu sayılar birbirine ne kadar yakın.

FP16 ve BF16 ikisi de 16 bit kullanır ama bitleri farklı böler. FP16'da 5 üs biti ve 10 mantis biti vardır. En büyük değeri 65,504'tür, bu yüzden 70,000 sonsuz olur. BF16'da 8 üs biti vardır, FP32 ile aynı aralık (yaklaşık 3,4 × 10^38'e kadar), ama yalnızca 7 mantis biti. Bu yüzden 1 + 1/512 = 1,001953125 FP16'da tam saklanır, BF16 ise onu 1'e yuvarlar, çünkü 1 civarında adımları 1/128 aralıklıdır.

## Biçimler

| Biçim | Bitler (işaret / üs / mantis) | En büyük değer | Ana kullanım |
|---|---|---|---|
| FP64 | 1 / 11 / 52 | ≈ 1,8 × 10^308 | bilim, simülasyon |
| FP32 | 1 / 8 / 23 | ≈ 3,4 × 10^38 | CUDA çekirdeklerinde genel GPU hesabı |
| TF32 | 1 / 8 / 10 | ≈ 3,4 × 10^38 | Tensor Core'larda FP32 matris hesabı |
| FP16 | 1 / 5 / 10 | 65,504 | çıkarım, eski eğitim |
| BF16 | 1 / 8 / 7 | ≈ 3,4 × 10^38 | eğitim |
| FP8 E4M3 | 1 / 4 / 3 | 448 | çıkarım, eğitimin ileri geçişi |
| FP8 E5M2 | 1 / 5 / 2 | 57,344 | eğitimdeki gradyanlar |
| FP6 E2M3 / E3M2 | 1 / 2 / 3 ya da 1 / 3 / 2 | 7,5 ya da 28 | blok ölçeklemeli çıkarım |
| FP4 E2M1 | 1 / 2 / 1 | 6 | blok ölçeklemeli çıkarım |
| INT8 | 8 bitlik tam sayı | 127 (−128'den) | nicemlenmiş çıkarım |

E4M3 ve E5M2 adları sadece bitleri sayar: 4 üs biti ve 3 mantis biti, ya da 5 ve 2. TF32, mantisi 10 bite kısaltılmış FP32'dir. Hâlâ 32 bitlik bir register'da durur, ama Tensor Core onun yalnızca 19 bitini kullanır. INT8'de hiç üs yoktur: eşit aralıklı 256 tam sayı, her tensör ya da kanal için seçilen bir ölçek çarpanıyla çarpılır.

Bir biçim seç ve bir değer yaz. Hücreler işaret, üs ve mantis bitlerini, tablo da gerçekte neyin saklandığını ve yuvarlama hatasının ne kadar olduğunu gösteriyor:

<num-formats></num-formats>

Her biri nerede kullanılır:

- Bilim ve simülasyon (hava durumu, kimya, fizik) FP64 ister, çünkü küçücük hatalar milyonlarca adımda büyür.
- AI modellerinin eğitimi çoğunlukla BF16'da, giderek FP8'de yapılır; ağırlıkların ana kopyası ve toplamlar FP32'de tutulur. Eğitim aralık ister, çünkü gradyanlar çok küçük olabilir.
- Çıkarım, yani eğitilmiş bir modeli çalıştırmak, en küçük biçimlerin yeridir: FP8, INT8 ve artık FP4. Eğitilmiş bir model yuvarlamaya bir eğitim sürecinden çok daha iyi dayanır.

## Blok Ölçekleme ve NVFP4

FP4 E2M1 tek başına yalnızca 15 değer tutar: 0 ve ±0,5, ±1, ±1,5, ±2, ±3, ±4, ±6. Tek başına bu çok az. NVFP4 bunu ortak bir ölçek çarpanıyla çözer: her 16 değerlik blok tek bir FP8 E4M3 sayıyı paylaşır ve her değer "ölçek × 4 bitlik elemanı" olarak saklanır. Ölçek, bloktaki en büyük değer FP4'ün tavanı olan 6'nın yakınına düşecek şekilde seçilir; ikinci bir FP32 ölçek de bütün tensörü kapsar. Bir örnek: bir bloktaki en büyük değer 0,1 ise ölçek 0,1 / 6 ≈ 0,0167 olur, E4M3 bunu 0,017578125 olarak saklar, yani 0,1, 0,017578125 × 6 = 0,10546875 olarak saklanır. Düz FP4 0,1'i 0'a yuvarlardı. Bedeli her 16 değere 8 ek bittir: 4 + 8 / 16 = değer başına 4,5 bit. OCP'nin açık biçimi MXFP4 ise 32'lik bloklar ve 2'nin kuvveti olan bir ölçek kullanır.

## Örnek: 70 Milyar Parametreli Bir Model

Bir modelin ağırlıkları parametre sayısı × parametre başına bayt kadar yer tutar. 70 milyar parametre için:

- FP16 ya da BF16, 2 bayt: 70 × 10^9 × 2 = 140 GB.
- FP8, 1 bayt: 70 × 10^9 × 1 = 70 GB.
- FP4, yarım bayt: 70 × 10^9 × 0,5 = 35 GB. NVFP4 ölçekleriyle: 70 × 10^9 × 4,5 / 8 ≈ 39,4 GB.

L40S'te 48 GB var. FP16'da ağırlıklar en az 3 tane ister (140 / 48 ≈ 2,9). FP8'de 2 tane (70 / 48 ≈ 1,5). NVFP4'te ağırlıklar tek bir karta sığar. Ama L40S bir Ada Lovelace: FP8 Tensor Core'ları var, FP4 olanları yok. 4 bitlik ağırlıkların hesaptan önce daha geniş bir biçime çevrilmesi gerekir. B200 ya da RTX 5090 gibi bir Blackwell GPU'su FP4'ü doğrudan çarpar.

> [!WARNING]
> Bu sayılar yalnızca ağırlıklar. Modeli çalıştırmak, aktivasyonlar ve KV önbelleği için de bellek ister; bu, önceki token'ların saklanan anahtarları ve değerleridir ve batch boyutu ile istem uzunluğuyla büyür.

## Tensor Core'lar Nedir

Bir CUDA çekirdeği tek sayılar üzerinde bir FMA, yani a × b + c yapar. Bir Tensor Core ise küçük karolar üzerinde matris çarp-biriktir yapar:

D = A × B + C

A ve B, FP16 ya da FP8 gibi dar bir biçimdeki küçük matrislerdir. C ve D genelde daha geniş kalır, çoğu zaman FP32, böylece toplam hassasiyet kaybetmez. İlk Tensor Core'lar Volta'da geldi ve her biri saat başına 4 × 4 × 4'lük bir çarp-biriktir yapıyordu: 4 × 4 × 4 = 64 FMA, bir CUDA çekirdeği ise 1 yapar. CUDA'da komutu bir warp (bkz. [Ders 08](../Lesson-08/notes.md)) birlikte verir. m16n8k16 şekilli tek bir FP16 `mma` komutu 16 × 16'lık bir karoyu 16 × 8'lik bir karoyla çarpar: bütün warp için 16 × 8 × 16 = 2.048 çarp-topla.

Tensor Core'ların bu kadar iyi ölçeklenmesinin sebebi dar biçimlerdir. Daha az bitlik bir çarpıcı daha küçüktür ve daha az veri taşır, böylece aynı çipe daha çoğu sığar. L40S'te FP16'dan FP8'e geçmek tepe değerini iki katına çıkarır, aşağıdaki veri sayfası tablosunda görüldüğü gibi.

## Hangi Mimari Hangi Biçimi Ekledi

Her Tensor Core nesli yeni biçimler ekledi. CC sütunundaki hesaplama yeteneği numaraları [Ders 05](../Lesson-05/notes.md)'ten:

| Mimari | CC | Tensor Core nesli | Yeni biçimler |
|---|---|---|---|
| Volta (2017) | 7.0 | 1. | FP16 |
| Turing (2018) | 7.5 | 2. | INT8, INT4 |
| Ampere (2020) | 8.0, 8.6 | 3. | TF32, BF16, FP64, 2:4 seyreklik |
| Hopper (2022) | 9.0 | 4. | FP8 |
| Ada Lovelace (2022) | 8.9 | 4. | FP8 |
| Blackwell (2024) | 10.x, 11.0, 12.x | 5. | FP6, FP4, NVFP4, MXFP8/6/4 |

2:4 seyreklik, her 4 ağırlıklık grupta en az 2'sinin sıfır olması demektir. Tensor Core sıfırları atlar, bu yüzden bu şekilde budanmış ağırlıklarda aynı işi yarı sürede yapar.

## L40S'te Tensor Core'lar ve CUDA Çekirdekleri

NVIDIA'nın L40S veri sayfası şu tepe değerlerini verir. Yoğun normal durumdur. Seyrek olan 2:4 seyrek ağırlık ister:

| Birim ve biçim | Yoğun | Seyreklikle |
|---|---|---|
| CUDA çekirdekleri, FP32 | 91,6 TFLOPS | yok |
| Tensor Core'lar, TF32 | 183 TFLOPS | 366 TFLOPS |
| Tensor Core'lar, FP16 / BF16 | 362 TFLOPS | 733 TFLOPS |
| Tensor Core'lar, FP8 | 733 TFLOPS | 1.466 TFLOPS |
| Tensor Core'lar, INT8 | 733 TOPS | 1.466 TOPS |

Tensor Core'larda yoğun FP16, CUDA çekirdeklerinin FP32 tepe değerinin 362 / 91,6 ≈ 4 katı, yoğun FP8 ise 733 / 91,6 ≈ 8 katıdır. TFLOPS ve TOPS ikisi de tepe değerdir; TOPS tam sayı işlemlerini sayar.

> [!WARNING]
> Veri sayfaları çoğu zaman seyrek sayıyı önce, küçük bir yıldızla işaretleyerek verir. H100 SXM için FP8'de 3.958 TFLOPS yazar, bu seyreklikle; yoğunda 1.979'dur. Her zaman yoğunu yoğunla karşılaştır.

[Ders 09](../Lesson-09/notes.md)'daki roofline modelinde bunların her biri daha yüksek bir hesap tavanıdır. 864 GB/s ile FP8 tavanı kırılma noktasını bayt başına 733.000 / 864 ≈ 848 FLOP'a taşır. Az bit bellek tarafında da işe yarar: bir FP8 değeri 4 yerine 1 bayttır, yani aynı matris 4 kat daha az bayt taşır.

## Bunun CUDA İçin Önemi

- Düz C++ `float` ve `double` hesabı Tensor Core'larda değil, sıradan FP32 ve FP64 birimlerinde çalışır. Dar biçimlerin kendi tipleri vardır: `cuda_fp16.h` içinde `__half`, `cuda_bf16.h` içinde `__nv_bfloat16`, `cuda_fp8.h` içinde `__nv_fp8_e4m3`, `cuda_fp4.h` içinde `__nv_fp4_e2m1`.
- Bir kernel Tensor Core'ları `mma.h` içindeki WMMA API'siyle, PTX `mma` komutlarıyla ya da bu işi senin yerine yapan cuBLAS ve CUTLASS gibi kütüphanelerle kullanır.
- Biçim, GPU'nun hesaplama yeteneğinde bulunmalıdır. L40S'te FP8 Tensor Core komutlarını almak için `-arch=sm_89` ile derle; FP4 komutları bir Blackwell hedefi ister.
- Her zaman çarptığın biçimden daha geniş bir biçimde biriktir. Binlerce FP16 çarpımı FP16'da toplamak basamakları hızla kaybettirir.

## Özet

Kayan noktalı bir sayı bir işaret, aralık için bir üs ve hassasiyet için bir mantistir. Daha az bit daha az bellek, daha az trafik ve daha yüksek Tensor Core verimi demektir, ama yuvarlama hataları büyür. FP64 bilime, BF16 ve FP8 eğitime, FP8, INT8 ve NVFP4 çıkarıma hizmet eder; blok ölçekleme 4 biti kullanılabilir yapar. Tensor Core'lar küçük karolar üzerinde D = A × B + C hesaplar ve Volta'dan beri her nesil daha dar biçimler ekledi.

## Sözlük

- GPU (Graphics Processing Unit): bu derslerin konusu olan, paralel çalışan çok sayıda çekirdekten oluşan işlemci.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın kendi GPU'larında çalışan programlar yazmak için platformu.
- kayan noktalı sayı / kayan nokta (floating-point number): 2 tabanında bilimsel gösterim gibi işaret, üs ve mantis olarak saklanan sayı.
- işaret (sign): sayının pozitif (0) mi negatif (1) mi olduğunu söyleyen bit.
- üs (exponent): 2'nin kuvvetini, dolayısıyla biçimin aralığını tutan bitler.
- sapma (bias): negatif kuvvetler işaretsiz saklanabilsin diye üsse eklenen sabit sayı; FP32'de 127, FP16'da 15.
- mantis (mantissa): sayının basamaklarını, dolayısıyla hassasiyetini tutan bitler.
- gizli bit (hidden bit): normal bir sayının baştaki 1'i; saklanmaz.
- aralık (range): bir biçimdeki sayıların ne kadar büyük ve ne kadar küçük olabildiği.
- hassasiyet (precision): bir biçimde komşu sayıların birbirine ne kadar yakın olduğu; mantis bitleri belirler.
- FP64 / FP32 / FP16 (64-, 32- and 16-bit floating point): 64 bit, 32 bit ve 16 bit kayan nokta biçimleri.
- BF16 (bfloat16, brain floating point): FP32'nin aralığına ve 7 mantis bitine sahip 16 bitlik biçim.
- TF32 (TensorFloat-32): 10 bit mantisli FP32; Ampere'den beri Tensor Core'lar FP32 matris hesabı için kullanır.
- FP8 / E4M3 / E5M2: 8 bit kayan nokta; E4M3'te 4 üs ve 3 mantis biti, E5M2'de 5 ve 2 vardır.
- FP6 / FP4 (6-bit / 4-bit floating point): Blackwell'de blok ölçeklemeyle kullanılan 6 bit ve 4 bit kayan nokta.
- NVFP4 (NVIDIA 4-bit floating point): 16'lık blok başına bir FP8 E4M3 ölçek ve tensör başına bir FP32 ölçek kullanan FP4 E2M1 değerleri.
- MXFP4 (microscaling FP4): OCP'nin (Open Compute Project) 32'lik bloklu ve 2'nin kuvveti ölçekli açık 4 bitlik biçimi.
- OCP (Open Compute Project): MX biçimleri dahil açık donanım standartları yayımlayan bir sektör grubu.
- blok ölçekleme / ölçek (block scaling / scale factor): bir blok değerin paylaştığı ve bloktaki her değerin çarpıldığı tek sayı.
- INT8 (8-bit integer): −128 ile 127 arasındaki tam sayılar; çıkarımda bir ölçekle kullanılır.
- AI (artificial intelligence): yapay zekâ; dil modelleri gibi veriden öğrenen yazılımlar.
- eğitim (training): bir AI modelini veriden, ağırlıklarını gradyanlarla ayarlayarak öğretmek.
- çıkarım (inference): eğitilmiş bir modeli cevap almak için çalıştırmak.
- parametre / ağırlık (parameter / weights): bir modelin öğrendiği sayılar; sayıları çarpı sayı başına bayt, tuttukları belleği verir.
- KV önbelleği (key-value cache): bir dil modelinin çıkarım sırasında bellekte tuttuğu, önceki token'ların anahtarları ve değerleri.
- Tensor Core: küçük matris karoları üzerinde tek komutla D = A × B + C hesaplayan birim.
- CUDA çekirdeği (CUDA core): saat başına bir FP32 FMA yapan sıradan GPU çekirdeği.
- FMA (fused multiply-add): a × b + c hesaplayan tek komut.
- warp: komutları birlikte veren 32 thread; bir Tensor Core komutunu bütün warp verir.
- 2:4 seyreklik (2:4 sparsity): her 4'lük grupta en az 2 sıfır olan ağırlıklar; Tensor Core'lar bunları atlayarak verimi 2 katına kadar çıkarır.
- yoğun / seyrek (dense / sparse): seyreklik olmadan tepe değer, ya da 2:4 seyrek ağırlık isteyen iki katlı tepe değer.
- FLOP (floating-point operation): kayan noktalı sayılar üzerinde bir toplama, çıkarma, çarpma ya da bölme.
- TFLOPS / TOPS (tera floating-point operations per second / tera operations per second): saniyede trilyon kayan nokta işlemi ya da tam sayı işlemi.
- hesaplama yeteneği (compute capability, CC): NVIDIA'nın bir GPU donanımının neyi desteklediğini gösteren sürüm numarası.
- kırılma noktası (ridge point): tepe FLOPS bölü bellek bant genişliği; aritmetik yoğunluğu bunun altında kalan kernel'ler bellek sınırlıdır.
- WMMA (Warp Matrix Multiply-Accumulate): kernel içinden Tensor Core kullanmak için `mma.h` içindeki CUDA C++ API'si.
- PTX (Parallel Thread Execution): CUDA kodunun derlendiği NVIDIA'nın alt seviye ara dili.
