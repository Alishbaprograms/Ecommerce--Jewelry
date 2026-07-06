import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !["SUPER_ADMIN", "SHOP_ADMIN"].includes((session.user as { role?: string }).role ?? "")) return null;
  return session;
}

const couponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minOrderAmount: z.number().nullable().optional(),
  usageLimit: z.number().int().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coupons: JSON.parse(JSON.stringify(coupons, (_, v) =>
    typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
  )) });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = couponSchema.parse(body);

  const coupon = await db.coupon.create({
    data: {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
