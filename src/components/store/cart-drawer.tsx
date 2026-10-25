"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { calcShipping } from "@/lib/shop-config";
import { Button } from "@/components/ui/button";
import { TreasureChest } from "@/components/store/treasure-chest";
import { CatchJewelsGame } from "@/components/store/catch-jewels-game";
import { Separator } from "@/components/ui/separator";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-2">
                <TreasureChest className="h-6 w-6" open={items.length > 0} />
                <span className="font-serif text-lg">
                  Your Treasure Box
                </span>
                {totalItems > 0 && (
                  <span className="text-muted-foreground text-sm">({totalItems})</span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1 hover:opacity-70 transition-opacity"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <TreasureChest className="h-16 w-16 opacity-60" />
                  <div>
                    <p className="font-serif text-lg mb-1">Your treasure box is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Find something sparkly for your little one
                    </p>
                  </div>
                  <Button asChild onClick={closeCart} className="mt-2">
                    <Link href="/collections">Shop Now</Link>
                  </Button>
                  <div className="w-full mt-4">
                    <p className="text-sm font-medium mb-2">🎮 Play while you pick!</p>
                    <CatchJewelsGame />
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.variantId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-muted">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={closeCart}
                                className="font-medium text-sm line-clamp-1 hover:underline"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.variantName}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 border border-border">
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="p-1.5 hover:bg-muted transition-colors"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="p-1.5 hover:bg-muted transition-colors disabled:opacity-40"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="font-medium text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span>{calcShipping(subtotal) === 0 ? "Free" : formatPrice(calcShipping(subtotal))}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span className="font-serif">Total (pay on delivery)</span>
                  <span>{formatPrice(subtotal + calcShipping(subtotal))}</span>
                </div>

                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={closeCart}>
                    Checkout
                  </Link>
                </Button>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
