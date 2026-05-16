import { describe, expect, it } from "vitest";
import { sanitizeCertificate } from "@/lib/certificates/lookup";
import type { Certificate } from "@/lib/db/schema";

function fakeRow(overrides: Partial<Certificate> = {}): Certificate {
  return {
    id: 1,
    resultId: 42,
    verificationCode: "GATE-2026-MATH-A7K9X2",
    codeHash: "deadbeefcafebabe",
    participantName: "Aliya Karimova",
    subjectName: "Mathematics",
    subjectCode: "MATH",
    award: "gold",
    scorePercentile: 92,
    cycleId: 1,
    cycleYear: 2026,
    pdfKey: "certificates/cert-1.pdf",
    issuedAt: new Date("2026-05-16T12:00:00Z"),
    revokedAt: null,
    revokedReason: null,
    ...overrides,
  } as Certificate;
}

describe("sanitizeCertificate", () => {
  it("returns ONLY public-safe fields", () => {
    const out = sanitizeCertificate(fakeRow());
    expect(Object.keys(out).sort()).toEqual(
      [
        "award",
        "cycleYear",
        "issuedAt",
        "participantName",
        "revokedAt",
        "scorePercentile",
        "subjectName",
        "verificationCode",
      ].sort(),
    );
  });

  it("never leaks internal fields (codeHash, pdfKey, resultId, revokedReason)", () => {
    const out = sanitizeCertificate(
      fakeRow({ revokedAt: new Date(), revokedReason: "Internal mistake" }),
    ) as unknown as Record<string, unknown>;
    expect(out.codeHash).toBeUndefined();
    expect(out.pdfKey).toBeUndefined();
    expect(out.resultId).toBeUndefined();
    expect(out.revokedReason).toBeUndefined();
    expect(out.id).toBeUndefined();
  });

  it("serializes dates as ISO strings", () => {
    const out = sanitizeCertificate(fakeRow());
    expect(typeof out.issuedAt).toBe("string");
    expect(out.issuedAt).toBe("2026-05-16T12:00:00.000Z");
  });

  it("includes revokedAt as ISO string when present", () => {
    const out = sanitizeCertificate(
      fakeRow({ revokedAt: new Date("2026-06-01T00:00:00Z") }),
    );
    expect(out.revokedAt).toBe("2026-06-01T00:00:00.000Z");
  });
});
