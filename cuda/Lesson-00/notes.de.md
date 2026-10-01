# Lektion 00: Ein Block, ein Thread

In dieser Lektion läuft das einfachste CUDA-Programm (Compute Unified Device Architecture), das es gibt. Sein Kernel nutzt einen Block und einen Thread, ganz ohne Parallelität. So siehst du die erste Ausgabe, bevor es kompliziert wird. Jede spätere Lektion ändert dieses Programm ein kleines Stück.

> [!NOTE]
> Alle Ausgaben auf dieser Seite stammen von einer NVIDIA L40S mit CUDA 13.0 unter Ubuntu 24.

## GPU vs. CPU

Auf der CPU (Central Processing Unit, Hauptprozessor) läuft eine Funktion einmal auf einem Kern. Auf der GPU (Graphics Processing Unit, Grafikprozessor) läuft ein Kernel viele Male parallel. Ein Kernel ist eine Funktion, die auf der GPU läuft. Jede laufende Kopie davon heißt Thread. Zwei Zahlen legen fest, wie viele Threads laufen: die Anzahl der Blöcke und die Anzahl der Threads pro Block.

Ein Beispiel: 2 Blöcke mit je 3 Threads starten 2 x 3 = 6 Threads. Alle 6 führen denselben Kernel-Code aus.

## Was `__global__` bedeutet

```c
__global__ void printIDs() { ... }
```

`__global__` markiert eine Funktion als GPU-Kernel. Der Compiler baut sie für die GPU, nicht für die CPU. Die CPU ruft sie auf, aber sie läuft auf der GPU.

> [!NOTE]
> Es gibt noch zwei weitere Qualifier. `__device__` läuft auf der GPU und lässt sich nur aus GPU-Code aufrufen. `__host__` ist eine normale CPU-Funktion, die sich nur von der CPU aus aufrufen lässt.

## Startkonfiguration `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

Die Syntax `<<<...>>>` ist die Ausführungskonfiguration. Sie steht zwischen dem Funktionsnamen und der Argumentliste. Die erste Zahl ist die Anzahl der Blöcke. Die zweite Zahl ist die Anzahl der Threads pro Block. `<<<1, 1>>>` heißt: ein Block mit einem Thread. Insgesamt sind das 1 x 1 = 1 Thread.

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## Thread, Block, Grid

Jeder Kernel-Start erzeugt drei Ebenen:

- Thread: die kleinste Einheit. Ein Thread führt eine Kopie des Kernels aus.
- Block: eine Gruppe von Threads, die auf einem SM (Streaming Multiprocessor) läuft. Ein SM ist einer der vielen kleinen Prozessoren in einer GPU. Die Threads eines Blocks können sich Speicher teilen.
- Grid: alle Blöcke eines Kernel-Starts. Ein Start, ein Grid.

<cuda-hierarchy></cuda-hierarchy>

> [!NOTE]
> Eine GPU hat viele SMs. Die L40S in diesen Lektionen hat 142. Ein Block wird nie auf zwei SMs aufgeteilt, aber verschiedene Blöcke können gleichzeitig auf verschiedenen SMs laufen. [Lektion 02](../Lesson-02/notes.md) nutzt das.

## `blockIdx.x` und `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x` ist der Index des Blocks, in dem dieser Thread liegt. `threadIdx.x` ist der Index dieses Threads innerhalb seines Blocks. Beide beginnen bei 0. Beide haben die Teile `.x`, `.y` und `.z`, denn Grids und Blöcke können 1D, 2D oder 3D sein (ein-, zwei- oder dreidimensional). Für 1D-Aufgaben brauchst du nur `.x`. Bei `<<<1, 1>>>` sind beide immer 0.

## Header-Dateien

- `cuda_runtime.h`: die CUDA-Runtime-API (Application Programming Interface, Programmierschnittstelle). Sie deklariert `cudaDeviceSynchronize()` und die Funktionen zur Fehlerprüfung.
- `stdio.h`: Standard-C, nötig für `printf`.
- `device_launch_parameters.h`: macht `blockIdx`, `threadIdx`, `blockDim` und `gridDim` dem Editor bekannt, wenn du MSVC (Microsoft Visual C++) oder bestimmte IDEs (Integrated Development Environments, Entwicklungsumgebungen) nutzt. `nvcc` braucht sie nicht, aber sie schadet auch nicht.

## `cudaDeviceSynchronize()`

Kernel-Starts sind asynchron. Die CPU startet den Kernel und geht sofort zur nächsten Zeile. Ohne `cudaDeviceSynchronize()` kehrt `main()` zurück, und das Programm endet, bevor die GPU etwas ausgibt. Diese Funktion lässt die CPU warten, bis die GPU mit allem fertig ist.

<kernel-sync></kernel-sync>

> [!WARNING]
> Wenn du `cudaDeviceSynchronize()` vergisst, kompiliert und läuft das Programm trotzdem ohne Fehler. Es gibt nur nichts aus.

## Code

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printIDs()
{
    printf("\nBlock ID: %d  ===  Thread ID: %d", blockIdx.x, threadIdx.x);
}

int main()
{
    printIDs<<<1, 1>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- Die drei `#include`-Zeilen laden die oben beschriebenen Header.
- `printIDs` ist der Kernel. Jeder Thread gibt seine Block-ID und seine Thread-ID aus. Das `\n` am Anfang des Strings setzt jede Ausgabe in eine neue Zeile.
- `printIDs<<<1, 1>>>();` startet den Kernel mit einem Block aus einem Thread.
- `cudaDeviceSynchronize();` wartet auf die GPU. So erscheint die Ausgabe, bevor das Programm endet.

## Kompilieren und ausführen

Der erste Befehl kompiliert den Code zu einem Programm. Der zweite Befehl führt es aus.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` ist der CUDA-Compiler. Er baut den CPU-Teil und den GPU-Teil der Datei.
- `-o first_kernel` gibt dem Programm den Namen `first_kernel`. Ohne diese Option heißt es `a.out`.
- `first_kernel.cu` ist die Quelldatei mit dem Code von oben. CUDA-Quelldateien enden auf `.cu`.
- `./first_kernel` führt das Programm aus. Das `./` sagt der Shell, dass sie im aktuellen Ordner suchen soll.

## Ausgabe

```
Block ID: 0  ===  Thread ID: 0
```

- Es gibt eine Zeile, weil es einen Thread gibt und jeder Thread einmal etwas ausgibt.
- Beide IDs sind 0, weil der einzige Block und der einzige Thread jeweils den Index 0 bekommen.
- Die Ausgabe ist bei jedem Lauf gleich. Ein einzelner Thread hat keinen anderen Thread, mit dem er um die Wette läuft.

## Glossar

- CUDA (Compute Unified Device Architecture): die Plattform von NVIDIA, mit der du eigenen Code auf der GPU ausführst.
- GPU (Graphics Processing Unit): der Prozessor mit Tausenden kleiner Kerne, der Kernels ausführt.
- CPU (Central Processing Unit): der Hauptprozessor. Er führt `main()` aus und startet Kernels.
- Kernel: eine Funktion, die auf der GPU läuft. Du schreibst sie einmal, und die GPU führt sie gleichzeitig in vielen Threads aus.
- Thread: die kleinste Ausführungseinheit. Ein Thread ist eine laufende Kopie des Kernels mit eigener ID.
- Block: eine Gruppe von Threads, die auf einem SM läuft. Sie können über Shared Memory Daten teilen.
- Grid: alle Blöcke, die ein Kernel-Aufruf startet.
- SM (Streaming Multiprocessor): einer der Prozessoren in der GPU. Blöcke laufen auf SMs.
- `__global__`: sagt dem Compiler, dass diese Funktion ein GPU-Kernel ist. Die CPU ruft sie auf, die GPU führt sie aus.
- `blockIdx.x`: der Index des Blocks, in dem der aktuelle Thread liegt. Beginnt bei 0.
- `threadIdx.x`: der Index des aktuellen Threads innerhalb seines Blocks. Beginnt bei 0.
- `cudaDeviceSynchronize()`: lässt die CPU warten, bis die GPU ihre ganze Arbeit erledigt hat.
- asynchron: Die CPU wartet nicht. Sie schickt einen Befehl an die GPU und macht sofort weiter.
- API (Application Programming Interface): die Menge an Funktionen, die eine Bibliothek anbietet, hier die Funktionen der CUDA-Runtime.
