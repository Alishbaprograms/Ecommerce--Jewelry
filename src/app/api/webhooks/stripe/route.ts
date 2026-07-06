import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderNumber = pi.metadata?.orderNumber;
      if (!orderNumber) break;

      await db.order.updateMany({
        where: { orderNumber },
        data: {
          paymentStatus: "PAID",
          paymentIntentId: pi.id,
          status: "CONFIRMED",
        },
      });

      const order = await db.order.findFirst({ where: { orderNumber } });
      if (order) {
        await db.orderStatusHistory.create({
          data: { orderId: order.id, status: "CONFIRMED", note: "Payment confirmed via Stripe" },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderNumber = pi.metadata?.orderNumber;
      if (!orderNumber) break;

      await db.order.updateMany({
        where: { orderNumber },
        data: { paymentStatus: "FAILED" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi = charge.payment_intent as string;
      if (!pi) break;

      await db.order.updateMany({
        where: { paymentIntentId: pi },
        data: { paymentStatus: "REFUNDED", status: "CANCELLED" },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
