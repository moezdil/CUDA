# Compute Capability

Bu ders compute capability'yi (hesaplama yeteneği), sayılarının nasıl çalıştığını ve hangi özellikleri ve hangi CUDA toolkit sürümlerini kullanabileceğini nasıl belirlediğini anlatıyor.

## Compute Capability Nedir

Compute capability (CC), NVIDIA'nın bir GPU'nun özelliklerini ve işlem gücünü tarif etmek için kullandığı sistemdir. Bazen sürüm numarası olarak da anılır.

Bir pazarlama puanı ya da benchmark değildir. Bir GPU mimarisinin tam olarak neyi yapıp neyi yapamadığını söyler. Onu tek bir sayıya sığmış bir özellik sayfası gibi düşün.

## Numaralandırma Nasıl Çalışır

Compute capability, 3.0, 5.1 ya da 7.5 gibi bir sürüm numarasıdır. Kural tüm nesiller için aynıdır:

- Noktadan önceki sayı büyük bir mimari değişikliği gösterir
- Noktadan sonraki sayı küçük iyileştirmeleri ya da eklemeleri temsil eder

Yani 7.x'ten 8.x'e geçmek sadece küçük bir hız artışı değildir. Yeni donanım birimleri ve yeni yetenekleri olan farklı bir mimari demektir.

## Mimariler

### Volta → CC 7.x

Volta, Tensor Core'ları getirdi. Bunlar, yapay zekâda ve derin öğrenmede kullanılan matris işlemlerini hızlandıran özel birimlerdir. Volta'dan önce bu işlemler genel amaçlı CUDA core'larında çalışıyordu. Volta'dan sonra kendilerine ayrılmış donanımları oldu.

### Ampere → CC 8.x

Ampere daha güçlü ve verimli Tensor Core'lar, daha yüksek bellek bant genişliği ve daha iyi enerji verimliliği getirdi. Volta'daki fikirleri geliştirip genişletti.

### Hopper → CC 9.x

Hopper bir başka büyük adımdı. Yeni yürütme modelleri getirdi ve yapay zekâ performansını ileri taşıdı.

> [!WARNING]
> Hopper için CUDA toolkit 11.8 ya da üstü gerekir. Daha düşük bir sürüm uyumluluk hatası verir.

### Blackwell → CC 10.0 (B200/GB200) ve 12.0 (RTX PRO / RTX 50 serisi)

2026 itibarıyla güncel nesil Blackwell. 5. nesil Tensor Core'ları ve NVFP4 adında yeni bir duyarlılık (precision) formatı var. NVFP4, büyük model çıkarımında (inference) FP8'e göre throughput'u iki katına çıkarır. FP4 hızlandırması daha eski mimarilerde yok. Blackwell için doğrudan (native) derleme yapmak istiyorsan CUDA Toolkit 12.8 gerekir.

## Özellik Desteği

Resmî CUDA belgelerinde özellikleri compute capability sürümleriyle eşleyen tablolar var. Bu tablolar net örüntüler gösteriyor:

- CC 5.0'daki GPU'lar yarım duyarlıklı (FP16) işlemleri desteklemez
- Tensor Core'lar ancak CC 7.x ve sonrasında ortaya çıkar
- FP8 Tensor Core'lar CC 8.9 (Ada Lovelace) ve 9.0 (Hopper) ile geldi
- NVFP4 için CC 10.0 ya da üstü gerekir

Eksik bir özellik tamamen eksiktir, çünkü özellikler donanım birimleridir. GPU'nda Tensor Core yoksa onları kullanamazsın. Yazılımla bir çözüm yolu da, emülasyon da yok. Donanımda o birim ya vardır ya yoktur.

Yani performansa duyarlı CUDA kodu yazmadan önce "GPU'm ihtiyacım olanı destekliyor mu?" diye sor. Bu soru "GPU'm yeterince hızlı mı?" sorusundan önce gelir.

## Yazılım Uyumluluğu

Compute capability, hangi CUDA toolkit sürümlerini kullanabileceğini de belirler. Daha yüksek compute capability daha yeni toolkit'lere izin verir. Daha yeni toolkit'ler de daha fazla özellik ve daha iyi optimizasyon getirir.

Bazı örnekler:

- Maxwell (CC 5.x) - CUDA 6.5 ya da üstü gerekir
- Hopper (CC 9.x) - CUDA 11.8 ya da üstü gerekir
- Blackwell (CC 10.0) - doğrudan cubin desteği için CUDA 12.8 gerekir

Mimarinin gerektirdiği en düşük sürümün altındaki bir toolkit kesin bir hata verir. Kod derlenmez ya da çalışırken hata verir.

İş akışı her zaman aynıdır:

1. GPU'nun compute capability değerini bul.
2. CUDA sürümünü seç.
3. Kodunu yaz.

<cc-explorer></cc-explorer>

## Alt Seviye Katman (PTX)

CUDA kodu doğrudan GPU üzerinde çalışmaz. Önce PTX'e derlenir. PTX, alt seviye bir ara dildir, NVIDIA GPU'ları için bir assembly diline benzer.

Bazı PTX komutları, ancak belirli bir compute capability ve sonrasında bulunan donanım birimlerine ihtiyaç duyar. Warp shuffle fonksiyonları buna bir örnek.

> [!NOTE]
> Warp shuffle fonksiyonları, bir warp'taki thread'lerin paylaşımlı ya da global bellek kullanmadan veri paylaşmasını sağlar. Warp shuffle, CC 3.0'dan (Kepler) beri var.

GPU'n gereken en düşük seviyenin altındaysa bu komutlar çalışamaz. Onlar için gereken donanım çipte yoktur.

## Özet

Aynı kural makine öğrenmesi hatlarında (pipeline), fizik simülasyonlarında ve özel CUDA kernel'larında da geçerli. GPU'nun compute capability değeri, donanımın ile kodun arasındaki sözleşmedir.

CC numaranı bil. Onu CUDA belgeleriyle karşılaştır. Doğru toolkit sürümünü seç. Sonra geliştir. Performans ayarı, optimizasyon ve özellik seçimi hep buradan başlar.

> Compute capability sadece bir sürüm numarası değildir. GPU'nun gerçekte neler yapabildiğinin tanımıdır.

## Sözlük

- compute capability (CC): NVIDIA'nın, bir GPU mimarisinin neyi yapıp neyi yapamadığını söyleyen sürüm numarası.
- benchmark: hızı ölçen bir test programı; compute capability bir hız puanı değildir.
- mimari (architecture): bir GPU ailesinin donanım tasarımı; her mimarinin kendi büyük CC numarası vardır.
- noktadan önceki sayı (major number): büyük bir mimari değişikliği gösterir, örneğin Ampere için 8, Hopper için 9.
- noktadan sonraki sayı (minor number): küçük iyileştirmeleri ya da eklemeleri temsil eder, örneğin 8.x ailesinde 8.6 ya da 8.9.
- Tensor Core'lar: yapay zekâ için matris işlemlerini hızlandıran özel birimler. CC 7.x ve sonrasında ortaya çıkar.
- CUDA core: bir NVIDIA GPU'sundaki genel amaçlı aritmetik birimler, çekirdek sayısında sayılanlar bunlardır.
- toolkit (CUDA Toolkit): NVIDIA'nın nvcc derleyicisini, kütüphaneleri ve araçları içeren paketi; her sürüm belli bir compute capability aralığını destekler.
- Hopper: Nvidia'nın 2022 veri merkezi mimarisi (H100), CC 9.0.
- Blackwell: Nvidia'nın güncel mimarisi, B200 gibi veri merkezi çiplerinde CC 10.0, RTX 50 serisi kartlarda 12.0.
- NVFP4: büyük model çıkarımında FP8'e göre throughput'u iki katına çıkaran bir Blackwell duyarlılık formatı.
- FP8: 8 bitlik kayan noktalı sayı formatı; FP16'dan daha az hassas ama onu destekleyen Tensor Core'larda iki kat hızlı.
- çıkarım (inference): eğitilmiş bir yapay zekâ modelini eğitmek yerine ondan cevap almak için çalıştırmak.
- FP16: yarım duyarlıklı işlemler. CC 5.0'daki GPU'lar bunları desteklemez.
- emülasyon (emulation): eksik donanımı yazılımla taklit etmek, genelde çok daha yavaştır ya da hiç mümkün değildir.
- Maxwell: Nvidia'nın 2014 mimarisi, CC 5.x.
- cubin: belirli bir compute capability için derlenmiş GPU ikili dosyası; PTX ise daha yeni GPU'lar için yeniden derlenebilir.
- çalışırken (runtime): programın çalıştığı an, derleme zamanının karşıtı.
- PTX: alt seviye bir ara dil, NVIDIA GPU'ları için assembly gibi. CUDA kodu önce buna derlenir.
- assembly dili (assembly language): işlemcinin çalıştırdığı temel komutların okunabilir hâli, her satırda bir komut.
- warp shuffle: bir warp'taki thread'lerin paylaşımlı ya da global belleği kullanmadan veri paylaşmasını sağlayan fonksiyonlar.
- warp: aynı komutu birlikte çalıştıran 32 thread'lik grup.
- global bellek (global memory): GPU'nun ana belleği (VRAM), her thread erişebilir ama paylaşımlı bellekten çok daha yavaştır.
- kernel: GPU üzerinde çalışan, CPU'daki koddan başlatılan fonksiyon.
