"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Server action: signs out the current user via better-auth.
 * Clears session cookies and redirects to home page.
 */
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
