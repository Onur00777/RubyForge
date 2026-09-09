import type { Metadata } from "next";
import { canAccessAdmin, listAdminRoster } from "@/lib/admin";
import { readSmith } from "@/lib/ledger";
import { getSmith } from "@/lib/session";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Forge Desk · RubyForge",
  description: "Registered smiths, curriculum progress, and gem flow.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const smith = await getSmith();
  if (!smith) return null;

  const player = await readSmith(smith);
  if (!(await canAccessAdmin(player))) {
    return <AdminDashboard locked />;
  }

  const users = await listAdminRoster();
  return <AdminDashboard users={users} />;
}
