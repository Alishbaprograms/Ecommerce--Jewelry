import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1).default("PK"),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await db.address.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses: JSON.parse(JSON.stringify(addresses, (_, v) =>
    typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
  )) });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = addressSchema.parse(body);

  if (data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await db.address.create({
    data: { ...data, userId: session.user.id },
  });

  return NextResponse.json({ address }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.address.updateMany({
    where: { id, userId: session.user.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
