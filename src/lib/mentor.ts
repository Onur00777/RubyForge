import type { RunResponse } from "@/lib/types";
import {
  BAZAAR_LINES,
  FAIL_GENERIC,
  IDLE_LINES,
  MAP_INTRO,
  MAP_RETURN,
  MILESTONE_LINES,
  PASS_LINES,
  RUN_LINES,
  STAGE_WHISPERS,
  type MentorLine,
  type MentorMood,
} from "@/content/mentor";

const SEEN_KEY = "rubyforge-ember-seen";
const MET_KEY = "rubyforge-ember-met";
const MUTE_KEY = "rubyforge-ember-muted";

export type MentorEvent =
  | { type: "map"; completed: number }
  | { type: "stage"; stageId: number }
  | { type: "run"; stageId: number }
  | { type: "fail"; stageId: number; result: RunResponse }
  | { type: "pass"; stageId: number; milestone?: boolean; gems?: number }
  | { type: "bazaar" }
  | { type: "idle" };

function pick<T>(items: T[], salt = 0): T {
  if (!items.length) throw new Error("empty pick");
  const index = Math.abs(salt) % items.length;
  return items[index]!;
}

function readSeen(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function writeSeen(seen: Record<string, number>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

export function isMentorMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setMentorMuted(muted: boolean) {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

function recently(id: string, ms: number): boolean {
  const seen = readSeen();
  const at = seen[id];
  if (!at) return false;
  return Date.now() - at < ms;
}

function mark(id: string) {
  const seen = readSeen();
  seen[id] = Date.now();
  writeSeen(seen);
}

export function hasMetEmber(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MET_KEY) === "1";
}

export function markEmberMet() {
  if (typeof window === "undefined") return;
  localStorage.setItem(MET_KEY, "1");
}

function meet() {
  markEmberMet();
}

export function diagnoseFail(result: RunResponse): string {
  const failed = result.results.find((item) => !item.passed);
  const blob = `${result.stderr ?? ""} ${result.stdout ?? ""} ${failed?.detail ?? ""} ${failed?.name ?? ""}`.toLowerCase();

  if (result.timedOut) {
    return "The runtime hit the eight-second wall. A loop is eating the forge. Interrupt the heat.";
  }
  if (blob.includes("include?") && blob.includes("nil")) {
    return "You asked nil if it includes text. welcome is still empty — fill the right-hand side of the assignment.";
  }
  if (blob.includes("undefined method") || blob.includes("nomethoderror")) {
    return "NoMethodError — you sent a message to something that is missing or the wrong class. Check the name the suite just printed.";
  }
  if (blob.includes("uninitialized constant")) {
    return "A constant was never born. Uppercase names live at file scope. Spell them as the spec spells them.";
  }
  if (blob.includes("syntax")) {
    return "Syntax broke before the tests could run. An end, a quote, or a comma is missing. The stderr is honest.";
  }
  if (failed?.name) {
    const detail = failed.detail ? ` ${failed.detail}` : "";
    return `Stopped at “${failed.name}”.${detail} That line is the contract.`;
  }
  return pick(FAIL_GENERIC, Date.now());
}

export function resolveMentorLine(event: MentorEvent): MentorLine | null {
  if (typeof window === "undefined") return null;

  switch (event.type) {
    case "map": {
      if (!hasMetEmber()) {
        meet();
        mark("map-intro");
        mark("map-return");
        return MAP_INTRO;
      }
      if (recently("map-return", 45_000)) return null;
      mark("map-return");
      return {
        id: "map-return",
        mood: "idle",
        text: pick(MAP_RETURN, event.completed + Math.floor(Date.now() / 120_000)),
      };
    }
    case "stage": {
      const id = `stage-${event.stageId}`;
      if (recently(id, 120_000)) return null;
      mark(id);
      const whisper = STAGE_WHISPERS[event.stageId];
      return {
        id,
        mood: "teach",
        text:
          whisper ??
          "The briefing on the left is the lesson. Write what the spec names. Then run.",
      };
    }
    case "run": {
      const id = `run-${event.stageId}`;
      if (recently(id, 24 * 60 * 60 * 1000)) return null;
      mark(id);
      return {
        id,
        mood: "idle",
        text: pick(RUN_LINES, event.stageId),
      };
    }
    case "fail": {
      mark(`fail-${event.stageId}`);
      return {
        id: `fail-${event.stageId}-${Date.now()}`,
        mood: "warn",
        text: diagnoseFail(event.result),
      };
    }
    case "pass": {
      if (event.milestone) {
        return {
          id: `mile-${event.stageId}`,
          mood: "cheer",
          text: pick(MILESTONE_LINES, event.stageId),
        };
      }
      const extra = event.gems ? ` +${event.gems} gems.` : "";
      return {
        id: `pass-${event.stageId}`,
        mood: "cheer",
        text: `${pick(PASS_LINES, event.stageId)}${extra}`,
      };
    }
    case "bazaar": {
      if (recently("bazaar", 20_000)) return null;
      mark("bazaar");
      return {
        id: "bazaar",
        mood: "idle",
        text: pick(BAZAAR_LINES, Math.floor(Date.now() / 60_000)),
      };
    }
    case "idle": {
      return {
        id: `idle-${Date.now()}`,
        mood: "idle",
        text: pick(IDLE_LINES, Math.floor(Date.now() / 15_000)),
      };
    }
    default:
      return null;
  }
}

export function moodAccent(mood: MentorMood): string {
  if (mood === "cheer") return "#34d399";
  if (mood === "warn") return "#f5b942";
  if (mood === "teach") return "#FF1E56";
  return "#e7e5e4";
}
