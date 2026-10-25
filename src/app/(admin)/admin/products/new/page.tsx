"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="font-serif text-3xl font-light mb-8">Add a product</h1>
      <ProductForm onSuccess={() => router.push("/admin/products")} />
    </div>
  );
}
