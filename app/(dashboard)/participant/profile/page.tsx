import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveParticipantProfile } from "@/lib/actions/participant";
import { PhoneCodeSelect } from "./phone-code-select";

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Grade ${i + 1}`,
}));

const PHONE_CODES = [
  { country: "Uzbekistan", dial: "+998", flag: "🇺🇿", iso: "UZ" },
  { country: "Kazakhstan", dial: "+7 (KZ)", flag: "🇰🇿", iso: "KZ" },
  { country: "Russia", dial: "+7 (RU)", flag: "🇷🇺", iso: "RU" },
  { country: "United States", dial: "+1 (US)", flag: "🇺🇸", iso: "US" },
  { country: "Canada", dial: "+1 (CA)", flag: "🇨🇦", iso: "CA" },
  { country: "United Kingdom", dial: "+44", flag: "🇬🇧", iso: "GB" },
  { country: "Germany", dial: "+49", flag: "🇩🇪", iso: "DE" },
  { country: "France", dial: "+33", flag: "🇫🇷", iso: "FR" },
  { country: "Azerbaijan", dial: "+994", flag: "🇦🇿", iso: "AZ" },
  { country: "Kyrgyzstan", dial: "+996", flag: "🇰🇬", iso: "KG" },
  { country: "Tajikistan", dial: "+992", flag: "🇹🇯", iso: "TJ" },
  { country: "Turkmenistan", dial: "+993", flag: "🇹🇲", iso: "TM" },
  { country: "Georgia", dial: "+995", flag: "🇬🇪", iso: "GE" },
  { country: "Armenia", dial: "+374", flag: "🇦🇲", iso: "AM" },
  { country: "Ukraine", dial: "+380", flag: "🇺🇦", iso: "UA" },
  { country: "Belarus", dial: "+375", flag: "🇧🇾", iso: "BY" },
  { country: "Poland", dial: "+48", flag: "🇵🇱", iso: "PL" },
  { country: "Turkey", dial: "+90", flag: "🇹🇷", iso: "TR" },
  { country: "South Korea", dial: "+82", flag: "🇰🇷", iso: "KR" },
  { country: "China", dial: "+86", flag: "🇨🇳", iso: "CN" },
  { country: "Japan", dial: "+81", flag: "🇯🇵", iso: "JP" },
  { country: "India", dial: "+91", flag: "🇮🇳", iso: "IN" },
  { country: "Pakistan", dial: "+92", flag: "🇵🇰", iso: "PK" },
  { country: "Indonesia", dial: "+62", flag: "🇮🇩", iso: "ID" },
  { country: "Malaysia", dial: "+60", flag: "🇲🇾", iso: "MY" },
  { country: "Singapore", dial: "+65", flag: "🇸🇬", iso: "SG" },
  { country: "Thailand", dial: "+66", flag: "🇹🇭", iso: "TH" },
  { country: "Vietnam", dial: "+84", flag: "🇻🇳", iso: "VN" },
  { country: "Philippines", dial: "+63", flag: "🇵🇭", iso: "PH" },
  { country: "UAE", dial: "+971", flag: "🇦🇪", iso: "AE" },
  { country: "Saudi Arabia", dial: "+966", flag: "🇸🇦", iso: "SA" },
  { country: "Iran", dial: "+98", flag: "🇮🇷", iso: "IR" },
  { country: "Egypt", dial: "+20", flag: "🇪🇬", iso: "EG" },
  { country: "South Africa", dial: "+27", flag: "🇿🇦", iso: "ZA" },
  { country: "Nigeria", dial: "+234", flag: "🇳🇬", iso: "NG" },
  { country: "Kenya", dial: "+254", flag: "🇰🇪", iso: "KE" },
  { country: "Ethiopia", dial: "+251", flag: "🇪🇹", iso: "ET" },
  { country: "Brazil", dial: "+55", flag: "🇧🇷", iso: "BR" },
  { country: "Mexico", dial: "+52", flag: "🇲🇽", iso: "MX" },
  { country: "Argentina", dial: "+54", flag: "🇦🇷", iso: "AR" },
  { country: "Colombia", dial: "+57", flag: "🇨🇴", iso: "CO" },
  { country: "Australia", dial: "+61", flag: "🇦🇺", iso: "AU" },
  { country: "Romania", dial: "+40", flag: "🇷🇴", iso: "RO" },
  { country: "Czech Republic", dial: "+420", flag: "🇨🇿", iso: "CZ" },
  { country: "Hungary", dial: "+36", flag: "🇭🇺", iso: "HU" },
  { country: "Mongolia", dial: "+976", flag: "🇲🇳", iso: "MN" },
  { country: "Afghanistan", dial: "+93", flag: "🇦🇫", iso: "AF" },
];

const SELECT_CLS =
  "flex h-12 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-light text-foreground focus-visible:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all duration-200";

function splitPhone(stored: string | null, country?: string | null): { code: string; number: string } {
  if (!stored) {
    const matched = PHONE_CODES.find(
      (c) => c.country.toLowerCase() === (country ?? "").toLowerCase()
    );
    return { code: matched?.dial ?? "+86", number: "" };
  }
  for (const c of PHONE_CODES) {
    const raw = c.dial.replace(/\s*\(.*\)/, "");
    if (stored.startsWith(raw)) {
      return { code: c.dial, number: stored.slice(raw.length).trim() };
    }
  }
  return { code: "+86", number: stored };
}

export default async function ProfilePage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const existingFirstName = participant?.fullName?.split(" ")[0] ?? "";
  const existingLastName =
    participant?.fullName?.split(" ").slice(1).join(" ") ?? "";
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
          Complete your profile to proceed with subject enrollment and
          registration.
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

      <form action={saveParticipantProfile} className="flex flex-col gap-8">
        {/* Personal Information */}
        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Personal Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                placeholder="e.g. John"
                defaultValue={existingFirstName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                placeholder="e.g. Smith"
                defaultValue={existingLastName}
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
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                defaultValue={participant?.gender ?? ""}
                className={SELECT_CLS}
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Phone</Label>
              <div className="flex gap-2">
                <PhoneCodeSelect codes={PHONE_CODES} defaultValue={phoneCode} />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="90 123 45 67"
                  defaultValue={phoneNumber}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                required
                placeholder="e.g. Kazakhstan, South Korea, Brazil"
                defaultValue={participant?.country ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g. London, Seoul, Almaty"
                defaultValue={participant?.city ?? ""}
              />
            </div>
          </div>
        </fieldset>

        {/* Academic Information */}
        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Academic Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="school">School / Institution *</Label>
              <Input
                id="school"
                name="school"
                required
                placeholder="e.g. Lyceum No. 1"
                defaultValue={participant?.school ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="grade">Grade / Year *</Label>
              <select
                id="grade"
                name="grade"
                required
                defaultValue={participant?.grade ?? ""}
                className={SELECT_CLS}
              >
                <option value="" disabled>
                  Select grade
                </option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
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
