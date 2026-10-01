# Lektion 01: Ein Block, vier Threads

Diese Lektion ändert genau eine Sache an [Lektion 00](../Lesson-00/notes.md). Die Anzahl der Threads steigt von 1 auf 4, die Anzahl der Blöcke bleibt 1. Vier Threads führen denselben Kernel gleichzeitig aus, jeder mit einem anderen `threadIdx.x`.

> [!NOTE]
> Alle Ausgaben auf dieser Seite stammen von einer NVIDIA L40S mit CUDA 13.0 unter Ubuntu 24.

## Was sich ändert

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

Die GPU (Graphics Processing Unit) führt 4 Kopien von `printIDs` gleichzeitig aus. Jede Kopie bekommt ihr eigenes `threadIdx.x`, also 0, 1, 2 oder 3. `blockIdx.x` ist bei allen 0, weil es immer noch nur einen Block gibt.

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## SIMT (Single Instruction, Multiple Threads)

Alle 4 Threads führen dieselben Befehle aus, aber jeder hat seine eigene ID und seine eigenen Variablen. Thread 2 liest `threadIdx.x` und bekommt 2, Thread 3 bekommt 3. Deshalb gibt dieselbe `printf`-Zeile in jedem Thread eine andere Zahl aus. In diesem Kernel warten die Threads nicht aufeinander und teilen keine Daten. Dieses Modell heißt SIMT (Single Instruction, Multiple Threads, ein Befehl für viele Threads).

## Warps

Die GPU führt Threads in Gruppen von 32 aus. Diese Gruppen heißen Warps. Die Hardware plant Warps ein, keine einzelnen Threads. Wenn du 4 Threads startest, bildet die GPU einen Warp mit 32 Lanes, nutzt aber nur 4 davon. Die anderen 28 Lanes bleiben untätig.

Die Anzahl der Warps eines Blocks ist die Thread-Anzahl geteilt durch 32, aufgerundet. Ein Beispiel: Ein Block mit 100 Threads braucht 4 Warps. Das sind drei volle Warps mit je 32 Threads (96 Threads) und ein Warp mit nur 4 aktiven Threads.

> [!TIP]
> Wähle eine Blockgröße, die ein Vielfaches von 32 ist, zum Beispiel 128 oder 256. Dann hat kein Warp untätige Lanes.

> [!NOTE]
> Wenn Threads in einem Warp bei einem if/else verschiedene Zweige nehmen, führt die GPU die Pfade nacheinander aus. Das heißt Warp-Divergenz. In dieser Lektion passiert das nicht, weil alle 4 Threads dieselbe Zeile ausführen.

## Warum sich die Reihenfolge der Ausgabe ändert

`printf` in einem Kernel gibt nicht sofort etwas aus. Jeder Thread schreibt seine Zeile in einen Puffer im GPU-Speicher. Der Puffer wird ausgegeben, wenn die CPU auf die GPU wartet, hier bei `cudaDeviceSynchronize()`. Die Reihenfolge, in der die Threads schreiben, ist nicht festgelegt, nicht einmal innerhalb eines Warps. Deshalb kann sich die Reihenfolge der Ausgabe von Lauf zu Lauf ändern.

<printf-order threads="4"></printf-order>

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
    printIDs<<<1, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

Das ist der Code aus Lektion 00 mit einer Änderung. Die Startzeile lautet jetzt `printIDs<<<1, 4>>>();`, also führen vier Threads den Kernel aus.

## Code Schritt für Schritt

Geh das Programm in der Reihenfolge durch, in der du es schreiben würdest. Das meiste ist das Programm aus [Lektion 00](../Lesson-00/notes.md), deshalb liegt der Fokus auf dem Start.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header.** Dieselben drei `#include`-Zeilen wie in Lektion 00. Auf `stdio.h` kannst du nicht verzichten, weil der Kernel `printf` aufruft.
2. `5-8 gpu` **Der Kernel.** Schreib den Kernel genau wie vorher. Für mehr Threads änderst du ihn nicht: Jeder Thread führt denselben Code aus, und jeder liest sein eigenes `threadIdx.x`. Die Regel: Du schreibst den Code für einen Thread, und der Start entscheidet, wie viele Kopien laufen.
3. `10-11,14-15 cpu` **Die main-Funktion.** Schreib `main` mit `return 0;` am Ende, wie in Lektion 00. Die zwei Zeilen in der Mitte sind der einzige Host-Code, der mit der GPU spricht.
4. `12 cpu` **Der Start mit 4 Threads.** Die zweite Zahl in `<<<1, 4>>>` ist die Anzahl der Threads pro Block, also laufen 4 Threads. Ein häufiger Fehler ist, die Zahlen zu vertauschen: `<<<4, 1>>>` startet auch 4 Threads, aber als 4 Blöcke mit je 1 Thread, also ist jedes `threadIdx.x` gleich 0.
5. `13 cpu` **Auf die GPU warten.** `cudaDeviceSynchronize();` lässt die CPU warten, und genau dann wird auch der printf-Puffer auf den Bildschirm geschrieben. Die 4 Zeilen erscheinen in keiner festen Reihenfolge.

</div>

## Kompilieren und ausführen

Der erste Befehl kompiliert den Code zu einem Programm. Der zweite Befehl führt es aus.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` ist der CUDA-Compiler (Compute Unified Device Architecture). Er baut den CPU-Teil (Central Processing Unit) und den GPU-Teil der Datei.
- `-o first_kernel` gibt dem Programm den Namen `first_kernel`. Ohne diese Option heißt es `a.out`.
- `first_kernel.cu` ist die Quelldatei mit dem Code von oben.
- `./first_kernel` führt das Programm aus dem aktuellen Ordner aus.

## Ausgabe

Das Programm gibt 4 Zeilen aus, eine pro Thread:

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- Es gibt 4 Zeilen, weil 4 Threads laufen und jeder einmal etwas ausgibt.
- `Block ID` ist immer 0, weil es nur einen Block gibt.
- Jede `Thread ID` von 0 bis 3 kommt genau einmal vor, weil jeder Thread sein eigenes `threadIdx.x` hat.
- Hier ist die Reihenfolge 2, 0, 3, 1, aber bei dir kann sie anders sein. Die Threads schreiben in keiner festen Reihenfolge in den printf-Puffer, wie oben erklärt.

## Probier es aus

- Ändere den Start zu `<<<1, 32>>>`. Du bekommst 32 Zeilen mit den Thread-IDs 0 bis 31, wieder in keiner festen Reihenfolge. Das ist genau ein voller Warp.

## Selbst schreiben

Schreib einen Kernel, in dem jeder Thread sein eigenes `threadIdx.x` nutzt, um ein anderes Ergebnis zu berechnen.

1. Leg `square.cu` mit dem Gerüst unten an.
2. Speichere im Kernel `threadIdx.x` in einer Variablen `i` und gib `i` und `i * i` aus.
3. Starte 1 Block mit 5 Threads.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void square()
{
    // TODO: read this thread's ID into an int i
    // TODO: print "thread i: i * i = result"
}

int main()
{
    // TODO: launch square with 1 block of 5 threads
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "Hinweis"
    `int i = threadIdx.x;` gibt jedem Thread sein eigenes `i`. Die Anzahl der Threads pro Block ist die zweite Zahl: `<<<1, 5>>>`.

??? note "Lösung"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void square()
    {
        int i = threadIdx.x;
        printf("thread %d: %d * %d = %d\n", i, i, i, i * i);
    }

    int main()
    {
        square<<<1, 5>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Kompiliere und starte es mit `nvcc -o square square.cu` und `./square`. Du solltest 5 Zeilen sehen, eine für jeden Thread von 0 bis 4, zum Beispiel `thread 3: 3 * 3 = 9`. Die Reihenfolge der Zeilen kann sich von Lauf zu Lauf ändern.

## Glossar

- GPU (Graphics Processing Unit): der Prozessor, der Kernels ausführt.
- CPU (Central Processing Unit): der Hauptprozessor, der `main()` ausführt.
- Warp: eine Gruppe von 32 Threads, die die GPU zusammen als eine Einheit ausführt. Die GPU plant Warps ein, keine einzelnen Threads.
- Lane: einer der 32 Plätze in einem Warp. Jede aktive Lane führt einen Thread aus.
- SIMT (Single Instruction, Multiple Threads): Jeder aktive Thread in einem Warp führt denselben Befehl aus. Jeder Thread hat seine eigenen Daten und seine eigene ID.
- Warp-Divergenz: Threads in einem Warp nehmen verschiedene Pfade. Zum Beispiel geht Thread 0 in einen if-Zweig und Thread 1 nicht. Die GPU führt dann beide Pfade nacheinander aus, und das ist langsamer.
- printf-Puffer: `printf` auf der GPU schreibt nicht direkt auf den Bildschirm. Es schreibt in einen Puffer im GPU-Speicher. Der Puffer kommt auf den Bildschirm, wenn die CPU auf die GPU wartet, zum Beispiel bei `cudaDeviceSynchronize()`.
