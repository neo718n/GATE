import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalFooter, PortalHeader } from "@/components/apply/portal-chrome";
import { localizePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { getRepSession } from "@/lib/reps/auth";
import { RepSignIn } from "./sign-in";

export async function generateMetadata(): Promise<Metadata> {
  const ru = (await getLocale()) === "ru";
  return { title: ru ? "Вход для партнёров" : "Partner sign-in", robots: { index: false } };
}

export default async function RepSignInPage() {
  if (await getRepSession()) redirect(localizePath("/dashboard", await getLocale()));

  return (
    <div className="site flex min-h-screen flex-col">
      <PortalHeader label={{ en: "Partners", ru: "Партнёрам" }} />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
        <div className="gold-aura pointer-events-none absolute inset-0" />
        <div className="tech-grid pointer-events-none absolute inset-0" />
        <div className="relative w-full max-w-md">
          <RepSignIn />
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
