# Pipeline trace findings (audit note — delete before commit)

- `planSections` (composition.ts:251-960) = 15 hard-coded siteKind branches + generic tail. Brief content never selects a section kind; only featureCount / goal / saas capability classification alter layout.
- 17/17 templates set `lockSiteKind: true`; `inferSiteKind` short-circuits.
- `recommendedSections` (analyze.ts:105-131) is computed but its ONLY consumer is route.ts:95-108; composition never receives it. Dead.
- `routeSkills` returns 37 nodes but only 6 change rendered output: paper-technical-frame, ambient-atmosphere-craft, signal-beam-craft, responsive-performance, authored-motion-slot, motion-stack-craft. The other 31 are metadata read only by basics-checklist.ts / skill-wiring.ts / tests.
- Engine never reads docs/10_DESIGN_EVIDENCE.md or research/aggregate.json at generation time. Corridors are transcribed constants (composition.ts:966-1013, tokens.ts:3-6, palette.ts:204-213, scale.ts:148-176). aggregate.json is read only by scripts/design-research/critique.ts and scripts/agency-pipeline/design-data.ts.
- Only LLM on path = Gemini content author (author.ts:382-452), eligible only when siteKind==="saas-marketing" && businessGoal==="demos" => 1 of 17 templates. Cannot touch headline/lede/eyebrow/palette/tokens; only cta/faq/proof. Deterministic fallback = copy.ts tables.
- Photographs: free-assets.ts has 6 base64 JPEGs; reachable only via figures.ts:3533-3536 (commerce-loom -> loom, field-guide -> herbarium). 2 of 17 templates. No `<img` exists anywhere in design-skills/src.
- Dead code: css.ts:640-642 selector `observatory-signal` never matches (emitted value is `signal-observatory`); CompositionInput.hasApprovalWorkflow unused; planSections destructures `density` unused; ROLE_PROOF === ROLE_PROOF_DISTINCT; heroLayout reachable only for corporate-story/unknown; commerce-loom + field-guide have no inferSiteKind regex; agent-harness absent from resolveTaste (falls back to SaaS defaults).
