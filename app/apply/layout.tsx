import type { Metadata } from "next";
import { PortalFooter, PortalHeader } from "@/components/apply/portal-chrome";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const ru = (await getLocale()) === "ru";
  return ru
    ? { title: { default: "Заявка", template: "%s · Заявка · G.A.T.E." }, description: "Заявка на ближайшую программу G.A.T.E." }
    : { title: { default: "Apply", template: "%s · Apply · G.A.T.E." }, description: "Apply for the next G.A.T.E. program." };
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site flex min-h-screen flex-col">
      <PortalHeader label={{ en: "Application", ru: "Заявка" }} />
      <main className="flex-1">{children}</main>
      <PortalFooter />
    </div>
  );
}
