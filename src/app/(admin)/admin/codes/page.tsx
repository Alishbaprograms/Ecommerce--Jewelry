"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Code {
  id: string;
  code: string;
  description: string | null;
  value: string;
  minimumAmount: string | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
  orders: Array<{ id: string; orderNumber: string }>;
}

function status(c: Code) {
  if (c.usageLimit != null && c.usageCount >= c.usageLimit) return { label: "Used", variant: "secondary" as const };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { label: "Expired", variant: "outline" as const };
  return { label: "Active", variant: "success" as const };
}

export default function AdminCodesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-codes"],
    queryFn: async () => (await fetch("/api/admin/coupons")).json(),
  });
  const codes: Code[] = data?.coupons ?? [];
  const counts = {
    active: codes.filter((c) => status(c).label === "Active").length,
    used: codes.filter((c) => status(c).label === "Used").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Discount codes</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Codes won in the Catch the Jewels game. {counts.active} active, {counts.used} used.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left">
              {["Code", "Discount", "Min. spend", "Status", "Used on order", "Created", "Expires"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-500">Loading...</td></tr>
            ) : codes.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-500">No codes yet. They appear when someone wins the game.</td></tr>
            ) : (
              codes.map((c) => {
                const st = status(c);
                return (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-mono text-xs font-medium">{c.code}</td>
                    <td className="px-5 py-3">{formatPrice(Number(c.value))}</td>
                    <td className="px-5 py-3">{c.minimumAmount ? formatPrice(Number(c.minimumAmount)) : "—"}</td>
                    <td className="px-5 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-5 py-3 text-xs">
                      {c.orders.length ? c.orders.map((o) => (
                        <Link key={o.id} href={`/admin/orders/${o.id}`} className="underline font-mono">{o.orderNumber}</Link>
                      )) : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{formatDate(c.createdAt, { month: "short", day: "numeric" })}</td>
                    <td className="px-5 py-3 text-zinc-500">{c.expiresAt ? formatDate(c.expiresAt, { month: "short", day: "numeric" }) : "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
