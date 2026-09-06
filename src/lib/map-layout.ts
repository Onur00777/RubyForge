export interface MapNode {
  id: number;
  x: number;
  y: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export const MAP_WIDTH = 800;
export const MAP_SPACING = 148;

export function mapNodes(count = 30): MapNode[] {
  return Array.from({ length: count }, (_, index) => {
    const y = 96 + index * MAP_SPACING;
    const x = MAP_WIDTH / 2 + Math.sin(index * 0.48) * 252;
    return { id: index + 1, x, y };
  });
}

export function mapHeight(count = 30): number {
  return 96 + (count - 1) * MAP_SPACING + 200;
}

function controls(a: Vec2, b: Vec2) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return {
    c1: { x: a.x + dx * 0.02, y: a.y + dy * 0.42 },
    c2: { x: b.x - dx * 0.02, y: b.y - dy * 0.42 },
  };
}

function cubic(p0: Vec2, c1: Vec2, c2: Vec2, p1: Vec2, t: number): Vec2 {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + tt * t * p1.x,
    y: uu * u * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + tt * t * p1.y,
  };
}

export function trailPath(nodes: MapNode[]): string {
  if (!nodes.length) return "";
  const segments = [`M ${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)}`];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]!;
    const b = nodes[i + 1]!;
    const { c1, c2 } = controls(a, b);
    segments.push(
      `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
    );
  }
  return segments.join(" ");
}

export function sampleTrail(nodes: MapNode[], perSeg = 10): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]!;
    const b = nodes[i + 1]!;
    const { c1, c2 } = controls(a, b);
    const start = i === 0 ? 0 : 1;
    for (let s = start; s <= perSeg; s += 1) {
      pts.push(cubic(a, c1, c2, b, s / perSeg));
    }
  }
  return pts;
}

export function offsetPolyline(points: Vec2[], dist: number): Vec2[] {
  return points.map((p, i) => {
    const prev = points[Math.max(0, i - 1)]!;
    const next = points[Math.min(points.length - 1, i + 1)]!;
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    return { x: p.x + (-ty / len) * dist, y: p.y + (tx / len) * dist };
  });
}

export function polylinePath(points: Vec2[]): string {
  if (!points.length) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

export function polylineLength(points: Vec2[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  }
  return total;
}

export function nodeFrame(nodes: MapNode[], index: number): { tangent: Vec2; normal: Vec2 } {
  const i = Math.max(0, Math.min(index, nodes.length - 1));
  const prev = nodes[Math.max(0, i - 1)]!;
  const next = nodes[Math.min(nodes.length - 1, i + 1)]!;
  const tx = next.x - prev.x;
  const ty = next.y - prev.y;
  const len = Math.hypot(tx, ty) || 1;
  const tangent = { x: tx / len, y: ty / len };
  return { tangent, normal: { x: -tangent.y, y: tangent.x } };
}

function sideToward(nodes: MapNode[], index: number, towardCenter: boolean, width: number): number {
  const node = nodes[index]!;
  const { normal } = nodeFrame(nodes, index);
  const wantX = towardCenter
    ? node.x < width / 2
      ? 1
      : -1
    : node.x < width / 2
      ? -1
      : 1;
  const nx = normal.x === 0 ? wantX : normal.x;
  return Math.sign(nx) === Math.sign(wantX) ? 1 : -1;
}

export function offsetFromNode(
  nodes: MapNode[],
  index: number,
  dist: number,
  towardCenter: boolean,
  width = MAP_WIDTH,
): Vec2 {
  const node = nodes[index]!;
  const { normal } = nodeFrame(nodes, index);
  const sign = sideToward(nodes, index, towardCenter, width);
  return { x: node.x + normal.x * sign * dist, y: node.y + normal.y * sign * dist };
}

export function apexIndices(nodes: MapNode[], width = MAP_WIDTH): number[] {
  const cx = width / 2;
  const out: number[] = [];
  for (let i = 1; i < nodes.length - 1; i += 1) {
    const d = Math.abs(nodes[i]!.x - cx);
    const prev = Math.abs(nodes[i - 1]!.x - cx);
    const next = Math.abs(nodes[i + 1]!.x - cx);
    if (d >= prev && d >= next && d > 90) out.push(i);
  }
  return out;
}

export function seedUnit(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function frontierIndex(completed: number[], currentId: number): number {
  const maxCompleted = completed.length ? Math.max(...completed) : 0;
  const highestUnlocked = Math.max(maxCompleted + 1, currentId, 1);
  return Math.min(highestUnlocked, 30);
}

export function deployLabelSide(nodes: MapNode[], id: number): "left" | "right" | "top-left" | "top-right" {
  const node = nodes[id - 1];
  const prev = id > 1 ? nodes[id - 2] : undefined;
  if (!node) return "right";
  const fromLeft = !prev || prev.x <= node.x;
  const away: "left" | "right" = fromLeft ? "right" : "left";
  if (away === "right" && node.x > MAP_WIDTH * 0.68) return "top-right";
  if (away === "left" && node.x < MAP_WIDTH * 0.32) return "top-left";
  return away;
}
