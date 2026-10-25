import type { Coupon } from "@prisma/client";
import { db } from "@/lib/db";

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; error: string };

// Shared by the checkout preview and the order API, so the rules can't drift apart.
export async function checkCoupon(rawCode: string, subtotal: number): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code" };

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon || coupon.deletedAt || !coupon.isActive) return { ok: false, error: "That code isn't valid." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, error: "That code has expired." };
  if (coupon.startsAt && coupon.startsAt > new Date()) return { ok: false, error: "That code isn't active yet." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, error: "That code has already been used." };
  }
  const min = coupon.minimumAmount ? Number(coupon.minimumAmount) : 0;
  if (subtotal < min) {
    return { ok: false, error: `Spend Rs. ${min.toLocaleString("en-PK")} or more to use this code.` };
  }

  let discount = 0;
  if (coupon.type === "FIXED") discount = Number(coupon.value);
  else if (coupon.type === "PERCENTAGE") {
    discount = (subtotal * Number(coupon.value)) / 100;
    if (coupon.maximumDiscount) discount = Math.min(discount, Number(coupon.maximumDiscount));
  } else return { ok: false, error: "That code isn't valid." };

  return { ok: true, coupon, discount: Math.min(Math.round(discount), subtotal) };
}
