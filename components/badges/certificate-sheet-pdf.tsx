import { Document } from "@react-pdf/renderer";
import { CertificatePage, type CertificateData } from "./certificate-pdf";

// One certificate per full A4 page (unlike BadgeSheetPDF's 9-per-page grid —
// certificates are handed out individually, so there's no grid to pack).
export function CertificateSheetPDF({ certificates }: { certificates: CertificateData[] }) {
  return (
    <Document>
      {certificates.map((cert) => (
        <CertificatePage key={`${cert.badgeCode}-${cert.subject}`} {...cert} />
      ))}
    </Document>
  );
}
