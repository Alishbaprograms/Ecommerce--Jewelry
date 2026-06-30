"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export function BrandStory() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1573408301185-9519f94815e6?w=800&q=80"
              alt="Jewelry craftsman at work"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {/* Decorative offset block */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[hsl(var(--gold))] hidden lg:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground">
            Our Story
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
            Crafted with intention,<br />worn with love
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2018, Zohraé was born from a belief that fine jewelry shouldn't be reserved for special occasions alone. Every piece in our collection is designed to be worn daily, becoming part of your story.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We work with master artisans who bring decades of expertise to each creation. From ethically sourced stones to recycled precious metals, sustainability is woven into everything we do.
          </p>

          <div className="grid grid-cols-3 gap-8 py-6 border-t border-b border-border">
            {[
              { number: "10K+", label: "Happy Customers" },
              { number: "500+", label: "Unique Designs" },
              { number: "15+", label: "Countries Shipped" },
            ].map(({ number, label }) => (
              <div key={label} className="text-center">
                <p className="font-serif text-2xl font-light text-[hsl(var(--gold))]">{number}</p>
                <p className="text-xs tracking-wider uppercase text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="inline-flex items-center text-sm tracking-widest uppercase border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors"
          >
            Discover Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
