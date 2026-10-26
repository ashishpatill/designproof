# DesignProof — Auth & Security Boundaries Plan

> **Supersedes** the earlier “product accounts are a non-goal” stance (Ashish, 2026-10-26).
> Hosted spend on designproof.site requires Neon Managed Auth, abuse caps, and Dodo entitlements
> before generation. Local-first BYOK / capture paths stay usable signed-out where documented.

---

## 0. Principles

1. **Hosted generation is gated** — Neon Auth session + plan entitlement + rate limits before any Free/Maker/Studio hosted model call.
2. **Local-first BYOK is not Free** — client bring-your-own-key never substitutes for a Free hosted pool.
3. **Abuse is app-layer** — per-user and per-IP daily caps + concurrency; do **not** use Neon IP Allow as the abuse control.
4. **Open-source app, proprietary data backend** — `ashishpatill/designproof` stays OSS; `ashishpatill/design-proof-data` is the proprietary hosted backend (Render + Neon + Backblaze). Backend server code never lands in the app repo.
5. **OSS surface hygiene** — README, docs, UI, marketing, and public code comments: no “training” language, no third-party repos/skills named. Tech Lead gate language = hosted backend / server path.
6. **Honest degrade** — missing Neon Auth / Dodo / capture env → clear 401/503 JSON, never invented checkout or capture URLs.
7. **No SuperLearn key reuse** — DesignProof Dodo keys only (`DODO_DESIGNPROOF_*`).

---

## 1. Current baseline (pre–hosted E2E)

| Mechanism | Role | Gap |
|---|---|---|
| Neon Postgres (`DATABASE_URL`) | Share-link report store | No product accounts |
| Optional `TELL_CAPTURE_API_TOKEN` | Capture host bearer | Hosted Free pool open |
| Generation routes (`/api/design`, restyle, redesign, voice, …) | Mostly open | **Must require session + caps** |
| Playwright demo `storageState` | Disposable demo cells | Keep for demos only — not product auth |

---

## 2. Target trust layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Layer A — Neon Managed Auth (Better Auth via Neon)           │
│   Session cookies · /api/auth/* public · requireUser on spend│
├──────────────────────────────────────────────────────────────┤
│ Layer B — Entitlements (same Neon DATABASE_URL)             │
│   user_entitlements: free | maker | studio                   │
│   generation_usage: per user_id + per ip_hash / UTC day      │
├──────────────────────────────────────────────────────────────┤
│ Layer C — Abuse caps (app API / edge — not Neon IP Allow)    │
│   Free interim: 10 gen/user/day, 20/IP/day, concurrency 1    │
│   Maker/Studio numeric caps: GTM plan-of-record via env      │
│   ENFORCED at the gate — daily usage counted in Neon         │
│   (generation_usage); concurrency is a real in-flight lease  │
│   (generation_inflight), released by the route in finally.   │
│   Second concurrent Free generate → 429 concurrency_limited. │
├──────────────────────────────────────────────────────────────┤
│ Layer D — Dodo Payments                                      │
│   Checkout session + webhook → entitlement                   │
│   Tip $5 = gratitude only (not a plan)                       │
├──────────────────────────────────────────────────────────────┤
│ Layer E — Hosted data backend (outside this repo)            │
│   Thin client: DESIGNPROOF_DATA_API_* (TELL_CAPTURE_API_*    │
│   alias until rename cutover). Token required non-loopback.  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Route classes

### Must gate (Neon Auth session + tier/cap) before hosted spend

- `apps/web/src/app/api/design/route.ts` (+ design/html if present)
- `api/voice`, `api/restyle`, `api/redesign`
- `api/diagnose` (user gate for hosted Free pool)
- `api/proof/verify`, `apply`, `matrix`, `revert`
- `api/reports/share` (bind user + export rules)
- `api/billing/checkout`, `api/billing/dodo/webhook`, `api/webhooks/dodo`

### Keep public

- Health / capture readiness (no diagnose body)
- install-info
- `reports/[id]` read
- Landing / marketing pages
- `/api/auth/*` (Neon Auth handlers)

---

## 4. Plan ladder & Dodo map

| Plan | Price | Hosted model | Caps |
|---|---|---|---|
| Free | $0 | Flash-only cheap open-weights | **10/user/day**, **20/IP/day**, concurrency **1** |
| Maker | $7 / $69 | Hosted + BYOK override | Env `HOSTED_MAKER_*` until GTM numbers |
| Studio | $15 / $129 | Hosted + BYOK override | Env `HOSTED_STUDIO_*` until GTM numbers |
| Tip | $5 one-time | — | Gratitude only — **not a tier** |

**LIVE brand** `brnd_0NqZOdGANKGcFKfrwbmI7`  
**TEST brand** `brnd_0NqZT56wT3RtB2an1WBPg`

| SKU | LIVE | TEST |
|---|---|---|
| Maker monthly | `pdt_0NqZOdQEPoUYY52egd9hw` | `pdt_0NqZTGWaRlbfCbvCVWDlU` |
| Maker yearly | `pdt_0NqZOdTt2kKHyB0skOhXw` | `pdt_0NqZTGcX6azPETLjN69zj` |
| Studio monthly | `pdt_0NqZOdYgjIamyGVjhJH6t` | `pdt_0NqZTGgoHwGbvwR1MfR4J` |
| Studio yearly | `pdt_0NqZOdcjXJYfPL2o9V8Rs` | `pdt_0NqZTGkycZ8wq9qqlJG3X` |
| Tip $5 | `pdt_0NqZTUk7iWWdTlUtajVSP` | `pdt_0NqZTWiGZkR5T3hw1gBsk` |

Never use legacy tip `pdt_0Nion9NMgdGlVBlgG6sgj` (other brand).

### Env names (values never in git)

| Purpose | Env |
|---|---|
| Neon DB | `DATABASE_URL` |
| Neon Auth | `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` |
| Dodo API | `DODO_DESIGNPROOF_LIVE_API_KEY`, `DODO_DESIGNPROOF_TEST_API_KEY`, `DODO_ENVIRONMENT` |
| Dodo webhook | `DODO_DESIGNPROOF_LIVE_WEBHOOK_SECRET`, `DODO_DESIGNPROOF_TEST_WEBHOOK_SECRET` |
| Data backend | `DESIGNPROOF_DATA_API_URL`, `DESIGNPROOF_DATA_API_TOKEN` (alias `TELL_CAPTURE_API_*`) |
| Free/Maker/Studio overrides | `HOSTED_*_DAILY_LIMIT`, `HOSTED_*_IP_DAILY_LIMIT`, `HOSTED_*_CONCURRENCY` |

---

## 5. Tech Lead E2E gate (before GTM cutover)

1. Anonymous generation → **401**
2. Signed-in Free → generate succeeds (flash-only)
3. Hit Free cap → **429** + Retry-After
4. Maker checkout (TEST) → webhook → entitlement
5. Maker generate succeeds
6. CI green on the PR
7. This file present and accurate
8. Ashish ask → GTM live cutover on designproof.site

No live deploy claim until all of the above.

---

## 6. Wave status

| Wave | Status |
|---|---|
| Neon Managed Auth on same `DATABASE_URL` project | In progress on `feat/hosted-e2e-neon-auth` |
| `requireHostedGenerationAccess` on generation routes | In progress |
| Free hard caps + IP/user usage | In progress (CEO interim numbers) |
| Dodo checkout + webhook → entitlements | In progress (TEST first) |
| Rewrite this doc (product accounts required) | **This revision** |
| `design-proof-data` thin client cutover rename | After CEO assigns backend + API URL |
| Live cutover | Blocked on TL E2E + Ashish ask |

---

## 7. Explicit non-goals (still)

- Putting proprietary backend server code inside `ashishpatill/designproof`
- Naming third-party motion/skill repos on OSS surfaces
- Using Neon IP Allow as the primary abuse shield
- Reusing SuperLearn Dodo keys or product IDs
