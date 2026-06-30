"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { label: "Featured", value: "isFeatured_desc" },
  { label: "Newest", value: "createdAt_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Sellers", value: "salesCount_desc" },
  { label: "Top Rated", value: "averageRating_desc" },
];

const filterOptions = {
  price: [
    { label: "Under Rs. 50,000", min: 0, max: 50000 },
    { label: "Rs. 50,000 – 150,000", min: 50000, max: 150000 },
    { label: "Rs. 150,000 – 300,000", min: 150000, max: 300000 },
    { label: "Over Rs. 300,000", min: 300000, max: 99999999 },
  ],
  material: ["Gold", "Silver", "Rose Gold", "Platinum", "Mixed Metal"],
  stone: ["Diamond", "Pearl", "Emerald", "Sapphire", "Ruby", "No Stone"],
};

async function fetchProducts(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/products?${query}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

interface Props {
  slug: string;
  searchParams: Record<string, string>;
}

export function CollectionPageClient({ slug, searchParams }: Props) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState(searchParams.sort ?? "createdAt_desc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const queryParams = {
    collection: slug,
    sort,
    limit: "24",
    ...activeFilters,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", slug, sort, activeFilters],
    queryFn: () => fetchProducts(queryParams),
  });

  const products = data?.products ?? [];
  const total = data?.pagination?.total ?? 0;

  const collectionName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  return (
    <div className="pt-32 pb-20 min-h-screen">
      {/* Header */}
      <div className="text-center py-12 px-4">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
          Shop
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-light">{collectionName}</h1>
        <p className="text-muted-foreground mt-3">{total} pieces</p>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 text-sm tracking-wider uppercase"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {Object.keys(activeFilters).length > 0 && (
              <span className="bg-foreground text-background text-xs rounded-full px-2 py-0.5">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-transparent text-sm pr-8 focus:outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-muted-foreground" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 256 }}
                exit={{ opacity: 0, width: 0 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-64 space-y-8 pr-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-widest uppercase font-medium">Filters</span>
                    {Object.keys(activeFilters).length > 0 && (
                      <button
                        onClick={() => setActiveFilters({})}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Price filter */}
                  <div>
                    <h3 className="text-xs tracking-widest uppercase font-medium mb-3">Price</h3>
                    <div className="space-y-2">
                      {filterOptions.price.map((p) => (
                        <label key={p.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="price"
                            className="accent-foreground"
                            checked={activeFilters.minPrice === String(p.min)}
                            onChange={() =>
                              setActiveFilters((f) => ({
                                ...f,
                                minPrice: String(p.min),
                                maxPrice: String(p.max),
                              }))
                            }
                          />
                          <span className="text-sm text-muted-foreground">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Material filter */}
                  <div>
                    <h3 className="text-xs tracking-widest uppercase font-medium mb-3">Material</h3>
                    <div className="space-y-2">
                      {filterOptions.material.map((m) => (
                        <label key={m} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="accent-foreground" />
                          <span className="text-sm text-muted-foreground">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stone filter */}
                  <div>
                    <h3 className="text-xs tracking-widest uppercase font-medium mb-3">Stone</h3>
                    <div className="space-y-2">
                      {filterOptions.stone.map((s) => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="accent-foreground" />
                          <span className="text-sm text-muted-foreground">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4]" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-serif text-2xl mb-2">No pieces found</p>
                <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
                <Button
                  onClick={() => setActiveFilters({})}
                  variant="outline"
                  className="mt-6"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
