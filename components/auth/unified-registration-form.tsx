"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp, authClient, signIn } from "@/lib/auth-client";
import { registerUser } from "@/lib/actions/auth-actions";
import { setPendingProgramCookie } from "@/lib/actions/pending-program";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/data/countries";

const PHONE_CODES = [
  { country: "Uzbekistan", dial: "+998", flag: "🇺🇿", iso: "UZ" },
  { country: "Kazakhstan", dial: "+7 (KZ)", flag: "🇰🇿", iso: "KZ" },
  { country: "Russia", dial: "+7 (RU)", flag: "🇷🇺", iso: "RU" },
  { country: "United States", dial: "+1 (US)", flag: "🇺🇸", iso: "US" },
  { country: "Canada", dial: "+1 (CA)", flag: "🇨🇦", iso: "CA" },
  { country: "United Kingdom", dial: "+44", flag: "🇬🇧", iso: "GB" },
  { country: "Germany", dial: "+49", flag: "🇩🇪", iso: "DE" },
  { country: "France", dial: "+33", flag: "🇫🇷", iso: "FR" },
  { country: "Azerbaijan", dial: "+994", flag: "🇦🇿", iso: "AZ" },
  { country: "Kyrgyzstan", dial: "+996", flag: "🇰🇬", iso: "KG" },
  { country: "Tajikistan", dial: "+992", flag: "🇹🇯", iso: "TJ" },
  { country: "Turkmenistan", dial: "+993", flag: "🇹🇲", iso: "TM" },
  { country: "Georgia", dial: "+995", flag: "🇬🇪", iso: "GE" },
  { country: "Armenia", dial: "+374", flag: "🇦🇲", iso: "AM" },
  { country: "Ukraine", dial: "+380", flag: "🇺🇦", iso: "UA" },
  { country: "Belarus", dial: "+375", flag: "🇧🇾", iso: "BY" },
  { country: "Poland", dial: "+48", flag: "🇵🇱", iso: "PL" },
  { country: "Turkey", dial: "+90", flag: "🇹🇷", iso: "TR" },
  { country: "South Korea", dial: "+82", flag: "🇰🇷", iso: "KR" },
  { country: "China", dial: "+86", flag: "🇨🇳", iso: "CN" },
  { country: "Japan", dial: "+81", flag: "🇯🇵", iso: "JP" },
  { country: "India", dial: "+91", flag: "🇮🇳", iso: "IN" },
  { country: "Pakistan", dial: "+92", flag: "🇵🇰", iso: "PK" },
  { country: "Indonesia", dial: "+62", flag: "🇮🇩", iso: "ID" },
  { country: "Malaysia", dial: "+60", flag: "🇲🇾", iso: "MY" },
  { country: "Singapore", dial: "+65", flag: "🇸🇬", iso: "SG" },
  { country: "Thailand", dial: "+66", flag: "🇹🇭", iso: "TH" },
  { country: "Vietnam", dial: "+84", flag: "🇻🇳", iso: "VN" },
  { country: "Philippines", dial: "+63", flag: "🇵🇭", iso: "PH" },
  { country: "UAE", dial: "+971", flag: "🇦🇪", iso: "AE" },
  { country: "Saudi Arabia", dial: "+966", flag: "🇸🇦", iso: "SA" },
  { country: "Iran", dial: "+98", flag: "🇮🇷", iso: "IR" },
  { country: "Egypt", dial: "+20", flag: "🇪🇬", iso: "EG" },
  { country: "South Africa", dial: "+27", flag: "🇿🇦", iso: "ZA" },
  { country: "Nigeria", dial: "+234", flag: "🇳🇬", iso: "NG" },
  { country: "Kenya", dial: "+254", flag: "🇰🇪", iso: "KE" },
  { country: "Ethiopia", dial: "+251", flag: "🇪🇹", iso: "ET" },
  { country: "Brazil", dial: "+55", flag: "🇧🇷", iso: "BR" },
  { country: "Mexico", dial: "+52", flag: "🇲🇽", iso: "MX" },
  { country: "Argentina", dial: "+54", flag: "🇦🇷", iso: "AR" },
  { country: "Colombia", dial: "+57", flag: "🇨🇴", iso: "CO" },
  { country: "Australia", dial: "+61", flag: "🇦🇺", iso: "AU" },
  { country: "Romania", dial: "+40", flag: "🇷🇴", iso: "RO" },
  { country: "Czech Republic", dial: "+420", flag: "🇨🇿", iso: "CZ" },
  { country: "Hungary", dial: "+36", flag: "🇭🇺", iso: "HU" },
  { country: "Mongolia", dial: "+976", flag: "🇲🇳", iso: "MN" },
  { country: "Afghanistan", dial: "+93", flag: "🇦🇫", iso: "AF" },
];

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Grade ${i + 1}`,
}));

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function UnifiedRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingProgram = searchParams?.get("program") ?? null;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phoneCode: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    school: "",
    grade: "",
    gender: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [resendDone, setResendDone] = useState(false);
  const [verified, setVerified] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function verify(code: string) {
    setError(null);
    setPending(true);
    const { error: err } = await authClient.emailOtp.verifyEmail({ email: form.email, otp: code });
    if (err) {
      setError(err.message ?? "Invalid code. Please try again.");
      setPending(false);
      setDigits(Array(6).fill(""));
      setTimeout(() => refs.current[0]?.focus(), 0);
      return;
    }
    setVerified(true);

    const { data } = await signIn.email({ email: form.email, password: form.password });
    const role = (data as unknown as { user?: { role?: string } })?.user?.role ?? "participant";
    const ROLE_HOME: Record<string, string> = {
      super_admin: "/admin",
      admin: "/admin",
      coordinator: "/coordinator",
      partner_contact: "/partner",
    };
    setTimeout(() => { window.location.href = ROLE_HOME[role] ?? "/participant"; }, 1400);
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
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email: form.email, type: "email-verification" });
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

  // Auto-populate phone code when country changes
  useEffect(() => {
    if (form.country) {
      const matchedPhone = PHONE_CODES.find((p) => p.iso === form.country);
      if (matchedPhone) {
        setForm((prev) => ({ ...prev, phoneCode: matchedPhone.dial }));
      }
    }
  }, [form.country]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      // Combine phoneCode + phone into E.164 format
      const fullPhone = `${form.phoneCode}${form.phone}`.replace(/\s/g, '');

      // Create FormData for server action
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("country", form.country);
      formData.append("phone", fullPhone);
      formData.append("city", form.city);
      formData.append("school", form.school);
      formData.append("grade", form.grade);
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("gender", form.gender);

      // ✓ FIX: Call server action instead of signUp.email directly
      const result = await registerUser(formData);

      if (!result.success) {
        setError(result.error ?? "Registration failed. Please try again.");
        setPending(false);
        return;
      }

      if (pendingProgram) {
        await setPendingProgramCookie(pendingProgram);
      }

      // Send OTP verification email
      await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
        type: "email-verification",
      });

      setPending(false);
      setShowOtp(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
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

  if (showOtp) {
    return (
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl font-light text-foreground">Verify Your Email</h1>
          <p className="text-sm font-light text-muted-foreground mt-1 leading-relaxed">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-foreground">{form.email}</span>
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-1">
        <h1 className="font-serif text-3xl font-light text-foreground">
          Apply Now
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Create your G.A.T.E. Assessment account
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="Kenji"
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
            placeholder="Nakamura"
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
          placeholder="k.nakamura@sekolah.edu.sg"
          autoComplete="email"
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="country">Country</Label>
        <Select
          id="country"
          value={form.country}
          onChange={set("country")}
          required
        >
          <option value="" disabled>Select your country...</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Phone</Label>
        <div className="flex gap-2">
          <Select
            value={form.phoneCode}
            onChange={set("phoneCode")}
            className="w-32 flex-shrink-0"
            required
          >
            <option value="" disabled>Code</option>
            {PHONE_CODES.map((p) => (
              <option key={p.iso} value={p.dial}>
                {p.flag} {p.dial}
              </option>
            ))}
          </Select>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="90 123 45 67"
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={set("dateOfBirth")}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            value={form.gender}
            onChange={set("gender")}
            required
          >
            <option value="" disabled>Select gender...</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={form.city}
          onChange={set("city")}
          placeholder="e.g. London, Seoul, Almaty"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="school">School / Institution</Label>
          <Input
            id="school"
            value={form.school}
            onChange={set("school")}
            placeholder="e.g. Lyceum No. 1"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="grade">Grade / Year</Label>
          <Select
            id="grade"
            value={form.grade}
            onChange={set("grade")}
            required
          >
            <option value="" disabled>Select grade...</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
        {pending ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-xs font-light text-muted-foreground">
        Already have an account?{" "}
        <Link href={pendingProgram ? `/login?program=${encodeURIComponent(pendingProgram)}` : "/login"} className="text-gate-gold hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </form>
  );
}
