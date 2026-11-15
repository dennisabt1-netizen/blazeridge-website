# Anmeldung einrichten

Die Seiten `login.html`, `registrieren.html`, `passwort.html` und `konto.html` sind fertig, aber absichtlich aus. Solange in `js/auth-config.js` die Platzhalter stehen, steht dort **Login bald verfügbar** und der Browser schickt keine Kontodaten irgendwohin.

Die Website bleibt statisch auf GitHub Pages. Es kommt kein eigener Server dazu. Kosten: 0 €. Keine Kreditkarte, kein Pro-Tarif, kein bezahlter E-Mail-Versand.

## Warum Supabase

Supabase Auth hat einen Free-Plan mit E-Mail und Passwort, inklusive Link zum Zurücksetzen des Passworts. Die Bibliothek liegt hier im Repo (`js/vendor/supabase.js`, Version 2.119.0, MIT) und spricht den Anmeldedienst direkt aus dem Browser an. In die Website gehört nur der öffentliche anon- bzw. publishable-Key. Der geheime `service_role`- oder secret-Key bleibt im Dashboard.

Firebase und andere Free-Tarife können dasselbe, brauchen aber ebenfalls ein Konto bei einem US-Anbieter. Supabase lässt beim Anlegen des Projekts eine konkrete EU-Region zu (Frankfurt). Deshalb dieser Weg.

## Was du anlegst

1. Öffne [https://supabase.com/dashboard](https://supabase.com/dashboard) und registriere dich mit GitHub oder E-Mail.
2. Bleib auf dem Plan **Free** (0 $ / Monat). Wenn nach einer Kreditkarte, einer Zahlung oder einem Pro-Tarif gefragt wird: abbrechen. Für diese Website nichts davon eintragen und nichts starten.
3. Lege ein Projekt an:
   - Name: `blazeridge`
   - Datenbankpasswort: erzeugen und in einen Passwortmanager legen. Es gehört **nicht** in dieses Repo und **nicht** in `js/auth-config.js`. Die Website braucht es nicht.
   - Region: **Central EU (Frankfurt)** / `eu-central-1`. Nicht die allgemeine Gruppe „Europe“, nicht London, nicht Zürich. London und Zürich sind bei Supabase „Europe“, aber keine EU-Mitgliedstaaten.
4. Warte, bis das Projekt fertig ist.

Free-Projekte pausieren nach einer Woche ohne Aufrufe. Aufwecken im Dashboard ist kostenlos. Wenn die Anmeldung später plötzlich nicht geht, zuerst prüfen, ob das Projekt pausiert ist. Nicht auf Pro wechseln, nur um das zu vermeiden.

## Die zwei Werte

Im Projekt: **Project Settings → API** (manchmal „API Keys“ oder „Data API“).

| In `js/auth-config.js` | Aus dem Dashboard |
| --- | --- |
| `supabaseUrl` | **Project URL**, Form `https://xxxxxxxx.supabase.co` |
| `supabaseAnonKey` | Schlüssel namens **anon**, **public** oder **publishable** |

Nicht kopieren: alles, was **service_role** oder **secret** heißt, und nicht das Datenbankpasswort.

Die Datei sieht danach so aus, mit deinen echten Werten statt der Beispiele:

```javascript
window.BLAZERIDGE_AUTH = {
  supabaseUrl: "https://abcdefgh.supabase.co",
  supabaseAnonKey: "eyJhbGciOi...anon..."
};
```

Der anon- bzw. publishable-Key ist öffentlich und darf in dieses Repo. Die Seite verweigert den Start, wenn dort ein secret- oder service_role-Schlüssel steht.

Commit auf `main` (oder in den Pull Request, bevor er gemergt wird). GitHub Pages übernimmt die Datei mit dem nächsten Deploy von `main`.

## Anmeldung im Dashboard

Unter **Authentication**:

1. **URL Configuration**
   - Site URL: `https://blazeridge.de`
   - Redirect URLs: `https://blazeridge.de/**`
   - Wenn du lokal prüfst, zusätzlich `http://127.0.0.1:8765/**` eintragen. Sonst lehnt Supabase die Rückkehr nach dem E-Mail-Link ab.
2. **Providers → Email**: an. „Confirm email“ an lassen, damit niemand eine fremde Adresse einträgt.
3. **Settings** (oder Policies): **Minimum password length** auf `8` stellen. Die Seiten verlangen außerdem einen Buchstaben und eine Zahl und lehnen mehr als 72 Zeichen ab.
4. Optional, weiterhin kostenlos: unter **Email Templates** die Bestätigungs- und Reset-Mails auf Deutsch umschreiben. Den mitgelieferten Mailversand nicht durch einen bezahlten SMTP-Dienst ersetzen. Er ist auf dem Free-Plan gedrosselt (wenige Mails pro Stunde) und reicht für diese Seite.

## Datenschutz-Seite

In `datenschutz.html`, Abschnitt 5, stehen drei gelb markierte Stellen `[FEHLT: …]`. Nach dem Anlegen des Projekts in Frankfurt so ersetzen:

- Serverregion: `eu-central-1 (Frankfurt, Deutschland, EU)`.
- Drittland-Satz: bestätigen, dass das Projekt in dieser Region liegt, und den `[FEHLT]`-Hinweis entfernen. Der Hinweis auf Singapur und die USA (Sitz von Supabase und mögliche Unterauftragsverarbeiter, Standardvertragsklauseln) bleibt.
- Speicherdauer der Auth-Protokolle: im Dashboard nachsehen. Die öffentliche Preisliste nennt für den Free-Plan derzeit etwa 24 Stunden „Auth Audit Logs“. Nur eintragen, was du dort siehst.

## Kurz testen

1. `registrieren.html` öffnen, Konto anlegen, Häkchen bei der Datenschutzerklärung setzen.
2. Mail bestätigen, auf `login.html` anmelden. Die Navigation zeigt dann **Konto**.
3. `konto.html`: E-Mail sichtbar, **Abmelden** führt zurück zum Login.
4. **Passwort vergessen** auf `passwort.html`. Den Link in derselben Browser-Sitzung öffnen, in der du ihn angefordert hast. Er landet auf `konto.html` und fragt nach einem neuen Passwort. Ein abgelaufener Link oder ein anderer Browser sagt das auf der Kontoseite, statt nur „nicht angemeldet“ zu zeigen.

Ohne die zwei Werte bleibt überall der Hinweis „Login bald verfügbar“. Das ist der gewünschte Zustand bis zu diesem Setup.
