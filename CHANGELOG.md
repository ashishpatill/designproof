# Changelog

Notable Design Proof work, newest first. Dates follow `git log`. This is not a semver release log.

Design Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions — an independent critic and craft layer beside the coding agent. It is not a Studio web app as the product.

**Quality bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## 2026-10-06 — Renamed to Design Proof; review workspace rebuilt around the loop

**Naming.** The product is now **Design Proof**, and the gallery is **Design Templates** — everywhere a person reads or greps: UI copy, headings, page metadata, doc titles, code comments, skills, rules, filenames and paths. Under the hood the rename is complete too, so nothing is half-branded:

- Package scope `@tell/*` → `@designproof/*` (all eight workspace packages, lockfile, imports).
- CSS prefix `tell-` → `dp-`, custom properties `--tell-*` → `--dp-*`, DOM attribute `data-tell-id` → `data-dp-id` (capture, detectors, reconcile, fixtures and corpus all moved together).
- Env vars `TELL_*` → `DP_*`; localStorage keys `tell:*` → `dp:*`; MCP server key and tool namespace `tell_*` → `designproof_*`; CLI `tell` → `designproof`.
- Gallery artifacts: `Specimen*` → `Template*`, `specimenSrc` → `templateSrc`, `specimenBeats` → `templateBeats`, `docs/06_TELL_PROOF.md` → `docs/06_DESIGN_PROOF.md`.

**Kept on purpose.** The common noun *tell* (a genericness giveaway) and detector names ending in `Tell` still name the domain concept, not the product. External identifiers also stay: deployed hostnames (`tell-five.vercel.app`, `tell-capture.onrender.com`) and remote repo slugs cannot be renamed from inside this checkout without breaking live services. **Deploy note:** hosts with `TELL_*` environment variables must be updated to the `DP_*` names before the next deploy. See [`.env.example`](./.env.example).

**Layout + UX.** The review workspace is rebuilt around the four beats the product actually performs.

- **Home** is a two-column editorial surface: the composer on the left with its modes framed above the input and a labelled primary action, and a four-beat loop rail (Capture → Diagnose → Direct → Prove) on the right. The empty shelf carries its own next actions instead of dead space.
- **Project workspace** replaces the single long critic column with three focused panes — Findings, Direction, Proof. The findings list is scroll-bounded and filterable by verdict band, and the selected finding docks as an inspector so the verdict, evidence and primary action stay on screen. Drafting a fix moves you to Proof, where the patch, its measured changes and the agent wiring live. The split now fills the viewport, and notices dock bottom-centre instead of covering pane controls.
- **Studio** pins the preview to the viewport while the controls column scrolls, and groups controls into Product / What it does / Taste / Magic edit. Engine internals (routed skills, sections, generation, hints) fold into a collapsed *Engine detail* panel.
- **Templates** gallery gains job-based family filters — filtering by raw site kind returned one card per chip.
- **Report handoff** page gains a score summary, the captured surface, and per-finding verdicts with confidence.
- Narrow viewports stop trapping the review pane: it flows with the page so findings, inspector and actions are all reachable.

New shared layout primitives live in `apps/web/src/components/shell/layout.css`; the superseded home/composer/recent rules and the unrendered tabs bar left `shell.css`.

Verification: 323 tests pass, `pnpm typecheck` clean, `next build` clean.

---

## 2026-10-05 — Design-engine quality diagnosis + plugin distribution plan

- Add [`docs/16_DESIGN_ENGINE_QUALITY.md`](./docs/16_DESIGN_ENGINE_QUALITY.md): a measured diagnosis of why `packages/design-skills` still generates generic pages, a corpus-grounded benchmark of what separates tier-one work, and the target architecture (`ArtDirection` + `PageProgram` + media layer) with milestones M1–M7.
  - Measured on all 17 offerings at 1440×900: **97.4% of emitted CSS lines are byte-identical across all 17**, 65 CSS classes appear on all 17 pages, ten offerings share one eight-section tail, mean pairwise copy overlap is 64.4%, and 15 of 17 emit **no real image** (`free-assets.ts` reaches only `loom` and `herbarium`).
  - The committed craft score (0.989) is a specification-compliance score: running the repo's own `layout-audit` over the same pages finds a **1160×320 empty rectangle inside the corporate hero**, a vacancy in four other heroes, three repeated sentences, and a clipped label.
  - Root causes RC1–RC10 and the ten vocabulary ceilings, each with `file:line`. Also documents four phantom custom properties that silently break behaviour (`--m-ease-out`, `--nav-h`, `--content-wide`, `--t-small-size`), the boilerplate footer and missing mobile nav, and dead code (`observatory-signal` selector, `.ds-bento`, `ROLE_PROOF` ≡ `ROLE_PROOF_DISTINCT`).
- Add [`docs/17_AGENT_PLUGIN_DISTRIBUTION.md`](./docs/17_AGENT_PLUGIN_DISTRIBUTION.md): how Design Proof reaches **Codex, Cursor, Claude Code and Grok Build** from one engine — the honest per-host capability matrix (MCP install already ships for 19 hosts; craft delivery does not), the `@designproof/pack` renderer with its "no capability without an in-repo evidence file" rule, workstreams W0–W5, and the ordering judgement that the engine must land before packaging breadth.
- Registry honesty: [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md) §Plugins now records the decision and the per-host delivery status instead of "do not scaffold a plugin".
- [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md) and [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md) carry the two new feature rows and the reordered Next list. `.audit/` (render/screenshot/measure scratch) is git-ignored; reproduction commands are in docs/16 §9.

---

## 2026-10-05 — Fintech template says each thing once

- The fintech page drops the "also included" second band, the shared proof board, the send-path chapters, and the table under the lanes, so it goes from twelve sections to eight. The page is now first screen, one catalogue, product picture, lanes, questions, closing, footer.
- Each capability description is printed once. Before, some were printed four times (fold drawing, catalogue, proof drawing, proof list) and one was never printed at all, because the catalogue's tail went to a second band as bare names. The catalogue now holds every capability with its description.
- The first-screen ledger names each capability once with its tier. It no longer shows wire cut-off times, made-up exchange rates, "clearing" or "posted" states, or a "±0.4% tolerance" line. The rail under the menu now lists this page's own sections instead of clock times.
- Lanes name only what each one adds and print no billing terms. The questions and the closing line are built from the brief's own names. They no longer promise cancelling anytime, a person for procurement or security, or a human approval gate with a rollback path, and copy written for the sample treasury product ("wire, wallet, approval, FX") no longer lands on a marina's or a pottery studio's page. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 18–40 to 6–16, the lead capability name from 3–14 mentions to 2–6, and lines that read the same on every product's page from 35 to 13. Page height on the sample fell from 11097px to 5710px.
- New test: `packages/design-skills/src/__tests__/fintech-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-05 — Workspace (operator console) template says each thing once

- The workspace page drops the shared proof board, the step chart, and the comparison table, so it goes from eleven sections to eight. The page is now first screen, product picture, the workspace itself, one catalogue, questions, closing, footer.
- Each capability description is printed once. The first-screen console draws each name once without invented rank changes or minutes, and the catalogue now holds all capabilities instead of quietly showing three of five.
- The workspace shows each capability once with its state, with no made-up ages or "live" labels. Its counts are counts of the rows it shows. The empty message stays hidden until a filter is empty and no longer claims anything is "handled automatically".
- Questions and the closing line are built from the brief's own names and promise nothing the brief never gave (no timelines, cancellation terms, security, or procurement answers). Engine words such as layout names and contrast ratios no longer show on the page, and the page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 26–56 to 5–19 and the lead capability name from 6–23 mentions to 2–10. Page height on the sample fell from 9432px to 5369px.
- New test: `packages/design-skills/src/__tests__/workspace-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

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
- Registry lists only in-repo skills, the `designproof` MCP server, and no Cursor plugin package. No app code.

---

## 2026-08-26 — Captioned product demo

- Record and recapture the 5-beat product loop for README (~47s, captioned): capture → named tells → seam → voice → draft fix, then Studio and templates.
- Document the demo in README.

---

## 2026-08-25 — README as product surface + MCP training sink

- Rewrite README as a human-written product overview (masthead, one visual per concept, loop steps).
- Curate showcase stills and craft-reel policy so GitHub does not reprint the same fold twice.
- Recapture README media; ink-on-paper sidebar remains readable.
- MCP tools write training episodes through the shared `dp-design-data` sink when the sibling repo is present. Raw dumps → curated SFT/DPO is **not** closed (see PROJECT-STATUS).

---

## 2026-08-24 — Templates: Tiller, Lattice, Ember Gate

- Agent-harness **Tiller** hero-helm; turn list reads as a session, not a feature reprint (`#74`, `#75`).
- Lattice: drop orange Z through cards and pipeline title rail (`#62`).
- Ember Gate PATH ATLAS: walk, not a broken diagram (`#63`).
- Ground deterministic CTA note and workflow roles (`#73`).
- Public showcase/GitHub still flags **Tiller as missing** — in-repo template exists; the public gap stays open.

---

## 2026-08-21 – 2026-08-23 — Honesty and product-proof

- Phase 0–1 Studio honesty: instrument the SaaS-demo blind spot; connective author for `saas` / `demos` briefs (`#72`).
- Ungate the SaaS product-proof quality bar from the approve workflow; gate workflow-proof on approval language and seed accent hue.
- Un-nest soft-brand-accent mood so the live wash paints.
- Close MCP catalog honesty: **eleven** `designproof_*` tools (docs matched code; residual eight-tool claim removed).
- Settings and scenario matrix match real capture contracts.

---

## 2026-08-12 – 2026-08-18 — Template craft + product shell

- Shared DesignControls on Home and Studio; guard composer against third-party brand templates.
- Template craft audit: layout-audit clean across 16 briefs; vacancy slabs and alignment-axes collapse.
- Care pathway clinic template (Roundspool).
- Readable ink-on-paper product sidebar (`#64`).
- README templates, craft reels, and demo refresh.

---

## 2026-08-09 – 2026-08-11 — Matchday templates, skill graph, platform

- Crease (cricket) and Baseline (tennis) matchday templates from sport vernacular + domain research; score spine / nested sets; instant nav.
- Auto-trigger `website-domain-research` (and sport extension) on site builds; wire research, craft, and media skills into every template run.
- Unify product nav to one left sidebar; stop silent demo fallback when live capture fails; critic rail simplified; seam pins removed.
- Phase 9 uniqueness: archive / studio / foundry loops; strip shared marquee-proof; unique mid-page instruments (field key, press forme, observatory waterfall, lantern trail, loom care-tags).
- Multi-agent MCP install catalog (Cursor, Grok Build, and peers).
- Local training-data sink into sibling `dp-design-data` (Studio routes + later MCP); agency-run-learn vs end-user session learn split.

---

## 2026-08-07 – 2026-08-08 — Motion, lantern, first-five plumbing

- Kinetic motion template (Mote); lantern-path cinematic night-walk.
- Product-proof-stage skill (HTMX workflow proof for SaaS).
- First-five template plumbing: instruments fill the viewport; dead chips become controls.
- Phase 8 stretch: `designproof_resolve_intent` + Connect Agent UI — catalog stays at eleven tools.

---

## Earlier (through 2026-08)

Sprint MVP **M1–M10** and Phases **1–6** are closed: capture → fingerprint → 14 detectors → taste → Report/seam → voice → redesign diffs → MCP → proof verify → scenario matrix → auth harness. See [`PLAN.md`](./PLAN.md) and [`BUILD.md`](./BUILD.md).

Phase 7 premium craft floor, agency-quality pipeline, and most of Phase 8 (install-info, `designproof mcp install`, `designproof_voice`) shipped before the August template work. Remaining Phase 7 stretch (optional GSAP/Lenis + Rive) and Phase 9 dossier/consumer/marketing polish are still open in PLAN.md — they sit behind the items in PROJECT-STATUS.
