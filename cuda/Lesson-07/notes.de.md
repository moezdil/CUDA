# Lektion 07: Warp-IDs

[Lektion 01](../Lesson-01/notes.md) und [Lektion 02](../Lesson-02/notes.md) haben Block- und Thread-IDs behandelt. Diese Lektion fügt den Warp hinzu, die Gruppe aus 32 Threads, die die GPU (Graphics Processing Unit) wirklich einplant. Sie zeigt auch, wie ein Thread im Kernel seine eigene Warp-ID und Lane-ID ausrechnet.

> [!NOTE]
> Alle Ausgaben auf dieser Seite stammen von einer NVIDIA L40S mit CUDA 13.0 unter Ubuntu 24.

## Die CUDA-Hierarchie

Die Ebenen in CUDA (Compute Unified Device Architecture) sind das Grid, die Blöcke darin, die Warps in jedem Block und die Threads in jedem Warp:

<cuda-hierarchy warps></cuda-hierarchy>

Die Zahl der Blöcke und die Threads pro Block wählst du mit `<<<num_blocks, threads_per_block>>>` (siehe [Lektion 01](../Lesson-01/notes.md) und [Lektion 02](../Lesson-02/notes.md)). Die Warp-Größe ist auf NVIDIA-GPUs immer 32. Sie ist in der Hardware festgelegt und lässt sich nicht ändern. Der Warp ist die echte Einheit, die die GPU einplant. Die GPU führt Threads nicht einzeln aus. Sie führt sie in Gruppen zu 32 aus.

> [!NOTE]
> Die Grenzen für Warps hängen von der Hardware ab. Diese Werte wurden auf der L40S mit `cudaGetDeviceProperties` gemessen:
>
> - Max. Warps pro Block: 32 (max. 1024 Threads / 32, gilt für alle GPUs)
> - Max. gleichzeitige Warps pro SM (Streaming Multiprocessor): 48, also 48 × 32 = 1536 Threads
> - Anzahl SMs: 142
> - Max. gleichzeitige Warps auf der ganzen GPU: 142 × 48 = 6.816
>
> Die L40S hat Compute Capability (CC) 8.9. GPUs mit CC 8.6, 8.9 und 12.0 halten 48 Warps pro SM. Rechenzentrums-GPUs wie die A100 (CC 8.0) und die H100 (CC 9.0) halten 64 Warps, also 2048 Threads, pro SM ([Lektion 03](../Lesson-03/notes.md)).

## `warp_id` ist keine eingebaute Variable

`blockIdx.x` und `threadIdx.x` füllt die GPU für jeden Thread aus. Du liest sie nur. Für die Warp-ID gibt es so eine Variable nicht. Du rechnest sie im Kernel selbst aus:

```c
int warp_id = threadIdx.x / 32;
```

Beide Seiten sind ganze Zahlen, also ist `/` eine Ganzzahldivision und der Rest fällt weg. Deshalb bekommt jede Gruppe aus 32 Threads dasselbe Ergebnis. In einem Block mit 128 Threads:

- Threads 0-31 → Warp 0
- Threads 32-63 → Warp 1
- Threads 64-95 → Warp 2
- Threads 96-127 → Warp 3

Das sind 128 / 32 = 4 Warps.

## Was mit 1024 Threads passiert

Mit 1 Block aus 1024 Threads (`<<<1, 1024>>>`) laufen die Warp-IDs von 0 bis 31. Das stimmt, denn 1024 / 32 = 32 Warps. Jede Warp-ID hat genau 32 Threads. Das Programm hat das ausgegeben (gekürzt):

```
Block ID: 0 --- Thread ID:    0 --- Warp ID:  0
Block ID: 0 --- Thread ID:    1 --- Warp ID:  0
...
Block ID: 0 --- Thread ID:   31 --- Warp ID:  0
Block ID: 0 --- Thread ID:   32 --- Warp ID:  1
...
Block ID: 0 --- Thread ID:  992 --- Warp ID: 31
...
Block ID: 0 --- Thread ID: 1023 --- Warp ID: 31
```

Jedes `...` steht für ausgelassene Zeilen. Die Block-ID ist immer 0, weil es nur einen Block gibt. Die Warp-ID wechselt zwischen Thread 31 und Thread 32 von 0 auf 1, weil 32 / 32 = 1 ist. Der letzte Warp beginnt bei Thread 992, weil 992 / 32 = 31 ist. Thread 1023 ist der letzte Thread, und 1023 / 32 ist immer noch 31.

Auf dem Rechner geprüft: Warps 0-31, jeder mit genau 32 Threads, insgesamt 1024 Zeilen. Diese Zählung der Ausgabezeilen pro Warp-ID zeigt es:

```
32 warp 0
32 warp 1
...
32 warp 31
```

Jede Zeile nennt zuerst eine Anzahl und dann die Warp-ID. Jede Anzahl ist 32, weil jeder Warp genau 32 Threads hat. Es gibt 32 solche Zeilen, und 32 × 32 = 1024.

## Die Warp-ID beginnt in jedem Block neu

Die Warp-ID beginnt in jedem Block bei null. Mit `<<<2, 64>>>` hat jeder Block 64 Threads, also 2 Warps. Beide Blöcke haben also einen Warp 0 und einen Warp 1, und `warp_id = 0` kommt zweimal vor, einmal in Block 0 und einmal in Block 1.

> [!WARNING]
> Die Warp-ID allein sagt dir nicht, in welchem Warp des ganzen Starts ein Thread ist. Lies sie immer zusammen mit der Block-ID. Thread 40 in Block 0 und Thread 40 in Block 1 bekommen beide die Warp-ID 40 / 32 = 1, liegen aber in verschiedenen Warps.

## Lane-ID

Jeder Warp hat 32 Threads. Die Position eines Threads in seinem Warp, von 0 bis 31, ist seine Lane-ID. Du bekommst sie mit dem Modulo-Operator `threadIdx.x % 32`, der den Rest der Division liefert. Die Division ergibt den Warp, der Rest den Platz darin:

| `threadIdx.x` | Warp-ID (`/ 32`) | Lane-ID (`% 32`) |
|---|---|---|
| 0 | 0 | 0 |
| 31 | 0 | 31 |
| 32 | 1 | 0 |
| 33 | 1 | 1 |
| 70 | 2 | 6 |
| 127 | 3 | 31 |

Für Thread 70 gilt: 70 / 32 = 2 mit Rest 6, denn 2 × 32 + 6 = 70. Die Threads 0, 32 und 64 liegen in verschiedenen Warps, haben aber alle die Lane-ID 0. Modulo liefert also nicht die Warp-ID. Für die Warp-ID brauchst du die Division (`/`).

Beweg den Schieberegler, um die Blockgröße zu ändern, und fahr mit der Maus über einen Thread, um beide Zahlen zu sehen:

<warp-lane></warp-lane>

## Code

### `warp_ids.cu`

Der Kernel läuft mit 1 Block aus 128 Threads. Die Funktion `test01` läuft auf der GPU. Jeder Thread berechnet seine `warp_id` mit `threadIdx.x / 32` und gibt Block-ID, Thread-ID und Warp-ID aus. Nach dem Start lässt `cudaDeviceSynchronize()` die CPU (Central Processing Unit) auf die GPU warten, damit die Ausgabe beim Programmende nicht verloren geht.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 1 block, 128 threads -> 4 warps (IDs: 0,1,2,3)
    test01<<<1, 128>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `#include "cuda_runtime.h"`: Header für CUDA-Funktionen.
- `#include "device_launch_parameters.h"`: definiert eingebaute GPU-Variablen wie `blockIdx` und `threadIdx`.
- `#include <stdio.h>`: Standard-C-Header für `printf`.
- `__global__`: markiert die Funktion als Kernel. Die CPU ruft ihn auf, und die GPU führt ihn aus.
- `int warp_id = threadIdx.x / 32;`: Jeder Thread berechnet seine eigene Warp-ID. Threads 0-31 → 0, Threads 32-63 → 1 und so weiter.
- `printf(...)`: Jeder Thread gibt Block-ID, Thread-ID und Warp-ID aus.
- `test01<<<1, 128>>>();`: startet den Kernel mit 1 Block aus 128 Threads.
- `cudaDeviceSynchronize();`: lässt die CPU warten, bis alle GPU-Threads fertig sind und die Ausgabe geschrieben ist.

### `warp_ids_2blocks.cu`

Diese Datei nutzt denselben Kernel wie `warp_ids.cu`. Nur die Startkonfiguration ist anders, nämlich `<<<2, 64>>>`. Das sind 2 Blöcke aus je 64 Threads, also hat jeder Block 64 / 32 = 2 Warps. Die Datei zeigt, dass die Warp-ID in jedem Block neu beginnt.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 2 blocks, 64 threads/block -> 2 warps per block, warp ID resets per block
    test01<<<2, 64>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `test01<<<2, 64>>>();`: startet den Kernel mit 2 Blöcken aus je 64 Threads. Das sind insgesamt 128 Threads und 4 Warps, verteilt auf 2 Blöcke.
- Alle anderen Zeilen sind wie in `warp_ids.cu`.

## Kompilieren und ausführen

Beide Dateien liegen im Ordner `code/`. Kompilier jede in ein eigenes Programm und führ es aus, damit du die beiden Startkonfigurationen vergleichen kannst:

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

- Zeilen, die mit `#` beginnen, sind Kommentare. Die Shell ignoriert sie.
- `nvcc` ist der CUDA-Compiler.
- `-arch=sm_89` baut für Compute Capability 8.9, also die L40S. Code, der für die richtige Architektur gebaut ist, kann alle ihre Funktionen nutzen.
- `-o warp_ids` nennt das Programm `warp_ids`. Ohne diese Option heißt es `a.out`, und das zweite Kompilieren würde das erste Programm überschreiben.
- `warp_ids.cu` ist die Quelldatei.
- `./warp_ids` führt das Programm aus dem aktuellen Ordner aus.

## Ausgabe

### `<<<1, 128>>>`

Das ist die Ausgabe von `./warp_ids`. Es sind 128 Zeilen, eine pro Thread, und 4 Warps. Das ist echte Ausgabe der L40S. Die Reihenfolge der Threads ist nicht garantiert, deshalb ist die Liste unten sortiert.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
Block ID: 0 --- Thread ID:  1 --- Warp ID: 0
Block ID: 0 --- Thread ID:  2 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
Block ID: 0 --- Thread ID: 33 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 0 --- Thread ID: 64 --- Warp ID: 2
...
Block ID: 0 --- Thread ID: 95 --- Warp ID: 2
Block ID: 0 --- Thread ID: 96 --- Warp ID: 3
...
Block ID: 0 --- Thread ID: 127 --- Warp ID: 3
```

Die Block-ID ist immer 0, weil es nur einen Block gibt. Die Warp-ID steigt bei den Threads 32, 64 und 96 um eins, weil jede dieser Zahlen ein neues Vielfaches von 32 ist. Jedes `...` steht für ausgelassene Zeilen.

### `<<<2, 64>>>`

Das ist die Ausgabe von `./warp_ids_2blocks`. Es sind 128 Zeilen, 2 Blöcke und 2 Warps pro Block. Die Warp-ID beginnt in jedem Block neu.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 1 --- Thread ID:  0 --- Warp ID: 0   <- resets to zero
...
Block ID: 1 --- Thread ID: 31 --- Warp ID: 0
Block ID: 1 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 1 --- Thread ID: 63 --- Warp ID: 1
```

Die Thread-ID geht nur bis 63, weil jeder Block 64 Threads hat. Block 1 zeigt wieder warp_id 0, weil `threadIdx.x` in jedem Block bei null beginnt und die Warp-ID daraus berechnet wird. Es gibt keine globale Warp-Nummer für die ganze GPU. Die Markierung `<- resets to zero` wurde von Hand ergänzt. Das Programm gibt sie nicht aus.

## Visualisierung

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

## Probier es aus

- Starte `test01<<<1, 100>>>()`. 100 ist kein Vielfaches von 32, also ist der letzte Warp nur teilweise voll: Die Warps 0, 1 und 2 haben je 32 Threads, und Warp 3 hat nur die Threads 96 bis 99. Die GPU plant dafür trotzdem einen vollen Warp aus 32 ein, und 28 Lanes bleiben untätig.
- Füg `int lane_id = threadIdx.x % 32;` in den Kernel ein und gib den Wert aus. Thread 70 sollte die Lane-ID 6 ausgeben.

## Glossar

- GPU (Graphics Processing Unit): der Prozessor, der die Kernel ausführt.
- SM (Streaming Multiprocessor): der Prozessor in der GPU, der Blöcke und ihre Warps ausführt. Die L40S hat 142.
- Warp: eine Gruppe aus 32 Threads, die die GPU als eine Einheit ausführt. Die GPU plant Warps ein, keine einzelnen Threads.
- Warp-Größe: auf NVIDIA-GPUs immer 32. Software kann sie nicht ändern.
- Warp-ID: der Warp, zu dem ein Thread innerhalb seines Blocks gehört. Sie ist `threadIdx.x / 32`.
- Lane-ID: die Position eines Threads in seinem Warp, von 0 bis 31. Sie ist `threadIdx.x % 32`. Sie liefert nicht die Warp-ID.
- Warps pro Block: `(threads per block) / 32`. 128 Threads/Block → 4 Warps/Block.
- Neustart der Warp-ID: Warp-IDs beginnen in jedem Block bei null, wie `threadIdx.x`. Es gibt keine globale Warp-ID für die ganze GPU.
