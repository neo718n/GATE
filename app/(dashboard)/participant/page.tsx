import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  User, BookOpen, FileText, Award, Trophy,
  CreditCard, FolderOpen, HelpCircle, Bell,
  CheckCircle2, Clock, XCircle, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { href: "/participant/profile", label: "My Profile", description: "Personal info & school", Icon: User },
  { href: "/participant/enrollment", label: "Enrollment", description: "Subject & payment", Icon: BookOpen },
  { href: "/participant/exam", label: "Exam Info", description: "Guidelines & schedule", Icon: FileText },
  { href: "/participant/results", label: "Results", description: "Scores & rankings", Icon: Award },
  { href: "/participant/certificates", label: "Certificates", description: "Download digital cert", Icon: Trophy },
  { href: "/participant/documents", label: "Documents", description: "Uploaded files", Icon: FolderOpen },
  { href: "#", label: "Notifications", description: "Updates & alerts", Icon: Bell },
  { href: "/contact", label: "Support", description: "Get help", Icon: HelpCircle },
];

const STEPS = [
  { label: "Profile" },
  { label: "Enrolled" },
  { label: "Paid" },
  { label: "Ready" },
];

export default async function ParticipantDashboard() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
    with: { subjects: { with: { subject: true } } },
  });

  const profileComplete =
    !!participant && participant.registrationStatus !== "draft";
  const hasSubject = (participant?.subjects.length ?? 0) > 0;
  const isPaid =
    participant?.paymentStatus === "paid" ||
    participant?.paymentStatus === "waived";
  const isVerified = participant?.registrationStatus === "verified";
  const isPending = participant?.registrationStatus === "submitted";

  const currentStep = isPaid ? 3 : hasSubject ? 2 : profileComplete ? 1 : 0;

  const firstName = session.user.name?.split(" ")[0] ?? "Welcome";
  const initial = session.user.name?.charAt(0).toUpperCase() ?? "U";

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusBadges = [
    {
      label: "Registration",
      value: isVerified
        ? "Verified"
        : isPending
          ? "Under Review"
          : participant?.registrationStatus === "rejected"
            ? "Rejected"
            : "Draft",
      ok: isVerified,
      pending: isPending,
    },
    {
      label: "Subject",
      value: participant?.subjects[0]?.subject?.name ?? "Not Selected",
      ok: hasSubject,
      pending: false,
    },
    {
      label: "Payment",
      value: isPaid ? "Confirmed" : "Unpaid",
      ok: isPaid,
      pending: false,
    },
  ];

  return (
    <div className="max-w-4xl space-y-4">
      {/* Welcome card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gate-800 via-gate-700 to-gate-900 p-6 text-gate-white shadow-xl">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gate-gold">
              {greeting}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-light tracking-wide">
              {firstName}
            </h1>
            <p className="mt-1.5 text-xs text-gate-white/45">{dateStr}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gate-white/10 text-lg font-bold text-gate-gold backdrop-blur-sm">
            {initial}
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-gate-gold/8" />
        <div className="pointer-events-none absolute -bottom-6 -right-2 h-32 w-32 rounded-full bg-gate-gold/5" />
      </div>

      {/* Status badges */}
      <div className="grid grid-cols-3 gap-3">
        {statusBadges.map((badge) => (
          <div
            key={badge.label}
            className={cn(
              "rounded-2xl p-4 flex flex-col gap-2",
              badge.ok
                ? "bg-gate-gold/10 dark:bg-gate-gold/12"
                : "bg-card shadow-sm",
            )}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {badge.label}
            </p>
            <div className="flex items-center gap-1.5 min-w-0">
              {badge.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gate-gold" />
              ) : badge.pending ? (
                <Clock className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
              <p
                className={cn(
                  "text-xs font-semibold truncate",
                  badge.ok ? "text-gate-gold" : "text-foreground",
                )}
              >
                {badge.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress tracker */}
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Your Progress
        </p>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors duration-500",
                i + 1 <= currentStep ? "bg-gate-gold" : "bg-border",
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {STEPS.map((step, i) => (
            <p
              key={i}
              className={cn(
                "text-[9px] font-semibold uppercase tracking-wider",
                i + 1 <= currentStep
                  ? "text-gate-gold"
                  : "text-muted-foreground/40",
              )}
            >
              {step.label}
            </p>
          ))}
        </div>
      </div>

      {/* Quick actions grid */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ href, label, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97] dark:hover:bg-gate-700/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-gate-gold/10 dark:group-hover:bg-gate-gold/15">
                <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-gate-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {label}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Next Step CTA */}
      {!profileComplete && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gate-gold/25 bg-gate-gold/8 p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
              Next Step
            </p>
            <p className="mt-1 text-sm font-light text-foreground/70 leading-relaxed">
              Complete your profile to start the registration process.
            </p>
          </div>
          <Link
            href="/participant/profile"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gate-gold px-4 py-2.5 text-xs font-semibold text-gate-800 transition-colors hover:bg-gate-gold-2 active:scale-95"
          >
            Complete <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {profileComplete && !isPaid && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gate-gold/25 bg-gate-gold/8 p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
              Next Step
            </p>
            <p className="mt-1 text-sm font-light text-foreground/70 leading-relaxed">
              {hasSubject
                ? "Complete payment to confirm your enrollment."
                : "Select a subject and complete payment to enroll."}
            </p>
          </div>
          <Link
            href="/participant/enrollment"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gate-gold px-4 py-2.5 text-xs font-semibold text-gate-800 transition-colors hover:bg-gate-gold-2 active:scale-95"
          >
            {hasSubject ? "Pay Now" : "Enroll"}{" "}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
