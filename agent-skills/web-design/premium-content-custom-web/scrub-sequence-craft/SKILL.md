---
name: scrub-sequence-craft
description: Sub-skill — reversible step/scrub instruments for educational and mechanism folds. Native control position is source of truth; reduced-motion settles to final frame.
---

# scrub-sequence-craft

- Define named states before coding
- Prefer DOM/SVG step scrub for accessibility (range input + figcaption)
- Sticky stage optional; never hijack scroll as the only path
- Poster/final frame under reduced motion
- Engine: `hero-mechanism` + figure scrub on docs-educational

- Scrub with `transform` and `opacity` only, and keep the range-input response within INP (Interaction to Next Paint) of 200 ms or less.
- Proposed under the [redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3): a scrub instrument is a candidate for the one key interaction prototyped first in the motion review. Waiting on Ashish in Linear issue [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the).
