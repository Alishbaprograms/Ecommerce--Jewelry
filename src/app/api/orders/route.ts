import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { calcShipping } from "@/lib/shop-config";
import { checkCoupon } from "@/lib/coupons";
import { sendOrderConfirmation } from "@/lib/email";

const orderSchema = z.object({
  items: z
    .array(z.object({ variantId: z.string(), quantity: z.number().int().positive().max(50) }))
    .min(1, "Your cart is empty"),
  couponCode: z.string().trim().optional().nullable(),
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your name"),
    phone: z.string().trim().min(7, "Please enter a phone number we can reach you on"),
    email: z.string().trim().email().optional().or(z.literal("")),
    address: z.string().trim().min(5, "Please enter your full address"),
    city: z.string().trim().min(2, "Please enter your city"),
    postalCode: z.string().trim().optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

class OrderError extends Error {}

// Guest checkout: no account needed. Prices and stock always come from the database, never from the browser.
export async function POST(request: NextRequest) {
  try {
    const data = orderSchema.parse(await request.json());

    // If the shopper happens to be signed in, link the order to their account. Otherwise it's a guest order.
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

    const variants = await db.productVariant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) }, isActive: true, deletedAt: null },
      include: {
        product: {
          select: { id: true, name: true, status: true, deletedAt: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    });

    const lines = data.items.map((item) => {
      const v = variants.find((x) => x.id === item.variantId);
      if (!v || v.product.status !== "ACTIVE" || v.product.deletedAt) {
        throw new OrderError("An item in your cart is no longer available. Please remove it and try again.");
      }
      if (v.stock < item.quantity) {
        throw new OrderError(`Sorry, only ${v.stock} of "${v.product.name}" left in stock.`);
      }
      const unitPrice = Number(v.price);
      return { v, quantity: item.quantity, unitPrice };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const shippingCost = calcShipping(subtotal);

    let coupon: { id: string; usageLimit: number | null } | null = null;
    let discountAmount = 0;
    if (data.couponCode) {
      const check = await checkCoupon(data.couponCode, subtotal);
      if (!check.ok) throw new OrderError(check.error);
      coupon = { id: check.coupon.id, usageLimit: check.coupon.usageLimit };
      discountAmount = check.discount;
    }
    const total = subtotal - discountAmount + shippingCost;
    const orderNumber = generateOrderNumber();
    const c = data.customer;
    const [firstName, ...rest] = c.name.split(/\s+/);

    const order = await db.$transaction(async (tx) => {
      // Reserve stock first; the conditional update stops two shoppers buying the last item.
      for (const l of lines) {
        const res = await tx.productVariant.updateMany({
          where: { id: l.v.id, stock: { gte: l.quantity } },
          data: { stock: { decrement: l.quantity } },
        });
        if (res.count === 0) throw new OrderError(`Sorry, "${l.v.product.name}" just sold out.`);
      }

      // Claim the coupon atomically so a one-time code can't be used by two orders at once.
      if (coupon) {
        const claimed = await tx.coupon.updateMany({
          where: coupon.usageLimit != null ? { id: coupon.id, usageCount: { lt: coupon.usageLimit } } : { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
        if (claimed.count === 0) throw new OrderError("That code has already been used.");
      }

      const address = await tx.address.create({
        data: {
          userId: session?.user.id ?? null,
          firstName,
          lastName: rest.join(" ") || "-",
          phone: c.phone,
          line1: c.address,
          city: c.city,
          state: c.city,
          postalCode: c.postalCode || "-",
          country: "Pakistan",
        },
      });

      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.user.id ?? null,
          guestName: c.name,
          guestPhone: c.phone,
          guestEmail: c.email || null,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: "COD",
          currency: "PKR",
          shippingAddressId: address.id,
          subtotal,
          shippingCost,
          discountAmount,
          couponId: coupon?.id ?? null,
          taxAmount: 0,
          total,
          customerNotes: c.notes || null,
          items: {
            create: lines.map((l) => ({
              productId: l.v.product.id,
              variantId: l.v.id,
              productName: l.v.product.name,
              variantName: l.v.name,
              sku: l.v.sku,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              totalPrice: l.unitPrice * l.quantity,
              imageUrl: l.v.product.images[0]?.url ?? null,
            })),
          },
          statusHistory: { create: { status: "PENDING" } },
        },
      });
    });

    if (c.email) {
      try {
        await sendOrderConfirmation(c.email, {
          orderNumber,
          customerName: c.name,
          total: `Rs. ${Math.round(total).toLocaleString("en-PK")}`,
          items: lines.map((l) => ({
            name: l.v.product.name,
            quantity: l.quantity,
            price: `Rs. ${Math.round(l.unitPrice * l.quantity).toLocaleString("en-PK")}`,
          })),
        });
      } catch {
        // An email problem must never block an order that is already saved.
      }
    }

    return NextResponse.json({ orderNumber, orderId: order.id, total }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Please check your details" }, { status: 400 });
    }
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "Something went wrong placing your order. Please try again." }, { status: 500 });
  }
}
