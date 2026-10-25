"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const GEMS = ["💎", "💍", "✨", "🔮", "⭐", "🌸"];
const ROUND_SECONDS = 30;
const H = 240;
const CHEST_W = 56;
const CHEST_H = 40;

type Gem = { x: number; y: number; vy: number; emoji: string; size: number };

function readBest() {
  try {
    return Number(localStorage.getItem("zohrae-catch-best") ?? 0) || 0;
  } catch {
    return 0;
  }
}

// Catch the Jewels: drag (or use arrow keys) to move the chest under the falling gems.
export function CatchJewelsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const game = useRef({ running: false, gems: [] as Gem[], chestX: 150, width: 300, score: 0, timeLeft: ROUND_SECONDS, spawnIn: 0, last: 0, keys: { left: false, right: false } });
  const raf = useRef(0);
  const tickRef = useRef<(now: number) => void>(() => {});

  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const saved = readBest();
    queueMicrotask(() => setBest(saved));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const g = game.current;
    ctx.clearRect(0, 0, g.width, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const gem of g.gems) {
      ctx.font = `${gem.size}px serif`;
      ctx.fillText(gem.emoji, gem.x, gem.y);
    }
    // chest
    const x = g.chestX - CHEST_W / 2;
    const y = H - CHEST_H - 4;
    ctx.fillStyle = "#92400e";
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y + 12, CHEST_W, CHEST_H - 12, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.roundRect(x, y, CHEST_W, 16, [14, 14, 2, 2]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(x + 22, y + 10, 12, 12);
    ctx.fillRect(x + 10, y + 2, 4, CHEST_H - 6);
    ctx.fillRect(x + CHEST_W - 14, y + 2, 4, CHEST_H - 6);
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    game.current.width = width;
    game.current.chestX = Math.min(Math.max(game.current.chestX, CHEST_W / 2), width - CHEST_W / 2);
    canvas.width = width * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${H}px`;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }, [draw]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const finish = useCallback(() => {
    const g = game.current;
    g.running = false;
    cancelAnimationFrame(raf.current);
    setPhase("done");
    setScore(g.score);
    setBest((prev) => {
      const next = Math.max(prev, g.score);
      try {
        localStorage.setItem("zohrae-catch-best", String(next));
      } catch {}
      return next;
    });
    draw();
  }, [draw]);

  const tick = useCallback(
    (now: number) => {
      const g = game.current;
      if (!g.running) return;
      const dt = Math.min(0.05, (now - g.last) / 1000);
      g.last = now;
      g.timeLeft -= dt;
      if (g.timeLeft <= 0) {
        g.timeLeft = 0;
        setTimeLeft(0);
        finish();
        return;
      }
      setTimeLeft(Math.ceil(g.timeLeft));

      if (g.keys.left) g.chestX -= 320 * dt;
      if (g.keys.right) g.chestX += 320 * dt;
      g.chestX = Math.min(Math.max(g.chestX, CHEST_W / 2), g.width - CHEST_W / 2);

      g.spawnIn -= dt;
      if (g.spawnIn <= 0) {
        const elapsed = ROUND_SECONDS - g.timeLeft;
        g.spawnIn = Math.max(0.35, 0.8 - elapsed * 0.012);
        const size = 26 + Math.random() * 8;
        g.gems.push({
          x: size + Math.random() * (g.width - size * 2),
          y: -size,
          vy: 90 + Math.random() * 50 + elapsed * 3,
          emoji: GEMS[Math.floor(Math.random() * GEMS.length)],
          size,
        });
      }

      const chestTop = H - CHEST_H - 4;
      g.gems = g.gems.filter((gem) => {
        gem.y += gem.vy * dt;
        const caught =
          gem.y > chestTop - 4 && gem.y < chestTop + 24 && Math.abs(gem.x - g.chestX) < CHEST_W / 2 + 6;
        if (caught) {
          g.score += 1;
          setScore(g.score);
          return false;
        }
        return gem.y < H + 30;
      });

      draw();
      raf.current = requestAnimationFrame((t) => tickRef.current(t));
    },
    [draw, finish]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  function start() {
    const g = game.current;
    g.gems = [];
    g.score = 0;
    g.timeLeft = ROUND_SECONDS;
    g.spawnIn = 0;
    g.last = performance.now();
    g.running = true;
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setPhase("playing");
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame((t) => tickRef.current(t));
  }

  useEffect(() => {
    const g = game.current;
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") g.keys.left = down;
      if (e.key === "ArrowRight") g.keys.right = down;
    };
    const kd = onKey(true);
    const ku = onKey(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      g.running = false;
      cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  function moveTo(e: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    game.current.chestX = Math.min(Math.max(e.clientX - rect.left, CHEST_W / 2), game.current.width - CHEST_W / 2);
    if (!game.current.running) draw();
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-lilac to-blush p-3">
      <div className="flex items-center justify-between text-sm font-medium mb-2 px-1">
        <span>⭐ {score}</span>
        <span>⏱ {timeLeft}s</span>
        <span className="text-muted-foreground">Best {best}</span>
      </div>
      <div ref={wrapRef} className="relative overflow-hidden rounded-xl bg-white/60">
        <canvas
          ref={canvasRef}
          className="block touch-none"
          onPointerMove={moveTo}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            moveTo(e);
          }}
        />
        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 text-center px-4">
            <p className="font-serif text-lg">{phase === "done" ? `You caught ${score} jewels! 🎉` : "Catch the Jewels!"}</p>
            <p className="text-xs text-muted-foreground">Drag the treasure chest to catch the falling gems.</p>
            <Button size="sm" onClick={start}>{phase === "done" ? "Play again" : "Play"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
