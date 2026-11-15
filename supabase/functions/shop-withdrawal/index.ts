import { contact, database, digest, loadReceipt, origin, reply, sendReceipt } from "../_shared/receipts.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return reply(200, {});
  if (request.method !== "POST" || request.headers.get("Origin") !== origin) return reply(403, {});
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415, {});
  const raw = await request.text();
  if (raw.length > 4000) return reply(413, {});
  let fields: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reply(400, {});
    fields = parsed;
  } catch {
    return reply(400, {});
  }
  const { id, name, email, order } = fields;
  if (typeof id !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(id) ||
      typeof name !== "string" || !name.trim() || name.length > 120 ||
      typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof order !== "string" || !order.trim() || order.length > 750) {
    return reply(400, { message: "Bitte prüfen Sie Name, E-Mail und Vertragsangaben." });
  }
  const secret = Deno.env.get("SHOP_WITHDRAWAL_HASH_KEY");
  if (!secret) return reply(503, { message: "Der Dienst ist derzeit nicht verfügbar." });
  const key = "withdrawal/" + id;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    const saved = await database("rpc/register_shop_withdrawal", {
      method: "POST",
      body: JSON.stringify({
        receipt_key: key,
        sender_hash: await digest(secret + ":" + ip),
        receipt: {
          to: email.trim(),
          bcc: contact,
          subject: "BlazeRidge – Eingang Ihres Widerrufs",
          text: `Ich widerrufe den folgenden Vertrag oder Vertragsteil.\nName: ${name.trim()}\nVertrag: ${order.trim()}`,
        },
      }),
    });
    if (!await saved.json()) return reply(429, { message: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." });
    const receipt = await loadReceipt(key);
    if (!receipt || receipt.payload.to !== email.trim()) return reply(409, {});
    try {
      await sendReceipt(receipt);
    } catch {
      return reply(202, { id, receivedAt: receipt.created_at, emailPending: true });
    }
    return reply(200, { id, receivedAt: receipt.created_at });
  } catch {
    return reply(503, { message: "Wir konnten den Eingang nicht bestätigen. Bitte versuchen Sie es erneut." });
  }
});
