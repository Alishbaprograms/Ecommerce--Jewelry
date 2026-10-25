import React from "react";

// Little pirate-style treasure chest. `open` lifts the lid and shows a glow.
export function TreasureChest({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 48 44" className={className} fill="none" aria-hidden="true">
      {open && <ellipse cx="24" cy="22" rx="16" ry="6" fill="#fde68a" opacity="0.9" />}
      <g style={{ transformOrigin: "6px 20px", transform: open ? "rotate(-28deg)" : "none", transition: "transform .25s" }}>
        <path d="M5 20V15C5 8 12 4 24 4s19 4 19 11v5H5Z" fill="#b45309" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 20h38" stroke="#78350f" strokeWidth="2" />
        <path d="M16 5.5v14M32 5.5v14" stroke="#fbbf24" strokeWidth="2.5" />
      </g>
      <rect x="5" y="20" width="38" height="20" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="2" />
      <path d="M16 20v20M32 20v20" stroke="#fbbf24" strokeWidth="2.5" />
      <rect x="20.5" y="21" width="7" height="9" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
      <circle cx="24" cy="25" r="1.4" fill="#78350f" />
    </svg>
  );
}
