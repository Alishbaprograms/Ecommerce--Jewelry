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

      <div className="relative mx-auto max-w-3xl px-4 pt-9 pb-16 sm:pt-6 sm:pb-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-semibold leading-tight text-balance"
        >
          Tiny treasures for little ones
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-7"
        >
          <Button asChild size="lg">
            <Link href="/collections">Shop all jewelry</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
