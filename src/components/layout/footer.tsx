import React from "react";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/shop-config";
import Link from "next/link";

const shopLinks = [
  { label: "All Jewelry", href: "/collections" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Sale", href: "/sale" },
  { label: "Search", href: "/search" },
  { label: "Wishlist", href: "/wishlist" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div>
            <p className="font-serif text-3xl font-semibold mb-3">Zohraé</p>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Tiny treasures for little ones: magnetic earrings, bead jewelry and hair accessories made for kids.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-white/60">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-white/60">Ordering</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>💵 Cash on delivery</li>
              <li>🚚 Delivered across Pakistan</li>
              <li>📞 We call to confirm every order</li>
              <li>
                <a
                  href={whatsappLink("Hi Zohraé! I have a question.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  💬 WhatsApp us: {WHATSAPP_DISPLAY}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="pt-6 text-xs text-white/50 text-center sm:text-left">
          © {new Date().getFullYear()} Zohraé. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
