# designproof-taste-loop: subject-first direction, art direction, imagery
> **DesignProof-owned stub.** Learned from public patterns only ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), MIT). Nothing vendored, forked, submoduled, or copied. Not a Tell MCP (Model Context Protocol) tool; the catalog stays eleven today and nineteen by replacement. No public MCP endpoint.

**Status:** near-term (learn). **Inspiration:** Leonxlnx/taste-skill (art direction + real-browser inspect + look-and-fix).

## Purpose
Make DesignProof's staged design and proof loop decide a look from the **subject**, then **measure** and **critique** the result — so generate does not default to the average landing page. Extends existing Crease first-screen bar, swap test, and `tell_proof_verify`; does not replace `designFromFeatures`.

## Learned (the pattern, not the code)
- Models invent a category default unless a stage **deals a shortlist of researched directions** and the agent must pick one tied to this client's inventory (name, place, materials, numbers that competitors lack).
- **Removal of slop is not enough**: a thin page without substance loses to a richer page with tells. Prefer decisive type scale, full colour fields, and real pictures of this subject's world (credited open archives or the project's own shots) over empty restraint.
- **Inspect in a real browser** at several widths; fail banned tells by measurement, not by hoping the model obeyed.
- **Critique from screenshots**, not from the code the agent just wrote: glance → squint → cover-the-logo idea test → edges → frame → type → colour → images → section sameness → phone as its own composition. Fix the top few problems, look again (capped rounds).
- Keep a **dated tells registry** (ban / warn) that never publishes a fixed "use this font/colour instead" list — replacements are procedures (derive from subject / dealt direction), so today's remedy does not become tomorrow's tell.

## We build
- Phase 1 / staged concept: a DesignProof **direction deal** (small set of our own researched directions + subject inventory checklist) that feeds `ConceptSpec` / mood — our JSON and reject lists, not their `directions.json` (their twenty are not theme packs we ship).
- **Subject inventory → one-sentence idea + competitor/cover-the-logo test**: record the chosen direction and the one-sentence subject idea in the staged run.
- **Dealt art-direction picks from our researched set**: the agent must pick one direction tied to this client's inventory; no default house style.
- **Credited open-archive / project imagery policy**: real or credited sources, or honest empty; no grey-bar fake dashboards as proof of product UI.
- Imagery craft for specimens and demos: real or credited sources, or honest empty.

## Complements
Detectors, multi-width frame checks, and screenshot look-fix exit rounds live in [designproof-anti-slop](./designproof-anti-slop.md). This stub owns subject, direction, and imagery.

## Non-goals
Installing or vendoring taste-skill / TasteCode. Shipping their scripts, libraries, or evals. Adding a new catalog tool. Replacing DESIGN.md with their house style. Using their yellow-cream/terracotta "remedy" as our default (they already ban it as a third-wave tell). Theme packs. Replacing `designFromFeatures`. Public MCP endpoint.

## Acceptance cues
- A staged run records which direction was chosen and the one-sentence subject idea.
- Verify fails at least one fixture that violates a new frame/tell detector and passes a clean specimen.
- Critique notes cite screenshot paths, not source files; round count is bounded and visible in the dossier.
