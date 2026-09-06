import { NextResponse } from "next/server";
import { getStage } from "@/content/curriculum";
import { applyEquip, COSMETIC_BY_ID, isCosmeticId } from "@/lib/cosmetics";
import { MARKET_PRICES } from "@/lib/economy";
import { gitPush } from "@/lib/git-bridge";
import { reviewRuby } from "@/lib/oracle";
import { updatePlayer } from "@/lib/player";
import { failResponse, getSmith, unauthorizedResponse } from "@/lib/session";
import type { MarketItem, UtilityItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UTILITIES: UtilityItem[] = ["hint", "oracle", "push"];

export async function POST(request: Request) {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();

  const body = (await request.json()) as {
    item?: MarketItem;
    stepId?: number;
    code?: string;
    remoteUrl?: string;
    action?: "buy" | "equip";
  };

  const item = body.item;
  if (!item) {
    return NextResponse.json({ ok: false, error: "Unknown bazaar item." }, { status: 400 });
  }

  const isUtility = (UTILITIES as string[]).includes(item);
  if (!isUtility && !isCosmeticId(item)) {
    return NextResponse.json({ ok: false, error: "Unknown bazaar item." }, { status: 400 });
  }

  const stepId = Number(body.stepId ?? 1);
  const stage = getStage(stepId);
  const key = String(stepId);

  try {
    if (isCosmeticId(item)) {
      const def = COSMETIC_BY_ID[item];
      const result = await updatePlayer((player) => {
        const owned = player.cosmeticsOwned.includes(def.id);
        if (body.action === "equip") {
          if (!owned) throw new Error("You do not own this cosmetic yet.");
          applyEquip(player, def);
          return player;
        }
        if (owned) {
          applyEquip(player, def);
          return player;
        }
        if (player.gems < def.price) {
          throw new Error(`Insufficient gems. This costs ${def.price} 💎.`);
        }
        player.gems -= def.price;
        player.cosmeticsOwned = [...player.cosmeticsOwned, def.id];
        applyEquip(player, def);
        return player;
      });
      return NextResponse.json({ ok: true, player: result });
    }

    const price = MARKET_PRICES[item as UtilityItem];
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
    return failResponse(error, 400);
  }
}
