import { headers } from "next/headers";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { CookieConsent } from "@/components/site/cookie-consent";
import { SmoothScroll } from "@/components/site/motion/smooth-scroll";
import { NotifyMeProvider } from "@/components/site/landing/notify-me";
import { getCurrentSession } from "@/lib/authz";
import { countryFromHeaders } from "@/lib/certificates/log";
import { getCountryByIso } from "@/lib/phone-codes";
import { getLocale } from "@/lib/i18n/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  const ru = (await getLocale()) === "ru";
  const headersList = await headers();
  const detectedIso = getCountryByIso(countryFromHeaders(headersList)).iso2;

  return (
    <div className="site flex min-h-screen flex-col">
      <SmoothScroll />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {ru ? "Перейти к содержимому" : "Skip to main content"}
      </a>
      <NotifyMeProvider defaultCountryIso={detectedIso}>
        <SiteNav session={session} />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
        <CookieConsent />
      </NotifyMeProvider>
    </div>
  );
}
