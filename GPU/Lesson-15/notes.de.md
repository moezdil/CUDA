# Das CUDA Toolkit unter Linux installieren

Diese Lektion zeigt dir, wie du das CUDA Toolkit unter Linux in WSL installierst. Danach kann dein System Code für die GPU kompilieren und auf ihr ausführen.

## Passend zu deiner Plattform

Eine CUDA-Installation muss genau zu deiner Plattform passen. Nutze unter WSL das Repository speziell für WSL. Die normalen Ubuntu-Repositorys schlagen fehl oder installieren alte Versionen, die moderne GPU-Architekturen nicht unterstützen.

## Zuerst die GPU prüfen

Bevor du CUDA installierst, stell sicher, dass dein System die GPU sieht:

```bash
nvidia-smi
```

- `nvidia-smi` ist NVIDIAs Kommandozeilen-Werkzeug, das beim Treiber Infos über die GPU abfragt. Es zeigt den Namen der GPU, die Treiberversion und die Speicherauslastung.
- In WSL funktioniert es, weil der Treiber auf der Windows-Seite liegt und WSL ihn nutzt.

Wenn dieser Befehl fehlschlägt, hör hier auf und bring zuerst deine GPU-Einrichtung in Ordnung. Ohne sie funktioniert CUDA nicht, denn das Toolkit spricht über den Treiber mit der GPU.

## Aus dem NVIDIA-Repository installieren

Nutze das offizielle NVIDIA-Repository für WSL. Es enthält das aktuelle Toolkit, gebaut für die Zusammenarbeit mit dem gemeinsamen Treiber.

> [!WARNING]
> Nutze nicht `apt install nvidia-cuda-toolkit`. Dieses Paket ist alt und nicht gut für moderne Entwicklung.

Führe diese Befehle aus. Sie machen den Paketmanager zuerst mit NVIDIAs Repository bekannt und installieren dann das Toolkit daraus.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-2
```

- `wget` lädt eine Datei von einer URL herunter. Der Teil `wsl-ubuntu/x86_64` in der Adresse wählt das Repository für WSL auf einer 64-Bit-CPU von Intel oder AMD.
- `cuda-keyring_1.1-1_all.deb` ist ein kleines Paket. Es enthält NVIDIAs Signaturschlüssel und die Adresse des Repositorys. So vertraut dein System den Paketen von NVIDIA.
- `sudo` führt einen Befehl mit Admin-Rechten aus. Pakete zu installieren verändert das System, deshalb braucht es diese Rechte.
- `dpkg -i` installiert eine lokale `.deb`-Datei, hier den Keyring.
- `apt-get update` aktualisiert die Paketlisten. Ohne diesen Schritt kennt apt die Pakete im neuen Repository nicht.
- `apt-get -y install` installiert ein Paket. `-y` beantwortet die Rückfrage automatisch mit "ja".
- `cuda-toolkit-13-2` ist das Toolkit-Paket für CUDA 13.2. Es enthält nur das Toolkit. Deshalb wird kein Treiber installiert.

Damit installierst du das CUDA Toolkit 13.2, das zu modernen GPU-Architekturen passt. Es enthält:

* den CUDA-Compiler (nvcc)
* die CUDA-Runtime
* die Kernbibliotheken

Es installiert keinen GPU-Treiber. In WSL kommt der Treiber von der Windows-Seite.

## Die Installation prüfen

Prüfe, ob der Compiler installiert ist und ob deine Shell ihn findet:

```bash
nvcc --version
```

- `nvcc` ist der CUDA-Compiler.
- `--version` sorgt dafür, dass er seine Version ausgibt und sich beendet, ohne etwas zu kompilieren.

Die Ausgabe sollte CUDA 13.x zeigen, weil du 13.2 installiert hast.

Wenn der Befehl nicht gefunden wird, ist dein PATH nicht richtig gesetzt. PATH ist die Liste der Ordner, in denen die Shell nach Programmen sucht. Füge den CUDA-Ordner hinzu:

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export` setzt eine Variable für diese Shell und für die Programme, die sie startet.
- `/usr/local/cuda/bin` ist der Ordner, in dem `nvcc` liegt.
- `:$PATH` hängt die alte Liste hinter den neuen Ordner. So geht nichts verloren. Die Shell sucht zuerst im CUDA-Ordner.

> [!TIP]
> Die Einstellung gilt nur für das aktuelle Terminal. Damit sie bleibt, trag sie in deine `.bashrc` oder `.zshrc` ein.

## Warum die Version wichtig ist

CUDA ist eng mit der GPU-Architektur verbunden. Hopper und Blackwell bringen neue Funktionen:

* Ausführungspfade für FP8
* Unterstützung für FP4 (Blackwell)
* besseres Scheduling und besseres Speicherverhalten

Wenn deine CUDA-Version sie nicht unterstützt, läuft dein Code trotzdem. Er nutzt die Hardware dann aber nicht gut.

## CUDA unter anderen Werkzeugen

CUDA wird selten allein genutzt. Es läuft unter Systemen wie:

* PyTorch
* TensorFlow
* Triton
* eigenen CUDA-Kerneln

Eine korrekte CUDA-Installation sorgt dafür, dass all diese richtig funktionieren.

<install-steps></install-steps>

## Bereit

Dein System ist jetzt bereit. Du hast:

* eine Linux-Umgebung (WSL)
* Zugriff auf die GPU
* das CUDA Toolkit 13.2
* einen funktionierenden CUDA-Compiler

Jetzt kannst du echte CUDA-Programme schreiben und ausführen.

https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network

## Glossar

- `nvidia-smi`: NVIDIAs Kommandozeilen-Werkzeug, das beim Treiber den Namen der GPU, die Treiberversion und die Speicherauslastung abfragt.
- NVIDIA-Repository: NVIDIAs offizielle Paketquelle für WSL, mit dem aktuellen Toolkit, gebaut für den gemeinsamen Treiber.
- `cuda-keyring_1.1-1_all.deb`: ein kleines Paket mit NVIDIAs Signaturschlüssel und der Adresse des Repositorys. So vertraut dein System den Paketen von NVIDIA.
- `sudo`: führt einen Befehl mit Admin-Rechten aus. Um Pakete zu installieren, brauchst du diese Rechte.
- `apt-get update`: aktualisiert die Paketlisten, damit apt die Pakete im neuen Repository kennt.
- `nvcc`: der CUDA-Compiler. `nvcc --version` gibt seine Version aus, ohne etwas zu kompilieren.
- PATH: die Liste der Ordner, in denen die Shell nach Programmen sucht.
- `export`: setzt eine Variable für diese Shell und für die Programme, die sie startet.
