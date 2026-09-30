# Architekturen und Chips

Diese Lektion erklärt, wie eine Architektur mit den echten Chips in GPUs zusammenhängt. Eine Architektur ist nicht ein einzelner Chip. Sie ist eine Familie von Chips, die denselben Grundaufbau haben.

## Eine Architektur, viele Chips

Nimm die Architektur Ada Lovelace. Zu ihr gehören verschiedene Chips, zum Beispiel:

- AD102  
- AD103  
- AD104  

Das Präfix "AD" verbindet sie alle mit derselben Architektur. Du weißt also schon, dass sie zusammengehören, bevor du ein einziges Datenblatt liest.

## Gleiches Design, andere Größe

Chips derselben Architektur werden unterschiedlich eingesetzt. Manche sind für High-End-GPUs gedacht. Andere sind für die Mittelklasse oder für kleinere Systeme.

Der AD102 steckt zum Beispiel meist in Spitzen-GPUs. Der AD104 kommt eher in kleineren, sparsameren Karten zum Einsatz. Nvidia skaliert also ein Design auf verschiedene Größen und Leistungsstufen.

## Andere Architekturen, andere Aufgaben

Nicht alle Architekturen sind für dieselbe Art von Arbeit gebaut. Vergleiche Ada Lovelace und Hopper:

- Ada ist vor allem für Consumer-GPUs gedacht, also für Gaming, Desktop-PCs und kreative Arbeit.  
- Hopper ist für Rechenzentren, KI-Training und Berechnungen im großen Stil gedacht.  

Der Unterschied liegt also im Zweck und nicht nur in der Performance. Manche Architekturen zielen auf Grafik und interaktive Arbeit. Andere zielen auf massiv parallele Berechnungen. Deshalb findest du keine GPUs mit Hopper in normalen PCs.

## Ein Hinweis fürs Auge

> [!NOTE]
> Das Aussehen einer Karte ist ein hilfreicher Hinweis, aber keine feste Regel.

GPUs für Rechenzentren sehen oft sehr schlicht aus, ohne sichtbare Lüfter. Sie stecken in Servern. Dort kommt die Kühlung vom Luftstrom, von den Racks und vom ganzen System.

Consumer-GPUs haben große Kühlsysteme und mehrere Lüfter. Sie laufen in einem normalen PC-Gehäuse und müssen deshalb mit ihrer Wärme selbst klarkommen.

## Ein Chip kann sich unterschiedlich verhalten

Gleicher Chip heißt nicht gleicher Zweck. Derselbe Chip kann in verschiedenen Formen auftauchen. Ein Hersteller kann:

- einige Kerne abschalten  
- die Leistungsgrenzen ändern  
- die Taktfrequenzen anpassen  

Zwei GPUs mit demselben Chip verhalten sich also nicht unbedingt gleich.

## Boardpartner

Nvidia baut nicht jede fertige GPU selbst. Firmen wie ASUS, MSI oder Gigabyte nehmen denselben Chip und bauen ihre eigenen Versionen. Sie ändern Dinge wie:

- das Kühldesign  
- die Stromversorgung  
- das Boost-Verhalten  

Gleicher Grundchip, leicht anderes Ergebnis.

<arch-family></arch-family>

## Das Gesamtbild

Eine Architektur ist ein Grunddesign. Sie umfasst mehrere Chips, die für verschiedene Einsätze skaliert sind. Die Hersteller fügen dann ihre eigenen Varianten hinzu. Eine GPU besteht also aus:

- einer Architektur  
- einem bestimmten Chip  
- der Umsetzung eines bestimmten Herstellers  

## Warum das wichtig ist

So kannst du GPU-Namen leichter lesen. Du verstehst, warum sich zwei GPUs unterschiedlich verhalten und wo eine GPU hingehört. Ohne dieses Wissen kannst du Performance und Hardware-Verhalten leicht falsch verstehen, wenn du tiefer in CUDA einsteigst.

## Glossar

- Architektur: ein Grunddesign, das sich eine Familie von Chips teilt.
- Präfix: die ersten Buchstaben eines Chip-Namens, zum Beispiel AD. Sie verbinden den Chip mit seiner Architektur.
- Ada Lovelace: eine Nvidia-Architektur vor allem für Consumer-GPUs, mit Chips wie dem AD102.
- Hopper: eine Nvidia-Architektur für Rechenzentren, KI-Training und Berechnungen im großen Stil.
- Taktfrequenz: eine Einstellung, die ein Hersteller anpassen kann. Deshalb verhalten sich GPUs mit demselben Chip manchmal unterschiedlich.
- Boardpartner: eine Firma wie ASUS, MSI oder Gigabyte, die aus einem Nvidia-Chip ihre eigene GPU baut.
- Umsetzung eines Herstellers: die eigene Version einer GPU, die ein Hersteller um einen Chip herum baut.
