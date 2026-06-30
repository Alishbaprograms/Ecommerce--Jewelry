"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";

const bestSellers = [
  {
    id: "5",
    slug: "solitaire-diamond-necklace",
    name: "Solitaire Diamond Necklace",
    basePrice: 2450,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80", isPrimary: true }],
    isNewArrival: false,
    isBestSeller: true,
    averageRating: 5.0,
    reviewCount: 67,
  },
  {
    id: "6",
    slug: "eternity-band-ring",
    name: "Diamond Eternity Band",
    basePrice: 1875,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80", isPrimary: true }],
    isNewArrival: false,
    isBestSeller: true,
    averageRating: 4.9,
    reviewCount: 89,
  },
  {
    id: "7",
    slug: "gold-hoop-earrings",
    name: "Classic Gold Hoop Earrings",
    basePrice: 285,
    compareAtPrice: 380,
    images: [{ url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&q=80", isPrimary: true }],
    isNewArrival: false,
    isBestSeller: true,
    averageRating: 4.8,
    reviewCount: 124,
  },
  {
    id: "8",
    slug: "tennis-bracelet",
    name: "Diamond Tennis Bracelet",
    basePrice: 3200,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80", isPrimary: true }],
    isNewArrival: false,
    isBestSeller: true,
    averageRating: 4.9,
    reviewCount: 43,
  },
];

export function BestSellers() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-20 bg-[hsl(var(--cream))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Most Loved
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Best Sellers</h2>
          </div>
          <Link
            href="/best-sellers"
            className="hidden sm:flex items-center gap-2 text-sm tracking-widest uppercase hover:gap-3 transition-all duration-200"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
