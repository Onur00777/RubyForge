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
    "Google login is not set up yet. You can still create an account with a username.",
  AccessDenied: "Google denied the request. Try another account, or sign in with your username.",
  OAuthCallback:
    "Google sign-in failed. Check the redirect URI, or use your username instead.",
  OAuthAccountNotLinked: "That Google account could not be linked. Sign in with the same account you used first.",
  CredentialsSignin: "Could not sign in with that username. Try a different name, or log in to an existing account.",
  Default: "Sign-in failed. Try again in a moment.",
};

export function ForgeGate({ googleConfigured }: { googleConfigured: boolean }) {
  return (
    <Suspense fallback={<ForgeSplash label="Loading…" />}>
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
          ? "That username is taken, or the password is too short."
          : "Wrong username or password.";
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
          <p className="font-mono text-[11px] tracking-[0.42em] text-neon">RUBYFORGE</p>
          <h1 className="font-display mt-3 text-5xl font-bold tracking-tight sm:text-6xl">Welcome</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Create an account to start from lesson 1, or log in to continue where you left off.
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
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neon">New account</p>
            <h2 className="font-display mt-2 text-2xl tracking-tight">Sign up</h2>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">
              Start from the first lesson. Your progress stays with this username.
            </p>
            <HandleForm
              kind="create"
              busy={busy === "create"}
              error={createError}
              submitLabel="Create account"
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
                {busy === "google-create" ? "Opening Google…" : "Or sign up with Google"}
              </button>
            )}
          </motion.section>

          <motion.section
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-[28px] p-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">Returning</p>
            <h2 className="font-display mt-2 text-2xl tracking-tight">Log in</h2>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">
              Use your username and password to open your saved progress.
            </p>
            <HandleForm
              kind="return"
              autoFocus={false}
              busy={busy === "return"}
              error={returnError}
              submitLabel="Log in"
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
