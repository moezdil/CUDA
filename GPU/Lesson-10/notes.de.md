# GPU-Whitepaper lesen

Diese Lektion erklärt, was GPU-Whitepaper sind, wie du sie findest und wie du sie liest.

## Was ein Whitepaper ist

Ein Whitepaper ist ein offizielles technisches Dokument über eine GPU. Am Anfang wirkt es vielleicht schwer und zu detailliert. Es ist aber die genaueste Quelle über eine GPU. Es enthält kein Marketing und keine Vereinfachungen. Es zeigt, wie die Hardware wirklich gebaut ist.

## Ein Whitepaper finden

Nimm den Namen des Chips und hänge "white paper" an. Zum Beispiel: `GA100 white paper` oder `H100 white paper`

> [!TIP]
> Nicht jedes Ergebnis ist nützlich. Blogbeiträge, Zusammenfassungen und Vergleiche können helfen, reichen aber nicht aus. Such immer nach dem offiziellen PDF.

## Ein einheitlicher Aufbau

Die Whitepaper von NVIDIA folgen einem einheitlichen Aufbau. Jede neue Architektur wird meist im Vergleich zur vorherigen erklärt. Ein Whitepaper zeigt also, was neu ist und was sich geändert hat. Deshalb tauchen dieselben Tabellen in verschiedenen Whitepapern auf.

Wenn du ein Whitepaper gut verstanden hast, kannst du die anderen viel leichter lesen.

## Die Richtung der GPU-Architekturen

Stand 2026 zeigen GPU-Architekturen eine klare Richtung:

- Pascal war noch vor allem eine Architektur für allgemeine Berechnungen.
- Volta hat die Tensor-Cores eingeführt. GPUs wurden gezielt für KI-Workloads optimiert.
- Ampere hat das ausgebaut: mehr Durchsatz, bessere Effizienz und Funktionen wie Unterstützung für Sparsity.
- Hopper hat FP8 und neue Ausführungsmodelle für KI-Systeme im großen Stil hinzugefügt.
- Blackwell bringt neue Formate wie NVFP4, die extrem niedrige Genauigkeit direkt in die Hardware holen. Das verändert, wie große Modelle bereitgestellt und skaliert werden.

GPUs sind nicht mehr nur Rechengeräte. Sie sind die Infrastruktur für KI-Systeme.

<arch-timeline focus="Pascal"></arch-timeline>

## Der Streaming-Multiprozessor (SM)

Der wichtigste Abschnitt in einem Whitepaper ist der über den Streaming-Multiprozessor (SM). Der SM ist das Herz der GPU. In ihm kommen zusammen:

* CUDA-Cores
* Tensor-Cores
* Scheduling
* Speicherzugriff

Wenn du sehen willst, was sich in einer Architektur wirklich geändert hat, schau dir den SM an. Die Entwicklung ist klar:

- Pascal hat keine Tensor-Cores.
- Volta führt sie ein.
- Ampere verbessert und skaliert sie.
- Hopper optimiert sie für Transformer-Workloads.
- Blackwell erweitert sie um neue Genauigkeitsformate und Befehle.

Jeder Schritt verändert, wofür die GPU gebaut ist.

## Die Reihenfolge der Abschnitte

Die Architekturen ändern sich, aber die Art, wie sie dokumentiert werden, bleibt gleich. Die Reihenfolge ist:

1. Neue Funktionen
2. Aufbau des SM
3. Performance-Vergleiche
4. Technische Daten

Diese Einheitlichkeit ist Absicht. So lässt sich die Entwicklung über die Generationen hinweg leichter verfolgen.

<whitepaper-map></whitepaper-map>

## Wie du eines liest

Beim Lesen von Whitepapern geht es nicht darum, Zahlen auswendig zu lernen. Es geht darum, Veränderungen zu verstehen. Schau dir den SM an, finde die neuen Hardware-Einheiten und vergleiche sie mit der vorherigen Generation.

## Glossar

- Whitepaper: ein offizielles technisches Dokument, das zeigt, wie eine GPU wirklich gebaut ist, ohne Marketing.
- Streaming-Multiprozessor (SM): das Herz der GPU. In ihm kommen CUDA-Cores, Tensor-Cores, Scheduling und Speicherzugriff zusammen.
- Tensor-Cores: Hardware-Einheiten, die mit Volta kamen. Mit ihnen wurden GPUs gezielt für KI-Workloads optimiert.
- Pascal: eine Architektur vor allem für allgemeine Berechnungen. Sie hat keine Tensor-Cores.
- Unterstützung für Sparsity: eine Funktion, die mit Ampere kam, zusammen mit mehr Durchsatz und besserer Effizienz.
- FP8: ein Format, das mit Hopper für KI-Systeme im großen Stil kam.
- NVFP4: ein Format von Blackwell, das extrem niedrige Genauigkeit direkt in die Hardware holt.
