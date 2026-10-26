# Changelog

## 2026-10-26 — Local MCP durable raw/design dump prove

- Added `packages/mcp/src/mcp-prove-dump.local.test.ts`: one Model Context Protocol call through `tell_design_from_features` writes a durable JSON under `.mcp-prove-sink/training-data/raw/design/` with `kind: design` and `meta.via: mcp.tell_design_from_features` (same path shape as Studio `/api/design`).
- `.gitignore` ignores `.mcp-prove-sink/` so prove dumps stay on disk only. Catalog stays eleven; local stdio only; no new tool.

## 2026-10-25 — DesignProof-owned diagram runtime skill lands under `.cursor/skills`

- Added `.cursor/skills/designproof-diagram/SKILL.md`, written here from learned patterns — nothing vendored, submoduled, or installed from an external diagram skill. It is a **craft skill**, not the generate path and not an MCP tool: the catalog stays at eleven.
  - Four kinds only — flow, before/after, layer stack, timeline — each with the claim it makes, when to pick it, and when to reject it. No fifth kind; when none of the four makes the claim, the skill says write prose.
  - Hand-authored inline SVG + HTML on DesignProof tokens (`#181614` paper, Instrument Serif / Source Sans 3 / IBM Plex Mono, terra `#D4714A`), with measured ink ratios on dark: `paper-100` 15.5:1, `paper-300` 11.1:1, `paper-400` 7.9:1, `paper-500` 5.2:1 floor, `--accent` 5.4:1; `paper-700` (2.2:1) and `paper-800` (1.5:1) are lines and fills only, never text.
  - Readable-at-360 px is stated as arithmetic: a 560-wide plate renders at 0.59 on a phone, putting an 11 px label at 6.4 px — author at phone width or raise the label. 0 KB of JavaScript, no Mermaid/D3/Rough.js/svg.js/auto-layout library, one accent per figure, `role="img"` plus a one-sentence `aria-label`.
  - Named real surfaces: Studio concept card (`apps/web/src/app/studio/page.tsx`), proof dossier (`research-dossier` in `packages/design-skills/src/templates.ts` plus `dossierPlate` in `figures.ts`), Tell Report (`apps/web/src/app/report/[id]`, `BeforeAfterSeam.tsx`).
  - Handoff runs the existing gate on the page that embeds the figure — `designproof-anti-slop` / `tell_proof_verify`, triaging `newTells` and `bannedTellsAfter` before the score delta, with `tell-gray-mush`, `tell-radius-monotone`, `tell-blank-stretch` and `tell-system-font` called out as the figure-side rows that actually fire. No new MCP tool.
- `.gitignore` allowlists `.cursor/skills/designproof-diagram/` and `**` alongside the two taste skills.
- `docs/skills/README.md` marks diagram as a landed runtime skill with a stub that stays as the plan; `docs/skills/designproof-diagram.md` gains a one-line runtime-twin note. Demo/promo remains docs-only.
- No dossier template, generate path, `packages/` code, or MCP catalog change in this PR.

## 2026-10-25 — `tell_proof_verify` accepts generated preview HTML

- Phase 5 cut-if-short (proof input only): `tell_proof_verify` still one of the eleven Model Context Protocol tools, now with two input shapes — patch mode `{ url, patch }` (unchanged) or preview mode `{ previewHtml, spec? }` from `tell_design_from_features` / specimen HTML.
- Core adds `verifyProofPreview` + `listenPreviewHtml`: serve HTML on an ephemeral `127.0.0.1` listener (same pattern as research shots), capture once, run the existing gate. No before baseline → `scoreDelta` is 0 and the honest ceiling is `review` unless a banned frame tell fails the gate.
- MCP runs `checkPreviewBudgets` before Playwright; oversized / insecure / missing-viewport previews fail fast. Optional `spec` is recorded on the training dump only (no second generate path). Swap-test hard gate left for a follow-up.
- Runtime skill `.cursor/skills/tell-proof-verify` documents the preview args. Catalog stays eleven; local stdio only.
- Preview-mode unit tests stub `captureUrl` so the browserless `verify` CI job stays green without `playwright install`.

## 2026-10-25 — Phase 0 baseline harness measures every generated preview

- Added `pnpm measure:previews`, which renders all 18 catalog offerings through `designFromFeatures`, runs `checkPreviewBudgets`, and writes `research/measurements/baseline-YYYY-MM-DD.json` (per-preview bytes, script tags, viewport meta, `http://` assets, pass/fail, failure finding ids).
- Recorded the first baseline on `67a2800`: 18 previews, 0 budget failures, largest `press` at 381,062 B; `pnpm test` 661 passed / 69 files; dossier plate 748/800 desktop and 798/844 mobile; one reduced-motion dossier screenshot hashed (PNG stays local). `cutIfShort: true`, INP helper skipped.
- `pnpm test` now exercises the same measurement path (7 cases), so a renderer or budget change cannot quietly invalidate the committed baseline.
- `.gitignore` re-opens only `research/measurements/*.json` for anonymised baselines; third-party `ref-*` dumps, the manifest, and the rest of `research/` stay local. No MCP tools added — the catalog stays at eleven.


## 2026-10-24 — DesignProof-owned taste skills land under `.cursor/skills`

- Added two runtime agent skills, both written here from learned patterns — nothing vendored, submoduled, or installed from an external taste skill:
  - `.cursor/skills/designproof-taste-loop/SKILL.md` — subject inventory → one-sentence idea → one dealt direction → credited imagery, with the cover-the-logo and swap-the-name tests, then a handoff to measurement. Explicitly separates DesignProof's own chrome (DESIGN.md) from a generated site's direction.
  - `.cursor/skills/designproof-anti-slop/SKILL.md` — how agents read a finding and the dated tells registry, run `tell_proof_verify`, triage `newTells` / `bannedTellsAfter` before the score delta, replace a tell by procedure, use the bounded critique, and keep failing fixtures honest.
- Updated `.cursor/skills/tell-proof-verify/SKILL.md` for #108: the four frame finding ids and which two fail the gate, `bannedTellsBefore/After` and `newTells`, and the `critique` block (`maxRounds`, `roundsUsed`, `rounds`, `screenshots`, `source`, `nextAction`, 3 rounds × 3 fixes, frame-first ranking). No new MCP tool; the catalog stays at eleven.
- The tells registry gets no runtime twin: its rows stay in `packages/core/src/detectors/tells-registry.ts`, the human read stays in `docs/skills/designproof-tells-registry.md`, and the anti-slop skill links to both.
- `docs/skills/README.md` now records which stubs have a runtime home. The stubs stay as the plan of record; `designproof-diagram` and `designproof-demo-promo` remain docs-only.

## 2026-10-24 — Frame / multi-width tells and bounded critique in `tell_proof_verify`

- Added four frame tells that read rendered boxes and first-fold samples, not screenshot bytes or a model: `TitleOnFoldTell` (`tell-title-on-fold`), `FrameGutterTell` (`tell-frame-gutter`), `BlankStretchTell` (`tell-blank-stretch`), `MobileFirstScreenTell` (`tell-mobile-first-screen`). Each finding carries deterministic `facts`, evidence (including a screenshot region), and a `fixHint` procedure.
- `TitleOnFoldTell` and `MobileFirstScreenTell` are registry **bans**: `verdictFromProof` now fails the gate while the after capture still ships either one, even if the score improved. `FrameGutterTell` and `BlankStretchTell` warn.
- Capture records a `FirstFold` sample per viewport (`capture.fold`, `viewportMatrix[].fold`): text characters, headings, buttons, media coverage, largest type, primary-title box, horizontal overflow. Older fixtures without a fold stay silent — no retro-failing.
- Added the dated tells registry (`packages/core/src/detectors/tells-registry.ts`, rendered in `docs/skills/designproof-tells-registry.md`): ban/warn, `since` date, `enforcedInProof`, and a replacement *procedure* per row — no fixed font/colour recipes.
- Added bounded critique scaffolding in `packages/taste` (`planCritiqueRounds`, `closeCritiqueRound`, caps 3 rounds × 3 fixes) and attached a `critique` block to the `tell_proof_verify` result: `maxRounds`, `roundsUsed`, planned rounds, cited screenshot paths written to disk, `nextAction`. No new MCP tool — the catalog stays at eleven.
- Failing fixtures and clean specimens for all four tells; taxonomy fixture rows T10–T13; the existing 14-detector golden set is unchanged.


## 2026-10-18 — Research-dossier responsive plate fix

- Mobile (max-width:800px): emit a second taller dossier-plate variant (640x480, 4:3) shown only on mobile, with legible labels at 390px; desktop 1440x320 wide-shallow plate and CSS unchanged.

## 2026-10-18 — Research-dossier plate visual full-width fix

- Desktop (min-width 801px): widened the dossier-plate coordinate space (1440×320) and removed the bleed inset so the plate fills the fold width at a uniform scale with capped height <=36vh instead of letterboxing; mobile 390 and other templates unchanged.

## 2026-10-18 — Research-dossier desktop plate full-width fix

- Desktop (min-width 801px): `.ds-folio-plate .ds-fig` now spans full content width (`width:100%`) with capped height (`max-height:36vh`) instead of shrinking to its intrinsic aspect; SVG preserveAspectRatio keeps the drawing legible.

## 2026-10-18 — Research-dossier desktop first-screen fix

- Desktop (min-width 801px): capped the dossier thesis-map plate figure height (max-height 36vh) and tightened the folio claim padding so masthead, headline, lede, CTA and the full plate fit within the first screen at 1280x800; hero min-height no longer forces the plate below the fold. Dossier-gated only.
- Kept chapter-rail calc fix, mobile 390 first-screen behaviour, and typographic Priorities (no grey bars).

## 2026-10-18 — Research-dossier specimen polish

- Chapter rail: widened `--chapter-rail` by the gutter so the numbered rail (numbers + vertical labels) sits fully inside the desktop viewport instead of clipping at the right edge.
- Mobile (390): tightened folio hero spacing and let the dossier plate use its natural aspect (no forced min-height) so headline, lede, CTA and the plate show in the first screen without shrinking text.
- Priorities: removed grey placeholder thumbnail bars/marks from the dossier priorities section, leaving typographic rows; dossier-gated only.

## 2026-10-18 — Dossier rebuild through staged concept-first flow

- Rebuilt the research-dossier template/specimen around the `research-dossier` concept (folio masthead with chapter rail) using the staged primitives: explicit `ink-paper` theme from `THEMES`, concept attached to the spec, theme accent/paper driving tokens.
- Added optional `theme` to `DesignBrief` and `DesignTemplate`; dossier template carries `theme: "ink-paper"` and `brief.theme`.
- `designFromFeatures` now resolves theme from `options.theme ?? brief.theme` and overrides token paper with the theme paper.
- Showcase/API routes pass `template.theme` when generating dossier HTML.
- Added staged rebuild plan at `/workspace/designproof-revamp-verification/dossier-rebuild/plan.md`.

Notable Tell Proof work, newest first. Dates follow `git log`. This is not a semver release log.

## 2026-10-18 — Studio first-screen staged panel + SaaS rail labels

- Moved the Studio concept-first staged-run panel directly under the page header so theme picker, concept card, and stage Approve controls are visible without scrolling at 1280 and 390.
- Improved staged panel spacing and responsive stacking (no tiny 3-column squeeze on mobile).
- SaaS specimen queue console no longer clips rail labels (Account scoring, Pipeline coaching, Territory modelling render in full).
- Swap result now states the ≥50% pass threshold and 0% for identical input; removed unsupported 83% wording.

Tell Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions — an independent critic and craft layer beside the coding agent. It is not a Studio web app as the product.

**Quality bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## 2026-10-16 — Docs point to the redesign plan (proposed, nothing built)

- Docs across the repo now link the [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) and mark its changes as proposed, waiting on Ashish in BIM-203: a design process in reviewed stages with an imagery stage, one plugin tool per stage (11 tools to 19, not built), a colour theme setting, and an automated swap test.
- The template pull requests #95 to #102 stay open and on hold. No code changed in this entry.

## 2026-10-15 — Merchandising loom template says each thing once

- The merchandising loom page drops the figure band (which set the line names twice more beside a "cost · cumulative" chart with made-up values under "how X weaves a cut") and the specimen band, which printed the names again under "X loom field". It goes from nine sections to seven: first screen, one index, the hangtags (priorities), questions, closing, footer.
- Each line description is printed once, in the index. Before, the first screen put the audience over the claim and the lead description under it, the index printed bare names (four of them on the sample's six-line brief) beside a "how it is put together" list that named them again, and the hangtag essay printed every description a second time. The index now holds every line, numbered "01" onward like the cloth on the first screen, each with its sentence. Its title is the product's own ("Kilnroom, line by line") instead of "Lines a merchandising loom actually cuts", and the "not a product card dressed as merchandising" lede is gone.
- The cloth on the first screen names each line once, in its own cell, with its number. It used to cycle the names through all six cells, so a three-line brief drew each name twice, with a made-up SKU number in every cell ("Sku 100"), under a "Loom · warp × weft" head with the product name again in the middle and a foot that named the product a third time beside "6 cells · free textile stock". Spare cells keep their photo and stay unnamed, and the head reads "Lines 01–05" for five lines. The treadles have one "Line 01" chip per line, each jumping to its row in the index, instead of XS to XXL pointing at bands the page did not always have; the loom beam reads "Lines 01–05" instead of "Shed · warp × weft". The fold has one button, "Open the loom", and no note.
- The hangtags group the lines by the priority the brief gives (core, supporting, additional), one tag per tier, numbered I, II, III so a tier never reads as a line number. Each tag names its lines once, and its note gives their numbers ("Lines 01, 02"), each jumping to its row. The size tape above the tags counts the lines per tier ("2 lines") instead of naming every line again. The "Note 01" labels and the drawing on every tag are gone, and so are "how a hangtag is actually cut", "eyelet, size tape, and the notes that keep a cut honest", and "5 tags · size tape". The drawn pages under the tags are one per line, numbered like the index. With a single priority the hangtags are left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Start the Kilnroom loom with kiln calendar." and "Four more lines are woven into the index above." instead of "Cut a sample from Kilnroom." and "Size tapes, SKU cells, and the lines … actually cut." The buttons read "Open the loom" and "Read all five lines" instead of "Request a cut" and "Walk the loom", and the authored path no longer hides "Samples ship with size tape and SKU cells — not a demo theatre" on the fold. An approval question appears only when a line does the approving ("approve", "approval", "sign-off"). The menu reads Lines, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("commerce-loom surface … 9 sections built from 6 declared capabilities").
- On four sample briefs, repeated lines fell from 10–27 to 2–5, the lead line name in the page text from 11–13 mentions to 4–5 on the sample, marina, and pottery briefs, lines that read the same on every product's page from 25 to 3, lines copied word for word from other templates from 14–34 to 2–18, and the most times one description is printed from 2 to 1. Page height on the sample fell from 8552px to 5544px. The craft critique for the loom moved from 99.8 to 99.2, mostly because its sections are now closer in weight and it has fewer overlapping layers.
## 2026-10-15 — Consumer craft template says each thing once

- The consumer craft page drops the metrics band (which listed the capability names as bare values beside truncated descriptions), the specimen band, and the figure band (a "cost · cumulative" chart with made-up values under "how it works" / "step through the mechanism"). It goes from ten sections to seven: first screen, one register, the order of use (priorities), questions, closing, footer.
- Each detail description is printed once, in the register. Before, the first screen printed the lead description, the register printed every description again, the fold's product surface printed truncated sentences in its table and detail panel, and the "A day with X" chapters printed them a third time under "from morning pack to evening empty" — a line written for one sample bag. The register now holds every detail, each with its sentence (the lead's sentence stays on the fold and is left blank in its row). Its title is the product's own ("The six details of Harborline") instead of "Built for the day you actually have", and the "not a lifestyle claim" lede is gone.
- The fold's product surface names each detail once in its rail and does not reprint descriptions. A stack figure that used to sit beside the first register row (listing every name again) is gone. The fold note "Ships when the batch is ready — no waitlist theatre" is gone.
- The order of use groups the details by the priority the brief gives (first, next, alongside). With a single priority the section is left out.
- The questions and the closing line are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Start with kiln calendar at Kilnroom." and "Four more details sit in the list above." instead of "Put Kilnroom in front of your studios." and "Five capabilities, one conversation." The menu reads Details, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("consumer-craft surface … 10 sections built from …").
- On four sample briefs, repeated lines fell from 12–28 to 2–6, the lead detail name in the page text from 4–14 mentions to 1–4, lines that read the same on every product's page from 22 to 8, lines copied word for word from other templates from 18–41 to 3–18, and the most times one description is printed from 3 to 1. The template's score on this measure went from 335 to 108.
- New test: `packages/design-skills/src/__tests__/consumer-template-once.test.ts`. The other seventeen templates render byte-for-byte the same (374 of 396 hashed pages unchanged; only the 22 consumer pages changed).
## 2026-10-15 — Research dossier template says each thing once

- The research dossier page drops the figure band (a "cost · cumulative" chart with made-up values under "how X maps a briefing", which named the instruments twice more) and the specimen band, which printed every description again under "X field plate". It goes from nine sections to seven: first screen, one index, the priorities, questions, closing, footer.
- Each instrument description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) under "instruments a capital brief actually uses" and "not a dashboard dressed as research", beside a "how it is put together" list that named them again, the specimen band printed every description, and the verso/recto spread printed them a third time as "Step 01" under "how a brief is actually read". The index now holds every instrument, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, instrument by instrument").
- The first screen names each instrument once, on the dossier plate and in the chapter rail. The rail used to point at #figure / #story / #proof bands; it now jumps to each index row. The masthead no longer prints "Vol. XII" / "Issue 03" on every product. The plate no longer says "1 briefing unit" or "· dossier plate".
- The priorities group the instruments by the priority the brief gives (core, supporting, additional). With a single priority the section is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Start the Kilnroom brief with kiln calendar." and "Four more instruments sit in the index above." The buttons read "Open the brief" and "Read all five instruments". The menu reads Instruments, Priorities, Questions. The page description is the product's own tagline and audience.
- On four sample briefs, the template's score on this measure went from 309 to 100. New styles sit only in the dossier motion-signature block. New test: `packages/design-skills/src/__tests__/dossier-template-once.test.ts`.
## 2026-10-15 — Agent harness template says each thing once

- The agent harness page drops the figure band (a "cost · cumulative" chart with made-up values under "how X permits a local tool", which named the instruments twice more) and the specimen band, which printed every name again under "X permit field". It goes from nine sections to seven: first screen, one index, the priorities, questions, closing, footer.
- Each instrument description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) under "permits a local session actually keeps" and "not a workflow approve stamp dressed as trust", beside a "how it is put together" list that named them again, and the turn-notes essay printed every description a second time as "T01 Turn tape" under "how a local session actually finishes". The index now holds every instrument, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, instrument by instrument").
- The helm fold keeps turn tape (T01–Tn), the permit plate (Allow once / Deny), and the sticky FINISH WHEN pin on a paper-led LOCAL session. The fold prints no lead description and no waitlist note.
- The priorities group the instruments by the priority the brief gives (core, supporting, additional). With a single priority the section is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Start the Kilnroom session with kiln calendar." and "Four more instruments sit in the index above." The buttons read "Start a local session" and "Read all five instruments". The menu stays Session / Permit / Finish. The page description is the product's own tagline and audience.
- On four sample briefs, the template's score on this measure went from 307 to 134. New styles sit only in the harness motion-signature block. New test: `packages/design-skills/src/__tests__/harness-template-once.test.ts`.
## 2026-10-15 — Care pathway (clinic) template says each thing once

- The care pathway page drops the figure band (a "cost · cumulative" chart with made-up values under "how X maps a care pathway", which named the rounds twice more) and the specimen band, which printed every name again under "X chart field". It goes from nine sections to seven: first screen, one index, the rounds ladder (priorities), questions, closing, footer.
- Each round description is printed once, in the index. Before, the handoff strip printed bare names (three or four of them, whatever the brief gave) under "stages a care pathway actually keeps" and "not a SaaS pipeline dressed as care", beside a "how it is put together" list that named them again, and the round-notes essay printed every description a second time as "Enc 01 Intake" under "how a care pathway is actually walked". The index now holds every round, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, round by round").
- The rounds fold keeps the sticky care rail (Intake→Discharge), the care-plate pathway spine, and the Chart close. The fold prints no lead description and no walkthrough/demo-theatre note.
- The rounds ladder groups the rounds by the priority the brief gives (core, supporting, additional). Each rung names its rounds once and points at encounter numbers in the index ("2 rounds · Enc 01, 02"). With a single priority the ladder is left out; Intake→Discharge craft stays on the fold's care rail.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Chart the Kilnroom pathway with kiln calendar." and "Four more rounds sit in the index above." The buttons read "Chart the pathway" and "Read all five rounds". The menu stays Pathway / Rounds / Chart. The page description is the product's own tagline and audience.
- On four sample briefs, the template's score on this measure went from 299 to 116. New styles sit only in the care-pathway motion-signature block. New test: `packages/design-skills/src/__tests__/clinic-template-once.test.ts`.
## 2026-10-15 — Lantern path template says each thing once

- The lantern path page drops the figure band (a "cost · cumulative" chart with made-up values under "how X charts a night walk", which named the chapters twice more) and the specimen band, which printed every name again under "X path field". It goes from nine sections to seven: first screen, one index, the night trail (priorities), questions, closing, footer.
- Each chapter description is printed once, in the index. Before, the index printed bare names (three or four of them, whatever the brief gave) under "chapters a night walk actually keeps" and "not a dark glow page dressed as cinema", beside a "how it is put together" list that named them again, and the ember-notes essay printed every description a second time as "Ch I Threshold" under "how a night walk is actually read". The index now holds every chapter, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, chapter by chapter").
- The path fold keeps the sticky way rail (Ch I–V), the path-plate night cartograph, and the Ember close. The fold prints no lead description and no trust-goal verifiable/approach note.
- The night trail groups the chapters by the priority the brief gives (core, supporting, additional). Each rung names its chapters once and points at chapter numbers in the index ("2 chapters · Ch 01, 02"). With a single priority the trail is left out; Ch I–V craft stays on the fold's way rail.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Walk the Kilnroom path with kiln calendar." and "Four more chapters sit in the index above." The buttons read "Walk the path" and "Read all five chapters". The menu stays Path / Chapters / Ember. The page description is the product's own tagline and audience.
- On four sample briefs, the template's score on this measure went from 289 to 99. New styles sit only in the lantern-path motion-signature block. New test: `packages/design-skills/src/__tests__/lantern-template-once.test.ts`.
## 2026-10-15 — Keel template says each thing once

- The control-plane (keel) page drops the What figure (which restated the product under "a control plane for coding agents, not a chat wrapper"), the Ask→Permit→Check→Ship how-loop (which reprinted permit and finish copy), and the second terminal demo under "session tape". It goes from eight sections to seven: first screen, one index, the priorities, questions, closing, footer.
- Each capability description is printed once, in the index. Before, the fold carried a stock Keel lede on every product, the What/How/Demo bands restated the same facts, and the principles index named capabilities again under "what holds when you run many agents" and "each line is a control-plane fact". The index now holds every capability, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, capability by capability").
- The fold keeps the claim + terminal specimen craft: session tape (≥5 turns), one Allow once/Deny, done-when pin, and "Specimen — not a live API". The fold prints no lead description and no invented install/repository note.
- The priorities section groups the capabilities by the priority the brief gives (core, supporting, additional). Each tier cites index numbers, not names again. With a single priority the section is left out; specimen craft stays on the fold.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Steer the Kilnroom course with kiln calendar." and "Four more capabilities sit in the index above." The buttons read "See the session" and "Read all five capabilities". The menu reads Session / Capabilities / Start. The page description is the product's own tagline and audience.
- On four sample briefs, the template's score on this measure went from 190 to 124. Lantern and clinic four-brief rep/lead/any ranges stayed the same. New styles sit only in the control-plane-oss motion-signature block. New test: `packages/design-skills/src/__tests__/keel-template-once.test.ts`.

---

## 2026-10-15 — Research dossier template says each thing once

- The research dossier page drops the figure band (a "cost · cumulative" chart with made-up values under "how X maps a briefing", which named the instruments twice more) and the specimen band, which printed every description again under "X field plate". It goes from nine sections to seven: first screen, one index, the priorities, questions, closing, footer.
- Each instrument description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) under "instruments a capital brief actually uses" and "not a dashboard dressed as research", beside a "how it is put together" list that named them again, the specimen band printed every description, and the verso/recto spread printed them a third time as "Step 01" under "how a brief is actually read". The index now holds every instrument, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, instrument by instrument").
- The first screen names each instrument once, on the dossier plate and in the chapter rail. The rail used to point at #figure / #story / #proof bands; it now jumps to each index row. The masthead no longer prints "Vol. XII" / "Issue 03" on every product. The plate no longer says "1 briefing unit" or "· dossier plate".
- The priorities group the instruments by the priority the brief gives (core, supporting, additional). With a single priority the section is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Start the Kilnroom brief with kiln calendar." and "Four more instruments sit in the index above." The buttons read "Open the brief" and "Read all five instruments". The menu reads Instruments, Priorities, Questions. The page description is the product's own tagline and audience.
- On four sample briefs, the template's score on this measure went from 309 to 100. New styles sit only in the dossier motion-signature block. New test: `packages/design-skills/src/__tests__/dossier-template-once.test.ts`.

---

## 2026-10-08 — Press atelier template says each thing once

- The press atelier page drops the figure band (which set the plate names twice more beside a "cost · cumulative" chart with made-up values under "how X locks a forme") and the specimen band, which printed the names again under "X forme field". It goes from nine sections to seven: first screen, one index, the gather (priorities), questions, closing, footer.
- Each plate description is printed once, in the index. Before, the first screen hid the lead description (and the audience) in the page unseen, the index printed bare names (four of them on the sample's six-plate brief) beside a "how it is put together" list that named them again, and the gather essay printed every description a second time. The index now holds every plate, lettered "Sig A" onward like the press sheet, each with its sentence. Its title is the product's own ("Kilnroom, plate by plate") instead of "Everything X does, starting with Y", and the "not a gallery dressed as a pressroom" lede is gone.
- The press sheet on the first screen names each plate once, in its own signature cell. It used to cycle the names through all eight cells, cut to fourteen characters ("Registration…", "Imposition sh…"), so a three-plate brief drew each name two or three times, under a "SIG A–H · FORME 16" head with the product name again in the middle. Spare cells keep their drawn page matter and stay unnamed, and the head reads "SIG A–E" for five plates. The signature rail has one letter per plate, each jumping to its row in the index, instead of "Sig A" to "Sig H" pointing at bands the page did not always have; the masthead reads "Press sheet · Sig A–E · 5 plates" instead of "Forme · Sig A–H". The fold has one button, "Open the press sheet", and no note.
- The gather groups the plates by the priority the brief gives (core, supporting, additional). Each forme names its plates once, and its note says how many plates the tier holds and which signatures they are ("2 plates · Sig A, B"), each letter jumping to its row. The stack used to reprint every description with the name over it, a "Note 01" label, and a drawing on every forme, under "how a signature is actually gathered", "fold ticks, plate index, and the gathers that keep a forme honest", "5 formes · densitometer", and a "CMYK · gather check" label. With a single priority the gather is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no hidden tier", or that every capability ships "from day one". The close says "Start the Kilnroom press sheet with kiln calendar." and "Four more plates are set in the index above." instead of "Lock a forme on Kilnroom." and "Plate numbers, densitometer marks, and the formes … actually run." The buttons read "Open the press sheet" and "Read all five plates" instead of "See the approach" and "Read the detail". The approval question appears only when a plate does the approving ("approve", "approval", "sign-off"); the sample's densitometer strip mentions "the approved forme", which the shared signal reads as an approval step, and the question would have said the densitometer strip handles approvals. The menu reads Plates, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("press-atelier surface … 9 sections built from 6 declared capabilities").
- On four sample briefs, repeated lines fell from 10–24 to 2–7 (what is left is the "Open the press sheet" button, on the first screen and in the close, and each name once on the sheet and once in the index), the lead plate name in the page text from 8–11 mentions to 4 on the sample, marina, and pottery briefs, lines that read the same on every product's page from 25 to 3, lines copied word for word from other templates from 16–36 to 2–19, and the most times one description is printed from 2 to 1. Page height on the sample fell from 7398px to 4707px. The craft critique for the press atelier moved from 98.5 to 96.6, mostly because the page is now shorter than the measured corridor, its sections are closer in size, and it carries a little less drawn matter now that the figure band and specimen band are gone.
- New test: `packages/design-skills/src/__tests__/press-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Foundry template says each thing once

- The editorial foundry page drops the figure band (which drew the type ladder a second time beside a "cost · cumulative" chart with made-up values under "how X changes with size") and the specimen band, which printed the names again under "X at reading size". It goes from nine sections to seven: first screen, one index, the marginalia (priorities), questions, closing, footer.
- Each cut description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) beside a "how it is put together" list that named them again, and the marginalia essay printed every description a second time. The index now holds every cut, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, cut by cut") instead of "Cuts drawn for real reading sizes", and the "not a style picker dressed as a product" lede is gone.
- The first screen names each cut once, on the type ladder. The ladder's rungs used to be "Display", "Title", "Deck", "Text", and "Caption" on every page, a pottery studio's included, with the first three names set beside the first three rungs and "Kilnroom · optical sizes" under them. It now has one rung per cut (up to eight), each labelled with its index number and its name; a short brief keeps five rungs and leaves the spare ones unnamed. The fold has one button, "Open the specimen", and no note; "See the cuts" and "Trial files ship with the optical sizes you will actually set" are gone.
- The marginalia group the cuts by the priority the brief gives (core, supporting, additional). Each beat names its cuts once, and its margin note, set beside it, says how many cuts the tier holds and where they sit in the index ("2 cuts · Index 01, 02"), each number jumping to its row. The essay used to reprint every description with the other names hung beside it as "cut slips" sized "Display", "Title", "Deck", with "Note 01" labels and a drawing on every beat, under "measure, hierarchy, and the notes that keep a layout from drifting". With a single priority the marginalia are left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, or that every capability ships "from day one". The close says "Start the Kilnroom specimen with kiln calendar." and "Four more cuts are set in the index above." instead of "Request a specimen of Kilnroom." and "Edition notes, trial files, and the cuts … actually set." The buttons read "Open the specimen" and "Read all five cuts" instead of "Request a specimen" and "See the cuts". The approval question appears only when the brief declares an approval step. The menu reads Cuts, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("editorial-foundry surface … 9 sections built from 5 declared capabilities").
- On four sample briefs, repeated lines fell from 14–37 to 2–5 (what is left is the "Open the specimen" button, on the first screen and in the close, and each name once on the ladder and once in the index), the lead cut name in the page text from 14 mentions to 4 on the marina and pottery briefs, lines that read the same on every product's page from 24 to 3, lines copied word for word from other templates from 14–35 to 2–20, and the most times one description is printed from 2 to 1. Page height on the sample fell from 8995px to 4919px. The craft critique for the foundry moved from 99.9 to 97.0, mostly because the page is now shorter than the measured corridor, its sections are closer in weight, and it carries less drawn matter now that the figure band and specimen band are gone.
- New test: `packages/design-skills/src/__tests__/foundry-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Observatory template says each thing once

- The signal observatory page drops the figure band (a "cost · cumulative" chart with made-up values under "how X reads a window", which named the channels twice more) and the specimen band, which printed the first four descriptions under "what it covers". It goes from nine sections to seven: first screen, one index, the waterfall (priorities), questions, closing, footer.
- Each channel description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) beside a "how it is put together" list that named them again, the specimen band printed four descriptions, and the event waterfall printed every description again. The index now holds every channel, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, channel by channel") instead of "Channels an on-call desk actually watches", and the "not a chart dressed as a product" lede is gone.
- The first screen names each channel once, in the scrub rail along its foot. The rail used to print "T−24h", "Live", "+6h", and "Calibrate" on every page, a pottery studio's included, with "Live" lit and pointing at the figure band. It now has one chip per channel, numbered like the index, and each jumps to its own index row; on a phone it scrolls sideways in one row. The signal lattice numbers its rows like the index and names no channels; it no longer pads a short brief to four rows by repeating the first, and no longer prints tolerances ("±0.5", "±1.0"), "LIVE", "WINDOW", "00:10", hours, "UTC", or the product name a second time. The chronometer down the left edge keeps its ticks but prints no hours and no "UTC".
- The event waterfall sorts the channels by the priority the brief gives (core, supporting, additional). Its ruler is numbered like the index, one column per channel; each span lights its own channels' columns and names them once. It used to print every description against a T+00h → T+24h ruler with "T+06h" stamps, "Note 01" labels, and a drawing on every span, below "tick beads, channel notes, and the handoffs that keep calm honest". With a single priority the waterfall is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, or that every capability ships "from day one". The close says "Start the Kilnroom desk on kiln calendar." and "Four more channels sit in the index above." instead of "Calibrate a Kilnroom window." and "Tolerance marks, channel maps, and the windows … actually watch.", and the made-up tolerance strip beside the first four names is gone. The buttons read "Open the desk" and "Read all five channels" instead of "Open a desk window" and "Read the channels". The approval question appears only when the brief declares an approval step. The authored path no longer carries the "windows ship with the channels you actually watch — not a demo theatre" note. The menu reads Channels, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("signal-observatory surface … 9 sections built from 6 declared capabilities").
- On four sample briefs, repeated lines fell from 10–24 to 1, the lead channel name in the page text from up to 11 mentions to 3 on the three unrelated briefs, lines that read the same on every product's page from 26 to 4, lines copied word for word from other templates from 16–41 to 3–20, and the most times one description is printed from 3 to 1. Page height on the sample fell from 8778px to 5193px. The craft critique for the observatory moved from 99.9 to 98.8, mostly because the page is now shorter than the measured corridor and carries less drawn matter now that the figure band and specimen band are gone.
- New test: `packages/design-skills/src/__tests__/observatory-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Field guide template says each thing once

- The field guide (herbarium) page drops the figure band (a "cost · cumulative" chart with made-up values under "how X presses a voucher", which named the first four traits twice more) and the specimen strip of bare names. It goes from nine sections to seven: first screen, one index, the key (priorities), questions, closing, footer.
- Each trait description is printed once, in the index. Before, the specimen tag on the first screen printed the lead description, the index printed bare names (four of them, whatever the brief gave) beside a "how it is put together" list that named them again, and the dichotomous key printed every description a second time. The index now holds every trait, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, trait by trait") instead of "Traits a field voucher actually keeps", and the "not a nature photo dressed as science" lede is gone.
- The first screen names each trait once, in the binomial strip along its foot. The strip used to print Kingdom → Species on every page, a pottery studio's included, with the first six ranks pointing at sections the page may not have and "Genus" always lit. It now has one chip per trait, numbered like the index, and each jumps to its own index row. The specimen plate no longer names the first three traits, and no longer prints "Voucher · herbarium", "Range · W → E", "Blot", rank letters, or the product name a second time; its photo window now runs the height of the pressed leaf. The masthead counts the brief's own traits ("Five traits") instead of "Hinged glassine · Dissecting plate", and the "Pin 02 · voucher" label is gone.
- The dichotomous key sorts the traits by the priority the brief gives (core, supporting, additional). Each couplet names its traits once and sends the reader to the next couplet ("Otherwise, go to 2"), instead of inventing leads such as "trait holds → photo inset" and "trait fails → re-key from kingdom" below "range beads, taxon ranks, and the notes that keep a voucher honest". The "Note 01" labels and the drawing on every sheet are gone. With a single priority the key is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, or that every capability ships "from day one". The close says "Start the Kilnroom guide at kiln calendar." and "Four more traits follow in the index above." instead of "Request a voucher of Kilnroom." and "Pressed plates, range notes, and the vouchers … actually keep." The buttons read "Open the guide" and "Read all five traits" instead of "Request a voucher" and "Open the plate". The approval question appears only when the brief declares an approval step. The authored path no longer carries the "vouchers ship with pressed plates and range notes — not a demo theatre" note. The menu reads Traits, Priorities, Questions. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–23 to 1, the lead trait name in the page text from up to 13 mentions to 3 (4 counting the binomial strip), lines that read the same on every product's page from 29 to 6, and lines copied word for word from other templates from 15–35 to 3–20. Page height on the sample fell from 8475px to 4522px. The craft critique for the field guide moved from 97.5 to 96.3, mostly because the page is now shorter than the measured corridor and carries less drawn matter now that the figure band is gone.
- New test: `packages/design-skills/src/__tests__/field-guide-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Educational template says each thing once

- The educational (mechanism explainer) page drops the specimen strip of bare part names and the "what is included" table, which set made-up Core / Standard / Full columns under a lede calling it "the same list as above, arranged the way a procurement review asks for it". It goes from eight sections to seven: first screen, one index, priorities, questions, closing, footer. The questions section is new; the page had none.
- Each part description is printed once, in the index. Before, the first screen printed the lead description under the headline, the drawing beside it cut the second one mid-word, and the chapters printed every description a second time. The index now holds every part, numbered 01 onward, each with its sentence and its own drawing, and no interface drawing or "how it is put together" list beside it names them again. Before, a five-part brief left its last two parts out of the index.
- The first screen names each part once, in the scrub list, headed by the count the brief gives ("Four parts") instead of "The scrub". The drawing beside it no longer sets a "cost · cumulative" chart with values of 100, 70, 40 and 10 that no brief gave, and no longer names the parts again or prints the active one under the slider. It draws one numbered column per part, as tall as the priority the brief gives that part, and the slider lights each column in turn. It used to stop at four parts; it now steps through up to six. The slider reads "Step through the parts" instead of "Step through the mechanism".
- The chapters now group the parts by the priority the brief gives (core, supporting, additional) and name the parts in each once, instead of reprinting every description below "placement, preemption, backpressure, failure — the cost function in order", a line written for one routing runtime and printed on a marina's page too. With a single priority the section is left out. The index title is "What each Signal Path part does" instead of "What Signal Path does with cost", which read "does with plot" on a garden's page, and the stock "two carry the argument, the other two remove reasons to say no" line is gone.
- The questions and the closing line are built from the brief's own names. The close says "Start with placement model." and "Three more parts follow in the index above." instead of "See it against your own material." and "Four capabilities, one conversation.", and the second button reads "Read all four parts". The approval question appears only when the brief declares an approval step. The authored path no longer adds "everything here is verifiable before you commit" to the first screen. The menu reads Parts, Priorities, Questions instead of pointing at a "Cost path" and a table the page no longer has. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–32 to 2–5, the lead part name from 9 mentions to 4 and every other part name to 3 (before, up to 9), lines that read the same on every product's page from 12 to 5, and lines copied word for word from other templates from 5–20 to 3–17. Page height on the sample fell from 5855px to 3739px. The craft critique for the explainer moved from 99.6 to 97.7, almost all of it because the page is now shorter than the measured corridor.
- New test: `packages/design-skills/src/__tests__/educational-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-07 — Archive index template says each thing once

- The archive index page drops the figure band (which named the first four entries twice more beside a "cost · cumulative" chart with made-up values) and the specimen strip of bare names, so it goes from nine sections to seven. The page is now first screen, one index, priorities, questions, closing, footer.
- Each entry description is printed once, in the index. Before, the index printed only names and the entry essay printed every description a second time. The index now holds every entry, numbered 001 onward, and no drawing beside its first row names them again. Before, every brief left two entries out of the index.
- The first-screen ledger draws each entry once, as a catalogue card with its number, its name, and its own initial. It used to fill twelve cells by cycling the entries, so a five-entry brief named its lead entry three times on the first screen, labelled the cells "Core" or "Included", and footed the plate "12 entries". The masthead and the ledger show the letters the brief's entries actually run across instead of a fixed "A–Z", and each letter of the side rail jumps to the first entry that starts with it instead of to sections the page may not have.
- The entry essay now groups the entries by the priority the brief gives (core, supporting, additional), stamped with their index numbers, instead of reprinting every description under the names of three other entries and beside a shelf index of every name. With a single priority the section is left out.
- The questions and the closing line are built from the brief's own names. They no longer promise cancelling anytime, a result in "one session" on your data, a comparison table, a person for procurement, or that everything ships "from day one". The page no longer says "each entry is a numbered stamp — not a search box dressed as an archive", "hanging folio, ruled measure, and the cross-refs that keep the roll honest", or "numbered stamps, cross-refs, and the entries … actually keep". The buttons read "Open the index" and "See every entry" instead of "Request an entry", which only fit one award index. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 16–45 to 3–9, the lead entry name from 2–17 mentions to 1–4, lines that read the same on every product's page from 23 to 6, and lines copied word for word from other templates from 15–35 to 3–16. Page height on the sample fell from 9040px to 4913px.
- New test: `packages/design-skills/src/__tests__/archive-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

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

## 2026-09-30 — Keel control-plane specimen

- New engine offering `keel` (`siteKind: control-plane-oss`) — marketing claim + terminal specimen fold, not a helm-only clone of Tiller.
- Showcase route `/showcase/keel`; filmstrip label **Control plane**; product name Keel.
- Locked cool void `#0e1114`, accent `#3ecfbf`, IBM Plex Sans + Mono. Honest get-started placeholder; no invented install URL.
- Motion polish: 150ms accent permit flash, pin fade after last tape index, reduced-motion static end state (no blink, no fill-mode opacity-0).
- Does **not** close the Tiller public showcase/GitHub gap.

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
