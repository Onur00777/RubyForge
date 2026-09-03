import type { MarketItem, PlayerState, RunResponse, SystemStatus } from "./types";
import type { OracleReport } from "./oracle";

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export async function fetchSystem(): Promise<SystemStatus & { player: PlayerState }> {
  const response = await fetch("/api/system", { cache: "no-store" });
  return parse(response);
}

export async function saveProgress(patch: Partial<PlayerState>): Promise<PlayerState> {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await parse<{ player: PlayerState }>(response);
  return data.player;
}

export async function runCode(stepId: number, code: string): Promise<RunResponse> {
  const response = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepId, code }),
  });
  return parse<RunResponse>(response);
}

export async function buyItem(
  item: MarketItem,
  stepId: number,
  extra?: { code?: string; remoteUrl?: string },
): Promise<{
  player: PlayerState;
  hint?: string;
  hintTier?: number;
  report?: OracleReport;
  stdout?: string;
}> {
  const response = await fetch("/api/market", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item, stepId, ...extra }),
  });
  return parse(response);
}

export async function gitAction(
  action: "status" | "commit" | "push" | "set-remote",
  extra?: { message?: string; remoteUrl?: string },
) {
  const response = await fetch("/api/git", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  return parse<{
    ok: boolean;
    player?: PlayerState;
    stdout?: string;
    stderr?: string;
    error?: string;
    empty?: boolean;
  }>(response);
}
