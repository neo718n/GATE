import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the G.A.T.E. Olympiad team.",
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 px-6 border-b border-border/30 bg-gate-800/10">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
            Get in Touch
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-white">
            Contact Us
          </h1>
          <p className="text-base font-light text-gate-white/55 leading-relaxed max-w-xl mt-2">
            Questions about registration, the competition format, or
            partnerships? We&apos;re happy to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
                Inquiries
              </span>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gate-white/80">
                  General &amp; Registration
                </p>
                <p className="text-sm font-light text-gate-white/50">
                  Use the form for registration questions, eligibility, and
                  general information.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gate-white/80">
                  Institutional Partnerships
                </p>
                <p className="text-sm font-light text-gate-white/50">
                  Universities, schools, and organisations interested in
                  partnering with G.A.T.E. are welcome to reach out.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gate-white/80">
                  Career Opportunities
                </p>
                <p className="text-sm font-light text-gate-white/50">
                  If you are interested in a role with the G.A.T.E. organizing
                  committee, please mention it in your message.
                </p>
              </div>
            </div>

            <div className="border-t border-border/30 pt-8 flex flex-col gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
                Venue
              </span>
              <div className="flex flex-col gap-1 text-sm font-light text-gate-white/55">
                <span>Xidian University</span>
                <span>Hangzhou Campus</span>
                <span>Hangzhou, Zhejiang, China</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
