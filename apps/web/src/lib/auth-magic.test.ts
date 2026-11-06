/**
 * Unit tests for the magic-link client gate (no network, no imports of the
 * Neon Auth SDK). The unconfigured-backend path is behaviorally asserted in
 * code review and by CI typecheck; the pure gate lives here.
 */
import { describe, expect, it } from "vitest";
import { validateEmail } from "./auth-magic";

describe("validateEmail", () => {
  it("accepts ordinary addresses and normalizes case/whitespace", () => {
    expect(validateEmail("  Ash.Dev@Example.COM ")).toBe("ash.dev@example.com");
    expect(validateEmail("a+tag@sub.domain.io")).toBe("a+tag@sub.domain.io");
  });

  it("rejects empty and malformed input", () => {
    expect(validateEmail("")).toBeNull();
    expect(validateEmail("   ")).toBeNull();
    expect(validateEmail("not-an-email")).toBeNull();
    expect(validateEmail("missing@tld")).toBeNull();
    expect(validateEmail("two@@at.com")).toBeNull();
  });
});
