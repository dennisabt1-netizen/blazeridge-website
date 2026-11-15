# Shop-Lieferung

Die Seite `shop.html` und `danke.html` sind fertig. Bezahlte Dateien liegen absichtlich nicht im Website-Repo.

## Was im alten Shop war

`blazeridge-shop` liefert Dateien über `get.html`: der Browser lädt `d/<id>.bin`, entschlüsselt sie mit dem Schlüssel `k` aus der Adresse (AES-GCM) und speichert die Datei aus `d/catalog.json`. Das sind Haushalts-, Geld- und Tier-PDFs bzw. deren ZIPs. Dort gibt es kein Gratis-Echo, kein Creator-Kit, kein Video-Briefing und keinen Firmenvideo-Piloten.

## Dateien, die fehlen

Diese Namen müssen in den privaten Supabase-Bucket `shop-downloads` (Projekt `ubykffpdqvlhuijofmcu`), nicht nach GitHub:

- `starter.zip` — Wissensclips-Vorlagen und Szenenplan (7 €)
- `producer.zip` — Starter plus KI-Erklärvideos und Produktionsboard (19 €)
- `studio.zip` — Producer plus 2D-Serienbibel, Folge 1, Storyboard (39 €)
- `video-briefing-set.zip` — Briefing, Module Software/Produkt/Dienstleistung, Abnahmecheckliste, Terminbuch-Beispiel (12 €)

Der Firmenvideo-Pilot (390 €) ist eine Dienstleistung und braucht keine Datei. Das Gratis-Muster liegt öffentlich unter `downloads/warum-gibt-es-ein-echo.html`, weil es 0 € kostet. Im alten Shop gab es diese Datei nicht; sie ist ein kurzes Textbeispiel nur für diesen Button.

## Geheimnis, das du selbst setzt

Nicht committen, nicht in den Chat einer fremden Person:

1. Im Stripe-Dashboard einen eingeschränkten Schlüssel anlegen, der Checkout-Sitzungen lesen darf.
2. `supabase secrets set STRIPE_SECRET_KEY=sk_... --project-ref ubykffpdqvlhuijofmcu`
3. `supabase functions deploy deliver --no-verify-jwt --project-ref ubykffpdqvlhuijofmcu` aus `supabase/functions/deliver`. Ohne `--no-verify-jwt` blockiert das Gateway den Aufruf, weil die Seite den Publishable-Key nutzt und die Function die Zahlung selbst bei Stripe prüft.
4. Bucket `shop-downloads` anlegen, öffentlich aus, die vier ZIPs hochladen.
5. In `js/shop-config.js` nur die Function-URL eintragen: `https://ubykffpdqvlhuijofmcu.supabase.co/functions/v1/deliver`
6. Bei jedem Payment Link als Erfolgsseite setzen: `https://blazeridge.de/danke.html?session_id={CHECKOUT_SESSION_ID}`

`SUPABASE_SERVICE_ROLE_KEY` setzt Supabase in der Function selbst. Der gehört ebenfalls nicht ins Frontend.

## Stand 2026-11-15

- Bucket `shop-downloads` angelegt (privat, nur ZIP, max. 50 MB), die vier ZIPs liegen drin. Anonym weder lesbar noch listbar.
- Function `deliver` deployt (verify_jwt aus). Zuordnung über die Payment-Link-ID der Checkout-Sitzung, Betrag wird zusätzlich geprüft. Der Firmenvideo-Pilot bekommt nie eine Datei.
- `js/shop-config.js` zeigt auf die Function.
- Offen: Secret `STRIPE_SECRET_KEY` (eingeschränkter Schlüssel, nur „Checkout Sessions: Read“). Bis dahin antwortet die Function mit 503 „Lieferung ist noch nicht eingerichtet.“
