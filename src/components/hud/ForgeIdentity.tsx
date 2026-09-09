"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Bird, Flame, Gem, Hammer, LogOut, Shield, Sparkles, Sun, Swords } from "lucide-react";
import { saveHandle } from "@/lib/api";
import { COSMETIC_BY_ID } from "@/lib/cosmetics";
import { rankTitle } from "@/lib/economy";
import type { PlayerState } from "@/lib/types";
import { useForge } from "@/components/providers/ForgeProvider";
import { HandleForm } from "@/components/auth/HandleForm";

const AVATAR_ICONS = {
  Gem,
  Flame,
  Hammer,
  Bird,
  Sparkles,
  Swords,
  Sun,
} as const;

export function ForgeIdentity({
  player,
  compact,
}: {
  player: PlayerState;
  compact?: boolean;
}) {
  const { setPlayer } = useForge();
  const [open, setOpen] = useState(false);
  const [retitle, setRetitle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const nick = player.equippedNickname ? COSMETIC_BY_ID[player.equippedNickname] : null;
  const avatar = player.equippedAvatar ? COSMETIC_BY_ID[player.equippedAvatar] : null;
  const Icon =
    avatar && avatar.glow in AVATAR_ICONS
      ? AVATAR_ICONS[avatar.glow as keyof typeof AVATAR_ICONS]
      : Gem;
  const handle = player.handle || "Smith";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      if (!root.current) return;
      const rect = root.current.getBoundingClientRect();
      const width = Math.min(280, window.innerWidth - 24);
      const left = Math.min(rect.left, window.innerWidth - width - 12);
      setPos({ top: rect.bottom + 10, left: Math.max(12, left) });
    };
    place();
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        const menu = document.getElementById("smith-menu");
        if (menu?.contains(event.target as Node)) return;
        setOpen(false);
        setRetitle(false);
      }
    };
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const bind = async (nextHandle: string) => {
    setBusy(true);
    setError(null);
    try {
      const next = await saveHandle(nextHandle);
      setPlayer(next);
      setRetitle(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that username.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-w-0 items-center gap-2.5 rounded-full text-left"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {player.picture && !avatar ? (
          <img
            src={player.picture}
            alt=""
            referrerPolicy="no-referrer"
            className="h-8 w-8 shrink-0 rounded-full border border-white/15 object-cover"
          />
        ) : (
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border"
            style={{
              background: avatar
                ? `radial-gradient(circle at 32% 28%, ${avatar.swatch}, #120c12 72%)`
                : "radial-gradient(circle at 32% 28%, #3a3036, #161016)",
              borderColor: avatar ? `${avatar.swatch}99` : "rgba(255,255,255,0.1)",
              boxShadow: avatar ? `0 0 14px ${avatar.swatch}55` : undefined,
            }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: avatar?.swatch ?? "#FF1E56" }} />
          </span>
        )}
        <span className="min-w-0">
          <span
            className="block truncate font-display text-sm leading-none tracking-tight"
            style={{
              color: nick?.swatch ?? "#f4f1f6",
              textShadow: nick?.glow,
            }}
          >
            {handle}
          </span>
          {!compact && (
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {rankTitle(player.xp)}
            </span>
          )}
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                id="smith-menu"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{ top: pos.top, left: pos.left }}
                className="glass glass-glow fixed z-[80] w-[min(280px,calc(100vw-2rem))] rounded-2xl p-3"
              >
                <p className="truncate font-display text-sm">{handle}</p>
                {player.email && (
                  <p className="mt-1 truncate font-mono text-[10px] text-muted">{player.email}</p>
                )}
                {retitle ? (
                  <div className="mt-3">
                    <HandleForm
                      initial={handle}
                      busy={busy}
                      error={error}
                      submitLabel="Save username"
                      onSubmit={({ handle }) => void bind(handle)}
                    />
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setRetitle(true);
                      }}
                      className="ghost-btn rounded-full px-3 py-2 text-left text-xs"
                    >
                      Change username
                    </button>
                    {player.isAdmin && (
                      <Link
                        href="/admin"
                        className="ghost-btn flex items-center gap-2 rounded-full px-3 py-2 text-left text-xs"
                      >
                        <Shield className="h-3.5 w-3.5 text-neon" />
                        Forge desk
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => void signOut({ callbackUrl: "/" })}
                      className="ghost-btn flex items-center gap-2 rounded-full px-3 py-2 text-left text-xs"
                    >
                      <LogOut className="h-3.5 w-3.5 text-neon" />
                      Sign out
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
