import type { Metadata } from "next";
import { PartnerLoginForm } from "./partner-login-form";

export const metadata: Metadata = {
  title: "Partner Portal — Sign In",
};

export default function ExamPartnerLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ◆ Exam Partner Portal
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Partner Assessment Portal
          </span>
        </div>
        <PartnerLoginForm />
      </div>
    </main>
  );
}
