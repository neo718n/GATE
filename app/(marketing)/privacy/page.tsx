import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "G.A.T.E. Assessment privacy policy — how we collect, use, store, and protect your personal data.",
};

const SECTIONS = [
  {
    number: "01",
    title: "Data Controller",
    content: [
      "G.A.T.E. Assessment (\"G.A.T.E.\", \"we\", \"us\", \"our\") is the data controller responsible for the personal information collected through the G.A.T.E. platform and assessment program.",
      "For all privacy-related inquiries, including data access requests and complaints, contact: info@gate-assessment.org",
    ],
  },
  {
    number: "02",
    title: "Information We Collect",
    content: [
      "Identity and contact data: full name, date of birth, nationality, email address, and phone number (where provided).",
      "Academic data: name of school or educational institution, year of study, country of enrollment, and selected subject area.",
      "Assessment data: examination responses, scores, evaluation records, and certificate information.",
      "Technical data: IP address, browser type, device identifiers, and platform usage data collected automatically during your use of the G.A.T.E. platform.",
      "We do not collect payment card numbers or bank account details directly. All payments are processed through a certified third-party payment provider subject to its own privacy policy.",
    ],
  },
  {
    number: "03",
    title: "How We Use Your Information",
    content: [
      "To process your registration, verify eligibility, and administer your participation in the G.A.T.E. Assessment.",
      "To conduct and evaluate examinations, publish results, and issue certificates and awards.",
      "To communicate with you regarding examination instructions, results, schedule changes, and program updates.",
      "To operate and improve the G.A.T.E. platform, detect fraud, and ensure platform security.",
      "To meet legal obligations, including record-keeping requirements applicable to our operations.",
      "To contact you about future G.A.T.E. assessment cycles or program updates — only where you have provided consent, which may be withdrawn at any time.",
    ],
  },
  {
    number: "04",
    title: "Legal Basis for Processing",
    content: [
      "Performance of contract: processing is necessary to fulfill your registration agreement and deliver the services you have enrolled in.",
      "Legitimate interests: fraud prevention, platform security, academic integrity enforcement, and program improvement — balanced against your rights and freedoms.",
      "Consent: marketing communications and non-essential data processing. You may withdraw consent at any time by contacting info@gate-assessment.org.",
      "Legal obligation: where processing is required by applicable law.",
    ],
  },
  {
    number: "05",
    title: "Data Retention",
    content: [
      "Participant registration and examination data is retained for a maximum of five (5) years from the date of participation, after which it is securely deleted or anonymized, unless a longer retention period is required by law.",
      "Certificate and credential verification records — including participant name, award level, and subject — may be retained indefinitely to support the integrity of the G.A.T.E. credential verification system.",
      "You may request early deletion of your personal data, subject to the limitations described in Section 07.",
    ],
  },
  {
    number: "06",
    title: "International Data Transfers",
    content: [
      "G.A.T.E. operates an international program with participants from across the world. Your personal data may be processed in countries other than your country of residence. In particular, data related to the Global Onsite Assessment may be shared with the host institution and authorized event partners located in the host country for the purpose of organizing and administering the in-person final.",
      "When transferring personal data internationally, G.A.T.E. implements appropriate safeguards consistent with applicable data protection laws, including contractual protections with our data processors.",
    ],
  },
  {
    number: "07",
    title: "Sharing Your Information",
    content: [
      "G.A.T.E. does not sell, rent, or trade your personal data to third parties.",
      "We may share your data with: authorized service providers (cloud hosting, email delivery, payment processing) under binding data processing agreements; the host institution and authorized event partners solely for the purpose of administering the Global Onsite Assessment; legal authorities where required by applicable law or in response to lawful requests.",
      "G.A.T.E. may publish anonymized, aggregated statistics about participation (such as country-level participation counts) without identifying individual participants.",
    ],
  },
  {
    number: "08",
    title: "Your Rights",
    content: [
      "Depending on the data protection laws applicable to your jurisdiction, you may have the right to: access the personal data we hold about you; request correction of inaccurate or incomplete data; request deletion of your personal data (subject to legal retention requirements and our legitimate interests in maintaining academic records); object to or request restriction of certain processing activities; receive your data in a portable format; and withdraw consent at any time where processing is based on consent.",
      "To exercise any of these rights, submit a written request to: info@gate-assessment.org. We will respond within thirty (30) days. We may require you to verify your identity before processing the request.",
      "Residents of the European Economic Area, the United Kingdom, and other jurisdictions with comprehensive data protection laws retain rights under those applicable frameworks. G.A.T.E. is committed to honoring those rights to the extent required by law.",
    ],
  },
  {
    number: "09",
    title: "Children's Privacy",
    content: [
      "The G.A.T.E. Assessment is designed for students aged 14 to 19. Participants under the age of 18 are considered minors, and their registration requires the verified consent of a parent or legal guardian.",
      "By completing registration for a minor, the parent or guardian confirms that they have read this Privacy Policy, that they consent on behalf of the minor to the collection and processing of the minor's personal data as described herein, and that all information submitted is accurate.",
      "G.A.T.E. does not knowingly collect personal data from children under the age of 14. If we become aware that data from a child under 14 has been collected without appropriate consent, we will delete that data promptly.",
    ],
  },
  {
    number: "10",
    title: "Security",
    content: [
      "G.A.T.E. implements technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction. These measures include access controls, encryption of data in transit, and periodic security reviews.",
      "No transmission of data over the internet is completely secure. While we take all reasonable precautions, G.A.T.E. cannot guarantee absolute security and is not liable for unauthorized access resulting from circumstances beyond our reasonable control.",
    ],
  },
  {
    number: "11",
    title: "Cookies",
    content: [
      "The G.A.T.E. platform uses essential cookies for authentication and secure session management. These cookies are necessary for the platform to function and cannot be disabled.",
      "We may also use analytical cookies to understand how participants use the platform, in order to improve the experience. You may disable non-essential cookies through your browser settings at any time, though this may affect platform functionality.",
    ],
  },
  {
    number: "12",
    title: "Changes to This Policy",
    content: [
      "G.A.T.E. may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The revised policy will be published on the platform with an updated effective date.",
      "Where changes are material, we will notify registered participants by email. Continued use of the G.A.T.E. platform after the effective date of any revision constitutes acceptance of the updated policy.",
      "For questions about this Privacy Policy: info@gate-assessment.org",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Legal</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Privacy Policy</h1>
          <p className="text-sm font-light text-gate-800/50 mt-1">
            Effective: 2025 &nbsp;·&nbsp; G.A.T.E. Assessment
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-white">
        <div className="mx-auto max-w-4xl flex flex-col gap-0">
          <p className="text-sm font-light text-gate-800/65 leading-[1.9] pb-12 border-b border-gate-fog/60">
            This Privacy Policy explains how G.A.T.E. Assessment collects, uses, stores, and protects personal
            information provided by participants, coordinators, and visitors in connection with the G.A.T.E.
            Assessment program. Please read this policy carefully before registering. By using the G.A.T.E.
            platform or participating in any part of the program, you acknowledge that you have read and
            understood this policy.
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
