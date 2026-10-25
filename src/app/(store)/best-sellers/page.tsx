import React, { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best Sellers — Zohraé",
  description: "The kids jewelry our customers love most.",
};

async function getBestSellers() {
  return db.product.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      variants: {
        where: { isActive: true, deletedAt: null },
        orderBy: { isDefault: "desc" },
      },
    },
    orderBy: [{ salesCount: "desc" }, { averageRating: "desc" }],
    take: 48,
  });
}

function ProductGrid({ products }: { products: Awaited<ReturnType<typeof getBestSellers>> }) {
  const serialized = JSON.parse(
    JSON.stringify(products, (_, v) =>
      typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
    )
  );

  return serialized.length > 0 ? (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {serialized.map((product: (typeof serialized)[0]) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  ) : (
    <div className="text-center py-24">
      <p className="font-serif text-3xl font-light mb-3">Coming Soon</p>
      <p className="text-muted-foreground">Our best sellers will appear here as orders come in.</p>
    </div>
  );
}

export default async function BestSellersPage() {
  const products = await getBestSellers();

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Most Loved</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light">Best Sellers</h1>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4]" />
                  <Skeleton className="h-4 w-4/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          }
        >
          <ProductGrid products={products} />
        </Suspense>
      </div>
    </div>
  );
}
