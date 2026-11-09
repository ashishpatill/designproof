import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ensureEntitlementTables,
  isHostedPlan,
  readUsage,
  resolveUserPlan,
  setUserPlan,
  usageWindowStart,
  hashIp,
  type SqlExecutor,
} from "./entitlements";
import { entitlementFromWebhookEvent, planFromProductId, productForCheckout, verifyDodoSignature } from "./dodo";
import { createHmac } from "node:crypto";

/** In-memory executor that also enforces generation_usage PK semantics. */
function fakeExecutor(): SqlExecutor & { db: Map<string, unknown> } {
  const db = new Map<string, unknown>();
  const exec: SqlExecutor & { db: Map<string, unknown> } = {
    db,
    async query(text, params = []) {
      const t = text.toLowerCase();
      if (t.startsWith("create table")) return [];
      if (params.length === 0) return [];
      if (t.includes("insert into user_entitlements") && t.includes("on conflict (user_id) do nothing")) {
        const key = `ent:${params[0]}`;
        if (!db.has(key)) db.set(key, { user_id: params[0], plan: "free", source: "default", updated_at: new Date().toISOString() });
        return [];
      }
      if (t.includes("insert into user_entitlements") && t.includes("returning")) {
        const [userId, plan, source] = params as string[];
        db.set(`ent:${userId}`, { user_id: userId, plan, source, updated_at: new Date().toISOString() });
        return [db.get(`ent:${userId}`)];
      }
      if (t.startsWith("select user_id, plan")) {
        const row = db.get(`ent:${params[0]}`);
        return row ? [row] : [];
      }
      if (t.startsWith("select count from generation_usage")) {
        const row = db.get(`usage:${params[0]}:${params[1]}`);
        return row ? [{ count: (row as { count: number }).count }] : [];
      }
      if (t.includes("insert into generation_usage")) {
        const key = `usage:${params[0]}:${params[1]}`;
        const existing = db.get(key) as { count: number } | undefined;
        const next = (existing?.count ?? 0) + 1;
        db.set(key, { count: next });
        return [{ count: next }];
      }
      return [];
    },
  };
  return exec;
}

describe("entitlements", () => {
  let exec: SqlExecutor;
  beforeEach(() => {
    exec = fakeExecutor();
  });

  it("isHostedPlan accepts only the ladder values", () => {
    expect(isHostedPlan("free")).toBe(true);
    expect(isHostedPlan("maker")).toBe(true);
    expect(isHostedPlan("studio")).toBe(true);
    expect(isHostedPlan("owner")).toBe(false);
    expect(isHostedPlan("")).toBe(false);
  });

  it("defaults new sessions to Free with source=default", async () => {
    const row = await resolveUserPlan(exec, "user_a");
    expect(row).toMatchObject({ userId: "user_a", plan: "free", source: "default" });
    // ensure tables ran exactly once per executor
    await expect(resolveUserPlan(exec, "user_b")).resolves.toMatchObject({ plan: "free" });
  });

  it("setUserPlan upserts plan + source (webhook grant)", async () => {
    await resolveUserPlan(exec, "user_a");
    await expect(setUserPlan(exec, "user_a", "studio")).resolves.toMatchObject({
      plan: "studio",
      source: "dodo",
    });
  });

  it("usage buckets count up and read back per window", async () => {
    const start = usageWindowStart();
    expect(await readUsage(exec, "bucket", start)).toBe(0);
    await exec.query("INSERT INTO generation_usage", ["bucket", start.toISOString()]);
    await exec.query("INSERT INTO generation_usage", ["bucket", start.toISOString()]);
    expect(await readUsage(exec, "bucket", start)).toBe(2);
  });

  it("hashIp is deterministic and never returns the raw IP", () => {
    expect(hashIp("203.0.113.9")).toMatch(/^ip_[0-9a-f]{24}$/);
    expect(hashIp("203.0.113.9")).toBe(hashIp("203.0.113.9"));
    expect(hashIp("203.0.113.9")).not.toContain("203.0.113.9");
    expect(hashIp("203.0.113.8")).not.toBe(hashIp("203.0.113.9"));
  });

  it("ensureEntitlementTables is idempotent across calls", async () => {
    await ensureEntitlementTables(exec);
    await expect(ensureEntitlementTables(exec)).resolves.toBeUndefined();
  });
});

describe("dodo product mapping", () => {
  const prevEnv = process.env.DODO_ENVIRONMENT;
  afterEach(() => {
    if (prevEnv === undefined) delete process.env.DODO_ENVIRONMENT;
    else process.env.DODO_ENVIRONMENT = prevEnv;
  });

  it("maps live product IDs to maker/studio in live mode", () => {
    process.env.DODO_ENVIRONMENT = "live";
    expect(planFromProductId("pdt_0NqZOdQEPoUYY52egd9hw")).toBe("maker");
    expect(planFromProductId("pdt_0NqZOdYgjIamyGVjhJH6t")).toBe("studio");
    expect(planFromProductId("pdt_unknown")).toBeUndefined();
    // A test product does not exist in live mode and must not resolve.
    expect(planFromProductId("pdt_0NqZTGgoHwGbvwR1MfR4J")).toBeUndefined();
  });

  it("maps test product IDs to maker/studio in test mode", () => {
    process.env.DODO_ENVIRONMENT = "test";
    expect(planFromProductId("pdt_0NqZTGWaRlbfCbvCVWDlU")).toBe("maker");
    expect(planFromProductId("pdt_0NqZTGgoHwGbvwR1MfR4J")).toBe("studio");
    expect(planFromProductId("pdt_0NqZOdQEPoUYY52egd9hw")).toBeUndefined();
  });

  it("defaults to test mode when DODO_ENVIRONMENT is unset", () => {
    delete process.env.DODO_ENVIRONMENT;
    expect(productForCheckout("maker", "monthly")?.productId).toBe("pdt_0NqZTGWaRlbfCbvCVWDlU");
  });

  it("productForCheckout returns monthly/yearly entries only for paid plans", () => {
    process.env.DODO_ENVIRONMENT = "live";
    expect(productForCheckout("maker", "monthly")?.productId).toBe("pdt_0NqZOdQEPoUYY52egd9hw");
    expect(productForCheckout("studio", "yearly")?.productId).toBe("pdt_0NqZOdcjXJYfPL2o9V8Rs");
    expect(productForCheckout("free", "monthly")).toBeUndefined();
  });
});

describe("dodo webhook event mapping", () => {
  const prevEnv = process.env.DODO_ENVIRONMENT;
  beforeEach(() => {
    process.env.DODO_ENVIRONMENT = "live";
  });
  afterEach(() => {
    if (prevEnv === undefined) delete process.env.DODO_ENVIRONMENT;
    else process.env.DODO_ENVIRONMENT = prevEnv;
  });

  it("grants entitlements from activation events with a valid product_id", () => {
    // Real Dodo shape: the subscription rides directly on `data`.
    expect(
      entitlementFromWebhookEvent({
        type: "subscription.active",
        data: {
          product_id: "pdt_0NqZOdYgjIamyGVjhJH6t",
          metadata: { user_id: "u1" },
        },
      }),
    ).toEqual({ userId: "u1", plan: "studio", action: "upsert" });
  });

  it("still accepts the legacy nested data.object shape", () => {
    expect(
      entitlementFromWebhookEvent({
        type: "subscription.active",
        data: {
          object: {
            product_id: "pdt_0NqZOdQEPoUYY52egd9hw",
            metadata: { user_id: "u2" },
          },
        },
      }),
    ).toEqual({ userId: "u2", plan: "maker", action: "upsert" });
  });

  it("ignores activation with unknown product_id (no free entitlement churn)", () => {
    expect(
      entitlementFromWebhookEvent({
        type: "subscription.active",
        data: { product_id: "pdt_tip_maybe", metadata: { user_id: "u1" } },
      }),
    ).toBeUndefined();
  });

  it("downgrades on cancellation/expiry, ignoring product_id", () => {
    expect(
      entitlementFromWebhookEvent({
        type: "subscription.expired",
        data: { product_id: "pdt_0NqZOdQEPoUYY52egd9hw", metadata: { user_id: "u1" } },
      }),
    ).toEqual({ userId: "u1", plan: "free", action: "downgrade" });
  });

  it("ignores unmapped events and missing user metadata", () => {
    expect(entitlementFromWebhookEvent({ type: "payment.succeeded", data: {} })).toBeUndefined();
    expect(
      entitlementFromWebhookEvent({
        type: "subscription.active",
        data: { product_id: "pdt_0NqZOdQEPoUYY52egd9hw" },
      }),
    ).toEqual({ userId: undefined, plan: "maker", action: "upsert" });
  });
});

describe("dodo webhook signature (Standard Webhooks)", () => {
  const secret = "whsec_test_secret";
  const body = JSON.stringify({ type: "subscription.active" });
  const sign = (id: string, ts: number, key: string | Buffer, signedBody = body) =>
    createHmac("sha256", key).update(`${id}.${ts}.${signedBody}`).digest("base64");
  const headersFor = (id: string, ts: number, v1: string) => ({
    webhookId: id,
    webhookTimestamp: String(ts),
    webhookSignature: `v1,${v1}`,
  });

  it("rejects missing/garbage headers", () => {
    expect(verifyDodoSignature(body, {}, secret)).toBe(false);
    expect(verifyDodoSignature(body, { webhookId: "msg_1" }, secret)).toBe(false);
    expect(
      verifyDodoSignature(body, headersFor("msg_1", Math.floor(Date.now() / 1000), "nonsense"), secret),
    ).toBe(false);
    expect(verifyDodoSignature(body, headersFor("msg_1", Math.floor(Date.now() / 1000), "x"), "")).toBe(false);
  });

  it("accepts a correct v1 signature within tolerance", () => {
    const ts = Math.floor(Date.now() / 1000);
    const v1 = sign("msg_123", ts, secret);
    expect(verifyDodoSignature(body, headersFor("msg_123", ts, v1), secret)).toBe(true);
  });

  it("verifies whsec_ secrets against their base64-decoded key bytes", () => {
    const keyBytes = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");
    const whsec = `whsec_${keyBytes.toString("base64")}`;
    const ts = Math.floor(Date.now() / 1000);
    const v1 = sign("msg_9", ts, keyBytes);
    expect(verifyDodoSignature(body, headersFor("msg_9", ts, v1), whsec)).toBe(true);
  });

  it("rejects tampered bodies and wrong secrets", () => {
    const ts = Math.floor(Date.now() / 1000);
    const v1 = sign("msg_123", ts, secret);
    expect(verifyDodoSignature(body + " ", headersFor("msg_123", ts, v1), secret)).toBe(false);
    expect(verifyDodoSignature(body, headersFor("msg_123", ts, v1), "other_secret")).toBe(false);
    expect(verifyDodoSignature(body, headersFor("msg_999", ts, v1), secret)).toBe(false);
  });

  it("enforces the timestamp tolerance window", () => {
    const old = Math.floor((Date.now() - 30 * 60_000) / 1000); // 30 min
    const v1 = sign("msg_123", old, secret);
    expect(verifyDodoSignature(body, headersFor("msg_123", old, v1), secret)).toBe(false);
    expect(
      verifyDodoSignature(body, headersFor("msg_123", old, v1), secret, { now: Date.now() - 29 * 60_000 }),
    ).toBe(true);
  });
});
