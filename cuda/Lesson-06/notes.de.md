# Lektion 06: CUDA unter Linux kompilieren

Die Lektionen 00 bis 04 haben ihre Programme mit einem kurzen Befehl kompiliert. Diese Lektion geht jeden Schritt durch, mit dem du ein CUDA-Programm (Compute Unified Device Architecture) unter Linux baust und ausführst. Dazu kommt das Flag `-arch`, das die GPU (Graphics Processing Unit) nennt, für die du baust. Außerdem siehst du, warum ein Kernel manchmal gar nichts ausgibt, wenn `cudaDeviceSynchronize()` fehlt.

> [!NOTE]
> Alle Ausgaben auf dieser Seite stammen von einer NVIDIA L40S mit CUDA 13.0 unter Ubuntu 24.

## Code

Das Programm steht in `code/project001.cu`:

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    // print the blocks and threads IDs
    // warp = 32 threads. (64 threads/block) --> (64/32 = 2 warps/block)
    int warp_ID_Value = 0;
    warp_ID_Value = threadIdx.x / 32;
    printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
           blockIdx.x, threadIdx.x, warp_ID_Value);
}

int main()
{
    // kernel_name<<<num_of_blocks, num_of_threads_per_block>>>();
    test01 <<<2, 64>>> ();
    cudaDeviceSynchronize();
    return 0;
}
```

Der Start nutzt 2 Blöcke mit je 64 Threads, also insgesamt 2 × 64 = 128 Threads. Jeder Block hat 64 / 32 = 2 Warps.

- Die drei `#include`-Zeilen holen die CUDA-Runtime-Funktionen, die eingebauten Variablen wie `blockIdx` und `threadIdx` und `printf` herein.
- `__global__` markiert `test01` als Kernel. Die CPU (Central Processing Unit) startet ihn, und die GPU führt ihn aus.
- `threadIdx.x / 32` ergibt die Warp-ID, weil ein Warp 32 Threads hat. Beide Seiten sind ganze Zahlen, also fällt der Rest weg. Thread 45 bekommt zum Beispiel 45 / 32 = 1. Die Threads 0-31 bekommen 0 und die Threads 32-63 bekommen 1.
- `test01 <<<2, 64>>> ();` startet den Kernel mit 2 Blöcken aus je 64 Threads.
- `cudaDeviceSynchronize();` lässt die CPU auf die GPU warten. Der Abschnitt zur Synchronisierung weiter unten zeigt, warum diese Zeile wichtig ist.

## Code Schritt für Schritt

Geh das Programm in der Reihenfolge durch, in der du es schreiben würdest. Neu ist die Warp-ID, die der Kernel aus `threadIdx.x` berechnet.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header.** Die CUDA-Runtime, die eingebauten Variablen und `stdio.h` für `printf`. Mit diesen drei Zeilen beginnt jedes Programm in diesen Lektionen.
2. `5-6,13 gpu` **Der leere Kernel.** Schreib zuerst `__global__ void test01()` und seine Klammern. Dann füll den Rumpf Zeile für Zeile.
3. `7-8 gpu` **Ein Plan in Kommentaren.** Schreib vor dem Code auf, was der Kernel tut und auf welchen Zahlen er beruht: 32 Threads pro Warp, also ergeben 64 Threads 2 Warps pro Block. Kommentare kosten zur Laufzeit nichts und machen die nächste Zeile leicht prüfbar.
4. `9-10 gpu` **Die Warp-ID.** Deklariere `warp_ID_Value` und setz es dann auf `threadIdx.x / 32`. Beide Seiten sind ganze Zahlen, also fällt bei der Division der Rest weg: Thread 45 bekommt 1. Beende jede Zeile mit `;`. Der Abschnitt Kompilierfehler weiter unten zeigt, was ein fehlendes Semikolon bewirkt.
5. `11-12 gpu` **Die Ausgabe.** Ein `printf` mit drei `%d`, gefüllt mit der Block-ID, der Thread-ID und der Warp-ID, in dieser Reihenfolge. Ein langer Aufruf darf über zwei Zeilen gehen, weil der Compiler alles bis zum `;` als eine Anweisung liest.
6. `15-16,20-21 cpu` **Die main-Funktion.** Schreib `main` mit `return 0;` am Ende. Alles darin läuft auf der CPU.
7. `17-18 cpu` **Der Start.** Der Kommentar wiederholt das Muster `kernel_name<<<num_of_blocks, num_of_threads_per_block>>>`, und die nächste Zeile füllt es mit 2 Blöcken aus je 64 Threads. Die Leerzeichen um `<<<2, 64>>>` sind erlaubt. Der Compiler ignoriert sie.
8. `19 cpu` **Auf die GPU warten.** `cudaDeviceSynchronize();` ist die Zeile, die diese Lektion absichtlich entfernt. Auf diesem Rechner hat das Programm ohne sie nichts ausgegeben.

</div>

## Kompilieren und ausführen

### Schritt 1: nvcc prüfen

Prüf zuerst, ob der CUDA-Compiler installiert ist und welche Version er hat. Wenn dieser Befehl fehlschlägt, funktioniert nichts anderes in dieser Lektion.

```bash
nvcc --version
```

- `nvcc` (NVIDIA CUDA Compiler) ist der CUDA-Compiler.
- `--version` gibt die Compiler-Version aus und beendet sich. Es wird nichts kompiliert.

Ausgabe auf diesem Rechner:

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Aug_20_01:58:59_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.88
Build cuda_13.0.r13.0/compiler.36424714_0
```

Die wichtige Zeile ist `release 13.0, V13.0.88`. Sie sagt, dass es CUDA 13.0 ist. Die anderen Zeilen nennen den Namen des Werkzeugs, das Copyright sowie Build-Datum und Build-ID des Compilers.

### Schritt 2: kompilieren

Jetzt machst du aus der Quelldatei ein Programm, das der Rechner ausführen kann. Das ist derselbe Befehl wie in den Lektionen 00 bis 05:

```bash
nvcc -o project001 project001.cu
```

- `nvcc` kompiliert den CPU-Code und den GPU-Code in der `.cu`-Datei.
- `-o project001` legt den Namen des fertigen Programms fest. Ohne `-o` heißt es `a.out`. Wenn du immer `-o` nutzt, vermeidest du Verwirrung.
- `project001.cu` ist die Quelldatei.

> [!WARNING]
> Wenn es schon eine Datei namens `project001` gibt, überschreibt `-o project001` sie ohne Nachfrage.

Prüf, ob die Programmdatei existiert:

```bash
ls -lh project001
```

- `ls` listet Dateien auf.
- `-l` zeigt das lange Format mit Rechten, Besitzer, Größe und Datum.
- `-h` zeigt die Größe in einer gut lesbaren Einheit wie `K` oder `M`.

```
-rwxrwxr-x 1 ubuntu ubuntu 966K Jun  9 21:58 project001
```

Die Zeile beginnt mit `-`, also ist es eine normale Datei. Die Buchstaben `x` in `rwxrwxr-x` bedeuten, dass sich die Datei ausführen lässt. `ubuntu ubuntu` sind Besitzer und Gruppe. `966K` ist die Größe des Programms, etwa 966 KB (Kilobyte). Danach folgen Datum und Uhrzeit des Builds und der Name. Wäre das Kompilieren fehlgeschlagen, würde `ls` melden, dass die Datei nicht existiert.

### Schritt 3: die GPU-Architektur nennen

Ohne `-arch` wählt `nvcc` ein sicheres, allgemeines Standardziel. Besser ist es, die GPU zu nennen, für die du baust. Die L40S hat Compute Capability (CC) 8.9 (siehe [Lektion 03](../Lesson-03/notes.md)), und ihr Architekturname ist `sm_89`:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

- `-arch=sm_89` baut für Compute Capability 8.9, also die L40S. Die Zahl ist die CC ohne Punkt: Aus 8.9 wird `89`.
- `-o project001` und `project001.cu` sind wie vorher.

Ab hier kompiliert jede Lektion mit `-arch=sm_89`. Auf einer anderen GPU setzt du deren CC ein, zum Beispiel `-arch=sm_80` für CC 8.0. [Lektion 05](../Lesson-05/notes.md) erklärt, was der Compiler für dieses Ziel baut.

Prüf, ob dieses Toolkit sm_89 unterstützt:

```bash
nvcc --help | grep sm_89
```

- `nvcc --help` gibt alle Compiler-Optionen und ihre erlaubten Werte aus.
- `|` schickt diesen Text an den nächsten Befehl statt auf den Bildschirm.
- `grep sm_89` behält nur die Zeilen, die `sm_89` enthalten.

```
        'sm_75','sm_80','sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
        'sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
```

Jede Zeile gehört zu einer Liste erlaubter Werte im Hilfetext. `grep` gibt jede passende Zeile aus, deshalb taucht `sm_89` zweimal auf. Jeder Treffer bedeutet, dass dieses Toolkit für die L40S bauen kann. Gäbe es keine Ausgabe, würde `-arch=sm_89` mit diesem `nvcc` nicht funktionieren.

### Schritt 4: ausführen

Führ das Programm aus, das du gerade gebaut hast.

```bash
./project001
```

- `./` bedeutet "im aktuellen Ordner". Linux sucht Programme standardmäßig nicht im aktuellen Ordner, deshalb musst du es angeben.
- `project001` ist der Programmname, den du mit `-o` festgelegt hast.

## Das Synchronisierungsproblem

In der Zeile mit dem Kernel-Start schickt die CPU den Kernel an die GPU. Sie wartet nicht. Sie geht direkt zur nächsten Zeile. Ist diese Zeile `return 0`, endet das Programm, bevor die GPU etwas ausgibt.

Um das zu sehen, entfernst du die Zeile `cudaDeviceSynchronize();`, kompilierst neu und führst das Programm dreimal aus. Auf diesem Rechner hat das Programm nie etwas ausgegeben:

```bash
$ ./project001
$
$ ./project001
$
$ ./project001
$
```

Das `$` ist der Shell-Prompt. Es gehört nicht zum Befehl. Nach jedem `./project001` kommt als nächste Zeile ein leerer Prompt, also hat keiner der drei Läufe etwas ausgegeben. Der Kernel lief durchaus auf der GPU. Aber das Programm endete, bevor der Ausgabepuffer der GPU geleert (ins Terminal geschrieben) wurde.

> [!WARNING]
> Ob Ausgabe fehlt, hängt vom Timing ab. Auf diesem Rechner kam sie nie, aber auf einem anderen Rechner, Treiber oder OS (Operating System, Betriebssystem) siehst du in manchen Läufen vielleicht einige oder alle Zeilen. Verlass dich nie darauf: Ohne `cudaDeviceSynchronize()` wartet die CPU nicht auf die GPU.

`cudaDeviceSynchronize()` lässt die CPU an dieser Zeile warten, bis alle GPU-Threads fertig sind. Wenn der Aufruf zurückkehrt, ist der Ausgabepuffer geleert und alle Ausgaben stehen im Terminal. Dann gibt jeder Lauf die volle Ausgabe aus.

Setz die Zeile wieder ein, kompiliere neu und führ das Programm noch einmal aus:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
./project001
```

- Die erste Zeile baut das Programm neu, damit die Änderung in der Quelldatei drin ist. Das alte Programm würde noch das alte Verhalten zeigen.
- Die zweite Zeile führt das neue Programm aus.

<kernel-sync cmd="./project001" out="The block ID is 0 --- The thread ID is 0 --- The warp ID 0|The block ID is 0 --- The thread ID is 1 --- The warp ID 0|... 128 lines in total"></kernel-sync>

## Ausgabe

Das ist die volle Ausgabe von `./project001` mit `cudaDeviceSynchronize()` und `<<<2, 64>>>` (128 Zeilen). Jede Zeile kommt von einem GPU-Thread.

```
The block ID is 0 --- The thread ID is 0 --- The warp ID 0
The block ID is 0 --- The thread ID is 1 --- The warp ID 0
The block ID is 0 --- The thread ID is 2 --- The warp ID 0
The block ID is 0 --- The thread ID is 3 --- The warp ID 0
The block ID is 0 --- The thread ID is 4 --- The warp ID 0
The block ID is 0 --- The thread ID is 5 --- The warp ID 0
The block ID is 0 --- The thread ID is 6 --- The warp ID 0
The block ID is 0 --- The thread ID is 7 --- The warp ID 0
The block ID is 0 --- The thread ID is 8 --- The warp ID 0
The block ID is 0 --- The thread ID is 9 --- The warp ID 0
The block ID is 0 --- The thread ID is 10 --- The warp ID 0
The block ID is 0 --- The thread ID is 11 --- The warp ID 0
The block ID is 0 --- The thread ID is 12 --- The warp ID 0
The block ID is 0 --- The thread ID is 13 --- The warp ID 0
The block ID is 0 --- The thread ID is 14 --- The warp ID 0
The block ID is 0 --- The thread ID is 15 --- The warp ID 0
The block ID is 0 --- The thread ID is 16 --- The warp ID 0
The block ID is 0 --- The thread ID is 17 --- The warp ID 0
The block ID is 0 --- The thread ID is 18 --- The warp ID 0
The block ID is 0 --- The thread ID is 19 --- The warp ID 0
The block ID is 0 --- The thread ID is 20 --- The warp ID 0
The block ID is 0 --- The thread ID is 21 --- The warp ID 0
The block ID is 0 --- The thread ID is 22 --- The warp ID 0
The block ID is 0 --- The thread ID is 23 --- The warp ID 0
The block ID is 0 --- The thread ID is 24 --- The warp ID 0
The block ID is 0 --- The thread ID is 25 --- The warp ID 0
The block ID is 0 --- The thread ID is 26 --- The warp ID 0
The block ID is 0 --- The thread ID is 27 --- The warp ID 0
The block ID is 0 --- The thread ID is 28 --- The warp ID 0
The block ID is 0 --- The thread ID is 29 --- The warp ID 0
The block ID is 0 --- The thread ID is 30 --- The warp ID 0
The block ID is 0 --- The thread ID is 31 --- The warp ID 0
The block ID is 0 --- The thread ID is 32 --- The warp ID 1
The block ID is 0 --- The thread ID is 33 --- The warp ID 1
The block ID is 0 --- The thread ID is 34 --- The warp ID 1
The block ID is 0 --- The thread ID is 35 --- The warp ID 1
The block ID is 0 --- The thread ID is 36 --- The warp ID 1
The block ID is 0 --- The thread ID is 37 --- The warp ID 1
The block ID is 0 --- The thread ID is 38 --- The warp ID 1
The block ID is 0 --- The thread ID is 39 --- The warp ID 1
The block ID is 0 --- The thread ID is 40 --- The warp ID 1
The block ID is 0 --- The thread ID is 41 --- The warp ID 1
The block ID is 0 --- The thread ID is 42 --- The warp ID 1
The block ID is 0 --- The thread ID is 43 --- The warp ID 1
The block ID is 0 --- The thread ID is 44 --- The warp ID 1
The block ID is 0 --- The thread ID is 45 --- The warp ID 1
The block ID is 0 --- The thread ID is 46 --- The warp ID 1
The block ID is 0 --- The thread ID is 47 --- The warp ID 1
The block ID is 0 --- The thread ID is 48 --- The warp ID 1
The block ID is 0 --- The thread ID is 49 --- The warp ID 1
The block ID is 0 --- The thread ID is 50 --- The warp ID 1
The block ID is 0 --- The thread ID is 51 --- The warp ID 1
The block ID is 0 --- The thread ID is 52 --- The warp ID 1
The block ID is 0 --- The thread ID is 53 --- The warp ID 1
The block ID is 0 --- The thread ID is 54 --- The warp ID 1
The block ID is 0 --- The thread ID is 55 --- The warp ID 1
The block ID is 0 --- The thread ID is 56 --- The warp ID 1
The block ID is 0 --- The thread ID is 57 --- The warp ID 1
The block ID is 0 --- The thread ID is 58 --- The warp ID 1
The block ID is 0 --- The thread ID is 59 --- The warp ID 1
The block ID is 0 --- The thread ID is 60 --- The warp ID 1
The block ID is 0 --- The thread ID is 61 --- The warp ID 1
The block ID is 0 --- The thread ID is 62 --- The warp ID 1
The block ID is 0 --- The thread ID is 63 --- The warp ID 1
The block ID is 1 --- The thread ID is 0 --- The warp ID 0
The block ID is 1 --- The thread ID is 1 --- The warp ID 0
The block ID is 1 --- The thread ID is 2 --- The warp ID 0
The block ID is 1 --- The thread ID is 3 --- The warp ID 0
The block ID is 1 --- The thread ID is 4 --- The warp ID 0
The block ID is 1 --- The thread ID is 5 --- The warp ID 0
The block ID is 1 --- The thread ID is 6 --- The warp ID 0
The block ID is 1 --- The thread ID is 7 --- The warp ID 0
The block ID is 1 --- The thread ID is 8 --- The warp ID 0
The block ID is 1 --- The thread ID is 9 --- The warp ID 0
The block ID is 1 --- The thread ID is 10 --- The warp ID 0
The block ID is 1 --- The thread ID is 11 --- The warp ID 0
The block ID is 1 --- The thread ID is 12 --- The warp ID 0
The block ID is 1 --- The thread ID is 13 --- The warp ID 0
The block ID is 1 --- The thread ID is 14 --- The warp ID 0
The block ID is 1 --- The thread ID is 15 --- The warp ID 0
The block ID is 1 --- The thread ID is 16 --- The warp ID 0
The block ID is 1 --- The thread ID is 17 --- The warp ID 0
The block ID is 1 --- The thread ID is 18 --- The warp ID 0
The block ID is 1 --- The thread ID is 19 --- The warp ID 0
The block ID is 1 --- The thread ID is 20 --- The warp ID 0
The block ID is 1 --- The thread ID is 21 --- The warp ID 0
The block ID is 1 --- The thread ID is 22 --- The warp ID 0
The block ID is 1 --- The thread ID is 23 --- The warp ID 0
The block ID is 1 --- The thread ID is 24 --- The warp ID 0
The block ID is 1 --- The thread ID is 25 --- The warp ID 0
The block ID is 1 --- The thread ID is 26 --- The warp ID 0
The block ID is 1 --- The thread ID is 27 --- The warp ID 0
The block ID is 1 --- The thread ID is 28 --- The warp ID 0
The block ID is 1 --- The thread ID is 29 --- The warp ID 0
The block ID is 1 --- The thread ID is 30 --- The warp ID 0
The block ID is 1 --- The thread ID is 31 --- The warp ID 0
The block ID is 1 --- The thread ID is 32 --- The warp ID 1
The block ID is 1 --- The thread ID is 33 --- The warp ID 1
The block ID is 1 --- The thread ID is 34 --- The warp ID 1
The block ID is 1 --- The thread ID is 35 --- The warp ID 1
The block ID is 1 --- The thread ID is 36 --- The warp ID 1
The block ID is 1 --- The thread ID is 37 --- The warp ID 1
The block ID is 1 --- The thread ID is 38 --- The warp ID 1
The block ID is 1 --- The thread ID is 39 --- The warp ID 1
The block ID is 1 --- The thread ID is 40 --- The warp ID 1
The block ID is 1 --- The thread ID is 41 --- The warp ID 1
The block ID is 1 --- The thread ID is 42 --- The warp ID 1
The block ID is 1 --- The thread ID is 43 --- The warp ID 1
The block ID is 1 --- The thread ID is 44 --- The warp ID 1
The block ID is 1 --- The thread ID is 45 --- The warp ID 1
The block ID is 1 --- The thread ID is 46 --- The warp ID 1
The block ID is 1 --- The thread ID is 47 --- The warp ID 1
The block ID is 1 --- The thread ID is 48 --- The warp ID 1
The block ID is 1 --- The thread ID is 49 --- The warp ID 1
The block ID is 1 --- The thread ID is 50 --- The warp ID 1
The block ID is 1 --- The thread ID is 51 --- The warp ID 1
The block ID is 1 --- The thread ID is 52 --- The warp ID 1
The block ID is 1 --- The thread ID is 53 --- The warp ID 1
The block ID is 1 --- The thread ID is 54 --- The warp ID 1
The block ID is 1 --- The thread ID is 55 --- The warp ID 1
The block ID is 1 --- The thread ID is 56 --- The warp ID 1
The block ID is 1 --- The thread ID is 57 --- The warp ID 1
The block ID is 1 --- The thread ID is 58 --- The warp ID 1
The block ID is 1 --- The thread ID is 59 --- The warp ID 1
The block ID is 1 --- The thread ID is 60 --- The warp ID 1
The block ID is 1 --- The thread ID is 61 --- The warp ID 1
The block ID is 1 --- The thread ID is 62 --- The warp ID 1
The block ID is 1 --- The thread ID is 63 --- The warp ID 1
```

So liest du sie:

- Es sind 128 Zeilen, weil 2 Blöcke × 64 Threads = 128 Threads sind und jeder Thread einmal `printf` aufruft.
- Die Thread-ID läuft in Block 0 von 0 bis 63 und beginnt in Block 1 wieder bei 0. `threadIdx.x` zählt innerhalb eines Blocks, nicht über den ganzen Start.
- Die Warp-ID ist 0 für die Threads 0-31 und 1 für die Threads 32-63, weil `threadIdx.x / 32` eine Ganzzahldivision ist. Da die Thread-ID in jedem Block neu beginnt, gilt das auch für die Warp-ID.

Auf diesem Rechner hat Block 0 in beiden Läufen vor Block 1 ausgegeben. Ein zweiter Lauf lieferte dieselben 128 Zeilen in derselben Reihenfolge. Die Reihenfolge der Blöcke ist in anderen Läufen oder auf anderen Rechnern trotzdem nicht garantiert.

## Kompilierfehler

Um zu sehen, wie der Compiler Fehler meldet, entfernst du das `;` am Ende von `warp_ID_Value = threadIdx.x / 32` (Zeile 10). Dann kompilierst du neu:

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

Das ist derselbe Kompilierbefehl wie vorher. Diesmal schlägt er fehl, also wird kein neues Programm geschrieben.

Ausgabe auf diesem Rechner:

```
project001.cu(9): error: expected a ";"
      printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
      ^

1 error detected in the compilation of "project001.cu".
```

So liest du sie:

- `project001.cu(9)` ist der Dateiname mit der Zeilennummer in Klammern.
- `error: expected a ";"` sagt, wonach der Compiler gesucht hat.
- Die nächste Zeile wiederholt die Quellzeile, und das `^` markiert die Stelle, an der der Compiler das Problem bemerkt hat.
- Die letzte Zeile zählt die Fehler in der Datei.

Der Fehler zeigt auf die `printf`-Zeile, nicht auf die Zeile, in der das Semikolon fehlt. Der Compiler bemerkt das Problem erst, wenn er das nächste Wort erreicht, und das steht in der `printf`-Zeile.

> [!TIP]
> Wenn der Compiler einen Fehler in einer Zeile meldet, die in Ordnung aussieht, schau dir die Zeile direkt davor an. Ein fehlendes `;` oder `)` fällt meist erst eine Zeile zu spät auf.

> [!NOTE]
> Diese Ausgabe entstand, bevor die beiden Kommentarzeilen in den Kernel kamen, deshalb steht dort Zeile 9. Mit der oben gezeigten Datei fehlt das Semikolon in Zeile 10, und der Fehler zeigt auf Zeile 11.

Setz das Semikolon wieder ein, kompiliere neu und prüf, dass der Build ohne Fehler durchläuft.

## Dieser Rechner

| Einstellung | Wert |
|---|---|
| CUDA-Release | 13.0 |
| GPU | NVIDIA L40S (46 GB, Ada Lovelace, CC 8.9, `sm_89`) |
| OS | natives Ubuntu 24 |
| Zugang | SSH (Secure Shell) von einem anderen Computer |

Die Befehle in dieser Lektion funktionieren auf anderen Linux-Rechnern genauso. Nur der Wert von `-arch` ändert sich mit der GPU.

## Zusammenfassung

| Schritt | Befehl |
|---|---|
| Compiler prüfen | `nvcc --version` |
| Kompilieren | `nvcc -o project001 project001.cu` |
| Kompilieren (L40S) | `nvcc -arch=sm_89 -o project001 project001.cu` |
| Ausführen | `./project001` |

Füg nach einem Kernel-Start `cudaDeviceSynchronize()` ein, wenn die CPU die Ausgabe oder die Ergebnisse der GPU braucht, bevor das Programm endet. Ohne diese Zeile gibt dieser Rechner überhaupt nichts aus.

## Selbst schreiben

Schreib, kompiliere und starte ein eigenes Programm mit dem ganzen Ablauf aus dieser Lektion.

1. Leg `warps.cu` mit dem Gerüst unten an.
2. Lass im Kernel nur Thread 0 jedes Blocks ausgeben, wie viele Warps sein Block hat, mit `blockDim.x / 32`.
3. Starte 3 Blöcke mit je 96 Threads.
4. Kompiliere mit `-arch=sm_89` (oder dem Wert deiner eigenen GPU) und führ das Programm dann aus.
5. Entferne `cudaDeviceSynchronize();`, kompiliere erneut und führ das Programm ein paar Mal aus, um zu sehen, was sich ändert.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void countWarps()
{
    // TODO: only thread 0 of each block prints
    // TODO: print "block b has w warps", with w = threads per block / 32
}

int main()
{
    // TODO: launch countWarps with 3 blocks of 96 threads
    // TODO: wait for the GPU
    return 0;
}
```

??? tip "Hinweis"
    `if (threadIdx.x == 0)` wählt einen Thread pro Block aus, weil jeder Block seinen eigenen Thread 0 hat. Kompiliere mit `nvcc -arch=sm_89 -o warps warps.cu`.

??? note "Lösung"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void countWarps()
    {
        if (threadIdx.x == 0) {
            printf("block %d has %d warps\n", blockIdx.x, blockDim.x / 32);
        }
    }

    int main()
    {
        countWarps<<<3, 96>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Kompiliere und starte es mit `nvcc -arch=sm_89 -o warps warps.cu` und `./warps`. Du solltest 3 Zeilen sehen, `block 0 has 3 warps`, `block 1 has 3 warps` und `block 2 has 3 warps`, in beliebiger Reihenfolge, weil 96 / 32 = 3.

## Glossar

- `nvcc` (NVIDIA CUDA Compiler): der CUDA-Compilertreiber. Er verarbeitet Host-Code und Device-Code in derselben `.cu`-Datei.
- `-o`: legt den Namen des fertigen Programms fest. Standard ist `a.out`.
- `-arch=sm_89`: kompiliert für Compute Capability 8.9, also die L40S (Ada Lovelace).
- CC (Compute Capability): die Versionsnummer einer GPU-Generation, etwa 8.9. Siehe [Lektion 03](../Lesson-03/notes.md).
- `cudaDeviceSynchronize()`: lässt die CPU warten, bis alle bisher gestartete GPU-Arbeit fertig ist.
- Warp-ID: der Warp, zu dem ein Thread innerhalb seines Blocks gehört. Sie ist `threadIdx.x / 32`.
- SSH (Secure Shell): ein Weg, sich über das Netzwerk auf einem anderen Computer anzumelden und dort Befehle auszuführen.
