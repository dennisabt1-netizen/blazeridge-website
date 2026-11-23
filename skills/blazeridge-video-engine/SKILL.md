---
name: blazeridge-video-engine
description: BlazeRidge Motion-Shorts-Engine (aus OneDrive /Claude Video Vorlagen) - 9:16-Erklär-Shorts (25-32 s, Deutsch) mit 2D-Figur im orangen Hoodie, KI-Figur Nova, 3 Räumen, Kapitelkarten, Zahlen-Einblendungen, Wort-Untertiteln, Flash/Speedlines/Glitch, Piper-Voiceover und selbst erzeugter Musik/SFX. Kostenlos (Playwright, Piper, ffmpeg); KI-Hintergründe/Hook-Clip über Higgsfield nur mit Ja von Dennis. Nutzen bei 'Motion-Short', 'Erklärvideo mit Figur', 'Nova', 'Video-Engine'.
---

# BlazeRidge Video Engine

Vollständige Anleitung: `README.md` in diesem Ordner (Ablauf 1–9, Konfig-Felder, Regeln). Vorlagen: `prompts/`, Beispiele: `beispiele/`.

Kurzablauf (im Arbeitsordner, Engine-Pfad `E=~/.claude/skills/blazeridge-video-engine`):
1. `<name>/skript.json` nach `prompts/skript_vorlage.md` (7 Zeilen: hook, r1a, r1b, r2a, r3a, end, cta).
2. Stimme: `python3 $E/engine/tts.py <name> ~/.local/share/piper/de_DE-thorsten-high.onnx`
3. Hintergründe `<name>/bg/bg1-3.jpg`: kostenlos = eigene Renders/Screenshots/Remotion-Stills; Higgsfield nur nach Ja (Kosten).
4. Ohne Hook-Clip: ein Standbild 150× als `<name>/clip/c_001…c_150.jpg`.
5. `cfg_<name>.js` aus `beispiele/` kopieren und anpassen → `python3 $E/engine/build.py <name>`
6. Probebilder: `node $E/engine/render.js $PWD/<name>/scene.html $PWD/<name>/qa 30 30 1.5,5,9,13,17,21,25` → ansehen (Subagent video-check).
7. Vollrender + `python3 $E/engine/mix.py ...` + ffmpeg (siehe README).
Regeln: keine echten Personen/fremden Figuren, Fakten prüfen, KI kennzeichnen, max. 1 Claude-Video/Tag veröffentlichen, nichts ohne Ja hochladen.
