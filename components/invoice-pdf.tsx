import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const GOLD = "#c9993a";
const DARK = "#1a1a2e";
const MUTED = "#6b6b7a";
const LIGHT_BG = "#faf9f7";
const BORDER = "#e8e4de";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: DARK, backgroundColor: "#ffffff" },

  // Gold accent bar at top
  topBar: { backgroundColor: GOLD, height: 6 },

  body: { padding: "32 48 48 48" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  brandBlock: {},
  brandName: { fontSize: 22, fontFamily: "Helvetica-Bold", color: DARK, letterSpacing: 3 },
  brandTagline: { fontSize: 7.5, color: MUTED, marginTop: 3, letterSpacing: 1 },
  brandSite: { fontSize: 7.5, color: GOLD, marginTop: 1 },

  invoiceBadge: { backgroundColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  invoiceBadgeText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 2 },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 20 },

  // Meta row: Bill To + Invoice Details
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaBlock: { flex: 1 },
  metaRight: { flex: 1, alignItems: "flex-end" },
  metaLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: GOLD, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  metaName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  metaLine: { fontSize: 9, color: MUTED, marginBottom: 1 },
  metaValueRight: { fontSize: 9, color: DARK, textAlign: "right", marginBottom: 1 },
  metaLabelRight: { fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 1, textAlign: "right" },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: LIGHT_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 0,
  },
  tableHeaderText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1, textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  colDesc: { flex: 1 },
  colAmt: { width: 90, alignItems: "flex-end" },
  descPrimary: { fontSize: 10, color: DARK },
  descSecondary: { fontSize: 8.5, color: MUTED, marginTop: 2 },

  // Totals
  totalsArea: { marginTop: 0, paddingHorizontal: 12 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", paddingVertical: 4 },
  totalLabel: { fontSize: 9, color: MUTED, width: 120, textAlign: "right", marginRight: 16 },
  totalValue: { fontSize: 9, color: DARK, width: 90, textAlign: "right" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: GOLD,
    paddingHorizontal: 12,
  },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: GOLD, width: 120, textAlign: "right", marginRight: 16 },
  grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: GOLD, width: 90, textAlign: "right" },

  // Status stamp
  statusSection: { marginTop: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBlock: {},
  statusLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  statusPaid: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#166534", letterSpacing: 1 },
  statusPending: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#92400e", letterSpacing: 1 },
  statusBadgePaid: { borderWidth: 2, borderColor: "#166534", paddingHorizontal: 12, paddingVertical: 5 },
  statusBadgePending: { borderWidth: 2, borderColor: "#92400e", paddingHorizontal: 12, paddingVertical: 5 },

  noteBlock: { flex: 1, marginLeft: 24 },
  noteText: { fontSize: 8, color: MUTED, lineHeight: 1.5 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: MUTED },
  footerGold: { fontSize: 7.5, color: GOLD },
});

interface InvoiceProps {
  invoiceNumber: string;
  issuedAt: string;
  participant: { name: string; email: string; country: string };
  cycle: string;
  round?: string;
  amountCents: number;
  status: string;
}

export function InvoicePDF({
  invoiceNumber,
  issuedAt,
  participant,
  cycle,
  round,
  amountCents,
  status,
}: InvoiceProps) {
  const amount = (amountCents / 100).toFixed(2);
  const isPaid = status === "paid";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Gold top bar */}
        <View style={s.topBar} />

        <View style={s.body}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.brandBlock}>
              <Text style={s.brandName}>G.A.T.E.</Text>
              <Text style={s.brandTagline}>Global Assessment & Testing for Excellence</Text>
              <Text style={s.brandSite}>gate-assessment.org</Text>
            </View>
            <View style={s.invoiceBadge}>
              <Text style={s.invoiceBadgeText}>OFFICIAL INVOICE</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Bill To + Invoice Meta */}
          <View style={s.metaRow}>
            <View style={s.metaBlock}>
              <Text style={s.metaLabel}>Bill To</Text>
              <Text style={s.metaName}>{participant.name}</Text>
              <Text style={s.metaLine}>{participant.email}</Text>
              <Text style={s.metaLine}>{participant.country}</Text>
            </View>

            <View style={s.metaRight}>
              <Text style={s.metaLabelRight}>Invoice No.</Text>
              <Text style={[s.metaValueRight, { fontFamily: "Helvetica-Bold" }]}>{invoiceNumber}</Text>
              <Text style={[s.metaLabelRight, { marginTop: 8 }]}>Date Issued</Text>
              <Text style={s.metaValueRight}>{issuedAt}</Text>
              <Text style={[s.metaLabelRight, { marginTop: 8 }]}>Currency</Text>
              <Text style={s.metaValueRight}>USD</Text>
            </View>
          </View>

          {/* Line Items Table */}
          <View style={s.tableHeader}>
            <View style={s.colDesc}>
              <Text style={s.tableHeaderText}>Description</Text>
            </View>
            <View style={s.colAmt}>
              <Text style={[s.tableHeaderText, { textAlign: "right" }]}>Amount</Text>
            </View>
          </View>

          <View style={s.tableRow}>
            <View style={s.colDesc}>
              <Text style={s.descPrimary}>Registration Fee — {cycle}</Text>
              {round && <Text style={s.descSecondary}>{round}</Text>}
            </View>
            <View style={s.colAmt}>
              <Text style={[s.descPrimary, { textAlign: "right" }]}>${amount}</Text>
            </View>
          </View>

          {/* Totals */}
          <View style={s.totalsArea}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>${amount}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax / VAT</Text>
              <Text style={s.totalValue}>$0.00</Text>
            </View>
          </View>
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>Total Due</Text>
            <Text style={s.grandValue}>${amount}</Text>
          </View>

          {/* Status + Note */}
          <View style={s.statusSection}>
            <View style={isPaid ? s.statusBadgePaid : s.statusBadgePending}>
              <Text style={isPaid ? s.statusPaid : s.statusPending}>
                {status.toUpperCase()}
              </Text>
            </View>
            <View style={s.noteBlock}>
              <Text style={s.noteText}>
                This is an official receipt issued by G.A.T.E. Assessment upon confirmation of payment.
                Please retain this document for your records.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>G.A.T.E. Assessment · Olympiad Management Platform</Text>
          <Text style={s.footerGold}>support@gate-assessment.org</Text>
        </View>
      </Page>
    </Document>
  );
}
