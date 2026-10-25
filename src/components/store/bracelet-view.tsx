import React from "react";
import { type Bead } from "@/lib/bracelet";

const HEART = "M0 5 C-9 -2 -6 -9 0 -4 C6 -9 9 -2 0 5Z";
const STAR = "M0 -8 L2.4 -2.6 8 -2.5 3.6 1.2 5 7 0 3.8 -5 7 -3.6 1.2 -8 -2.5 -2.4 -2.6Z";

export function BeadShape({ bead, size = 20 }: { bead: Bead; size?: number }) {
  return (
    <svg viewBox="-10 -10 20 20" width={size} height={size} aria-hidden="true">
      {bead.shape === "round" && (
        <>
          <circle r="8.5" fill={bead.color} stroke="rgba(0,0,0,.18)" strokeWidth="1" />
          <circle cx="-2.6" cy="-3" r="2.2" fill="#fff" opacity=".6" />
        </>
      )}
      {bead.shape === "heart" && <path d={HEART} transform="scale(1.1)" fill={bead.color} stroke="rgba(0,0,0,.18)" strokeWidth="1" />}
      {bead.shape === "star" && <path d={STAR} fill={bead.color} stroke="rgba(0,0,0,.18)" strokeWidth="1" />}
    </svg>
  );
}

// Beads sit around a circle (a bracelet seen from above). Spacing adapts to how many beads there are.
export function BraceletView({ beads, className }: { beads: Bead[]; className?: string }) {
  const n = Math.max(beads.length, 1);
  const r = 78;
  const beadSize = Math.min(30, Math.max(18, (2 * Math.PI * r) / Math.max(n, 8) - 4));
  return (
    <svg viewBox="-100 -100 200 200" className={className} role="img" aria-label={`Bracelet with ${beads.length} beads`}>
      <circle r={r} fill="none" stroke="#c4b5a5" strokeWidth="2.5" strokeDasharray="1 5" strokeLinecap="round" />
      {beads.length === 0 && (
        <text textAnchor="middle" y="4" fontSize="11" fill="#9ca3af">Tap beads to start</text>
      )}
      {beads.map((bead, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <foreignObject x={-beadSize / 2} y={-beadSize / 2} width={beadSize} height={beadSize}>
              <BeadShape bead={bead} size={beadSize} />
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
