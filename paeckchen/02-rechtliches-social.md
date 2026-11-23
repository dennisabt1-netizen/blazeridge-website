# P02 – Website: Rechtliches + Social-Links
Status: fertig (live, PR #1 gemergt, main be28902)
Ziel: blazeridge.de rechtlich absichern und TikTok/Instagram/Facebook verlinken.
Geänderte Dateien: index.html, impressum.html, datenschutz.html, media/fonts/ (woff2 + fonts.css)
Entscheidungen:
- Google Fonts selbst gehostet (DSGVO, LG München I 3 O 17493/20)
- Impressum § 5 DDG / § 18 MStV: Name, Anschrift, E-Mail; Telefon nicht nötig (EuGH C-649/17)
- Social nur als einfache Links (keine Einbettung, kein Cookie-Banner nötig)
- Profile: tiktok/@blazeridge, instagram/blazeridge, facebook/blazeridge (vom Auftraggeber bestätigt)
- Merge nur nach ausdrücklichem "live"; Bugbot (Limit erreicht) übersprungen
Wichtige Befehle/Werte: Branch rechtliches-und-social-links; prüfen per curl blazeridge.de (fonts.googleapis = 0)
Offen / nächster Schritt: TikTok-Shop-Links für die 5 Produktkarten; blazeridge.de in die Bios
