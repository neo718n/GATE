"use server";

import { db } from "@/lib/db";
import { cycles, participants, subjects, user, results, partners, careerApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";

export async function createCycle(formData: FormData) {
  await requireRole(["super_admin"]);

  const name = (formData.get("name") as string)?.trim();
  const year = parseInt(formData.get("year") as string);
  const fee = parseInt(formData.get("registrationFeeUsd") as string) || 0;
  const venue = (formData.get("onsiteVenue") as string)?.trim() || null;
  const prelimStart = (formData.get("prelimStart") as string) || null;
  const prelimEnd = (formData.get("prelimEnd") as string) || null;
  const onsiteStart = (formData.get("onsiteStart") as string) || null;
  const onsiteEnd = (formData.get("onsiteEnd") as string) || null;

  if (!name || !year) throw new Error("Name and year are required");

  await db.insert(cycles).values({
    name,
    year,
    registrationFeeUsd: fee,
    onsiteVenue: venue,
    status: "planning",
    prelimStart: prelimStart ? new Date(prelimStart) : null,
    prelimEnd: prelimEnd ? new Date(prelimEnd) : null,
    onsiteStart: onsiteStart ? new Date(onsiteStart) : null,
    onsiteEnd: onsiteEnd ? new Date(onsiteEnd) : null,
  });

  revalidatePath("/admin/cycles");
}

export async function updateCycleStatus(id: number, status: string) {
  await requireRole(["super_admin", "admin"]);
  await db
    .update(cycles)
    .set({ status: status as typeof cycles.$inferInsert.status, updatedAt: new Date() })
    .where(eq(cycles.id, id));
  revalidatePath("/admin/cycles");
}

export async function updateParticipantStatus(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const id = parseInt(formData.get("id") as string);
  const status = formData.get("status") as string;
  await db
    .update(participants)
    .set({ registrationStatus: status as typeof participants.$inferInsert.registrationStatus, updatedAt: new Date() })
    .where(eq(participants.id, id));
  revalidatePath("/admin/participants");
}

export async function updateUserRole(formData: FormData) {
  await requireRole(["super_admin"]);
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  await db
    .update(user)
    .set({ role: role as typeof user.$inferInsert.role })
    .where(eq(user.id, userId));
  revalidatePath("/admin/users");
}

export async function createSubject(formData: FormData) {
  await requireRole(["super_admin"]);
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;
  if (!name || !slug) throw new Error("Name and slug are required");
  await db.insert(subjects).values({ name, slug, description, order, active: true });
  revalidatePath("/admin/subjects");
}

export async function toggleSubjectActive(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const active = formData.get("active") === "true";
  await db.update(subjects).set({ active: !active }).where(eq(subjects.id, id));
  revalidatePath("/admin/subjects");
}

export async function updatePartnerStatus(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const status = formData.get("status") as string;
  await db
    .update(partners)
    .set({ status: status as typeof partners.$inferInsert.status, updatedAt: new Date() })
    .where(eq(partners.id, id));
  revalidatePath("/admin/partners");
}

export async function updateCareerStatus(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const status = formData.get("status") as string;
  await db
    .update(careerApplications)
    .set({ status: status as typeof careerApplications.$inferInsert.status, updatedAt: new Date() })
    .where(eq(careerApplications.id, id));
  revalidatePath("/admin/careers");
}

export async function addResult(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const participantId = parseInt(formData.get("participantId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const stage = formData.get("stage") as "preliminary" | "onsite";
  const score = (formData.get("score") as string)?.trim() || null;
  const maxScore = (formData.get("maxScore") as string)?.trim() || null;
  const rank = parseInt(formData.get("rank") as string) || null;
  const award = (formData.get("award") as string) || null;

  await db.insert(results).values({
    participantId,
    subjectId,
    cycleId,
    stage,
    score,
    maxScore,
    rank,
    award: award as typeof results.$inferInsert.award ?? null,
    publishedAt: new Date(),
  });

  revalidatePath("/admin/results");
}

export async function seedDefaultSubjects() {
  await requireRole(["super_admin"]);

  const defaults = [
    { slug: "mathematics", name: "Mathematics", description: "Pure and applied mathematics — algebra, analysis, combinatorics, geometry, number theory.", order: 1 },
    { slug: "physics", name: "Physics", description: "Classical mechanics, electrodynamics, thermodynamics, optics, modern physics.", order: 2 },
    { slug: "chemistry", name: "Chemistry", description: "Organic, inorganic, physical, and analytical chemistry.", order: 3 },
    { slug: "biology", name: "Biology", description: "Molecular biology, genetics, biochemistry, cell biology, ecology.", order: 4 },
    { slug: "competitive-programming", name: "Competitive Programming", description: "Algorithms, data structures, computational problem-solving.", order: 5 },
    { slug: "english", name: "English", description: "Academic English — reading comprehension, writing, language analysis.", order: 6 },
  ];

  for (const s of defaults) {
    const existing = await db.query.subjects.findFirst({ where: eq(subjects.slug, s.slug) });
    if (!existing) {
      await db.insert(subjects).values({ ...s, active: true });
    }
  }

  revalidatePath("/admin/subjects");
}
