# Feature map

Pick **one row**. Open that canonical doc + the listed skills. Do not browse the rest.

Back: [`AGENTS.md`](../AGENTS.md) · Registry: [`TOOLS-AND-SKILLS.md`](./TOOLS-AND-SKILLS.md) · Status: [`PROJECT-STATUS.md`](./PROJECT-STATUS.md)

| Feature | Status | Canonical doc | Code areas | Skills / MCP / plugins | Notes |
|---|---|---|---|---|---|
| Capture → diagnose → prove | done | [features/capture-diagnose-prove.md](./features/capture-diagnose-prove.md) | `packages/schema`, `packages/core`, `packages/taste`, `packages/redesign`, `apps/web`, `fixtures/` | `tell-schema-contracts`, `tell-capture-fingerprint`, `tell-detector-authoring`, `tell-taste-verdicts`, `tell-redesign-diff`, `tell-report-ui`, `tell-proof-verify`, `tell-demo-fixture` · MCP `tell` | M1–M10 + Phases 1–6 closed. Live capture needs Playwright; offline fixture always works. |
| MCP plugin (Cursor / Grok) | done | [features/mcp-plugin.md](./features/mcp-plugin.md) | `packages/mcp`, `packages/cli`, `packages/schema`, `.cursor/mcp.json` | `tell-mcp-tools` · MCP `tell` (only in-repo server) | Eleven `tell_*` tools. `tell_apply` is patch text only. Product surface is the plugin, not `/studio`. |
| Design dogfood loop | wip | [features/design-dogfood-loop.md](./features/design-dogfood-loop.md) | `apps/web`, `packages/design-skills`, `/studio` | `tell-dogfood-audit`, `premium-content-custom-web`, `tell-recursive-improve`, `agency-quality-site`, `website-domain-research`, `responsive-performance` | Bar: stacked images, motion, artistic, unique. Continuous dogfood still open. |
| Training-data / MCP sink | wip | [features/training-data-mcp-sink.md](./features/training-data-mcp-sink.md) | `packages/design-skills/src/training-data-sink.ts`, `packages/mcp/src/tool-handlers.ts` | `emit-training-episode`, `agency-run-learn`, `tell-mcp-tools` | Writer exists; raw → curated SFT/DPO not closed. No collector in this repo. |
| Showcase / Tiller | wip | [features/showcase-tiller.md](./features/showcase-tiller.md) | `apps/web/src/app/showcase/`, `packages/design-skills` (template `harness`) | `tell-recursive-improve`, `tell-template-craft`, `tell-dogfood-audit` | In-repo `/showcase/harness` (product name Tiller). Public GitHub/showcase gap still open. |
| Site craft / matchday | done (polish parked) | [features/design-dogfood-loop.md](./features/design-dogfood-loop.md) | `packages/design-skills`, `apps/web/src/app/{crease,baseline,showcase,studio}` | `premium-content-custom-web`, `website-domain-research`, `sport-matchday-web`, `sport-site-research`, `sport-vernacular-craft`, `responsive-performance` | Crease + Baseline shipped. Phase 9 dossier/consumer leftovers sit behind PROJECT-STATUS. |
| Deploy | done | [DEPLOY.md](./DEPLOY.md) | `docs/DEPLOY.md`, `docs/DEPLOY-VULTR.md` | `tell-deploy` | UI on Vercel; Playwright capture on a separate host. Local-only GitHub setup. |

Parked for attention: everything above is **secondary to DeepHarness honesty**. See PROJECT-STATUS.
