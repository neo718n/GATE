"use client";

import { useState, useRef, Fragment } from "react";
import { authClient, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function VerifyEmailForm({ email }: { email: string }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDone, setResendDone] = useState(false);
  const [verified, setVerified] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  async function verify(code: string) {
    setError(null);
    setPending(true);
    const { error: err } = await authClient.emailOtp.verifyEmail({ email, otp: code });
    if (err) {
      setError(err.message ?? "Invalid code. Please try again.");
      setPending(false);
      setDigits(Array(6).fill(""));
      setTimeout(() => refs.current[0]?.focus(), 0);
      return;
    }
    setVerified(true);

    const password = sessionStorage.getItem("gate_verify_pw");
    if (password) {
      sessionStorage.removeItem("gate_verify_pw");
      const { data } = await signIn.email({ email, password });
      const role = (data as any)?.user?.role ?? "participant";
      const ROLE_HOME: Record<string, string> = {
        super_admin: "/admin",
        admin: "/admin",
        coordinator: "/coordinator",
        partner_contact: "/partner",
      };
      setTimeout(() => { window.location.href = ROLE_HOME[role] ?? "/participant"; }, 1400);
    } else {
      setTimeout(() => { window.location.href = "/login?verified=1"; }, 1400);
    }
  }

  function onDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = digits.map((v, idx) => (idx === i ? d : v));
    setDigits(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (d && next.every(Boolean)) verify(next.join(""));
  }

  function onKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("").map((_, i) => raw[i] ?? "");
    setDigits(next);
    refs.current[Math.min(raw.length, 5)]?.focus();
    if (raw.length === 6) verify(raw);
  }

  async function resend() {
    setError(null);
    setResendDone(false);
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
    if (err) {
      setError(err.message ?? "Failed to send code. Please try again.");
      return;
    }
    setResendDone(true);
    setCountdown(60);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center border border-gate-gold/40 bg-gate-gold/5">
          <svg className="h-7 w-7 text-gate-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-light text-foreground">Email Verified</h2>
          <p className="text-sm font-light text-muted-foreground">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-light text-foreground">Verify Your Email</h1>
        <p className="text-sm font-light text-muted-foreground mt-1 leading-relaxed">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          {error}
        </p>
      )}

      {resendDone && !error && (
        <p className="text-xs text-gate-gold border border-gate-gold/20 bg-gate-gold/5 px-4 py-3">
          A new code has been sent to your email.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Verification Code
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Fragment key={i}>
              {i === 3 && (
                <span className="text-border shrink-0 select-none px-0.5">—</span>
              )}
              <input
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[i]}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                onPaste={i === 0 ? onPaste : undefined}
                disabled={pending}
                className="w-11 h-14 text-center text-xl font-light text-foreground border border-border bg-card focus:outline-none focus:border-gate-gold transition-colors disabled:opacity-40 shrink-0"
              />
            </Fragment>
          ))}
        </div>
      </div>

      <Button
        variant="gold"
        size="md"
        disabled={pending || !digits.every(Boolean)}
        onClick={() => verify(digits.join(""))}
      >
        {pending ? "Verifying…" : "Verify Email"}
      </Button>

      <p className="text-center text-xs font-light text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        {countdown > 0 ? (
          <span className="text-muted-foreground">Resend in {countdown}s</span>
        ) : (
          <button type="button" onClick={resend} className="text-gate-gold hover:underline">
            {resendDone ? "Resend again" : "Resend"}
          </button>
        )}
      </p>
    </div>
  );
}