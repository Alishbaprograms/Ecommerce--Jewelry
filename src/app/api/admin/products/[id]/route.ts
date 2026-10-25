import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { productInputSchema, newSku } from "@/lib/product-schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { include: { attributes: true }, where: { deletedAt: null } },
      category: true,
      collections: { include: { collection: true } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ product: JSON.parse(JSON.stringify(product, (_, v) =>
    typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
  ))});
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const data = productInputSchema.parse(await request.json());
    const existing = await db.productVariant.findMany({
      where: { productId: id, deletedAt: null },
      select: { id: true },
    });
    const keepIds = new Set(data.variants.map((v) => v.id).filter(Boolean) as string[]);

    await db.$transaction([
      db.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || null,
          shortDescription: data.shortDescription || null,
          status: data.status,
          categoryId: data.categoryId || null,
          basePrice: data.basePrice,
          compareAtPrice: data.compareAtPrice ?? null,
          tags: data.tags,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
        },
      }),
      db.productImage.deleteMany({ where: { productId: id } }),
      db.productImage.createMany({
        data: data.images.map((img, i) => ({
          productId: id,
          url: img.url,
          altText: data.name,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      }),
      // Variants that were removed in the form are soft-deleted: past orders still point at them.
      db.productVariant.updateMany({
        where: { id: { in: existing.map((v) => v.id).filter((vid) => !keepIds.has(vid)) } },
        data: { deletedAt: new Date(), isActive: false },
      }),
      ...data.variants.map((v, i) =>
        v.id
          ? db.productVariant.update({
              where: { id: v.id },
              data: { name: v.name, price: v.price ?? data.basePrice, stock: v.stock, isDefault: i === 0 },
            })
          : db.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                sku: newSku(),
                price: v.price ?? data.basePrice,
                stock: v.stock,
                isDefault: i === 0,
              },
            })
      ),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
    }
    console.error("[PATCH /api/admin/products/:id]", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
