"use client";

import { useId } from "react";
import { nodeFrame, offsetFromNode, type MapNode, type Vec2 } from "@/lib/map-layout";

type Kind = "spire" | "tavern" | "cottage" | "ruin";
type Layer = "structures" | "dressing";

type BuildingSpec = {
  kind: Kind;
  node: number;
  outer: boolean;
  dist: number;
  along?: number;
  scale: number;
  far?: boolean;
};

type PropSpec = {
  kind: "barrels" | "crate" | "wood" | "well";
  node: number;
  outer: boolean;
  dist: number;
  along?: number;
};

/** Hand-composed town — clusters on bends, a few houses along quieter stretches. */
const BUILDINGS: BuildingSpec[] = [
  { kind: "ruin", node: 0, outer: true, dist: 112, along: 36, scale: 1.02 },
  { kind: "spire", node: 1, outer: false, dist: 124, along: -52, scale: 1.1 },
  { kind: "tavern", node: 1, outer: false, dist: 108, along: 8, scale: 1.06 },
  { kind: "cottage", node: 2, outer: true, dist: 94, along: 16, scale: 0.97 },
  { kind: "spire", node: 0, outer: true, dist: 248, along: -46, scale: 0.64, far: true },
  { kind: "tavern", node: 1, outer: false, dist: 286, along: -88, scale: 0.52, far: true },

  { kind: "spire", node: 3, outer: true, dist: 118, along: -30, scale: 1.04 },
  { kind: "tavern", node: 3, outer: true, dist: 100, along: 2, scale: 1.14 },
  { kind: "cottage", node: 3, outer: true, dist: 112, along: 38, scale: 0.86 },
  { kind: "cottage", node: 4, outer: false, dist: 98, along: 22, scale: 0.82 },
  { kind: "spire", node: 2, outer: true, dist: 214, along: -44, scale: 0.7, far: true },
  { kind: "tavern", node: 4, outer: false, dist: 276, along: 48, scale: 0.56, far: true },

  { kind: "cottage", node: 5, outer: true, dist: 96, along: -18, scale: 0.9 },
  { kind: "cottage", node: 6, outer: true, dist: 108, along: 24, scale: 0.76 },
  { kind: "tavern", node: 6, outer: false, dist: 104, along: 6, scale: 1.08 },
  { kind: "cottage", node: 8, outer: true, dist: 100, along: 12, scale: 0.84 },
  { kind: "cottage", node: 7, outer: false, dist: 248, along: -36, scale: 0.58, far: true },

  { kind: "tavern", node: 10, outer: true, dist: 102, along: 2, scale: 1.12 },
  { kind: "cottage", node: 10, outer: true, dist: 114, along: -42, scale: 0.9 },
  { kind: "ruin", node: 11, outer: true, dist: 96, along: 48, scale: 1 },
  { kind: "spire", node: 10, outer: false, dist: 268, along: 14, scale: 1.18, far: true },
  { kind: "cottage", node: 9, outer: false, dist: 306, along: -58, scale: 0.68, far: true },

  { kind: "cottage", node: 12, outer: true, dist: 98, along: 18, scale: 0.88 },
  { kind: "cottage", node: 13, outer: true, dist: 110, along: -26, scale: 1.06 },
  { kind: "tavern", node: 14, outer: false, dist: 102, along: 10, scale: 0.96 },
  { kind: "cottage", node: 15, outer: true, dist: 94, along: 8, scale: 0.72 },
  { kind: "spire", node: 13, outer: true, dist: 236, along: 40, scale: 0.62, far: true },

  { kind: "cottage", node: 16, outer: true, dist: 108, along: -52, scale: 0.84 },
  { kind: "spire", node: 17, outer: true, dist: 108, along: -24, scale: 1.08 },
  { kind: "tavern", node: 17, outer: true, dist: 100, along: 28, scale: 0.94 },
  { kind: "ruin", node: 18, outer: false, dist: 240, along: 10, scale: 0.78, far: true },
  { kind: "spire", node: 17, outer: false, dist: 292, along: -64, scale: 1.06, far: true },

  { kind: "cottage", node: 19, outer: true, dist: 96, along: -12, scale: 0.8 },
  { kind: "cottage", node: 20, outer: true, dist: 108, along: 28, scale: 1.1 },
  { kind: "ruin", node: 21, outer: false, dist: 168, along: 6, scale: 1.02 },
  { kind: "cottage", node: 22, outer: true, dist: 100, along: -20, scale: 0.76 },
  { kind: "tavern", node: 20, outer: false, dist: 258, along: -44, scale: 0.54, far: true },

  { kind: "cottage", node: 24, outer: true, dist: 100, along: -12, scale: 1.15 },
  { kind: "tavern", node: 24, outer: true, dist: 106, along: 40, scale: 0.88 },
  { kind: "spire", node: 23, outer: true, dist: 118, along: -56, scale: 0.78, far: true },
  { kind: "tavern", node: 24, outer: false, dist: 278, along: 22, scale: 0.6, far: true },
  { kind: "spire", node: 25, outer: false, dist: 314, along: -40, scale: 0.98, far: true },

  { kind: "cottage", node: 26, outer: true, dist: 96, along: 10, scale: 0.9 },
  { kind: "cottage", node: 27, outer: false, dist: 104, along: -24, scale: 0.74 },
  { kind: "spire", node: 28, outer: true, dist: 168, along: -14, scale: 1.16 },
  { kind: "cottage", node: 28, outer: false, dist: 100, along: 32, scale: 0.8 },
  { kind: "ruin", node: 29, outer: false, dist: 158, along: 32, scale: 0.96 },
  { kind: "cottage", node: 26, outer: true, dist: 242, along: -38, scale: 0.56, far: true },
];

const PROPS: PropSpec[] = [
  { kind: "barrels", node: 1, outer: false, dist: 72, along: 34 },
  { kind: "crate", node: 1, outer: false, dist: 78, along: 46 },
  { kind: "wood", node: 2, outer: true, dist: 72, along: -8 },
  { kind: "well", node: 6, outer: false, dist: 70, along: 8 },
  { kind: "barrels", node: 6, outer: true, dist: 58, along: 18 },
  { kind: "crate", node: 7, outer: false, dist: 64, along: -16 },
  { kind: "wood", node: 7, outer: true, dist: 56, along: 12 },

  { kind: "barrels", node: 3, outer: true, dist: 64, along: 16 },
  { kind: "crate", node: 3, outer: true, dist: 68, along: -20 },
  { kind: "wood", node: 5, outer: true, dist: 62, along: 8 },
  { kind: "crate", node: 8, outer: true, dist: 60, along: -14 },

  { kind: "well", node: 13, outer: false, dist: 76, along: -8 },
  { kind: "wood", node: 14, outer: true, dist: 60, along: 16 },
  { kind: "barrels", node: 14, outer: false, dist: 66, along: 20 },
  { kind: "crate", node: 12, outer: true, dist: 58, along: 10 },
  { kind: "wood", node: 15, outer: true, dist: 56, along: -8 },

  { kind: "barrels", node: 10, outer: true, dist: 62, along: 14 },
  { kind: "wood", node: 11, outer: true, dist: 60, along: -6 },

  { kind: "crate", node: 17, outer: true, dist: 66, along: 6 },
  { kind: "barrels", node: 17, outer: true, dist: 62, along: 24 },
  { kind: "wood", node: 19, outer: true, dist: 58, along: 6 },

  { kind: "well", node: 20, outer: false, dist: 72, along: 4 },
  { kind: "wood", node: 21, outer: true, dist: 58, along: -12 },
  { kind: "barrels", node: 22, outer: true, dist: 60, along: 14 },

  { kind: "barrels", node: 24, outer: true, dist: 64, along: 10 },
  { kind: "crate", node: 26, outer: true, dist: 58, along: 8 },
  { kind: "crate", node: 27, outer: false, dist: 66, along: 8 },
  { kind: "well", node: 27, outer: true, dist: 80, along: -18 },
];

function place(nodes: MapNode[], width: number, spec: { node: number; outer: boolean; dist: number; along?: number }) {
  const index = Math.max(0, Math.min(spec.node, nodes.length - 1));
  const origin = offsetFromNode(nodes, index, spec.dist, !spec.outer, width);
  const { tangent } = nodeFrame(nodes, index);
  const along = spec.along ?? 0;
  return {
    x: Math.min(width - 16, Math.max(16, origin.x + tangent.x * along)),
    y: origin.y + tangent.y * along,
    road: nodes[index]!,
  };
}

export function WayTown({
  nodes,
  width,
  layer = "structures",
}: {
  nodes: MapNode[];
  width: number;
  layer?: Layer;
}) {
  const uid = useId().replace(/:/g, "");
  const pool = `${uid}-${layer}-win`;

  const buildings = BUILDINGS.map((spec, index) => ({ spec, at: place(nodes, width, spec), index }))
    .filter((item) => item.at.y > 20)
    .sort((a, b) => Number(Boolean(!a.spec.far)) - Number(Boolean(!b.spec.far)) || a.at.y - b.at.y);

  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id={pool} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.55)" />
          <stop offset="38%" stopColor="rgba(245,158,11,0.22)" />
          <stop offset="100%" stopColor="rgba(245,158,11,0)" />
        </radialGradient>
      </defs>

      {buildings.map(({ spec, at, index }) => {
        if (layer === "dressing" && spec.far) return null;
        const face = spec.scale * (at.x > at.road.x ? -1 : 1);
        return (
          <g key={`${layer}-${index}`}>
            {layer === "dressing" && spec.kind === "tavern" && <Walkway from={at} to={at.road} />}
            <g transform={`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) scale(${face} ${spec.scale})`}>
              <Building kind={spec.kind} far={Boolean(spec.far)} pool={pool} layer={layer} />
            </g>
          </g>
        );
      })}

      {layer === "dressing" &&
        PROPS.map((spec, index) => {
          const at = place(nodes, width, spec);
          return (
            <g key={`p-${index}`} transform={`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)})`}>
              <Prop kind={spec.kind} />
            </g>
          );
        })}
    </g>
  );
}

function Building({
  kind,
  far,
  pool,
  layer,
}: {
  kind: Kind;
  far: boolean;
  pool: string;
  layer: Layer;
}) {
  if (kind === "spire") return <Spire far={far} pool={pool} layer={layer} />;
  if (kind === "tavern") return <Tavern far={far} pool={pool} layer={layer} />;
  if (kind === "cottage") return <Cottage far={far} pool={pool} layer={layer} />;
  return <Ruin far={far} pool={pool} layer={layer} />;
}

function Walkway({ from, to }: { from: Vec2; to: Vec2 }) {
  const x2 = from.x + (to.x - from.x) * 0.58;
  const y2 = from.y + (to.y - from.y) * 0.58;
  const x1 = from.x + (to.x - from.x) * 0.22;
  const y1 = from.y + (to.y - from.y) * 0.22;
  return (
    <g>
      <path
        d={`M${from.x.toFixed(1)} ${(from.y + 5).toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
        stroke="#241018"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d={`M${from.x.toFixed(1)} ${(from.y + 5).toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
        stroke="#3a1c28"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse cx={x1} cy={y1 + 3} rx="5.5" ry="2.4" fill="#442028" />
      <ellipse cx={(x1 + x2) / 2} cy={(y1 + y2) / 2 + 3} rx="5" ry="2.2" fill="#321820" />
    </g>
  );
}

function Doorstep() {
  return (
    <g>
      <path d="M14 5 C28 3 46 8 58 13" stroke="#241018" strokeWidth="10" strokeLinecap="round" />
      <path d="M16 5 C30 4 44 9 56 12" stroke="#3a1c28" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="22" cy="5.5" rx="5" ry="2.1" fill="#442028" />
      <ellipse cx="34" cy="7" rx="4.4" ry="1.9" fill="#321820" />
      <ellipse cx="46" cy="9.5" rx="4.8" ry="2" fill="#3a1c28" />
    </g>
  );
}

function Spire({ far, pool, layer }: { far: boolean; pool: string; layer: Layer }) {
  if (far) {
    return (
      <g>
        <path d="M-9 4 L-7 -88 L7 -88 L9 4 Z" fill="#0e060d" />
        <path d="M-12 -88 L0 -128 L12 -88 Z" fill="#0e060d" />
      </g>
    );
  }
  if (layer === "dressing") {
    return (
      <g>
        <ellipse cx="16" cy="6" rx="20" ry="11" fill={`url(#${pool})`} />
        <Doorstep />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="0" cy="6" rx="16" ry="5" fill="#0a040b" opacity="0.55" />
      <path d="M-10 4 L-8 -86 L8 -86 L10 4 Z" fill="#2a1c22" />
      <path d="M-10 4 L-8 -86 L-3 -86 L-4 4 Z" fill="#1a1016" />
      <path d="M-8 -22 H8 M-8 -44 H8 M-8 -66 H8" stroke="#3a2a32" strokeWidth="1.6" />
      <path d="M-10 -8 H10" stroke="#161016" strokeWidth="2.2" />
      <rect x="-2.2" y="-78" width="2.4" height="11" fill="#080308" />
      <rect x="-2.2" y="-56" width="2.4" height="10" fill="#080308" />
      <rect x="-2.2" y="-34" width="2.4" height="10" fill="#080308" />
      <rect x="3.4" y="-70" width="2.6" height="9" fill="#fbbf24" opacity="0.92" />
      <rect x="3.4" y="-48" width="2.6" height="8" fill="#f59e0b" opacity="0.55" />
      <path d="M-14 -86 L0 -132 L14 -86 Z" fill="#4a0c18" />
      <path d="M-8 -86 L0 -122 L8 -86 Z" fill="#6b1224" />
      <path d="M-3 -100 H3 V-86 H-3 Z" fill="#241014" />
      <path d="M0 -132 L0 -146" stroke="#c4b4a4" strokeWidth="1.15" />
      <path d="M0 -146 L9 -141 M0 -146 L8 -150 L0 -147" fill="none" stroke="#c4b4a4" strokeWidth="0.95" />
      <circle cx="0" cy="-146" r="1.5" fill="#f59e0b" />
    </g>
  );
}

function Tavern({ far, pool, layer }: { far: boolean; pool: string; layer: Layer }) {
  if (far) {
    return (
      <g>
        <rect x="-40" y="-52" width="80" height="56" fill="#0e060d" />
        <path d="M-48 -50 L0 -82 L48 -50 Z" fill="#0e060d" />
      </g>
    );
  }
  if (layer === "dressing") {
    return (
      <g>
        <ellipse cx="-18" cy="8" rx="24" ry="13" fill={`url(#${pool})`} />
        <ellipse cx="10" cy="9" rx="20" ry="12" fill={`url(#${pool})`} opacity="0.7" />
        <Doorstep />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="0" cy="7" rx="50" ry="8" fill="#0a040b" opacity="0.5" />
      <path d="M-46 5 L-46 -8 L46 -8 L46 5 Z" fill="#3a2a28" />
      <rect x="-44" y="-36" width="88" height="28" fill="#4a2018" />
      <rect x="-48" y="-68" width="96" height="34" fill="#3a1814" />
      <path d="M-44 -36 H44 M-48 -68 H48" stroke="#1a0a0c" strokeWidth="2" />
      <path d="M-22 -68 V5 M0 -68 V5 M22 -68 V5" stroke="#1c0c0e" strokeWidth="2.2" />
      <path d="M-38 -58 L-30 -44 L-22 -58 M-16 -58 L-8 -44 L0 -58 M6 -58 L14 -44 L22 -58" fill="none" stroke="#14080a" strokeWidth="1.4" />
      <path d="M-56 -64 L0 -102 L56 -64 Z" fill="#4a0c18" />
      <path d="M-42 -64 L0 -92 L42 -64 Z" fill="#6b1224" />
      <rect x="-38" y="-98" width="8" height="18" fill="#241014" />
      <path d="M8 5 V-22 Q22 -34 36 -22 V5 Z" fill="#1a0c10" />
      <path d="M14 -8 Q22 -14 30 -8" fill="none" stroke="#3a2018" strokeWidth="1.1" />
      <rect x="-36" y="-62" width="16" height="12" fill="#fbbf24" opacity="0.9" />
      <rect x="-16" y="-62" width="16" height="12" fill="#f59e0b" opacity="0.78" />
      <path d="M-28 -62 V-50 M-36 -56 H-20 M-8 -62 V-50 M-16 -56 H0" stroke="#1a080c" strokeWidth="0.85" />
      <rect x="-34" y="-28" width="14" height="14" fill="#2a0a10" />
      <path d="M-27 -28 V-14 M-34 -21 H-20" stroke="#1a080c" strokeWidth="0.7" />
      <g transform="translate(40 -28)">
        <path d="M0 0 H18 V14 H0 Z" fill="#2a1410" stroke="#1a0a0c" strokeWidth="0.8" />
        <path d="M9 -6 V0" stroke="#1a0a0c" strokeWidth="1.1" />
        <path d="M5 4 H13 V11 Q9 13 5 11 Z" fill="#6b1224" />
      </g>
      <circle cx="28" cy="-8" r="1.4" fill="#fbbf24" />
    </g>
  );
}

function Cottage({ far, pool, layer }: { far: boolean; pool: string; layer: Layer }) {
  if (far) {
    return (
      <g transform="rotate(-6)">
        <path d="M-28 4 L-34 -16 L-18 -52 L22 -48 L32 5 Z" fill="#0e060d" />
        <path d="M-38 -18 L-6 -72 L36 -16 Z" fill="#0e060d" />
      </g>
    );
  }
  if (layer === "dressing") {
    return (
      <g transform="rotate(-6)">
        <ellipse cx="8" cy="8" rx="22" ry="12" fill={`url(#${pool})`} />
        <path d="M10 5 C22 4 34 8 44 12" stroke="#241018" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="18" cy="6" rx="4.2" ry="1.8" fill="#442028" />
      </g>
    );
  }
  return (
    <g transform="rotate(-6)">
      <ellipse cx="0" cy="7" rx="32" ry="6" fill="#0a040b" opacity="0.5" />
      <path d="M-30 5 L-36 -16 L-22 -54 L16 -62 L38 -14 L28 6 Z" fill="#2a1824" />
      <path d="M-42 -18 L-10 -76 L40 -16 Z" fill="#3a1424" />
      <path d="M-26 -20 L-8 -64 L22 -18" fill="#541428" opacity="0.85" />
      <path d="M-28 -8 H22" stroke="#4a2430" strokeWidth="7" strokeLinecap="round" />
      <path d="M-26 -8 H20" stroke="#2a141c" strokeWidth="1.2" />
      <path d="M-8 -48 L-5 -96 L7 -94 L9 -46 Z" fill="#1c1014" transform="rotate(8 -1 -70)" />
      <ellipse cx="-6" cy="-22" rx="8" ry="7" fill="#fb7185" opacity="0.88" />
      <ellipse cx="-6" cy="-22" rx="3.2" ry="2.8" fill="#fecdd3" opacity="0.55" />
      <rect x="10" y="-18" width="3.2" height="9" rx="1" fill="#34d399" opacity="0.7" />
      <rect x="15" y="-16" width="2.8" height="7" rx="1" fill="#fbbf24" opacity="0.75" />
      <rect x="19" y="-20" width="2.6" height="11" rx="1" fill="#fb7185" opacity="0.65" />
      <ellipse cx="2" cy="-100" rx="8" ry="3.4" fill="rgba(214,196,204,0.24)" />
      <ellipse cx="8" cy="-108" rx="6" ry="2.6" fill="rgba(214,196,204,0.18)" />
      <ellipse cx="-2" cy="-104" rx="5" ry="2.2" fill="rgba(214,196,204,0.14)" />
    </g>
  );
}

function Ruin({ far, pool, layer }: { far: boolean; pool: string; layer: Layer }) {
  if (far) {
    return <path d="M-40 5 L-36 -18 L-12 -10 L4 -22 L28 -8 L38 6 Z" fill="#0e060d" />;
  }
  if (layer === "dressing") {
    return (
      <g>
        <ellipse cx="22" cy="7" rx="18" ry="10" fill={`url(#${pool})`} />
        <ellipse cx="-8" cy="8" rx="10" ry="5" fill="#1a1014" opacity="0.45" />
        <ellipse cx="6" cy="9" rx="8" ry="4" fill="#24181c" opacity="0.4" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="0" cy="6" rx="40" ry="7" fill="#0a040b" opacity="0.4" />
      <path d="M-42 5 L-38 -22 L-16 -28 L-6 -8 L8 -30 L32 -16 L42 2 L36 6 Z" fill="#2a2428" />
      <path d="M-34 5 L-32 -14 L-18 -8 L-12 5" fill="#3a3236" />
      <path d="M-4 -8 C2 -26 18 -28 22 -8" fill="none" stroke="#3a3236" strokeWidth="3.2" />
      <path d="M-30 -12 H-8 M6 -18 H30" stroke="#4a4a56" strokeWidth="1.2" />
      <path d="M-26 -12 V5 M-16 -12 V5 M12 -18 V5 M24 -18 V4" stroke="#4a4a56" strokeWidth="1.05" />
      <path d="M-24 5 C-14 -16 0 -20 12 -2" fill="none" stroke="#991b1b" strokeWidth="2.1" />
      <path d="M2 5 C12 -14 24 -18 34 1" fill="none" stroke="#dc2626" strokeWidth="1.6" opacity="0.85" />
      <ellipse cx="-10" cy="-6" rx="7" ry="4" fill="#7f1d1d" opacity="0.7" />
      <ellipse cx="16" cy="-10" rx="6" ry="3.4" fill="#991b1b" opacity="0.65" />
      <ellipse cx="4" cy="1" rx="5" ry="2.6" fill="#b91c1c" opacity="0.5" />
      <path d="M26 -34 V-2" stroke="#16161c" strokeWidth="2" />
      <path d="M21 -32 H31 L29.5 -18 H22.5 Z" fill="#0b0b10" stroke="#2a2a34" strokeWidth="0.7" />
      <ellipse cx="26" cy="-24" rx="3.2" ry="4.4" fill="#ffb347" />
    </g>
  );
}

function Prop({ kind }: { kind: PropSpec["kind"] }) {
  if (kind === "well") {
    return (
      <g>
        <ellipse cx="0" cy="5" rx="17" ry="6.5" fill="#0a040b" opacity="0.45" />
        <ellipse cx="0" cy="3" rx="14" ry="5.4" fill="#2a1c20" />
        <ellipse cx="0" cy="2" rx="9.5" ry="3.6" fill="#0c0710" />
        <path d="M-9 1 L-9 -16 L9 -16 L9 1" fill="none" stroke="#3a2418" strokeWidth="1.7" />
        <path d="M-10 -16 H10" stroke="#4a2c1c" strokeWidth="2.4" />
        <path d="M0 -16 V-6" stroke="#5a3824" strokeWidth="0.9" />
        <ellipse cx="0" cy="-6" rx="2.4" ry="1.2" fill="#1a1014" />
      </g>
    );
  }
  if (kind === "barrels") {
    return (
      <g>
        <ellipse cx="-8" cy="4" rx="7.5" ry="5.4" fill="#3a2418" />
        <ellipse cx="-8" cy="-2" rx="7.5" ry="3.4" fill="#5a3824" />
        <path d="M-14.5 -2 V5 M-1.5 -2 V5" stroke="#2a1810" strokeWidth="0.85" />
        <path d="M-14 -0.4 H-2" stroke="#6a4430" strokeWidth="0.7" />
        <ellipse cx="9" cy="5" rx="6.4" ry="4.6" fill="#321c14" />
        <ellipse cx="9" cy="0.4" rx="6.4" ry="2.9" fill="#4a2c1c" />
      </g>
    );
  }
  if (kind === "crate") {
    return (
      <g>
        <path d="M-9 6 L-9 -7 L9 -12 L9 3 Z" fill="#3a2418" />
        <path d="M-9 -7 L0 -14 L9 -12 L0 -5 Z" fill="#5a3824" />
        <path d="M0 -5 L0 9 L9 3 L9 -12" fill="#2a1810" />
        <path d="M-6 -8 L6 -4" stroke="#2a1810" strokeWidth="0.7" />
      </g>
    );
  }
  return (
    <g>
      <path d="M-13 5 L-11 -3 L-5 -1 L1 -6 L8 0 L13 6 Z" fill="#3a2418" />
      <path d="M-10 0 L-7 -8 M-3 -1 L0 -9 M5 1 L7 -6" stroke="#5a3824" strokeWidth="1.7" />
    </g>
  );
}
