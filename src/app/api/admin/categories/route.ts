import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      isActive: true,
      _count: { select: { products: { where: { deletedAt: null } } } },
    },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  let slug = slugify(name) || "category";
  if (await db.category.findUnique({ where: { slug } })) slug = `${slug}-${Date.now()}`;

  const category = await db.category.create({
    data: {
      name,
      slug,
      description: body.description ? String(body.description) : null,
      image: body.image ? String(body.image) : null,
    },
  });
  return NextResponse.json({ category }, { status: 201 });
}
