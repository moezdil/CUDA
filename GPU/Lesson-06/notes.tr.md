# 06 > Bellek Bant Genişliği, Çekirdekler ve Saat Hızı

Bir GPU'yu hızlı yapan tek bir sayı değildir. Bu derste bellek bant genişliğini, çekirdek sayısını, saat hızını, enerjiyi ve özel donanımı göreceksin ve her birini güncel GPU'ların gerçek sayılarıyla hesaplayacaksın.

## Bellek Bant Genişliği

GPU'nun işleyeceği veri bellekten gelir. Bellek bant genişliği, bellek ile GPU arasında saniyede ne kadar veri taşınabildiğidir; genelde GB/s ya da TB/s ile verilir.

## Küçük Bir Örnek

4 çekirdekli bir GPU düşün. Her çekirdek, işe başlamadan önce veriye ihtiyaç duyar.

Belleğin bir seferde yalnızca bir çekirdeğe veri gönderebildiğini varsayalım. İlk çekirdek çalışmaya başlar, diğer üçü bekler. Sonra ikinci çekirdek veriyi alır, ardından üçüncü ve dördüncü. Yani 4 çekirdekten aynı anda yalnızca biri çalışır ve GPU verimli kullanılmaz.

Şimdi belleğin 4 çekirdeğin hepsine aynı anda veri gönderebildiğini varsayalım. Bütün çekirdekler birlikte başlar ve paralel çalışır; hiçbiri beklemez.

GPU ancak veriyi yeterince hızlı alırsa hızlıdır, yoksa bekler. Buna "bellek darboğazı" denir.

<bandwidth-sim></bandwidth-sim>

## Tüketici GPU'ları ve Veri Merkezi GPU'ları

İki tür modern GPU var:

- RTX 50 serisi gibi tüketici GPU'ları oyun ve genel kullanım için yapılır.
- H100, Blackwell B200 ya da yeni Rubin GPU'ları gibi veri merkezi GPU'ları yapay zekâ ve büyük ölçekli hesaplama için yapılır.

İki türde de çok sayıda çekirdek olabilir, hatta bazen mimarileri bile benzerdir. Asıl fark bellektedir.

Veri merkezi GPU'ları HBM kullanır. HBM, GPU çipinin hemen yanında aynı paketin içinde duran istiflenmiş bellektir; çok büyük miktarda veriyi çok hızlı iletebilir.

> [!NOTE]
> HBM nesiller hâlinde gelir: H100 HBM3 (3,35 TB/s), B200 HBM3e (8 TB/s'ye kadar), 2026'nın ikinci yarısından beri teslim edilen Rubin GPU'ları ise HBM4 (22 TB/s'ye kadar) kullanır.

Tüketici GPU'ları GDDR bellek kullanır: RTX 4090'da GDDR6X, RTX 50 serisinde GDDR7. Bunlar da hızlıdır ama HBM kadar değil.

İki GPU kâğıt üzerinde birbirine benzeyebilir. Bellek bant genişliği yüksek olan, çekirdeklerini sürekli meşgul tutar; diğeri ise veri bekleyebilir. Veri merkezi GPU'larının yapay zekâ iş yüklerinde bu kadar güçlü olmasının başlıca nedenlerinden biri budur.

## Bellek Bant Genişliğini Ne Etkiler

Bellek bant genişliğini üç ana etken belirler:

- Veri yolu genişliği bir yolun genişliği gibidir. Yol ne kadar genişse aynı anda o kadar çok veri geçer.
- Bellek hızı yoldaki hız sınırı gibidir. Yol geniş olsa bile trafik yavaşsa gecikme olur.
- Bellek teknolojisi, modern GPU'ların en çok ayrıştığı yerdir. HBM yalnızca veri için yapılmış bir otoban gibidir. GDDR daha genel amaçlıdır.

<bandwidth-calc></bandwidth-calc>

> [!TIP]
> Bant genişliği = bit cinsinden veri yolu genişliği × Gbps cinsinden pin başına hız / 8. RTX 4090'ın 21 Gbps'de 384 bitlik bir yolu var: 384 × 21 / 8 = 1.008 GB/s. RTX 5090'ın 28 Gbps'de 512 bitlik bir yolu var: 512 × 28 / 8 = 1.792 GB/s, yani yaklaşık %78 fazla.

GPU performansı yalnızca çekirdeklerle ilgili değildir. Çekirdeklerin veriyi ne kadar hızlı aldığıyla da ilgilidir. En güçlü GPU bile belleği beklerse zayıflar.

## Daha Fazla Çekirdek Her Zaman Daha Hızlı Değildir

Veri geldikten sonra GPU'nun onu işlemesi gerekir. Her çekirdek komut çalıştırır. Daha fazla çekirdeğin daha iyi performans demek olduğunu düşünmek doğal, ama bu her zaman doğru değil.

İki GPU düşün. Birincisinde 100, ikincisinde 200 çekirdek var. İkisi de 200 işlemlik aynı görevi çalıştırıyor.

- Birinci GPU aynı anda 100 işlem yapar, yani iki tur gerekir.
- İkinci GPU 200 işlemin hepsini tek turda yapar.

Şimdi tur başına süreyi ekle:

- Birinci GPU tur başına bir saniye harcar, yani 2 × 1 = 2 saniyede bitirir.
- İkinci GPU tur başına dört saniye harcar, yani 1 × 4 = 4 saniyede bitirir.

İkinci GPU'nun daha çok çekirdeği var ama daha yavaş. Demek ki çekirdeklerin ne kadar hızlı olduğunu da bilmemiz gerekiyor.

## Saat Hızı

Saat hızı, her çekirdeğin komutları ne kadar hızlı çalıştırdığıdır; GHz ile verilir.

Performans iki şeye birlikte bağlıdır:

- Daha fazla çekirdek daha fazla paralellik sağlar.
- Daha yüksek saat hızı her çekirdeği hızlandırır.

Biri çok düşükse bütün sistemi sınırlar. Amaç dengedir.

<cores-clock></cores-clock>

## İki Tasarım Yönü

GPU'lar iki tasarım yönünü izler. Bazıları oyun ve genel kullanım için, bazıları da yapay zekâ ve büyük ölçekli hesaplama için yapılır.

- Veri merkezi GPU'ları genelde daha düşük saat hızlarında çalışır; çip alanını ve gücü Tensor Core'lara ve bellek bant genişliğine harcar.
- Tüketici GPU'ları genelde grafik için daha yüksek saat hızlarında çalışır.

RTX 4090 ve H100 SXM bunu gösterir. FP32 çekirdek sayıları neredeyse aynıdır: 16.384 ve 16.896. RTX 4090 2,52 GHz'e kadar boost yapar, H100 ise yalnızca 1,98 GHz'e kadar. Ama H100 bellekten 3,35 TB/s taşır; bu, RTX 4090'ın 1.008 GB/s'sinin 3 katından fazladır.

Hiçbiri genel olarak daha iyi değildir. Her biri farklı iş yükleri için optimize edilmiştir.

## Enerji

Performans her zaman enerjiye bağlıdır. Daha fazla çekirdek ve daha yüksek saat hızı, daha fazla güç tüketimi demektir. RTX 5090 en fazla 575 W, H100 SXM en fazla 700 W için derecelendirilmiştir. Bu yüzden performans ile verimlilik arasında her zaman bir denge vardır.

"Hangi GPU daha iyi?" yanlış bir soru. Daha iyi soru şu: "Ne için daha iyi?"

## Özel Donanım

Modern GPU'lar yalnızca genel amaçlı çekirdek gruplarından ibaret değildir. Özel donanımları da vardır.

Tensor Core'lar bunun bir örneğidir. Özellikle yapay zekâdaki matris hesabı için yapılmış birimlerdir. Doğru iş yüküyle işleri çok hızlandırabilirler. Ama bu ancak iş yükü donanıma uyuyorsa işe yarar.

## Throughput

Çekirdek sayısı, saat hızı ve TFLOPS tek başına hikâyenin tamamını anlatmaz. Daha iyi soru, GPU'nun belirli bir sürede ne kadar iş bitirebildiğidir. Buna "throughput" denir.

Tepe FP32 TFLOPS değeri çekirdek × saat hızı × 2'den gelir, çünkü bir FMA 2 işlem sayılır. RTX 4090 için: 16.384 × 2,52 GHz × 2 ≈ 82,6 TFLOPS. H100 SXM için: 16.896 × 1,98 GHz × 2 ≈ 66,9 TFLOPS. Bu sayıda RTX 4090 kazanır, ama Tensor Core'ları ve bellek bant genişliği sayesinde yapay zekâ eğitiminde H100 çok daha hızlıdır.

> [!WARNING]
> Özellik tablosundaki TFLOPS, her çekirdeğin her döngüde bir FMA yaptığını varsayan bir tepe değerdir. Gerçek programlar bunun yalnızca bir kısmına ulaşır; belleği bekleyen bir program çok daha azına.

Throughput ayrıca hesaplamanın türü, duyarlılık ve mimari gibi birçok şeye bağlıdır. Her şeyi tek bir sayı belirlemez.

## Özet

Bir GPU'nun hızlı belleğe, yeterli çekirdeğe, yeterli hıza, makul enerji kullanımına ve bazen de özel donanıma ihtiyacı vardır. Gerçek performans ancak bunlar dengede olduğunda ortaya çıkar.

GPU performansı tek bir sayı değildir. Bellek, hesaplama gücü, verimlilik ve özel donanımın birlikte çalıştığı bir sistemdir. Bunu bilmek özellik tablolarını okumayı ve CUDA kavramlarını anlamayı kolaylaştırır. Sonraki dersler daha derine iniyor: GPU'nun içindeki bellek seviyelerini [Ders 07](../Lesson-07/notes.md), bir kernel'ın bellek mi yoksa hesap tarafından mı sınırlandığını anlamayı da [Ders 09](../Lesson-09/notes.md) anlatıyor.

## Sözlük

- GPU (Graphics Processing Unit): bu derslerin konusu olan, paralel çalışan çok sayıda çekirdekten oluşan işlemci.
- bellek bant genişliği (memory bandwidth): bellek ile GPU arasında saniyede ne kadar veri taşınabildiği.
- GB/s (gigabytes per second) / TB/s (terabytes per second): saniyede bir milyar ya da bir trilyon bayt; RTX 4090 1.008 GB/s'ye, H100 3,35 TB/s'ye ulaşır.
- çekirdek (core): komut çalıştıran birim; bir işçi gibi, başlamadan önce veriye ihtiyacı vardır.
- paralel (parallel): çok sayıda çekirdeğin birbiri ardına değil, aynı anda çalışması.
- bellek darboğazı (memory bottleneck): bellek veriyi yeterince hızlı gönderemediği için GPU çekirdeklerinin beklemesi.
- RTX: NVIDIA'nın oyun ve genel kullanım için tüketici GPU serisi, örneğin RTX 4090 ve RTX 5090.
- H100: NVIDIA'nın 2022'de çıkardığı, 80 GB HBM3 bellekli, Hopper tabanlı veri merkezi GPU'su.
- Blackwell: NVIDIA'nın Hopper'dan sonraki mimarisi; B200 veri merkezi GPU'su ve RTX 50 serisi bunu kullanır.
- Rubin: NVIDIA'nın Blackwell'den sonraki mimarisi; HBM4 bellek kullanır, 2026'nın ikinci yarısından beri teslim ediliyor.
- yapay zekâ (AI, artificial intelligence): veriden öğrenen yazılım; eğitimi çok büyük miktarda veri taşımayı gerektirir, bu yüzden bellek bant genişliği çok önemlidir.
- HBM (High Bandwidth Memory): veri merkezi GPU'larında GPU çipinin hemen yanında duran, son derece hızlı istiflenmiş bellek; HBM3, HBM3e ve HBM4 son nesilleridir.
- GDDR (Graphics Double Data Rate) / GDDR6X / GDDR7: tüketici GPU'larında kullanılan bellek ailesi; hızlıdır ama HBM kadar değil.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir model eğitmek ya da bir oyun çalıştırmak.
- veri yolu genişliği (bus width): belleğin aynı anda kaç bit taşıyabildiği; bir yolun genişliği gibi.
- bellek hızı (memory speed): her bellek pininin veriyi ne kadar hızlı gönderdiği; Gbps ile verilir.
- Gbps (gigabits per second): saniyede bir milyar bit; RTX 4090'ın belleği pin başına 21 Gbps hızla çalışır.
- komut (instruction): bir çekirdeğin çalıştırdığı temel bir emir, örneğin bir toplama ya da bir çarpma.
- saat hızı (clock speed): her çekirdeğin komutları ne kadar hızlı çalıştırdığı; GHz ile verilir.
- GHz (gigahertz): saniyede bir milyar saat döngüsü; RTX 4090 2,52 GHz'e kadar boost yapar.
- FP32 (32-bit floating point): GPU hesabının standart sayı biçimi; özellik tablolarının "CUDA çekirdeği" diye saydığı şey FP32 çekirdekleridir.
- verimlilik (efficiency): bir GPU'nun harcadığı her watt güç başına ne kadar iş çıkardığı.
- denge (trade-off): bir şeyden daha fazla almak için başka bir şeyden vazgeçmek, örneğin daha az güç için hızdan.
- Tensor Core: matris hesabı, özellikle yapay zekâ için tasarlanmış özel donanım.
- TFLOPS (trillions of floating-point operations per second): gerçek programların nadiren ulaştığı bir tepe değer.
- FMA (fused multiply-add): a × b + c hesaplayan ve 2 kayan noktalı işlem sayılan tek bir komut.
- throughput (iş hacmi): GPU'nun belirli bir sürede ne kadar iş bitirebildiği.
- duyarlılık (precision): her sayının kaç bit kullandığı, örneğin FP32 ya da FP16; bit azaldıkça throughput artar ama hassasiyet düşer.
- mimari (architecture): bir GPU'nun genel tasarımı; çekirdeklerin, belleğin ve özel birimlerin nasıl birlikte çalışacağını belirler.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın, GPU'larında çalışan programlar yazmak için sunduğu platform.
