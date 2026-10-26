"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pin, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartoonStar } from "@/components/store/cartoon-icons";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface AdminReview {
  id: string;
  rating: number;
  guestName: string | null;
  guestCity: string | null;
  kidAge: string | null;
  tags: string[];
  verified: boolean;
  body: string | null;
  images: string[];
  adminReply: string | null;
  isPinned: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  product: { name: string; slug: string };
}

const TABS = [
  { id: "PENDING", label: "To approve" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Hidden" },
] as const;

function ReviewCard({ r, onChange }: { r: AdminReview; onChange: (patch: Record<string, unknown>) => void }) {
  const [reply, setReply] = useState(r.adminReply ?? "");
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-zinc-900">
            {r.guestName ?? "Guest"}
            {r.guestCity && <span className="font-normal text-zinc-500"> · {r.guestCity}</span>}
            {r.verified && <Badge variant="success" className="ml-2">Verified buyer</Badge>}
          </p>
          <div className="mt-1 flex">
            {[1, 2, 3, 4, 5].map((n) => <CartoonStar key={n} className="h-4 w-4" filled={n <= r.rating} />)}
          </div>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <Link href={`/products/${r.product.slug}`} target="_blank" className="underline">{r.product.name}</Link>
          <p>{formatDate(r.createdAt, { month: "short", day: "numeric" })}</p>
        </div>
      </div>

      {(r.kidAge || r.tags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {r.kidAge && <span className="rounded-full bg-violet-100 px-2.5 py-0.5">For ages {r.kidAge}</span>}
          {r.tags.map((t) => <span key={t} className="rounded-full bg-pink-100 px-2.5 py-0.5">{t}</span>)}
        </div>
      )}
      {r.body && <p className="mt-3 text-sm text-zinc-700 whitespace-pre-line">{r.body}</p>}
      {r.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {r.images.map((u) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="relative h-20 w-20 overflow-hidden rounded-lg bg-zinc-100">
              <Image src={u} alt="" fill sizes="80px" className="object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs font-medium text-zinc-500">Your reply (shown under the review)</label>
        <div className="mt-1 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={500}
            placeholder="Thank you so much! 💖"
            className="h-9 flex-1 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-900 focus:outline-none"
          />
          <Button size="sm" variant="outline" onClick={() => onChange({ adminReply: reply })} disabled={reply === (r.adminReply ?? "")}>
            Save
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {r.status !== "APPROVED" && (
          <Button size="sm" onClick={() => onChange({ status: "APPROVED" })}><Check className="mr-1 h-4 w-4" /> Approve</Button>
        )}
        {r.status !== "REJECTED" && (
          <Button size="sm" variant="outline" onClick={() => onChange({ status: "REJECTED" })}><X className="mr-1 h-4 w-4" /> Hide</Button>
        )}
        {r.status === "APPROVED" && (
          <Button size="sm" variant="outline" onClick={() => onChange({ isPinned: !r.isPinned })}>
            <Pin className="mr-1 h-4 w-4" /> {r.isPinned ? "Unpin" : "Pin to top"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", tab],
    queryFn: async () => (await fetch(`/api/admin/reviews?status=${tab}`)).json(),
  });
  const reviews: AdminReview[] = data?.reviews ?? [];
  const counts: Record<string, number> = data?.counts ?? {};

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Saved");
    },
    onError: () => toast.error("Could not save"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Reviews</h1>
        <p className="mt-1 text-sm text-zinc-500">New reviews wait here. Approve the ones you want on the product page.</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm ${tab === t.id ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
          >
            {t.label} <span className="text-zinc-400">({counts[t.id] ?? 0})</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">Nothing here yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="relative">
              <ReviewCard r={r} onChange={(patch) => update.mutate({ id: r.id, patch })} />
              <button
                onClick={() => { if (confirm("Delete this review for good?")) remove.mutate(r.id); }}
                className="absolute bottom-4 right-4 text-zinc-400 hover:text-red-600 sm:bottom-5 sm:right-5"
                aria-label="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
