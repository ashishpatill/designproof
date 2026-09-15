# Capture → diagnose → prove

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

## Goal

Ashish pastes a live URL (or GitHub repo, or the offline fixture). Tell captures **rendered** UI, names tells + drift with evidence, takes art-direction, drafts a patch, and proves it in a disposable checkout. The report serves that loop — it is not a dashboard product.

## Done

- M1–M10 sprint MVP and Phases 1–6 (scenario matrix, auth `storageState` harness).
- 14 deterministic detectors; taste with Gemini + deterministic fallback.
- Tell Report + before/after seam with contrast floor; voice/text direction.
- Offline fixture: `fixtures/generic-app` + `fixtures/reports/tell-report.json`.
- Proof verify / revert (MCP + `/api/proof/*`). Live capture needs Playwright Chromium (`GET /api/health/capture`).

## Remaining

None on this loop’s DoD. Do not reopen Phases 1–6 unless a detector or proof path regresses. Leftover PLAN.md items (motion runtimes, Phase 9 polish) are **not** this feature — see PROJECT-STATUS.

## How to verify

```bash
pnpm test
pnpm -F @tell/schema build
pnpm -F @tell/web typecheck
# live smoke (web :3000, fixture :3001): POST /api/diagnose {"url":"http://localhost:3001"}
# expect meta.live=true and 14 findings; else fixture fallback with meta.live=false
```

## Skills to load first

`tell-schema-contracts` · `tell-capture-fingerprint` · `tell-detector-authoring` · `tell-taste-verdicts` · `tell-redesign-diff` · `tell-report-ui` · `tell-proof-verify` · `tell-demo-fixture`

MCP: `tell_diagnose`, `tell_redesign`, `tell_apply`, `tell_proof_verify`.

## Related

[`USER_STORY.md`](../../USER_STORY.md) · [`BUILD.md`](../../BUILD.md) · [`docs/06_TELL_PROOF.md`](../06_TELL_PROOF.md) · [`docs/01_DESIGN_SYSTEM.md`](../01_DESIGN_SYSTEM.md)
