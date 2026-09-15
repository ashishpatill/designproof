# Tools and skills (this repo)

Honest registry of what **tell-proof** ships. Do not invent MCP servers, plugins, or skills that are not listed here.

Back: [`AGENTS.md`](../AGENTS.md) · Map: [`FEATURE-MAP.md`](./FEATURE-MAP.md)

---

## Cursor skills

Load: read `.cursor/skills/<name>/SKILL.md` (many have a twin under `agent-skills/web-design/` — same workflow, engine-facing copy).

### Engine loop

| Skill | When |
|---|---|
| `tell-schema-contracts` | Zod first at package/API/MCP boundaries |
| `tell-capture-fingerprint` | Playwright capture + fingerprint |
| `tell-detector-authoring` | Genericness / drift detectors in `packages/core` |
| `tell-taste-verdicts` | Taste + voice direction |
| `tell-redesign-diff` | Reconciliation + diffs |
| `tell-report-ui` | Tell Report + API routes |
| `tell-proof-verify` | Disposable checkout prove |
| `tell-mcp-tools` | `packages/mcp`, catalog, install-info |
| `tell-github-setup` | Clone / install / run localhost (local only) |
| `tell-demo-fixture` | Generic-app fixture + offline report |
| `tell-demo-script` | Demo + compliance |
| `tell-deploy` | Vercel / Docker / capture host |
| `tell-dogfood-audit` | Zero tells on `apps/web`; `pnpm eye:shell` |

### Site craft (auto-graph)

| Skill | When |
|---|---|
| `premium-content-custom-web` | Any new site / redesign — routes the craft graph |
| `website-domain-research` | **Auto** before pixels: LoadPrior → gap → walkthrough → IA → variant-lens → emit-training |
| `load-prior-domain`, `requirement-gap-diff`, `multipage-walkthrough`, `ia-shell-synthesis`, `category-gap-audit`, `variant-lens`, `emit-training-episode` | Research graph nodes — execute, do not skip |
| `sport-matchday-web`, `sport-site-research`, `sport-vernacular-craft` | Cricket / football / hockey / tennis / live scores |
| `responsive-performance` | **Always-on** after photography under `apps/web/public/**` (`pnpm media:site`, `SiteImg`) |
| `agency-quality-site`, `agency-run-learn` | Phased `agency:run` (learn is developer-only) |
| `tell-recursive-improve`, `tell-template-craft` | Champion/challenger uniqueness; measured corridors |
| `product-proof-stage`, `conversion-landing-craft`, `pricing-decision-craft` | SaaS proof / landing / pricing |
| `scroll-reveal-once`, `motion-stack-craft`, `paper-technical-frame`, `gates-until-verified`, `ambient-atmosphere-craft`, `glass-shell-craft`, `signal-beam-craft`, `scroll-narrative-craft`, `editorial-chapter-craft`, `operational-governance-craft`, `surface-recipe-map`, `design-research-loop` | Craft nodes `routeSkills` may return — execute listed nodes |

### Session / ship

| Skill | When |
|---|---|
| `tell-user-session-learn` | End-user localStorage profile |
| `ship-loop` | Open PR → local green → semantic commits → push. **Local gates only** (no Actions). |

---

## MCP servers / connectors

**In this repo** (`.cursor/mcp.json`):

| Server | How | Tools |
|---|---|---|
| `tell` | `pnpm -F @tell/mcp start` or `tell mcp install cursor --project` | Eleven: `tell_capture`, `tell_diagnose`, `tell_redesign`, `tell_apply`, `tell_capture_matrix`, `tell_proof_verify`, `tell_proof_revert`, `tell_design_from_features`, `tell_voice`, `tell_install_info`, `tell_resolve_intent` |

`tell_apply` returns patch text only. Catalog must match `@tell/schema` `MCP_TOOL_NAMES`.

There is **no public MCP host**. `/api/setup/*` and share links are web-only (not MCP).

Cloud Agent sessions may show other namespaces (GitHub, Figma, …). Those are **environment** connectors, not Tell product. Do not document them as Tell features.

---

## Plugins

| Item | In this repo? |
|---|---|
| Cursor plugin package (`.cursor-plugin/`, grok-kit, etc.) | **No** |
| Tell as MCP + CLI + skills | **Yes** — that is the product |

Do not scaffold a plugin unless Ashish asks.

---

## Rules (always-on)

`.cursor/rules/*.mdc` — glob-attached or `alwaysApply`. Standing ones:

| Rule | Point |
|---|---|
| `tell-mission` | Ashish loop; deterministic core; never auto-apply |
| `tell-docs-authority` | USER_STORY / BUILD / PLAN / docs/01 win |
| `tell-local-ci-only` | Never gate on GitHub Actions |
| `tell-local-dev-server` | Stop existing `:3000` / `:3001` before `pnpm dev` |
| `tell-domain-research`, `tell-site-build-autoload` | Execute research + craft + `pnpm media:site` |
| `tell-plumbing-reference` | Anonymised peer patterns only; never name the peer |

Others (`tell-ui-design`, `tell-core-engine`, `tell-mcp-api`, …) attach by file glob.

---

## Subagents and hooks

- **Subagents:** `.cursor/agents/` — `orchestrator`, `core-engineer`, `taste-engineer`, `redesign-engineer`, `mcp-engineer`, `ui-builder`, `ux-copywriter`, `fixture-smith`, `deploy-engineer`, `demo-director`, `dogfood-auditor`. Pins: [`ORCHESTRATION.md`](../ORCHESTRATION.md).
- **Hooks:** `.cursor/hooks.json` — session context + after-edit token lint on web files.

---

## Model pins (when you choose)

Composer 2.5 — orchestrate / UI / MCP. Opus 4.8 — schema / detectors / taste. GPT 5.5 — user copy / demo. See [`ORCHESTRATION.md`](../ORCHESTRATION.md).
