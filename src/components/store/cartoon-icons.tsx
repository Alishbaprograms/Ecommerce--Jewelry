import React from "react";

// Cartoon icon set drawn to match the treasure chest: chunky brown outline, flat bright fills, round joins.
const OUTLINE = "#78350f";
const SW = 2.5;

type P = { className?: string };

function Svg({ className, children }: P & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true" strokeLinejoin="round" strokeLinecap="round">
      {children}
    </svg>
  );
}

export function CartoonHeart({ className }: P) {
  return (
    <Svg className={className}>
      <path
        d="M24 41C10 31 6 23 6 17 6 11 10.500 7 16 7c3.500 0 6.500 2 8 5 1.500-3 4.500-5 8-5 5.500 0 10 4 10 10 0 6-4 14-18 24Z"
        fill="#f472b6"
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      <path d="M13 15c.8-2.200 2.500-3.500 4.500-3.500" stroke="#fff" strokeWidth="3" opacity=".75" />
    </Svg>
  );
}

export function CartoonUser({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M7 43c0-9 7-14 17-14s17 5 17 14Z" fill="#a78bfa" stroke={OUTLINE} strokeWidth={SW} />
      <circle cx="24" cy="17" r="10" fill="#fcd9b6" stroke={OUTLINE} strokeWidth={SW} />
      <path d="M14.500 15c1-6 5-8 9.500-8s8.500 2 9.500 8c-3-3-6-3.500-9.500-3.500S17.500 12 14.500 15Z" fill="#92400e" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="20" cy="19" r="1.400" fill={OUTLINE} />
      <circle cx="28" cy="19" r="1.400" fill={OUTLINE} />
      <path d="M21 23c1.800 1.600 4.200 1.600 6 0" stroke={OUTLINE} strokeWidth="1.800" />
    </Svg>
  );
}

export function CartoonSearch({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M31 31l11 11" stroke={OUTLINE} strokeWidth="8" />
      <path d="M31 31l11 11" stroke="#fbbf24" strokeWidth="3.500" />
      <circle cx="20" cy="20" r="14" fill="#bae6fd" stroke={OUTLINE} strokeWidth={SW} />
      <path d="M12 17c1.200-3.500 4-5.500 7.500-5.500" stroke="#fff" strokeWidth="3" opacity=".85" />
    </Svg>
  );
}

export function CartoonMenu({ className }: P) {
  return (
    <Svg className={className}>
      {[11, 21, 31].map((y) => (
        <rect key={y} x="6" y={y} width="36" height="7" rx="3.500" fill="#fbbf24" stroke={OUTLINE} strokeWidth="2.200" />
      ))}
    </Svg>
  );
}

export function CartoonClose({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M11 11l26 26M37 11L11 37" stroke={OUTLINE} strokeWidth="9" />
      <path d="M11 11l26 26M37 11L11 37" stroke="#f472b6" strokeWidth="4.500" />
    </Svg>
  );
}

const BRACELET_BEADS = ["#f472b6", "#facc15", "#60a5fa", "#4ade80", "#a78bfa", "#fb923c", "#ef4444", "#f8fafc"];

export function CartoonBracelet({ className }: P) {
  return (
    <Svg className={className}>
      <circle cx="24" cy="25" r="14.500" stroke={OUTLINE} strokeWidth="2.500" strokeDasharray="0.5 4" />
      {BRACELET_BEADS.map((color, i) => {
        const a = (i / BRACELET_BEADS.length) * 2 * Math.PI - Math.PI / 2;
        return (
          <g key={color}>
            <circle cx={24 + Math.cos(a) * 14.500} cy={25 + Math.sin(a) * 14.500} r="5" fill={color} stroke={OUTLINE} strokeWidth="1.800" />
            <circle cx={24 + Math.cos(a) * 14.500 - 1.500} cy={25 + Math.sin(a) * 14.500 - 1.600} r="1.300" fill="#fff" opacity=".8" />
          </g>
        );
      })}
      <path d="M38 2l1.200 3 3 1.200-3 1.200L38 10.400l-1.200-3-3-1.200 3-1.200Z" fill="#facc15" stroke="#f59e0b" strokeWidth="0.8" />
    </Svg>
  );
}
