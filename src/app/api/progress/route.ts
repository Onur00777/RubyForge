import { NextResponse } from "next/server";
import { updatePlayer } from "@/lib/player";
import { failResponse, getSmith, unauthorizedResponse } from "@/lib/session";
import type { PlayerState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();
  try {
    const player = await updatePlayer((p) => p);
    return NextResponse.json({ player });
  } catch (error) {
    return failResponse(error, 500);
  }
}

export async function POST(request: Request) {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();
  try {
    const body = (await request.json()) as Partial<PlayerState>;
    const player = await updatePlayer((current) => {
      current.currentStepId = body.currentStepId ?? current.currentStepId;
      current.drafts = body.drafts ? { ...current.drafts, ...body.drafts } : current.drafts;
      current.remoteUrl = body.remoteUrl ?? current.remoteUrl;
      if (body.onboardingComplete === true) current.onboardingComplete = true;
      return current;
    });
    return NextResponse.json({ player });
  } catch (error) {
    return failResponse(error, 500);
  }
}
