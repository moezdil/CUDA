# Das Volta-Whitepaper lesen

Diese Lektion geht mit dir durch das Whitepaper zur V100. Sie zeigt, was Volta verändert hat und warum das für heutige GPUs wichtig ist.

## Warum ein echtes Whitepaper lesen

Ein Whitepaper zeigt das Design der Hardware direkt und ohne Vereinfachung. Volta ist eines der wichtigsten Beispiele. Das V100-Whitepaper zeigt den Moment, in dem GPUs eine neue Richtung eingeschlagen haben.

## Fang mit den Key Features an

Spring nicht sofort zu den Diagrammen oder Zahlen. Fang mit dem Abschnitt "Key Features" an. Er ist kurz und zeigt, was die Architektur erreichen will.

Bei Volta ist der Fokus klar. Die Architektur ist für künstliche Intelligenz gebaut. Das ist eine Änderung des Zwecks und nicht nur eine Verbesserung gegenüber der vorherigen Generation.

## Tensor-Cores

Die wichtigste Neuerung in Volta sind die Tensor-Cores.

Vor Volta liefen Matrizenoperationen auf den normalen CUDA-Cores. Das hat funktioniert, war aber nicht effizient. Volta gibt Matrizenoperationen ihre eigene Hardware.

Ab hier ist die GPU nicht mehr nur ein allgemeines Rechengerät. Sie ist von Grund auf für KI-Workloads gebaut.

## Der Streaming-Multiprozessor (SM)

Der Streaming-Multiprozessor (SM) ist der zentrale Baustein der GPU. Volta hat einen neu entworfenen SM.

Eine wichtige Verbesserung: Verschiedene Arten von Operationen können gleichzeitig laufen. Bei Pascal teilten sich Ganzzahl- und Gleitkomma-Operationen einen Ausführungspfad und mussten sich abwechseln. Bei Volta laufen sie parallel.

Moderne Workloads mischen oft verschiedene Arten von Operationen. Durch diese Änderung wird die Hardware also besser ausgenutzt.

<volta-shift></volta-shift>

## Geschwindigkeit der Befehle

Eine neue Architektur bringt nicht nur mehr Kerne. Sie macht auch bestehende Operationen schneller.

Bei Volta brauchen viele Befehle weniger Takte als bei Pascal. Ampere und Hopper verbessern das weiter. Dieses Muster setzt sich bis 2026 fort. Beim Fortschritt geht es um Effizienz und nicht nur um Größe.

## Speicher

Volta nutzt HBM2-Speicher. Er hat eine höhere Speicherbandbreite als frühere Generationen.

Moderne GPU-Workloads werden oft davon ausgebremst, wie schnell sich Daten bewegen, nicht nur davon, wie schnell sie verarbeitet werden. Eine höhere Bandbreite liefert den Recheneinheiten mehr Daten, ohne dass sie warten müssen.

## NVLink

Volta führt die zweite Generation von NVLink ein. NVLink verbindet GPUs mit hoher Geschwindigkeit miteinander.

Volta erhöht sowohl die Zahl der Verbindungen als auch ihre Geschwindigkeit. Dadurch werden Systeme mit mehreren GPUs viel effizienter.

> [!NOTE]
> 2026 hängen große KI-Systeme mit Hopper und Blackwell noch stärker von dieser Idee ab. Volta war einer der ersten Schritte in diese Richtung.

## Anzahl der Transistoren

Die Anzahl der Transistoren zeigt, wie viel Hardware in einer GPU steckt. Die V100 hat etwa 21 Milliarden Transistoren.

> [!NOTE]
> Hopper kommt auf etwa 80 Milliarden Transistoren. Blackwell geht mit komplexeren Designs noch weiter.

Bei diesem Wachstum geht es nicht nur um Größe. Es spiegelt neue Einheiten, neue Speichersysteme und fortschrittlichere Ausführungsmodelle wider.

## Jedes Mal derselbe Aufbau

Whitepaper zu verschiedenen Architekturen haben einen ähnlichen Aufbau:

1. Neue Funktionen
2. Aufbau des SM
3. Performance-Vergleiche
4. Technische Daten

Wenn du ein Whitepaper lesen kannst, fallen dir die anderen viel leichter.

## Die Rolle von Volta

Aus Sicht von 2026 ist Volta mehr als eine starke GPU ihrer Zeit. Mit Volta wurden GPUs auf KI ausgerichtet. Ampere, Hopper und jetzt Blackwell bauen alle auf dieser Idee auf und treiben sie weiter.

Wenn du das V100-Whitepaper liest, verstehst du besser, warum GPUs heute so aussehen, wie sie aussehen.

> [!TIP]
> Ein Beispiel: https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf

## Glossar

- V100: die Volta-GPU, durch deren Whitepaper diese Lektion geht.
- Key Features: ein kurzer Abschnitt im Whitepaper, der zeigt, was die Architektur erreichen will.
- Tensor-Cores: eigene Hardware für Matrizenoperationen. Volta hatte sie als Erste.
- Streaming-Multiprozessor (SM): der zentrale Baustein der GPU. Volta hat einen neu entworfenen SM.
- HBM2: der Speicher, den Volta nutzt. Er hat eine höhere Speicherbandbreite als frühere Generationen.
- Speicherbandbreite: wie schnell Daten zu den Recheneinheiten fließen. Mehr Bandbreite heißt weniger Warten.
- NVLink: eine schnelle Verbindung, die GPUs miteinander verbindet. Volta hat die zweite Generation davon.
- Anzahl der Transistoren: wie viel Hardware in einer GPU steckt. Die V100 hat etwa 21 Milliarden Transistoren.
