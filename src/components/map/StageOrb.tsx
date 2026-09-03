"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Sparkles, Star } from "lucide-react";
import type { StageDef } from "@/lib/types";

interface Props {
  stage: StageDef;
  completed: boolean;
  unlocked: boolean;
  active: boolean;
  hovered: boolean;
  tooltipSide: "left" | "right";
  onHover: (id: number | null) => void;
  onLaunch: (id: number) => void;
}

const spring = { type: "spring" as const, stiffness: 400, damping: 25 };

export function StageOrb({
  stage,
  completed,
  unlocked,
  active,
  hovered,
  tooltipSide,
  onHover,
  onLaunch,
}: Props) {
  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(stage.id)}
      onMouseLeave={() => onHover(null)}
    >
      {active && !hovered && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-[-34px] z-10 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-neon"
        >
          Ready to Deploy
        </motion.p>
      )}

      <motion.button
        type="button"
        disabled={!unlocked}
        onClick={() => unlocked && onLaunch(stage.id)}
        whileHover={unlocked ? { scale: 1.15 } : undefined}
        whileTap={unlocked ? { scale: 0.96 } : undefined}
        transition={spring}
        aria-label={`Stage ${String(stage.id).padStart(2, "0")} ${stage.title}`}
        className="relative grid h-[72px] w-[72px] place-items-center"
      >
        {active && (
          <>
            <span className="ping-ring absolute inset-[-10px] rounded-full border border-[#FF1E56]/50" />
            <span className="absolute inset-[-4px] rounded-full border border-white/10" />
            <span className="absolute inset-0 rounded-full border border-[#FF1E56]/40" />
          </>
        )}

        <motion.span
          layoutId={`mission-orb-${stage.id}`}
          className={`relative grid h-16 w-16 place-items-center rounded-full ${
            completed ? "shadow-[0_0_28px_rgba(255,30,86,0.35)]" : active ? "ember-core" : ""
          }`}
          style={{
            opacity: unlocked ? 1 : 0.4,
            background: completed
              ? "radial-gradient(circle at 32% 28%, #ff6b8a, #e0115f 42%, #590d22)"
              : active
                ? "radial-gradient(circle at 30% 26%, #ff5a7a, #e0115f 46%, #2a0712)"
                : unlocked
                  ? "radial-gradient(circle at 30% 26%, #3a3036, #161016)"
                  : "radial-gradient(circle at 30% 26%, #2a2a2e, #121214)",
            border: completed
              ? "1px solid rgba(255,30,86,0.7)"
              : active
                ? "1px solid rgba(255,30,86,0.85)"
                : "1px solid rgba(255,255,255,0.08)",
            boxShadow: active
              ? "0 0 32px rgba(255,30,86,0.45), inset 0 1px 0 rgba(255,255,255,0.2)"
              : completed
                ? "inset 0 1px 0 rgba(255,255,255,0.25)"
                : "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {completed ? (
            <Check className="h-5 w-5 text-white" strokeWidth={2.6} />
          ) : unlocked ? (
            <span className="font-display text-lg tracking-tight">{String(stage.id).padStart(2, "0")}</span>
          ) : (
            <Lock className="h-4 w-4 text-white/70" />
          )}
        </motion.span>

        {completed && (
          <span className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-[#590d22] shadow-[0_0_12px_rgba(255,30,86,0.45)]">
            <Star className="h-2.5 w-2.5 fill-amber text-amber" />
          </span>
        )}

        {completed && hovered && <ParticleBurst />}
      </motion.button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={spring}
            className={`absolute top-1/2 z-30 w-64 -translate-y-1/2 ${
              tooltipSide === "right" ? "left-[calc(100%+14px)]" : "right-[calc(100%+14px)]"
            }`}
          >
            <div className="glass glass-glow rounded-2xl p-4 text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon">
                Stage {String(stage.id).padStart(2, "0")}
              </p>
              <p className="font-display mt-1 text-lg leading-tight tracking-tight">{stage.title}</p>
              <p className="mt-1 text-xs text-muted">{stage.subtitle}</p>
              <p className="mt-2 font-mono text-sm uppercase tracking-wider text-amber">
                +{stage.gems} 💎
              </p>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onLaunch(stage.id)}
                className="ruby-btn font-display mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Launch Mission
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ParticleBurst() {
  return (
    <span className="pointer-events-none absolute inset-0">
      {Array.from({ length: 7 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-[#FF1E56]"
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((index / 7) * Math.PI * 2) * 28,
            y: Math.sin((index / 7) * Math.PI * 2) * 28,
            scale: 0.2,
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}
