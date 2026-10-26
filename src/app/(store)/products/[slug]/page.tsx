import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./product-page-client";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, status: "ACTIVE", deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true, deletedAt: null },
        include: { attributes: true },
        orderBy: { isDefault: "desc" },
      },
      category: { select: { name: true, slug: true } },
      reviews: {
        where: { status: "APPROVED", deletedAt: null },
        select: {
          id: true, rating: true, guestName: true, guestCity: true, kidAge: true, tags: true,
          verified: true, body: true, images: true, adminReply: true, createdAt: true,
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 60,
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Summary numbers come from every approved review, not just the ones listed above.
  const [ratingGroups, tagRows] = await Promise.all([
    db.review.groupBy({ by: ["rating"], where: { productId: product.id, status: "APPROVED", deletedAt: null }, _count: true }),
    db.review.findMany({ where: { productId: product.id, status: "APPROVED", deletedAt: null }, select: { tags: true }, take: 500 }),
  ]);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of ratingGroups) distribution[g.rating] = g._count;
  const count = Object.values(distribution).reduce((a, b) => a + b, 0);
  const average = count ? Object.entries(distribution).reduce((sum, [r, n]) => sum + Number(r) * n, 0) / count : 0;
  const tagTotals = new Map<string, number>();
  for (const row of tagRows) for (const t of row.tags) tagTotals.set(t, (tagTotals.get(t) ?? 0) + 1);
  const reviewSummary = {
    average,
    count,
    distribution,
    tagCounts: [...tagTotals.entries()].map(([tag, n]) => ({ tag, count: n })).sort((a, b) => b.count - a.count).slice(0, 6),
  };

  const serializedProduct = JSON.parse(
    JSON.stringify(product, (_, v) =>
      typeof v === "bigint"
        ? v.toString()
        : v instanceof Date
        ? v.toISOString()
        : v
    )
  );

  return <ProductPageClient
      product={serializedProduct}
      reviews={serializedProduct.reviews}
      reviewSummary={reviewSummary}
    />;
}
