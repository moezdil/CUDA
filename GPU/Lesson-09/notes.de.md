# Compute Capability

Diese Lektion erklärt die Compute Capability: wie ihre Nummern funktionieren und wie sie festlegt, welche Funktionen und welche Versionen des CUDA-Toolkits du nutzen kannst.

## Was Compute Capability ist

Die Compute Capability (CC) ist NVIDIAs System, um die Funktionen und die Rechenleistung einer GPU zu beschreiben. Manchmal nennt man sie auch Versionsnummer.

Sie ist kein Marketing-Wert und kein Benchmark. Sie sagt genau, was eine GPU-Architektur kann und was nicht. Stell sie dir wie ein Datenblatt in einer einzigen Zahl vor.

## So funktioniert die Nummerierung

Die Compute Capability ist eine Versionsnummer, zum Beispiel 3.0, 5.1 oder 7.5. Die Regel ist für alle Generationen gleich:

- Die Zahl vor dem Punkt steht für eine große Änderung der Architektur
- Die Zahl nach dem Punkt steht für kleinere Verbesserungen oder Erweiterungen

Der Schritt von 7.x auf 8.x ist also nicht nur ein kleiner Geschwindigkeitsschub. Er bedeutet eine andere Architektur mit neuen Hardware-Einheiten und neuen Fähigkeiten.

## Die Architekturen

### Volta → CC 7.x

Volta hat die Tensor-Cores eingeführt. Das sind spezielle Einheiten, die Matrizenoperationen beschleunigen, wie sie in KI und Deep Learning vorkommen. Vor Volta liefen diese Operationen auf normalen CUDA-Cores. Ab Volta gab es dafür eigene Hardware.

### Ampere → CC 8.x

Ampere brachte stärkere und effizientere Tensor-Cores, eine höhere Speicherbandbreite und eine bessere Energieeffizienz. Es hat die Ideen von Volta verfeinert und ausgebaut.

### Hopper → CC 9.x

Hopper war wieder ein großer Schritt. Es hat neue Ausführungsmodelle eingeführt und die KI-Performance weiter nach vorn gebracht.

> [!WARNING]
> Hopper braucht das CUDA-Toolkit 11.8 oder höher. Eine niedrigere Version führt zu einem Kompatibilitätsfehler.

### Blackwell → CC 10.0 (B200/GB200) und 12.0 (RTX PRO / RTX 50 series)

Blackwell ist Stand 2026 die aktuelle Generation. Es hat Tensor-Cores der 5. Generation und ein neues Genauigkeitsformat namens NVFP4. NVFP4 verdoppelt den Durchsatz gegenüber FP8 bei der Inferenz großer Modelle. Frühere Architekturen haben keine FP4-Beschleunigung. Um nativ für Blackwell zu bauen, brauchst du das CUDA Toolkit 12.8.

## Unterstützte Funktionen

Die offizielle CUDA-Dokumentation hat Tabellen, die Funktionen den Versionen der Compute Capability zuordnen. Diese Tabellen zeigen klare Muster:

- GPUs mit CC 5.0 unterstützen keine Operationen mit halber Genauigkeit (FP16)
- Tensor-Cores gibt es erst ab CC 7.x
- FP8-Tensor-Cores kommen mit CC 8.9 (Ada Lovelace) und 9.0 (Hopper)
- NVFP4 braucht CC 10.0 oder höher

Eine fehlende Funktion fehlt komplett, denn Funktionen sind Hardware-Einheiten. Wenn deine GPU keine Tensor-Cores hat, kannst du sie nicht nutzen. Es gibt keinen Software-Trick und keine Emulation. Entweder hat die Hardware die Einheit, oder sie hat sie nicht.

Bevor du CUDA-Code schreibst, bei dem es auf Performance ankommt, frag dich also: "Unterstützt meine GPU, was ich brauche?" Diese Frage kommt vor der Frage "Ist meine GPU schnell genug?"

## Software-Kompatibilität

Die Compute Capability legt auch fest, welche Versionen des CUDA-Toolkits du nutzen kannst. Eine höhere Compute Capability erlaubt neuere Toolkits. Neuere Toolkits bringen mehr Funktionen und bessere Optimierungen.

Einige Beispiele:

- Maxwell (CC 5.x) - braucht CUDA 6.5 oder höher
- Hopper (CC 9.x) - braucht CUDA 11.8 oder höher
- Blackwell (CC 10.0) - braucht CUDA 12.8 für native cubin-Unterstützung

Ein Toolkit unter der Mindestversion für deine Architektur führt zu einem harten Fehler. Der Code lässt sich nicht kompilieren, oder er schlägt zur Laufzeit fehl.

Der Ablauf ist immer gleich:

1. Finde die Compute Capability deiner GPU heraus.
2. Wähle deine CUDA-Version.
3. Schreib deinen Code.

<cc-explorer></cc-explorer>

## Die unterste Ebene (PTX)

CUDA-Code läuft nicht direkt auf der GPU. Er wird zuerst zu PTX kompiliert. PTX ist eine maschinennahe Zwischensprache, so etwas wie eine Assemblersprache für NVIDIA-GPUs.

Manche PTX-Befehle brauchen Hardware-Einheiten, die es erst ab einer bestimmten Compute Capability gibt. Warp-Shuffle-Funktionen sind ein Beispiel.

> [!NOTE]
> Mit Warp-Shuffle-Funktionen können Threads in einem Warp Daten teilen, ohne Shared Memory oder Global Memory zu nutzen. Warp Shuffle gibt es seit CC 3.0 (Kepler).

Liegt deine GPU unter der Mindestversion, können diese Befehle nicht laufen. Die Hardware dafür ist einfach nicht auf dem Chip.

## Zusammenfassung

Dieselbe Regel gilt für Machine-Learning-Pipelines, Physiksimulationen und eigene CUDA-Kernel. Die Compute Capability deiner GPU ist der Vertrag zwischen deiner Hardware und deinem Code.

Kenne deine CC-Nummer. Gleiche sie mit der CUDA-Dokumentation ab. Wähle die richtige Toolkit-Version. Dann leg los. Performance-Tuning, Optimierung und die Auswahl der Funktionen fangen alle hier an.

> Die Compute Capability ist nicht nur eine Versionsnummer. Sie legt fest, was deine GPU wirklich kann.

## Glossar

- Compute Capability (CC): NVIDIAs Versionsnummer, die sagt, was eine GPU-Architektur kann und was nicht.
- Hauptnummer: die Zahl vor dem Punkt. Sie steht für eine große Änderung der Architektur.
- Nebennummer: die Zahl nach dem Punkt. Sie steht für kleinere Verbesserungen oder Erweiterungen.
- Tensor-Cores: spezielle Einheiten, die Matrizenoperationen für KI beschleunigen. Es gibt sie ab CC 7.x.
- FP16: Operationen mit halber Genauigkeit. GPUs mit CC 5.0 unterstützen sie nicht.
- NVFP4: ein Genauigkeitsformat von Blackwell, das den Durchsatz gegenüber FP8 bei der Inferenz großer Modelle verdoppelt.
- PTX: eine maschinennahe Zwischensprache, wie Assembler für NVIDIA-GPUs. CUDA-Code wird zuerst zu PTX kompiliert.
- Warp Shuffle: Funktionen, mit denen Threads in einem Warp Daten teilen können, ohne Shared Memory oder Global Memory zu nutzen.
