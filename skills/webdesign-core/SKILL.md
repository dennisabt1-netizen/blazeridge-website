---
name: webdesign-core
description: Kern für Website-Designs mit Scroll-Effekten (GSAP + ScrollTrigger, Lenis, three.js – alles kostenlos). Baut aus einer Website-Angabe (brief.json) eine fertige Seite im gewählten Stil, prüft sie mit Screenshots und kann ein Scroll-Video aufnehmen. Nutzen bei 'Website bauen', 'Landingpage', 'Webdesign', 'Scroll-Effekte', oder wenn ein Stil-Skill (webdesign-bold-pop, webdesign-glass-product, webdesign-scroll-showcase) gebraucht wird.
---

# webdesign-core

Ein Generator + eine Effekt-Bibliothek. Die Stil-Skills sagen, *wie* es aussieht; dieser Skill macht die Arbeit.

## Ablauf (immer so)
1. **Brief anlegen**: `brief.json` nach `references/brief-schema.md` (Vorlage: `examples/blazeridge.json`).
   Fehlen Angaben, nimm sinnvolle Texte (kurz, konkret, deutsch) – keine Platzhalter, keine erfundenen Zahlen.
2. **Bauen**
   ```bash
   K=~/.claude/skills/webdesign-core
   python3 $K/scripts/build.py --style <bold-pop|glass-product|scroll-showcase> --brief brief.json --out site/
   # --inline  -> eine einzige index.html (für Vorschau/Artifact); ohne -> index.html + assets/ (für Hosting)
   ```
3. **Prüfen (Pflicht)**
   ```bash
   python3 $K/scripts/shoot.py site/index.html site/qa --steps 10 --mobile
   ```
   Liefert `qa/sheet-desktop.png`, `qa/sheet-mobile.png`, JS-Fehler, Warnung bei horizontalem Überlauf.
   Sheets **ansehen**, Schwächen beheben (Brief oder Stil-CSS), erneut prüfen. Erst dann ausliefern.
   Den Screenshot-Check kann der Subagent `web-qa` (kleines Modell) übernehmen.
4. **Scroll-Video** (für Reels/Promo): `shoot.py ... --video` → `qa/scroll.mp4` (1280×720). Weiterverarbeitung mit Skill `website-promo-video`.
5. **Ausliefern**: Ordner `site/` hochladen (GitHub Pages, Netlify …) oder `--inline` als Artifact zeigen.

## Die 10 Scroll-Effekte (data-Attribute, `effects/effects.js`)
| # | Effekt | Markup |
|---|---|---|
| 1 | Layered Parallax | `data-parallax="0.4"` (Ebene), Scope `data-parallax-scope` |
| 2 | Pinned Heading | Sektion `data-pin`, Überschrift `data-pin-target` |
| 3 | 3D Card Zoom | `data-card-zoom` |
| 4 | Line-by-line Reveal | `data-lines` (SplitText) |
| 5 | Sideways Text | `data-sideways="-1"` / `"1"` |
| 6 | Card Arc Carousel | Container `data-arc="11"` mit `.arc-card` |
| 7 | Fixed 3D Model | `data-three="knot|blob|ring|bottle"` `data-color` (three.js, kein Spline nötig) |
| 8 | Stacking Cards | `data-stack` mit `.stack-card` |
| 9 | Focus-frame Slider | `data-focus` mit `.focus-track > .focus-slide` |
| 10 | Scroll-triggered | `data-reveal`, `data-count="42"`, `data-draw` (SVG-Pfad) |
| + | Extras | `data-blob` (Morph), `data-scatter` (Sticker fliegen ein), `data-tilt` (Maus-Neigung) |

Alle Effekte respektieren `prefers-reduced-motion`. 3D rendert max. 30 fps und pausiert außerhalb des Bildes.

## Neuer Stil
Datei `styles/<name>.py` mit `render(brief, ctx) -> {css, body, fonts, three}` anlegen (Vorbild: `bold_pop.py`), dann `--style <name>`.
Regeln: semantisches HTML, echte Texte, Alt-Texte, sichtbarer Fokus, keine Emojis als Icons (SVG aus `_common.ICON`), kein horizontaler Überlauf bei 390 px.

## Kostenlos & Lizenzen
GSAP 3.13 inkl. ScrollTrigger/SplitText (Standard-„no charge“-Lizenz), Lenis (MIT), three.js (MIT), Google Fonts (OFL).
Bezahl-Werkzeuge aus den Vorbild-Videos werden ersetzt: Spline → three.js (prozedurale Modelle), Webflow/Framer → statisches HTML, Screen Studio → Playwright-Aufnahme + Remotion.
Nie Logos, Namen oder Texte fremder Marken kopieren – nur den Stil.
