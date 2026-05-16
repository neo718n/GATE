import { describe, expect, it } from "vitest";
import {
  CODE_SHAPE,
  CROCKFORD_ALPHABET,
  formatCode,
  generateCode,
  generateCodeTail,
  isValidCodeShape,
  subjectSlugToCode,
} from "@/lib/certificates/code";

describe("code generation", () => {
  it("uses Crockford alphabet without I/L/O/U", () => {
    expect(CROCKFORD_ALPHABET).toBe("0123456789ABCDEFGHJKMNPQRSTVWXYZ");
    expect(CROCKFORD_ALPHABET).not.toContain("I");
    expect(CROCKFORD_ALPHABET).not.toContain("L");
    expect(CROCKFORD_ALPHABET).not.toContain("O");
    expect(CROCKFORD_ALPHABET).not.toContain("U");
  });

  it("generateCodeTail produces 6 chars from the alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const t = generateCodeTail();
      expect(t).toHaveLength(6);
      for (const ch of t) {
        expect(CROCKFORD_ALPHABET).toContain(ch);
      }
    }
  });

  it("generateCode matches the shape regex over many runs", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode(2026, "math");
      expect(CODE_SHAPE.test(code)).toBe(true);
      expect(code.startsWith("GATE-2026-MATH-")).toBe(true);
    }
  });

  it("subjectSlugToCode strips non-alphanumerics and uppercases", () => {
    expect(subjectSlugToCode("math")).toBe("MATH");
    expect(subjectSlugToCode("computer-science")).toBe("COMPUTERSCIE");
    expect(subjectSlugToCode("physics 2")).toBe("PHYSICS2");
  });
});

describe("formatCode (paste-friendly auto-format)", () => {
  it("uppercases and removes whitespace", () => {
    expect(formatCode("gate 2026 math a7k9x2")).toBe("GATE-2026-MATH-A7K9X2");
  });

  it("folds I→1, L→1, O→0, U→V (Crockford humanization)", () => {
    expect(formatCode("GATE-2026-MATH-I1L0OU")).toBe("GATE-2026-MATH-11100V");
  });

  it("handles already-formatted codes idempotently", () => {
    const code = "GATE-2026-MATH-A7K9X2";
    expect(formatCode(code)).toBe(code);
    expect(formatCode(formatCode(code))).toBe(code);
  });

  it("ignores hyphens and punctuation on paste", () => {
    expect(formatCode("GATE--2026-MATH-A7K9X2")).toBe("GATE-2026-MATH-A7K9X2");
    expect(formatCode("GATE.2026.MATH.A7K9X2")).toBe("GATE-2026-MATH-A7K9X2");
  });
});

describe("isValidCodeShape", () => {
  it("accepts well-formed codes", () => {
    expect(isValidCodeShape("GATE-2026-MATH-A7K9X2")).toBe(true);
    expect(isValidCodeShape("GATE-2027-PHYS-Z2N4P9")).toBe(true);
    expect(isValidCodeShape("GATE-2026-CS-A1B2C3")).toBe(true);
  });

  it("rejects malformed codes", () => {
    expect(isValidCodeShape("gate-2026-math-a7k9x2")).toBe(false);
    expect(isValidCodeShape("GATE-26-MATH-A7K9X2")).toBe(false);
    expect(isValidCodeShape("GATE-2026-MATH-A7K9X")).toBe(false);
    expect(isValidCodeShape("GATE-2026-MATH-IOLU12")).toBe(false);
    expect(isValidCodeShape("")).toBe(false);
  });
});
