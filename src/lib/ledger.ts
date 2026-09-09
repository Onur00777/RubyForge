import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { STARTING_GEMS } from "./economy";
import { handleError, normalizeHandle } from "./handle";
import { passError } from "./passphrase";
import {
  engineDir,
  forgeDir,
  journeyRoot,
  runDir,
  smithPath,
  smithsDir,
  stagesDir,
  workspaceDir,
} from "./paths";
import type { PlayerState } from "./types";

export type LedgerIdentity = {
  id: string;
  email: string | null;
  picture: string | null;
  name: string | null;
};

export function defaultPlayer(): PlayerState {
  const now = new Date().toISOString();
  return {
    gems: STARTING_GEMS,
    xp: 0,
    streak: 0,
    lastCompletedAt: null,
    completedSteps: [],
    currentStepId: 1,
    drafts: {},
    hintTiers: {},
    solutionsUnlocked: [],
    reviews: {},
    gitPushTokens: 0,
    autoCommits: 0,
    remoteUrl: null,
    createdAt: now,
    cosmeticsOwned: [],
    equippedNickname: null,
    equippedBanner: null,
    equippedAvatar: null,
    accountId: "",
    email: null,
    picture: null,
    handle: null,
    onboardingComplete: false,
    isAdmin: false,
  };
}

function hashPassphrase(passphrase: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(passphrase, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPassphrase(passphrase: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const actual = scryptSync(passphrase, Buffer.from(saltHex, "hex"), 32);
  const expected = Buffer.from(hashHex, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function publicPlayer(player: PlayerState): PlayerState {
  const { passHash, ...rest } = player;
  void passHash;
  return rest;
}

export async function ensureJourneyLayout(): Promise<void> {
  await mkdir(stagesDir(), { recursive: true });
  await mkdir(workspaceDir(), { recursive: true });
  await mkdir(engineDir(), { recursive: true });
  await mkdir(forgeDir(), { recursive: true });
  await mkdir(smithsDir(), { recursive: true });
  await mkdir(runDir(), { recursive: true });
  await writeFile(path.join(journeyRoot(), ".gitignore"), ".rubyforge/\nworkspace/\n", "utf8");
}

export function mergePlayer(parsed: Partial<PlayerState>, smith: LedgerIdentity): PlayerState {
  return {
    ...defaultPlayer(),
    ...parsed,
    drafts: parsed.drafts ?? {},
    cosmeticsOwned: parsed.cosmeticsOwned ?? [],
    accountId: smith.id,
    email: smith.email ?? parsed.email ?? null,
    picture: smith.picture ?? parsed.picture ?? null,
    handle: parsed.handle ?? null,
    passHash: parsed.passHash ?? null,
    onboardingComplete:
      typeof parsed.onboardingComplete === "boolean"
        ? parsed.onboardingComplete
        : Boolean((parsed.completedSteps?.length ?? 0) > 0 || (parsed.xp ?? 0) > 0),
    isAdmin: Boolean(parsed.isAdmin),
  };
}

export async function readSmith(smith: LedgerIdentity): Promise<PlayerState> {
  await ensureJourneyLayout();
  const target = smithPath(smith.id);
  try {
    const raw = await readFile(target, "utf8");
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    return mergePlayer(parsed, smith);
  } catch {
    const player = mergePlayer(defaultPlayer(), smith);
    await writeFile(target, JSON.stringify(player, null, 2), "utf8");
    return player;
  }
}

export async function writeSmith(smith: LedgerIdentity, player: PlayerState): Promise<void> {
  await ensureJourneyLayout();
  let existingHash: string | null = null;
  let existingAdmin = false;
  try {
    const raw = await readFile(smithPath(smith.id), "utf8");
    const existing = JSON.parse(raw) as PlayerState;
    existingHash = existing.passHash ?? null;
    existingAdmin = Boolean(existing.isAdmin);
  } catch {
    existingHash = null;
    existingAdmin = false;
  }
  const next = mergePlayer(player, smith);
  next.passHash = player.passHash || existingHash;
  next.isAdmin = existingAdmin;
  await writeFile(smithPath(smith.id), JSON.stringify(next, null, 2), "utf8");
}

export async function listSmiths(): Promise<PlayerState[]> {
  await ensureJourneyLayout();
  let files: string[] = [];
  try {
    files = await readdir(smithsDir());
  } catch {
    return [];
  }
  const players: PlayerState[] = [];
  for (const file of files.sort()) {
    if (!file.endsWith(".json")) continue;
    const id = file.slice(0, -5);
    try {
      const parsed = JSON.parse(await readFile(path.join(smithsDir(), file), "utf8")) as Partial<PlayerState>;
      players.push(
        mergePlayer(parsed, {
          id: parsed.accountId || id,
          email: parsed.email ?? null,
          picture: parsed.picture ?? null,
          name: parsed.handle ?? null,
        }),
      );
    } catch {
      // skip a corrupt smith file
    }
  }
  return players;
}

export async function isHandleTaken(handle: string, exceptAccountId?: string): Promise<boolean> {
  return Boolean(await findSmithByHandle(handle, exceptAccountId));
}

export async function findSmithByHandle(
  handle: string,
  exceptAccountId?: string,
): Promise<PlayerState | null> {
  await ensureJourneyLayout();
  const needle = handle.toLowerCase();
  const except = exceptAccountId?.replace(/[^a-zA-Z0-9_-]/g, "") ?? "";
  let files: string[] = [];
  try {
    files = await readdir(smithsDir());
  } catch {
    return null;
  }
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const id = file.slice(0, -5);
    if (except && id === except) continue;
    try {
      const parsed = JSON.parse(await readFile(path.join(smithsDir(), file), "utf8")) as Partial<PlayerState>;
      if (parsed.handle && parsed.handle.toLowerCase() === needle) {
        return mergePlayer(parsed, {
          id: parsed.accountId || id,
          email: parsed.email ?? null,
          picture: parsed.picture ?? null,
          name: parsed.handle,
        });
      }
    } catch {
      // skip a corrupt smith file
    }
  }
  return null;
}

export async function createLocalSmith(
  rawHandle: string,
  passphrase: string,
): Promise<{ id: string; handle: string }> {
  const handle = normalizeHandle(rawHandle);
  const problem = handleError(handle) ?? passError(passphrase);
  if (problem) throw new Error(problem);
  if (await isHandleTaken(handle)) throw new Error("That username is already taken.");

  const id = `local_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const smith: LedgerIdentity = { id, email: null, picture: null, name: handle };
  const player = mergePlayer(defaultPlayer(), smith);
  player.handle = handle;
  player.passHash = hashPassphrase(passphrase);
  await writeSmith(smith, player);
  return { id, handle };
}

export async function returnLocalSmith(
  rawHandle: string,
  passphrase: string,
): Promise<{ id: string; handle: string }> {
  const handle = normalizeHandle(rawHandle);
  const problem = handleError(handle) ?? passError(passphrase);
  if (problem) throw new Error(problem);
  const found = await findSmithByHandle(handle);
  if (!found?.accountId) throw new Error("No account with that username.");
  if (found.passHash) {
    if (!verifyPassphrase(passphrase, found.passHash)) {
      throw new Error("Username and password do not match.");
    }
  } else {
    found.passHash = hashPassphrase(passphrase);
    await writeSmith(
      {
        id: found.accountId,
        email: found.email,
        picture: found.picture,
        name: found.handle,
      },
      found,
    );
  }
  return { id: found.accountId, handle: found.handle ?? handle };
}
