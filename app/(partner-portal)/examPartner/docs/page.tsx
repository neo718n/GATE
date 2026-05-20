import { desc, eq } from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, integrationPartners } from "@/lib/db/schema";
import { SecretField } from "@/components/partner/secret-field";
import { SampleLaunchTester } from "@/components/partner/sample-launch-tester";

export const metadata = { title: "Docs" };

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

export default async function PartnerDocsPage() {
  const { partnerId } = await requirePartnerStaff();
  const [partner] = await db
    .select({ clientId: integrationPartners.clientId })
    .from(integrationPartners)
    .where(eq(integrationPartners.id, partnerId))
    .limit(1);

  const partnerExams = await db
    .select({ id: exams.id, title: exams.title })
    .from(exams)
    .where(eq(exams.createdByPartnerId, partnerId))
    .orderBy(desc(exams.createdAt));

  const clientId = partner?.clientId ?? "your_client_id";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const launchUrl = `${appUrl}/api/v1/partner/launch`;
  const resultsUrl = `${appUrl}/api/v1/partner/results`;

  const signSample = `// Node — sign a launch token (HS256) with the "jose" package
import { SignJWT } from "jose";
import { randomUUID } from "node:crypto";

const secret = new TextEncoder().encode(SHARED_SECRET); // from your portal
const token = await new SignJWT({
  exam_ref: 4012,            // the exam ID from your Exams page
  name: "Jane Doe",
  grade: "G7",
  assignment_id: "hw-9",     // your own id, echoed back in webhooks
  return_url: "https://arcmc.com/done",
})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(${JSON.stringify(clientId)})
  .setAudience("gate")
  .setSubject(externalUserId) // your stable student id
  .setIssuedAt()
  .setExpirationTime("5m")    // tokens must be short-lived
  .setJti(randomUUID())       // single-use (replay-protected)
  .sign(secret);`;

  const redirectSample = `// Redirect the student (TOP-LEVEL navigation, not an iframe):
return Response.redirect(\`${launchUrl}?token=\${token}\`);`;

  const webhookSample = `// Verify the webhook signature header "X-GATE-Signature: t=<ts>,v1=<hmac>"
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(rawBody, header, WEBHOOK_SECRET) {
  const parts = Object.fromEntries(header.split(",").map(p => p.split("=")));
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(\`\${parts.t}.\${rawBody}\`).digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}`;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-light text-foreground">
          Integrate in 4 steps
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Launch GATE exams from your platform via a signed redirect, and receive
          results by webhook or the read API.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          1 · Your credentials
        </h2>
        <SecretField label="Client ID (JWT issuer)" value={clientId} defaultHidden={false} />
        <SecretField label="Launch endpoint" value={launchUrl} defaultHidden={false} />
        <p className="text-xs font-light text-muted-foreground">
          Your <strong>shared secret</strong> and <strong>API key</strong> are on
          the Credentials page.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          2 · Sign a launch token
        </h2>
        <CodeBlock>{signSample}</CodeBlock>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          3 · Redirect the student
        </h2>
        <CodeBlock>{redirectSample}</CodeBlock>
        <p className="text-xs font-light text-muted-foreground">
          GATE hosts the exam UI (proctoring stays with us). When the student
          submits, they are redirected to your <code>return_url</code>.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          4 · Receive results
        </h2>
        <p className="text-xs font-light text-muted-foreground">
          We POST a signed webhook to your configured URL on{" "}
          <code>exam.submitted</code> and <code>result.finalized</code>. You can
          also pull results:
        </p>
        <SecretField label="Read API (X-API-Key)" value={resultsUrl} defaultHidden={false} />
        <CodeBlock>{webhookSample}</CodeBlock>
        <a
          href="/partner-openapi.json"
          target="_blank"
          rel="noreferrer"
          className="self-start text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
        >
          Full API reference (OpenAPI) →
        </a>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Sandbox · test a launch
        </h2>
        <p className="text-xs font-light text-muted-foreground">
          Generate a signed launch token with your shared secret and open it to
          run the full flow end-to-end.
        </p>
        <SampleLaunchTester exams={partnerExams} />
      </section>
    </div>
  );
}
