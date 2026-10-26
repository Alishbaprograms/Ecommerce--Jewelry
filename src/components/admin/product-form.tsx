"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { shrinkImage } from "@/lib/shrink-image";

type Variant = { id?: string; name: string; price: string; stock: string };

export interface ProductFormProduct {
  id: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  categoryId?: string | null;
  basePrice: string;
  compareAtPrice?: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  variants: Array<{ id: string; name: string; price: string; stock: number }>;
  images: Array<{ id: string; url: string }>;
}

const inputCls =
  "w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-zinc-900";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-800 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

export function ProductForm({ product, onSuccess }: { product?: ProductFormProduct; onSuccess: () => void }) {
  const isEditing = !!product;
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product?.basePrice ? String(Number(product.basePrice)) : "");
  const [comparePrice, setComparePrice] = useState(
    product?.compareAtPrice ? String(Number(product.compareAtPrice)) : ""
  );
  const [visible, setVisible] = useState((product?.status ?? "ACTIVE") === "ACTIVE");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? true);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [images, setImages] = useState<string[]>(product?.images?.map((i) => i.url) ?? []);
  const [uploading, setUploading] = useState(false);

  const [hasOptions, setHasOptions] = useState((product?.variants?.length ?? 0) > 1);
  const [stock, setStock] = useState(String(product?.variants?.[0]?.stock ?? 10));
  const [variants, setVariants] = useState<Variant[]>(
    product && product.variants.length > 1
      ? product.variants.map((v) => ({ id: v.id, name: v.name, price: "", stock: String(v.stock) }))
      : [{ name: "", price: "", stock: "10" }]
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      return res.ok ? res.json() : { categories: [] };
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const original of Array.from(files)) {
        const file = await shrinkImage(original);
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const basePrice = Number(price);
      if (!name.trim()) throw new Error("Please enter a product name");
      if (!basePrice || basePrice <= 0) throw new Error("Please enter a price");

      const payloadVariants = hasOptions
        ? variants
            .filter((v) => v.name.trim())
            .map((v) => ({
              id: v.id,
              name: v.name.trim(),
              price: v.price ? Number(v.price) : null,
              stock: parseInt(v.stock) || 0,
            }))
        : [{ id: product?.variants?.[0]?.id, name: "Default", price: null, stock: parseInt(stock) || 0 }];
      if (payloadVariants.length === 0) throw new Error("Add at least one option, or turn options off");

      const res = await fetch(isEditing ? `/api/admin/products/${product!.id}` : "/api/admin/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description,
          categoryId: categoryId || null,
          basePrice,
          compareAtPrice: comparePrice ? Number(comparePrice) : null,
          status: visible ? "ACTIVE" : "DRAFT",
          isFeatured,
          isNewArrival,
          isBestSeller,
          images: images.map((url) => ({ url })),
          variants: payloadVariants,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to save");
      return data;
    },
    onSuccess: () => {
      toast.success(isEditing ? "Product saved" : "Product added");
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const check = (label: string, value: boolean, set: (v: boolean) => void) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-6"
    >
      <section className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900">Photos</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
              <Image src={url} alt="" fill sizes="150px" className="object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">Main</span>
              )}
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 hover:bg-white"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 text-xs"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {uploading ? "Uploading..." : "Add photo"}
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-xs text-zinc-500">The first photo is the main one shown in the shop.</p>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900">Details</h2>
        <Field label="Product name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Rainbow Bead Necklace" />
        </Field>
        <Field label="Description">
          <textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputCls} placeholder="Tell parents what it is, materials, size, safety notes..." />
        </Field>
        <Field label="Category">
          <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
            <option value="">No category</option>
            {categoriesData?.categories?.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900">Price</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (Rs.)">
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="1500" />
          </Field>
          <Field label="Old price (optional)" hint="Fill this in to show a sale: old price crossed out.">
            <input type="number" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className={inputCls} placeholder="2000" />
          </Field>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900">Stock</h2>
        {!hasOptions ? (
          <Field label="How many in stock?">
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={`${inputCls} max-w-[200px]`} />
          </Field>
        ) : (
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-zinc-500">
              <span className="col-span-5">Option (e.g. Pink, Blue)</span>
              <span className="col-span-3">Price (optional)</span>
              <span className="col-span-3">Stock</span>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-center rounded-lg border border-zinc-100 p-2 sm:border-0 sm:p-0">
                <input className={`${inputCls} col-span-6 sm:col-span-5`} value={v.name} placeholder="Option, e.g. Pink"
                  onChange={(e) => setVariants((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <input type="number" min="0" className={`${inputCls} col-span-3`} value={v.price} placeholder="Price (same)"
                  onChange={(e) => setVariants((all) => all.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
                <input type="number" min="0" className={`${inputCls} col-span-2 sm:col-span-3`} placeholder="Stock" value={v.stock}
                  onChange={(e) => setVariants((all) => all.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))} />
                <button type="button" className="col-span-1 text-zinc-400 hover:text-red-600 flex justify-center p-2"
                  onClick={() => setVariants((all) => all.filter((_, j) => j !== i))} aria-label="Remove option">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants((all) => [...all, { name: "", price: "", stock: "10" }])}>
              <Plus className="h-4 w-4 mr-1" /> Add option
            </Button>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="h-4 w-4" checked={hasOptions} onChange={(e) => setHasOptions(e.target.checked)} />
          This product comes in different colours / sizes
        </label>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-3">
        <h2 className="font-semibold text-zinc-900">Show in shop</h2>
        {check("Visible in the shop (untick to hide it)", visible, setVisible)}
        {check("Mark as New", isNewArrival, setIsNewArrival)}
        {check("Mark as Best Seller", isBestSeller, setIsBestSeller)}
        {check("Feature on the home page", isFeatured, setIsFeatured)}
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending || uploading}>
          {mutation.isPending ? "Saving..." : isEditing ? "Save changes" : "Add product"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
      </div>
    </form>
  );
}
