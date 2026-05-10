# G.A.T.E. Assessment Platform

**Global Academic & Theoretical Excellence Assessment**

## Overview

G.A.T.E. Assessment is a comprehensive digital platform for managing and delivering the Global Academic & Theoretical Excellence Assessment — an international academic competition that recognizes exceptional scholarly achievement across multiple disciplines.

This platform serves as the complete ecosystem for students, administrators, and educators participating in the G.A.T.E. Assessment program, providing seamless registration, assessment delivery, results management, and official certification.

## Purpose

The G.A.T.E. Assessment platform enables:

- **Academic Excellence Recognition** — Identify and celebrate outstanding students through rigorous, standardized assessments across multiple subject areas
- **Global Accessibility** — Provide a unified, accessible platform for students worldwide to participate in prestigious academic competitions
- **Professional Certification** — Generate official certificates and award documentation (Gold Medal, Silver Medal, Bronze Medal) that recognize participant achievement
- **Data-Driven Insights** — Deliver comprehensive analytics and reporting for administrators, educators, and participants to track performance and growth

## User Roles

The G.A.T.E. platform implements a comprehensive role-based access control system with seven distinct user roles, each designed to serve specific functions within the assessment ecosystem:

### Super Admin
**System-wide authority with unrestricted access**
- Complete platform administration and configuration
- User role management and permission assignment
- System settings and global configuration
- Database management and technical maintenance
- Override capabilities for critical operations

### Admin
**Full administrative control over assessment operations**
- Cycle and round creation, configuration, and management
- User account management and verification
- Payment administration and fee structure configuration
- Partner organization approval and management
- Analytics access and comprehensive reporting
- Certificate generation and award distribution

### Coordinator
**Operational management for specific cycles or locations**
- Round registration monitoring and participant management
- Document verification and approval workflows
- Local partner coordination and communication
- Regional reporting and performance tracking
- Support for participant inquiries and issues

### Participant
**Students taking G.A.T.E. assessments**
- Profile creation and registration for assessment cycles
- Round selection and registration fee payment
- Assessment participation and completion
- Results viewing and performance analytics
- Certificate download and achievement portfolio access
- Career opportunity exploration

### Partner Contact
**Representatives from educational institutions and organizations**
- Partner organization profile management
- Student registration oversight for affiliated participants
- Institutional performance reporting
- Bulk registration capabilities
- Collaboration with G.A.T.E. coordinators

### Career Applicant
**Professionals applying for positions within the G.A.T.E. ecosystem**
- CV and document submission
- Application tracking and status monitoring
- Profile management for career opportunities
- Communication with hiring administrators

### Question Provider
**Subject matter experts contributing assessment content**
- Question submission and content contribution
- Assessment material review and feedback
- Access to question development guidelines
- Collaboration with assessment design team

## Key Features

### For Participants
- **Secure Registration & Authentication** — Role-based access for students, parents, and educators
- **Multi-Subject Assessment Delivery** — Timed, proctored assessments across various academic disciplines
- **Real-Time Progress Tracking** — Dashboard for monitoring assessment status and results
- **Official Digital Certificates** — Automatically generated certificates following G.A.T.E. brand standards
- **Achievement Portfolio** — Personal profile showcasing medals, certificates, and academic milestones

### For Administrators
- **Participant Management** — Comprehensive student registration and profile management
- **Assessment Configuration** — Create, schedule, and manage multi-subject assessments
- **Automated Scoring & Grading** — Intelligent scoring engine with configurable rubrics
- **Certificate Generation** — Bulk certificate creation following official brand guidelines
- **Analytics & Reporting** — Detailed insights into participation, performance, and achievement distribution

### For Educators
- **Student Performance Monitoring** — Track student progress and results
- **Resource Access** — Preparation materials and assessment guidelines
- **Award Verification** — Validate student certificates and achievements

## Technical Foundation

This is a modern web application built with:

- **[Next.js 14](https://nextjs.org)** — React framework with App Router for optimal performance
- **TypeScript** — Type-safe development for reliability and maintainability
- **Tailwind CSS** — Utility-first styling following G.A.T.E. brand guidelines
- **Server Components** — Optimized rendering strategy for fast load times

## Architecture

The G.A.T.E. platform is built on a modern, scalable architecture that ensures reliability, security, and performance:

### Core Stack
- **[Next.js 14](https://nextjs.org)** — Full-stack React framework with App Router, Server Actions, and API routes
- **[TypeScript](https://www.typescriptlang.org)** — End-to-end type safety across frontend and backend
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first CSS framework for consistent, brand-compliant styling

### Database & ORM
- **[Neon Postgres](https://neon.tech)** — Serverless Postgres database with automatic scaling and branching
- **[Drizzle ORM](https://orm.drizzle.team)** — Type-safe SQL ORM with full TypeScript support
- **Database Schema** — Comprehensive relational model covering users, cycles, rounds, registrations, payments, partners, and career opportunities

### Authentication & Authorization
- **[Better Auth](https://www.better-auth.com)** — Modern authentication solution with session management, email verification, and role-based access control
- **Role System** — Seven distinct roles: super_admin, admin, coordinator, participant, partner_contact, career_applicant, question_provider

### Payment Processing
- **[Stripe](https://stripe.com)** — Secure payment processing for registration fees with webhook integration
- **Fee Structure** — Configurable fee percentages and fixed amounts per cycle
- **Payment Tracking** — Comprehensive payment status management (unpaid, paid, waived, refunded)

### File Storage
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** — S3-compatible object storage for documents, certificates, photos, and user uploads
- **Document Types** — Support for identity documents, certificates, CVs, invoices, and general attachments

### Email Communication
- **[Resend](https://resend.com)** — Transactional email delivery for verification emails, notifications, and system communications

### Key Services
- **Certificate Generation** — Automated certificate creation following official G.A.T.E. brand standards
- **Document Management** — Secure upload, storage, and retrieval of participant documents
- **Analytics Engine** — Performance tracking and reporting across cycles, rounds, and participants
- **Partner Portal** — Multi-organizational support for universities, schools, and institutions

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Project Structure

The G.A.T.E. platform follows Next.js 14 App Router conventions with a well-organized, feature-based directory structure:

```
.
├── app/                          # Next.js App Router - Pages, layouts, and route handlers
│   ├── (auth)/                   # Authentication route group (login, register, verify-email)
│   │   ├── login/                # User sign-in page with role-based redirects
│   │   ├── register/             # New participant registration flow
│   │   └── verify-email/         # Email verification landing page
│   ├── (dashboard)/              # Protected dashboard route group (requires authentication)
│   │   ├── dashboard/            # Main dashboard - role-based redirect hub
│   │   ├── admin/                # Admin portal (cycle, user, payment management)
│   │   ├── coordinator/          # Coordinator portal (participant verification, regional reports)
│   │   ├── participant/          # Participant portal (registration, results, certificates)
│   │   └── partner/              # Partner contact portal (institutional management)
│   ├── (marketing)/              # Public marketing pages (no authentication required)
│   │   ├── about/                # About G.A.T.E. Assessment program
│   │   ├── subjects/             # Assessment subjects and curriculum
│   │   ├── awards/               # Medal system and recognition levels
│   │   ├── careers/              # Career opportunities and applications
│   │   ├── partnerships/         # Partner organization information
│   │   ├── contact/              # Contact form and support information
│   │   └── [legal pages]/        # Terms, privacy, academic integrity policies
│   ├── api/                      # API routes and webhooks
│   │   ├── auth/[...all]/        # Better Auth API endpoints
│   │   ├── stripe/webhook/       # Stripe payment webhook handler
│   │   ├── upload/               # File upload endpoints (R2 integration)
│   │   ├── invoice/[id]/         # Dynamic invoice PDF generation
│   │   └── receipt/[id]/         # Dynamic receipt PDF generation
│   ├── actions/                  # Server Actions (mutations, form handlers)
│   ├── qp/                       # Question Provider portal (separate authentication)
│   ├── staff/                    # Staff management portal
│   ├── layout.tsx                # Root layout with global providers
│   └── globals.css               # Global styles and Tailwind directives
│
├── components/                   # React components organized by feature
│   ├── ui/                       # Shadcn/ui primitives (Button, Dialog, Table, etc.)
│   ├── site/                     # Site-wide components (Navbar, Footer, Hero sections)
│   ├── brand/                    # Brand-specific components (LogoIcon, CertificateTemplate)
│   └── admin/                    # Admin-specific components (UserTable, CycleForm, etc.)
│
├── lib/                          # Shared utilities, types, and business logic
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle ORM schema definitions (all tables)
│   │   └── index.ts              # Database client and connection configuration
│   ├── actions/                  # Reusable server-side business logic
│   ├── data/                     # Data fetching functions and queries
│   ├── auth.ts                   # Better Auth configuration and session utilities
│   ├── r2.ts                     # Cloudflare R2 storage client
│   ├── stripe.ts                 # Stripe SDK configuration
│   ├── email.ts                  # Resend email client and templates
│   └── utils.ts                  # General utility functions (cn, formatters, etc.)
│
├── drizzle/                      # Database migrations
│   ├── 0000_*.sql                # Initial schema migration
│   ├── 0001_*.sql                # Subsequent migrations (chronological)
│   └── meta/                     # Drizzle migration metadata
│
├── config/                       # Configuration files
│   └── mcporter.json             # MCP server configuration
│
├── scripts/                      # Utility scripts
│   ├── seed-admin.ts             # Create super admin user
│   └── seed-subjects.ts          # Populate subject data
│
├── public/                       # Static assets (images, fonts, favicons)
│
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Environment variable template
├── drizzle.config.ts             # Drizzle ORM and Drizzle Kit configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

#### Key Directory Purposes

**`app/(auth)/`** — Public authentication routes using Next.js route groups. Pages in this group share a minimal layout optimized for sign-in/sign-up flows. No authentication required.

**`app/(dashboard)/`** — Protected routes requiring authentication. Role-based access control determines which dashboard sections users can access. Includes admin, coordinator, participant, and partner portals.

**`app/(marketing)/`** — Public marketing and informational pages. These routes are optimized for SEO and public visibility, providing information about the G.A.T.E. program to prospective participants and partners.

**`app/api/`** — API routes for external integrations (Stripe webhooks), file operations (R2 uploads), authentication (Better Auth), and dynamic document generation (invoices, receipts).

**`components/`** — Reusable React components organized by scope. The `ui/` folder contains design system primitives, while `site/`, `brand/`, and `admin/` contain domain-specific components.

**`lib/`** — Shared business logic, utilities, and configurations. The `db/` folder contains the Drizzle ORM schema and database client. The `actions/` and `data/` folders contain server-side logic for mutations and queries.

**`drizzle/`** — Version-controlled SQL migration files generated by Drizzle Kit. These migrations represent the complete history of database schema changes and are applied sequentially using `npm run db:migrate`.

**`config/`** — Application configuration files for external services and integrations.

## Development Commands

The G.A.T.E. platform provides several npm scripts for development, building, and database management:

### Development & Build

- **`npm run dev`** — Start the Next.js development server with hot reloading at http://localhost:3000
- **`npm run build`** — Create an optimized production build
- **`npm run start`** — Start the production server (requires `npm run build` first)
- **`npm run lint`** — Run ESLint to check code quality and style

### Database Management

- **`npm run db:generate`** — Generate Drizzle ORM migration files from schema changes
- **`npm run db:migrate`** — Apply pending database migrations to your database
- **`npm run db:push`** — Push schema changes directly to the database (development only)
- **`npm run db:studio`** — Launch Drizzle Studio for visual database management at http://localhost:4983

### Data Seeding

- **`npm run seed:admin`** — Create a super admin user account for platform administration
- **`npm run seed:subjects`** — Populate the database with default assessment subjects

### Typical Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make schema changes in db/schema.ts, then push to database
npm run db:push

# 3. (Optional) Open Drizzle Studio to inspect database
npm run db:studio

# 4. Seed initial data if needed
npm run seed:admin
npm run seed:subjects

# 5. Check code quality before committing
npm run lint
```

## Environment Setup

The G.A.T.E. platform requires several third-party services to function properly. Follow these steps to configure your environment:

### 1. Create Environment File

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env.local
```

### 2. Configure Required Services

The platform requires 13 environment variables across 5 core services. Configure each service below:

---

#### Database (Neon Postgres)

**Required Variables:**
- `DATABASE_URL` — Pooled connection string for Neon Postgres database

**Setup Instructions:**

1. Create a [Neon](https://neon.tech) account
2. Create a new project and database
3. Navigate to **Connection Details** in your Neon dashboard
4. Copy the **Pooled connection** string (optimized for serverless environments)
5. Add to `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"
```

**Why Pooled Connection?** Neon's pooled connections are optimized for serverless environments like Next.js, preventing connection exhaustion during high traffic.

---

#### Email Service (Resend)

**Required Variables:**
- `RESEND_API_KEY` — API key for transactional email delivery
- `RESEND_FROM_EMAIL` — Verified sender email address

**Setup Instructions:**

1. Create a [Resend](https://resend.com) account
2. Navigate to **API Keys** → [https://resend.com/api-keys](https://resend.com/api-keys)
3. Click **Create API Key**
4. Copy the generated API key
5. Add a verified domain or use Resend's testing email
6. Add to `.env.local`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="G.A.T.E. Olympiad <noreply@yourdomain.com>"
```

**Note:** For production, you must verify your domain. For development, you can use Resend's test email: `onboarding@resend.dev`

---

#### Authentication (Better Auth)

**Required Variables:**
- `BETTER_AUTH_SECRET` — Secret key for session encryption and JWT signing
- `BETTER_AUTH_URL` — Base URL for authentication callbacks

**Setup Instructions:**

1. Generate a secure random secret (32-byte base64 string):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

2. Copy the generated string
3. Set the authentication URL to match your app URL
4. Add to `.env.local`:

```env
BETTER_AUTH_SECRET="your-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

**Production:** Update `BETTER_AUTH_URL` to your production domain (e.g., `https://gate.example.com`)

---

#### Application Configuration

**Required Variable:**
- `NEXT_PUBLIC_APP_URL` — Public base URL for the application

**Setup Instructions:**

1. For local development, use `http://localhost:3000`
2. For production, use your deployed domain
3. Add to `.env.local`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Note:** This variable is prefixed with `NEXT_PUBLIC_` which means it's exposed to the browser. Never include secrets in variables with this prefix.

---

#### Payment Processing (Stripe)

**Required Variables:**
- `STRIPE_SECRET_KEY` — Secret API key for server-side Stripe operations
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret for verifying Stripe events

**Setup Instructions:**

1. Create a [Stripe](https://stripe.com) account
2. Navigate to **Developers** → **API keys** → [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
3. Copy your **Secret key** (starts with `sk_test_` for test mode, `sk_live_` for production)
4. Set up a webhook endpoint:
   - Navigate to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (use ngrok or similar for local testing)
   - Select events to listen for: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`)
5. Add to `.env.local`:

```env
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxx"
```

**Local Testing:** Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhook events to your local development server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

#### File Storage (Cloudflare R2)

**Required Variables:**
- `R2_ENDPOINT` — S3-compatible endpoint URL for your R2 account
- `R2_ACCESS_KEY_ID` — Access key ID for R2 authentication
- `R2_SECRET_ACCESS_KEY` — Secret access key for R2 authentication
- `R2_BUCKET_NAME` — Name of the R2 bucket for storing documents
- `R2_PUBLIC_URL` — Public URL for serving uploaded files (e.g., question images)

**Setup Instructions:**

1. Create a [Cloudflare](https://cloudflare.com) account
2. Navigate to **R2** → [https://dash.cloudflare.com/?to=/:account/r2](https://dash.cloudflare.com/?to=/:account/r2)
3. Create a new R2 bucket:
   - Click **Create bucket**
   - Name it `gate-documents` (or your preferred name)
   - Click **Create bucket**
4. Enable public access (for question images):
   - Select your bucket
   - Go to **Settings** → **Public access**
   - Click **Allow access**
   - Copy the `r2.dev` URL (e.g., `https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev`)
5. Create API tokens:
   - Navigate to **Manage R2 API Tokens**
   - Click **Create API token**
   - Set permissions: **Object Read & Write**
   - Copy the **Access Key ID** and **Secret Access Key**
6. Get your account ID from the R2 dashboard URL
7. Construct your endpoint: `https://<account-id>.r2.cloudflarestorage.com`
8. Add to `.env.local`:

```env
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="gate-documents"
R2_PUBLIC_URL="https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev"
```

**What Gets Stored:**
- Participant identity documents
- Generated certificates (PDF)
- User profile photos
- Partner organization logos
- Career applicant CVs and cover letters
- Question images and attachments

---

### 3. Verify Environment Configuration

After configuring all variables, verify your `.env.local` file contains all 13 required variables:

```bash
# Count configured variables (should be 13)
grep -c "^[A-Z]" .env.local
```

### 4. Initialize Database

Run database migrations to set up the schema:

```bash
npm run db:push
# or
pnpm db:push
```

### 5. Test Configuration

Start the development server and verify all services are working:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and check:
- ✅ Application loads without errors
- ✅ Database connection successful (check server logs)
- ✅ Authentication flow works (try signing up/in)
- ✅ Email delivery works (check Resend dashboard for test emails)

### Troubleshooting

**Database Connection Issues:**
- Verify your Neon database is active (not paused due to inactivity)
- Ensure you're using the **pooled connection** string, not the direct connection
- Check that `?sslmode=require` is appended to the connection string

**Email Not Sending:**
- Verify your Resend API key is valid
- Check the Resend dashboard for failed delivery logs
- Ensure `RESEND_FROM_EMAIL` uses a verified domain (or use `onboarding@resend.dev` for testing)

**Stripe Webhooks Not Received:**
- Use Stripe CLI for local development: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook endpoint is publicly accessible in production
- Check Stripe dashboard → Developers → Webhooks for delivery logs

**R2 Upload Failures:**
- Verify your R2 API token has **Object Read & Write** permissions
- Check that the bucket name matches exactly (case-sensitive)
- Ensure the endpoint URL includes your correct account ID

## Database Setup

The G.A.T.E. platform uses [Drizzle ORM](https://orm.drizzle.team) with [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for type-safe database operations and schema management. All database commands are configured in `package.json` and use the Drizzle configuration defined in `drizzle.config.ts`.

### Database Configuration

Drizzle is configured to use:
- **Dialect:** PostgreSQL
- **Schema Location:** `./lib/db/schema.ts`
- **Migrations Output:** `./drizzle`
- **Connection:** Uses `DATABASE_URL` from `.env.local`

### Schema Management Commands

#### Generate Migration Files

```bash
npm run db:generate
```

Generates SQL migration files based on schema changes in `lib/db/schema.ts`. This command:
- Analyzes your Drizzle schema for changes
- Creates timestamped migration SQL files in the `./drizzle` directory
- Preserves a history of all schema changes for version control

**When to use:** After modifying the database schema (adding tables, columns, indexes, or constraints)

---

#### Apply Migrations

```bash
npm run db:migrate
```

Applies pending migration files to your database. This command:
- Executes SQL migrations in chronological order
- Tracks which migrations have been applied
- Ensures database schema matches your migration history

**When to use:** After generating migrations or when deploying to a new environment

---

#### Push Schema Changes

```bash
npm run db:push
```

Directly pushes schema changes to the database without generating migration files. This command:
- Syncs the database schema directly from `lib/db/schema.ts`
- Automatically creates, alters, or drops tables and columns as needed
- Ideal for rapid development iteration

**When to use:** During local development for quick prototyping. **Not recommended for production** — use migrations for production deployments.

**⚠️ Caution:** This command can result in data loss if schema changes involve dropping columns or tables. Always back up data before using in non-local environments.

---

#### Open Drizzle Studio

```bash
npm run db:studio
```

Launches [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) — a visual database browser and editor. This command:
- Starts a local web interface (usually at `https://local.drizzle.studio`)
- Provides a GUI for viewing and editing database records
- Allows exploring schema structure, relationships, and indexes

**When to use:** For visual database inspection, manual data editing, or exploring the database structure without SQL

---

### Database Seeding

The platform includes seed scripts for initializing essential data:

#### Seed Super Admin User

```bash
npm run seed:admin
```

Creates the first super admin user with full system access. This script:
- Generates a super admin account with `super_admin` role
- Sets up initial authentication credentials
- Required before first login to the platform

**When to use:** 
- After initial database setup
- When you need to create or reset the super admin account
- Before deploying to a new environment

**⚠️ Important:** Store the generated credentials securely. The super admin has unrestricted access to all platform functions.

---

#### Seed Subject Data

```bash
npm run seed:subjects
```

Populates the database with standard academic subjects for G.A.T.E. assessments. This script:
- Adds predefined subject categories (Mathematics, Physics, Chemistry, etc.)
- Sets up subject metadata and configuration
- Required for creating assessment rounds

**When to use:**
- After initial database setup
- Before creating the first assessment cycle
- When subject data needs to be reset or updated

---

### Complete Database Initialization

For a fresh installation, run these commands in order:

```bash
# 1. Push the initial schema to the database
npm run db:push

# 2. Seed the super admin user
npm run seed:admin

# 3. Seed subject data
npm run seed:subjects

# 4. (Optional) Open Drizzle Studio to verify
npm run db:studio
```

After these steps, your database will be fully initialized with:
- ✅ Complete schema (users, cycles, rounds, registrations, payments, partners, etc.)
- ✅ Super admin account for first login
- ✅ Subject data for creating assessments

---

### Schema Development Workflow

**Local Development:**
```bash
# 1. Modify schema in lib/db/schema.ts
# 2. Push changes directly to local database
npm run db:push

# 3. Verify changes in Drizzle Studio
npm run db:studio
```

**Production Deployment:**
```bash
# 1. Modify schema in lib/db/schema.ts
# 2. Generate migration files
npm run db:generate

# 3. Review generated SQL in ./drizzle directory
# 4. Commit migration files to version control
git add drizzle/
git commit -m "Add migration: [description]"

# 5. Deploy and apply migrations
npm run db:migrate
```

---

### Troubleshooting

**Migration Conflicts:**
- If migrations fail, check the `./drizzle` directory for conflicting migration files
- Resolve schema conflicts before retrying
- Use `npm run db:studio` to inspect the current database state

**Connection Errors:**
- Verify `DATABASE_URL` is set correctly in `.env.local`
- Ensure your Neon database is active and accessible
- Check that you're using the pooled connection string

**Seed Script Failures:**
- Ensure the database schema is up to date (`npm run db:push`)
- Check for existing data that might conflict with seed data
- Review script output for specific error messages

## Brand Standards

All visual materials, certificates, and user interfaces adhere to the official **G.A.T.E. Assessment Brand Identity** guidelines. Refer to `GATE-Brand-Kit-v2/GATE-BRAND-DOCUMENTATION.md` for:

- Correct brand name usage (always "G.A.T.E." with dots)
- Official color palette (Deep Academic Blue #0B1F3A, Prestige Gold #C9993A)
- Typography standards (Montserrat font family)
- Logo and visual identity rules

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Learn about Next.js features and API
- [G.A.T.E. Brand Guidelines](./GATE-Brand-Kit-v2/GATE-BRAND-DOCUMENTATION.md) — Official brand identity reference
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) — TypeScript language reference

## License

This project is proprietary software for the G.A.T.E. Assessment program.

---

*G.A.T.E. Assessment · Global Academic & Theoretical Excellence Assessment · Beijing, China*
