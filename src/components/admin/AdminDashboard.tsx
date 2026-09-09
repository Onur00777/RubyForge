"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gem, Lock, RefreshCw, Shield, Users } from "lucide-react";
import { fetchAdminRoster } from "@/lib/api";
import { rankTitle } from "@/lib/economy";
import type { AdminSmithRow } from "@/lib/types";

type SortKey = "createdAt" | "handle" | "currentStepId" | "gems" | "xp";

export function AdminDashboard({
  users = [],
  locked = false,
}: {
  users?: AdminSmithRow[];
  locked?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [rows, setRows] = useState(users);
  const [trackedUsers, setTrackedUsers] = useState(users);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (users !== trackedUsers) {
    setTrackedUsers(users);
    setRows(users);
  }

  const refresh = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await fetchAdminRoster();
      setRows(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh the ledger.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = rows.filter((row) => {
      if (!needle) return true;
      return [row.handle, row.email, row.accountId, row.stageTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
    const direction = sortKey === "handle" ? 1 : -1;
    return [...next].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * (sortKey === "currentStepId" ? 1 : direction);
      return String(av).localeCompare(String(bv), undefined, { sensitivity: "base" }) * (sortKey === "handle" ? 1 : direction);
    });
  }, [query, rows, sortKey]);

  const totals = useMemo(() => {
    const gems = rows.reduce((sum, row) => sum + row.gems, 0);
    const xp = rows.reduce((sum, row) => sum + row.xp, 0);
    const avgStage = rows.length
      ? Math.round((rows.reduce((sum, row) => sum + row.currentStepId, 0) / rows.length) * 10) / 10
      : 0;
    return { gems, xp, avgStage, count: rows.length };
  }, [rows]);

  if (locked) {
    return (
      <div className="relative z-10 mx-auto flex min-h-dvh w-[min(560px,100%)] flex-col px-4 py-16">
        <div className="glass glass-glow my-auto rounded-[28px] p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-neon" />
          <p className="font-mono mt-4 text-[11px] tracking-[0.42em] text-neon">FORGE DESK</p>
          <h1 className="font-display mt-3 text-3xl tracking-tight">This desk is sealed</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Only a steward can inspect smiths and gem flow. Set{" "}
            <span className="font-mono text-ink/80">RUBYFORGE_ADMIN_HANDLES</span> or{" "}
            <span className="font-mono text-ink/80">isAdmin</span> on a smith file.
          </p>
          <Link href="/" className="ruby-btn mt-6 inline-flex rounded-full px-5 py-2.5 text-sm">
            Back to the path
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-dvh pb-16">
      <header className="hud-pill sticky top-4 z-30 mx-auto flex w-[min(1180px,calc(100%-1.5rem))] flex-wrap items-center gap-3 rounded-full px-5 py-2.5">
        <Link href="/" className="ghost-btn inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5 text-neon" />
          Path
        </Link>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-neon">RubyForge</p>
          <h1 className="font-display truncate text-lg leading-none tracking-tight">Forge Desk</h1>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
          className="ghost-btn ml-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-neon ${busy ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <section className="mx-auto mt-8 w-[min(1180px,100%)] px-4">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Every registered smith on this machine. Passwords are stored as scrypt hashes — this desk
          never shows a secret, only a short fingerprint of the digest.
        </p>
        {error && <p className="mt-3 text-sm text-amber">{error}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat icon={<Users className="h-4 w-4 text-neon" />} label="Smiths" value={totals.count} />
          <Stat icon={<Gem className="h-4 w-4 text-neon" />} label="Gems in play" value={totals.gems} />
          <Stat icon={<Shield className="h-4 w-4 text-amber" />} label="Total XP" value={totals.xp} />
          <Stat label="Avg station" value={totals.avgStage} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter handle, email, stage…"
            className="glass w-full rounded-full px-4 py-2.5 text-sm outline-none sm:max-w-sm"
          />
          <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Sort
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="glass rounded-full px-3 py-2 font-sans text-xs tracking-normal text-ink"
            >
              <option value="createdAt">Created</option>
              <option value="handle">Handle</option>
              <option value="currentStepId">Stage</option>
              <option value="gems">Gems</option>
              <option value="xp">XP</option>
            </select>
          </label>
        </div>

        <div className="glass mt-5 overflow-x-auto rounded-[24px]">
          <table className="min-w-[960px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                <th className="px-4 py-3 font-medium">Smith</th>
                <th className="px-4 py-3 font-medium">Credentials</th>
                <th className="px-4 py-3 font-medium">Station</th>
                <th className="px-4 py-3 font-medium">Gems</th>
                <th className="px-4 py-3 font-medium">XP</th>
                <th className="px-4 py-3 font-medium">Tokens</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No smiths match that filter.
                  </td>
                </tr>
              )}
              {filtered.map((row) => (
                <tr key={row.accountId} className="border-t border-white/10">
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-display tracking-tight">{row.handle ?? "Unnamed"}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">{row.accountId}</p>
                    {row.isAdmin && (
                      <span className="mt-1 inline-block rounded-full border border-neon/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon">
                        Steward
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="text-ink/90">{row.email ?? "No email"}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      {row.authKind}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-ink/80">
                      {row.password.stored ? (
                        <>
                          scrypt · {row.password.fingerprint}
                          <span className="text-muted">…</span>
                        </>
                      ) : (
                        "Password not stored"
                      )}
                    </p>
                    {!row.onboardingComplete && (
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-amber">
                        Greeting pending
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-display">
                      {String(row.currentStepId).padStart(2, "0")} · {row.stageTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {row.completedCount}/{row.totalStages} clear
                      {row.phase ? ` · Phase ${row.phase}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="jewel-sheen font-display text-base leading-none">{row.gems}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                      Streak {row.streak}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-display">{row.xp}</p>
                    <p className="mt-0.5 text-xs text-muted">{rankTitle(row.xp)}</p>
                  </td>
                  <td className="px-4 py-3.5 align-top font-mono text-xs">{row.gitPushTokens}</td>
                  <td className="px-4 py-3.5 align-top text-xs text-muted">
                    <p>{formatWhen(row.createdAt)}</p>
                    <p className="mt-1">
                      Last heat: {row.lastCompletedAt ? formatWhen(row.lastCompletedAt) : "—"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <p className="font-mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted">
        {icon}
        {label}
      </p>
      <p className="font-display mt-1 text-2xl tracking-tight">{value}</p>
    </div>
  );
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
