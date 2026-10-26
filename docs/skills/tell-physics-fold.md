# tell-physics-fold

DesignProof-owned pack stub for page-shape physics: fold, stack, settle, and crease-line reveals.

## Use it when

The concept metaphor has a physical verb and the first screen earns a staged settle: a dossier opens, a foundry seam parts, a loom gathers, or a crease stacks.

## Inputs

- the approved concept metaphor
- layout regions and their ownership of the fold
- the motion budget from `specimen.motion.json`

## Produce

- one spring/settle recipe per named region
- container and text offsets kept separate
- a static stack that preserves hierarchy for reduced motion

Spring values belong in the specimen recipe and must be seekable through `window.__dpSeek(timeSeconds)`. The page remains deterministic when the browser clock is paused.

## Acceptance

- the physical behavior explains the page shape
- no region depends on a full rigid-body simulation
- settle ends within the declared timeline
- reduced motion shows the completed fold, stack, or crease directly
- phone composition has its own first-screen arrangement

## Do not

Use bounce as decoration, move the whole page as one object, or make physics a substitute for concept work.
