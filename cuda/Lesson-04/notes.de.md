# Lektion 04: Eingebaute Variablen

Jeder Kernel hat fünf eingebaute Variablen, die nur gelesen werden können: `gridDim`, `blockDim`, `blockIdx`, `threadIdx` und `warpSize`. Du übergibst oder deklarierst sie nicht. Die GPU (Graphics Processing Unit) füllt sie beim Start für jeden Thread aus, passend zur Startkonfiguration. Diese Lektion gibt alle fünf aus jedem Thread aus. So siehst du, welche sich ändern und welche gleich bleiben.

> [!NOTE]
> Alle Ausgaben auf dieser Seite stammen von einer NVIDIA L40S mit CUDA 13.0 unter Ubuntu 24.

## gridDim

`gridDim` enthält die Anzahl der Blöcke in jeder Richtung. Bei `<<<2, 4>>>` ist `gridDim.x` gleich 2, und `gridDim.y` und `gridDim.z` sind 1. Die Grid-Größe steht beim Start fest, deshalb sieht jeder Thread dasselbe `gridDim`.

## blockDim

`blockDim` enthält die Anzahl der Threads pro Block in jeder Richtung. Bei `<<<2, 4>>>` ist `blockDim.x` gleich 4, und `blockDim.y` und `blockDim.z` sind 1. Jeder Thread sieht dasselbe `blockDim`.

Die Formel für die globale ID aus [Lektion 02](../Lesson-02/notes.md) nutzt es: `blockIdx.x * blockDim.x + threadIdx.x`. Bei `<<<2, 4>>>` bekommt Thread 3 in Block 1 die ID 1 * 4 + 3 = 7, der letzte der 8 Threads.

<global-id></global-id>

## blockIdx

`blockIdx` ist der Index des Blocks, zu dem der Thread gehört. Bei 2 Blöcken ist `blockIdx.x` für alle Threads in Block 0 gleich 0 und für alle Threads in Block 1 gleich 1. Es ist immer kleiner als `gridDim.x`.

## threadIdx

`threadIdx` ist der Index des Threads innerhalb seines Blocks. Er beginnt in jedem Block wieder bei 0. In einem Block mit 4 Threads ist `threadIdx.x` gleich 0, 1, 2, 3. Er ist immer kleiner als `blockDim.x`.

`gridDim`, `blockDim`, `blockIdx` und `threadIdx` haben alle die Felder `.x`, `.y` und `.z`. `gridDim` und `blockDim` haben den Typ `dim3`. Wenn du `<<<2, 4>>>` mit einfachen Zahlen schreibst, setzt CUDA (Compute Unified Device Architecture) `.y = 1` und `.z = 1` für dich. `<<<2, 4>>>` ist also dasselbe wie `<<<dim3(2, 1, 1), dim3(4, 1, 1)>>>`.

## warpSize

`warpSize` ist die Anzahl der Threads pro Warp. Auf jeder bisherigen NVIDIA-GPU ist sie 32. CUDA stellt sie dir als Variable bereit, damit dein Code die Zahl 32 nicht von Hand hinschreiben muss.

> [!TIP]
> Heute funktioniert es, 32 hinzuschreiben. Wenn du `warpSize` liest, bleibt dein Code auch dann richtig, wenn eine künftige GPU eine andere Größe nutzt.

## Hardware-Grenzen

Bevor ein Kernel läuft, prüft die CUDA-Runtime die Startkonfiguration gegen die Hardware-Grenzen. Ist ein Wert zu groß, startet der Kernel nicht. Das sind die Grenzen für CC (Compute Capability) 3.0 und neuer, von Kepler bis Blackwell:

| Variable      | Dimension    | Max. Wert |
|---------------|--------------|-----------|
| `gridDim.x`   | Blöcke in x  | 2^31 - 1  |
| `gridDim.y`   | Blöcke in y  | 65535     |
| `gridDim.z`   | Blöcke in z  | 65535     |
| `blockDim.x`  | Threads in x | 1024      |
| `blockDim.y`  | Threads in y | 1024      |
| `blockDim.z`  | Threads in z | 64        |
| Threads/Block | gesamt       | 1024      |

`blockDim.x * blockDim.y * blockDim.z` darf nicht größer als 1024 sein, auch wenn jeder einzelne Wert innerhalb seiner Grenze liegt. Das ist dieselbe Grenze von 1024 Threads pro Block aus [Lektion 02](../Lesson-02/notes.md). Zwei Beispiele:

- `dim3(16, 16, 4)`: Jeder Wert liegt innerhalb seiner Grenze, und 16 x 16 x 4 = 1024 Threads. Gültig.
- `dim3(32, 32, 2)`: Jeder Wert liegt innerhalb seiner Grenze, aber 32 x 32 x 2 = 2048 Threads. Ungültig, der Kernel läuft nicht.

> [!WARNING]
> Ein Start, der eine Grenze verletzt, kompiliert und läuft ohne jede Meldung, aber der Kernel startet nie. Prüfe nach dem Start `cudaGetLastError()`, so wie [Lektion 08](../Lesson-08/notes.md) es macht.

Gib eigene Block- und Grid-Größen ein, um zu sehen, ob der Start gültig ist:

<block-limits></block-limits>

## Code

Dieses Programm startet einen Kernel, der alle fünf eingebauten Variablen aus jedem Thread ausgibt. So siehst du, welche Werte sich ändern und welche gleich bleiben.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printBuiltins()
{
    printf("\ngridDim=(%d,%d,%d)  blockDim=(%d,%d,%d)  blockIdx=(%d,%d,%d)  threadIdx=(%d,%d,%d)  warpSize=%d",
        gridDim.x,   gridDim.y,   gridDim.z,
        blockDim.x,  blockDim.y,  blockDim.z,
        blockIdx.x,  blockIdx.y,  blockIdx.z,
        threadIdx.x, threadIdx.y, threadIdx.z,
        warpSize);
}

int main()
{
    printBuiltins<<<2, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- Die beiden CUDA-Header deklarieren die Runtime-Funktionen (etwa `cudaDeviceSynchronize`) und die eingebauten Variablen. `stdio.h` stellt `printf` bereit.
- `__global__` markiert `printBuiltins` als Kernel. Er läuft auf der GPU und wird von der CPU (Central Processing Unit) gestartet.
- Das `printf` im Kernel läuft einmal pro Thread. Jedes `%d` wird mit einem Feld gefüllt, in der Reihenfolge, die unter dem Formatstring steht.
- `printBuiltins<<<2, 4>>>()` startet 2 Blöcke mit je 4 Threads. Also führen 8 Threads den Kernel aus und geben 8 Zeilen aus.
- `cudaDeviceSynchronize()` lässt die CPU warten, bis der Kernel fertig ist. Ein Kernel-Start kehrt sofort zurück. Ohne dieses Warten könnte `main` enden, bevor die Ausgabe der GPU erscheint.

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## Code Schritt für Schritt

Geh das Programm in der Reihenfolge durch, in der du es schreiben würdest. Die Arbeit steckt im langen `printf`: ein Format-String, dann ein Wert für jedes `%d`.

<div class="code-walk" markdown>

1. `1-3 cpu` **Header.** Dieselben drei `#include`-Zeilen wie in den früheren Lektionen. Mit `nvcc` brauchen die eingebauten Variablen keinen Header, aber durch `device_launch_parameters.h` kennen auch manche Editoren sie.
2. `5-6,13 gpu` **Der leere Kernel.** Schreib `__global__ void printBuiltins()` und seine Klammern. Der Kernel nimmt keine Argumente, weil alles, was er ausgibt, eine eingebaute Variable ist, die die GPU für jeden Thread füllt.
3. `7 gpu` **Der Format-String.** Schreib den Text mit 13 `%d`-Platzhaltern: je 3 für die vier Variablen mit `.x`, `.y` und `.z`, und 1 für `warpSize`. Beginne mit `\n`, damit die Ausgabe jedes Threads in einer eigenen Zeile steht. Beende die Zeile mit einem Komma, weil die Werte folgen.
4. `8-12 gpu` **Die Werte.** Liste die 13 Werte in derselben Reihenfolge wie die Platzhalter auf, eine Variable pro Zeile, damit du die Reihenfolge leicht prüfen kannst. Die Regel: ein Wert pro `%d`, in der richtigen Reihenfolge. Ein fehlender Wert kann trotzdem kompilieren, und dann gibt `printf` falsche Zahlen aus, also zähl auf beiden Seiten.
5. `15-16,19-20 cpu` **Die main-Funktion.** Schreib `main` mit `return 0;` am Ende. Es ist derselbe Rahmen wie in den früheren Lektionen.
6. `17 cpu` **Der Start.** `<<<2, 4>>>` setzt `gridDim.x` auf 2 und `blockDim.x` auf 4. Einfache Zahlen lassen die Größen `.y` und `.z` bei 1.
7. `18 cpu` **Auf die GPU warten.** `cudaDeviceSynchronize();` hält das Programm am Leben, bis alle 8 Zeilen ausgegeben sind. Ohne diese Zeile kann `main` enden, bevor die Ausgabe der GPU erscheint.

</div>

## Kompilieren und ausführen

Der erste Befehl kompiliert den Code zu einem Programm. Der zweite Befehl führt es aus.

```bash
nvcc -o first_kernel first_kernel.cu
./first_kernel
```

- `nvcc` ist der CUDA-Compiler.
- `-o first_kernel` gibt dem Programm den Namen `first_kernel`. Ohne diese Option heißt es `a.out`.
- `first_kernel.cu` ist die Quelldatei mit dem Code von oben.
- `./first_kernel` führt das Programm aus dem aktuellen Ordner aus.

## Ausgabe

Das Programm gibt 8 Zeilen aus, eine pro Thread:

```
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(3,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(3,0,0)  warpSize=32
```

- `gridDim` und `blockDim` sind in jeder Zeile gleich, weil die Startkonfiguration für alle Threads dieselbe ist.
- `blockIdx` ändert sich pro Block. `threadIdx` ändert sich pro Thread und beginnt im zweiten Block wieder bei 0.
- Die Größen in `.y` und `.z` sind 1 und die Indizes in `.y` und `.z` sind 0, weil `<<<2, 4>>>` einfache Zahlen nutzt.
- `warpSize` ist immer 32.
- Hier hat Block 1 vor Block 0 ausgegeben. Die GPU führt Blöcke unabhängig und in keiner festen Reihenfolge aus. Die Reihenfolge der Blöcke und der Threads in jedem Block kann sich also von Lauf zu Lauf ändern.

## Selbst schreiben

Lies die eingebauten Variablen, um die Größe eines Starts herauszufinden, und übergib die Größen als `dim3`-Werte.

1. Leg `launch_size.cu` mit dem Gerüst unten an.
2. Lass nur Thread 0 von Block 0 etwas ausgeben, damit die Zeile einmal erscheint.
3. Gib die Anzahl der Blöcke, die Threads pro Block, die Gesamtzahl der Threads und die Warp-Größe aus.
4. Starte mit `dim3 grid(3)` und `dim3 block(64)`.

```c
#include "cuda_runtime.h"
#include <stdio.h>

__global__ void launchSize()
{
    // TODO: only the first thread of the first block prints
    // TODO: print blocks, threads per block, total threads and warp size
}

int main()
{
    // TODO: make a dim3 grid of 3 blocks and a dim3 block of 64 threads
    // TODO: launch launchSize with them
    cudaDeviceSynchronize();
    return 0;
}
```

??? tip "Hinweis"
    Prüfe `blockIdx.x == 0 && threadIdx.x == 0`. Die Gesamtzahl der Threads ist `gridDim.x * blockDim.x`. Ein `dim3` kommt in den Start wie eine Zahl: `<<<grid, block>>>`.

??? note "Lösung"
    ```c
    #include "cuda_runtime.h"
    #include <stdio.h>

    __global__ void launchSize()
    {
        if (blockIdx.x == 0 && threadIdx.x == 0) {
            printf("blocks: %d, threads per block: %d, total threads: %d, warp size: %d\n",
                   gridDim.x, blockDim.x, gridDim.x * blockDim.x, warpSize);
        }
    }

    int main()
    {
        dim3 grid(3);
        dim3 block(64);
        launchSize<<<grid, block>>>();
        cudaDeviceSynchronize();
        return 0;
    }
    ```

    Kompiliere und starte es mit `nvcc -o launch_size launch_size.cu` und `./launch_size`. Du solltest eine Zeile sehen: `blocks: 3, threads per block: 64, total threads: 192, warp size: 32`.

## Glossar

- GPU (Graphics Processing Unit): der Prozessor, der Kernels ausführt.
- CPU (Central Processing Unit): der Hauptprozessor, der `main()` ausführt und Kernels startet.
- CC (Compute Capability): die Versionsnummer einer GPU-Generation. Sie legt die Grenzen in der Tabelle oben fest ([Lektion 03](../Lesson-03/notes.md)).
- `gridDim`: Anzahl der Blöcke in jeder Richtung (x, y, z). Für jeden Thread des Starts gleich.
- `blockDim`: Anzahl der Threads pro Block in jeder Richtung. Für jeden Thread des Starts gleich.
- `blockIdx`: Index des Blocks, zu dem der Thread gehört. In jeder Richtung immer kleiner als `gridDim`.
- `threadIdx`: Index des Threads innerhalb seines Blocks. Beginnt in jedem Block wieder bei null.
- `warpSize`: Anzahl der Threads pro Warp. Auf aller aktuellen Hardware 32.
- `dim3`: ein CUDA-Struct mit den Ganzzahl-Feldern `.x`, `.y` und `.z`, für Grid- und Blockgrößen. Einfache Zahlen in `<<<>>>` werden zu einem `dim3` mit `.y=1` und `.z=1`.
