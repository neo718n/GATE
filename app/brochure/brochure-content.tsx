import type { BrochureCopy, IconName } from "./copy";
import { CHINA_CAMP_PHOTOS } from "@/lib/marketing/china-camp-photos";

// ── Brand logo (inline SVG — no background, transparent) ─────────

function GATEWordmark({ variant = "dark", width = "32mm" }: { variant?: "dark" | "light"; width?: string }) {
  const c = variant === "dark" ? "#0B1F3A" : "#FAFBFC";
  return (
    <svg
      viewBox="0 0 560 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width, height: "auto" }}
      aria-label="G.A.T.E."
    >
      <text fontFamily="Montserrat,Arial,sans-serif" fontSize="82" fontWeight="900">
        <tspan x="2" y="74" fill={c} letterSpacing="14">G</tspan><tspan fill="#C9993A" letterSpacing="0">.</tspan>
        <tspan fill={c} letterSpacing="14">A</tspan><tspan fill="#C9993A" letterSpacing="0">.</tspan>
        <tspan fill={c} letterSpacing="14">T</tspan><tspan fill="#C9993A" letterSpacing="0">.</tspan>
        <tspan fill={c} letterSpacing="14">E</tspan><tspan fill="#C9993A" letterSpacing="0">.</tspan>
      </text>
    </svg>
  );
}

// ── Icons ─────────────────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <line x1="2" y1="7" x2="14" y2="7" />
      <line x1="5" y1="1" x2="5" y2="5" />
      <line x1="11" y1="1" x2="11" y2="5" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14S3 9.5 3 6a5 5 0 0 1 10 0c0 3.5-5 8-5 8z" />
      <circle cx="8" cy="6" r="1.5" />
    </svg>
  );
}

function IconFee() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v6" />
      <path d="M6 6.5h2.5a1.5 1.5 0 0 1 0 3H6" />
    </svg>
  );
}

function IconSubjects() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13.5V4.5" />
      <path d="M8 4.5C7 3.5 5 3 3 3.5V13C5 12.5 7 13 8 13.5" />
      <path d="M8 4.5C9 3.5 11 3 13 3.5V13C11 12.5 9 13 8 13.5" />
    </svg>
  );
}

function renderIcon(name: IconName) {
  switch (name) {
    case "calendar": return <IconCalendar />;
    case "pin": return <IconPin />;
    case "fee": return <IconFee />;
    case "subjects": return <IconSubjects />;
  }
}

const QR_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=400x400&qzone=1&color=1A1815&bgcolor=FFFFFF&data=https%3A%2F%2Fgate-assessment.org";

// ── Back Cover ────────────────────────────────────────────────────

function PanelBackCover({ copy }: { copy: BrochureCopy }) {
  const { backCover } = copy;
  return (
    <div className="panel panel-back-cover">
      <div className="bc-logo">
        <GATEWordmark variant="dark" width="30mm" />
        <span className="bc-subtitle">{backCover.subtitle}</span>
      </div>

      <div className="bc-qr-section">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={QR_URL} alt="QR" />
        <span className="bc-scan-label">{backCover.scanLabel}</span>
      </div>

      <div className="bc-divider" />

      <div className="bc-contact-block">
        <div className="bc-contact-row">
          <span className="bc-label">{backCover.websiteLabel}</span>
          <span className="bc-value">{backCover.website}</span>
        </div>
        <div className="bc-contact-row">
          <span className="bc-label">{backCover.emailLabel}</span>
          <span className="bc-value">{backCover.email}</span>
        </div>
        <div className="bc-contact-row">
          <span className="bc-label">{backCover.operatedByLabel}</span>
          <span className="bc-value" style={{ whiteSpace: "pre-line" }}>{backCover.operatedBy}</span>
        </div>
      </div>

      <div className="bc-divider" />
      <span className="bc-copyright">{backCover.copyright}</span>
    </div>
  );
}

// ── Front Cover ───────────────────────────────────────────────────

function PanelFrontCover({ copy }: { copy: BrochureCopy }) {
  const { hero } = copy;
  return (
    <div className="panel panel-front-cover">
      <div className="fc-top">
        <span className="fc-edition">{hero.editionBadge}</span>
        <div className="fc-logo">
          <GATEWordmark variant="dark" width="38mm" />
        </div>
        <div className="fc-rule" />
        <div className="fc-title">
          <span className="fc-title-line">{hero.titleLine1}</span>
          <span className="fc-title-line-italic">{hero.titleLine2}</span>
        </div>
        <p className="fc-tagline">{hero.tagline}</p>
      </div>

      <div className="fc-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CHINA_CAMP_PHOTOS.campusLandmark.src}
          alt={CHINA_CAMP_PHOTOS.campusLandmark.alt}
        />
      </div>

      <div className="fc-partnership">
        <span className="fc-partner-label">{hero.partnershipLabel}</span>
        <span className="fc-partner-name">{hero.partnershipName}</span>
        <span className="fc-partner-sub">{hero.partnershipSubname}</span>
        <span className="fc-partner-chinese">{hero.partnershipChinese}</span>
      </div>
    </div>
  );
}

// ── Inner Flap ────────────────────────────────────────────────────

function PanelInnerFlap({ copy }: { copy: BrochureCopy }) {
  const { about, atGlance } = copy;
  return (
    <div className="panel panel-inner-flap">
      <p className="if-section-label">{about.title}</p>
      <div className="if-rule" />
      <p className="if-body">{about.body}</p>

      <div className="if-divider" />

      <p className="if-section-label">{atGlance.title}</p>
      <div className="if-rule" />
      <div className="if-glance-row">
        <span className="if-glance-event-label">{atGlance.eventLabel}</span>
        <span className="if-glance-summary">{atGlance.eventSummary}</span>
      </div>

      <div className="if-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CHINA_CAMP_PHOTOS.classroom1.src} alt={CHINA_CAMP_PHOTOS.classroom1.alt} />
      </div>
    </div>
  );
}

// ── Event Panel ───────────────────────────────────────────────────

function PanelEventContent({ copy }: { copy: BrochureCopy }) {
  const { event } = copy;
  return (
    <div className="panel panel-event">
      <div className="ev-content">
        <span className="ev-tag">{event.tag}</span>

        <div className="ev-title">
          <span className="ev-title-top">{event.titleTop}</span>
          <span className="ev-title-bottom">{event.titleBottom}</span>
        </div>

        <div className="ev-rule" />

        <div className="ev-meta">
          {event.meta.map((row) => (
            <div key={row.label} className="ev-meta-row">
              <span className="ev-meta-icon">{renderIcon(row.icon)}</span>
              <span className="ev-meta-label">{row.label}</span>
              <span className="ev-meta-value">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="ev-rule" />

        <div>
          <p className="ev-section-label">{event.includedTitle}</p>
          <div className="ev-included">
            {event.included.map((item) => (
              <div key={item} className="ev-included-item">
                <span className="ev-included-dash">–</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ev-rule" />

        <div>
          <p className="ev-section-label">{event.eligibilityTitle}</p>
          <p className="ev-eligibility">{event.eligibility}</p>
        </div>

        <div className="ev-content-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CHINA_CAMP_PHOTOS.computerLab1.src} alt={CHINA_CAMP_PHOTOS.computerLab1.alt} />
        </div>
      </div>
    </div>
  );
}

function PanelEventPhotos() {
  return (
    <div className="panel panel-event-photos">
      <div className="ev-photos">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CHINA_CAMP_PHOTOS.lectureHall1.src} alt={CHINA_CAMP_PHOTOS.lectureHall1.alt} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CHINA_CAMP_PHOTOS.dormitoryRoom.src} alt={CHINA_CAMP_PHOTOS.dormitoryRoom.alt} />
      </div>
    </div>
  );
}

// ── Enroll Panel ──────────────────────────────────────────────────

function PanelEnroll({ copy }: { copy: BrochureCopy }) {
  const { enroll } = copy;
  return (
    <div className="panel panel-enroll">
      <div className="en-inner">
      <span className="en-tag">{enroll.tag}</span>
      <h2 className="en-title">{enroll.title}</h2>
      <div className="en-rule" />

      <div className="en-steps">
        {enroll.steps.map((step) => (
          <div key={step.number} className="en-step">
            <span className="en-step-num">{step.number}</span>
            <div className="en-step-body">
              <span className="en-step-title">{step.title}</span>
              <span className="en-step-text">{step.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="en-divider" />

      <span className="en-dates-label">{enroll.keyDatesTitle}</span>
      {enroll.keyDates.map((kd) => (
        <div key={kd.label} className="en-date-row">
          <span className="en-date-event">{kd.label}</span>
          <span className="en-date-value">{kd.date}</span>
        </div>
      ))}

      <div className="en-qr-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={QR_URL} alt="QR — gate-assessment.org" />
        <span className="en-cta-url">{enroll.ctaUrl}</span>
        <span className="en-contact">
          {enroll.contactLabel} {enroll.email}
        </span>
      </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────

export function Brochure({ copy }: { copy: BrochureCopy }) {
  return (
    <div className="brochure-wrapper">
      <div className="sheet sheet-outside">
        <PanelBackCover copy={copy} />
        <PanelFrontCover copy={copy} />
        <PanelInnerFlap copy={copy} />
      </div>

      <div className="sheet-separator" />

      <div className="sheet sheet-inside">
        <PanelEventContent copy={copy} />
        <PanelEventPhotos />
        <PanelEnroll copy={copy} />
      </div>
    </div>
  );
}
