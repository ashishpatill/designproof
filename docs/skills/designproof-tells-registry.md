# designproof-tells-registry: dated ban / warn rows
> **DesignProof-owned registry.** One row per `TellDetector`, dated, with a procedure for the replacement. No new MCP tool and no vendor: the catalog stays eleven. Source of truth for the rows below is [`packages/core/src/detectors/tells-registry.ts`](../../packages/core/src/detectors/tells-registry.ts); this page is the human read of it.

**Status:** in-repo (2026-10-24). **Pairs with:** [anti-slop](./designproof-anti-slop.md) (the named catalog) and [taste-loop](./designproof-taste-loop.md) (frame, multi-width, screenshot critique).

## How to read a row

| Field | Meaning |
|---|---|
| `since` | ISO date the row entered this registry, or `baseline` for detectors that predate it. Dates are how a tell gets retired. |
| `status` | `ban` — should not ship. `warn` — judge in context; the taste verdict may keep it as intentional. |
| `enforcedInProof` | What `tell_proof_verify` does **today**. Only enforced rows fail the gate on their own. Never read `ban` as enforcement. |
| `fixProcedure` | A procedure: derive the replacement from this subject, then re-measure. |

**No fixed recipes.** The registry never says "use this font", "use this colour" or "use this gradient instead". A fixed remedy becomes the next tell within a season. Every row points back to the subject — its inventory, materials, place, numbers — and to a measurement, not a taste preference.

## Rows

| Since | Detector | Finding id | Status | In proof gate | Tell |
|---|---|---|---|---|---|
| baseline | `SystemFontTell` | `tell-system-font` | warn | no | One default-class typeface carries most roles. |
| baseline | `GradientCrutchTell` | `tell-gradient-crutch` | warn | no | A decorative gradient stands in for an idea. |
| baseline | `ShadowEverywhereTell` | `tell-shadow-everywhere` | warn | no | Every container floats at the same elevation. |
| baseline | `RadiusMonotoneTell` | `tell-radius-monotone` | warn | no | One radius on every surface regardless of role. |
| baseline | `AcidAccentTell` | `tell-acid-accent` | warn | no | One high-saturation accent on a near-black surface. |
| baseline | `EmojiChromeTell` | `tell-emoji-chrome` | warn | no | Emoji used as interface chrome. |
| baseline | `CenteredEverythingTell` | `tell-centered-everything` | warn | no | Most large blocks are centred. |
| baseline | `GrayMushTell` | `tell-gray-mush` | warn | no | Near-identical neutrals blur instead of forming a ramp. |
| baseline | `BoilerplateCopyTell` | `tell-boilerplate-copy` | warn | no | Proof titles shared across AI-built pages. |
| 2026-10-24 | `TitleOnFoldTell` | `tell-title-on-fold` | **ban** | **yes** | The primary title starts below the fold or is cut by it. |
| 2026-10-24 | `FrameGutterTell` | `tell-frame-gutter` | warn | no | Every wide band is the same centred column. |
| 2026-10-24 | `BlankStretchTell` | `tell-blank-stretch` | warn | no | A dead band taller than half a screen between content runs. |
| 2026-10-24 | `MobileFirstScreenTell` | `tell-mobile-first-screen` | **ban** | **yes** | The phone first screen is the desktop hero squeezed. |

Frame rows read rendered boxes and first-fold samples (`capture.fold`, `viewportMatrix[].fold`). Captures without a fold sample stay silent — older fixtures and offline reports are not retro-failed.

## Procedures for the frame rows

These are the four rows added on 2026-10-24. The full procedure text lives in the TS registry and travels with each finding as `fixHint`.

- **Title on fold** — decide what the first screen is for, then fit the title and one action above the fold line. Do not shrink type to make it fit; change what the first screen contains.
- **Frame gutter** — break the single centred column once where the subject earns it (a full-bleed plate, an off-axis index), keeping one composed column rather than many.
- **Blank stretch** — fill the dead band with content that belongs there, or remove the spacing. Blank space must be a measured rest, not an accident.
- **Mobile first screen** — compose the phone first screen on its own terms: choose what the phone reader sees first (title, one action, one image) instead of squeezing the desktop hero.

## Adding or retiring a row

1. Add the detector to `TellDetector` in `@tell/schema`, then a registry row with a real `since` date and a procedure.
2. Add a failing fixture and a clean specimen in `packages/core/src/__tests__/detectors-frame.test.ts` (or the matching detector test).
3. Set `enforcedInProof` only when `verdictFromProof` actually fails on it, and say so here.
4. To retire a tell, keep the row, mark it retired in the same commit that removes the detector, and note the replacement. Do not delete history — a tell that returns should be recognised as one.

## Non-goals

Vendoring or installing any external taste skill. Fixed font/colour/spacing recipes. A second generate pipeline. A new MCP catalog tool.
