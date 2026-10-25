import React from "react";

// Little pirate-style treasure chest. `open` adds gold sparkles to show there is treasure inside.
export function TreasureChest({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <g transform="translate(0 4)">
        <path d="M5 20V15C5 8 12 4 24 4s19 4 19 11v5H5Z" fill="#b45309" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 20h38" stroke="#78350f" strokeWidth="2" />
        <path d="M16 5.500v14M32 5.500v14" stroke="#fbbf24" strokeWidth="2.500" />
        <rect x="5" y="20" width="38" height="20" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="2" />
        <path d="M16 20v20M32 20v20" stroke="#fbbf24" strokeWidth="2.500" />
        <rect x="20.500" y="21" width="7" height="9" rx="1.500" fill="#fbbf24" stroke="#78350f" strokeWidth="1.500" />
        <circle cx="24" cy="25" r="1.400" fill="#78350f" />
      </g>
      {open && (
        <g fill="#facc15" stroke="#f59e0b" strokeWidth="0.8" strokeLinejoin="round">
          <path d="M40 2l1.200 3 3 1.200-3 1.200L40 10.400l-1.200-3-3-1.200 3-1.200Z" />
          <path d="M8 3l.9 2.200 2.200.9-2.200.9L8 9.200l-.9-2.200-2.200-.9 2.200-.9Z" />
        </g>
      )}
    </svg>
  );
}
