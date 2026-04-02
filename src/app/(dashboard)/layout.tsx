import { AppShell } from "@/components/layout/app-shell";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}
