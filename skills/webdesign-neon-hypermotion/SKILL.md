---
name: webdesign-neon-hypermotion
description: Marken-Website im Neon-/Feuer-Hypermotion-Look (Vorlage BlazeRidge-Logo) - Logo-Hero mit aufsteigender Glut, 3D-Schriftzug der beim Scrollen auseinanderfliegt, gepinnte iMac-Szene - Monitor geht an, Neonlicht und Synthwave-Boden, Browser zeigt die echte Website (Screenshots), Mauszeiger scrollt, klickt 'Shop now', kauft alles ('Buy all', Warenkorb zählt hoch), Danke-Seite mit Funkenregen. Danach Neon-Karten (Angebot), Kennzahlen, Kanäle. Nutzen bei 'Neon-Website', 'Hypermotion', 'iMac-Effekt', 'Website im Monitor zeigen'.
---

# webdesign-neon-hypermotion

1. Screenshots der Zielseite: `node capture_screens.cjs http://127.0.0.1:PORT shots` (Seite lokal per `python3 -m http.server` ausliefern; gibt Positionen von Shop-Link und Kauf-Buttons als JSON aus), dann mit ffmpeg auf 1280 px Breite als JPG.
2. `example/brief.json` kopieren und anpassen: `imac.pages` (Bild + Höhe in 1600er-Koordinaten), `imac.steps` (cursor [x,y] in Seitenkoordinaten, scroll, page, click, cart, label, cap, burst), `products`, `stats` (+ `stats_note` mit Stand/Quelle), `channels`, `logo_img`.
3. `python3 ~/.claude/skills/webdesign-core/scripts/build.py --style neon-hypermotion --brief brief.json --out site --inline` → QA mit `shoot.py site/index.html qa --steps 14 --mobile`.

Regeln: Klicks im iMac sind gespielt (kein echter Kauf) – nur eigene/freigegebene Seiten zeigen. Zahlen nur mit Quelle und Stand. Kein KI-Hinweis im Video.
Test 23.11.2026: BlazeRidge (Daten aus Make 256616) – Desktop + Mobil, 0 JS-Fehler.
