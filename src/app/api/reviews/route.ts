import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { KID_AGES, REVIEW_TAGS } from "@/lib/review-config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  name: z.string().trim().min(2, "Please tell us your name").max(40),
  city: z.string().trim().max(40).optional(),
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().max(600).optional(),
  kidAge: z.enum(KID_AGES).optional(),
  tags: z.array(z.enum(REVIEW_TAGS)).max(6).default([]),
  orderNumber: z.string().trim().max(40).optional(),
  images: z.array(z.string().url()).max(2).default([]),
  website: z.string().optional(), // honeypot: real people never fill this in
});

// Guest reviews: no login. New reviews wait for approval in admin before they show on the product page.
export async function POST(request: NextRequest) {
  try {
    const data = schema.parse(await request.json());
    if (data.website) return NextResponse.json({ ok: true }); // pretend success to bots

    if (!rateLimit(`review:${clientIp(request.headers)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "You've sent a few reviews already. Please try again later." }, { status: 429 });
    }

    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    if (data.images.some((u) => !cloud || !u.startsWith(`https://res.cloudinary.com/${cloud}/`))) {
      return NextResponse.json({ error: "That photo can't be used." }, { status: 400 });
    }

    const product = await db.product.findFirst({ where: { id: data.productId, status: "ACTIVE", deletedAt: null }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // A matching, uncancelled order for this product earns the "Verified buyer" badge.
    let verified = false;
    if (data.orderNumber) {
      const order = await db.order.findFirst({
        where: {
          orderNumber: data.orderNumber.toUpperCase(),
          deletedAt: null,
          status: { not: "CANCELLED" },
          items: { some: { productId: product.id } },
        },
        select: { id: true },
      });
      verified = Boolean(order);
    }

    await db.review.create({
      data: {
        productId: product.id,
        rating: data.rating,
        guestName: data.name,
        guestCity: data.city || null,
        title: data.title || null,
        body: data.body || null,
        kidAge: data.kidAge ?? null,
        tags: data.tags,
        images: data.images,
        verified,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, verified });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Please check your review" }, { status: 400 });
    }
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Couldn't save your review. Please try again." }, { status: 500 });
  }
}
