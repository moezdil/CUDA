# Lektion 04: Eingebaute Variablen

Jeder Kernel hat fünf eingebaute Variablen, die du nur lesen kannst: `gridDim`, `blockDim`, `blockIdx`, `threadIdx` und `warpSize`. Du übergibst sie nicht und deklarierst sie nicht. Die Hardware setzt sie beim Start, passend zur Startkonfiguration.

## gridDim

`gridDim` enthält die Anzahl der Blöcke in jeder Richtung. Bei `<<<2, 4>>>` ist `gridDim.x` gleich 2, und `gridDim.y` und `gridDim.z` sind 1. Die Größe des Grids steht beim Start fest. Deshalb sieht jeder Thread dasselbe `gridDim`.

## blockDim

`blockDim` enthält die Anzahl der Threads pro Block in jeder Richtung. Bei `<<<2, 4>>>` ist `blockDim.x` gleich 4, und `blockDim.y` und `blockDim.z` sind 1. Die Formel für die globale ID aus Lektion 02 nutzt diesen Wert: `blockIdx.x * blockDim.x + threadIdx.x`.

## blockIdx

`blockIdx` ist der Index des Blocks, zu dem der Thread gehört. Bei 2 Blöcken ist `blockIdx.x` für alle Threads in Block 0 gleich 0 und für alle Threads in Block 1 gleich 1. Der Wert ist immer kleiner als `gridDim.x`.

## threadIdx

`threadIdx` ist der Index des Threads innerhalb seines Blocks. Er beginnt in jedem Block wieder bei 0. In einem Block mit 4 Threads ist `threadIdx.x` 0, 1, 2, 3.

`gridDim`, `blockDim`, `blockIdx` und `threadIdx` sind alle Structs vom Typ `dim3` mit den Feldern `.x`, `.y` und `.z`. Wenn du `<<<2, 4>>>` mit einfachen Zahlen schreibst, setzt CUDA für dich `.y = 1` und `.z = 1`.

## warpSize

`warpSize` ist die Anzahl der Threads pro Warp. Auf jeder aktuellen GPU ist sie 32. Sie ist eine Variable und keine feste Konstante, weil NVIDIA sie in einer zukünftigen Architektur ändern könnte.

> [!TIP]
> Wenn du 32 schreibst, funktioniert das heute. Wenn du `warpSize` liest, bleibt dein Code auch dann richtig, falls sich der Wert einmal ändert.

## Hardwaregrenzen

Bevor ein Kernel läuft, prüft der Treiber die Startkonfiguration gegen die Hardwaregrenzen. Ist ein Wert zu groß, startet der Kernel nicht. Das sind die Grenzen für CC 3.0 und neuer (Kepler bis Blackwell):

| Variable      | Dimension     | Maximalwert |
|---------------|---------------|-------------|
| `gridDim.x`   | Blöcke in x   | 2^31 - 1    |
| `gridDim.y`   | Blöcke in y   | 65535       |
| `gridDim.z`   | Blöcke in z   | 65535       |
| `blockDim.x`  | Threads in x  | 1024        |
| `blockDim.y`  | Threads in y  | 1024        |
| `blockDim.z`  | Threads in z  | 64          |
| Threads/Block | gesamt        | 1024        |

`blockDim.x * blockDim.y * blockDim.z` darf nicht größer als 1024 sein, selbst wenn jeder einzelne Wert innerhalb seiner Grenze liegt. Das ist dieselbe Grenze von 1024 Threads pro Block wie in Lektion 02.

## Code

Dieses Programm startet einen Kernel, der in jedem Thread alle fünf eingebauten Variablen ausgibt. So siehst du, welche Werte sich ändern und welche gleich bleiben.

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

- Die beiden CUDA-Header deklarieren die Runtime-Funktionen (zum Beispiel `cudaDeviceSynchronize`) und die eingebauten Variablen. `stdio.h` stellt `printf` bereit.
- `__global__` markiert `printBuiltins` als Kernel. Er läuft auf der GPU und wird von der CPU gestartet.
- Das `printf` im Kernel läuft einmal pro Thread. Jedes `%d` wird mit einem Feld gefüllt, in der Reihenfolge, die unter dem Format-String steht.
- `printBuiltins<<<2, 4>>>()` startet 2 Blöcke mit 4 Threads. Also führen 8 Threads den Kernel aus und geben 8 Zeilen aus.
- `cudaDeviceSynchronize()` lässt die CPU warten, bis der Kernel fertig ist. Ein Kernel-Start kehrt sofort zurück. Ohne dieses Warten könnte `main` enden, bevor die Ausgabe der GPU erscheint.

## Kompilieren und ausführen

Kompiliere die Quelldatei zu einem Programm und führe es dann aus, um die ausgegebenen Werte zu sehen.

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc` ist der CUDA-Compiler.
- `first_kernel.cu` ist die Quelldatei mit dem Code von oben.
- `-o first_kernel` gibt dem Programm den Namen `first_kernel`. Ohne diese Option heißt es `a.out`.
- `./first_kernel` führt das Programm aus dem aktuellen Ordner aus.

Das Programm gibt die folgende Ausgabe aus. Sie hat 8 Zeilen, eine pro Thread.

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

`gridDim` und `blockDim` sind in jeder Zeile gleich, weil die Startkonfiguration für alle Threads gleich ist. `blockIdx` ändert sich pro Block. `threadIdx` ändert sich pro Thread und beginnt im zweiten Block wieder bei 0. Die Größen `.y` und `.z` sind 1 und die Indizes `.y` und `.z` sind 0, weil `<<<2, 4>>>` einfache Zahlen nutzt. `warpSize` ist immer 32.

Hier hat Block 1 vor Block 0 ausgegeben. Die GPU führt Blöcke unabhängig voneinander und in keiner festen Reihenfolge aus. Die Reihenfolge der Blöcke und der Threads in jedem Block kann sich also von Lauf zu Lauf ändern.

## Visualisierung

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

## Glossar

- `gridDim`: Anzahl der Blöcke in jeder Richtung (x, y, z). Für jeden Thread im Start gleich.
- `blockDim`: Anzahl der Threads pro Block in jeder Richtung. Für jeden Thread im Start gleich.
- `blockIdx`: Index des Blocks, zu dem der Thread gehört. In jeder Richtung immer kleiner als `gridDim`.
- `threadIdx`: Index des Threads innerhalb seines Blocks. Beginnt in jedem Block wieder bei null.
- `warpSize`: Anzahl der Threads pro Warp. Auf aktueller Hardware immer 32.
- `dim3`: ein CUDA-Struct mit den Integer-Feldern `.x`, `.y` und `.z`. Die vier Index- und Größenvariablen haben diesen Typ. Einfache Zahlen in `<<<>>>` werden zu einem `dim3` mit `.y=1` und `.z=1`.
