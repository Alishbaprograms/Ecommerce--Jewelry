"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BeadedName } from "@/components/store/beaded-name";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500 via-pink-400 to-amber-300 text-white">
      {/* soft blobs */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl" />

      {/* The brand name, spelled in beads on a string */}
      <div className="relative mx-auto max-w-5xl px-2 pt-28 sm:pt-32">
        <BeadedName />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-20 sm:pt-6 sm:pb-28 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block rounded-full bg-white/25 backdrop-blur px-4 py-1.5 text-sm font-semibold mb-5"
        >
          Jewelry made for little ones
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-semibold leading-tight text-balance drop-shadow-sm"
        >
          Tiny treasures for little ones
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-base sm:text-xl text-white/95 text-balance"
        >
          Magnetic clip-on earrings, colourful bead bracelets and necklaces, hair accessories and more. No piercing needed.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link href="/collections">Shop all jewelry</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            <Link href="/new-arrivals">See what&apos;s new</Link>
          </Button>
        </motion.div>
        <p className="mt-6 text-sm text-white/90">Cash on delivery · Delivered across Pakistan</p>
      </div>
    </section>
  );
}
