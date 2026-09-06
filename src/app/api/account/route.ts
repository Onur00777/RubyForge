import { NextResponse } from "next/server";
import { handleError, normalizeHandle } from "@/lib/handle";
import { isHandleTaken, loadPlayer, updatePlayer } from "@/lib/player";
import { getSmith, isGoogleConfigured, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const smith = await getSmith();
  if (!smith) {
    return NextResponse.json({
      googleConfigured: isGoogleConfigured(),
      signedIn: false,
    });
  }
  const player = await loadPlayer();
  return NextResponse.json({
    googleConfigured: isGoogleConfigured(),
    signedIn: true,
    email: player.email,
    picture: player.picture,
    handle: player.handle,
    suggested: smith.name,
  });
}

export async function POST(request: Request) {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();

  const body = (await request.json()) as { handle?: string };
  const handle = normalizeHandle(body.handle ?? "");
  const problem = handleError(handle);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  const taken = await isHandleTaken(handle, smith.id);
  if (taken) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const player = await updatePlayer((current) => {
    current.handle = handle;
    return current;
  });

  return NextResponse.json({ ok: true, player });
}
