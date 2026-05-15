import type { Metadata } from "next";
import { Suspense } from "react";
import { UnifiedRegistrationForm } from "@/components/auth/unified-registration-form";

export const metadata: Metadata = {
  title: "Apply Now",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <UnifiedRegistrationForm />
    </Suspense>
  );
}
