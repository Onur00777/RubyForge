"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { saveHandle } from "@/lib/api";
import { suggestHandle } from "@/lib/handle";
import { useForge } from "@/components/providers/ForgeProvider";
import { HandleForm } from "./HandleForm";

export function HandleForge() {
  const { data: session } = useSession();
  const { player, setPlayer } = useForge();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initial = player?.handle || suggestHandle(session?.user?.name);

  const bind = async (handle: string) => {
    setBusy(true);
    setError(null);
    try {
      const next = await saveHandle(handle);
      setPlayer(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not bind that handle.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-[min(440px,100%)] flex-col px-4 py-10">
      <div className="my-auto">
        <p className="font-mono text-[11px] tracking-[0.42em] text-neon">NAME THE SMITH</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight">A name is a binding</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This handle sits on the HUD. Bazaar colors can paint it later — the letters are yours now.
          {session?.user?.email ? ` Bound to ${session.user.email}.` : ""}
        </p>
        <div className="glass glass-glow mt-8 rounded-[28px] p-6">
          <HandleForm
            initial={initial}
            busy={busy}
            error={error}
            submitLabel="Enter the Crimson World"
            onSubmit={({ handle }) => void bind(handle)}
          />
        </div>
      </div>
    </div>
  );
}
