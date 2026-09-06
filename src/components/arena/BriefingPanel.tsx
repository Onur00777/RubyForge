"use client";

import { Lightbulb } from "lucide-react";
import { PHASES } from "@/content/curriculum";
import { WALKTHROUGHS } from "@/content/walkthroughs";
import type { StageDef } from "@/lib/types";

interface Props {
  stage: StageDef;
  hintTier: number;
  hints: string[];
}

export function BriefingPanel({ stage, hintTier, hints }: Props) {
  const phase = PHASES.find((item) => item.id === stage.phase);
  const lessons = WALKTHROUGHS[stage.id] ?? [];

  return (
    <section className="glass glass-glow flex h-full flex-col overflow-hidden rounded-[28px]">
      <div className="border-b border-white/8 px-6 py-5">
        <p className="font-mono text-[10px] tracking-[0.18em] text-neon">
          <span className="uppercase tracking-[0.28em]">
            Phase {stage.phase} · {phase?.title}
          </span>
          <span> · {stage.fileName}</span>
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight tracking-tight">
          Stage {String(stage.id).padStart(2, "0")}: {stage.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{stage.subtitle}</p>
      </div>

      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-5 text-[13.5px] leading-relaxed">
        <p className="border-l-2 border-[#FF1E56]/70 pl-3 text-sm text-neon/90">{stage.lore}</p>

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            The idea
          </p>
          <p>{stage.concept}</p>
        </div>

        {lessons.length > 0 && (
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-neon">
              Lesson
            </p>
            <ol className="space-y-4">
              {lessons.map((lesson, index) => (
                <li key={lesson.title} className="rounded-2xl border border-white/8 bg-black/25 p-3.5">
                  <p className="font-display text-[15px] tracking-tight">
                    <span className="mr-2 font-mono text-[10px] text-neon">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {lesson.title}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/90">{lesson.body}</p>
                  {lesson.code ? (
                    <div className="mt-3">
                      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                        Example — not your answer
                      </p>
                      <pre className="overflow-x-auto rounded-xl border border-white/8 bg-void/80 px-3 py-2.5 font-mono text-[11.5px] leading-5 text-neon/90">{lesson.code}</pre>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber">
            Your turn
          </p>
          <p>{stage.task}</p>
          <ul className="mt-3 space-y-2 text-muted">
            {stage.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neon" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald">
            What to finish
          </p>
          <p className="mb-2 text-xs text-muted">Hit Run and we check this list.</p>
          <ol className="space-y-1.5">
            {stage.objectives.map((objective, index) => (
              <li key={`${index}-${objective}`} className="flex gap-2">
                <span className="text-neon">{index + 1}.</span>
                <span>{objective}</span>
              </li>
            ))}
          </ol>
        </div>

        {hints.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-amber/5 p-3">
            <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber">
              <Lightbulb className="h-3.5 w-3.5" />
              Diagnostic Hint {hintTier}
            </p>
            {hints.map((hint) => (
              <p key={hint} className="mt-1 text-amber/90">
                {hint}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
