# Lektion 05: Der CUDA-Plattform-Stack

Diese Lektion zeigt die ganze CUDA-Plattform, wie sie mit Toolkit 13.x für Blackwell ausgeliefert wird. Sie hat fünf Schichten: oben die Sprachen, unten die Hardware und dazwischen die Werkzeuge.

## Programmiersprachen

- CUDA C/C++ ist die Hauptsprache, um Kernel zu schreiben. Alle Lektionen von 00 bis 04 haben sie genutzt.
- OpenACC und CUDA Fortran bringen GPU-Unterstützung über Annotationen im Code. So musst du keine Kernel von Hand schreiben.
- Python erreicht die GPU über Bibliotheken wie CuPy und Numba.

Alle vier laufen auf derselben GPU-Hardware.

## Entwicklungswerkzeuge

- Nsight Systems zeichnet eine Zeitleiste der Arbeit auf CPU und GPU auf. Es zeigt, wo die Anwendung ihre Zeit verbringt.
- Nsight Compute schaut sich einen einzelnen Kernel an und zeigt, wie gut er die Hardware nutzt.
- Compute Sanitizer führt das Programm aus und meldet Speicherfehler in Kerneln.

## Compiler-Toolchain

`nvcc` kompiliert `.cu`-Dateien. Jede Lektion bisher hat es im Kompilierschritt aufgerufen. Es schickt den Host-Code an den normalen C++-Compiler und den Device-Code an den NVIDIA-Compiler. Aus dem Device-Code wird zuerst PTX. Das ist ein virtueller Befehlssatz, der an keine bestimmte GPU gebunden ist. Der GPU-Treiber macht aus PTX dann SASS, die echten Befehle für diese GPU. Die Binärdatei speichert das PTX. Deshalb kann dasselbe Programm ohne neuen Build auf zukünftigen GPUs laufen.

<nvcc-pipeline></nvcc-pipeline>

## Hardware-Fähigkeiten

- Tensor Cores sind Einheiten in jedem SM, die für Matrixrechnung gebaut sind. Sie sind getrennt von den FP32-Cores und bei Matrixarbeit mit FP16 und FP8 viel schneller.
- MIG teilt eine GPU in bis zu sieben unabhängige Teile. Jeder Teil verhält sich wie eine eigene GPU.
- Dynamic Parallelism erlaubt einem laufenden Kernel, von der GPU aus einen weiteren Kernel zu starten, ohne den Umweg über die CPU. In Lektion 00 hat die CPU die Kernel gestartet. Dynamic Parallelism verlegt diesen Schritt auf die GPU.
- GPU Direct lässt GPUs Daten direkt untereinander oder an eine Netzwerkkarte schicken, ohne den Umweg über den Systemspeicher.

> [!NOTE]
> Der SM ist der physische Prozessor, auf dem Blöcke laufen (Lektion 02). Lektion 03 hat die FP32-Cores pro SM aufgelistet.

## Schicht der KI-Frameworks

- cuDNN ist eine Bibliothek mit GPU-Operationen für Deep Learning. PyTorch und TensorFlow nutzen sie für Faltungen, Attention und ähnliche Operationen.
- TensorRT nimmt ein trainiertes Modell und bringt es auf einer bestimmten GPU schnell zum Laufen.
- NCCL übernimmt die Kommunikation zwischen GPUs. Du brauchst es, wenn du auf mehr als einer GPU gleichzeitig trainierst.

## Visualisierung

![CUDA-Plattform-Stack](05.png)

## Glossar

- PTX (Parallel Thread Execution): der Zwischenbefehlssatz, in den CUDA den Device-Code zuerst kompiliert. Er ist an keine bestimmte GPU gebunden. Der Treiber macht zur Laufzeit echte GPU-Befehle daraus.
- SASS (Streaming ASSembler): der echte Maschinencode für eine bestimmte GPU. Aus PTX wird SASS, bevor der Code läuft.
- `nvcc`: der CUDA-Compiler. Er verarbeitet Host-Code und Device-Code in derselben `.cu`-Datei.
- Nsight Systems: Profiler, der eine Zeitleiste der Arbeit auf CPU und GPU für die ganze Anwendung zeigt.
- Nsight Compute: Profiler, der misst, wie gut ein einzelner Kernel die GPU-Hardware nutzt.
- Compute Sanitizer: Werkzeug, das während der Laufzeit Speicherfehler in Kerneln findet.
- MIG (Multi-Instance GPU): teilt eine physische GPU in isolierte Teile. Jeder Teil verhält sich wie eine eigene GPU.
- Tensor Core: Einheit für Matrixmultiplikation in jedem SM. Bei Matrixarbeit schneller als normale FP32-Cores.
- Dynamic Parallelism: Ein Kernel auf der GPU kann einen weiteren Kernel starten, ohne den Umweg über die CPU.
- GPU Direct: lässt GPUs Daten untereinander oder an eine Netzwerkkarte schicken, ohne den Umweg über die CPU.
- NCCL: Bibliothek für die Kommunikation zwischen GPUs. Wird für verteiltes Training genutzt.
- cuDNN: Bibliothek mit GPU-Operationen für Deep Learning. PyTorch und TensorFlow nutzen sie im Hintergrund.
- TensorRT: bringt ein trainiertes Modell auf einer bestimmten GPU schnell zum Laufen.
