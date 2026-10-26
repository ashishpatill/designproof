---
name: tell-motion-timeline
description: Author a DesignProof seek-safe timeline from concept beats, with reduced-motion replacement and specimen.motion.json output.
---

# tell-motion-timeline

1. Read the concept metaphor, `siteKind`, approved tokens, and any existing `specimen.motion.json`.
2. Name the beats by page role: hero, proof, chapter, or close. Use integer millisecond offsets.
3. Build the recipe with `createSpecimenMotionJson`; keep `autoplay: false`.
4. Register the optional browser hook as `window.__dpSeek(timeSeconds)`. Clamp outside values and leave the settled frame usable when the hook is absent.
5. Write the reduced-motion replacement and run the swap-test checklist before handing off.

The source stub is [`docs/skills/tell-motion-timeline.md`](../../../docs/skills/tell-motion-timeline.md). This pack is a procedure, not a catalog tool.
