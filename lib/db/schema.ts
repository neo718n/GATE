import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ────────────────────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "coordinator",
  "participant",
  "partner_contact",
  "career_applicant",
  "question_provider",
]);

export const cycleStatusEnum = pgEnum("cycle_status", [
  "planning",
  "registration_open",
  "active",
  "completed",
  "archived",
]);

export const roundFormatEnum = pgEnum("round_format", [
  "online",
  "onsite",
  "hybrid",
]);

export const roundRegistrationStatusEnum = pgEnum("round_registration_status", [
  "closed",
  "soon",
  "open",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "draft",
  "submitted",
  "verified",
  "rejected",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "waived",
]);

export const awardEnum = pgEnum("award", [
  "gold",
  "silver",
  "bronze",
  "honorable_mention",
  "participation",
]);

export const partnerTypeEnum = pgEnum("partner_type", [
  "university",
  "school",
  "academic_institution",
  "organization",
]);

export const partnerStatusEnum = pgEnum("partner_status", [
  "pending",
  "approved",
  "rejected",
]);

export const positionTypeEnum = pgEnum("position_type", [
  "full_time",
  "part_time",
  "contract",
  "volunteer",
]);

export const careerStatusEnum = pgEnum("career_status", [
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
]);

export const stripePaymentStatusEnum = pgEnum("stripe_payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "identity",
  "photo",
  "certificate",
  "invoice",
  "cv",
  "other",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "prefer_not_to_say",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "draft",
  "pending_payment",
  "confirmed",
  "cancelled",
]);

export const enrollmentPaymentStatusEnum = pgEnum("enrollment_payment_status", [
  "unpaid",
  "paid",
  "refunded",
]);

// ────────────────────────────────────────────────────────────────────────────
// Better Auth core tables
// ────────────────────────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),

  role: roleEnum("role").notNull().default("participant"),
  firstName: text("firstName"),
  lastName: text("lastName"),
  country: text("country"),
  phone: text("phone"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (t) => ({
  userIdIdx: index("session_user_id_idx").on(t.userId),
}));

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ────────────────────────────────────────────────────────────────────────────
// Domain tables
// ────────────────────────────────────────────────────────────────────────────

export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: cycleStatusEnum("status").notNull().default("planning"),
  stripeFeePercent: integer("stripe_fee_percent").notNull().default(290),
  stripeFeeFixedCents: integer("stripe_fee_fixed_cents").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  cycleId: integer("cycle_id")
    .notNull()
    .references(() => cycles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull().default(1),
  format: roundFormatEnum("format").notNull().default("online"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  venue: text("venue"),
  feeUsd: integer("fee_usd").notNull().default(0),
  registrationStatus: roundRegistrationStatusEnum("registration_status").notNull().default("closed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  cycleIdIdx: index("rounds_cycle_id_idx").on(t.cycleId),
}));

export const cycleSubjects = pgTable(
  "cycle_subjects",
  {
    cycleId: integer("cycle_id")
      .notNull()
      .references(() => cycles.id, { onDelete: "cascade" }),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cycleId, t.subjectId] }),
  }),
);

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  cycleId: integer("cycle_id").references(() => cycles.id),
  roundId: integer("round_id").references(() => rounds.id),
  fullName: text("full_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  country: text("country").notNull(),
  city: text("city"),
  school: text("school"),
  grade: text("grade"),
  phone: text("phone"),
  gender: genderEnum("gender"),
  registrationStatus: registrationStatusEnum("registration_status")
    .notNull()
    .default("draft"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("unpaid"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  cycleIdIdx: index("participants_cycle_id_idx").on(t.cycleId),
  roundIdIdx: index("participants_round_id_idx").on(t.roundId),
  registrationStatusIdx: index("participants_registration_status_idx").on(t.registrationStatus),
  paymentStatusIdx: index("participants_payment_status_idx").on(t.paymentStatus),
}));

export const participantSubjects = pgTable(
  "participant_subjects",
  {
    participantId: integer("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.participantId, t.subjectId] }),
  }),
);

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  roundId: integer("round_id")
    .notNull()
    .references(() => rounds.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  enrollmentStatus: enrollmentStatusEnum("enrollment_status")
    .notNull()
    .default("draft"),
  paymentStatus: enrollmentPaymentStatusEnum("payment_status")
    .notNull()
    .default("unpaid"),
  paymentId: integer("payment_id").references(() => payments.id, { onDelete: "set null" }),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  uniqueEnrollment: unique().on(t.participantId, t.roundId, t.subjectId),
  participantIdIdx: index("enrollments_participant_id_idx").on(t.participantId),
  roundIdIdx: index("enrollments_round_id_idx").on(t.roundId),
  participantStatusIdx: index("enrollments_participant_status_idx").on(t.participantId, t.enrollmentStatus),
  roundStatusIdx: index("enrollments_round_status_idx").on(t.roundId, t.enrollmentStatus),
}));

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  cycleId: integer("cycle_id")
    .notNull()
    .references(() => cycles.id),
  roundId: integer("round_id").references(() => rounds.id, { onDelete: "set null" }),
  score: numeric("score"),
  maxScore: numeric("max_score"),
  rank: integer("rank"),
  award: awardEnum("award"),
  certificateUrl: text("certificate_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  participantIdIdx: index("results_participant_id_idx").on(t.participantId),
  cycleIdIdx: index("results_cycle_id_idx").on(t.cycleId),
  subjectIdIdx: index("results_subject_id_idx").on(t.subjectId),
}));

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  organizationName: text("organization_name").notNull(),
  type: partnerTypeEnum("type").notNull(),
  country: text("country").notNull(),
  city: text("city"),
  website: text("website"),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  cooperationType: text("cooperation_type"),
  message: text("message"),
  status: partnerStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location"),
  type: positionTypeEnum("type").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  active: boolean("active").notNull().default(true),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
});

export const careerApplications = pgTable("career_applications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  positionId: integer("position_id").references(() => positions.id, {
    onDelete: "set null",
  }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  cvUrl: text("cv_url"),
  motivationText: text("motivation_text"),
  status: careerStatusEnum("status").notNull().default("submitted"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  participantId: integer("participant_id").references(() => participants.id, {
    onDelete: "set null",
  }),
  cycleId: integer("cycle_id").references(() => cycles.id),
  roundId: integer("round_id").references(() => rounds.id, { onDelete: "set null" }),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  cardLast4: text("card_last4"),
  cardBrand: text("card_brand"),
  amountCents: integer("amount_cents").notNull(),
  serviceFeeCents: integer("service_fee_cents").default(0),
  currency: text("currency").notNull().default("usd"),
  status: stripePaymentStatusEnum("stripe_payment_status")
    .notNull()
    .default("pending"),
  receiptUrl: text("receipt_url"),
  invoicePdfKey: text("invoice_pdf_key"),
  receiptPdfKey: text("receipt_pdf_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userIdIdx: index("payments_user_id_idx").on(t.userId),
  participantIdIdx: index("payments_participant_id_idx").on(t.participantId),
  statusIdx: index("payments_status_idx").on(t.status),
}));

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  participantId: integer("participant_id").references(() => participants.id, {
    onDelete: "set null",
  }),
  type: documentTypeEnum("type").notNull().default("other"),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  size: integer("size"),
  mimeType: text("mime_type"),
  archivedAt: timestamp("archived_at"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  recipientFilter: text("recipient_filter").notNull().default("all"),
  cycleId: integer("cycle_id").references(() => cycles.id, { onDelete: "set null" }),
  sentByUserId: text("sent_by_user_id").references(() => user.id, { onDelete: "set null" }),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const examTypeEnum = pgEnum("exam_type", ["practice", "exam"]);

export const questionTypeEnum = pgEnum("question_type", ["mcq", "numeric", "open"]);

export const examSessionStatusEnum = pgEnum("exam_session_status", [
  "active",
  "submitted",
  "timed_out",
]);

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
  roundId: integer("round_id").references(() => rounds.id, { onDelete: "set null" }),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  type: examTypeEnum("type").notNull().default("exam"),
  instructions: text("instructions"),
  durationMinutes: integer("duration_minutes"),
  windowStart: timestamp("window_start"),
  windowEnd: timestamp("window_end"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(true),
  questionsPerSession: integer("questions_per_session"),
  targetGrades: text("target_grades").array().notNull().default(sql`ARRAY[]::text[]`),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  roundIdIdx: index("exams_round_id_idx").on(t.roundId),
  subjectIdIdx: index("exams_subject_id_idx").on(t.subjectId),
  publishedIdx: index("exams_published_idx").on(t.published),
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  type: questionTypeEnum("type").notNull().default("mcq"),
  order: integer("order").notNull().default(0),
  content: text("content").notNull(),
  options: jsonb("options").$type<{ id: string; text: string }[]>(),
  correctAnswer: text("correct_answer"),
  tolerance: numeric("tolerance"),
  grades: text("grades").array().notNull().default(sql`ARRAY[]::text[]`),
  points: integer("points").notNull().default(1),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  examIdOrderIdx: index("questions_exam_id_order_idx").on(t.examId, t.order),
}));

export const examSessions = pgTable("exam_sessions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  questionOrder: jsonb("question_order").$type<number[]>(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  deadlineAt: timestamp("deadline_at"),
  submittedAt: timestamp("submitted_at"),
  status: examSessionStatusEnum("status").notNull().default("active"),
  score: numeric("score"),
  tabSwitchCount: integer("tab_switch_count").notNull().default(0),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  examIdIdx: index("exam_sessions_exam_id_idx").on(t.examId),
  participantIdIdx: index("exam_sessions_participant_id_idx").on(t.participantId),
  examParticipantIdx: index("exam_sessions_exam_participant_idx").on(t.examId, t.participantId),
  statusIdx: index("exam_sessions_status_idx").on(t.status),
}));

export const examAnswers = pgTable(
  "exam_answers",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => examSessions.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answer: text("answer"),
    isCorrect: boolean("is_correct"),
    pointsAwarded: numeric("points_awarded"),
    flagged: boolean("flagged").notNull().default(false),
    answeredAt: timestamp("answered_at"),
    gradedAt: timestamp("graded_at"),
    gradedByUserId: text("graded_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    sessionQuestion: unique().on(t.sessionId, t.questionId),
    sessionIdIdx: index("exam_answers_session_id_idx").on(t.sessionId),
    questionIdIdx: index("exam_answers_question_id_idx").on(t.questionId),
  }),
);

// ────────────────────────────────────────────────────────────────────────────
// Relations
// ────────────────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  participant: one(participants, {
    fields: [user.id],
    references: [participants.userId],
  }),
  partner: one(partners, {
    fields: [user.id],
    references: [partners.userId],
  }),
  sessions: many(session),
  accounts: many(account),
  payments: many(payments),
  documents: many(documents),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const cycleRelations = relations(cycles, ({ many }) => ({
  participants: many(participants),
  results: many(results),
  rounds: many(rounds),
  subjects: many(cycleSubjects),
  payments: many(payments),
}));

export const roundRelations = relations(rounds, ({ one, many }) => ({
  cycle: one(cycles, { fields: [rounds.cycleId], references: [cycles.id] }),
  participants: many(participants),
  results: many(results),
  payments: many(payments),
}));

export const cycleSubjectRelations = relations(cycleSubjects, ({ one }) => ({
  cycle: one(cycles, {
    fields: [cycleSubjects.cycleId],
    references: [cycles.id],
  }),
  subject: one(subjects, {
    fields: [cycleSubjects.subjectId],
    references: [subjects.id],
  }),
}));

export const subjectRelations = relations(subjects, ({ many }) => ({
  results: many(results),
  participants: many(participantSubjects),
  cycles: many(cycleSubjects),
}));

export const participantRelations = relations(participants, ({ one, many }) => ({
  user: one(user, { fields: [participants.userId], references: [user.id] }),
  cycle: one(cycles, {
    fields: [participants.cycleId],
    references: [cycles.id],
  }),
  round: one(rounds, {
    fields: [participants.roundId],
    references: [rounds.id],
  }),
  subjects: many(participantSubjects),
  results: many(results),
  payments: many(payments),
  documents: many(documents),
}));

export const participantSubjectRelations = relations(
  participantSubjects,
  ({ one }) => ({
    participant: one(participants, {
      fields: [participantSubjects.participantId],
      references: [participants.id],
    }),
    subject: one(subjects, {
      fields: [participantSubjects.subjectId],
      references: [subjects.id],
    }),
    enrollment: one(enrollments, {
      fields: [participantSubjects.enrollmentId],
      references: [enrollments.id],
    }),
  }),
);

export const resultRelations = relations(results, ({ one }) => ({
  participant: one(participants, {
    fields: [results.participantId],
    references: [participants.id],
  }),
  subject: one(subjects, {
    fields: [results.subjectId],
    references: [subjects.id],
  }),
  cycle: one(cycles, { fields: [results.cycleId], references: [cycles.id] }),
  round: one(rounds, { fields: [results.roundId], references: [rounds.id] }),
}));

export const partnerRelations = relations(partners, ({ one }) => ({
  user: one(user, { fields: [partners.userId], references: [user.id] }),
}));

export const positionRelations = relations(positions, ({ many }) => ({
  applications: many(careerApplications),
}));

export const careerApplicationRelations = relations(
  careerApplications,
  ({ one }) => ({
    user: one(user, {
      fields: [careerApplications.userId],
      references: [user.id],
    }),
    position: one(positions, {
      fields: [careerApplications.positionId],
      references: [positions.id],
    }),
  }),
);

export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(user, { fields: [payments.userId], references: [user.id] }),
  participant: one(participants, {
    fields: [payments.participantId],
    references: [participants.id],
  }),
  cycle: one(cycles, { fields: [payments.cycleId], references: [cycles.id] }),
  round: one(rounds, { fields: [payments.roundId], references: [rounds.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  sentBy: one(user, { fields: [notifications.sentByUserId], references: [user.id] }),
  cycle: one(cycles, { fields: [notifications.cycleId], references: [cycles.id] }),
}));

export const documentRelations = relations(documents, ({ one }) => ({
  user: one(user, { fields: [documents.userId], references: [user.id] }),
  participant: one(participants, {
    fields: [documents.participantId],
    references: [participants.id],
  }),
}));

export const examRelations = relations(exams, ({ one, many }) => ({
  round: one(rounds, { fields: [exams.roundId], references: [rounds.id] }),
  subject: one(subjects, { fields: [exams.subjectId], references: [subjects.id] }),
  questions: many(questions),
  sessions: many(examSessions),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  exam: one(exams, { fields: [questions.examId], references: [exams.id] }),
  answers: many(examAnswers),
}));

export const examSessionRelations = relations(examSessions, ({ one, many }) => ({
  exam: one(exams, { fields: [examSessions.examId], references: [exams.id] }),
  participant: one(participants, {
    fields: [examSessions.participantId],
    references: [participants.id],
  }),
  answers: many(examAnswers),
}));

export const examAnswerRelations = relations(examAnswers, ({ one }) => ({
  session: one(examSessions, {
    fields: [examAnswers.sessionId],
    references: [examSessions.id],
  }),
  question: one(questions, {
    fields: [examAnswers.questionId],
    references: [questions.id],
  }),
  gradedBy: one(user, {
    fields: [examAnswers.gradedByUserId],
    references: [user.id],
  }),
}));

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// Audit log
// ────────────────────────────────────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userIdIdx: index("audit_log_user_id_idx").on(t.userId),
  createdAtIdx: index("audit_log_created_at_idx").on(t.createdAt),
}));

export type AuditLog = typeof auditLog.$inferSelect;

export type Role = (typeof roleEnum.enumValues)[number];
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Cycle = typeof cycles.$inferSelect;
export type Round = typeof rounds.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Result = typeof results.$inferSelect;
export type Partner = typeof partners.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type CareerApplication = typeof careerApplications.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type ExamSession = typeof examSessions.$inferSelect;
export type ExamAnswer = typeof examAnswers.$inferSelect;
