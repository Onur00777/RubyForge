"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MapNode } from "@/lib/map-layout";

interface Props {
  path: string;
  nodes: MapNode[];
  width: number;
  height: number;
  frontier: number;
}

export function TrailSvg({ path, nodes, width, height, frontier }: Props) {
  const ref = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) setLength(ref.current.getTotalLength());
  }, [path]);

  const progress = useMemo(() => {
    if (nodes.length <= 1) return 1;
    return Math.min(1, Math.max(0, (frontier - 1) / (nodes.length - 1)));
  }, [frontier, nodes.length]);

  const dashOffset = length * (1 - progress);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Crimson Path winding trail"
    >
      <defs>
        <filter id="trail-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="rgba(225, 29, 72, 0.2)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="8 8"
      />
      <path
        ref={ref}
        d={path}
        fill="none"
        stroke="#FF1E56"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={length || 1}
        strokeDashoffset={dashOffset}
        filter="url(#trail-glow)"
        style={{
          filter: "drop-shadow(0 0 12px #FF1E56)",
          transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </svg>
  );
}
