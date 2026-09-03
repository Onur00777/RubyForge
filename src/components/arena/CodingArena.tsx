"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { MapPinned, Play, RotateCcw, ShoppingBag } from "lucide-react";
import { getStage, isUnlocked } from "@/content/curriculum";
import { runCode } from "@/lib/api";
import { playFail, playSuccess } from "@/lib/audio";
import { rankTitle } from "@/lib/economy";
import type { RunResponse } from "@/lib/types";
import { useForge } from "@/components/providers/ForgeProvider";
import { ArenaTerminal } from "./ArenaTerminal";
import { BriefingPanel } from "./BriefingPanel";

const CodeForge = dynamic(
  () => import("./CodeForge").then((mod) => ({ default: mod.CodeForge })),
  { ssr: false, loading: () => <div className="min-h-0 flex-1 bg-void" /> },
);

const spring = { type: "spring" as const, stiffness: 320, damping: 28 };

export function CodingArena({ stageId }: { stageId: number }) {
  const router = useRouter();
  const { player, setPlayer, persistDraft, setBazaarOpen } = useForge();
  const stage = getStage(stageId);
  const [code, setCode] = useState(stage?.starterCode ?? "");
  const [result, setResult] = useState<RunResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [hydratedId, setHydratedId] = useState<number | null>(null);
  const hudRef = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 220, y: 22 });

  if (player && stage && hydratedId !== stage.id) {
    setHydratedId(stage.id);
    setCode(player.drafts[String(stage.id)] || stage.starterCode);
    setResult(null);
  }

  useEffect(() => {
    if (!player || !stage) return;
    if (!isUnlocked(stage.id, player.completedSteps)) {
      router.replace("/");
    }
  }, [player, stage, router]);

  useEffect(() => {
    if (!stage || hydratedId !== stage.id) return;
    const timer = setTimeout(() => {
      void persistDraft(stage.id, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, stage, persistDraft, hydratedId]);

  const onRun = useCallback(async () => {
    if (!stage || busy) return;
    setBusy(true);
    try {
      const payload = await runCode(stage.id, code);
      setResult(payload);
      if (payload.player) setPlayer(payload.player);
      if (payload.passed) {
        playSuccess();
        void confetti({
          particleCount: payload.leveledUp ? 140 : 70,
          spread: 74,
          origin: { y: 0.7 },
          colors: ["#FF1E56", "#E0115F", "#f5b942", "#590D22"],
        });
        if (payload.reward) {
          setFlash(
            `Test suite passed: ${payload.results.length}/${payload.results.length} assertions verified (+${payload.reward.gems} 💎 awarded).`,
          );
        }
      } else {
        playFail();
        setFlash("Assertions failed. Read the stack and the diffs, then forge again.");
      }
    } catch (error) {
      setFlash(error instanceof Error ? error.message : "Run failed.");
    } finally {
      setBusy(false);
    }
  }, [busy, code, setPlayer, stage]);

  const moveHud = (event: MouseEvent<HTMLElement>) => {
    const box = hudRef.current?.getBoundingClientRect();
    if (!box) return;
    setSpot({ x: event.clientX - box.left, y: event.clientY - box.top });
  };

  if (!stage) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-muted">Unknown stage.</p>
      </div>
    );
  }

  const hintTier = player?.hintTiers[String(stage.id)] ?? 0;
  const hints = stage.hints.slice(0, hintTier);
  const deployed = player?.completedSteps.includes(stage.id) ?? false;

  return (
    <div className="relative z-10 flex h-screen flex-col gap-3 overflow-hidden px-3 pb-3 pt-3">
      <header
        ref={hudRef}
        onMouseMove={moveHud}
        className="hud-pill relative mx-auto flex w-full max-w-[1440px] shrink-0 items-center gap-3 overflow-hidden rounded-full px-4 py-2"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(240px circle at ${spot.x}px ${spot.y}px, rgba(255,30,86,0.16), transparent 55%)`,
          }}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/")}
          className="ghost-btn relative z-[1] flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
        >
          <MapPinned className="h-4 w-4 text-neon" />
          Back to Map
        </motion.button>

        <motion.span
          layoutId={`mission-orb-${stage.id}`}
          className="relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xs tracking-tight"
          style={{
            background: "radial-gradient(circle at 32% 28%, #ff6b8a, #e0115f 42%, #590d22)",
            border: "1px solid rgba(255,30,86,0.7)",
            boxShadow: "0 0 18px rgba(255,30,86,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {String(stage.id).padStart(2, "0")}
        </motion.span>

        <div className="relative z-[1] min-w-0">
          <p className="truncate font-display text-lg leading-none tracking-tight">{stage.title}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {player ? rankTitle(player.xp) : "Novice Scripter"} · {player?.gems ?? 0} 💎
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setBazaarOpen(true)}
          className="ghost-btn relative z-[1] ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
        >
          <ShoppingBag className="h-4 w-4 text-neon" />
          Bazaar
        </motion.button>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 gap-3">
        <motion.div
          initial={{ x: -72, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.08 }}
          className="h-full min-h-0 w-[min(400px,36vw)] shrink-0"
        >
          <BriefingPanel stage={stage} hintTier={hintTier} hints={hints} />
        </motion.div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...spring, delay: 0.16 }}
            className="glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px]"
          >
            <div className="flex h-10 shrink-0 items-center justify-between px-4">
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted">
                {stage.fileName} · Ctrl+Enter
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCode(stage.starterCode)}
                  className="ghost-btn rounded-full px-3 py-1 text-xs text-muted"
                >
                  <RotateCcw className="mr-1 inline h-3 w-3" />
                  Reset Code
                </button>
                <button
                  type="button"
                  onClick={() => void onRun()}
                  disabled={busy}
                  className="ruby-btn font-display flex items-center gap-2 rounded-full px-5 py-1.5 text-sm tracking-wide"
                >
                  <Play className="h-3.5 w-3.5" />
                  {busy ? "Running…" : "Run Code"}
                </button>
              </div>
            </div>
            <CodeForge fileName={stage.fileName} code={code} onChange={setCode} onRun={() => void onRun()} />
          </motion.div>

          <motion.div
            initial={{ y: 56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...spring, delay: 0.24 }}
            className="h-[220px] shrink-0"
          >
            <ArenaTerminal result={result} busy={busy} />
          </motion.div>
        </div>
      </div>

      <p className="mx-auto hidden w-full max-w-[1440px] font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
        Deploy milestone:{" "}
        <span className={deployed ? "text-emerald" : "text-amber"}>
          {deployed ? "committed to ruby_journey/stages" : "pending a green suite"}
        </span>
        {result?.autoCommit ? ` · ${result.autoCommit.message}` : ""}
      </p>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass glass-glow pointer-events-none fixed bottom-8 left-1/2 z-40 -translate-x-1/2 rounded-full px-5 py-3 text-sm"
          >
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
