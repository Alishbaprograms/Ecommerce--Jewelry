"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ShieldCheck, Sparkles, Banknote, Truck } from "lucide-react";

const reasons = [
  { Icon: ShieldCheck, title: "Gentle on little ears & wrists", text: "Nickel-free, kid-friendly materials.", bg: "bg-mint" },
  { Icon: Sparkles, title: "No piercing needed", text: "Magnetic clip-on earrings that feel like the real thing.", bg: "bg-blush" },
  { Icon: Banknote, title: "Cash on delivery", text: "Pay in cash when your order arrives.", bg: "bg-butter" },
  { Icon: Truck, title: "Delivered across Pakistan", text: "We confirm every order by phone before it ships.", bg: "bg-lilac" },
];

export function WhyParents() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-10">Why parents love Zohraé</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map(({ Icon, title, text, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`rounded-3xl ${bg} p-6 text-center`}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
