"use client";

import { Suspense, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useForge } from "@/components/providers/ForgeProvider";
import { ForgeGate } from "./ForgeGate";
import { ForgeSplash } from "./ForgeSplash";
import { HandleForge } from "./HandleForge";

function AuthGateInner({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const { player, loading, error, googleConfigured } = useForge();

  if (status === "loading" || googleConfigured === null) {
    return <ForgeSplash label="Loading…" />;
  }

  if (status !== "authenticated") {
    return <ForgeGate googleConfigured={Boolean(googleConfigured)} />;
  }

  if (loading && !player) {
    return <ForgeSplash label="Loading your progress…" />;
  }

  if (error && !player) {
    return (
      <div className="relative z-10 grid min-h-screen place-items-center px-6">
        <p className="max-w-md text-center text-sm text-amber">{error}</p>
      </div>
    );
  }

  if (!player?.handle) {
    return <HandleForge />;
  }

  return <>{children}</>;
}

export function AuthGate({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ForgeSplash label="Loading…" />}>
      <AuthGateInner>{children}</AuthGateInner>
    </Suspense>
  );
}
