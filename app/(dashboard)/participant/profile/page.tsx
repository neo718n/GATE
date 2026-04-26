import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveParticipantProfile } from "@/lib/actions/participant";

export default async function ProfilePage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Profile
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">
          Participant Profile
        </h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          Complete your profile to proceed with subject enrollment and registration.
        </p>
      </div>

      {participant?.registrationStatus === "submitted" && (
        <div className="border border-gate-gold/30 bg-gate-gold/5 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Profile Saved
          </p>
          <p className="text-sm font-light text-gate-800/65 mt-1">
            Your profile is on file. Update any details below and save again.
          </p>
        </div>
      )}

      <form action={saveParticipantProfile} className="flex flex-col gap-8">
        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 pb-1 border-b border-gate-fog">
            Personal Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                placeholder="As on your ID"
                defaultValue={participant?.fullName ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={participant?.dateOfBirth ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                required
                placeholder="e.g. Uzbekistan"
                defaultValue={participant?.country ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g. Tashkent"
                defaultValue={participant?.city ?? ""}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 pb-1 border-b border-gate-fog">
            Academic Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="school">School / Institution</Label>
              <Input
                id="school"
                name="school"
                placeholder="e.g. Lyceum No. 1 Tashkent"
                defaultValue={participant?.school ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="grade">Grade / Year</Label>
              <Input
                id="grade"
                name="grade"
                placeholder="e.g. Grade 11"
                defaultValue={participant?.grade ?? ""}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 pb-1 border-b border-gate-fog">
            Guardian / Emergency Contact
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                name="guardianName"
                defaultValue={participant?.guardianName ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guardianEmail">Guardian Email</Label>
              <Input
                id="guardianEmail"
                name="guardianEmail"
                type="email"
                defaultValue={participant?.guardianEmail ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                name="guardianPhone"
                type="tel"
                defaultValue={participant?.guardianPhone ?? ""}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="gold" size="md">
            Save &amp; Continue to Enrollment
          </Button>
        </div>
      </form>
    </div>
  );
}
