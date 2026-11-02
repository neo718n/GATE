import type { Metadata } from "next";
import { RepShell } from "@/components/rep/rep-shell";
import { requireRep } from "@/lib/reps/auth";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getLocale()) === "ru" ? "Партнёрам" : "Partners", robots: { index: false } };
}

export default async function RepAppLayout({ children }: { children: React.ReactNode }) {
  const rep = await requireRep();
  return <RepShell rep={{ name: rep.name, email: rep.email, organization: rep.organization }}>{children}</RepShell>;
}
