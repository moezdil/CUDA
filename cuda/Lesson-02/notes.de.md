# Lektion 02: Zwei Blöcke mit je 1024 Threads

Ein Block kann höchstens 1024 Threads enthalten. Für mehr Threads fügst du mehr Blöcke hinzu. Diese Lektion startet 2 Blöcke x 1024 Threads = 2048 Threads. Sie zeigt, wie jeder Thread eine ID bekommt, die im ganzen Grid eindeutig ist.

> [!NOTE]
> Alle Ausgaben auf dieser Seite stammen von einer NVIDIA L40S mit CUDA 13.0 unter Ubuntu 24.

## Die Grenze von 1024 Threads

Ein einzelner Block darf höchstens 1024 Threads haben. Das ist eine feste Regel der Compute Capability, also der Versionsnummer der GPU (Graphics Processing Unit), die [Lektion 03](../Lesson-03/notes.md) erklärt. Auf jeder NVIDIA-GPU seit 2010 liegt sie bei 1024.

Die Grenze bedeutet nicht "die meisten Threads, die ein SM aufnehmen kann". Ein SM (Streaming Multiprocessor) kann gleichzeitig mehr Threads aufnehmen, verteilt auf mehrere Blöcke. Auf der L40S nimmt ein SM bis zu 1536 Threads auf, zum Beispiel 3 Blöcke mit je 512 Threads. Auf Rechenzentrums-GPUs wie der A100 oder H100 nimmt ein SM bis zu 2048 Threads auf.

## Streaming Multiprocessors (SMs)

Ein SM ist eine physische Recheneinheit in der GPU. Jeder SM hat CUDA-Kerne (Compute Unified Device Architecture), eine Registerdatei, Shared Memory, einen L1-Cache (Level-1-Cache) und Warp-Scheduler. Beim Start werden die Blöcke auf die SMs verteilt. Ein SM kann einen oder mehrere Blöcke gleichzeitig ausführen. Das hängt davon ab, wie viele Ressourcen jeder Block braucht. Ein Block bleibt immer auf einem SM.

> [!NOTE]
> Die Anzahl der SMs hängt von der GPU ab. Die L40S hat 142 SMs. Eine Mittelklasse-GPU wie die RTX 3080 hat 68.

## Thread-IDs bei mehreren Blöcken

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

Block 0 hat die Threads 0-1023. Block 1 hat seine eigenen Threads 0-1023. Die Thread-IDs beginnen in jedem Block wieder bei 0. Mit `threadIdx.x` allein kannst du die beiden Threads mit ID 5 also nicht unterscheiden. Für eine eindeutige globale ID nimmst du diese Formel:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` ist eine eingebaute Variable. Sie enthält die Anzahl der Threads pro Block, die beim Start festgelegt wurde. Hier ist sie 1024. Jeder Block überspringt alle Threads der Blöcke vor ihm:

- Thread 5 in Block 0: 0 * 1024 + 5 = 5
- Thread 5 in Block 1: 1 * 1024 + 5 = 1029
- Thread 1023 in Block 1: 1 * 1024 + 1023 = 2047, der letzte der 2048 Threads

Mit kleineren Zahlen sieht man es leichter. Bei 4 Threads pro Block bekommt Thread 3 in Block 2 die ID 2 * 4 + 3 = 11. Die globalen IDs laufen von 0 bis 3 in Block 0, von 4 bis 7 in Block 1 und von 8 bis 11 in Block 2. Bewege die Schieberegler und fahre mit der Maus über einen Thread, um die Formel mit seinen Zahlen zu sehen:

<global-id></global-id>

Kernels, die mit Arrays arbeiten, geben jedem Thread mit dieser Formel ein Element. Thread 1029 bearbeitet Element 1029.

## Der stille Fehler: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

Diese Zeile kompiliert ohne Fehler. Der Compiler prüft die Startkonfiguration nicht. Die CUDA-Runtime prüft sie beim Start des Kernels, sieht 2048 Threads in einem Block und verwirft den ganzen Kernel-Aufruf.

> [!WARNING]
> Ein ungültiger Start liefert keine Ausgabe, keinen Absturz und keine Fehlermeldung. Das Programm endet einfach. Rufe direkt nach dem Start `cudaGetLastError()` auf, um den Fehler zu sehen, hier `invalid configuration argument`. [Lektion 08](../Lesson-08/notes.md) macht das mit einem `CHECK`-Makro.

> [!TIP]
> Entferne den Kommentar vor der Zeile, führe das Programm aus und vergleiche die Ausgabe.

## Block-Scheduling

Die Reihenfolge, in der Blöcke auf SMs laufen, ist nicht deterministisch, also nicht festgelegt. Jeder Block geht an einen SM, der Platz für ihn hat. Block 0 und Block 1 können gleichzeitig auf verschiedenen SMs laufen. Deshalb mischen sich ihre Ausgabezeilen bei jedem Lauf in einer anderen Reihenfolge.

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

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
- Der Rest ist derselbe wie in [Lektion 00](../Lesson-00/notes.md) und [Lektion 01](../Lesson-01/notes.md).

## Kompilieren und ausführen

Der erste Befehl kompiliert den Code zu einem Programm. Der zweite Befehl führt es aus.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` ist der CUDA-Compiler. Er baut den CPU-Teil (Central Processing Unit) und den GPU-Teil der Datei.
- `-o first_kernel` gibt dem Programm den Namen `first_kernel`. Ohne diese Option heißt es `a.out`.
- `first_kernel.cu` ist die Quelldatei mit dem Code von oben.
- `./first_kernel` führt das Programm aus dem aktuellen Ordner aus.

## Ausgabe

Das Programm gibt 2048 Zeilen aus, eine pro Thread. Hier sind die ersten:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- Das `...` steht für den Rest der 2048 Zeilen.
- `Block ID` ist 0 oder 1, weil es zwei Blöcke gibt.
- Jede `Thread ID` von 0 bis 1023 kommt zweimal vor, einmal in jedem Block. Die Thread-IDs beginnen in jedem Block wieder bei 0.
- Die Zeilen von Block 0 und Block 1 mischen sich, und die Reihenfolge ändert sich von Lauf zu Lauf. Die beiden Blöcke können gleichzeitig auf verschiedenen SMs laufen, wie unter Block-Scheduling erklärt.

## Glossar

- GPU (Graphics Processing Unit): der Prozessor, der Kernels ausführt.
- SM (Streaming Multiprocessor): ein physischer Prozessor in der GPU. Blöcke laufen auf SMs. Ein SM kann mehrere Blöcke gleichzeitig ausführen, wenn er genug Ressourcen hat.
- L1-Cache (Level-1-Cache): ein kleiner, schneller Speicher in jedem SM. Er hält zuletzt genutzte Daten nah an den Kernen.
- `blockDim.x`: eingebaute Variable mit der Anzahl der Threads pro Block. Sie ist die zweite Zahl in `<<<blocks, threads>>>`.
- globale Thread-ID: eine eindeutige ID für jeden Thread im ganzen Grid. Sie ist `blockIdx.x * blockDim.x + threadIdx.x`. Thread-IDs wiederholen sich über die Blöcke hinweg. Globale IDs nicht.
- `cudaGetLastError()`: gibt den letzten CUDA-Fehlercode zurück. Damit erkennst du stille Fehler, etwa eine ungültige Startkonfiguration, die ohne Meldung verworfen wird.
- nicht deterministisch: Das Ergebnis oder die Reihenfolge lässt sich nicht vorhersagen. Das Block-Scheduling hängt davon ab, welcher SM beim Start Platz hat.
