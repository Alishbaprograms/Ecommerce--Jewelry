"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LiveBeads } from "@/components/store/live-beads";
import { SilkBackground } from "@/components/store/homepage/silk-background";

// Pastel satin banner with small loose beads drifting behind the words. Beads are tappable (see LiveBeads).
export function HeroSection() {
  // The beads steer around this block so the headline and buttons stay readable.
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f9d3e4_0%,#e7d6fb_50%,#ffe0cf_100%)] text-[#2a2340]">
      <SilkBackground />

      {/* starts below the fixed header, so beads never hide behind it */}
      <LiveBeads avoidRef={textRef} className="absolute inset-x-0 bottom-0 top-[7.2rem] h-[calc(100%-7.2rem)] w-full" />

      {/* the wrapper lets taps fall through to the beads; only the buttons catch clicks */}
      <div className="pointer-events-none relative flex min-h-[540px] items-center justify-center px-4 pb-16 pt-40 sm:min-h-[620px]">
        <div ref={textRef} className="mx-auto max-w-3xl text-center">
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
            <Button asChild size="lg" className="pointer-events-auto">
              <Link href="/collections">Shop all jewelry</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
