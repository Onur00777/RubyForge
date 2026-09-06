import { writeFile } from "node:fs/promises";
import path from "node:path";
import { getStage } from "@/content/curriculum";
import {
  defaultPlayer,
  ensureJourneyLayout,
  isHandleTaken,
  mergePlayer,
  publicPlayer,
  readSmith,
  writeSmith,
} from "./ledger";
import { journeyRoot, stageFilePath } from "./paths";
import { requireSmith } from "./session";
import type { PlayerState, StageDef } from "./types";

export { defaultPlayer, ensureJourneyLayout, isHandleTaken };

const locks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  locks.set(
    key,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

export async function loadPlayer(): Promise<PlayerState> {
  const smith = await requireSmith();
  return withLock(smith.id, async () => publicPlayer(await readSmith(smith)));
}

export async function savePlayer(player: PlayerState): Promise<void> {
  const smith = await requireSmith();
  await withLock(smith.id, async () => {
    await writeSmith(smith, player);
  });
}

export async function updatePlayer(
  mutator: (player: PlayerState) => PlayerState | Promise<PlayerState>,
): Promise<PlayerState> {
  const smith = await requireSmith();
  return withLock(smith.id, async () => {
    const current = await readSmith(smith);
    const next = await mutator(current);
    await writeSmith(smith, next);
    return publicPlayer(mergePlayer(next, smith));
  });
}

export async function persistStageFile(stage: StageDef, code: string): Promise<string> {
  await ensureJourneyLayout();
  const target = stageFilePath(stage.fileName);
  const banner = `# RubyForge · Stage ${stage.id} · ${stage.title}\n# ${stage.fileName}\n\n`;
  await writeFile(target, banner + code.trimEnd() + "\n", "utf8");
  return target;
}

export const persistStepFile = persistStageFile;

export async function rewritePortfolioReadme(player: PlayerState): Promise<void> {
  const completed = [...player.completedSteps].sort((a, b) => a - b);
  const rows = completed
    .map((id) => {
      const stage = getStage(id);
      if (!stage) return null;
      return `| ${String(id).padStart(2, "0")} | ${stage.title} | \`stages/${stage.fileName}\` |`;
    })
    .filter(Boolean)
    .join("\n");

  const smithLine = player.handle ? `- Smith: **${player.handle}**\n` : "";

  const body = `# Crimson Path Engine

Local Ruby portfolio forged in RubyForge: The Crimson Path.

${smithLine}- Stages complete: **${completed.length} / 30**
- XP: **${player.xp}**
- Ruby Gems: **${player.gems}**

## Stages

| # | Topic | File |
|---|-------|------|
${rows || "| — | No stages yet | — |"}

## Run

\`\`\`bash
ruby stages/stage_01_variables.rb
\`\`\`

Each passing mission writes a real \`.rb\` file under \`stages/\`.
`;

  await writeFile(path.join(journeyRoot(), "README.md"), body, "utf8");
}
