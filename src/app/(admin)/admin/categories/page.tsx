"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await fetch("/api/admin/categories")).json(),
  });
  const categories: Category[] = data?.categories ?? [];

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-categories"] });

  const add = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    },
    onSuccess: () => { setName(""); refresh(); toast.success("Category added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (c: Category) => {
      await fetch(`/api/admin/categories/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/admin/categories/${id}`, { method: "DELETE" }); },
    onSuccess: () => { refresh(); toast.success("Category deleted"); },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Categories</h1>
        <p className="text-zinc-500 text-sm mt-1">Groups shown in the shop menu, e.g. Magnetic Earrings, Bead Necklaces.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) add.mutate(); }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 h-10 px-3 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-zinc-900"
        />
        <Button type="submit" disabled={add.isPending || !name.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
        {isLoading ? (
          <p className="p-6 text-sm text-zinc-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                <p className="text-xs text-zinc-500">{c._count.products} products</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer">
                  <input type="checkbox" checked={c.isActive} onChange={() => toggle.mutate(c)} />
                  Shown in shop
                </label>
                <button
                  onClick={() => { if (confirm(`Delete "${c.name}"? Its products stay, but will have no category.`)) remove.mutate(c.id); }}
                  className="text-zinc-400 hover:text-red-600"
                  aria-label="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
