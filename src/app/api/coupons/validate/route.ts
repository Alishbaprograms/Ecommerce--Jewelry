import { NextRequest, NextResponse } from "next/server";
import { checkCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const subtotal = Number(body.subtotal);
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }
  const result = await checkCoupon(String(body.code ?? ""), subtotal);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ code: result.coupon.code, discount: result.discount });
}
