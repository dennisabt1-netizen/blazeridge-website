/* Shared login state for the static pages. No network until configured. */
(function () {
  var PLACEHOLDER_URL = "https://DEIN-PROJEKT.supabase.co";
  var PLACEHOLDER_KEY = "DEIN-ANON-KEY";

  function jwtPayload(key) {
    var parts = String(key || "").split(".");
    if (parts.length < 2) return null;
    try {
      var b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      return JSON.parse(atob(b64));
    } catch (e) {
      return null;
    }
  }

  function classify(url, key) {
    url = String(url || "").trim().replace(/\/$/, "");
    key = String(key || "").trim();
    if (!url || !key || url === PLACEHOLDER_URL || key === PLACEHOLDER_KEY) return "placeholder";
    if (!/^https:\/\/[a-z0-9][a-z0-9-]{2,}\.supabase\.co$/i.test(url)) return "invalid";
    if (/\s/.test(key) || key.length < 30) return "invalid";
    if (/^sb_secret_/i.test(key) || /service_role/i.test(key)) return "secret";
    var payload = jwtPayload(key);
    if (payload && payload.role && payload.role !== "anon") return "secret";
    if (!payload && key.indexOf("sb_publishable_") !== 0) return "invalid";
    return "";
  }

  function readConfig() {
    var cfg = window.BLAZERIDGE_AUTH || {};
    var url = String(cfg.supabaseUrl || "").trim().replace(/\/$/, "");
    var key = String(cfg.supabaseAnonKey || "").trim();
    var reason = classify(url, key);
    return { url: url, key: key, configured: !reason, reason: reason };
  }

  function paintNav(loggedIn) {
    var file = location.pathname.split("/").pop();
    var here = file || "index.html";
    var href = loggedIn ? "konto.html" : "login.html";
    var label = loggedIn ? "Konto" : "Login";
    document.querySelectorAll("[data-auth-nav]").forEach(function (a) {
      a.textContent = label;
      a.setAttribute("href", href);
      if (here === href) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function passwordOk(pw) {
    return typeof pw === "string" && pw.length >= 8 && pw.length <= 72 && /\p{L}/u.test(pw) && /\d/.test(pw);
  }

  function messageFor(error) {
    var code = String((error && (error.code || error.error_code)) || "").toLowerCase();
    var message = String((error && error.message) || "").toLowerCase();
    var status = error && error.status;
    if (code === "invalid_credentials" || message.indexOf("invalid login") !== -1) return "E-Mail oder Passwort stimmt nicht.";
    if (code === "email_not_confirmed" || message.indexOf("email not confirmed") !== -1) return "Bitte bestätige zuerst den Link in deiner E-Mail.";
    if (code === "user_already_exists" || message.indexOf("already registered") !== -1 || message.indexOf("already been registered") !== -1 || message.indexOf("user already") !== -1) {
      return "Für diese E-Mail gibt es schon ein Konto. Melde dich an oder setze das Passwort zurück.";
    }
    if (code === "weak_password" || message.indexOf("password should be") !== -1 || message.indexOf("at least") !== -1) {
      return "Das Passwort erfüllt die Regeln nicht: mindestens 8 Zeichen, ein Buchstabe und eine Zahl.";
    }
    if (code.indexOf("rate") !== -1 || message.indexOf("rate limit") !== -1 || message.indexOf("too many") !== -1 || status === 429) {
      return "Zu viele Versuche. Bitte warte einen Moment und versuch es noch einmal.";
    }
    if (message.indexOf("unable to validate email") !== -1 || message.indexOf("invalid format") !== -1 || message.indexOf("valid email") !== -1) {
      return "Bitte eine gültige E-Mail-Adresse eingeben.";
    }
    if (message.indexOf("signups not allowed") !== -1 || (message.indexOf("signup") !== -1 && message.indexOf("disabled") !== -1)) {
      return "Neue Konten sind gerade nicht möglich.";
    }
    if (message.indexOf("failed to fetch") !== -1 || message.indexOf("network") !== -1 || message.indexOf("load failed") !== -1 || status === 0) {
      return "Keine Verbindung zum Anmeldedienst. Bitte später noch einmal versuchen.";
    }
    return "Das hat nicht geklappt. Bitte prüfe deine Eingaben oder versuch es später noch einmal.";
  }

  function hidesAccount(error) {
    var message = String((error && error.message) || "").toLowerCase();
    return message.indexOf("user not found") !== -1 || message.indexOf("not registered") !== -1 || message.indexOf("no user") !== -1;
  }

  function formatSince(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(d);
  }

  var clientPromise = null;
  function client() {
    var status = readConfig();
    if (!status.configured) return Promise.reject(new Error(status.reason || "unconfigured"));
    if (!clientPromise) {
      clientPromise = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = new URL("js/vendor/supabase.js", document.baseURI).href;
        s.async = true;
        s.onload = function () {
          var api = window.supabase;
          if (!api || typeof api.createClient !== "function") {
            clientPromise = null;
            reject(new Error("library"));
            return;
          }
          try {
            resolve(api.createClient(status.url, status.key, {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                flowType: "pkce",
                storage: window.localStorage,
                storageKey: "blazeridge-auth"
              }
            }));
          } catch (err) {
            clientPromise = null;
            reject(err);
          }
        };
        s.onerror = function () {
          clientPromise = null;
          reject(new Error("library"));
        };
        document.head.appendChild(s);
      });
    }
    return clientPromise;
  }

  function bootNav() {
    try {
      paintNav(false);
      if (!readConfig().configured) return;
      client().then(function (supabase) {
        supabase.auth.getSession().then(function (result) {
          var session = result && result.data && result.data.session;
          paintNav(!!(session && session.user));
        }).catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  window.BlazeAuth = {
    classify: classify,
    readConfig: readConfig,
    paintNav: paintNav,
    passwordOk: passwordOk,
    messageFor: messageFor,
    hidesAccount: hidesAccount,
    formatSince: formatSince,
    client: client
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootNav);
  else bootNav();
})();
