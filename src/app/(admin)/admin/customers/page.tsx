"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Eye } from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ search, page: String(page), limit: "20" });
      const res = await fetch(`/api/admin/customers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const customers = data?.customers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
          <p className="text-zinc-500 text-sm mt-1">{data?.pagination?.total ?? 0} total customers</p>
        </div>
        <Button variant="outline" size="sm">Export CSV</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-10 w-full pl-9 pr-4 text-sm border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-400 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left">
              <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Lifetime Value</th>
              <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-zinc-100 rounded animate-shimmer" />
                    </td>
                  ))}
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">No customers found</p>
                </td>
              </tr>
            ) : (
              customers.map((customer: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean;
                createdAt: string;
                _count: { orders: number };
                orders: Array<{ total: string }>;
              }) => {
                const lifetimeValue = customer.orders.reduce((sum: number, o: { total: string }) => sum + Number(o.total), 0);
                return (
                  <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-medium">
                          {customer.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{customer.name}</p>
                          <p className="text-xs text-zinc-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{customer._count.orders}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(lifetimeValue)}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(customer.createdAt, { month: "short", year: "numeric", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/customers/${customer.id}`} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded inline-flex">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">Page {page} of {data.pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
