# tell-audio-caption

DesignProof-owned pack stub for optional demo voiceover and captions synced to the specimen seek clock.

## Use it when

A verified README or gallery clip benefits from a short spoken explanation and the approved script can be mapped to timeline labels.

## Inputs

- approved script and locale
- timeline labels from `specimen.motion.json`
- an optional audio bed

## Produce

- caption cues with start/end times in seconds
- an optional audio reference
- a script-to-cue QA note

Captions follow the same clock as `window.__dpSeek(timeSeconds)`. A clip can be rendered with audio absent; the visual and captions must still make sense.

## Acceptance

- every cue maps to an approved label or explicit hold
- cue order and duration match the script
- captions remain readable at phone width
- reduced motion keeps the caption content and uses settled visuals
- no audio asset is required by Studio or the web app

## Do not

Auto-add audio to generated sites, ship voice assets in the app, or claim a clip is ready without a verified specimen.
