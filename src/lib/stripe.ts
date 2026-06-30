import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});

export async function createPaymentIntent(
  amount: number,
  currency = "pkr",
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  });
}
