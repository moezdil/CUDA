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

## Code Schritt für Schritt

Geh das Programm in der Reihenfolge durch, in der du es in einer leeren Datei schreiben würdest.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header.** Tippe zuerst die drei `#include`-Zeilen, denn alles darunter nutzt Namen, die sie deklarieren. `cuda_runtime.h` bringt `cudaDeviceSynchronize()` mit, und `stdio.h` bringt `printf` mit. Ohne `stdio.h` lässt sich der `printf`-Aufruf im Kernel nicht kompilieren.
2. `5-6,8 gpu` **Der leere Kernel.** Schreib das Gerüst des Kernels vor seinem Rumpf: `__global__`, den Rückgabetyp `void`, einen Namen und ein leeres Paar geschweifter Klammern. Ein Kernel muss `void` zurückgeben, weil kein Aufrufer auf einen Wert wartet. Wenn du `__global__` weglässt, baut der Compiler eine normale CPU-Funktion, und die Startzeile weiter unten lässt sich nicht kompilieren.
3. `7 gpu` **Der Rumpf des Kernels.** Füge ein `printf` ein, das `blockIdx.x` und `threadIdx.x` ausgibt. Diese Zeile läuft einmal in jedem Thread, auf der GPU. Jedes `%d` wird mit dem Wert gefüllt, der nach dem String steht, in derselben Reihenfolge.
4. `10-11,14-15 cpu` **Die main-Funktion.** Schreib jetzt `main` mit seinen Klammern und `return 0;`, dann füll die Mitte. Das ist normaler C-Code, der auf der CPU läuft.
5. `12 cpu` **Der Start.** Ruf den Kernel mit seinem Namen auf, dann `<<<1, 1>>>`, dann die Argumentliste `()`. Die Regel: zuerst die Blöcke, danach die Threads pro Block. Das leere `()` brauchst du trotzdem, auch wenn `printIDs` keine Argumente nimmt.
6. `13 cpu` **Auf die GPU warten.** Der Start kehrt sofort zurück, also füge direkt danach `cudaDeviceSynchronize();` ein. Das ist der häufigste erste Fehler: Ohne diese Zeile kompiliert das Programm, läuft und gibt nichts aus.

</div>

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

## Selbst schreiben

Schreib von Grund auf einen Kernel mit einem Thread, der dich von der GPU aus begrüßt.

1. Leg eine Datei `hello.cu` mit dem Gerüst unten an.
2. Schreib den Kernel `hello`, der mit `blockIdx.x` und `threadIdx.x` den Text `Hello from block 0, thread 0` ausgibt.
3. Starte ihn mit einem Block aus einem Thread und lass die CPU auf ihn warten.

```c
#include "cuda_runtime.h"
#include <stdio.h>

// TODO: write the kernel hello() that prints its block ID and thread ID

int main()
{
    // TODO: launch hello with 1 block of 1 thread
    // TODO: wait for the GPU to finish
    return 0;
}
```

??? tip "Hinweis"
    Ein Kernel beginnt mit `__global__ void`. Der Start sieht so aus: `hello<<<1, 1>>>();`, und das Warten ist `cudaDeviceSynchronize();`.

??? note "Lösung"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void hello()
    {
        printf("Hello from block %d, thread %d\n", blockIdx.x, threadIdx.x);
    }

    int main()
    {
        hello<<<1, 1>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Kompiliere und starte es mit `nvcc -o hello hello.cu` und `./hello`. Du solltest eine Zeile sehen: `Hello from block 0, thread 0`.

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
