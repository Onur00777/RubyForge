import type { PhaseId, StageDef } from "@/lib/types";
import { PHASE_ONE } from "./phase1";
import { PHASE_TWO } from "./phase2";
import { PHASE_THREE } from "./phase3";

export const PHASES: { id: PhaseId; title: string; range: string; blurb: string }[] = [
  {
    id: 1,
    title: "Core Syntax",
    range: "01–10",
    blurb: "Variables, types, methods, and scope — the language of the forge.",
  },
  {
    id: 2,
    title: "The Spirit of Ruby",
    range: "11–20",
    blurb: "Blocks, Enumerable, Proc, lambda, and file I/O.",
  },
  {
    id: 3,
    title: "Object Orientation",
    range: "21–30",
    blurb: "Classes, mixins, exceptions, the engine, and a gemspec.",
  },
];

export const CURRICULUM: StageDef[] = [...PHASE_ONE, ...PHASE_TWO, ...PHASE_THREE];

export function getStep(id: number): StageDef | undefined {
  return CURRICULUM.find((stage) => stage.id === id);
}

export const getStage = getStep;

export function isUnlocked(id: number, completed: number[]): boolean {
  if (id === 1) return true;
  return completed.includes(id - 1) || completed.includes(id);
}
