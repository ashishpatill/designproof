# Changelog

Notable Tell Proof work, newest first. Dates follow `git log`. This is not a semver release log.

Tell Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions — an independent critic and craft layer beside the coding agent. It is not a Studio web app as the product.

**Quality bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## 2026-10-05 — SaaS template says each thing once

- The SaaS page keeps one complete catalogue. The second "also included" band, the chapter list, and the matrix under the pricing lanes are gone, so the page goes from twelve sections to nine.
- Each capability description is printed once, in the catalogue. The fold console and the product picture draw names and rows instead of reprinting sentences cut mid-word.
- Pricing lanes name only what each lane adds and print no billing terms the brief never gave. The FAQ and closing line are built from the brief's own names, and copy written for the sample product ("moves an account", "booked walkthrough") no longer lands on other products.
- New test: `packages/design-skills/src/__tests__/saas-template-once.test.ts`. Other templates render byte-for-byte the same.

---

## 2026-09-15 — Agent-nav docs + status snapshot

- Slim [`AGENTS.md`](./AGENTS.md) to a thin entry (pointer tables + working loop). Do not load all of `docs/`.
- Add [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md), [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md), and [`docs/features/`](./docs/features/) (capture→prove, MCP plugin, design dogfood, training-data/MCP sink, showcase/Tiller).
- Add this changelog and [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md) (Done / Pending / Stuck / Needs from Ashish / Next).
- Registry lists only in-repo skills, the `tell` MCP server, and no Cursor plugin package. No app code.

---

## 2026-08-26 — Captioned product demo

- Record and recapture the 5-beat product loop for README (~47s, captioned): capture → named tells → seam → voice → draft fix, then Studio and specimens.
- Document the demo in README.

---

## 2026-08-25 — README as product surface + MCP training sink

- Rewrite README as a human-written product overview (masthead, one visual per concept, loop steps).
- Curate showcase stills and craft-reel policy so GitHub does not reprint the same fold twice.
- Recapture README media; ink-on-paper sidebar remains readable.
- MCP tools write training episodes through the shared `tell-design-data` sink when the sibling repo is present. Raw dumps → curated SFT/DPO is **not** closed (see PROJECT-STATUS).

---

## 2026-08-24 — Specimens: Tiller, Lattice, Ember Gate

- Agent-harness **Tiller** hero-helm; turn list reads as a session, not a feature reprint (`#74`, `#75`).
- Lattice: drop orange Z through cards and pipeline title rail (`#62`).
- Ember Gate PATH ATLAS: walk, not a broken diagram (`#63`).
- Ground deterministic CTA note and workflow roles (`#73`).
- Public showcase/GitHub still flags **Tiller as missing** — in-repo specimen exists; the public gap stays open.

---

## 2026-08-21 – 2026-08-23 — Honesty and product-proof

- Phase 0–1 Studio honesty: instrument the SaaS-demo blind spot; connective author for `saas` / `demos` briefs (`#72`).
- Ungate the SaaS product-proof quality bar from the approve workflow; gate workflow-proof on approval language and seed accent hue.
- Un-nest soft-brand-accent mood so the live wash paints.
- Close MCP catalog honesty: **eleven** `tell_*` tools (docs matched code; residual eight-tool claim removed).
- Settings and scenario matrix match real capture contracts.

---

## 2026-08-12 – 2026-08-18 — Template craft + product shell

- Shared DesignControls on Home and Studio; guard composer against third-party brand templates.
- Template craft audit: layout-audit clean across 16 briefs; vacancy slabs and alignment-axes collapse.
- Care pathway clinic specimen (Roundspool).
- Readable ink-on-paper product sidebar (`#64`).
- README specimens, craft reels, and demo refresh.

---

## 2026-08-09 – 2026-08-11 — Matchday specimens, skill graph, platform

- Crease (cricket) and Baseline (tennis) matchday specimens from sport vernacular + domain research; score spine / nested sets; instant nav.
- Auto-trigger `website-domain-research` (and sport extension) on site builds; wire research, craft, and media skills into every template run.
- Unify product nav to one left sidebar; stop silent demo fallback when live capture fails; critic rail simplified; seam pins removed.
- Phase 9 uniqueness: archive / studio / foundry loops; strip shared marquee-proof; unique mid-page instruments (field key, press forme, observatory waterfall, lantern trail, loom care-tags).
- Multi-agent MCP install catalog (Cursor, Grok Build, and peers).
- Local training-data sink into sibling `tell-design-data` (Studio routes + later MCP); agency-run-learn vs end-user session learn split.

---

## 2026-08-07 – 2026-08-08 — Motion, lantern, first-five plumbing

- Kinetic motion template (Mote); lantern-path cinematic night-walk.
- Product-proof-stage skill (HTMX workflow proof for SaaS).
- First-five template plumbing: instruments fill the viewport; dead chips become controls.
- Phase 8 stretch: `tell_resolve_intent` + Connect Agent UI — catalog stays at eleven tools.

---

## Earlier (through 2026-08)

Sprint MVP **M1–M10** and Phases **1–6** are closed: capture → fingerprint → 14 detectors → taste → Report/seam → voice → redesign diffs → MCP → proof verify → scenario matrix → auth harness. See [`PLAN.md`](./PLAN.md) and [`BUILD.md`](./BUILD.md).

Phase 7 premium craft floor, agency-quality pipeline, and most of Phase 8 (install-info, `tell mcp install`, `tell_voice`) shipped before the August specimen work. Remaining Phase 7 stretch (optional GSAP/Lenis + Rive) and Phase 9 dossier/consumer/marketing polish are still open in PLAN.md — they sit behind the items in PROJECT-STATUS.
