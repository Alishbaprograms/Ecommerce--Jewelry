import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
