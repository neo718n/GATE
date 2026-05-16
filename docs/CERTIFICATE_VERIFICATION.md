# Certificate Verification Portal

Status: **Shipped** — 2026-05-16
Owner: GATE Engineering

The G.A.T.E. Certificate Verification Portal lets universities, employers, and the public independently verify any certificate issued by the G.A.T.E. Assessment Authority. It is a trust moat against fake credentials (cf. the $22B fake-certificate industry; competitors SOF and CREST rely on easily-forged PDFs).

---

## How verification works

1. Every certificate issued by the platform carries a **unique verification code** like `GATE-2026-MATH-A7K9X2` and a **QR code** linking to `https://gate-assessment.org/verify/{code}`.
2. The code is generated with **Crockford Base32** (alphabet excludes `I`, `L`, `O`, `U` to avoid mis-reads when typed from paper).
3. The platform stores an **HMAC-SHA256 prefix** of the code (`CERT_HMAC_SECRET` × code → first 64 bits) — used both as an index and as a tamper signature. Constant-time compared on every lookup.
4. The public `/verify` page (and `GET /api/v1/verify/[code]`) reads from the live registry — not from the certificate file. The PDF could be photoshopped; the registry cannot.
5. Every lookup is **rate-limited** (30/min/IP) and **logged** (with a daily-salted IP hash for privacy).

---

## Code format spec

```
GATE-{cycleYear}-{subjectCode}-{6 Crockford-Base32 chars}

Where:
  cycleYear   = 4-digit year (matches cycles.year)
  subjectCode = uppercase, [A-Z0-9]{2,12}, derived from subjects.slug
  tail        = 6 chars from "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
```

`formatCode()` (in `lib/certificates/code.ts`) folds user input to canonical form:

| Typed | Stored as |
|---|---|
| lowercase | uppercase |
| `I` | `1` |
| `L` | `1` |
| `O` | `0` |
| `U` | `V` |
| stray hyphens / spaces | removed and re-inserted at canonical positions |

---

## Environment variables

```
CERT_HMAC_SECRET          # ≥32-byte secret for HMAC tamper-proof. Rotate ONLY when reissuing all certs.
IP_HASH_SALT              # salt used (with current date) to hash verifier IPs in the audit log
VERIFY_API_KEYS           # comma-separated list of API keys allowed to call /api/v1/verify/bulk
NEXT_PUBLIC_TURNSTILE_SITE_KEY  # optional — enables Cloudflare Turnstile widget after N failed attempts
TURNSTILE_SECRET_KEY      # optional — server-side Turnstile verification
NEXT_PUBLIC_APP_URL       # base URL embedded in the QR code (e.g. https://gate-assessment.org)
```

Generate the HMAC secret with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Operator runbook

### Issue a certificate

UI: `/admin/certificates` → row for a published, awarded result → click **Issue**.

Or programmatically (in any server context):
```ts
import { issueCertificate } from "@/lib/certificates/issue";

await issueCertificate({ resultId: 123 });
// → { certificateId, code, alreadyIssued }
```

Issuance is idempotent: a second call returns `alreadyIssued: true` with the existing code.

### Revoke a certificate

UI: `/admin/certificates` → row for an issued certificate → click **Revoke** → confirm.

The certificate row stays in the database (revocation is reversible via **Restore**); `revokedAt` and `revokedReason` are set. The `/verify/{code}` page then shows the **amber "Revoked"** state instead of the green check, so verifiers still see *what* was revoked.

### View verification activity

`/admin/certificates/verifications` shows:
- KPI tiles: total verifications, 30-day count, unique verifiers (by hashed IP), most-verified cert
- 30-day bar chart of daily verifications
- Top 5 most-verified certs (last 30 days)
- Recent verifications log (last 50)
- CSV export (`/api/admin/certificates/verifications/export`)

### Backfill historical certificates

For any existing `result` row with both `publishedAt` and `award`:
```
npm run backfill:certs
```
The script is idempotent — it skips results that already have a certificate.

---

## Public API reference

### `GET /api/v1/verify/{code}`

Public, no auth. Rate-limited to **30 req/min/IP**.

Response (always 200 unless rate-limited):
```json
{
  "status": "verified" | "revoked" | "not_found",
  "certificate": {
    "verificationCode": "GATE-2026-MATH-A7K9X2",
    "participantName": "Aliya Karimova",
    "subjectName": "Mathematics",
    "award": "gold",
    "scorePercentile": 92,
    "cycleYear": 2026,
    "issuedAt": "2026-05-16T12:00:00.000Z",
    "revokedAt": null
  } | null
}
```

Rate-limited responses return **429** with `Retry-After: 60`.

Headers on every response: `Cache-Control: no-store`.

### `POST /api/v1/verify/bulk` (partner-only)

Requires header `X-API-Key: <key>` (key must appear in `VERIFY_API_KEYS`). Rate-limited to **10 req/min/key**.

Request body:
```json
{ "codes": ["GATE-2026-MATH-A7K9X2", "GATE-2026-PHYS-Z2N4P9", ...] }
```

Maximum **100 codes per request**.

Response:
```json
{
  "results": [
    { "code": "GATE-2026-MATH-A7K9X2", "status": "verified", "certificate": { ... } },
    { "code": "GATE-2026-PHYS-Z2N4P9", "status": "not_found", "certificate": null }
  ]
}
```

### `POST /api/verify/bulk` (browser-callable)

Used by the public `/verify/bulk` page form. No API key required but **5 req/min/IP**, **50 codes max**. Same response shape as the partner endpoint.

---

## Partner onboarding

To request an API key for `POST /api/v1/verify/bulk`:
1. Partner emails `partnerships@gate-assessment.org` with organization name + use case.
2. Admin generates a key:
   ```
   node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
   ```
3. Admin appends the key to `VERIFY_API_KEYS` (comma-separated) and redeploys.
4. Admin shares the key with the partner via a secure channel.

To revoke a partner key: remove it from `VERIFY_API_KEYS` and redeploy.

---

## Security posture

| Concern | Mitigation |
|---|---|
| **Code guessing / enumeration** | 32^6 = ~10^9 codes per (year, subject); HMAC index lookup is constant-time vs. attempted code. |
| **Tamper detection** | Stored HMAC must match recomputed HMAC byte-for-byte (constant-time compare). |
| **Information disclosure** | Public lookups return only fields printed on the certificate (no email, no internal IDs, no PDF key). |
| **Rate abuse** | 30 req/min/IP on `/verify/[code]`; 10 req/min/key on bulk partner API. |
| **Distributed scraping** | Failed-attempt tracker triggers Turnstile after 5 fails in 10 minutes (graceful noop if Turnstile keys not configured). |
| **IP retention** | IPs are SHA-256 hashed with a daily-rotated salt before storage. Raw IPs never persist. |
| **Result-page caching** | All `/api/v1/verify/*` responses set `Cache-Control: no-store`. Result pages are `robots: noindex`. |

---

## File map

```
lib/certificates/
  code.ts          — Crockford Base32 generation + paste-friendly formatCode()
  hmac.ts          — HMAC-SHA256 truncated to 16 hex chars + constant-time compare
  lookup.ts        — lookupByCode (public-safe) + lookupRawByCode (server-only) + sanitizeCertificate
  issue.ts         — server actions: issueCertificate, revokeCertificate, unrevokeCertificate
  render-pdf.tsx   — react-pdf renderer → R2 upload, verifyUrlFor helper
  log.ts           — logVerification, hashIp (daily salt), classifyUserAgent
  fail-tracker.ts  — N-failure tracker + Turnstile verifier
  types.ts         — PublicCertificate, LookupStatus

app/verify/
  layout.tsx       — minimal layout (no marketing nav)
  page.tsx         — code entry + how-it-works trust strip
  [code]/page.tsx  — server-rendered result page
  bulk/page.tsx    — paste/CSV bulk verify

app/api/verify/bulk/route.ts             — public bulk (IP rate-limit, 50 codes)
app/api/v1/verify/[code]/route.ts        — public single (IP rate-limit, 30/min)
app/api/v1/verify/bulk/route.ts          — partner bulk (API key, 100 codes)
app/api/admin/certificates/[id]/download/route.ts
app/api/admin/certificates/verifications/export/route.ts
app/api/participant/certificates/[id]/download/route.ts

app/(dashboard)/admin/certificates/page.tsx
app/(dashboard)/admin/certificates/verifications/page.tsx
app/(dashboard)/participant/certificates/page.tsx

components/verify/
  verify-code-form.tsx     — paste-friendly code input + scan button
  qr-scanner-dialog.tsx    — @yudiel/react-qr-scanner modal
  result-card.tsx          — verified / revoked / not-found states
  print-button.tsx
  share-link-button.tsx
  bulk-verify-form.tsx

components/certificate-pdf.tsx    — A4-landscape react-pdf document
components/admin/issue-certificate-button.tsx
components/admin/revoke-certificate-button.tsx

scripts/backfill-certificates.ts
docs/plans/CERTIFICATE_VERIFICATION_PORTAL.md   — original plan
```

---

## Follow-up enhancements (not in MVP)

- Cloudflare Turnstile widget UI on `/verify` after 5 failed attempts (server hooks already in place via `fail-tracker.ts`; only `<Turnstile />` JSX missing).
- Geo IP enrichment for the verifications log (currently relies on `x-vercel-ip-country` / `cf-ipcountry`).
- Webhook for partner institutions on cert issuance.
- Multi-language verify page (Russian, Uzbek, Mandarin) — copy is in English only.
- Public dashboard "verification statistics" page (number of verifications per cycle, for marketing trust).
