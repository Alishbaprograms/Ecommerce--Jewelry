"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", value: "", minOrderAmount: "", usageLimit: "", expiresAt: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) return { coupons: [] };
      return res.json();
    },
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setShowForm(false);
      setForm({ code: "", type: "PERCENTAGE", value: "", minOrderAmount: "", usageLimit: "", expiresAt: "" });
      toast.success("Coupon created");
    },
    onError: () => toast.error("Failed to create coupon"),
  });

  const toggleCoupon = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon deleted"); },
  });

  const inputCls = "w-full border border-input px-3 py-2 text-sm focus:outline-none focus:border-foreground bg-background";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">Marketing</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage coupons and discount codes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />New Coupon
        </Button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">Create Coupon</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { k: "code", label: "Code", placeholder: "ZOHRAE20" },
              { k: "value", label: "Value", placeholder: "20", type: "number" },
              { k: "minOrderAmount", label: "Min Order (PKR)", placeholder: "0", type: "number" },
              { k: "usageLimit", label: "Usage Limit", placeholder: "Unlimited", type: "number" },
              { k: "expiresAt", label: "Expires At", type: "date" },
            ].map(({ k, label, placeholder, type = "text" }) => (
              <div key={k}>
                <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-1">{label}</label>
                <input
                  type={type}
                  value={form[k as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (PKR)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => createCoupon.mutate()} disabled={createCoupon.isPending}>
              {createCoupon.isPending ? "Creating..." : "Create Coupon"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              {["Code", "Discount", "Min Order", "Usage", "Expires", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : data?.coupons?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No coupons yet
                </td>
              </tr>
            ) : data?.coupons?.map((c: Coupon) => (
              <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{c.code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied!"); }} className="text-muted-foreground hover:text-foreground">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">{c.type === "PERCENTAGE" ? `${c.value}%` : `Rs. ${Number(c.value).toLocaleString()}`}</td>
                <td className="px-4 py-3">{c.minOrderAmount ? `Rs. ${Number(c.minOrderAmount).toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="px-4 py-3">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleCoupon.mutate({ id: c.id, isActive: !c.isActive })}>
                    <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteCoupon.mutate(c.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
