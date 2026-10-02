# 11 > Volta White Paper'ını Okumak

Bu derste V100 white paper'ını adım adım inceleyeceğiz. Volta'nın neyi değiştirdiğini ve bunun bugünün GPU'ları (Graphics Processing Unit, grafik işlem birimi) için neden önemli olduğunu göreceksin.

## Neden Gerçek Bir White Paper Okumalı

White paper (teknik rapor), donanım tasarımını basitleştirmeden gösterir. Volta bunun en önemli örneklerinden biri, çünkü V100 white paper'ı GPU'ların yön değiştirdiği anı belgeler.

## Key Features ile Başla

Hemen diyagramlara ya da sayılara dalma; "Key Features" (Temel Özellikler) bölümüyle başla. Kısadır ve mimarinin ne yapmaya çalıştığını gösterir.

Volta'da odak çok net: mimari yapay zekâ (AI, artificial intelligence) için tasarlanmış. Bu, önceki nesle göre sadece bir iyileştirme değil, amaçta bir değişim.

## Tensor Core'lar

Volta'daki en önemli değişiklik Tensor Core'lardır.

Volta'dan önce GPU'lar matris işlemlerini genel amaçlı CUDA core'larında çalıştırıyordu. Bu işe yarıyordu ama verimli değildi. Volta, matris işlemlerine kendilerine ayrılmış donanım veriyor: V100'de, 80 SM'nin her birinde 8 tane olmak üzere 640 Tensor Core var.

Bu noktadan sonra GPU artık sadece genel bir hesaplama cihazı değil; en baştan yapay zekâ iş yükleri düşünülerek tasarlanıyor.

## Streaming Multiprocessor (SM)

Streaming Multiprocessor (SM), GPU'nun temel yapı taşıdır. Volta'da SM yeniden tasarlandı ve her biri kendi warp zamanlayıcısına sahip dört işlem bloğuna bölündü.

Önemli bir iyileştirme, farklı türdeki işlemlerin aynı anda çalışabilmesi. Pascal'da tam sayı ve kayan noktalı sayı işlemleri tek bir yürütme yolunu paylaşıyor ve sırayla çalışmak zorunda kalıyordu; Volta'da paralel çalışıyorlar.

Modern iş yükleri çoğu zaman farklı türdeki işlemleri bir arada kullanır. Bu yüzden bu değişiklik donanımın daha iyi kullanılmasını sağlıyor.

<volta-shift></volta-shift>

## Komut Hızı

Yeni bir mimari sadece çekirdek eklemez, var olan işlemleri de hızlandırır.

Volta'da birçok komut Pascal'dakinden daha az döngüde (cycle) tamamlanır. Ampere ve Hopper bunu daha da ileri götürüyor ve bu eğilim 2026'da da sürüyor. İlerleme sadece ölçekle değil, verimlilikle de ilgili.

## Bellek

Volta, HBM2 (High Bandwidth Memory 2) bellek kullanır: V100'de 16 ya da 32 GB, 900 GB/s hızla. Bu, önceki nesillerden daha yüksek bir bellek bant genişliğidir.

Modern GPU iş yükleri çoğu zaman sadece verinin ne kadar hızlı işlendiğiyle değil, ne kadar hızlı taşındığıyla da sınırlıdır. Daha yüksek bant genişliği, hesaplama birimlerine beklemeden daha fazla veri ulaştırır.

## NVLink

Volta, NVLink'in ikinci neslini getiriyor. NVLink, GPU'ları birbirine yüksek hızda bağlar.

Volta hem bağlantı sayısını hem de bağlantı hızını artırıyor: V100'de toplam 300 GB/s taşıyan altı NVLink bağlantısı var; bu da çoklu GPU sistemlerini çok daha verimli hâle getiriyor.

> [!NOTE]
> 2026'da Hopper ve Blackwell tabanlı büyük yapay zekâ sistemleri bu fikre daha da fazla dayanıyor. Volta bu yöndeki ilk adımlardan biriydi.

## Transistör Sayısı

Transistör sayısı, bir GPU'nun içinde ne kadar donanım olduğunu gösterir. V100'de yaklaşık 21 milyar transistör var.

> [!NOTE]
> Hopper, H100'de yaklaşık 80 milyar transistöre ulaşıyor. Blackwell daha da ileri gidiyor: B200, tek bir GPU gibi çalışan iki kalıpta 208 milyar transistör barındırıyor.

Bu büyüme sadece boyutla ilgili değil; yeni birimleri, yeni bellek sistemlerini ve daha gelişmiş yürütme modellerini yansıtıyor.

## Her Seferinde Aynı Yapı

Farklı mimarilerin white paper'ları benzer bir yapı izler:

1. Yeni özellikler
2. SM tasarımı
3. Performans karşılaştırmaları
4. Teknik özellikler

Bir white paper'ı okuyabildiğinde diğerleri çok daha kolaylaşır.

## Volta'nın Rolü

2026'dan geriye bakınca Volta, kendi döneminin güçlü bir GPU'sundan fazlasıdır: GPU'ların yapay zekâ odaklı hâle geldiği noktadır. Ampere, Hopper ve şimdi Blackwell hep bu fikrin üzerine kurulup onu daha ileri taşıyor.

V100 white paper'ını okumak, GPU'ların bugün neden böyle göründüğünü anlamana yardım eder.

> [!TIP]
> Bir örnek: https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf

## Sözlük

- white paper: bir GPU mimarisinin nasıl kurulduğunu basitleştirmeden gösteren resmî teknik belge.
- Volta: Nvidia'nın 2017 mimarisi (V100, CC 7.0); Tensor Core'ları olan ilk mimari.
- V100: bu derste white paper'ı incelenen Volta GPU'su.
- Key Features: mimarinin ne yapmaya çalıştığını gösteren kısa bir white paper bölümü.
- mimari (architecture): bir GPU ailesinin donanım tasarımı; Volta, Ampere ve Hopper birer mimaridir.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi büyük ölçüde dev matris hesaplarıdır.
- nesil (generation): GPU sürümlerindeki bir adım; Volta, Pascal neslinin ardından geldi.
- Tensor Core'lar: matris işlemleri için ayrılmış donanım; ilk kez Volta'da geldi.
- matris işlemleri (matrix operations): bütün bir sayı tablosu üzerinde yapılan hesaplar, özellikle matris çarpımı; yapay zekâdaki işin çoğu budur.
- CUDA core: GPU'nun genel amaçlı aritmetik birimleri; Tensor Core'lardan önce matris hesapları bunlarda çalışıyordu.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir sinir ağı eğitmek.
- Streaming Multiprocessor (SM): GPU'nun temel yapı taşı; Volta'da SM yeniden tasarlandı.
- Pascal: Nvidia'nın 2016 mimarisi (P100); Volta'dan önceki nesil.
- tam sayı (integer): 7 ya da -3 gibi ondalıksız bir sayı; GPU kodu indeksler ve adresler için sürekli tam sayı hesabı yapar.
- kayan noktalı sayı (floating point): 3,14 gibi ondalıklı bir sayı; grafik ve yapay zekâ hesaplarının çoğu bununla yapılır.
- paralel (parallel): aynı anda çalışmak; burada tam sayı ve kayan noktalı sayı işlemlerinin yan yana çalışması.
- komut (instruction): GPU'nun çalıştırdığı temel bir emir, örneğin bir toplama ya da bir çarpma.
- döngü (cycle): GPU saatinin bir tıkı; 1,5 GHz'de saniyede 1,5 milyar döngü olur.
- verimli (efficient): aynı donanımla, aynı sürede ya da aynı güçle daha fazla iş çıkaran.
- Ampere / Hopper / Blackwell: Volta'dan sonra gelen Nvidia mimarileri (2020, 2022, 2024); hepsi onun Tensor Core'ları üzerine kurulur.
- HBM2 (High Bandwidth Memory 2): Volta'nın kullandığı bellek; V100'de 900 GB/s, önceki nesillerden daha yüksek.
- GB/s: saniyede gigabayt; bellek ve bağlantı hızının birimi.
- warp zamanlayıcısı (warp scheduler): sıradaki 32 thread'lik grubu seçen birim; her Volta SM'sinde dört tane var.
- GPU (Graphics Processing Unit): çok sayıda basit işi paralel çalıştırmak için tasarlanmış işlemci.
- bellek bant genişliği (memory bandwidth): verinin hesaplama birimlerine ne kadar hızlı taşındığı; daha yüksek bant genişliği daha az bekleme demektir.
- NVLink: GPU'ları birbirine bağlayan yüksek hızlı bağlantı; Volta'da ikinci nesli var.
- çoklu GPU (multi-GPU): aynı makinede tek bir iş üzerinde çalışan ve sürekli veri alışverişi yapan birkaç GPU.
- transistör sayısı (transistor count): bir GPU'nun içinde ne kadar donanım olduğu; V100'de yaklaşık 21 milyar, B200'de 208 milyar transistör var.
