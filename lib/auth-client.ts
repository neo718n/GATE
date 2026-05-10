/**
 * @fileoverview Better Auth client-side React hooks for G.A.T.E. Assessment
 *
 * ⚠️ **CLIENT-SIDE ONLY** - This module is for use in React Client Components only.
 * Do NOT import this in server components, server actions, or API routes.
 * Use {@link ./auth.ts} for server-side authentication instead.
 *
 * This module provides React hooks and utilities for client-side authentication,
 * including sign in, sign up, sign out, and session management. It integrates with
 * Better Auth's React plugin system and automatically syncs with server-side sessions
 * via cookies.
 *
 * **Key Features:**
 * - React hooks for authentication state (useSession)
 * - Client-side sign in/sign up/sign out functions
 * - Email OTP verification flow
 * - Automatic session synchronization with server
 * - TypeScript type inference for custom user fields
 *
 * **Usage:**
 * This module should be imported in React Client Components (files marked with "use client").
 * For server-side authentication, use the auth instance from ./auth.ts instead.
 *
 * @example
 * // In a Client Component
 * "use client";
 * import { useSession, signOut } from "@/lib/auth-client";
 *
 * export function UserProfile() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <div>Not signed in</div>;
 *
 *   return (
 *     <div>
 *       <p>Welcome, {session.user.email}</p>
 *       <button onClick={() => signOut()}>Sign Out</button>
 *     </div>
 *   );
 * }
 *
 * @see {@link ./auth.ts} for server-side authentication
 * @see {@link ./authz.ts} for server-side authorization guards
 * @see {@link https://www.better-auth.com/docs/react} Better Auth React documentation
 */
"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

/**
 * Better Auth client instance for React components.
 *
 * This is the main client-side auth instance that provides React hooks and
 * utilities for authentication. It's configured with plugins to:
 * 1. Infer custom user fields (role, firstName, lastName, country, phone) from server config
 * 2. Enable email OTP verification flow on the client side
 *
 * **Plugins:**
 * - `inferAdditionalFields` - Automatically types custom user fields from server auth config
 * - `emailOTPClient` - Provides client-side OTP verification methods
 *
 * ⚠️ **Do not use this directly** - Instead, use the exported hooks and functions
 * (signIn, signUp, signOut, useSession, getSession) which are destructured from this instance.
 *
 * @internal
 * @see {@link signIn} for signing in users
 * @see {@link signUp} for registering new users
 * @see {@link signOut} for signing out users
 * @see {@link useSession} for accessing session state in React components
 * @see {@link getSession} for programmatically fetching session data
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
});

/**
 * Destructured auth client exports for convenient importing.
 *
 * These are the primary authentication functions and hooks for client-side usage.
 * Each is documented individually below with usage examples.
 */
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

/**
 * Sign in a user with email and password.
 *
 * Authenticates a user and creates a new session. The session is automatically
 * stored in cookies and synchronized with the server. Returns a promise that
 * resolves with the session data on success, or throws an error on failure.
 *
 * **Requirements:**
 * - User must have verified their email before signing in
 * - Password must be at least 8 characters (enforced by server)
 *
 * **Error Handling:**
 * - Throws if email is not verified
 * - Throws if email/password is incorrect
 * - Throws if network request fails
 *
 * @example
 * // Basic sign in
 * import { signIn } from "@/lib/auth-client";
 *
 * async function handleSignIn(email: string, password: string) {
 *   try {
 *     await signIn.email({
 *       email,
 *       password
 *     });
 *     // Redirect to dashboard or home page
 *     router.push("/participant");
 *   } catch (error) {
 *     console.error("Sign in failed:", error);
 *     // Show error message to user
 *   }
 * }
 *
 * @example
 * // With loading state in a form
 * const [isLoading, setIsLoading] = useState(false);
 *
 * async function onSubmit(data: { email: string; password: string }) {
 *   setIsLoading(true);
 *   try {
 *     await signIn.email(data);
 *     toast.success("Signed in successfully!");
 *   } catch (error) {
 *     toast.error("Invalid email or password");
 *   } finally {
 *     setIsLoading(false);
 *   }
 * }
 *
 * @see {@link https://www.better-auth.com/docs/authentication/email-password} Email/Password authentication docs
 */
export { signIn };

/**
 * Register a new user with email and password.
 *
 * Creates a new user account and sends a 6-digit OTP verification code to the
 * provided email address. The user must verify their email before they can sign in.
 * After successful registration, the user is automatically signed in if autoSignIn
 * is enabled (which it is in our config).
 *
 * **Requirements:**
 * - Email must be unique (not already registered)
 * - Password must be at least 8 characters
 * - All required fields must be provided
 *
 * **Custom Fields:**
 * You can optionally provide custom fields during registration:
 * - firstName (string)
 * - lastName (string)
 * - country (string)
 * - phone (string)
 * - role is NOT settable by clients (server assigns "participant" by default)
 *
 * **Verification Flow:**
 * 1. User calls signUp.email() with credentials
 * 2. Server creates unverified account
 * 3. Server sends 6-digit OTP via email
 * 4. User enters OTP on verification page
 * 5. User is automatically signed in after verification
 *
 * @example
 * // Basic sign up
 * import { signUp } from "@/lib/auth-client";
 *
 * async function handleSignUp(data: {
 *   email: string;
 *   password: string;
 *   firstName: string;
 *   lastName: string;
 * }) {
 *   try {
 *     await signUp.email({
 *       email: data.email,
 *       password: data.password,
 *       name: `${data.firstName} ${data.lastName}`, // Better Auth default field
 *       firstName: data.firstName, // Custom field
 *       lastName: data.lastName,   // Custom field
 *     });
 *     // Redirect to OTP verification page
 *     router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
 *   } catch (error) {
 *     console.error("Sign up failed:", error);
 *   }
 * }
 *
 * @example
 * // Sign up with all optional fields
 * await signUp.email({
 *   email: "user@example.com",
 *   password: "securepassword123",
 *   firstName: "John",
 *   lastName: "Doe",
 *   country: "TM", // ISO country code
 *   phone: "+99312345678",
 * });
 *
 * @see {@link https://www.better-auth.com/docs/authentication/email-password} Email/Password authentication docs
 * @see {@link https://www.better-auth.com/docs/plugins/email-otp} Email OTP plugin docs
 */
export { signUp };

/**
 * Sign out the current user and clear their session.
 *
 * Invalidates the current user's session on both client and server, clears
 * authentication cookies, and resets the session state. After signing out,
 * the user will need to sign in again to access protected resources.
 *
 * **Behavior:**
 * - Clears session cookie
 * - Invalidates session on server
 * - Triggers useSession() hook to return null
 * - Does not automatically redirect (you must handle redirection)
 *
 * **Best Practices:**
 * - Always redirect to a public page after signing out
 * - Handle loading state while sign out is in progress
 * - Clear any client-side cached user data after sign out
 *
 * @example
 * // Basic sign out with redirect
 * import { signOut } from "@/lib/auth-client";
 * import { useRouter } from "next/navigation";
 *
 * function SignOutButton() {
 *   const router = useRouter();
 *
 *   async function handleSignOut() {
 *     await signOut();
 *     router.push("/login");
 *   }
 *
 *   return <button onClick={handleSignOut}>Sign Out</button>;
 * }
 *
 * @example
 * // Sign out with loading state
 * const [isSigningOut, setIsSigningOut] = useState(false);
 *
 * async function handleSignOut() {
 *   setIsSigningOut(true);
 *   try {
 *     await signOut();
 *     router.push("/");
 *   } catch (error) {
 *     console.error("Sign out failed:", error);
 *     toast.error("Failed to sign out");
 *   } finally {
 *     setIsSigningOut(false);
 *   }
 * }
 *
 * @example
 * // Sign out from dropdown menu
 * <DropdownMenuItem onClick={() => signOut().then(() => router.push("/"))}>
 *   Sign Out
 * </DropdownMenuItem>
 */
export { signOut };

/**
 * React hook for accessing the current user's session state.
 *
 * Returns the current session data along with loading and error states.
 * This hook automatically re-renders your component when the session changes
 * (e.g., after sign in, sign out, or session refresh).
 *
 * **Return Value:**
 * - `data` - Session object with user data, or null if not authenticated
 * - `isPending` - Boolean indicating if session is still loading
 * - `error` - Error object if session fetch failed, or null
 *
 * **Session Data Structure:**
 * - `session.user.id` - Unique user identifier
 * - `session.user.email` - User's email address
 * - `session.user.emailVerified` - Email verification status
 * - `session.user.role` - User role (e.g., "participant", "admin", "coordinator")
 * - `session.user.firstName` - User's first name (optional)
 * - `session.user.lastName` - User's last name (optional)
 * - `session.user.country` - User's country (optional)
 * - `session.user.phone` - User's phone number (optional)
 *
 * **Best Practices:**
 * - Always check `isPending` before accessing `data` to avoid null errors
 * - Handle the null case (user not signed in)
 * - Use this hook in Client Components only ("use client" directive required)
 *
 * @example
 * // Basic usage with loading state
 * "use client";
 * import { useSession } from "@/lib/auth-client";
 *
 * export function UserProfile() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (!session) {
 *     return <div>Please sign in to continue</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {session.user.firstName || session.user.email}</h1>
 *       <p>Role: {session.user.role}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Conditional rendering based on role
 * const { data: session } = useSession();
 *
 * return (
 *   <div>
 *     {session?.user.role === "admin" && (
 *       <AdminPanel />
 *     )}
 *     {session?.user.role === "participant" && (
 *       <ParticipantDashboard />
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Protected client component with redirect
 * const { data: session, isPending } = useSession();
 * const router = useRouter();
 *
 * useEffect(() => {
 *   if (!isPending && !session) {
 *     router.push("/login");
 *   }
 * }, [session, isPending, router]);
 *
 * @example
 * // Display user info in navbar
 * const { data: session } = useSession();
 *
 * return (
 *   <nav>
 *     {session ? (
 *       <div>
 *         <span>{session.user.email}</span>
 *         <button onClick={() => signOut()}>Sign Out</button>
 *       </div>
 *     ) : (
 *       <a href="/login">Sign In</a>
 *     )}
 *   </nav>
 * );
 *
 * @see {@link getSession} for programmatically fetching session without a hook
 * @see {@link https://www.better-auth.com/docs/react} Better Auth React hooks documentation
 */
export { useSession };

/**
 * Programmatically fetch the current session without using a React hook.
 *
 * Returns a promise that resolves to the current session data, or null if the
 * user is not authenticated. Unlike `useSession`, this is not a hook and does
 * not cause re-renders when the session changes.
 *
 * **Use Cases:**
 * - Fetch session in event handlers or callbacks
 * - Check authentication in non-React code
 * - Get session data in utility functions
 * - Fetch session before performing an action
 *
 * **When to Use:**
 * - ✅ Event handlers (onClick, onSubmit, etc.)
 * - ✅ Utility functions that need current session
 * - ✅ Middleware or guards on the client side
 * - ❌ React component render (use `useSession` instead)
 * - ❌ Server-side code (use `auth.api.getSession` from ./auth.ts instead)
 *
 * **Return Value:**
 * - Returns a Promise that resolves to Session object or null
 * - Session structure is the same as in `useSession`
 *
 * @example
 * // Check auth before submitting a form
 * import { getSession } from "@/lib/auth-client";
 *
 * async function handleSubmit(data: FormData) {
 *   const session = await getSession();
 *
 *   if (!session) {
 *     toast.error("Please sign in to continue");
 *     router.push("/login");
 *     return;
 *   }
 *
 *   // Proceed with form submission
 *   await submitData(data);
 * }
 *
 * @example
 * // Fetch session in an event handler
 * async function handleLikePost(postId: string) {
 *   const session = await getSession();
 *
 *   if (!session) {
 *     alert("Please sign in to like posts");
 *     return;
 *   }
 *
 *   await likePost(postId, session.user.id);
 * }
 *
 * @example
 * // Check role before navigation
 * async function navigateToAdminPanel() {
 *   const session = await getSession();
 *
 *   if (session?.user.role !== "admin") {
 *     toast.error("Access denied: Admin only");
 *     return;
 *   }
 *
 *   router.push("/admin");
 * }
 *
 * @example
 * // Utility function that needs session
 * export async function canEditPost(postId: string): Promise<boolean> {
 *   const session = await getSession();
 *   if (!session) return false;
 *
 *   const post = await fetchPost(postId);
 *   return post.authorId === session.user.id || session.user.role === "admin";
 * }
 *
 * @see {@link useSession} for reactive session access in React components
 * @see {@link https://www.better-auth.com/docs/react} Better Auth React documentation
 */
export { getSession };
