"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MENTOR_NAME, ONBOARDING_LINES } from "@/content/mentor";
import { saveProgress } from "@/lib/api";
import { playMentor } from "@/lib/audio";
import { isMentorMuted, markEmberMet } from "@/lib/mentor";
import { useForge } from "@/components/providers/ForgeProvider";
import { EmberRaven, type EmberVisualState } from "@/components/companion/EmberRaven";

function useTypewriter(text: string, speed = 16) {
  const [trackedText, setTrackedText] = useState(text);
  const [count, setCount] = useState(0);

  if (text !== trackedText) {
    setTrackedText(text);
    setCount(0);
  }

  useEffect(() => {
    if (!text) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return { shown: text.slice(0, count), done: count >= text.length && text.length > 0 };
}

export function EmberOnboarding() {
  const { player, setPlayer } = useForge();
  const [beat, setBeat] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState(false);

  const active = Boolean(player?.handle && player.onboardingComplete !== true);
  const line = ONBOARDING_LINES[beat] ?? ONBOARDING_LINES[0]!;
  const last = beat >= ONBOARDING_LINES.length - 1;
  const visualState: EmberVisualState = !arrived ? "arriving" : last ? "success" : "speaking";
  const { shown: typed, done: typedDone } = useTypewriter(arrived && active ? line.text : "");
  const shown = snap ? line.text : typed;
  const done = snap || typedDone;

  useEffect(() => {
    if (!active) return;
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 80 : 1680;
    const timer = window.setTimeout(() => setArrived(true), delay);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!arrived || !active) return;
    if (isMentorMuted()) return;
    playMentor(line.mood);
  }, [arrived, active, line.id, line.mood]);

  const finish = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      markEmberMet();
      const next = await saveProgress({ onboardingComplete: true });
      setPlayer(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not seal the greeting.");
      setBusy(false);
    }
  }, [busy, setPlayer]);

  const advance = useCallback(() => {
    if (!arrived || busy) return;
    if (!done) {
      setSnap(true);
      return;
    }
    if (last) {
      void finish();
      return;
    }
    setSnap(false);
    setBeat((value) => Math.min(value + 1, ONBOARDING_LINES.length - 1));
  }, [arrived, busy, done, last, finish]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, advance]);

  if (!active) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ember-onboard-title"
      className="ember-onboard-veil fixed inset-0 z-[80] grid place-items-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      onClick={advance}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className="ember-onboard-mote absolute h-1.5 w-1.5 rounded-full bg-[#ff8aa0]"
            style={{
              left: `${6 + ((index * 17) % 88)}%`,
              animationDelay: `${index * 0.35}s`,
              animationDuration: `${7 + (index % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-[1] flex w-full max-w-[36rem] flex-col items-center">
        <motion.div
          className="relative"
          initial={{ y: -220, x: -48, scale: 0.55, rotate: -18, opacity: 0 }}
          animate={{ y: 0, x: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.9 }}
        >
          <span className="ember-onboard-glow pointer-events-none absolute left-1/2 top-[48%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <EmberRaven state={visualState} size={220} pulseId={arrived ? line.id : "arrive"} />
          <Roost />
        </motion.div>

        <p id="ember-onboard-title" className="font-mono mt-2 text-[11px] tracking-[0.42em] text-neon">
          {MENTOR_NAME.toUpperCase()} · THE CRIMSON ORACLE
        </p>

        <AnimatePresence mode="wait">
          {arrived && (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="glass glass-glow mt-6 w-full rounded-[28px] p-6 sm:p-7"
            >
              <p className="min-h-[4.6em] text-[15px] leading-relaxed text-ink/95 sm:text-base">
                {shown}
                {!done && (
                  <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[1px] animate-pulse bg-neon align-middle" />
                )}
              </p>

              <div className="mt-5 flex items-center justify-center gap-1.5">
                {ONBOARDING_LINES.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1.5 rounded-full transition-all ${
                      index === beat ? "w-6 bg-neon" : index < beat ? "w-3 bg-neon/50" : "w-2 bg-white/15"
                    }`}
                  />
                ))}
              </div>

              {error && <p className="mt-3 text-center text-sm text-amber">{error}</p>}

              <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void finish();
                  }}
                  disabled={busy}
                  className="ghost-btn rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted"
                >
                  Skip greeting
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    advance();
                  }}
                  disabled={busy || !arrived}
                  className="ruby-btn font-display rounded-full px-6 py-2.5 text-sm tracking-wide"
                >
                  {busy ? "Sealing…" : last ? "Enter the forge" : "Continue"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Roost() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-3 left-1/2 w-[70%] -translate-x-1/2"
      viewBox="0 0 160 28"
      aria-hidden
    >
      <ellipse cx="80" cy="22" rx="46" ry="5" fill="#000" opacity="0.35" />
      <path
        d="M18 16 C48 8 70 12 80 14 C110 18 138 10 150 12"
        fill="none"
        stroke="#5a3a2a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M62 14 L58 4" stroke="#4a2e22" strokeWidth="2" strokeLinecap="round" />
      <path d="M96 16 L102 5" stroke="#4a2e22" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
