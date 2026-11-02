import { Logo } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { CONTACT } from "@/lib/site";
import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { MAIN_URL } from "@/lib/portal-urls";

/** Header shared by the apply.* and partners.* portals. */
export async function PortalHeader({ label, right }: { label: { en: string; ru: string }; right?: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-4">
          <Link href={MAIN_URL} aria-label={locale === "ru" ? "G.A.T.E. — на главную" : "G.A.T.E. home"}>
            <Logo size="xs" variant="light" showTagline={false} />
          </Link>
          <span className="hidden h-5 w-px bg-line sm:block" />
          <span className="hidden text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-3 sm:block">{label[locale]}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {right ?? (
            <a
              href={CONTACT.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{locale === "ru" ? "Нужна помощь?" : "Need help?"}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export async function PortalFooter() {
  const ru = (await getLocale()) === "ru";
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-[12px] text-ink-3 sm:flex-row">
        <span>© {new Date().getFullYear()} G.A.T.E. · {ru ? "Оператор — EdSquare" : "Operated by EdSquare"}</span>
        <span className="flex gap-4">
          <Link href={`${MAIN_URL}/terms`} className="hover:text-ink">{ru ? "Условия" : "Terms"}</Link>
          <Link href={`${MAIN_URL}/privacy`} className="hover:text-ink">{ru ? "Конфиденциальность" : "Privacy"}</Link>
          <a href={CONTACT.email.href} className="hover:text-ink">{CONTACT.email.display}</a>
        </span>
      </div>
    </footer>
  );
}
