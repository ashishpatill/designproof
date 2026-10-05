# Tell Proof — project status

Snapshot: **2026-09-15**. Engineering contracts stay in [`BUILD.md`](../BUILD.md); remaining-work checklists stay in [`PLAN.md`](../PLAN.md). Agent-nav: [`AGENTS.md`](../AGENTS.md) → [`FEATURE-MAP.md`](./FEATURE-MAP.md) → one [`features/`](./features/) file. This page is the honest Done / Pending / Stuck / Needs / Next cut.

**What this product is:** a Cursor / Grok Build **plugin** for world-class site and app design across many sessions — observe, name, direct, repair, prove. Agents write code; Tell proves the UI.

**What this product is not:** a Studio web app as the thing to ship. `/studio` and `/showcase` are dogfood and specimens for the plugin loop.

**Attention:** secondary to **DeepHarness honesty**. Do not pull engineering focus here while DeepHarness honesty work is open.

**Quality bar (Tell Proof):** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## Done

Closed in git (see [`CHANGELOG.md`](../CHANGELOG.md)):

- Sprint MVP M1–M10 and Phases 1–6: deterministic capture → fingerprint → 14 detectors → taste → Report/seam → voice → redesign diffs → MCP → disposable proof → scenario matrix + auth harness.
- Eleven `tell_*` MCP tools; catalog honesty (docs ≡ code); `tell mcp install` for Cursor, Grok Build, and other hosts. `tell_apply` still returns patch text only.
- Design-skills engine + skill graph (research auto-trigger, craft nodes, media budgets). Agency pipeline + learn split (developer corpus vs end-user session).
- Specimens: 17 engine offerings plus Crease / Baseline matchday; Tiller hero-helm in-repo (`/showcase/harness`); Roundspool care pathway; Ember Gate path atlas; Lattice without the Z-stroke.
- Captioned 5-beat README demo (2026-08-26). Ink-on-paper product shell.
- Thin local training sink: Studio routes and (as of 2026-08-25) MCP writes into sibling `tell-design-data` when that checkout exists. Missing sibling ⇒ no-op.

---

## Pending

These are open even where partial code exists:

1. **Raw design dumps → curated SFT/DPO + MCP writes sink**  
   Writer exists; the loop is not done. Need reliable MCP writes, inbox ingest, and curated SFT/DPO JSONL in `tell-design-data` — not just raw episode files. Nothing in this repo should grow a collector. Do not commit training JSONL here.

2. **Continuous dogfood to the Studio bar**  
   Specimens and critique scores are not the same as staying at the bar: stacked images, motion, artistic, unique — across sessions, not a one-shot generate. Keep dogfooding the plugin path, not polishing `/studio` as a product.
   As of 2026-10-05 the repetition cause is known: each kind of site had a fixed section list, and every section read the whole capability list on its own. Two templates are revamped so each thing is said once and copy comes from the brief: SaaS, then the workspace (operator console) template. Fifteen remain, one at a time, worst first; fintech measured as the next worst. The workspace product picture is still a tall, mostly empty dark band because of shared styling that every template uses.

3. **Tiller missing from showcase / GitHub**  
   Still open. In-repo page and a README still exist; the public surface still does not present Tiller as a first-class offering. Do not treat `#74` / `#75` as closing this.

---

## Stuck

- **Eng attention parked** on DeepHarness honesty. Tell Proof work (including the pending items above) waits until Ashish unblocks.
- **Tiller public gap** is stuck on a definition: in-repo specimen exists; “missing from showcase/GitHub” is not a code path we can close without Ashish naming the miss.
- **Training sink** is stuck on a real `tell-design-data` sibling to prove curated SFT/DPO — not on more writer code in this repo.

---

## Needs from Ashish

Cannot be guessed from the repo:

- **DeepHarness vs Tell Proof:** confirm when Tell is allowed to take eng attention again.
- **Tiller public gap:** what “missing” means now (GitHub README still, `/showcase` filmstrip order, name on the fold, craft reel, or all of the above).
- **`tell-design-data`:** sibling path / access so raw → curated SFT/DPO can be verified; whether MCP sink writes are actually landing.
- **Bar confirmation:** stacked images + motion + artistic + unique is the pass condition — not a higher critique score on a nav crop.
- **Plugin-first:** keep treating Cursor / Grok Build as the product surface; do not ask for a Studio-web redesign unless that is an explicit override.

---

## Next

Order assumes DeepHarness honesty still owns eng attention. When Tell is unblocked:

1. Close the **Tiller** showcase / GitHub presentation gap (docs + media first if that is the miss; craft only if the specimen itself fails the bar).
2. Prove **raw → curated SFT/DPO** with MCP writes against a real `tell-design-data` sibling (no collector in this repo).
3. **Dogfood the plugin** on real multi-session site/app work until the bar holds: stacked images, motion, artistic, unique.
4. Only then pick leftover PLAN.md items (Phase 9 dossier/consumer polish; optional motion runtimes).
