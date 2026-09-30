# Lektion 03: Compute Capability

Die Compute Capability (CC) ist eine Versionsnummer für eine GPU-Generation. Sie legt die Features und Hardwaregrenzen fest, die du in den Lektionen 00 bis 02 kennengelernt hast, zum Beispiel Warps und die Grenze von 1024 Threads pro Block. Jedes CUDA-Feature braucht eine Mindestversion der Compute Capability.

## Was die Zahl bedeutet

Das Format ist major.minor, zum Beispiel 9.0 für Hopper. Eine neue Major-Version ist eine neue Architektur-Generation mit neuer Hardware. Eine neue Minor-Version ist eine Überarbeitung innerhalb derselben Generation. Code, der für CC 7.0 gebaut ist, läuft auf jeder GPU mit CC 7.0 oder höher. Code, der Features von CC 9.0 nutzt, läuft nicht auf älteren GPUs.

<cc-explorer></cc-explorer>

## GPU-Generationen

Die Tabelle zeigt Rechenzentrums-GPUs von Pascal bis Blackwell.

> [!NOTE]
> Die Daten stammen aus dem NVIDIA CUDA Programming Guide, dem Blackwell Tuning Guide und dem Hopper Tuning Guide (CUDA Toolkit 13.2, 2025-2026).

| Merkmal                | P100 (CC 6.0)     | V100 (CC 7.0)     | A100 (CC 8.0)     | H100 (CC 9.0)     | B100 (CC 10.0)    |
|------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| GPU                    | Tesla P100        | Tesla V100        | A100              | H100              | B100              |
| Codename               | GP100             | GV100             | GA100             | GH100             | GB100             |
| Architektur            | Pascal            | Volta             | Ampere            | Hopper            | Blackwell         |
| Threads / Warp         | 32                | 32                | 32                | 32                | 32                |
| Max. Warps / SM        | 64                | 64                | 64                | 64                | 64                |
| Max. Threads / SM      | 2048              | 2048              | 2048              | 2048              | 2048              |
| Max. Blöcke / SM       | 32                | 32                | 32                | 32                | 32                |
| Max. Register / SM     | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max. Register / Block  | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max. Register / Thread | 255               | 255               | 255               | 255               | 255               |
| Max. Blockgröße        | 1024              | 1024              | 1024              | 1024              | 1024              |
| FP32-Cores / SM        | 64                | 64                | 64                | 128               | 128               |
| Shared Memory / SM     | 64 KB             | bis zu 96 KB      | bis zu 164 KB     | bis zu 228 KB     | bis zu 228 KB     |

H100 und B100 haben dieselben Grenzen für Threads und Speicher pro SM. Die Anzahl der Threads und Register pro SM hat sich nicht geändert.

> [!NOTE]
> Blackwell ist trotzdem schneller als Hopper. Gründe sind mehr SMs (148 bei der B200 gegenüber 132 bei der H100 SXM5), Tensor Cores der 5. Generation, die Bandbreite von HBM3e und NVLink 5.0.

## Threads pro Warp

Ein Warp ist eine Gruppe von 32 Threads, die die GPU gemeinsam ausführt (Lektion 01). Die Zahl 32 ist durch die Hardware festgelegt und gehört zur Spezifikation der Compute Capability. Die GPU plant nie einzelne Threads ein. Sie plant immer ganze Warps mit 32 Threads ein.

> [!NOTE]
> Die Warp-Größe von 32 hat sich seit den ersten CUDA-GPUs (CC 1.0) nicht geändert.

## Warps und Threads pro SM

Ein SM ist der physische Prozessor, auf dem Blöcke laufen (Lektion 02). Jeder SM kann bis zu 64 aktive Warps halten, also 2048 Threads. Wenn einige Warps auf den Speicher warten, kann der Warp-Scheduler andere Warps wählen. Mehr aktive Warps halten die Recheneinheiten beschäftigt, weil dann öfter ein Warp bereit ist.

## Grenze für die Blockgröße

In Lektion 02 hat `<<<1, 2048>>>` kompiliert, aber nichts gestartet. Der Grund ist die maximale Blockgröße von 1024. Das ist eine harte Grenze aus der Spezifikation der Compute Capability. Ein Block muss auf einen SM passen, und das feste Register-Budget des SM begrenzt, wie groß ein Block sein kann.

## FP32-Cores pro SM

Pascal, Volta und Ampere haben 64 FP32-Cores pro SM. Hopper und Blackwell haben 128. Mehr FP32-Cores bedeuten mehr Gleitkomma-Operationen pro Taktzyklus auf jedem SM.

## Shared Memory pro SM

Shared Memory ist schneller Speicher in jedem SM. Alle Threads in einem Block können ihn nutzen. Er ist über die Generationen gewachsen:

- Pascal: 64 KB
- Volta: bis zu 96 KB
- Ampere: bis zu 164 KB
- Hopper und Blackwell: bis zu 228 KB

Mit mehr Shared Memory kann ein Kernel mehr Daten direkt auf dem Chip halten, statt auf den globalen Speicher zuzugreifen.

## Visualisierung

<cc-progress></cc-progress>

## Glossar

- Compute Capability: eine Versionsnummer (major.minor). Sie sagt, welche CUDA-Features eine GPU unterstützt und welche Hardwaregrenzen sie hat.
- SM (Streaming-Multiprozessor): der physische Prozessor in der GPU. Alle Threads laufen auf SMs.
- Warp: eine Gruppe von 32 Threads, die die GPU gemeinsam einplant und ausführt.
- FP32-Core: eine Hardwareeinheit, die pro Taktzyklus eine 32-Bit-Gleitkomma-Operation ausführt.
- Shared Memory: schneller Speicher auf dem Chip in jedem SM, den sich alle Threads eines Blocks teilen. Viel schneller als globaler Speicher (Device-Speicher).
- Registerdatei: ein Pool aus schnellem Speicher pro SM für die lokalen Variablen jedes Threads. In allen gezeigten Generationen hat sie 65536 Register pro SM.
- CUDA Toolkit 12.8+: nötig, um Code für Blackwell (CC 10.0) zu kompilieren.
