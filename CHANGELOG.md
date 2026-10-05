# Changelog

Notable Tell Proof work, newest first. Dates follow `git log`. This is not a semver release log.

Tell Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions — an independent critic and craft layer beside the coding agent. It is not a Studio web app as the product.

**Quality bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## 2026-10-05 — Corporate template says each thing once

- The corporate page drops the specimen strip of bare capability names, the shared proof board, the "also included" second band, and the "what is included" table whose own lede called it "the same list as above", so it goes from ten sections (eleven on a five-capability brief) to seven. The page is now first screen, one catalogue, priorities, questions, closing, footer.
- Each capability description is printed once. Before, some were printed three times (fold drawing, catalogue, proof board), and on a five-capability brief one capability had no catalogue row at all. The catalogue now holds every capability; the lead row stays a bare name because the first screen already uses its sentence, and there is no second drawing beside the first row listing every name again.
- The first-screen posture grid names each capability once, up to six, with no descriptions, no "diligence posture" title, and no "Principle 01" labels. The spine beside it lists this page's own sections instead of the first four capability names.
- The chapters now group the work by the priority the brief gives (core, supporting, additional) and say how many capabilities sit in each, instead of listing every name again under "language, principles, outcomes, posture — the diligence path in order". With a single priority the section is left out.
- The questions and the closing line are built from the brief's own names. They no longer promise cancelling anytime, a result in "one session" on your data, a comparison table, a person for procurement and security, a human approval gate, or a rollback path. The approval question stays only when the brief itself declares an approval step, and its answer names that capability. The close no longer says "see it against your own material" or "one conversation", and the first screen no longer says "everything here is verifiable before you commit". The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–33 to 3–6, the lead capability name from 2–10 mentions to 2–4, lines that read the same on every product's page from 23 to 5, and lines copied word for word from other templates from 21–44 to 4–20. Page height on the sample fell from 8136px to 3899px.
- New test: `packages/design-skills/src/__tests__/corporate-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-05 — Studio template says each thing once

- The art-directed studio page drops the raised band of bare capability names, the specimen strip that drew them again as numbered stages, the step chart with its "cost · cumulative" axis, and the "also in practice" second band, so it goes from eleven sections to seven. The page is now first screen, one selected-work register, the order of work, questions, closing, footer.
- Each capability description is printed once. The register holds every capability; the lead row stays a bare name because the first screen already uses its sentence. The register no longer has a second drawing beside its first row that listed every name again.
- The first-screen work board names each capability once. Spare plates stay blank instead of naming the first capabilities a second time, and the board no longer reads "selected work · method board" or "plates · handoff-safe".
- The method chapters now group the work by the priority the brief gives (first, next, alongside) instead of listing every name again as "Step 01" to "Step 06". With a single priority the section is left out.
- Copy written for the sample design studio no longer lands on every studio page: "we take a few engagements at a time", "work that still holds after the launch week", "identity, product, and motion under one grid", "without the pitch theatre", and "see it against your own material". The questions and the closing line are built from the brief's own names, and no longer promise cancelling anytime, point at a comparison table the page never draws, or offer a person for procurement and security. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–36 to 3–8, the lead capability name from 4–13 mentions to 2–4, and lines that read the same on every product's page from 28 to 8. Page height on the sample fell from 7745px to 4975px.
- New test: `packages/design-skills/src/__tests__/studio-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

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
