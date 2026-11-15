/* Page behaviour for login, register, account and password reset. */
(function () {
  var auth = window.BlazeAuth;
  var page = document.body.getAttribute("data-auth-page");
  if (!auth || !page) return;

  var notice = document.querySelector("[data-auth-notice]");
  var noticeTitle = notice && notice.querySelector("[data-notice-title]");
  var noticeText = notice && notice.querySelector("[data-notice-text]");
  var loading = document.querySelector("[data-auth-loading]");

  function showNotice(title, text, alert) {
    if (!notice) return;
    notice.hidden = false;
    notice.setAttribute("role", alert ? "alert" : "status");
    if (noticeTitle) noticeTitle.textContent = title;
    if (noticeText) noticeText.textContent = text;
  }

  function setForms(disabled) {
    document.querySelectorAll("[data-auth-form]").forEach(function (form) {
      if (disabled) form.setAttribute("aria-disabled", "true");
      else form.removeAttribute("aria-disabled");
      form.querySelectorAll("input, button, textarea").forEach(function (el) {
        el.disabled = disabled;
      });
    });
  }

  function msg(form, kind, text) {
    if (!form) return;
    var err = form.querySelector("[data-auth-error]");
    var ok = form.querySelector("[data-auth-success]");
    if (err) {
      err.hidden = kind !== "error";
      err.textContent = kind === "error" ? text : "";
    }
    if (ok) {
      ok.hidden = kind !== "ok";
      ok.textContent = kind === "ok" ? text : "";
    }
  }

  function busy(form, on) {
    var btn = form.querySelector("[type=submit]");
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
    btn.disabled = on;
    btn.textContent = on ? "Bitte warten …" : btn.dataset.label;
  }

  function clearInvalid(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
  }

  function mark(form, name) {
    var el = form.elements[name];
    if (el) el.setAttribute("aria-invalid", "true");
  }

  var status = auth.readConfig();
  if (!status.configured) {
    if (status.reason === "secret") {
      showNotice("Anmeldung blockiert", "In der Konfiguration steht ein geheimer Schlüssel. Dort darf nur der öffentliche anon- oder publishable-Key stehen. Es wird nichts gesendet.", true);
    } else if (status.reason === "placeholder") {
      showNotice("Login bald verfügbar", "Die Anmeldung wird gerade eingerichtet. Es werden noch keine Daten gesendet.");
    } else {
      showNotice("Login bald verfügbar", "Die hinterlegte Konfiguration ist noch nicht gültig. Es werden noch keine Daten gesendet.");
    }
    setForms(true);
    document.querySelectorAll("[data-panel]").forEach(function (el) { el.hidden = true; });
    if (loading) loading.hidden = true;
    return;
  }

  if (notice) notice.hidden = true;
  setForms(false);
  if (loading) loading.hidden = false;

  auth.client().then(function (supabase) {
    var recovery = false;
    var hash = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    var query = new URLSearchParams(location.search);
    if (hash.get("type") === "recovery" || query.get("type") === "recovery") recovery = true;

    function fillAccount(session) {
      var panel = document.querySelector('[data-panel="account"]');
      var guest = document.querySelector('[data-panel="guest"]');
      if (!panel) return;
      if (guest) guest.hidden = true;
      panel.hidden = false;
      var email = (session.user && session.user.email) || "";
      var emailEl = panel.querySelector("[data-email]");
      var sinceEl = panel.querySelector("[data-since]");
      if (emailEl) emailEl.textContent = email;
      if (sinceEl) sinceEl.textContent = auth.formatSince(session.user && session.user.created_at);
      var del = panel.querySelector("[data-delete]");
      if (del) {
        var subject = "Löschung meines BlazeRidge-Kontos";
        var body = "Bitte lösche mein Konto und die dazugehörigen Daten.\n\nE-Mail: " + email;
        del.href = "mailto:einkaufnow@outlook.de?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      }
    }

    function renderAccount(session) {
      if (page !== "account") return;
      var guest = document.querySelector('[data-panel="guest"]');
      var panel = document.querySelector('[data-panel="account"]');
      var rec = document.querySelector('[data-panel="recovery"]');
      if (session && session.user) {
        fillAccount(session);
        if (rec) rec.hidden = !recovery;
      } else {
        if (panel) panel.hidden = true;
        if (rec) rec.hidden = true;
        if (guest) guest.hidden = false;
      }
    }

    supabase.auth.onAuthStateChange(function (event, session) {
      auth.paintNav(!!(session && session.user));
      if (event === "PASSWORD_RECOVERY") recovery = true;
      renderAccount(session);
    });

    var logout = document.querySelector("[data-logout]");
    if (logout) {
      logout.addEventListener("click", function () {
        logout.disabled = true;
        supabase.auth.signOut().finally(function () {
          location.href = "login.html";
        });
      });
    }

    var login = document.querySelector('[data-auth-form="login"]');
    if (login) {
      login.addEventListener("submit", function (e) {
        e.preventDefault();
        clearInvalid(login);
        var email = login.elements.email.value.trim();
        var password = login.elements.password.value;
        if (!email || !password) {
          msg(login, "error", "Bitte E-Mail und Passwort eingeben.");
          if (!email) mark(login, "email");
          if (!password) mark(login, "password");
          return;
        }
        busy(login, true);
        msg(login, "", "");
        supabase.auth.signInWithPassword({ email: email, password: password }).then(function (result) {
          busy(login, false);
          if (result.error) {
            msg(login, "error", auth.messageFor(result.error));
            return;
          }
          location.href = "konto.html";
        }).catch(function () {
          busy(login, false);
          msg(login, "error", "Keine Verbindung zum Anmeldedienst. Bitte später noch einmal versuchen.");
        });
      });
    }

    var register = document.querySelector('[data-auth-form="register"]');
    if (register) {
      register.addEventListener("submit", function (e) {
        e.preventDefault();
        clearInvalid(register);
        var email = register.elements.email.value.trim();
        var password = register.elements.password.value;
        var again = register.elements.password2.value;
        var consent = register.elements.datenschutz.checked;
        if (!email) {
          msg(register, "error", "Bitte eine gültige E-Mail-Adresse eingeben.");
          mark(register, "email");
          return;
        }
        if (!auth.passwordOk(password)) {
          msg(register, "error", "Mindestens 8 Zeichen, davon ein Buchstabe und eine Zahl. Höchstens 72 Zeichen.");
          mark(register, "password");
          return;
        }
        if (password !== again) {
          msg(register, "error", "Die beiden Passwörter stimmen nicht überein.");
          mark(register, "password2");
          return;
        }
        if (!consent) {
          msg(register, "error", "Bitte die Datenschutzerklärung bestätigen.");
          mark(register, "datenschutz");
          return;
        }
        busy(register, true);
        msg(register, "", "");
        supabase.auth.signUp({
          email: email,
          password: password,
          options: { emailRedirectTo: new URL("konto.html", location.href).href }
        }).then(function (result) {
          busy(register, false);
          if (result.error) {
            msg(register, "error", auth.messageFor(result.error));
            return;
          }
          if (result.data && result.data.session) {
            location.href = "konto.html";
            return;
          }
          register.reset();
          msg(register, "ok", "Schau in dein Postfach und bestätige die E-Mail. Danach kannst du dich anmelden.");
        }).catch(function () {
          busy(register, false);
          msg(register, "error", "Keine Verbindung zum Anmeldedienst. Bitte später noch einmal versuchen.");
        });
      });
    }

    var reset = document.querySelector('[data-auth-form="reset"]');
    if (reset) {
      reset.addEventListener("submit", function (e) {
        e.preventDefault();
        clearInvalid(reset);
        var email = reset.elements.email.value.trim();
        if (!email || email.indexOf("@") === -1) {
          msg(reset, "error", "Bitte eine gültige E-Mail-Adresse eingeben.");
          mark(reset, "email");
          return;
        }
        busy(reset, true);
        msg(reset, "", "");
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: new URL("konto.html", location.href).href
        }).then(function (result) {
          busy(reset, false);
          if (result.error && !auth.hidesAccount(result.error)) {
            msg(reset, "error", auth.messageFor(result.error));
            return;
          }
          reset.reset();
          msg(reset, "ok", "Wenn ein Konto zu dieser E-Mail existiert, ist der Link unterwegs. Schau auch im Spam-Ordner nach.");
        }).catch(function () {
          busy(reset, false);
          msg(reset, "error", "Keine Verbindung zum Anmeldedienst. Bitte später noch einmal versuchen.");
        });
      });
    }

    var recoveryForm = document.querySelector('[data-auth-form="recovery"]');
    if (recoveryForm) {
      recoveryForm.addEventListener("submit", function (e) {
        e.preventDefault();
        clearInvalid(recoveryForm);
        var password = recoveryForm.elements.password.value;
        var again = recoveryForm.elements.password2.value;
        if (!auth.passwordOk(password)) {
          msg(recoveryForm, "error", "Mindestens 8 Zeichen, davon ein Buchstabe und eine Zahl. Höchstens 72 Zeichen.");
          mark(recoveryForm, "password");
          return;
        }
        if (password !== again) {
          msg(recoveryForm, "error", "Die beiden Passwörter stimmen nicht überein.");
          mark(recoveryForm, "password2");
          return;
        }
        busy(recoveryForm, true);
        msg(recoveryForm, "", "");
        supabase.auth.updateUser({ password: password }).then(function (result) {
          busy(recoveryForm, false);
          if (result.error) {
            msg(recoveryForm, "error", auth.messageFor(result.error));
            return;
          }
          recovery = false;
          recoveryForm.reset();
          msg(recoveryForm, "ok", "Dein neues Passwort ist gespeichert.");
        }).catch(function () {
          busy(recoveryForm, false);
          msg(recoveryForm, "error", "Keine Verbindung zum Anmeldedienst. Bitte später noch einmal versuchen.");
        });
      });
    }

    supabase.auth.getSession().then(function (result) {
      if (loading) loading.hidden = true;
      var session = result && result.data && result.data.session;
      auth.paintNav(!!(session && session.user));
      if (page === "account") {
        if (location.search || location.hash) history.replaceState({}, "", location.pathname);
        if (result.error) showNotice("Anmeldung gerade nicht erreichbar", "Die Sitzung konnte nicht gelesen werden. Bitte lade die Seite neu.", true);
        renderAccount(session);
      }
    }).catch(function () {
      if (loading) loading.hidden = true;
      if (page === "account") showNotice("Anmeldung gerade nicht erreichbar", "Die Sitzung konnte nicht gelesen werden. Bitte lade die Seite neu.", true);
    });
  }).catch(function () {
    if (loading) loading.hidden = true;
    showNotice("Anmeldung gerade nicht erreichbar", "Die Anmelde-Bibliothek konnte nicht geladen werden. Bitte lade die Seite neu.", true);
    setForms(true);
  });
})();
