// Deploy with: supabase functions deploy deliver --project-ref ubykffpdqvlhuijofmcu
// Secret (do not commit): supabase secrets set STRIPE_SECRET_KEY=sk_live_...
// The key only needs Checkout Session read access. Never put it in the website.

// Mapping by Stripe Payment Link id; the amount must match as a second check.
type Item = { name: string; path: string; amount: number } | { service: true; amount: number };
const FILES: Record<string, Item> = {
  plink_1Ubs3oJ80ahw41gOkrK4Aab9: { name: "starter.zip", path: "starter.zip", amount: 700 },
  plink_1Ubs3pJ80ahw41gOYGybJRUC: { name: "producer.zip", path: "producer.zip", amount: 1900 },
  plink_1Ubs3qJ80ahw41gOkjdxV43Z: { name: "studio.zip", path: "studio.zip", amount: 3900 },
  plink_1Ubs3rJ80ahw41gO8631kIIh: { name: "video-briefing-set.zip", path: "video-briefing-set.zip", amount: 1200 },
  // Firmenvideo-Pilot (390 €): Dienstleistung, niemals eine Datei.
  plink_1Ubs3sJ80ahw41gOTuIcW9vP: { service: true, amount: 39000 },
};

const BUCKET = "shop-downloads";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "https://blazeridge.de",
      "access-control-allow-headers": "authorization, apikey, content-type",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "https://blazeridge.de", "access-control-allow-headers": "authorization, apikey, content-type" } });
  const sessionId = new URL(req.url).searchParams.get("session_id") || "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json(400, { message: "Die Sitzungsnummer fehlt oder ist ungültig." });
  }

  const secret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secret) return json(503, { message: "Lieferung ist noch nicht eingerichtet." });

  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions/" + sessionId, {
    headers: { Authorization: "Bearer " + secret },
  });
  if (!stripe.ok) return json(402, { message: "Stripe erkennt diese Zahlung nicht." });
  const session = await stripe.json();
  if (session.payment_status !== "paid" || session.currency !== "eur") {
    return json(402, { message: "Diese Zahlung ist nicht abgeschlossen." });
  }

  const item = typeof session.payment_link === "string" ? FILES[session.payment_link] : undefined;
  if (!item) return json(404, { message: "Zu diesem Kauf gibt es keine Datei." });
  if ("service" in item) {
    return json(200, { message: "Firmenvideo-Pilot: kein Download. Wir melden uns per E-Mail." });
  }
  if (session.amount_total !== item.amount) {
    return json(402, { message: "Der bezahlte Betrag passt nicht zum Produkt." });
  }

  const base = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !serviceKey) return json(503, { message: "Speicher ist noch nicht verbunden." });

  const sign = await fetch(base + "/storage/v1/object/sign/" + BUCKET + "/" + item.path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + serviceKey,
      apikey: serviceKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 300 }),
  });
  if (!sign.ok) {
    return json(404, { message: "Die Datei " + item.name + " liegt noch nicht im privaten Speicher." });
  }
  const signed = await sign.json();
  const path = String(signed.signedURL || signed.signedUrl || "");
  if (!path) return json(404, { message: "Die Datei " + item.name + " konnte nicht freigegeben werden." });
  const url = path.startsWith("http") ? path : base + "/storage/v1" + path;
  return json(200, { url, name: item.name });
});
