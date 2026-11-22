# brief.json – Website-Angaben

Alle Felder optional außer `brand`. Texte auf Deutsch, kurz und konkret.

```json
{
  "brand": "Name",
  "tagline": "Ein Satz, worum es geht",
  "description": "Meta-Beschreibung für Google (1–2 Sätze)",
  "lang": "de",
  "nav": ["Arbeit", "Studio", "Kontakt"],
  "colors": {"bg": "#FFE14D", "ink": "#0B0B0B", "accent": "#FF5A1F"},
  "hero": {"title": "Große Überschrift", "highlight": "Teil der Überschrift, der farbig wird (glass)",
           "subtitle": "Unterzeile", "cta": {"label": "Button-Text", "href": "#kontakt"}},
  "about": {"kicker": "Studio", "heading": "Manifest-Satz", "text": "Zusatzabsatz"},
  "marquee": ["Wörter", "für", "Laufband"],
  "items": [{"title": "Projekt/Produkt/Feature", "text": "1–2 Sätze", "tag": "Kategorie",
             "image": "https://… (optional, sonst generiert)", "metric": "1,6 l (glass)"}],
  "stats": [{"value": "30", "label": "Sekunden"}],
  "contact": {"heading": "Reach out", "email": "mail@…", "links": [{"label": "Instagram", "href": "…"}]},
  "footer": "© 2026 Name",
  "legal": [{"label": "Impressum", "href": "…"}, {"label": "Datenschutz", "href": "…"}],

  "app": {"name": "…", "chart_label": "…", "action": "…", "metrics": [{"value": "1,6", "label": "…"}]},
  "model": "bottle | knot | blob | ring",
  "pinned": {"heading": "Warum?", "points": ["…", "…", "…"]},
  "showcase_title": "…", "arc_title": "…", "stats_title": "…"
}
```

Stil-spezifisch: `app`, `model`, `hero.highlight` → glass-product · `pinned`, `showcase_title`, `arc_title`, `stats_title`, `model` → scroll-showcase · `colors.tiles` (Liste) → bold-pop.

Zahlen in `stats`/`metric` nur, wenn sie stimmen. Für Deutschland: Impressum und Datenschutz verlinken (`legal`).
