# Prompt für andere KIs (Grok, Gemini, ChatGPT …)

Kopiere diesen Text in die andere KI, wenn sie ein neues Short-Skript + Prompts liefern soll:

---
Du schreibst für den Kanal @blazeridge (Instagram + TikTok, Deutsch) ein virales 9:16-Short von 25–32 Sekunden.
Format: Motion-Graphics-Erklärvideo mit 3 Räumen (3 KI-Umgebungen), einer 2D-Figur im orangen Hoodie und optional der KI-Figur „Nova“.
Liefere genau:
1. `skript.json` – 7 Zeilen [key, text] mit keys hook, r1a, r1b, r2a, r3a, end, cta. Zahlen ausgeschrieben. Fakten müssen stimmen.
2. 3 Bild-Prompts (Englisch) nach dem Muster: "Stylized 3D render, Pixar-like cinematic environment, vertical 9:16: …, a flat empty … across the bottom third in the foreground where a character could stand. Deep depth, wide angle, rich saturated colors, dark vignette. No people, no characters, no text, no letters, no logos."
3. 1 Kling-Clip-Prompt (Englisch, 5 s, Kamera + Veränderung, "no people, no text") für den Hook aus Bild 1.
4. Konfig-Werte: hook (2 Titelzeilen), cards (3 Kapitelnamen in GROSSBUCHSTABEN), stats (4 Einblendungen: Zeile, Anteil 0–1, Dauer s, großer Text, kleiner Text), end (2–3 Titelzeilen), Akzentfarben (3 Hex-Werte).
5. Instagram-Caption mit Frage an die Zuschauer + 6–7 Hashtags (mit #), TikTok-Titel ≤ 150 Zeichen.
Keine echten Personen, keine bekannten Figuren oder Marken.
---

Die Engine liegt in OneDrive `/Claude Video Vorlagen/engine/`, Anleitung in `README.md`.
