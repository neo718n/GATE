"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  coordinator: "/coordinator",
  partner_contact: "/partner",
  participant: "/participant",
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

      const role = (data as any)?.user?.role ?? "participant";
      window.location.href = ROLE_HOME[role] ?? "/participant";
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="font-serif text-3xl font-light text-gate-800">
          Sign In
        </h1>
        <p className="text-sm font-light text-gate-800/65">
          Access your G.A.T.E. Assessment account
        </p>
      </div>

      {verified && !error && (
        <p className="text-xs text-green-700 border border-green-200 bg-green-50 px-4 py-3">
          Email verified. Sign in to continue.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 border border-red-200 bg-red-50 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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

      <Button type="submit" variant="gold" size="md" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </Button>

      <p className="text-center text-xs font-light text-gate-800/60">
        No account?{" "}
        <Link href="/register" className="text-gate-gold hover:underline">
          Apply Now
        </Link>
      </p>
    </form>
  );
}
