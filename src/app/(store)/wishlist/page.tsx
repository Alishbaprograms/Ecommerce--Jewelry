"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const openCart = useCartStore((s) => s.openCart);

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-2">Saved</p>
          <h1 className="font-serif text-3xl font-light">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-border">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" strokeWidth={1} />
            <p className="font-serif text-2xl mb-2">Your wishlist is empty</p>
            <p className="text-muted-foreground text-sm mb-8">Save pieces you love by clicking the heart icon on any product.</p>
            <Button asChild>
              <Link href="/collections">Explore Collections</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                    <Link href={`/products/${item.slug}`}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="absolute top-3 right-3 p-2 bg-background/90 hover:bg-background transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-medium text-sm hover:text-muted-foreground transition-colors line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm">{formatPrice(item.price)}</p>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => {
                      toast.info("Please visit the product page to add to bag");
                    }}
                  >
                    Add to Bag
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
