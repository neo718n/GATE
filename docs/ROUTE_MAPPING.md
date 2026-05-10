# Route Mapping Documentation

This document provides a comprehensive mapping of all application routes, organized by route group and role-based access control.

## Overview

The application contains **68 total routes** organized across multiple route groups:

- **Authentication Routes** (3): Login, registration, and email verification
- **Marketing Routes** (14): Public-facing informational pages
- **Admin Routes** (25): Super admin and admin management interfaces
- **Coordinator Routes** (3): Regional coordinator portal
- **Participant Routes** (12): Student dashboard and enrollment
- **Partner Routes** (3): Partner organization portal
- **Question Provider Routes** (6): Question provider dashboard and management
- **Staff Portal** (1): Staff authentication gateway
- **Dashboard** (1): Role-based dashboard redirect

## Route Groups

### 1. Authentication Routes (`(auth)`)

**Route Group:** `app/(auth)/`  
**Authorization:** Public (no authentication required)  
**Layout:** Auth layout with split-screen design  
**Total Routes:** 3

| Route | Path | Description |
|-------|------|-------------|
| Login | `/login` | Staff and participant login page |
| Register | `/register` | New participant registration |
| Verify Email | `/verify-email` | Email verification flow |

**Authorization Pattern:**
```typescript
// No requireSession() or requireRole() - public access
// Redirects authenticated users to their role-specific dashboard
```

---

### 2. Marketing Routes (`(marketing)`)

**Route Group:** `app/(marketing)/`  
**Authorization:** Public (optional session for personalized navigation)  
**Layout:** Marketing layout with navigation and footer  
**Total Routes:** 14

| Route | Path | Description |
|-------|------|-------------|
| Homepage | `/` | Landing page |
| About | `/about` | About G.A.T.E. program |
| Academic Info | `/academic-info` | Academic information and guidelines |
| Academic Integrity | `/academic-integrity` | Academic integrity policies |
| Awards | `/awards` | Award categories and criteria |
| Careers | `/careers` | Career opportunities application |
| Contact | `/contact` | Contact form and information |
| Onsite Assessment | `/onsite-assessment` | Onsite assessment details |
| Partnerships | `/partnerships` | Partnership application |
| Privacy | `/privacy` | Privacy policy |
| Rules | `/rules` | Competition rules |
| Structure | `/structure` | Program structure |
| Subjects | `/subjects` | Available subjects |
| Terms | `/terms` | Terms of service |

**Authorization Pattern:**
```typescript
// Uses getCurrentSession() for optional authentication
// Displays personalized navigation if user is logged in
```

---

### 3. Admin Routes (`(dashboard)/admin`)

**Route Group:** `app/(dashboard)/admin/`  
**Authorized Roles:** `super_admin`, `admin`  
**Layout:** Dashboard layout with role-based sidebar  
**Total Routes:** 25

#### Core Admin Pages

| Route | Path | Description | Roles |
|-------|------|-------------|-------|
| Admin Dashboard | `/admin` | Admin overview with statistics | `admin`, `super_admin` |
| Analytics | `/admin/analytics` | System analytics and insights | `super_admin` |
| Careers | `/admin/careers` | Career applications management | `super_admin` |
| Certificates | `/admin/certificates` | Certificate generation | `admin`, `super_admin` |
| Content | `/admin/content` | Content management | `admin`, `super_admin` |
| Inquiries | `/admin/inquiries` | Academic inquiries | `admin`, `super_admin` |
| Notifications | `/admin/notifications` | Notification management | `admin`, `super_admin` |
| Partners | `/admin/partners` | Partner applications | `super_admin` |
| Payments | `/admin/payments` | Payment records | `admin`, `super_admin` |
| Question Providers | `/admin/question-providers` | Question provider management | `super_admin` |
| Results | `/admin/results` | Results publishing | `admin`, `super_admin` |
| Settings | `/admin/settings` | System settings | `super_admin` |
| Subjects | `/admin/subjects` | Subject management | `super_admin` |
| Users | `/admin/users` | User and role management | `super_admin` |

#### Assessment Cycle Management

| Route | Path | Description | Roles |
|-------|------|-------------|-------|
| Cycles | `/admin/cycles` | Assessment cycles list | `super_admin` |
| Cycle Detail | `/admin/cycles/[id]` | Cycle detail and rounds | `super_admin` |

#### Participant Management

| Route | Path | Description | Roles |
|-------|------|-------------|-------|
| Participants | `/admin/participants` | All participants list | `admin`, `super_admin` |
| Participant Detail | `/admin/participants/[id]` | Individual participant details | `admin`, `super_admin` |

#### Exam Management

| Route | Path | Description | Roles |
|-------|------|-------------|-------|
| Exams List | `/admin/exams` | All exams list | `admin`, `super_admin` |
| Create Exam | `/admin/exams/new` | Create new exam | `admin`, `super_admin` |
| Exam Detail | `/admin/exams/[id]` | Exam overview and management | `admin`, `super_admin` |
| Add Question | `/admin/exams/[id]/questions/new` | Add new question to exam | `admin`, `super_admin` |
| Edit Question | `/admin/exams/[id]/questions/[qid]/edit` | Edit exam question | `admin`, `super_admin` |
| Exam Results | `/admin/exams/[id]/results` | All exam results | `admin`, `super_admin` |
| Session Result | `/admin/exams/[id]/results/[sid]` | Individual session result | `admin`, `super_admin` |

**Authorization Pattern:**
```typescript
// Most pages use:
await requireRole(["admin", "super_admin"]);

// Super admin exclusive pages use:
await requireRole("super_admin");
```

**Navigation (from layout):**
- Super Admin: 14 nav items (full system access)
- Admin: 9 nav items (operational access, no system config)

---

### 4. Coordinator Routes (`(dashboard)/coordinator`)

**Route Group:** `app/(dashboard)/coordinator/`  
**Authorized Roles:** `coordinator`, `admin`, `super_admin`  
**Layout:** Dashboard layout with coordinator sidebar  
**Total Routes:** 3

| Route | Path | Description |
|-------|------|-------------|
| Coordinator Dashboard | `/coordinator` | Overview and statistics |
| My Participants | `/coordinator/participants` | Assigned participants |
| Reports | `/coordinator/reports` | Regional reports |

**Authorization Pattern:**
```typescript
await requireRole(["coordinator", "admin", "super_admin"]);
```

**Navigation:** 3 nav items focused on regional participant management

---

### 5. Participant Routes (`(dashboard)/participant`)

**Route Group:** `app/(dashboard)/participant/`  
**Authorized Roles:** `participant` (primary), `admin`, `super_admin` (for oversight)  
**Layout:** Dashboard layout with participant sidebar  
**Total Routes:** 12

| Route | Path | Description |
|-------|------|-------------|
| Participant Dashboard | `/participant` | Overview, progress tracker, quick actions |
| Profile | `/participant/profile` | Personal information and school details |
| Enrollment | `/participant/enrollment` | Subject selection and payment |
| Exam Info | `/participant/exam` | Exam guidelines and schedule |
| Exams List | `/participant/exams` | Available exams |
| Exam Detail | `/participant/exams/[id]` | Exam information and status |
| Take Exam | `/participant/exams/[id]/take` | Active exam session (proctored) |
| Exam Result | `/participant/exams/[id]/result` | Individual exam result |
| Results | `/participant/results` | All results and scores |
| Certificates | `/participant/certificates` | Digital certificates |
| Documents | `/participant/documents` | Uploaded documents |

**Authorization Pattern:**
```typescript
// Most pages use:
await requireRole(["participant", "admin", "super_admin"]);

// Admin can access participant views for oversight purposes
```

**Navigation:** 6 nav items covering enrollment, exams, and results

**Special Features:**
- **Progress Tracker**: 4-step enrollment progress (Profile → Enrolled → Paid → Ready)
- **Status Badges**: Registration, Subject, Payment status indicators
- **Exam Proctoring**: Tab-switch detection, timed sessions on `/participant/exams/[id]/take`

---

### 6. Partner Routes (`(dashboard)/partner`)

**Route Group:** `app/(dashboard)/partner/`  
**Authorized Roles:** `partner_contact`, `admin`, `super_admin`  
**Layout:** Dashboard layout with partner sidebar  
**Total Routes:** 3

| Route | Path | Description |
|-------|------|-------------|
| Partner Dashboard | `/partner` | Partnership overview |
| Organization Profile | `/partner/profile` | Organization details |
| Partnership Status | `/partner/status` | Application status |

**Authorization Pattern:**
```typescript
await requireRole(["partner_contact", "admin", "super_admin"]);
```

**Navigation:** 3 nav items for partnership management

---

### 7. Question Provider Routes (`qp`)

**Route Group:** `app/qp/(dashboard)/`  
**Authorized Roles:** `question_provider`  
**Layout:** Dedicated QP layout with minimal sidebar  
**Total Routes:** 6

| Route | Path | Description |
|-------|------|-------------|
| Sign In | `/qp/sign-in` | Question provider authentication |
| QP Dashboard | `/qp` | Overview |
| Exams List | `/qp/exams` | Assigned exams |
| Exam Detail | `/qp/exams/[id]` | Exam details |
| Add Question | `/qp/exams/[id]/questions/new` | Create question |
| Edit Question | `/qp/exams/[id]/questions/[qid]/edit` | Edit question |

**Authorization Pattern:**
```typescript
await requireRole("question_provider");
```

**Navigation:** 2 nav items (Overview, Exams)

---

### 8. Staff Portal

**Route:** `app/staff/page.tsx`  
**Path:** `/staff`  
**Authorization:** Public (redirects authenticated staff to their dashboard)  
**Total Routes:** 1

**Purpose:** Dedicated authentication page for staff members (admin, super_admin, coordinator)

**Authorization Logic:**
```typescript
// If already authenticated and not a participant:
if (session?.user && role !== "participant") {
  redirect(ROLE_HOME[role]); // Redirect to role-specific dashboard
}
```

---

### 9. Dashboard Redirect

**Route:** `app/(dashboard)/dashboard/page.tsx`  
**Path:** `/dashboard`  
**Authorization:** Requires authentication (`requireSession()`)  
**Total Routes:** 1

**Purpose:** Role-based redirect to appropriate dashboard

**Authorization Logic:**
```typescript
const session = await requireSession();
const role = session.user.role ?? "participant";
redirect(ROLE_HOME[role] ?? "/participant");
```

---

## Role-to-Dashboard Mapping

Defined in `lib/authz.ts` as `ROLE_HOME`:

| Role | Home Dashboard | Route Count |
|------|----------------|-------------|
| `super_admin` | `/admin` | 25 admin routes (full access) |
| `admin` | `/admin` | 25 admin routes (limited access) |
| `coordinator` | `/coordinator` | 3 coordinator routes |
| `participant` | `/participant` | 12 participant routes |
| `partner_contact` | `/partner` | 3 partner routes |
| `question_provider` | `/qp` | 6 qp routes |
| `career_applicant` | `/` | 14 marketing routes only |

---

## Authorization Middleware Functions

Located in `lib/authz.ts`:

### `getCurrentSession()`
Returns the current session or `null` if not authenticated.

**Usage:**
```typescript
const session = await getCurrentSession();
// Optional authentication for marketing pages
```

### `requireSession()`
Requires authentication. Redirects to `/login` if not authenticated, or to `/verify-email` if email not verified.

**Usage:**
```typescript
const session = await requireSession();
// Returns session or redirects
```

### `requireRole(allowed: Role | Role[])`
Requires authentication AND specific role(s). Redirects to `/` if role not authorized.

**Usage:**
```typescript
await requireRole("super_admin"); // Single role
await requireRole(["admin", "super_admin"]); // Multiple roles
```

### `requireStaffSession()`
Requires authentication AND staff role (super_admin, admin, or coordinator). Redirects non-staff to `/`.

**Usage:**
```typescript
const session = await requireStaffSession();
```

---

## Route Group Authorization Summary

| Route Group | Authorization Method | Allowed Roles | Redirect on Unauthorized |
|-------------|---------------------|---------------|-------------------------|
| `(auth)` | None | Public | N/A |
| `(marketing)` | `getCurrentSession()` | Public | N/A |
| `admin/*` | `requireRole()` | `admin`, `super_admin` | `/` |
| `coordinator/*` | `requireRole()` | `coordinator`, `admin`, `super_admin` | `/` |
| `participant/*` | `requireRole()` | `participant`, `admin`, `super_admin` | `/` |
| `partner/*` | `requireRole()` | `partner_contact`, `admin`, `super_admin` | `/` |
| `qp/*` | `requireRole()` | `question_provider` | `/` |
| `/staff` | Conditional | Staff roles | Role-specific dashboard |
| `/dashboard` | `requireSession()` | All authenticated | N/A (redirects to role home) |

---

## Route Hierarchy

```
app/
├── (auth)/                         [Public - 3 routes]
│   ├── login/
│   ├── register/
│   └── verify-email/
│
├── (marketing)/                    [Public - 14 routes]
│   ├── page.tsx                    (/)
│   ├── about/
│   ├── academic-info/
│   ├── academic-integrity/
│   ├── awards/
│   ├── careers/
│   ├── contact/
│   ├── onsite-assessment/
│   ├── partnerships/
│   ├── privacy/
│   ├── rules/
│   ├── structure/
│   ├── subjects/
│   └── terms/
│
├── (dashboard)/                    [Authenticated - 44 routes]
│   ├── layout.tsx                  (requireSession + role-based nav)
│   ├── dashboard/                  [Redirect - 1 route]
│   │
│   ├── admin/                      [admin, super_admin - 25 routes]
│   │   ├── page.tsx
│   │   ├── analytics/
│   │   ├── careers/
│   │   ├── certificates/
│   │   ├── content/
│   │   ├── cycles/
│   │   │   └── [id]/
│   │   ├── exams/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── questions/
│   │   │       │   ├── new/
│   │   │       │   └── [qid]/edit/
│   │   │       └── results/
│   │   │           └── [sid]/
│   │   ├── inquiries/
│   │   ├── notifications/
│   │   ├── participants/
│   │   │   └── [id]/
│   │   ├── partners/
│   │   ├── payments/
│   │   ├── question-providers/
│   │   ├── results/
│   │   ├── settings/
│   │   ├── subjects/
│   │   └── users/
│   │
│   ├── coordinator/                [coordinator, admin, super_admin - 3 routes]
│   │   ├── page.tsx
│   │   ├── participants/
│   │   └── reports/
│   │
│   ├── participant/                [participant, admin, super_admin - 12 routes]
│   │   ├── page.tsx
│   │   ├── certificates/
│   │   ├── documents/
│   │   ├── enrollment/
│   │   ├── exam/
│   │   ├── exams/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── result/
│   │   │       └── take/
│   │   ├── profile/
│   │   └── results/
│   │
│   └── partner/                    [partner_contact, admin, super_admin - 3 routes]
│       ├── page.tsx
│       ├── profile/
│       └── status/
│
├── qp/                             [question_provider - 6 routes]
│   ├── sign-in/                    (public)
│   └── (dashboard)/
│       ├── layout.tsx              (requireRole("question_provider"))
│       ├── page.tsx
│       └── exams/
│           └── [id]/
│               ├── page.tsx
│               └── questions/
│                   ├── new/
│                   └── [qid]/edit/
│
└── staff/                          [Staff gateway - 1 route]
    └── page.tsx
```

---

## Dynamic Routes

The application uses Next.js dynamic routes for entity detail pages:

| Pattern | Example | Description |
|---------|---------|-------------|
| `[id]` | `/admin/cycles/123` | Cycle detail page |
| `[id]` | `/admin/exams/456` | Exam detail page |
| `[id]` | `/admin/participants/789` | Participant detail page |
| `[id]` → `[qid]` | `/admin/exams/456/questions/101/edit` | Nested question edit |
| `[id]` → `[sid]` | `/admin/exams/456/results/202` | Nested session result |
| `[id]` | `/participant/exams/456` | Participant exam detail |
| `[id]` | `/qp/exams/456` | QP exam detail |
| `[qid]` | `/qp/exams/456/questions/101/edit` | QP question edit |

---

## Special Routes

### Email Verification Gate
All authenticated routes check email verification status:

```typescript
if (!session.user.emailVerified) {
  redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
}
```

### Generic Dashboard Redirect
`/dashboard` automatically redirects to role-specific home:

```typescript
redirect(ROLE_HOME[role] ?? "/participant");
```

### Staff Portal Logic
`/staff` provides dedicated login for staff, redirecting authenticated staff to their dashboard and preventing participants from accessing.

---

## Cross-Role Access Patterns

Some routes allow multiple roles for oversight purposes:

### Admin Oversight
Admins can access:
- All coordinator routes (for regional oversight)
- All participant routes (for support and verification)
- All partner routes (for partnership management)

### Super Admin Privileges
Super admins have access to all routes including:
- System settings
- User and role management
- Question provider management
- Analytics
- Partner applications
- Career applications

---

## Route Count Verification

| Category | Count |
|----------|-------|
| Authentication | 3 |
| Marketing | 14 |
| Admin | 25 |
| Coordinator | 3 |
| Participant | 12 |
| Partner | 3 |
| Question Provider | 6 |
| Staff Portal | 1 |
| Dashboard Redirect | 1 |
| **Total** | **68** |

---

## Related Documentation

- [Authorization System](./AUTHORIZATION.md) - Detailed authorization middleware documentation
- [Database Schema](./DATABASE.md) - Database tables and relationships
- [Exam Lifecycle](./EXAM_LIFECYCLE.md) - Exam session flow and proctoring
- [Data Flow](./DATA_FLOW.md) - Application architecture and data flow

---

*Last updated: 2026-05-10*
