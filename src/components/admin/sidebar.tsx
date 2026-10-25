"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Ticket,
  Sparkles,
  Archive,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Categories", icon: Tag, href: "/admin/categories" },
  { label: "Inventory", icon: Archive, href: "/admin/inventory" },
  { label: "Discount codes", icon: Ticket, href: "/admin/codes" },
  { label: "Insights", icon: Sparkles, href: "/admin/insights" },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <>
      {/* Phone only: dim the page behind the open menu */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-zinc-900 text-white transition-transform duration-200",
          "lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b border-white/10">
          <span className="font-serif text-lg tracking-[0.2em] uppercase font-light">Zohraé</span>
          <button onClick={onClose} className="lg:hidden p-1.5 -mr-1.5 text-white/70 hover:text-white" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 text-sm transition-colors relative",
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[hsl(var(--gold))]" />}
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors w-full py-1"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
