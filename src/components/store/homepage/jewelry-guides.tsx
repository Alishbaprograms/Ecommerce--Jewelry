"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";

const guides = [
  {
    title: "Ring Size Guide",
    description: "Find your perfect fit",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    href: "/size-guide#rings",
  },
  {
    title: "Jewelry Care Guide",
    description: "Keep your pieces shining",
    image: "https://images.unsplash.com/photo-1573408301185-9519f94815e6?w=400&q=80",
    href: "/jewelry-care",
  },
  {
    title: "Metal Guide",
    description: "Understand your options",
    image: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400&q=80",
    href: "/material-guide",
  },
];

export function JewelryGuides() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Expert Knowledge
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light">Jewelry Guides</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {guides.map((guide, i) => (
            <motion.div
              key={guide.href}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={guide.href} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden mb-4">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm group-hover:text-muted-foreground transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
