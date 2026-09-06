"use client";

export function ForgeSplash({ label }: { label: string }) {
  return (
    <div className="relative z-10 grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <p className="font-mono text-[11px] tracking-[0.42em] text-neon">RUBYFORGE</p>
        <p className="mt-3 font-mono text-xs tracking-[0.28em] text-muted">{label}</p>
      </div>
    </div>
  );
}
