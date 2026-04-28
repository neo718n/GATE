"use client";

import { signOutAction } from "@/lib/actions/sign-out";

export function SignOutButton({
  className,
  children = "Sign Out",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
