import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a2e" },
  header: { marginBottom: 32 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  section: { marginBottom: 20 },
  label: { fontSize: 9, color: "#888", textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 11 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  bold: { fontFamily: "Helvetica-Bold" },
  total: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4 },
  gold: { color: "#b8860b" },
  footer: { position: "absolute", bottom: 36, left: 48, right: 48, fontSize: 9, color: "#aaa", textAlign: "center" },
});

interface InvoiceProps {
  invoiceNumber: string;
  issuedAt: string;
  participant: { name: string; email: string; country: string };
  cycle: string;
  round?: string;
  amountUsd: number;
  status: string;
}

export function InvoicePDF({ invoiceNumber, issuedAt, participant, cycle, round, amountUsd, status }: InvoiceProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>G.A.T.E.</Text>
          <Text style={styles.subtitle}>Global Assessment & Testing for Excellence</Text>
          <Text style={[styles.subtitle, { marginTop: 2 }]}>gate-assessment.org</Text>
        </View>

        <View style={[styles.section, { flexDirection: "row", justifyContent: "space-between" }]}>
          <View>
            <Text style={styles.label}>Invoice To</Text>
            <Text style={styles.value}>{participant.name}</Text>
            <Text style={[styles.value, { color: "#666" }]}>{participant.email}</Text>
            <Text style={[styles.value, { color: "#666" }]}>{participant.country}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={[styles.value, styles.bold]}>{invoiceNumber}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Date Issued</Text>
            <Text style={styles.value}>{issuedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: "#eee" }]}>
            <Text style={[styles.value, styles.bold]}>Description</Text>
            <Text style={[styles.value, styles.bold]}>Amount</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.value}>Registration Fee — {cycle}</Text>
              {round && <Text style={[styles.value, { color: "#666", fontSize: 10 }]}>{round}</Text>}
            </View>
            <Text style={styles.value}>${amountUsd} USD</Text>
          </View>
          <View style={styles.total}>
            <Text style={[styles.value, styles.bold, styles.gold]}>Total</Text>
            <Text style={[styles.value, styles.bold, styles.gold]}>${amountUsd} USD</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment Status</Text>
          <Text style={[styles.value, styles.bold, { color: status === "paid" ? "#166534" : "#92400e" }]}>
            {status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.footer}>
          This is an official invoice from G.A.T.E. Assessment. For queries contact support@gate-assessment.org
        </Text>
      </Page>
    </Document>
  );
}
