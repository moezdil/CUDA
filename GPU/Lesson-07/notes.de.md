# Speicherbandbreite, Kerne und Taktfrequenz

Diese Lektion erklärt, was eine GPU schnell macht. Es geht um Speicherbandbreite, die Zahl der Kerne, die Taktfrequenz, Energie und spezialisierte Hardware.

## Speicherbandbreite

Eine GPU braucht Daten, mit denen sie arbeiten kann. Diese Daten kommen aus dem Speicher. Die Speicherbandbreite gibt an, wie viele Daten pro Sekunde zwischen Speicher und GPU fließen können.

## Ein kleines Beispiel

Nimm eine GPU mit 4 Kernen. Jeder Kern braucht Daten, bevor er loslegen kann.

Angenommen, der Speicher kann immer nur einem Kern gleichzeitig Daten schicken. Der erste Kern fängt an zu arbeiten, die anderen drei warten. Dann bekommt der zweite Kern Daten, dann der dritte, dann der vierte. Von den 4 Kernen arbeitet also immer nur einer. Die GPU wird nicht effizient genutzt.

Jetzt nimm an, der Speicher kann allen 4 Kernen gleichzeitig Daten schicken. Alle Kerne starten zusammen und laufen parallel. Kein Kern muss warten.

Eine GPU ist nur schnell, wenn sie ihre Daten schnell genug bekommt. Sonst wartet sie. Das nennt man einen "Speicher-Engpass".

<bandwidth-sim></bandwidth-sim>

## Consumer-GPUs und GPUs für Rechenzentren

Es gibt zwei Arten moderner GPUs:

- Consumer-GPUs wie die RTX-Karten sind für Gaming und den allgemeinen Gebrauch gemacht.
- GPUs für Rechenzentren wie die H100 oder neuere GPUs mit Blackwell sind für KI und Berechnungen im großen Stil gemacht.

Beide Arten können viele Kerne haben und manchmal ähnliche Architekturen. Der große Unterschied liegt im Speicher.

GPUs für Rechenzentren nutzen "HBM-Speicher". HBM ist extrem schnell und sitzt sehr nah am GPU-Chip. Er kann riesige Datenmengen sehr schnell liefern.

> [!NOTE]
> HBM gibt es in Versionen wie HBM3 und HBM3e, und HBM4 kommt bald.

Consumer-GPUs nutzen meist GDDR6- oder GDDR6X-Speicher. Der ist schnell, aber nicht so schnell wie HBM.

Zwei GPUs können auf dem Papier ähnlich aussehen. Die mit der höheren Speicherbandbreite hält ihre Kerne beschäftigt. Die andere wartet vielleicht auf Daten. Das ist ein Hauptgrund, warum GPUs für Rechenzentren bei KI-Workloads so stark sind.

## Was die Speicherbandbreite beeinflusst

Drei Faktoren beeinflussen die Speicherbandbreite am stärksten:

- Die Busbreite ist wie die Breite einer Straße. Auf einer breiteren Straße fließen mehr Daten gleichzeitig.
- Die Speichergeschwindigkeit ist wie das Tempolimit auf der Straße. Auch auf einer breiten Straße gibt es Verzögerungen, wenn der Verkehr langsam ist.
- Bei der Speichertechnik unterscheiden sich moderne GPUs am meisten. HBM ist wie eine Schnellstraße, die nur für Daten gebaut ist. GDDR ist eher ein Allrounder.

<bandwidth-calc></bandwidth-calc>

Bei der GPU-Performance geht es nicht nur um die Kerne. Es geht auch darum, wie schnell die Kerne an ihre Daten kommen. Selbst die stärkste GPU wird schwach, wenn sie auf den Speicher wartet.

## Mehr Kerne heißt nicht immer schneller

Sobald die Daten da sind, muss die GPU sie verarbeiten. Jeder Kern führt Befehle aus. Es klingt logisch, dass mehr Kerne mehr Performance bringen. Das stimmt aber nicht immer.

Nimm zwei GPUs. Die erste hat 100 Kerne. Die zweite hat 200 Kerne. Beide führen dieselbe Aufgabe mit 200 Operationen aus.

- Die erste GPU verarbeitet 100 Operationen auf einmal. Sie braucht also zwei Runden.
- Die zweite GPU verarbeitet alle 200 Operationen in einer Runde.

Jetzt kommt die Zeit pro Runde dazu:

- Die erste GPU braucht eine Sekunde pro Runde. Sie ist also nach zwei Sekunden fertig.
- Die zweite GPU braucht vier Sekunden pro Runde. Sie ist also nach vier Sekunden fertig.

Die zweite GPU hat mehr Kerne, ist aber langsamer. Wir müssen also auch wissen, wie schnell die Kerne sind.

## Taktfrequenz

Die Taktfrequenz gibt an, wie schnell jeder Kern Befehle ausführt.

Die Performance hängt von zwei Dingen zusammen ab:

- Mehr Kerne bringen mehr Parallelität.
- Eine höhere Taktfrequenz macht jeden Kern schneller.

Wenn einer der beiden Werte zu niedrig ist, bremst er das ganze System. Das Ziel ist ein gutes Gleichgewicht.

<cores-clock></cores-clock>

## Zwei Design-Richtungen

Um 2026 folgen GPUs zwei Design-Richtungen. Manche sind für Gaming und den allgemeinen Gebrauch gebaut. Andere sind für KI und Berechnungen im großen Stil gebaut.

- GPUs für Rechenzentren haben oft sehr viele Kerne, aber niedrigere Taktfrequenzen.
- Consumer-GPUs haben oft höhere Taktfrequenzen, aber weniger Kerne.

Keine der beiden ist grundsätzlich besser. Jede ist für andere Workloads optimiert.

## Energie

Performance hängt immer mit Energie zusammen. Mehr Kerne und eine höhere Taktfrequenz bedeuten auch mehr Stromverbrauch. Es gibt also immer einen Kompromiss zwischen Performance und Effizienz.

"Welche GPU ist besser?" ist die falsche Frage. Die bessere Frage lautet: "Besser wofür?"

## Spezialisierte Hardware

Moderne GPUs sind nicht nur Gruppen von Allzweck-Kernen. Sie haben auch spezialisierte Hardware.

"Tensor-Cores" sind ein Beispiel. Das sind Einheiten, die für bestimmte Berechnungen gebaut sind, vor allem in der KI. Mit dem passenden Workload können sie vieles stark beschleunigen. Das klappt aber nur, wenn der Workload zur Hardware passt.

## Durchsatz

Die Zahl der Kerne, die Taktfrequenz und TFLOPS allein erzählen nicht die ganze Geschichte. Eine bessere Frage ist: Wie viel Arbeit schafft die GPU in einer bestimmten Zeit? Das nennt man "Durchsatz".

Auch der Durchsatz hängt von vielen Dingen ab, zum Beispiel von der Art der Berechnung, der Genauigkeit und der Architektur. Keine einzelne Zahl legt alles fest.

## Zusammenfassung

Eine GPU braucht schnellen Speicher, genug Kerne, genug Geschwindigkeit, einen vernünftigen Energieverbrauch und manchmal spezialisierte Hardware. Echte Performance entsteht nur, wenn all das im Gleichgewicht ist.

GPU-Performance ist keine einzelne Zahl. Sie ist ein System, in dem Speicher, Rechenleistung, Effizienz und spezialisierte Hardware zusammenspielen. Wenn du das weißt, kannst du Datenblätter leichter lesen und CUDA-Konzepte leichter verstehen.

## Glossar

- Speicherbandbreite: wie viele Daten pro Sekunde zwischen Speicher und GPU fließen können.
- Speicher-Engpass: wenn GPU-Kerne warten, weil der Speicher die Daten nicht schnell genug schicken kann.
- HBM: extrem schneller Speicher, der in GPUs für Rechenzentren sehr nah am GPU-Chip sitzt.
- GDDR6: schneller Speicher in Consumer-GPUs, aber nicht so schnell wie HBM.
- Busbreite: wie viele Daten der Speicher gleichzeitig bewegen kann, wie die Breite einer Straße.
- Taktfrequenz: wie schnell jeder Kern Befehle ausführt.
- Tensor-Cores: spezialisierte Hardware für bestimmte Berechnungen, vor allem in der KI.
- Durchsatz: wie viel Arbeit die GPU in einer bestimmten Zeit schafft.
