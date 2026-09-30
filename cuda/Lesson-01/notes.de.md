# Lektion 01: Ein Block, vier Threads

Diese Lektion ändert genau eine Sache an Lektion 00. Die Anzahl der Threads steigt von 1 auf 4, die Anzahl der Blöcke bleibt 1. Vier Threads führen gleichzeitig denselben Kernel aus, jeder mit einem anderen `threadIdx.x`.

## Was sich ändert

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

Die GPU führt gleichzeitig 4 Kopien von `printIDs` aus. Jede Kopie bekommt ihr eigenes `threadIdx.x`: 0, 1, 2 oder 3. `blockIdx.x` ist bei allen 0, weil es immer noch nur einen Block gibt.

## SIMT (Single Instruction, Multiple Threads)

Jeder Thread läuft für sich. Threads warten nicht aufeinander und arbeiten nicht zusammen. Alle führen gleichzeitig dieselben Befehle aus, aber mit unterschiedlichen ID-Werten. Dieses Modell heißt SIMT (Single Instruction, Multiple Threads).

## Warps

Die GPU führt Threads in Gruppen von 32 aus. Diese Gruppen heißen Warps. Die Hardware plant Warps ein, nicht Blöcke. Wenn du 4 Threads startest, bildet die GPU einen vollen Warp mit 32 Lanes, nutzt aber nur 4 davon. Hier machen die 4 Threads alle dasselbe. Deshalb bleiben sie alle auf demselben Pfad.

> [!NOTE]
> Wenn Threads in einem Warp bei einem if/else verschiedene Zweige nehmen, führt die GPU die Pfade nacheinander aus. Das nennt man Warp-Divergenz. In dieser Lektion passiert das nicht.

## Warum sich die Reihenfolge der Ausgabe ändert

`printf` in einem Kernel gibt nicht sofort etwas aus. Jeder Thread schreibt in einen gemeinsamen Ringpuffer im GPU-Speicher. Der Puffer wird ausgegeben, wenn `cudaDeviceSynchronize()` aufgerufen wird. Die Reihenfolge, in der die Threads schreiben, ist nicht festgelegt, selbst innerhalb eines Warps. Deshalb ändert sich die Reihenfolge der Ausgabe von Lauf zu Lauf.

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

Das ist der Code aus Lektion 00 mit einer Änderung. Die Startzeile lautet jetzt `printIDs<<<1, 4>>>();`. Also führen vier Threads den Kernel aus.

## Kompilieren und ausführen

Der erste Befehl kompiliert den Code zu einem Programm. Der zweite Befehl führt es aus.

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc` ist der CUDA-Compiler. Er baut den CPU-Teil und den GPU-Teil der Datei.
- `first_kernel.cu` ist die Quelldatei mit dem Code von oben. CUDA-Quelldateien enden auf `.cu`.
- `-o first_kernel` gibt dem Programm den Namen `first_kernel`. Ohne diese Option heißt es `a.out`.
- `./first_kernel` führt das Programm aus. Das `./` sagt der Shell, dass sie im aktuellen Ordner suchen soll.

Das Programm gibt 4 Zeilen aus, eine pro Thread:

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- Es sind 4 Zeilen, weil 4 Threads laufen und jeder einmal etwas ausgibt.
- `Block ID` ist immer 0, weil es nur einen Block gibt.
- Jede `Thread ID` von 0 bis 3 kommt genau einmal vor, weil jeder Thread sein eigenes `threadIdx.x` hat.
- Hier ist die Reihenfolge 2, 0, 3, 1. Bei dir kann sie anders sein. Die Threads schreiben in keiner festen Reihenfolge in den printf-Puffer, wie oben erklärt.

## Visualisierung

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## Glossar

- Warp: eine Gruppe von 32 Threads, die die GPU gemeinsam als eine Einheit ausführt. Die GPU plant Warps ein, nicht einzelne Threads.
- SIMT (Single Instruction, Multiple Threads): Jeder aktive Thread in einem Warp führt im selben Taktzyklus denselben Befehl aus. Jeder Thread hat seine eigenen Daten und seine eigene ID.
- Warp-Divergenz: Threads in einem Warp nehmen verschiedene Pfade. Zum Beispiel geht Thread 0 in einen if-Zweig und Thread 1 nicht. Die GPU führt dann beide Pfade nacheinander aus, und das ist langsamer.
- printf-Puffer: printf auf der GPU schreibt nicht direkt auf den Bildschirm. Es schreibt in einen Puffer im GPU-Speicher. Der Puffer landet erst auf dem Bildschirm, wenn du `cudaDeviceSynchronize()` aufrufst.
