"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BeadedName } from "@/components/store/beaded-name";
import { SilkBackground } from "@/components/store/homepage/silk-background";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f9d3e4_0%,#e7d6fb_50%,#ffe0cf_100%)] text-[#2a2340]">
      <SilkBackground />

      {/* The brand name, spelled in beads on a string */}
      <div className="relative mx-auto max-w-5xl px-2 pt-28 sm:pt-32">
        <BeadedName />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-20 sm:pt-6 sm:pb-28 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-sm font-semibold text-primary mb-5 shadow-sm"
        >
          Jewelry made for little ones
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-semibold leading-tight text-balance"
        >
          Tiny treasures for little ones
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-base sm:text-xl text-[#2a2340]/80 text-balance"
        >
          Magnetic clip-on earrings, colourful bead bracelets and necklaces, hair accessories and more. No piercing needed.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/collections">Shop all jewelry</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary bg-white/60 text-primary hover:bg-primary hover:text-white">
            <Link href="/new-arrivals">See what&apos;s new</Link>
          </Button>
        </motion.div>
        <p className="mt-6 text-sm text-[#2a2340]/70">Cash on delivery · Delivered across Pakistan</p>
      </div>
    </section>
  );
}
