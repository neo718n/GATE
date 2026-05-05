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

export function splitPhone(
  stored: string | null,
  country?: string | null,
): { code: string; number: string } {
  if (!stored) {
    const matched = PHONE_CODES.find(
      (c) => c.country.toLowerCase() === (country ?? "").toLowerCase(),
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
