"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  subtotal: string;
  shippingCost: string;
  discountAmount: string;
  total: string;
  customerNotes: string | null;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  user: { name: string; email: string } | null;
  shippingAddress: { line1: string; city: string; postalCode: string; phone: string | null; firstName: string; lastName: string };
  items: Array<{ id: string; productName: string; variantName: string; quantity: number; unitPrice: string; totalPrice: string; imageUrl: string | null }>;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  const order: OrderDetail | undefined = data?.order;

  const update = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated");
    },
    onError: () => toast.error("Could not update the order"),
  });

  if (isLoading) return <p className="text-sm text-zinc-500">Loading...</p>;
  if (!order) return <p className="text-sm text-zinc-500">Order not found.</p>;

  const name = order.guestName ?? order.user?.name ?? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
  const phone = order.guestPhone ?? order.shippingAddress.phone;
  const email = order.guestEmail ?? order.user?.email;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-zinc-500 mt-1">{formatDate(order.createdAt)} · Cash on delivery</p>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Order status</label>
          <select
            value={order.status}
            disabled={update.isPending}
            onChange={(e) => update.mutate(e.target.value)}
            className="h-10 px-3 text-sm border border-zinc-300 rounded-lg bg-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 text-sm space-y-1">
          <h2 className="font-semibold text-zinc-900 mb-2">Customer</h2>
          <p>{name}</p>
          {phone && <p><a className="underline" href={`tel:${phone}`}>{phone}</a></p>}
          {email && <p className="text-zinc-500">{email}</p>}
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5 text-sm space-y-1">
          <h2 className="font-semibold text-zinc-900 mb-2">Deliver to</h2>
          <p>{order.shippingAddress.line1}</p>
          <p>{order.shippingAddress.city}{order.shippingAddress.postalCode !== "-" ? `, ${order.shippingAddress.postalCode}` : ""}</p>
          <p>Pakistan</p>
          {order.customerNotes && <p className="text-zinc-500 pt-2">Note: {order.customerNotes}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
              {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">{item.productName}</p>
              {item.variantName !== "Default" && <p className="text-xs text-zinc-500">{item.variantName}</p>}
              <p className="text-xs text-zinc-500">{item.quantity} × {formatPrice(Number(item.unitPrice))}</p>
            </div>
            <p className="text-sm font-medium">{formatPrice(Number(item.totalPrice))}</p>
          </div>
        ))}
        <div className="p-4 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600"><span>Discount code</span><span>-{formatPrice(Number(order.discountAmount))}</span></div>
          )}
          <div className="flex justify-between"><span className="text-zinc-500">Delivery</span><span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</span></div>
          <div className="flex justify-between font-semibold text-base pt-1">
            <span>Collect on delivery</span><span>{formatPrice(Number(order.total))}</span>
          </div>
          <p className="text-xs text-zinc-500">Payment: {order.paymentStatus === "PAID" ? "Paid (delivered)" : "To be collected"}</p>
        </div>
      </div>
    </div>
  );
}
