"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { error: err, data } = await signIn.email({
      email,
      password,
      callbackURL: from ?? "/dashboard",
    });

    if (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification",
        });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(err.message ?? "Sign in failed. Please try again.");
      setPending(false);
      return;
    }

    router.push(from ?? "/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="font-serif text-3xl font-light text-gate-white">
          Sign In
        </h1>
        <p className="text-sm font-light text-gate-white/45">
          Access your G.A.T.E. Olympiad account
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">
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

      <p className="text-center text-xs font-light text-gate-white/40">
        No account?{" "}
        <Link href="/register" className="text-gate-gold hover:underline">
          Apply Now
        </Link>
      </p>
    </form>
  );
}
