# DesignProof-owned skill stubs

These are **plan stubs**. They live under `docs/skills/` even when a runtime skill has landed under `.cursor/skills/` — this folder is never the runtime home. Three stubs now have a runtime twin (anti-slop, taste-loop, diagram); the rest are still plans.

Learned from the Oct 2026 shortlist in [`design-engine-revamp-plan.html`](../design-engine-revamp-plan.html) §2b (PR #106) plus [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT; inspiration only). Ashish's rule: **learn, don't copy** — no vendored forks, no install of their skill into DesignProof.

Near-term:

| Stub | Runtime home | Status |
|---|---|---|
| [anti-slop](./designproof-anti-slop.md) | [`.cursor/skills/designproof-anti-slop/`](../../.cursor/skills/designproof-anti-slop/SKILL.md) | **runtime skill landed** (2026-10-24); stub stays as the plan |
| [tells registry](./designproof-tells-registry.md) | none by design — TS registry + this doc | Rows update with the detector; agents read them through the anti-slop skill |
| [taste-loop](./designproof-taste-loop.md) | [`.cursor/skills/designproof-taste-loop/`](../../.cursor/skills/designproof-taste-loop/SKILL.md) | **runtime skill landed** (2026-10-24); stub stays as the plan |
| [diagram](./designproof-diagram.md) | [`.cursor/skills/designproof-diagram/`](../../.cursor/skills/designproof-diagram/SKILL.md) | **runtime skill landed** (2026-10-25); stub stays as the plan |
| [demo/promo](./designproof-demo-promo.md) | none yet | docs-only stub |

The runtime skills are the procedure an agent follows. A stub stays here as the plan of record until its feature area ships as product; the two are not duplicates — when they disagree, the runtime skill is what an agent does today and the stub is what the plan still wants. The tells registry keeps no runtime twin: its rows are code, and the anti-slop skill links to them.

Later and skip: [later/](./later/README.md). None of these stubs is a Model Context Protocol (MCP) tool; the catalog stays eleven today and nineteen by replacement.
