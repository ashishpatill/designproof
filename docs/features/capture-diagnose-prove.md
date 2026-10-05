# Capture → diagnose → prove

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

## Goal

Ashish pastes a live URL (or GitHub repo, or the offline fixture). Design Proof captures **rendered** UI, names tells + drift with evidence, takes art-direction, drafts a patch, and proves it in a disposable checkout. The report serves that loop — it is not a dashboard product.

## Done

- M1–M10 sprint MVP and Phases 1–6 (scenario matrix, auth `storageState` harness).
- 14 deterministic detectors; taste with Gemini + deterministic fallback.
- Design Proof Report + before/after seam with contrast floor; voice/text direction.
- Offline fixture: `fixtures/generic-app` + `fixtures/reports/dp-report.json`.
- Proof verify / revert (MCP + `/api/proof/*`). Live capture needs Playwright Chromium (`GET /api/health/capture`).

## Remaining

None on this loop’s DoD. Do not reopen Phases 1–6 unless a detector or proof path regresses. Leftover PLAN.md items (motion runtimes, Phase 9 polish) are **not** this feature — see PROJECT-STATUS.

## How to verify

```bash
pnpm test
pnpm -F @designproof/schema build
pnpm -F @designproof/web typecheck
# live smoke (web :3000, fixture :3001): POST /api/diagnose {"url":"http://localhost:3001"}
# expect meta.live=true and 14 findings; else fixture fallback with meta.live=false
```

## Skills to load first

`dp-schema-contracts` · `dp-capture-fingerprint` · `dp-detector-authoring` · `dp-taste-verdicts` · `dp-redesign-diff` · `dp-report-ui` · `dp-proof-verify` · `dp-demo-fixture`

MCP: `designproof_diagnose`, `designproof_redesign`, `designproof_apply`, `designproof_proof_verify`.

## Related

[`USER_STORY.md`](../../USER_STORY.md) · [`BUILD.md`](../../BUILD.md) · [`docs/06_DESIGN_PROOF.md`](../06_DESIGN_PROOF.md) · [`docs/01_DESIGN_SYSTEM.md`](../01_DESIGN_SYSTEM.md)
