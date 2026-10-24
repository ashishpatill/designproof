# designproof-anti-slop: anti-slop verify and review gates
> **DesignProof-owned stub.** Learned from public patterns only (PR #106 tip `4a55640`, plan §2b). Nothing vendored, forked, submoduled, or copied. Not a Tell MCP (Model Context Protocol) tool; the catalog stays eleven today and nineteen by replacement (BIM-203). No public MCP endpoint.

**Status:** near-term (Keep, learn). **Inspiration:** pbakaus/impeccable.

## Purpose
Deterministic genericness / anti-slop detectors in `packages/core`, authored with `tell-detector-authoring`. They run after capture/fingerprint inside built `tell_proof_verify` (Phase 5) and planned `tell_review`. They advise, then fail the gate. They never become a second generate pipeline.

## Learned (the pattern, not the code)
- A large, named catalog of small, single-purpose slop checks beats one vague "looks generic" score.
- Each check needs a plain-language reason and a fix hint so the agent can act on it.

## We build
- Detectors mapped to the DESIGN.md rejects: Inter-only type, violet/purple gradients, nested cards, bounce easing, plus our own genericness tells (docs/05).
- Each detector has an id, severity, evidence (selector + screenshot crop), and a fix hint. Findings show up in the proof dossier.
- Fail on a regression in the before/after delta in the disposable checkout.

## Non-goals
Depending on or vendoring impeccable. Replacing `designFromFeatures`. Adding a new catalog tool.

Frame, multi-width, and screenshot-critique loops live in [designproof-taste](./designproof-taste.md); this stub owns the named detector catalog only.

## Acceptance cues
- Each new detector has a fixture page that triggers it and a clean specimen that passes.
- `tell_proof_verify` reports detector ids. Shipped specimens report 0 new genericness tells.
