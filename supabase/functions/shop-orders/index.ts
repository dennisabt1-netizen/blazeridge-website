import { confirmOrder, retrieveSession } from "../_shared/orders.ts";
import { reply } from "../_shared/receipts.ts";

const encoder = new TextEncoder();

async function verifies(body: string, header: string, secret: string) {
  const fields = header.split(",").map((part) => part.trim());
  const timestamp = fields.find((part) => part.startsWith("t="))?.slice(2);
  if (!timestamp || !/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  for (const signature of fields.filter((part) => /^v1=[a-f\d]{64}$/i.test(part))) {
    const bytes = Uint8Array.from(signature.slice(3).match(/.{2}/g)!, (byte) => parseInt(byte, 16));
    if (await crypto.subtle.verify("HMAC", key, bytes, encoder.encode(timestamp + "." + body))) return true;
  }
  return false;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405, {});
  const header = request.headers.get("Stripe-Signature");
  const secrets = [Deno.env.get("STRIPE_SHOP_WEBHOOK_SECRET"), Deno.env.get("STRIPE_TEST_SHOP_WEBHOOK_SECRET")].filter(Boolean);
  if (!header || !secrets.length) return reply(400, {});
  const body = await request.text();
  if (body.length > 256_000) return reply(413, {});
  try {
    const valid = await Promise.all(secrets.map((secret) => verifies(body, header, secret!)));
    if (!valid.some(Boolean)) return reply(400, {});
    const event = JSON.parse(body);
    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) return reply(200, {});
    const id = event.data?.object?.id;
    if (typeof id !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return reply(400, {});
    const session = await retrieveSession(id);
    if (!session) return reply(503, {});
    await confirmOrder(session);
    return reply(200, {});
  } catch {
    return reply(503, {});
  }
});
