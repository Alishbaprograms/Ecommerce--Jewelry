"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { track } from "@/lib/track";
import { useWishlistStore } from "@/store/wishlist";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Product {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  compareAtPrice?: number | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isLimitedEdition?: boolean;
  averageRating?: number;
  reviewCount?: number;
  variants?: Array<{ id: string; name?: string; sku: string; stock: number; price: number }>;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const secondaryImage = product.images[1];

  const basePrice = parseFloat(String(product.basePrice));
  const compareAtPrice = product.compareAtPrice ? parseFloat(String(product.compareAtPrice)) : null;
  const discount = compareAtPrice ? getDiscountPercentage(compareAtPrice, basePrice) : 0;

  const defaultVariant = product.variants?.[0];

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!defaultVariant || (product.variants?.length ?? 0) > 1) {
      toast.info("Please choose an option on the product page");
      router.push(`/products/${product.slug}`);
      return;
    }
    if (defaultVariant.stock <= 0) {
      toast.error("Sorry, this item is out of stock");
      return;
    }
    setAddingToCart(true);
    track("add_to_cart", { slug: product.slug });
    const price = parseFloat(String(defaultVariant.price));
    addItem({
      id: defaultVariant.id,
      productId: product.id,
      slug: product.slug,
      variantId: defaultVariant.id,
      name: product.name,
      variantName: defaultVariant.name ?? "Default",
      price,
      image: primaryImage?.url ?? "",
      stock: defaultVariant.stock,
      sku: defaultVariant.sku,
    });
    toast.success(`${product.name} added to cart`, {
      description: formatPrice(price),
    });
    setTimeout(() => setAddingToCart(false), 600);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleItem({
      productId: product.id,
      name: product.name,
      price: basePrice,
      image: primaryImage?.url ?? "",
      slug: product.slug,
    });
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <div
      className={cn("group relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden rounded-3xl aspect-[3/4] bg-muted mb-3">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
          {!primaryImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blush to-lilac text-5xl" aria-hidden>
              💖
            </div>
          )}
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                hovered && secondaryImage ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
            />
          )}
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={`${product.name} alternate view`}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                hovered ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isBestSeller && <Badge variant="default">Fave</Badge>}
          {product.isLimitedEdition && <Badge variant="gold">Limited</Badge>}
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleWishlist}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                inWishlist ? "fill-rose-500 text-rose-500" : "text-foreground"
              )}
            />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <Link
              href={`/products/${product.slug}`}
              className="hidden sm:flex p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-colors items-center justify-center"
              aria-label="Quick view"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Quick add */}
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 p-2.5 transition-all duration-200",
            "opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2",
            hovered && "sm:opacity-100 sm:translate-y-0"
          )}
        >
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !defaultVariant}
            className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {addingToCart
              ? "Adding..."
              : !defaultVariant || (product.variants?.length ?? 0) > 1
              ? "Choose options"
              : "Add to treasure box"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.averageRating !== undefined && product.reviewCount !== undefined && product.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(product.averageRating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">{formatPrice(basePrice)}</span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
