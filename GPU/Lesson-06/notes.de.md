# Nvidia-GPU-Architekturen

Diese Lektion erklärt, was Namen von Nvidia-GPU-Architekturen wie Fermi, Ampere und Hopper bedeuten. Sie zeigt, wie sich GPUs entwickelt haben und warum sie heute so aussehen, wie sie aussehen.

## Warum Architekturen wichtig sind

Namen wie Fermi, Ampere und Hopper sind mehr als nur Etiketten. Du musst sie nicht auswendig lernen. Es geht darum zu verstehen, wie sich GPUs über die Zeit verändert haben.

## Was "Architektur" bedeutet

Eine GPU-Architektur ist der Bauplan der GPU. Sie legt fest, wie alles im Chip aufgebaut ist.

Dabei geht es um mehr als nur die Kerne. Sie legt auch fest:

- wie Daten fließen  
- wie auf den Speicher zugegriffen wird  
- welche Arten von Operationen schnell sind  
- worauf die GPU optimiert ist  

Eine neue Architektur ist meist kein kleines Upgrade. Oft verschieben sich dabei die Prioritäten im Design.

## Die frühe moderne Zeit

Es hilft, die Zeitleiste wie eine Geschichte zu lesen. Frühe moderne GPUs konzentrierten sich auf allgemeine Berechnungen und Grafik.

Diese Architekturen haben Performance und Effizienz Schritt für Schritt verbessert:

- Fermi  
- Kepler  
- Maxwell  
- Pascal  

Das Ziel in dieser Zeit war, GPUs für allgemeine Workloads schneller und effizienter zu machen.

## KI rückt in den Mittelpunkt

Mit Volta gibt es einen klaren Wandel. Ab Volta setzte Nvidia gezielt auf Hardware speziell für KI.

Danach:

- hat Ampere diese Idee weiter ausgebaut  
- wurde Hopper stark auf KI-Workloads optimiert (vor allem auf Transformer)  

Ab hier waren GPUs nicht mehr nur Grafik-Hardware. Sie wurden zu vollwertigen Rechenplattformen.

## Neuere Architekturen

### Blackwell (2024–2025)

Blackwell ist rund um KI-Workloads im großen Stil entworfen. Es bringt mehr Rechenleistung, mehr Bandbreite und eine höhere Dichte.

Die echten Performance-Gewinne sind nicht in jedem Fall gleich. Sie hängen ab von:

- dem Workload  
- der Genauigkeit  
- dem Aufbau des Systems  

"Schnellere GPU" ist also nicht immer eine einfache Aussage.

### Rubin (2026, kommt gerade in den Einsatz)

Rubin geht über reines Skalieren hinaus. Es bringt KI-Systeme noch weiter voran.

Nach dem, was bisher bekannt ist, bringt Rubin:

- neuere Designs für Tensor-Cores  
- Unterstützung für HBM4-Speicher  
- sehr viele SMs  
- insgesamt eine höhere Rechendichte  

Rubin ist nicht nur ein Konzept. Es kommt schon in echten Systemen und Cloud-Umgebungen an.

### Rubin Ultra und danach

> [!NOTE]
> Nvidias Roadmap geht weiter. Rubin Ultra soll noch einen Schritt weiter gehen. Danach steht Feynman auf der Roadmap.

Die Richtung bleibt gleich. Alles geht hin zu größeren, stärker spezialisierten KI-Systemen.

<arch-timeline focus="Volta"></arch-timeline>

## Performance hängt vom Kontext ab

Einfache Zahlen sind für einen Vergleich schlecht geeignet. Beispiele dafür sind:

- TFLOPS  
- Taktfrequenz  

Diese Zahlen erzählen nicht die ganze Geschichte. Die Performance hängt davon ab:

- welche Art von Workload du ausführst  
- welche Genauigkeit du nutzt  
- wie sich der Speicher verhält  
- wie die Architektur aufgebaut ist  

Eine GPU kann auf dem Papier sehr stark aussehen und bei einer bestimmten Aufgabe trotzdem schlecht abschneiden. Eine andere GPU mit niedrigeren Rohwerten kann im echten Einsatz besser sein.

## Auch die Namen haben sich geändert

> [!NOTE]
> Ältere GPUs für Rechenzentren hießen oft "Tesla". Neuere heißen Data Center GPUs.

Das zeigt einen Wechsel im Fokus, weg von allgemeinen Berechnungen hin zu KI und Cloud-Systemen.

## Architekturen sind Design-Entscheidungen

Sieh Architekturen am besten als Design-Entscheidungen und nicht als Versionen. Jede Architektur beantwortet eine Frage: Welche Art von Problemen wollen wir jetzt lösen?

Mit diesem Blick ergeben GPU-Namen mehr Sinn. Unterschiede in der Performance werden logisch. CUDA-Konzepte lassen sich leichter verbinden.

## Zusammenfassung

GPU-Architekturen zeigen, wie sich das Rechnen selbst verändert. Der Weg führt von Grafik über allgemeine Berechnungen hin zu KI im großen Stil. Diesen Wandel zu verstehen ist ein wichtiger Schritt, bevor du tiefer in CUDA einsteigst.

## Glossar

- Architektur: der Bauplan der GPU. Er legt fest, wie alles im Chip aufgebaut ist.
- Volta: die Architektur, mit der Nvidia begann, gezielt auf Hardware speziell für KI zu setzen.
- Blackwell: eine Architektur von 2024 bis 2025, entworfen rund um KI-Workloads im großen Stil.
- Rubin: eine Architektur von 2026, die gerade in echten Systemen ankommt, mit neueren Designs für Tensor-Cores.
- HBM4: ein Speichertyp, den Rubin unterstützt.
- TFLOPS: eine einfache Performance-Zahl, die nicht die ganze Geschichte erzählt.
- Taktfrequenz: noch eine einfache Zahl, die allein für einen Vergleich schlecht geeignet ist.
- Tesla: der alte Name für Nvidia-GPUs im Rechenzentrum. Heute heißen sie Data Center GPUs.
