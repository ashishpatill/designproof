# Design Proof — project status

Snapshot: **2026-10-06**. Engineering contracts stay in [`BUILD.md`](../BUILD.md); remaining-work checklists stay in [`PLAN.md`](../PLAN.md). Agent-nav: [`AGENTS.md`](../AGENTS.md) → [`FEATURE-MAP.md`](./FEATURE-MAP.md) → one [`features/`](./features/) file. This page is the honest Done / Pending / Stuck / Needs / Next cut.

**What this product is:** a Cursor / Grok Build **plugin** for world-class site and app design across many sessions — observe, name, direct, repair, prove. Agents write code; Design Proof proves the UI.

**What this product is not:** a Studio web app as the thing to ship. `/studio` and `/showcase` are dogfood and templates for the plugin loop.

**Attention:** secondary to **DeepHarness honesty**. Do not pull engineering focus here while DeepHarness honesty work is open.

**Quality bar (Design Proof):** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## Done

Closed in git (see [`CHANGELOG.md`](../CHANGELOG.md)):

- Sprint MVP M1–M10 and Phases 1–6: deterministic capture → fingerprint → 14 detectors → taste → Report/seam → voice → redesign diffs → MCP → disposable proof → scenario matrix + auth harness.
- **Design engine quality (the generator).** M1 of [`docs/16`](./16_DESIGN_ENGINE_QUALITY.md) landed 2026-10-06: the repo now measures its own output with two instruments instead of one, and reports what it finds. Layout audit + a cross-offering distinctness ratchet are in `pnpm test`; a capability is named at most twice per screen. M2–M7 (the actual art-direction layer) not started.
- **Eleven `designproof_*` MCP tools; catalog honesty (docs ≡ code); `designproof mcp install` for Cursor, Grok Build, and other hosts. `designproof_apply` still returns patch text only.**
- Design-skills engine + skill graph (research auto-trigger, craft nodes, media budgets). Agency pipeline + learn split (developer corpus vs end-user session).
- Templates: 17 engine offerings plus Crease / Baseline matchday; Tiller hero-helm in-repo (`/showcase/harness`); Roundspool care pathway; Ember Gate path atlas; Lattice without the Z-stroke.
- Captioned 5-beat README demo (2026-08-26). Ink-on-paper product shell.
- **Renamed to Design Proof, gallery to Design Templates** (2026-10-06) — brand, package scope `@designproof/*`, CSS prefix `dp-`, `--dp-*` tokens, `data-dp-*` attributes, `DP_*` env vars, `dp:*` storage keys, `designproof_*` MCP tools, CLI, docs, comments and paths. The domain noun *tell* and detector names ending in `Tell` are kept deliberately. Hosts holding `TELL_*` env vars need the `DP_*` names before the next deploy.
- **Review workspace rebuilt around the loop** (2026-10-06) — Home is a two-column composer + four-beat loop surface; the project workspace is three panes (Findings / Direction / Proof) over a scroll-bounded, verdict-filterable findings list with a docked inspector; Studio pins its preview and folds engine internals into an *Engine detail* panel; the templates gallery filters by job family; the report handoff page carries score, capture and per-finding verdicts. Shared primitives live in `apps/web/src/components/shell/layout.css`.
- Thin local training sink: Studio routes and (as of 2026-08-25) MCP writes into sibling `dp-design-data` when that checkout exists. Missing sibling ⇒ no-op.

---

## Pending

These are open even where partial code exists:

1. **Design engine quality (the generator)** — diagnosed 2026-10-05. **M1 landed 2026-10-06**; M2–M7 not started.
   [`docs/16_DESIGN_ENGINE_QUALITY.md`](./16_DESIGN_ENGINE_QUALITY.md) measures the 17 offerings:
   97.4% of emitted CSS lines are shared by all of them, ten share one eight-section tail, 15 of 17
   emit no real image, the footer is byte-identical boilerplate, and the committed craft score was
   high while the repo's own layout audit found a 1160×320 void inside the corporate hero.
   **M1 closed the measuring gap, not the design gap.** Two instruments now run — craft **97.8** and
   art-direction **85.5** (holdout 91.1 / 55.0) — the layout audit and a cross-offering distinctness
   ratchet are in `pnpm test`, and a capability can no longer be named more than twice on one screen
   (it was 3–6× in 50 places). What is left is the actual layer: `ArtDirection` + `PageProgram` + the
   media system (docs/16 §5, M2–M4). Baseline in
   [`research/LOOP_LEDGER.md`](../research/LOOP_LEDGER.md).
   **This supersedes item 2 below as the root cause.**

2. **Raw design dumps → curated SFT/DPO + MCP writes sink**  
   Writer exists; the loop is not done. Need reliable MCP writes, inbox ingest, and curated SFT/DPO JSONL in `dp-design-data` — not just raw episode files. Nothing in this repo should grow a collector. Do not commit training JSONL here.

3. **Agent plugin distribution to Codex / Claude Code / Grok Build** —
   [`docs/17_AGENT_PLUGIN_DISTRIBUTION.md`](./17_AGENT_PLUGIN_DISTRIBUTION.md). MCP install for 19
   hosts already ships; what does not is Design Proof's craft reaching those hosts (skills, rules,
   instructions) or a `@designproof/pack` renderer. Deliberately second to item 1: a plugin that generates
   generic pages in four editors is not progress.

4. **Continuous dogfood to the Studio bar**  
   Templates and critique scores are not the same as staying at the bar: stacked images, motion, artistic, unique — across sessions, not a one-shot generate. Keep dogfooding the plugin path, not polishing `/studio` as a product.
   As of 2026-10-05 the repetition cause is known: each kind of site had a fixed section list, and every section read the whole capability list on its own. Ten templates are revamped so each thing is said once and copy comes from the brief: SaaS, then the workspace (operator console) template, then fintech, then the art-directed studio, then corporate, then the archive index, then the educational (mechanism explainer) template, then the field guide (herbarium), then the signal observatory, then the editorial foundry. Seven remain, one at a time, worst first; the press atelier now measures as the next worst, with the merchandising loom, the consumer page, and the research dossier close behind. The observatory and corporate samples still show a sports menu (Home, Live, Scorecard …) because the shared sport detector matches "bracket" as tennis ("racket") and "principles" as cricket ("ipl"); fixing it changes the corporate sample, so it is left for its own change. The studio register still pins for a long scroll on purpose, which leaves a tall quiet stretch under its last row. The workspace product picture is still a tall, mostly empty dark band because of shared styling that every template uses.

5. **Tiller missing from showcase / GitHub**  
   Still open. In-repo page and a README still exist; the public surface still does not present Tiller as a first-class offering. Do not treat `#74` / `#75` as closing this.

---

## Stuck

- **Eng attention parked** on DeepHarness honesty. Design Proof work (including the pending items above) waits until Ashish unblocks.
- **Tiller public gap** is stuck on a definition: in-repo template exists; “missing from showcase/GitHub” is not a code path we can close without Ashish naming the miss.
- **Training sink** is stuck on a real `dp-design-data` sibling to prove curated SFT/DPO — not on more writer code in this repo.
- **Design engine rewrite scope** is stuck on a decision: [`docs/16`](./16_DESIGN_ENGINE_QUALITY.md) M2–M4 replace the top of the generation pipeline (`planSections` → `ArtDirection` + `PageProgram` + media). **M1 has now landed alone** (2026-10-06) — instrument honesty, the six reader-visible defects, and the two score instruments — so the question is now purely whether M2–M4 start.

---

## Needs from Ashish

Cannot be guessed from the repo:

- **DeepHarness vs Design Proof:** confirm when Design Proof is allowed to take eng attention again.
- **Tiller public gap:** what “missing” means now (GitHub README still, `/showcase` filmstrip order, name on the fold, craft reel, or all of the above).
- **`dp-design-data`:** sibling path / access so raw → curated SFT/DPO can be verified; whether MCP sink writes are actually landing.
- **Bar confirmation:** stacked images + motion + artistic + unique is the pass condition — not a higher critique score on a nav crop. M1 measured the gap and it is total on imagery: `raster-images` scores 0 on 16 of 17 offerings, against a corpus median of 42. Confirm the bar is unchanged.
- **Design-engine scope:** M1 only (instrument honesty, days), or M1–M4 (art-direction layer, the real fix, sessions)? See [`docs/16 §8`](./16_DESIGN_ENGINE_QUALITY.md).
- **Imagery licence:** is a committed licence-clean photographic base library acceptable in-repo, or must every asset come from the user's project?
- **Plugin breadth:** is the first plugin release allowed to ship Codex / Claude Code / Grok Build with MCP + instruction file only, or must every host get skill files before release? See [`docs/17 §8`](./17_AGENT_PLUGIN_DISTRIBUTION.md).
- **Attribution rule:** do the repo's anonymisation rules apply to the *benchmark* research too, or may surveys cite named studios?
- **Plugin-first:** keep treating Cursor / Grok Build as the product surface; do not ask for a Studio-web redesign unless that is an explicit override.

---

## Next

Order assumes DeepHarness honesty still owns eng attention. When Design Proof is unblocked:

1. **M2 — `ArtDirection` schema + deterministic director** ([`docs/16` §6](./16_DESIGN_ENGINE_QUALITY.md)).
   M1 is landed, so the problem is visible and measured rather than argued. This is the first piece of
   the layer the bar actually needs: every one of the 17 offerings gets a written thesis and a fold
   decision naming what owns the first screen. That is also the fix for the six vacancies still open in
   the layout-audit gate — a fold that names a dominant element is a fold with no hole in it.
2. **Then M3–M4** — `PageProgram` compiler (breaks the ten-of-seventeen shared tail) and the media
   system (`raster-images` scores 0 on 16 of 17; the corpus median is 42). This is the actual fix for
   "generic designs" and it is what makes the plugin worth distributing.
3. Prove **raw → curated SFT/DPO** with MCP writes against a real `dp-design-data` sibling (no collector in this repo).
4. Ship [`docs/17`](./17_AGENT_PLUGIN_DISTRIBUTION.md) W1–W3 — `@designproof/pack` and the Codex / Claude Code / Grok instruction surfaces.
5. Close the **Tiller** showcase / GitHub presentation gap.
6. **Dogfood the plugin** on real multi-session site/app work until the bar holds: stacked images, motion, artistic, unique.
7. Only then pick leftover PLAN.md items (Phase 9 dossier/consumer polish; optional motion runtimes).
