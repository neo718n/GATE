import { beforeAll, describe, expect, it } from "vitest";
import { hashCode, verifyCodeHash } from "@/lib/certificates/hmac";

beforeAll(() => {
  process.env.CERT_HMAC_SECRET =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
});

describe("hashCode", () => {
  it("is deterministic for the same input and secret", () => {
    const a = hashCode("GATE-2026-MATH-A7K9X2");
    const b = hashCode("GATE-2026-MATH-A7K9X2");
    expect(a).toBe(b);
  });

  it("produces 16 hex chars (64-bit prefix)", () => {
    const h = hashCode("GATE-2026-MATH-A7K9X2");
    expect(h).toHaveLength(16);
    expect(/^[0-9a-f]{16}$/.test(h)).toBe(true);
  });

  it("changes if a single character of input changes", () => {
    const a = hashCode("GATE-2026-MATH-A7K9X2");
    const b = hashCode("GATE-2026-MATH-A7K9X3");
    expect(a).not.toBe(b);
  });
});

describe("verifyCodeHash", () => {
  it("returns true for matching hash", () => {
    const code = "GATE-2026-MATH-A7K9X2";
    expect(verifyCodeHash(code, hashCode(code))).toBe(true);
  });

  it("returns false for mismatched hash", () => {
    expect(verifyCodeHash("GATE-2026-MATH-A7K9X2", "deadbeefdeadbeef")).toBe(
      false,
    );
  });

  it("returns false for different-length input", () => {
    expect(verifyCodeHash("GATE-2026-MATH-A7K9X2", "short")).toBe(false);
  });
});
