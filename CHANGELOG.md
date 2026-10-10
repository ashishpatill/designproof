# Changelog

Notable Design Proof work, newest first. Dates follow `git log`. This is not a semver release log.

Design Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions — an independent critic and craft layer beside the coding agent. It is not a Studio web app as the product.

**Quality bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## 2026-10-06 — Design engine M1: the repo now measures itself honestly

[`docs/16_DESIGN_ENGINE_QUALITY.md`](./docs/16_DESIGN_ENGINE_QUALITY.md) diagnosed the generator on
2026-10-05 and left M1 open: make the repo report the truth about its own output before building
anything. M1 has landed. It did not make the pages better — it made the remaining work measurable.

**Two instruments instead of one.** The craft score reads populations of scalars the generator sets
itself, so it read 0.989 on a page with a 1160×320 hole in its hero. It is still reported (as
`overall`, unchanged for existing readers) and it is still a *compliance* number. Alongside it,
`ART_DIRECTION_DIMENSIONS` scores eight things no token tweak can satisfy: an element that owns the
fold, distinct matter above it, room-shape variety, the longest repeated room run, coverage change
down the scroll, distinct matter on the page, photographs, and repeated-drawing share.

> craft **97.8** · art-direction **85.5** · holdout 91.1 / **55.0** (craft gap 6.7 pts, so the harness
> still prints OVERFIT; the direction gap is much wider, which is the honest signal that sixteen tuned
> briefs are composed and the untuned one is not)

`pnpm research:critique` prints both and `research/critique.json` carries `.instruments`,
`.artDirection`, and per-page `artRows`. The art-direction bands are hand-set — no corpus run has
measured them yet.

**The layout audit is in `pnpm test`, and it agrees with the operator command.** It did not before:
the gate silently dropped any vacancy whose fill was ≥ 0.6, a threshold nobody had chosen, while
`pnpm research:audit` was reporting 6 defects. Both now use the probe's own thresholds, both scroll
before probing, and the six open vacancies are enumerated in the gate by offering and section so the
count cannot grow silently. They are `dashboard` hero 500×480, `corporate` 1160×320, `fintech`
1160×260, `studio` features 960×260, `consumer` figure 540×300, `foundry` hero 440×360 — all
fold-composition problems, which is what M2's `ArtDirection.fold` is for.

**A capability is named at most twice on one screen.** It was 3–6× across 50 (offering, section)
pairs. Every instance turned out to be **one list rendered twice**:

- `interfacePlate` fed one `rows` list into both its view rail and its table rows — a working surface's
  rail and its rows are different things, and using one list for both printed every name three times
  inside a single plate.
- The app shell set its view list (`aside`) and its row list (`blocks`) from the same capability names.
- Cut slips and cross stamps listed *sibling* titles, so a five-beat essay set each title five times.
- The index ledger and loom weave **cycled** the feature list with `idx % base.length` to fill cells.
- `queueConsole`'s panel heading fell back to the literal phrase "Operator console" — a stock tell the
  repo's own copy tests ban.

**Six more defects a reader would have seen.** The `harness` turn tape clamped its longest label
mid-sentence (a 2-line clamp inside a hard 88px rail, when the beat needs three lines).
`corporate-story` painted its diligence lede three times — the fold writes it from its first pillar's
sentence, and the catalogue/proof dedupe that prevents that was restricted to two site kinds, so it is
now general. `featuresTitle` interpolated the first capability into the heading directly above the index
printing that name. The features body kept reprinting its own title when no description was set. The
`[data-sitekind="observatory-signal"]` selector never matched anything — the emitted value is
`signal-observatory`.

**Dead code deleted, one claim withdrawn.** `ROLE_PROOF_DISTINCT` was byte-identical to `ROLE_PROOF`,
so the branch that consulted it was a no-op that read as if a distinction were being made.
`.ds-bento` was **kept** despite §5.5 calling it dead: it is unreachable from all 17 *plans*, but
`renderFeatures` still implements the `feature-bento` layout, so deleting it removes a capability
rather than dead code.

**One measurement did not land, and the doc overstated its premise.** The drawn-matter re-score
fingerprints every drawing with its text stripped, so a mark differing only in its caption counts once.
`repeatedFigureAreaRatio` comes out **0 on all seventeen pages** and distinct-matter at 100/100 —
because `capabilityMark(b, i, seed)` is seeded per block *and* per index, the repeated stamps share
dimensions but are structurally different drawings. §1.3 / RC5's "repeated marks earn drawn matter"
does not survive a stricter test. The probe stays (it catches a genuine paste), and §1.3 is now marked
as a visual observation rather than evidence that the metric is gamed.

**Cross-offering distinctness, as a ratchet.** Three floors pinned to measurement: 2 772 of 3 092 CSS
lines shared (89.7%), 10 of 17 offerings on one room skeleton, 8 of 17 type voices with the largest
group at 5. Measuring the skeleton properly — collapsing the hero and story positions, which is where
the two legitimate per-offering differences live — **confirms** §1.2; keying on `id:layout` reports
17/17 distinct and is how the claim came to look wrong. The floors sit at or above the measured values
deliberately: a ratchet pinned below reality is a test that cannot fail, and a test that cannot fail is
how the 0.989 happened.

Verification: **328 tests pass across 49 files**, `pnpm typecheck` clean, `pnpm research:audit` reports
its 6 enumerated vacancies, `pnpm research:critique` reports both scores. Baseline and side effects
recorded in [`research/LOOP_LEDGER.md`](./research/LOOP_LEDGER.md).

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
