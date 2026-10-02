# Volta White Paper'ını Okumak

Bu ders V100 white paper'ını adım adım inceliyor. Volta'nın neyi değiştirdiğini ve bunun bugünün GPU'ları için neden önemli olduğunu gösteriyor.

## Neden Gerçek Bir White Paper Okumalı

White paper (teknik rapor), donanım tasarımını basitleştirmeden, doğrudan gösterir. Volta bunun en önemli örneklerinden biri. V100 white paper'ı, GPU'ların yön değiştirdiği anı gösteriyor.

## Key Features ile Başla

Hemen diyagramlara ya da sayılara dalma. "Key Features" (Temel Özellikler) bölümüyle başla. Kısadır ve mimarinin ne yapmaya çalıştığını gösterir.

Volta'da odak çok net. Mimari yapay zekâ için üretilmiş. Bu, önceki nesle göre sadece bir iyileştirme değil, amaçta bir değişim.

## Tensor Core'lar

Volta'daki en önemli değişiklik Tensor Core'lar.

Volta'dan önce GPU'lar matris işlemlerini genel CUDA core'larında çalıştırıyordu. Bu işe yarıyordu ama verimli değildi. Volta, matris işlemlerine kendilerine ayrılmış bir donanım veriyor.

Buradan itibaren GPU artık sadece genel bir hesaplama cihazı değil. En baştan yapay zekâ iş yükleri için tasarlanıyor.

## Streaming Multiprocessor (SM)

Streaming Multiprocessor (SM), GPU'nun temel yapı taşıdır. Volta'da SM yeniden tasarlandı.

Önemli bir iyileştirme, farklı türdeki işlemlerin aynı anda çalışabilmesi. Pascal'da tam sayı ve kayan noktalı sayı işlemleri tek bir yürütme yolunu paylaşıyor ve sırayla çalışmak zorunda kalıyordu. Volta'da paralel çalışıyorlar.

Modern iş yükleri çoğu zaman farklı türdeki işlemleri karıştırır. Bu yüzden bu değişiklik donanımın daha iyi kullanılmasını sağlıyor.

<volta-shift></volta-shift>

## Komut Hızı

Yeni bir mimari sadece çekirdek eklemez. Var olan işlemleri de hızlandırır.

Volta'da birçok komut Pascal'dakinden daha az döngüde (cycle) biter. Ampere ve Hopper bunu daha da geliştiriyor. Bu örüntü 2026'ya kadar sürüyor. İlerleme sadece ölçekle değil, verimlilikle ilgili.

## Bellek

Volta, HBM2 bellek kullanır. Bellek bant genişliği önceki nesillerden daha yüksektir.

Modern GPU iş yükleri çoğu zaman sadece verinin ne kadar hızlı işlendiğiyle değil, ne kadar hızlı taşındığıyla da sınırlıdır. Daha yüksek bant genişliği, hesaplama birimlerine beklemeden daha fazla veri besler.

## NVLink

Volta, NVLink'in ikinci neslini getiriyor. NVLink, GPU'ları birbirine yüksek hızda bağlar.

Volta hem bağlantı sayısını hem de hızlarını artırıyor. Bu da çoklu GPU sistemlerini çok daha verimli yapıyor.

> [!NOTE]
> 2026'da Hopper ve Blackwell tabanlı büyük yapay zekâ sistemleri bu fikre daha da fazla dayanıyor. Volta bu yöndeki ilk adımlardan biriydi.

## Transistör Sayısı

Transistör sayısı, bir GPU'nun içinde ne kadar donanım olduğunu gösterir. V100'de yaklaşık 21 milyar transistör var.

> [!NOTE]
> Hopper yaklaşık 80 milyar transistöre ulaşıyor. Blackwell daha karmaşık tasarımlarla daha da ileri gidiyor.

Bu büyüme sadece boyutla ilgili değil. Yeni birimleri, yeni bellek sistemlerini ve daha gelişmiş yürütme modellerini yansıtıyor.

## Her Seferinde Aynı Yapı

Farklı mimarilerin white paper'ları benzer bir yapı kullanır:

1. Yeni özellikler
2. SM tasarımı
3. Performans karşılaştırmaları
4. Teknik özellikler

Bir white paper'ı okuyabildiğinde diğerleri çok daha kolay olur.

## Volta'nın Rolü

2026'dan geriye bakınca Volta, kendi döneminin güçlü bir GPU'sundan fazlası. GPU'ların yapay zekâ odaklı hâle geldiği nokta. Ampere, Hopper ve şimdi Blackwell hep bu fikrin üzerine kuruluyor ve onu daha ileri taşıyor.

V100 white paper'ını okumak, GPU'ların bugün neden böyle göründüğünü anlamana yardım eder.

> [!TIP]
> Bir örnek: https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf

## Sözlük

- white paper: bir GPU mimarisinin nasıl kurulduğunu basitleştirmeden gösteren resmî teknik belge.
- Volta: Nvidia'nın 2017 mimarisi (V100, CC 7.0), Tensor Core'ları olan ilk mimari.
- V100: bu derste white paper'ı incelenen Volta GPU'su.
- Key Features: mimarinin ne yapmaya çalıştığını gösteren kısa bir white paper bölümü.
- mimari (architecture): bir GPU ailesinin donanım tasarımı; Volta, Ampere ve Hopper birer mimaridir.
- yapay zekâ (AI): veriden öğrenen yazılım; eğitimi büyük ölçüde dev matris hesaplarıdır.
- nesil (generation): GPU sürümlerindeki bir adım; Volta, Pascal neslinin ardından geldi.
- Tensor Core'lar: matris işlemleri için ayrılmış donanım. İlk kez Volta'da vardı.
- matris işlemleri (matrix operations): bütün bir sayı tablosu üzerinde yapılan hesaplar, özellikle matris çarpımı; yapay zekâdaki işin çoğu budur.
- CUDA core: GPU'nun genel amaçlı aritmetik birimleri, Tensor Core'lardan önce matris hesapları bunlarda çalışıyordu.
- iş yükü / iş yükleri (workload): bir programın GPU'ya verdiği iş türü, örneğin bir sinir ağı eğitmek.
- Streaming Multiprocessor (SM): GPU'nun temel yapı taşı. Volta'da SM yeniden tasarlandı.
- Pascal: Nvidia'nın 2016 mimarisi (P100), Volta'dan önceki nesil.
- tam sayı (integer): 7 ya da -3 gibi ondalıksız bir sayı; GPU kodu indeksler ve adresler için sürekli tam sayı hesabı yapar.
- kayan noktalı sayı (floating point): 3.14 gibi ondalıklı bir sayı; grafik ve yapay zekâ hesaplarının çoğu bununla yapılır.
- paralel (parallel): aynı anda çalışmak, burada tam sayı ve kayan noktalı sayı işlemlerinin yan yana çalışması.
- komut (instruction): GPU'nun çalıştırdığı temel bir emir, örneğin bir toplama ya da bir çarpma.
- döngü (cycle): GPU saatinin bir tiki; 1.5 GHz'de saniyede 1.5 milyar döngü olur.
- verimli (efficient): aynı donanımla, aynı sürede ya da aynı güçle daha fazla iş çıkaran.
- Ampere / Hopper / Blackwell: Volta'dan sonra gelen Nvidia mimarileri (2020, 2022, 2024), hepsi onun Tensor Core'ları üzerine kurulur.
- HBM2: Volta'nın kullandığı bellek. Bellek bant genişliği önceki nesillerden daha yüksektir.
- bellek bant genişliği (memory bandwidth): verinin hesaplama birimlerine ne kadar hızlı taşındığı. Daha yüksek bant genişliği daha az bekleme demektir.
- NVLink: GPU'ları birbirine bağlayan yüksek hızlı bir bağlantı. Volta'da ikinci nesli var.
- çoklu GPU (multi-GPU): aynı makinede tek bir iş üzerinde çalışan ve sürekli veri alışverişi yapan birkaç GPU.
- transistör sayısı (transistor count): bir GPU'nun içinde ne kadar donanım olduğu. V100'de yaklaşık 21 milyar transistör var.
