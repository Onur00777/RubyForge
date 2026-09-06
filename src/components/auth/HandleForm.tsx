"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HANDLE_MAX, handleError, normalizeHandle } from "@/lib/handle";
import { PASS_MAX, passError } from "@/lib/passphrase";

export function HandleForm({
  initial = "",
  busy,
  error,
  submitLabel,
  autoFocus = true,
  kind = "handle",
  onSubmit,
}: {
  initial?: string;
  busy?: boolean;
  error?: string | null;
  submitLabel: string;
  autoFocus?: boolean;
  kind?: "handle" | "create" | "return";
  onSubmit: (payload: { handle: string; passphrase: string }) => void;
}) {
  const [value, setValue] = useState(initial);
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const withPass = kind !== "handle";
  const local = handleError(value) ?? (withPass ? passError(passphrase) : null);
  const mismatch = kind === "create" && passphrase && confirm !== passphrase;
  const handle = normalizeHandle(value);
  const blocked = Boolean(local) || Boolean(mismatch) || busy;

  useEffect(() => {
    setValue((current) => (current.trim() ? current : initial));
  }, [initial]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (blocked) return;
    onSubmit({ handle, passphrase });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">Username</span>
        <input
          autoFocus={autoFocus}
          value={value}
          maxLength={HANDLE_MAX}
          onChange={(event) => setValue(event.target.value)}
          placeholder="yourname"
          autoComplete="username"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-display text-lg tracking-tight outline-none transition focus:border-neon/50"
        />
      </label>
      {withPass && (
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">Password</span>
          <input
            type="password"
            value={passphrase}
            maxLength={PASS_MAX}
            onChange={(event) => setPassphrase(event.target.value)}
            placeholder="••••"
            autoComplete={kind === "create" ? "new-password" : "current-password"}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-display text-lg tracking-tight outline-none transition focus:border-neon/50"
          />
        </label>
      )}
      {kind === "create" && (
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">Confirm password</span>
          <input
            type="password"
            value={confirm}
            maxLength={PASS_MAX}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="••••"
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-display text-lg tracking-tight outline-none transition focus:border-neon/50"
          />
        </label>
      )}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <span>{handle.length}/{HANDLE_MAX}</span>
        <span className="text-ink">{handle || "—"}</span>
      </div>
      {(error || (value.trim() && local) || mismatch) && (
        <p className="text-sm text-amber">{error ?? local ?? "Passwords do not match."}</p>
      )}
      <button
        type="submit"
        disabled={blocked}
        className="ruby-btn font-display w-full rounded-full px-5 py-3 text-sm tracking-wide"
      >
        {busy ? (kind === "create" ? "Creating…" : kind === "return" ? "Signing in…" : "Saving…") : submitLabel}
      </button>
    </form>
  );
}
