import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { auth } from "@/auth";
import { SessionRoot } from "@/components/providers/SessionRoot";
import { ForgeProvider } from "@/components/providers/ForgeProvider";
import { MentorProvider } from "@/components/mentor/MentorProvider";
import { EmberCompanion } from "@/components/companion/EmberCompanion";
import { CrimsonBazaar } from "@/components/bazaar/CrimsonBazaar";
import { AuthGate } from "@/components/auth/AuthGate";
import { Atmosphere } from "@/components/fx/Atmosphere";
import { MotionRoot } from "@/components/fx/MotionRoot";
import "./globals.css";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RubyForge: The Crimson Path",
  description: "A local Ruby learning game — overworld map, mission arena, and a real CLI runtime.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden">
        <SessionRoot session={session}>
          <ForgeProvider>
            <MentorProvider>
              <Atmosphere />
              <MotionRoot>
                <AuthGate>
                  {children}
                  <CrimsonBazaar />
                  <EmberCompanion />
                </AuthGate>
              </MotionRoot>
            </MentorProvider>
          </ForgeProvider>
        </SessionRoot>
      </body>
    </html>
  );
}
