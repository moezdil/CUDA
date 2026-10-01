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

## Glossar

- GPU (Graphics Processing Unit): der Prozessor, der Kernels ausführt.
- CPU (Central Processing Unit): der Hauptprozessor, der `main()` ausführt.
- Warp: eine Gruppe von 32 Threads, die die GPU zusammen als eine Einheit ausführt. Die GPU plant Warps ein, keine einzelnen Threads.
- Lane: einer der 32 Plätze in einem Warp. Jede aktive Lane führt einen Thread aus.
- SIMT (Single Instruction, Multiple Threads): Jeder aktive Thread in einem Warp führt denselben Befehl aus. Jeder Thread hat seine eigenen Daten und seine eigene ID.
- Warp-Divergenz: Threads in einem Warp nehmen verschiedene Pfade. Zum Beispiel geht Thread 0 in einen if-Zweig und Thread 1 nicht. Die GPU führt dann beide Pfade nacheinander aus, und das ist langsamer.
- printf-Puffer: `printf` auf der GPU schreibt nicht direkt auf den Bildschirm. Es schreibt in einen Puffer im GPU-Speicher. Der Puffer kommt auf den Bildschirm, wenn die CPU auf die GPU wartet, zum Beispiel bei `cudaDeviceSynchronize()`.
