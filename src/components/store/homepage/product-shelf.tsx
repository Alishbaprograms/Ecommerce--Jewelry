"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";

interface ShelfProps {
  title: string;
  subtitle: string;
  filter: "new-arrivals" | "best-sellers";
  href: string;
  tone?: string;
}

// Loads real products from the shop; the section hides itself until there are some.
export function ProductShelf({ title, subtitle, filter, href, tone = "" }: ShelfProps) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { data } = useQuery({
    queryKey: ["home-products", filter],
    queryFn: async () => {
      const res = await fetch(`/api/products?filter=${filter}&limit=4`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const products = data?.products ?? [];
  if (products.length === 0) return null;

  return (
    <section className={`py-16 sm:py-20 ${tone}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>
          <Link href={href} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: React.ComponentProps<typeof ProductCard>["product"], i: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
