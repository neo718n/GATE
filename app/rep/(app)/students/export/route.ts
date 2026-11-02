import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { getRepSession } from "@/lib/reps/auth";

const COLUMNS = [
  ["reference", "Application"],
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["dateOfBirth", "Date of birth"],
  ["gender", "Gender"],
  ["country", "Country"],
  ["city", "City"],
  ["school", "School"],
  ["grade", "Grade"],
  ["subject", "Subject"],
  ["email", "Email"],
  ["contactMethod", "Contact via"],
  ["contactValue", "Contact"],
  ["guardianName", "Guardian"],
  ["guardianPhone", "Guardian phone"],
  ["createdAt", "Added"],
] as const;

const cell = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const rep = await getRepSession();
  if (!rep) return new Response("Unauthorized", { status: 401 });
  const rows = await db.query.applications.findMany({
    where: and(eq(applications.representativeId, rep.id), ne(applications.status, "cancelled")),
    orderBy: desc(applications.createdAt),
  });
  const csv = [
    COLUMNS.map(([, h]) => h).join(","),
    ...rows.map((r) => COLUMNS.map(([k]) => cell(r[k])).join(",")),
  ].join("\n");
  // BOM so Excel opens UTF-8 correctly.
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gate-students-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
