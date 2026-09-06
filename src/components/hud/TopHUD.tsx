"use client";

import { motion } from "framer-motion";
import { Flame, Gem, ShoppingBag, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { rankTitle } from "@/lib/economy";
import { useForge } from "@/components/providers/ForgeProvider";
import { ForgeIdentity } from "./ForgeIdentity";
import { HudGlow, useHudGlow } from "./HudGlow";

export function TopHUD() {
  const { player, setBazaarOpen, bazaarOpen } = useForge();
  const glow = useHudGlow();

  if (!player) return null;

  return (
    <header
      ref={glow.ref}
      onMouseMove={glow.onMouseMove}
      onMouseLeave={glow.onMouseLeave}
      className="hud-pill sticky top-4 z-30 mx-auto flex w-[min(980px,calc(100%-1.5rem))] items-center gap-4 overflow-hidden rounded-full px-6 py-2.5"
    >
      <HudGlow lit={glow.lit && !bazaarOpen} spot={glow.spot} />
      <div className="relative flex min-w-0 items-center gap-3">
        <ForgeIdentity player={player} compact />
        <div className="hidden sm:block">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-neon">RubyForge</p>
          <p className="font-display text-lg leading-none tracking-tight">The Crimson Path</p>
        </div>
      </div>

      <div className="relative ml-auto flex items-center gap-2 sm:gap-3">
        <HudChip icon={<Flame className="h-3.5 w-3.5 text-amber" />} label="STREAK" value={player.streak} />
        <HudChip
          icon={<Gem className="h-3.5 w-3.5 text-neon" />}
          label="GEMS"
          value={player.gems}
          jewel
        />
        <HudChip
          icon={<Trophy className="h-3.5 w-3.5 text-amber" />}
          label="RANK"
          value={rankTitle(player.xp)}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setBazaarOpen(true)}
          className="ghost-btn font-display flex items-center gap-2 rounded-full px-4 py-1.5 text-sm tracking-wide"
        >
          <ShoppingBag className="h-4 w-4 text-neon" />
          Bazaar
        </motion.button>
      </div>
    </header>
  );
}

function HudChip({
  icon,
  label,
  value,
  jewel,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  jewel?: boolean;
}) {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 sm:flex">
      {icon}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">{label}</p>
        <p className={`font-display text-sm leading-none ${jewel ? "jewel-sheen" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
