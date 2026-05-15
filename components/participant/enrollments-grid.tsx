"use client";

import { useRouter } from "next/navigation";
import { EnrollmentCard } from "./enrollment-card";

type Enrollment = {
  id: number;
  enrollmentStatus: "draft" | "pending_payment" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
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

interface EnrollmentsGridProps {
  enrollments: Enrollment[];
}

export function EnrollmentsGrid({ enrollments }: EnrollmentsGridProps) {
  const router = useRouter();

  const handlePaymentClick = (enrollmentId: number) => {
    router.push(`/participant/enrollment?enrollmentId=${enrollmentId}&action=pay`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {enrollments.map((enrollment) => (
        <EnrollmentCard
          key={enrollment.id}
          enrollment={enrollment}
          onPaymentClick={handlePaymentClick}
        />
      ))}
    </div>
  );
}
