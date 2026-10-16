# Showcase / Tiller

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

> **Redesign plan (proposed, pending decision):** DesignProof is moving to a concept-first, step-by-step design process: eight reviewed stages (brief, concepts, mood board, art direction, imagery, one key screen, section by section, refinement), colour from a theme setting, an automatic swap test, and Awwwards-weighted review with Open Design as the bar. Plan: [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) · Decision: [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Template keep, merge or drop calls are **proposals** until Ashish decides in BIM-203; nothing has been dropped.
>
> Motion gets its own review between art direction and refinement; it is not a separate stage.

## Goal

Public specimens must read as **distinct offerings** (stacked images, motion, artistic, unique) — including **Tiller**, the agent-harness session helm (turn tape, permit plate, finish pin). GitHub README and `/showcase` should present Tiller as first-class, not a buried template.

> **Proposed goal (pending BIM-203):** Public specimens must read as **distinct offerings**. Under the redesign plan, "distinct" is now checked rather than asserted: each specimen needs a written concept, must pass the automatic swap test (render with an unrelated brand; the concept and copy must change), and is scored Awwwards-style against Open Design as the bar. **Tiller** is the agent-harness session helm (turn tape, permit plate, finish pin).

**Tiller** = product name on the `harness` engine template (`siteKind: agent-harness`). Label in the filmstrip is “Agent harness”.

## Status under the redesign plan (PROPOSED, pending BIM-203)

The 16 Oct 2026 assessment found that agent harness (Tiller, PR #98) and Keel (PR #102) share the same audience, the same session-tape device and the same page skeleton, and both fail the swap test (for example, Keel renders a pottery studio inside a coding-agent terminal). **Proposal:** merge them into one agent/developer-tool concept, using Keel's dark visual system as the base and keeping Tiller's permit card. This is a proposal only; until Ashish decides in BIM-203, both templates and routes stay as they are.

## Done

- Template `harness` in `packages/design-skills`; route `/showcase/harness`.
- Hero-helm + turn list as a session, not a feature reprint (`#74`, `#75`).
- README still: `docs/media/showcase/harness-fold.webp` (table cell “Agent harness · Tiller”).
- Filmstrip includes all `listTemplates()` keys after Crease + Baseline — harness is in that list.

## Remaining

**Tiller missing from showcase / GitHub is still open.** Do not treat `#74` / `#75` as closing it. Adding Keel (`/showcase/keel`, `control-plane-oss`) does not close this gap.

In-repo page + one still exist. The public gap (name on the fold, filmstrip prominence, GitHub rendering, craft reel, or all of the above) needs Ashish to name which miss. Until then, do not claim Tiller is on the public surface.

## Related in-repo offering (not this gap)

**Keel** = product name on the `keel` engine template (`siteKind: control-plane-oss`). Filmstrip label is “Control plane”. Route `/showcase/keel`. Marketing claim + terminal specimen — not a Tiller helm clone.

> **Proposed (pending BIM-203):** **Keel** = product name on the `keel` engine template (`siteKind: control-plane-oss`). Filmstrip label is "Control plane". Route `/showcase/keel`. Currently a separate offering; the redesign plan proposes merging it with Tiller (pending BIM-203).

## How to verify

- Local: open `/showcase` and `/showcase/harness` — helm, turn tape, permit plate; hover reel scrolls to a craft beat (not nav-only).
- Keel (separate offering): `/showcase/keel` — claim + terminal specimen, filmstrip “Control plane”. Does not close the Tiller public gap.
- GitHub README: Tiller cell visible without looking like a reprint of another fold.

- Swap test (once the automatic check exists): render `harness` and `keel` with an unrelated brand brief; the fold metaphor and copy must change.
- Recapture: `pnpm capture:readme-showcase` · `pnpm media:webp`.

## Skills to load first

`tell-recursive-improve` · `tell-template-craft` · `tell-dogfood-audit`

No extra MCP. Do not add a plugin to “fix” a still.

## Related

[`README.md`](../../README.md) Specimens · [design-dogfood-loop.md](./design-dogfood-loop.md) · [`PLAN.md`](../../PLAN.md) Phase 9
