import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const GOLD = "#c9993a";
const DARK = "#111111";
const MUTED = "#666666";
const BORDER = "#cccccc";
const LIGHT = "#f5f5f5";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: DARK, backgroundColor: "#ffffff" },
  topBar: { backgroundColor: GOLD, height: 5 },
  body: { padding: "28 44 70 44" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  brandName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK, letterSpacing: 2 },
  brandSub: { fontSize: 7, color: MUTED, marginTop: 3 },
  brandSite: { fontSize: 7, color: GOLD, marginTop: 1 },
  invoiceTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right" },
  invoiceSubtitle: { fontSize: 8, color: MUTED, textAlign: "right", marginTop: 2 },

  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 20 },

  topSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },

  recipientBlock: { flex: 1, paddingRight: 20 },
  recipientLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  recipientName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 3 },
  recipientLine: { fontSize: 9, color: MUTED, marginBottom: 2 },

  metaBox: { width: 200, borderWidth: 1, borderColor: BORDER },
  metaRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  metaRowLast: { flexDirection: "row" },
  metaKey: { flex: 1, fontSize: 8, color: MUTED, padding: "7 10", borderRightWidth: 1, borderRightColor: BORDER },
  metaVal: { flex: 1.2, fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, padding: "7 10" },

  soldByBlock: { borderWidth: 1, borderColor: BORDER, padding: "10 14", marginBottom: 24 },
  soldByLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  soldByName: { fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK },
  soldByLine: { fontSize: 8, color: MUTED, marginTop: 1 },

  table: { borderWidth: 1, borderColor: BORDER, marginBottom: 0 },
  tableHead: { flexDirection: "row", backgroundColor: LIGHT, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: "row" },

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
  tdSubItalic: { fontSize: 7, color: GOLD, marginTop: 2, fontFamily: "Helvetica-Oblique" },

  totalsSection: { flexDirection: "row", justifyContent: "flex-end", marginTop: 0 },
  totalsBox: { width: 280, borderWidth: 1, borderTopWidth: 0, borderColor: BORDER },
  totRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  totRowLast: { flexDirection: "row", backgroundColor: DARK },
  totKey: { flex: 1, fontSize: 8, color: MUTED, padding: "6 10", borderRightWidth: 1, borderRightColor: BORDER },
  totVal: { width: 72, fontSize: 8, color: DARK, textAlign: "right", padding: "6 8" },
  totKeyBold: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", padding: "8 10", borderRightWidth: 1, borderRightColor: "#444" },
  totValBold: { width: 72, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right", padding: "8 8" },

  noticeSection: { marginTop: 24, borderWidth: 1, borderColor: BORDER, padding: "12 16", flexDirection: "row", alignItems: "center" },
  noticeText: { fontSize: 9, color: DARK, flex: 1 },
  noticeBold: { fontFamily: "Helvetica-Bold" },
  paidStamp: { borderWidth: 2, borderColor: "#166534", paddingHorizontal: 10, paddingVertical: 5, marginLeft: 16 },
  paidText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#166534", letterSpacing: 1 },
  pendingStamp: { borderWidth: 2, borderColor: "#92400e", paddingHorizontal: 10, paddingVertical: 5, marginLeft: 16 },
  pendingText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#92400e", letterSpacing: 1 },

  footer: {
    position: "absolute", bottom: 18, left: 44, right: 44,
    borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8,
    flexDirection: "column", gap: 3,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7.5, color: MUTED },
  footerGold: { fontSize: 7.5, color: GOLD },
  footerOperator: { fontSize: 6.5, color: MUTED, textAlign: "center", marginTop: 2 },
});

interface InvoiceProps {
  invoiceNumber: string;
  issuedAt: string;
  participant: { name: string; email: string; country: string };
  cycle: string;
  round?: string;
  programDates?: string;
  subject?: string;
  venue?: string;
  isCamp?: boolean;
  amountCents: number;
  status: string;
}

export function InvoicePDF({
  invoiceNumber, issuedAt, participant, cycle, round,
  programDates, subject, venue, isCamp,
  amountCents, status,
}: InvoiceProps) {
  const amount = `$${(amountCents / 100).toFixed(2)}`;
  const isPaid = status === "paid";

  const programLine = round ?? "Registration Fee";
  const metaParts = [cycle];
  if (programDates) metaParts.push(programDates);
  if (subject) metaParts.push(`Subject: ${subject}`);
  if (venue && isCamp) metaParts.push(venue);
  const programSub = metaParts.join(" · ");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.topBar} />

        <View style={s.body}>
          <View style={s.header}>
            <View>
              <Text style={s.brandName}>G.A.T.E.</Text>
              <Text style={s.brandSub}>International Academic Programs</Text>
              <Text style={s.brandSite}>gate-assessment.org</Text>
            </View>
            <View>
              <Text style={s.invoiceTitle}>Invoice</Text>
              <Text style={s.invoiceSubtitle}>OFFICIAL TAX DOCUMENT</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.topSection}>
            <View style={s.recipientBlock}>
              <Text style={s.recipientLabel}>Bill To</Text>
              <Text style={s.recipientName}>{participant.name}</Text>
              <Text style={s.recipientLine}>{participant.email}</Text>
              <Text style={s.recipientLine}>{participant.country}</Text>
            </View>

            <View style={s.metaBox}>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Invoice No.</Text>
                <Text style={s.metaVal}>{invoiceNumber}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Date</Text>
                <Text style={s.metaVal}>{issuedAt}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Currency</Text>
                <Text style={s.metaVal}>USD</Text>
              </View>
              <View style={s.metaRowLast}>
                <Text style={s.metaKey}>Amount Due</Text>
                <Text style={s.metaVal}>{amount}</Text>
              </View>
            </View>
          </View>

          <View style={s.soldByBlock}>
            <Text style={s.soldByLabel}>Sold By</Text>
            <Text style={s.soldByName}>Chongqing Xinshijie Technology Service Co., LTD</Text>
            <Text style={s.soldByLine}>support@gate-assessment.org</Text>
            <Text style={s.soldByLine}>gate-assessment.org</Text>
          </View>

          <View style={s.table}>
            <View style={s.tableHead}>
              <View style={s.thItem}><Text style={s.th}>#</Text></View>
              <View style={s.thDesc}><Text style={s.th}>Description</Text></View>
              <View style={s.thQty}><Text style={[s.th, { textAlign: "right" }]}>Qty</Text></View>
              <View style={s.thUnit}><Text style={s.thRight}>Unit Price</Text></View>
              <View style={s.thTotal}><Text style={s.thRight}>Total (USD)</Text></View>
            </View>

            <View style={s.tableRowLast}>
              <View style={s.tdItem}><Text style={s.td}>1</Text></View>
              <View style={s.tdDesc}>
                <Text style={s.td}>{programLine}</Text>
                <Text style={s.tdSub}>{programSub}</Text>
                {isCamp && (
                  <Text style={s.tdSubItalic}>
                    All-inclusive: dormitory, three meals daily, lectures, cultural program.
                  </Text>
                )}
              </View>
              <View style={s.tdQty}><Text style={[s.td, { textAlign: "right" }]}>1</Text></View>
              <View style={s.tdUnit}><Text style={s.tdRight}>{amount}</Text></View>
              <View style={s.tdTotal}><Text style={s.tdRight}>{amount}</Text></View>
            </View>
          </View>

          <View style={s.totalsSection}>
            <View style={s.totalsBox}>
              <View style={s.totRow}>
                <Text style={s.totKey}>Subtotal</Text>
                <Text style={s.totVal}>{amount}</Text>
              </View>
              <View style={s.totRowLast}>
                <Text style={s.totKeyBold}>Total Due (USD)</Text>
                <Text style={s.totValBold}>{amount}</Text>
              </View>
            </View>
          </View>

          <View style={s.noticeSection}>
            <Text style={s.noticeText}>
              {isPaid
                ? <Text>This invoice has been <Text style={s.noticeBold}>paid in full</Text>. Please retain this document for your records. Invoice reference: <Text style={s.noticeBold}>{invoiceNumber}</Text>.</Text>
                : "Payment is pending. Please complete the payment to confirm your registration."}
            </Text>
            <View style={isPaid ? s.paidStamp : s.pendingStamp}>
              <Text style={isPaid ? s.paidText : s.pendingText}>{status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={s.footer}>
          <View style={s.footerRow}>
            <Text style={s.footerText}>G.A.T.E. {"·"} International Academic Programs</Text>
            <Text style={s.footerGold}>support@gate-assessment.org</Text>
          </View>
          <Text style={s.footerOperator}>
            Operated by Chongqing Xinshijie Technology Service Co., LTD
          </Text>
        </View>
      </Page>
    </Document>
  );
}
