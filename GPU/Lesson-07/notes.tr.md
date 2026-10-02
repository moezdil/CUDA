# 07 > Bellek Hiyerarşisi

Bir GPU'nun tek bir belleği yoktur. Bir merdiveni vardır. Çekirdeklere yakın birkaç küçük ve çok hızlı bellek, uzakta da çok büyük ve yavaş bir bellek bulunur. Bu derste L40S üzerinde bu merdivenden aşağı iniyorsun. Her basamağı kimin görebildiğine, ne kadar büyük ve hızlı olduğuna bakıyor ve nereye ne kadar veri sığdığını hesaplıyorsun.

## Bir Merdiven, Üç Soru

[Ders 00](../Lesson-00/notes.md) register'ları, paylaşımlı belleği ve L2 önbelleği tanıttı, [Ders 06](../Lesson-06/notes.md) de bellek bant genişliğinin bir GPU'yu neden sınırladığını gösterdi. Bu ders hepsini sıraya koyuyor. Bu sıraya bellek hiyerarşisi denir.

Her basamak için üç soru sor.

- Nerede duruyor? Bir SM'nin içinde mi, GPU çipinin başka bir yerinde mi, yoksa yanındaki ayrı bellek çiplerinde mi?
- Kim görebiliyor? Tek bir thread mi, bir block'taki bütün thread'ler mi, yoksa bütün GPU'daki her thread mi?
- Ne kadar büyük ve ne kadar hızlı? Küçük basamaklar hızlı, büyük basamaklar yavaştır. Hem büyük hem hızlı olan bir basamak yoktur.

Hızın iki anlamı var. Bant genişliği, bir basamağın saniyede kaç bayt verebildiğidir. Gecikme, tek bir yüklemenin verisi gelene kadar ne kadar beklediğidir ve saat döngüsü ile sayılır.

<mem-hierarchy></mem-hierarchy>

## Register'lar

Register'lar her SM'nin içinde, çekirdeklerin hemen yanında durur. Her thread yerel değişkenleri için kendi register'larını alır ve başka hiçbir thread onları okuyamaz. Register kullanmanın ek bir bekleme maliyeti yoktur, çünkü çekirdek onu komutun bir parçası olarak okur.

Bir L40S SM'sinin register dosyası 32 bitlik 65.536 register tutar, yani 256 KB. Bir thread en fazla 255 tanesini kullanabilir. H100'de de SM başına 256 KB vardır.

> [!NOTE]
> Bütün çip boyunca toplandığında register'lar hiç de az değildir. L40S'te 142 SM × 256 KB = 36.352 KB register vardır, yaklaşık 35,5 MB. Bu, 142 × 100 KB = 14.200 KB'lık paylaşımlı bellekten fazladır.

## Paylaşımlı Bellek ve L1

Her SM'de ayrıca çip üstünde hızlı bir bellek alanı vardır ve iki iş arasında bölünür.

- paylaşımlı bellek, kernel tarafından elle yönetilir. Bir block'taki bütün thread'ler onu okuyup yazabilir, bu yüzden veri paylaşmak için kullanırlar. Başka block'ların thread'leri onu göremez.
- L1 önbellek, donanım tarafından yönetilir. Global bellekten son yüklenen veriyi SM'ye yakın tutar, böylece aynı verinin ikinci yüklemesi hızlı olur.

CC 8.9 olan L40S'te bu alan SM başına 128 KB'tır. Bölüşümü kernel seçer, buna carveout denir. Paylaşımlı bellek 0, 8, 16, 32, 64 ya da 100 KB alır, geri kalanı L1 olur. CUDA her block için 1 KB'ı kendine ayırır, bu yüzden bir block en fazla 99 KB kullanabilir. H100'de bu alan SM başına 256 KB'tır ve en fazla 228 KB'ı paylaşımlı bellek olabilir.

Yayımlanmış mikro ölçümler, L40S ile aynı AD102 çipini kullanan bir RTX 4090 üzerinde, paylaşımlı bellek yüklemesi için yaklaşık 30 döngü, L1 isabeti için yaklaşık 43 döngü ölçtü.

## L2 Önbellek

L2 önbellek GPU çipinin üzerinde ama SM'lerin dışında durur. Bütün SM'ler onu paylaşır, yani bütün GPU'ya hizmet eder. Global belleğe yapılan her okuma ve yazma ondan geçer.

L40S'te 96 MB L2 vardır, H100'de 50 MB. Aynı mikro ölçümler RTX 4090'da bir L2 isabeti için yaklaşık 273 döngü ölçtü. Bu, bir paylaşımlı bellek yüklemesinin kabaca 9 katıdır.

## Global Bellek

Global bellek GPU'nun ana belleğidir, L40S'teki 48 GB'lık VRAM. Ayrı bellek çiplerinde durur, böylece her block'un her thread'i ona ulaşabilir ve CPU veriyi ona kopyalar ve geri alır. Global bellekteki veri kernel çalıştırmaları arasında da yerinde kalır.

L40S'te bu bellek 864 GB/s hızında GDDR6'dır. H100 SXM'de 3,35 TB/s hızında 80 GB HBM3 vardır. Global bellek en yavaş basamaktır. RTX 4090'da yükleme başına yaklaşık 541 döngü sürer, yani bir L2 isabetinin iki katı ve bir paylaşımlı bellek yüklemesinin yaklaşık 18 katı.

## Sabit Bellek ve Doku Belleği

Global belleğin iki özel görünümünün kendi küçük önbellekleri vardır.

Sabit bellek 64 KB'lık salt okunur veridir. Her SM bunun 8 KB'ını önbellekte tutar. Bir warp'taki bütün thread'ler aynı adresi okuduğunda, tek okuma 32'sinin hepsine yayınlanır. Farklı adresleri okuduklarında okumalar birbiri ardına yapılır.

Doku belleği, L1 önbellekten geçen salt okunur bir yoldur ve yan yana thread'lerin yan yana pikselleri okuduğu grafik için tasarlanmıştır. Ada ve Hopper'da doku önbelleği ile L1 tek bir birimdir, bu yüzden çoğu CUDA kodu doğrudan global belleği okur ve önbelleğe almayı L1'e bırakır.

## Yerel Bellek ve Register Taşması

Yerel bellek, bir register gibi tek bir thread'e özeldir ama global bellekte durur. L1 ve L2'de önbelleğe alınır, ama bulunamazsa herhangi bir global bellek yüklemesi kadar pahalıdır. Her thread bundan en fazla 512 KB kullanabilir.

Register'lar yetmediğinde derleyici veriyi yerel belleğe koyar. Buna register taşması denir. Bir thread'in bir diziyi yalnızca çalışma anında bilinen bir değerle indekslediği durumda da olur, çünkü register'lar bu şekilde indekslenemez.

> [!WARNING]
> "Yerel" burada yakın değil, özel demektir. Yerel bellek çipin dışındadır ve global bellek kadar yavaştır. `-Xptxas -v` ile derlersen derleyici her kernel'ın register sayısını, taşma yazmalarını ve taşma okumalarını bayt olarak bildirir.

## Bir Bakışta

| Basamak | Nerede | Kim görür | L40S | H100 SXM | Yükleme beklemesi (döngü) |
|---|---|---|---|---|---|
| Register'lar | her SM'nin içinde | tek thread | SM başına 256 KB | SM başına 256 KB | yok |
| Paylaşımlı bellek | her SM'nin içinde | tek block | SM başına en fazla 100 KB | SM başına en fazla 228 KB | yaklaşık 30 |
| L1 önbellek | her SM'nin içinde | tek SM | 128 KB'ın kalanı | 256 KB'ın kalanı | yaklaşık 43 |
| L2 önbellek | çipin üzerinde | bütün GPU | 96 MB | 50 MB | yaklaşık 273 |
| Global bellek | bellek çipleri | bütün GPU | 48 GB GDDR6 | 80 GB HBM3 | yaklaşık 541 |

Döngüler bir RTX 4090'da ölçüldü. H100 gibi bir Hopper GPU'su olan H800'de neredeyse aynı değerler ölçüldü, yani 29, 41, 263 ve 479 döngü.

## Nereye Ne Sığar, Örnek Hesap

Bir float 4 bayt yer kaplar. CUDA'nın tablolarında 1 KB 1.024 bayt, 1 MB de 1.024 KB'tır.

Bir L40S SM'sinde en fazla 100 KB paylaşımlı bellek vardır.

- 100 × 1.024 = 102.400 bayt.
- 102.400 / 4 = 25.600 float.
- 32 × 32'lik bir float karosu 32 × 32 × 4 = 4.096 bayt = 4 KB eder, yani bir SM'ye 100 / 4 = 25 karo sığar.
- Bir block en fazla 99 KB kullanabilir, bu da 99 × 1.024 / 4 = 25.344 float eder.

H100'de SM başına 228 KB, 228 × 1.024 / 4 = 58.368 float tutar, bu da iki kattan fazladır.

L40S'in L2 önbelleği 96 MB tutar.

- 96 × 1.024 × 1.024 = 100.663.296 bayt.
- 100.663.296 / 4 = 25.165.824 float, yaklaşık 25,2 milyon.
- 5.000 × 5.000'lik bir float matrisi 25.000.000 float eder, yani tam sığar. 6.000 × 6.000'lik bir matris (36.000.000 float) sığmaz.

> [!TIP]
> Register'lar bir SM'deki bütün thread'ler arasında paylaşılır. Bir L40S SM'sinde 1.536 thread'in hepsini çalıştırmak için her thread'e 65.536 / 1.536 ≈ 42,7 register düşer. Donanım register'ları her warp'a 256'lık parçalar halinde verir, bu yüzden gerçek sınır thread başına 40'tır, çünkü 40 × 32 = 1.280 = 5 parça, ve 48 warp × 1.280 = 61.440, 65.536'ya sığar.

## CUDA İçin Neden Önemli

Bir kernel yazarken her veri parçası için bir basamak seçersin.

- Sıradan yerel değişkenler register'lara gider. Az tut, yoksa yerel belleğe taşarlar ve global bellek kadar yavaş çalışırlar.
- Bir block'un thread'lerinin defalarca okuduğu veri, `__shared__` ile tanımlanan paylaşımlı belleğe gider. Global bellekten bir kez yükle, sonra yaklaşık 541 yerine yaklaşık 30 döngüyle tekrar kullan.
- Büyük diziler global bellekte durur. Onları bir warp'ın 32 thread'i komşu adreslere dokunacak şekilde oku, o zaman L1 ve L2 onları birkaç geniş aktarımla verebilir.

Global bellekten bir yükleme yüzlerce döngü sürer. GPU bu beklemeyi başka warp'lara geçerek gizler ve bu, [Ders 08](../Lesson-08/notes.md)'in konusudur. [Ders 09](../Lesson-09/notes.md) da bir kernel'ı hesabın mı yoksa belleğin mi sınırladığını nasıl anlayacağını gösterir.

## Sözlük

- GPU (Graphics Processing Unit): bu derslerin konusu olan, thread'leri paralel çalıştıran çok sayıda SM'den oluşan işlemci.
- CPU (Central Processing Unit): bilgisayarın ana işlemcisi. Veriyi global belleğe kopyalar ve geri alır.
- bellek hiyerarşisi (memory hierarchy): küçük ve hızlı register'lardan büyük ve yavaş global belleğe uzanan GPU bellekleri merdiveni.
- SM (Streaming Multiprocessor): GPU'nun içinde kendi çekirdekleri, register'ları, paylaşımlı belleği ve L1 önbelleği olan işlem birimi. L40S'te 142 tane vardır.
- thread: tek bir komut akışı. Her thread'in kendi register'ları ve yerel belleği vardır.
- block: tek bir SM'de çalışan ve paylaşımlı bellek üzerinden veri paylaşabilen thread grubu.
- warp: SM'nin birlikte çalıştırdığı 32 thread'lik grup.
- kernel: GPU'da çok sayıda thread üzerinde çalıştırılan fonksiyon.
- bant genişliği (bandwidth): bir bellek basamağının saniyede verebildiği bayt sayısı.
- gecikme (latency): tek bir yüklemenin verisi gelene kadar ne kadar beklediği.
- saat döngüsü (clock cycle): GPU saatinin bir tıkı. Bu sayfadaki gecikmeler döngüyle sayılır.
- register: tek bir thread'e özel en hızlı depolama. Bir L40S SM'sinde 32 bitlik 65.536 tane vardır.
- register dosyası (register file): bir SM'nin bütün register'ları, L40S'te ve H100'de 256 KB.
- KB (kilobyte) / MB (megabyte): CUDA'nın tablolarında 1.024 bayt ve 1.024 KB.
- çip üstünde (on-chip): register'lar, paylaşımlı bellek, L1 ve L2 gibi doğrudan GPU çipinin içine yapılmış.
- paylaşımlı bellek (shared memory): her SM'deki, bir block'un bütün thread'lerinin okuyup yazabildiği hızlı çip üstü bellek.
- L1 önbellek (Level 1 cache): her SM'nin çip üstü alanının donanımca yönetilen, son kullanılan veriyi yakında tutan kısmı.
- carveout (paylaştırma oranı): çip üstü alanın paylaşımlı bellek ile L1 arasında nasıl bölündüğü. Her kernel için seçilir.
- CC (compute capability): bir GPU'nun özelliklerinin sürüm numarası. L40S CC 8.9'dur.
- CUDA (Compute Unified Device Architecture): NVIDIA'nın kendi GPU'larında çalışan programlar yazmak için platformu.
- mikro ölçüm (microbenchmark): tek bir şeyi, örneğin bir bellek basamağının gecikmesini ölçen küçük test programı.
- L2 önbellek (Level 2 cache): bütün SM'lerin paylaştığı çip üstü önbellek, L40S'te 96 MB, H100'de 50 MB.
- global bellek (global memory): her thread'in ve CPU'dan gelen kopyaların ulaştığı GPU ana belleği, en yavaş basamak.
- VRAM (GPU belleği): bir GPU kartında global belleği tutan bellek çipleri.
- GDDR6 (Graphics Double Data Rate 6): L40S'in bellek türü, 864 GB/s hızında 48 GB.
- HBM3 (High Bandwidth Memory 3): GPU çipiyle aynı pakette üst üste yığılmış bellek. H100 SXM'de 3,35 TB/s hızında 80 GB vardır.
- GB/s (gigabytes per second) / TB/s (terabytes per second): bant genişliği birimleri.
- sabit bellek (constant memory): her SM'de 8 KB önbelleği olan 64 KB'lık salt okunur veri. Bütün warp tek adresi okuduğunda hızlıdır.
- yayın (broadcast): değeri bir warp'ın 32 thread'inin hepsine aynı anda giden tek okuma.
- doku belleği (texture memory): L1 önbellekten geçen, grafik için tasarlanmış salt okunur yol.
- yerel bellek (local memory): thread'e özel ama global bellekte duran bellek, thread başına en fazla 512 KB.
- register taşması (register spill): register'lar yetmediği için verinin register'lardan yerel belleğe taşınması.
- float: 32 bitlik kayan noktalı sayı, 4 bayt.
- karo (tile): büyük bir dizinin, tekrar kullanılmak üzere paylaşımlı belleğe yüklenen küçük kare parçası.
