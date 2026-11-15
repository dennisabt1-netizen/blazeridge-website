export const origin = "https://blazeridge.de";
export const contact = "einkaufnow@outlook.de";
type Mail = { to: string; subject: string; text: string; bcc?: string };
export type Receipt = { key: string; created_at: string; sent_at: string | null; payload: Mail };

export function reply(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

export async function database(path: string, options: RequestInit = {}) {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  if (!key || !url) throw new Error("database unavailable");
  const headers = new Headers(options.headers);
  headers.set("Authorization", "Bearer " + key);
  headers.set("apikey", key);
  headers.set("content-type", "application/json");
  const response = await fetch(url + "/rest/v1/" + path, { ...options, headers });
  if (!response.ok) throw new Error("database operation failed");
  return response;
}

export async function loadReceipt(key: string): Promise<Receipt | undefined> {
  const response = await database("shop_confirmations?key=eq." + encodeURIComponent(key));
  const [receipt] = await response.json() as Receipt[];
  return receipt;
}

export async function registerReceipt(key: string, payload: Mail) {
  await database("shop_confirmations?on_conflict=key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({ key, payload }),
  });
  const receipt = await loadReceipt(key);
  if (!receipt) throw new Error("receipt unavailable");
  return receipt;
}

export async function sendReceipt(receipt: Receipt) {
  const text = receipt.key.startsWith("withdrawal/")
    ? `Ihr Widerruf ist bei BlazeRidge eingegangen.\nReferenz: ${receipt.key.slice("withdrawal/".length)}\nEingang (UTC): ${receipt.created_at}\n\nIhre Erklärung:\n${receipt.payload.text}`
    : receipt.payload.text;
  if (receipt.sent_at) return;
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("SHOP_MAIL_FROM");
  if (!apiKey || !from) throw new Error("transactional email unavailable");
  const { to, subject, bcc } = receipt.payload;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "content-type": "application/json",
      "Idempotency-Key": receipt.key,
    },
    body: JSON.stringify({ from, to: [to], subject, text, reply_to: contact, ...(bcc ? { bcc: [bcc] } : {}) }),
  });
  if (!response.ok) throw new Error("email not accepted");
  await database("shop_confirmations?key=eq." + encodeURIComponent(receipt.key), {
    method: "PATCH",
    body: JSON.stringify({ sent_at: new Date().toISOString() }),
  });
}

export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
