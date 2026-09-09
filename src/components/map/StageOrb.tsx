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
  labelSide: "left" | "right" | "top-left" | "top-right";
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
  labelSide,
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
          initial={{
            opacity: 0,
            x: labelSide === "right" || labelSide === "top-right" ? -8 : 8,
            y: labelSide.startsWith("top") ? 6 : 0,
          }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={spring}
          className={`pointer-events-none absolute z-30 whitespace-nowrap rounded-md border border-white/12 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink ${
            labelSide === "top-right"
              ? "left-[46px] top-[-38px]"
              : labelSide === "top-left"
                ? "right-[46px] top-[-38px]"
                : labelSide === "right"
                  ? "left-[calc(100%+12px)] top-1/2 -translate-y-1/2"
                  : "right-[calc(100%+12px)] top-1/2 -translate-y-1/2"
          }`}
          style={{
            background: "#0c0710",
            boxShadow: "0 0 0 4px #040407, 0 10px 24px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          Ready to Deploy
        </motion.p>
      )}

      <motion.button
        type="button"
        disabled={!unlocked}
        onClick={() => unlocked && onLaunch(stage.id)}
        whileHover={unlocked ? { scale: 1.12 } : undefined}
        whileTap={unlocked ? { scale: 0.96 } : undefined}
        transition={spring}
        aria-label={`Stage ${String(stage.id).padStart(2, "0")} ${stage.title}`}
        className="relative grid h-[86px] w-[90px] place-items-center"
      >
        <StonePlinth active={active} completed={completed} unlocked={unlocked} />

        {active && (
          <span className="way-heat pointer-events-none absolute left-1/2 top-[30px] h-14 w-14 rounded-full border border-[#FF1E56]/22" />
        )}

        <motion.span
          layoutId={`mission-orb-${stage.id}`}
          className={`relative z-[1] mb-3 grid h-16 w-16 place-items-center rounded-full ${
            completed ? "shadow-[0_0_16px_rgba(255,30,86,0.22)]" : active ? "ember-core" : ""
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
              ? "0 0 18px rgba(255,30,86,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
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
              <p className="mt-2 flex items-center gap-1.5 font-mono text-sm uppercase tracking-wider text-amber">
                <RubyMark />
                +{stage.gems}
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

function StonePlinth({
  active,
  completed,
  unlocked,
}: {
  active: boolean;
  completed: boolean;
  unlocked: boolean;
}) {
  const glow = active ? 0.7 : completed ? 0.4 : unlocked ? 0.18 : 0.08;
  return (
    <svg
      viewBox="0 0 90 28"
      className="pointer-events-none absolute bottom-0 left-1/2 w-[90px] -translate-x-1/2"
      aria-hidden
    >
      <ellipse cx="45" cy="22" rx="43" ry="6" fill="#080308" opacity="0.8" />
      <ellipse cx="45" cy="17" rx="41" ry="9" fill="#1a0c14" />
      <path d="M7 17 L16 7 H74 L83 17 Z" fill="#2a1420" />
      <path d="M16 7 L21 3 H69 L74 7 Z" fill="#4a2430" />
      <path d="M21 3 H69 L66 1 H24 Z" fill="#6a3040" />
      <path d="M20 12 H30 M38 10.5 H52 M60 12 H70" stroke="#FF5A79" strokeWidth="1.2" opacity={glow} />
      <path d="M32 14 H58" stroke="#FF1E56" strokeWidth="0.8" opacity={glow * 0.75} />
      {active && <ellipse cx="45" cy="16" rx="30" ry="7" fill="rgba(255,30,86,0.32)" />}
    </svg>
  );
}

function RubyMark() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
      <path d="M6 1 L11 5 L6 11 L1 5 Z" fill="#FF1E56" />
      <path d="M6 1 L8.5 5 L6 11 L3.5 5 Z" fill="#ff6b8a" />
    </svg>
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
