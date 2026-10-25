---
name: tell-proof-verify
description: Runs Tell Proof verification after UI changes — patch mode (apply patch + recapture URL) or preview mode (generated previewHtml). Returns pass/review/fail. Use when verifying agent UI edits, generated Studio previews, before merge, or when tell_proof_verify MCP is available.
---

# Tell Proof verify workflow

## When to use

- After drafting a redesign patch with `tell_redesign` / `tell_apply`
- Before merging a frontend PR that changes rendered UI
- When Ashish asks whether a visual fix actually improved the surface

## MCP path (Cursor Agent)

### Patch mode (live URL + candidate diff)

```
1. tell_diagnose on the running preview URL
2. tell_redesign with direction (e.g. "editorial")
3. tell_apply with projectRoot set to the workspace
4. tell_proof_verify { url, patch, projectRoot }
5. Read proof.newTells / proof.bannedTellsAfter before the score delta
6. Read the critique block: fix frame tells first, one round at a time
7. If status is "failed" and reverted is true → revise patch and retry
8. If status is "passed" or "review" → human approves merge
```

### Preview mode (generated HTML — Phase 5 proof input)

```
1. tell_design_from_features → { spec, previewHtml }
2. tell_proof_verify { previewHtml, spec? }   // do not also pass url+patch
3. HTML budgets run first (transfer ≤2048KB, ≤3 script tags, no http:// assets, viewport meta)
4. Disposable localhost serve + one capture; mode is "preview"; scoreDelta is 0 (no before baseline)
5. Honest ceiling is "review" unless a gate ban ships (then "failed") — do not treat review as passed
6. Read proof.bannedTellsAfter + critique; fix and regenerate preview, then re-verify
```

Pass **either** `previewHtml` **or** `url`+`patch`, never both. Catalog stays eleven tools.

## Verdict meanings

| Status | Meaning |
|--------|---------|
| `passed` | Genericness score dropped ≥3 points (`scoreDelta <= -3`), screenshot changed, no focus/structure regression, no gate ban after |
| `review` | Neutral or small change — human should judge |
| `failed` | Regression, patch did not apply, **or a gate ban still ships in the after capture** — auto-reverted when configured |

## Frame tells and the gate (since #108)

Four frame tells read rendered boxes and first-fold samples — no screenshot decoding, no model:

| Finding id | Detector | Registry status | Fails the gate |
|---|---|---|---|
| `tell-title-on-fold` | `TitleOnFoldTell` | **ban** | **yes** |
| `tell-mobile-first-screen` | `MobileFirstScreenTell` | **ban** | **yes** |
| `tell-frame-gutter` | `FrameGutterTell` | warn | no |
| `tell-blank-stretch` | `BlankStretchTell` | warn | no |

- A better score with `tell-title-on-fold` or `tell-mobile-first-screen` still present is a failure. `proof.bannedTellsBefore` / `bannedTellsAfter` list the gate-enforced ids; `proof.newTells` lists what this patch introduced.
- `scoreDelta` is `afterScore - beforeScore` on a genericness score, so a **negative** delta is the improvement.
- Captures without a fold sample (`capture.fold`, `viewportMatrix[].fold`) stay silent — older fixtures and offline reports are not retro-failed. Capture desktop **and** phone widths when a frame row matters.
- Ban/warn comes from the dated registry in `packages/core/src/detectors/tells-registry.ts`; `enforcedInProof` is the only field that says what the gate does today. Full read: `docs/skills/designproof-tells-registry.md`.

## Bounded critique (since #108)

The result carries a `critique` block planned by `packages/taste` (`planCritiqueRounds`): 3 rounds × at most 3 fixes, frame tells first, then severity, then finding id.

| Field | Use |
|---|---|
| `maxRounds` | Cap in force (`maxCritiqueRounds` can lower it, never raise it) |
| `roundsUsed` | Rounds closed so far |
| `rounds[]` | `index`, `focus` (detectors), `findings` (ids), `status` (`open` / `fixed` / `remaining`), `notes` |
| `screenshots[]` | Written PNG paths when `screenshotDir` was passed |
| `source` | `screenshots` or `report-only` |
| `nextAction` | The one next step, including the round number |

- Notes cite **screenshot paths**. Look at the images, not the source you just wrote; a note citing files is not a critique.
- With `source: "report-only"` no PNGs were persisted — pass `screenshotDir` (defaults under the OS temp dir, never into the checkout) or fix from `facts` and recapture.
- Close a round after fix + recapture with `closeCritiqueRound(critique, index, "fixed" | "remaining", notes)` from `packages/taste`. It is a caller API, not a tool: the catalog stays at eleven, and an out-of-range index throws so a loop cannot run unbounded.
- When `status` is `failed`, `nextAction` is prefixed `Gate failed.` and the remaining findings wait for the next capture.

## Web path

1. Set up repo locally (`/api/setup/start`)
2. Draft fix in Tell Report UI
3. Click **Prove patch** — uses `/api/proof/apply`
4. Compare before/after screenshots and score delta

## Rules

- Never auto-merge on `passed` alone — human reviews the diff
- Always capture the **same URL** as the baseline report
- Fix frame tells before cosmetic ones; the critique ranks them first for that reason
- One idea per critique round, then recapture and look again — capped at 3 rounds
- Prefer disposable checkout proof over editing the main branch directly

## Related

- Skill: `designproof-anti-slop` — detectors, registry rules, fixture DoD, bounded critique
- Skill: `designproof-taste-loop` — subject, direction and imagery before the gate
- Skill: `tell-mcp-tools`
- Skill: `tell-dogfood-audit`
- Skill: `gates-until-verified` — acceptance-gate loop around this verify path
- Skill: `agency-quality-site` — for **new** marketing sites, run typography → spacing → motion → 375px polish *before* proof-verify; keep axes isolated
- `docs/skills/designproof-tells-registry.md`, `packages/core/src/proof-verify.ts`, `packages/core/src/detectors/frame.ts`, `packages/taste/src/critique-loop.ts`

## Agency polish (when verifying a built marketing page)

If the change set is a greenfield / redesign marketing surface (not a one-line patch):

1. Confirm `agency-quality-site` phases 0–3 completed (or run `pnpm agency:pipeline`)
2. Proof-verify the **final** HTML/URL after axis-isolated polish — not the raw first build
3. Fail proof if ban-list / `assertAgencyDelivery` regressions appear after the patch
4. Prefer separate commits or ledger rows per polish axis when iterating
