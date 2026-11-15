// Deploy with: supabase functions deploy deliver --project-ref ubykffpdqvlhuijofmcu
// Secret (do not commit): supabase secrets set STRIPE_SECRET_KEY=sk_live_...
// The key only needs Checkout Session read access. Never put it in the website.

const FILES: Record<number, { name: string; path: string } | { service: true }> = {
  700: { name: "starter.zip", path: "starter.zip" },
  1900: { name: "producer.zip", path: "producer.zip" },
  3900: { name: "studio.zip", path: "studio.zip" },
  1200: { name: "video-briefing-set.zip", path: "video-briefing-set.zip" },
  39000: { service: true },
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
  if (req.method === "OPTIONS") return json(204, {});
  const secret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secret) return json(503, { message: "Lieferung ist noch nicht eingerichtet." });

  const sessionId = new URL(req.url).searchParams.get("session_id") || "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json(400, { message: "Die Sitzungsnummer fehlt oder ist ungültig." });
  }

  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions/" + sessionId, {
    headers: { Authorization: "Bearer " + secret },
  });
  if (!stripe.ok) return json(402, { message: "Stripe erkennt diese Zahlung nicht." });
  const session = await stripe.json();
  if (session.payment_status !== "paid" || session.currency !== "eur") {
    return json(402, { message: "Diese Zahlung ist nicht abgeschlossen." });
  }

  const item = FILES[session.amount_total as number];
  if (!item) return json(404, { message: "Zu diesem Betrag gibt es keine Datei." });
  if ("service" in item) {
    return json(200, { message: "Firmenvideo-Pilot: kein Download. Wir melden uns per E-Mail." });
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
