# Das CUDA Toolkit, die Grundlage der GPU-Programmierung

Diese Lektion erklärt, was das CUDA Toolkit ist und was es dir bietet. Es ist die Umgebung, in der du Programme für die GPU schreibst, ausführst und untersuchst.

## Was CUDA ist

CUDA ist NVIDIAs Plattform für paralleles Rechnen. Sie verbindet deinen Code mit der GPU. Ohne CUDA kannst du die GPU nicht voll steuern.

## Der Compiler: nvcc

Das Herz des Toolkits ist der Compiler `nvcc`. Er macht aus deinem CUDA-Code Code, den die GPU ausführen kann.

Das passiert in zwei Schritten. Zuerst wird dein Code in eine Zwischenform übersetzt, meist PTX. Dann wird PTX zu Maschinencode für eine bestimmte GPU-Architektur.

<nvcc-pipeline></nvcc-pipeline>

Stand 2026 ist dieser Schritt wichtiger als früher. Architekturen wie Ampere, Hopper und Blackwell haben unterschiedliche Befehle, Datentypen und Ausführungsmodelle. Du musst also für die richtige Architektur kompilieren. Derselbe Code läuft vielleicht auf verschiedenen GPUs. Ohne das richtige Kompilierziel verhält er sich aber nicht gleich und wird nicht gleich schnell.

## Bibliotheken

Das Toolkit bringt auch optimierte Bibliotheken mit. Sie nutzen die GPU gut, sodass du nicht alles selbst schreiben musst. Es gibt Bibliotheken für:

- lineare Algebra
- Fourier-Transformationen
- Erzeugung von Zufallszahlen
- Deep Learning

Diese Bibliotheken bekommen Updates für neue Hardware. Neuere CUDA-Versionen für Hopper und Blackwell unterstützen neue Datenformate wie FP8 und sogar FP4. Moderne KI-Workloads nutzen diese Formate mit niedriger Genauigkeit.

## Die Runtime API

Dein Programm spricht über die CUDA Runtime API mit der GPU. Mit ausdrücklichen API-Aufrufen kann dein Programm:

- Speicher auf der GPU reservieren
- Daten zwischen CPU und GPU verschieben
- Kernel starten

Das Verschieben von Daten ist in GPU-Programmen oft ein Hauptengpass. Zu wissen, wann und wie sich Daten bewegen, ist also genauso wichtig wie das Schreiben des Kernels.

## Werkzeuge für Profiling und Debugging

Du musst auch sehen können, wie sich dein Programm verhält. Das Toolkit hat Werkzeuge für Profiling, Debugging und die Analyse von GPU-Anwendungen. Sie messen die Performance, finden Engpässe und spüren Speicherprobleme auf. 2026 sind Workloads groß und komplex. Performance-Tuning ist deshalb ein fester Teil der Entwicklung.

## Beispielprogramme

Das Toolkit kommt mit Beispielprogrammen. Sie zeigen, wie Speicher verwaltet wird, wie Kernel gestartet werden und wie du die Performance verbesserst. Wenn du sie durcharbeitest, kommst du schnell von der Theorie zum echten Verständnis.

## Das Toolkit folgt der Hardware

Das Toolkit ist heute eng mit der GPU-Architektur verbunden. Jede neue Architektur bringt neue Hardware-Funktionen, und das Toolkit fügt die Unterstützung dafür hinzu.

- CUDA 12.x und 13.x brauchst du, um Hopper und Blackwell voll zu unterstützen. Sie bringen neue Befehle, neue Genauigkeitsformate und fortschrittlichere Ausführungsfunktionen.

CUDA versucht nicht mehr, alles gleich gut zu unterstützen. Das Ziel ist, moderne Hardware voll auszunutzen.

> [!WARNING]
> Die Unterstützung für ältere Architekturen wird nach und nach entfernt. Maxwell, Pascal und sogar Volta sind nicht mehr das Hauptziel neuer Versionen.

> [!NOTE]
> Das Toolkit ist auch kein festes Paket mehr. Compiler, Bibliotheken und Profiling-Werkzeuge ändern sich heute unabhängiger voneinander. Das zeigt, wie komplex das Ökosystem geworden ist. CUDA ist heute eine ganze Plattform.

## Zusammenfassung

Das CUDA Toolkit ist die komplette Umgebung für die GPU-Programmierung. Damit schreibst du Code, kompilierst ihn, führst ihn aus, analysierst ihn und verbesserst ihn. Stand 2026 musst du CUDA verstehen, wenn du ernsthaft mit GPUs arbeiten willst. Alles andere baut darauf auf.

## Glossar

- CUDA: NVIDIAs Plattform für paralleles Rechnen. Sie verbindet deinen Code mit der GPU.
- CUDA Toolkit: die komplette Umgebung, um GPU-Programme zu schreiben, zu kompilieren, auszuführen, zu analysieren und zu verbessern.
- `nvcc`: der Compiler im Herzen des Toolkits. Er macht aus CUDA-Code Code, den die GPU ausführen kann.
- PTX: die Zwischenform, die `nvcc` meist zuerst erzeugt, vor dem Maschinencode für eine bestimmte GPU-Architektur.
- Kompilierziel: die GPU-Architektur, für die du kompilierst. Ein falsches Ziel kann Verhalten und Geschwindigkeit ändern.
- Runtime API: die Aufrufe, mit denen dein Programm GPU-Speicher reserviert, Daten verschiebt und Kernel startet.
- Profiling-Werkzeuge: Werkzeuge im Toolkit, die die Performance messen, Engpässe finden und Speicherprobleme aufspüren.
- FP8 und FP4: Datenformate mit niedriger Genauigkeit, die moderne KI-Workloads auf Hopper und Blackwell nutzen.
