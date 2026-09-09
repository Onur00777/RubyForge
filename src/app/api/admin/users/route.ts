import { NextResponse } from "next/server";
import { canAccessAdmin, listAdminRoster } from "@/lib/admin";
import { readSmith } from "@/lib/ledger";
import { failResponse, getSmith, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const smith = await getSmith();
  if (!smith) return unauthorizedResponse();
  try {
    const player = await readSmith(smith);
    if (!(await canAccessAdmin(player))) {
      return NextResponse.json({ error: "This desk is sealed." }, { status: 403 });
    }
    const users = await listAdminRoster();
    return NextResponse.json({ users });
  } catch (error) {
    return failResponse(error, 500);
  }
}
