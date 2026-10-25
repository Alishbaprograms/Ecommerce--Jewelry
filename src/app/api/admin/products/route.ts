import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { productInputSchema, newSku } from "@/lib/product-schema";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const page = parseInt(searchParams.get("page") ?? "1");

  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: { select: { stock: true }, where: { deletedAt: null } },
        category: { select: { name: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products: JSON.parse(JSON.stringify(products, (_, v) =>
      typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
    )),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = productInputSchema.parse(await request.json());

    let slug = slugify(data.name) || "product";
    if (await db.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now()}`;

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
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
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            altText: data.name,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        },
        variants: {
          create: data.variants.map((v, i) => ({
            name: v.name,
            sku: newSku(),
            price: v.price ?? data.basePrice,
            stock: v.stock,
            isDefault: i === 0,
          })),
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
    }
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
