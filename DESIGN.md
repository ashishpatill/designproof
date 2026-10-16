# Tell Proof — design contract

Declared tokens for Tell's own UI. Used by the DesignSystemDrift detector when scanning this repo.

Scope: this file declares tokens for DesignProof's own product chrome only. It is **not** the design contract for sites DesignProof generates. Under the redesign plan, every generated site gets its own concept, art direction and theme (see the plan below).

> **Redesign plan (proposed, pending decision):** DesignProof is moving to a concept-first, step-by-step design process: eight reviewed stages (brief, concepts, mood board, art direction, imagery, one key screen, section by section, refinement), colour from a theme setting, an automatic swap test, and Awwwards-weighted review with Open Design as the bar. Plan: [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) · Decision: [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Template keep, merge or drop calls are **proposals** until Ashish decides in BIM-203; nothing has been dropped.

## Typography

- font-family display: "Instrument Serif"
- font-family body: "Source Sans 3"
- font-family mono: "IBM Plex Mono"

## Color

- accent: #D4714A
- accent-hover: #E8926F
- background: #181614
- surface: #221F1C
- surface-raised: #2E2A26
- text: #F3EDE4
- text-secondary: #D4C9BA
- text-muted: #B8AA98
- ok: #3A6358
- drift: #C4A035
- border: #574E45
- on-accent: #FFFFFF

## Radius

- card: 16px

## Rules

- No Inter-only stacks on product chrome
- No violet gradient hero on Tell surfaces
- Semantic Tailwind tokens only in component classNames
