# designproof-diagram: educational/report HTML+SVG diagrams
> **DesignProof-owned stub.** Learned from public patterns only (PR #106 tip `4a55640`, plan §2b). Nothing vendored, forked, submoduled, or copied. Not a Tell MCP (Model Context Protocol) tool; the catalog stays eleven today and nineteen by replacement (BIM-203). No public MCP endpoint.

**Status:** near-term (Keep, learn). **Inspiration:** cathrynlavery/diagram-design.

> **Runtime twin (landed 2026-10-25):** [`.cursor/skills/designproof-diagram/SKILL.md`](../../.cursor/skills/designproof-diagram/SKILL.md) is the procedure an agent follows today — four kinds only, hand-authored inline SVG on DesignProof tokens, 0 KB JS. This stub stays the plan of record; where the two disagree, the runtime skill is what an agent does now and this file is what the plan still wants.

## Purpose
A craft skill that draws HTML+SVG diagrams on DesignProof tokens (works with Instrument Serif) for concept cards, proof dossiers, and Tell Report (`tell-report-ui`). It starts as a craft skill. It moves into generate only if a measured specimen beats our current figure quality.

## Learned
- Hand-authored SVG with real type and a grid reads as designed. Auto-layout diagram output (Mermaid-style) reads as slop.
- A small set of diagram kinds (flow, before/after, layer stack, timeline) covers most report needs.

## We build
- Our token-driven SVG primitives and a fixed list of diagram kinds for dossiers and reports.
- Page-budget aware: inline SVG, no runtime diagram library, readable on a 360 px wide screen, contrast floor met.
- Run the anti-slop detectors on diagram output too.

## Non-goals
Copying their skill tree. Off-brand stock diagrams. A Phase 7 MCP tool.

## Acceptance cues
- One proof dossier and one Tell Report figure redrawn, with a side-by-side against the current figure.
- Meets the contrast floor. Adds 0 KB of JavaScript.
