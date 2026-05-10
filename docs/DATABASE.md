# Database Schema Documentation

This document provides comprehensive documentation for the GATE Platform database schema, including all tables, enums, relationships, and indexes.

## Overview

The database is built using PostgreSQL with Drizzle ORM. It consists of 22 tables organized into three main categories:

1. **Authentication Tables** (4) - Better Auth core tables for user authentication
2. **Domain Tables** (17) - Application-specific business logic tables
3. **Audit Table** (1) - System audit logging

## Core Hierarchy

The exam system follows this hierarchy:

```
cycles
  └── rounds
        └── exams
              └── questions
                    └── exam_sessions (participant attempts)
                          └── exam_answers (individual question responses)
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    %% ══════════════════════════════════════════════════════════════════════
    %% Authentication Tables
    %% ══════════════════════════════════════════════════════════════════════
    
    user {
        text id PK
        text name
        text email UK
        boolean emailVerified
        text image
        timestamp createdAt
        timestamp updatedAt
        roleEnum role
        text firstName
        text lastName
        text country
        text phone
    }
    
    session {
        text id PK
        text userId FK
        text token UK
        timestamp expiresAt
        text ipAddress
        text userAgent
        timestamp createdAt
        timestamp updatedAt
    }
    
    account {
        text id PK
        text userId FK
        text accountId
        text providerId
        text accessToken
        text refreshToken
        timestamp createdAt
        timestamp updatedAt
    }
    
    verification {
        text id PK
        text identifier
        text value
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
    }
    
    %% ══════════════════════════════════════════════════════════════════════
    %% Core Exam Hierarchy
    %% ══════════════════════════════════════════════════════════════════════
    
    cycles {
        serial id PK
        integer year
        text name
        text description
        cycleStatusEnum status
        integer stripeFeePercent
        integer stripeFeeFixedCents
        timestamp createdAt
        timestamp updatedAt
    }
    
    rounds {
        serial id PK
        integer cycleId FK
        text name
        integer order
        roundFormatEnum format
        timestamp startDate
        timestamp endDate
        text venue
        integer feeUsd
        roundRegistrationStatusEnum registrationStatus
        timestamp createdAt
    }
    
    subjects {
        serial id PK
        text slug UK
        text name
        text description
        integer order
        boolean active
    }
    
    exams {
        serial id PK
        text createdByUserId FK
        integer roundId FK
        integer subjectId FK
        text title
        examTypeEnum type
        text instructions
        integer durationMinutes
        timestamp windowStart
        timestamp windowEnd
        boolean shuffleQuestions
        integer questionsPerSession
        text[] targetGrades
        boolean published
        timestamp createdAt
        timestamp updatedAt
    }
    
    questions {
        serial id PK
        integer examId FK
        questionTypeEnum type
        integer order
        text content
        jsonb options
        text correctAnswer
        numeric tolerance
        text[] grades
        integer points
        text explanation
        timestamp createdAt
        timestamp updatedAt
    }
    
    %% ══════════════════════════════════════════════════════════════════════
    %% Participants & Exam Sessions
    %% ══════════════════════════════════════════════════════════════════════
    
    participants {
        serial id PK
        text userId FK_UK
        integer cycleId FK
        integer roundId FK
        text fullName
        date dateOfBirth
        text country
        text city
        text school
        text grade
        text phone
        genderEnum gender
        registrationStatusEnum registrationStatus
        paymentStatusEnum paymentStatus
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
    
    exam_sessions {
        serial id PK
        integer examId FK
        integer participantId FK
        jsonb questionOrder
        timestamp startedAt
        timestamp deadlineAt
        timestamp submittedAt
        examSessionStatusEnum status
        numeric score
        integer tabSwitchCount
        text ipAddress
        text userAgent
        timestamp archivedAt
        timestamp createdAt
    }
    
    exam_answers {
        serial id PK
        integer sessionId FK
        integer questionId FK
        text answer
        boolean isCorrect
        numeric pointsAwarded
        boolean flagged
        timestamp answeredAt
        timestamp gradedAt
        text gradedByUserId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    results {
        serial id PK
        integer participantId FK
        integer subjectId FK
        integer cycleId FK
        integer roundId FK
        numeric score
        numeric maxScore
        integer rank
        awardEnum award
        text certificateUrl
        timestamp publishedAt
        timestamp createdAt
    }
    
    %% ══════════════════════════════════════════════════════════════════════
    %% Join Tables
    %% ══════════════════════════════════════════════════════════════════════
    
    cycle_subjects {
        integer cycleId PK_FK
        integer subjectId PK_FK
    }
    
    participant_subjects {
        integer participantId PK_FK
        integer subjectId PK_FK
    }
    
    %% ══════════════════════════════════════════════════════════════════════
    %% Supporting Entities
    %% ══════════════════════════════════════════════════════════════════════
    
    partners {
        serial id PK
        text userId FK
        text organizationName
        partnerTypeEnum type
        text country
        text city
        text website
        text contactName
        text contactEmail
        text contactPhone
        text cooperationType
        text message
        partnerStatusEnum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    positions {
        serial id PK
        text title
        text location
        positionTypeEnum type
        text description
        text requirements
        boolean active
        timestamp postedAt
    }
    
    career_applications {
        serial id PK
        text userId FK
        integer positionId FK
        text fullName
        text email
        text phone
        text country
        text cvUrl
        text motivationText
        careerStatusEnum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    payments {
        serial id PK
        text userId FK
        integer participantId FK
        integer cycleId FK
        integer roundId FK
        text stripeCheckoutSessionId UK
        text stripePaymentIntentId
        text stripeChargeId
        text cardLast4
        text cardBrand
        integer amountCents
        integer serviceFeeCents
        text currency
        stripePaymentStatusEnum status
        text receiptUrl
        text invoicePdfKey
        text receiptPdfKey
        timestamp createdAt
        timestamp updatedAt
    }
    
    documents {
        serial id PK
        text userId FK
        integer participantId FK
        documentTypeEnum type
        text name
        text key UK
        integer size
        text mimeType
        timestamp archivedAt
        timestamp uploadedAt
    }
    
    notifications {
        serial id PK
        text subject
        text body
        text recipientFilter
        integer cycleId FK
        text sentByUserId FK
        integer recipientCount
        timestamp sentAt
        timestamp createdAt
    }
    
    audit_log {
        serial id PK
        text userId FK
        text action
        text entityType
        text entityId
        jsonb meta
        timestamp createdAt
    }
    
    %% ══════════════════════════════════════════════════════════════════════
    %% Relationships
    %% ══════════════════════════════════════════════════════════════════════
    
    %% User relationships
    user ||--o{ session : "has many sessions"
    user ||--o{ account : "has many accounts"
    user ||--o| participants : "has one participant profile"
    user ||--o| partners : "has one partner profile"
    user ||--o{ payments : "makes payments"
    user ||--o{ documents : "uploads documents"
    user ||--o{ exam_answers : "grades answers"
    user ||--o{ exams : "creates exams"
    user ||--o{ notifications : "sends notifications"
    user ||--o{ career_applications : "submits applications"
    user ||--o{ audit_log : "performs actions"
    
    %% Core exam hierarchy
    cycles ||--o{ rounds : "contains rounds"
    rounds ||--o{ exams : "contains exams"
    exams ||--o{ questions : "contains questions"
    
    %% Exam session flow
    exams ||--o{ exam_sessions : "has sessions"
    participants ||--o{ exam_sessions : "takes exams"
    exam_sessions ||--o{ exam_answers : "contains answers"
    questions ||--o{ exam_answers : "receives answers"
    
    %% Subject relationships
    cycles ||--o{ cycle_subjects : "offers subjects"
    subjects ||--o{ cycle_subjects : "included in cycles"
    participants ||--o{ participant_subjects : "enrolls in subjects"
    subjects ||--o{ participant_subjects : "enrolled by participants"
    subjects ||--o{ exams : "has exams"
    subjects ||--o{ results : "has results"
    
    %% Participant relationships
    participants ||--o{ results : "earns results"
    participants ||--o{ payments : "makes payments"
    participants ||--o{ documents : "uploads documents"
    cycles ||--o{ participants : "enrolls participants"
    rounds ||--o{ participants : "registers participants"
    
    %% Results relationships
    cycles ||--o{ results : "produces results"
    rounds ||--o{ results : "produces results"
    
    %% Payment relationships
    cycles ||--o{ payments : "receives payments for"
    rounds ||--o{ payments : "receives payments for"
    
    %% Career relationships
    positions ||--o{ career_applications : "receives applications"
    
    %% Notification relationships
    cycles ||--o{ notifications : "sends notifications for"
```

**Diagram Legend:**
- `PK` - Primary Key
- `FK` - Foreign Key
- `UK` - Unique Key
- `||--o{` - One-to-Many (one parent, zero or more children)
- `||--o|` - One-to-One (one parent, zero or one child)
- `||--||` - One-to-One Required (exactly one on both sides)

**Key Relationships:**

1. **Core Hierarchy**: cycles → rounds → exams → questions
2. **Exam Flow**: participants → exam_sessions → exam_answers ← questions
3. **Subject Enrollment**: Many-to-many via `cycle_subjects` and `participant_subjects`
4. **Payment Flow**: user → participants → payments (linked to cycles/rounds)
5. **Results**: participants + subjects + cycles/rounds → results
6. **Documents**: user → documents (optionally linked to participants)

## Enums

### roleEnum
User roles in the system:
- `super_admin` - Full system access
- `admin` - Administrative access
- `coordinator` - Cycle/round coordination
- `participant` - Exam participant
- `partner_contact` - Partner organization contact
- `career_applicant` - Career application submitter
- `question_provider` - Exam question contributor

### cycleStatusEnum
Competition cycle status:
- `planning` - Initial planning phase
- `registration_open` - Accepting registrations
- `active` - Cycle in progress
- `completed` - Cycle finished
- `archived` - Historical record

### roundFormatEnum
Round delivery format:
- `online` - Remote/online
- `onsite` - Physical location
- `hybrid` - Mixed format

### roundRegistrationStatusEnum
Round registration availability:
- `closed` - Not accepting registrations
- `soon` - Opening soon
- `open` - Currently accepting

### registrationStatusEnum
Participant registration workflow:
- `draft` - Incomplete registration
- `submitted` - Submitted for review
- `verified` - Approved by admin
- `rejected` - Rejected by admin

### paymentStatusEnum
Payment tracking:
- `unpaid` - Payment pending
- `paid` - Payment received
- `waived` - Fee waived

### awardEnum
Result awards:
- `gold` - Gold medal
- `silver` - Silver medal
- `bronze` - Bronze medal
- `honorable_mention` - Honorable mention
- `participation` - Participation certificate

### partnerTypeEnum
Partner organization types:
- `university` - University
- `school` - School
- `academic_institution` - Other academic institution
- `organization` - General organization

### partnerStatusEnum
Partnership application status:
- `pending` - Under review
- `approved` - Partnership approved
- `rejected` - Partnership declined

### positionTypeEnum
Employment position types:
- `full_time` - Full-time position
- `part_time` - Part-time position
- `contract` - Contract/freelance
- `volunteer` - Volunteer position

### careerStatusEnum
Career application workflow:
- `submitted` - Application received
- `reviewing` - Under review
- `shortlisted` - Shortlisted for interview
- `rejected` - Application declined
- `hired` - Candidate hired

### stripePaymentStatusEnum
Stripe payment processing status:
- `pending` - Payment initiated
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### documentTypeEnum
Document categories:
- `identity` - Identity document
- `photo` - Photo/image
- `certificate` - Certificate
- `invoice` - Invoice/receipt
- `cv` - Curriculum vitae
- `other` - Other document type

### genderEnum
Participant gender:
- `male` - Male
- `female` - Female
- `prefer_not_to_say` - Prefer not to disclose

### examTypeEnum
Exam purpose:
- `practice` - Practice exam
- `exam` - Official exam

### questionTypeEnum
Question format:
- `mcq` - Multiple choice question
- `numeric` - Numeric answer
- `open` - Open-ended text answer

### examSessionStatusEnum
Exam session state:
- `active` - In progress
- `submitted` - Completed by participant
- `timed_out` - Time limit exceeded

---

## Authentication Tables

### user
Core user account table.

**Columns:**
- `id` (text, PK) - Unique user identifier
- `name` (text, NOT NULL) - Display name
- `email` (text, NOT NULL, UNIQUE) - Email address
- `emailVerified` (boolean, NOT NULL, default: false) - Email verification status
- `image` (text) - Profile image URL
- `createdAt` (timestamp, NOT NULL, default: now()) - Account creation timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update timestamp
- `role` (roleEnum, NOT NULL, default: 'participant') - User role
- `firstName` (text) - First name
- `lastName` (text) - Last name
- `country` (text) - Country
- `phone` (text) - Phone number

**Relationships:**
- Has one `participants` (via userId)
- Has one `partners` (via userId)
- Has many `session` records
- Has many `account` records
- Has many `payments`
- Has many `documents`

**Indexes:** None explicit (unique on email)

---

### session
User authentication sessions.

**Columns:**
- `id` (text, PK) - Session identifier
- `userId` (text, NOT NULL, FK → user.id, CASCADE) - User reference
- `token` (text, NOT NULL, UNIQUE) - Session token
- `expiresAt` (timestamp, NOT NULL) - Expiration timestamp
- `ipAddress` (text) - Client IP address
- `userAgent` (text) - Client user agent
- `createdAt` (timestamp, NOT NULL, default: now()) - Session creation
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last activity

**Relationships:**
- Belongs to `user`

**Indexes:**
- `session_user_id_idx` on (userId)

---

### account
OAuth provider accounts linked to users.

**Columns:**
- `id` (text, PK) - Account identifier
- `userId` (text, NOT NULL, FK → user.id, CASCADE) - User reference
- `accountId` (text, NOT NULL) - Provider account ID
- `providerId` (text, NOT NULL) - OAuth provider identifier
- `accessToken` (text) - OAuth access token
- `refreshToken` (text) - OAuth refresh token
- `accessTokenExpiresAt` (timestamp) - Access token expiration
- `refreshTokenExpiresAt` (timestamp) - Refresh token expiration
- `scope` (text) - OAuth scope
- `idToken` (text) - OAuth ID token
- `password` (text) - Hashed password (for credential provider)
- `createdAt` (timestamp, NOT NULL, default: now()) - Account creation
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `user`

**Indexes:** None explicit

---

### verification
Email verification and password reset tokens.

**Columns:**
- `id` (text, PK) - Verification record identifier
- `identifier` (text, NOT NULL) - Email or user identifier
- `value` (text, NOT NULL) - Verification token
- `expiresAt` (timestamp, NOT NULL) - Token expiration
- `createdAt` (timestamp, default: now()) - Creation timestamp
- `updatedAt` (timestamp, default: now()) - Update timestamp

**Relationships:** None

**Indexes:** None explicit

---

## Domain Tables

### cycles
Competition cycles (annual events).

**Columns:**
- `id` (serial, PK) - Cycle identifier
- `year` (integer, NOT NULL) - Year
- `name` (text, NOT NULL) - Display name
- `description` (text) - Description
- `status` (cycleStatusEnum, NOT NULL, default: 'planning') - Cycle status
- `stripeFeePercent` (integer, NOT NULL, default: 290) - Stripe fee % (basis points)
- `stripeFeeFixedCents` (integer, NOT NULL, default: 30) - Stripe fixed fee (cents)
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Update timestamp

**Relationships:**
- Has many `participants`
- Has many `results`
- Has many `rounds`
- Has many `cycleSubjects` (M2M with subjects)
- Has many `payments`

**Indexes:** None explicit

---

### rounds
Rounds within a cycle.

**Columns:**
- `id` (serial, PK) - Round identifier
- `cycleId` (integer, NOT NULL, FK → cycles.id, CASCADE) - Parent cycle
- `name` (text, NOT NULL) - Round name
- `order` (integer, NOT NULL, default: 1) - Display order
- `format` (roundFormatEnum, NOT NULL, default: 'online') - Delivery format
- `startDate` (timestamp) - Round start date
- `endDate` (timestamp) - Round end date
- `venue` (text) - Physical venue (for onsite/hybrid)
- `feeUsd` (integer, NOT NULL, default: 0) - Registration fee (cents)
- `registrationStatus` (roundRegistrationStatusEnum, NOT NULL, default: 'closed') - Registration availability
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp

**Relationships:**
- Belongs to `cycles`
- Has many `participants`
- Has many `results`
- Has many `payments`
- Has many `exams`

**Indexes:**
- `rounds_cycle_id_idx` on (cycleId)

---

### subjects
Academic subjects for exams.

**Columns:**
- `id` (serial, PK) - Subject identifier
- `slug` (text, NOT NULL, UNIQUE) - URL-friendly identifier
- `name` (text, NOT NULL) - Display name
- `description` (text) - Description
- `order` (integer, NOT NULL, default: 0) - Display order
- `active` (boolean, NOT NULL, default: true) - Active status

**Relationships:**
- Has many `results`
- Has many `participantSubjects` (M2M with participants)
- Has many `cycleSubjects` (M2M with cycles)
- Has many `exams`

**Indexes:** None explicit (unique on slug)

---

### cycleSubjects
Many-to-many junction table linking cycles to subjects.

**Columns:**
- `cycleId` (integer, NOT NULL, FK → cycles.id, CASCADE) - Cycle reference
- `subjectId` (integer, NOT NULL, FK → subjects.id, CASCADE) - Subject reference

**Primary Key:** Composite (cycleId, subjectId)

**Relationships:**
- Belongs to `cycles`
- Belongs to `subjects`

**Indexes:** None explicit (covered by PK)

---

### participants
Registered competition participants.

**Columns:**
- `id` (serial, PK) - Participant identifier
- `userId` (text, NOT NULL, UNIQUE, FK → user.id, CASCADE) - User account reference
- `cycleId` (integer, FK → cycles.id) - Registered cycle
- `roundId` (integer, FK → rounds.id) - Registered round
- `fullName` (text, NOT NULL) - Full legal name
- `dateOfBirth` (date) - Birth date
- `country` (text, NOT NULL) - Country
- `city` (text) - City
- `school` (text) - School/institution name
- `grade` (text) - Current grade level
- `phone` (text) - Contact phone
- `gender` (genderEnum) - Gender
- `registrationStatus` (registrationStatusEnum, NOT NULL, default: 'draft') - Registration workflow status
- `paymentStatus` (paymentStatusEnum, NOT NULL, default: 'unpaid') - Payment status
- `notes` (text) - Admin notes
- `createdAt` (timestamp, NOT NULL, default: now()) - Registration timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `user`
- Belongs to `cycles`
- Belongs to `rounds`
- Has many `participantSubjects` (M2M with subjects)
- Has many `results`
- Has many `payments`
- Has many `documents`
- Has many `examSessions`

**Indexes:**
- `participants_cycle_id_idx` on (cycleId)
- `participants_round_id_idx` on (roundId)
- `participants_registration_status_idx` on (registrationStatus)
- `participants_payment_status_idx` on (paymentStatus)

---

### participantSubjects
Many-to-many junction table linking participants to subjects.

**Columns:**
- `participantId` (integer, NOT NULL, FK → participants.id, CASCADE) - Participant reference
- `subjectId` (integer, NOT NULL, FK → subjects.id, CASCADE) - Subject reference

**Primary Key:** Composite (participantId, subjectId)

**Relationships:**
- Belongs to `participants`
- Belongs to `subjects`

**Indexes:** None explicit (covered by PK)

---

### results
Participant competition results.

**Columns:**
- `id` (serial, PK) - Result identifier
- `participantId` (integer, NOT NULL, FK → participants.id, CASCADE) - Participant reference
- `subjectId` (integer, NOT NULL, FK → subjects.id) - Subject reference
- `cycleId` (integer, NOT NULL, FK → cycles.id) - Cycle reference
- `roundId` (integer, FK → rounds.id, SET NULL) - Round reference
- `score` (numeric) - Participant score
- `maxScore` (numeric) - Maximum possible score
- `rank` (integer) - Rank/placement
- `award` (awardEnum) - Award type
- `certificateUrl` (text) - Certificate URL
- `publishedAt` (timestamp) - Publication timestamp
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp

**Relationships:**
- Belongs to `participants`
- Belongs to `subjects`
- Belongs to `cycles`
- Belongs to `rounds`

**Indexes:**
- `results_participant_id_idx` on (participantId)
- `results_cycle_id_idx` on (cycleId)
- `results_subject_id_idx` on (subjectId)

---

### partners
Partner organization applications.

**Columns:**
- `id` (serial, PK) - Partner identifier
- `userId` (text, FK → user.id, SET NULL) - Associated user account
- `organizationName` (text, NOT NULL) - Organization name
- `type` (partnerTypeEnum, NOT NULL) - Partner type
- `country` (text, NOT NULL) - Country
- `city` (text) - City
- `website` (text) - Website URL
- `contactName` (text, NOT NULL) - Contact person name
- `contactEmail` (text, NOT NULL) - Contact email
- `contactPhone` (text) - Contact phone
- `cooperationType` (text) - Cooperation type description
- `message` (text) - Application message
- `status` (partnerStatusEnum, NOT NULL, default: 'pending') - Application status
- `createdAt` (timestamp, NOT NULL, default: now()) - Application timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `user` (optional)

**Indexes:** None explicit

---

### positions
Career/job positions.

**Columns:**
- `id` (serial, PK) - Position identifier
- `title` (text, NOT NULL) - Job title
- `location` (text) - Location
- `type` (positionTypeEnum, NOT NULL) - Employment type
- `description` (text) - Position description
- `requirements` (text) - Requirements
- `active` (boolean, NOT NULL, default: true) - Active status
- `postedAt` (timestamp, NOT NULL, default: now()) - Posting timestamp

**Relationships:**
- Has many `careerApplications`

**Indexes:** None explicit

---

### careerApplications
Career position applications.

**Columns:**
- `id` (serial, PK) - Application identifier
- `userId` (text, FK → user.id, SET NULL) - Applicant user account
- `positionId` (integer, FK → positions.id, SET NULL) - Position reference
- `fullName` (text, NOT NULL) - Applicant name
- `email` (text, NOT NULL) - Contact email
- `phone` (text) - Contact phone
- `country` (text) - Country
- `cvUrl` (text) - CV document URL
- `motivationText` (text) - Motivation/cover letter
- `status` (careerStatusEnum, NOT NULL, default: 'submitted') - Application status
- `createdAt` (timestamp, NOT NULL, default: now()) - Application timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `user` (optional)
- Belongs to `positions` (optional)

**Indexes:** None explicit

---

### payments
Stripe payment records.

**Columns:**
- `id` (serial, PK) - Payment identifier
- `userId` (text, FK → user.id, SET NULL) - User reference
- `participantId` (integer, FK → participants.id, SET NULL) - Participant reference
- `cycleId` (integer, FK → cycles.id) - Cycle reference
- `roundId` (integer, FK → rounds.id, SET NULL) - Round reference
- `stripeCheckoutSessionId` (text, UNIQUE) - Stripe checkout session ID
- `stripePaymentIntentId` (text) - Stripe payment intent ID
- `stripeChargeId` (text) - Stripe charge ID
- `cardLast4` (text) - Card last 4 digits
- `cardBrand` (text) - Card brand (Visa, Mastercard, etc.)
- `amountCents` (integer, NOT NULL) - Payment amount in cents
- `serviceFeeCents` (integer, default: 0) - Service fee in cents
- `currency` (text, NOT NULL, default: 'usd') - Currency code
- `status` (stripePaymentStatusEnum, NOT NULL, default: 'pending') - Payment status
- `receiptUrl` (text) - Stripe receipt URL
- `invoicePdfKey` (text) - Invoice PDF storage key
- `receiptPdfKey` (text) - Receipt PDF storage key
- `createdAt` (timestamp, NOT NULL, default: now()) - Payment creation
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `user` (optional)
- Belongs to `participants` (optional)
- Belongs to `cycles` (optional)
- Belongs to `rounds` (optional)

**Indexes:**
- `payments_user_id_idx` on (userId)
- `payments_participant_id_idx` on (participantId)
- `payments_status_idx` on (status)

---

### documents
User-uploaded documents.

**Columns:**
- `id` (serial, PK) - Document identifier
- `userId` (text, NOT NULL, FK → user.id, CASCADE) - Uploader user reference
- `participantId` (integer, FK → participants.id, SET NULL) - Associated participant
- `type` (documentTypeEnum, NOT NULL, default: 'other') - Document type
- `name` (text, NOT NULL) - Document name
- `key` (text, NOT NULL, UNIQUE) - Storage key
- `size` (integer) - File size in bytes
- `mimeType` (text) - MIME type
- `archivedAt` (timestamp) - Archive timestamp
- `uploadedAt` (timestamp, NOT NULL, default: now()) - Upload timestamp

**Relationships:**
- Belongs to `user`
- Belongs to `participants` (optional)

**Indexes:** None explicit (unique on key)

---

### notifications
System notifications/announcements.

**Columns:**
- `id` (serial, PK) - Notification identifier
- `subject` (text, NOT NULL) - Subject line
- `body` (text, NOT NULL) - Message body
- `recipientFilter` (text, NOT NULL, default: 'all') - Recipient filter criteria
- `cycleId` (integer, FK → cycles.id, SET NULL) - Associated cycle
- `sentByUserId` (text, FK → user.id, SET NULL) - Sender user reference
- `recipientCount` (integer, NOT NULL, default: 0) - Number of recipients
- `sentAt` (timestamp, NOT NULL, default: now()) - Send timestamp
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp

**Relationships:**
- Belongs to `user` (sender, optional)
- Belongs to `cycles` (optional)

**Indexes:** None explicit

---

### exams
Exam definitions.

**Columns:**
- `id` (serial, PK) - Exam identifier
- `createdByUserId` (text, FK → user.id, SET NULL) - Creator user reference
- `roundId` (integer, FK → rounds.id, SET NULL) - Associated round
- `subjectId` (integer, FK → subjects.id, SET NULL) - Subject reference
- `title` (text, NOT NULL) - Exam title
- `type` (examTypeEnum, NOT NULL, default: 'exam') - Exam type
- `instructions` (text) - Exam instructions
- `durationMinutes` (integer) - Time limit in minutes
- `windowStart` (timestamp) - Availability window start
- `windowEnd` (timestamp) - Availability window end
- `shuffleQuestions` (boolean, NOT NULL, default: true) - Randomize question order
- `questionsPerSession` (integer) - Number of questions per session
- `targetGrades` (text[], NOT NULL, default: []) - Target grade levels
- `published` (boolean, NOT NULL, default: false) - Publication status
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `rounds` (optional)
- Belongs to `subjects` (optional)
- Has many `questions`
- Has many `examSessions`

**Indexes:**
- `exams_round_id_idx` on (roundId)
- `exams_subject_id_idx` on (subjectId)
- `exams_published_idx` on (published)

---

### questions
Exam questions.

**Columns:**
- `id` (serial, PK) - Question identifier
- `examId` (integer, NOT NULL, FK → exams.id, CASCADE) - Parent exam
- `type` (questionTypeEnum, NOT NULL, default: 'mcq') - Question type
- `order` (integer, NOT NULL, default: 0) - Display order
- `content` (text, NOT NULL) - Question text/content
- `options` (jsonb) - MCQ options array: `{ id: string, text: string }[]`
- `correctAnswer` (text) - Correct answer (option ID or value)
- `tolerance` (numeric) - Numeric answer tolerance
- `grades` (text[], NOT NULL, default: []) - Applicable grade levels
- `points` (integer, NOT NULL, default: 1) - Point value
- `explanation` (text) - Answer explanation
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Relationships:**
- Belongs to `exams`
- Has many `examAnswers`

**Indexes:**
- `questions_exam_id_order_idx` on (examId, order)

---

### examSessions
Participant exam attempts.

**Columns:**
- `id` (serial, PK) - Session identifier
- `examId` (integer, NOT NULL, FK → exams.id, CASCADE) - Exam reference
- `participantId` (integer, NOT NULL, FK → participants.id, CASCADE) - Participant reference
- `questionOrder` (jsonb) - Shuffled question order: `number[]`
- `startedAt` (timestamp, NOT NULL, default: now()) - Start timestamp
- `deadlineAt` (timestamp) - Deadline timestamp
- `submittedAt` (timestamp) - Submission timestamp
- `status` (examSessionStatusEnum, NOT NULL, default: 'active') - Session status
- `score` (numeric) - Final score
- `tabSwitchCount` (integer, NOT NULL, default: 0) - Tab switch counter (proctoring)
- `ipAddress` (text) - Client IP address
- `userAgent` (text) - Client user agent
- `archivedAt` (timestamp) - Archive timestamp
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp

**Relationships:**
- Belongs to `exams`
- Belongs to `participants`
- Has many `examAnswers`

**Indexes:**
- `exam_sessions_exam_id_idx` on (examId)
- `exam_sessions_participant_id_idx` on (participantId)
- `exam_sessions_exam_participant_idx` on (examId, participantId)
- `exam_sessions_status_idx` on (status)

---

### examAnswers
Individual question answers within exam sessions.

**Columns:**
- `id` (serial, PK) - Answer identifier
- `sessionId` (integer, NOT NULL, FK → examSessions.id, CASCADE) - Session reference
- `questionId` (integer, NOT NULL, FK → questions.id, CASCADE) - Question reference
- `answer` (text) - Participant's answer
- `isCorrect` (boolean) - Correctness flag
- `pointsAwarded` (numeric) - Points awarded
- `flagged` (boolean, NOT NULL, default: false) - Flagged for review
- `answeredAt` (timestamp) - Answer submission timestamp
- `gradedAt` (timestamp) - Grading timestamp
- `gradedByUserId` (text, FK → user.id, SET NULL) - Grader user reference
- `createdAt` (timestamp, NOT NULL, default: now()) - Creation timestamp
- `updatedAt` (timestamp, NOT NULL, default: now()) - Last update

**Unique Constraint:** (sessionId, questionId) - one answer per question per session

**Relationships:**
- Belongs to `examSessions`
- Belongs to `questions`
- Belongs to `user` (grader, optional)

**Indexes:**
- `exam_answers_session_id_idx` on (sessionId)
- `exam_answers_question_id_idx` on (questionId)

---

## Audit Table

### auditLog
System audit trail for all user actions.

**Columns:**
- `id` (serial, PK) - Log entry identifier
- `userId` (text, FK → user.id, SET NULL) - User who performed action
- `action` (text, NOT NULL) - Action description
- `entityType` (text) - Entity type affected
- `entityId` (text) - Entity identifier
- `meta` (jsonb) - Additional metadata
- `createdAt` (timestamp, NOT NULL, default: now()) - Action timestamp

**Relationships:**
- Belongs to `user` (optional)

**Indexes:**
- `audit_log_user_id_idx` on (userId)
- `audit_log_created_at_idx` on (createdAt)

---

## Key Relationships Summary

### User → Participant Flow
1. User registers (`user` table)
2. Creates participant profile (`participants` table)
3. Selects subjects (`participantSubjects` junction)
4. Makes payment (`payments` table)
5. Takes exams (`examSessions` table)
6. Receives results (`results` table)

### Exam Flow
1. Admin creates cycle (`cycles` table)
2. Adds rounds to cycle (`rounds` table)
3. Creates exams for rounds (`exams` table)
4. Adds questions to exams (`questions` table)
5. Participant starts exam (`examSessions` table)
6. Answers questions (`examAnswers` table)
7. System calculates score and publishes results (`results` table)

### Payment Flow
1. Participant registers for round with fee (`participants` table)
2. Creates Stripe checkout session (`payments` table with pending status)
3. Stripe processes payment (`payments` updated with paid status)
4. Participant registration status updated (`participants.paymentStatus = 'paid'`)

---

## Database Conventions

### Naming Patterns
- Tables: plural snake_case (e.g., `exam_sessions`)
- Columns: camelCase (e.g., `createdAt`, `userId`)
- Foreign keys: `{table}_id` (e.g., `cycleId`, `userId`)
- Enums: `{name}Enum` (e.g., `roleEnum`, `examTypeEnum`)

### Timestamps
All domain tables include:
- `createdAt` - Creation timestamp (default: now())
- `updatedAt` - Last modification timestamp (default: now(), updated on change)

### Cascade Behaviors
- **CASCADE**: Child records deleted when parent deleted
  - User → sessions, accounts, documents, participants
  - Cycles → rounds, cycleSubjects
  - Exams → questions, examSessions
  - ExamSessions → examAnswers
- **SET NULL**: Foreign key nullified when parent deleted
  - Soft references (rounds, payments, optional associations)

### Soft Deletes
The following tables support soft delete via `archivedAt`:
- `documents`
- `examSessions`

---

## Index Strategy

Indexes are strategically placed on:
1. **Foreign keys** - For efficient joins (e.g., `cycleId`, `userId`)
2. **Filter columns** - For common queries (e.g., `status`, `published`)
3. **Composite keys** - For specific query patterns (e.g., `exam_participant_idx`)
4. **Time-based queries** - For audit logs (e.g., `createdAt`)

---

## Migration Notes

This schema is managed by Drizzle ORM. To generate migrations after schema changes:

```bash
npm run db:generate
npm run db:migrate
```

For seeding:
```bash
npm run db:seed
```
