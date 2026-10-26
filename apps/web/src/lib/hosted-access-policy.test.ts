import { beforeEach, afterEach, describe, expect, it } from "vitest";
import {
  decideRateLimit,
  planCaps,
  resolveHostedKeys,
  secondsUntilWindowReset,
  clientIp,
  type HostedPlan,
} from "./hosted-access";
import { GEMINI_KEY_HEADER, CURSOR_KEY_HEADER } from "./byok";

function requestWith(headers: Record<string, string> = {}, body = "{}"): Request {
  return new Request("https://designproof.example/api/design", {
    method: "POST",
    headers,
    body,
  });
}

describe("planCaps", () => {
  it("Free has CEO interim hard caps and no BYOK", () => {
    expect(planCaps("free")).toMatchObject({
      userDailyCap: 10,
      ipDailyCap: 20,
      concurrency: 1,
      byokAllowed: false,
      dailyCap: 10,
    });
    // Maker/Studio numeric caps wait GTM — placeholders only, not plan-of-record.
    expect(planCaps("maker").userDailyCap).toBe(1_000_000);
    expect(planCaps("studio").userDailyCap).toBe(1_000_000);
    expect(planCaps("maker").byokAllowed).toBe(true);
  });

  it("env overrides the user cap, minimum 1; invalid falls back to Free 10", () => {
    expect(planCaps("free", { HOSTED_FREE_DAILY_LIMIT: "3" }).userDailyCap).toBe(3);
    expect(planCaps("free", { HOSTED_FREE_DAILY_LIMIT: "0" }).userDailyCap).toBe(10);
    expect(planCaps("free", { HOSTED_FREE_DAILY_LIMIT: "junk" }).userDailyCap).toBe(10);
    expect(planCaps("free", { HOSTED_FREE_IP_DAILY_LIMIT: "15" }).ipDailyCap).toBe(15);
  });
});

describe("resolveHostedKeys", () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.CURSOR_API_KEY;
    delete process.env.HOSTED_OPENWEIGHTS_API_KEY;
  });
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.CURSOR_API_KEY;
    delete process.env.HOSTED_OPENWEIGHTS_API_KEY;
  });

  it("Free ignores client BYOK headers entirely — never BYOK-as-free", () => {
    const req = requestWith({
      [GEMINI_KEY_HEADER]: "client-key",
      [CURSOR_KEY_HEADER]: "client-cursor",
    });
    const env = { GEMINI_API_KEY: "hosted-key" };
    const keys = resolveHostedKeys(req, "free", env);
    expect(keys.gemini).toBe("hosted-key");
    expect(keys.cursor).toBeUndefined();
    expect(keys.source).toBe("hosted-open-weights");
  });

  it("Maker/Studio may override hosted keys with BYOK headers", () => {
    const req = requestWith({ [GEMINI_KEY_HEADER]: "byok-g" });
    const env = { GEMINI_API_KEY: "hosted-key" };
    expect(resolveHostedKeys(req, "maker", env)).toMatchObject({ gemini: "byok-g", source: "byok" });
    expect(resolveHostedKeys(requestWith(), "studio", env)).toMatchObject({
      gemini: "hosted-key",
      source: "hosted-open-weights",
    });
  });

  it("Free without a hosted key yields nothing to generate with", () => {
    expect(resolveHostedKeys(requestWith({ [GEMINI_KEY_HEADER]: "x" }), "free").gemini).toBeUndefined();
  });
});

describe("decideRateLimit", () => {
  it("allows under both user and IP caps (Free 10/user + 20/IP)", () => {
    const d = decideRateLimit(9, 3, 10, 20, 3600);
    expect(d.allowed).toBe(true);
    expect(d.retryAfterSeconds).toBe(0);
  });

  it("429 when user hits Free 10/day", () => {
    const blocked = decideRateLimit(10, 3, 10, 20, 7200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(7200);
    expect(blocked.counts.cap).toBe(10);
  });

  it("user and IP caps are independent — IP farm hits 20 even if user is low", () => {
    expect(decideRateLimit(5, 20, 10, 20, 60).allowed).toBe(false);
    expect(decideRateLimit(10, 1, 10, 20, 60).allowed).toBe(false);
  });

  it("retry-after is clamped to sane bounds", () => {
    expect(decideRateLimit(1, 1, 1, 1, 0).retryAfterSeconds).toBe(1);
    expect(decideRateLimit(2, 2, 1, 1, 1e9).retryAfterSeconds).toBeLessThanOrEqual(86400);
  });
});

describe("window + ip helpers", () => {
  it("secondsUntilWindowReset lands within the day", () => {
    const s = secondsUntilWindowReset();
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(86400);
  });

  it("clientIp reads proxy headers with unknown fallback", () => {
    expect(clientIp(requestWith({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
    expect(clientIp(requestWith({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(requestWith())).toBe("unknown-ip");
  });
});

describe("plan ladder shape", () => {
  it("BYOK is only ever an override for paid tiers", () => {
    const free = planCaps("free");
    expect(free.byokAllowed).toBe(false);
    for (const plan of ["maker", "studio"] as HostedPlan[]) {
      expect(planCaps(plan).byokAllowed).toBe(true);
    }
  });
});
