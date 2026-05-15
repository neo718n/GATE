"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, authClient } from "@/lib/auth-client";
import { consumePendingProgramRedirect } from "@/lib/actions/pending-program";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  coordinator: "/coordinator",
  partner_contact: "/partner",
  participant: "/participant",
  question_provider: "/qp",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const verified = searchParams.get("verified") === "1";
  const prefilledEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { error: err, data } = await signIn.email({
        email,
        password,
        callbackURL: from ?? "/participant",
      });

      if (err) {
        if (err.code === "EMAIL_NOT_VERIFIED") {
          await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "email-verification",
          });
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
          return;
        }
        setError(err.message ?? "Sign in failed. Please try again.");
        setPending(false);
        return;
      }

      if (from) {
        window.location.href = from;
        return;
      }

      const pendingDest = await consumePendingProgramRedirect();
      if (pendingDest) {
        window.location.href = pendingDest;
        return;
      }

      const role = (data as unknown as { user?: { role?: string } })?.user?.role ?? "participant";
      window.location.href = ROLE_HOME[role] ?? "/participant";
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-1">
        <h1 className="font-serif text-3xl font-light text-foreground">
          Sign In
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Access your G.A.T.E. Assessment account
        </p>
      </div>

      {verified && !error && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800/40 dark:bg-green-900/20">
          <p className="text-xs text-green-700 dark:text-green-400">
            Email verified. Sign in to continue.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="lena.mueller@gymnasium.de"
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
        {pending ? "Signing in…" : "Sign In"}
      </Button>

      <p className="text-center text-xs font-light text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="text-gate-gold hover:underline font-medium">
          Apply Now
        </Link>
      </p>
    </form>
  );
}
