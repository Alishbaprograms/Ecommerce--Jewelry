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
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
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

  const serializedProduct = JSON.parse(
    JSON.stringify(product, (_, v) =>
      typeof v === "bigint"
        ? v.toString()
        : v instanceof Date
        ? v.toISOString()
        : v
    )
  );

  return <ProductPageClient product={serializedProduct} />;
}
