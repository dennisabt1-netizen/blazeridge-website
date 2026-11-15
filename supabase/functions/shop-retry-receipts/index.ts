import { database, digest, reply, sendReceipt, type Receipt } from "../_shared/receipts.ts";

Deno.serve(async (request) => {
  const secret = Deno.env.get("SHOP_RETRY_TOKEN");
  const token = request.headers.get("Authorization");
  if (request.method !== "POST" || !secret || !token ||
    await digest(token) !== await digest("Bearer " + secret)) return reply(403, {});
  try {
    const response = await database(
      "shop_confirmations?sent_at=is.null&created_at=gte." +
        encodeURIComponent(new Date(Date.now() - 23 * 3600_000).toISOString()) + "&order=created_at.asc&limit=30",
    );
    const receipts = await response.json() as Receipt[];
    const results = await Promise.allSettled(receipts.map((receipt) => sendReceipt(receipt)));
    return reply(200, { processed: results.length, failed: results.filter((result) => result.status === "rejected").length });
  } catch {
    return reply(503, {});
  }
});
