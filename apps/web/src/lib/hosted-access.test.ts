import { afterEach, describe, expect, it } from "vitest";
import { requireHostedGenerationAccess } from "./hosted-access";
import type { HostedSession } from "./neon-auth";
import type { SqlExecutor } from "./entitlements";

const NOW = new Date("2026-10-26T12:00:00Z");

interface Row {
  user_id: string;
  plan: string;
  source: string;
  updated_at: string;
}

/** Executor with pre-seeded entitlement + usage rows. */
function seededExecutor(opts: { entitlement?: Row; usage: Record<string, number> }): SqlExecutor {
  return {
    async query(text, params = []) {
      const t = text.toLowerCase();
      if (t.startsWith("create table")) return [];
      if (t.startsWith("insert into user_entitlements") && t.includes("do nothing")) return [];
      if (t.startsWith("select user_id, plan")) {
        const row = opts.entitlement && opts.entitlement.user_id === params[0] ? opts.entitlement : {
          user_id: String(params[0]),
          plan: "free",
          source: "default",
          updated_at: NOW.toISOString(),
        };
        return [row];
      }
      if (t.startsWith("select count from generation_usage")) {
        const key = `${params[0]}:${params[1]}`;
        return opts.usage[key] != null ? [{ count: opts.usage[key] }] : [];
      }
      if (t.includes("insert into generation_usage")) {
        const key = `${params[0]}:${params[1]}`;
        opts.usage[key] = (opts.usage[key] ?? 0) + 1;
        return [{ count: opts.usage[key] }];
      }
      return [];
    },
  };
}

const signedIn: (request: Request) => Promise<HostedSession | null> = async () => ({
  userId: "u_maker",
  email: "maker@example.test",
});
const signedOut: (request: Request) => Promise<HostedSession | null> = async () => null;

function post(body = "{}"): Request {
  return new Request("https://designproof.example/api/redesign", {
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.7" },
    body,
  });
}

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
});

describe("requireHostedGenerationAccess", () => {
  it("blocks with 401 when there is no session", async () => {
    const res = await requireHostedGenerationAccess(post(), { executor: seededExecutor({ usage: {} }), getSession: signedOut });
    expect(res.ok).toBe(false);
    expect(res.error?.status).toBe(401);
    const body = await res.error!.json();
    expect(body.error).toContain("auth_required");
  });

  it("blocks with 401 when Neon entitlements storage is unconfigured (no DATABASE_URL)", async () => {
    const res = await requireHostedGenerationAccess(post(), { executor: null, getSession: signedIn });
    expect(res.ok).toBe(false);
    expect(res.error?.status).toBe(401);
    const body = await res.error!.json();
    expect(body.error).toContain("set DATABASE_URL");
  });

  it("Free session over quota → 429 with Retry-After", async () => {
    const day = "2026-10-26T00:00:00.000Z";
    const exec = seededExecutor({ usage: { [`user:u_maker:daily:${day}`]: 10, [`ip:ip_x:daily:${day}`]: 1 } });
    const res = await requireHostedGenerationAccess(post(), {
      executor: exec,
      getSession: signedIn,
      now: NOW,
    });
    expect(res.ok).toBe(false);
    expect(res.error?.status).toBe(429);
    expect(res.error!.headers.get("retry-after")).toBeTruthy();
    const body = await res.error!.json();
    expect(body.error).toContain("free allows 10/user/day and 20/IP/day");
  });

  it("Maker product_id entitlement → allowed with BYOK override", async () => {
    process.env.GEMINI_API_KEY = "hosted-key";
    const exec = seededExecutor({
      entitlement: { user_id: "u_maker", plan: "maker", source: "dodo", updated_at: NOW.toISOString() },
      usage: {},
    });
    const req = new Request("https://designproof.example/api/redesign", {
      method: "POST",
      headers: {
        "x-forwarded-for": "203.0.113.7",
        "x-tell-gemini-key": "byok-key",
      },
      body: "{}",
    });
    const res = await requireHostedGenerationAccess(req, {
      executor: exec,
      getSession: signedIn,
      now: NOW,
    });
    expect(res.ok).toBe(true);
    expect(res.context?.plan).toBe("maker");
    expect(res.context?.keys.gemini).toBe("byok-key");
    expect(res.context?.keys.source).toBe("byok");
    expect(res.context?.entitlementSource).toBe("dodo");
  });

  it("Free session ignores BYOK headers and uses the hosted key only", async () => {
    process.env.GEMINI_API_KEY = "hosted-open-weights";
    const exec = seededExecutor({ usage: {} });
    const req = new Request("https://designproof.example/api/redesign", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.7", "x-tell-gemini-key": "resold-key" },
      body: "{}",
    });
    const res = await requireHostedGenerationAccess(req, { executor: exec, getSession: signedIn, now: NOW });
    expect(res.ok).toBe(true);
    expect(res.context?.plan).toBe("free");
    expect(res.context?.keys.gemini).toBe("hosted-open-weights");
    expect(res.context?.keys.source).toBe("hosted-open-weights");
  });

  it("bumps user + ip usage buckets on every allowed request", async () => {
    const day = "2026-10-26T00:00:00.000Z";
    const usage: Record<string, number> = {};
    const exec = seededExecutor({ usage });
    const deps = { executor: exec, getSession: signedIn, now: NOW };
    for (let i = 0; i < 3; i++) {
      const res = await requireHostedGenerationAccess(post(), deps);
      expect(res.ok).toBe(true);
    }
    expect(usage[`user:u_maker:daily:${day}`]).toBe(3);
    const ipKeys = Object.keys(usage).filter((k) => k.includes("daily:") && k.startsWith("ip:"));
    expect(ipKeys).toHaveLength(1);
    const ipKey = ipKeys.find((k) => (usage[k] ?? 0) > 0);
    expect(ipKey).toBeTruthy();
  });
});
