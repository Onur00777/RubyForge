"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GoogleMark } from "./GoogleMark";
import { ForgeSplash } from "./ForgeSplash";
import { HandleForm } from "./HandleForm";

const OAUTH_ERRORS: Record<string, string> = {
  Configuration:
    "Google login is not configured yet. You can still enter with a handle on this forge.",
  AccessDenied: "Google denied the request. Try another account, or enter with your handle instead.",
  OAuthCallback:
    "Google came back empty. Check the redirect URI, or enter with a handle instead.",
  OAuthAccountNotLinked: "That Google account could not be linked. Sign in with the same account you used first.",
  CredentialsSignin: "That handle could not be bound. Try a different name, or enter an existing one.",
  Default: "Sign-in failed. Try again in a moment.",
};

export function ForgeGate({ googleConfigured }: { googleConfigured: boolean }) {
  return (
    <Suspense fallback={<ForgeSplash label="LINKING THE FORGE" />}>
      <ForgeGateInner googleConfigured={googleConfigured} />
    </Suspense>
  );
}

function ForgeGateInner({ googleConfigured }: { googleConfigured: boolean }) {
  const params = useSearchParams();
  const oauthError = params.get("error");
  const [busy, setBusy] = useState<"create" | "return" | "google-create" | "google-return" | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);

  const enterLocal = async (mode: "create" | "return", handle: string, passphrase: string) => {
    if (busy) return;
    setBusy(mode);
    if (mode === "create") setCreateError(null);
    else setReturnError(null);
    const result = await signIn("forge", {
      handle,
      passphrase,
      mode,
      redirect: false,
      callbackUrl: "/",
    });
    if (result?.error) {
      const message =
        mode === "create"
          ? "That handle is taken or the passphrase is too short."
          : "No smith with that handle, or the passphrase is wrong.";
      if (mode === "create") setCreateError(message);
      else setReturnError(message);
      setBusy(null);
      return;
    }
    window.location.assign("/");
  };

  const enterGoogle = (mode: "google-create" | "google-return") => {
    if (!googleConfigured || busy) return;
    setBusy(mode);
    void signIn("google", { callbackUrl: "/" });
  };

  const message = oauthError ? (OAUTH_ERRORS[oauthError] ?? OAUTH_ERRORS.Default) : null;

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-[min(920px,100%)] flex-col px-4 py-10">
      <div className="my-auto">
        <div className="mb-10 text-center">
          <p className="font-mono text-[11px] tracking-[0.42em] text-neon">THE CRIMSON PATH</p>
          <h1 className="font-display mt-3 text-5xl font-bold tracking-tight sm:text-6xl">Bind a smith</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Pick a handle and a passphrase. Create always starts at Stage 01. Enter loads only that
            smith — never someone else's path.
          </p>
        </div>

        {message && (
          <p className="glass glass-glow mx-auto mb-6 max-w-xl rounded-2xl px-4 py-3 text-center text-sm text-amber">
            {message}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.section
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass glass-glow rounded-[28px] p-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neon">New ledger</p>
            <h2 className="font-display mt-2 text-2xl tracking-tight">Create a smith</h2>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">
              First strike. A new ledger from Stage 01 — gems, stages, and drafts belong only to this
              handle.
            </p>
            <HandleForm
              kind="create"
              busy={busy === "create"}
              error={createError}
              submitLabel="Strike the forge"
              onSubmit={({ handle, passphrase }) => void enterLocal("create", handle, passphrase)}
            />
            {googleConfigured && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => enterGoogle("google-create")}
                className="google-btn mt-3 flex w-full items-center justify-center gap-3 rounded-full px-4 py-3 text-sm font-medium"
              >
                <GoogleMark className="h-5 w-5" />
                {busy === "google-create" ? "Opening Google…" : "Or create with Google"}
              </button>
            )}
          </motion.section>

          <motion.section
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-[28px] p-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">Existing ledger</p>
            <h2 className="font-display mt-2 text-2xl tracking-tight">Enter the forge</h2>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">
              Same handle and passphrase. Only that smith's gems, stages, and bazaar kit.
            </p>
            <HandleForm
              kind="return"
              autoFocus={false}
              busy={busy === "return"}
              error={returnError}
              submitLabel="Enter the forge"
              onSubmit={({ handle, passphrase }) => void enterLocal("return", handle, passphrase)}
            />
            {googleConfigured && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => enterGoogle("google-return")}
                className="google-btn mt-3 flex w-full items-center justify-center gap-3 rounded-full px-4 py-3 text-sm font-medium"
              >
                <GoogleMark className="h-5 w-5" />
                {busy === "google-return" ? "Opening Google…" : "Or sign in with Google"}
              </button>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
