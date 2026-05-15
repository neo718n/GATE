"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EnrollmentStatus = "draft" | "pending_payment" | "confirmed" | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "refunded";

interface EnrollmentCardProps {
  enrollment: {
    id: number;
    enrollmentStatus: EnrollmentStatus;
    paymentStatus: PaymentStatus;
    enrolledAt: Date;
    round: {
      id: number;
      name: string;
      feeUsd: number;
    } | null;
    subject: {
      id: number;
      name: string;
    } | null;
  };
  onPaymentClick?: (enrollmentId: number) => void;
  className?: string;
}

type Tone = "neutral" | "warning" | "success" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-foreground/60 border border-border",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  success: "bg-green-50 text-green-700 border border-green-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
};

function resolveStatus(
  enrollmentStatus: EnrollmentStatus,
  paymentStatus: PaymentStatus,
  hasSubject: boolean,
): { label: string; tone: Tone; helper: string } {
  if (enrollmentStatus === "cancelled") return { label: "Cancelled", tone: "neutral", helper: "" };
  if (paymentStatus === "paid") return { label: "Confirmed", tone: "success", helper: "Payment received" };
  if (paymentStatus === "refunded") return { label: "Refunded", tone: "neutral", helper: "" };
  if (!hasSubject) return { label: "Action Needed", tone: "warning", helper: "Choose a subject to continue" };
  return { label: "Payment Pending", tone: "warning", helper: "Complete payment to confirm enrollment" };
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function EnrollmentCard({
  enrollment,
  onPaymentClick,
  className,
}: EnrollmentCardProps) {
  const hasSubject = !!enrollment.subject;
  const status = resolveStatus(enrollment.enrollmentStatus, enrollment.paymentStatus, hasSubject);
  const fee = enrollment.round?.feeUsd ?? 0;

  const isCancelled = enrollment.enrollmentStatus === "cancelled";
  const isPaid = enrollment.paymentStatus === "paid";
  const canAct = !isCancelled && !isPaid && fee > 0;

  const focusedHref = `/participant/enrollment?enrollmentId=${enrollment.id}`;
  // Primary CTA label changes by state:
  //  - no subject → resume the picker
  //  - subject set, unpaid → commit to payment
  const primaryLabel = !hasSubject ? "Select Subject" : `Pay $${(fee / 100).toFixed(2)}`;

  // Both cases route to /participant/enrollment?enrollmentId=X — the focused
  // single-step view handles the rest. onPaymentClick is preserved as an
  // optional analytics hook but is no longer used for navigation.
  void onPaymentClick;

  return (
    <div
      className={cn(
        "border border-border bg-background p-6 flex flex-col gap-4 h-full",
        isCancelled && "opacity-60",
        className,
      )}
    >
      {/* Header: round + subject + single status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {enrollment.round?.name ?? "Unknown Round"}
          </h3>
          <p className="text-sm font-light truncate">
            <span className="text-foreground/40">Subject · </span>
            {enrollment.subject ? (
              <span className="text-foreground/70">{enrollment.subject.name}</span>
            ) : (
              <span className="text-amber-700">Not selected</span>
            )}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1",
            TONE_CLASSES[status.tone],
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Status helper — tells the user what to do next */}
      {status.helper && !isPaid && (
        <p className="text-xs font-light text-foreground/60 -mt-1">{status.helper}</p>
      )}

      {/* Fee row */}
      {enrollment.round && (
        <div className="flex items-center justify-between text-sm font-light text-foreground/65 border-t border-border pt-3">
          <span>Registration Fee</span>
          <span className="font-semibold text-foreground tabular-nums">
            {fee > 0 ? `$${(fee / 100).toFixed(2)}` : "Free"}
          </span>
        </div>
      )}

      {/* Enrolled date */}
      <div className="text-xs font-light text-foreground/50">
        Enrolled · {dateFormatter.format(new Date(enrollment.enrolledAt))}
      </div>

      {/* Actions: one primary CTA + secondary text link, mt-auto pins to card bottom */}
      <div className="flex flex-col gap-2 pt-2 mt-auto">
        {canAct ? (
          <Button
            variant={hasSubject ? "primary" : "gold"}
            size="md"
            asChild
            className="w-full"
          >
            <Link href={focusedHref}>{primaryLabel}</Link>
          </Button>
        ) : isPaid ? (
          <Button variant="outline" size="md" asChild className="w-full">
            <Link href={focusedHref}>View Enrollment</Link>
          </Button>
        ) : null}
        {canAct && (
          <Link
            href={focusedHref}
            className="text-xs font-medium text-foreground/55 hover:text-foreground transition-colors text-center"
          >
            View details
          </Link>
        )}
      </div>
    </div>
  );
}
