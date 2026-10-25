"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Variant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  product: { name: string; id: string };
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [editing, setEditing] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-inventory", search, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ search, filter });
      const res = await fetch(`/api/admin/inventory?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
      toast.success("Stock updated");
    },
    onError: () => toast.error("Failed to update stock"),
  });

  const variants: Variant[] = data?.variants ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">Inventory</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage stock levels across all variants</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Variants", value: data?.stats?.total ?? "—", color: "bg-zinc-50" },
          { label: "Low Stock", value: data?.stats?.low ?? "—", color: "bg-amber-50" },
          { label: "Out of Stock", value: data?.stats?.out ?? "—", color: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} border border-border rounded-xl p-5`}>
            <p className="text-2xl font-light font-serif">{s.value}</p>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product..."
            className="w-full border border-input pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        {(["all", "low", "out"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs tracking-widest uppercase border transition-colors ${
              filter === f ? "bg-foreground text-background border-foreground" : "border-input text-muted-foreground hover:border-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-muted border-b border-border">
            <tr>
              {["Product", "Variant", "SKU", "Stock", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : variants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No variants found
                </td>
              </tr>
            ) : variants.map((v) => {
              const isLow = v.stock > 0 && v.stock <= (v.lowStockThreshold || 5);
              const isOut = v.stock === 0;
              const editVal = editing[v.id];

              return (
                <tr key={v.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{v.product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                  <td className="px-4 py-3">
                    {editVal !== undefined ? (
                      <input
                        type="number"
                        value={editVal}
                        onChange={(e) => setEditing((prev) => ({ ...prev, [v.id]: e.target.value }))}
                        className="w-20 border border-input px-2 py-1 text-sm focus:outline-none focus:border-foreground"
                        autoFocus
                      />
                    ) : (
                      <span className={isOut ? "text-destructive font-medium" : isLow ? "text-amber-600 font-medium" : ""}>{v.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isOut ? (
                      <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Out of Stock</Badge>
                    ) : isLow ? (
                      <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />Low Stock</Badge>
                    ) : (
                      <Badge variant="success">In Stock</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editVal !== undefined ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStock.mutate({ id: v.id, stock: parseInt(editVal) || 0 })}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing((e) => { const n = { ...e }; delete n[v.id]; return n; })}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing((e) => ({ ...e, [v.id]: String(v.stock) }))}>
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
