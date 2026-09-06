"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bird, Flame, Gem, GitBranch, Hammer, Lightbulb, Sparkles, Sun, Swords, X } from "lucide-react";
import { cosmeticsBySlot, equippedId, type CosmeticDef } from "@/lib/cosmetics";
import { MARKET_PRICES } from "@/lib/economy";
import { buyItem } from "@/lib/api";
import type { OracleReport } from "@/lib/oracle";
import type { MarketItem, PlayerState } from "@/lib/types";
import { useForge } from "@/components/providers/ForgeProvider";

type Tab = "tools" | "nickname" | "banner" | "avatar";

const AVATAR_ICONS = {
  Gem,
  Flame,
  Hammer,
  Bird,
  Sparkles,
  Swords,
  Sun,
} as const;

export function CrimsonBazaar() {
  const { bazaarOpen, setBazaarOpen, player, setPlayer } = useForge();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [oracle, setOracle] = useState<OracleReport | null>(null);
  const [remoteUrl, setRemoteUrl] = useState(player?.remoteUrl ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("tools");

  if (!player) return null;

  const purchase = async (item: MarketItem, action: "buy" | "equip" = "buy") => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = await buyItem(item, player.currentStepId, {
        code: player.drafts[String(player.currentStepId)],
        remoteUrl,
        action,
      });
      setPlayer(payload.player);
      if (payload.hint) setHint(payload.hint);
      if (payload.report) setOracle(payload.report);
      if (item === "push") setNotice("git push origin completed.");
      if (action === "equip") setNotice("Equipped.");
      if (action === "buy" && item !== "hint" && item !== "oracle" && item !== "push") {
        setNotice("Purchased and equipped.");
      }
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
            className="glass glass-glow fixed right-3 top-3 z-50 flex h-[calc(100%-1.5rem)] w-[min(460px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-[28px]"
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

            <div className="flex gap-1 px-4 pt-4">
              {(
                [
                  ["tools", "Tools"],
                  ["nickname", "Names"],
                  ["banner", "Banners"],
                  ["avatar", "Avatars"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                    tab === id ? "bg-[#FF1E56]/20 text-neon" : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-6">
              <p className="text-sm text-muted">
                Wallet: <span className="jewel-sheen font-display">{player.gems} 💎</span>
                {tab === "tools"
                  ? ". Gems are awarded when a test suite passes."
                  : ". Cosmetics stay on this machine and apply the moment you equip them."}
              </p>

              {tab === "tools" && (
                <>
                  <Offer
                    icon={<Lightbulb className="h-4 w-4 text-amber" />}
                    title="Diagnostic Hint"
                    copy="A targeted explanation of the active stage — syntax, edge cases, and the next legal move."
                    price={MARKET_PRICES.hint}
                    disabled={busy}
                    onBuy={() => void purchase("hint")}
                  />
                  <Offer
                    icon={<Sparkles className="h-4 w-4 text-emerald" />}
                    title="Code Architect Review"
                    copy="Idiomatic Ruby notes: snake_case, interpolation, Enumerable, mixins."
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
                </>
              )}

              {tab !== "tools" &&
                cosmeticsBySlot(tab).map((item) => (
                  <CosmeticOffer
                    key={item.id}
                    item={item}
                    player={player}
                    disabled={busy}
                    onBuy={() => void purchase(item.id)}
                    onEquip={() => void purchase(item.id, "equip")}
                  />
                ))}

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

function CosmeticOffer({
  item,
  player,
  disabled,
  onBuy,
  onEquip,
}: {
  item: CosmeticDef;
  player: PlayerState;
  disabled: boolean;
  onBuy: () => void;
  onEquip: () => void;
}) {
  const owned = player.cosmeticsOwned.includes(item.id);
  const equipped = equippedId(player, item.slot) === item.id;
  const Icon =
    item.slot === "avatar" && item.glow in AVATAR_ICONS
      ? AVATAR_ICONS[item.glow as keyof typeof AVATAR_ICONS]
      : Gem;

  return (
    <div className="rounded-2xl border border-white/8 bg-[rgba(18,12,18,0.92)] p-4 transition-colors hover:border-white/14">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span
            className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border"
            style={{
              background:
                item.slot === "banner"
                  ? item.glow
                  : `radial-gradient(circle at 32% 28%, ${item.swatch}, #120c12 74%)`,
              borderColor: `${item.swatch}88`,
              boxShadow: `0 0 14px ${item.swatch}44`,
            }}
          >
            {item.slot !== "banner" && (
              <Icon className="h-4 w-4" style={{ color: item.swatch }} />
            )}
          </span>
          <div>
            <p className="font-display text-lg leading-none tracking-tight" style={{ color: item.swatch }}>
              {item.title}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{item.copy}</p>
          </div>
        </div>
        {equipped ? (
          <span className="shrink-0 rounded-full border border-emerald/30 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-emerald">
            Equipped
          </span>
        ) : owned ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onEquip}
            className="ghost-btn font-display shrink-0 rounded-full px-3 py-2 text-xs"
          >
            Equip
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={onBuy}
            className="ruby-btn font-display shrink-0 rounded-full px-3 py-2 text-xs"
          >
            {item.price} 💎
          </button>
        )}
      </div>
    </div>
  );
}
