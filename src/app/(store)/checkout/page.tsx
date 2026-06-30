"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronDown, ChevronUp, Gift } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().optional(),
  address: z.string().min(5, "Address required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  postalCode: z.string().min(4, "Postal code required"),
  country: z.string().min(1, "Country required"),
  notes: z.string().optional(),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

const shippingMethods = [
  { id: "standard", name: "Standard Shipping", description: "5-7 business days", price: 12 },
  { id: "express", name: "Express Shipping", description: "2-3 business days", price: 25 },
  { id: "overnight", name: "Overnight Shipping", description: "Next business day", price: 45 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, couponCode, couponDiscount, giftWrap, clearCart } = useCartStore();
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);
  const [couponInput, setCouponInput] = useState("");
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [step, setStep] = useState<"info" | "payment">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "US" },
  });

  const shippingCost = subtotal >= 150 ? 0 : selectedShipping.price;
  const giftWrapCost = giftWrap ? 6 : 0;
  const taxAmount = (subtotal - couponDiscount) * 0.08;
  const total = subtotal - couponDiscount + shippingCost + giftWrapCost + taxAmount;

  async function onSubmitInfo(data: CheckoutData) {
    setStep("payment");
  }

  async function placeOrder() {
    setIsSubmitting(true);
    try {
      const values = getValues();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: values,
          shippingMethod: selectedShipping.id,
          couponCode,
          giftWrap,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      const { orderNumber } = await res.json();
      clearCart();
      router.push(`/order-confirmation?order=${orderNumber}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="font-serif text-2xl mb-2">Your bag is empty</p>
          <p className="text-muted-foreground mb-6">Add some jewelry to your bag first.</p>
          <Button asChild>
            <Link href="/collections">Shop Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="font-serif text-xl tracking-[0.25em] uppercase font-light">
            Zohraé
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Secure Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left — Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Mobile order summary toggle */}
            <button
              className="lg:hidden w-full flex items-center justify-between p-4 bg-muted"
              onClick={() => setOrderSummaryOpen((v) => !v)}
            >
              <span className="text-sm font-medium">Order Summary ({items.length} items)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatPrice(total)}</span>
                {orderSummaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Steps */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("info")}
                className={`text-sm ${step === "info" ? "font-medium" : "text-muted-foreground"}`}
              >
                1. Shipping
              </button>
              <div className="h-px flex-1 bg-border" />
              <span className={`text-sm ${step === "payment" ? "font-medium" : "text-muted-foreground"}`}>
                2. Payment
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === "info" ? (
                <motion.form
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit(onSubmitInfo)}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-serif text-xl mb-4">Contact Information</h2>
                    <Input
                      label="Email Address"
                      type="email"
                      error={errors.email?.message}
                      {...register("email")}
                    />
                  </div>

                  <div>
                    <h2 className="font-serif text-xl mb-4">Shipping Address</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          error={errors.firstName?.message}
                          {...register("firstName")}
                        />
                        <Input
                          label="Last Name"
                          error={errors.lastName?.message}
                          {...register("lastName")}
                        />
                      </div>
                      <Input
                        label="Phone (optional)"
                        type="tel"
                        {...register("phone")}
                      />
                      <Input
                        label="Address"
                        error={errors.address?.message}
                        {...register("address")}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="City"
                          error={errors.city?.message}
                          {...register("city")}
                        />
                        <Input
                          label="State"
                          error={errors.state?.message}
                          {...register("state")}
                        />
                        <Input
                          label="Postal Code"
                          error={errors.postalCode?.message}
                          {...register("postalCode")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                          Country
                        </label>
                        <select
                          {...register("country")}
                          className="w-full h-11 border border-input px-4 text-sm focus:outline-none focus:border-foreground transition-colors"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Shipping methods */}
                  <div>
                    <h2 className="font-serif text-xl mb-4">Shipping Method</h2>
                    <div className="space-y-2">
                      {shippingMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                            selectedShipping.id === method.id
                              ? "border-foreground bg-foreground/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              checked={selectedShipping.id === method.id}
                              onChange={() => setSelectedShipping(method)}
                              className="accent-foreground"
                            />
                            <div>
                              <p className="text-sm font-medium">{method.name}</p>
                              <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            {subtotal >= 150 && method.id === "standard" ? "FREE" : formatPrice(method.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Order Notes (optional)"
                    {...register("notes")}
                    placeholder="Any special instructions?"
                  />

                  <Button type="submit" size="xl" className="w-full">
                    Continue to Payment
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-serif text-xl">Payment</h2>

                  <div className="border border-border p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Lock className="h-4 w-4" />
                      <span>Your payment is encrypted and secure</span>
                    </div>

                    {/* Simulated Stripe elements */}
                    <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Expiry" placeholder="MM / YY" />
                      <Input label="CVC" placeholder="123" />
                    </div>
                    <Input label="Name on Card" placeholder="Full name as on card" />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={placeOrder}
                      size="lg"
                      className="flex-2 w-full"
                      loading={isSubmitting}
                    >
                      Place Order · {formatPrice(total)}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2">
            <div className={`lg:block ${orderSummaryOpen ? "block" : "hidden"} space-y-6 sticky top-28`}>
              <h2 className="font-serif text-xl hidden lg:block">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-muted">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted-foreground text-background text-[10px] flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Discount code"
                  className="flex-1 border border-input px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
                <button className="px-4 py-2 border border-border text-sm hover:bg-muted transition-colors">
                  Apply
                </button>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" /> Gift wrapping
                    </span>
                    <span>{formatPrice(6)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-lg">
                <span className="font-serif">Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
