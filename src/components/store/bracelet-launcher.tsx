"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BraceletDesigner } from "@/components/store/bracelet-designer";
import { track } from "@/lib/track";
import { CartoonBracelet } from "@/components/store/cartoon-icons";

const HIDDEN_ON = ["/checkout", "/order-confirmation"];

// A small round charm at bottom-left. Once per visit it bounces four times and a speech bubble names it.
export function BraceletLauncher() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("zohrae-bracelet-bounced") === "1";
    } catch {}
    if (seen) return;
    const timers = [
      setTimeout(() => {
        setBounce(!reduceMotion);
        setShowHint(true);
        track("bracelet_hint_shown");
        try {
          sessionStorage.setItem("zohrae-bracelet-bounced", "1");
        } catch {}
      }, 3500),
      setTimeout(() => setBounce(false), 6200),
      setTimeout(() => setShowHint(false), 9500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      <div className="fixed left-3 bottom-4 sm:left-4 sm:bottom-6 z-30 flex items-center gap-2">
        <motion.button
          onClick={() => {
            track("bracelet_open", { hint: showHint });
            setShowHint(false);
            setOpen(true);
          }}
          aria-label="Design your own bracelet"
          title="Design your own bracelet"
          animate={bounce ? { y: [0, -18, 0, -12, 0, -7, 0, -3, 0] } : { y: 0 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-lilac ring-2 ring-white shadow-lg shadow-black/10"
        >
          <CartoonBracelet className="h-10 w-10" />
        </motion.button>
        <AnimatePresence>
          {showHint && (
            <motion.span
              initial={{ opacity: 0, x: -6, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -6 }}
              className="pointer-events-none relative whitespace-nowrap rounded-2xl bg-white px-3.5 py-2 text-xs font-semibold text-foreground shadow-lg ring-1 ring-black/5"
            >
              <span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-white" />
              Design a bracelet!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogTitle className="sr-only">Design your own bracelet</DialogTitle>
          <DialogDescription className="sr-only">Tap beads to build a bracelet and share it.</DialogDescription>
          <BraceletDesigner onShopClick={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
