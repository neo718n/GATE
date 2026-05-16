import { describe, expect, it } from "vitest";
import {
  clearFailures,
  needsCaptcha,
  recordFailure,
  verifyTurnstileToken,
} from "@/lib/certificates/fail-tracker";

describe("fail tracker", () => {
  it("does not require captcha after a single failure", () => {
    const key = `t-${Math.random()}`;
    expect(recordFailure(key).needsCaptcha).toBe(false);
    expect(needsCaptcha(key)).toBe(false);
  });

  it("triggers captcha after 5 failures within window", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 4; i++) {
      expect(recordFailure(key).needsCaptcha).toBe(false);
    }
    expect(recordFailure(key).needsCaptcha).toBe(true);
    expect(needsCaptcha(key)).toBe(true);
  });

  it("clearFailures resets the counter", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(needsCaptcha(key)).toBe(true);
    clearFailures(key);
    expect(needsCaptcha(key)).toBe(false);
  });
});

describe("verifyTurnstileToken (no secret configured = dev mode)", () => {
  it("returns true when TURNSTILE_SECRET_KEY is unset", async () => {
    const prev = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstileToken("anything")).resolves.toBe(true);
    await expect(verifyTurnstileToken(null)).resolves.toBe(true);
    if (prev) process.env.TURNSTILE_SECRET_KEY = prev;
  });
});
