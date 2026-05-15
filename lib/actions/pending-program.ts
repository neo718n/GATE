"use server";

import { cookies } from "next/headers";
import { PENDING_PROGRAM_COOKIE, PENDING_PROGRAM_COOKIE_MAX_AGE_SEC } from "@/lib/program-cta";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function setPendingProgramCookie(slug: string): Promise<void> {
  if (!slug || !SLUG_PATTERN.test(slug)) return;
  const jar = await cookies();
  jar.set({
    name: PENDING_PROGRAM_COOKIE,
    value: slug,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_PROGRAM_COOKIE_MAX_AGE_SEC,
  });
}

export async function consumePendingProgramRedirect(): Promise<string | null> {
  const jar = await cookies();
  const slug = jar.get(PENDING_PROGRAM_COOKIE)?.value ?? null;
  jar.delete(PENDING_PROGRAM_COOKIE);
  if (!slug || !SLUG_PATTERN.test(slug)) return null;
  return `/participant/enrollment?program=${encodeURIComponent(slug)}`;
}
