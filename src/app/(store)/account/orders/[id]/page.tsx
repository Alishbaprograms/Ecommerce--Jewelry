"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  PROCESSING: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, "warning" | "secondary" | "success" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await fetch(`/api/account/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const order = data?.order;

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl mb-2">Order not found</p>
          <Button asChild className="mt-4"><Link href="/account">Back to Account</Link></Button>
        </div>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-light">{order.orderNumber}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Placed {formatDate(order.createdAt)}</p>
          </div>
          <Badge variant={STATUS_COLORS[order.status] ?? "secondary"}>{order.status}</Badge>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="border border-border p-6 mb-6">
            <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Order Progress</h2>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                      i <= stepIndex ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    }`}>
                      {STATUS_ICONS[step]}
                    </div>
                    <p className={`text-[10px] tracking-wide uppercase mt-2 text-center ${
                      i <= stepIndex ? "text-foreground" : "text-muted-foreground"
                    }`}>{step}</p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-px flex-1 -mt-5 ${i < stepIndex ? "bg-foreground" : "bg-border"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="border border-border p-6 mb-6">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item: {
              id: string;
              productName: string;
              variantName: string;
              quantity: number;
              unitPrice: string;
              totalPrice: string;
              imageUrl?: string;
              engravingText?: string;
            }) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-20 w-20 bg-muted shrink-0 relative overflow-hidden">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">{item.variantName}</p>
                  {item.engravingText && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">Engraving: "{item.engravingText}"</p>
                  )}
                  <p className="text-sm mt-1">
                    {formatPrice(Number(item.unitPrice))} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium shrink-0">{formatPrice(Number(item.totalPrice))}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Shipping */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="border border-border p-6">
            <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>−{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="border border-border p-6">
              <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Shipping Address</h2>
              <address className="text-sm not-italic text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </address>
            </div>
          )}
        </div>

        {/* Status history */}
        {order.statusHistory?.length > 0 && (
          <div className="border border-border p-6">
            <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory.map((h: { id: string; status: string; note?: string; createdAt: string }) => (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-foreground mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium">{h.status}</span>
                    {h.note && <span className="text-muted-foreground"> — {h.note}</span>}
                    <p className="text-xs text-muted-foreground">{formatDate(h.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
