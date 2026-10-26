# tell-motion-timeline

DesignProof-owned pack stub for seek-safe motion bound to a specimen brief.

## Use it when

The concept has a named beat sequence: hero enter, proof stack, chapter turn, or CTA close. The page must read as a still composition before the timeline is enabled.

## Inputs

- `DesignBrief`, `ConceptSpec`, and `siteKind`
- approved DesignProof tokens
- optional `specimen.motion.json`

## Produce

- labeled beats with integer millisecond offsets and durations
- a `window.__dpSeek(timeSeconds)` registration plan
- a reduced-motion replacement that settles the same content without travel

The JSON shape is provided by `createSpecimenMotionJson` in `@tell/design-skills`. `autoplay` is false in the seek contract; a capture or gallery controller owns the clock.

## Acceptance

- labels describe the metaphor or page shape, not only easing
- `transform` and `opacity` carry travel; layout remains stable
- the same frame can be reproduced from a time in seconds
- reduced motion is a replacement state, not a hidden version of the same animation
- a swap-test note names the changed concept, first-screen metaphor, and primary copy

## Do not

Add a catalog entry, wall-clock loop, generative video step, or palette-only motion variant.
