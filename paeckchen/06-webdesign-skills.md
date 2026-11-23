# P06 – Webdesign-Skills + Graphify
Status: fertig
Ziel: Website-Designs wie in den Vorbild-Videos aus einer brief.json erzeugen, kostenlos.
Geänderte Dateien: ~/.claude/skills/webdesign-core (build.py, shoot.py, effects/effects.js, styles/*.py, examples/*.json), webdesign-bold-pop, -glass-product, -scroll-showcase, -paint-studio
Entscheidungen:
- GSAP 3.13 (frei) + Lenis + three.js lokal in vendor/, 10 Scroll-Effekte per data-Attribut
- shoot.py prüft über lokalen HTTP-Server (ES-Module), --root für Unterseiten (Next.js braucht Ordner-URL)
- 3D max. 30 fps, pausiert offscreen (sonst Screenshot-Timeout ohne GPU)
- Graphify = graphifyy (Graphify-Labs), nicht graphify-cli; Venv ~/.graphify-venv, graphify-out/ lokal ausgeschlossen
Wichtige Befehle: build.py --style <bold-pop|glass-product|scroll-showcase|paint-studio> --brief b.json --out site/ [--inline]; shoot.py site/index.html qa --mobile [--video --video-size 430x932]
Offen: –
