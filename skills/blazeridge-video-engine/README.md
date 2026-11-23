# Claude Video Vorlagen – BlazeRidge Motion-Shorts

Für Claude in anderen Chats und für andere KIs (Grok, Gemini, ChatGPT …).
Damit lassen sich vertikale 9:16-Shorts (1080×1920, 25–32 s, Deutsch) bauen:
3 KI-Umgebungen + 1 optionaler KI-Bewegungsclip als Hook, 2D-Figur (oranger Hoodie),
KI-Figur „Nova“, Kamerafahrten, Kapitelkarten, Zahlen-Einblendungen, Wort-Untertitel,
Flash/Speedlines/Glitch, Voiceover, Musik und Soundeffekte.

## Ordner
- `engine/` – die Animations-Engine (nicht ändern, nur benutzen)
  - `story_base.html` – Zeichenfunktionen: Figur `fig()`, Nova `nova()`, Text `txt()`, `stat()`, `card()`, Untertitel, Partikel, Sonne, Glitch
  - `tail.js` – Ablauf: Hook (KI-Clip) → 3 Räume mit je 2 Shots → Ende → Call-to-Action
  - `build.py` – baut aus `cfg_<name>.js` + `<name>/timeline.json` die Szene `<name>/scene.html`
  - `render.js` – rendert Einzelbilder mit Playwright (4 Seiten parallel)
  - `tts.py` – Voiceover mit Piper aus `<name>/skript.json`, erzeugt `timeline.json`
  - `mix_base.py` + `mix.py` – Musik (Akkorde, Arpeggio, Kick/HiHat, Ducking) + SFX (Whoosh, Hit, Ding)
- `beispiele/` – fertige Konfigurationen der veröffentlichten Shorts (Schlaf, Mond, KI-Story) + Skript/Timeline
- `prompts/` – Bild-, Clip- und Skript-Vorlagen, Prompt für andere KIs

## Ablauf (Rezept, getestet 2026-11-12)
1. **Skript** nach `prompts/skript_vorlage.md` schreiben → `<name>/skript.json` (7 Zeilen: hook, r1a, r1b, r2a, r3a, end, cta).
2. **Voiceover:** `python3 engine/tts.py <name> de_DE-thorsten-high.onnx`
   (Stimme: huggingface.co/rhasspy/piper-voices, `de/de_DE/thorsten/high/`; `pip install piper-tts`)
3. **Bilder:** 3 Umgebungen nach `prompts/bild_prompts.md` (Higgsfield `gpt_image_2_6`, 9:16, ca. 0,25 Credits/Bild).
   Zuschneiden: `ffmpeg -i raw.png -vf "scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304" -q:v 3 <name>/bg/bg1.jpg` (bg1–bg3).
4. **Hook-Clip (optional, 7,5 Credits):** Higgsfield `kling3_0`, mode std, 5 s, sound off, start_image = Bild 1 → MP4.
   Frames: `ffmpeg -i clip.mp4 -vf "fps=30,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" -q:v 4 <name>/clip/c_%03d.jpg`
   Ohne Clip: ein Standbild 150× als `c_001…c_150.jpg` kopieren.
5. **Konfiguration:** ein Beispiel aus `beispiele/` als `cfg_<name>.js` kopieren und anpassen (Texte, Farben, Kapitel, Stats).
6. **Bauen + Probebilder:** `python3 engine/build.py <name>` dann
   `node engine/render.js $PWD/<name>/scene.html $PWD/<name>/qa 30 30 1.5,5,9,13,17,21,25`
   → Bilder ansehen: Kapitelkarte (y 420–620), Stats (y ~790), Untertitel (y 1085) dürfen sich nicht überlappen.
7. **Vollrender:** `node engine/render.js $PWD/<name>/scene.html $PWD/<name>/frames 30 <gesamtdauer>`
   `ffmpeg -framerate 30 -i <name>/frames/f_%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 19 <name>/video.mp4`
8. **Ton:** `python3 engine/mix.py <name> <bpm> r1a:.5 r2a:.5 r3a:.5` (Ding-Zeitpunkte = Zeile:Anteil)
   `ffmpeg -i <name>/video.mp4 -i <name>/audio.wav -c:v copy -c:a aac -b:a 192k -ac 2 -shortest -movflags +faststart final.mp4`
9. **Posten:** siehe `/Claude Playbook/LESSONS.md` (Instagram über Composio, Hashtags mit `#`; TikTok über Higgsfield-Formular).
   Fertiges Video nach OneDrive `/Claude Video/`.

## Konfig-Felder (cfg_<name>.js)
- `clipN` Anzahl Clip-Frames (oder `CLIPN` = automatisch) · `acc` 3 Akzentfarben · `tint` 3 RGB-Töne · `part` Partikel je Raum (0 Ziffern, 1 Regen, 2 Glitzer)
- `clipRoom` in welchem Raum der Nah-Shot den KI-Clip zeigt · `endBg` 'clip' oder Raumnummer · `wobble` Raum 3 schwankt · `sun` / `scan` je Raum
- `hook` / `end` Titelzeilen `[Text, Größe, Farbe, Glow]` · `hookFig` / `hookNova` · `endFig` / `endNova` / `endExtra(t)`
- `cards` 3 Kapitelnamen · `who` je Raum 'f' Figur, 'n' Nova, 'fn' beide · `mood` / `novaMood` je Shot (smile, wow, flat / happy, sad, wow, think, err)
- `stats` Einblendungen `{at:['r1a',.5],dur,big,small,col}` · `extra(t,si,room,lt)` eigene Effekte

## Regeln
- Keine echten Personen, keine bekannten Figuren/Marken nachzeichnen.
- Fakten im Skript vorher prüfen; Zahlen vorsichtig formulieren („etwa“, „kann“).
- Kosten nur mit Dennis' Ja; günstigster Weg = KI-Bilder + Motion per Code.
