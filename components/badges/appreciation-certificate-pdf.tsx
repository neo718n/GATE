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

// One-off sibling to components/badges/certificate-pdf.tsx for non-contestant
// eventBadges (OFFICIAL/COUNTRY_REP, STAFF, MEDIA, ...) who have no
// eventBadgeResults row — there's no exam score/award to cite, so this isn't
// a variant Award tier in that file's CERTIFICATE_TIERS map, just a separate
// "certificate of appreciation" template sharing the same paper, borders,
// branding and signature block. Kept standalone rather than parameterizing
// the shared file so the real award pipeline (tied to the Award enum and
// eventBadgeResults) is untouched by this one-off shape.
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
const YUAN_CJK = assetDataUri(CERT_DIR, "yuan-shihai-cjk.png", "image/png");

Font.registerHyphenationCallback((word) => [word]);

function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

const EVENT_DATES = "18–24 August 2026";

const INK = "#1d2b38";
const TITLE_INK = "#16232f";
const BODY_INK = "#46525e";
const LABEL_MUTED = "#93917f";
const SERIAL_MUTED = "#a6a294";
const LINE_INK = "#2c3a47";
const PAGE_BG = "#fdfcf8";

// Navy + gold, distinct from the gold/silver/bronze/participation award
// colors in certificate-pdf.tsx, so an appreciation certificate is never
// mistaken for a medal tier at a glance.
const ACCENT = "#c9a227";
const DEEP = "#16232f";
const FRAME = "#3a5878";
const GLOW_A = "#3d6ea5";
const SEAL_STOPS: [string, string, string, string] = [
  "#8ea6c2",
  "#4d6a8c",
  "#2c4a6e",
  "#16232f",
];

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
    borderColor: FRAME,
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
    backgroundColor: ACCENT,
  },
  accentTickBottom: {
    position: "absolute",
    bottom: "0.22in",
    left: "50%",
    marginLeft: "-0.275in",
    width: "0.55in",
    height: "0.09in",
    backgroundColor: ACCENT,
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
  rankLine: { width: "0.85in", height: 1, backgroundColor: DEEP },
  rankText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4.1,
    color: DEEP,
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
    color: DEEP,
  },
  nameRule: {
    width: "3.4in",
    height: 1,
    marginTop: "0.08in",
    backgroundColor: ACCENT,
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
  roleLine: {
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
  color,
  size,
  top,
  left,
}: {
  color: string;
  size: string;
  top: string;
  left: string;
}) {
  return (
    <View style={{ position: "absolute", width: size, height: size, top, left }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="55%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={50} fill="url(#glow)" />
      </Svg>
    </View>
  );
}

// Same single-Svg-gradient-plus-text constraint as certificate-pdf.tsx's Seal
// — see that file's comment. Top/middle/bottom text is fixed here (not
// tier-parameterized) since this template has exactly one variant.
function AppreciationSeal() {
  return (
    <View style={styles.sealWrap}>
      <Svg width="100%" height="100%" viewBox="0 0 93.6 93.6">
        <Defs>
          <RadialGradient id="seal-appreciation" cx="34%" cy="24%" r="85%">
            <Stop offset="0%" stopColor={SEAL_STOPS[0]} />
            <Stop offset="38%" stopColor={SEAL_STOPS[1]} />
            <Stop offset="72%" stopColor={SEAL_STOPS[2]} />
            <Stop offset="100%" stopColor={SEAL_STOPS[3]} />
          </RadialGradient>
        </Defs>
        <Circle cx={46.8} cy={46.8} r={46.8} fill="url(#seal-appreciation)" />
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
          {...({ fontSize: 6.5, fontFamily: "Helvetica-Bold" } as unknown as Record<string, unknown>)}
        >
          G.A.T.E.
        </Text>
        <Text
          x={46.8}
          y={51}
          fill="#e9c766"
          textAnchor="middle"
          {...({ fontSize: 13, fontFamily: "Helvetica-Bold" } as unknown as Record<string, unknown>)}
        >
          HONOR
        </Text>
        <Text
          x={46.8}
          y={62}
          fill="#ffffff"
          textAnchor="middle"
          {...({ fontSize: 6, fontFamily: "Helvetica" } as unknown as Record<string, unknown>)}
        >
          CHINA CAMP 2026
        </Text>
      </Svg>
    </View>
  );
}

// Mirrors certificateSerial() in components/badges/certificate-pdf.tsx — same
// "prefix-year-padded id" shape, distinct "AC" prefix so an appreciation
// certificate's serial is never confused with a medal certificate's. Lives
// here (not lib/badges/appreciations.ts) because it's a pure formatter, not a
// DB call — that file is "server-only" and this one also needs to run from
// scripts/generate-appreciation-certificate.ts, a plain Node script.
export function appreciationCertificateSerial(id: number): string {
  return `AC-2026-${String(id).padStart(4, "0")}`;
}

export interface AppreciationCertificateData {
  fullName: string;
  country: string;
  roleLabel: string; // e.g. "Country Representative"
  badgeCode: string; // eventBadges.cardNo, e.g. "TJK-R-001"
  serial: string;
  qrDataUrl: string;
}

export function AppreciationCertificatePage({
  fullName,
  country,
  roleLabel,
  badgeCode,
  serial,
  qrDataUrl,
}: AppreciationCertificateData) {
  const displayName = toTitleCase(fullName);

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <GlowCircle color={GLOW_A} size="4in" top="-1.4in" left="-1.1in" />

      <View style={styles.outerBorder} />
      <View style={styles.innerBorder} />
      <View style={styles.accentTickTop} />
      <View style={styles.accentTickBottom} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.verifyBlock}>
            <View style={styles.qrBox}>
              <Image src={qrDataUrl} style={styles.qrImage} />
            </View>
            <View>
              <Text style={styles.verifyLabel}>VERIFY AT</Text>
              <Text style={styles.verifyMono}>gate-assessment.org</Text>
              <Text style={styles.verifyMono}>/verify/{badgeCode}</Text>
              <Text style={styles.verifySerial}>{serial}</Text>
            </View>
          </View>

          <Image src={GATE_LOGO} style={styles.gateLogo} />
          <Image src={EDSQUARE_LOGO} style={styles.edsquareLogo} />
        </View>

        <View style={styles.middle}>
          <View style={styles.rankRow}>
            <View style={styles.rankLine} />
            <Text style={styles.rankText}>APPRECIATION</Text>
            <View style={styles.rankLine} />
          </View>

          <Text style={styles.certTitle}>CERTIFICATE</Text>
          <Text style={styles.presented}>PROUDLY PRESENTED TO</Text>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.countryLine}>FROM {country.toUpperCase()}</Text>
          <View style={styles.nameRule} />

          <Text style={styles.citation}>
            in recognition of distinguished service and valuable contribution as{" "}
            <Text style={styles.citationStrong}>{roleLabel} for {country}</Text> at the GATE
            China Camp 2026, held at{" "}
            <Text style={styles.citationStrong}>Xidian University, Hangzhou Research Institute</Text>.
          </Text>

          <Text style={styles.roleLine}>{EVENT_DATES}</Text>
          <Text style={[styles.roleLine, { paddingTop: "0.07in" }]}>
            {roleLabel.toUpperCase()}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.signatureCol}>
            <Image src={SIG_AYKUT} style={styles.sigImageLeft} />
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>Aykut Argun</Text>
            <Text style={styles.sigTitle}>HEAD OF ACADEMIC BOARD</Text>
          </View>

          <AppreciationSeal />

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

export function AppreciationCertificatePDF(props: AppreciationCertificateData) {
  return (
    <Document>
      <AppreciationCertificatePage {...props} />
    </Document>
  );
}
