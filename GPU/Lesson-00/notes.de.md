# Grundlagen: CPU und GPU im Vergleich

In dieser Lektion lernst du, wie sich eine GPU von einer CPU unterscheidet. Außerdem siehst du, was in einer GPU steckt.

## Code auf die GPU zu verschieben reicht nicht

Code wird nicht automatisch schnell, nur weil er auf einer GPU läuft. Gute Performance bekommst du erst, wenn du verstehst, wie die GPU arbeitet.

## Unterschiedliche Ziele

CPUs und GPUs verarbeiten beide Daten und führen Befehle aus. Sie sind aber für ganz unterschiedliche Ziele gebaut.

Eine CPU ist gebaut für:

- schnelle Reaktion  
- komplexe Logik  
- sequentielle Ausführung (ein Schritt nach dem anderen)  

Eine GPU ist dafür gebaut, viele Dinge gleichzeitig zu verarbeiten.

- CPU: eine komplexe Aufgabe, sehr schnell erledigt  
- GPU: viele einfache Aufgaben, parallel erledigt  

## Speicher

Eine CPU nutzt den Arbeitsspeicher des Systems (RAM). Alles läuft über denselben gemeinsamen Speicherbereich.

Eine GPU hat ihren eigenen Speicher, den VRAM. Das bedeutet:

- CPU und GPU teilen Daten nicht automatisch  
- Daten müssen zwischen den beiden kopiert werden  

Dieses Kopieren kann zum Engpass werden. Darum musst du hier aufpassen.

## Cache und Shared Memory

Ein Cache ist ein kleiner, sehr schneller Speicher nah am Prozessor. CPUs und GPUs haben beide Caches, nutzen sie aber unterschiedlich.

> [!NOTE]
> CPUs setzen auf mehrere Cache-Ebenen: L1, L2 und L3. Sie sind klein, aber sehr schnell.

Auch GPUs haben einen Cache. Dazu kommt noch etwas: das Shared Memory. Threads in der GPU nutzen es, um zusammenzuarbeiten und Daten zu teilen. Shared Memory ist eines der wichtigsten Werkzeuge, um GPU-Code zu optimieren.

## Geschwindigkeit der Kerne

Eine GPU ist nicht stärker, weil jeder Kern schneller ist. Ein einzelner CPU-Kern hat meist eine höhere Taktfrequenz, oft mehrere GHz. Ein einzelner GPU-Kern ist langsamer. Im Vergleich Kern gegen Kern gewinnt die CPU.

## Woher die Kraft der GPU kommt

Eine GPU hat viele einfache Kerne. Sie teilt die Arbeit in viele kleine Teile und führt sie gleichzeitig aus. Ihre Kraft kommt von der Anzahl der Kerne, die zusammenarbeiten. Sie kommt nicht von der Stärke jedes einzelnen Kerns.

GPUs sind nur dann besser, wenn sich ein Problem in parallele Teile aufteilen lässt. Bei einer sequentiellen Aufgabe kann eine CPU leicht schneller sein als eine GPU.

<cpu-vs-gpu></cpu-vs-gpu>

## Wie CPU und GPU zusammenarbeiten

Die GPU arbeitet nicht allein. In einem typischen System gilt:

- die CPU steuert das Programm  
- die GPU erledigt die parallele Arbeit  

Die beiden kommunizieren über eine Verbindung wie PCIe. Der Datenfluss sieht so aus:

CPU → schickt Daten an die GPU  
GPU → verarbeitet sie  
GPU → schickt die Ergebnisse zurück  

Wenn dieser Ablauf schlecht umgesetzt ist, sinkt die Performance.

## Der Streaming-Multiprozessor (SM)

Die wichtigste Einheit in einer GPU ist der Streaming-Multiprozessor (SM). Ein SM ist eine kleine Recheneinheit. Eine GPU besteht aus vielen SMs, die zusammenarbeiten.

Jeder SM hat alles, was er für parallele Arbeit braucht:

- Register, der schnellste Speicher, den es gibt  
- Shared Memory, über das Threads Daten austauschen  
- Steuereinheiten, die entscheiden, was wann läuft  
- Ausführungseinheiten, die die eigentliche Arbeit machen  

## Ausführungseinheiten

Jeder SM hat verschiedene Arten von Recheneinheiten. Jede Art ist auf etwas spezialisiert:

- Gleitkomma-Einheiten, die in Grafik und KI viel genutzt werden  
- Ganzzahl-Einheiten  
- Tensor-Cores für Matrizenrechnung, die für KI entscheidend ist  
- Spezialfunktions-Einheiten für komplexere Mathematik  
- Load/Store-Einheiten, die Daten zwischen Speicher und Recheneinheiten bewegen  

Eine GPU ist also nicht einfach "viele Kerne". Sie ist ein geordnetes System aus spezialisierten Einheiten.

## L2-Cache

Der L2-Cache ist eine Cache-Ebene für die ganze GPU. Er gehört nicht zu einem einzelnen SM wie der L1-Cache oder das Shared Memory. Er ist größer, aber langsamer. Er hilft, die Kosten von Speicherzugriffen zu senken.

<gpu-anatomy></gpu-anatomy>

## Warum das wichtig ist

Bei CUDA geht es nicht nur darum, Code zu schreiben. Es geht darum, die Hardware zu verstehen. Um eine GPU gut zu nutzen, musst du wissen:

- wie Speicher funktioniert  
- wie parallele Ausführung funktioniert  
- wie sich Daten bewegen  

GPU-Programmierung heißt, parallel zu denken. Diese Idee ist die Grundlage für alles, was in CUDA noch kommt.

## Glossar

- VRAM: der eigene Speicher der GPU, getrennt vom Arbeitsspeicher, den die CPU nutzt.
- Cache: ein kleiner, sehr schneller Speicher nah am Prozessor.
- Shared Memory: GPU-Speicher, über den Threads zusammenarbeiten und Daten teilen.
- Taktfrequenz: wie schnell ein einzelner Kern läuft, bei einer CPU oft mehrere GHz.
- PCIe: eine Verbindung, über die CPU und GPU sich gegenseitig Daten schicken.
- SM (Streaming-Multiprozessor): die wichtigste Recheneinheit in einer GPU. Eine GPU besteht aus vielen SMs.
- Tensor-Core: eine Recheneinheit in einem SM, gebaut für Matrizenrechnung, die für KI entscheidend ist.
- L2-Cache: ein größerer, aber langsamerer Cache für die ganze GPU, der nicht zu einem einzelnen SM gehört.
