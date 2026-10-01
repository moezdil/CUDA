# Lektion 03: Compute Capability

Die Compute Capability (CC) ist eine Versionsnummer für eine GPU-Generation (Graphics Processing Unit). Sie legt die Funktionen und Hardware-Grenzen fest, die du in den Lektionen 00 bis 02 kennengelernt hast, etwa die Warp-Größe von 32 und die Grenze von 1024 Threads pro Block. Jede CUDA-Funktion (Compute Unified Device Architecture) braucht eine Mindest-Compute-Capability. Diese Zahl sagt dir also, was dein Code nutzen darf.

## Was die Zahl bedeutet

Das Format ist Major.Minor, zum Beispiel 9.0 für Hopper oder 8.9 für die L40S in diesen Lektionen. Eine neue Major-Version ist eine neue Architektur-Generation mit neuer Hardware. Eine neue Minor-Version ist eine Überarbeitung innerhalb derselben Generation.

Code, der für CC 7.0 gebaut ist, läuft auf jeder GPU mit CC 7.0 oder höher. Code, der Funktionen von CC 9.0 nutzt, läuft nicht auf älteren GPUs. Ein Beispiel: Ein Programm, das CC 8.0 braucht, läuft auf der L40S (8.9 ist höher als 8.0), ein Programm, das CC 9.0 braucht, dagegen nicht.

<cc-explorer></cc-explorer>

> [!TIP]
> Um die Compute Capability deiner eigenen GPU herauszufinden, führe `nvidia-smi --query-gpu=name,compute_cap --format=csv` aus.

## GPU-Generationen

Die Tabelle zeigt Rechenzentrums-GPUs von Pascal bis Blackwell, dazu die L40S, von der die Ausgaben in diesen Lektionen stammen.

| Merkmal                | P100 (CC 6.0)     | V100 (CC 7.0)     | A100 (CC 8.0)     | L40S (CC 8.9)     | H100 (CC 9.0)     | B100 (CC 10.0)    |
|------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| GPU                    | Tesla P100        | Tesla V100        | A100              | L40S              | H100              | B100              |
| Codename               | GP100             | GV100             | GA100             | AD102             | GH100             | GB100             |
| Architektur            | Pascal            | Volta             | Ampere            | Ada Lovelace      | Hopper            | Blackwell         |
| Threads / Warp         | 32                | 32                | 32                | 32                | 32                | 32                |
| Max. Warps / SM        | 64                | 64                | 64                | 48                | 64                | 64                |
| Max. Threads / SM      | 2048              | 2048              | 2048              | 1536              | 2048              | 2048              |
| Max. Blöcke / SM       | 32                | 32                | 32                | 24                | 32                | 32                |
| Max. Register / SM     | 65536             | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max. Register / Block  | 65536             | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max. Register / Thread | 255               | 255               | 255               | 255               | 255               | 255               |
| Max. Blockgröße        | 1024              | 1024              | 1024              | 1024              | 1024              | 1024              |
| FP32-Kerne / SM        | 64                | 64                | 64                | 128               | 128               | 128               |
| Shared Memory / SM     | 64 KB             | bis zu 96 KB      | bis zu 164 KB     | bis zu 100 KB     | bis zu 228 KB     | bis zu 228 KB     |

SM steht für Streaming Multiprocessor, den Prozessor in der GPU, auf dem Blöcke laufen. FP32 steht für 32-Bit-Gleitkommazahlen, und KB steht für Kilobyte.

H100 und B100 haben dieselben Grenzen für Threads und Speicher pro SM. Die Anzahl der Register pro SM hat sich über diese Generationen gar nicht geändert.

<cc-progress></cc-progress>

> [!NOTE]
> Blackwell ist trotzdem schneller als Hopper. Gründe sind mehr SMs (148 auf der B200 gegenüber 132 auf der H100 SXM5), Tensor Cores der 5. Generation, schnellerer HBM3e (High Bandwidth Memory, Speicher mit hoher Bandbreite) und NVLink 5.0, die Verbindung von NVIDIA zwischen GPUs.

## Threads pro Warp

Ein Warp ist eine Gruppe von 32 Threads, die die GPU zusammen ausführt ([Lektion 01](../Lesson-01/notes.md)). Die Zahl 32 ist von der Hardware festgelegt und Teil der Compute-Capability-Spezifikation. Die GPU plant nie einzelne Threads ein. Sie plant immer ganze Warps mit 32 Threads ein.

Die Warp-Größe von 32 hat sich seit den ersten CUDA-GPUs (CC 1.0) nicht geändert.

## Warps und Threads pro SM

Ein SM ist der physische Prozessor, auf dem Blöcke laufen ([Lektion 02](../Lesson-02/notes.md)). Die Rechenzentrums-GPUs in der Tabelle halten bis zu 64 aktive Warps pro SM, also 64 x 32 = 2048 Threads. Die L40S ist anders: CC 8.9 erlaubt 48 Warps pro SM, also 48 x 32 = 1536 Threads.

Wenn manche Warps auf den Speicher warten, kann der Warp-Scheduler andere Warps auswählen. Mehr aktive Warps halten die Recheneinheiten beschäftigt, weil dann öfter ein Warp bereit zur Ausführung ist.

> [!WARNING]
> "64 Warps pro SM" gilt nicht für jede GPU. CC 8.6, 8.9 und 12.0 erlauben nur 48. Prüfe die Zahl für deine eigene GPU, bevor du damit planst.

## Grenze der Blockgröße

In [Lektion 02](../Lesson-02/notes.md) hat `<<<1, 2048>>>` kompiliert, aber nichts gestartet. Der Grund ist die maximale Blockgröße von 1024. Sie ist eine feste Regel in der Compute-Capability-Spezifikation, dieselbe 1024 in jeder Spalte der Tabelle.

Die Grenze gilt pro Block, nicht pro SM. Ein SM kann mehr Threads halten, als ein Block haben darf, solange sie aus mehreren Blöcken kommen. Auf der L40S passen 1536 Threads auf einen SM, zum Beispiel als 3 Blöcke mit 512 Threads. Auf der A100 passen 2048 Threads, zum Beispiel als 2 Blöcke mit 1024.

## FP32-Kerne pro SM

FP32 (32-Bit-Gleitkommazahl) ist der übliche Typ `float`. Rechenzentrums-GPUs mit Pascal, Volta und Ampere haben 64 FP32-Kerne pro SM. Ada Lovelace (die L40S), Hopper und Blackwell haben 128. Mehr FP32-Kerne bedeuten mehr Gleitkommaoperationen pro Taktzyklus auf jedem SM.

## Shared Memory pro SM

Shared Memory ist schneller Speicher in jedem SM. Alle Threads eines Blocks können ihn nutzen. Er ist über die Generationen gewachsen:

- Pascal: 64 KB
- Volta: bis zu 96 KB
- Ampere (A100): bis zu 164 KB
- Ada Lovelace (L40S): bis zu 100 KB
- Hopper und Blackwell: bis zu 228 KB

Mit mehr Shared Memory kann ein Kernel mehr Daten auf dem Chip halten, statt auf den Global Memory zuzugreifen.

## Glossar

- Compute Capability (CC): eine Versionsnummer (Major.Minor). Sie sagt, welche CUDA-Funktionen eine GPU unterstützt und welche Hardware-Grenzen sie hat.
- SM (Streaming Multiprocessor): der physische Prozessor in der GPU. Alle Threads laufen auf SMs.
- Warp: eine Gruppe von 32 Threads, die die GPU zusammen einplant und ausführt.
- aktive Warps pro SM: wie viele Warps ein SM gleichzeitig halten kann. 64 auf den meisten Rechenzentrums-GPUs, 48 bei CC 8.6, 8.9 und 12.0.
- FP32-Kern (32-Bit-Gleitkommazahl): eine Hardware-Einheit, die pro Taktzyklus eine 32-Bit-Gleitkommaoperation ausführt.
- Shared Memory: schneller Speicher auf dem Chip in jedem SM, den alle Threads eines Blocks teilen. Viel schneller als der Global Memory (Device-Speicher).
- Registerdatei: ein Vorrat an schnellem Speicher pro SM für die lokalen Variablen jedes Threads. Sie hat in allen gezeigten Generationen 65536 Register pro SM.
- KB (Kilobyte): 1024 Byte.
- HBM (High Bandwidth Memory): der schnelle, gestapelte Speicher auf Rechenzentrums-GPUs.
- CUDA Toolkit 12.8+: nötig, um Code für Blackwell (CC 10.0) zu kompilieren.
