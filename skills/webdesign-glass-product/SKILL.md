---
name: webdesign-glass-product
description: Ruhiger Premium-Produkt-/App-Stil – Glasmorphismus (Milchglas-Karten), Blau-zu-Koralle-Verläufe, Handy-Mockup mit App-Oberfläche, Dot-Matrix-Zahlen und ein 3D-Produkt (three.js), das sich beim Scrollen dreht. Für Produkte, Apps, Gadgets, Fallstudien. Nutzen bei 'Produktseite', 'App-Landingpage', 'Glas-Design', 'wie Hydroflask', 'Case Study'.
---

# webdesign-glass-product

Stil aus dem Vorbild-Video (Smart-Bottle-Branding mit App) – nur der Stil, eigene Marke.

**Bausteine:** schwebende Glas-Navigation · Hero mit dünner Großschrift + Verlaufswort (`hero.highlight`), 3D-Produkt (`model`: bottle/knot/blob/ring) und Handy-Mockup mit App (`app.metrics`, Graph mit `data-draw`, Neigung `data-tilt`) · Intro mit Zeilen-Reveal · Feature-Abschnitte im Wechsel mit 3D-Card-Zoom und Dot-Matrix-Kennzahl (`items[].metric`) · Glas-Zahlenkarten · Verlaufs-Abschluss mit E-Mail.

## So benutzen
```bash
K=~/.claude/skills/webdesign-core
cp $K/examples/aqualis.json brief.json      # anpassen
python3 $K/scripts/build.py --style glass-product --brief brief.json --out site/
python3 $K/scripts/shoot.py site/index.html site/qa --steps 8 --mobile
```
Farben: `colors.bg`, `ink`, `a1` (Blau), `a2` (Koralle), `a3` (Hellblau).
Test: `examples/aqualis.json` (fiktive Marke), Desktop + Mobil, 0 JS-Fehler, 3D aktiv.
