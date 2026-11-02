import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public: serves a stored photo. Ids never change their picture, so browsers and the CDN may keep them forever.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/.test(id)) return new NextResponse(null, { status: 404 });

  const image = await db.storedImage.findUnique({ where: { id }, select: { data: true, contentType: true, size: true } });
  if (!image) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
