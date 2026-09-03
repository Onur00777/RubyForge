import { NextResponse } from "next/server";
import { updatePlayer } from "@/lib/player";
import type { PlayerState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const player = await updatePlayer((p) => p);
  return NextResponse.json({ player });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PlayerState>;
  const player = await updatePlayer((current) => {
    current.currentStepId = body.currentStepId ?? current.currentStepId;
    current.drafts = body.drafts ? { ...current.drafts, ...body.drafts } : current.drafts;
    current.remoteUrl = body.remoteUrl ?? current.remoteUrl;
    return current;
  });
  return NextResponse.json({ player });
}
