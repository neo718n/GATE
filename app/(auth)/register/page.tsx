import type { Metadata } from "next";
import { UnifiedRegistrationForm } from "@/components/auth/unified-registration-form";

export const metadata: Metadata = {
  title: "Apply Now",
};

export default function RegisterPage() {
  return <UnifiedRegistrationForm />;
}
