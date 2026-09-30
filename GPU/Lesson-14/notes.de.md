# Linux unter Windows ausführen (eine praktische Einrichtung mit WSL)

Diese Lektion erklärt, wie du Linux mit WSL innerhalb von Windows ausführst. Sie zeigt auch, wie GPU und CUDA in WSL funktionieren.

## Warum Linux

Wer ernsthaft mit CUDA arbeitet, landet meist bei Linux. Windows funktioniert auch, aber das GPU-Ökosystem ist seit Jahren rund um Linux aufgebaut. Die meisten Werkzeuge, Dokumentationen und echten Einsätze setzen Linux voraus. 2026 laufen moderne GPU-Systeme für KI und High-Performance-Computing fast immer unter Linux.

## Was WSL ist

WSL (Windows Subsystem for Linux) führt eine echte Linux-Umgebung innerhalb von Windows aus. Es ist keine Emulationsschicht wie ältere Lösungen. WSL2 nutzt einen echten Linux-Kernel. Das macht einen großen Unterschied bei Verhalten, Kompatibilität und Performance. Viele Entwicklungs-Workflows nutzen heute WSL.

## WSL installieren

Öffne unter Windows ein Terminal und führe einen einzigen Befehl aus: `wsl --install`

Nutze Stand 2026 immer WSL2. WSL1 ist weniger kompatibel und hat keine brauchbare GPU-Beschleunigung. WSL2 ist für moderne Workloads gebaut und die Grundlage für CUDA unter Windows. Ohne WSL2 funktionieren viele GPU-Funktionen nicht wie erwartet.

## Der erste Start

Wenn du deine Linux-Distribution zum ersten Mal startest, legst du einen Benutzernamen und ein Passwort an. Das ist eine eigene Linux-Umgebung auf demselben Rechner und nicht deine Windows-Umgebung. Sie hat eigene Benutzer, ein eigenes Dateisystem und einen eigenen Paketmanager. Ab jetzt arbeitest du in zwei Systemen gleichzeitig.

## Zugriff auf die GPU

Mit WSL2 kann Linux die GPU über den Windows-Treiber nutzen. CUDA-Anwendungen laufen in WSL fast so wie auf einem nativen Linux-System. Du kannst also unter Linux entwickeln und trotzdem Windows als dein Hauptsystem behalten.

Der GPU-Treiber wird auf der Windows-Seite installiert, nicht in WSL. WSL nutzt den Treiber des Host-Systems. Es braucht keinen eigenen NVIDIA-Treiber. Behalte diese Trennung im Kopf, dann bleibt deine Einrichtung stabil.

> [!WARNING]
> Ein Linux-GPU-Treiber in WSL führt meist zu Konflikten. Installiere also keinen.

<wsl-layers></wsl-layers>

## CUDA in WSL installieren

In WSL installierst du die Linux-Version des CUDA Toolkits, nicht die Windows-Version. WSL nutzt aber spezielle Pakete. Sie arbeiten mit dem gemeinsamen Treiber zusammen und vermeiden Konflikte mit dem Host. Die Installation sieht also aus wie unter normalem Linux, ist aber nicht dasselbe.

## WSL im Jahr 2026

WSL ist heute eine ernsthafte Entwicklungsumgebung und nicht nur ein bequemes Hilfsmittel. CUDA 12.x und die neue Reihe 13.x unterstützen Hopper und Blackwell in WSL voll. Der Zugriff auf die GPU ist stabil, die Speicherverwaltung ist besser und die Unterstützung für Container ist einheitlicher. In vielen Fällen kommt WSL heute nah an eine native Linux-Einrichtung heran.

Bleib trotzdem realistisch. WSL hat mehrere Schichten. Ein Problem kann von der Windows-Konfiguration kommen, von WSL selbst, von der Linux-Distribution oder von der CUDA-Einrichtung. Solche Probleme zu lösen gehört dazu, wenn du lernst, wie das System funktioniert.

## Zusammenfassung

WSL ist eine praktische Brücke. Du bleibst in Windows und nutzt Linux-basierte GPU-Werkzeuge auf eine Art, die echten Produktionssystemen nahekommt. Das ist einer der natürlichsten Wege für den Einstieg.

> [!NOTE]
> Das war nur zur allgemeinen Information. Der Name “windows” wird in diesem Repo unter keinen Umständen verwendet.

## Glossar

- WSL: Windows Subsystem for Linux. Es führt eine echte Linux-Umgebung innerhalb von Windows aus.
- WSL2: die WSL-Version mit einem echten Linux-Kernel. Sie ist die Grundlage für CUDA unter Windows.
- WSL1: die ältere WSL-Version. Sie ist weniger kompatibel und hat keine brauchbare GPU-Beschleunigung.
- `wsl --install`: der eine Befehl, den du in einem Windows-Terminal ausführst, um WSL zu installieren.
- Linux-Distribution: eine eigene Linux-Umgebung mit eigenen Benutzern, eigenem Dateisystem und eigenem Paketmanager.
- Host-Treiber: der GPU-Treiber auf der Windows-Seite. WSL nutzt ihn und braucht keinen eigenen NVIDIA-Treiber.
- CUDA-Pakete für WSL: spezielle CUDA-Pakete für Linux, die mit dem gemeinsamen Treiber zusammenarbeiten und Konflikte mit dem Host vermeiden.
