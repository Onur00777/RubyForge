"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
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

const STRIP_CSS = 560;
const RASTER_DPR = 1.25;

export const TrailSvg = memo(function TrailSvg({ path, nodes, width, height, frontier, activeId }: Props) {
  const uid = useId().replace(/:/g, "");
  const cobble = `${uid}-cobble`;
  const earth = `${uid}-earth`;
  const mistFill = `${uid}-mist-fill`;
  const pool = `${uid}-pool`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stripsRef = useRef<HTMLDivElement>(null);
  const [baked, setBaked] = useState(false);

  const sampled = useMemo(() => sampleTrail(nodes, 10), [nodes]);
  const length = useMemo(() => polylineLength(sampled), [sampled]);
  const leftCurb = useMemo(() => polylinePath(offsetPolyline(sampled, 38)), [sampled]);
  const rightCurb = useMemo(() => polylinePath(offsetPolyline(sampled, -38)), [sampled]);
  const progress = nodes.length <= 1 ? 1 : Math.min(1, Math.max(0, (frontier - 1) / (nodes.length - 1)));
  const dashOffset = length * (1 - progress);
  const apexes = useMemo(() => apexIndices(nodes, width), [nodes, width]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const host = stripsRef.current;
    if (!wrap || !svg || !host) return;

    let token = 0;
    let timer = 0;

    const bake = () => {
      const my = ++token;
      const cssWidth = wrap.clientWidth;
      const cssHeight = wrap.clientHeight;
      if (cssWidth < 16 || cssHeight < 16) return;
      void rasterTrail(svg, cssWidth, cssHeight, width, height)
        .then((canvases) => {
          if (my !== token) return;
          host.replaceChildren(...canvases);
          setBaked(true);
        })
        .catch(() => {
          if (my === token) setBaked(false);
        });
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(bake, 40);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(wrap);
    schedule();
    return () => {
      token += 1;
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [path, frontier, activeId, width, height, nodes]);

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-[#0c060a]" role="img" aria-label="Crimson cobblestone way">
      <div ref={stripsRef} className="absolute inset-0 overflow-hidden" aria-hidden />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMin meet"
        className={baked ? "hidden" : "absolute inset-0 h-full w-full"}
        aria-hidden={baked}
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
        stroke="#070309"
        strokeWidth="96"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path
        d={path}
        fill="none"
        stroke="#0a040b"
        strokeWidth="84"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
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

      <MistLayers height={height} width={width} fill={mistFill} />
      <SkyWildlife width={width} />
      </svg>
    </div>
  );
});

function Lantern({ origin, lit, hot }: { origin: { x: number; y: number }; lit: boolean; hot: boolean }) {
  return (
    <g transform={`translate(${origin.x.toFixed(1)} ${origin.y.toFixed(1)})`}>
      <path d="M-1.4 -30 L1.4 -30 L1.8 14 L-1.8 14 Z" fill="#0c0c10" />
      <path d="M-6 14 L6 14 L4.5 19 L-4.5 19 Z" fill="#16161c" />
      <path d="M-5 19 L5 19 L3.5 22 L-3.5 22 Z" fill="#0a0a0e" />
      <path d="M0 -26 C14 -27 16 -18 9 -12" fill="none" stroke="#1c1c24" strokeWidth="1.7" />
      <path d="M4.5 -15 L15.5 -15 L14.2 -3.5 L5.6 -3.5 Z" fill="#0b0b10" stroke="#2a2a34" strokeWidth="0.7" />
      <path d="M7 -15 L7 -3.5 M12.5 -15 L12.5 -3.5" stroke="#2a2a34" strokeWidth="0.5" />
      <g>
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
    <g transform={`translate(${origin.x.toFixed(1)} ${origin.y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
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
  fill,
}: {
  width: number;
  height: number;
  fill: string;
}) {
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(90,20,40,0.16)" />
          <stop offset="100%" stopColor="rgba(40,10,22,0.04)" />
        </linearGradient>
      </defs>
      <rect x={-40} y={0} width={width + 80} height={height} fill={`url(#${fill})`} opacity="0.35" />
    </g>
  );
}

function SkyWildlife({ width }: { width: number }) {
  const bird =
    "M0 0 C6 -3 12 -2 18 1 C12 2 9 3 7 1 C5 7 2 4 0 0 Z";
  return (
    <g pointerEvents="none" fill="#0a040b" opacity="0.55">
      <path d={bird} transform="translate(40 70) scale(1.6)" />
      <path d={bird} transform={`translate(${width * 0.12} 210) scale(1.15)`} />
      <path d={bird} transform="translate(90 1480) scale(1.35)" />
    </g>
  );
}

async function rasterTrail(
  svg: SVGSVGElement,
  cssWidth: number,
  cssHeight: number,
  vbWidth: number,
  vbHeight: number,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, RASTER_DPR);
  const strips: Promise<HTMLCanvasElement>[] = [];
  for (let top = 0; top < cssHeight; top += STRIP_CSS) {
    const slice = Math.min(STRIP_CSS, cssHeight - top);
    strips.push(rasterStrip(svg, cssWidth, cssHeight, vbWidth, vbHeight, top, slice, dpr));
  }
  return Promise.all(strips);
}

async function rasterStrip(
  svg: SVGSVGElement,
  cssWidth: number,
  cssHeight: number,
  vbWidth: number,
  vbHeight: number,
  top: number,
  slice: number,
  dpr: number,
) {
  const pad = 2;
  const cssY0 = Math.max(0, top - pad);
  const cssY1 = Math.min(cssHeight, top + slice + pad);
  const cssH = cssY1 - cssY0;
  const vbY = (cssY0 / cssHeight) * vbHeight;
  const vbH = (cssH / cssHeight) * vbHeight;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("viewBox", `0 ${vbY} ${vbWidth} ${vbH}`);
  clone.setAttribute("width", String(Math.round(cssWidth)));
  clone.setAttribute("height", String(Math.round(cssH)));
  clone.setAttribute("preserveAspectRatio", "none");
  clone.removeAttribute("class");
  clone.removeAttribute("aria-hidden");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>${new XMLSerializer().serializeToString(clone)}`;
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    if (typeof img.decode === "function") {
      await img.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("trail raster"));
      });
    }
    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error("empty trail raster");
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.cssText = `position:absolute;left:0;top:${cssY0}px;width:100%;height:${cssH}px;display:block;`;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.fillStyle = "#0c060a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}
