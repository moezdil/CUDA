# CUDA-Entwicklung einrichten (ein moderner Workflow mit JetBrains)

Diese Lektion erklärt, wie du eine Arbeitsumgebung für CUDA einrichtest. Sie nutzt JetBrains-Werkzeuge, vor allem CLion, auf Basis des CUDA Toolkits.

## Warum JetBrains und CLion

Du brauchst eine Umgebung, mit der du jeden Tag arbeiten kannst, ohne mit den Werkzeugen zu kämpfen. Dieses Repo baut diese Umgebung rund um CLion auf.

Der Grund liegt darin, wie moderne Entwicklung funktioniert. GPU-Architekturen und Toolkits ändern sich heute schneller. Projekte sind nicht mehr an eine Plattform gebunden. Vielleicht entwickelst du unter Linux, testest auf einer entfernten GPU und bringst das Ganze woanders in Betrieb. Eine eng verzahnte IDE wie Visual Studio schränkt diese Art zu arbeiten ein.

JetBrains-Werkzeuge sind rund um CMake aufgebaut. CMake ist ein Werkzeug, das beschreibt, wie ein Projekt gebaut wird. Ein CMake-Projekt ist nicht an eine Umgebung gebunden. Du kannst es auf verschiedenen Systemen mit verschiedenen Compilern bauen und behältst trotzdem dieselbe Struktur. Echte GPU-Systeme werden genau so gebaut.

## Zuerst kommt das CUDA Toolkit

Das CUDA Toolkit ist die Grundlage von allem. Ohne es läuft nichts. Es liefert dir den Compiler, die Runtime und die Bibliotheken, die mit der GPU sprechen. Es ist kein Editor. Es ist die Schicht, die die Ausführung auf der GPU überhaupt erst möglich macht.

Stand 2026 hängt diese Schicht stärker von der Hardware ab. Hopper und Blackwell bringen neue Befehle, neue Genauigkeitsformate und ein neues Ausführungsverhalten. Um sie zu nutzen, brauchst du eine aktuelle CUDA-Version. Ältere Versionen funktionieren vielleicht noch, nutzen aber nicht, was die Hardware kann. Die CUDA-Version, die du wählst, legt also fest, was dein Code kann.

## Wo CLion ins Spiel kommt

CLion sitzt über dem Toolkit. Es ersetzt oder versteckt das Toolkit nicht. Es gibt dir einen aufgeräumten Ort, an dem du Code schreibst und dein Projekt organisierst. Wenn du baust, ruft CLion CMake auf, und CMake ruft den CUDA-Compiler auf. Nichts passiert im Verborgenen, du weißt also immer, was los ist.

<toolchain-stack></toolchain-stack>

## Visual Studio unter Windows

> [!NOTE]
> Unter Windows brauchst du vielleicht trotzdem Teile von Visual Studio, auch wenn du es gar nicht benutzt. Die CUDA-Toolchain nutzt im Hintergrund den Microsoft-Compiler. Visual Studio ist also eine Abhängigkeit und nicht dein Arbeitsplatz. Du installierst es einmal und vergisst es dann.

Deine ganze eigentliche Arbeit passiert in CLion.

## Der GPU-Treiber

CUDA hängt vom GPU-Treiber ab. 2026 ändern sich Architekturen schnell. Den Treiber aktuell zu halten gehört deshalb zur Einrichtung dazu.

> [!WARNING]
> Wenn der Treiber zu alt ist, bekommst du vielleicht Probleme, die schwer zu erklären sind. Der Code lässt sich dann zwar kompilieren, läuft aber nicht richtig. Manche Funktionen stehen vielleicht nicht zur Verfügung.

## Der Workflow

Wenn alles eingerichtet ist, ist der Workflow einfach:

- Du öffnest CLion und schreibst deinen Code.
- Du baust mit CMake.
- Das CUDA Toolkit kompiliert ihn.
- Die GPU führt ihn aus.

Wenn die Einrichtung stimmt, greifen diese Schritte reibungslos ineinander.

## Zusammenfassung

Bei der CUDA-Entwicklung geht es nicht darum, einen Editor auszuwählen. Es geht darum, die Toolchain zu verstehen. JetBrains-Werkzeuge passen gut, weil jeder Teil des Systems seine eigene Aufgabe erledigen darf. Dadurch wird die Umgebung aufgeräumter, stabiler und näher an der Produktion. Dieses Repo nutzt diese Umgebung.

## Glossar

- CLion: ein JetBrains-Werkzeug, um Code zu schreiben und Projekte zu organisieren. Es sitzt über dem CUDA Toolkit.
- CMake: ein Werkzeug, das beschreibt, wie ein Projekt gebaut wird. Es ist nicht an eine Umgebung gebunden.
- CUDA Toolkit: die Basisschicht mit dem Compiler, der Runtime und den Bibliotheken, die mit der GPU sprechen.
- Toolchain: die Kette von Werkzeugen, die deinen Code baut. CLion ruft CMake auf, und CMake ruft den CUDA-Compiler auf.
- Visual Studio: eine Abhängigkeit unter Windows, weil die CUDA-Toolchain im Hintergrund den Microsoft-Compiler nutzt.
- GPU-Treiber: CUDA hängt von ihm ab. Ist er zu alt, lässt sich Code vielleicht kompilieren, läuft aber nicht richtig.
