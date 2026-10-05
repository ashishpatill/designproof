# Design dogfood loop

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

## Goal

Use Design Proof on Design Proof — and on real multi-session site/app work — until the **Design Proof bar** holds: stacked images, motion, artistic, unique. Not one-shot AI generate. `/studio` is a craft bench for that loop, not a product to ship.

**SFT** = supervised fine-tune rows (gold demonstrations). Not this file — see [training-data-mcp-sink.md](./training-data-mcp-sink.md).

## Done

- Dogfood target for Design Proof Report UI: zero generic tells; tokens only; `pnpm eye:shell` for rail contrast (`dp-dogfood-audit`).
- Design-skills engine + Studio + 17 offerings + Crease / Baseline matchday; research graph auto-triggers before pixels.
- Agency pipeline (`agency:run`) and recursive-improve champion/challenger (most Phase 9 kinds).
- Captioned 5-beat demo (2026-08-26). Ink-on-paper shell.

## Remaining

- **Continuous dogfood to the Studio bar** is still open (PROJECT-STATUS). Critique scores and nav crops do not pass the bar.
- Optional motion runtimes (GSAP/Lenis/Rive) parked in PLAN.md Phase 7 stretch.
- Phase 9 leftovers (dossier citeability, consumer polish) sit behind Tiller + training sink + this bar.

## How to verify

```bash
pnpm dogfood:web          # Design Proof on itself
pnpm eye:shell            # measured chrome contrast — do not trust vision
pnpm e2e:studio           # when touching Studio / design-skills
# Bar check: stacked images + motion + unique fold grammar — not a still of the nav
```

Local `:3000` / `:3001` — stop existing Design Proof dev servers first (rule `dp-local-dev-server`).

## Skills to load first

`dp-dogfood-audit` · `premium-content-custom-web` · `website-domain-research` · `responsive-performance` · `dp-recursive-improve`

Site builds: execute every node `routeSkills` returns. Do not wait to be asked to wire research or WebP.

## Related

[`docs/01_DESIGN_SYSTEM.md`](../01_DESIGN_SYSTEM.md) · [`docs/09_PREMIUM_DESIGN_SKILLS.md`](../09_PREMIUM_DESIGN_SKILLS.md) · [`PLAN.md`](../../PLAN.md) Phase 7/9 · [showcase-tiller.md](./showcase-tiller.md)
