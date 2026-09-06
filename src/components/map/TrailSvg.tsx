"use client";

import { useId, useMemo } from "react";
import {
  apexIndices,
  offsetFromNode,
  offsetPolyline,
  polylineLength,
  polylinePath,
  sampleTrail,
  seedUnit,
  type MapNode,
} from "@/lib/map-layout";
import { WayTown } from "./WayTown";

interface Props {
  path: string;
  nodes: MapNode[];
  width: number;
  height: number;
  frontier: number;
  activeId: number;
}

export function TrailSvg({ path, nodes, width, height, frontier, activeId }: Props) {
  const uid = useId().replace(/:/g, "");
  const cobble = `${uid}-cobble`;
  const earth = `${uid}-earth`;
  const shadow = `${uid}-shadow`;
  const mist = `${uid}-mist`;
  const mistFill = `${uid}-mist-fill`;
  const pool = `${uid}-pool`;

  const sampled = useMemo(() => sampleTrail(nodes, 10), [nodes]);
  const length = useMemo(() => polylineLength(sampled), [sampled]);
  const leftCurb = useMemo(() => polylinePath(offsetPolyline(sampled, 38)), [sampled]);
  const rightCurb = useMemo(() => polylinePath(offsetPolyline(sampled, -38)), [sampled]);
  const progress = nodes.length <= 1 ? 1 : Math.min(1, Math.max(0, (frontier - 1) / (nodes.length - 1)));
  const dashOffset = length * (1 - progress);
  const apexes = useMemo(() => apexIndices(nodes, width), [nodes, width]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMin meet"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Crimson cobblestone way"
    >
      <defs>
        <pattern id={cobble} width="56" height="36" patternUnits="userSpaceOnUse">
          <rect width="56" height="36" fill="#1a0c14" />
          <path d="M1 2 17 1 27 13 14 22 1 16Z" fill="#3a1c28" stroke="#5a2834" strokeWidth="0.7" />
          <path d="M18 0 40 2 43 14 28 18 20 7Z" fill="#442028" stroke="#5a2834" strokeWidth="0.7" />
          <path d="M41 1 55 0 56 15 44 17 38 8Z" fill="#321820" stroke="#5a2834" strokeWidth="0.7" />
          <path d="M0 17 13 23 12 35 0 34Z" fill="#2a1420" stroke="#5a2834" strokeWidth="0.7" />
          <path d="M15 22 32 18 38 34 16 35Z" fill="#3a1c28" stroke="#5a2834" strokeWidth="0.7" />
          <path d="M33 19 56 16 56 36 39 35Z" fill="#4a2430" stroke="#5a2834" strokeWidth="0.7" />
          <path d="M8 8 12 10 9 13" fill="none" stroke="#4a1c28" strokeWidth="0.5" opacity="0.7" />
        </pattern>

        <pattern id={earth} width="90" height="90" patternUnits="userSpaceOnUse">
          <rect width="90" height="90" fill="#0c060a" />
          <ellipse cx="18" cy="22" rx="16" ry="11" fill="#14080e" opacity="0.55" />
          <ellipse cx="62" cy="48" rx="20" ry="13" fill="#12070c" opacity="0.5" />
          <ellipse cx="40" cy="78" rx="18" ry="10" fill="#1a0c12" opacity="0.35" />
        </pattern>

        <filter id={shadow} x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="4" />
        </filter>

        <filter id={mist} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.04" numOctaves="2" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" />
        </filter>

        <radialGradient id={pool} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,100,50,0.28)" />
          <stop offset="70%" stopColor="rgba(255,100,50,0)" />
        </radialGradient>

        <g id={`${uid}-leaf`}>
          <path d="M0 8 C-6 2 -5 -6 0 -11 C5 -6 6 2 0 8 Z" fill="currentColor" />
          <path d="M0 8 L0 -6" stroke="#4a1020" strokeWidth="0.7" />
        </g>
      </defs>

      <rect width={width} height={height} fill={`url(#${earth})`} />
      <rect width={48} height={height} fill="#070309" opacity="0.55" />
      <rect x={width - 48} width={48} height={height} fill="#070309" opacity="0.55" />

      <WayTown nodes={nodes} width={width} layer="structures" />

      {/* Layer A — road silhouette & cast shadow */}
      <path
        d={path}
        fill="none"
        stroke="#0a040b"
        strokeWidth="84"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${shadow})`}
        opacity="0.9"
      />

      {/* dirt shoulder */}
      <path
        d={path}
        fill="none"
        stroke="#12080c"
        strokeWidth="110"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />

      {/* Layer B — cobblestone bed */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${cobble})`}
        strokeWidth="76"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* inner mortar groove */}
      <path
        d={path}
        fill="none"
        stroke="#1a0c14"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Layer C — dual curbs */}
      <path d={leftCurb} fill="none" stroke="#591124" strokeWidth="4" strokeLinecap="round" />
      <path d={rightCurb} fill="none" stroke="#591124" strokeWidth="4" strokeLinecap="round" />
      <path d={leftCurb} fill="none" stroke="#FF1E56" strokeWidth="1.2" strokeLinecap="round" opacity="0.28" />
      <path d={rightCurb} fill="none" stroke="#FF1E56" strokeWidth="1.2" strokeLinecap="round" opacity="0.28" />

      <WayTown nodes={nodes} width={width} layer="dressing" />

      {/* lantern light pools sit on the cobbles */}
      {nodes.map((node, index) => {
        const pos = offsetFromNode(nodes, index, 78, true, width);
        const lit = node.id <= frontier;
        return (
          <ellipse
            key={`pool-${node.id}`}
            cx={pos.x}
            cy={pos.y + 16}
            rx="30"
            ry="11"
            fill={`url(#${pool})`}
            opacity={lit ? 1 : 0.35}
          />
        );
      })}

      {/* Layer D — traveled path glow */}
      <path
        d={path}
        fill="none"
        stroke="rgba(255,30,86,0.45)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={length || 1}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <path
        d={path}
        fill="none"
        stroke="#FF1E56"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={length || 1}
        strokeDashoffset={dashOffset}
        opacity="0.7"
        style={{
          filter: "drop-shadow(0 0 10px rgba(255,30,86,0.65))",
          transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {apexes.map((index) => (
        <PlanterCluster
          key={`planter-${index}`}
          origin={offsetFromNode(nodes, index, 64, false, width)}
          curb={offsetFromNode(nodes, index, 40, false, width)}
          seed={index}
          leafId={`${uid}-leaf`}
        />
      ))}

      {nodes.map((node, index) => (
        <Lantern
          key={`lantern-${node.id}`}
          origin={offsetFromNode(nodes, index, 78, true, width)}
          lit={node.id <= frontier}
          hot={node.id === activeId}
        />
      ))}

      <MistLayers height={height} width={width} mist={mist} fill={mistFill} />
      <SkyWildlife width={width} />
    </svg>
  );
}

function Lantern({ origin, lit, hot }: { origin: { x: number; y: number }; lit: boolean; hot: boolean }) {
  return (
    <g transform={`translate(${origin.x.toFixed(1)} ${origin.y.toFixed(1)})`} className="way-gpu">
      <path d="M-1.4 -30 L1.4 -30 L1.8 14 L-1.8 14 Z" fill="#0c0c10" />
      <path d="M-6 14 L6 14 L4.5 19 L-4.5 19 Z" fill="#16161c" />
      <path d="M-5 19 L5 19 L3.5 22 L-3.5 22 Z" fill="#0a0a0e" />
      <path d="M0 -26 C14 -27 16 -18 9 -12" fill="none" stroke="#1c1c24" strokeWidth="1.7" />
      <path d="M4.5 -15 L15.5 -15 L14.2 -3.5 L5.6 -3.5 Z" fill="#0b0b10" stroke="#2a2a34" strokeWidth="0.7" />
      <path d="M7 -15 L7 -3.5 M12.5 -15 L12.5 -3.5" stroke="#2a2a34" strokeWidth="0.5" />
      <g className={lit ? "way-flame" : undefined} style={{ transformBox: "fill-box", transformOrigin: "10px -9px" }}>
        <ellipse cx="10" cy="-9.2" rx={hot ? 4.2 : 3.1} ry={hot ? 5.4 : 4.2} fill="#ffb347" opacity={lit ? 0.95 : 0.2} />
        <ellipse cx="10" cy="-10.4" rx="1.5" ry="2.3" fill="#fff4c8" opacity={lit ? 1 : 0.1} />
      </g>
    </g>
  );
}

function PlanterCluster({
  origin,
  curb,
  seed,
  leafId,
}: {
  origin: { x: number; y: number };
  curb: { x: number; y: number };
  seed: number;
  leafId: string;
}) {
  const tilt = (seedUnit(seed) - 0.5) * 12;
  return (
    <g transform={`translate(${origin.x.toFixed(1)} ${origin.y.toFixed(1)}) rotate(${tilt.toFixed(1)})`} className="way-gpu">
      <path
        d={`M${(curb.x - origin.x).toFixed(1)} ${(curb.y - origin.y).toFixed(1)} Q 8 -6 2 -18 T 10 -32`}
        fill="none"
        stroke="#3f1a22"
        strokeWidth="1.4"
        opacity="0.8"
      />
      <path
        d={`M${(curb.x - origin.x + 4).toFixed(1)} ${(curb.y - origin.y + 2).toFixed(1)} Q 12 -2 6 -16`}
        fill="none"
        stroke="#991b1b"
        strokeWidth="1.1"
        opacity="0.7"
      />
      <path d="M-9 8 L9 8 L7 20 L-7 20 Z" fill="#3a2418" />
      <path d="M-8 8 L8 8 L7 11 L-7 11 Z" fill="#5a3824" />
      <ellipse cx="0" cy="8" rx="10" ry="3.4" fill="#4a2c1c" />
      <use href={`#${leafId}`} x="-6" y="-4" color="#dc2626" transform="rotate(-24 -6 -4) scale(1.1)" />
      <use href={`#${leafId}`} x="4" y="-8" color="#991b1b" transform="rotate(18 4 -8) scale(0.95)" />
      <use href={`#${leafId}`} x="-1" y="-14" color="#b91c1c" transform="rotate(-6 -1 -14)" />
      <use href={`#${leafId}`} x="8" y="-2" color="#7f1d1d" transform="rotate(32 8 -2) scale(0.8)" />
    </g>
  );
}

function MistLayers({
  width,
  height,
  mist,
  fill,
}: {
  width: number;
  height: number;
  mist: string;
  fill: string;
}) {
  const tile = `${fill}-tile`;
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(90,20,40,0.2)" />
          <stop offset="100%" stopColor="rgba(40,10,22,0.05)" />
        </linearGradient>
        <pattern id={tile} width="240" height="160" patternUnits="userSpaceOnUse">
          <ellipse cx="120" cy="80" rx="108" ry="46" fill={`url(#${fill})`} filter={`url(#${mist})`} />
        </pattern>
      </defs>
      <g className="way-mist-a way-gpu">
        <rect x={-80} width={width + 160} height={height} fill={`url(#${tile})`} opacity="0.7" />
      </g>
      <g className="way-mist-b way-gpu">
        <rect x={-80} width={width + 160} height={height} fill={`url(#${tile})`} opacity="0.4" />
      </g>
    </g>
  );
}

function SkyWildlife({ width }: { width: number }) {
  const bird =
    "M0 0 C6 -3 12 -2 18 1 C12 2 9 3 7 1 C5 7 2 4 0 0 Z";
  return (
    <g pointerEvents="none" fill="#0a040b" opacity="0.55">
      <g className="way-raven way-gpu">
        <path d={bird} transform="translate(40 70) scale(1.6)" />
      </g>
      <g className="way-raven way-raven-b way-gpu">
        <path d={bird} transform={`translate(${width * 0.12} 210) scale(1.15)`} />
      </g>
      <g className="way-raven way-raven-c way-gpu">
        <path d={bird} transform="translate(90 1480) scale(1.35)" />
      </g>
    </g>
  );
}
