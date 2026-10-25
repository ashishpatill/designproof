---
name: designproof-taste
description: Directs a page from its subject instead of a house style — subject inventory, one-sentence idea, one dealt art direction, credited imagery — then hands the result to tell_proof_verify for measurement. Use when starting a new site or a notable redesign, when the first screen reads like a category default, or when choosing imagery for a specimen or demo.
---

# DesignProof taste loop

> **Plan link (proposed, not shipped):** the staged version of this loop (a dealt direction set recorded in the run, an explicit `theme`, imagery as its own reviewed stage) is proposed in the [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) and waits on Ashish in [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Until it ships, this file is the procedure an agent follows by hand and records in the run notes. Nothing here is an MCP tool; the catalog stays at eleven.

Generate defaults to the average landing page unless a direction is **decided from the subject** before layout starts. Removing slop is not the same as having taste: a thin page loses to a richer page that still carries a tell. This skill owns subject, direction and imagery. Detectors, frame checks and screenshot critique live in `designproof-anti-slop` and arrive through `tell_proof_verify`.

## When to use

- A new marketing site or app surface, or a redesign that changes the first screen
- The first screen could belong to any product in the category
- Choosing imagery for a specimen, dossier, demo or showcase page
- Reviewing a design that passed the gate but still feels anonymous

Not for a one-line patch to an existing, already-directed page — go straight to `tell_proof_verify`.

## 1. Subject inventory

Write the inventory **before** layout. Numbers and materials beat adjectives.

| Field | Ask | Example shape |
|---|---|---|
| Subject | What is this thing, in the client's own words? | "A pottery studio that fires to order" |
| Place | Where does it happen, and what does that place look like? | Named town, climate, room, light |
| Materials | What is it made of or made with? | Clay, glaze, kiln, paper, steel |
| Making | What does the work look like while it happens? | Hands, tools, process steps |
| Numbers | What numbers can this subject say that competitors cannot? | Batch size, firing hours, lead time |
| People | Who is it for, and what do they already know? | Buyer's vocabulary, not the industry's |
| Gap | What can this subject show that the category usually hides? | A real workshop, a real sample, a real receipt |

If a field cannot be filled, say so in the run notes and keep the honest empty. Do not invent a workshop, a customer or a number.

## 2. One-sentence idea

Reduce the inventory to one sentence the page is arguing:

```
<Subject> is the <category> for <people> who <the thing the category gets wrong>.
```

Then run two tests:

- **Cover the logo.** With the product name hidden, does the page still belong to this subject — its materials, place, numbers — or could it be any product?
- **Swap the name.** Put a stranger's brand name on the page. If the page still works, the direction came from the category, not from this subject. Go back to step 1.

Record the sentence in the run. It is the tie-breaker for every later "which option looks better" question.

## 3. Deal the direction

1. Research and write **2–3 candidate directions for this brief**, each with a type idea, a colour field, a composition move, and one image idea. Written for this subject — not pulled from a catalog of house styles, not a theme pack.
2. **Pick one** and state why it fits the inventory from step 1. "It looked cleaner" is not a reason.
3. Prefer decisive type scale, a full colour field, and real material over restrained emptiness with nothing in it.
4. Keep the DESIGN.md tokens for **DesignProof's own chrome**. A generated site gets its own concept; it does not inherit Instrument Serif / `#D4714A` by default. Existing presets in `packages/taste` steer a page that already exists; they are not the deal, and one preset is never the default answer.
5. Once the direction is chosen, colour is a **setting**, not a hash of the product name. Changing it swaps variables, not the composition.

## 4. Imagery

- **Own shots** or **credited open archives** only. Record source and licence next to each asset in the run notes.
- If neither is available, ship **honest empty** — type, colour field, drawing or diagram that belongs to the subject. Never a grey placeholder bar standing in for a product screenshot.
- No fake dashboards as proof of product UI, no stock photo that shows a different trade, no invented live URL or customer logo.
- Write alt text from the inventory ("glaze test tiles on a kiln shelf"), not from mood ("beautiful texture").
- Every image must survive the 360 px composition; check it at phone width before it lands.

## 5. Hand off to measurement

The loop is not done when the page looks intentional — it is done when it is measured.

```
1. Capture the page (baseline) at desktop and phone widths
2. tell_proof_verify { url, patch, projectRoot }
3. Read proof.newTells / bannedTellsAfter and the critique rounds
4. Fix frame tells first (see designproof-anti-slop), one idea per round
5. Recapture the same URL and look again — the critique is capped at 3 rounds
6. Stop at the cap; a human reviews the diff
```

Critique notes cite screenshot paths. If a fix changes the chosen direction or the one-sentence idea, say so in the run notes instead of silently drifting.

## Acceptance cues

- The run records: subject inventory, the one-sentence idea, the chosen direction and why, and each image's source.
- The cover-the-logo and swap-the-name tests were answered, not skipped.
- A page with no credible imagery ships honest empty, not grey bars.
- `tell_proof_verify` passes on the directed result, with no new frame or gate tells.

## Non-goals

- Installing, vendoring, submoduling or copying any external taste skill — learn the pattern, write our own.
- Adding an MCP tool, a theme pack, or a second generate pipeline.
- Replacing `designFromFeatures` or DESIGN.md.
- A house style that ignores the subject, or a fixed font/colour recipe that becomes the next tell.
- Inventing live URLs, customers, materials or numbers.

## Related

- Stub and plan: `docs/skills/designproof-taste-loop.md`
- Sibling runtime skills: `designproof-anti-slop` (detectors, frame checks, critique), `tell-proof-verify` (the gate)
- Contracts: `DESIGN.md` (DesignProof chrome only), `docs/08_AI_DESIGN_METHODS.md`, `packages/taste/src/presets.ts`
