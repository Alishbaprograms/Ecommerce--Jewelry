"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Skeleton } from "@/components/ui/skeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const [debouncedQuery, setDebouncedQuery] = useState(q);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { products: [] };
      const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=24`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  const products = data?.products ?? [];

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for jewelry..."
              autoFocus
              className="w-full h-14 pl-12 pr-6 text-lg border-b-2 border-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {debouncedQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground text-sm">
              {isLoading
                ? "Searching..."
                : `${products.length} results for "${debouncedQuery}"`}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product: Parameters<typeof ProductCard>[0]["product"]) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : debouncedQuery ? (
          <div className="text-center py-16">
            <p className="font-serif text-2xl mb-2">No results found</p>
            <p className="text-muted-foreground">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-serif text-2xl mb-2">What are you looking for?</p>
            <p className="text-muted-foreground">Search rings, necklaces, earrings, bracelets...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
