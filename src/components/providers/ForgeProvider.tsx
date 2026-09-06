"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { fetchAccount, fetchSystem, saveProgress } from "@/lib/api";
import type { PlayerState, SystemStatus } from "@/lib/types";

interface ForgeContextValue {
  player: PlayerState | null;
  system: (SystemStatus & { player: PlayerState }) | null;
  loading: boolean;
  error: string | null;
  googleConfigured: boolean | null;
  bazaarOpen: boolean;
  setBazaarOpen: (open: boolean) => void;
  setPlayer: (player: PlayerState) => void;
  persistDraft: (stageId: number, code: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ForgeContext = createContext<ForgeContextValue | null>(null);

export function ForgeProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [system, setSystem] = useState<(SystemStatus & { player: PlayerState }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [bazaarOpen, setBazaarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAccount()
      .then((data) => {
        if (!cancelled) setGoogleConfigured(data.googleConfigured);
      })
      .catch(() => {
        if (!cancelled) setGoogleConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }
    if (status !== "authenticated") {
      setPlayer(null);
      setSystem(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchSystem()
      .then((data) => {
        if (cancelled) return;
        setSystem(data);
        setPlayer(data.player);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const persistDraft = useCallback(async (stageId: number, code: string) => {
    const next = await saveProgress({
      currentStepId: stageId,
      drafts: { [String(stageId)]: code },
    });
    setPlayer(next);
  }, []);

  const refresh = useCallback(async () => {
    const data = await fetchSystem();
    setSystem(data);
    setPlayer(data.player);
  }, []);

  const value = useMemo(
    () => ({
      player,
      system,
      loading,
      error,
      googleConfigured,
      bazaarOpen,
      setBazaarOpen,
      setPlayer,
      persistDraft,
      refresh,
    }),
    [player, system, loading, error, googleConfigured, bazaarOpen, persistDraft, refresh],
  );

  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge() {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error("useForge must be used within ForgeProvider");
  return ctx;
}
