# Tools and skills (this repo)

Honest registry of what **dp-proof** ships. Do not invent MCP servers, plugins, or skills that are not listed here.

Back: [`AGENTS.md`](../AGENTS.md) · Map: [`FEATURE-MAP.md`](./FEATURE-MAP.md)

---

## Cursor skills

Load: read `.cursor/skills/<name>/SKILL.md` (many have a twin under `agent-skills/web-design/` — same workflow, engine-facing copy).

### Engine loop

| Skill | When |
|---|---|
| `dp-schema-contracts` | Zod first at package/API/MCP boundaries |
| `dp-capture-fingerprint` | Playwright capture + fingerprint |
| `dp-detector-authoring` | Genericness / drift detectors in `packages/core` |
| `dp-taste-verdicts` | Taste + voice direction |
| `dp-redesign-diff` | Reconciliation + diffs |
| `dp-report-ui` | Design Proof Report + API routes |
| `dp-proof-verify` | Disposable checkout prove |
| `dp-mcp-tools` | `packages/mcp`, catalog, install-info |
| `dp-github-setup` | Clone / install / run localhost (local only) |
| `dp-demo-fixture` | Generic-app fixture + offline report |
| `dp-demo-script` | Demo + compliance |
| `dp-deploy` | Vercel / Docker / capture host |
| `dp-dogfood-audit` | Zero tells on `apps/web`; `pnpm eye:shell` |

### Site craft (auto-graph)

| Skill | When |
|---|---|
| `premium-content-custom-web` | Any new site / redesign — routes the craft graph |
| `website-domain-research` | **Auto** before pixels: LoadPrior → gap → walkthrough → IA → variant-lens → emit-training |
| `load-prior-domain`, `requirement-gap-diff`, `multipage-walkthrough`, `ia-shell-synthesis`, `category-gap-audit`, `variant-lens`, `emit-training-episode` | Research graph nodes — execute, do not skip |
| `sport-matchday-web`, `sport-site-research`, `sport-vernacular-craft` | Cricket / football / hockey / tennis / live scores |
| `responsive-performance` | **Always-on** after photography under `apps/web/public/**` (`pnpm media:site`, `SiteImg`) |
| `agency-quality-site`, `agency-run-learn` | Phased `agency:run` (learn is developer-only) |
| `dp-recursive-improve`, `dp-template-craft` | Champion/challenger uniqueness; measured corridors |
| `product-proof-stage`, `conversion-landing-craft`, `pricing-decision-craft` | SaaS proof / landing / pricing |
| `scroll-reveal-once`, `motion-stack-craft`, `paper-technical-frame`, `gates-until-verified`, `ambient-atmosphere-craft`, `glass-shell-craft`, `signal-beam-craft`, `scroll-narrative-craft`, `editorial-chapter-craft`, `operational-governance-craft`, `surface-recipe-map`, `design-research-loop` | Craft nodes `routeSkills` may return — execute listed nodes |

### Session / ship

| Skill | When |
|---|---|
| `dp-user-session-learn` | End-user localStorage profile |
| `ship-loop` | Open PR → local green → semantic commits → push. **Local gates only** (no Actions). |

---

## MCP servers / connectors

**In this repo** (`.cursor/mcp.json`):

| Server | How | Tools |
|---|---|---|
| `designproof` | `pnpm -F @designproof/mcp start` or `designproof mcp install cursor --project` | Eleven: `designproof_capture`, `designproof_diagnose`, `designproof_redesign`, `designproof_apply`, `designproof_capture_matrix`, `designproof_proof_verify`, `designproof_proof_revert`, `designproof_design_from_features`, `designproof_voice`, `designproof_install_info`, `designproof_resolve_intent` |

`designproof_apply` returns patch text only. Catalog must match `@designproof/schema` `MCP_TOOL_NAMES`.

There is **no public MCP host**. `/api/setup/*` and share links are web-only (not MCP).

Cloud Agent sessions may show other namespaces (GitHub, Figma, …). Those are **environment** connectors, not Design Proof product. Do not document them as Design Proof features.

---

## Plugins

| Item | In this repo? |
|---|---|
| Cursor plugin package (`.cursor-plugin/`, grok-kit, etc.) | **No** — not scaffolded yet |
| `@designproof/pack` cross-host renderer | **No** — proposed in [`17_AGENT_PLUGIN_DISTRIBUTION.md`](./17_AGENT_PLUGIN_DISTRIBUTION.md) |
| Design Proof as MCP + CLI + skills | **Yes** — that is the product today |

**Decision (2026-10-05):** Ashish asked for Design Proof to ship as a plugin for **Codex, Cursor, Claude Code
and Grok Build**. Packaging is planned, not built. The plan and the honest per-host capability matrix
are in [`17_AGENT_PLUGIN_DISTRIBUTION.md`](./17_AGENT_PLUGIN_DISTRIBUTION.md).

**Do not scaffold a host manifest until the unverified cells in §1 of that doc are backed by a file
in this repo.** MCP install for 19 hosts already ships (`packages/cli/src/mcp-install.ts`). The
missing piece is craft delivery — skills, rules, instruction blocks — not another connector. And per
[`16_DESIGN_ENGINE_QUALITY.md`](./16_DESIGN_ENGINE_QUALITY.md), the generator must produce
non-generic pages before four editors are worth wiring to it.

### Delivery status per host

| Host | MCP install | Craft delivery (skills / rules / instructions) |
|---|---|---|
| Cursor | ✅ shipped | ✅ `.cursor/skills`, `.cursor/rules`, `.cursor/agents`, `.cursor/commands`, `.cursor/hooks.json` |
| Claude Code | ✅ shipped (`designproof mcp install claude`) | ❌ instruction block only, until `.claude/**` paths are verified in-repo |
| Codex CLI | ✅ shipped (`designproof mcp install codex --project`) | ❌ instruction block only (`AGENTS.md`-shaped) |
| Grok Build | ✅ shipped (`designproof mcp install grok --project`) | ❌ instruction block only |
| Other 15 hosts | ✅ config path + snippet | — MCP tools only, by design |

---

## Rules (always-on)

`.cursor/rules/*.mdc` — glob-attached or `alwaysApply`. Standing ones:

| Rule | Point |
|---|---|
| `dp-mission` | Ashish loop; deterministic core; never auto-apply |
| `dp-docs-authority` | USER_STORY / BUILD / PLAN / docs/01 win |
| `dp-local-ci-only` | Never gate on GitHub Actions |
| `dp-local-dev-server` | Stop existing `:3000` / `:3001` before `pnpm dev` |
| `dp-domain-research`, `dp-site-build-autoload` | Execute research + craft + `pnpm media:site` |
| `dp-plumbing-reference` | Anonymised peer patterns only; never name the peer |

Others (`dp-ui-design`, `dp-core-engine`, `dp-mcp-api`, …) attach by file glob.

---

## Subagents and hooks

- **Subagents:** `.cursor/agents/` — `orchestrator`, `core-engineer`, `taste-engineer`, `redesign-engineer`, `mcp-engineer`, `ui-builder`, `ux-copywriter`, `fixture-smith`, `deploy-engineer`, `demo-director`, `dogfood-auditor`. Pins: [`ORCHESTRATION.md`](../ORCHESTRATION.md).
- **Hooks:** `.cursor/hooks.json` — session context + after-edit token lint on web files.

---

## Model pins (when you choose)

Composer 2.5 — orchestrate / UI / MCP. Opus 4.8 — schema / detectors / taste. GPT 5.5 — user copy / demo. See [`ORCHESTRATION.md`](../ORCHESTRATION.md).
