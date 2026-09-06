import { NextResponse } from "next/server";
import { gitCommit, gitPush, gitSetRemote, gitStatus } from "@/lib/git-bridge";
import { updatePlayer } from "@/lib/player";
import { failResponse, getSmith, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();

  try {
    const body = (await request.json()) as {
      action?: "status" | "commit" | "push" | "set-remote";
      message?: string;
      remoteUrl?: string;
    };

    if (body.action === "status") {
      const status = await gitStatus();
      const player = await updatePlayer((p) => p);
      return NextResponse.json({ ok: status.ok, player, stdout: status.stdout, stderr: status.stderr });
    }

    if (body.action === "set-remote") {
      const url = body.remoteUrl?.trim();
      if (!url) {
        return NextResponse.json({ ok: false, error: "A remote repository URL is required." }, { status: 400 });
      }
      const result = await gitSetRemote(url);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.stderr || result.stdout || "Could not set remote." },
          { status: 400 },
        );
      }
      const player = await updatePlayer((current) => {
        current.remoteUrl = url;
        return current;
      });
      return NextResponse.json({ ok: true, player, stdout: result.stdout });
    }

    if (body.action === "commit") {
      const message = body.message?.trim() || "chore: manual RubyForge snapshot";
      const result = await gitCommit(message);
      const player = await updatePlayer((p) => p);
      return NextResponse.json({
        ok: result.ok || result.empty,
        empty: result.empty,
        stdout: result.stdout,
        stderr: result.stderr,
        player,
      });
    }

    if (body.action === "push") {
      const player = await updatePlayer((p) => p);
      if (!player.remoteUrl) {
        return NextResponse.json({ ok: false, error: "Save a GitHub remote URL first." }, { status: 400 });
      }
      const result = await gitPush();
      return NextResponse.json({
        ok: result.ok,
        stdout: result.stdout,
        stderr: result.stderr,
        error: result.ok ? undefined : result.stderr || result.stdout || "git push failed",
        player,
      });
    }

    return NextResponse.json({ ok: false, error: "Unknown git action." }, { status: 400 });
  } catch (error) {
    return failResponse(error, 500);
  }
}
