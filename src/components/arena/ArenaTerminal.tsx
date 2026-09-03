"use client";

import { CheckCircle2, CircleAlert, Terminal } from "lucide-react";
import type { RunResponse } from "@/lib/types";

interface Props {
  result: RunResponse | null;
  busy: boolean;
}

export function ArenaTerminal({ result, busy }: Props) {
  const passed = result?.passed;
  const total = result?.results.length ?? 0;
  const ok = result?.results.filter((item) => item.passed).length ?? 0;

  return (
    <section className="glass flex h-full flex-col overflow-hidden rounded-[28px]">
      <div className="flex h-10 shrink-0 items-center gap-2 px-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <Terminal className="h-3.5 w-3.5 text-neon" />
        Test Output
        {busy && <span className="ml-auto text-amber">ruby runtime executing…</span>}
        {!busy && result && (
          <span className={`ml-auto ${passed ? "text-emerald" : "text-neon"}`}>
            {passed
              ? `Test suite passed: ${ok}/${total} assertions verified`
              : `Test suite failed: ${ok}/${total} assertions`}
          </span>
        )}
      </div>
      <div className="scrollbar-thin grid min-h-0 flex-1 grid-cols-2 gap-px overflow-hidden border-t border-white/8 bg-void/50">
        <div className="scrollbar-thin overflow-auto p-3 font-mono text-[12px] leading-5">
          <p className="mb-2 uppercase tracking-[0.2em] text-muted">Stdout / Stderr</p>
          <pre className="whitespace-pre-wrap text-ink/90">
            {result?.stdout || (busy ? "…" : "Waiting for execution.")}
            {result?.stderr ? `\n\n[stderr]\n${result.stderr}` : ""}
            {result?.timedOut ? "\n\n[timeout] 8s" : ""}
          </pre>
        </div>
        <div className="scrollbar-thin overflow-auto p-3 font-mono text-[12px]">
          <p className="mb-2 uppercase tracking-[0.2em] text-muted">Assertions</p>
          <ul className="space-y-1.5">
            {(result?.results ?? []).length === 0 && (
              <li className="text-muted">Assertion diffs light up here.</li>
            )}
            {result?.results.map((item) => (
              <li key={item.name} className="flex items-start gap-2">
                {item.passed ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                ) : (
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />
                )}
                <div>
                  <p className={item.passed ? "text-emerald" : "text-neon"}>{item.name}</p>
                  {item.detail && !item.passed && <p className="text-muted">{item.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
