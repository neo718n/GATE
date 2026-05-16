import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

interface CertificatePDFProps {
  participantName: string;
  subjectName: string;
  awardLabel: string;
  cycleYear: number;
  issuedAtIso: string;
  verificationCode: string;
  qrDataUrl: string;
  verifyUrl: string;
}

const GATE_NAVY = "#0b1f3a";
const GATE_DEEP = "#060f1c";
const GATE_GOLD = "#c9993a";
const GATE_GOLD_LIGHT = "#e8c060";
const GATE_PAPER = "#fafbfc";
const TEXT_MUTED = "#5e6b7c";

const styles = StyleSheet.create({
  page: {
    backgroundColor: GATE_PAPER,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    color: GATE_NAVY,
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: GATE_NAVY,
    padding: 32,
    position: "relative",
  },
  innerFrame: {
    position: "absolute",
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderWidth: 0.5,
    borderColor: GATE_GOLD,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: {
    fontSize: 11,
    letterSpacing: 4,
    color: GATE_GOLD,
    fontFamily: "Helvetica-Bold",
  },
  authority: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  divider: {
    height: 0.5,
    backgroundColor: GATE_GOLD,
    marginVertical: 16,
  },
  title: {
    fontSize: 12,
    color: TEXT_MUTED,
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 4,
  },
  certTitle: {
    fontSize: 36,
    fontFamily: "Times-Roman",
    color: GATE_NAVY,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  presented: {
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  participantName: {
    fontSize: 32,
    fontFamily: "Times-Bold",
    color: GATE_NAVY,
    textAlign: "center",
    marginBottom: 12,
  },
  underline: {
    height: 0.5,
    backgroundColor: GATE_NAVY,
    width: 280,
    marginHorizontal: "auto",
    marginBottom: 16,
  },
  body: {
    fontSize: 12,
    color: GATE_NAVY,
    textAlign: "center",
    lineHeight: 1.6,
    marginHorizontal: 40,
    marginVertical: 12,
  },
  awardBlock: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    gap: 32,
  },
  awardCol: {
    alignItems: "center",
  },
  awardLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  awardValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: GATE_NAVY,
  },
  goldValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: GATE_GOLD,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 32,
    right: 32,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  signatureCol: {
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: 200,
  },
  signatureLine: {
    height: 0.5,
    backgroundColor: GATE_NAVY,
    width: 160,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  qrCol: {
    flexDirection: "column",
    alignItems: "center",
  },
  qrImage: {
    width: 70,
    height: 70,
  },
  qrCode: {
    marginTop: 4,
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: GATE_NAVY,
    letterSpacing: 0.5,
  },
  qrCaption: {
    marginTop: 1,
    fontSize: 6,
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  cornerOrnament: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: GATE_GOLD,
  },
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CertificatePDF({
  participantName,
  subjectName,
  awardLabel,
  cycleYear,
  issuedAtIso,
  verificationCode,
  qrDataUrl,
  verifyUrl,
}: CertificatePDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.innerFrame} />

          <View style={styles.header}>
            <Text style={styles.brand}>G · A · T · E</Text>
            <Text style={styles.authority}>
              Assessment Authority · {cycleYear}
            </Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.title}>Certificate of Achievement</Text>
          <Text style={styles.certTitle}>Distinction in {subjectName}</Text>

          <Text style={styles.presented}>This is to certify that</Text>
          <Text style={styles.participantName}>{participantName}</Text>
          <View style={styles.underline} />

          <Text style={styles.body}>
            has successfully completed the G.A.T.E. {cycleYear} Assessment
            Programme in {subjectName} and is hereby recognised with the
            distinction noted below.
          </Text>

          <View style={styles.awardBlock}>
            <View style={styles.awardCol}>
              <Text style={styles.awardLabel}>Award</Text>
              <Text style={styles.goldValue}>{awardLabel}</Text>
            </View>
            <View style={styles.awardCol}>
              <Text style={styles.awardLabel}>Cycle</Text>
              <Text style={styles.awardValue}>{cycleYear}</Text>
            </View>
            <View style={styles.awardCol}>
              <Text style={styles.awardLabel}>Issued</Text>
              <Text style={styles.awardValue}>{formatDate(issuedAtIso)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.signatureCol}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>
                Director, G.A.T.E. Assessment Authority
              </Text>
            </View>
            <View style={styles.qrCol}>
              {qrDataUrl ? (
                <Image src={qrDataUrl} style={styles.qrImage} />
              ) : null}
              <Text style={styles.qrCode}>{verificationCode}</Text>
              <Text style={styles.qrCaption}>
                Verify at {verifyUrl.replace(/^https?:\/\//, "")}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
