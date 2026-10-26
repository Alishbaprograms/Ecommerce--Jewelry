"use client";

import React, { useEffect, useState } from "react";
import { track } from "@/lib/track";
import { FREE_SHIPPING_OVER, SHIPPING_FLAT } from "@/lib/shop-config";
import Image from "next/image";
import { TreasureChest } from "@/components/store/treasure-chest";
import { CartoonStar } from "@/components/store/cartoon-icons";
import { ReviewsSection, type ReviewItem, type ReviewSummary } from "@/components/store/reviews-section";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Gift,
  Truck,
  Banknote,
  PhoneCall,
  ChevronDown,
} from "lucide-react";
import { formatPrice, cn, isLowStock, isInStock } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: string;
  compareAtPrice: string | null;
  material: string | null;
  metalType: string | null;
  metalPurity: string | null;
  stoneType: string | null;
  dimensions: string | null;
  careInstructions: string | null;
  engravingEnabled: boolean;
  giftWrapEnabled: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isLimitedEdition: boolean;
  averageRating: string;
  reviewCount: number;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    type: string;
  }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: string;
    compareAtPrice: string | null;
    stock: number;
    isDefault: boolean;
    attributes: Array<{ name: string; value: string }>;
  }>;
  category: { name: string; slug: string } | null;
}

interface Props {
  product: Product;
  reviews: ReviewItem[];
  reviewSummary: ReviewSummary;
}

const accordionItems = [
  {
    id: "details",
    label: "Product Details",
    icon: null,
  },
  {
    id: "care",
    label: "Care Instructions",
    icon: null,
  },
  {
    id: "shipping",
    label: "Delivery",
    icon: null,
  },
];

export function ProductPageClient({ product, reviews, reviewSummary }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.isDefault) ?? product.variants[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [engravingText, setEngravingText] = useState("");
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const price = selectedVariant
    ? parseFloat(selectedVariant.price)
    : parseFloat(product.basePrice);
  const comparePrice = selectedVariant?.compareAtPrice
    ? parseFloat(selectedVariant.compareAtPrice)
    : product.compareAtPrice
    ? parseFloat(product.compareAtPrice)
    : null;

  const stock = selectedVariant?.stock ?? 0;
  const inStock = isInStock(stock);
  const lowStock = isLowStock(stock);

  const groupedAttributes: Record<string, string[]> = {};
  product.variants.forEach((v) => {
    v.attributes.forEach((a) => {
      if (!groupedAttributes[a.name]) groupedAttributes[a.name] = [];
      if (!groupedAttributes[a.name].includes(a.value)) {
        groupedAttributes[a.name].push(a.value);
      }
    });
  });

  useEffect(() => {
    track("product_view", { slug: product.slug });
  }, [product.slug]);

  function handleAddToCart() {
    if (!selectedVariant || !inStock) return;
    track("add_to_cart", { slug: product.slug });
    setIsAddingToCart(true);
    addItem({
      id: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price,
      image: product.images[0]?.url ?? "",
      stock,
      sku: selectedVariant.sku,
      quantity,
      engravingText: engravingText || undefined,
    });
    setTimeout(() => setIsAddingToCart(false), 600);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  }

  const avgRating = parseFloat(product.averageRating);

  return (
    <div className="pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/collections/${product.category.slug}`} className="hover:text-foreground transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {product.images[selectedImageIndex] && (
                    <Image
                      src={product.images[selectedImageIndex].url}
                      alt={product.images[selectedImageIndex].altText ?? product.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((i) => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewArrival && <Badge variant="new">New</Badge>}
                {product.isBestSeller && <Badge>Best Seller</Badge>}
                {product.isLimitedEdition && <Badge variant="gold">Limited Edition</Badge>}
                {comparePrice && (
                  <Badge variant="sale">
                    Save {Math.round(((comparePrice - price) / comparePrice) * 100)}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      "relative h-20 w-16 shrink-0 overflow-hidden bg-muted border-2 transition-colors",
                      i === selectedImageIndex ? "border-foreground" : "border-transparent"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `View ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Title & rating */}
            <div>
              {product.category && (
                <Link
                  href={`/collections/${product.category.slug}`}
                  className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl font-light mt-1 mb-3">
                {product.name}
              </h1>

              <a href="#reviews" className="inline-flex items-center gap-2">
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <CartoonStar key={n} className="h-5 w-5" filled={product.reviewCount > 0 && n <= Math.round(avgRating)} />
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {product.reviewCount > 0
                    ? `${avgRating.toFixed(1)} (${product.reviewCount} review${product.reviewCount > 1 ? "s" : ""})`
                    : "Be the first to review"}
                </span>
              </a>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl">{formatPrice(price)}</span>
              {comparePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <Separator />

            {/* Simple options (colour / size) when the product has no attribute groups */}
            {Object.keys(groupedAttributes).length === 0 && product.variants.length > 1 && (
              <div>
                <label className="text-xs tracking-widest uppercase font-medium block mb-3">
                  Choose: <span className="font-normal text-muted-foreground">{selectedVariant?.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock <= 0}
                      className={cn(
                        "px-4 py-2 text-sm border rounded-full transition-all duration-200",
                        selectedVariant?.id === v.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground",
                        v.stock <= 0 && "opacity-40 cursor-not-allowed line-through"
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant selection */}
            {Object.entries(groupedAttributes).map(([attrName, values]) => (
              <div key={attrName}>
                <label className="text-xs tracking-widest uppercase font-medium block mb-3">
                  {attrName}: <span className="font-normal text-muted-foreground">
                    {selectedVariant?.attributes.find((a) => a.name === attrName)?.value}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const variant = product.variants.find((v) =>
                      v.attributes.some((a) => a.name === attrName && a.value === value)
                    );
                    const available = (variant?.stock ?? 0) > 0;
                    const isSelected = selectedVariant?.attributes.some(
                      (a) => a.name === attrName && a.value === value
                    );

                    return (
                      <button
                        key={value}
                        onClick={() => variant && setSelectedVariant(variant)}
                        disabled={!available}
                        className={cn(
                          "px-4 py-2 text-sm border transition-all duration-200",
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground",
                          !available && "opacity-40 cursor-not-allowed line-through"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Stock status */}
            <div>
              {!inStock ? (
                <p className="text-sm text-destructive font-medium">Out of Stock</p>
              ) : lowStock ? (
                <p className="text-sm text-amber-600 font-medium">Only {stock} left</p>
              ) : (
                <p className="text-sm text-emerald-600 font-medium">In Stock</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs tracking-widest uppercase font-medium block mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-0 border border-border w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 hover:bg-muted transition-colors"
                  aria-label="Decrease"
                >
                  <span className="text-lg leading-none">−</span>
                </button>
                <span className="w-12 text-center text-sm tabular-nums py-2.5">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                  className="px-4 py-2.5 hover:bg-muted transition-colors disabled:opacity-40"
                  aria-label="Increase"
                >
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>
            </div>

            {/* Engraving */}
            {product.engravingEnabled && (
              <div>
                <label className="text-xs tracking-widest uppercase font-medium block mb-2">
                  Personalize (Optional)
                </label>
                <input
                  type="text"
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  maxLength={20}
                  placeholder="Add engraving text (max 20 characters)"
                  className="w-full border border-input px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">{engravingText.length}/20 characters</p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                size="xl"
                className="flex-1 min-w-0 px-4 sm:px-8"
                loading={isAddingToCart}
                disabled={!inStock || !selectedVariant}
              >
                <TreasureChest className="h-5 w-5 mr-2" open />
                {inStock ? "Add to Treasure Box" : "Out of Stock"}
              </Button>
              <button
                onClick={() => toggleItem({
                  productId: product.id,
                  name: product.name,
                  price,
                  image: product.images[0]?.url ?? "",
                  slug: product.slug,
                })}
                className={cn(
                  "shrink-0 p-3 sm:p-4 rounded-xl border border-border hover:border-foreground transition-colors",
                  inWishlist && "bg-foreground text-background border-foreground"
                )}
                aria-label="Add to wishlist"
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
              </button>
              <button
                onClick={handleShare}
                className="shrink-0 p-3 sm:p-4 rounded-xl border border-border hover:border-foreground transition-colors"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-border">
              {[
                { Icon: Truck, label: "Delivered in Pakistan", sub: `Free over Rs. ${FREE_SHIPPING_OVER.toLocaleString("en-PK")}` },
                { Icon: Banknote, label: "Cash on delivery", sub: "Pay when it arrives" },
                { Icon: PhoneCall, label: "We call to confirm", sub: "Before it ships" },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="border-t border-border">
              {accordionItems.map((item) => (
                <div key={item.id} className="border-b border-border">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                    className="flex items-center justify-between w-full py-4 text-left"
                  >
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        openAccordion === item.id && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 text-sm text-muted-foreground leading-relaxed space-y-2">
                          {item.id === "details" && (
                            <>
                              {product.description && <p>{product.description}</p>}
                              <ul className="space-y-1 mt-2">
                                {product.material && <li>Material: {product.material}</li>}
                                {product.metalType && <li>Metal: {product.metalType} {product.metalPurity}</li>}
                                {product.stoneType && <li>Stone: {product.stoneType}</li>}
                                {product.dimensions && <li>Dimensions: {product.dimensions}</li>}
                                {selectedVariant && <li>SKU: {selectedVariant.sku}</li>}
                              </ul>
                            </>
                          )}
                          {item.id === "care" && (
                            <p>
                              {product.careInstructions ?? "Keep away from water, perfume and lotions, and wipe with a soft dry cloth. Take it off before swimming or sleeping, and store it in a small pouch."}
                            </p>
                          )}
                          {item.id === "shipping" && (
                            <>
                              <p>Cash on delivery across Pakistan: pay in cash when your order arrives.</p>
                              <p>Delivery is Rs. {SHIPPING_FLAT}, and free on orders of Rs. {FREE_SHIPPING_OVER.toLocaleString("en-PK")} or more.</p>
                              <p>We call to confirm every order before it ships. Questions? Message us on WhatsApp.</p>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ReviewsSection productId={product.id} productName={product.name} reviews={reviews} summary={reviewSummary} />
      </div>
    </div>
  );
}
