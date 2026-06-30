"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { useQuery } from "@tanstack/react-query";

async function fetchNewArrivals() {
  const res = await fetch("/api/products?filter=new-arrivals&limit=4");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const placeholderProducts = [
  {
    id: "1",
    slug: "aurora-diamond-ring",
    name: "Aurora Diamond Ring",
    basePrice: 1250,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80", isPrimary: true }],
    isNewArrival: true,
    isBestSeller: false,
    averageRating: 4.9,
    reviewCount: 28,
  },
  {
    id: "2",
    slug: "celestial-necklace",
    name: "Celestial Pendant Necklace",
    basePrice: 485,
    compareAtPrice: 620,
    images: [{ url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80", isPrimary: true }],
    isNewArrival: true,
    isBestSeller: true,
    averageRating: 4.8,
    reviewCount: 45,
  },
  {
    id: "3",
    slug: "pearl-drop-earrings",
    name: "Pearl Drop Earrings",
    basePrice: 325,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&q=80", isPrimary: true }],
    isNewArrival: true,
    isBestSeller: false,
    averageRating: 4.7,
    reviewCount: 19,
  },
  {
    id: "4",
    slug: "gold-cuff-bracelet",
    name: "18K Gold Cuff Bracelet",
    basePrice: 895,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80", isPrimary: true }],
    isNewArrival: true,
    isBestSeller: true,
    averageRating: 5.0,
    reviewCount: 12,
  },
];

export function NewArrivals() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { data } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: fetchNewArrivals,
    enabled: false,
  });

  const products = data?.products ?? placeholderProducts;

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
              Just In
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">New Arrivals</h2>
          </div>
          <Link
            href="/new-arrivals"
            className="hidden sm:flex items-center gap-2 text-sm tracking-widest uppercase hover:gap-3 transition-all duration-200"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: typeof placeholderProducts[0], i: number) => (
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

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/new-arrivals"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
          >
            View All New Arrivals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
