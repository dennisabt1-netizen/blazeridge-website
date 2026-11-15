import { confirmOrder, paidProduct, retrieveSession } from "../_shared/orders.ts";

const BUCKET = "shop-downloads";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "https://blazeridge.de",
      "cache-control": "no-store",
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

  if (req.method !== "GET") return json(405, { message: "Methode nicht unterstützt." });
  let item;
  try {
    const session = await retrieveSession(sessionId);
    if (!session || session.payment_status !== "paid" || session.currency !== "eur") {
      return json(402, { message: "Diese Zahlung ist nicht abgeschlossen." });
    }
    if (session.payment_link === "plink_1Ubs3sJ80ahw41gOTuIcW9vP" && session.amount_total === 39000) {
      return json(200, { message: "Firmenvideo-Pilot: kein Download. Fragen an einkaufnow@outlook.de." });
    }
    item = paidProduct(session);
    if (!item) return json(404, { message: "Zu diesem Kauf gibt es keine Datei." });
    await confirmOrder(session);
  } catch {
    return json(503, { message: "Der Download ist noch nicht verfügbar. Versuchen Sie es erneut oder kontaktieren Sie BlazeRidge." });
  }

  const base = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !serviceKey) return json(503, { message: "Speicher ist noch nicht verbunden." });

  const sign = await fetch(base + "/storage/v1/object/sign/" + BUCKET + "/" + item.name, {
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
