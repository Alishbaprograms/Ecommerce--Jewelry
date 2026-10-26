import React from "react";

// ZOHRAÉ spelled in glossy beads on a string. Everything is computed from a few numbers (no images),
// so it stays sharp on every screen. Letter beads follow the curve of the string.

type P = { x: number; y: number };
type Kind = "seed" | "round" | "cube" | "smiley" | "heart" | "star";
interface Bead { kind: Kind; w: number; color?: string; letter?: string }

const PALETTE = {
  pink: ["#ff9ec7", "#ff5fa2", "#c93a78"],
  lilac: ["#d6c4ff", "#a98bff", "#6f55cf"],
  mint: ["#b7f5dc", "#5fdcaa", "#2f9d77"],
  butter: ["#fff0a8", "#ffd23f", "#d9a200"],
  sky: ["#bfe6ff", "#5bbcff", "#2f86c9"],
  coral: ["#ffc2ab", "#ff875f", "#d04e2a"],
  pearl: ["#ffffff", "#f1ecf6", "#c7bdd6"],
} as const;
type Colour = keyof typeof PALETTE;
const COLOURS = Object.keys(PALETTE) as Colour[];

function curve(p0: P, p1: P, p2: P) {
  const N = 800;
  const pts: P[] = [];
  const cum: number[] = [0];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    pts.push({ x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y });
    if (i > 0) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const len = cum[N];
  return {
    len,
    d: `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`,
    at(s: number) {
      const target = Math.max(0, Math.min(len, s));
      let lo = 0, hi = N;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < target) lo = mid + 1; else hi = mid;
      }
      const i = Math.max(1, lo);
      const a = pts[i - 1], b = pts[i];
      return { x: b.x, y: b.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
    },
  };
}

// A repeating mix of tiny seed beads and bigger glossy ones.
function filler(target: number, offset: number, scale: number): Bead[] {
  const out: Bead[] = [];
  let sum = 0, i = offset;
  while (sum < target) {
    const c = COLOURS[(i * 3 + 1) % COLOURS.length];
    const m = i % 9;
    const bead: Bead =
      m === 2 ? { kind: "round", w: 34 * scale, color: c } :
      m === 5 ? { kind: "round", w: 25 * scale, color: COLOURS[(i + 2) % COLOURS.length] } :
      m === 7 ? { kind: "round", w: 30 * scale, color: "pearl" } :
      { kind: "seed", w: 13 * scale, color: c };
    out.push(bead);
    sum += bead.w;
    i++;
  }
  return out;
}

function lettersBlock(letters: string[], scale: number, edge: boolean): Bead[] {
  const cube = (l: string): Bead => ({ kind: "cube", w: 56 * scale, letter: l });
  const spacer = (n: number, o: number): Bead[] => Array.from({ length: n }, (_, k) => ({ kind: "seed" as const, w: 13 * scale, color: COLOURS[(o + k) % COLOURS.length] }));
  const block: Bead[] = [];
  if (edge) block.push({ kind: "heart", w: 36 * scale }, ...spacer(3, 1), { kind: "round", w: 28 * scale, color: "lilac" }, ...spacer(2, 4));
  letters.forEach((l, i) => {
    block.push(cube(l));
    if (i < letters.length - 1) block.push({ kind: "seed", w: 6 * scale, color: "pearl" });
  });
  if (edge) block.push(...spacer(2, 3), { kind: "round", w: 28 * scale, color: "butter" }, ...spacer(3, 0), { kind: "smiley", w: 36 * scale });
  return block;
}

function arrange(path: ReturnType<typeof curve>, letters: string[], scale: number, edge: boolean, offset: number): Bead[] {
  const block = lettersBlock(letters, scale, edge);
  const blockLen = block.reduce((s, b) => s + b.w, 0);
  const side = Math.max(0, (path.len - blockLen) / 2);
  return [...filler(side, offset, scale), ...block, ...filler(side + 40, offset + 4, scale)];
}

function BeadShape({ b, id }: { b: Bead; id: string }) {
  const r = b.w / 2;
  switch (b.kind) {
    case "cube": {
      const s = b.w;
      return (
        <g>
          <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.16} fill={`url(#${id}-cube)`} stroke="#cfc5de" strokeWidth="1.5" />
          <rect x={-s / 2 + 3} y={-s / 2 + 3} width={s - 6} height={s - 6} rx={s * 0.12} fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.5" />
          <text x="0" y={s * 0.2} textAnchor="middle" fontSize={s * 0.66} fontWeight="900" fill="#2a2340" style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif" }}>
            {b.letter}
          </text>
        </g>
      );
    }
    case "smiley":
      return (
        <g>
          <circle r={r} fill={`url(#${id}-butter)`} stroke="#c98f00" strokeOpacity=".5" strokeWidth="1" />
          <circle cx={-r * 0.32} cy={-r * 0.15} r={r * 0.1} fill="#4a3000" />
          <circle cx={r * 0.32} cy={-r * 0.15} r={r * 0.1} fill="#4a3000" />
          <path d={`M ${-r * 0.42} ${r * 0.2} Q 0 ${r * 0.62} ${r * 0.42} ${r * 0.2}`} stroke="#4a3000" strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
          <ellipse cx={-r * 0.3} cy={-r * 0.55} rx={r * 0.32} ry={r * 0.16} fill="#fff" opacity=".6" />
        </g>
      );
    case "heart": {
      const k = r / 10;
      return (
        <g transform={`scale(${k})`}>
          <path d="M0 9 C-11 0 -8 -9 0 -4 C8 -9 11 0 0 9Z" fill={`url(#${id}-pink)`} stroke="#c93a78" strokeOpacity=".6" strokeWidth="0.6" />
          <ellipse cx="-3.6" cy="-3.2" rx="2.6" ry="1.4" fill="#fff" opacity=".7" />
        </g>
      );
    }
    case "star": {
      const k = r / 10;
      return (
        <g transform={`scale(${k})`}>
          <path d="M0 -10 L2.9 -3.1 10 -3 4.4 1.6 6.2 9 0 5 -6.2 9 -4.4 1.6 -10 -3 -2.9 -3.1Z" fill={`url(#${id}-butter)`} stroke="#c98f00" strokeOpacity=".6" strokeWidth="0.6" />
        </g>
      );
    }
    default: {
      const colour = (b.color ?? "pink") as Colour;
      return (
        <g>
          <circle r={r} fill={`url(#${id}-${colour})`} />
          <circle r={r} fill="none" stroke={PALETTE[colour][2]} strokeOpacity=".35" strokeWidth="1" />
          <ellipse cx={-r * 0.35} cy={-r * 0.42} rx={r * 0.38} ry={r * 0.2} fill="#fff" opacity=".75" transform={`rotate(-30 ${-r * 0.35} ${-r * 0.42})`} />
        </g>
      );
    }
  }
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      {COLOURS.map((c) => (
        <radialGradient key={c} id={`${id}-${c}`} cx="0.34" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.12" stopColor={PALETTE[c][0]} />
          <stop offset="0.55" stopColor={PALETTE[c][1]} />
          <stop offset="1" stopColor={PALETTE[c][2]} />
        </radialGradient>
      ))}
      <linearGradient id={`${id}-cube`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e4dcef" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#5b1740" floodOpacity="0.35" />
      </filter>
    </defs>
  );
}

function Row({ path, letters, scale, edge, offset, id }: { path: ReturnType<typeof curve>; letters: string[]; scale: number; edge: boolean; offset: number; id: string }) {
  const beads = arrange(path, letters, scale, edge, offset);
  const placed: Array<{ b: Bead; p: ReturnType<ReturnType<typeof curve>["at"]> }> = [];
  let s = 0;
  for (const b of beads) {
    placed.push({ b, p: path.at(s + b.w / 2) });
    s += b.w;
  }
  return (
    <g filter={`url(#${id}-shadow)`}>
      <path d={path.d} stroke="#fff7ec" strokeWidth="3" fill="none" />
      {placed.map(({ b, p }, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(b.kind === "cube" || b.kind === "heart" || b.kind === "smiley" ? p.angle : 0).toFixed(1)})`}>
          <BeadShape b={b} id={id} />
        </g>
      ))}
    </g>
  );
}

const sway = { animation: "bead-sway 7s ease-in-out infinite", transformOrigin: "50% 0%", transformBox: "fill-box" as const };

export function BeadedName({ className }: { className?: string }) {
  const wide = curve({ x: -60, y: 20 }, { x: 600, y: 340 }, { x: 1260, y: 20 });
  const small = curve({ x: -50, y: 62 }, { x: 300, y: 150 }, { x: 650, y: 62 });
  const letters = ["Z", "O", "H", "R", "A", "É"];

  return (
    <div className={className} role="img" aria-label="ZOHRAÉ spelled out in colourful beads">
      {/* wide screens: one long string */}
      <svg viewBox="0 0 1200 250" className="hidden sm:block w-full h-auto overflow-visible" aria-hidden="true">
        <Defs id="bw" />
        <g style={sway}>
          <Row path={wide} letters={letters} scale={1} edge offset={0} id="bw" />
        </g>
      </svg>
      {/* phones: the whole name on one string, with bigger beads so the letters stay easy to read */}
      <svg viewBox="0 0 600 150" className="sm:hidden w-full h-auto overflow-visible" aria-hidden="true">
        <Defs id="bm" />
        <g style={sway}>
          <Row path={small} letters={letters} scale={1.2} edge={false} offset={0} id="bm" />
        </g>
      </svg>
    </div>
  );
}
