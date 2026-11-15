# Shop-Korrekturen in Betrieb nehmen

Die Dateien im Entwurf gehören zusammen. Vor Übernahme des Frontends müssen der
Widerruf, die Bestätigung und die Auslieferung in einer Testumgebung funktionieren.

1. Supabase-Projekt und einen Transaktionsmailer verbinden. Das Projekt nutzt
   Resend mit verifizierter Absenderdomain. Auftragsverarbeitung, tatsächliche
   Speicherfristen und Drittlandübermittlungen mit der Datenschutzerklärung
   abgleichen. Überprüfung der Bestell- und Widerrufsdaten und dokumentierte
   Löschung nach Ablauf der einschlägigen Fristen einrichten.
2. Migration und die vier Edge Functions aus diesem Branch auf einem
   Staging-Projekt deployen. Die IDs und URL für die Staging-Seite anpassen.
   Die Origin-Konstante und der CORS-Wert in `deliver` müssen der Staging-Seite
   entsprechen. Den privaten Staging-Bucket mit einem Test-ZIP befüllen.
3. In Supabase die Secret-Werte für `RESEND_API_KEY`, `SHOP_MAIL_FROM`,
   `SHOP_WITHDRAWAL_HASH_KEY`, `SHOP_RETRY_TOKEN` und `SHOP_CONFIRM_FROM`
   setzen. Hash- und Retry-Schlüssel sind getrennte lange Zufallswerte.
   `SHOP_CONFIRM_FROM` ist ein ISO-UTC-Zeitpunkt. Für Testkäufe außerdem
   `STRIPE_TEST_SECRET_KEY` und `STRIPE_TEST_STARTER_LINK` setzen. Stripe-Keys
   brauchen Leserechte auf Checkout Sessions. Die Werte gehören nicht in Git.
4. In Stripe einen Webhook für `checkout.session.completed` und
   `checkout.session.async_payment_succeeded` auf `shop-orders` richten.
   Den Signaturschlüssel als `STRIPE_TEST_SHOP_WEBHOOK_SECRET` bzw.
   `STRIPE_SHOP_WEBHOOK_SECRET` speichern. Der Checkout führt nach
   `danke.html?session_id={CHECKOUT_SESSION_ID}`.
5. In Supabase einen Cron-Aufruf alle fünf Minuten auf `shop-retry-receipts`
   einrichten. Der Aufruf ist POST mit `Authorization: Bearer <SHOP_RETRY_TOKEN>`.
   URL und Schlüssel über Supabase Vault referenzieren. Offene Datensätze
   entnehmen: `select key, created_at from public.shop_confirmations where sent_at is null;`
   Zustellfehler und offene Einträge außerhalb des automatischen Retry-Fensters
   (23 Stunden) als Betreiber prüfen. Bei solchen Fällen bestehende Zustellung
   im Maildienst kontrollieren, bevor manuell erneut verschickt wird.
6. Im Stripe-Testmodus prüfen: Gesamtpreis und Leistungsmerkmale unmittelbar
   vor Zahlung, eindeutig beschriftete Bezahlfläche, Pflichtkästchen,
   Vertrags-E-Mail mit Zustimmung und Kenntnisnahme, richtiger ZIP-Download,
   keine Ausgabe ohne bestätigte Zahlung, Mehrfachaufruf ohne doppelte E-Mail,
   Testzahlung mit geschlossenem Browser sowie Widerruf ohne Anmeldung mit
   zweitem Bestätigungsschritt und E-Mail mit Erklärung, Datum und Uhrzeit.
   Auch unterbrochenen Mailversand und Cron-Nachlieferung prüfen.
7. Erst nach bestandenem Test: Produktion konfigurieren, Checkout-Texte für
   die vier digitalen Zahlungslinks mit den tatsächlich gelieferten ZIPs
   abgleichen. In Stripe Dashboard → Payment Links → Link bearbeiten die
   bisherige Zustimmung neben dem Bezahlbutton durch die Produktmerkmale
   ersetzen und die Bezahlbeschriftung eindeutig setzen. Das gesonderte
   Pflichtkästchen mit Links zu AGB und Widerruf beibehalten. Stripe hat die
   Änderung über die verbundene App abgelehnt, da sie die Links nicht erstellt hat.
   Danach den Shop veröffentlichen und URLs prüfen. Den alten direkten
   Zahlungslink für den Pilot deaktivieren, nachdem die Anfrage im Shop live ist.
   Frühere Pilotkunden weiterhin betreuen. Für individuelle Aufträge die
   akzeptierten Konditionen und den Liefertermin vor Beauftragung festhalten.
8. Vor Freigabe die tatsächliche USt-IdNr./W-IdNr. im Impressum prüfen, falls
   zugeteilt. Bei Firmenaufträgen die umsatzsteuerliche Rechnung getrennt von
   der Bestellbestätigung behandeln. Falls die BFSG-Kleinstunternehmerausnahme
   nicht greift, sind eine vollständige Barrierefreiheitsprüfung und die
   einschlägigen Informationen erforderlich.

Die E-Mail enthält die AGB und Widerrufsbelehrung als Text (`_shared/contract-text.ts`).
Bei Rechtsänderungen die Website und diese Momentaufnahme gemeinsam aktualisieren.
