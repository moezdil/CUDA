# Lektion 05: Der CUDA-Plattform-Stack

Die Lektionen 00 bis 04 haben nur einen kleinen Teil von CUDA (Compute Unified Device Architecture) genutzt: einen Kernel, in C/C++ geschrieben und mit `nvcc` kompiliert. Diese Lektion tritt einen Schritt zurück und zeigt die ganze Plattform, wie sie mit dem CUDA Toolkit 13 ausgeliefert wird. Wenn du die Schichten kennst, siehst du später leichter, wo jedes neue Werkzeug und jede neue Bibliothek hingehört.

## Die fünf Schichten

Die CUDA-Plattform hat fünf Schichten. Oben stehen die Sprachen, in denen du schreibst. Weiter unten liegt die Hardware der GPU (Graphics Processing Unit). Die KI-Bibliotheken (KI = künstliche Intelligenz, englisch AI, Artificial Intelligence) bauen auf allen auf. Klick auf eine Schicht oder einen Eintrag, um mehr darüber zu lesen.

<cuda-stack></cuda-stack>

1. Programmiersprachen: wie du GPU-Code schreibst.
2. Entwicklungswerkzeuge: wie du langsame Stellen und Fehler findest.
3. Compiler-Toolchain: wie aus deinem Quellcode GPU-Befehle werden.
4. Hardware-Fähigkeiten: besondere Einheiten und Funktionen der GPU selbst.
5. Schicht der KI-Frameworks: fertige Bibliotheken, die Deep-Learning-Frameworks nutzen.

## Programmiersprachen

- CUDA C/C++ ist die Hauptsprache, um Kernel zu schreiben. Alle Lektionen von 00 bis 04 haben sie genutzt.
- Mit CUDA Fortran schreiben Fortran-Programmierer ihre Kernel in Fortran statt in C++.
- OpenACC (Open Accelerators) geht den anderen Weg: Du setzt kurze Annotationen an normale Schleifen in C, C++ oder Fortran, und der Compiler macht daraus GPU-Code. Einen Kernel schreibst du nie von Hand.
- Python erreicht die GPU über Bibliotheken. CuPy gibt dir Arrays im NumPy-Stil, die auf der GPU liegen. Numba kompiliert Python-Funktionen zu GPU-Kerneln. NVIDIAs eigene CUDA-Python-Pakete (`cuda-python`) geben Python direkten Zugriff auf die APIs (Application Programming Interfaces) von CUDA-Treiber und CUDA-Runtime.

Am Ende laufen alle auf derselben GPU-Hardware, mit denselben Blöcken, Threads und Warps aus den Lektionen 00 bis 04.

## Entwicklungswerkzeuge

- Nsight Systems zeichnet eine Zeitleiste der Arbeit auf CPU (Central Processing Unit) und GPU für das ganze Programm auf. Es zeigt, wohin die Zeit geht, zum Beispiel ob die GPU untätig wartet, während die CPU Daten kopiert.
- Nsight Compute schaut sich einen einzelnen Kernel genau an und zeigt, wie gut er die Hardware nutzt.
- Compute Sanitizer führt das Programm aus und meldet Speicherfehler in Kerneln, etwa einen Thread, der über das Ende eines Arrays hinaus schreibt.

> [!TIP]
> Fang mit Nsight Systems an, um die langsame Stelle eines Programms zu finden. Nimm dann Nsight Compute für genau diesen einen Kernel. Einen Kernel zu messen, der nur 1 % der Laufzeit braucht, ist verschwendete Mühe.

## Compiler-Toolchain

`nvcc` (NVIDIA CUDA Compiler) kompiliert `.cu`-Dateien. Jede Lektion bisher hat es im Kompilierschritt genutzt. Es teilt die Datei in zwei Teile:

- Host-Code, also der Teil, der auf der CPU läuft, geht an den normalen C++-Compiler: `gcc` oder `clang` unter Linux, MSVC (Microsoft Visual C++) unter Windows.
- Device-Code, also die Kernel, übersetzen NVIDIAs eigene Werkzeuge in zwei Stufen. Zuerst wird daraus PTX (Parallel Thread Execution), ein virtueller Befehlssatz, der an keine bestimmte GPU gebunden ist. Dann wird aus PTX SASS (Streaming ASSembler), die echten Maschinenbefehle einer GPU-Generation.

<nvcc-pipeline></nvcc-pipeline>

Die Programmdatei kann SASS und PTX zugleich enthalten. Beim Start wählt der Treiber das SASS, das zur GPU passt. Gibt es keins, kompiliert er das PTX sofort zu SASS. Das nennt man JIT-Kompilierung (just-in-time).

Ein Beispiel: Lektion 06 baut mit `-arch=sm_89`. Damit landen SASS für Compute Capability (CC) 8.9 und PTX für CC 8.9 im Programm.

- Auf der L40S (CC 8.9) führt der Treiber das gespeicherte SASS direkt aus.
- Auf einer neueren GPU, zum Beispiel mit CC 12.0, gibt es kein SASS für 12.0. Der Treiber kompiliert beim Start das gespeicherte PTX zu SASS für CC 12.0, und das Programm läuft trotzdem.
- Auf einer älteren GPU, zum Beispiel mit CC 8.0, passt beides nicht, denn PTX für CC 8.9 kann Funktionen nutzen, die CC 8.0 nicht hat. Das Programm kann seine Kernel nicht starten.

> [!NOTE]
> JIT-Kompilierung kostet beim Programmstart Zeit, und der Treiber kann nur die Funktionen der PTX-Version nutzen, die er bekommen hat. Für die beste Geschwindigkeit auf einer GPU baust du SASS für die Compute Capability dieser GPU (Lektion 03).

## Hardware-Fähigkeiten

- Tensor Cores sind Einheiten in jedem SM (Streaming Multiprocessor), die für Matrixrechnung gebaut sind. Sie sind getrennt von den FP32-Cores (32-Bit-Gleitkomma), die du in Lektion 03 gezählt hast. Bei Matrixarbeit in kleineren Zahlenformaten wie FP16 (16-Bit-Gleitkomma) und FP8 (8-Bit-Gleitkomma) sind sie viel schneller. Deep Learning nutzt sie stark.
- MIG (Multi-Instance GPU) teilt eine Rechenzentrums-GPU in bis zu sieben isolierte Teile. Jeder Teil hat eigene SMs und eigenen Speicher und verhält sich wie eine eigene GPU. Eine A100 mit 80 GB (Gigabyte) lässt sich zum Beispiel in sieben Teile mit je etwa 10 GB aufteilen. So teilen sich sieben Nutzer eine Karte, ohne sich gegenseitig auszubremsen.
- Dynamic Parallelism erlaubt einem laufenden Kernel, von der GPU aus einen weiteren Kernel zu starten. In den Lektionen 00 bis 04 hat nur die CPU Kernel gestartet. Dynamic Parallelism verlegt diesen Schritt auf die GPU. So kann ein Kernel weitere Arbeit starten, ohne den Umweg über die CPU.
- GPUDirect lässt GPUs Daten direkt untereinander, an eine Netzwerkkarte oder an einen Speicher schicken, ohne den Umweg über den CPU-Speicher.
- NVLink ist NVIDIAs schnelle Direktverbindung zwischen GPUs. Sie ist viel schneller als PCIe (Peripheral Component Interconnect Express), der normale Steckplatz einer GPU.

Kleinere Zahlenformate sind wichtig, weil sie Speicher und Zeit sparen. Eine FP32-Zahl braucht 4 Byte, eine FP16-Zahl 2 Byte und eine FP8-Zahl 1 Byte. Ein Modell mit 1 Milliarde Zahlen braucht 4 GB in FP32, 2 GB in FP16 und 1 GB in FP8. Ein Tensor Core schafft außerdem mehr FP8-Rechnungen pro Sekunde als FP16-Rechnungen.

> [!NOTE]
> Nicht jede GPU hat jede Funktion. Die L40S, die diese Lektionen nutzen, hat FP8-Tensor-Cores, aber kein MIG, kein NVLink und GDDR6-Speicher statt HBM (High Bandwidth Memory) wie bei GPUs wie der H100 und der B200. Schau ins Datenblatt deiner eigenen GPU.

## Schicht der KI-Frameworks

- cuBLAS (CUDA Basic Linear Algebra Subprograms) ist NVIDIAs Bibliothek für Matrix- und Vektorrechnung auf der GPU. Sie gehört zum CUDA Toolkit.
- cuDNN (CUDA Deep Neural Network library) ist eine Bibliothek mit GPU-Operationen für Deep Learning, etwa Faltungen und Attention. PyTorch und TensorFlow rufen sie im Hintergrund auf.
- TensorRT nimmt ein trainiertes Modell und baut es so um, dass es auf einer bestimmten GPU so schnell wie möglich läuft.
- NCCL (NVIDIA Collective Communications Library, gesprochen wie "nickel") bewegt Daten zwischen GPUs, zum Beispiel um die Ergebnisse von acht GPUs zu addieren, die zusammen ein Modell trainieren. Es nutzt NVLink und GPUDirect, wenn sie verfügbar sind.

Wenn du PyTorch nutzt, rufst du diese Bibliotheken selten selbst auf. Trotzdem sind sie der Grund, warum eine einzige Zeile PyTorch-Code auf der GPU schnell laufen kann.

## Glossar

- CUDA (Compute Unified Device Architecture): NVIDIAs Plattform, um allgemeine Programme auf der GPU auszuführen.
- CUDA Fortran: Fortran mit Erweiterungen, um GPU-Kernel zu schreiben.
- OpenACC (Open Accelerators): Annotationen für Schleifen in C, C++ und Fortran, mit denen der Compiler GPU-Code für dich erzeugt.
- CuPy: Python-Bibliothek mit Arrays im NumPy-Stil auf der GPU.
- Numba: Python-Compiler, der Python-Funktionen zu GPU-Kerneln machen kann.
- CUDA Python (`cuda-python`): NVIDIAs Python-Pakete für direkten Zugriff auf die APIs von CUDA-Treiber und CUDA-Runtime.
- API (Application Programming Interface): die Menge an Funktionen, die eine Bibliothek deinem Code anbietet.
- `nvcc` (NVIDIA CUDA Compiler): der CUDA-Compiler. Er verarbeitet Host-Code und Device-Code in derselben `.cu`-Datei.
- MSVC (Microsoft Visual C++): der C++-Compiler, den `nvcc` unter Windows für Host-Code nutzt.
- PTX (Parallel Thread Execution): der virtuelle Befehlssatz, in den Device-Code zuerst kompiliert wird. Er ist an keine bestimmte GPU gebunden.
- SASS (Streaming ASSembler): der echte Maschinencode für eine GPU-Generation.
- JIT-Kompilierung (just-in-time): Der Treiber kompiliert beim Programmstart PTX zu SASS, wenn kein passendes SASS gespeichert ist.
- Nsight Systems: Profiler, der eine Zeitleiste der Arbeit auf CPU und GPU für das ganze Programm zeigt.
- Nsight Compute: Profiler, der misst, wie gut ein einzelner Kernel die GPU-Hardware nutzt.
- Compute Sanitizer: Werkzeug, das während der Laufzeit Speicherfehler in Kerneln findet.
- Tensor Core: Einheit für Matrixrechnung in jedem SM. Bei Matrixarbeit viel schneller als die FP32-Cores.
- FP32 / FP16 / FP8: Gleitkommazahlen mit 32, 16 und 8 Bit. Sie brauchen 4, 2 und 1 Byte.
- MIG (Multi-Instance GPU): teilt eine physische GPU in bis zu sieben isolierte Teile. Jeder Teil verhält sich wie eine eigene GPU.
- Dynamic Parallelism: Ein Kernel auf der GPU kann einen weiteren Kernel starten, ohne zur CPU zurückzugehen.
- GPUDirect: lässt GPUs Daten untereinander, an eine Netzwerkkarte oder an einen Speicher schicken, ohne über den CPU-Speicher zu gehen.
- NVLink: NVIDIAs schnelle Direktverbindung zwischen GPUs.
- PCIe (Peripheral Component Interconnect Express): der Standard-Steckplatz und -Bus, der eine GPU mit dem Rest des Computers verbindet.
- HBM (High Bandwidth Memory): sehr schneller GPU-Speicher auf Rechenzentrums-GPUs wie der H100 und der B200.
- cuBLAS (CUDA Basic Linear Algebra Subprograms): NVIDIAs GPU-Bibliothek für Matrix- und Vektorrechnung.
- cuDNN (CUDA Deep Neural Network library): Bibliothek mit GPU-Operationen für Deep Learning. PyTorch und TensorFlow nutzen sie im Hintergrund.
- TensorRT: bringt ein trainiertes Modell auf einer bestimmten GPU schnell zum Laufen.
- NCCL (NVIDIA Collective Communications Library): Bibliothek, um Daten zwischen GPUs zu bewegen. Wird für Training auf vielen GPUs genutzt.
