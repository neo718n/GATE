import fs from "fs";
import path from "path";
import {
  Circle,
  Document,
  Font,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { QuestionStatus } from "@/lib/badges/results";
import {
  allResources,
  type PlanWeek,
  type ReviewRow,
  type SkillRow,
  type SubjectReport,
} from "@/lib/badges/diagnostic-report";
import type { StudyResource } from "@/lib/badges/study-resources";

// Same base64-data-URI approach as components/badges/certificate-pdf.tsx —
// sidesteps @react-pdf/image's Windows local-file resolver and embeds once.
const PARTNERS_DIR = path.join(process.cwd(), "public", "partners");
function assetDataUri(filename: string): string {
  const bytes = fs.readFileSync(path.join(PARTNERS_DIR, filename));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}
const GATE_LOGO = assetDataUri("gate-logo-navy-transparent.png");
const EDSQUARE_LOGO = assetDataUri("edsquare-transparent.png");

Font.registerHyphenationCallback((word) => [word]);

const NAVY = "#0b1f3a";
const GOLD = "#c9993a";
const GOLD_SOFT = "#f6eedc";
const PAPER = "#ffffff";
const INK = "#1d2b38";
const MUTED = "#5e6b7c";
const FAINT = "#94a0ae";
const RULE = "#e3e7ec";
const TRACK = "#edf0f3";
const GREEN = "#1f9d6b";
const GREEN_SOFT = "#e6f5ee";
const RED = "#c8453b";
const RED_SOFT = "#fbeceb";
const AMBER = "#c98a1a";
const AMBER_SOFT = "#fbf3e2";

const STATUS_STYLE: Record<QuestionStatus, { label: string; fg: string; bg: string }> = {
  correct: { label: "Correct", fg: GREEN, bg: GREEN_SOFT },
  wrong: { label: "Incorrect", fg: RED, bg: RED_SOFT },
  blank: { label: "Blank", fg: MUTED, bg: TRACK },
  ambiguous: { label: "Unclear", fg: AMBER, bg: AMBER_SOFT },
};

function toneFor(pct: number): string {
  if (pct >= 70) return GREEN;
  if (pct >= 40) return GOLD;
  return RED;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    paddingTop: 42,
    paddingBottom: 54,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: INK,
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: RULE,
    paddingTop: 7,
    fontSize: 7,
    color: FAINT,
  },
  eyebrow: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: GOLD,
  },
  h2: { fontFamily: "Times-Bold", fontSize: 15, color: NAVY, marginBottom: 8 },
  label: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 6,
  },
  card: { borderWidth: 0.75, borderColor: RULE, borderRadius: 6, padding: 12 },
  goldRule: { height: 1.5, backgroundColor: GOLD, width: 46, marginVertical: 10 },
});

// ── Small building blocks ──────────────────────────────────────────────────

function Footer({ name, cardNo }: { name: string; cardNo: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>
        G.A.T.E. Official Diagnostic Report · {name} · {cardNo}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

function ScoreRing({ pct, size = 64 }: { pct: number; size?: number }) {
  const r = 26;
  const c = 32;
  const clamped = Math.max(0, Math.min(100, pct));
  const angle = (clamped / 100) * 2 * Math.PI;
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  const large = clamped > 50 ? 1 : 0;
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Circle cx={c} cy={c} r={r} stroke={TRACK} strokeWidth={6} fill="none" />
        {clamped >= 100 ? (
          <Circle cx={c} cy={c} r={r} stroke={GOLD} strokeWidth={6} fill="none" />
        ) : clamped > 0 ? (
          <Path
            d={`M ${c} ${c - r} A ${r} ${r} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
            stroke={GOLD}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: size * 0.22, color: NAVY }}>{clamped}%</Text>
      </View>
    </View>
  );
}

function Bar({ row }: { row: SkillRow }) {
  const tone = toneFor(row.pct);
  return (
    <View style={{ marginBottom: 7 }} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2.5 }}>
        <Text style={{ fontSize: 8.5, color: INK }}>{row.label}</Text>
        <Text style={{ fontSize: 8, color: MUTED }}>
          {row.correct}/{row.total} · <Text style={{ fontFamily: "Helvetica-Bold", color: tone }}>{row.pct}%</Text>
        </Text>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: TRACK }}>
        <View
          style={{
            height: 5,
            borderRadius: 3,
            backgroundColor: tone,
            width: `${Math.max(row.pct, row.pct > 0 ? 3 : 0)}%`,
          }}
        />
      </View>
    </View>
  );
}

function Pill({ text, fg, bg }: { text: string; fg: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6, alignSelf: "flex-start" }}>
      <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: fg }}>{text}</Text>
    </View>
  );
}

// Nested <Text> runs of different sizes/fonts mis-measure line height in
// react-pdf (the next line draws on top of them) — mixed-size runs are laid
// out as sibling Texts in a row instead.
function ScoreLine({
  earned,
  max,
  size,
  color,
  subColor,
  suffix = "",
}: {
  earned: number;
  max: number;
  size: number;
  color: string;
  subColor: string;
  suffix?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
      <Text style={{ fontFamily: "Times-Bold", fontSize: size, color, lineHeight: 1 }}>{earned}</Text>
      <Text style={{ fontSize: 9, color: subColor, marginLeft: 3, marginBottom: size * 0.08 }}>
        / {max}
        {suffix}
      </Text>
    </View>
  );
}

function isStretchOnly(report: SubjectReport): boolean {
  return report.growth.every((g) => g.pct >= 60);
}

function growthTitle(report: SubjectReport): string {
  return isStretchOnly(report) ? "Next stretch" : "Focus areas";
}

// ── Cover page ─────────────────────────────────────────────────────────────

function SubjectSummaryCard({ report }: { report: SubjectReport }) {
  return (
    <View style={[s.card, { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }]}>
      <ScoreRing pct={report.pct} />
      <View style={{ flex: 1 }}>
        <Text style={[s.eyebrow, { marginBottom: 3 }]}>{report.subjectLabel}</Text>
        <ScoreLine earned={report.pointsEarned} max={report.pointsMax} size={18} color={NAVY} subColor={FAINT} suffix=" pts" />
        <Text style={{ fontSize: 7.5, color: MUTED, marginTop: 1 }}>
          {report.correctCount} of {report.totalQuestions} correct
        </Text>
        <View style={{ marginTop: 5 }}>
          <Pill text={report.awardLabel} fg={NAVY} bg={GOLD_SOFT} />
        </View>
      </View>
    </View>
  );
}

function AtAGlance({ report }: { report: SubjectReport }) {
  return (
    <View style={[s.card, { flex: 1 }]}>
      <Text style={s.eyebrow}>{report.subjectLabel} at a glance</Text>
      <Text style={[s.label, { marginTop: 8, color: GREEN }]}>Strengths</Text>
      {report.strengths.length > 0 ? (
        report.strengths.map((st) => (
          <Text key={st.key} style={{ fontSize: 8.5, marginBottom: 2 }}>
            + {st.label} <Text style={{ color: MUTED }}>({st.pct}%)</Text>
          </Text>
        ))
      ) : (
        <Text style={{ fontSize: 8.5, color: MUTED }}>Building foundations across all areas.</Text>
      )}
      <Text style={[s.label, { marginTop: 8, color: isStretchOnly(report) ? GOLD : RED }]}>{growthTitle(report)}</Text>
      {report.growth.map((g) => (
        <Text key={g.key} style={{ fontSize: 8.5, marginBottom: 2 }}>
          - {g.label} <Text style={{ color: MUTED }}>({g.pct}%)</Text>
        </Text>
      ))}
      {report.cefrSecure ? (
        <Text style={{ fontSize: 8.5, marginTop: 6 }}>
          Secure CEFR level: <Text style={{ fontFamily: "Helvetica-Bold", color: NAVY }}>{report.cefrSecure}</Text>
        </Text>
      ) : null}
    </View>
  );
}

interface CoverProps {
  name: string;
  cardNo: string;
  country: string;
  reports: SubjectReport[];
  verifyUrl: string;
  verifyQr: string;
  issuedOn: string;
  eventLabel: string;
}

function Cover({ name, cardNo, country, reports, verifyUrl, verifyQr, issuedOn, eventLabel }: CoverProps) {
  return (
    <Page size="A4" style={[s.page, { paddingTop: 0 }]}>
      <View style={{ backgroundColor: NAVY, marginHorizontal: -42, paddingHorizontal: 42, paddingTop: 30, paddingBottom: 26 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ backgroundColor: PAPER, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8 }}>
            <Image src={GATE_LOGO} style={{ height: 26, objectFit: "contain" }} />
          </View>
          <Text style={{ fontSize: 7.5, color: "#c3ccd8", letterSpacing: 1.4, textTransform: "uppercase" }}>
            {eventLabel}
          </Text>
        </View>
        <Text style={[s.eyebrow, { marginTop: 30, color: GOLD }]}>Official Diagnostic Report</Text>
        <Text style={{ fontFamily: "Times-Bold", fontSize: 30, color: PAPER, marginTop: 6, lineHeight: 1.15 }}>{name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <Text style={{ fontSize: 9, color: "#c3ccd8" }}>Card No. </Text>
          <Text style={{ fontSize: 9, fontFamily: "Courier-Bold", color: PAPER }}>{cardNo}</Text>
          <Text style={{ fontSize: 9, color: "#c3ccd8" }}>
            {"   ·   "}
            {country}
            {"   ·   "}
            Issued {issuedOn}
          </Text>
        </View>
      </View>
      <View style={{ height: 3, backgroundColor: GOLD, marginHorizontal: -42 }} />

      <View style={{ marginTop: 22 }}>
        <Text style={s.label}>Results summary</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {reports.map((r) => (
            <SubjectSummaryCard key={r.subject} report={r} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        {reports.map((r) => (
          <AtAGlance key={r.subject} report={r} />
        ))}
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={s.label}>How to use this report</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            ["1", "Understand", "Read the skill profile to see exactly which areas earned and lost marks."],
            ["2", "Review", "Go through every missed question in the review table — note what each one tests."],
            ["3", "Improve", "Follow the 4-week plan using the hand-picked resources. Scan any QR code to open it."],
          ].map(([n, t, d]) => (
            <View key={n} style={{ flex: 1, flexDirection: "row", gap: 7 }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: GOLD_SOFT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8, color: GOLD }}>{n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: NAVY }}>{t}</Text>
                <Text style={{ fontSize: 8, color: MUTED, marginTop: 1.5 }}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          left: 42,
          right: 42,
          bottom: 52,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          borderWidth: 0.75,
          borderColor: GOLD,
          borderRadius: 6,
          padding: 12,
          backgroundColor: "#fdfbf6",
        }}
      >
        <Image src={verifyQr} style={{ width: 62, height: 62 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: NAVY }}>Verify this report</Text>
          <Text style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>
            Scan the QR code or visit the link below. The official GATE registry shows the same name, score and
            medal for card {cardNo}.
          </Text>
          <Link src={verifyUrl} style={{ fontSize: 8, color: GOLD, marginTop: 3, textDecoration: "none" }}>
            {verifyUrl.replace(/^https?:\/\//, "")}
          </Link>
        </View>
        <View style={{ alignItems: "center" }}>
          <Image src={EDSQUARE_LOGO} style={{ height: 22, objectFit: "contain" }} />
          <Text style={{ fontSize: 6, color: FAINT, marginTop: 3 }}>Operated by EdSquare</Text>
        </View>
      </View>

      <Footer name={name} cardNo={cardNo} />
    </Page>
  );
}

// ── Subject pages ──────────────────────────────────────────────────────────

function SubjectHeader({ report }: { report: SubjectReport }) {
  return (
    <View
      style={{
        backgroundColor: NAVY,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text style={s.eyebrow}>{report.subjectLabel} · Diagnostic</Text>
        <Text style={{ fontFamily: "Times-Bold", fontSize: 17, color: PAPER, marginTop: 3 }}>{report.paperLabel}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <ScoreLine earned={report.pointsEarned} max={report.pointsMax} size={20} color={PAPER} subColor="#c3ccd8" />
        <Text style={{ fontSize: 8, color: GOLD, fontFamily: "Helvetica-Bold", marginTop: 3 }}>{report.awardLabel}</Text>
      </View>
    </View>
  );
}

function AreaCard({
  title,
  color,
  bg,
  items,
  empty,
}: {
  title: string;
  color: string;
  bg: string;
  items: Array<{ key: string; label: string; detail: string }>;
  empty: string;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 6, padding: 11 }}>
      <Text style={[s.label, { color }]}>{title}</Text>
      {items.length > 0 ? (
        items.map((i) => (
          <View key={i.key} style={{ marginBottom: 4 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: INK }}>{i.label}</Text>
            <Text style={{ fontSize: 7.5, color: MUTED }}>{i.detail}</Text>
          </View>
        ))
      ) : (
        <Text style={{ fontSize: 8, color: MUTED }}>{empty}</Text>
      )}
    </View>
  );
}

const COLS = { q: 22, topic: 92, level: 40, given: 32, correct: 32, status: 50 };

function ReviewTable({ rows }: { rows: ReviewRow[] }) {
  const head = (t: string, w?: number, flex?: number) => (
    <Text style={{ width: w, flex, fontSize: 6.5, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.8, textTransform: "uppercase" }}>
      {t}
    </Text>
  );
  return (
    <View>
      <View
        fixed
        style={{ flexDirection: "row", gap: 6, paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.75, borderBottomColor: NAVY }}
      >
        {head("#", COLS.q)}
        {head("Topic", COLS.topic)}
        {head("Level", COLS.level)}
        {head("Yours", COLS.given)}
        {head("Key", COLS.correct)}
        {head("Result", COLS.status)}
        {head("What this question tests", undefined, 1)}
      </View>
      {rows.map((r, i) => {
        const st = STATUS_STYLE[r.status];
        const miss = r.status !== "correct";
        return (
          <View
            key={r.q}
            wrap={false}
            style={{
              flexDirection: "row",
              gap: 6,
              paddingVertical: 3.5,
              paddingHorizontal: 6,
              backgroundColor: i % 2 ? "#fafbfc" : PAPER,
              borderBottomWidth: 0.5,
              borderBottomColor: RULE,
            }}
          >
            <Text style={{ width: COLS.q, fontFamily: "Helvetica-Bold", fontSize: 8, color: NAVY }}>Q{r.q}</Text>
            <Text style={{ width: COLS.topic, fontSize: 7.5 }}>{r.topic}</Text>
            <Text style={{ width: COLS.level, fontSize: 7.5, color: MUTED }}>{r.level}</Text>
            <Text style={{ width: COLS.given, fontSize: 8, fontFamily: "Courier-Bold", color: miss ? st.fg : INK }}>
              {r.given || "-"}
            </Text>
            <Text style={{ width: COLS.correct, fontSize: 8, fontFamily: "Courier-Bold", color: INK }}>{r.correct}</Text>
            <View style={{ width: COLS.status }}>
              <Pill text={st.label} fg={st.fg} bg={st.bg} />
            </View>
            <Text style={{ flex: 1, fontSize: 7.5, color: miss ? INK : FAINT }}>{r.note}</Text>
          </View>
        );
      })}
    </View>
  );
}

function PlanGrid({ weeks }: { weeks: PlanWeek[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {weeks.map((w) => (
        <View key={w.week} wrap={false} style={[s.card, { width: "48.8%", padding: 10 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <View style={{ backgroundColor: NAVY, borderRadius: 3, paddingVertical: 2, paddingHorizontal: 5 }}>
              <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GOLD }}>WEEK {w.week}</Text>
            </View>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: NAVY, flex: 1 }}>{w.focus}</Text>
          </View>
          {w.tasks.map((t, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 4, marginBottom: 2.5 }}>
              <Text style={{ fontSize: 7.5, color: GOLD }}>•</Text>
              <Text style={{ fontSize: 7.5, color: INK, flex: 1 }}>{t}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function ResourceCard({ r, qr }: { r: StudyResource; qr?: string }) {
  return (
    <View wrap={false} style={[s.card, { width: "48.8%", padding: 9, flexDirection: "row", gap: 8 }]}>
      {qr ? <Image src={qr} style={{ width: 44, height: 44 }} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 6.5, color: GOLD, fontFamily: "Helvetica-Bold", letterSpacing: 0.6, textTransform: "uppercase" }}>
          {r.provider}
          {r.paid ? "  ·  PAID" : ""}
        </Text>
        <Link src={r.url} style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: NAVY, textDecoration: "none", marginTop: 1 }}>
          {r.title}
        </Link>
        <Text style={{ fontSize: 7.3, color: MUTED, marginTop: 2 }}>{r.why}</Text>
      </View>
    </View>
  );
}

function SubjectPages({
  report,
  name,
  cardNo,
  qrByUrl,
}: {
  report: SubjectReport;
  name: string;
  cardNo: string;
  qrByUrl: Record<string, string>;
}) {
  const resources = allResources(report);
  // A resource is shown once, under the first focus area that recommends it.
  const shown = new Set<string>();
  const areaResources = report.growth.map((g) => ({
    area: g,
    list: g.resources.filter((r) => (shown.has(r.url) ? false : (shown.add(r.url), true))),
  }));
  const extras = report.extraResources.filter((r) => !shown.has(r.url));
  return (
    <>
      <Page size="A4" style={s.page}>
        <SubjectHeader report={report} />

        <View style={{ flexDirection: "row", gap: 18, marginTop: 18 }}>
          <View style={{ flex: 1.3 }}>
            <Text style={s.label}>{report.skillsTitle}</Text>
            {report.skills.map((r) => (
              <Bar key={r.key} row={r} />
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{report.levelsTitle}</Text>
            {report.levels.map((r) => (
              <Bar key={r.key} row={r} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <AreaCard
            title="Strengths"
            color={GREEN}
            bg={GREEN_SOFT}
            items={report.strengths.map((x) => ({
              key: x.key,
              label: x.label,
              detail: `${x.correct} of ${x.total} correct (${x.pct}%)`,
            }))}
            empty="No area above 70% yet — the plan below builds your first strong area."
          />
          <AreaCard
            title={growthTitle(report)}
            color={isStretchOnly(report) ? GOLD : RED}
            bg={isStretchOnly(report) ? GOLD_SOFT : RED_SOFT}
            items={report.growth.map((g) => ({
              key: g.key,
              label: g.label,
              detail: `${g.correct} of ${g.total} correct (${g.pct}%) · review ${g.missedQuestions.map((q) => `Q${q}`).join(", ") || "-"}`,
            }))}
            empty="No weak areas on this paper."
          />
        </View>

        {report.insights.length > 0 ? (
          <View style={{ marginTop: 14, borderLeftWidth: 2, borderLeftColor: GOLD, paddingLeft: 10 }}>
            <Text style={s.label}>Key insights</Text>
            {report.insights.map((t, i) => (
              <Text key={i} style={{ fontSize: 8.5, marginBottom: 4, color: INK }}>
                {t}
              </Text>
            ))}
          </View>
        ) : null}

        {report.notes ? (
          <View style={{ marginTop: 10, backgroundColor: AMBER_SOFT, borderRadius: 6, padding: 9 }}>
            <Text style={{ fontSize: 8, color: INK }}>{`Grader's note: ${report.notes}`}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 18 }} break>
          <Text style={s.eyebrow}>{report.subjectLabel}</Text>
          <Text style={[s.h2, { marginTop: 2 }]}>Question-by-question review</Text>
        </View>
        <ReviewTable rows={report.review} />

        {/* Flows straight on from the review table (no forced page break) so a
            short table tail never leaves a near-empty page behind. */}
        <View style={{ marginTop: 22 }} minPresenceAhead={160}>
          <Text style={s.eyebrow}>{report.subjectLabel}</Text>
          <Text style={[s.h2, { marginTop: 2 }]}>Your 4-week improvement plan</Text>
          <Text style={{ fontSize: 8.5, color: MUTED, marginBottom: 10 }}>
            Built from your focus areas. About 30 minutes a day, five days a week, is enough to see a real difference.
          </Text>
        </View>
        <PlanGrid weeks={report.plan} />

        <View style={s.goldRule} minPresenceAhead={120} />
        <Text style={[s.h2, { marginBottom: 2 }]}>Recommended resources</Text>
        <Text style={{ fontSize: 8.5, color: MUTED, marginBottom: 10 }}>
          Hand-picked by GATE from leading learning platforms, chosen for your grade band and focus areas. Tap a
          title or scan its code to open it.
        </Text>
        {areaResources.map(({ area: g, list }) => (
          <View key={g.key} style={{ marginBottom: 10 }} wrap={false}>
            <Text style={[s.label, { color: NAVY }]}>For {g.label}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {list.map((r) => (
                <ResourceCard key={r.url} r={r} qr={qrByUrl[r.url]} />
              ))}
            </View>
          </View>
        ))}
        {extras.length > 0 ? (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Text style={[s.label, { color: NAVY }]}>
              {report.subject === "math" ? "Contest-style practice" : "General practice"}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {extras.map((r) => (
                <ResourceCard key={r.url} r={r} qr={qrByUrl[r.url]} />
              ))}
            </View>
          </View>
        ) : null}
        <Text style={{ fontSize: 7, color: FAINT, marginTop: 4 }}>
          {resources.length} resources · every link checked by GATE at the time of issue
          {resources.some((r) => r.paid) ? " · resources marked PAID need a subscription; all others are free" : " · all free to use"}
        </Text>

        <Footer name={name} cardNo={cardNo} />
      </Page>
    </>
  );
}

// ── Document ───────────────────────────────────────────────────────────────

export interface DiagnosticReportPDFProps extends CoverProps {
  qrByUrl: Record<string, string>;
}

export function DiagnosticReportPDF(props: DiagnosticReportPDFProps) {
  const { name, cardNo, reports, qrByUrl } = props;
  return (
    <Document
      title={`GATE Diagnostic Report — ${name} (${cardNo})`}
      author="G.A.T.E. — Global Academic Talent Evaluation"
      subject="Official Diagnostic Report"
      creator="gate-assessment.org"
    >
      <Cover {...props} />
      {reports.map((r) => (
        <SubjectPages key={r.subject} report={r} name={name} cardNo={cardNo} qrByUrl={qrByUrl} />
      ))}
    </Document>
  );
}

