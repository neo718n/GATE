import { Document, Page, StyleSheet, View } from "@react-pdf/renderer";
import { BadgeCard, type BadgeCardData } from "./badge-card-pdf";

const CARDS_PER_ROW = 3;
const ROWS_PER_PAGE = 3;
const CARDS_PER_PAGE = CARDS_PER_ROW * ROWS_PER_PAGE;

const styles = StyleSheet.create({
  page: {
    padding: "12mm",
  },
  sheet: {
    flexDirection: "column",
    rowGap: "9mm",
  },
  row: {
    flexDirection: "row",
    columnGap: "12mm",
  },
});

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export function BadgeSheetPDF({ badges }: { badges: BadgeCardData[] }) {
  const pages = chunk(badges, CARDS_PER_PAGE);

  return (
    <Document>
      {pages.map((pageBadges, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.sheet}>
            {chunk(pageBadges, CARDS_PER_ROW).map((rowBadges, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {rowBadges.map((badge) => (
                  <BadgeCard key={badge.cardNo} badge={badge} />
                ))}
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
