import { db } from "@/lib/db";

// The one place that knows where uploaded photos live (currently the Neon database).
// To switch to Supabase Storage, S3, etc., change saveImage / removeImages / isOwnImage and nothing else.

export type ImageKind = "product" | "review";

const MAX_SIDE = 1600; // pixels, longest edge
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export class ImageError extends Error {}

const FALLBACK_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const FALLBACK_MAX_BYTES = 4 * 1024 * 1024;

/**
 * Resizes and compresses a photo, stores it, and returns the web address to use for it.
 * `mime` is the browser-reported type. It is only used if the image tool can't run on the server: the admin page
 * and review form already shrink photos in the browser, so storing the file as-is is a safe fallback.
 */
export async function saveImage(input: Buffer, kind: ImageKind, mime = ""): Promise<string> {
  if (input.length > MAX_INPUT_BYTES) throw new ImageError("That photo is too big (max 10 MB).");

  let data: Buffer = input;
  let contentType = mime;

  // Loaded here (not at the top of the file) so a problem loading the tool can't crash every request.
  let sharp: ((input: Buffer) => import("sharp").Sharp) | null = null;
  try {
    const mod = await import("sharp");
    sharp = (mod.default ?? mod) as unknown as (input: Buffer) => import("sharp").Sharp;
  } catch (error) {
    console.error("[image-store] sharp could not load; storing the photo unprocessed", error);
  }

  if (sharp) {
    try {
      data = await sharp(input)
        .rotate() // respect the phone's orientation
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      contentType = "image/webp";
    } catch {
      throw new ImageError("That file doesn't look like a photo we can use. Try a JPG or PNG.");
    }
  } else if (!FALLBACK_TYPES.has(mime) || input.length > FALLBACK_MAX_BYTES) {
    throw new ImageError("Photos can't be processed right now. Please try a smaller JPG or PNG.");
  }

  const row = await db.storedImage.create({
    data: { kind, contentType, size: data.length, data: new Uint8Array(data) },
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
