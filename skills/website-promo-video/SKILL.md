---
name: website-promo-video
description: Macht aus einer Website ein 9:16-Reel im Stil viraler Webdesign-Videos – kostenlos mit Playwright (Scroll-Aufnahme) und Remotion. Drei Formate - 'desk' (Monitor auf dem Schreibtisch, Handy-Look, Sticker-Text), 'list' (z. B. '10 Scroll-Effekte' mit Browserfenster und Liste, die sich füllt), 'collage' (Produkt-Case-Study mit Glas-Kacheln und Handy-Rahmen). Nutzen bei 'Website-Video', 'Promo-Reel', 'Reel von der Seite', 'Showcase-Video'.
---

# website-promo-video

Ersetzt Bezahl-Werkzeuge (Screen Studio, After Effects) durch: `webdesign-core/scripts/shoot.py --video` + Remotion (`~/claude-motion`).

## Ablauf
```bash
K=~/.claude/skills/webdesign-core; V=~/.claude/skills/website-promo-video/scripts
# 1) Seite aufnehmen (Desktop 16:9 für desk/list, Hochformat für collage)
python3 $K/scripts/shoot.py site/index.html rec --steps 10 --video                      # rec/scroll.mp4 + rec/marks.json
python3 $K/scripts/shoot.py site/index.html recm --steps 7 --video --video-size 430x932  # Handy-Format
python3 $K/scripts/shoot.py site/index.html qa --steps 8                                 # Screenshots für collage

# 2) Reel rendern
python3 $V/make_promo.py --format desk --clip rec/scroll.mp4 --caption "Claude hat diese Website gebaut" \
   --outro "Website-Design mit KI" --accent "#FFE14D" --handle @blazeridge --brand BlazeRidge --out reel.mp4
python3 $V/make_promo.py --format list --clip rec/scroll.mp4 --marks rec/marks.json --title "10 Scroll-Effekte" \
   --url "beispiel.de" --speed 1.5 --out reel.mp4
python3 $V/make_promo.py --format collage --clip recm/scroll.mp4 --shots qa --brand Aqualis \
   --lines "Satz 1|Satz 2|Satz 3" --a1 "#2F7BFF" --a2 "#FF6B5A" --out reel.mp4
```
- `marks.json` entsteht automatisch aus Abschnitten mit `data-fx="Name"` (der Stil scroll-showcase setzt sie). Eigene Seiten: `data-fx` an die Abschnitte schreiben.
- Dauer = Aufnahme / `--speed` + Outro. Ziel 15–30 s: `--steps` und `--speed` anpassen.
- **Prüfen:** Kontaktbogen `ffmpeg -i reel.mp4 -vf "fps=6/DAUER,scale=270:-1,tile=6x1" -frames:v 1 sheet.png` ansehen.

## Regeln (BlazeRidge)
- Unten steht immer „Video mit KI erstellt“. Max. 3 Hashtags, kein #fyp, keine „Comment X“-Köder.
- Keine fremde Musik. Die Reels sind stumm. Musik kommt aus der Plattform-Bibliothek beim Posten oder ist eigene/lizenzfreie Musik.
- Nur eigene oder freigegebene Websites zeigen. Fremde Seiten nur mit Erlaubnis.
- Höchstens 1 Claude-Video pro Tag veröffentlichen (siehe Make-Playbook).

## Dateien
`remotion/PromoVideos.tsx` (DeskMonitor, EffectsList, CaseCollage) · `remotion/promo-entry.tsx` (eigener Einstieg, `Root.tsx` bleibt unberührt) · `scripts/make_promo.py`.
Getestet 22.11.2026: desk 14,5 s, list 28,7 s (alle 10 Effekte erkannt), collage 18,8 s.
