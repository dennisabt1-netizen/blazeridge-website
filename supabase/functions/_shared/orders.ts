import { contractText } from "./contract-text.ts";
import { digest, origin, registerReceipt, sendReceipt } from "./receipts.ts";

export const products: Record<string, { label: string; name: string; amount: number; details: string }> = {
  plink_1Ubs3oJ80ahw41gOkrK4Aab9: {
    label: "BlazeRidge Starter", name: "starter.zip", amount: 700,
    details: "Vorlagen für Wissensclips und ein Szenenplan.",
  },
  plink_1Ubs3pJ80ahw41gOYGybJRUC: {
    label: "BlazeRidge Producer", name: "producer.zip", amount: 1900,
    details: "Starter-Inhalte, Vorlagen für KI-Erklärvideos und Produktionsboard.",
  },
  plink_1Ubs3qJ80ahw41gOkjdxV43Z: {
    label: "BlazeRidge Studio", name: "studio.zip", amount: 3900,
    details: "Producer-Inhalte, 2D-Serienbibel, erste Folge und Storyboard.",
  },
  plink_1Ubs3rJ80ahw41gO8631kIIh: {
    label: "BlazeRidge Video-Briefing-Set", name: "video-briefing-set.zip", amount: 1200,
    details: "Markdown-Dateien: Briefing-Vorlagen für Software, Produkte und Dienstleistungen, Abnahmecheckliste und Beispiel.",
  },
};

export type StripeSession = {
  id: string;
  created: number;
  livemode: boolean;
  payment_link: string | null;
  payment_status: string;
  currency: string;
  amount_total: number;
  customer_details?: { email?: string };
  consent?: { terms_of_service?: string };
};

export function paidProduct(session: StripeSession) {
  const testLink = session.livemode ? undefined : Deno.env.get("STRIPE_TEST_STARTER_LINK");
  const link = testLink && session.payment_link === testLink ? Object.keys(products)[0] : session.payment_link;
  const product = link ? products[link] : undefined;
  return product && session.payment_status === "paid" && session.currency === "eur" &&
    session.amount_total === product.amount ? product : undefined;
}

export async function confirmOrder(session: StripeSession) {
  const product = paidProduct(session);
  if (!product) return;
  const startsAt = Date.parse(Deno.env.get("SHOP_CONFIRM_FROM") || "") / 1000;
  if (!Number.isFinite(startsAt)) throw new Error("missing rollout date");
  if (session.created < startsAt) return; // Preserve download access for previous purchases.
  const email = session.customer_details?.email;
  if (!email || session.consent?.terms_of_service !== "accepted") {
    throw new Error("missing buyer email or consent");
  }
  const reference = (await digest(session.id)).slice(0, 16).toUpperCase();
  const price = (product.amount / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  const download = origin + "/danke.html?session_id=" + encodeURIComponent(session.id);
  const text = [
    "BlazeRidge – Bestell- und Vertragsbestätigung",
    "Bestellreferenz: " + reference,
    product.label + " – " + price + " (Endpreis, keine Versandkosten).",
    product.details,
    "Bereitstellung als ZIP nach Zahlung und Vertragsbestätigung. Zum Öffnen ist ein ZIP-Programm erforderlich.",
    "Gewählte Zahlungsabwicklung: Stripe. Zugang zum Download: " + download,
    "Sie haben vor der Ausführung ausdrücklich zugestimmt, dass BlazeRidge mit der Bereitstellung vor Ablauf der Widerrufsfrist beginnt, und bestätigt, dass Sie dadurch mit Beginn der Bereitstellung Ihr Widerrufsrecht verlieren.",
    "Elektronischer Widerruf: " + origin + "/widerruf.html",
    contractText,
  ].join("\n\n");
  const receipt = await registerReceipt("order/" + reference, { to: email, subject: "BlazeRidge – Ihre Vertragsbestätigung", text });
  await sendReceipt(receipt);
}

export async function retrieveSession(id: string): Promise<StripeSession | undefined> {
  const test = id.startsWith("cs_test_");
  const secret = Deno.env.get(test ? "STRIPE_TEST_SECRET_KEY" : "STRIPE_SECRET_KEY");
  if (!secret) throw new Error("stripe unavailable");
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(id), {
    headers: { Authorization: "Bearer " + secret },
  });
  if (response.status === 404) return;
  if (!response.ok) throw new Error("stripe request failed");
  const session = await response.json() as StripeSession;
  if (session.id !== id || session.livemode === test) return;
  return session;
}
