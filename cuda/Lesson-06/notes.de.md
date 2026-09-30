# Lektion 06: CUDA unter Linux kompilieren

Diese Lektion zeigt, wie du ein CUDA-Programm unter Linux kompilierst und ausführst. Sie zeigt auch, warum ein Kernel manchmal gar nichts ausgibt, wenn `cudaDeviceSynchronize()` fehlt.

> [!NOTE]
> Das Video nutzt Windows 11 + WSL2 (Ubuntu) mit CUDA 11.5. Diese Seite nutzt natives Linux (Ubuntu 24), CUDA 13.0 und eine NVIDIA L40S (46 GB, Ada Lovelace, sm_89). Die Befehle zum Kompilieren sind in beiden Versionen gleich.

## Quelldatei: `project001.cu`

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

Der Start nutzt 2 Blöcke mit je 64 Threads, also insgesamt 128 Threads. Jeder Block hat 64 / 32 = 2 Warps.

- Die drei `#include`-Zeilen holen die CUDA-Runtime-Funktionen, die eingebauten Variablen wie `blockIdx` und `threadIdx` und `printf` herein.
- `__global__` markiert `test01` als Kernel. Die CPU startet ihn, und die GPU führt ihn aus.
- `threadIdx.x / 32` ergibt die Warp-ID, weil ein Warp 32 Threads hat. Die Threads 0-31 bekommen 0 und die Threads 32-63 bekommen 1.
- `test01 <<<2, 64>>> ();` startet den Kernel mit 2 Blöcken aus 64 Threads.
- `cudaDeviceSynchronize();` lässt die CPU auf die GPU warten. Der Abschnitt zur Synchronisierung weiter unten zeigt, warum diese Zeile wichtig ist.

## Schritt 1: nvcc prüfen

Prüf zuerst, ob der CUDA-Compiler installiert ist und welche Version er hat. Wenn dieser Befehl fehlschlägt, funktioniert nichts anderes in dieser Lektion.

```bash
nvcc --version
```

- `nvcc` ist der CUDA-Compiler.
- `--version` gibt die Version des Compilers aus und beendet sich dann. Es kompiliert nichts.

Ausgabe auf diesem Rechner:

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Aug_20_01:58:59_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.88
Build cuda_13.0.r13.0/compiler.36424714_0
```

Die wichtige Zeile ist `release 13.0, V13.0.88`. Sie sagt dir, dass das CUDA 13.0 ist. Die anderen Zeilen zeigen den Namen des Werkzeugs, das Copyright sowie Build-Datum und Build-ID des Compilers.

## Schritt 2: kompilieren

Jetzt machst du aus der Quelldatei ein Programm, das der Rechner ausführen kann.

```bash
nvcc -o project001 project001.cu
```

- `nvcc` kompiliert sowohl den CPU-Code als auch den GPU-Code in der `.cu`-Datei.
- `-o project001` legt den Namen des erzeugten Programms fest. Ohne `-o` heißt es `a.out`. Wenn du immer `-o` nutzt, vermeidest du Verwirrung.
- `project001.cu` ist die Quelldatei.

> [!WARNING]
> Wenn es schon eine Datei namens `project001` gibt, überschreibt `-o project001` sie ohne Nachfrage.

Prüf, ob die Programmdatei existiert:

```bash
ls -lh project001
```

- `ls` listet Dateien auf.
- `-l` zeigt das lange Format mit Rechten, Besitzer, Größe und Datum.
- `-h` zeigt die Größe in einer gut lesbaren Einheit, zum Beispiel `K` oder `M`.

```
-rwxrwxr-x 1 ubuntu ubuntu 966K Jun  9 21:58 project001
```

Die Zeile beginnt mit `-`, also ist es eine normale Datei. Die Buchstaben `x` in `rwxrwxr-x` bedeuten, dass sich die Datei ausführen lässt. `ubuntu ubuntu` sind Besitzer und Gruppe. `966K` ist die Größe des Programms. Danach kommen Datum und Uhrzeit des Builds und der Name. Wäre das Kompilieren fehlgeschlagen, würde `ls` melden, dass die Datei nicht existiert.

## Schritt 3: ausführen

Führ das Programm aus, das du gerade gebaut hast.

```bash
./project001
```

- `./` bedeutet "im aktuellen Ordner". Linux sucht Programme standardmäßig nicht im aktuellen Ordner. Deshalb musst du das dazuschreiben.
- `project001` ist der Programmname, den du mit `-o` festgelegt hast.

## Das Synchronisierungsproblem

In der Zeile mit dem Kernel-Start schickt die CPU den Kernel an die GPU. Sie wartet nicht. Sie geht direkt zur nächsten Zeile. Wenn diese Zeile `return 0` ist, endet das Programm, bevor die GPU etwas ausgibt.

Probier es aus: Entferne die Zeile `cudaDeviceSynchronize();`, kompiliere neu und führ das Programm dreimal aus. Auf diesem Rechner hat das Programm nie etwas ausgegeben:

```bash
$ ./project001
$
$ ./project001
$
$ ./project001
$
```

Das `$` ist der Shell-Prompt. Es gehört nicht zum Befehl. Nach jedem `./project001` kommt in der nächsten Zeile ein leerer Prompt. Keiner der drei Läufe hat also etwas ausgegeben. Der Kernel lief zwar auf der GPU. Aber das Programm endete, bevor der Druckpuffer der GPU geleert wurde (also im Terminal ausgegeben wurde).

> [!NOTE]
> Im Video (CUDA 11.5, WSL2) erschien die Ausgabe manchmal und manchmal nicht, je nach Timing. Auf diesem Rechner (CUDA 13.0, L40S, natives Ubuntu) erschien sie nie.

`cudaDeviceSynchronize()` lässt die CPU an dieser Zeile warten, bis alle GPU-Threads fertig sind. Wenn die Funktion zurückkehrt, ist der Druckpuffer geleert und die ganze Ausgabe steht im Terminal. Dann gibt jeder Lauf die vollständige Ausgabe aus.

Füg die Zeile wieder ein, kompiliere neu und führ das Programm noch einmal aus:

```bash
nvcc -o project001 project001.cu
./project001
```

- Die erste Zeile baut das Programm neu, damit die Änderung in der Quelldatei enthalten ist. Das alte Programm würde immer noch das alte Verhalten zeigen.
- Die zweite Zeile führt das neue Programm aus.

<kernel-sync cmd="./project001" out="The block ID is 0 --- The thread ID is 0 --- The warp ID 0|The block ID is 0 --- The thread ID is 1 --- The warp ID 0|... 128 lines in total"></kernel-sync>

## Ausgabe

Das ist die vollständige Ausgabe von `./project001` mit `cudaDeviceSynchronize()` und `<<<2, 64>>>` (128 Zeilen). Jede Zeile stammt von einem GPU-Thread.

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
- Die Thread-ID geht in Block 0 von 0 bis 63 und beginnt dann in Block 1 wieder bei 0. `threadIdx.x` zählt innerhalb eines Blocks, nicht über den ganzen Start hinweg.
- Die Warp-ID ist 0 für die Threads 0-31 und 1 für die Threads 32-63, weil `threadIdx.x / 32` eine Ganzzahldivision ist. Da die Thread-ID in jedem Block neu beginnt, beginnt auch die Warp-ID neu.

Auf diesem Rechner hat Block 0 in beiden Läufen vor Block 1 ausgegeben. Ein zweiter Lauf lieferte dieselben 128 Zeilen in derselben Reihenfolge. Die Reihenfolge der Blöcke ist bei anderen Läufen oder auf anderen Rechnern trotzdem nicht garantiert.

## Kompilierfehler finden

Um zu sehen, wie der Compiler Fehler meldet, entfernst du das `;` am Ende von `warp_ID_Value = threadIdx.x / 32` (Zeile 10). Dann kompilierst du neu:

```bash
nvcc -o project001 project001.cu
```

Das ist derselbe Befehl zum Kompilieren wie vorher. Diesmal schlägt er fehl, also wird kein neues Programm geschrieben.

Ausgabe auf diesem Rechner:

```
project001.cu(9): error: expected a ";"
      printf("The block ID is %d --- The thread ID is %d --- The warp ID %d\n",
      ^

1 error detected in the compilation of "project001.cu".
```

So liest du sie:

- `project001.cu(9)` ist der Dateiname und in Klammern die Zeilennummer.
- `error: expected a ";"` sagt, was der Compiler erwartet hat.
- Die nächste Zeile wiederholt die Quellzeile. Das `^` markiert die Stelle, an der der Compiler das Problem bemerkt hat.
- Die letzte Zeile zählt die Fehler in der Datei.

Der Fehler zeigt auf die Zeile mit `printf`, nicht auf die Zeile, in der das Semikolon fehlt. Der Compiler sieht das Problem erst, wenn er beim nächsten Wort ankommt, und das steht in der Zeile mit `printf`. Schau deshalb immer auch in die Zeile direkt vor der, die der Compiler meldet.

> [!NOTE]
> Diese Ausgabe entstand, bevor die zwei Kommentarzeilen in den Kernel kamen. Deshalb steht dort Zeile 9. Mit der Datei von oben fehlt das Semikolon in Zeile 10, und der Fehler zeigt auf Zeile 11.

Füg das Semikolon wieder ein, kompiliere neu und prüf, dass der Build ohne Fehler durchläuft.

## Hinweise speziell zur L40S

| Parameter | Video | Dieser Rechner |
|---|---|---|
| CUDA-Release | 11.5 | 13.0 |
| GPU | generisch | NVIDIA L40S (sm_89) |
| Betriebssystem | WSL2 (Ubuntu) | natives Ubuntu 24 |
| Shell | cmd.exe + wsl | direkt per SSH |

Auf der L40S nennst du beim Kompilieren am besten die GPU-Architektur. Ohne `-arch` wählt NVCC einen sicheren, allgemeinen Standardwert. `-arch=sm_89` zielt direkt auf diese GPU und vermeidet Überraschungen.

```bash
nvcc -arch=sm_89 -o project001 project001.cu
```

- `-arch=sm_89` baut für Compute Capability 8.9, also die L40S.
- `-o project001` und `project001.cu` sind wie vorher.

Prüf, ob dieses Toolkit sm_89 unterstützt:

```bash
nvcc --help | grep sm_89
```

- `nvcc --help` gibt alle Optionen des Compilers und ihre erlaubten Werte aus.
- `|` schickt diesen Text an den nächsten Befehl statt auf den Bildschirm.
- `grep sm_89` behält nur die Zeilen, in denen `sm_89` vorkommt.

```
        'sm_75','sm_80','sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
        'sm_86','sm_87','sm_88','sm_89','sm_90','sm_90a'.
```

Jede Zeile ist Teil einer Liste erlaubter Werte im Hilfetext. `grep` gibt jede passende Zeile aus. Deshalb taucht `sm_89` zweimal auf. Jeder Treffer bedeutet, dass dieses Toolkit für die L40S bauen kann. Gäbe es keine Ausgabe, würde `-arch=sm_89` mit diesem nvcc nicht funktionieren.

## Zusammenfassung

| Schritt | Befehl |
|---|---|
| Compiler prüfen | `nvcc --version` |
| Kompilieren | `nvcc -o project001 project001.cu` |
| Kompilieren (L40S) | `nvcc -arch=sm_89 -o project001 project001.cu` |
| Ausführen | `./project001` |

Setz `cudaDeviceSynchronize()` hinter einen Kernel-Start, wenn die CPU die Ausgabe oder die Ergebnisse der GPU braucht, bevor das Programm endet. Ohne diese Zeile gibt dieser Rechner überhaupt nichts aus.

## Glossar

- `nvcc`: der CUDA-Compilertreiber. Er verarbeitet Host-Code und Device-Code in derselben `.cu`-Datei.
- `-o`: legt den Namen des erzeugten Programms fest. Der Standardname ist `a.out`.
- `-arch=sm_89`: kompiliert für Compute Capability 8.9, also die L40S (Ada Lovelace).
- `cudaDeviceSynchronize()`: lässt die CPU warten, bis alle bisher gestarteten GPU-Arbeiten fertig sind.
- Warp-ID: der Warp, zu dem ein Thread innerhalb seines Blocks gehört. Sie ist `threadIdx.x / 32`.
