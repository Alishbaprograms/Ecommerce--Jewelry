"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=90",
    title: "Timeless Elegance",
    subtitle: "New Collection 2025",
    description: "Discover jewelry crafted for life's most precious moments",
    cta: { label: "Shop New Arrivals", href: "/new-arrivals" },
    ctaSecondary: { label: "Explore Collections", href: "/collections" },
    align: "center" as const,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1920&q=90",
    title: "Golden Hour",
    subtitle: "18K Gold Collection",
    description: "Luxurious pieces handcrafted with the finest gold",
    cta: { label: "Shop Gold Jewelry", href: "/collections/gold" },
    ctaSecondary: { label: "Learn More", href: "/about" },
    align: "left" as const,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=90",
    title: "Diamond Dreams",
    subtitle: "Diamond Essentials",
    description: "Ethically sourced diamonds set in breathtaking designs",
    cta: { label: "Shop Diamonds", href: "/collections/diamonds" },
    ctaSecondary: { label: "Our Promise", href: "/sustainability" },
    align: "right" as const,
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const go = (index: number) => {
    setCurrent((index + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background images */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div
        className={`absolute inset-0 flex items-center ${
          slide.align === "center"
            ? "justify-center text-center"
            : slide.align === "left"
            ? "justify-start text-left"
            : "justify-end text-right"
        }`}
      >
        <div className="px-8 sm:px-16 lg:px-24 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4"
            >
              <p className="text-white/70 text-[11px] tracking-[0.4em] uppercase">
                {slide.subtitle}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white font-light leading-[1.1] tracking-tight">
                {slide.title}
              </h1>
              <p className="text-white/80 text-base sm:text-lg font-light max-w-md">
                {slide.description}
              </p>
              <div
                className={`flex gap-4 pt-4 ${
                  slide.align === "center" ? "justify-center" : slide.align === "right" ? "justify-end" : ""
                } flex-wrap`}
              >
                <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
                  <Link href={slide.cta.href}>{slide.cta.label}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-foreground"
                >
                  <Link href={slide.ctaSecondary.href}>{slide.ctaSecondary.label}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-2 bg-white/40"
            } h-0.5`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] tracking-widest uppercase rotate-90 origin-center" style={{ writingMode: "vertical-rl" }}>
          Scroll
        </span>
        <div className="w-px h-10 bg-white/30" />
      </motion.div>
    </section>
  );
}
