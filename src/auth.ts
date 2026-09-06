import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createLocalSmith, returnLocalSmith } from "@/lib/ledger";

function googleReady() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "rubyforge-dev-auth-secret-not-for-production"),
  providers: [
    Credentials({
      id: "forge",
      name: "Forge",
      credentials: {
        handle: { label: "Username", type: "text" },
        passphrase: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(credentials) {
        const handle = typeof credentials?.handle === "string" ? credentials.handle : "";
        const passphrase = typeof credentials?.passphrase === "string" ? credentials.passphrase : "";
        const mode = credentials?.mode === "return" ? "return" : "create";
        try {
          const smith =
            mode === "return"
              ? await returnLocalSmith(handle, passphrase)
              : await createLocalSmith(handle, passphrase);
          return { id: smith.id, name: smith.handle, email: null };
        } catch {
          return null;
        }
      },
    }),
    ...(googleReady()
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    jwt({ token, user, account, profile }) {
      if (user?.id) token.sub = user.id;
      if (account?.provider === "google" && profile && "sub" in profile && typeof profile.sub === "string") {
        token.sub = profile.sub;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
}));
