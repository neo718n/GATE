import Link from "next/link";
import { requirePartnerStaff } from "@/lib/authz";

export const metadata = { title: "Question pool" };

export default async function PartnerPoolPage() {
  await requirePartnerStaff();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-serif text-4xl font-light text-foreground">
        Question pool
      </h1>
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-sm font-light text-muted-foreground">
        <p>
          Browsing the shared question bank with filters and bulk-add is coming
          next. For now, add questions directly in the{" "}
          <Link
            href="/examPartner/exams"
            className="font-medium text-gate-gold hover:underline"
          >
            exam builder
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
