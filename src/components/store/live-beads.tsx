"use client";

import React, { useEffect, useRef } from "react";

// Loose beads drifting around the hero. They bounce off the edges and each other, drift out of the way of the
// text, and react to touch: tap a bead to pop it (it hops and bursts into sparkles), tap empty space to drop a new one.

type Kind = "seed" | "round" | "pearl" | "star";
interface Bead { x: number; y: number; vx: number; vy: number; r: number; kind: Kind; hue: number; rot: number; vr: number; pop: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; hue: number }

// soft, slightly dusty pastels (rose, lilac, sage, champagne, sky, peach)
const HUES = [338, 268, 150, 42, 205, 18];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeBead(x: number, y: number, small: boolean): Bead {
  const roll = Math.random();
  // mostly tiny seed beads, a few pearls and slightly bigger beads, plus the odd little star
  const kind: Kind = roll < 0.48 ? "seed" : roll < 0.7 ? "round" : roll < 0.85 ? "pearl" : "star";
  const sizes = small
    ? { seed: [4, 7], round: [7, 11], pearl: [8, 12], star: [6, 9] }
    : { seed: [5, 8], round: [9, 14], pearl: [10, 15], star: [8, 12] };
  const [lo, hi] = sizes[kind];
  return {
    x, y,
    vx: rand(-22, 22), vy: rand(-22, 22),
    r: rand(lo, hi),
    kind,
    hue: HUES[Math.floor(Math.random() * HUES.length)],
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.4, 0.4),
    pop: 0,
  };
}

function drawBead(ctx: CanvasRenderingContext2D, b: Bead) {
  const squish = b.pop > 0 ? 1 + 0.2 * Math.sin(b.pop * Math.PI * 3) * b.pop : 1;
  const r = b.r;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.rot);
  ctx.scale(squish, 2 - squish);
  ctx.shadowColor = "rgba(110, 60, 110, 0.18)";
  ctx.shadowBlur = r * 0.7;
  ctx.shadowOffsetY = r * 0.3;

  if (b.kind === "star") {
    // a soft, rounded little star that twinkles very slightly
    const tw = 1 + 0.08 * Math.sin(b.rot * 2.2);
    ctx.scale(tw, tw);
    ctx.shadowColor = "rgba(150, 110, 60, 0.2)";
    ctx.shadowBlur = r * 0.6;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.48;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    const sg = ctx.createLinearGradient(-r, -r, r, r);
    sg.addColorStop(0, "hsl(48 90% 90%)");
    sg.addColorStop(1, "hsl(40 80% 72%)");
    ctx.fillStyle = sg;
    ctx.strokeStyle = "hsl(42 80% 78%)";
    ctx.lineWidth = r * 0.22;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    return;
  }

  const pearl = b.kind === "pearl";
  const hue = pearl ? 300 : b.hue;
  const sat = pearl ? 18 : 52;
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.18, `hsl(${hue} ${sat}% ${pearl ? 98 : 88}%)`);
  g.addColorStop(0.65, `hsl(${hue} ${sat}% ${pearl ? 93 : 78}%)`);
  g.addColorStop(1, `hsl(${hue} ${sat}% ${pearl ? 80 : 62}%)`);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // a small, soft highlight
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.4, r * 0.28, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpark(ctx: CanvasRenderingContext2D, s: Spark) {
  const size = 1.5 + 4.5 * s.life;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.life * 3);
  ctx.globalAlpha = Math.min(1, s.life * 1.6);
  ctx.fillStyle = `hsl(${s.hue} 85% 78%)`;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? size : size * 0.3;
    const a = (i / 8) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function LiveBeads({ avoidRef, className }: { avoidRef?: React.RefObject<HTMLElement | null>; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    const beads: Bead[] = [];
    const sparks: Spark[] = [];
    let raf = 0, last = performance.now(), visible = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -999, y: -999, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 640;
      const target = small ? 24 : 32;
      if (beads.length === 0) {
        for (let i = 0; i < target; i++) beads.push(makeBead(rand(30, Math.max(60, w - 30)), rand(30, Math.max(60, h - 30)), small));
      }
    };

    const burst = (x: number, y: number, hue: number) => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
        const sp = rand(40, 110);
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, hue: i % 3 === 0 ? 46 : (hue + rand(-20, 20) + 360) % 360 });
      }
    };

    const step = (dt: number) => {
      const avoid = avoidRef?.current?.getBoundingClientRect();
      const box = canvas.getBoundingClientRect();
      const ax0 = avoid ? avoid.left - box.left - 14 : 0, ax1 = avoid ? avoid.right - box.left + 14 : 0;
      const ay0 = avoid ? avoid.top - box.top - 10 : 0, ay1 = avoid ? avoid.bottom - box.top + 10 : 0;

      for (const b of beads) {
        // a lazy wander so they never stop drifting
        b.vx += rand(-18, 18) * dt;
        b.vy += rand(-18, 18) * dt;
        if (pointer.active) {
          const dx = b.x - pointer.x, dy = b.y - pointer.y, d = Math.hypot(dx, dy);
          if (d < 90 && d > 0) {
            b.vx += (dx / d) * (90 - d) * 4 * dt;
            b.vy += (dy / d) * (90 - d) * 4 * dt;
          }
        }
        // keep clear of the headline and buttons
        if (avoid && b.x > ax0 - b.r && b.x < ax1 + b.r && b.y > ay0 - b.r && b.y < ay1 + b.r) {
          const cx = (ax0 + ax1) / 2, cy = (ay0 + ay1) / 2;
          const dx = (b.x - cx) / ((ax1 - ax0) / 2 + b.r), dy = (b.y - cy) / ((ay1 - ay0) / 2 + b.r);
          if (Math.abs(dx) > Math.abs(dy)) b.vx += Math.sign(dx || 1) * 260 * dt;
          else b.vy += Math.sign(dy || 1) * 260 * dt;
        }
        const sp = Math.hypot(b.vx, b.vy);
        const max = 48, min = 9;
        if (sp > max) { b.vx *= max / sp; b.vy *= max / sp; }
        else if (sp < min && sp > 0) { b.vx *= min / sp; b.vy *= min / sp; }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vr * dt;
        if (b.pop > 0) b.pop = Math.max(0, b.pop - dt * 1.7);
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.9; }
        if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * 0.9; }
        if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.9; }
        if (b.y > h - b.r) { b.y = h - b.r; b.vy = -Math.abs(b.vy) * 0.9; }
      }
      // beads click against each other
      for (let i = 0; i < beads.length; i++) {
        for (let j = i + 1; j < beads.length; j++) {
          const a = beads[i], c = beads[j];
          const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = a.r + c.r;
          if (d > 0 && d < min) {
            const nx = dx / d, ny = dy / d, overlap = (min - d) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap; c.x += nx * overlap; c.y += ny * overlap;
            const ma = a.r * a.r, mc = c.r * c.r;
            const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
            if (rel < 0) {
              const imp = (-1.8 * rel) / (1 / ma + 1 / mc);
              a.vx -= (imp / ma) * nx; a.vy -= (imp / ma) * ny;
              c.vx += (imp / mc) * nx; c.vy += (imp / mc) * ny;
            }
          }
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.94; s.vy *= 0.94; s.life -= dt * 2.1;
        if (s.life <= 0) sparks.splice(i, 1);
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (!reduce) step(dt);
      ctx.clearRect(0, 0, w, h);
      for (const b of beads) drawBead(ctx, b);
      for (const s of sparks) drawSpark(ctx, s);
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      let hit: Bead | null = null;
      for (let i = beads.length - 1; i >= 0; i--) {
        if (Math.hypot(beads[i].x - p.x, beads[i].y - p.y) <= beads[i].r + 14) { hit = beads[i]; break; }
      }
      try { navigator.vibrate?.(8); } catch {}
      if (hit) {
        hit.pop = 1;
        hit.vy -= 110; hit.vx += rand(-50, 50);
        burst(hit.x, hit.y, hit.hue);
      } else {
        const small = w < 640;
        const nb = makeBead(p.x, p.y, small);
        nb.pop = 1;
        if (beads.length >= (small ? 34 : 44)) beads.shift();
        beads.push(nb);
        burst(p.x, p.y, nb.hue);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        const p = local(e);
        pointer.x = p.x; pointer.y = p.y; pointer.active = true;
      }
    };
    const onLeave = () => { pointer.active = false; };

    resize();
    const ro = new ResizeObserver(() => {
      const before = { w, h };
      resize();
      // keep beads inside after the area shrinks
      if (w < before.w || h < before.h) for (const b of beads) { b.x = Math.min(b.x, w - b.r); b.y = Math.min(b.y, h - b.r); }
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(canvas);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [avoidRef]);

  return <canvas ref={canvasRef} className={className} style={{ touchAction: "manipulation" }} aria-hidden="true" />;
}
