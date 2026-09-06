"use client";

import { useRef, useState, type MouseEvent } from "react";

export function useHudGlow(origin = { x: 180, y: 22 }) {
  const ref = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState(origin);
  const [lit, setLit] = useState(false);

  const onMouseMove = (event: MouseEvent<HTMLElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setSpot({ x: event.clientX - box.left, y: event.clientY - box.top });
    setLit(true);
  };

  const onMouseLeave = () => setLit(false);

  return { ref, spot, lit, onMouseMove, onMouseLeave };
}

export function HudGlow({
  lit,
  spot,
}: {
  lit: boolean;
  spot: { x: number; y: number };
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: lit ? 1 : 0,
        transition: lit ? "opacity 120ms ease-out" : "opacity 1.05s cubic-bezier(0.22, 1, 0.36, 1)",
        background: `radial-gradient(240px circle at ${spot.x}px ${spot.y}px, rgba(255,30,86,0.18), transparent 55%)`,
      }}
    />
  );
}
