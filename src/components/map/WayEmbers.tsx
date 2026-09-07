"use client";

import { useEffect, useRef } from "react";

const PALETTE = [
  { glow: "#fbbf24", core: "#fff7d6" },
  { glow: "#f59e0b", core: "#ffe9a8" },
  { glow: "#fb7185", core: "#ffd6de" },
  { glow: "#ff2a5f", core: "#ffc1d0" },
  { glow: "#f97316", core: "#ffd8b0" },
  { glow: "#a3e635", core: "#eaffc4" },
] as const;

type Ember = {
  x: number;
  y: number;
  r: number;
  glow: string;
  core: string;
  phase: number;
  wander: number;
  breath: number;
  vx: number;
  vy: number;
  heading: number;
  flash: boolean;
};

function pickPalette() {
  const roll = Math.random();
  if (roll < 0.34) return PALETTE[0];
  if (roll < 0.56) return PALETTE[1];
  if (roll < 0.72) return PALETTE[2];
  if (roll < 0.86) return PALETTE[3];
  if (roll < 0.94) return PALETTE[4];
  return PALETTE[5];
}

function hexAlpha(hex: string, alpha: number) {
  const n = hex.replace("#", "");
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function countFor(width: number, height: number) {
  return Math.round(Math.min(14, Math.max(8, (width * height) / 160000)));
}

function scatter(width: number, height: number): Ember[] {
  const total = countFor(width, height);
  const cols = Math.max(3, Math.round(Math.sqrt(total * (width / Math.max(height, 1)))));
  const rows = Math.max(3, Math.ceil(total / cols));
  const embers: Ember[] = [];
  for (let i = 0; i < total; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const palette = pickPalette()!;
    const large = Math.random() > 0.82;
    embers.push({
      x: ((col + 0.22 + Math.random() * 0.56) / cols) * width,
      y: ((row + 0.22 + Math.random() * 0.56) / rows) * height,
      r: large ? 1.7 + Math.random() * 0.4 : 1.1 + Math.random() * 0.35,
      glow: palette.glow,
      core: palette.core,
      phase: Math.random() * Math.PI * 2,
      wander: 0.18 + Math.random() * 0.35,
      breath: 0.35 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 3.2,
      vy: (Math.random() - 0.5) * 2.2,
      heading: Math.random() * Math.PI * 2,
      flash: Math.random() > 0.78,
    });
  }
  return embers;
}

function blinkOf(ember: Ember, now: number) {
  const t = now * 0.001 * ember.breath + ember.phase;
  if (ember.flash) {
    const wave = Math.sin(t);
    return 0.14 + 0.86 * Math.pow(Math.max(0, wave), 4);
  }
  return 0.28 + 0.58 * (0.5 + 0.5 * Math.sin(t));
}

function drawFirefly(ctx: CanvasRenderingContext2D, ember: Ember, now: number, blink: number) {
  if (blink < 0.08) return;
  const { x, y, r } = ember;
  const flap = 0.72 + 0.28 * Math.sin(now * 0.012 + ember.phase * 2.4);

  ctx.save();
  const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4);
  halo.addColorStop(0, hexAlpha(ember.core, 0.28));
  halo.addColorStop(0.45, hexAlpha(ember.glow, 0.1));
  halo.addColorStop(1, hexAlpha(ember.glow, 0));
  ctx.globalAlpha = blink * 0.55;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(x, y);
  ctx.rotate(ember.heading);

  ctx.globalAlpha = 0.18 * blink * flap;
  ctx.fillStyle = "rgba(255, 248, 230, 0.7)";
  ctx.beginPath();
  ctx.ellipse(-r * 1.05, -r * 0.08, r * 1.05, r * (0.22 + flap * 0.12), -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 1.05, -r * 0.08, r * 1.05, r * (0.22 + flap * 0.12), 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = blink * 0.72;
  ctx.fillStyle = ember.glow;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.12, r * 0.55, r * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = Math.min(0.9, blink * 0.95);
  ctx.fillStyle = ember.core;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.14, r * 0.28, r * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function WayEmbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = performance.now();
    let embers: Ember[] = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const next = countFor(width, height);
      if (Math.abs(next - embers.length) > 4) {
        embers = scatter(width, height);
      }
    };

    resize();
    if (embers.length === 0) embers = scatter(width, height);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const paint = (now: number, moving: boolean) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const ember of embers) {
        if (moving) {
          ember.phase += ember.wander * dt;
          const driftX = ember.vx + Math.sin(ember.phase) * 6 + Math.sin(ember.phase * 1.7) * 2.4;
          const driftY = ember.vy + Math.cos(ember.phase * 0.71) * 4.2 + Math.sin(ember.phase * 1.2) * 1.8;
          ember.x += driftX * dt;
          ember.y += driftY * dt;
          ember.heading = Math.atan2(driftY, driftX) + Math.PI / 2;
          if (ember.x < -12) ember.x = width + 8;
          if (ember.x > width + 12) ember.x = -8;
          if (ember.y < -12) ember.y = height + 8;
          if (ember.y > height + 12) ember.y = -8;
        }
        drawFirefly(ctx, ember, now, moving ? blinkOf(ember, now) : 0.45);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    if (quiet) {
      paint(performance.now(), false);
      return () => window.removeEventListener("resize", onResize);
    }

    const tick = (now: number) => {
      paint(now, true);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <canvas ref={canvasRef} className="way-gpu h-full w-full" aria-hidden />
    </div>
  );
}
