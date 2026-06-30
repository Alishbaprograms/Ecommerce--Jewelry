"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    name: "Rings",
    slug: "rings",
    description: "From delicate bands to statement pieces",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
    count: "48 pieces",
  },
  {
    name: "Necklaces",
    slug: "necklaces",
    description: "Layerable chains and pendants",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    count: "62 pieces",
  },
  {
    name: "Earrings",
    slug: "earrings",
    description: "Studs, hoops, and drops",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80",
    count: "54 pieces",
  },
  {
    name: "Bracelets",
    slug: "bracelets",
    description: "Stacking bracelets and bangles",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
    count: "36 pieces",
  },
];

export function FeaturedCollections() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
          Curated for You
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-light">Shop by Category</h2>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {collections.map((col, i) => (
          <motion.div
            key={col.slug}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <Link href={`/collections/${col.slug}`} className="group block">
              <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-muted">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className="inline-flex items-center gap-1 text-white text-xs tracking-widest uppercase bg-black/60 backdrop-blur-sm px-3 py-2">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-lg font-light group-hover:text-muted-foreground transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{col.description}</p>
                <p className="text-[11px] tracking-widest uppercase text-muted-foreground mt-1">
                  {col.count}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
