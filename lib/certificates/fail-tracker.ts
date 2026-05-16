import "server-only";

const FAIL_WINDOW_MS = 10 * 60 * 1000;
const FAIL_THRESHOLD = 5;

const store = new Map<string, { count: number; firstAt: number }>();

export function recordFailure(key: string): { needsCaptcha: boolean } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.firstAt > FAIL_WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now });
    return { needsCaptcha: false };
  }
  entry.count += 1;
  return { needsCaptcha: entry.count >= FAIL_THRESHOLD };
}

export function clearFailures(key: string): void {
  store.delete(key);
}

export function needsCaptcha(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > FAIL_WINDOW_MS) {
    store.delete(key);
    return false;
  }
  return entry.count >= FAIL_THRESHOLD;
}

export { verifyTurnstileToken } from "@/lib/turnstile";
