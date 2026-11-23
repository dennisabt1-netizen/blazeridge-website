---
name: webdesign-elektro-circuit
description: Website-Stil für Elektriker und Elektrotechnik-Betriebe - dunkle Platine im Hintergrund, durch die beim Scrollen Strom fließt (Funke am Stromkopf, Abzweige, Lötpunkte und Chips leuchten auf), Firmenlogo auf weißem Schild mit flackerndem Blitz, Leistungskarten die beim Einblenden ihr Licht einschalten, Glühbirne geht im Kontakt an. Nutzen bei 'Elektriker-Website', 'Elektrotechnik', 'Strom-Effekt', 'Platinen-Design'.
---

# webdesign-elektro-circuit

Signatur-Effekte (in `webdesign-core/effects/effects.js`):
- `data-circuit`: fixes SVG; `path.trace.main` = Hauptleitung (Scroll 0→1), weitere `path.trace` (mit id) starten, wenn der Strom ihren Anfang erreicht; `.node[data-trace=id]` leuchtet am Ende des Abzweigs; `.spark` folgt dem Stromkopf.
- `data-bulb`: Element bekommt beim Einblenden `flick` (Flackern) und dann `on` (Licht an).

## Benutzen
```bash
K=~/.claude/skills/webdesign-core
cp $K/examples/elektrotechnik-kolb.json brief.json   # anpassen
python3 $K/scripts/build.py --style elektro-circuit --brief brief.json --out site/ --inline
python3 $K/scripts/shoot.py site/index.html site/qa --steps 8 --mobile
```
Brief-Felder: `brand`, `short_brand`, `logo` {lead, word, name, suffix}, `hero.title_html` (darf `<em>` enthalten), `hero.subtitle`, `about.heading/text`,
`stats[]` {value, suffix, label}, `services_lede`, `items[]` {title, short, text, icon: haus|licht|steckdose|smarthome|emobil|netzwerk|schaltschrank|pruefung},
`contact` {phone, phone_href, email, address[], maps, hours}, `colors` {red, amber, bg}.
Regeln: nur echte Daten (Google-Profil, Firmenseite, Impressum); unklare Angaben (Öffnungszeiten) vorsichtig formulieren; vor Livegang Impressum + Datenschutz.
Test 23.11.2026: `examples/elektrotechnik-kolb.json` – Desktop + Mobil, 0 JS-Fehler, kein Überlauf.
