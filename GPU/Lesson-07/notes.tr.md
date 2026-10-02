# Bellek Bant Genişliği, Çekirdekler ve Saat Hızı

Bu ders, bir GPU'yu neyin hızlı yaptığını anlatıyor. Bellek bant genişliğini, çekirdek sayısını, saat hızını, enerjiyi ve özel donanımı ele alıyor.

## Bellek Bant Genişliği

GPU'nun üzerinde çalışacağı veriye ihtiyacı var ve bu veri bellekten gelir. Bellek bant genişliği (memory bandwidth), her saniye bellek ile GPU arasında ne kadar veri taşınabildiğidir, genelde GB/s ile verilir.

## Küçük Bir Örnek

4 çekirdekli bir GPU düşün. Her çekirdeğin başlamadan önce veriye ihtiyacı var.

Belleğin aynı anda sadece bir çekirdeğe veri gönderebildiğini varsay. İlk çekirdek çalışmaya başlar, diğer üçü bekler. Sonra ikinci çekirdek veriyi alır, sonra üçüncü, sonra dördüncü. Yani 4 çekirdekten aynı anda sadece biri çalışır. GPU verimli kullanılmaz.

Şimdi belleğin 4 çekirdeğin hepsine aynı anda veri gönderebildiğini varsay. Tüm çekirdekler birlikte başlar ve paralel çalışır. Hiçbir şey beklemez.

GPU ancak veriyi yeterince hızlı alırsa hızlıdır. Yoksa bekler. Buna "bellek darboğazı" (memory bottleneck) denir.

<bandwidth-sim></bandwidth-sim>

## Tüketici GPU'ları ve Veri Merkezi GPU'ları

İki tür modern GPU var:

- RTX kartları gibi tüketici GPU'ları, oyun ve genel kullanım için yapılır.
- H100 ya da daha yeni Blackwell tabanlı GPU'lar gibi veri merkezi GPU'ları, yapay zekâ ve büyük ölçekli hesaplama için yapılır.

İki türde de çok sayıda çekirdek olabilir, bazen mimarileri de benzerdir. Büyük fark bellektedir.

Veri merkezi GPU'ları "HBM bellek" kullanır. HBM son derece hızlıdır ve GPU çipine çok yakın durur. Çok büyük miktarda veriyi çok hızlı iletebilir.

> [!NOTE]
> HBM'nin HBM3 ve HBM3e gibi sürümleri var, HBM4 de yakında geliyor.

Tüketici GPU'ları genelde GDDR6 ya da GDDR6X bellek kullanır. Bu da hızlıdır ama HBM kadar değil.

İki GPU kâğıt üzerinde birbirine benzeyebilir. Bellek bant genişliği yüksek olan, çekirdeklerini meşgul tutar. Diğeri veri bekleyebilir. Veri merkezi GPU'larının yapay zekâ iş yüklerinde bu kadar güçlü olmasının ana nedenlerinden biri budur.

## Bellek Bant Genişliğini Ne Etkiler

Bellek bant genişliğini üç ana etken etkiler:

- Veri yolu genişliği (bus width) bir yolun genişliği gibidir. Daha geniş bir yol aynı anda daha fazla veri taşır.
- Bellek hızı, yoldaki hız sınırı gibidir. Trafik yavaşsa geniş bir yol bile gecikmeye yol açar.
- Bellek teknolojisi, modern GPU'ların en çok ayrıştığı yerdir. HBM sadece veri için yapılmış yüksek hızlı bir otoban gibidir. GDDR ise daha genel amaçlıdır.

<bandwidth-calc></bandwidth-calc>

GPU performansı sadece çekirdeklerle ilgili değildir. Çekirdeklerin veriyi ne kadar hızlı aldığıyla da ilgilidir. En güçlü GPU bile belleği beklerse zayıflar.

## Daha Fazla Çekirdek Her Zaman Daha Hızlı Değildir

Veri gelince GPU onu işlemek zorundadır. Her çekirdek komut çalıştırır. Daha fazla çekirdeğin daha iyi performans demek olduğunu düşünmek doğal gelir, ama bu her zaman doğru değildir.

İki GPU düşün. Birincisinde 100 çekirdek var. İkincisinde 200 çekirdek var. İkisi de 200 işlemlik aynı görevi çalıştırıyor.

- Birinci GPU aynı anda 100 işlem yapar, bu yüzden iki tura ihtiyacı var.
- İkinci GPU 200 işlemin hepsini tek turda yapar.

Şimdi tur başına süreyi ekle:

- Birinci GPU tur başına bir saniyeye ihtiyaç duyar, yani iki saniyede bitirir.
- İkinci GPU tur başına dört saniyeye ihtiyaç duyar, yani dört saniyede bitirir.

İkinci GPU'da daha fazla çekirdek var ama daha yavaş. Yani çekirdeklerin ne kadar hızlı olduğunu da bilmemiz gerekiyor.

## Saat Hızı

Saat hızı (clock speed), her çekirdeğin komutları ne kadar hızlı çalıştırdığıdır.

Performans iki şeye birlikte bağlıdır:

- Daha fazla çekirdek daha fazla paralellik verir.
- Daha yüksek saat hızı her çekirdeği daha hızlı yapar.

Bunlardan biri çok düşükse tüm sistemi sınırlar. Amaç dengedir.

<cores-clock></cores-clock>

## İki Tasarım Yönü

2026 civarında GPU'lar iki tasarım yönünü izliyor. Bazıları oyun ve genel kullanım için üretiliyor. Bazıları yapay zekâ ve büyük ölçekli hesaplama için üretiliyor.

- Veri merkezi GPU'larında çoğu zaman çekirdek sayısı çok yüksek, saat hızı daha düşüktür.
- Tüketici GPU'larında çoğu zaman saat hızı daha yüksek, çekirdek sayısı daha azdır.

Genel olarak hiçbiri daha iyi değil. Her biri farklı iş yükleri için optimize edilmiş.

## Enerji

Performans her zaman enerjiye bağlıdır. Daha fazla çekirdek ve daha yüksek saat hızı, daha fazla güç tüketimi demektir. Yani performans ile verimlilik arasında her zaman bir denge kurmak gerekir.

"Hangi GPU daha iyi?" yanlış bir soru. Daha iyi soru şu: "Ne için daha iyi?"

## Özel Donanım

Modern GPU'lar sadece genel amaçlı çekirdek gruplarından oluşmaz. Özel donanımları da vardır.

"Tensor Core"lar buna bir örnek. Belirli hesaplamalar için, özellikle yapay zekâda, üretilmiş birimlerdir. Doğru iş yüküyle işleri çok hızlandırabilirler. Bu sadece iş yükü donanıma uyuyorsa işe yarar.

## Throughput

Çekirdek sayısı, saat hızı ve TFLOPS tek başına hikâyenin tamamını anlatmaz. Daha iyi soru şu: GPU belirli bir sürede ne kadar iş bitirebilir? Buna "throughput" (iş hacmi) denir.

Throughput da hesaplamanın türü, duyarlılık ve mimari gibi birçok şeye bağlıdır. Her şeyi tek bir sayı belirlemez.

## Özet

GPU'nun hızlı belleğe, yeterli çekirdeğe, yeterli hıza, makul enerji tüketimine ve bazen de özel donanıma ihtiyacı var. Gerçek performans ancak bunlar dengelendiğinde gelir.

GPU performansı tek bir sayı değildir. Belleğin, hesaplama gücünün, verimliliğin ve özel donanımın birlikte çalıştığı bir sistemdir. Bunu bilmek özellikleri okumayı ve CUDA kavramlarını anlamayı kolaylaştırır.

## Sözlük

- bellek bant genişliği (memory bandwidth): her saniye bellek ile GPU arasında ne kadar veri taşınabildiği.
- GB/s (gigabytes per second): saniyede bir milyar bayt; RTX 4090 yaklaşık 1.000 GB/s'ye, H100 ise yaklaşık 3.350 GB/s'ye kadar çıkar.
- çekirdek (core): komut çalıştıran birim; bir işçi gibi, başlamadan önce veriye ihtiyacı vardır.
- paralel (parallel): çok sayıda çekirdeğin birbiri ardına değil, aynı anda çalışması.
- bellek darboğazı (memory bottleneck): bellek veriyi yeterince hızlı gönderemediği için GPU çekirdeklerinin beklemesi.
- RTX: Nvidia'nın oyun ve genel kullanım için tüketici GPU serisi, örneğin RTX 4090.
- H100: Nvidia'nın 2022'den, 80 GB HBM3 bellekli, Hopper tabanlı veri merkezi GPU'su.
- Blackwell: Nvidia'nın Hopper'dan sonra gelen, büyük ölçekli yapay zekâ için üretilmiş veri merkezi mimarisi.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi çok büyük miktarda veri taşır, bu yüzden bellek bant genişliği çok önemlidir.
- HBM (High Bandwidth Memory): veri merkezi GPU'larında GPU çipine çok yakın duran, son derece hızlı bellek.
- GDDR / GDDR6 / GDDR6X: tüketici GPU'larında kullanılan bellek ailesi; hızlıdır ama HBM kadar değil.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir model eğitmek ya da bir oyun çalıştırmak.
- veri yolu genişliği (bus width): belleğin aynı anda ne kadar veri taşıyabildiği, bir yolun genişliği gibi.
- bellek hızı (memory speed): her bellek pininin veriyi ne kadar hızlı gönderdiği; örneğin 384 bitlik bir yol 21 Gbps'de 384 × 21 / 8 = 1008 GB/s verir.
- komut (instruction): bir çekirdeğin çalıştırdığı temel bir emir, örneğin bir toplama ya da bir çarpma.
- saat hızı (clock speed): her çekirdeğin komutları ne kadar hızlı çalıştırdığı.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- denge (trade-off): bir şeyden daha fazla almak için başka bir şeyden vazgeçmek, örneğin daha az güç için hızdan.
- Tensor Core: belirli hesaplamalar için, özellikle yapay zekâda, üretilmiş özel donanım.
- TFLOPS: saniyede trilyonlarca kayan noktalı sayı işlemi, gerçek programların nadiren ulaştığı bir tepe değer.
- throughput (iş hacmi): GPU'nun belirli bir sürede ne kadar iş bitirebildiği.
- duyarlılık (precision): her sayının kaç bit kullandığı, örneğin FP32 ya da FP16; bit azaldıkça throughput artar ama hassasiyet düşer.
- mimari (architecture): bir GPU'nun genel tasarımı, çekirdeklerin, belleğin ve özel birimlerin nasıl birlikte çalışacağını belirler.
- CUDA: NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform.
