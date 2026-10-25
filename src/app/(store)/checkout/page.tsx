"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { calcShipping, FREE_SHIPPING_OVER } from "@/lib/shop-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { COUPON_STORAGE_KEY } from "@/components/store/catch-jewels-game";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z.string().trim().min(7, "Please enter a phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().trim().min(5, "Please enter your full address"),
  city: z.string().trim().min(2, "Please enter your city"),
  postalCode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutData>({ resolver: zodResolver(checkoutSchema) });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calcShipping(subtotal);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = subtotal - discount + shipping;

  async function applyCoupon(code = couponInput) {
    if (!code.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCoupon(null);
        setCouponError(data.error ?? "That code didn't work.");
      } else {
        setCoupon({ code: data.code, discount: data.discount });
        setCouponInput(data.code);
      }
    } finally {
      setCheckingCoupon(false);
    }
  }

  // A code won in the game is filled in automatically.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) ?? "null");
      if (saved?.code && new Date(saved.expiresAt) > new Date()) {
        queueMicrotask(() => {
          setCouponInput(saved.code);
          void applyCoupon(saved.code);
        });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check when the cart total changes, since a code may need a minimum spend.
  useEffect(() => {
    if (coupon) queueMicrotask(() => void applyCoupon(coupon.code));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  async function placeOrder(values: CheckoutData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          customer: values,
          couponCode: coupon?.code ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not place your order. Please try again.");
        return;
      }
      clearCart();
      if (coupon) {
        try {
          localStorage.removeItem(COUPON_STORAGE_KEY);
        } catch {}
      }
      router.push(`/order-confirmation?order=${data.orderNumber}&total=${Math.round(data.total)}`);
    } catch {
      toast.error("Could not place your order. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" strokeWidth={1.2} />
          <p className="font-serif text-2xl mb-2">Your cart is empty</p>
          <p className="text-muted-foreground mb-6">Add something sparkly to your cart first.</p>
          <Button asChild>
            <Link href="/collections">Start shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const summary = (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />}
              <span className="absolute -top-0 -right-0 h-5 min-w-5 px-1 rounded-bl-lg bg-foreground text-background text-[10px] flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
              {item.variantName !== "Default" && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
            </div>
            <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <Separator />
      <div>
        <div className="flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Discount code"
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm uppercase focus:outline-none focus:border-foreground"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => applyCoupon()} disabled={checkingCoupon || !couponInput.trim()}>
            Apply
          </Button>
        </div>
        {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
        {coupon && <p className="text-xs text-emerald-600 mt-1.5">Code {coupon.code} applied.</p>}
      </div>
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted-foreground">
            Add {formatPrice(FREE_SHIPPING_OVER - subtotal)} more for free delivery.
          </p>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-medium text-lg">
        <span className="font-serif">Total to pay</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <form onSubmit={handleSubmit(placeOrder)} className="lg:col-span-3 space-y-8">
            <button
              type="button"
              className="lg:hidden w-full flex items-center justify-between p-4 bg-muted rounded-lg"
              onClick={() => setSummaryOpen((v) => !v)}
            >
              <span className="text-sm font-medium">Order summary ({items.length})</span>
              <span className="flex items-center gap-2 font-medium">
                {formatPrice(total)}
                {summaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>
            {summaryOpen && <div className="lg:hidden">{summary}</div>}

            <div>
              <h2 className="font-serif text-xl mb-4">Your details</h2>
              <div className="space-y-4">
                <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
                <Input label="Phone number" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
                <Input label="Email (optional, for order confirmation)" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl mb-4">Delivery address</h2>
              <div className="space-y-4">
                <Input label="Full address" autoComplete="street-address" error={errors.address?.message} {...register("address")} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
                  <Input label="Postal code (optional)" autoComplete="postal-code" {...register("postalCode")} />
                </div>
                <Input label="Order notes (optional)" placeholder="Anything we should know?" {...register("notes")} />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl mb-4">Payment</h2>
              <div className="flex items-start gap-3 rounded-lg border border-foreground bg-foreground/5 p-4">
                <Banknote className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cash on delivery</p>
                  <p className="text-xs text-muted-foreground">Pay {formatPrice(total)} in cash when your order arrives.</p>
                </div>
              </div>
            </div>

            <Button type="submit" size="xl" className="w-full" loading={submitting}>
              Place order · {formatPrice(total)}
            </Button>
          </form>

          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-32 space-y-6">
              <h2 className="font-serif text-xl">Order summary</h2>
              {summary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
