import { NextResponse } from "next/server";
import { getStage } from "@/content/curriculum";
import { MARKET_PRICES } from "@/lib/economy";
import { gitPush } from "@/lib/git-bridge";
import { reviewRuby } from "@/lib/oracle";
import { updatePlayer } from "@/lib/player";
import type { MarketItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    item?: MarketItem;
    stepId?: number;
    code?: string;
    remoteUrl?: string;
  };

  const item = body.item;
  if (!item || !(item in MARKET_PRICES)) {
    return NextResponse.json({ ok: false, error: "Unknown bazaar item." }, { status: 400 });
  }

  const price = MARKET_PRICES[item];
  const stepId = Number(body.stepId ?? 1);
  const stage = getStage(stepId);
  const key = String(stepId);

  try {
    const result = await updatePlayer(async (player) => {
      if (player.gems < price) {
        throw new Error(`Insufficient gems. This costs ${price} 💎.`);
      }

      if (item === "hint") {
        if (!stage) throw new Error("Stage not found.");
        const current = player.hintTiers[key] ?? 0;
        if (current >= 2) throw new Error("Both diagnostic hints are already unlocked.");
        player.gems -= price;
        player.hintTiers[key] = current + 1;
        return player;
      }

      if (item === "oracle") {
        player.gems -= price;
        const report = reviewRuby(body.code ?? player.drafts[key] ?? stage?.starterCode ?? "");
        player.reviews[key] = `${report.score} · ${report.headline}`;
        return player;
      }

      if (!player.remoteUrl && !body.remoteUrl?.trim()) {
        throw new Error("Set a GitHub remote URL before purchasing Automated Git Push.");
      }
      player.gems -= price;
      if (body.remoteUrl?.trim()) player.remoteUrl = body.remoteUrl.trim();
      return player;
    });

    if (item === "hint") {
      return NextResponse.json({
        ok: true,
        player: result,
        hintTier: result.hintTiers[key],
        hint: stage?.hints[(result.hintTiers[key] ?? 1) - 1],
      });
    }

    if (item === "oracle") {
      const report = reviewRuby(body.code ?? result.drafts[key] ?? stage?.starterCode ?? "");
      return NextResponse.json({ ok: true, player: result, report });
    }

    const push = await gitPush();
    if (!push.ok) {
      await updatePlayer((player) => {
        player.gems += price;
        return player;
      });
      return NextResponse.json(
        {
          ok: false,
          error: push.stderr || push.stdout || "git push origin failed.",
          player: await updatePlayer((p) => p),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      player: result,
      stdout: push.stdout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed.";
    const status = message.includes("Insufficient") || message.includes("already") ? 400 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
