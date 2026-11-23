# P04 – bootstrap.sh: Upload-Freigabe automatisch
Status: fertig
Ziel: OneDrive-Uploads in neuen Sitzungen nicht mehr blockieren.
Geänderte Dateien: OneDrive "Claude Skills/bootstrap.sh", "Claude Skills/PLAYBOOK.md" (Regel 12, Einrichtung Schritt 3)
Entscheidungen: Das Skript ergänzt ~/.claude/settings.json um allow-Regeln für mcp__Composio__COMPOSIO_PROXY_EXECUTE und mcp__Composio__COMPOSIO_MULTI_EXECUTE_TOOL, bestehende Einträge bleiben.
Wichtige Befehle/Werte: Ausgabe "permissions: ready"; Uploads per createUploadSession + curl PUT (PLAYBOOK, Regel 6)
Offen / nächster Schritt: nur "Bootstrap ausführen" muss pro Sitzung einmal bestätigt werden
