import React from "react";

// Soft satin folds behind the hero: gentle light and shadow bands over a pastel gradient.
// Purely decorative, drawn in code (no image to load).
export function SilkBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="silk-light" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="silk-shade" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#b48bd9" stopOpacity="0" />
          <stop offset="0.55" stopColor="#b48bd9" stopOpacity="0.26" />
          <stop offset="1" stopColor="#b48bd9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="silk-rose" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9ec7" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff9ec7" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff9ec7" stopOpacity="0" />
        </linearGradient>
        <filter id="silk-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <g filter="url(#silk-blur)">
        <path d="M-80 120 C 260 20, 560 300, 900 170 S 1300 90, 1540 210 L1540 330 C 1240 250, 1000 430, 700 360 S 220 270, -80 380 Z" fill="url(#silk-light)" />
        <path d="M-80 330 C 220 250, 520 470, 860 390 S 1280 300, 1540 420 L1540 520 C 1220 470, 980 600, 660 540 S 240 470, -80 560 Z" fill="url(#silk-shade)" />
        <path d="M-80 520 C 300 440, 600 640, 960 560 S 1320 500, 1540 600 L1540 760 L-80 760 Z" fill="url(#silk-light)" opacity="0.8" />
        <path d="M-80 20 C 300 -40, 640 160, 1020 60 S 1340 -20, 1540 80 L1540 190 C 1260 130, 1000 260, 720 200 S 260 120, -80 220 Z" fill="url(#silk-rose)" />
      </g>
    </svg>
  );
}
