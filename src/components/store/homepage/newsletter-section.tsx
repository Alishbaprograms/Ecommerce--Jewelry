"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

export function NewsletterSection() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      toast.success("Thank you for subscribing!", {
        description: "Welcome to the Zohraé family.",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-24 bg-foreground text-background" ref={ref}>
      <div className="max-w-2xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] tracking-[0.4em] uppercase text-background/50 mb-4">
            Stay Connected
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light mb-4">
            Join the Inner Circle
          </h2>
          <p className="text-background/60 text-base leading-relaxed mb-10">
            Be the first to discover new collections, receive exclusive offers, and get early access to our seasonal events. Plus, 15% off your first order.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <p className="font-serif text-xl">Thank you for joining us.</p>
              <p className="text-background/60 text-sm mt-2">
                Check your inbox for your welcome gift.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 bg-background/10 border border-background/20 px-4 py-3.5 text-sm placeholder:text-background/40 focus:outline-none focus:border-background/40 text-background"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-background text-foreground text-xs tracking-widest uppercase font-medium hover:bg-background/90 transition-colors disabled:opacity-60"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </form>
          )}

          <p className="text-background/30 text-xs mt-4">
            No spam, ever. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
