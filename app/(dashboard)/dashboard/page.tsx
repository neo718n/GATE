import { redirect } from "next/navigation";
import { requireSession } from "@/lib/authz";
import { ROLE_HOME } from "@/lib/authz";

export default async function DashboardPage() {
  const session = await requireSession();
  const role = ((session.user as { role?: string }).role ?? "participant") as keyof typeof ROLE_HOME;
  redirect(ROLE_HOME[role] ?? "/participant");
}
