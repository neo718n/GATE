"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveParticipantProfile } from "@/lib/actions/participant";
import { PhoneCodeSelect } from "./phone-code-select";
import { CustomSelect } from "./custom-select";

export const PHONE_CODES = [
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

const GRADE_OPTIONS_SELECT = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Grade ${i + 1}`,
}));

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bangladesh","Belarus","Belgium","Bolivia",
  "Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia",
  "Croatia","Cuba","Czech Republic","Denmark","Ecuador","Egypt",
  "Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece",
  "Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Japan","Kazakhstan","Kenya","Kyrgyzstan","Malaysia","Mexico",
  "Mongolia","Morocco","Myanmar","Netherlands","New Zealand","Nigeria",
  "Norway","Pakistan","Peru","Philippines","Poland","Portugal",
  "Romania","Russia","Saudi Arabia","Serbia","Singapore","South Africa",
  "South Korea","Spain","Sweden","Switzerland","Tajikistan","Thailand",
  "Turkey","Turkmenistan","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uzbekistan","Venezuela","Vietnam",
  "Zimbabwe",
].map((c) => ({ value: c, label: c }));

type Props = {
  defaultFirstName: string;
  defaultLastName: string;
  defaultDob: string;
  defaultGender: string;
  defaultPhoneCode: string;
  defaultPhoneNumber: string;
  defaultCountry: string;
  defaultCity: string;
  defaultSchool: string;
  defaultGrade: string;
  isNewProfile: boolean;
};

export function ProfileFormClient({
  defaultFirstName,
  defaultLastName,
  defaultDob,
  defaultGender,
  defaultPhoneCode,
  defaultPhoneNumber,
  defaultCountry,
  defaultCity,
  defaultSchool,
  defaultGrade,
  isNewProfile,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveParticipantProfile(formData);
        if (isNewProfile) {
          toast.success("Profile saved!", { description: "Heading to enrollment..." });
          setTimeout(() => router.push("/participant/enrollment"), 1200);
        } else {
          toast.success("Profile updated successfully.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save profile.";
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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
              defaultValue={defaultFirstName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              required
              placeholder="e.g. Smith"
              defaultValue={defaultLastName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              defaultValue={defaultDob}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Gender *</Label>
            <CustomSelect
              name="gender"
              defaultValue={defaultGender}
              options={GENDER_OPTIONS}
              placeholder="Select gender"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Phone</Label>
            <div className="flex gap-2">
              <PhoneCodeSelect codes={PHONE_CODES} defaultValue={defaultPhoneCode} />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                placeholder="90 123 45 67"
                defaultValue={defaultPhoneNumber}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Country *</Label>
            <CustomSelect
              name="country"
              defaultValue={defaultCountry}
              options={COUNTRIES}
              placeholder="Select country"
              searchable
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              required
              placeholder="e.g. London, Seoul, Almaty"
              defaultValue={defaultCity}
            />
          </div>
        </div>
      </fieldset>

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
              defaultValue={defaultSchool}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Grade / Year *</Label>
            <CustomSelect
              name="grade"
              defaultValue={defaultGrade}
              options={GRADE_OPTIONS_SELECT}
              placeholder="Select grade"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" variant="gold" size="md" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : isNewProfile ? (
            "Save & Continue to Enrollment"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
