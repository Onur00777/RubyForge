"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import { MENTOR_NAME } from "@/content/mentor";
import { moodAccent } from "@/lib/mentor";
import { useForge } from "@/components/providers/ForgeProvider";
import { useMentor } from "@/components/mentor/MentorProvider";
import { EmberRaven, type EmberVisualState } from "./EmberRaven";

const TAP_HINT_KEY = "rubyforge-ember-tap-hint-seen";

function useTypewriter(text: string, speed = 13) {
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

  return { shown: text.slice(0, count), done: count >= text.length };
}

export function EmberCompanion() {
  const pathname = usePathname();
  const { player, bazaarOpen } = useForge();
  const { line, open, muted, speak, dismiss, toggleMuted } = useMentor();
  const ready = Boolean(player);
  const [tapHintVisible, setTapHintVisible] = useState(false);

  const dock: "left" | "right" = pathname.startsWith("/mission/") ? "right" : "left";

  useEffect(() => {
    if (!ready) return;
    if (pathname !== "/") return;
    const timer = window.setTimeout(() => {
      speak({ type: "map", completed: player?.completedSteps.length ?? 0 });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [pathname, ready, player?.completedSteps.length, speak]);

  useEffect(() => {
    if (!ready) return;
    const match = pathname.match(/^\/mission\/(\d+)/);
    if (!match) return;
    const stageId = Number(match[1]);
    if (!Number.isFinite(stageId)) return;
    const timer = window.setTimeout(() => {
      speak({ type: "stage", stageId });
    }, 850);
    return () => window.clearTimeout(timer);
  }, [pathname, ready, speak]);

  useEffect(() => {
    if (!bazaarOpen) return;
    const timer = window.setTimeout(() => speak({ type: "bazaar" }), 400);
    return () => window.clearTimeout(timer);
  }, [bazaarOpen, speak]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    if (localStorage.getItem(TAP_HINT_KEY)) return;
    const showTimer = window.setTimeout(() => setTapHintVisible(true), 2600);
    return () => window.clearTimeout(showTimer);
  }, [ready]);

  useEffect(() => {
    if (!tapHintVisible) return;
    const hideTimer = window.setTimeout(() => {
      setTapHintVisible(false);
      if (typeof window !== "undefined") localStorage.setItem(TAP_HINT_KEY, "1");
    }, 4400);
    return () => window.clearTimeout(hideTimer);
  }, [tapHintVisible]);

  const clearTapHint = () => {
    if (!tapHintVisible) return;
    setTapHintVisible(false);
    if (typeof window !== "undefined") localStorage.setItem(TAP_HINT_KEY, "1");
  };

  const accent = line ? moodAccent(line.mood) : "#FF1E56";
  const visualState: EmberVisualState = !open
    ? "idle"
    : line?.mood === "cheer"
      ? "success"
      : line?.mood === "warn"
        ? "warning"
        : "speaking";

  const { shown, done } = useTypewriter(open && line ? line.text : "");

  if (!ready) return null;

  const sideClass = dock === "left" ? "left-4 sm:left-5" : "right-4 sm:right-5";
  const flexClass = dock === "left" ? "flex-row" : "flex-row-reverse";
  const bubbleFrom = dock === "left" ? -14 : 14;
  const tailClass = dock === "left" ? "rounded-bl-md" : "rounded-br-md";

  return (
    <div
      className={`pointer-events-none fixed bottom-5 z-[60] flex items-end gap-3 sm:bottom-6 ${sideClass} ${flexClass}`}
    >
      <div className="ember-companion-perch pointer-events-auto relative">
        {/* perpetual "come tap me" invitation ring */}
        {!open && (
          <motion.span
            className="pointer-events-none absolute inset-[-9px] rounded-full border border-[#FF1E56]/30"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.05, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {open && (
          <>
            <motion.span
              className="pointer-events-none absolute inset-[-8px] rounded-full border"
              style={{ borderColor: `${accent}77` }}
              animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="pointer-events-none absolute inset-[-8px] rounded-full border"
              style={{ borderColor: `${accent}55` }}
              animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        <motion.button
          type="button"
          aria-label={open ? "Dismiss Ember" : "Ask Ember for a tip"}
          onClick={() => {
            clearTapHint();
            if (open) dismiss();
            else speak({ type: "idle" });
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          className="ember-companion-portrait relative grid h-[92px] w-[92px] place-items-center rounded-full"
          style={{
            boxShadow: open ? `0 0 30px ${accent}55` : "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <EmberRaven state={visualState} pulseId={line?.id} size={80} />
        </motion.button>

        <button
          type="button"
          aria-label={muted ? "Unmute Ember" : "Mute Ember"}
          onClick={toggleMuted}
          className="ghost-btn absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70"
        >
          {muted ? <VolumeX className="h-3 w-3 text-muted" /> : <Volume2 className="h-3 w-3 text-neon" />}
        </button>

        <AnimatePresence>
          {tapHintVisible && !open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#FF1E56]/35 bg-black/80 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.24em] text-neon"
            >
              Tap Ember
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && line && (
          <motion.div
            initial={{ opacity: 0, y: 12, x: bubbleFrom, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, x: bubbleFrom, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto mb-3 max-w-[min(320px,calc(100vw-8.5rem))]"
          >
            <div
              className={`relative rounded-2xl border border-red-500/30 bg-black/75 p-4 backdrop-blur-xl ${tailClass}`}
              style={{
                boxShadow: `0 25px 50px -12px rgba(0,0,0,0.6), 0 0 34px ${accent}2e`,
              }}
            >
              <p className="font-display flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-neon">
                {MENTOR_NAME.toUpperCase()} <span className="text-ink/35">{"//"}</span> THE CRIMSON ORACLE
              </p>
              <p className="mt-2 min-h-[2.6em] text-[13px] leading-relaxed text-ink/95">
                {shown}
                {!done && (
                  <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[1px] animate-pulse bg-neon align-middle" />
                )}
              </p>
              <button
                type="button"
                aria-label="Dismiss Ember"
                onClick={dismiss}
                className="ghost-btn absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
