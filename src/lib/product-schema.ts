import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  categoryId: z.string().optional().nullable(),
  basePrice: z.number().positive("Price must be more than 0"),
  compareAtPrice: z.number().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  images: z.array(z.object({ url: z.string().url() })).default([]),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        price: z.number().nonnegative().optional().nullable(),
        stock: z.number().int().nonnegative(),
      })
    )
    .min(1, "Add at least one stock entry"),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function newSku() {
  return `ZH-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}
