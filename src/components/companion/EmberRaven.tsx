"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Ember — the little ember-bird companion.
 *
 * A hand-authored, multi-layered SVG mascot. Round, friendly, and safe for
 * young learners — big sparkly eyes, blushing cheeks, a tiny round beak,
 * and a warm crimson glow. No stock icons, no emoji.
 *
 * Visual states map to what Ember is doing right now:
 *   idle     — perched, breathing, blinking, watching the smith work.
 *   speaking — leaning in to share a hint / lore line.
 *   success  — big happy triumph: a suite went green.
 *   warning  — worried head-tilt; a run failed, Ember flags it gently.
 */
export type EmberVisualState = "idle" | "speaking" | "success" | "warning";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 22 };

const HEAD_POSE: Record<EmberVisualState, { rotate: number[] | number; y: number[] | number }> = {
  idle: { rotate: [0, -2, 0, 2, 0, 0], y: [0, 0.6, 0, -0.4, 0, 0] },
  speaking: { rotate: 5, y: -1 },
  success: { rotate: [-4, 4, -4], y: -2 },
  warning: { rotate: -6, y: 1 },
};

const HEAD_TRANSITION: Record<EmberVisualState, Record<string, unknown>> = {
  idle: { duration: 6.4, repeat: Infinity, ease: "easeInOut" },
  speaking: SPRING,
  success: { duration: 0.5, repeat: 2, ease: "easeInOut" },
  warning: SPRING,
};

// Fixed, hand-placed drifting ember-mote presets — deterministic so the
// server/client markup never disagrees (no Math.random() in render).
const MOTES = [
  { top: "6%", left: "-10%", size: 3, dur: 5.2, delay: 0, dx: 6, dy: -10 },
  { top: "70%", left: "-14%", size: 2, dur: 6.1, delay: 0.6, dx: -8, dy: -8 },
  { top: "14%", left: "102%", size: 2.4, dur: 4.6, delay: 1.1, dx: 8, dy: -12 },
  { top: "64%", left: "104%", size: 3, dur: 5.8, delay: 0.3, dx: -6, dy: -10 },
] as const;

interface EmberRavenProps {
  state: EmberVisualState;
  /** Change this whenever a fresh event fires, to retrigger one-shot bursts. */
  pulseId?: string;
  size?: number;
  className?: string;
}

export function EmberRaven({ state, pulseId, size = 92, className }: EmberRavenProps) {
  const [trackedPulse, setTrackedPulse] = useState(pulseId);
  const [burst, setBurst] = useState<{ id: string; kind: "success" | "warning" } | null>(null);
  const [blink, setBlink] = useState(false);

  if (pulseId !== trackedPulse) {
    setTrackedPulse(pulseId);
    if (pulseId && (state === "success" || state === "warning")) {
      setBurst({ id: pulseId, kind: state });
    }
  }

  useEffect(() => {
    if (!burst) return;
    const life = burst.kind === "success" ? 950 : 620;
    const timer = window.setTimeout(() => setBurst(null), life);
    return () => window.clearTimeout(timer);
  }, [burst]);

  // A gentle, friendly blink every few seconds while idle.
  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 140);
    }, 3400);
    return () => window.clearInterval(id);
  }, []);

  const happy = burst?.kind === "success";
  const worried = state === "warning";
  const eyeScaleY = happy ? 0.05 : blink ? 0.08 : worried ? 0.85 : state === "speaking" ? 1.08 : 1;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      {MOTES.map((mote, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute rounded-full"
          style={{
            top: mote.top,
            left: mote.left,
            width: mote.size,
            height: mote.size,
            background:
              index % 2 === 0
                ? "radial-gradient(circle, #FF9BB0 0%, rgba(255,30,86,0) 75%)"
                : "radial-gradient(circle, #ffd77a 0%, rgba(255,215,122,0) 75%)",
            filter: "blur(0.4px)",
          }}
          animate={{
            y: [0, mote.dy, 0],
            x: [0, mote.dx, 0],
            opacity: [0, 0.85, 0],
          }}
          transition={{
            duration: mote.dur,
            delay: mote.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        style={{
          width: "100%",
          height: "100%",
          filter: "drop-shadow(0 0 16px rgba(255,90,121,0.4))",
        }}
        animate={
          burst?.kind === "warning"
            ? { x: [0, -3, 3, -2, 2, 0], y: 0 }
            : burst?.kind === "success"
              ? { y: [0, -10, -1], x: 0 }
              : { x: 0, y: 0 }
        }
        transition={
          burst
            ? { duration: burst.kind === "warning" ? 0.42 : 0.62, ease: "easeOut" }
            : SPRING
        }
      >
        <svg viewBox="0 0 128 128" width="100%" height="100%" aria-hidden focusable="false">
          <defs>
            <radialGradient id="ember-aura" cx="50%" cy="46%" r="55%">
              <stop offset="0%" stopColor="#FF5A79" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF5A79" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ember-body-fill" cx="38%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#4a3040" />
              <stop offset="60%" stopColor="#2e1e2a" />
              <stop offset="100%" stopColor="#1c1220" />
            </radialGradient>
            <radialGradient id="ember-head-fill" cx="36%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#523446" />
              <stop offset="60%" stopColor="#33212e" />
              <stop offset="100%" stopColor="#201620" />
            </radialGradient>
            <radialGradient id="ember-iris" cx="38%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#FFC2CE" />
              <stop offset="45%" stopColor="#FF5A79" />
              <stop offset="100%" stopColor="#B21E44" />
            </radialGradient>
            <linearGradient id="ember-beak" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffcf8f" />
              <stop offset="100%" stopColor="#f5a24a" />
            </linearGradient>
          </defs>

          {/* ambient warm glow */}
          <motion.circle
            cx={64}
            cy={62}
            r={50}
            fill="url(#ember-aura)"
            style={{ mixBlendMode: "screen" }}
            animate={{ opacity: state === "idle" ? [0.3, 0.5, 0.3] : [0.45, 0.7, 0.45] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* little round wings */}
          <motion.path
            d="M34,86 C18,88 12,104 22,116 C30,122 40,114 38,98 C37,92 36,88 34,86 Z"
            fill="url(#ember-body-fill)"
            stroke="rgba(255,90,121,0.35)"
            strokeWidth={1}
            style={{ transformOrigin: "34px 96px", transformBox: "fill-box" }}
            animate={{
              rotate: state === "speaking" ? -8 : happy ? -26 : 0,
              scale: happy ? 1.1 : 1,
            }}
            transition={SPRING}
          />
          <motion.path
            d="M94,86 C110,88 116,104 106,116 C98,122 88,114 90,98 C91,92 92,88 94,86 Z"
            fill="url(#ember-body-fill)"
            stroke="rgba(255,90,121,0.35)"
            strokeWidth={1}
            style={{ transformOrigin: "94px 96px", transformBox: "fill-box" }}
            animate={{
              rotate: state === "speaking" ? 8 : happy ? 26 : 0,
              scale: happy ? 1.1 : 1,
            }}
            transition={SPRING}
          />

          {/* round little body */}
          <path
            d="M40,90 C40,112 50,124 64,124 C78,124 88,112 88,90 C88,74 78,64 64,64 C50,64 40,74 40,90 Z"
            fill="url(#ember-body-fill)"
            stroke="rgba(255,90,121,0.3)"
            strokeWidth={1}
          />
          {/* soft chest sheen */}
          <path d="M56,78 C56,96 58,112 64,116 C70,112 72,96 72,78 C72,74 68,72 64,72 C60,72 56,74 56,78 Z" fill="#5a3a4c" opacity={0.45} />

          {/* head — round and big for a friendly chibi look */}
          <motion.g
            style={{ transformOrigin: "64px 56px", transformBox: "fill-box" }}
            animate={HEAD_POSE[state]}
            transition={HEAD_TRANSITION[state]}
          >
            <circle cx={64} cy={54} r={36} fill="url(#ember-head-fill)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

            {/* single cute feather curl, not horns */}
            <path
              d="M58,20 C52,10 64,4 68,12 C71,18 63,22 58,20 Z"
              fill="url(#ember-head-fill)"
              stroke="rgba(255,90,121,0.35)"
              strokeWidth={0.75}
            />

            {/* blushing cheeks */}
            <ellipse cx={36} cy={64} rx={7} ry={4.4} fill="#ff8aa0" opacity={0.55} />
            <ellipse cx={92} cy={64} rx={7} ry={4.4} fill="#ff8aa0" opacity={0.55} />

            {/* worried eyebrows, only while warning */}
            <motion.path
              d="M38,34 Q46,29 54,34"
              fill="none"
              stroke="#3a2534"
              strokeWidth={2.4}
              strokeLinecap="round"
              animate={{ opacity: worried ? 0.85 : 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.path
              d="M74,34 Q82,29 90,34"
              fill="none"
              stroke="#3a2534"
              strokeWidth={2.4}
              strokeLinecap="round"
              animate={{ opacity: worried ? 0.85 : 0 }}
              transition={{ duration: 0.25 }}
            />

            {/* left eye */}
            <g>
              <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: "46px 50px", transformBox: "fill-box" }} transition={{ duration: 0.14 }}>
                <circle cx={46} cy={50} r={13} fill="#fff3f2" />
                <circle cx={47.5} cy={51} r={8} fill="url(#ember-iris)" />
                <circle cx={44.5} cy={47.5} r={2.6} fill="#ffffff" />
              </motion.g>
              {/* happy closed-eye arc */}
              <motion.path
                d="M36,50 Q46,40 56,50"
                fill="none"
                stroke="#3a2534"
                strokeWidth={2.6}
                strokeLinecap="round"
                animate={{ opacity: happy ? 1 : 0 }}
                transition={{ duration: 0.15 }}
              />
            </g>

            {/* right eye */}
            <g>
              <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: "82px 50px", transformBox: "fill-box" }} transition={{ duration: 0.14 }}>
                <circle cx={82} cy={50} r={13} fill="#fff3f2" />
                <circle cx={80.5} cy={51} r={8} fill="url(#ember-iris)" />
                <circle cx={83.5} cy={47.5} r={2.6} fill="#ffffff" />
              </motion.g>
              <motion.path
                d="M72,50 Q82,40 92,50"
                fill="none"
                stroke="#3a2534"
                strokeWidth={2.6}
                strokeLinecap="round"
                animate={{ opacity: happy ? 1 : 0 }}
                transition={{ duration: 0.15 }}
              />
            </g>

            {/* tiny round beak */}
            <path
              d="M58,63 Q64,59 70,63 Q69,71 64,75 Q59,71 58,63 Z"
              fill="url(#ember-beak)"
              stroke="#c97a2e"
              strokeWidth={0.6}
            />

            {/* worried sweat drop */}
            <motion.path
              d="M92,32 C92,38 86,42 86,36 C86,31 92,28 92,32 Z"
              fill="#aee0ff"
              stroke="#7fc4ea"
              strokeWidth={0.5}
              animate={{ opacity: burst?.kind === "warning" ? [0, 1, 1, 0] : 0, y: burst?.kind === "warning" ? [0, 2, 6, 10] : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </motion.g>

          {/* happy sparkle burst */}
          <AnimatePresence>
            {happy &&
              Array.from({ length: 7 }).map((_, index) => {
                const angle = (index / 7) * Math.PI * 2;
                const dx = Math.cos(angle) * 42;
                const dy = Math.sin(angle) * 42 * 0.7;
                return (
                  <motion.g
                    key={`${burst?.id}-${index}`}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{ opacity: 0, x: dx, y: dy - 6, scale: 0.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <path
                      d="M64,58 L66,63 L71,65 L66,67 L64,72 L62,67 L57,65 L62,63 Z"
                      fill={index % 2 === 0 ? "#ffd77a" : "#FF8FA3"}
                    />
                  </motion.g>
                );
              })}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
}
