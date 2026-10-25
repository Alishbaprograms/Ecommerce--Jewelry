"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { track } from "@/lib/track";

const categories: { name: string; slug: string; emoji: string; image?: string; note: string; bg: string }[] = [
  { name: "Magnetic Earrings", slug: "magnetic-earrings", emoji: "🧲", image: "/categories/magnetic-earrings-clean4.jpg", note: "Clip-on, no piercing", bg: "bg-blush" },
  { name: "Bead Bracelets", slug: "bead-bracelets", emoji: "🌈", note: "Colourful & stretchy", bg: "bg-butter" },
  { name: "Bead Necklaces", slug: "bead-necklaces", emoji: "🌸", note: "Sweet little strands", bg: "bg-lilac" },
  { name: "Hair Clips", slug: "hair-accessories", emoji: "🎀", note: "Clips, bows & bands", bg: "bg-mint" },
  { name: "Rings", slug: "rings", emoji: "💍", note: "Tiny adjustable rings", bg: "bg-sky" },
];

export function FeaturedCollections() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-semibold">Shop by category</h2>
        <p className="text-muted-foreground mt-2">Find the perfect little something</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
        {categories.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={i === categories.length - 1 ? "col-span-2 sm:col-span-1 h-full" : "h-full"}
          >
            <Link
              href={`/collections/${c.slug}`}
              onClick={() => track("category_tile_click", { slug: c.slug })}
              className={`group flex h-full flex-col items-center text-center rounded-3xl ${c.bg} px-3 py-6 sm:py-8 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
            >
              {/* Same-height media area for every tile, so titles line up and photos can fill it. */}
              <span className="mb-2 flex h-32 w-full items-center justify-center sm:h-40">
                {c.image ? (
                  // White-background photo + multiply = the white vanishes into the tile colour (looks printed on the tile).
                  // Blend and tilt sit on the <Image> itself: a transformed wrapper would isolate it and stop the blend.
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={800}
                    height={600}
                    sizes="(max-width: 640px) 45vw, 240px"
                    className="h-full w-auto max-w-full object-contain mix-blend-multiply scale-110 -rotate-2 transition-transform duration-300 group-hover:scale-[1.16] group-hover:rotate-0"
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" aria-hidden>
                    {c.emoji}
                  </span>
                )}
              </span>
              <h3 className="text-base sm:text-lg font-semibold">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
