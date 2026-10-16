# Design dogfood loop

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

> **Redesign plan (proposed, pending decision):** DesignProof is moving to a concept-first, step-by-step design process: eight reviewed stages (brief, concepts, mood board, art direction, imagery, one key screen, section by section, refinement), colour from a theme setting, an automatic swap test, and Awwwards-weighted review with Open Design as the bar. Plan: [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) · Decision: [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Template keep, merge or drop calls are **proposals** until Ashish decides in BIM-203; nothing has been dropped.
>
> Motion gets its own review between art direction and refinement; it is not a separate stage.

## Goal

Use Tell on Tell — and on real multi-session site/app work — until the **Tell Proof bar** holds: stacked images, motion, artistic, unique. Not one-shot AI generate. `/studio` is a craft bench for that loop, not a product to ship.

> **Proposed goal (pending BIM-203):** Use Tell on Tell — and on real multi-session site/app work — until the **DesignProof bar** holds. Under the redesign plan, that bar is concept-first and staged: eight reviewed stages (brief, concepts, mood board, art direction, imagery, one key screen, section by section, refinement), colour from a theme setting, an automatic swap test, and an Awwwards-weighted review (design 40%, usability 30%, creativity 20%, content 10%) with Open Design as the reference. Not one-shot AI generation. `/studio` is a craft bench for that loop, not a product to ship.

**SFT** = supervised fine-tune rows (gold demonstrations). Not this file — see [training-data-mcp-sink.md](./training-data-mcp-sink.md).

## Done

- Dogfood target for Tell Report UI: zero generic tells; tokens only; `pnpm eye:shell` for rail contrast (`tell-dogfood-audit`).
- Design-skills engine + Studio + 17 offerings + Crease / Baseline matchday; research graph auto-triggers before pixels.

  - Offerings are under review in BIM-203; template keep, merge or drop calls are proposals, nothing dropped.
- Agency pipeline (`agency:run`) and recursive-improve champion/challenger (most Phase 9 kinds).
- Captioned 5-beat demo (2026-08-26). Ink-on-paper shell.

## Remaining

- **Continuous dogfood to the Studio bar** is still open (PROJECT-STATUS). Critique scores and nav crops do not pass the bar.
- Optional motion runtimes (GSAP/Lenis/Rive) parked in PLAN.md Phase 7 stretch.
- Phase 9 leftovers (dossier citeability, consumer polish) sit behind Tiller + training sink + this bar.

## How to verify

```bash
pnpm dogfood:web          # Tell on itself
pnpm eye:shell            # measured chrome contrast — do not trust vision
pnpm e2e:studio           # when touching Studio / design-skills
# Bar check: stacked images + motion + unique fold grammar — not a still of the nav

# Proposed bar check (pending BIM-203): written concept exists · swap test passes · Awwwards-weighted review — not a still of the nav
```

Local `:3000` / `:3001` — stop existing Tell dev servers first (rule `tell-local-dev-server`).

## Skills to load first

`tell-dogfood-audit` · `premium-content-custom-web` · `website-domain-research` · `responsive-performance` · `tell-recursive-improve`

Site builds: execute every node `routeSkills` returns. Do not wait to be asked to wire research or WebP.

## Related

[`docs/01_DESIGN_SYSTEM.md`](../01_DESIGN_SYSTEM.md) · [`docs/09_PREMIUM_DESIGN_SKILLS.md`](../09_PREMIUM_DESIGN_SKILLS.md) · [`PLAN.md`](../../PLAN.md) Phase 7/9 · [showcase-tiller.md](./showcase-tiller.md)
