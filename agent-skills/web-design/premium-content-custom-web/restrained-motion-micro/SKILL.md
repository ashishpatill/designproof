---
name: restrained-motion-micro
description: Sub-skill of premium-content-custom-web — restrained motion micro-feedback on interactive controls only.
---

# restrained-motion-micro

Use when Taste `motion` is `subtle-micro` (or as the micro layer under stronger motion levels).

## Defaults
- Animate only things the user touches: links, buttons, inputs, chips, tabs
- Duration 150–300ms (token `--motion-base` / `--motion-fast`); one dominant easing
- Prefer `opacity`, `transform`, `color`, `border-color` — never layout props for hover

- Under the [redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) (proposed, Linear issue [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the)), animate only `transform` and `opacity`. Colour and border changes on hover switch instantly or fade via an `opacity` overlay. Keep INP (Interaction to Next Paint, how fast the page responds to a tap or click) at or under 200 ms.
- Focus-visible must remain clearer than hover

## Avoid
- Continuous loops, shader spectacle, parallax on every section
- Animating static body copy or decorative cards “because we can”
- Bounce / elastic easings on marketing templates
- Dual animation libraries fighting the same property

## Reduced motion
- `prefers-reduced-motion: reduce` → no hover travel; color/opacity ≤120ms or instant

## Related
- `scroll-reveal-once` — section enters
- `docs/15_MOTION_ANIMATION_PLAN.md` — full ladder
- `docs/10_DESIGN_EVIDENCE.md` — restraint bands
