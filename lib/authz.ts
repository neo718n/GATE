import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./db/schema";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(allowed: Role | Role[]) {
  const session = await requireSession();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  const role = (session.user as { role?: Role }).role ?? "participant";
  if (!allowedList.includes(role)) redirect("/");
  return session;
}

export const ROLE_HOME: Record<Role, string> = {
  super_admin: "/admin",
  admin: "/admin",
  coordinator: "/coordinator",
  participant: "/participant",
  partner_contact: "/partner",
  career_applicant: "/dashboard",
};
