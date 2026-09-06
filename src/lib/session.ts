import { NextResponse } from "next/server";
import { auth } from "@/auth";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Sign in required.");
    this.name = "UnauthenticatedError";
  }
}

export type SmithSession = {
  id: string;
  email: string | null;
  picture: string | null;
  name: string | null;
};

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export async function getSmith(): Promise<SmithSession | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return {
    id,
    email: session.user.email ?? null,
    picture: session.user.image ?? null,
    name: session.user.name ?? null,
  };
}

export async function requireSmith(): Promise<SmithSession> {
  const smith = await getSmith();
  if (!smith) throw new UnauthenticatedError();
  return smith;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Sign in required." }, { status: 401 });
}

export function failResponse(error: unknown, fallbackStatus = 400) {
  if (error instanceof UnauthenticatedError) return unauthorizedResponse();
  const message = error instanceof Error ? error.message : "Request failed.";
  return NextResponse.json({ error: message }, { status: fallbackStatus });
}
