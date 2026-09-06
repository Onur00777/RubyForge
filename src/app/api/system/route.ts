import { NextResponse } from "next/server";
import { gitCommit, gitInit } from "@/lib/git-bridge";
import { ensureJourneyLayout, loadPlayer, rewritePortfolioReadme } from "@/lib/player";
import { journeyRoot } from "@/lib/paths";
import { commandVersion } from "@/lib/process";
import { getSmith, isGoogleConfigured, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();

  const [ruby, git] = await Promise.all([commandVersion("ruby"), commandVersion("git")]);
  await ensureJourneyLayout();
  const init = await gitInit();
  const player = await loadPlayer();
  await rewritePortfolioReadme(player);
  if (init.created) {
    await gitCommit("chore: initialize RubyForge journey");
  }

  return NextResponse.json({
    ruby,
    git,
    journeyPath: journeyRoot(),
    initialized: init.ok,
    gitInit: init,
    player,
    googleConfigured: isGoogleConfigured(),
  });
}
