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

const statusConfig: Record<
  EnrollmentStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-foreground/60 border border-border",
  },
  pending_payment: {
    label: "Pending Payment",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-foreground/40 border border-border",
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  unpaid: {
    label: "Unpaid",
    className: "bg-muted text-foreground/60 border border-border",
  },
  paid: {
    label: "Paid",
    className: "bg-gate-gold/10 text-gate-800 border border-gate-gold/30",
  },
  refunded: {
    label: "Refunded",
    className: "bg-muted text-foreground/50 border border-border",
  },
};

export function EnrollmentCard({
  enrollment,
  onPaymentClick,
  className,
}: EnrollmentCardProps) {
  const enrollmentStatusInfo = statusConfig[enrollment.enrollmentStatus];
  const paymentStatusInfo = paymentStatusConfig[enrollment.paymentStatus];

  const showPaymentButton =
    enrollment.paymentStatus === "unpaid" &&
    enrollment.enrollmentStatus !== "cancelled" &&
    enrollment.round &&
    enrollment.round.feeUsd > 0;

  return (
    <div
      className={cn(
        "border border-border bg-background p-6 flex flex-col gap-4",
        enrollment.enrollmentStatus === "cancelled" && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-foreground">
            {enrollment.round?.name ?? "Unknown Round"}
          </h3>
          <p className="text-sm font-light text-foreground/60">
            {enrollment.subject?.name ?? "No subject selected"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.25em] px-2 py-1",
              enrollmentStatusInfo.className
            )}
          >
            {enrollmentStatusInfo.label}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.25em] px-2 py-1",
              paymentStatusInfo.className
            )}
          >
            {paymentStatusInfo.label}
          </span>
        </div>
      </div>

      {/* Fee Information */}
      {enrollment.round && (
        <div className="flex items-center justify-between text-sm font-light text-foreground/65 border-t border-border pt-3">
          <span>Registration Fee</span>
          <span className="font-semibold text-foreground">
            {enrollment.round.feeUsd > 0
              ? `$${(enrollment.round.feeUsd / 100).toFixed(2)}`
              : "Free"}
          </span>
        </div>
      )}

      {/* Enrolled Date */}
      <div className="text-xs font-light text-foreground/50">
        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        {showPaymentButton && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onPaymentClick?.(enrollment.id)}
            className="flex-1"
          >
            Pay Now
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          asChild
          className={cn(!showPaymentButton && "flex-1")}
        >
          <Link href={`/participant/enrollments/${enrollment.id}`}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}
