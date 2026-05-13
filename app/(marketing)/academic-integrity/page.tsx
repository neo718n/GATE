import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Integrity",
  description:
    "G.A.T.E. Assessment academic integrity policy — standards of conduct, prohibited behaviors, investigation process, and consequences of misconduct.",
};

const VIOLATIONS = [
  "Receiving or providing assistance from any person or unauthorized resource during the examination",
  "Using calculators, reference materials, notes, electronic devices, or any resource not explicitly permitted",
  "Impersonation: taking the examination under another person's identity, or allowing another person to sit the examination on your behalf",
  "Sharing, disclosing, reproducing, or distributing examination questions or answers in any form — before, during, or after the examination window",
  "Submitting examination work that is not entirely your own independent effort",
  "Colluding with other participants to coordinate answers or share examination content",
  "Tampering with examination results, the scoring process, or the credential verification system",
  "Providing false identity, age, enrollment status, or institutional affiliation during registration",
  "Attempting to gain access to examination content or scoring methodologies through unauthorized means",
  "Falsifying, altering, or misrepresenting any G.A.T.E. certificate, award, or credential",
];

const CONSEQUENCES = [
  "Immediate disqualification from the current G.A.T.E. Assessment cycle, with no refund of the registration fee",
  "Cancellation and permanent revocation of any recognition, distinctions, or certificates issued in connection with the affected cycle",
  "A temporary or permanent ban from participating in future G.A.T.E. Assessment cycles, at G.A.T.E.'s sole discretion",
  "Notification of the participant's school or institution, at G.A.T.E.'s discretion, where the misconduct warrants institutional awareness",
  "Referral to relevant law enforcement or regulatory authorities where the conduct may constitute a criminal offense under applicable law",
  "Public invalidation of credentials in the G.A.T.E. verification system",
];

const SECTIONS = [
  {
    number: "01",
    title: "Our Commitment",
    content: [
      "Academic integrity is the foundation of the G.A.T.E. Assessment. The value of a G.A.T.E. certificate or recognition depends entirely on the trust that participants, institutions, universities, and academic partners place in the credibility of our process.",
      "G.A.T.E. Assessment is committed to maintaining the highest standards of fairness, transparency, and independent verification across every phase of the program. We invest in examination design, independent evaluation, and proctoring systems precisely to ensure that every result accurately reflects the individual merit of the participant.",
      "Every person who registers for and participates in the G.A.T.E. Assessment accepts a personal obligation to uphold these standards — not only because it is required, but because the integrity of the program belongs to the entire community of participants.",
    ],
  },
  {
    number: "02",
    title: "Definition of Academic Misconduct",
    content: [
      "\"Academic Misconduct\" means any act or omission — whether intentional or reckless — that provides a participant with an unfair advantage, undermines the fairness or integrity of the examination process, misrepresents the participant's independent academic work or identity, or compromises the credibility of G.A.T.E. results and credentials.",
      "The examples below are illustrative and non-exhaustive. G.A.T.E. reserves the right to determine whether specific conduct constitutes academic misconduct, applying this definition in light of the circumstances of each case.",
    ],
  },
  {
    number: "03",
    title: "Prohibited Conduct",
    content: [],
    list: VIOLATIONS,
  },
  {
    number: "04",
    title: "Detection and Monitoring",
    content: [
      "Phase I examinations are conducted under remotely proctored conditions using technology and human review processes designed to detect unauthorized behavior in real time.",
      "G.A.T.E. employs statistical analysis of examination responses, including similarity analysis, to identify patterns that may indicate unauthorized collaboration, shared answer sets, or impersonation.",
      "Phase II examinations are conducted in person at the designated host venue under supervised conditions equivalent to formal university examination standards.",
      "G.A.T.E. reserves the right to investigate any submission that raises reasonable suspicion of misconduct, at any time prior to or following the publication of results.",
    ],
  },
  {
    number: "05",
    title: "Investigation Process",
    content: [
      "When G.A.T.E. has reasonable grounds to suspect academic misconduct, the following process applies:",
      "Step 1 — Notification: The participant will be notified in writing of the specific allegation, the evidence in question, and the potential consequences if the allegation is confirmed.",
      "Step 2 — Response: The participant will be given five (5) calendar days from the date of the notification to submit a written response. If no response is received within this period, G.A.T.E. will proceed on the basis of available evidence.",
      "Step 3 — Review: A designated Integrity Review Panel — composed of at least two G.A.T.E. officers with no direct involvement in the examination — will evaluate the allegation, the available evidence, and the participant's response.",
      "Step 4 — Decision: A written decision will be issued to the participant within twenty-one (21) calendar days of the response deadline. The decision will state whether misconduct has been confirmed and specify the consequences imposed.",
      "The investigation process is internal to G.A.T.E. and is not subject to external oversight or review. G.A.T.E.'s determination is final and binding, subject only to the appeals process set out in Section 07.",
    ],
  },
  {
    number: "06",
    title: "Consequences of Confirmed Misconduct",
    content: [
      "Confirmed academic misconduct may result in any or all of the following, at G.A.T.E.'s sole discretion and proportionate to the severity of the violation:",
    ],
    list: CONSEQUENCES,
  },
  {
    number: "07",
    title: "Appeals",
    content: [
      "A participant who receives a confirmed misconduct decision may submit one (1) formal written appeal within seven (7) calendar days of receiving the decision. Appeals must be submitted to: integrity@gate-assessment.org",
      "An appeal will only be considered if it presents: (a) new material evidence not previously available or considered during the investigation, or (b) a specific and substantiated procedural error that materially affected the fairness of the review process. Appeals that simply dispute the finding without meeting these criteria will not be accepted.",
      "Appeals are reviewed by a senior G.A.T.E. officer who was not involved in the original investigation. The appeal decision will be issued within fourteen (14) calendar days of receipt.",
      "The outcome of the appeal process is final. No further internal review is available. G.A.T.E. is not obligated to engage in external arbitration or litigation with respect to academic integrity decisions.",
    ],
  },
  {
    number: "08",
    title: "Reporting Suspected Violations",
    content: [
      "Any participant, parent, educator, or institution who has reasonable grounds to suspect that academic misconduct has occurred — whether by another participant or through a systemic failure — is encouraged to report it confidentially.",
      "Reports can be submitted to: integrity@gate-assessment.org",
      "All reports will be treated with strict confidentiality to the maximum extent permitted by the investigation process. G.A.T.E. will not retaliate against any individual who reports a concern in good faith. False or malicious reports made to harm another participant may themselves constitute a violation of these standards.",
    ],
  },
  {
    number: "09",
    title: "Participant Declaration",
    content: [
      "By registering for the G.A.T.E. Assessment, each participant affirms the following:",
      "I will complete the examination independently, relying solely on my own knowledge and reasoning without unauthorized assistance.",
      "I will not access, share, or distribute examination content in any form.",
      "All personal information I have provided during registration is accurate and truthful.",
      "I understand the standards of academic integrity required by G.A.T.E. Assessment, and I accept the consequences that may result from any violation.",
      "This declaration is not merely procedural — it is a personal commitment to the academic community and to all participants who take the assessment under the same conditions.",
    ],
  },
];

export default function AcademicIntegrityPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Legal</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Academic Integrity</h1>
          <p className="text-sm font-light text-gate-800/50 mt-1">
            Effective: 2025 &nbsp;·&nbsp; G.A.T.E. Assessment
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-white">
        <div className="mx-auto max-w-4xl flex flex-col gap-0">
          <p className="text-sm font-light text-gate-800/65 leading-[1.9] pb-12 border-b border-gate-fog/60">
            The G.A.T.E. Assessment Academic Integrity Policy sets out the standards of conduct required of
            all participants, the behaviors that constitute academic misconduct, the process by which
            allegations are investigated, and the consequences of confirmed violations. Acceptance of
            these standards is a condition of registration.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.number} className="flex flex-col gap-6 py-12 border-b border-gate-fog/60 last:border-0">
              <div className="flex items-baseline gap-5">
                <span className="text-[10px] font-semibold tracking-[0.3em] text-gate-gold shrink-0">
                  {section.number}
                </span>
                <h2 className="font-serif text-2xl font-light text-gate-800">{section.title}</h2>
              </div>
              <div className="flex flex-col gap-4 pl-9">
                {section.content.map((para, i) => (
                  <p key={i} className="text-sm font-light text-gate-800/65 leading-[1.9]">
                    {para}
                  </p>
                ))}
                {"list" in section && section.list && (
                  <ul className="flex flex-col gap-3 mt-1">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="mt-2.5 h-px w-4 shrink-0 bg-gate-gold/50" />
                        <span className="text-sm font-light text-gate-800/65 leading-[1.9]">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
