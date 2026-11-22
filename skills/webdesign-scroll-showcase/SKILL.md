---
name: webdesign-scroll-showcase
description: Editorial-Website, die alle 10 bekannten Scroll-Effekte zeigt – Layered Parallax, Pinned Heading, 3D Card Zoom, Line-by-line Reveal, Sideways Text, Card Arc Carousel, Fixed 3D Model, Stacking Cards, Focus-frame Slider, Scroll-triggered Zahlen/Linien. Für Portfolios, Agenturen, Storytelling. Nutzen bei 'Scroll-Effekte', 'Parallax-Website', 'Portfolio', '10 Scroll Effects'.
---

# webdesign-scroll-showcase

Setzt die Liste aus dem Vorbild-Video „10 Scroll Effects“ als eine zusammenhängende Seite um.

**Reihenfolge:** 1 Parallax-Berge im Sonnenuntergang (Hero) · 2 fixierte Überschrift mit vorbeiscrollenden Argumenten (`pinned`) · 3 Browser-Karte kippt in den Raum zurück · 4 Statement Zeile für Zeile · 5 zwei gegenläufige Laufzeilen · 6 Projekte auf einem Bogen (gepinnt) · 7 fixes 3D-Modell mit Textkarten · 8 gestapelte Projektkarten · 9 horizontaler Slider mit Fokus-Rahmen · 10 Zähler + gezeichnete Linie · Kontakt.

## So benutzen
```bash
K=~/.claude/skills/webdesign-core
cp $K/examples/nordlicht.json brief.json      # anpassen
python3 $K/scripts/build.py --style scroll-showcase --brief brief.json --out site/
python3 $K/scripts/shoot.py site/index.html site/qa --steps 14 --mobile
```
Farben: `colors.bg`, `ink`, `accent`, Himmel `sky1/sky2`, Bergebenen `l1…l4`. 3D: `model`.
Einzelne Effekte in andere Seiten einbauen: Tabelle in `webdesign-core/SKILL.md`.
Test: `examples/nordlicht.json` (fiktives Studio), Desktop + Mobil, 0 JS-Fehler.
