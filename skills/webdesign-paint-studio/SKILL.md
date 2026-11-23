---
name: webdesign-paint-studio
description: Website-Stil für Maler, Lackierer und Handwerksbetriebe - schwarze Wand im Hintergrund, die beim Scrollen von einer Farbrolle Bahn für Bahn gestrichen wird, Monogramm mit Farbklecksen, Leistungskarten mit Pinselstrich-Reveal, Kontakt mit Anruf- und Routen-Button. Nutzen bei 'Maler-Website', 'Handwerker-Website', 'Malermeister', 'Pinsel-Effekt'.
---

# webdesign-paint-studio

Signatur-Effekt: `data-paintwall` (in `webdesign-core/effects/effects.js`): fixes SVG im Hintergrund, 8 Rollbahnen à 6 Borsten-Linien, Scroll-Fortschritt streicht sie nacheinander, die Farbrolle (`.roller`) folgt dem Farbkopf. Dazu `data-swipe` (Pinselstrich-Reveal).

## Benutzen
```bash
K=~/.claude/skills/webdesign-core
cp $K/examples/ma-color-design.json brief.json   # anpassen
python3 $K/scripts/build.py --style paint-studio --brief brief.json --out site/
python3 $K/scripts/shoot.py site/index.html site/qa --steps 9 --mobile
```
Brief-Felder: `brand`, `wordmark` (Schreibschrift), `monogram` ["M","A"], `owner`, `title` (z. B. Malermeister), `hero.subtitle`, `about.heading/text`,
`items[]` {title, text, icon: innen|fassade|deko|boden}, `contact` {phone, phone_href "tel:+49…", address [Zeilen], maps (Google-Maps-Suchlink)}, `colors.splats` (5 Farben).
Regeln: nur echte Daten des Betriebs (Visitenkarte, Google-Profil); keine erfundenen Bewertungen/Zahlen; vor Livegang Impressum + Datenschutz.
Test: `examples/ma-color-design.json` (M. A. Color & Design, Niederstotzingen) – Desktop + Mobil, 0 JS-Fehler.
