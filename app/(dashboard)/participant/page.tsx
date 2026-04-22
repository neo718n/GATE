import { requireRole } from "@/lib/authz";

export default async function ParticipantDashboard() {
  await requireRole(["participant", "admin", "super_admin"]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-gate-900 p-8">
      <p className="font-serif text-2xl text-gate-white/60">
        Participant Dashboard — Coming Soon
      </p>
    </main>
  );
}
