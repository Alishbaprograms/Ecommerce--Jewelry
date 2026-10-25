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
        description: "Welcome to Zohraé.",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-400 text-white" ref={ref}>
      <div className="max-w-2xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Get sparkly news 💌</h2>
          <p className="text-white/90 text-base leading-relaxed mb-8">
            Be the first to hear about new arrivals and special offers for your little one.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <p className="text-xl font-semibold">Thank you for joining us!</p>
              <p className="text-white/90 text-sm mt-2">We&apos;ll keep you posted.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 rounded-full bg-white/20 border border-white/40 px-5 py-3.5 text-sm placeholder:text-white/70 focus:outline-none focus:border-white text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-full bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </form>
          )}

          <p className="text-white/70 text-xs mt-4">
            No spam, ever. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
