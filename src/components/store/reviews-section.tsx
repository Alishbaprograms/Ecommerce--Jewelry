"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartoonStar } from "@/components/store/cartoon-icons";
import { KID_AGES, REVIEW_TAGS, STAR_REACTIONS, publicName } from "@/lib/review-config";
import { shrinkImage } from "@/lib/shrink-image";
import { track } from "@/lib/track";
import { cn, formatDate } from "@/lib/utils";

export interface ReviewItem {
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
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
  tagCounts: Array<{ tag: string; count: number }>;
}

const FACES = ["", "😕", "🙂", "😊", "🥰", "🤩"];
const AVATARS = ["bg-blush", "bg-lilac", "bg-mint", "bg-butter", "bg-sky"];

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <CartoonStar key={n} className={size} filled={n <= Math.round(value)} />
      ))}
    </span>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [kidAge, setKidAge] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ verified: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = hover || rating;

  async function addPhoto(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const file = await shrinkImage(files[0], 1400);
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/reviews/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImages((prev) => [...prev, data.url].slice(0, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Tap the stars to rate it first.");
    if (name.trim().length < 2) return setError("Please tell us your name.");
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          name,
          city: city || undefined,
          body: body || undefined,
          kidAge: kidAge || undefined,
          tags,
          orderNumber: orderNumber || undefined,
          images,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't send your review");
      track("review_submit", { rating });
      setSent({ verified: Boolean(data.verified) });
      import("canvas-confetti").then((m) =>
        m.default({ particleCount: 120, spread: 75, origin: { y: 0.7 }, colors: ["#f472b6", "#fbbf24", "#a78bfa", "#4ade80", "#60a5fa"] })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your review");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl bg-blush p-6 text-center">
        <p className="font-serif text-2xl">Thank you! 🎉</p>
        <p className="mt-2 text-sm text-foreground/70">
          Your review is on its way. We&apos;ll show it on the page after a quick check.
          {sent.verified && " It will have a Verified buyer badge."}
        </p>
        <Button variant="outline" className="mt-4" onClick={onDone}>Close</Button>
      </div>
    );
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary/60"
    );

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl bg-muted/60 p-5 sm:p-6">
      <div className="text-center">
        <p className="font-serif text-xl">How much did your little one love it?</p>
        <div className="mt-3 flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="transition-transform duration-150 hover:scale-125 active:scale-90"
              style={{ transform: n <= shown ? "rotate(-6deg)" : undefined }}
            >
              <CartoonStar className="h-11 w-11 sm:h-12 sm:w-12" filled={n <= shown} />
            </button>
          ))}
        </div>
        <p className="mt-2 h-6 text-sm font-medium text-primary">{shown ? `${FACES[shown]} ${STAR_REACTIONS[shown]}` : "Tap a star"}</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">What did you like? <span className="font-normal text-muted-foreground">(tap any)</span></p>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((t) => (
            <button key={t} type="button" className={chip(tags.includes(t))} onClick={() => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">How old is your little one? <span className="font-normal text-muted-foreground">(optional)</span></p>
        <div className="flex flex-wrap gap-2">
          {KID_AGES.map((a) => (
            <button key={a} type="button" className={chip(kidAge === a)} onClick={() => setKidAge(kidAge === a ? "" : a)}>
              {a} years
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-body" className="mb-2 block text-sm font-semibold">
          Tell other parents more <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 600))}
          rows={4}
          placeholder="What did she say when she opened it? Does it stay on? Any tips?"
          className="w-full rounded-xl border border-input bg-white px-4 py-3 text-sm focus:border-foreground focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{body.length}/600</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Add a photo <span className="font-normal text-muted-foreground">(optional)</span></p>
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-white">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <button type="button" onClick={() => setImages((p) => p.filter((u) => u !== url))} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5" aria-label="Remove photo">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {images.length < 2 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-white text-xs text-muted-foreground hover:border-primary/60"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              {uploading ? "Adding" : "Photo"}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => addPhoto(e.target.files)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className="mb-2 block text-sm font-semibold">Your name</label>
          <input id="review-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name"
            className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm focus:border-foreground focus:outline-none" />
          <p className="mt-1 text-xs text-muted-foreground">Shown as first name and last initial.</p>
        </div>
        <div>
          <label htmlFor="review-city" className="mb-2 block text-sm font-semibold">City <span className="font-normal text-muted-foreground">(optional)</span></label>
          <input id="review-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={40}
            className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm focus:border-foreground focus:outline-none" />
        </div>
      </div>

      <div>
        <label htmlFor="review-order" className="mb-2 block text-sm font-semibold">
          Order number <span className="font-normal text-muted-foreground">(optional, for a ✓ Verified buyer badge)</span>
        </label>
        <input id="review-order" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ZH-XXXXXXXX-XXXX" maxLength={40}
          className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm uppercase focus:border-foreground focus:outline-none" />
      </div>

      {/* Honeypot: hidden from people, tempting for bots */}
      <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={sending} disabled={uploading}>
        Send my review
      </Button>
    </form>
  );
}

export function ReviewsSection({
  productId,
  productName,
  reviews,
  summary,
}: {
  productId: string;
  productName: string;
  reviews: ReviewItem[];
  summary: ReviewSummary;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(6);
  const maxBar = Math.max(1, ...Object.values(summary.distribution));

  return (
    <section id="reviews" className="mt-16 sm:mt-20" aria-label={`Reviews for ${productName}`}>
      <h2 className="font-serif text-3xl">What parents say</h2>

      {summary.count > 0 ? (
        <div className="mt-6 grid gap-6 rounded-3xl bg-butter/60 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
          <div className="text-center sm:pr-8">
            <p className="font-serif text-5xl leading-none">{summary.average.toFixed(1)}</p>
            <div className="mt-2 flex justify-center"><Stars value={summary.average} size="h-5 w-5" /></div>
            <p className="mt-1 text-sm text-foreground/70">{summary.count} review{summary.count > 1 ? "s" : ""}</p>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-3 text-sm">
                <span className="w-3 tabular-nums">{n}</span>
                <CartoonStar className="h-4 w-4" />
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/80">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${((summary.distribution[n] ?? 0) / maxBar) * 100}%` }} />
                </div>
                <span className="w-6 text-right tabular-nums text-foreground/70">{summary.distribution[n] ?? 0}</span>
              </div>
            ))}
          </div>
          {summary.tagCounts.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {summary.tagCounts.map((t) => (
                <span key={t.tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium">
                  {t.tag} <span className="text-primary">· {t.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl bg-butter/60 p-6 text-center">
          <p className="font-serif text-xl">No reviews yet 🌟</p>
          <p className="mt-1 text-sm text-foreground/70">Be the first to tell other parents what your little one thinks!</p>
        </div>
      )}

      <div className="mt-6">
        {open ? (
          <ReviewForm productId={productId} onDone={() => setOpen(false)} />
        ) : (
          <Button size="lg" onClick={() => { setOpen(true); track("review_open"); }} className="w-full sm:w-auto">
            <CartoonStar className="mr-2 h-5 w-5" /> Write a review
          </Button>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.slice(0, visible).map((r) => {
            const name = publicName(r.guestName);
            return (
              <article key={r.id} className="rounded-3xl border border-border bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg", AVATARS[name.charCodeAt(0) % AVATARS.length])}>
                    {name[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {name}
                      {r.guestCity && <span className="font-normal text-muted-foreground"> · {r.guestCity}</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} />
                      {r.verified && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                          <Check className="h-3 w-3" /> Verified buyer
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {(r.tags.length > 0 || r.kidAge) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.kidAge && <span className="rounded-full bg-lilac px-2.5 py-0.5 text-xs">For ages {r.kidAge}</span>}
                    {r.tags.map((t) => <span key={t} className="rounded-full bg-blush px-2.5 py-0.5 text-xs">{t}</span>)}
                  </div>
                )}

                {r.body && <p className="mt-3 text-sm leading-relaxed text-foreground/80">{r.body}</p>}

                {r.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.images.map((u) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                        <Image src={u} alt={`Photo from ${name}`} fill sizes="80px" className="object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {r.adminReply && (
                  <div className="mt-3 rounded-2xl bg-muted px-3.5 py-2.5 text-sm">
                    <p className="text-xs font-semibold text-primary">Reply from Zohraé</p>
                    <p className="mt-0.5 text-foreground/80">{r.adminReply}</p>
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">{formatDate(r.createdAt, { month: "short", day: "numeric", year: "numeric" })}</p>
              </article>
            );
          })}
        </div>
      )}

      {reviews.length > visible && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + 6)}>Show more reviews</Button>
        </div>
      )}
    </section>
  );
}
