import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const page = parseInt(searchParams.get("page") ?? "1");
  const skip = (page - 1) * limit;
  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const sort = searchParams.get("sort") ?? "createdAt_desc";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");

  try {
    const where: Record<string, unknown> = {
      status: "ACTIVE",
      deletedAt: null,
    };

    if (filter === "new-arrivals") where.isNewArrival = true;
    if (filter === "best-sellers") where.isBestSeller = true;
    if (filter === "featured") where.isFeatured = true;
    if (filter === "limited") where.isLimitedEdition = true;
    if (filter === "sale") where.compareAtPrice = { not: null };

    if (category) where.category = { slug: category };

    if (collection) {
      where.collections = {
        some: { collection: { slug: collection } },
      };
    }

    if (minPrice || maxPrice) {
      where.basePrice = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [sortField, sortDir] = sort.split("_");
    const orderBy: Record<string, string> = {};
    orderBy[sortField === "price" ? "basePrice" : sortField] =
      sortDir === "asc" ? "asc" : "desc";

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          slug: true,
          name: true,
          basePrice: true,
          compareAtPrice: true,
          isNewArrival: true,
          isBestSeller: true,
          isLimitedEdition: true,
          averageRating: true,
          reviewCount: true,
          images: {
            orderBy: { sortOrder: "asc" },
            select: { url: true, isPrimary: true, altText: true },
          },
          variants: {
            where: { isActive: true, deletedAt: null },
            select: { id: true, sku: true, stock: true, price: true },
            take: 1,
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
