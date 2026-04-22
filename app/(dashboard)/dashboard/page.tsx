import { requireSession } from "@/lib/authz";

export default async function DashboardPage() {
  await requireSession();
  return (
    <main className="flex min-h-screen items-center justify-center bg-gate-900 p-8">
      <p className="font-serif text-2xl text-gate-white/60">
        Dashboard — Coming Soon
      </p>
    </main>
  );
}
