/**
 * @fileoverview Server-side authorization guards and RBAC (Role-Based Access Control) for G.A.T.E. Assessment
 *
 * ⚠️ **SERVER-SIDE ONLY** - This module is for use in Server Components, Server Actions, and API Routes only.
 * Do NOT import this in Client Components. Use {@link ./auth-client.ts} for client-side authentication instead.
 *
 * This module provides authorization guards that enforce authentication and role-based access control
 * across the G.A.T.E. Assessment application. It implements a 7-role RBAC system with automatic redirects
 * on authorization failures.
 *
 * **Key Features:**
 * - Session validation with email verification checks
 * - Role-based access control (RBAC) with 7 roles
 * - Automatic redirects on auth/authz failures (never throws errors)
 * - Type-safe role definitions from database schema
 * - Staff-only guards for admin/coordinator access
 * - Role-specific home page routing via ROLE_HOME constant
 *
 * **RBAC System - 7 Roles:**
 * 1. **super_admin** - Full system access, user management, all administrative functions
 * 2. **admin** - Administrative access similar to super_admin
 * 3. **coordinator** - Staff member who coordinates assessments
 * 4. **participant** - Regular user taking assessments
 * 5. **partner_contact** - External partner representative
 * 6. **career_applicant** - User applying for career opportunities
 * 7. **question_provider** - User who contributes assessment questions (separate auth flow)
 *
 * **Security Model:**
 * - All guards redirect on failure (never throw errors or return null)
 * - Email verification is enforced for all authenticated routes
 * - Roles default to "participant" if not set
 * - Staff roles: super_admin, admin, coordinator
 * - Role assignment happens server-side only (not client-settable)
 *
 * **Guard Functions:**
 * - `getCurrentSession()` - Returns session or null (does not redirect)
 * - `requireSession()` - Requires authentication + email verification
 * - `requireStaffSession()` - Requires staff role (admin/coordinator/super_admin)
 * - `requireRole()` - Requires specific role(s)
 *
 * **Redirect Behavior:**
 * - No session → /login
 * - Unverified email → /verify-email?email=xxx
 * - Insufficient role → / (home page)
 * - Staff-only route without staff role → /
 * - Staff login without session → /staff
 *
 * **Architecture:**
 * This module depends on {@link ./auth.ts} for the Better Auth instance and session management.
 * The ROLE_HOME constant defines role-specific home pages used for post-login redirects.
 * The question_provider role has a separate authentication flow at /qp/sign-in.
 *
 * @example
 * // Protect a Server Component
 * import { requireSession } from "@/lib/authz";
 *
 * export default async function DashboardPage() {
 *   const session = await requireSession();
 *   return <div>Welcome, {session.user.email}</div>;
 * }
 *
 * @example
 * // Protect a Server Action with role check
 * "use server";
 * import { requireRole } from "@/lib/authz";
 *
 * export async function deleteUser(userId: string) {
 *   await requireRole(["admin", "super_admin"]);
 *   // Admin-only action
 * }
 *
 * @see {@link ./auth.ts} for server-side auth configuration
 * @see {@link ./auth-client.ts} for client-side auth hooks
 * @see {@link ./db/schema.ts} for Role type definition
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./db/schema";

/**
 * Get the current user's session without enforcing authentication.
 *
 * Returns the current session if the user is authenticated, or null if not.
 * This function does NOT redirect on failure - use this when you need to
 * check authentication status without forcing a login.
 *
 * **Use Cases:**
 * - Conditional rendering based on auth state
 * - Optional authentication (e.g., public pages with optional user features)
 * - Checking session before showing login/signup buttons
 * - Building navigation that changes based on auth state
 *
 * **Return Value:**
 * - Returns Session object if user is authenticated
 * - Returns null if user is not authenticated
 * - Does NOT redirect on failure (unlike requireSession)
 *
 * **Note:** This function does not check email verification status.
 * If you need to ensure email is verified, use `requireSession()` instead.
 *
 * @returns {Promise<Session | null>} Current session or null
 *
 * @example
 * // Optional authentication in a page
 * import { getCurrentSession } from "@/lib/authz";
 *
 * export default async function HomePage() {
 *   const session = await getCurrentSession();
 *
 *   return (
 *     <div>
 *       {session ? (
 *         <p>Welcome back, {session.user.email}</p>
 *       ) : (
 *         <a href="/login">Sign in to continue</a>
 *       )}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Conditional navigation based on auth state
 * const session = await getCurrentSession();
 *
 * return (
 *   <nav>
 *     <a href="/">Home</a>
 *     {session ? (
 *       <>
 *         <a href="/participant">Dashboard</a>
 *         <a href="/profile">Profile</a>
 *       </>
 *     ) : (
 *       <>
 *         <a href="/login">Sign In</a>
 *         <a href="/register">Sign Up</a>
 *       </>
 *     )}
 *   </nav>
 * );
 *
 * @example
 * // Check auth before showing admin link
 * const session = await getCurrentSession();
 * const userRole = session?.user.role ?? "participant";
 * const isAdmin = ["admin", "super_admin"].includes(userRole);
 *
 * return (
 *   <div>
 *     {isAdmin && <a href="/admin">Admin Panel</a>}
 *   </div>
 * );
 *
 * @see {@link requireSession} for enforcing authentication with redirect
 */
export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Require authentication and email verification, redirecting if not satisfied.
 *
 * This is the primary guard function for protecting authenticated routes.
 * It ensures the user is signed in AND has verified their email address.
 * If either condition fails, the user is automatically redirected.
 *
 * **Redirect Behavior:**
 * 1. No session → Redirects to `/login`
 * 2. Email not verified → Redirects to `/verify-email?email=xxx`
 * 3. Both satisfied → Returns session and continues
 *
 * **Email Verification:**
 * All authenticated routes require email verification by default. This prevents
 * users from accessing protected resources before confirming their email address.
 * The verification flow sends a 6-digit OTP code via Resend (see lib/auth.ts).
 *
 * **Use Cases:**
 * - Protect dashboard pages
 * - Protect user profile pages
 * - Protect server actions that require authentication
 * - Protect API routes that need authenticated users
 *
 * **Best Practices:**
 * - Use this for general authenticated routes (no specific role required)
 * - For role-based protection, use `requireRole()` or `requireStaffSession()` instead
 * - Always call this at the top of protected Server Components and Server Actions
 * - Do not use in Client Components (redirects won't work)
 *
 * @returns {Promise<Session>} The validated session object with user data
 * @throws {RedirectError} Automatically redirects to /login or /verify-email (never throws in normal flow)
 *
 * @example
 * // Protect a Server Component page
 * import { requireSession } from "@/lib/authz";
 *
 * export default async function ParticipantDashboard() {
 *   const session = await requireSession();
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {session.user.firstName || session.user.email}</h1>
 *       <p>Your role: {session.user.role}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Protect a Server Action
 * "use server";
 * import { requireSession } from "@/lib/authz";
 *
 * export async function updateProfile(data: ProfileFormData) {
 *   const session = await requireSession();
 *
 *   // Update user's own profile
 *   await db.user.update({
 *     where: { id: session.user.id },
 *     data: { firstName: data.firstName, lastName: data.lastName }
 *   });
 * }
 *
 * @example
 * // Protect an API route handler
 * import { requireSession } from "@/lib/authz";
 *
 * export async function GET(request: Request) {
 *   const session = await requireSession();
 *
 *   return Response.json({
 *     userId: session.user.id,
 *     email: session.user.email
 *   });
 * }
 *
 * @example
 * // Access user data after validation
 * const session = await requireSession();
 * console.log(session.user.id);         // User ID
 * console.log(session.user.email);      // Email address
 * console.log(session.user.role);       // User role
 * console.log(session.user.firstName);  // First name (optional)
 * console.log(session.user.emailVerified); // true (always true after this guard)
 *
 * @see {@link getCurrentSession} for optional authentication without redirect
 * @see {@link requireRole} for role-based authentication
 * @see {@link requireStaffSession} for staff-only authentication
 */
export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }
  return session;
}

/**
 * Require staff role (super_admin, admin, or coordinator), redirecting if not satisfied.
 *
 * This guard function enforces that the user has one of the three staff roles.
 * It's designed for pages and actions that should only be accessible to staff members
 * who manage the G.A.T.E. Assessment system.
 *
 * **Staff Roles:**
 * - `super_admin` - Full system access
 * - `admin` - Administrative access
 * - `coordinator` - Assessment coordination access
 *
 * **Redirect Behavior:**
 * 1. No session → Redirects to `/staff` (staff login page)
 * 2. Non-staff role → Redirects to `/` (home page)
 * 3. Staff role → Returns session and continues
 *
 * **Note:** This function redirects to `/staff` instead of `/login` when no session
 * is found. This allows for a separate staff authentication flow if needed.
 *
 * **Use Cases:**
 * - Protect admin dashboard pages
 * - Protect coordinator tools and interfaces
 * - Protect staff-only server actions (user management, system config, etc.)
 * - Protect internal reporting and analytics pages
 *
 * **Security Note:**
 * This function assumes the user's role is correctly assigned in the database.
 * Role assignment happens server-side only and cannot be set by clients.
 * If no role is found, defaults to "participant" (non-staff).
 *
 * @returns {Promise<Session>} The validated session object with staff user data
 * @throws {RedirectError} Automatically redirects to /staff or / (never throws in normal flow)
 *
 * @example
 * // Protect an admin dashboard page
 * import { requireStaffSession } from "@/lib/authz";
 *
 * export default async function AdminDashboard() {
 *   const session = await requireStaffSession();
 *
 *   return (
 *     <div>
 *       <h1>Admin Dashboard</h1>
 *       <p>Logged in as: {session.user.email}</p>
 *       <p>Role: {session.user.role}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Protect a staff-only Server Action
 * "use server";
 * import { requireStaffSession } from "@/lib/authz";
 *
 * export async function deleteUserAccount(userId: string) {
 *   const session = await requireStaffSession();
 *
 *   // Log the admin action
 *   await auditLog.create({
 *     action: "delete_user",
 *     staffId: session.user.id,
 *     targetUserId: userId
 *   });
 *
 *   // Perform deletion
 *   await db.user.delete({ where: { id: userId } });
 * }
 *
 * @example
 * // Check specific staff role after validation
 * const session = await requireStaffSession();
 *
 * // All staff can access, but show different UI based on role
 * if (session.user.role === "super_admin") {
 *   return <SuperAdminControls />;
 * } else if (session.user.role === "coordinator") {
 *   return <CoordinatorTools />;
 * } else {
 *   return <GeneralAdminPanel />;
 * }
 *
 * @see {@link requireRole} for more granular role-based access control
 * @see {@link requireSession} for general authentication without role requirements
 */
export async function requireStaffSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/staff");
  const role = (session.user as { role?: Role }).role ?? "participant";
  const staffRoles: Role[] = ["super_admin", "admin", "coordinator"];
  if (!staffRoles.includes(role)) redirect("/");
  return session;
}

/**
 * Require specific role(s) for access, redirecting if not satisfied.
 *
 * This is the most flexible authorization guard - it allows you to specify exactly
 * which role(s) are allowed to access a resource. You can pass a single role or
 * an array of roles. The user must have at least one of the allowed roles.
 *
 * **Behavior:**
 * 1. Validates session (calls requireSession internally)
 * 2. Checks if user's role matches any allowed role
 * 3. Redirects to `/` if role doesn't match
 * 4. Returns session if role matches
 *
 * **Role Defaults:**
 * If the user has no role assigned, defaults to "participant".
 *
 * **Use Cases:**
 * - Protect pages that require specific roles
 * - Allow multiple roles to access the same resource
 * - Implement fine-grained authorization for sensitive actions
 * - Create role-specific features or UI sections
 *
 * **Redirect Behavior:**
 * - No session or unverified email → Redirects via requireSession() (/login or /verify-email)
 * - Wrong role → Redirects to `/` (home page)
 * - Correct role → Returns session and continues
 *
 * **Security Notes:**
 * - Always redirects on failure (never throws errors or returns null)
 * - Role is read from session.user.role (server-side only field)
 * - Roles cannot be modified by clients (enforced in Better Auth config)
 *
 * @param {Role | Role[]} allowed - Single role or array of allowed roles
 * @returns {Promise<Session>} The validated session object with authorized user
 * @throws {RedirectError} Automatically redirects if role doesn't match (never throws in normal flow)
 *
 * @example
 * // Require single role
 * import { requireRole } from "@/lib/authz";
 *
 * export default async function QuestionProviderDashboard() {
 *   const session = await requireRole("question_provider");
 *
 *   return <div>Question Provider Dashboard</div>;
 * }
 *
 * @example
 * // Allow multiple roles
 * export default async function PartnerPortal() {
 *   const session = await requireRole(["partner_contact", "admin", "super_admin"]);
 *
 *   // Partners and admins can both access
 *   return <div>Partner Portal</div>;
 * }
 *
 * @example
 * // Protect admin-only Server Action
 * "use server";
 * import { requireRole } from "@/lib/authz";
 *
 * export async function updateSystemSettings(settings: SystemSettings) {
 *   await requireRole(["admin", "super_admin"]);
 *
 *   // Only admins and super_admins can change settings
 *   await db.systemSettings.update({ data: settings });
 * }
 *
 * @example
 * // Check role for conditional logic
 * const session = await requireRole(["coordinator", "admin"]);
 *
 * // Get data based on role
 * const assessments = session.user.role === "coordinator"
 *   ? await getCoordinatorAssessments(session.user.id)
 *   : await getAllAssessments(); // admin sees all
 *
 * @example
 * // API route with role protection
 * import { requireRole } from "@/lib/authz";
 *
 * export async function POST(request: Request) {
 *   await requireRole("question_provider");
 *
 *   const questionData = await request.json();
 *   return Response.json({ success: true });
 * }
 *
 * @see {@link requireStaffSession} for staff-only access (admin/coordinator/super_admin)
 * @see {@link requireSession} for authentication without role requirements
 * @see {@link ROLE_HOME} for role-specific home page mappings
 */
export async function requireRole(allowed: Role | Role[]) {
  const session = await requireSession();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  const role = (session.user as { role?: Role }).role ?? "participant";
  if (!allowedList.includes(role)) redirect("/");
  return session;
}

/**
 * Role-to-home-page mapping for post-login redirects.
 *
 * This constant defines the default "home page" for each role in the G.A.T.E.
 * Assessment system. After successful login, users are redirected to their
 * role-specific home page based on this mapping.
 *
 * **Role Mappings:**
 *
 * - **super_admin** → `/admin`
 *   Full system administration dashboard with user management, system settings,
 *   audit logs, and all administrative features.
 *
 * - **admin** → `/admin`
 *   Administrative dashboard similar to super_admin. Both roles share the same
 *   admin interface (permissions may differ within the dashboard).
 *
 * - **coordinator** → `/coordinator`
 *   Assessment coordinator dashboard for managing assessments, participants,
 *   scheduling, and coordination tasks.
 *
 * - **participant** → `/participant`
 *   Participant dashboard for taking assessments, viewing results, and
 *   managing profile. This is the default role for regular users.
 *
 * - **partner_contact** → `/partner`
 *   Partner organization dashboard for managing partnership-related features,
 *   viewing partner-specific data and reports.
 *
 * - **career_applicant** → `/`
 *   Home page for career applicants. These users access career-related
 *   features from the public site.
 *
 * - **question_provider** → `/qp`
 *   Question provider dashboard for contributing and managing assessment questions.
 *   Note: Question providers have a separate authentication flow at `/qp/sign-in`.
 *
 * **Usage:**
 * This constant is typically used in:
 * - Post-login redirect logic
 * - Navigation components (back to home)
 * - Role-based routing decisions
 * - Default landing page selection
 *
 * **Security Note:**
 * This mapping defines the DEFAULT home page for each role, but it does not
 * enforce authorization. You must still use authorization guards (requireRole,
 * requireSession, requireStaffSession) to protect each page.
 *
 * @constant
 * @type {Record<Role, string>}
 *
 * @example
 * // Redirect user to their role-specific home after login
 * import { ROLE_HOME } from "@/lib/authz";
 *
 * async function handleLogin(email: string, password: string) {
 *   const session = await signIn.email({ email, password });
 *   const userRole = session.user.role ?? "participant";
 *   const homePage = ROLE_HOME[userRole];
 *   redirect(homePage);
 * }
 *
 * @example
 * // Navigation component with role-based home link
 * import { getCurrentSession, ROLE_HOME } from "@/lib/authz";
 *
 * export default async function Navbar() {
 *   const session = await getCurrentSession();
 *
 *   if (!session) {
 *     return <a href="/">Home</a>;
 *   }
 *
 *   const userRole = session.user.role ?? "participant";
 *   const homePage = ROLE_HOME[userRole];
 *
 *   return (
 *     <nav>
 *       <a href={homePage}>Dashboard</a>
 *     </nav>
 *   );
 * }
 *
 * @example
 * // Get role-specific home in a Server Action
 * "use server";
 * import { requireSession, ROLE_HOME } from "@/lib/authz";
 * import { redirect } from "next/navigation";
 *
 * export async function goToHome() {
 *   const session = await requireSession();
 *   const userRole = session.user.role ?? "participant";
 *   redirect(ROLE_HOME[userRole]);
 * }
 *
 * @example
 * // Check all possible home pages
 * import { ROLE_HOME } from "@/lib/authz";
 *
 * console.log(ROLE_HOME);
 * // Output:
 * // {
 * //   super_admin: "/admin",
 * //   admin: "/admin",
 * //   coordinator: "/coordinator",
 * //   participant: "/participant",
 * //   partner_contact: "/partner",
 * //   career_applicant: "/",
 * //   question_provider: "/qp"
 * // }
 *
 * @see {@link Role} type definition from db/schema.ts
 * @see {@link requireRole} for enforcing role-based access
 */
export const ROLE_HOME: Record<Role, string> = {
  super_admin: "/admin",
  admin: "/admin",
  coordinator: "/coordinator",
  participant: "/participant",
  partner_contact: "/partner",
  career_applicant: "/",
  question_provider: "/qp",
};
