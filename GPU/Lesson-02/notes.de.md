# Architektur und Generation

Diese Lektion erklärt den Unterschied zwischen der Architektur und der Generation einer GPU. Die beiden Begriffe klingen ähnlich, bedeuten aber Verschiedenes.

## GPU und CUDA

Eine GPU (Graphics Processing Unit) ist ein Prozessor, der viele Operationen gleichzeitig ausführt. Ursprünglich war sie für Grafik gedacht. Heute wird sie auch für KI, Simulationen, Datenverarbeitung und Berechnungen im großen Stil genutzt.

CUDA ist Nvidias Weg, GPUs zu programmieren. Damit kannst du die GPU für allgemeine Berechnungen nutzen, nicht nur für Grafik.

## Architektur

Die Architektur ist der innere Aufbau des GPU-Chips. Sie legt nicht nur die Kerne fest, sondern auch:

- wie sie organisiert sind  
- wie Daten fließen  
- wie auf den Speicher zugegriffen wird  
- wie parallele Arbeit ausgeführt wird  

Stell sie dir wie die Konstruktion eines Motors vor. Zwei GPUs können von außen gleich aussehen und sich wegen ihrer Architektur trotzdem ganz anders verhalten.

Die Architektur beeinflusst direkt:

- die Performance  
- die Effizienz  
- die unterstützten Funktionen  

Jede neue Architektur ist meist ein echter Umbruch und kein kleines Upgrade. Manche Architekturen haben die reine Rechenleistung verbessert. Andere haben sich auf Effizienz konzentriert. Neuere setzen auf KI und große Workloads. Funktionen wie Raytracing und KI-Beschleunigung kommen mit der Architektur.

Nvidia bringt etwa alle ein bis zwei Jahre eine neue Architektur heraus. Das ist ein Hauptgrund, warum sich GPUs so schnell weiterentwickeln.

## Generation

Bei der Generation geht es nicht darum, wie die GPU gebaut ist. Es geht darum, wo die GPU eingesetzt wird.

Nvidia-GPUs bedienen zwei große Welten. Die erste sind normale Nutzer:

- Gaming  
- Content-Erstellung  
- allgemeine Grafik  

Die zweite umfasst:

- Cloud-Systeme  
- Rechenzentren  
- KI-Training  
- wissenschaftliches Rechnen  

Diese zweite Welt heißt HPC, kurz für High Performance Computing.

## Produktnamen

Nvidia nutzt unterschiedliche Namen, je nachdem, wo die GPU eingesetzt wird:

- Tegra ist für mobile und eingebettete Systeme.  
- GeForce ist für Consumer-GPUs.  
- RTX ist für professionelle Workloads.  
- Data Center GPUs sind für Server. Heute sehen wir Modelle wie A100, H100 und neuere.  

> [!NOTE]
> Vielleicht begegnen dir noch zwei ältere Namen. Quadro war die alte Marke für professionelle GPUs, RTX hat sie abgelöst. GPUs für Rechenzentren liefen früher unter dem Namen "Tesla", aber dieser Name ist heute kaum noch zu sehen.

Das zeigt einen Wandel von allgemeinen Berechnungen hin zu KI und Cloud-Infrastruktur.

## Architektur und Generation sind unabhängig

Die Architektur beschreibt, wie die GPU gebaut ist. Die Generation beschreibt, wo sie eingesetzt wird. Deshalb kann dieselbe Architektur in ganz unterschiedlichen Produkten stecken.

Ein Beispiel: Die RTX 3090 und die A100 basieren beide auf Ampere. Die RTX 3090 ist für den privaten Gebrauch. Die A100 ist für Berechnungen im großen Stil. Sie teilen sich eine Architektur, haben aber verschiedene Zwecke.

<arch-matrix></arch-matrix>

## GPU-Kategorien

GPUs werden für unterschiedliche Umgebungen gebaut:

- kleine, tragbare Systeme  
- PCs  
- professionelle Workloads  
- große Rechenzentren  

Jede Umgebung hat andere Anforderungen, Grenzen und Prioritäten. Nvidia passt dieselbe Architektur an alle diese Umgebungen an.

## Eine einfache Regel

- Wie ist die GPU gebaut? → Architektur  
- Wo wird die GPU eingesetzt? → Generation  

## Warum das wichtig ist

Mit dieser Regel kannst du GPU-Namen leichter lesen. Sie schützt dich auch vor einem häufigen Fehler: zu glauben, dass zwei GPUs ähnlich sind, nur weil sie dieselbe Architektur haben. Diese Unterschiede werden sehr wichtig, sobald du GPUs mit CUDA programmierst.

## Glossar

- GPU: ein Prozessor, der viele Operationen gleichzeitig ausführt.
- CUDA: Nvidias Weg, GPUs für allgemeine Berechnungen zu programmieren, nicht nur für Grafik.
- Architektur: der innere Aufbau des GPU-Chips, wie die Konstruktion eines Motors.
- Generation: wo eine GPU eingesetzt wird, zum Beispiel beim Gaming oder im Rechenzentrum.
- HPC: High Performance Computing, also Cloud-Systeme, Rechenzentren, KI-Training und wissenschaftliches Rechnen.
- Ampere: eine Nvidia-Architektur, die sowohl in der RTX 3090 als auch in der A100 steckt.
- Tegra: Nvidias Produktname für GPUs in mobilen und eingebetteten Systemen.
- Data Center GPU: eine Nvidia-GPU für Server, zum Beispiel die A100 oder H100.
