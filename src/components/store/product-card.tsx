"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
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
  variants?: Array<{ id: string; sku: string; stock: number; price: number }>;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const secondaryImage = product.images[1];

  const discount = product.compareAtPrice
    ? getDiscountPercentage(product.compareAtPrice, product.basePrice)
    : 0;

  const defaultVariant = product.variants?.[0];

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!defaultVariant) {
      toast.info("Please select options on the product page");
      return;
    }
    setAddingToCart(true);
    addItem({
      id: defaultVariant.id,
      productId: product.id,
      variantId: defaultVariant.id,
      name: product.name,
      variantName: "Default",
      price: defaultVariant.price,
      image: primaryImage?.url ?? "",
      stock: defaultVariant.stock,
      sku: defaultVariant.sku,
    });
    toast.success(`${product.name} added to bag`, {
      description: formatPrice(defaultVariant.price),
    });
    setTimeout(() => setAddingToCart(false), 600);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.basePrice,
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
      <div className="relative overflow-hidden aspect-[3/4] bg-muted mb-4">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
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
          {product.isBestSeller && <Badge variant="default">Best Seller</Badge>}
          {product.isLimitedEdition && <Badge variant="gold">Limited</Badge>}
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            onClick={handleWishlist}
            className="p-2 bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
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
              className="p-2 bg-background/90 backdrop-blur-sm hover:bg-background transition-colors flex items-center justify-center"
              aria-label="Quick view"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Quick add */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-0 inset-x-0"
        >
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !defaultVariant}
            className="w-full py-3 bg-foreground text-background text-[11px] tracking-widest uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
            {addingToCart ? "Adding..." : defaultVariant ? "Add to Bag" : "Select Options"}
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium hover:text-muted-foreground transition-colors line-clamp-1">
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
          <span className="text-sm font-medium">{formatPrice(product.basePrice)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
