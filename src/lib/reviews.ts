import { db } from "@/lib/db";

/** Keep Product.averageRating / reviewCount in step with the approved reviews. */
export async function recomputeProductRating(productId: string) {
  const agg = await db.review.aggregate({
    where: { productId, status: "APPROVED", deletedAt: null },
    _avg: { rating: true },
    _count: true,
  });
  await db.product.update({
    where: { id: productId },
    data: { averageRating: Math.round((agg._avg.rating ?? 0) * 100) / 100, reviewCount: agg._count },
  });
}
