import sharp from "sharp";
import { db } from "@/lib/db";

// The one place that knows where uploaded photos live (currently the Neon database).
// To switch to Supabase Storage, S3, etc., change saveImage / removeImages / isOwnImage and nothing else.

export type ImageKind = "product" | "review";

const MAX_SIDE = 1600; // pixels, longest edge
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export class ImageError extends Error {}

/** Resizes and compresses a photo, stores it, and returns the web address to use for it. */
export async function saveImage(input: Buffer, kind: ImageKind): Promise<string> {
  if (input.length > MAX_INPUT_BYTES) throw new ImageError("That photo is too big (max 10 MB).");

  let processed: Buffer;
  try {
    processed = await sharp(input)
      .rotate() // respect the phone's orientation
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new ImageError("That file doesn't look like a photo we can use. Try a JPG or PNG.");
  }

  const row = await db.storedImage.create({
    data: { kind, contentType: "image/webp", size: processed.length, data: new Uint8Array(processed) },
    select: { id: true },
  });
  return `/api/img/${row.id}`;
}

const OWN = /^\/api\/img\/([a-z0-9]+)$/;

export function ownImageId(url: string) {
  return OWN.exec(url)?.[1] ?? null;
}

export async function isOwnImage(url: string, kind: ImageKind) {
  const id = ownImageId(url);
  if (!id) return false;
  return (await db.storedImage.count({ where: { id, kind } })) > 0;
}

/** Deletes stored photos that nothing uses any more (called after a product's photos change). */
export async function removeUnusedImages(urls: string[]) {
  for (const url of urls) {
    const id = ownImageId(url);
    if (!id) continue;
    const used =
      (await db.productImage.count({ where: { url } })) + (await db.review.count({ where: { images: { has: url } } }));
    if (used === 0) await db.storedImage.deleteMany({ where: { id } });
  }
}
