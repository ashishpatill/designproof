---
name: designproof-taste
description: Subject-first art direction from the brief — inventory, one-sentence idea + swap/cover-the-logo tests, deal a small DesignProof-owned direction shortlist, carry to ConceptSpec/taste verdicts. Use before designFromFeatures or redesign.
---
# DesignProof taste

Runtime skill for DesignProof-owned taste. Learned from public patterns only; nothing vendored, forked, submoduled, or copied. **Not an MCP tool** — the catalog stays at eleven.

## Purpose
Make DesignProof decide a look from the **subject**, then measure it. Removal of slop is not enough; prefer a richer page with a decided direction over a thin default.

## Procedure
1. **Subject inventory** — who, place, materials/process, numbers competitors lack, what it explicitly isn't. Mark guesses.
2. **One sentence of idea** — "This page exists so <who> can <do what> using <what only this subject has>." Swap a competitor's name: if it still holds, it's a category sentence.
3. **Deal directions** — pick from a small **DesignProof-owned** shortlist (our JSON under `packages/` or `docs/`, never their twenty). For each candidate state composition/type/colour field/one image decision + tie to inventory. Choose one, name rejected alternatives.
4. **Feed the build** — pass direction/idea to `tell_design_from_features` or `tell_redesign`. Record in run notes / dossier. (Staged `tell_stage_*` tools are proposed, not shipped.)
5. **Imagery** — project photos or credited open archives, or honest empty. Record source+licence.
6. **Measure** — hand to `designproof-anti-slop` + `tell_proof_verify`; critique reads screenshots, capped rounds.

## Rules
- One idea, one direction. No theme packs.
- `DESIGN.md` wins for **DesignProof's own chrome** only; client work derives its own direction.
- The swap/cover-the-logo tests are gates.
- Never publish fixed font/colour recipes as a remedy — use procedures from the dated tells registry.

## Non-goals
Vendoring/installing taste-skill/TasteCode; shipping their scripts/evals/directions.json; new MCP tool; replacing `designFromFeatures`; replacing `DESIGN.md`; inventing URLs/stage tools.

## Related
- `.cursor/skills/designproof-anti-slop/SKILL.md`
- `.cursor/skills/tell-proof-verify/SKILL.md`
- `.cursor/skills/tell-taste-verdicts/SKILL.md`
- `packages/core/src/detectors/tells-registry.ts`
- Plan stubs: `docs/skills/designproof-taste.md`, `docs/skills/designproof-taste-loop.md`
