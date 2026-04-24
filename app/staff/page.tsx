import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { getCurrentSession, ROLE_HOME } from "@/lib/authz";
import { StaffLoginForm } from "./staff-login-form";

export const metadata: Metadata = {
  title: "Staff Portal",
};

export default async function StaffPage() {
  const session = await getCurrentSession();
  if (session?.user) {
    const role = (session.user as { role?: string }).role ?? "";
    const dest = ROLE_HOME[role as keyof typeof ROLE_HOME];
    if (dest && role !== "participant") redirect(dest);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gate-fog/30 px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <Link href="/">
          <Logo size="sm" variant="light" showTagline={false} />
        </Link>
        <StaffLoginForm />
      </div>
    </div>
  );
}
