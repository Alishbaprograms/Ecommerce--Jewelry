"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const categories: { name: string; slug: string; emoji: string; image?: string; note: string; bg: string }[] = [
  { name: "Magnetic Earrings", slug: "magnetic-earrings", emoji: "🧲", image: "/categories/magnetic-earrings-blend3.jpg", note: "Clip-on, no piercing", bg: "bg-blush" },
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
            className={i === categories.length - 1 ? "col-span-2 sm:col-span-1" : ""}
          >
            <Link
              href={`/collections/${c.slug}`}
              className={`group flex flex-col items-center text-center rounded-3xl ${c.bg} px-3 py-7 sm:py-9 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
            >
              {c.image ? (
                // The photo has a pure white background; multiply makes the white disappear into the tile colour,
                // so it looks printed on the tile, not placed in a frame. Blend and tilt sit on the <Image> itself:
                // a transformed wrapper would isolate it and stop the blend.
                <span className="relative mb-2 block h-32 w-32 sm:h-40 sm:w-40">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="160px"
                    className="object-contain mix-blend-multiply -rotate-3 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0"
                  />
                </span>
              ) : (
                <span className="text-5xl sm:text-6xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" aria-hidden>
                  {c.emoji}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-semibold">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
