"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type FormValues = {
  name: string;
  shortDescription: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  categoryId: string;
  basePrice: string;
  compareAtPrice: string;
  costPrice: string;
  material: string;
  metalType: string;
  metalPurity: string;
  stoneType: string;
  careInstructions: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  engravingEnabled: boolean;
  giftWrapEnabled: boolean;
  metaTitle: string;
  metaDescription: string;
  tags: string;
};

type Variant = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  isDefault: boolean;
};

interface Props {
  product?: {
    id: string;
    name: string;
    shortDescription?: string;
    description?: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    categoryId?: string;
    basePrice: string;
    compareAtPrice?: string;
    costPrice?: string;
    material?: string;
    metalType?: string;
    metalPurity?: string;
    stoneType?: string;
    careInstructions?: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    engravingEnabled: boolean;
    giftWrapEnabled: boolean;
    metaTitle?: string;
    metaDescription?: string;
    tags: string[];
    variants: Variant[];
    images: Array<{ id: string; url: string; isPrimary: boolean }>;
  };
  onSuccess: () => void;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-foreground bg-background";
const checkboxRow = (label: string, key: keyof FormValues, register: ReturnType<typeof useForm<FormValues>>["register"]) => (
  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
    <input type="checkbox" {...register(key as never)} className="h-4 w-4" />
    {label}
  </label>
);

export function ProductForm({ product, onSuccess }: Props) {
  const isEditing = !!product;

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.map((v) => ({ ...v, price: v.price?.toString() ?? "", stock: String(v.stock ?? 0) })) ?? [
      { name: "Default", sku: "", price: "", stock: "0", isDefault: true },
    ]
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) return { categories: [] };
      return res.json();
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      status: product?.status ?? "DRAFT",
      categoryId: product?.categoryId ?? "",
      basePrice: product?.basePrice ?? "",
      compareAtPrice: product?.compareAtPrice ?? "",
      costPrice: product?.costPrice ?? "",
      material: product?.material ?? "",
      metalType: product?.metalType ?? "",
      metalPurity: product?.metalPurity ?? "",
      stoneType: product?.stoneType ?? "",
      careInstructions: product?.careInstructions ?? "",
      isFeatured: product?.isFeatured ?? false,
      isNewArrival: product?.isNewArrival ?? false,
      isBestSeller: product?.isBestSeller ?? false,
      engravingEnabled: product?.engravingEnabled ?? false,
      giftWrapEnabled: product?.giftWrapEnabled ?? true,
      metaTitle: product?.metaTitle ?? "",
      metaDescription: product?.metaDescription ?? "",
      tags: product?.tags?.join(", ") ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        basePrice: Number(values.basePrice),
        compareAtPrice: values.compareAtPrice === "" ? undefined : Number(values.compareAtPrice),
        costPrice: values.costPrice === "" ? undefined : Number(values.costPrice),
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        variants: variants.map((v) => ({
          ...v,
          price: Number(v.price) || 0,
          stock: parseInt(v.stock) || 0,
        })),
      };

      const url = isEditing ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast.success(isEditing ? "Product updated" : "Product created");
      onSuccess();
    },
    onError: () => toast.error("Failed to save product"),
  });

  function addVariant() {
    setVariants((v) => [...v, { name: "", sku: "", price: "", stock: "0", isDefault: false }]);
  }

  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  function updateVariant(i: number, key: keyof Variant, value: string | boolean) {
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-8">
      {/* Basic Info */}
      <section className="border border-border p-6 space-y-4">
        <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Basic Information</h2>
        <Field label="Product Name" error={errors.name?.message}>
          <input {...register("name")} className={inputCls} placeholder="e.g. Aurora Diamond Ring" />
        </Field>
        <Field label="Short Description">
          <input {...register("shortDescription")} className={inputCls} placeholder="One-line summary shown on cards" />
        </Field>
        <Field label="Full Description">
          <textarea {...register("description")} rows={5} className={inputCls} placeholder="Detailed product description..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select {...register("status")} className={inputCls}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
          <Field label="Category">
            <select {...register("categoryId")} className={inputCls}>
              <option value="">— No category —</option>
              {categoriesData?.categories?.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Pricing */}
      <section className="border border-border p-6 space-y-4">
        <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Pricing (PKR)</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Base Price" error={errors.basePrice?.message}>
            <input {...register("basePrice")} type="number" step="1" className={inputCls} placeholder="0" />
          </Field>
          <Field label="Compare At Price">
            <input {...register("compareAtPrice")} type="number" step="1" className={inputCls} placeholder="0" />
          </Field>
          <Field label="Cost Price">
            <input {...register("costPrice")} type="number" step="1" className={inputCls} placeholder="0" />
          </Field>
        </div>
      </section>

      {/* Variants */}
      <section className="border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Variants & Stock</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4 mr-1" />Add Variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                {i === 0 && <p className="text-xs text-muted-foreground mb-1">Name</p>}
                <input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)}
                  className={inputCls} placeholder="e.g. Size 6" />
              </div>
              <div className="col-span-3">
                {i === 0 && <p className="text-xs text-muted-foreground mb-1">SKU</p>}
                <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  className={inputCls} placeholder="SKU-001" />
              </div>
              <div className="col-span-2">
                {i === 0 && <p className="text-xs text-muted-foreground mb-1">Price</p>}
                <input value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)}
                  type="number" className={inputCls} placeholder="0" />
              </div>
              <div className="col-span-2">
                {i === 0 && <p className="text-xs text-muted-foreground mb-1">Stock</p>}
                <input value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  type="number" className={inputCls} placeholder="0" />
              </div>
              <div className="col-span-1 flex items-center justify-center pb-0.5">
                {i === 0 && <p className="text-xs text-muted-foreground mb-1 invisible">D</p>}
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="checkbox" checked={v.isDefault} onChange={(e) => updateVariant(i, "isDefault", e.target.checked)} />
                  Default
                </label>
              </div>
              <div className="col-span-1 flex justify-end">
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Material & Details */}
      <section className="border border-border p-6 space-y-4">
        <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Material & Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Material">
            <input {...register("material")} className={inputCls} placeholder="e.g. 18K Gold" />
          </Field>
          <Field label="Metal Type">
            <select {...register("metalType")} className={inputCls}>
              <option value="">— Select —</option>
              {["Gold", "Silver", "Rose Gold", "Platinum", "Mixed Metal"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Metal Purity">
            <input {...register("metalPurity")} className={inputCls} placeholder="e.g. 18K, 925" />
          </Field>
          <Field label="Stone Type">
            <input {...register("stoneType")} className={inputCls} placeholder="e.g. Diamond, Pearl" />
          </Field>
        </div>
        <Field label="Care Instructions">
          <textarea {...register("careInstructions")} rows={3} className={inputCls} placeholder="How to care for this piece..." />
        </Field>
        <Field label="Tags (comma separated)">
          <input {...register("tags")} className={inputCls} placeholder="rings, gold, diamond, engagement" />
        </Field>
      </section>

      {/* Flags */}
      <section className="border border-border p-6 space-y-3">
        <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground mb-2">Product Flags</h2>
        <div className="grid grid-cols-2 gap-3">
          {checkboxRow("Featured", "isFeatured", register)}
          {checkboxRow("New Arrival", "isNewArrival", register)}
          {checkboxRow("Best Seller", "isBestSeller", register)}
          {checkboxRow("Engraving Enabled", "engravingEnabled", register)}
          {checkboxRow("Gift Wrap Enabled", "giftWrapEnabled", register)}
        </div>
      </section>

      {/* SEO */}
      <section className="border border-border p-6 space-y-4">
        <h2 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">SEO</h2>
        <Field label="Meta Title">
          <input {...register("metaTitle")} className={inputCls} placeholder="SEO title" />
        </Field>
        <Field label="Meta Description">
          <textarea {...register("metaDescription")} rows={2} className={inputCls} placeholder="SEO description (max 160 chars)" />
        </Field>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
      </div>
    </form>
  );
}
