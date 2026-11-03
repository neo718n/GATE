import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { SEO_KEYWORDS, SITE_URL } from "@/lib/site";
import { getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const DESCRIPTION =
  "G.A.T.E. (GATE) is an international academic program for students in Grades 1–12: a week at a Chinese university with an academic assessment graded by professors, lectures, campus life and cultural excursions.";

export const metadata: Metadata = {
  title: {
    default: "G.A.T.E. — GATE Academic Programs for Students",
    template: "%s · G.A.T.E.",
  },
  description: DESCRIPTION,
  applicationName: "G.A.T.E.",
  keywords: SEO_KEYWORDS,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "G.A.T.E. Assessment",
    title: "G.A.T.E. — GATE Academic Programs for Students",
    description: DESCRIPTION,
    images: [
      {
        url: "/brand/GATE-Logo-Primary-Dark@2x.png",
        width: 1800,
        height: 460,
        alt: "G.A.T.E. Assessment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "G.A.T.E. — GATE Academic Programs for Students",
    description: DESCRIPTION,
    images: ["/brand/GATE-Logo-Primary-Dark@2x.png"],
  },
  // Search Console / Yandex Webmaster ownership tags. Set the codes as Vercel
  // env vars; a missing variable simply omits its tag.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.YANDEX_VERIFICATION || undefined,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${montserrat.variable} ${cormorant.variable} h-full antialiased`}
    >

      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-background text-foreground"
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gate-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})()`,
          }}
        />
        <LocaleProvider locale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
