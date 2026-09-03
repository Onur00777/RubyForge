export interface MapNode {
  id: number;
  x: number;
  y: number;
}

export const MAP_WIDTH = 760;
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

export function trailPath(nodes: MapNode[]): string {
  if (!nodes.length) return "";
  const segments = [`M ${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)}`];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    segments.push(
      `C ${(a.x + dx * 0.02).toFixed(1)} ${(a.y + dy * 0.42).toFixed(1)}, ${(b.x - dx * 0.02).toFixed(1)} ${(b.y - dy * 0.42).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
    );
  }
  return segments.join(" ");
}

export function frontierIndex(completed: number[], currentId: number): number {
  const maxCompleted = completed.length ? Math.max(...completed) : 0;
  const highestUnlocked = Math.max(maxCompleted + 1, currentId, 1);
  return Math.min(highestUnlocked, 30);
}
