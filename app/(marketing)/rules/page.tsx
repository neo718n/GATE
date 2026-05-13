import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules & Regulations",
  description:
    "Official rules and regulations governing eligibility, examination conduct, scoring, and participation in the G.A.T.E. Assessment program.",
};

const SECTIONS = [
  {
    number: "01",
    title: "Eligibility",
    content: [
      "Participation in the G.A.T.E. Assessment is open to any student who, at the time of the Preliminary Round, is currently enrolled in secondary or pre-university education (equivalent to grades 9–12) and is between the ages of 14 and 19. Students in their final year of secondary education are eligible regardless of age at the time of application.",
      "There are no restrictions on nationality, country of residence, language background, or institutional affiliation. Homeschooled students are eligible provided they can supply documentation confirming active secondary-level enrollment.",
      "Each participant must register individually and in exactly one (1) subject area. No participant may register in more than one discipline per assessment cycle. Subject selection is final upon registration confirmation and cannot be altered under any circumstances.",
      "G.A.T.E. reserves the right to verify eligibility at any stage of the program. Participants who are found to be ineligible — at any point before, during, or after the assessment — will be disqualified, and any recognition or certificates issued will be revoked.",
    ],
  },
  {
    number: "02",
    title: "Registration",
    content: [
      "Registration is completed exclusively through the official G.A.T.E. Assessment platform. Applications submitted through any other channel will not be accepted.",
      "A registration fee is required to complete the application. The applicable fee schedule is published on the platform at the time of registration. Fees are non-refundable in all circumstances, including voluntary withdrawal, disqualification, visa denial, technical failure, or program modification or cancellation.",
      "Participants are solely responsible for providing accurate, complete, and truthful information during registration, including identity details, date of birth, institutional enrollment, and subject selection. Submission of false or misleading information constitutes grounds for immediate disqualification.",
      "Participants under the age of 18 must obtain parental or legal guardian consent prior to registration. By completing registration, the participant (or their parent/guardian on their behalf) affirms that all requirements have been met.",
    ],
  },
  {
    number: "03",
    title: "Examination Format",
    content: [
      "The G.A.T.E. Assessment operates across two phases. Phase I (the Preliminary Round) is an open, globally accessible theoretical examination conducted online under remotely proctored conditions. Phase II (the Global Onsite Assessment) is an in-person examination held at the edition's designated host venue, by invitation only.",
      "Examination format, duration, and permitted materials are specified in official instructions issued to registered participants prior to each phase. Participants are responsible for reading and complying with all examination instructions.",
      "Unless explicitly authorized in the examination instructions, the following are prohibited during any examination: calculators, mathematical software, reference materials, textbooks, notes, and any form of electronic communication device.",
      "All examination content — including questions, problems, and answers — is strictly confidential. Disclosure, reproduction, or distribution of examination content, in whole or in part, before, during, or after the examination window is prohibited and constitutes academic misconduct.",
    ],
  },
  {
    number: "04",
    title: "Code of Conduct",
    content: [
      "Participants must complete the examination independently, without receiving or providing assistance from any person or resource not explicitly authorized.",
      "Impersonation — that is, taking the examination under another person's identity, or knowingly allowing another person to take the examination on your behalf — is strictly prohibited and will result in immediate and permanent disqualification.",
      "Participants attending the Global Onsite Assessment are expected to conduct themselves with integrity, courtesy, and respect toward fellow participants, G.A.T.E. staff, host institution personnel, and the broader academic community. G.A.T.E. reserves the right to remove any participant whose conduct is deemed inappropriate or disruptive.",
      "Participants must not engage in any activity that could reasonably be construed as an attempt to gain an unfair advantage, compromise the integrity of the assessment, or undermine the fairness of the results.",
    ],
  },
  {
    number: "05",
    title: "Scoring and Results",
    content: [
      "Examinations are evaluated by independent subject-matter experts appointed by G.A.T.E. Scoring criteria are determined by G.A.T.E. and applied consistently across all participants. Scores are assessed based on accuracy, methodology, proof quality, and clarity of reasoning.",
      "Phase I results are published on the official G.A.T.E. platform. Participants who achieve the qualifying threshold score in their subject area will receive an official invitation to Phase II. The number of finalists selected per subject is determined at the sole discretion of G.A.T.E.",
      "Score review requests may be submitted within fourteen (14) calendar days of results publication. Reviews address only clerical and computational errors; they do not involve re-assessment of academic judgment applied by evaluators. Score review outcomes are final.",
      "G.A.T.E. does not guarantee any specific number of invitations from any country, region, or institution.",
    ],
  },
  {
    number: "06",
    title: "Recognition and Certificates",
    content: [
      "Recognition — including Certificate of Distinction, Certificate of High Achievement, Certificate of Merit, Honorable Mention, and Certificate of Participation — is issued solely at G.A.T.E.'s discretion based on final scores and performance thresholds. G.A.T.E. does not guarantee that any specific recognition level will be awarded in any given cycle.",
      "Recognition decisions are final and not subject to appeal or external review.",
      "Phase II participants receive physical certificates at the recognition ceremony. Participants who do not attend Phase II but are otherwise eligible for recognition will receive digital certificates. Certificate authenticity can be verified through the G.A.T.E. credential verification portal.",
      "G.A.T.E. reserves the right to revoke any certificate or recognition if, at any time, it is determined that the participant engaged in academic misconduct, provided false information, or violated these Rules.",
    ],
  },
  {
    number: "07",
    title: "Program Modifications and Force Majeure",
    content: [
      "G.A.T.E. reserves the right, at its sole discretion, to modify, postpone, reschedule, reformat, or cancel any part of the Assessment program at any time, including but not limited to examination dates, venue, format, and eligibility criteria.",
      "In the event of modification or cancellation due to circumstances beyond G.A.T.E.'s reasonable control — including but not limited to natural disasters, public health emergencies, governmental restrictions, war, or force majeure events — G.A.T.E. shall not be liable to participants for any resulting costs or losses. Registration fees will not be refunded in such circumstances unless G.A.T.E. explicitly indicates otherwise in writing.",
      "G.A.T.E. is not responsible for any costs incurred by participants in connection with travel, accommodation, visa applications, or other preparation for the Global Onsite Assessment in the event that the event is modified, relocated, postponed, or cancelled.",
    ],
  },
  {
    number: "08",
    title: "Amendments",
    content: [
      "G.A.T.E. reserves the right to amend these Rules & Regulations at any time. Updated rules will be published on the official platform with a revised effective date.",
      "Continued participation following the publication of any amendment constitutes the participant's acceptance of the revised Rules.",
      "For questions regarding these Rules, contact: info@gate-assessment.org",
    ],
  },
];

export default function RulesPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Legal</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Rules &amp; Regulations</h1>
          <p className="text-sm font-light text-gate-800/50 mt-1">
            Effective: 2025 &nbsp;·&nbsp; G.A.T.E. Assessment
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-white">
        <div className="mx-auto max-w-4xl flex flex-col gap-0">
          <p className="text-sm font-light text-gate-800/65 leading-[1.9] pb-12 border-b border-gate-fog/60">
            These Rules &amp; Regulations govern participation in all phases of the G.A.T.E. Assessment program.
            By registering, each participant agrees to be bound by these Rules in their entirety. G.A.T.E. Assessment
            reserves the right to enforce these Rules and to make final determinations on all matters of eligibility,
            conduct, and results.
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
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
