// A bracelet design is just a string of bead codes, e.g. "rpbgyh". That keeps share links short.
export const MAX_BEADS = 14;

export type Bead = { code: string; label: string; color: string; shape: "round" | "heart" | "star" };

export const BEADS: Bead[] = [
  { code: "r", label: "Red", color: "#ef4444", shape: "round" },
  { code: "o", label: "Orange", color: "#fb923c", shape: "round" },
  { code: "y", label: "Yellow", color: "#facc15", shape: "round" },
  { code: "g", label: "Green", color: "#4ade80", shape: "round" },
  { code: "b", label: "Blue", color: "#60a5fa", shape: "round" },
  { code: "p", label: "Purple", color: "#a78bfa", shape: "round" },
  { code: "k", label: "Pink", color: "#f472b6", shape: "round" },
  { code: "w", label: "White", color: "#f8fafc", shape: "round" },
  { code: "h", label: "Pink heart", color: "#ec4899", shape: "heart" },
  { code: "s", label: "Gold star", color: "#f59e0b", shape: "star" },
];

const byCode = new Map(BEADS.map((b) => [b.code, b]));

export function decodeBracelet(value: string | null | undefined): Bead[] {
  if (!value) return [];
  return value
    .slice(0, MAX_BEADS)
    .split("")
    .map((c) => byCode.get(c))
    .filter((b): b is Bead => Boolean(b));
}

export function encodeBracelet(beads: Bead[]): string {
  return beads.map((b) => b.code).join("");
}
