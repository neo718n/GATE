import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { badgeVerifySettings } from "@/lib/db/schema";
import { toggleBadgeVerifyFlow } from "@/lib/actions/badges";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  await requireRole(["super_admin"]);

  const [verifySettings] = await db.select().from(badgeVerifySettings).limit(1);
  const badgeVerifyEnabled = verifySettings?.enabled ?? true;

  const checks = [
    {
      label: "Stripe Integration",
      status: !!process.env.STRIPE_SECRET_KEY,
      detail: process.env.STRIPE_SECRET_KEY
        ? "Secret key configured"
        : "STRIPE_SECRET_KEY not set",
    },
    {
      label: "Stripe Webhook",
      status: !!process.env.STRIPE_WEBHOOK_SECRET,
      detail: process.env.STRIPE_WEBHOOK_SECRET
        ? "Webhook secret configured"
        : "STRIPE_WEBHOOK_SECRET not set — set this to the secret from Stripe Dashboard or `stripe listen`",
    },
    {
      label: "Email (Resend)",
      status: !!process.env.RESEND_API_KEY,
      detail: process.env.RESEND_API_KEY ? "API key configured" : "RESEND_API_KEY not set",
    },
    {
      label: "Database",
      status: !!process.env.DATABASE_URL,
      detail: process.env.DATABASE_URL ? "DATABASE_URL configured" : "DATABASE_URL not set",
    },
    {
      label: "App URL",
      status: !!process.env.NEXT_PUBLIC_APP_URL,
      detail: process.env.NEXT_PUBLIC_APP_URL ?? "Not set — defaults to http://localhost:3000",
    },
    {
      label: "Better Auth Secret",
      status: !!process.env.BETTER_AUTH_SECRET,
      detail: process.env.BETTER_AUTH_SECRET ? "Configured" : "BETTER_AUTH_SECRET not set",
    },
  ];

  const todos = [
    "Set STRIPE_WEBHOOK_SECRET from: stripe listen --forward-to localhost:3000/api/stripe/webhook",
    "Verify package.json name is set to 'gate-assessment'",
    "Set NEXT_PUBLIC_APP_URL to your production domain before deploying",
    "Configure RESEND_FROM_EMAIL with a verified sending domain for production",
  ];

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">System Settings</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Environment and integration status.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
          Integration Status
        </p>
        {checks.map((c) => (
          <div key={c.label} className="flex items-start gap-4 py-3 border-b border-border last:border-0">
            <span
              className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${c.status ? "bg-green-500" : "bg-red-400"}`}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">{c.label}</p>
              <p className="text-xs font-light text-foreground/55">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
          Badge Verification (China Camp QR)
        </p>
        <div className="flex items-start justify-between gap-4 py-3">
          <div className="flex items-start gap-4">
            <span
              className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${badgeVerifyEnabled ? "bg-green-500" : "bg-red-400"}`}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">
                Public verification is {badgeVerifyEnabled ? "ON" : "OFF"}
              </p>
              <p className="text-xs font-light text-foreground/55 max-w-md">
                Controls whether scanning a China Camp badge QR code (/verify/[code])
                shows the contestant&apos;s identity and score, or a &quot;temporarily
                disabled&quot; message. Certificate verification is unaffected.
              </p>
            </div>
          </div>
          <form action={toggleBadgeVerifyFlow} className="shrink-0">
            <input type="hidden" name="enabled" value={String(badgeVerifyEnabled)} />
            <Button type="submit" variant={badgeVerifyEnabled ? "destructive" : "gold"} size="sm">
              {badgeVerifyEnabled ? "Turn Off" : "Turn On"}
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
          Pending Setup Items
        </p>
        {todos.map((t) => (
          <div key={t} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <span className="mt-2 h-px w-4 shrink-0 bg-gate-gold/40" />
            <p className="text-sm font-light text-foreground/65">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
