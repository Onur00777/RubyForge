import type { PlayerState } from "./types";

export const STARTING_GEMS = 18;
export const XP_PER_LEVEL = 150;

export const MARKET_PRICES = {
  hint: 16,
  oracle: 60,
  push: 40,
} as const;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function rankTitle(xp: number): string {
  const level = levelFromXp(xp);
  if (level >= 16) return "Crimson Architect";
  if (level >= 12) return "Ruby Artisan";
  if (level >= 8) return "Forge Adept";
  if (level >= 4) return "Scripter";
  return "Novice Scripter";
}

export function streakMultiplier(streak: number): number {
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1;
}

export function isSameUtcDay(iso: string, now = new Date()): boolean {
  const then = new Date(iso);
  return (
    then.getUTCFullYear() === now.getUTCFullYear() &&
    then.getUTCMonth() === now.getUTCMonth() &&
    then.getUTCDate() === now.getUTCDate()
  );
}

export function isYesterdayUtc(iso: string, now = new Date()): boolean {
  const then = new Date(iso);
  const y = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  return (
    then.getUTCFullYear() === y.getUTCFullYear() &&
    then.getUTCMonth() === y.getUTCMonth() &&
    then.getUTCDate() === y.getUTCDate()
  );
}

export function nextStreak(player: PlayerState, now = new Date()): number {
  if (!player.lastCompletedAt) return 1;
  if (isSameUtcDay(player.lastCompletedAt, now)) return Math.max(1, player.streak);
  if (isYesterdayUtc(player.lastCompletedAt, now)) return player.streak + 1;
  return 1;
}

export function computeReward(
  baseGems: number,
  baseXp: number,
  streak: number,
  milestone: boolean,
) {
  const multi = streakMultiplier(streak);
  const gems = Math.round(baseGems * multi) + (milestone ? 25 : 0);
  const xp = Math.round(baseXp * multi) + (milestone ? 100 : 0);
  return { gems, xp };
}

export function isMilestone(stageId: number): boolean {
  return stageId % 5 === 0;
}
