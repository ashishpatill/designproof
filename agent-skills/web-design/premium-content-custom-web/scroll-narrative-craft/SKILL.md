---
name: scroll-narrative-craft
description: Sub-skill — CSS sticky scroll chapter + progress for motion=scroll-narrative or immersive. One pin max on conversion pages.
---

# scroll-narrative-craft

## Defaults
- One `.ds-chapter-pin` per page (first story/features section)
- Sticky inner + 2px progress rule driven by `animation-timeline: view()` when supported
- Pair with `hero-entrance-once` + `section-stagger-enter` + `scroll-reveal-once`
- No Lenis/GSAP required for the default tier

## Avoid
- Multiple pinned chapters on SaaS conversion pages
- Dual smooth-scroll engines
- Blur/parallax spectacle

## Reduced motion
- Unpin (`position: static`), hide progress, min-height collapses

## Plan (proposed)
- The progress rule must scale with `transform: scaleX()`, not `width`, so only `transform` and `opacity` animate.
- `animation-timeline` isn't in stable Firefox yet: put it inside `@supports` and show a static progress state otherwise.
- Pinned chapters belong to the motion review in the [redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3), after art direction and before refinement; waiting on Ashish in Linear issue [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the).

## Related
- `docs/15_MOTION_ANIMATION_PLAN.md`
- `research/MOTION_ANIMATION_SURVEY.md`
