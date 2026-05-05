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

import { PHONE_CODES } from "./constants";

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
