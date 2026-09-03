import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { STARTING_GEMS } from "./economy";
import {
  engineDir,
  forgeDir,
  journeyRoot,
  progressPath,
  runDir,
  stageFilePath,
  stagesDir,
  workspaceDir,
} from "./paths";
import type { PlayerState, StageDef } from "./types";
import { getStage } from "@/content/curriculum";

let lock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function defaultPlayer(): PlayerState {
  const now = new Date().toISOString();
  return {
    gems: STARTING_GEMS,
    xp: 0,
    streak: 0,
    lastCompletedAt: null,
    completedSteps: [],
    currentStepId: 1,
    drafts: {},
    hintTiers: {},
    solutionsUnlocked: [],
    reviews: {},
    gitPushTokens: 0,
    autoCommits: 0,
    remoteUrl: null,
    createdAt: now,
  };
}

export async function ensureJourneyLayout(): Promise<void> {
  await mkdir(stagesDir(), { recursive: true });
  await mkdir(workspaceDir(), { recursive: true });
  await mkdir(engineDir(), { recursive: true });
  await mkdir(forgeDir(), { recursive: true });
  await mkdir(runDir(), { recursive: true });
  await writeFile(path.join(journeyRoot(), ".gitignore"), ".rubyforge/\nworkspace/\n", "utf8");
}

async function readPlayer(): Promise<PlayerState> {
  await ensureJourneyLayout();
  try {
    const raw = await readFile(progressPath(), "utf8");
    const parsed = JSON.parse(raw) as PlayerState;
    return { ...defaultPlayer(), ...parsed, drafts: parsed.drafts ?? {} };
  } catch {
    const player = defaultPlayer();
    await writeFile(progressPath(), JSON.stringify(player, null, 2), "utf8");
    return player;
  }
}

export async function loadPlayer(): Promise<PlayerState> {
  return withLock(readPlayer);
}

export async function savePlayer(player: PlayerState): Promise<void> {
  await withLock(async () => {
    await ensureJourneyLayout();
    await writeFile(progressPath(), JSON.stringify(player, null, 2), "utf8");
  });
}

export async function updatePlayer(
  mutator: (player: PlayerState) => PlayerState | Promise<PlayerState>,
): Promise<PlayerState> {
  return withLock(async () => {
    const current = await readPlayer();
    const next = await mutator(current);
    await ensureJourneyLayout();
    await writeFile(progressPath(), JSON.stringify(next, null, 2), "utf8");
    return next;
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

  const body = `# Crimson Path Engine

Local Ruby portfolio forged in RubyForge: The Crimson Path.

- Stages complete: **${completed.length} / 30**
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
