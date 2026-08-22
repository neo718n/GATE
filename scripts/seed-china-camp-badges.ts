import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import type { NewEventBadge } from "@/lib/db/schema";

// Source: event_badge/for_badges_v4 - for_badges.csv (55 attendees, GATE China Camp
// 2026, Hangzhou). Three corrections applied vs. the raw CSV, confirmed with the
// event organizer on 2026-08-20:
//   - STAFF UNK-S-001 (Farrukh Karimzoda) and UNK-S-002 (Shahzod Ibrohimov) are part
//     of the Tajikistan delegation, not an unknown country — card codes renamed
//     UNK-S-001 -> TJK-S-001, UNK-S-002 -> TJK-S-002.
//   - STAFF UNK-S-003 (袁大荣) is local venue staff at Hangzhou Institute of
//     Technology, not part of any delegation — card code renamed UNK-S-003 -> CHN-S-001.
// MEDIA rows (UZB-M-001/002) already had the correct country (Uzbekistan) in the CSV.
const badges: NewEventBadge[] = [
  { cardNo: "RUS-C-001", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Sulaimonov Okilkhudzha", country: "Russia", gender: "male", dateOfBirth: "2010-03-23", sourceNote: "Grade 9", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-002", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Abdusaidov Azam", country: "Tajikistan", gender: "male", dateOfBirth: "2009-10-02", sourceNote: "Grade 11", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-005", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Azamzoda Abbos", country: "Tajikistan", gender: "male", dateOfBirth: "2014-09-03", sourceNote: "Grade 6", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-003", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Barotov Muhammad", country: "Tajikistan", gender: "male", dateOfBirth: "2009-09-29", sourceNote: "Grade 10", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-006", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Faizullozoda Abdulbori", country: "Tajikistan", gender: "male", dateOfBirth: "2011-02-08", sourceNote: "Grade 9", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-004", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Gurminji Norinj", country: "Tajikistan", gender: "male", dateOfBirth: "2009-04-03", sourceNote: "Grade 10", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-007", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Mirzoaliev Muhsin", country: "Tajikistan", gender: "male", dateOfBirth: "2012-10-18", sourceNote: "Grade 7", badgeColorHex: "#0066FF" },
  { cardNo: "TJK-C-001", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Ulmasov Umedjon", country: "Tajikistan", gender: "male", dateOfBirth: "2011-08-30", sourceNote: "Grade 8", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-023", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "ABDISAMATOV AFRUZBEK", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-06-28", sourceNote: "4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-026", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "ABDUKHAMIDOV TEMUR", country: "Uzbekistan", gender: "male", dateOfBirth: "2016-10-12", sourceNote: "3", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-020", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "ABDUPATTOEV BARKAMOL", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-04-23", sourceNote: "5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-019", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "ABDURASHIDOV MUHAMMADRIZO", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-09-20", sourceNote: "4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-028", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "AZADOVA DILNURA", country: "Uzbekistan", gender: "female", dateOfBirth: "2011-04-04", sourceNote: "9", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-010", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Azadov Ogabek", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-07-09", sourceNote: "Grade 5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-007", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "BAKHTIYAROV SHAHRUZ", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-08-16", sourceNote: "Grade 5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-016", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "BOTIROV MIRZIYO", country: "Uzbekistan", gender: "male", dateOfBirth: "2010-09-20", sourceNote: "9", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-027", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "DAVLATBAEVA RAYKHON", country: "Uzbekistan", gender: "female", dateOfBirth: "2017-06-12", sourceNote: "2", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-021", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "DILMURODJONOV MUHAMMADSODIK", country: "Uzbekistan", gender: "male", dateOfBirth: "2017-07-07", sourceNote: "2", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-013", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "FARKHODOV YUSUFJON", country: "Uzbekistan", gender: "male", dateOfBirth: "2017-03-24", sourceNote: "2", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-022", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "FURKATOV FARRUKHJON", country: "Uzbekistan", gender: "male", dateOfBirth: "2017-12-05", sourceNote: "2", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-015", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "GAFUROV KOMRON", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-05-19", sourceNote: "4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-009", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Ilkhomjonov Saidkamol", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-02-06", sourceNote: "Grade 5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-004", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "KAKHKHAROV BILOLBEK", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-06-19", sourceNote: "Grade 4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-002", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "KHABIBULLAEV KOZIMBEK", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-11-17", sourceNote: "Grade 5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-005", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "KHUSANOV BEKTOSH", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-12-22", sourceNote: "Grade 5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-011", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "KOBILJONOV ISLOMBEK", country: "Uzbekistan", gender: "male", dateOfBirth: "2016-09-18", sourceNote: "3", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-012", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "KOBILJONOVA DILNURAKHON", country: "Uzbekistan", gender: "female", dateOfBirth: "2015-05-22", sourceNote: "4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-017", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "MAMASIDIKOV MUHAMMADZIYO", country: "Uzbekistan", gender: "male", dateOfBirth: "2017-10-24", sourceNote: "2", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-029", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "MUKHIDDINOV UMARSHOH", country: "Uzbekistan", gender: "male", dateOfBirth: "2018-05-21", sourceNote: "1", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-003", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "MUSURMONOV BEHRUZ", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-02-05", sourceNote: "Grade 4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-018", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "NEMATULLAEV MUKHAMMADKHON", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-06-16", sourceNote: "5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-024", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "ORIFJONOV MUHAMMADALI", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-08-09", sourceNote: "4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-014", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "SAMARUDDINOV NURUDDIN", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-01-19", sourceNote: "4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-001", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "SHODIYOROV KOMRON", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-05-13", sourceNote: "Grade 4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-025", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "SOFARBAEV SAIDMUROD", country: "Uzbekistan", gender: "male", dateOfBirth: "2014-07-16", sourceNote: "5", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-006", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "TOVMURATOV DIYORBEK", country: "Uzbekistan", gender: "male", dateOfBirth: "2015-06-28", sourceNote: "Grade 4", badgeColorHex: "#0066FF" },
  { cardNo: "UZB-C-008", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Yangiboev Asilbek", country: "Uzbekistan", gender: "male", dateOfBirth: "2013-05-01", sourceNote: "Grade 6", badgeColorHex: "#0066FF" },
  // Not in the original 55-attendee CSV — sat the Math contest (photo 11) without a
  // printed badge. Added post-event 2026-08-22 so the QR performance feature covers
  // him too. No DOB on file.
  { cardNo: "UZB-C-030", category: "PARTICIPANT", roleBadge: "CONTESTANT", fullName: "Muhammad Yusuf Xurramov", country: "Uzbekistan", gender: "male", dateOfBirth: null, sourceNote: "Grade 4 (KHISO) — unregistered, added post-event", badgeColorHex: "#0066FF" },

  { cardNo: "UZB-T-002", category: "DELEGATION", roleBadge: "TEAM_LEADER", fullName: "AMIROV ABDULHAY", country: "Uzbekistan", gender: "male", dateOfBirth: "2002-09-18", sourceNote: "Teacher", badgeColorHex: "#5B21B6" },
  { cardNo: "UZB-T-003", category: "DELEGATION", roleBadge: "TEAM_LEADER", fullName: "JURAKULOV SHAVKATJON", country: "Uzbekistan", gender: "male", dateOfBirth: "1995-03-13", sourceNote: "Teacher", badgeColorHex: "#5B21B6" },
  { cardNo: "UZB-T-001", category: "DELEGATION", roleBadge: "TEAM_LEADER", fullName: "SAYDILLAEV DOSTON", country: "Uzbekistan", gender: "male", dateOfBirth: "1998-12-21", sourceNote: "Teacher", badgeColorHex: "#5B21B6" },
  { cardNo: "UZB-T-004", category: "DELEGATION", roleBadge: "TEAM_LEADER", fullName: "SHAYDULOV ASOMIDDIN", country: "Uzbekistan", gender: "male", dateOfBirth: "1996-12-20", sourceNote: "KHISO", badgeColorHex: "#5B21B6" },

  { cardNo: "TJK-P-001", category: "GUEST", roleBadge: "PARENT", fullName: "Ulmasova Nigora", country: "Tajikistan", gender: "female", dateOfBirth: "1980-09-27", sourceNote: "Umedjon's mother", badgeColorHex: "#FFB800" },
  { cardNo: "UZB-P-005", category: "GUEST", roleBadge: "PARENT", fullName: "ABDURASULOV BAKHTIYOR", country: "Uzbekistan", gender: "male", dateOfBirth: "1993-06-01", sourceNote: "Father", badgeColorHex: "#FFB800" },
  { cardNo: "UZB-P-001", category: "GUEST", roleBadge: "PARENT", fullName: "Bagibekov Yangiboy", country: "Uzbekistan", gender: "male", dateOfBirth: "1956-03-01", sourceNote: "grandfather of Asilbek", badgeColorHex: "#FFB800" },
  { cardNo: "UZB-P-004", category: "GUEST", roleBadge: "PARENT", fullName: "JURAEV QOBILJON", country: "Uzbekistan", gender: "male", dateOfBirth: "1961-04-04", sourceNote: "GrandFather", badgeColorHex: "#FFB800" },
  { cardNo: "UZB-P-002", category: "GUEST", roleBadge: "PARENT", fullName: "Mirzakarimova Yokutkhon", country: "Uzbekistan", gender: "female", dateOfBirth: "1959-03-29", sourceNote: "grandmother of Saidkamol", badgeColorHex: "#FFB800" },
  { cardNo: "UZB-P-003", category: "GUEST", roleBadge: "PARENT", fullName: "Tadjimuratov Davron", country: "Uzbekistan", gender: "male", dateOfBirth: "1986-07-01", sourceNote: "father of Dilnura and Ogabek", badgeColorHex: "#FFB800" },

  { cardNo: "TJK-R-001", category: "OFFICIAL", roleBadge: "COUNTRY_REP", fullName: "Yoqubjonov Ilhomjon", country: "Tajikistan", gender: "male", dateOfBirth: "2000-03-04", sourceNote: null, badgeColorHex: "#1E1E24" },
  { cardNo: "UZB-R-002", category: "OFFICIAL", roleBadge: "COUNTRY_REP", fullName: "ISHCHANOV ZAFARBEK", country: "Uzbekistan", gender: "male", dateOfBirth: "2002-12-28", sourceNote: "KHISO", badgeColorHex: "#1E1E24" },
  { cardNo: "UZB-R-001", category: "OFFICIAL", roleBadge: "COUNTRY_REP", fullName: "SOBIROV DILMUROD", country: "Uzbekistan", gender: "male", dateOfBirth: "1997-05-29", sourceNote: null, badgeColorHex: "#1E1E24" },

  { cardNo: "UZB-M-001", category: "GUEST", roleBadge: "MEDIA", fullName: "ABDUJABBOROVA DIYORAKHON", country: "Uzbekistan", gender: "female", dateOfBirth: "1993-08-02", sourceNote: "媒体", badgeColorHex: "#DC2626" },
  { cardNo: "UZB-M-002", category: "GUEST", roleBadge: "MEDIA", fullName: "KADIROV AKMAL", country: "Uzbekistan", gender: "male", dateOfBirth: "1987-05-10", sourceNote: "媒体", badgeColorHex: "#DC2626" },

  // Renamed from UNK-S-001 — confirmed part of the Tajikistan delegation, not "unknown".
  { cardNo: "TJK-S-001", category: "OFFICIAL", roleBadge: "STAFF", fullName: "Farrukh Karimzoda", country: "Tajikistan", gender: "male", dateOfBirth: "1997-06-01", sourceNote: null, badgeColorHex: "#6B7280" },
  // Renamed from UNK-S-002 — confirmed part of the Tajikistan delegation.
  { cardNo: "TJK-S-002", category: "OFFICIAL", roleBadge: "STAFF", fullName: "Shahzod IBROHIMOV", country: "Tajikistan", gender: "male", dateOfBirth: null, sourceNote: null, badgeColorHex: "#6B7280" },
  // Renamed from UNK-S-003 — confirmed local venue staff (Hangzhou Institute of
  // Technology), not part of any delegation.
  { cardNo: "CHN-S-001", category: "OFFICIAL", roleBadge: "STAFF", fullName: "袁大荣", country: "China", gender: "male", dateOfBirth: null, sourceNote: null, badgeColorHex: "#6B7280" },
];

async function main() {
  const { db } = await import("@/lib/db");
  const { eventBadges } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log(`→ Seeding ${badges.length} GATE China Camp 2026 event badge(s)…`);

  let inserted = 0;
  let skipped = 0;
  for (const badge of badges) {
    const [existing] = await db
      .select({ id: eventBadges.id })
      .from(eventBadges)
      .where(eq(eventBadges.cardNo, badge.cardNo))
      .limit(1);

    if (existing) {
      console.log(`  · ${badge.cardNo} already exists, skipping`);
      skipped++;
      continue;
    }

    await db.insert(eventBadges).values(badge);
    console.log(`  ✓ ${badge.cardNo} → ${badge.fullName}`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, skipped (already existed): ${skipped}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
