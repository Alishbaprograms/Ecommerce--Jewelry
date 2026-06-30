"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York, NY",
    rating: 5,
    text: "I ordered the Celestial Necklace for my anniversary and it arrived beautifully packaged. The quality exceeded my expectations — you can tell this is a piece that will last a lifetime. My husband was absolutely speechless.",
    product: "Celestial Pendant Necklace",
  },
  {
    id: 2,
    name: "Emily R.",
    location: "Los Angeles, CA",
    rating: 5,
    text: "The Aurora Diamond Ring is even more beautiful in person. The craftsmanship is impeccable and the stone catches light in the most magical way. Customer service was incredibly helpful in selecting the right size.",
    product: "Aurora Diamond Ring",
  },
  {
    id: 3,
    name: "Jessica L.",
    location: "Chicago, IL",
    rating: 5,
    text: "I've been buying from Zohraé for 3 years now and every single piece has become a treasured part of my collection. Their jewelry truly does become better with age and time.",
    product: "Classic Gold Hoop Earrings",
  },
  {
    id: 4,
    name: "Amanda K.",
    location: "Miami, FL",
    rating: 5,
    text: "My engagement ring is from Zohraé and I receive compliments every single day. The team helped me customize the exact ring I envisioned and the result was beyond perfect.",
    product: "Diamond Eternity Band",
  },
];

export function Testimonials() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [current, setCurrent] = useState(0);

  const go = (dir: number) => {
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Customer Stories
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light">What Our Clients Say</h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <Quote className="h-12 w-12 text-[hsl(var(--gold))] opacity-20 mx-auto mb-6" />

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonials[current].id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-serif text-lg sm:text-xl lg:text-2xl font-light leading-relaxed text-foreground/90 mb-8 italic">
                "{testimonials[current].text}"
              </p>
              <div>
                <p className="font-medium text-sm">{testimonials[current].name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {testimonials[current].location} · {testimonials[current].product}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={() => go(-1)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 h-0.5 ${
                    i === current ? "w-8 bg-foreground" : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
