"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const navLinks = [
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "All Jewelry", href: "/collections/all" },
      { label: "Rings", href: "/collections/rings" },
      { label: "Necklaces", href: "/collections/necklaces" },
      { label: "Earrings", href: "/collections/earrings" },
      { label: "Bracelets", href: "/collections/bracelets" },
    ],
  },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Sale", href: "/sale" },
  { label: "Journal", href: "/journal" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { data: session } = useSession();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);

  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHomepage = pathname === "/";
  const isTransparent = isHomepage && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-500",
          scrolled || !isHomepage
            ? "bg-background/95 backdrop-blur-md border-b border-border luxury-shadow"
            : "bg-transparent"
        )}
      >
        {/* Announcement bar */}
        <div
          className={cn(
            "text-center py-2 text-[11px] tracking-widest transition-colors duration-500",
            isTransparent ? "bg-black/20 text-white/90" : "bg-foreground text-background"
          )}
        >
          FREE SHIPPING ON ORDERS OVER RS. 50,000 · USE CODE <span className="font-semibold">ZOHRAE20</span> FOR 20% OFF
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu */}
            <button
              className={cn(
                "lg:hidden p-2 -ml-2 transition-colors",
                isTransparent ? "text-white" : "text-foreground"
              )}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className={cn(
                "font-serif text-xl tracking-[0.25em] uppercase font-light absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 transition-colors duration-300",
                isTransparent ? "text-white" : "text-foreground"
              )}
            >
              Zohraé
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 text-[11px] tracking-widest uppercase font-medium transition-colors duration-200",
                      isTransparent
                        ? "text-white/90 hover:text-white"
                        : "text-foreground/70 hover:text-foreground",
                      pathname.startsWith(link.href) && (isTransparent ? "text-white" : "text-foreground")
                    )}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="h-3 w-3 mt-0.5" />}
                  </Link>

                  {link.children && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-3 w-52 bg-background border border-border shadow-xl py-2"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-5 py-2.5 text-xs tracking-widest uppercase text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/search"
                className={cn(
                  "p-2 transition-colors",
                  isTransparent ? "text-white/90 hover:text-white" : "text-foreground/70 hover:text-foreground"
                )}
                aria-label="Search"
              >
                <Search className="h-4.5 w-4.5" />
              </Link>

              <Link
                href="/wishlist"
                className={cn(
                  "relative p-2 transition-colors",
                  isTransparent ? "text-white/90 hover:text-white" : "text-foreground/70 hover:text-foreground"
                )}
                aria-label="Wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-medium">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                href={session ? "/account" : "/login"}
                className={cn(
                  "p-2 transition-colors",
                  isTransparent ? "text-white/90 hover:text-white" : "text-foreground/70 hover:text-foreground"
                )}
                aria-label="Account"
              >
                <User className="h-4.5 w-4.5" />
              </Link>

              <button
                onClick={openCart}
                className={cn(
                  "relative p-2 transition-colors",
                  isTransparent ? "text-white/90 hover:text-white" : "text-foreground/70 hover:text-foreground"
                )}
                aria-label="Cart"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {totalCartItems > 0 && (
                  <motion.span
                    key={totalCartItems}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-medium"
                  >
                    {totalCartItems > 9 ? "9+" : totalCartItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-background pt-32 px-8"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className="text-2xl font-serif text-foreground"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="mt-3 pl-4 flex flex-col gap-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="text-sm tracking-widest uppercase text-muted-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-12 flex flex-col gap-3">
              {session ? (
                <Button asChild variant="outline" size="lg">
                  <Link href="/account">My Account</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/register">Create Account</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
