# Eine echte GPU einordnen

Diese Lektion zeigt dir, wie du Architektur und Kategorie einer echten GPU herausfindest. Sie erklärt auch, warum die Zahl der Kerne in die Irre führen kann und welche Hinweise dir die Bauform gibt.

## Die GPU nachschlagen

Suche nach dem Namen der GPU zusammen mit "TechPowerUp". Suche zum Beispiel nach "A100 TechPowerUp" oder "RTX 3090 TechPowerUp" und öffne ein Ergebnis.

Die Seite zeigt viele Zahlen und Daten. Versuch nicht, alle zu verstehen. Konzentriere dich auf zwei Dinge: die Architektur und die Produktkategorie.

## Architektur und Kategorie

Die RTX 3090 nutzt die Ampere-Architektur. Sie gehört zur GeForce-Familie. Sie ist also für Endkunden gebaut, zum Beispiel für Gaming oder private Workstations.

Die A100 nutzt ebenfalls Ampere. Beide GPUs haben dieselbe Architektur, erfüllen aber unterschiedliche Zwecke.

- Die Architektur sagt dir, wie die GPU gebaut ist.
- Die Kategorie sagt dir, wo sie eingesetzt wird.

> [!NOTE]
> Ältere Unterlagen nennen die Kategorie für Rechenzentren oft "Tesla". Die neueren Nvidia-Begriffe (um 2026) sind Data Center GPU oder AI GPU.

Die RTX 3090 und die A100 basieren also beide auf Ampere, sind aber für verschiedene Welten gemacht. Die RTX 3090 ist für Gaming und den Alltag optimiert. Die A100 ist für KI-Workloads, Cloud-Infrastruktur und große Systeme gebaut.

## Vergleiche nicht nur die Zahl der Kerne

Zahlen wie 7000 oder 10000 Kerne wirken überzeugend, führen aber in die Irre. Sie zählen nämlich meist nur eine Art von Kern, oft die Single-Precision-Einheiten. Sie decken nicht alles ab, was in der GPU steckt.

Moderne GPUs haben verschiedene Arten von Recheneinheiten, vor allem neuere Architekturen wie Hopper und Blackwell. Die Zahl der Kerne allein erzählt nicht die ganze Geschichte.

## Die Bauform gibt Hinweise

GPUs für Rechenzentren wie die A100 oder H100 haben oft keine sichtbaren Lüfter. Sie laufen in Servern, und der Server kümmert sich um die Kühlung.

RTX-GPUs haben große Lüfter und Kühlsysteme. Sie sind für Desktop-PCs und Workstations gebaut und müssen deshalb ihre Wärme selbst abführen.

Daraus ergibt sich eine einfache Faustregel:

- Eine große, sichtbare Kühlung heißt: Die GPU ist sehr wahrscheinlich für Endkunden.
- Ein kompaktes Modul ohne Lüfter heißt: Es ist wahrscheinlich eine GPU für Rechenzentren.

> [!TIP]
> Das ist keine feste Regel, aber sie stimmt oft.

<spec-reader></spec-reader>

## Stell die richtigen Fragen

Du musst nicht jede Zahl verstehen. Stell dir lieber diese Fragen:

- Welche Architektur nutzt diese GPU?  
- Zu welcher Kategorie gehört sie?  
- Für welche Art von Problem ist sie gebaut?  

Mit diesen Antworten ergeben die restlichen Daten mehr Sinn. Für CUDA und die Arbeit mit GPUs ist der Zweck einer GPU genauso wichtig wie ihre Daten.

## Glossar

- TechPowerUp: eine Website mit GPU-Daten. Suche den Namen der GPU zusammen mit "TechPowerUp", um ihre Seite zu finden.
- Architektur: wie die GPU gebaut ist. Die RTX 3090 und die A100 nutzen beide Ampere.
- Kategorie: wo die GPU eingesetzt wird, zum Beispiel bei Endkunden oder im Rechenzentrum.
- GeForce: die NVIDIA-GPU-Familie für Endkunden, zum Beispiel für Gaming oder private Workstations.
- Data Center GPU: eine GPU für KI, Cloud und große Systeme. Ältere Unterlagen nennen diese Kategorie "Tesla".
- Zahl der Kerne: die Anzahl der Kerne, oft nur von einer Art. Sie erzählt nicht die ganze Geschichte.
