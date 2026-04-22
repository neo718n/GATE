"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { error: err } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    });

    if (err) {
      setError(err.message ?? "Invalid code. Please try again.");
      setPending(false);
      return;
    }

    router.push("/participant");
  }

  async function handleResend() {
    setResendPending(true);
    setResendSuccess(false);
    setError(null);

    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    setResendPending(false);
    setResendSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="font-serif text-3xl font-light text-gate-white">
          Verify Your Email
        </h1>
        <p className="text-sm font-light text-gate-white/45">
          A 6-digit code was sent to{" "}
          <span className="text-gate-white/70">{email}</span>
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">
          {error}
        </p>
      )}

      {resendSuccess && (
        <p className="text-xs text-gate-gold/80 border border-gate-gold/20 bg-gate-gold/5 px-4 py-3">
          A new code has been sent to your email.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          required
          className="text-center tracking-[0.4em] text-lg"
        />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending || otp.length < 6} className="mt-1">
        {pending ? "Verifying…" : "Verify Email"}
      </Button>

      <p className="text-center text-xs font-light text-gate-white/40">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendPending}
          className="text-gate-gold hover:underline disabled:opacity-50"
        >
          {resendPending ? "Sending…" : "Resend"}
        </button>
      </p>
    </form>
  );
}
