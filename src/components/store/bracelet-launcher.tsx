"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BraceletDesigner } from "@/components/store/bracelet-designer";

const HIDDEN_ON = ["/checkout", "/order-confirmation"];

// Floating side button. It bounces four times, once per visit, then sits still.
export function BraceletLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("zohrae-bracelet-bounced") === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      setBounce(true);
      try {
        sessionStorage.setItem("zohrae-bracelet-bounced", "1");
      } catch {}
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Design your own bracelet"
        animate={bounce ? { y: [0, -22, 0, -14, 0, -8, 0, -4, 0] } : { y: 0 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        className="fixed left-2 bottom-4 sm:left-3 sm:bottom-24 z-30 flex flex-col items-center gap-0.5 rounded-2xl bg-primary text-primary-foreground shadow-lg px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs font-medium"
      >
        <span className="text-2xl sm:text-xl leading-none">📿</span>
        <span className="hidden sm:block">Design a bracelet</span>
      </motion.button>

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
