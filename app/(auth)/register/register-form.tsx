"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { error: err } = await signUp.email({
        email: form.email,
        password: form.password,
        name: `${form.firstName} ${form.lastName}`.trim(),
      });

      if (err) {
        setError(err.message ?? "Registration failed. Please try again.");
        setPending(false);
        return;
      }

      await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
        type: "email-verification",
      });

      sessionStorage.setItem("gate_verify_pw", form.password);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="font-serif text-3xl font-light text-gate-800">
          Apply Now
        </h1>
        <p className="text-sm font-light text-gate-800/65">
          Create your G.A.T.E. Assessment account
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 border border-red-200 bg-red-50 px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="Jane"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={set("lastName")}
            placeholder="Smith"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={form.country}
          onChange={set("country")}
          placeholder="e.g. United States"
          autoComplete="country-name"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
        {pending ? "Creating account…" : "Create Account"}
      </Button>

      <p className="text-center text-xs font-light text-gate-800/60">
        Already have an account?{" "}
        <Link href="/login" className="text-gate-gold hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
