(() => {
  const form = document.getElementById("withdrawal-form");
  const review = document.getElementById("withdrawal-review");
  const status = document.getElementById("withdrawal-status");
  const confirm = document.getElementById("withdrawal-confirm");
  const edit = document.getElementById("withdrawal-edit");
  let submission;
  form.querySelector("button[type=submit]").disabled = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submission = { ...Object.fromEntries(new FormData(form)), id: crypto.randomUUID() };
    document.getElementById("withdrawal-summary").textContent =
      "Ich widerrufe den folgenden Vertrag oder Vertragsteil.\n" +
      "Name: " + submission.name + "\nVertrag: " + submission.order + "\nE-Mail: " + submission.email;
    form.hidden = true;
    review.hidden = false;
    status.textContent = "";
    document.getElementById("review-title").focus();
  });

  edit.addEventListener("click", () => {
    review.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

  confirm.addEventListener("click", async () => {
    confirm.disabled = true;
    edit.disabled = true;
    status.textContent = "Ihr Widerruf wird übermittelt …";
    try {
      const response = await fetch(window.BLAZERIDGE_SHOP.withdrawalUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });
      const result = await response.json();
      if (!response.ok || !result.receivedAt) throw new Error(result.message || "Der Eingang konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.");
      review.hidden = true;
      const time = new Date(result.receivedAt).toLocaleString("de-DE", { timeZoneName: "short" });
      status.textContent = "Ihr Widerruf ist eingegangen. Referenz: " + result.id + ". Eingang: " + time + ". " +
        (result.emailPending ? "Die E-Mail-Bestätigung ist noch ausstehend." : "Die Eingangsbestätigung wurde per E-Mail versandt.");
    } catch (error) {
      status.textContent = error.message || "Der Eingang konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.";
      confirm.disabled = false;
      // Keep the same request and reference after an uncertain network result.
    }
  });
})();
