import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const ACCENT = "#c9993a";
const DARK = "#111111";
const MUTED = "#666666";
const BORDER = "#cccccc";
const LIGHT = "#f5f5f5";
const GREEN = "#166534";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: DARK, backgroundColor: "#ffffff" },
  topBar: { backgroundColor: ACCENT, height: 5 },
  body: { padding: "28 44 60 44" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  brandName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK, letterSpacing: 2 },
  brandSub: { fontSize: 7, color: MUTED, marginTop: 3 },
  brandSite: { fontSize: 7, color: ACCENT, marginTop: 1 },
  receiptTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right" },
  receiptSubtitle: { fontSize: 8, color: MUTED, textAlign: "right", marginTop: 2 },

  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 20 },

  // Two-column top section
  topSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },

  // Recipient (left)
  recipientBlock: { flex: 1, paddingRight: 20 },
  recipientLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  recipientName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 3 },
  recipientLine: { fontSize: 9, color: MUTED, marginBottom: 2 },

  // Meta box (right)
  metaBox: { width: 200, borderWidth: 1, borderColor: BORDER },
  metaRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  metaRowLast: { flexDirection: "row" },
  metaKey: { flex: 1, fontSize: 8, color: MUTED, padding: "7 10", borderRightWidth: 1, borderRightColor: BORDER },
  metaVal: { flex: 1.2, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, padding: "7 10" },

  // Payment details section
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },

  // Table
  table: { borderWidth: 1, borderColor: BORDER, marginBottom: 0 },
  tableHead: { flexDirection: "row", backgroundColor: LIGHT, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: "row" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },

  thItem: { width: 28, padding: "7 8", borderRightWidth: 1, borderRightColor: BORDER },
  thDesc: { flex: 1, padding: "7 10", borderRightWidth: 1, borderRightColor: BORDER },
  thQty: { width: 36, padding: "7 8", borderRightWidth: 1, borderRightColor: BORDER },
  thUnit: { width: 72, padding: "7 8", borderRightWidth: 1, borderRightColor: BORDER },
  thTotal: { width: 72, padding: "7 8" },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED },
  thRight: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, textAlign: "right" },

  tdItem: { width: 28, padding: "10 8", borderRightWidth: 1, borderRightColor: BORDER },
  tdDesc: { flex: 1, padding: "10 10", borderRightWidth: 1, borderRightColor: BORDER },
  tdQty: { width: 36, padding: "10 8", borderRightWidth: 1, borderRightColor: BORDER },
  tdUnit: { width: 72, padding: "10 8", borderRightWidth: 1, borderRightColor: BORDER },
  tdTotal: { width: 72, padding: "10 8" },
  td: { fontSize: 9, color: DARK },
  tdRight: { fontSize: 9, color: DARK, textAlign: "right" },
  tdSub: { fontSize: 7.5, color: MUTED, marginTop: 2 },

  // Totals
  totalsSection: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 24 },
  totalsBox: { width: 280, borderWidth: 1, borderTopWidth: 0, borderColor: BORDER },
  totRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  totRowLast: { flexDirection: "row", backgroundColor: DARK },
  totKey: { flex: 1, fontSize: 8, color: MUTED, padding: "6 10", borderRightWidth: 1, borderRightColor: BORDER },
  totVal: { width: 72, fontSize: 8, color: DARK, textAlign: "right", padding: "6 8" },
  totKeyBold: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", padding: "8 10", borderRightWidth: 1, borderRightColor: "#444" },
  totValBold: { width: 72, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right", padding: "8 8" },

  // Payment details box
  paymentBox: { borderWidth: 1, borderColor: BORDER, marginBottom: 20 },
  paymentBoxHead: { backgroundColor: LIGHT, padding: "7 12", borderBottomWidth: 1, borderBottomColor: BORDER },
  paymentBoxHeadText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1 },
  paymentRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  paymentRowLast: { flexDirection: "row" },
  paymentKey: { width: 140, fontSize: 8, color: MUTED, padding: "7 12", borderRightWidth: 1, borderRightColor: BORDER },
  paymentVal: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, padding: "7 12" },

  // Confirmation notice
  confirmBox: { borderWidth: 1, borderColor: GREEN, padding: "12 16", flexDirection: "row", alignItems: "center" },
  confirmText: { fontSize: 9, color: DARK, flex: 1 },
  confirmBold: { fontFamily: "Helvetica-Bold" },
  approvedStamp: { borderWidth: 2, borderColor: GREEN, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 16 },
  approvedText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: GREEN, letterSpacing: 1 },

  // Footer
  footer: {
    position: "absolute", bottom: 24, left: 44, right: 44,
    borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8,
    flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: MUTED },
  footerAccent: { fontSize: 7.5, color: ACCENT },
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

interface ReceiptProps {
  receiptNumber: string;
  paidAt: string;
  participant: { name: string; email: string; country: string };
  cycle: string;
  round?: string;
  amountCents: number;
  serviceFeeCents: number;
  cardLast4?: string | null;
  cardBrand?: string | null;
  stripeChargeId?: string | null;
  stripePaymentIntentId?: string | null;
}

export function ReceiptPDF({
  receiptNumber, paidAt, participant, cycle, round,
  amountCents, serviceFeeCents, cardLast4, cardBrand,
  stripeChargeId, stripePaymentIntentId,
}: ReceiptProps) {
  const registrationAmt = `$${((amountCents - serviceFeeCents) / 100).toFixed(2)}`;
  const serviceFeeAmt = `$${(serviceFeeCents / 100).toFixed(2)}`;
  const totalAmt = `$${(amountCents / 100).toFixed(2)}`;
  const cardDisplay = cardBrand && cardLast4
    ? `${capitalize(cardBrand)} **** **** **** ${cardLast4}`
    : "Card";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.topBar} />

        <View style={s.body}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.brandName}>G.A.T.E.</Text>
              <Text style={s.brandSub}>Global Assessment {"&"} Testing for Excellence</Text>
              <Text style={s.brandSite}>gate-assessment.org</Text>
            </View>
            <View>
              <Text style={s.receiptTitle}>Receipt</Text>
              <Text style={s.receiptSubtitle}>PAYMENT CONFIRMATION</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Recipient + Meta Box */}
          <View style={s.topSection}>
            <View style={s.recipientBlock}>
              <Text style={s.recipientLabel}>Received From</Text>
              <Text style={s.recipientName}>{participant.name}</Text>
              <Text style={s.recipientLine}>{participant.email}</Text>
              <Text style={s.recipientLine}>{participant.country}</Text>
            </View>

            <View style={s.metaBox}>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Receipt No.</Text>
                <Text style={s.metaVal}>{receiptNumber}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Date Paid</Text>
                <Text style={s.metaVal}>{paidAt}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Currency</Text>
                <Text style={s.metaVal}>USD</Text>
              </View>
              <View style={s.metaRowLast}>
                <Text style={s.metaKey}>Amount Paid</Text>
                <Text style={s.metaVal}>{totalAmt}</Text>
              </View>
            </View>
          </View>

          {/* Line Items Table */}
          <View style={s.table}>
            <View style={s.tableHead}>
              <View style={s.thItem}><Text style={s.th}>#</Text></View>
              <View style={s.thDesc}><Text style={s.th}>Description</Text></View>
              <View style={s.thQty}><Text style={[s.th, { textAlign: "right" }]}>Qty</Text></View>
              <View style={s.thUnit}><Text style={s.thRight}>Unit Price</Text></View>
              <View style={s.thTotal}><Text style={s.thRight}>Total (USD)</Text></View>
            </View>

            <View style={serviceFeeCents > 0 ? s.tableRow : s.tableRowLast}>
              <View style={s.tdItem}><Text style={s.td}>1</Text></View>
              <View style={s.tdDesc}>
                <Text style={s.td}>Registration Fee</Text>
                <Text style={s.tdSub}>{cycle}{round ? ` – ${round}` : ""}</Text>
              </View>
              <View style={s.tdQty}><Text style={[s.td, { textAlign: "right" }]}>1</Text></View>
              <View style={s.tdUnit}><Text style={s.tdRight}>{registrationAmt}</Text></View>
              <View style={s.tdTotal}><Text style={s.tdRight}>{registrationAmt}</Text></View>
            </View>

            {serviceFeeCents > 0 && (
              <View style={s.tableRowLast}>
                <View style={s.tdItem}><Text style={s.td}>2</Text></View>
                <View style={s.tdDesc}>
                  <Text style={s.td}>Service Fee</Text>
                  <Text style={s.tdSub}>Platform processing fee</Text>
                </View>
                <View style={s.tdQty}><Text style={[s.td, { textAlign: "right" }]}>1</Text></View>
                <View style={s.tdUnit}><Text style={s.tdRight}>{serviceFeeAmt}</Text></View>
                <View style={s.tdTotal}><Text style={s.tdRight}>{serviceFeeAmt}</Text></View>
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={s.totalsSection}>
            <View style={s.totalsBox}>
              {serviceFeeCents > 0 && (
                <View style={s.totRow}>
                  <Text style={s.totKey}>Subtotal</Text>
                  <Text style={s.totVal}>{registrationAmt}</Text>
                </View>
              )}
              {serviceFeeCents > 0 && (
                <View style={s.totRow}>
                  <Text style={s.totKey}>Service Fee</Text>
                  <Text style={s.totVal}>{serviceFeeAmt}</Text>
                </View>
              )}
              <View style={s.totRowLast}>
                <Text style={s.totKeyBold}>Total Paid (USD)</Text>
                <Text style={s.totValBold}>{totalAmt}</Text>
              </View>
            </View>
          </View>

          {/* Payment Details */}
          <View style={s.paymentBox}>
            <View style={s.paymentBoxHead}>
              <Text style={s.paymentBoxHeadText}>PAYMENT DETAILS</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentKey}>Payment Method</Text>
              <Text style={s.paymentVal}>{cardDisplay}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentKey}>Response</Text>
              <Text style={s.paymentVal}>0 – Approved</Text>
            </View>
            {stripeChargeId && (
              <View style={s.paymentRow}>
                <Text style={s.paymentKey}>Charge Reference</Text>
                <Text style={s.paymentVal}>{stripeChargeId}</Text>
              </View>
            )}
            {stripePaymentIntentId && (
              <View style={s.paymentRowLast}>
                <Text style={s.paymentKey}>Payment Intent</Text>
                <Text style={s.paymentVal}>{stripePaymentIntentId}</Text>
              </View>
            )}
            {!stripeChargeId && !stripePaymentIntentId && (
              <View style={s.paymentRowLast}>
                <Text style={s.paymentKey}>Processor</Text>
                <Text style={s.paymentVal}>Stripe</Text>
              </View>
            )}
          </View>

          {/* Confirmation */}
          <View style={s.confirmBox}>
            <Text style={s.confirmText}>
              Payment has been <Text style={s.confirmBold}>received and confirmed</Text>.
              {" "}This receipt is issued by G.A.T.E. Assessment upon successful payment.
              {" "}Reference: <Text style={s.confirmBold}>{receiptNumber}</Text>.
            </Text>
            <View style={s.approvedStamp}>
              <Text style={s.approvedText}>APPROVED</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>G.A.T.E. Assessment {"·"} Assessment Management Platform</Text>
          <Text style={s.footerAccent}>support@gate-assessment.org</Text>
        </View>
      </Page>
    </Document>
  );
}
