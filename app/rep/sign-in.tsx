"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { OTPInput, type SlotProps } from "input-otp";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { inputClass } from "@/components/apply/fields";
import { repRequestCode, repVerifyCode } from "@/lib/actions/applications";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";
import { localizePath } from "@/lib/i18n/config";

const T = {
  en: {
    invalidEmail: "Enter a valid email address.",
    rateLimited: "Too many codes requested. Please wait a few minutes and try again.",
    sendFailed: "We couldn't send the email. Please try again.",
    tooMany: "Too many attempts. Request a new code.",
    expired: "This code has expired. Request a new one.",
    wrong: "That code isn't right. Check the email and try again.",
    eyebrow: "Partner sign-in",
    welcome: "Welcome back",
    lead: "Enter the email registered with G.A.T.E. We'll send you a one-time code.",
    send: "Send code",
    change: "Change email",
    check: "Check your email",
    sent: "We sent a 6-digit code to",
    expiresIn: "It expires in 10 minutes.",
    resend: "Send a new code",
    access: "Partner access",
    notListed: "This email isn't registered as a partner yet",
    notListedLead: "Interested in representing G.A.T.E. in your country? Message us on WhatsApp and we'll set up your partner access.",
    waText: "Hello! I'd like to become a G.A.T.E. partner representative.",
    wa: "Contact us on WhatsApp",
    other: "Try a different email",
  },
  ru: {
    invalidEmail: "Проверьте адрес электронной почты.",
    rateLimited: "Слишком много запросов кода. Подождите несколько минут и попробуйте снова.",
    sendFailed: "Не удалось отправить письмо. Попробуйте ещё раз.",
    tooMany: "Слишком много попыток. Запросите новый код.",
    expired: "Срок действия кода истёк. Запросите новый.",
    wrong: "Код неверный. Проверьте письмо и попробуйте ещё раз.",
    eyebrow: "Вход для партнёров",
    welcome: "С возвращением",
    lead: "Укажите почту, зарегистрированную в G.A.T.E. Мы пришлём одноразовый код.",
    send: "Получить код",
    change: "Изменить почту",
    check: "Проверьте почту",
    sent: "Мы отправили 6-значный код на",
    expiresIn: "Он действует 10 минут.",
    resend: "Отправить новый код",
    access: "Доступ для партнёров",
    notListed: "Эта почта пока не зарегистрирована как партнёрская",
    notListedLead: "Хотите представлять G.A.T.E. в своей стране? Напишите нам в WhatsApp — и мы откроем вам доступ.",
    waText: "Здравствуйте! Хочу стать представителем G.A.T.E.",
    wa: "Написать в WhatsApp",
    other: "Попробовать другую почту",
  },
};

// Code slots styled after Watermelon UI "Input OTP 10": two groups of three
// with a dot between them.
function Slot({ char, hasFakeCaret, isActive }: SlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-12 items-center justify-center rounded-2xl border bg-white font-serif text-2xl text-ink transition-all",
        isActive ? "border-gate-gold shadow-[0_0_0_4px_rgba(201,153,58,0.18)]" : "border-ink/10",
      )}
    >
      {char}
      {hasFakeCaret && <span className="absolute h-6 w-px animate-pulse bg-ink" />}
    </div>
  );
}

export function RepSignIn() {
  const router = useRouter();
  const locale = useLocale();
  const t = T[locale];
  const [stage, setStage] = useState<"email" | "code" | "not_listed">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const sendCode = () => {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.invalidEmail);
    start(async () => {
      const res = await repRequestCode(email);
      if (res.ok) setStage("code");
      else if (res.reason === "not_listed") setStage("not_listed");
      else if (res.reason === "rate_limited") setError(t.rateLimited);
      else setError(t.sendFailed);
    });
  };

  const verify = (value: string) => {
    setError(null);
    start(async () => {
      const res = await repVerifyCode(email, value);
      if (res.ok) {
        router.replace(localizePath("/dashboard", locale));
        router.refresh();
      } else {
        setCode("");
        setError(
          res.reason === "too_many_attempts"
            ? t.tooMany
            : res.reason === "expired"
              ? t.expired
              : t.wrong,
        );
      }
    });
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-line bg-white p-8 shadow-[0_40px_80px_-40px_rgba(11,31,58,0.45)] md:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "email" && (
          <motion.div key="email" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold">{t.eyebrow}</span>
              <h1 className="font-serif text-4xl font-medium text-ink">{t.welcome}</h1>
              <p className="text-[14px] leading-relaxed text-ink-2">{t.lead}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendCode();
              }}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  type="email"
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className={cn(inputClass(!!error), "pl-11")}
                />
              </div>
              {error && <p className="text-[13px] font-medium text-[#b03030]">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-semibold text-ivory transition-colors hover:bg-gate-700 disabled:opacity-70"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {t.send}
              </button>
            </form>
          </motion.div>
        )}

        {stage === "code" && (
          <motion.div key="code" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-6">
            <button type="button" onClick={() => setStage("email")} className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> {t.change}
            </button>
            <div className="flex flex-col gap-2">
              <h1 className="font-serif text-4xl font-medium text-ink">{t.check}</h1>
              <p className="text-[14px] leading-relaxed text-ink-2">
                {t.sent} <strong className="text-ink">{email}</strong>. {t.expiresIn}
              </p>
            </div>
            <OTPInput
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={verify}
              autoFocus
              inputMode="numeric"
              containerClassName="flex items-center justify-center gap-2"
              render={({ slots }) => (
                <>
                  <div className="flex gap-2">{slots.slice(0, 3).map((s, i) => <Slot key={i} {...s} />)}</div>
                  <span className="h-2 w-2 rounded-full bg-gate-gold" />
                  <div className="flex gap-2">{slots.slice(3).map((s, i) => <Slot key={i} {...s} />)}</div>
                </>
              )}
            />
            <div className="flex min-h-6 items-center justify-center">
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin text-ink-3" />
              ) : error ? (
                <p className="text-center text-[13px] font-medium text-[#b03030]">{error}</p>
              ) : null}
            </div>
            <button type="button" onClick={sendCode} disabled={pending} className="text-[13px] font-semibold text-gate-gold hover:underline">
              {t.resend}
            </button>
          </motion.div>
        )}

        {stage === "not_listed" && (
          <motion.div key="nl" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold">{t.access}</span>
              <h1 className="font-serif text-3xl font-medium leading-tight text-ink">{t.notListed}</h1>
              <p className="text-[14px] leading-relaxed text-ink-2">
                {t.notListedLead}
              </p>
            </div>
            <a
              href={`${CONTACT.whatsapp.href}?text=${encodeURIComponent(t.waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="h-5 w-5" /> {t.wa}
            </a>
            <button type="button" onClick={() => setStage("email")} className="text-[13px] font-semibold text-ink-3 hover:text-ink">
              {t.other}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
