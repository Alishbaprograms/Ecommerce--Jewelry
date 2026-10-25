import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections — Zohraé",
  description: "Browse our full range of fine jewelry collections.",
};

const collectionImages: Record<string, string> = {
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
  necklaces: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  bracelets: "https://images.unsplash.com/photo-1573408301185-9519f94815d5?w=800&q=80",
};

const fallbackImage = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80";

export default async function CollectionsPage() {
  const categories = await db.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE", deletedAt: null } } } } },
  });

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Explore</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light">Shop by category</h1>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Magnetic earrings, bead bracelets, necklaces and more for little ones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const img = collectionImages[cat.slug] ?? fallbackImage;
            return (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="group block relative overflow-hidden"
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                  <Image
                    src={cat.image ?? img}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="font-serif text-2xl font-light">{cat.name}</h2>
                    <p className="text-xs tracking-widest uppercase text-white/70 mt-1">
                      {cat._count.products} pieces
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
