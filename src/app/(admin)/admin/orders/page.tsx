"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_COLORS = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
  PARTIALLY_REFUNDED: "outline",
} as const;

const ORDER_STATUSES = [
  "all",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", search, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status: status === "all" ? "" : status,
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
          <p className="text-zinc-500 text-sm mt-1">{data?.pagination?.total ?? 0} total orders</p>
        </div>
        <Button variant="outline" size="sm">Export CSV</Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-md transition-colors ${
              status === s
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {s === "all" ? "All Orders" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="search"
          placeholder="Search by order number, customer name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-10 w-full pl-9 pr-4 text-sm border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-400 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left">
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-zinc-100 rounded animate-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <ShoppingCart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order: {
                  id: string;
                  orderNumber: string;
                  total: string;
                  status: keyof typeof STATUS_COLORS;
                  createdAt: string;
                  user: { name: string; email: string };
                  items: Array<{ productName: string; quantity: number }>;
                }) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-zinc-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900">{order.user.name}</p>
                      <p className="text-xs text-zinc-500">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 text-xs">
                      {order.items.map((item) => `${item.productName} ×${item.quantity}`).join(", ")}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(Number(order.total))}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_COLORS[order.status] ?? "secondary"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded inline-flex"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">
              Page {page} of {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
