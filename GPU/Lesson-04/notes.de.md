# GPU und GPU-Chip

Diese Lektion erklärt den Unterschied zwischen einem GPU-Chip und einer GPU. Die beiden hängen zusammen, sind aber nicht dasselbe.

## Der GPU-Chip

Der GPU-Chip ist das eigentliche Stück Silizium, in dem alle Berechnungen stattfinden. Er hat keine Kühlung, keine Anschlüsse und keine externen Speichermodule.

Im Chip findest du:

- Recheneinheiten, die parallele Arbeit erledigen  
- Controller, die steuern, wie sich Daten bewegen  
- interne Logik, die alles koordiniert  

Der Chip ist der eigentliche "Motor".

## Chip-Namen

Chip-Namen verbinden einen Chip mit seiner Architektur. Zum Beispiel:

- GF100 → Fermi  
- GA100 → Ampere  

Das Präfix zeigt die Architektur.

> [!NOTE]
> Dieses Namensschema gilt auch bei modernen GPUs um 2026 noch.

## Die GPU

Eine GPU ist das komplette Produkt, das du benutzt. Sie ist ein ganzes System, das um den Chip herum gebaut ist. Dazu gehören:

- der Chip selbst  
- VRAM (der Speicher, der daran angeschlossen ist)  
- Bauteile für die Stromversorgung  
- Ausgänge (zum Beispiel HDMI oder DisplayPort)  
- ein Kühlsystem  

Eine GPU ist also der Chip plus alles, was nötig ist, um ihn nutzen zu können.

## Consumer-GPUs

GeForce-GPUs sind für normale Umgebungen gebaut:

- Desktop-PCs  
- Laptops  
- private Workstations  

Diese Systeme haben keine besondere Kühlung. Die GPU muss mit ihrer Wärme selbst klarkommen. Deshalb haben die meisten Consumer-GPUs:

- große Kühlkörper  
- mehrere Lüfter  
- sichtbare Kühlkonstruktionen  

Sie sind in sich geschlossen und müssen in einem normalen PC-Gehäuse funktionieren.

## Data Center GPUs

Die A100 basiert auf Ampere, ihr Chip ist der GA100. Die komplette GPU sieht aber ganz anders aus als eine GeForce-Karte. Sie hat keinen Lüfter.

GPUs für Rechenzentren stecken in Server-Racks. Dort wird die Kühlung außerhalb der GPU erledigt:

- der Luftstrom kommt vom System  
- gekühlt wird auf Ebene des Racks  

Dadurch ist die GPU einfacher und kompakter. Sie eignet sich besser für den Einsatz in großer Zahl.

<chip-vs-gpu></chip-vs-gpu>

## Den Chip online nachschauen

> [!TIP]
> Datenblatt-Seiten wie TechPowerUp zeigen das deutlich. Suche nach "A100 TechPowerUp", dann siehst du den Chip-Namen → GA100. Folge diesem Link, dann siehst du den Chip selbst, ohne Kühlung und ohne Extras.

## Der Unterschied in Kürze

Der GPU-Chip ist das Gehirn. Die GPU ist das komplette System.

Chip = Motor  
GPU = komplette Maschine  

## Warum das wichtig ist

- die Architektur beschreibt den Chip, nicht das komplette Produkt  
- die Performance beginnt auf der Ebene des Chips  
- wie sich die GPU in der Praxis verhält, hängt vom ganzen GPU-System ab  

Wenn du das verwechselst, kannst du Folgendes falsch verstehen:

- Datenblätter  
- Performance-Vergleiche  
- sogar das Verhalten von CUDA  

So kannst du tiefere CUDA-Themen leichter verstehen.

## Glossar

- GPU-Chip: das eigentliche Stück Silizium, in dem alle Berechnungen stattfinden, ohne Kühlung und ohne Anschlüsse.
- GPU: das komplette Produkt, das um den Chip herum gebaut ist, mit Speicher, Stromversorgung, Ausgängen und Kühlung.
- VRAM: der Speicher, der an den GPU-Chip angeschlossen ist.
- Präfix des Chip-Namens: die ersten Buchstaben eines Chip-Namens. Sie zeigen die Architektur, zum Beispiel GA für Ampere.
- Fermi: eine Nvidia-Architektur, deren Chips Namen wie GF100 haben.
- Ausgänge: Anschlüsse an einer GPU, zum Beispiel HDMI oder DisplayPort.
- Kühlkörper: ein Kühlteil, mit dem Consumer-GPUs ihre eigene Wärme abführen.
- Server-Rack: der Ort, an dem GPUs im Rechenzentrum stecken. Die Kühlung passiert dort auf Ebene des Racks und nicht an der GPU.
