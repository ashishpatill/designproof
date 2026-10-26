---
name: tell-render-ship
description: Render verified DesignProof specimens into a poster, contact sheet, and MP4 with a repeatable handoff.
---

# tell-render-ship

1. Require the specimen URL or HTML and a proof-verify pass id.
2. Read `specimen.motion.json`; pause the page and drive `window.__dpSeek(timeSeconds)` at declared labels.
3. Review frames, include a reduced-motion still, then encode the MP4 and WebP poster.
4. Write the contact sheet and one re-render command beside the artifact notes.
5. Stop at the review handoff; publishing is a separate decision.

The source stub is [`docs/skills/tell-render-ship.md`](../../../docs/skills/tell-render-ship.md). Never film an unverified specimen.
