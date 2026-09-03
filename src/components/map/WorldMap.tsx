"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CURRICULUM, PHASES, isUnlocked } from "@/content/curriculum";
import { MAP_WIDTH, frontierIndex, mapHeight, mapNodes, trailPath } from "@/lib/map-layout";
import { playLaunch } from "@/lib/audio";
import { useForge } from "@/components/providers/ForgeProvider";
import { TopHUD } from "@/components/hud/TopHUD";
import { StageOrb } from "./StageOrb";
import { TrailSvg } from "./TrailSvg";

const RubyHero = dynamic(
  () => import("./RubyHero").then((mod) => ({ default: mod.RubyHero })),
  { ssr: false, loading: () => <div className="h-[200px]" /> },
);

export function WorldMap() {
  const { player, loading, error } = useForge();
  const router = useRouter();
  const [hoverId, setHoverId] = useState<number | null>(null);
  const nodes = useMemo(() => mapNodes(CURRICULUM.length), []);
  const path = useMemo(() => trailPath(nodes), [nodes]);
  const height = mapHeight(CURRICULUM.length);
  const completed = player?.completedSteps ?? [];
  const activeId =
    CURRICULUM.find((stage) => isUnlocked(stage.id, completed) && !completed.includes(stage.id))?.id ??
    player?.currentStepId ??
    1;
  const frontier = frontierIndex(completed, activeId);

  const launch = (id: number) => {
    playLaunch();
    router.push(`/mission/${id}`);
  };

  return (
    <div className="relative z-10 min-h-screen pb-28">
      <TopHUD />

      <section className="relative mx-auto mt-8 w-[min(720px,100%)] px-4 text-center">
        <RubyHero />
        <p className="font-mono text-[11px] tracking-[0.42em] text-neon">LOCAL RUBY RUNTIME</p>
        <h1 className="font-display mt-2 text-5xl font-bold tracking-tight sm:text-6xl">
          The Crimson World
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          A winding path of thirty missions. Launch a stage, write idiomatic Ruby, and mint real
          files into your local portfolio.
        </p>
        {error && <p className="mt-3 text-sm text-neon">{error}</p>}
        {loading && <p className="mt-3 font-mono text-xs tracking-widest text-muted">LINKING THE FORGE</p>}
      </section>

      <div className="relative mx-auto mt-6 w-[min(800px,100%)] px-2">
        <div className="relative w-full" style={{ aspectRatio: `${MAP_WIDTH} / ${height}` }}>
          <TrailSvg
            path={path}
            nodes={nodes}
            width={MAP_WIDTH}
            height={height}
            frontier={frontier}
          />

          {PHASES.map((phase) => {
            const start = phase.id === 1 ? 1 : phase.id === 2 ? 11 : 21;
            const node = nodes[start - 1];
            if (!node) return null;
            const top = `${(node.y / height) * 100}%`;
            return (
              <div
                key={phase.id}
                className="pointer-events-none absolute left-3 -translate-y-1/2 sm:left-6"
                style={{ top }}
              >
                <p className="font-mono text-[10px] tracking-[0.28em] text-neon">{phase.range}</p>
                <p className="font-display text-sm tracking-tight text-ink/80">{phase.title}</p>
              </div>
            );
          })}

          {nodes.map((node) => {
            const stage = CURRICULUM[node.id - 1];
            const isComplete = player?.completedSteps.includes(node.id) ?? false;
            const unlocked = player ? isUnlocked(node.id, player.completedSteps) : node.id === 1;
            const active = node.id === activeId && !isComplete;
            const left = `${(node.x / MAP_WIDTH) * 100}%`;
            const top = `${(node.y / height) * 100}%`;
            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left, top }}
              >
                <StageOrb
                  stage={stage}
                  completed={isComplete}
                  unlocked={unlocked}
                  active={active}
                  hovered={hoverId === node.id}
                  tooltipSide={node.x < MAP_WIDTH / 2 ? "right" : "left"}
                  onHover={setHoverId}
                  onLaunch={launch}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
