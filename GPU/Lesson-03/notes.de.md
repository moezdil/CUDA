# GPU-Datenblätter lesen

Diese Lektion zeigt dir, wie du die Generation und die Architektur einer GPU herausfindest. Als Beispiele dienen die RTX 3090 und die A100.

## GPU-Daten finden

Am einfachsten geht es mit einer Google-Suche. Zum Beispiel:

"A100 GPU TechPowerUp"

TechPowerUp ist eine Website, die genaue GPU-Daten von vielen Herstellern sammelt. Dort kannst du GPU-Details besonders leicht nachschlagen. Andere GPUs suchst du genauso:

"RTX 3090 TechPowerUp"

Öffne die Seite, dann siehst du alle Daten.

## Ein einfacher Vergleich

Vergleiche zwei GPUs:

- RTX 3090  
- A100  

Schau dir zuerst den Namen des Chips an. Zum Beispiel: A100 → GA100.

> [!NOTE]
> Um das Chip-Design geht es in einer späteren Lektion. Lies jetzt einfach nur den Namen.

Schau dir dann die Anzahl der Kerne an:

- A100 → etwa 7.000 Kerne  
- RTX 3090 → mehr als 10.000 Kerne  

Das heißt nicht, dass die RTX 3090 immer stärker ist. Die Zahl der Kerne zeigt nämlich nicht jede Art von Kern.

## Anzahl der Kerne

Eine Zahl wie "6.912 Kerne" (bei der A100) zählt meist nur die Kerne für einfache Genauigkeit (Single Precision). Diese Kerne erledigen normale Gleitkomma-Rechnungen. Die Zahl enthält nicht alle Kerne der GPU.

Moderne GPUs haben auch andere Arten von Kernen, zum Beispiel:

- Kerne für Ganzzahl-Operationen  
- Kerne für Operationen mit doppelter Genauigkeit (Double Precision)  
- spezielle Kerne für KI (Tensor-Cores)

Beurteile eine GPU also nicht nur nach dieser Zahl.

## Generation und Architektur

### RTX 3090

- Generation → GeForce  
- Architektur → Ampere  

GeForce-GPUs sind für normale Nutzer gebaut, und zwar in:

- Desktop-PCs  
- Laptops  
- Workstations  

Die wichtigsten Einsatzgebiete:

- Gaming  
- Content-Erstellung  
- allgemeine GPU-Aufgaben  

### A100

- Generation → (früher Tesla, heute Data Center GPUs)  
- Architektur → Ampere  

Diese GPUs sind gebaut für:

- Server  
- Rechenzentren  
- Supercomputer  

## Das Wichtigste

- RTX 3090 und A100 nutzen DIESELBE Architektur (Ampere)  
- aber sie sind für ganz unterschiedliche Einsatzgebiete gebaut  

Gleiche Architektur ≠ gleicher Zweck.

Zur Erinnerung:
- Architektur → technischer Aufbau
- Generation → Einsatzkategorie

<gpu-compare></gpu-compare>

## Am Aussehen erkennen

Oft kannst du den Unterschied schon erkennen, wenn du dir nur die Karte ansiehst.

### Data Center GPUs (A100, V100, P100)

- meist KEIN eingebauter Lüfter  
- kompaktes Design ohne Lüfter

Sie laufen in Rechenzentren mit starker externer Kühlung. Der Server kümmert sich um die Kühlung, nicht die GPU.

### GeForce-GPUs (RTX-Serie)

- haben eingebaute Lüfter  
- sind für eigenständige Systeme gedacht  

Sie laufen in:

- Desktop-PCs  
- privaten Workstations  

Diese Systeme brauchen ihre eigene Kühlung. Deshalb braucht die Karte Lüfter.

## Zusammenfassung

- Data Center GPUs → kein Lüfter  
- GeForce-GPUs → eingebauter Lüfter  

Unterschiedliche Umgebungen brauchen unterschiedliche Kühlung. Wenn du das weißt, kannst du:

- GPU-Datenblätter lesen  
- die richtige Hardware auswählen  
- typische Anfängerfehler vermeiden  

Das wird immer wichtiger, je tiefer du in CUDA einsteigst.

## Glossar

- TechPowerUp: eine Website, die genaue GPU-Daten von vielen Herstellern sammelt.
- Chip-Name: der Name des Chips in einer GPU, zum Beispiel GA100 bei der A100.
- Anzahl der Kerne: die Zahl der Kerne im Datenblatt. Sie zeigt nicht jede Art von Kern.
- Single-Precision-Kerne: Kerne für normale Gleitkomma-Rechnungen. Meist sind nur sie in der Kernzahl enthalten.
- Tensor-Cores: spezielle Kerne in modernen GPUs, gebaut für KI.
- Architektur: der technische Aufbau einer GPU.
- Generation: die Einsatzkategorie einer GPU, zum Beispiel GeForce oder Data Center GPUs.
- Ampere: die Architektur, die sich RTX 3090 und A100 teilen.
