import { NextResponse } from "next/server";
import { getStage } from "@/content/curriculum";
import { computeReward, isMilestone, levelFromXp, nextStreak } from "@/lib/economy";
import { gitCommit } from "@/lib/git-bridge";
import { persistStageFile, rewritePortfolioReadme, updatePlayer } from "@/lib/player";
import { executeStep } from "@/lib/ruby-runner";
import type { RunResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { stepId?: number; code?: string };
    const stepId = Number(body.stepId);
    const code = body.code ?? "";

    if (!Number.isInteger(stepId) || stepId < 1) {
      return NextResponse.json({ ok: false, error: "Invalid stage id." } satisfies Partial<RunResponse>, {
        status: 400,
      });
    }
    if (code.length > 50_000) {
      return NextResponse.json({ ok: false, error: "Code exceeds 50,000 characters." }, { status: 400 });
    }

    const stage = getStage(stepId);
    if (!stage) {
      return NextResponse.json({ ok: false, error: "Stage not found." }, { status: 404 });
    }

    await updatePlayer((player) => {
      player.drafts[String(stepId)] = code;
      return player;
    });

    const outcome = await executeStep(stage, code);

    const payload: RunResponse = {
      ok: true,
      passed: outcome.passed,
      stdout: outcome.stdout,
      stderr: outcome.stderr,
      exitCode: outcome.exitCode,
      timedOut: outcome.timedOut,
      results: outcome.results,
      autoCommit: null,
    };

    if (!outcome.passed) {
      const player = await updatePlayer((p) => p);
      payload.player = player;
      return NextResponse.json(payload);
    }

    const savedPath = await persistStageFile(stage, code);
    payload.savedPath = savedPath;

    const player = await updatePlayer(async (current) => {
      const already = current.completedSteps.includes(stepId);
      if (already) return current;

      const streak = nextStreak(current);
      const milestone = isMilestone(stepId);
      const reward = computeReward(stage.gems, stage.xp, streak, milestone);
      const previousLevel = levelFromXp(current.xp);

      current.completedSteps = [...current.completedSteps, stepId].sort((a, b) => a - b);
      current.gems += reward.gems;
      current.xp += reward.xp;
      current.streak = streak;
      current.lastCompletedAt = new Date().toISOString();
      if (stepId >= current.currentStepId && stepId < 30) {
        current.currentStepId = stepId + 1;
      }
      if (stepId === 30) current.currentStepId = 30;

      const newLevel = levelFromXp(current.xp);
      payload.reward = { ...reward, streak };
      payload.previousLevel = previousLevel;
      payload.newLevel = newLevel;
      payload.leveledUp = newLevel > previousLevel;

      if (milestone) {
        const message = stage.commitTitle ?? `feat(stage-${stepId}): completed RubyForge milestone`;
        const commit = await gitCommit(message);
        if (commit.ok) {
          current.autoCommits += 1;
          payload.autoCommit = { message };
        } else if (!commit.empty) {
          payload.autoCommit = { message: `commit failed: ${commit.stderr || commit.stdout}` };
        }
      }

      await rewritePortfolioReadme(current);
      return current;
    });

    payload.player = player;
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
