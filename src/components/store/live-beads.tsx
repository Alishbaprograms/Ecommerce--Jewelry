"use client";

import React, { useEffect, useRef } from "react";

// Loose beads drifting around the hero. They bounce off the edges and each other, drift out of the way of the
// text, and react to touch: tap a bead to pop it (it hops and bursts into sparkles), tap empty space to drop a new one.

type Kind = "round" | "pearl" | "heart" | "star" | "smiley";
interface Bead { x: number; y: number; vx: number; vy: number; r: number; kind: Kind; hue: number; rot: number; vr: number; pop: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; hue: number }

const HUES = [335, 265, 155, 45, 205, 15]; // pink, lilac, mint, butter, sky, coral

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeBead(x: number, y: number, small: boolean): Bead {
  const roll = Math.random();
  const kind: Kind = roll < 0.07 ? "heart" : roll < 0.12 ? "star" : roll < 0.17 ? "smiley" : roll < 0.3 ? "pearl" : "round";
  const base = small ? [11, 22] : [15, 32];
  return {
    x, y,
    vx: rand(-30, 30), vy: rand(-30, 30),
    r: rand(base[0], base[1]),
    kind,
    hue: HUES[Math.floor(Math.random() * HUES.length)],
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.6, 0.6),
    pop: 0,
  };
}

function drawBead(ctx: CanvasRenderingContext2D, b: Bead) {
  const squish = b.pop > 0 ? 1 + 0.28 * Math.sin(b.pop * Math.PI * 3) * b.pop : 1;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.rot);
  ctx.scale(squish, 2 - squish);
  ctx.shadowColor = "rgba(91, 23, 64, 0.28)";
  ctx.shadowBlur = b.r * 0.55;
  ctx.shadowOffsetY = b.r * 0.28;
  const r = b.r;

  if (b.kind === "heart") {
    const k = r / 10;
    ctx.scale(k, k);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-11, 0, -8, -9, 0, -4);
    ctx.bezierCurveTo(8, -9, 11, 0, 0, 9);
    const g = ctx.createLinearGradient(-8, -8, 8, 8);
    g.addColorStop(0, "hsl(335 100% 82%)");
    g.addColorStop(1, "hsl(335 80% 55%)");
    ctx.fillStyle = g;
    ctx.fill();
  } else if (b.kind === "star") {
    const k = r / 10;
    ctx.scale(k, k);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? 10 : 4.4;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(-8, -8, 8, 8);
    g.addColorStop(0, "hsl(50 100% 78%)");
    g.addColorStop(1, "hsl(40 95% 52%)");
    ctx.fillStyle = g;
    ctx.fill();
  } else {
    const hue = b.kind === "pearl" ? 290 : b.kind === "smiley" ? 48 : b.hue;
    const sat = b.kind === "pearl" ? 25 : 90;
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.14, `hsl(${hue} ${sat}% ${b.kind === "pearl" ? 97 : 82}%)`);
    g.addColorStop(0.6, `hsl(${hue} ${sat}% ${b.kind === "pearl" ? 90 : 64}%)`);
    g.addColorStop(1, `hsl(${hue} ${sat - 10}% ${b.kind === "pearl" ? 72 : 44}%)`);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = "transparent";
    if (b.kind === "smiley") {
      ctx.fillStyle = "#4a3000";
      ctx.beginPath();
      ctx.arc(-r * 0.32, -r * 0.15, r * 0.1, 0, Math.PI * 2);
      ctx.arc(r * 0.32, -r * 0.15, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4a3000";
      ctx.lineWidth = r * 0.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r * 0.42, r * 0.2);
      ctx.quadraticCurveTo(0, r * 0.62, r * 0.42, r * 0.2);
      ctx.stroke();
    }
    // glossy highlight
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.42, r * 0.38, r * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSpark(ctx: CanvasRenderingContext2D, s: Spark) {
  const size = 3 + 9 * s.life;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.life * 3);
  ctx.globalAlpha = Math.min(1, s.life * 1.6);
  ctx.fillStyle = `hsl(${s.hue} 100% 66%)`;
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
      const target = small ? 20 : 34;
      if (beads.length === 0) {
        for (let i = 0; i < target; i++) beads.push(makeBead(rand(30, Math.max(60, w - 30)), rand(30, Math.max(60, h - 30)), small));
      }
    };

    const burst = (x: number, y: number, hue: number) => {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
        const sp = rand(70, 190);
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, hue: (hue + rand(-30, 30) + 360) % 360 });
      }
    };

    const step = (dt: number) => {
      const avoid = avoidRef?.current?.getBoundingClientRect();
      const box = canvas.getBoundingClientRect();
      const ax0 = avoid ? avoid.left - box.left - 14 : 0, ax1 = avoid ? avoid.right - box.left + 14 : 0;
      const ay0 = avoid ? avoid.top - box.top - 10 : 0, ay1 = avoid ? avoid.bottom - box.top + 10 : 0;

      for (const b of beads) {
        // a lazy wander so they never stop drifting
        b.vx += rand(-25, 25) * dt;
        b.vy += rand(-25, 25) * dt;
        if (pointer.active) {
          const dx = b.x - pointer.x, dy = b.y - pointer.y, d = Math.hypot(dx, dy);
          if (d < 110 && d > 0) {
            b.vx += (dx / d) * (110 - d) * 5 * dt;
            b.vy += (dy / d) * (110 - d) * 5 * dt;
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
        const max = 70, min = 14;
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
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.96; s.vy *= 0.96; s.life -= dt * 1.6;
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
        if (Math.hypot(beads[i].x - p.x, beads[i].y - p.y) <= beads[i].r + 10) { hit = beads[i]; break; }
      }
      try { navigator.vibrate?.(8); } catch {}
      if (hit) {
        hit.pop = 1;
        hit.vy -= 170; hit.vx += rand(-80, 80);
        burst(hit.x, hit.y, hit.hue);
      } else {
        const small = w < 640;
        const nb = makeBead(p.x, p.y, small);
        nb.pop = 1;
        if (beads.length >= (small ? 30 : 48)) beads.shift();
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
