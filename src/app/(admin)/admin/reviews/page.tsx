import React from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews — Admin" };

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  const serialized = JSON.parse(JSON.stringify(reviews, (_, v) =>
    typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
  ));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Reviews</h1>
        <p className="text-muted-foreground mt-1 text-sm">Moderate customer reviews</p>
      </div>

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              {["Customer", "Product", "Rating", "Review", "Date", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serialized.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">No reviews yet</td></tr>
            ) : serialized.map((r: typeof serialized[0]) => (
              <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                </td>
                <td className="px-4 py-3 max-w-[150px] truncate">{r.product?.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="truncate">{r.comment}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "destructive" : "secondary"}>
                    {r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3"><ReviewActions id={r.id} status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
