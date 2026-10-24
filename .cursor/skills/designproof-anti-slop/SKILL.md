---
name: designproof-anti-slop
description: Works the DesignProof anti-slop gate end to end — read detector ids and the dated tells registry, run tell_proof_verify, replace a tell by procedure, and keep failing fixtures honest. Use when a rendered page reads generic, when triaging proof findings or critique rounds, or when adding a fixture for a tell.
---

# DesignProof anti-slop gate

> **Learned from public patterns only.** Nothing vendored, forked, submoduled or copied. No new MCP tool: the gate rides inside the existing `tell_proof_verify` and the catalog stays at eleven. Subject, direction and imagery live in `designproof-taste-loop`; detector code is `tell-detector-authoring`'s job.

The gate is a named catalog of small, single-purpose checks, not one vague "looks generic" score. Each check has an id, a severity, measured evidence, a plain-language reason, and a **procedure** for the replacement.

## Where it lives

| Piece | Path |
|---|---|
| Detector logic | `packages/core/src/detectors/index.ts` (14 shape/drift), `packages/core/src/detectors/frame.ts` (4 frame) |
| Dated registry (source of truth) | `packages/core/src/detectors/tells-registry.ts` |
| Human read of the registry | `docs/skills/designproof-tells-registry.md` |
| Bounded critique | `packages/taste/src/critique-loop.ts` |
| Gate + result shape | `packages/core/src/proof-verify.ts` → `tell_proof_verify` |

## Read a finding

```
id        tell-title-on-fold          stable finding id, the gate column
detector  TitleOnFoldTell            maps 1:1 to a registry row
severity  high | medium | low        high first
facts     measured numbers only      authoritative — a taste verdict may not contradict them
evidence  computed / probe / screenshot-region (+ selector, region)
fixHint   the registry's procedure   act on this, not on vibes
```

## Registry rules

- `status` (`ban` / `warn`) is the design call. `enforcedInProof` is what the code actually does. **Never read `ban` as enforcement.**
- Enforced today, and the only rows that fail the gate on their own: `tell-title-on-fold`, `tell-mobile-first-screen`.
- Warn rows (`tell-frame-gutter`, `tell-blank-stretch`, and the nine baseline shape tells) surface in the report and the critique; they do not fail the gate.
- A warn row kept on purpose gets an `intentional` taste verdict with a reason — not a silenced detector.
- Dates are how a tell retires. Keeping history matters: a tell that returns should be recognised as one.

## Workflow

1. **Baseline.** Capture the page at desktop **and** phone widths before editing. Frame rows read `capture.fold` / `viewportMatrix[].fold`; a capture with no fold sample stays silent, so an old fixture is never retro-failed.
2. **Patch, then verify.** `tell_proof_verify { url, patch, projectRoot }` applies in a disposable checkout, recaptures the same URL and returns `status`, `proof`, `critique`, `reverted`.
3. **Triage in this order:** `proof.newTells` → `proof.bannedTellsAfter` → `proof.bannedTellsBefore` → score delta. A lower genericness score with a ban still on the page is a **failure**, not a win (`scoreDelta` is `afterScore - beforeScore`; negative is better).
4. **Fix frame before cosmetics.** `planCritiqueRounds` ranks `TitleOnFoldTell`, `FrameGutterTell`, `BlankStretchTell`, `MobileFirstScreenTell` ahead of everything else — they decide what the reader sees first.
5. **One idea per round.** Each planned round carries at most 3 findings. Recapture and look again; do not rewrite five things and hope.
6. **Stop at the cap.** 3 rounds × 3 fixes by default (`MAX_CRITIQUE_ROUNDS`, `MAX_FIXES_PER_ROUND`). `maxCritiqueRounds` can lower the cap, never raise it. Findings left over wait for the next capture — the loop does not extend.
7. **Human merge.** `passed` still gets a human reading the diff. `failed` auto-reverts when `revertOnFail` is true (default).

## Bounded screenshot critique

`tell_proof_verify` attaches a `critique` block:

| Field | Meaning |
|---|---|
| `maxRounds` | The cap in force for this run |
| `roundsUsed` | Rounds actually closed |
| `rounds[]` | `index`, `focus` (detectors), `findings` (finding ids), `status` (`open` / `fixed` / `remaining`), `notes` |
| `screenshots[]` | Written before/after PNG paths (`screenshotDir`, defaults under the OS temp dir) |
| `source` | `screenshots` when PNGs were written, else `report-only` |
| `nextAction` | The one thing to do next, including the round number |

- Look at the **screenshot paths**, not the source the agent just wrote. Notes that cite files instead of images are not a critique.
- With `source: "report-only"` there are no PNGs to cite: fix the top tells from `facts`, recapture, and treat the missing images as a gap to close (pass `screenshotDir`).
- Closing a round (`closeCritiqueRound(critique, index, "fixed" | "remaining", notes)`) is a `packages/taste` API used by callers. It is **not** an MCP tool, and an out-of-range index throws on purpose.

## Replace a tell by procedure

The registry deliberately publishes no fixed font, colour or spacing recipe — a recipe becomes tomorrow's tell. For any row:

1. **Name what the tell replaced.** Say which decision the slop made for you.
2. **Derive from the subject**, using the inventory from `designproof-taste-loop`: material, place, numbers, era, the thing competitors hide.
3. **Change one thing**, then re-measure the rendered page. Measurement decides whether it worked — not the diff's tidiness.
4. **Retire honestly.** Keep the row, mark it retired in the same commit that removes the detector, and note what replaced it.

## Fixture DoD (when a tell is added or tuned)

- A **failing fixture** that triggers the tell at a documented threshold, and a **clean specimen** that passes.
- Golden assertions against committed capture JSON; `pnpm test` green.
- A registry row with a real `since` date and a procedure.
- Set `enforcedInProof` only when `verdictFromProof` really fails on it, and say so in `docs/skills/designproof-tells-registry.md`.
- Shipped specimens report 0 new genericness tells.
- No invented facts the taste layer cannot validate.

## Non-goals

- New detector code in this skill — that is `tell-detector-authoring` plus `@tell/schema` first.
- A second generate pipeline, a replacement for `designFromFeatures`, or a new catalog tool.
- Installing or vendoring any external anti-slop skill or its checks.
- Fixed font/colour/spacing remedies, theme packs, or "modernise" patches that dodge the measured finding.
- Editing the main checkout to make proof pass.

## Related

- Stub and plan: `docs/skills/designproof-anti-slop.md`, `docs/skills/designproof-tells-registry.md`
- Sibling runtime skills: `designproof-taste-loop`, `tell-proof-verify`, `tell-detector-authoring`
- Methodology: `docs/05_GENERICNESS_METHODOLOGY.md`, thresholds in `BUILD.md` §5.3–5.4
