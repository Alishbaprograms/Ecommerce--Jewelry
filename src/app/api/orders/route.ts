import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { headers } from "next/headers";

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string(),
    quantity: z.number().int().positive(),
    name: z.string(),
    variantName: z.string(),
    price: z.number(),
    sku: z.string(),
    image: z.string().optional(),
    engravingText: z.string().optional(),
  })),
  shipping: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    notes: z.string().optional(),
  }),
  shippingMethod: z.string(),
  couponCode: z.string().optional().nullable(),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    const shippingCosts: Record<string, number> = {
      standard: 12,
      express: 25,
      overnight: 45,
    };

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 150 ? 0 : (shippingCosts[data.shippingMethod] ?? 12);
    const giftWrapCost = data.giftWrap ? 6 : 0;
    const taxAmount = subtotal * 0.08;
    const total = subtotal + shippingCost + giftWrapCost + taxAmount;

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        firstName: data.shipping.firstName,
        lastName: data.shipping.lastName,
        phone: data.shipping.phone,
        line1: data.shipping.address,
        city: data.shipping.city,
        state: data.shipping.state,
        postalCode: data.shipping.postalCode,
        country: data.shipping.country,
      },
    });

    const orderNumber = generateOrderNumber();

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        shippingAddressId: address.id,
        subtotal,
        shippingCost,
        taxAmount,
        total,
        giftWrap: data.giftWrap,
        giftMessage: data.giftMessage,
        customerNotes: data.shipping.notes,
        shippingProvider: data.shippingMethod,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            variantName: item.variantName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            engravingText: item.engravingText,
            imageUrl: item.image,
          })),
        },
        statusHistory: {
          create: { status: "PENDING" },
        },
      },
    });

    // Deduct stock
    await Promise.all(
      data.items.map((item) =>
        db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Send confirmation email
    try {
      await sendOrderConfirmation(data.shipping.email, {
        orderNumber,
        customerName: `${data.shipping.firstName} ${data.shipping.lastName}`,
        total: `Rs. ${Math.round(total).toLocaleString("en-PK")}`,
        items: data.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: `Rs. ${Math.round(i.price * i.quantity).toLocaleString("en-PK")}`,
        })),
      });
    } catch {
      // Email failure should not block order creation
    }

    return NextResponse.json({ orderNumber, orderId: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
