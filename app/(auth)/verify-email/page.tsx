import type { Metadata } from "next";
import { VerifyEmailForm } from "./verify-form";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;
  return <VerifyEmailForm email={decodeURIComponent(email)} />;
}
