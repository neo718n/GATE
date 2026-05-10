# Data Flow Architecture

This document describes the data flow architecture in the GATE platform, following the pattern: **Database → Drizzle ORM → Server Actions → UI Components**.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Layer (PostgreSQL)](#database-layer-postgresql)
3. [ORM Layer (Drizzle)](#orm-layer-drizzle)
4. [Server Actions Layer](#server-actions-layer)
5. [UI Components Layer](#ui-components-layer)
6. [Cache Invalidation Strategy](#cache-invalidation-strategy)
7. [Data Fetching Patterns](#data-fetching-patterns)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## Architecture Overview

The GATE platform uses a unidirectional data flow architecture optimized for Next.js 14's App Router and React Server Components:

```
┌─────────────────────────────────────────────────────────────┐
│                       UI Components                         │
│              (React Server Components)                      │
│  • Server-side data fetching                               │
│  • Form actions calling server actions                     │
│  • Type-safe props from database queries                   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                    Data / Form Actions
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server Actions                           │
│              ("use server" functions)                       │
│  • Authorization checks (requireRole)                      │
│  • Business logic and validation                           │
│  • Database operations via Drizzle                         │
│  • Cache invalidation (revalidatePath)                     │
│  • Audit logging                                           │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                      ORM Queries
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Drizzle ORM                             │
│  • Type-safe query builder                                 │
│  • Schema definitions and relations                        │
│  • Query composition and joins                             │
│  • Type inference from schema                              │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                       SQL Queries
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                       │
│  • Data persistence                                         │
│  • Constraints and relationships                           │
│  • Indexes for performance                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Layer (PostgreSQL)

### Schema Definition

Database schema is defined using Drizzle's schema builder in `lib/db/schema.ts`:

```typescript
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: examTypeEnum("type").notNull().default("exam"),
  published: boolean("published").notNull().default(false),
  createdByUserId: text("created_by_user_id").references(() => user.id),
  // ... other fields
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Relations

Drizzle handles relations declaratively:

```typescript
export const examsRelations = relations(exams, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [exams.createdByUserId],
    references: [user.id],
  }),
  questions: many(questions),
  sessions: many(examSessions),
  subject: one(subjects, {
    fields: [exams.subjectId],
    references: [subjects.id],
  }),
  round: one(rounds, {
    fields: [exams.roundId],
    references: [rounds.id],
  }),
}));
```

### Enums

Type-safe enums are defined at the database level:

```typescript
export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "coordinator",
  "participant",
  "partner_contact",
  "career_applicant",
  "question_provider",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "draft",
  "submitted",
  "verified",
  "rejected",
]);
```

---

## ORM Layer (Drizzle)

### Database Connection

The database connection is initialized in `lib/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

### Query Patterns

Drizzle provides multiple query patterns:

#### 1. Query Builder (Recommended for complex queries)

```typescript
import { eq, desc, and } from "drizzle-orm";

// Simple select
const results = await db.query.exams.findMany({
  where: eq(exams.published, true),
});

// With relations
const exam = await db.query.exams.findFirst({
  where: eq(exams.id, examId),
  with: {
    questions: {
      orderBy: (q, { asc }) => [asc(q.order)],
    },
    sessions: true,
  },
});

// With conditions
const userExams = await db.query.exams.findMany({
  where: and(
    eq(exams.published, true),
    eq(exams.createdByUserId, userId)
  ),
  orderBy: (exams, { desc }) => [desc(exams.createdAt)],
});
```

#### 2. Insert Operations

```typescript
// Insert with returning
const [exam] = await db.insert(exams).values({
  title: "Physics Olympiad",
  type: "exam",
  createdByUserId: session.user.id,
  // ... other fields
}).returning({ id: exams.id });

// Insert multiple
await db.insert(questions).values([
  { examId: 1, content: "Question 1", type: "mcq" },
  { examId: 1, content: "Question 2", type: "numeric" },
]);
```

#### 3. Update Operations

```typescript
// Update with conditions
await db.update(exams)
  .set({
    published: true,
    updatedAt: new Date(),
  })
  .where(eq(exams.id, examId));

// Update with multiple conditions
await db.update(examSessions)
  .set({ endedAt: new Date() })
  .where(and(
    eq(examSessions.userId, userId),
    eq(examSessions.examId, examId)
  ));
```

#### 4. Delete Operations

```typescript
// Simple delete
await db.delete(questions)
  .where(eq(questions.id, questionId));

// Cascade deletes are handled by database constraints
await db.delete(exams)
  .where(eq(exams.id, examId));
// Associated questions, sessions, etc. are deleted via CASCADE
```

#### 5. Complex Queries with SQL

```typescript
import { sql } from "drizzle-orm";

// Aggregations
const stats = await db
  .select({
    examId: examSessions.examId,
    participantCount: sql<number>`count(distinct ${examSessions.userId})`,
    avgScore: sql<number>`avg(${examSessions.score})`,
  })
  .from(examSessions)
  .where(eq(examSessions.completedAt, sql`is not null`))
  .groupBy(examSessions.examId);
```

### Type Safety

Drizzle infers TypeScript types from the schema:

```typescript
// Type is automatically inferred
type Exam = typeof exams.$inferSelect;
type NewExam = typeof exams.$inferInsert;

// Use in functions
function processExam(exam: Exam) {
  // TypeScript knows all available fields
  console.log(exam.title, exam.published);
}
```

---

## Server Actions Layer

Server actions are the primary way to mutate data and handle form submissions in the GATE platform.

### Server Action Structure

All server actions follow this pattern:

```typescript
"use server";

import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit";

export async function createExam(formData: FormData) {
  // 1. Authorization
  const session = await requireRole(["admin", "super_admin"]);

  // 2. Extract and validate data
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title is required");

  // 3. Database operation
  const [exam] = await db.insert(exams).values({
    title,
    createdByUserId: session.user.id,
    // ... other fields
  }).returning({ id: exams.id });

  // 4. Audit log (if needed)
  await writeAuditLog(session.user.id, "create_exam", "exam", exam.id);

  // 5. Cache invalidation
  revalidatePath("/admin/exams");

  // 6. Navigation (if needed)
  redirect(`/admin/exams/${exam.id}`);
}
```

### Key Principles

#### 1. Authorization First

Every server action must start with authorization:

```typescript
// Require specific roles
const session = await requireRole(["admin", "super_admin"]);

// Or check ownership
async function assertExamOwnership(examId: number, userId: string, role: string) {
  if (role === "question_provider") {
    const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) });
    if (!exam) throw new Error("Imtihon topilmadi");
    if (exam.createdByUserId !== userId) {
      throw new Error("Bu imtihonni boshqarish huquqingiz yo'q");
    }
  }
}
```

#### 2. Input Validation

Always validate and sanitize inputs:

```typescript
// Trim strings
const title = (formData.get("title") as string)?.trim();

// Parse numbers safely
const examId = parseInt(formData.get("examId") as string);
const points = parseInt(formData.get("points") as string) || 1;

// Parse dates
const windowStart = formData.get("windowStart") 
  ? new Date(formData.get("windowStart") as string) 
  : null;

// Handle checkboxes
const shuffleQuestions = formData.get("shuffleQuestions") === "on";

// Handle arrays
const targetGrades = formData.getAll("targetGrades") as string[];

// Validate required fields
if (!title) throw new Error("Title is required");
```

#### 3. Atomic Operations

Keep database operations atomic and handle errors:

```typescript
// Use transactions for multiple related operations
await db.transaction(async (tx) => {
  const [exam] = await tx.insert(exams)
    .values({ /* ... */ })
    .returning();
  
  await tx.insert(questions)
    .values(questionData.map(q => ({ ...q, examId: exam.id })));
});
```

#### 4. Cache Invalidation

Always revalidate affected paths after mutations:

```typescript
// Revalidate specific paths
revalidatePath(`/admin/exams/${examId}`);
revalidatePath("/admin/exams");

// Revalidate multiple paths for different roles
revalidatePath(`/admin/exams/${examId}`);
revalidatePath(`/qp/exams/${examId}`);
```

#### 5. Return Values

Server actions can return data or use Next.js navigation:

```typescript
// Option 1: Redirect (for form submissions)
redirect(`/admin/exams/${exam.id}`);

// Option 2: Return data (for client-side handling)
return { success: true, examId: exam.id };

// Option 3: Throw errors (caught by error boundaries)
throw new Error("Validation failed");
```

### Example: Complete CRUD Server Actions

See `lib/actions/exam.ts` for a complete example:

- `createExam(formData)` - Create new exam
- `updateExam(examId, formData)` - Update existing exam
- `togglePublishExam(formData)` - Toggle published status
- `deleteExam(formData)` - Delete exam with audit log
- `createQuestion(formData)` - Add question to exam
- `updateQuestion(formData)` - Update question
- `deleteQuestion(formData)` - Remove question
- `reorderQuestions(examId, questionIds)` - Reorder questions

---

## UI Components Layer

### React Server Components (Data Fetching)

UI components in the App Router are React Server Components by default and fetch data directly:

```typescript
// app/(dashboard)/participant/exam/page.tsx
export default async function ExamPage() {
  // 1. Authorization
  const session = await requireRole(["participant", "admin", "super_admin"]);

  // 2. Fetch data with relations
  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
    with: { 
      subjects: { 
        with: { subject: true } 
      } 
    },
  });

  // 3. Conditional fetching
  const isPaid = participant?.paymentStatus === "paid";
  const activeCycle = isPaid
    ? await db.query.cycles.findFirst({
        where: eq(cycles.id, participant!.cycleId!),
        with: { 
          rounds: { 
            orderBy: (r, { asc }) => [asc(r.order)] 
          } 
        },
      })
    : null;

  // 4. Render with fetched data
  return (
    <div>
      {participant && (
        <p>Subject: {participant.subjects[0]?.subject?.name}</p>
      )}
      {/* ... rest of UI */}
    </div>
  );
}
```

### Form Actions

Forms use server actions directly via the `action` prop:

```typescript
// Client Component with form
"use client";

import { createExam } from "@/lib/actions/exam";

export function CreateExamForm() {
  return (
    <form action={createExam}>
      <input name="title" required />
      <select name="type">
        <option value="exam">Exam</option>
        <option value="practice">Practice</option>
      </select>
      <input type="checkbox" name="shuffleQuestions" />
      <button type="submit">Create Exam</button>
    </form>
  );
}
```

### Progressive Enhancement with useFormStatus

For better UX, use `useFormStatus` hook:

```typescript
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Exam"}
    </button>
  );
}

export function CreateExamForm() {
  return (
    <form action={createExam}>
      <input name="title" required />
      <SubmitButton />
    </form>
  );
}
```

### Client-Side Actions with useTransition

For programmatic actions:

```typescript
"use client";

import { useTransition } from "react";
import { deleteExam } from "@/lib/actions/exam";

export function DeleteButton({ examId }: { examId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("examId", examId.toString());
          await deleteExam(formData);
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

---

## Cache Invalidation Strategy

Next.js App Router caches rendered pages aggressively. After mutations, we must invalidate affected caches.

### revalidatePath

Use `revalidatePath` to invalidate specific routes:

```typescript
import { revalidatePath } from "next/cache";

// Invalidate a specific page
revalidatePath("/admin/exams");

// Invalidate a dynamic route
revalidatePath(`/admin/exams/${examId}`);

// Invalidate all pages under a path
revalidatePath("/admin/exams", "layout");
```

### When to Revalidate

Revalidate after every mutation:

```typescript
export async function createExam(formData: FormData) {
  // ... create exam
  
  // Revalidate list page (shows new exam)
  revalidatePath("/admin/exams");
  
  // Redirect to detail page (will be fresh)
  redirect(`/admin/exams/${exam.id}`);
}

export async function updateExam(examId: number, formData: FormData) {
  // ... update exam
  
  // Revalidate detail page
  revalidatePath(`/admin/exams/${examId}`);
  
  // Revalidate list page (in case title changed)
  revalidatePath("/admin/exams");
}

export async function deleteExam(formData: FormData) {
  const examId = parseInt(formData.get("examId") as string);
  
  // ... delete exam
  
  // Revalidate list page
  revalidatePath("/admin/exams");
  
  // Redirect away from deleted resource
  redirect("/admin/exams");
}
```

### Multi-Role Invalidation

When an action affects multiple roles, revalidate all affected paths:

```typescript
export async function updateQuestion(formData: FormData) {
  const examId = parseInt(formData.get("examId") as string);
  const role = (session.user as { role?: string }).role ?? "participant";
  
  // ... update question
  
  // Revalidate for both admin and question provider
  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath(`/qp/exams/${examId}`);
  
  // Redirect based on role
  redirect(role === "question_provider" 
    ? `/qp/exams/${examId}` 
    : `/admin/exams/${examId}`
  );
}
```

---

## Data Fetching Patterns

### Pattern 1: Simple Data Fetch

For pages that just display data:

```typescript
export default async function ExamListPage() {
  const session = await requireRole(["admin"]);
  
  const exams = await db.query.exams.findMany({
    orderBy: (exams, { desc }) => [desc(exams.createdAt)],
  });

  return <ExamList exams={exams} />;
}
```

### Pattern 2: Fetch with Relations

For data that needs related entities:

```typescript
export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  const examId = parseInt(params.id);
  
  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: {
      questions: {
        orderBy: (q, { asc }) => [asc(q.order)],
      },
      sessions: {
        with: {
          user: true,
        },
      },
      createdBy: true,
    },
  });

  if (!exam) notFound();

  return <ExamDetail exam={exam} />;
}
```

### Pattern 3: Conditional Fetching

Fetch additional data based on initial query:

```typescript
export default async function ParticipantDashboard() {
  const session = await requireRole(["participant"]);
  
  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  // Only fetch cycle if participant is paid
  const cycle = participant?.paymentStatus === "paid"
    ? await db.query.cycles.findFirst({
        where: eq(cycles.id, participant.cycleId!),
        with: { rounds: true },
      })
    : null;

  return <Dashboard participant={participant} cycle={cycle} />;
}
```

### Pattern 4: Parallel Fetching

Fetch independent data in parallel:

```typescript
export default async function AdminDashboard() {
  await requireRole(["admin"]);
  
  // Fetch multiple independent queries in parallel
  const [exams, participants, cycles] = await Promise.all([
    db.query.exams.findMany({ limit: 10 }),
    db.query.participants.findMany({ limit: 10 }),
    db.query.cycles.findMany({ limit: 5 }),
  ]);

  return (
    <Dashboard 
      exams={exams} 
      participants={participants} 
      cycles={cycles} 
    />
  );
}
```

### Pattern 5: Aggregated Data

For dashboard statistics:

```typescript
export default async function StatsPage() {
  const [
    totalExams,
    publishedExams,
    totalSessions,
    completedSessions,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(exams),
    db.select({ count: sql<number>`count(*)` })
      .from(exams)
      .where(eq(exams.published, true)),
    db.select({ count: sql<number>`count(*)` }).from(examSessions),
    db.select({ count: sql<number>`count(*)` })
      .from(examSessions)
      .where(sql`${examSessions.completedAt} is not null`),
  ]);

  return <Stats data={{ totalExams, publishedExams, /* ... */ }} />;
}
```

---

## Error Handling

### Server Action Errors

Errors in server actions are caught by error boundaries:

```typescript
// lib/actions/exam.ts
export async function createExam(formData: FormData) {
  const session = await requireRole(["admin"]);
  
  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Title is required"); // Caught by error boundary
  }

  try {
    const [exam] = await db.insert(exams)
      .values({ title, /* ... */ })
      .returning();
    
    revalidatePath("/admin/exams");
    redirect(`/admin/exams/${exam.id}`);
  } catch (error) {
    console.error("Failed to create exam:", error);
    throw new Error("Failed to create exam");
  }
}
```

### Error Boundaries

Create error boundaries for graceful error handling:

```typescript
// app/(dashboard)/admin/exams/error.tsx
"use client";

export default function ExamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Database Constraint Errors

Handle database constraint violations:

```typescript
export async function createParticipant(formData: FormData) {
  try {
    await db.insert(participants).values({ /* ... */ });
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === "23505") {
      throw new Error("A participant with this email already exists");
    }
    
    // Handle foreign key violations
    if (error.code === "23503") {
      throw new Error("Invalid cycle or subject ID");
    }
    
    throw error;
  }
}
```

---

## Best Practices

### 1. Always Use Server Actions for Mutations

❌ **Don't**: Create API routes for mutations

```typescript
// app/api/exams/route.ts - AVOID
export async function POST(request: Request) {
  const body = await request.json();
  // ...
}
```

✅ **Do**: Use server actions

```typescript
// lib/actions/exam.ts
"use server";

export async function createExam(formData: FormData) {
  // ...
}
```

### 2. Keep Authorization at the Top

✅ **Always start with authorization**:

```typescript
export async function updateExam(examId: number, formData: FormData) {
  // Authorization FIRST
  const session = await requireRole(["admin", "super_admin"]);
  
  // Then business logic
  const title = (formData.get("title") as string)?.trim();
  // ...
}
```

### 3. Use Drizzle Query Builder

✅ **Prefer Drizzle's query builder** for type safety:

```typescript
// ✅ Type-safe
const exam = await db.query.exams.findFirst({
  where: eq(exams.id, examId),
  with: { questions: true },
});

// ❌ Avoid raw SQL unless necessary
const exam = await db.execute(sql`SELECT * FROM exams WHERE id = ${examId}`);
```

### 4. Always Revalidate After Mutations

✅ **Revalidate all affected paths**:

```typescript
export async function updateExam(examId: number, formData: FormData) {
  // ... mutation
  
  // Revalidate detail page
  revalidatePath(`/admin/exams/${examId}`);
  
  // Revalidate list page
  revalidatePath("/admin/exams");
}
```

### 5. Validate Inputs Thoroughly

✅ **Always validate and sanitize**:

```typescript
// Trim strings
const title = (formData.get("title") as string)?.trim();

// Validate required fields
if (!title) throw new Error("Title is required");

// Parse numbers safely
const points = parseInt(formData.get("points") as string) || 1;

// Validate enums
const type = formData.get("type") as "exam" | "practice";
if (!["exam", "practice"].includes(type)) {
  throw new Error("Invalid exam type");
}
```

### 6. Use Transactions for Related Operations

✅ **Use transactions** for atomicity:

```typescript
await db.transaction(async (tx) => {
  const [cycle] = await tx.insert(cycles)
    .values({ /* ... */ })
    .returning();
  
  await tx.insert(rounds).values(
    roundData.map(r => ({ ...r, cycleId: cycle.id }))
  );
});
```

### 7. Fetch Only What You Need

✅ **Be selective with relations**:

```typescript
// ✅ Only fetch needed relations
const exam = await db.query.exams.findFirst({
  where: eq(exams.id, examId),
  with: {
    questions: true, // Only if needed
  },
});

// ❌ Don't over-fetch
const exam = await db.query.exams.findFirst({
  where: eq(exams.id, examId),
  with: {
    questions: { with: { /* ... */ } },
    sessions: { with: { /* ... */ } },
    // ... too much data
  },
});
```

### 8. Handle Null and Undefined Safely

✅ **Use optional chaining and nullish coalescing**:

```typescript
// Safe navigation
const subjectName = participant?.subjects[0]?.subject?.name ?? "—";

// Safe date handling
const startDate = formData.get("startDate") 
  ? new Date(formData.get("startDate") as string) 
  : null;
```

### 9. Use TypeScript Types from Schema

✅ **Infer types from schema**:

```typescript
type Exam = typeof exams.$inferSelect;
type NewExam = typeof exams.$inferInsert;

function processExam(exam: Exam) {
  // Fully typed
}
```

### 10. Document Complex Queries

✅ **Add comments for complex logic**:

```typescript
// Calculate average score per exam, excluding incomplete sessions
const examStats = await db
  .select({
    examId: examSessions.examId,
    avgScore: sql<number>`avg(${examSessions.score})`,
    completionRate: sql<number>`
      count(${examSessions.completedAt}) * 100.0 / count(*)
    `,
  })
  .from(examSessions)
  .groupBy(examSessions.examId);
```

---

## Summary

The GATE platform's data flow follows a clear, unidirectional pattern:

1. **Database** (PostgreSQL) - Single source of truth
2. **Drizzle ORM** - Type-safe data access layer
3. **Server Actions** - Business logic and mutations with authorization
4. **UI Components** - Server-side rendering with direct database access

This architecture provides:

- ✅ Type safety end-to-end
- ✅ Automatic cache invalidation
- ✅ Server-side authorization
- ✅ Progressive enhancement
- ✅ Optimistic UI updates
- ✅ Error handling with boundaries
- ✅ Audit logging capabilities
- ✅ Zero client-side JavaScript for data fetching

For more details:
- Database schema: See [DATABASE.md](./DATABASE.md)
- Authorization: See [AUTHORIZATION.md](./AUTHORIZATION.md)
- Route structure: See [ROUTE_MAPPING.md](./ROUTE_MAPPING.md)
- Exam lifecycle: See [EXAM_LIFECYCLE.md](./EXAM_LIFECYCLE.md)
