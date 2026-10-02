# 05 > Compute Capability

Bu derste compute capability'nin ne olduğunu, numaralarının nasıl işlediğini ve hangi özellikleri, hangi CUDA araç seti sürümlerini kullanabileceğini nasıl belirlediğini göreceksin. Dersin sonunda herhangi bir GPU'ya bakıp neyi desteklediğini söyleyebileceksin.

## Compute Capability Nedir

Compute capability, kısaca CC, NVIDIA'nın bir GPU'nun özelliklerini tanımlamak için kullandığı sistemdir. Yazılımın değil, donanımın sürüm numarasıdır.

Bir pazarlama puanı ya da benchmark değildir. Bir GPU mimarisinin tam olarak neyi yapıp neyi yapamadığını söyler. Onu tek bir sayıya sığmış bir özellik tablosu gibi düşün.

## Numaralandırma Nasıl Çalışır

Compute capability, 7.5, 8.9 ya da 12.0 gibi bir sürüm numarasıdır. Kural bütün nesiller için aynıdır:

- Noktadan önceki sayı büyük bir mimari değişikliği gösterir
- Noktadan sonraki sayı küçük iyileştirmeleri ya da eklemeleri gösterir

Yani 7.x'ten 8.x'e geçmek sadece bir hız artışı değildir. Yeni donanım birimleri ve yeni yetenekleri olan farklı bir mimari demektir. Somut bir örnek: RTX 4090 CC 8.9, A100 ise CC 8.0'dır. İkisi de 8.x ailesindendir, yani temel tasarımı paylaşırlar; ama 8.9, A100'de olmayan özellikler ekler, örneğin FP8 Tensor Core'ları.

> [!TIP]
> Makinendeki GPU'nun CC değerini görmek için `nvidia-smi --query-gpu=name,compute_cap --format=csv` komutunu çalıştır. NVIDIA'nın "CUDA GPUs" web sayfası her kartın CC değerini listeler.

## Mimariler

### Volta → CC 7.0

Volta, Tensor Core'ları getirdi. Bunlar yapay zekâda ve derin öğrenmede kullanılan matris işlemlerini hızlandıran özel birimlerdir. Volta'dan önce bu işlemler genel amaçlı CUDA çekirdeklerinde çalışıyordu. Volta'dan sonra kendilerine ayrılmış bir donanımları oldu.

### Turing ve Ampere → CC 7.5 ve 8.x

Turing (CC 7.5, RTX 20 serisi), Tensor Core'ları tüketici kartlarına taşıdı. Ampere (A100 için CC 8.0, RTX 30 serisi için 8.6) daha güçlü ve verimli Tensor Core'lar, daha yüksek bellek bant genişliği ve daha iyi enerji verimliliği getirdi. Ada Lovelace (CC 8.9, RTX 40 serisi ve L40S) ise FP8 desteği ekledi.

### Hopper → CC 9.0

Hopper (H100 ve H200) bir başka büyük adımdı. Çok büyük yapay zekâ modelleri için yeni yürütme modelleri getirdi ve yapay zekâ performansını ileri taşıdı.

### Blackwell → CC 10.x, 11.0 ve 12.x

Blackwell, 2026'da sevkiyatı yapılan ana nesildir. 5. nesil Tensor Core'lara ve NVFP4 adlı yeni bir duyarlık biçimine sahiptir. NVFP4, büyük model çıkarımında FP8'e göre işlem hacmini iki katına çıkarır. FP4 hızlandırması önceki mimarilerde yoktur.

Blackwell, her çip ailesi için bir tane olmak üzere birkaç farklı compute capability ile gelir:

| CC | Ürünler |
|---|---|
| 10.0 | B200, GB200 (veri merkezi) |
| 10.3 | B300, GB300 (Blackwell Ultra, veri merkezi) |
| 11.0 | Jetson Thor (robotik) |
| 12.0 | GeForce RTX 50 serisi, RTX PRO Blackwell |
| 12.1 | GB10 (DGX Spark masaüstü) |

> [!NOTE]
> Bir sonraki mimari olan Rubin, CC 10.7'dir. B200 ve B300 ile aynı 10.x ailesine aittir. İlk Vera Rubin NVL72 rack'lerinin sevkiyatı Eylül 2026'da başladı.

## Özellik Desteği

Resmî CUDA dokümantasyonunda özellikleri compute capability sürümleriyle eşleştiren tablolar vardır. Bu tablolarda net örüntüler görülür:

- CC 5.0'daki GPU'lar FP16 işlemlerini desteklemez
- Tensor Core'lar sadece CC 7.0'dan itibaren vardır
- FP8 Tensor Core'lar CC 8.9 (Ada Lovelace) ve 9.0 (Hopper) ile gelir
- NVFP4, CC 10.0 ya da üstünü gerektirir

Eksik bir donanım özelliği sonradan eklenemez. GPU'nda Tensor Core yoksa onları kullanamazsın. Yazılım bazen eksik bir birimi emülasyonla taklit edebilir, ama bu çok daha yavaştır ve çoğu Tensor Core özelliği için böyle bir yol yoktur. Donanımda ya o birim vardır ya da yoktur.

Bu yüzden performansa duyarlı CUDA kodu yazmadan önce "GPU'm ihtiyacım olanı destekliyor mu?" diye sor. Bu soru, "GPU'm yeterince hızlı mı?" sorusundan önce gelir.

## Yazılım Uyumluluğu

Compute capability, hangi CUDA araç seti sürümlerini kullanabileceğini de belirler. Yeni bir mimari, onu tanıyan bir araç setine ihtiyaç duyar; eski mimariler de birkaç yıl sonra yeni araç setlerinden çıkarılır.

Bazı örnekler:

- Hopper (CC 9.0): CUDA 11.8 ya da üstünü gerektirir
- Blackwell (CC 10.0 ve 12.0): yerel cubin desteği için CUDA 12.8 ya da üstünü gerektirir
- Blackwell Ultra (CC 10.3): CUDA 12.9 ya da üstünü gerektirir
- Rubin (CC 10.7): CUDA 13.4'te destekleniyor
- Maxwell, Pascal ve Volta (CC 5.x ile 7.0 arası): CUDA 13 bunları hiç desteklemez; onlar için son araç setleri CUDA 12.x'tir

> [!WARNING]
> CUDA 13 (güncel ana sürüm, Eylül 2026 itibarıyla 13.4) sadece CC 7.5 (Turing) ve üstünü destekler. GTX 1080 (CC 6.1) gibi bir Pascal kartında CUDA 12.x'te kalman gerekir.

Mimarin için gereken en düşük sürümün altındaki ya da mimarini artık desteklemeyen bir araç seti kesin bir hata verir. Kod ya derlenmez ya da çalışma zamanında hata verir.

İş akışı hep aynıdır:

1. GPU'nun compute capability değerini bul.
2. CUDA sürümünü seç.
3. Kodunu yaz.

<cc-explorer></cc-explorer>

## Alt Seviye Katman

CUDA kodu doğrudan GPU'da çalışmaz. Önce PTX'e derlenir. PTX, NVIDIA GPU'ları için bir assembly dili gibi düşük seviyeli bir ara dildir.

Bazı PTX komutları, sadece belirli bir compute capability'den itibaren var olan donanım birimlerine ihtiyaç duyar. Warp shuffle fonksiyonları buna bir örnektir.

> [!NOTE]
> Warp shuffle fonksiyonları, bir warp'taki thread'lerin paylaşımlı bellek ya da global bellek kullanmadan veri paylaşmasını sağlar. Warp shuffle, CC 3.0'dan (Kepler) beri vardır.

GPU'n en düşük sürümün altındaysa bu komutlar çalışamaz. Onlar için gereken donanım çipte yoktur.

## Özet

Aynı kural makine öğrenmesi hatlarında, fizik simülasyonlarında ve özel CUDA kernel'larında da geçerlidir. GPU'nun compute capability değeri, donanımın ile kodun arasındaki sözleşmedir.

CC numaranı bil. Onu CUDA dokümantasyonuyla karşılaştır. Doğru araç seti sürümünü seç. Sonra derle. Performans ayarı, optimizasyon ve özellik seçimi hep buradan başlar.

> Compute capability sadece bir sürüm numarası değildir. GPU'nun gerçekte neler yapabildiğinin tanımıdır.

## Sözlük

- compute capability (CC): NVIDIA'nın, bir GPU mimarisinin neyi yapıp neyi yapamadığını söyleyen sürüm numarası.
- GPU (Graphics Processing Unit): çok sayıda basit işi paralel çalıştırmak için tasarlanmış işlemci.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform.
- benchmark: hızı ölçen bir test programı; compute capability bir hız puanı değildir.
- mimari: bir GPU ailesinin donanım tasarımı; her mimari kendi ana CC numarasını alır.
- noktadan önceki sayı (ana numara): büyük bir mimari değişikliği gösterir; Ampere için 8, Hopper için 9 gibi.
- noktadan sonraki sayı (alt numara): küçük iyileştirmeleri ya da eklemeleri gösterir; 8.x ailesinde 8.6 ya da 8.9 gibi.
- `nvidia-smi`: NVIDIA'nın komut satırı aracı; `--query-gpu=compute_cap` ile her GPU'nun CC değerini yazdırır.
- Tensor Core: yapay zekâ için matris işlemlerini hızlandıran özel birimler; CC 7.0'dan itibaren vardır.
- CUDA çekirdekleri: bir NVIDIA GPU'sunun genel amaçlı aritmetik birimleri; çekirdek sayısında sayılanlar bunlardır.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitilmesi büyük ölçüde dev matris hesabıdır.
- Turing: NVIDIA'nın 2018 mimarisi (RTX 20 serisi), CC 7.5; CUDA 13'ün desteklediği en eski mimari.
- Ada Lovelace: NVIDIA'nın 2022 mimarisi (RTX 40 serisi, L40S), CC 8.9.
- Hopper: NVIDIA'nın 2022 veri merkezi mimarisi (H100, H200), CC 9.0.
- Blackwell: NVIDIA'nın 2026'daki ana mimarisi; farklı çipleri için CC 10.0, 10.3, 11.0, 12.0 ve 12.1.
- Blackwell Ultra: B300 ve GB300; veri merkezleri için geliştirilmiş Blackwell, CC 10.3.
- Rubin: Blackwell'den sonraki mimari, CC 10.7; Eylül 2026'dan beri veri merkezi rack'lerinde sevk ediliyor.
- NVFP4 (NVIDIA 4 bit kayan noktalı sayı): büyük model çıkarımında FP8'e göre işlem hacmini iki katına çıkaran Blackwell duyarlık biçimi.
- FP8 (8 bit kayan noktalı sayı): FP16'dan daha az hassas, ama onu destekleyen Tensor Core'larda iki kat hızlı bir sayı biçimi.
- çıkarım (inference): eğitilmiş bir yapay zekâ modelini cevap almak için çalıştırmak; model eğitiminin tersi.
- FP16: yarım duyarlıklı işlemler; CC 5.0'daki GPU'lar bunları desteklemez.
- emülasyon: eksik donanımı yazılımla taklit etmek; genelde çok daha yavaştır ya da hiç mümkün değildir.
- araç seti (CUDA Toolkit): nvcc derleyicisini, kütüphaneleri ve araçları içeren NVIDIA paketi; her sürüm belirli bir compute capability aralığını destekler.
- CUDA 13: güncel ana CUDA sürümü; sadece CC 7.5 ve üstünü destekler.
- Maxwell / Pascal / Volta: CUDA 13'ün artık desteklemediği 2014, 2016 ve 2017 NVIDIA mimarileri (CC 5.x ile 7.0 arası).
- cubin: tek bir compute capability için derlenmiş GPU ikili dosyası; daha yeni GPU'lar için yeniden derlenebilen PTX'in aksine.
- çalışma zamanı (runtime): programın çalıştığı an; derleme zamanının tersi.
- PTX (Parallel Thread Execution): NVIDIA GPU'ları için assembly gibi düşük seviyeli bir ara dil; CUDA kodu önce buna derlenir.
- assembly dili: bir işlemcinin çalıştırdığı temel komutların insanın okuyabileceği biçimi; her komut bir satır.
- warp shuffle: bir warp'taki thread'lerin paylaşımlı ya da global belleği kullanmadan veri paylaşmasını sağlayan fonksiyonlar.
- warp: aynı komutu birlikte çalıştıran 32 thread'lik grup.
- global bellek: GPU'nun ana belleği (VRAM); her thread görür, ama paylaşımlı bellekten çok daha yavaştır.
- kernel: GPU'da çalışan, CPU'daki koddan başlatılan fonksiyon.
