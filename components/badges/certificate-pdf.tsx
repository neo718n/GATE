import fs from "fs";
import path from "path";
import {
  Circle,
  Defs,
  Document,
  Font,
  Image,
  Page,
  RadialGradient,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Award } from "@/lib/db/schema";

// Same base64-data-URI trick as components/badges/badge-card-pdf.tsx — sidesteps
// @react-pdf/image's broken Windows local-file resolver and gives every image a
// stable cache key (a raw Buffer has none, so react-pdf would re-embed it on
// every certificate instead of once).
const PARTNERS_DIR = path.join(process.cwd(), "public", "partners");
const CERT_DIR = path.join(process.cwd(), "public", "certificates");
function assetDataUri(dir: string, filename: string, mime: string): string {
  const bytes = fs.readFileSync(path.join(dir, filename));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
const GATE_LOGO = assetDataUri(PARTNERS_DIR, "gate-logo-navy-transparent.png", "image/png");
const EDSQUARE_LOGO = assetDataUri(PARTNERS_DIR, "edsquare-transparent.png", "image/png");
const SIG_AYKUT = assetDataUri(CERT_DIR, "sig-aykut-argun.png", "image/png");
const SIG_YUAN = assetDataUri(CERT_DIR, "sig-yuan-shihai.png", "image/png");
// react-pdf's built-in fonts cover WinAnsi (Latin) glyphs only — no CJK font
// is bundled in this repo (same constraint as PDF_NAME_OVERRIDES in
// badge-card-pdf.tsx). "袁世海" is rasterized once (via sharp/librsvg, which
// the OS's installed CJK fonts render correctly) rather than dropped, so it
// still renders as a real image instead of tofu boxes or missing text.
const YUAN_CJK = assetDataUri(CERT_DIR, "yuan-shihai-cjk.png", "image/png");

Font.registerHyphenationCallback((word) => [word]);

// eventBadges.fullName is stored inconsistently (some rows all-caps, some
// title-case, per the original badge CSV) — always render Title Case on the
// certificate regardless of source casing.
function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

// Non-breaking spaces keep the whole date together as one unbreakable run —
// react-pdf wraps on regular spaces, which was splitting it mid-phrase
// ("18–24" / "August 2026") at the citation's line-wrap point.
const EVENT_DATES = "18–24 August 2026";

const INK = "#1d2b38";
const TITLE_INK = "#16232f";
const BODY_INK = "#46525e";
const LABEL_MUTED = "#93917f";
const SERIAL_MUTED = "#a6a294";
const LINE_INK = "#2c3a47";
const PAGE_BG = "#fdfcf8";

export interface CertificateTier {
  rank: string;
  sealWord: string;
  serialPrefix: string;
  accent: string;
  deep: string;
  frame: string;
  glowA: string;
  sealStops: [string, string, string, string];
  citation: string;
}

// Colors and citation copy transcribed directly from the approved Claude
// Design source (Certificates.dc.html) — one tier per possible eventBadgeResults
// award value. "honorable_mention" never occurs in the China Camp 2026 data
// (see scripts/seed-event-badge-results.ts) but is mapped to keep this
// exhaustive rather than throwing on an unexpected award.
export const CERTIFICATE_TIERS: Record<Award, CertificateTier> = {
  gold: {
    rank: "GOLD AWARD",
    sealWord: "GOLD",
    serialPrefix: "GC",
    accent: "#d9a832",
    deep: "#8a6212",
    frame: "#be9637",
    glowA: "#f2b63c",
    sealStops: ["#f6dd97", "#d9ad45", "#a97d1c", "#7d570d"],
    citation: "for gold-level achievement in the GATE Olympiad examination in",
  },
  silver: {
    rank: "SILVER AWARD",
    sealWord: "SILVER",
    serialPrefix: "SC",
    accent: "#9fb2c2",
    deep: "#54687a",
    frame: "#8296aa",
    glowA: "#7fa8d9",
    sealStops: ["#f2f5f7", "#c3ccd3", "#8d99a3", "#5e6b76"],
    citation: "for silver-level achievement in the GATE Olympiad examination in",
  },
  bronze: {
    rank: "BRONZE AWARD",
    sealWord: "BRONZE",
    serialPrefix: "BC",
    accent: "#c2824a",
    deep: "#8a5426",
    frame: "#b47d4b",
    glowA: "#e08a4a",
    sealStops: ["#eec9a6", "#c8895a", "#9a5f30", "#6f411d"],
    citation: "for bronze-level achievement in the GATE Olympiad examination in",
  },
  honorable_mention: {
    rank: "HONORABLE MENTION",
    sealWord: "H.M.",
    serialPrefix: "HC",
    accent: "#9fb2c2",
    deep: "#54687a",
    frame: "#8296aa",
    glowA: "#7fa8d9",
    sealStops: ["#f2f5f7", "#c3ccd3", "#8d99a3", "#5e6b76"],
    citation: "in recognition of an honorable mention in the GATE Olympiad examination in",
  },
  participation: {
    rank: "PARTICIPANT",
    sealWord: "2026",
    serialPrefix: "PC",
    accent: "#4fa895",
    deep: "#2c6d5e",
    frame: "#50a08c",
    glowA: "#45b39c",
    sealStops: ["#bfe8de", "#6fbfae", "#3d8a7a", "#22594e"],
    citation: "in recognition of participation in the GATE Olympiad examination in",
  },
};

export const CERTIFICATE_SUBJECT_LABEL: Record<"math" | "english", string> = {
  math: "Mathematics",
  english: "English",
};

// Shared with the verify page (components/verify/certificate-result-card.tsx)
// so the serial printed on the PDF always matches what the verify page shows
// — both derive it from the same eventBadgeResults.id rather than storing it.
export function certificateSerial(award: Award, resultId: number): string {
  return `${CERTIFICATE_TIERS[award].serialPrefix}-2026-${String(resultId).padStart(4, "0")}`;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAGE_BG,
    fontFamily: "Times-Roman",
    color: INK,
  },
  outerBorder: {
    position: "absolute",
    top: "0.26in",
    right: "0.26in",
    bottom: "0.26in",
    left: "0.26in",
    borderWidth: 1.5,
  },
  innerBorder: {
    position: "absolute",
    top: "0.33in",
    right: "0.33in",
    bottom: "0.33in",
    left: "0.33in",
    borderWidth: 1,
    borderColor: "rgba(29,43,56,0.12)",
  },
  accentTickTop: {
    position: "absolute",
    top: "0.22in",
    left: "50%",
    marginLeft: "-0.275in",
    width: "0.55in",
    height: "0.09in",
  },
  accentTickBottom: {
    position: "absolute",
    bottom: "0.22in",
    left: "50%",
    marginLeft: "-0.275in",
    width: "0.55in",
    height: "0.09in",
  },
  content: {
    position: "relative",
    height: "100%",
    paddingTop: "0.58in",
    paddingHorizontal: "0.95in",
    paddingBottom: "0.5in",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  verifyBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: "0.14in",
    width: "2.7in",
  },
  qrBox: {
    width: "0.78in",
    height: "0.78in",
    padding: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e0d2",
    borderRadius: 4,
  },
  qrImage: { width: "100%", height: "100%" },
  verifyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica",
    letterSpacing: 1.5,
    color: LABEL_MUTED,
  },
  verifyMono: {
    fontSize: 7.5,
    fontFamily: "Courier",
    color: LINE_INK,
    marginTop: 3,
  },
  verifySerial: {
    fontSize: 7.5,
    fontFamily: "Courier",
    color: SERIAL_MUTED,
    marginTop: 4,
  },
  gateLogo: { width: "3in", height: "1.1in", objectFit: "contain" },
  edsquareLogo: {
    width: "2in",
    height: "0.9in",
    objectFit: "contain",
    marginTop: "-1mm",
  },
  middle: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: "0.22in",
  },
  rankLine: { width: "0.85in", height: 1 },
  rankText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4.1,
  },
  certTitle: {
    fontSize: 52,
    fontFamily: "Times-Roman",
    letterSpacing: 8.3,
    color: TITLE_INK,
    paddingTop: "0.18in",
  },
  presented: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    letterSpacing: 2.7,
    color: LABEL_MUTED,
    paddingTop: "0.22in",
  },
  name: {
    fontSize: 44,
    fontFamily: "Times-Italic",
    lineHeight: 1.12,
    paddingTop: "0.1in",
    textAlign: "center",
  },
  nameRule: {
    width: "3.4in",
    height: 1,
    marginTop: "0.08in",
  },
  countryLine: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    letterSpacing: 2,
    color: LABEL_MUTED,
    paddingTop: "0.09in",
  },
  citation: {
    maxWidth: "7.4in",
    fontSize: 14.5,
    fontFamily: "Times-Roman",
    lineHeight: 1.62,
    color: BODY_INK,
    textAlign: "center",
    paddingTop: "0.22in",
  },
  citationStrong: {
    fontFamily: "Times-Bold",
    color: TITLE_INK,
  },
  scoreLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 1.7,
    color: LABEL_MUTED,
    paddingTop: "0.16in",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  signatureCol: {
    width: "2.4in",
    alignItems: "flex-start",
  },
  signatureColRight: {
    width: "2.4in",
    alignItems: "flex-end",
  },
  sigImageLeft: { width: "1.9in", height: "0.8in", objectFit: "contain" },
  sigImageRight: {
    width: "1.85in",
    height: "0.5in",
    objectFit: "contain",
    marginBottom: "0.05in",
  },
  sigLine: { width: "2.4in", height: 1, backgroundColor: LINE_INK, marginTop: 4 },
  sigName: {
    fontSize: 13.5,
    fontFamily: "Helvetica-Bold",
    color: TITLE_INK,
    paddingTop: 7,
  },
  sigNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: "0.06in",
    paddingTop: 7,
  },
  cjkName: { width: "0.5in", height: "0.17in", objectFit: "contain" },
  sigTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    letterSpacing: 1.65,
    color: LABEL_MUTED,
    paddingTop: 3,
  },
  sealWrap: {
    width: "1.3in",
    height: "1.3in",
  },
});

function GlowCircle({
  id,
  color,
  size,
  top,
  left,
  right,
  bottom,
  opacity,
}: {
  id: string;
  color: string;
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity: number;
}) {
  return (
    <View style={{ position: "absolute", width: size, height: size, top, left, right, bottom }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="55%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={50} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// Text lives inside the same Svg as the gradient circle — a separate
// absolutely-positioned <Text> over an <Svg> sibling doesn't reliably render
// in @react-pdf/renderer (same constraint documented in badge-card-pdf.tsx's
// GradientPill). viewBox units are points here, so font sizes match the
// design's pt values directly.
function Seal({ tier }: { tier: CertificateTier }) {
  const gradId = `seal-${tier.serialPrefix}`;
  return (
    <View style={styles.sealWrap}>
      <Svg width="100%" height="100%" viewBox="0 0 93.6 93.6">
        <Defs>
          <RadialGradient id={gradId} cx="34%" cy="24%" r="85%">
            <Stop offset="0%" stopColor={tier.sealStops[0]} />
            <Stop offset="38%" stopColor={tier.sealStops[1]} />
            <Stop offset="72%" stopColor={tier.sealStops[2]} />
            <Stop offset="100%" stopColor={tier.sealStops[3]} />
          </RadialGradient>
        </Defs>
        <Circle cx={46.8} cy={46.8} r={46.8} fill={`url(#${gradId})`} />
        <Circle
          cx={46.8}
          cy={46.8}
          r={38.8}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={0.75}
        />
        <Text
          x={46.8}
          y={30}
          fill="#ffffff"
          textAnchor="middle"
          // @react-pdf/renderer's SVGTextProps typing omits fontSize/fontFamily
          // even though the renderer reads both at runtime (same gap noted in
          // GradientPill) — cast around it, not a real bug.
          {...({ fontSize: 6.5, fontFamily: "Helvetica-Bold" } as unknown as Record<string, unknown>)}
        >
          G.A.T.E.
        </Text>
        <Text
          x={46.8}
          y={51}
          fill="#ffffff"
          textAnchor="middle"
          {...({ fontSize: 16, fontFamily: "Helvetica-Bold" } as unknown as Record<string, unknown>)}
        >
          {tier.sealWord}
        </Text>
        <Text
          x={46.8}
          y={62}
          fill="#ffffff"
          textAnchor="middle"
          {...({ fontSize: 6, fontFamily: "Helvetica" } as unknown as Record<string, unknown>)}
        >
          OLYMPIAD 2026
        </Text>
      </Svg>
    </View>
  );
}

export interface CertificateData {
  fullName: string;
  country: string;
  subject: "math" | "english";
  award: Award;
  badgeCode: string;
  serial: string;
  qrDataUrl: string;
  pointsEarned: number;
  pointsMax: number;
}

// Content-only (no <Document> wrapper) so a batch renderer can place many of
// these as sibling <Page>s inside one shared <Document> — same split as
// badge-card-pdf.tsx's BadgeCard vs. badge-sheet-pdf.tsx's BadgeSheetPDF.
export function CertificatePage({
  fullName,
  country,
  subject,
  award,
  badgeCode,
  serial,
  qrDataUrl,
  pointsEarned,
  pointsMax,
}: CertificateData) {
  const tier = CERTIFICATE_TIERS[award];
  const subjectLabel = CERTIFICATE_SUBJECT_LABEL[subject];
  const displayName = toTitleCase(fullName);

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
        {/* The design's 3-glow corner treatment (from blurred CSS radial-gradients
            with no PDF equivalent) collapses the whole page render when more than
            one <Svg><RadialGradient> pair is present — a pdfkit/react-pdf gradient
            limitation, not a layout bug (isolated by bisection: 1 glow renders the
            full page correctly, 2+ silently truncates it after the first). One
            corner glow keeps the same soft-light feel without the crash. */}
        <GlowCircle id="glow" color={tier.glowA} size="4in" top="-1.4in" left="-1.1in" opacity={0.32} />

        <View style={[styles.outerBorder, { borderColor: tier.frame }]} />
        <View style={styles.innerBorder} />
        <View style={[styles.accentTickTop, { backgroundColor: tier.accent }]} />
        <View style={[styles.accentTickBottom, { backgroundColor: tier.accent }]} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.verifyBlock}>
              <View style={styles.qrBox}>
                <Image src={qrDataUrl} style={styles.qrImage} />
              </View>
              <View>
                <Text style={styles.verifyLabel}>VERIFY AT</Text>
                <Text style={styles.verifyMono}>gate-assessment.org</Text>
                <Text style={styles.verifyMono}>/verify/certificate/{badgeCode}</Text>
                <Text style={styles.verifySerial}>{serial}</Text>
              </View>
            </View>

            <Image src={GATE_LOGO} style={styles.gateLogo} />
            <Image src={EDSQUARE_LOGO} style={styles.edsquareLogo} />
          </View>

          <View style={styles.middle}>
            <View style={styles.rankRow}>
              <View style={[styles.rankLine, { backgroundColor: tier.deep }]} />
              <Text style={[styles.rankText, { color: tier.deep }]}>{tier.rank}</Text>
              <View style={[styles.rankLine, { backgroundColor: tier.deep }]} />
            </View>

            <Text style={styles.certTitle}>CERTIFICATE</Text>
            <Text style={styles.presented}>PROUDLY PRESENTED TO</Text>
            <Text style={[styles.name, { color: tier.deep }]}>{displayName}</Text>
            <Text style={styles.countryLine}>FROM {country.toUpperCase()}</Text>
            <View style={[styles.nameRule, { backgroundColor: tier.accent }]} />

            <Text style={styles.citation}>
              {tier.citation} <Text style={styles.citationStrong}>{subjectLabel}</Text>, held at{" "}
              <Text style={styles.citationStrong}>Xidian University, Hangzhou Research Institute</Text>.
            </Text>

            {/* The date used to live inline in the citation above, but that
                paragraph's wrap point shifts with name/subject length — when
                "18–24 August 2026" landed right at the wrap boundary, the
                renderer force-hyphenated "August" into "Au-gust" even with
                registerHyphenationCallback returning the whole word (that
                callback governs legitimate hyphenation choices, not this
                fallback forced-break). A short standalone line is never close
                enough to its own edge to hit that case. */}
            <Text style={styles.scoreLine}>{EVENT_DATES}</Text>
            <Text style={[styles.scoreLine, { paddingTop: "0.07in" }]}>
              SCORE {pointsEarned}/{pointsMax} POINTS
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.signatureCol}>
              <Image src={SIG_AYKUT} style={styles.sigImageLeft} />
              <View style={styles.sigLine} />
              <Text style={styles.sigName}>Aykut Argun</Text>
              <Text style={styles.sigTitle}>HEAD OF ACADEMIC BOARD</Text>
            </View>

            <Seal tier={tier} />

            <View style={styles.signatureColRight}>
              <Image src={SIG_YUAN} style={styles.sigImageRight} />
              <View style={styles.sigLine} />
              <View style={styles.sigNameRow}>
                <Text style={[styles.sigName, { paddingTop: 0 }]}>Yuan Shihai</Text>
                <Image src={YUAN_CJK} style={styles.cjkName} />
              </View>
              <Text style={styles.sigTitle}>CHAIR OF ORGANIZATION</Text>
            </View>
          </View>
        </View>
    </Page>
  );
}

// Single-certificate convenience wrapper (used for one-off previews/downloads).
export function CertificatePDF(props: CertificateData) {
  return (
    <Document>
      <CertificatePage {...props} />
    </Document>
  );
}
