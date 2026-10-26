---
name: tell-audio-caption
description: Produce optional caption cues for a verified DesignProof demo, synced to the specimen seek clock.
---

# tell-audio-caption

1. Start with the approved script, locale, and timeline labels.
2. Create cues in seconds and map each cue to a label or explicit hold.
3. QA the cue order, readable duration, and script coverage.
4. Keep audio optional and retain settled visuals for reduced motion.

The source stub is [`docs/skills/tell-audio-caption.md`](../../../docs/skills/tell-audio-caption.md). The browser contract is `window.__dpSeek(timeSeconds)`.
