# Lektion 08: Vektoraddition

Die Lektionen 00 bis 07 haben Kernel gestartet, die nur ihre IDs ausgegeben haben. Diese Lektion baut das erste CUDA-Programm (Compute Unified Device Architecture), das echte Arbeit mit Daten macht: Es addiert auf der GPU (Graphics Processing Unit) zwei Vektoren mit je 1024 Zahlen. Unterwegs lernst du die sechs Schritte kennen, denen fast jedes CUDA-Programm folgt, vom Reservieren des Speichers bis zum Freigeben.

> [!NOTE]
> Der Code zielt auf CUDA 13 unter Ubuntu 24 und die NVIDIA L40S (`sm_89`) aus den früheren Lektionen. Seine Ausgabe wurde auf diesem Rechner noch nicht aufgezeichnet. Die Ausgabe unten ist das erwartete Ergebnis, aus den Eingaben hergeleitet. Das Programm prüft sein Ergebnis selbst, also kannst du es auf jeder NVIDIA-GPU ausführen und sehen, ob es geklappt hat.

## Die Aufgabe

Nimm zwei Vektoren, `a` und `b`. Jeder enthält 1024 ganze Zahlen, an den Indizes 0 bis 1023. Das Ziel ist ein dritter Vektor `c`, in dem jedes Element die Summe der beiden Elemente am selben Index ist:

```
c[0]    = a[0]    + b[0]
c[1]    = a[1]    + b[1]
...
c[1023] = a[1023] + b[1023]
```

Das nennt man eine elementweise Operation. Jede Summe braucht nur ihre eigenen zwei Eingaben. Keine Summe muss auf eine andere warten. Deshalb ist die Vektoraddition eine perfekte erste Aufgabe für eine GPU.

## Auf der CPU: ein Element nach dem anderen

Auf der CPU (Central Processing Unit) schreibst du in normalem C eine Schleife:

```c
for (int i = 0; i < 1024; i++) {
    c[i] = a[i] + b[i];
}
```

Die Schleife läuft 1024 Runden, eine nach der anderen. Runde 500 kann nicht starten, bevor Runde 499 fertig ist, obwohl die beiden Runden nichts miteinander zu tun haben. Die Arbeit könnte parallel laufen, aber eine normale Schleife führt sie nie so aus.

## Auf der GPU: ein Thread pro Element

Auf der GPU fällt die Schleife weg. Stattdessen startest du so viele Threads, wie es Elemente gibt, und gibst jedem Thread einen Index.

Fang mit dem einfachsten Start an: 1 Block aus 1024 Threads, `<<<1, 1024>>>`. Die Block-ID ist immer 0 und sagt hier also nichts. Die Thread-IDs laufen von 0 bis 1023. Das sind genau die Indizes der Vektoren. Thread 0 nimmt also Element 0, Thread 1 nimmt Element 1, und Thread 1023 nimmt das letzte.

<cuda-launch blocks="1" threads="1024" fn="vectorAdd"></cuda-launch>

Jeder Thread führt dieselbe einzelne Zeile aus, `c[i] = a[i] + b[i]`. Nur `i` ist verschieden. Die GPU verteilt die 1024 Threads auf ihre Cores, jeweils 32 auf einmal in Warps (siehe [Lektion 07](../Lesson-07/notes.md)), und führt sie parallel aus. Diese Idee, ein Befehl für viele Threads mit verschiedenen Daten, ist das Herz von CUDA. Sie heißt SIMT (Single Instruction, Multiple Threads), wie in [Lektion 01](../Lesson-01/notes.md).

Vergleich die beiden Wege mit 16 Elementen. Die CPU-Schleife braucht 16 Schritte, einen pro Element. Die GPU-Threads füllen alle 16 Elemente in einem Schritt:

<vector-add n="16"></vector-add>

> [!NOTE]
> "Ein Schritt" ist die Idee, keine genaue Zeitangabe. Ein Block läuft auf einem SM (Streaming Multiprocessor). Der SM hält alle 32 Warps dieses Blocks gleichzeitig und führt sie in schnellem Wechsel aus. Kein Thread wartet also darauf, dass eine Schleife seinen Index erreicht. Auch die Kopien zur GPU und zurück kosten Zeit, wie die sechs Schritte unten zeigen.

## Der Kernel

```c
__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}
```

- `__global__`: markiert `vectorAdd` als Kernel. Die CPU startet ihn, und die GPU führt ihn aus.
- `const int *a, const int *b`: die beiden Eingabevektoren. `const` bedeutet, dass der Kernel sie nur liest.
- `int *c`: der Ausgabevektor. Hier schreibt der Kernel die Summen hinein.
- `int n`: die Zahl der Elemente, hier 1024.
- `int i = threadIdx.x;`: Jeder Thread liest seine eigene ID. Das ist sein Elementindex.
- `if (i < n)`: eine Bereichsprüfung. Mit genau 1024 Threads schlägt sie nie fehl. Wichtig wird sie, wenn die Vektorgröße nicht zur Zahl der Threads passt. Darum geht es in der nächsten Lektion. Sie von Anfang an zu schreiben ist eine gute Gewohnheit.
- `c[i] = a[i] + b[i];`: die eigentliche Arbeit. Eine Addition pro Thread.

Du könntest auch `c[threadIdx.x] = a[threadIdx.x] + b[threadIdx.x];` in eine Zeile schreiben. Ein eigenes `i` ist leichter zu lesen und lässt sich später leicht erweitern, wenn der Index auch die Block-ID braucht.

## Host- und Device-Speicher

CPU und GPU haben jeweils ihren eigenen Speicher. In CUDA heißt die CPU-Seite Host und die GPU-Seite Device. Ein Kernel kann nur Device-Speicher lesen. Die CPU kann nur Host-Speicher lesen. Deshalb müssen Daten gezielt zwischen beiden kopiert werden.

Der Code hält die beiden Seiten über die Namen auseinander: `h_a` liegt auf dem Host, `d_a` liegt auf dem Device. Die Präfixe `h_` und `d_` sind eine verbreitete Konvention. Sie bewahren dich davor, aus Versehen einen CPU-Zeiger an einen Kernel zu übergeben.

> [!TIP]
> CUDA hat auch Unified Memory (`cudaMallocManaged`). Dort funktioniert ein Zeiger auf beiden Seiten, und der Treiber verschiebt die Daten für dich. Das ist praktisch, versteckt aber, was passiert. Diese Lektion macht jede Kopie von Hand, damit du jeden Schritt siehst.

## Die sechs Schritte

Fast jedes CUDA-Programm folgt denselben sechs Schritten:

1. Speicher auf dem Host und auf dem Device reservieren.
2. Die Eingaben auf dem Host füllen.
3. Die Eingaben vom Host auf das Device kopieren.
4. Den Kernel starten.
5. Das Ergebnis vom Device zurück auf den Host kopieren.
6. Den Speicher auf beiden Seiten freigeben.

Die Schritte 2 und 6 gibt es auch in einem normalen C-Programm. In den Schritten 1, 3, 4 und 5 kommt CUDA ins Spiel. Geh sie Schritt für Schritt durch und sieh, wie jedes Array auf dem Host oder dem Device erscheint, kopiert wird und wieder verschwindet:

<host-device-flow></host-device-flow>

## Code

Das ganze Programm steht in `code/vector_add.cu`:

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include <stdlib.h>

#define N 1024

// stop the program with a readable message if a CUDA call fails
#define CHECK(call)                                                  \
    do {                                                             \
        cudaError_t err = (call);                                    \
        if (err != cudaSuccess) {                                    \
            printf("CUDA error: %s (%s:%d)\n",                       \
                   cudaGetErrorString(err), __FILE__, __LINE__);     \
            exit(1);                                                 \
        }                                                            \
    } while (0)

__global__ void vectorAdd(const int *a, const int *b, int *c, int n)
{
    int i = threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}

int main()
{
    size_t bytes = N * sizeof(int);

    // 1. allocate memory on the host (CPU) and on the device (GPU)
    int *h_a = (int *)malloc(bytes);
    int *h_b = (int *)malloc(bytes);
    int *h_c = (int *)malloc(bytes);
    int *d_a, *d_b, *d_c;
    CHECK(cudaMalloc(&d_a, bytes));
    CHECK(cudaMalloc(&d_b, bytes));
    CHECK(cudaMalloc(&d_c, bytes));

    // 2. fill the inputs on the host
    for (int i = 0; i < N; i++) {
        h_a[i] = i;
        h_b[i] = N - i;
    }

    // 3. copy the inputs to the device
    CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));

    // 4. launch the kernel: 1 block, N threads, one thread per element
    vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);
    CHECK(cudaGetLastError());

    // 5. copy the result back to the host
    CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));

    // check every element, then print a few
    int errors = 0;
    for (int i = 0; i < N; i++) {
        if (h_c[i] != h_a[i] + h_b[i]) {
            errors++;
        }
    }
    for (int i = 0; i < 4; i++) {
        printf("%d + %d = %d\n", h_a[i], h_b[i], h_c[i]);
    }
    printf("...\n");
    printf("%d + %d = %d\n", h_a[N - 1], h_b[N - 1], h_c[N - 1]);
    printf("errors: %d\n", errors);

    // 6. free memory on both sides
    CHECK(cudaFree(d_a));
    CHECK(cudaFree(d_b));
    CHECK(cudaFree(d_c));
    free(h_a);
    free(h_b);
    free(h_c);
    return 0;
}
```

### Die Vorbereitungszeilen

- `#include <stdlib.h>`: wird für `malloc`, `free` und `exit` gebraucht.
- `#define N 1024`: die Vektorgröße, einmal oben definiert. Um eine andere Größe auszuprobieren, änderst du nur diese Zeile.
- `CHECK(...)`: Fast jede CUDA-Funktion gibt einen Fehlercode zurück. Ein fehlgeschlagener Aufruf hält das Programm nicht von selbst an. Es läuft einfach mit falschen Daten weiter ([Lektion 02](../Lesson-02/notes.md) hat einen Start gezeigt, der ohne ein Wort fehlschlug). `CHECK` schaut sich den Code an. Ist er nicht `cudaSuccess`, gibt es den Grund mit Datei und Zeile aus und hält an.
- `size_t bytes = N * sizeof(int);`: Speicherfunktionen zählen Bytes, keine Elemente. 1024 Zahlen mit je 4 Byte sind 4096 Byte.

### Schritt 1: reservieren

- `malloc(bytes)`: reserviert Speicher auf dem Host, wie in normalem C.
- `cudaMalloc(&d_a, bytes)`: reserviert Speicher auf dem Device. Es bekommt die Adresse des Zeigers, `&d_a`, weil es die neue GPU-Adresse dort hineinschreibt.

### Schritt 2: die Eingaben füllen

- `h_a[i] = i;`: `a` bekommt 0, 1, 2, ... 1023.
- `h_b[i] = N - i;`: `b` bekommt 1024, 1023, 1022, ... 1.

Mit dieser Wahl lässt sich das Ergebnis leicht mit bloßem Auge prüfen: Jede Summe ist `i + (1024 - i)`, also muss jedes Element von `c` 1024 sein. `c` wird nicht gefüllt, weil der Kernel es schreibt.

### Schritt 3: auf das Device kopieren

- `cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice)`: kopiert `bytes` Bytes von `h_a` nach `d_a`. Die Reihenfolge ist immer zuerst das Ziel, dann die Quelle, wie bei `memcpy` in C. Das letzte Argument nennt die Richtung: vom Host zum Device.
- `c` wird nicht kopiert, weil es keine Eingabe enthält.

### Schritt 4: starten

- `vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);`: der Kernelname, die Startkonfiguration (1 Block, 1024 Threads) und dann die Argumente. Alle Zeiger, die an den Kernel gehen, sind `d_`-Zeiger.
- `CHECK(cudaGetLastError());`: Ein Start gibt nichts zurück, also fragst du danach, ob er angenommen wurde. Eine falsche Konfiguration, etwa mehr als 1024 Threads pro Block, zeigt sich hier.

### Schritt 5: das Ergebnis zurückkopieren

- `cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost)`: dieselbe Funktion wie in Schritt 3, aber mit umgekehrter Richtung. Vergleich die beiden: Dort kam `h_` an zweiter Stelle. Hier kommt `h_` zuerst, weil jetzt der Host das Ziel ist.
- Hier gibt es kein `cudaDeviceSynchronize()`, anders als in [Lektion 06](../Lesson-06/notes.md). Dieses `cudaMemcpy` wartet von selbst, bis der Kernel fertig ist, weil es kein Ergebnis kopieren kann, das noch nicht existiert.

### Die Prüfung

- Die erste Schleife vergleicht jedes Element mit der Summe auf der CPU und zählt die Fehler. 1024 Zeilen auszugeben und mit bloßem Auge zu lesen, skaliert nicht. Das Programm sich selbst prüfen zu lassen, skaliert.
- Die anderen Zeilen geben die ersten vier Summen und die letzte aus. Das reicht, um das Muster zu sehen.

### Schritt 6: freigeben

- `cudaFree(d_a)`: gibt den Device-Speicher zurück. GPU-Speicher wird während der Laufzeit nicht für dich freigegeben. Ein lange laufendes Programm, das das vergisst, frisst also immer mehr GPU-Speicher.
- `free(h_a)`: gibt den Host-Speicher zurück, wie in normalem C. Die Namen passen absichtlich zusammen: `cudaFree` zu `cudaMalloc`, `free` zu `malloc`.

## Kompilieren und ausführen

```bash
nvcc -arch=sm_89 -o vector_add vector_add.cu
./vector_add
```

- `nvcc` ist der CUDA-Compiler.
- `-arch=sm_89` baut für die L40S. Auf einer anderen GPU nimmst du deren eigene Compute Capability, zum Beispiel `-arch=sm_80` für CC (Compute Capability) 8.0 (siehe [Lektion 03](../Lesson-03/notes.md) und [Lektion 06](../Lesson-06/notes.md)).
- `-o vector_add` gibt dem Programm seinen Namen.
- `./vector_add` führt es aus dem aktuellen Ordner aus.

## Ausgabe

Das ist die erwartete Ausgabe. Sie folgt aus den Eingaben aus Schritt 2 und wurde auf der L40S noch nicht aufgezeichnet.

```
0 + 1024 = 1024
1 + 1023 = 1024
2 + 1022 = 1024
3 + 1021 = 1024
...
1023 + 1 = 1024
errors: 0
```

So liest du sie:

- Jede Zeile ist `a[i] + b[i] = c[i]`. Die ersten vier Zeilen sind die Indizes 0 bis 3, die Zeile `...` gibt das Programm selbst aus, und die letzte Summenzeile ist Index 1023.
- Jede Summe ist 1024, wie in Schritt 2 geplant. Für Index 3 gilt: `a[3] = 3`, `b[3] = 1024 - 3 = 1021`, und 3 + 1021 = 1024.
- `errors: 0` sagt dir, dass alle 1024 Elemente stimmen, nicht nur die fünf auf dem Bildschirm.
- Siehst du stattdessen `CUDA error:`, nennt die Meldung den fehlgeschlagenen Aufruf, die Datei und die Zeile.

## Probier es aus

> [!WARNING]
> Setz `N` auf 2048 und führ das Programm noch einmal aus. Ein Block kann nicht mehr als 1024 Threads haben, also wird der Start abgelehnt, und `CHECK(cudaGetLastError())` sollte das Programm mit `CUDA error: invalid configuration argument` anhalten. Ohne diese Prüfung läuft der Kernel nie, aber das Programm macht weiter: Es kopiert Device-Speicher zurück, den der Kernel nie geschrieben hat, und sollte viele Fehler melden. Die Lösung ist, mehr als einen Block zu nutzen. Darum geht es in der nächsten Lektion.

## Glossar

- CUDA (Compute Unified Device Architecture): NVIDIAs Plattform, um allgemeine Programme auf der GPU auszuführen.
- Vektoraddition: zwei Vektoren Element für Element addieren, `c[i] = a[i] + b[i]`.
- SIMT (Single Instruction, Multiple Threads): Viele Threads führen denselben Befehl aus, jeder mit seinen eigenen Daten.
- elementweise: Jedes Ausgabeelement hängt nur von den Eingabeelementen am selben Index ab. Solche Arbeit läuft gut parallel.
- Host: die CPU (Central Processing Unit) und ihr Speicher.
- Device: die GPU (Graphics Processing Unit) und ihr Speicher.
- `h_` / `d_`: eine Namensgewohnheit. `h_a` zeigt auf Host-Speicher, `d_a` auf Device-Speicher.
- `cudaMalloc`: reserviert Speicher auf dem Device.
- `cudaMemcpy`: kopiert Bytes zwischen Host und Device. Zuerst das Ziel, dann die Quelle, dann die Größe, dann die Richtung.
- `cudaMemcpyHostToDevice` / `cudaMemcpyDeviceToHost`: die Richtung einer Kopie.
- `cudaFree`: gibt Device-Speicher zurück.
- `cudaGetLastError`: sagt dir, ob der letzte Kernel-Start angenommen wurde.
- Bereichsprüfung: `if (i < n)`, damit ein Thread nie über das Ende eines Vektors hinaus liest oder schreibt.
- Unified Memory: Speicher aus `cudaMallocManaged`, den beide Seiten mit einem Zeiger nutzen können.
