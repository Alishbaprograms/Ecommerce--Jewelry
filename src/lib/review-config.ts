// Quick-tap reasons shown as chips in the review form (and counted on the product page).
export const REVIEW_TAGS = [
  "My kid loves it",
  "Easy to wear",
  "Looks like the photo",
  "Great gift",
  "Good quality",
  "Fast delivery",
] as const;

export const KID_AGES = ["2–4", "5–7", "8–10", "11+"] as const;

// Reaction shown under the stars as a child taps them.
export const STAR_REACTIONS = ["", "Not for us", "It's okay", "Nice!", "Loved it!", "Obsessed!"] as const;

/** "Ayesha Khan" -> "Ayesha K." so full names are never shown publicly. */
export function publicName(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A happy parent";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
