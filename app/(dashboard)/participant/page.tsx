import { requireRole } from "@/lib/authz";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ParticipantDashboard() {
  await requireRole(["participant", "admin", "super_admin"]);

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gate-gold">Participant Portal</span>
        <h1 className="font-serif text-4xl font-light text-gate-white">My Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Registration Status", value: "Not Submitted", note: "Complete your profile to begin" },
          { label: "Subject Area", value: "Not Selected", note: "Select during registration" },
          { label: "Payment Status", value: "Unpaid", note: "Complete registration first" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border/40 bg-gate-800/20 p-6 flex flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gray">{stat.label}</p>
            <p className="text-lg font-light text-gate-white">{stat.value}</p>
            <p className="text-xs font-light text-gate-white/40">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border/40 p-6 flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-white">My Profile</h2>
          <p className="text-sm font-light text-gate-white/55 leading-[1.8]">Complete your participant profile including personal details, school information, and guardian contact. Required before registration can be submitted.</p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/profile">Complete Profile</Link>
          </Button>
        </div>

        <div className="border border-border/40 p-6 flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-white">Subject Enrollment</h2>
          <p className="text-sm font-light text-gate-white/55 leading-[1.8]">Select your subject area for the Preliminary Round. Available once your profile is complete. Subject selection is final after submission.</p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/enrollment">Select Subject</Link>
          </Button>
        </div>

        <div className="border border-border/40 p-6 flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-white">Exam Instructions</h2>
          <p className="text-sm font-light text-gate-white/55 leading-[1.8]">Access examination guidelines, rules, technical requirements, and schedule information. Available once registration is confirmed.</p>
          <Button variant="outline" size="sm" disabled className="w-fit opacity-40">
            Available after registration
          </Button>
        </div>

        <div className="border border-border/40 p-6 flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-white">Results & Certificates</h2>
          <p className="text-sm font-light text-gate-white/55 leading-[1.8]">View your examination results and download your certificates once results are published by the academic committee.</p>
          <Button variant="outline" size="sm" disabled className="w-fit opacity-40">
            Results not yet published
          </Button>
        </div>
      </div>

      <div className="border border-gate-gold/20 bg-gate-gold/5 p-6 flex flex-col gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gold">Next Step</p>
        <p className="text-sm font-light text-gate-white/70 leading-[1.9]">Complete your participant profile to begin the registration process. Once your profile is submitted and verified, you will be able to select your subject area and proceed to payment.</p>
        <Button variant="gold" size="sm" asChild className="w-fit mt-1">
          <Link href="/participant/profile">Complete Profile Now</Link>
        </Button>
      </div>
    </div>
  );
}
