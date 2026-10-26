/**
 * Plan entitlements + hosted-generation usage counters, stored in the same Neon
 * Postgres the report store uses (DATABASE_URL). Keeps quote/unquote parity with
 * report-store.ts: fail-soft, honest errors, no connection string ever surfaces.
 */
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export type HostedPlan = "free" | "maker" | "studio";

export function databaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.NEON_DATABASE_URL?.trim() ||
    undefined
  );
}

const PLANS: readonly HostedPlan[] = ["free", "maker", "studio"];

export function isHostedPlan(value: unknown): value is HostedPlan {
  return typeof value === "string" && (PLANS as readonly string[]).includes(value);
}

/** Test-injectable executor mirroring the neon-http query surface we use. */
export interface SqlExecutor {
  query(text: string, params?: unknown[]): Promise<unknown[]>;
}

export interface EntitlementRow {
  userId: string;
  plan: HostedPlan;
  source: string;
  updatedAt: string;
}

interface EntitlementDbRow {
  user_id: string;
  plan: string;
  source: string;
  updated_at: string;
}

let tablesReady: Promise<void> | null = null;

/** Create entitlement/usage tables if missing (idempotent, once per process). */
export function ensureEntitlementTables(executor: SqlExecutor): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      await executor.query(
        `CREATE TABLE IF NOT EXISTS user_entitlements (
          user_id TEXT PRIMARY KEY,
          plan TEXT NOT NULL DEFAULT 'free'
            CHECK (plan IN ('free', 'maker', 'studio')),
          source TEXT NOT NULL DEFAULT 'default',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      );
      await executor.query(
        `CREATE TABLE IF NOT EXISTS generation_usage (
          bucket TEXT NOT NULL,
          window_start TIMESTAMPTZ NOT NULL,
          count INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (bucket, window_start)
        )`,
      );
      await executor.query(
        `CREATE TABLE IF NOT EXISTS generation_inflight (
          bucket TEXT PRIMARY KEY,
          count INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      );
    })().catch((err) => {
      tablesReady = null;
      throw err;
    });
  }
  return tablesReady;
}

/** Lazily build an executor on DATABASE_URL, matching report-store behavior. */
export function getEntitlementExecutor(): SqlExecutor | null {
  const url = databaseUrl();
  if (!url) return null;
  const sql = neon(url);
  return {
    query(text, params = []) {
      return sql.query(text, params as never[]) as Promise<unknown[]>;
    },
  };
}

/** Free defaults on first session — every authenticated user starts on Free. */
export async function resolveUserPlan(
  executor: SqlExecutor,
  userId: string,
): Promise<EntitlementRow> {
  await ensureEntitlementTables(executor);
  await executor.query(
    `INSERT INTO user_entitlements (user_id, plan, source)
     VALUES ($1, 'free', 'default')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
  const rows = await executor.query(
    "SELECT user_id, plan, source, updated_at FROM user_entitlements WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  const row = rows[0] as EntitlementDbRow | undefined;
  if (!row) {
    // Table exists but the read raced (or older Neon role lacks the write) — Free default.
    return { userId, plan: "free", source: "default", updatedAt: new Date().toISOString() };
  }
  const plan = isHostedPlan(row.plan) ? row.plan : "free";
  return { userId, plan, source: row.source, updatedAt: row.updated_at };
}

/** Upsert an entitlement (Dodo webhook path). Returns the row written. */
export async function setUserPlan(
  executor: SqlExecutor,
  userId: string,
  plan: HostedPlan,
  source: string = "dodo",
): Promise<EntitlementRow> {
  await ensureEntitlementTables(executor);
  const rows = await executor.query(
    `INSERT INTO user_entitlements (user_id, plan, source)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET plan = EXCLUDED.plan, source = EXCLUDED.source, updated_at = NOW()
     RETURNING user_id, plan, source, updated_at`,
    [userId, plan, source],
  );
  const row = rows[0] as EntitlementDbRow | undefined;
  return {
    userId,
    plan,
    source: row?.source ?? source,
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  };
}

/** UTC-anchored window start for a usage cap period (whole days by default). */
export function usageWindowStart(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export interface UsageRow {
  bucket: string;
  windowStart: string;
  count: number;
}

/** Read the count for one bounded bucket+window, or 0. */
export async function readUsage(
  executor: SqlExecutor,
  bucket: string,
  windowStart: Date,
): Promise<number> {
  const rows = await executor.query(
    "SELECT count FROM generation_usage WHERE bucket = $1 AND window_start = $2 LIMIT 1",
    [bucket, windowStart.toISOString()],
  );
  const row = rows[0] as { count?: unknown } | undefined;
  const n = typeof row?.count === "number" ? row.count : Number(row?.count ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Increment-and-return usage for one bounded bucket+window (atomic upsert). */
export async function bumpUsage(
  executor: SqlExecutor,
  bucket: string,
  windowStart: Date,
): Promise<number> {
  const rows = await executor.query(
    `INSERT INTO generation_usage (bucket, window_start, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (bucket, window_start)
     DO UPDATE SET count = generation_usage.count + 1
     RETURNING count`,
    [bucket, windowStart.toISOString()],
  );
  const row = rows[0] as { count?: unknown } | undefined;
  const n = typeof row?.count === "number" ? row.count : Number(row?.count ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Hash an IP for per-IP buckets — never store raw addresses. */
export function hashIp(ip: string): string {
  return `ip_${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`;
}

/**
 * In-flight generation slots (per-user concurrency), same Neon Postgres.
 * A lease older than INFLIGHT_STALE_SECONDS is treated as a crashed Vercel
 * invocation and clamped to zero on the next acquire, so a lost `release`
 * can never permanently block a Free user.
 */
export const INFLIGHT_STALE_SECONDS = 120;

export function inflightBucketFor(userId: string): string {
  return `user:${userId}:inflight`;
}

function stalePredicate(): string {
  return `updated_at < NOW() - (${INFLIGHT_STALE_SECONDS} * interval '1 second')`;
}

/**
 * Atomically take one in-flight slot up to `max`. Returns false when the
 * bucket is already at capacity — this is the definitive deny signal.
 * Both statements are single-query atomic (Neon HTTP has no cross-query
 * transaction, so no read-then-write race is introduced).
 */
export async function tryAcquireInflight(
  executor: SqlExecutor,
  bucket: string,
  max: number,
): Promise<boolean> {
  const cap = Math.floor(max);
  if (!Number.isFinite(cap) || cap < 1) return false;
  // First acquire for the bucket: INSERT holds slot 1 (fresh row wins the race).
  const inserted = await executor.query(
    `INSERT INTO generation_inflight (bucket, count, updated_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (bucket) DO NOTHING
     RETURNING bucket`,
    [bucket],
  );
  if (inserted.length > 0) return true;
  // Existing row: conditional UPDATE. A row whose updated_at is stale is
  // clamped to 1 here (crashed invocation), a live row under capacity is
  // incremented, and a full row matches zero rows ⇒ denied.
  const rows = await executor.query(
    `UPDATE generation_inflight
     SET count = CASE WHEN ${stalePredicate()} THEN 1 ELSE count + 1 END,
         updated_at = NOW()
     WHERE bucket = $1 AND (${stalePredicate()} OR count < $2)
     RETURNING count`,
    [bucket, cap],
  );
  return rows.length > 0;
}

/**
 * Give an in-flight slot back. Floor-clamped at 0 so an unexpected extra
 * release can never drive the count negative (and thus over-admit).
 * Throws on DB failure — callers decide their own fail-soft policy.
 */
export async function releaseInflight(executor: SqlExecutor, bucket: string): Promise<void> {
  await executor.query(
    `UPDATE generation_inflight
     SET count = GREATEST(count - 1, 0), updated_at = NOW()
     WHERE bucket = $1`,
    [bucket],
  );
}
