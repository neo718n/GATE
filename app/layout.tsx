import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "G.A.T.E. Assessment",
    template: "%s · G.A.T.E. Assessment",
  },
  description:
    "Global Academic & Theoretical Excellence Assessment — an international academic assessment program with a Global Onsite Final hosted at Xidian University, Hangzhou Campus.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "G.A.T.E. Assessment",
    title: "G.A.T.E. Assessment",
    description:
      "Global Academic & Theoretical Excellence Assessment — an international academic assessment program with a Global Onsite Final hosted at Xidian University, Hangzhou Campus.",
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
    title: "G.A.T.E. Assessment",
    description:
      "Global Academic & Theoretical Excellence Assessment — an international academic assessment program.",
    images: ["/brand/GATE-Logo-Primary-Dark@2x.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
