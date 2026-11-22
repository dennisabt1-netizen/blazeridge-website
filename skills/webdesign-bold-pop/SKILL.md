---
name: webdesign-bold-pop
description: Lauter Studio-Website-Stil – knallgelb/schwarz, riesige Schrift, morphender schwarzer Blob, Sticker-Objekte die beim Scrollen einfliegen, Farbkachel-Mosaik, großer 'Reach out'-Footer. Für Creator, Agenturen, Marken mit Persönlichkeit (z. B. BlazeRidge). Nutzen bei 'bold', 'gelbe Website', 'Studio-Seite', 'wie Buttermax', 'auffällige Landingpage'.
---

# webdesign-bold-pop

Stil aus dem Vorbild-Video „Claude isn't making this“ (gelbe Studio-Seite) – nur der Stil, eigene Inhalte.

**Bausteine:** fixe Navigation (Differenz-Modus) · Hero mit Riesen-Markenname über morphendem Blob (`data-blob`) und 4 schwebenden Stickern (`data-parallax`) · Manifest mit Zeilen-Reveal · blaues Laufband (`data-sideways`) · Kachel-Mosaik, Sticker fliegen ein (`data-scatter`) · nummerierte Projektliste · Zahlen-Kacheln (`data-count`) · schwarzer „Reach out“-Footer mit Welle.

**Ohne Fotos:** Für jedes `items[]` wird ein buntes Objekt-Sticker-SVG erzeugt. Mit `image` wird das Foto im Sticker-Rahmen gezeigt.

## So benutzen
```bash
K=~/.claude/skills/webdesign-core
cp $K/examples/blazeridge.json brief.json      # anpassen
python3 $K/scripts/build.py --style bold-pop --brief brief.json --out site/
python3 $K/scripts/shoot.py site/index.html site/qa --steps 8 --mobile   # ansehen, fixen
```
Farben: `colors.bg`, `ink`, `accent`, `blue`, `tiles` (Liste mit 5 Kachelfarben).
Test: `examples/blazeridge.json` (BlazeRidge), geprüft Desktop + 390 px, 0 JS-Fehler.
