import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileFormClient } from "./profile-form";
import { splitPhone } from "./constants";



export default async function ProfilePage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const existingFirstName = participant?.fullName?.split(" ")[0] ?? "";
  const existingLastName = participant?.fullName?.split(" ").slice(1).join(" ") ?? "";
  const { code: phoneCode, number: phoneNumber } = splitPhone(
    participant?.phone ?? null,
    participant?.country ?? null,
  );

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Profile
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Participant Profile
        </h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Complete your profile to proceed with subject enrollment and registration.
        </p>
      </div>

      {participant?.registrationStatus === "submitted" && (
        <div className="border border-gate-gold/30 bg-gate-gold/5 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Profile Saved
          </p>
          <p className="text-sm font-light text-foreground/65 mt-1">
            Your profile is on file. Update any details below and save again.
          </p>
        </div>
      )}

      <ProfileFormClient
        defaultFirstName={existingFirstName}
        defaultLastName={existingLastName}
        defaultDob={participant?.dateOfBirth ?? ""}
        defaultGender={participant?.gender ?? ""}
        defaultPhoneCode={phoneCode}
        defaultPhoneNumber={phoneNumber}
        defaultCountry={participant?.country ?? ""}
        defaultCity={participant?.city ?? ""}
        defaultSchool={participant?.school ?? ""}
        defaultGrade={participant?.grade ?? ""}
        isNewProfile={!participant}
      />
    </div>
  );
}