"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { WhatsAppLink } from "@/components/store/whatsapp-link";

const HIDDEN_ON = ["/checkout"];

// Floating chat button, bottom-right. The cart drawer covers it while open.
export function WhatsAppButton() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <WhatsAppLink
      where="floating"
      message="Hi Zohraé! I have a question."
      aria-label="Chat with us on WhatsApp"
      className="fixed right-3 bottom-4 sm:right-4 sm:bottom-6 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.100-4.500-3.900-4.700-4.100-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.9 2.100c.1.200.1.400 0 .5l-.4.600-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.5.100.6-.1l.9-1.100c.2-.3.400-.2.600-.1l2 1c.3.100.5.200.5.300.1.200.1.700-.1 1.300Z" />
      </svg>
    </WhatsAppLink>
  );
}
