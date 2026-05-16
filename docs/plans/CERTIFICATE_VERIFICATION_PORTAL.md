# Certificate Verification Portal — Implementation Plan

**Status:** Draft v1 · 2026-05-16
**Owner:** GATE Engineering
**Stack:** Next.js 16.2.6 (App Router) · React 19 · Drizzle ORM + Neon Postgres · Tailwind v4 · Better Auth · @react-pdf/renderer 4.5.1
**Goal:** Ship a public, document-grade certificate verification portal that becomes a **trust moat** vs SOF / CREST. Every G.A.T.E. certificate carries a unique code + QR; anyone (universities, employers) can verify at `/verify` without an account.

---

## UI/UX North Star (reference for every implementation phase)

- **Mood:** institutional document / passport check page — *not* marketing glassmorphism.
- **Visual language:** white surfaces, single brand accent (`--gate-gold`), restrained semantic colors (emerald = verified, red = tampered/not-found, amber = revoked).
- **Type:** existing GATE sans for UI; serif or distinctive display for the participant name on the result card (gives "credential weight").
- **Iconography:** Lucide only. Verified = `ShieldCheck`. Not-found = `ShieldAlert`. Tampered = `ShieldX`. Code = `Hash`.
- **Mobile-first**, sub-2s server-rendered result page.
- **A11y:** WCAG AA contrast, visible focus rings, no color-only meaning (always icon + text for state), `aria-live` for async feedback.
- **Reuse existing tokens** in `app/globals.css` (`bg-gate-gold`, `text-gate-800`, etc.). Do not add new colors.

---

## Phase 0 — Documentation Discovery (✅ DONE — read before any phase)

### Allowed APIs

| Library | API | Source |
|---|---|---|
| `@react-pdf/renderer` v4.5.1 (installed) | `Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet.create`, `Font.register`, `ReactPDF.renderToBuffer(<Doc/>)` returning `Promise<Buffer>` | https://react-pdf.org/components, /styling, /fonts, /advanced |
| `qrcode` v1.5.4 (**install**) | `QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin: 1, width: 256 })` → Promise<dataUrl> | https://www.npmjs.com/package/qrcode |
| `@yudiel/react-qr-scanner` v2.5.1 (**install** — uses BarcodeDetector internally + ZXing fallback) | `<Scanner onScan={(results) => …} />` | https://www.npmjs.com/package/@yudiel/react-qr-scanner |
| `papaparse` v5.5.3 (**install**) | `Papa.parse(file, { header: true, skipEmptyLines: true, complete })` — **client-only** | https://www.papaparse.com/docs |
| `@marsidev/react-turnstile` (**install**) | `<Turnstile siteKey onSuccess={(token)=>…} />` + server-side verify POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` | https://developers.cloudflare.com/turnstile/ |
| Node `crypto` (built-in) | `crypto.createHmac('sha256', secret).update(code).digest('hex')`; `crypto.randomInt(0, 32)` | https://nodejs.org/api/crypto.html |
| Next.js 16 dynamic params | `{ params }: { params: Promise<{ code: string }> }` — must `await params` | https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes |
| Drizzle | `pgTable`, `pgEnum`, `text`, `integer`, `timestamp`, `boolean`, `unique`, `index`, `references()`, `relations()` — pattern in `lib/db/schema.ts` | existing repo |
| Authz | `requireRole("admin", "super_admin")` from `lib/authz.ts` (admin) — public pages skip this | existing repo |

### Allowed code patterns (cite when implementing)

- **Drizzle table:** `lib/db/schema.ts` — table at lines 320–380 (`result` table with `certificateUrl` at line 351). Copy column-helper style, `relations()` block at end.
- **Migration commands:** `npm run db:generate` → `npm run db:migrate` (from `package.json` lines 12–15).
- **Server action:** `lib/actions/enrollments.ts` — `"use server"` at line 1, `requireRole(...)` guard, Zod validation, `db.insert().values()`, return `{ success: true, ... }` or throw.
- **PDF generation:** `components/receipt-pdf.tsx` (component) + `lib/generate-receipt.tsx` (server invocation with `ReactPDF.renderToBuffer` and R2 upload via `r2Client` from `lib/r2.ts`).
- **Rate limit:** `lib/rate-limit.ts` — `checkRateLimit(key, limit, windowMs)` returns `{ ok, remaining }`. In-memory; fine for V1.
- **Admin sidebar nav:** `components/dashboard-sidebar.tsx` — link items are `{ href, label }` with `ICON_MAP` (lines 14–30) resolving Lucide icons.
- **Footer:** `components/site/footer.tsx` — `PARTICIPATE_LINKS` constant. Add a new "Verify Certificate" entry under a relevant column (or new "Resources" column).
- **Vitest:** `vitest.config.ts` uses jsdom + globals; tests live under `__tests__/`.

### Anti-patterns to avoid

- ❌ Do NOT invent a `renderToString` returning a buffer — it returns a string. Use `renderToBuffer` for PDF.
- ❌ Do NOT use BarcodeDetector directly — Safari & Firefox gaps. Use `@yudiel/react-qr-scanner` which polyfills internally.
- ❌ Do NOT add a `tailwind.config.ts` — project uses Tailwind v4 `@theme inline` in `globals.css`.
- ❌ Do NOT call Server Actions for the public verify API — use Route Handlers (Server Actions aren't designed as a public RPC surface).
- ❌ Do NOT store raw participant email or any internal IDs on the cert row — only what is printed on the certificate. Snapshot at issue time.
- ❌ Do NOT expose enumeration: `/verify/INVALIDCODE` and `/verify/REVOKEDCODE` must take the same response time as a hit (constant-time HMAC compare).

---

## Phase 1 — Schema & Migration

**What to copy:** the column-helper style from `lib/db/schema.ts:320-380`, the `pgEnum` pattern from line 56/112, the `relations()` block at end of file.

### Tasks

1. **Add `award_tier` enum** if not already present (Gold, Silver, Bronze, Participation, Merit). Check existing enums first to avoid duplicate definitions.
2. **Add `certificate` table** in `lib/db/schema.ts`:
   ```
   id              serial primary key
   resultId        integer references result.id, not null, unique
   verificationCode text not null unique         -- "GATE-2026-MATH-A7K9X2"
   codeHash        text not null                  -- HMAC-SHA256 of code, truncated to 16 hex chars, indexed
   participantName text not null                  -- SNAPSHOT at issue time
   subjectName     text not null                  -- SNAPSHOT
   subjectCode     text not null                  -- "MATH", used in code generation
   awardTier       award_tier not null
   scorePercentile integer                        -- 0-100, nullable
   cycleId         integer references cycle.id, not null
   cycleYear       integer not null
   pdfKey          text                           -- R2 object key, nullable until PDF rendered
   issuedAt        timestamp not null defaultNow
   revokedAt       timestamp                      -- nullable
   revokedReason   text                           -- nullable
   ```
   Add index on `codeHash` and on `(cycleId, awardTier)` for admin queries.
3. **Add `certificate_verification_log` table:**
   ```
   id              serial primary key
   certificateId   integer references certificate.id, nullable  -- null for "not found" lookups
   attemptedCode   text not null                                  -- so we can spot enumeration
   verifiedAt      timestamp not null defaultNow
   ipHash          text not null                                  -- SHA-256(ip + DAILY_SALT), 8 hex chars — preserves uniques without storing IP
   countryCode     text                                           -- nullable, from request headers if available
   userAgentClass  text                                           -- "browser" | "bot" | "mobile" | "api"
   resultStatus    text not null                                  -- "verified" | "not_found" | "revoked" | "rate_limited"
   ```
   Index on `(certificateId, verifiedAt desc)` and on `verifiedAt desc` for the 30-day chart.
4. **Add relations** in the existing `relations()` block: `certificate ↔ result`, `certificate ↔ cycle`, `certificate ↔ verifications`.
5. **Generate + apply migration:**
   ```
   npm run db:generate
   npm run db:migrate
   ```
6. Add `CERT_HMAC_SECRET` to `.env.example` and `.env.local` (require ≥ 32 random bytes). Document in `.env.example` with comment.

### Verification checklist

- [ ] `drizzle/0009_*.sql` exists and contains `CREATE TABLE certificate` + `CREATE TABLE certificate_verification_log`
- [ ] `npm run db:migrate` succeeds against Neon dev DB
- [ ] `select * from certificate` returns 0 rows but no error
- [ ] `CERT_HMAC_SECRET` documented in `.env.example`

---

## Phase 2 — Core library (code gen, HMAC, issuance)

**Create:** `lib/certificates/` folder.

### Files

#### `lib/certificates/code.ts`
- Crockford Base32 alphabet constant: `'0123456789ABCDEFGHJKMNPQRSTVWXYZ'`
- `generateCode(year: number, subjectCode: string): string` — returns `GATE-{year}-{SUBJECTCODE}-{6 random Crockford chars}`. Use `crypto.randomInt(0, 32)` six times.
- `formatCode(raw: string): string` — strip non-alphanumeric, uppercase, fold `I→1, L→1, O→0, U→V` (Crockford humanization), re-insert hyphens at expected positions. Used by the verify form so users can paste sloppily.
- `isValidCodeShape(s: string): boolean` — regex `^GATE-\d{4}-[A-Z0-9]{2,8}-[0-9A-HJKMNP-TV-Z]{6}$`.

#### `lib/certificates/hmac.ts`
- `hashCode(code: string): string` — `createHmac('sha256', process.env.CERT_HMAC_SECRET!).update(code).digest('hex').slice(0, 16)`. Returns 16-hex-char tamper-prefix.
- `verifyCodeHash(code: string, storedHash: string): boolean` — constant-time compare via `crypto.timingSafeEqual` on equal-length Buffers (pad if needed). Prevents timing attacks.

#### `lib/certificates/issue.ts`
- `"use server"`
- `issueCertificate({ resultId }: { resultId: number }): Promise<{ certificateId, code }>`
  1. `requireRole("admin", "super_admin")`.
  2. Load `result` with joined `participant`, `cycleSubject → subject`, `cycle`.
  3. Compute awardTier (assume a helper exists or use raw `result.awardTier`).
  4. Loop up to 5x: generate code, check uniqueness via `db.select` on `verificationCode`. Bail with error if all 5 collide (vanishingly unlikely).
  5. Compute `codeHash`.
  6. `db.insert(certificate).values({ ... snapshots ... }).returning()`.
  7. Trigger `renderCertificatePdf({ certificateId })` (Phase 5) and update `pdfKey`.
  8. `revalidatePath("/admin/certificates")`.
  9. Return `{ certificateId, code }`.

#### `lib/certificates/revoke.ts`
- `revokeCertificate({ certificateId, reason }: ...)` — admin-only, sets `revokedAt`/`revokedReason`. `revalidatePath` for the verify page.

#### `lib/certificates/lookup.ts`
- `lookupByCode(rawCode: string): Promise<{ status: 'verified'|'revoked'|'not_found', cert?: PublicCert }>`
  1. `formatCode(rawCode)` → canonical.
  2. If `!isValidCodeShape(canonical)` → `{ status: 'not_found' }`.
  3. `hashCode(canonical)` and look up by `codeHash` first (indexed), then double-check `verificationCode === canonical` to defeat hash collisions (theoretical only at 64-bit).
  4. If not found → `{ status: 'not_found' }`.
  5. If `revokedAt` → `{ status: 'revoked', cert: sanitize(row) }`.
  6. Else `{ status: 'verified', cert: sanitize(row) }`.
- `sanitize(row)` — return ONLY: `verificationCode, participantName, subjectName, awardTier, scorePercentile, cycleYear, issuedAt, revokedAt`. Never `pdfKey`, `resultId`, `codeHash`.

### Verification checklist

- [ ] `npx tsx -e "import('./lib/certificates/code').then(m=>console.log(m.generateCode(2026,'MATH')))"` prints a valid code matching the regex
- [ ] Code shape regex test: `formatCode('gate 2026 math a7k9x2')` → `GATE-2026-MATH-A7K9X2`
- [ ] HMAC of the same code is deterministic across runs (given same secret)
- [ ] Calling `lookupByCode` on a non-existent code completes in roughly the same time as a real lookup (manual eyeball check)

---

## Phase 3 — Public `/verify` pages

**Route group:** `app/verify/` (NOT inside `(marketing)` — verify must be reachable even if marketing layout changes, and we want a stripped-down chrome).

### Files

#### `app/verify/layout.tsx`
- Minimal layout: small top bar with GATE logo (links to `/`), thin footer with "Verification powered by G.A.T.E. Assessment Authority". No marketing nav, no large hero.
- Use `bg-background text-foreground` with subtle paper-like surface (e.g. `bg-card`).

#### `app/verify/page.tsx` (code-entry landing)
- Server component for shell. Renders `<VerifyCodeForm />` (client component below).
- `<h1>Verify a G.A.T.E. Certificate</h1>` (display type).
- Sub-copy: "Enter the verification code printed on the certificate, or scan its QR code."
- Trust strip below the fold: 3 icons + "How verification works" steps.
- `<Metadata>` title: "Verify a Certificate · G.A.T.E."

#### `components/verify/verify-code-form.tsx` (client)
- `"use client"`
- One input, `font-mono`, h-14 mobile / h-12 desktop, autocomplete=off, autocapitalize=characters, inputmode=text, aria-label="Verification code".
- `onChange`: call `formatCode` (Phase 2) for paste-friendly auto-format.
- Primary submit button → `router.push('/verify/' + canonical)`. Use `<form>` + `<button type="submit">` so Enter works.
- Secondary "Scan QR" button → opens `<QrScannerDialog />`.
- Show inline shape-error if `!isValidCodeShape` on submit; do NOT call any API until shape passes.

#### `components/verify/qr-scanner-dialog.tsx` (client)
- `"use client"`
- Uses `@yudiel/react-qr-scanner` `<Scanner />`.
- On scan: if URL contains `/verify/<code>`, extract code; else treat raw text as code. `formatCode` then push route.
- Graceful "Scanner unavailable — please type the code" message if `navigator.mediaDevices` undefined.

#### `app/verify/[code]/page.tsx` (result)
- **Server component** — server-renders result for sub-2s load.
- `params: Promise<{ code: string }>` per Next 16.
- Calls `lookupByCode(code)` directly (Phase 2).
- Calls `logVerification({ certificateId?, attemptedCode, status, request })` (Phase 7) — pass `headers()` for IP.
- Renders one of three states:
  - **Verified** — `<ResultCard status="verified" cert={...} />` — emerald `ShieldCheck`, "Verified ✓" badge, large participant name in display type, metadata grid (Subject, Award Tier chip, Score Percentile, Assessment Cycle, Issued Date, Verification Code in monospace), footer with timestamp + "Issued by G.A.T.E. Assessment Authority".
  - **Revoked** — amber `ShieldAlert`, "Certificate Revoked" — show participant/subject/tier still (so verifier can confirm what was revoked) + revoke date + reason if any.
  - **Not Found** — red `ShieldX`, "Certificate Not Found" — copy: "This code does not match any G.A.T.E. certificate. It may have been mistyped, or the certificate may be fraudulent." + "Try again" link to `/verify`.
- "Report this certificate" link → mailto / form (V2 — for now just `mailto:integrity@gate-assessment.org?subject=Cert+report+{code}`).
- Print-friendly: include `@media print` CSS hiding the layout chrome.
- Metadata: `title: 'Verify {code} · G.A.T.E.'`, `robots: noindex` to keep individual certs out of Google.

#### `components/verify/result-card.tsx`
- Pure presentational component receiving `status` + `cert` props.
- Uses Lucide icons + brand tokens. Tailwind classes only.
- A11y: status communicated via icon + text + `role="status"` + `aria-live="polite"` ON THE SERVER (set once, no client re-announce).

#### `app/verify/bulk/page.tsx` (institutional bulk verify)
- Server component shell + client `<BulkVerifyForm />`.
- Two modes: paste textarea (one code per line, max 100) OR CSV upload (single column or `code` header).
- Client-side parse via PapaParse for CSV; pre-validate shapes; POST batch to `/api/v1/verify/bulk` (Phase 4).
- Results table: code | status (icon + text) | participant name (if verified) | subject | tier. Download as CSV button.
- Rate-limit feedback if API returns 429.

### Verification checklist

- [ ] Navigate to `/verify` — renders form on mobile and desktop without horizontal scroll
- [ ] Submit a known good code — `/verify/GATE-2026-...` renders verified card server-side (view-source shows the participant name)
- [ ] Submit a garbled code — "Not Found" card with red shield
- [ ] Submit a revoked code — amber state, no green check
- [ ] Lighthouse on the result page: ≥ 95 a11y, LCP < 2s on Fast 3G
- [ ] Print preview shows clean cert detail (no nav chrome)
- [ ] `robots` meta on result page = `noindex`

---

## Phase 4 — Public verification API

### Files

#### `app/api/v1/verify/[code]/route.ts`
- `export async function GET(request: Request, { params }: { params: Promise<{ code: string }> })`
- Rate-limit by IP via `checkRateLimit('verify:'+ip, 30, 60_000)`; 429 with `Retry-After: 60` if exceeded.
- Call `lookupByCode(code)`.
- Log via `logVerification(...)`.
- Return JSON:
  ```
  { status: "verified" | "revoked" | "not_found", certificate?: {...sanitized...} }
  ```
- Always 200 (status in body) to keep response shape uniform and timing constant — except 429 for rate-limit and 400 for malformed input.
- Set `Cache-Control: no-store` so verifications are never cached.

#### `app/api/v1/verify/bulk/route.ts`
- `export async function POST(request: Request)`
- Require header `X-API-Key`; compare against `process.env.VERIFY_API_KEYS` (comma-separated). 401 if missing/invalid.
- Body: `{ codes: string[] }`, ≤ 100 entries.
- Rate-limit by API key: `checkRateLimit('verify-bulk:'+apiKey, 10, 60_000)`.
- For each code, call `lookupByCode` (in parallel, `Promise.all`).
- Return `{ results: Array<{ code, status, certificate? }> }`.
- Log each lookup individually with `userAgentClass: "api"`.

### Verification checklist

- [ ] `curl https://localhost:3000/api/v1/verify/GATE-2026-MATH-XXXX` returns sanitized JSON
- [ ] 31st request inside 60s window → `429`
- [ ] Bulk endpoint without API key → `401`
- [ ] Bulk endpoint with valid key + 100 codes returns 100 results
- [ ] Bulk endpoint with 101 codes → `400`

---

## Phase 5 — PDF + QR

### Files

#### `components/certificate-pdf.tsx`
- Mirror the structure of `components/receipt-pdf.tsx`.
- `<Document><Page size="A4" orientation="landscape" style={styles.page}>` with framed border using `bg-gate-900` equivalent (`#060f1c`) as a thin border + `bg-gate-mist` (`#f0f2f6`) interior.
- Center: `<Text style={styles.cert}>G.A.T.E.</Text>` brand mark, "Certificate of Achievement", participant name in serif/display type, subject + tier + cycle.
- Bottom-right: `<Image src={qrDataUrl} style={{ width: 80, height: 80 }} />` + below it `<Text style={styles.code}>{verificationCode}</Text>` in monospace, font size 9.
- Tiny print: "Verify at gate-assessment.org/verify"
- `Font.register` for Inconsolata (monospace) — fetch from Google Fonts CDN or bundle locally under `public/fonts/`.

#### `lib/certificates/render-pdf.ts`
- `"use server"`-safe (server-only module).
- `renderCertificatePdf({ certificateId }): Promise<{ key: string }>`
  1. Load cert row.
  2. Generate QR data URL: `await QRCode.toDataURL('https://gate-assessment.org/verify/'+code, { errorCorrectionLevel: 'M', margin: 1, width: 256 })`.
  3. `await ReactPDF.renderToBuffer(<CertificatePDF cert={...} qrDataUrl={...} />)`.
  4. Upload to R2: `certificates/cert-{certificateId}.pdf`, ContentType `application/pdf`, ContentDisposition `inline`.
  5. Update cert row with `pdfKey`.
  6. Return `{ key }`. (URL constructed via existing R2 presigner when needed.)

#### `app/api/admin/certificates/[id]/download/route.ts`
- Admin-only (use `requireRole`).
- Looks up cert, presigns R2 URL for `pdfKey`, redirects.

#### `app/(dashboard)/participant/certificates/page.tsx` — extend
- For each certificate the participant has, show:
  - "View certificate" → presigned R2 URL
  - "Share verification link" → copy-to-clipboard of `https://gate-assessment.org/verify/{code}` + small QR preview

### Install

```
npm install qrcode @types/qrcode
```

### Verification checklist

- [ ] `renderCertificatePdf` produces a PDF buffer > 0 bytes
- [ ] Open the PDF — QR code in bottom-right scans (via phone camera) to the correct `/verify/{code}` URL
- [ ] Human-readable code printed in monospace under the QR
- [ ] Participant cert page shows "Share verification link" copy button + small QR preview

---

## Phase 6 — Admin verification analytics

### Files

#### `app/(dashboard)/admin/certificates/page.tsx` — extend or create
- List all issued certificates with filters (cycle, subject, tier, revoked?).
- Row actions: View PDF, Copy verify link, Revoke (with confirm modal).

#### `app/(dashboard)/admin/certificates/verifications/page.tsx`
- `requireRole("admin", "super_admin")`.
- 4 KPI tiles (server-rendered, single `Promise.all` of count queries):
  - Total verifications (all-time)
  - Verifications last 30 days
  - Unique verifiers (distinct `ipHash`) last 30 days
  - Most-verified certificate (cert + count) last 30 days
- 30-day time-series line chart of verifications/day — use existing chart lib (check `package.json` — likely Recharts or none; if none, render as simple SVG bar chart server-side to avoid a new dep).
- Recent verifications table (last 200 rows): timestamp, code, status badge, country, UA class. Server-paginated. CSV export endpoint.

#### `app/api/admin/certificates/verifications/export/route.ts`
- Admin-only. Streams CSV of all verifications in a date range.

#### `components/dashboard-sidebar.tsx` — add nav
- Add to `ICON_MAP`: `"/admin/certificates": Award`, `"/admin/certificates/verifications": ShieldCheck`.
- Add to admin links array: `{ href: "/admin/certificates", label: "Certificates" }`, `{ href: "/admin/certificates/verifications", label: "Verifications" }`.

### Verification checklist

- [ ] Admin sidebar shows "Certificates" + "Verifications"
- [ ] KPI tiles render with real (or seeded) data
- [ ] Chart renders 30 days with no horizontal scroll on 1280px viewport
- [ ] CSV export downloads a well-formed `.csv` file

---

## Phase 7 — Safeguards & logging

### Files

#### `lib/certificates/log.ts`
- `logVerification({ certificateId?, attemptedCode, status, request })` — derives:
  - IP from `request.headers.get('x-forwarded-for')` (first hop)
  - `ipHash` = `sha256(ip + DAILY_SALT).slice(0,16)` — DAILY_SALT = `process.env.IP_HASH_SALT + new Date().toISOString().slice(0,10)`
  - `countryCode` from `request.headers.get('x-vercel-ip-country')` or `cf-ipcountry` (Cloudflare)
  - `userAgentClass` = simple heuristic: `bot` if /bot|crawl|spider/i, `api` if no UA or programmatic UA, `mobile` if /mobile|android|iphone/i, else `browser`
- Insert row into `certificate_verification_log`.
- Fire-and-forget (`void` Promise, don't block response on the log write).

#### `lib/rate-limit.ts` — extend
- No code change needed; just call `checkRateLimit` from the new routes (see Phase 4).

#### CAPTCHA after N failed attempts
- Track failed attempts in the same `Map` store keyed `verify-fails:'+ipHash`.
- After **5 failures in 10 minutes**, set a cookie `verify-needs-captcha=1` (1h expiry).
- `<VerifyCodeForm />` reads cookie via `cookies()` server util and renders `<Turnstile />` when set. Server-side verifies token against Cloudflare before processing.
- Add env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

#### Install

```
npm install @marsidev/react-turnstile
```

### Verification checklist

- [ ] Triggering 6 invalid lookups from same IP triggers Turnstile on the 7th attempt
- [ ] Verification log table accumulates rows (`select count(*) from certificate_verification_log`)
- [ ] IPs are NOT stored in plaintext anywhere (grep the DB for sample IPs returns 0)

---

## Phase 8 — Navigation & marketing hookup

### Files

#### `components/site/footer.tsx`
- Add to existing links structure: `{ href: "/verify", label: "Verify Certificate" }` — recommended placement: a new "Trust & Verification" column, or append to existing "Resources"/"Legal" column.

#### `app/(marketing)/page.tsx` — landing
- Add a short trust strip near credentials/awards section: "Every G.A.T.E. certificate is independently verifiable at gate-assessment.org/verify" with a `<ShieldCheck />` icon — links to `/verify`.

#### `app/(marketing)/awards/page.tsx` — if exists
- Add a "How to verify a G.A.T.E. certificate" callout box.

#### Admin sidebar
- Already covered in Phase 6.

#### Participant share
- Already covered in Phase 5.

### Verification checklist

- [ ] Marketing footer has visible "Verify Certificate" link
- [ ] Landing page renders trust strip without breaking existing layout
- [ ] Admin sidebar new items appear with correct icons

---

## Phase 9 — Tests (Vitest)

**Pattern reference:** `vitest.config.ts` + existing `__tests__/actions/` folder.

### Files

#### `__tests__/certificates/code.test.ts`
- `generateCode` returns matching regex 1000 iterations
- `generateCode` never produces forbidden chars (I, L, O, U)
- `formatCode('gate 2026 math a7k9x2')` → `GATE-2026-MATH-A7K9X2`
- `formatCode` folds `I→1, L→1, O→0, U→V`
- `isValidCodeShape` rejects malformed inputs

#### `__tests__/certificates/hmac.test.ts`
- `hashCode` deterministic for same input + secret
- `verifyCodeHash` returns true for matching, false for non-matching
- Constant-time compare doesn't leak via early exit (sanity: same length output, timing not asserted)

#### `__tests__/certificates/sanitize.test.ts`
- `sanitize(row)` strips `pdfKey`, `resultId`, `codeHash`, `revokedReason` from the PUBLIC payload (revokedReason can stay if shown to public; decide explicitly)
- Snapshot the returned key set

#### `__tests__/certificates/lookup.test.ts`
- Integration test with a real test DB row: insert a cert, look up by code → status verified; revoke → status revoked; unknown code → not_found

#### `__tests__/api/verify-route.test.ts`
- Mock the lookup, hit GET handler with a known code → 200 + verified body
- Hit 31 times within window → 429

### Verification checklist

- [ ] `npx vitest run __tests__/certificates` — all pass
- [ ] `npx vitest run __tests__/api/verify-route.test.ts` — all pass
- [ ] Test coverage on `lib/certificates/` ≥ 80%

---

## Phase 10 — Backfill & docs

### Files

#### `scripts/backfill-certificates.ts`
- Query all `result` rows where `certificateUrl IS NOT NULL` AND no row in `certificate` for that `resultId`.
- For each: call `issueCertificate({ resultId })`.
- Log progress; resumable if interrupted (idempotent via the unique `resultId` constraint on cert table).
- Add `npm` script: `"backfill:certs": "tsx scripts/backfill-certificates.ts"`.

#### `docs/CERTIFICATE_VERIFICATION.md`
- Architecture overview (this plan distilled).
- Code format spec (Crockford Base32, exclusions).
- Env vars required.
- Operator runbook: how to issue, revoke, look at verification logs.
- Public API reference (GET single, POST bulk, rate limits, auth).
- Partner onboarding section: how to request an API key.

### Verification checklist

- [ ] Dry-run backfill on dev DB issues codes for all historical certs
- [ ] `docs/CERTIFICATE_VERIFICATION.md` exists and includes API examples
- [ ] At least one cert from history is verifiable at `/verify/{code}` on dev

---

## Phase 11 — Final verification

1. **End-to-end smoke** in dev:
   1. Admin issues a certificate (UI) for a sample result.
   2. PDF renders + uploads to R2.
   3. Open PDF, scan QR with phone — phone goes to `/verify/{code}`.
   4. Result card shows verified state with correct snapshot data.
   5. Admin revokes — re-scanning shows revoked state.
   6. Random bogus code → not-found state.
   7. Bulk API with 3 codes (1 valid, 1 revoked, 1 invalid) → correct mixed response.
   8. Admin verifications dashboard shows the 8 events from above smoke test.

2. **A11y pass** with axe-core or browser devtools:
   - `/verify`, `/verify/[code]` (all 3 states), `/verify/bulk` — zero AA violations.

3. **Performance pass:**
   - Lighthouse on `/verify/[code]` — Performance ≥ 90, LCP < 2s, CLS < 0.1.
   - PDF render time < 3s server-side for a single cert.

4. **Security pass:**
   - Grep for `CERT_HMAC_SECRET` — only used server-side (never in `'use client'` files or `NEXT_PUBLIC_*`)
   - Grep for `participantEmail` in `app/verify` and `app/api/v1/verify` — should be 0 hits
   - Confirm `Cache-Control: no-store` on `/api/v1/verify/*` responses
   - Confirm rate-limit triggers and CAPTCHA appears as designed

5. **Anti-pattern grep:**
   - `grep -r "renderToString" lib/certificates/` — should be 0 (we use renderToBuffer for PDF)
   - `grep -r "new BarcodeDetector" components/verify/` — should be 0 (use the library wrapper)

---

## Execution order (run with `/do` one phase at a time)

```
Phase 1  → Schema & Migration
Phase 2  → Core library
Phase 3  → Public /verify pages
Phase 4  → Public verification API
Phase 5  → PDF + QR
Phase 6  → Admin verification analytics
Phase 7  → Safeguards & logging
Phase 8  → Navigation & marketing hookup
Phase 9  → Tests
Phase 10 → Backfill & docs
Phase 11 → Final verification
```

Each phase is self-contained and references the Phase 0 "Allowed APIs" table at the top. **Do not skip Phase 0 — re-read it before any phase starts in a new chat.**
