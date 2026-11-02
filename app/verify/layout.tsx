import { Logo } from "@/components/brand/logo";
import { LanguageMenu } from "@/components/site/language-switcher";
import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

export default async function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ru = (await getLocale()) === "ru";
  return (
    <div className="site min-h-dvh flex flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <Logo size="xs" variant="light" showTagline={false} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/40 hidden sm:inline">
              {ru ? "Портал проверки" : "Verification Portal"}
            </span>
            <LanguageMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-foreground/50">
          <p>{ru ? "Проверку обеспечивает G.A.T.E. Assessment Authority." : "Verification powered by G.A.T.E. Assessment Authority."}</p>
          <p className="font-mono">
            <Link href="/" className="hover:text-foreground transition-colors">
              gate-assessment.org
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
