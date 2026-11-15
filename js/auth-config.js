/* ============================================================================
 * BLAZERIDGE – öffentliche Anmelde-Konfiguration
 * ----------------------------------------------------------------------------
 * Genau zwei Werte eintragen. Anleitung: SETUP-LOGIN.md
 *
 * Erlaubt:  Project URL und der öffentliche anon-Key bzw. publishable-Key.
 * Verboten: service_role-Key, secret-Key, Datenbankpasswort. Die Seite
 *            startet den Anmeldedienst nicht, wenn so ein Schlüssel hier steht.
 *
 * Solange die Platzhalter unten stehen, zeigen Login, Registrieren und Konto
 * den Hinweis „Login bald verfügbar“ und senden keine Daten.
 * ========================================================================== */
window.BLAZERIDGE_AUTH = {
  supabaseUrl: "https://DEIN-PROJEKT.supabase.co",
  supabaseAnonKey: "DEIN-ANON-KEY"
};
