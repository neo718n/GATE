"use client";

// Styled after Watermelon UI's nested-card blocks: a soft ivory shell around a
// white card, rising in on a spring.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { Link, useLocale } from "@/lib/i18n/client";
import { MAIN_URL } from "@/lib/portal-urls";

// Accepting is remembered for a year in a cookie shared by every subdomain
// (main site, apply., partners.). Declining only hides the banner for the
// current browser session, so it comes back on the next visit.
const CONSENT_COOKIE = "gate_consent";
const DISMISSED_KEY = "gate_consent_dismissed";

const T = {
  en: {
    title: "We use cookies",
    body: "Only what the site needs to work — keeping you signed in and remembering your language. No advertising trackers.",
    more: "Privacy policy",
    decline: "Decline",
    accept: "Accept",
    label: "Cookie consent",
  },
  ru: {
    title: "Мы используем cookie",
    body: "Только необходимые для работы сайта — чтобы вы оставались в аккаунте и сайт помнил выбранный язык. Никаких рекламных трекеров.",
    more: "Политика конфиденциальности",
    decline: "Отклонить",
    accept: "Принять",
    label: "Согласие на cookie",
  },
};

function hasAccepted() {
  return document.cookie.split("; ").some((c) => c === `${CONSENT_COOKIE}=accepted`);
}

function dismissedThisSession() {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function CookieConsent() {
  const t = T[useLocale()];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (hasAccepted() || dismissedThisSession()) return;
    // Let the page settle first so the banner doesn't compete with the hero.
    const id = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(id);
  }, []);

  // Unmount shortly after the exit animation even if it never reports
  // completion (background tabs throttle animation frames), so an invisible
  // banner can never sit over the page and swallow clicks.
  const close = () => {
    setOpen(false);
    setTimeout(() => setMounted(false), 700);
  };

  const accept = () => {
    const domain = window.location.hostname.endsWith("gate-assessment.org") ? "; domain=.gate-assessment.org" : "";
    document.cookie = `${CONSENT_COOKIE}=accepted; path=/; max-age=31536000; samesite=lax${domain}`;
    close();
  };

  const decline = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Private mode without storage: the banner simply returns on reload.
    }
    close();
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={t.label}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97, pointerEvents: "none" }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[25rem]"
        >
          <div className="rounded-[1.75rem] bg-ivory-2 p-1.5 shadow-[0_30px_70px_-25px_rgba(11,31,58,0.45)] ring-1 ring-ink/5">
            <div className="flex flex-col gap-4 rounded-[1.4rem] bg-white p-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gate-gold/15 text-gate-gold">
                  <Cookie className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-serif text-xl font-medium leading-tight text-ink">{t.title}</p>
                  <p className="text-[13px] leading-relaxed text-ink-2">
                    {t.body}{" "}
                    <Link href={`${MAIN_URL}/privacy`} className="font-semibold text-ink underline underline-offset-2 hover:text-gate-gold">
                      {t.more}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={decline}
                  className="h-11 rounded-full border border-ink/15 text-[13px] font-semibold text-ink-2 transition-colors hover:border-ink/30 hover:text-ink"
                >
                  {t.decline}
                </button>
                <button
                  type="button"
                  onClick={accept}
                  className="h-11 rounded-full bg-ink text-[13px] font-semibold text-ivory shadow-[0_10px_24px_-12px_rgba(11,31,58,0.6)] transition-colors hover:bg-gate-700"
                >
                  {t.accept}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
