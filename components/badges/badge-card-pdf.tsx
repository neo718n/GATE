import fs from "fs";
import path from "path";
import type { ComponentProps } from "react";
import {
  Defs,
  Document,
  Font,
  Image,
  LinearGradient,
  Page,
  Rect,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { EventBadge } from "@/lib/db/schema";

const NAVY = "#0D1B36";
const MUTED = "#6B7488";
const MUTED_LIGHT = "#8FA0C0";
const HAIRLINE = "#E6E9F0";
const INK = "#33405C";

// Never break a name mid-word (react-pdf's default hyphenation did exactly
// that — "MUHAMMAD" became "MUHAM-" / "MAD" — which looks broken on a printed
// badge). A word that doesn't fit just overflows/wraps whole instead.
Font.registerHyphenationCallback((word) => [word]);

const ROLE_LABELS: Record<EventBadge["roleBadge"], string> = {
  CONTESTANT: "CONTESTANT",
  TEAM_LEADER: "TEAM LEADER",
  PARENT: "PARENT",
  COUNTRY_REP: "COUNTRY REP.",
  MEDIA: "MEDIA",
  STAFF: "STAFF",
};

const CATEGORY_LABELS: Record<EventBadge["category"], string> = {
  PARTICIPANT: "Participant",
  DELEGATION: "Delegation",
  GUEST: "Guest",
  OFFICIAL: "Official",
};

// Same two-stop gradients as the GATE Event Badge design spec
// (event_badge/GATE Event Badge.html) — CONTESTANT/TEAM_LEADER/PARENT/COUNTRY_REP
// values are copied directly from it; MEDIA/STAFF extend the same pattern since
// the spec never mocked those two up.
const ROLE_GRADIENTS: Record<EventBadge["roleBadge"], [string, string]> = {
  CONTESTANT: ["#0066FF", "#00C6FF"],
  TEAM_LEADER: ["#5B21B6", "#8B5CF6"],
  PARENT: ["#FFB800", "#FFD166"],
  COUNTRY_REP: ["#1E1E24", "#4A4A57"],
  MEDIA: ["#DC2626", "#F87171"],
  STAFF: ["#6B7280", "#9CA3AF"],
};

// PARENT's gold gradient is too light for white text (matches the spec, which
// uses dark text only on that one role's pill).
const ROLE_TEXT_ON_ACCENT: Record<EventBadge["roleBadge"], string> = {
  CONTESTANT: "#FFFFFF",
  TEAM_LEADER: "#FFFFFF",
  PARENT: "#1E1E24",
  COUNTRY_REP: "#FFFFFF",
  MEDIA: "#FFFFFF",
  STAFF: "#FFFFFF",
};

// Pill width can't be measured at style-time (Yoga doesn't expose text metrics
// before layout), and the gradient needs a known width up front — so each
// fixed role label gets a precomputed width generous enough at ~7.5pt
// Helvetica-Bold + letter-spacing.
const PILL_WIDTH_MM: Record<EventBadge["roleBadge"], number> = {
  CONTESTANT: 25,
  TEAM_LEADER: 27,
  PARENT: 17,
  COUNTRY_REP: 29,
  MEDIA: 15,
  STAFF: 15,
};
const PILL_HEIGHT_MM = 5;
const PILL_FONT_SIZE_MM = 2.65; // ~7.5pt

const CARD_WIDTH_MM = 54;
const STRIP_HEIGHT_MM = 2.5;

// react-pdf's built-in Helvetica font only covers WinAnsi (Latin) glyphs — it
// cannot render CJK ideographs, and no CJK font is bundled in this repo. Every
// other name in the dataset is already Latin-script; this is the one
// exception. This is a provisional pinyin rendering (Yuán Dàróng) — confirm
// the spelling with the badge holder before the sheet goes to print.
const PDF_NAME_OVERRIDES: Record<string, string> = {
  "CHN-S-001": "Yuan Darong",
};

export function pdfSafeName(cardNo: string, fullName: string): string {
  return PDF_NAME_OVERRIDES[cardNo] ?? fullName;
}

// Always uppercase. Font size is picked conservatively; anything that still
// doesn't fit wraps naturally at the word boundary (surname / given name)
// rather than being forced — hyphenation is disabled above so it never breaks
// mid-word.
function nameFontSize(name: string): number {
  if (name.length <= 13) return 13.5;
  if (name.length <= 20) return 11.5;
  return 10;
}

// @react-pdf/image's local-file resolver (getAbsoluteLocalPath) is broken on
// Windows in a way no string src can satisfy: it protocol-checks the src via
// Node's legacy url.parse() (which misreads a Windows drive letter like
// "C:\Users\..." as a URL *scheme* and rejects the whole path as non-local),
// but then calls path.resolve() on the ORIGINAL raw string regardless — so a
// "file://" URI passes the protocol check but produces a garbled resolved
// path instead (verified: both plain-path and file://-URI attempts failed,
// one silently with no image, the other with ENOENT). A raw Buffer works but
// has no cache key (getCacheKey returns null for buffers), so react-pdf
// re-embeds it on every one of the 55 cards instead of once (verified: 10MB
// PDF instead of ~300KB). A base64 data: URI sidesteps this resolver
// entirely (same code path already used for the QR images) and still caches
// correctly, since the cache key is the literal string.
// Also used directly (as /partners/*) by badge-result-card.tsx on the web
// verify page — one canonical copy instead of duplicating the files.
const ASSETS_DIR = path.join(process.cwd(), "public", "partners");
function assetDataUri(filename: string, mime: string): string {
  const bytes = fs.readFileSync(path.join(ASSETS_DIR, filename));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
const XIDIAN_LOGO = assetDataUri("xidian-university.png", "image/png");
const EDSQUARE_LOGO = assetDataUri("edsquare.jpg", "image/jpeg");
const GATE_MARK = assetDataUri("gate-mark.png", "image/png");

const styles = StyleSheet.create({
  card: {
    width: "54mm",
    height: "85mm",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  logoBand: {
    height: "10.5mm",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "3mm",
    paddingHorizontal: "3mm",
    backgroundColor: "#FBFBFD",
    borderBottomWidth: 0.75,
    borderBottomColor: HAIRLINE,
  },
  logoXidian: {
    height: "8mm",
    width: "7.9mm",
    objectFit: "contain",
  },
  logoDivider: {
    width: 0.75,
    height: "5.5mm",
    backgroundColor: HAIRLINE,
  },
  logoEdsquare: {
    height: "3.75mm",
    width: "14.7mm",
    objectFit: "contain",
  },
  brandBand: {
    height: "12.5mm",
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "3.5mm",
  },
  gateMark: {
    height: "8mm",
    width: "21.2mm",
    objectFit: "contain",
  },
  brandMeta: {
    fontSize: 6.5,
    color: MUTED_LIGHT,
    textAlign: "right",
    lineHeight: 1.5,
    letterSpacing: 0.6,
  },
  identity: {
    height: "32mm",
    paddingHorizontal: "3.5mm",
    paddingTop: "3mm",
  },
  eyebrow: {
    fontSize: 6.5,
    color: "#7D8698",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  name: {
    marginTop: 3,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    lineHeight: 1.12,
  },
  countryRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.75,
    borderTopColor: HAIRLINE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countryText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: INK,
    letterSpacing: 0.3,
  },
  cardNoSmall: {
    fontSize: 6.5,
    color: "#8A92A6",
    fontFamily: "Courier",
  },
  qrBlock: {
    height: "18.5mm",
    paddingHorizontal: "3.5mm",
    flexDirection: "row",
    alignItems: "center",
    gap: "3.5mm",
  },
  qrImage: {
    width: "14.5mm",
    height: "14.5mm",
  },
  qrCaption: {
    fontSize: 6.5,
    color: MUTED,
    lineHeight: 1.6,
    letterSpacing: 0.5,
  },
  qrCode: {
    fontSize: 7,
    fontFamily: "Courier-Bold",
    marginTop: 1,
  },
  footer: {
    height: "9mm",
    backgroundColor: NAVY,
    paddingHorizontal: "3.5mm",
    justifyContent: "center",
  },
  footerInstitution: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  footerVenue: {
    fontSize: 6,
    color: MUTED_LIGHT,
    letterSpacing: 1,
    marginTop: 2,
  },
});

// Both gradient shapes give the Svg an explicit viewBox so 1 unit == 1mm on
// both axes — without it, an <Svg width="Xmm" height="Ymm"> with no viewBox
// falls back to an implicit point-based coordinate space, which silently
// scales a Rect's raw numeric x/y/width/height/rx wrong on any axis whose
// mm-to-pt ratio differs, distorting rounded corners into a scalloped blob
// instead of a clean pill.

function GradientStrip({ id, colors }: { id: string; colors: [string, string] }) {
  return (
    <Svg
      width={`${CARD_WIDTH_MM}mm`}
      height={`${STRIP_HEIGHT_MM}mm`}
      viewBox={`0 0 ${CARD_WIDTH_MM} ${STRIP_HEIGHT_MM}`}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width={CARD_WIDTH_MM}
        height={STRIP_HEIGHT_MM}
        fill={`url(#${id})`}
      />
    </Svg>
  );
}

function GradientPill({
  id,
  label,
  colors,
  textColor,
  widthMm,
}: {
  id: string;
  label: string;
  colors: [string, string];
  textColor: string;
  widthMm: number;
}) {
  return (
    <Svg
      width={`${widthMm}mm`}
      height={`${PILL_HEIGHT_MM}mm`}
      viewBox={`0 0 ${widthMm} ${PILL_HEIGHT_MM}`}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width={widthMm}
        height={PILL_HEIGHT_MM}
        rx={PILL_HEIGHT_MM / 2}
        fill={`url(#${id})`}
      />
      {/* Text lives inside the same Svg/viewBox as the Rect — overlaying a
          separate absolutely-positioned Text here was unreliable (it never
          rendered), so the label is drawn directly in SVG space instead.
          `fontSize` is read at runtime for SVG Text (@react-pdf/render
          reads node.props.fontSize) but is missing from react-pdf's own
          SVGTextProps type — cast around that typing gap, not a real bug. */}
      <Text
        {...({
          x: widthMm / 2,
          y: PILL_HEIGHT_MM / 2,
          fill: textColor,
          fontSize: PILL_FONT_SIZE_MM,
          textAnchor: "middle",
          dominantBaseline: "central",
        } as unknown as ComponentProps<typeof Text>)}
      >
        {label}
      </Text>
    </Svg>
  );
}

export interface BadgeCardData {
  cardNo: string;
  fullName: string;
  category: EventBadge["category"];
  roleBadge: EventBadge["roleBadge"];
  country: string;
  badgeColorHex: string;
  qrDataUrl: string;
}

export function BadgeCard({ badge }: { badge: BadgeCardData }) {
  const printName = pdfSafeName(badge.cardNo, badge.fullName).toUpperCase();
  const gradient = ROLE_GRADIENTS[badge.roleBadge];

  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.logoBand}>
        <Image src={XIDIAN_LOGO} style={styles.logoXidian} />
        <View style={styles.logoDivider} />
        <Image src={EDSQUARE_LOGO} style={styles.logoEdsquare} />
      </View>

      <View style={styles.brandBand}>
        <Image src={GATE_MARK} style={styles.gateMark} />
        <Text style={styles.brandMeta}>2026{"\n"}HANGZHOU</Text>
      </View>

      <GradientStrip id={`strip-${badge.cardNo}`} colors={gradient} />

      <View style={styles.identity}>
        <Text style={styles.eyebrow}>{CATEGORY_LABELS[badge.category]}</Text>
        <Text style={[styles.name, { fontSize: nameFontSize(printName) }]}>
          {printName}
        </Text>
        <View style={{ marginTop: 7, alignSelf: "flex-start" }}>
          <GradientPill
            id={`pill-${badge.cardNo}`}
            label={ROLE_LABELS[badge.roleBadge]}
            colors={gradient}
            textColor={ROLE_TEXT_ON_ACCENT[badge.roleBadge]}
            widthMm={PILL_WIDTH_MM[badge.roleBadge]}
          />
        </View>
        <View style={styles.countryRow}>
          <Text style={styles.countryText}>{badge.country}</Text>
          <Text style={styles.cardNoSmall}>{badge.cardNo}</Text>
        </View>
      </View>

      <View style={styles.qrBlock}>
        <Image src={badge.qrDataUrl} style={styles.qrImage} />
        <View>
          <Text style={styles.qrCaption}>SCAN FOR{"\n"}VERIFICATION</Text>
          <Text style={[styles.qrCode, { color: gradient[0] }]}>
            {badge.cardNo}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerInstitution}>
          Hangzhou Institute of Technology
        </Text>
        <Text style={styles.footerVenue}>BUILDING B1</Text>
      </View>
    </View>
  );
}

export function BadgeCardPreviewDocument({ badge }: { badge: BadgeCardData }) {
  return (
    <Document>
      <Page size={{ width: "54mm", height: "85mm" }} style={{ padding: 0 }}>
        <BadgeCard badge={badge} />
      </Page>
    </Document>
  );
}
