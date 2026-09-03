export type PhaseId = 1 | 2 | 3;

export interface TestCaseResult {
  name: string;
  passed: boolean;
  detail?: string | null;
}

export interface StageFixture {
  path: string;
  content: string;
}

export interface StageDef {
  id: number;
  phase: PhaseId;
  slug: string;
  title: string;
  subtitle: string;
  fileName: string;
  concept: string;
  bullets: string[];
  lore: string;
  task: string;
  objectives: string[];
  starterCode: string;
  testScript: string;
  hints: [string, string];
  solution: string;
  gems: number;
  xp: number;
  fixtures?: StageFixture[];
  commitTitle?: string;
}

export interface PlayerState {
  gems: number;
  xp: number;
  streak: number;
  lastCompletedAt: string | null;
  completedSteps: number[];
  currentStepId: number;
  drafts: Record<string, string>;
  hintTiers: Record<string, number>;
  solutionsUnlocked: number[];
  reviews: Record<string, string>;
  gitPushTokens: number;
  autoCommits: number;
  remoteUrl: string | null;
  createdAt: string;
}

export interface SystemStatus {
  ruby: { ok: boolean; version: string; error?: string };
  git: { ok: boolean; version: string; error?: string };
  journeyPath: string;
  initialized: boolean;
}

export interface RunResponse {
  ok: boolean;
  passed: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  results: TestCaseResult[];
  savedPath?: string;
  player?: PlayerState;
  leveledUp?: boolean;
  previousLevel?: number;
  newLevel?: number;
  reward?: { gems: number; xp: number; streak: number };
  autoCommit?: { message: string } | null;
  error?: string;
}

export type MarketItem = "hint" | "oracle" | "push";
