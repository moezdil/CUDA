# Lektion 02: Zwei Blöcke mit je 1024 Threads

Ein Block kann höchstens 1024 Threads enthalten. Wenn du mehr Threads willst, nimmst du mehr Blöcke. Diese Lektion startet 2 Blöcke x 1024 Threads = 2048 Threads.

## Die Grenze von 1024 Threads

Ein Block muss auf einen Streaming-Multiprozessor (SM) passen. Ein SM hat eine feste Anzahl an Registern, eine feste Menge Shared Memory und eine feste Kapazität für den Warp-Scheduler. Wenn ein Block mehr als 1024 Threads verlangt, kann der SM ihn nicht aufnehmen. Der CUDA-Treiber lehnt den Start dann ab.

## Streaming-Multiprozessoren (SMs)

Ein SM ist die physische Recheneinheit in der GPU. Jeder SM hat CUDA-Cores, eine Registerdatei, Shared Memory, L1-Cache und Warp-Scheduler. Beim Start verteilt der Treiber die Blöcke auf die freien SMs. Ein SM kann einen oder mehrere Blöcke ausführen. Das hängt davon ab, wie viele Ressourcen jeder Block braucht.

> [!NOTE]
> Wie viele SMs es gibt, hängt von der GPU ab. Eine Mittelklasse-GPU wie die RTX 3080 hat 68 SMs.

## Thread-IDs bei mehreren Blöcken

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

Block 0 hat die Threads 0-1023. Block 1 hat eigene Threads 0-1023. Die Thread-IDs beginnen in jedem Block wieder bei 0. Für eine eindeutige globale ID nimmst du diese Formel:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` ist eine eingebaute Variable. Sie enthält die Anzahl der Threads pro Block, die du beim Start festlegst. Hier ist das 1024. Kernel, die mit Arrays arbeiten, geben jedem Thread mit dieser Formel ein Element.

## Der stille Fehler: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

Diese Zeile kompiliert ohne Fehler. Die Grenze von 1024 prüft der Treiber zur Laufzeit, nicht der Compiler. Beim Start sieht der Treiber die ungültige Konfiguration und verwirft den ganzen Kernel-Aufruf. Es gibt keine Ausgabe, keinen Absturz und keine Fehlermeldung. Ruf nach dem Kernel `cudaGetLastError()` auf, um den Fehler zu erkennen.

> [!TIP]
> Nimm die Zeile aus dem Kommentar, führe sie aus und vergleiche die Ausgabe.

## Scheduling der Blöcke

Die Reihenfolge, in der Blöcke auf SMs laufen, ist nicht deterministisch. Der Treiber gibt jeden Block dem SM, der zuerst frei ist. Block 0 und Block 1 können gleichzeitig auf verschiedenen SMs laufen. Deshalb mischen sich ihre Ausgabezeilen bei jedem Lauf in einer anderen Reihenfolge.

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
    // printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit, launches nothing at runtime
    printIDs<<<2, 1024>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- Die auskommentierte Zeile ist der ungültige Start aus dem Abschnitt oben. Sie bleibt auskommentiert, damit das Programm funktioniert.
- `printIDs<<<2, 1024>>>();` startet 2 Blöcke mit je 1024 Threads. Das bleibt innerhalb der Grenze und führt trotzdem 2048 Threads aus.
- Der Rest ist wie in Lektion 00 und Lektion 01.

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

Das Programm gibt 2048 Zeilen aus, eine pro Thread. Hier sind die ersten davon:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- Die `...` stehen für den Rest der 2048 Zeilen.
- `Block ID` ist 0 oder 1, weil es zwei Blöcke gibt.
- Jede `Thread ID` von 0 bis 1023 kommt zweimal vor, einmal in jedem Block. Die Thread-IDs beginnen in jedem Block wieder bei 0.
- Die Zeilen von Block 0 und Block 1 mischen sich, und die Reihenfolge ändert sich von Lauf zu Lauf. Die beiden Blöcke können gleichzeitig auf verschiedenen SMs laufen, wie unter Scheduling der Blöcke erklärt.

## Visualisierung

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

## Glossar

- SM (Streaming-Multiprozessor): der physische Prozessor in der GPU. Blöcke laufen auf SMs. Ein SM kann mehrere Blöcke gleichzeitig ausführen, wenn er genug Ressourcen hat.
- `blockDim.x`: eingebaute Variable mit der Anzahl der Threads pro Block. Sie ist die zweite Zahl in `<<<blocks, threads>>>`.
- globale Thread-ID: eine eindeutige ID für jeden Thread im ganzen Grid. Sie ist `blockIdx.x * blockDim.x + threadIdx.x`. Thread-IDs wiederholen sich über die Blöcke hinweg. Globale IDs nicht.
- `cudaGetLastError()`: gibt den letzten CUDA-Fehlercode zurück. Damit erkennst du stille Fehler, zum Beispiel eine ungültige Startkonfiguration, die der Treiber ohne Meldung verwirft.
- nicht deterministisch: Das Ergebnis oder die Reihenfolge lässt sich nicht vorhersagen. Das Scheduling der Blöcke hängt davon ab, welcher SM beim Start frei ist.
