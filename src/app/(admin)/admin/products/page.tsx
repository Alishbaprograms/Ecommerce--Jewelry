"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Package,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  basePrice: string;
  compareAtPrice: string | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  variants: Array<{ stock: number }>;
  category: { name: string } | null;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
}

async function fetchAdminProducts(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/admin/products?${query}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const statusBadgeVariant = {
  ACTIVE: "success",
  DRAFT: "secondary",
  ARCHIVED: "outline",
} as const;

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, status, page],
    queryFn: () =>
      fetchAdminProducts({
        search,
        status: status === "all" ? "" : status,
        page: String(page),
        limit: "20",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const products: Product[] = data?.products ?? [];
  const totalStock = (product: Product) =>
    product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
          <p className="text-zinc-500 text-sm mt-1">{data?.pagination?.total ?? 0} total products</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-full pl-9 pr-4 text-sm border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-400 bg-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-10 px-3 text-sm border border-zinc-200 rounded-md focus:outline-none bg-white"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left">
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-zinc-100 rounded animate-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-500">No products found</p>
                    <Button asChild size="sm" className="mt-4">
                      <Link href="/admin/products/new">Add your first product</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 relative overflow-hidden bg-zinc-100 rounded shrink-0">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant[product.status]}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(Number(product.basePrice))}
                      {product.compareAtPrice && (
                        <span className="text-xs text-zinc-400 line-through ml-1">
                          {formatPrice(Number(product.compareAtPrice))}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={totalStock(product) <= 5 ? "text-rose-600 font-medium" : "text-zinc-700"}>
                        {totalStock(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{product.salesCount}</td>
                    <td className="px-6 py-4 text-zinc-500">{product.category?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(product.createdAt, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === product.id && (
                          <div className="absolute right-0 top-8 z-10 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 w-44">
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </Link>
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 w-full"
                              onClick={() => { setOpenMenuId(null); toast.info("Duplicate feature coming soon"); }}
                            >
                              <Copy className="h-3.5 w-3.5" /> Duplicate
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); deleteMutation.mutate(product.id); }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">
              Page {page} of {data.pagination.totalPages} · {data.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
