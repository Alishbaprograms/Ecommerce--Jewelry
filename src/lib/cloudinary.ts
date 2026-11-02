import { v2 as cloudinary } from "cloudinary";

// Values pasted into Vercel often carry a stray space, new line or pair of quote marks. Clean them so a
// harmless copy-paste slip doesn't make every upload fail.
function clean(value: string | undefined) {
  return (value ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
}

export const cloudinaryEnv = {
  cloudName: clean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: clean(process.env.CLOUDINARY_API_KEY),
  apiSecret: clean(process.env.CLOUDINARY_API_SECRET),
};

export const cloudinaryReady = Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.apiKey && cloudinaryEnv.apiSecret);

cloudinary.config({
  cloud_name: cloudinaryEnv.cloudName,
  api_key: cloudinaryEnv.apiKey,
  api_secret: cloudinaryEnv.apiSecret,
});

/** Cloudinary reports errors as plain objects, not Error instances; pull out the readable message. */
export function cloudinaryMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message: unknown }).message);
  return "Unknown error";
}

export { cloudinary };

export async function uploadImage(
  file: string,
  folder = "jewelry",
  options: Record<string, unknown> = {}
) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
    transformation: [
      { quality: "auto:best" },
      { fetch_format: "auto" },
    ],
    ...options,
  });
  return result;
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  url: string,
  width?: number,
  height?: number,
  quality = "auto"
): string {
  if (!url.includes("cloudinary.com")) return url;
  const transformations = [`q_${quality}`, "f_auto"];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`, "c_fill");
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;
  return (
    url.slice(0, uploadIndex + 8) +
    transformations.join(",") +
    "/" +
    url.slice(uploadIndex + 8)
  );
}
