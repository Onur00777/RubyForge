"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitBranch, Lightbulb, Sparkles, X } from "lucide-react";
import { MARKET_PRICES } from "@/lib/economy";
import { buyItem } from "@/lib/api";
import type { OracleReport } from "@/lib/oracle";
import type { MarketItem } from "@/lib/types";
import { useForge } from "@/components/providers/ForgeProvider";

export function CrimsonBazaar() {
  const { bazaarOpen, setBazaarOpen, player, setPlayer } = useForge();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [oracle, setOracle] = useState<OracleReport | null>(null);
  const [remoteUrl, setRemoteUrl] = useState(player?.remoteUrl ?? "");
  const [notice, setNotice] = useState<string | null>(null);

  if (!player) return null;

  const purchase = async (item: MarketItem) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = await buyItem(item, player.currentStepId, {
        code: player.drafts[String(player.currentStepId)],
        remoteUrl,
      });
      setPlayer(payload.player);
      if (payload.hint) setHint(payload.hint);
      if (payload.report) setOracle(payload.report);
      if (item === "push") setNotice("git push origin completed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {bazaarOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close bazaar"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBazaarOpen(false)}
          />
          <motion.aside
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="glass glass-glow fixed right-3 top-3 z-50 flex h-[calc(100%-1.5rem)] w-[min(440px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-[28px]"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neon">Store</p>
                <h2 className="font-display text-3xl tracking-tight">The Bazaar</h2>
              </div>
              <motion.button
                type="button"
                aria-label="Close bazaar"
                whileTap={{ scale: 0.96 }}
                onClick={() => setBazaarOpen(false)}
                className="ghost-btn rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-6">
              <p className="text-sm text-muted">
                Wallet: <span className="jewel-sheen font-display">{player.gems} 💎</span>. Gems are awarded
                only when a test suite passes.
              </p>

              <Offer
                icon={<Lightbulb className="h-4 w-4 text-amber" />}
                title="Diagnostic Hint"
                copy="Deep syntax inspection — idiomatic tips and edge-case reminders for the active stage."
                price={MARKET_PRICES.hint}
                disabled={busy}
                onBuy={() => void purchase("hint")}
              />
              <Offer
                icon={<Sparkles className="h-4 w-4 text-emerald" />}
                title="Code Architect Review"
                copy="Idiomatic Ruby refactor notes: snake_case, interpolation, Enumerable, mixins."
                price={MARKET_PRICES.oracle}
                disabled={busy}
                onBuy={() => void purchase("oracle")}
              />
              <Offer
                icon={<GitBranch className="h-4 w-4" />}
                title="Automated Git Push"
                copy="Spend gems to run git push origin on the local ruby_journey repository."
                price={MARKET_PRICES.push}
                disabled={busy}
                onBuy={() => void purchase("push")}
              />

              <div className="rounded-2xl border border-white/8 bg-black/25 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  GitHub Remote
                </p>
                <input
                  value={remoteUrl}
                  onChange={(event) => setRemoteUrl(event.target.value)}
                  placeholder="https://github.com/you/crimson-path.git"
                  className="w-full rounded-xl border border-white/8 bg-black/40 px-3 py-2 font-mono text-xs outline-none focus:border-[#FF1E56]/50"
                />
              </div>

              {error && <p className="text-sm text-neon">{error}</p>}
              {notice && <p className="text-sm text-emerald">{notice}</p>}
              {hint && (
                <div className="rounded-2xl border border-white/10 bg-amber/5 p-3 text-sm text-amber/90">
                  {hint}
                </div>
              )}
              {oracle && (
                <div className="rounded-2xl border border-white/10 bg-emerald/5 p-3 text-sm">
                  <p className="font-mono uppercase tracking-[0.2em] text-emerald">
                    Architect {oracle.score}/99
                  </p>
                  <p className="mt-1">{oracle.headline}</p>
                  <ul className="mt-2 space-y-1 text-muted">
                    {oracle.notes.map((note) => (
                      <li key={note.title}>
                        <span className="text-ink">{note.title}:</span> {note.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Offer({
  icon,
  title,
  copy,
  price,
  disabled,
  onBuy,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  price: number;
  disabled: boolean;
  onBuy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[rgba(18,12,18,0.92)] p-4 transition-colors hover:border-white/14">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="mt-0.5">{icon}</div>
          <div>
            <p className="font-display text-xl leading-none tracking-tight">{title}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{copy}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onBuy}
          className="ruby-btn font-display shrink-0 rounded-full px-3 py-2 text-xs"
        >
          {price} 💎
        </button>
      </div>
    </div>
  );
}
