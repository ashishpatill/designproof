---
name: dp-dogfood-audit
description: Runs Design Proof dogfood audit on apps/web to ensure zero generic tells and full design-system compliance. Use before demo, for M10 milestone, when fixing Design Proof's own UI, or when verifying Instrument Serif, tokens, state matrix, and contrast floor.
---

# Design Proof dogfood audit

## Goal

Design Proof must pass its own audit: **0 generic tells, 0 unintentional drift** on `apps/web`.

## Checklist (from docs/01_DESIGN_SYSTEM.md §12)

| Check | Pass criteria |
|---|---|
| Type system | Display + sans + mono present; no Inter-only |
| Color | No violet gradient hero; no acid accent on near-black |
| **Chrome contrast** | `pnpm eye:shell` green - sidebar/rail text ≥ 4.5:1 on its painted surface (do **not** trust vision alone) |
| Shadow | e2 max on cards; not shadow on every element |
| Radius | ≥2 distinct radii in main view |
| Centering | Asymmetric report layout |
| Grays | ≤4 distinct gray values in token ramp |
| States | Full matrix on Button, CaptureBar, VoiceDirector, seam handle |
| Tokens | No raw hex in committed TSX classNames |

## Workflow

1. Run Design Proof diagnose on local web app (`http://localhost:3000`) or inspect committed self-report
2. **Run `pnpm eye:shell`** - measured WCAG contrast on `.dp-rail` (closes `chrome:rail-ghost-contrast`)
3. Fix real findings in `apps/web` using semantic tokens from `globals.css` / `tailwind.config.ts`
4. Re-run until generic tells are zero **and** eye:shell passes
5. Verify a11y: focus-visible, reduced motion, non-color verdict encoding

## Vision is not enough

Agent image descriptions miss low-contrast chrome. Before shipping Design Proof UI or showcase shell
changes, run the measured probe (`pnpm eye:shell`). Paper rails must use **`--ink-on-paper`**
hex tokens - never dark-theme `--text` (paper-on-dark) on a light surface.

## Hook support

`.cursor/hooks/after-edit-check.mjs` flags Inter-only stacks and raw hex in web edits when hooks are wired.

## DoD

- Demo line holds: "Design Proof runs on itself: zero tells."
- UI matches editorial print-atelier aesthetic
- No TokenBypass violations in Design Proof's own source

## Related

- Rules: `.cursor/rules/dp-ui-design.mdc`, `.cursor/rules/dp-mission.mdc`
- Agent: `.cursor/agents/dogfood-auditor.md`
