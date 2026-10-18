# DesignProof revamp — audit (2026-10-18, Asia/Calcutta)

Base: origin/master 64038ca. Branch: revamp/20261018. PR #104 (e97a6567) NOT merged/mixed.
Baseline on master: `pnpm test` 430 passed / 56 files; `pnpm typecheck` clean (9 projects).

## Where the revamp plan lives
The plan is NOT a repo file. It is the Linear document "DesignProof redesign plan"
(linked in README.md:89, AGENTS.md:18,49, DESIGN.md:7, docs/QUALITY-BAR.md, docs/PROJECT-STATUS.md:13,32,58),
decision pending in BIM-203. Every in-repo banner says the same thing verbatim:
"Proposed, waiting on Ashish's decision in BIM-203; nothing below is built yet."
Ashish's 18 Oct order in the Design Proof room supersedes the wait: build it now.
Template keep/drop calls in the plan remain PROPOSALS — this branch drops nothing.

## Audit: plan item vs master (evidence)

| # | Plan item | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Concept-first: written concept (one-line idea, metaphor/material, what it rejects, 3 visible tests) before judging/building | NOT READY | No concept type anywhere; `DesignSpec` (packages/design-skills/src/types.ts) has brief/tokens/sections only. QUALITY-BAR.md:142 lists it as proposed. |
| 2 | Eight reviewed stages: brief → concepts → mood board → art direction → imagery → key screen → section-by-section → refinement; stage can't run until prior approved; reject reruns only that stage | NOT READY | Generation is one-pass: `designFromFeatures` in packages/design-skills/src/orchestrate.ts (analyze→route→tokens→sections→render in one call). No stage state machine. |
| 3 | One MCP tool per stage + tell_review (11 → 19 tools) | NOT READY | `MCP_TOOL_NAMES` has 11 (packages/schema/src/install-info.ts:19, test expects 11 at install-info.test.ts:79); single `tell_design_from_features` (packages/mcp/src/registered-tools.ts:13). |
| 4 | Explicit colour `theme` chosen at art-direction; theme change only swaps colour variables; NOT colour hashed from product name | NOT READY | `buildPalette(mood, brandAccent, seed)` falls back to product-name-seeded accent variant (packages/design-skills/src/palette.ts:173, tokens.ts:242 `seed = productName`). No named theme registry. brandAccent hex is the only explicit override. |
| 5 | Automatic swap test: render with unrelated brand; if concept/first-screen metaphor/copy don't change, build fails | NOT READY | No swap test in code/tests. PROJECT-STATUS.md:28 records the failure it targets: "changing the test brand only changed the colours". |
| 6 | Motion review between art direction and refinement (not a separate stage): one-sentence motion idea → motion tokens → prototype one key interaction → section rollout; 7 automatic checks | PARTIAL | Motion tokens + levels exist (types.ts MotionLevel, tokens.ts motionScale, docs/15). No motion-review gate/prototype step/checks as a review. |
| 7 | Performance budgets at every stage: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms, initial script ≤170KB, transfer ≤2.0MiB, AVIF/WebP picture, declared tech tier | PARTIAL | responsive-performance skill + SiteImg exist; budget numbers are "adapted, not yet measured" (.cursor/skills/responsive-performance/SKILL.md:12). No budget checker on generated preview. |
| 8 | Awwwards-weighted review (design 40 / usability 30 / creativity 20 / content 10) with Open Design as bar | PARTIAL | Critique/corridor scores exist (research:critique, basics-checklist.ts `assertBasics`); no weighted review object. Plan explicitly says score ≠ quality (design-research-loop/SKILL.md:8). |
| 9 | Template calls: rebuild research dossier first; merge Tiller+Keel; consumer→physical-product; drop loom+clinic | NOT DONE (by design) | All templates still present (apps/web/src/app/showcase/*, packages/design-skills/src/templates.ts). Drops/merges stay proposals until Ashish decides — NOT executed here. Phase 9 (PLAN.md) concept-uniqueness loops are the shipped partial work. |
| 10 | Runnable templates / live preview / brand contract / honest catalog (QUALITY-BAR vs OpenDesign) | READY (existing) | 19 offerings in /showcase, Studio previewHtml path, DESIGN.md/design-tokens.json contract (PR#104 splits tokens; master still reads DESIGN.md via load-design-doc). |

## Verdict
NOT READY. The engine underneath (detectors, tokens, templates, critique) is real and
tested, but the revamp's core — concept-first staged generation with review gates,
explicit themes, and the swap test — does not exist. That is what this branch builds.

## Build scope on this branch (smallest faithful slice)
1. `packages/design-skills/src/staged.ts`: stage machine (8 stages + motion review),
   explicit named THEMES (theme → accent hex + colorMood; no name hash), Concept
   derivation per siteKind, swap test, performance-budget check on preview HTML,
   motion-review spec, Awwwards-weighted review scoring from basics/critique signals.
2. Wire into `designFromFeatures` via optional `theme` (sets brandAccent/colorMood from
   theme registry) and attach `concept` + `theme` to DesignSpec (optional fields).
3. Studio UI: staged stepper with approve/reject, theme picker, concept card, swap-test
   and budget results — honest states, no fake controls.
4. Tests for all of the above; full suite + typecheck + prod build green.
Deferred (honest): splitting MCP into 19 staged tools (catalog change needs its own PR
and drift-guard updates), template drops/merges (Ashish's BIM-203 calls), GSAP/Rive.
