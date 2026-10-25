"use client";

import React from "react";
import { track } from "@/lib/track";
import { whatsappLink } from "@/lib/shop-config";

// A WhatsApp chat link that records which button was tapped (for the admin Insights page).
export function WhatsAppLink({
  where,
  message,
  className,
  children,
  ...rest
}: { where: string; message?: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  return (
    <a
      {...rest}
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track("whatsapp_click", { where })}
    >
      {children}
    </a>
  );
}
