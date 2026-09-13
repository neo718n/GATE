import { headers } from "next/headers";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { NotifyMeProvider } from "@/components/site/landing/notify-me";
import { getCurrentSession } from "@/lib/authz";
import { countryFromHeaders } from "@/lib/certificates/log";
import { getCountryByIso } from "@/lib/phone-codes";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  const headersList = await headers();
  const detectedIso = getCountryByIso(countryFromHeaders(headersList)).iso2;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <NotifyMeProvider defaultCountryIso={detectedIso}>
        <SiteNav session={session} />
        <main id="main-content" className="flex-1 pt-16">{children}</main>
        <SiteFooter />
      </NotifyMeProvider>
    </div>
  );
}
