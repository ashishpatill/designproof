# tell-render-ship

DesignProof-owned pack stub for verified specimen render and artifact handoff.

## Use it when

A specimen URL or HTML has passed proof verification and needs a repeatable demo artifact for README or gallery review.

## Inputs

- verified specimen URL or HTML
- `specimen.motion.json` and its timeline
- proof-verify pass id
- reduced-motion capture target

## Produce

- MP4 render
- WebP poster
- contact sheet with labeled beats
- one re-render command with inputs and output paths

The render driver pauses the page, registers `window.__dpSeek(timeSeconds)`, samples declared labels, and records the proof pass id beside the artifacts. No artifact is published automatically.

## Acceptance

- frame review happens before encode
- poster, contact sheet, and MP4 share the same timeline
- reduced-motion still is included in review evidence
- the command is deterministic and can be rerun from the verified specimen
- the catalog remains eleven tools and the branch remains a review handoff

## Do not

Film an unverified page, add a runtime dependency to the web app, or auto-publish to `master`.
