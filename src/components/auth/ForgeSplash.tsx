"use client";

import { HeroRuby, WelcomeMine } from "./WelcomeMine";

export function ForgeSplash({ label }: { label: string }) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <WelcomeMine />
      <div className="relative z-10 grid min-h-dvh place-items-center px-6">
        <div className="text-center">
          <HeroRuby size={88} gid="splash-hero" />
          <p className="font-mono mt-2 text-[11px] tracking-[0.42em] text-neon">RUBYFORGE</p>
          <p className="mt-3 font-mono text-xs tracking-[0.28em] text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
