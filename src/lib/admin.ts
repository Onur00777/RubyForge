import { CURRICULUM, getStage } from "@/content/curriculum";
import { listSmiths, publicPlayer } from "./ledger";
import type { AdminSmithRow, PasswordCredential, PlayerState } from "./types";

export function configuredAdminHandles(): string[] {
  return (process.env.RUBYFORGE_ADMIN_HANDLES ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function passwordCredential(passHash?: string | null): PasswordCredential {
  if (!passHash) {
    return { stored: false, algorithm: null, fingerprint: null };
  }
  const digest = passHash.includes(":") ? passHash.slice(passHash.indexOf(":") + 1) : passHash;
  if (!digest || digest.length < 8) {
    return { stored: true, algorithm: "scrypt", fingerprint: "••••••••" };
  }
  return {
    stored: true,
    algorithm: "scrypt",
    fingerprint: digest.slice(0, 10),
  };
}

export async function canAccessAdmin(player: PlayerState, roster?: PlayerState[]): Promise<boolean> {
  if (player.isAdmin) return true;
  const handles = configuredAdminHandles();
  if (player.handle && handles.includes(player.handle.toLowerCase())) return true;
  if (handles.length > 0) return false;

  const smiths = roster ?? (await listSmiths());
  if (smiths.some((smith) => smith.isAdmin)) return false;
  const oldest = [...smiths].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  return Boolean(oldest && oldest.accountId === player.accountId);
}

export async function presentSmith(player: PlayerState): Promise<PlayerState> {
  const shown = publicPlayer(player);
  shown.isAdmin = await canAccessAdmin(player);
  return shown;
}

function authKind(player: PlayerState): AdminSmithRow["authKind"] {
  const local = Boolean(player.passHash);
  const google = Boolean(player.email);
  if (local && google) return "local+google";
  if (google) return "google";
  return "local";
}

export function toAdminRow(player: PlayerState): AdminSmithRow {
  const stage = getStage(player.currentStepId);
  return {
    accountId: player.accountId,
    handle: player.handle,
    email: player.email,
    authKind: authKind(player),
    password: passwordCredential(player.passHash),
    currentStepId: player.currentStepId,
    stageTitle: stage?.title ?? "Unknown station",
    phase: stage?.phase ?? null,
    completedCount: player.completedSteps.length,
    totalStages: CURRICULUM.length,
    gems: player.gems,
    xp: player.xp,
    gitPushTokens: player.gitPushTokens,
    streak: player.streak,
    createdAt: player.createdAt,
    lastCompletedAt: player.lastCompletedAt,
    onboardingComplete: player.onboardingComplete,
    isAdmin: Boolean(player.isAdmin),
  };
}

export async function listAdminRoster(): Promise<AdminSmithRow[]> {
  const smiths = await listSmiths();
  const rows: AdminSmithRow[] = [];
  for (const player of smiths) {
    const row = toAdminRow(player);
    row.isAdmin = await canAccessAdmin(player, smiths);
    rows.push(row);
  }
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
