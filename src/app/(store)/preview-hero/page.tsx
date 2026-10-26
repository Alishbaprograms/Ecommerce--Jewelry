import React from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/store/homepage/hero-section";

// A private page for comparing banner ideas. Not linked anywhere and hidden from search engines.
export const metadata: Metadata = { title: "Banner preview", robots: { index: false, follow: false } };

export default function PreviewHeroPage() {
  return (
    <div>
      <HeroSection variant="beads" />
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        Preview: loose, tappable beads. Tap a bead to pop it, tap empty space to drop a new one.
      </div>
    </div>
  );
}
