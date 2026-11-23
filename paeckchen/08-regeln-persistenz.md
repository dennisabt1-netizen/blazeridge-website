# P08 – Dauerhafte Regeln + Wiederherstellung je Sitzung
Status: fertig (Setup-Skript erst bei frischer Sitzung bewiesen)
Ziel: Skills, Agenten, Regeln in jeder Sitzung automatisch da.
Geänderte Dateien: Repo-Branch `skills` (skills/, agents/, claude-motion/, CLAUDE.md, restore.sh, README.md); ~/.claude/CLAUDE.md; Umgebung „Yputoube“ Setup-Skript
Entscheidungen:
- Regel Dennis 23.11.: KEIN KI-Hinweis im Video; nur in Beschreibung, wenn Dennis es sagt (in CLAUDE.md, Skills, Agenten, Make 256969 Regel 10, 256616, OneDrive REGELN-DAUERHAFT.md)
- restore.sh: Skills, Agenten, CLAUDE.md, Graphify, ~/claude-motion (npm install), Piper-Stimme
- Fremde Skills: remotion-dev/skills, coreyhaines31/marketingskills (mkt-*), blazeridge-video-engine (OneDrive), Agenten recherche/techniker/texter
Wichtige Befehle: bash <(git show origin/skills:restore.sh)
Offen: v002–v004 sind schon mit KI-Abzeichen veröffentlicht – Posts nur mit Ja ändern
