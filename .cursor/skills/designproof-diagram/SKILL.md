---
name: designproof-diagram
description: Draws a DesignProof figure by hand as inline SVG and HTML on DesignProof tokens — flow, before/after, layer stack or timeline — for concept cards, proof dossiers and the Tell Report. Use when a page needs a diagram, when a figure has to say something true about the subject, or when a Mermaid/auto-layout drawing is about to ship.
---

# DesignProof diagrams

> **Learned from public patterns only.** Nothing vendored, forked, submoduled or copied. This is a **craft skill**: an agent draws the figure by hand. It is not the generate path (`planFigures`, `designFromFeatures` and `packages/design-skills/src/figures.ts` keep drawing their own figures), and it is **not an MCP tool** — the catalog stays at eleven. Promotion into generate waits on a measured specimen that beats the current figure quality.

A diagram is a claim drawn once. If the sentence under it could be deleted and the drawing still read, it is decoration. If the drawing needs a paragraph to explain which box comes first, the drawing failed and prose would have done better.

## Where it is used

| Surface | Real path | Figure that earns its place |
|---|---|---|
| Concept card (Studio) | `apps/web/src/app/studio/page.tsx` (`data-testid="concept-card"`) | One flow or before/after that draws the concept's metaphor — not four thumbnails of it |
| Proof dossier (exported page) | `packages/design-skills/src/templates.ts` (`research-dossier`), plate in `figures.ts` | Layer stack or flow that places every dossier claim on one coordinate |
| Tell Report | `apps/web/src/app/report/[id]`, `apps/web/src/components/report/`, `BeforeAfterSeam.tsx` | Before/after seam; timeline of critique rounds |

Craft skill first. Where the figure is drawn by hand today, the engine keeps its generated plate until a hand-drawn specimen measurably wins — then a separate change moves it into generate.

## Four kinds, no fifth

| Kind | Claim it makes | Pick it when | Reject it when |
|---|---|---|---|
| **flow** | this leads to that, in order | 2–5 steps, a real order, one pivot the others depend on | the order is inferred, reversible, or the reader already knows it |
| **before/after** | the same thing in both states, on one measure | the fix is visible and both sides are real (capture, drawing, number) | the "before" is a strawman you drew to lose |
| **layer stack** | these tiers, nested, each holding the one above | containment *is* the argument — scope, tiers, inheritance | the tiers are a list wearing boxes |
| **timeline** | this happened, then this, over real time | dates or rounds exist and the spacing carries meaning | undated phases, or a task list dressed as time |

Anything else is a section redesign, not a diagram. When none of the four makes the claim, write prose and draw nothing.

## Draw on DesignProof tokens

DesignProof chrome only — `#181614` paper, `Instrument Serif` / `Source Sans 3` / `IBM Plex Mono`, terra `#D4714A`. Never the light `#FAF6F0` paper or an Atelier/Plus-Jakarta direction. Full contract: `docs/01_DESIGN_SYSTEM.md` §2–3.

Two token surfaces exist; pick the one the figure actually lands in:

- **Tell app chrome** (Studio, Tell Report): `apps/web/src/app/globals.css` holds channel triplets, so write `rgb(var(--text))`, `rgb(var(--border))`, `rgb(var(--accent))`, and the faces as `var(--font-display|--font-sans|--font-mono)`.
- **Exported page HTML** (dossier bodies, report exports): `packages/design-skills/src/figures.ts` uses flat `var(--surface-ink)`, `var(--surface-body)`, `var(--surface-quiet)`, `var(--surface-border)`, `var(--c-accent)`.

**Ink, measured on `#181614`** (ratios computed, not estimated):

| Role | Token | Ratio | Use |
|---|---|---|---|
| Ink | paper-100 `#F3EDE4` / `--text` | 15.5:1 | titles, the labels the claim rests on |
| Body | paper-300 `#D4C9BA` / `--text-secondary` | 11.1:1 | supporting labels |
| Quiet | paper-400 `#B8AA98` / `--text-muted` | 7.9:1 | mono meta, ordinals, dates |
| Floor | paper-500 `#968876` | 5.2:1 | the dimmest text allowed — nothing below it |
| Accent | terra-500 `#D4714A` / `--accent` | 5.4:1 | exactly one element per figure |
| Rule | paper-700 `#574E45` / `--border` | 2.2:1 | lines and strokes, never text |
| Hairline | paper-800 `#3D3731` | 1.5:1 | edge and fill decoration only |

- **Contrast floor:** 4.5:1 for every label (small text), 3:1 for a mark that carries meaning. The quiet row still clears 4.5:1; the rule and hairline rows never carry words.
- `ink-500` `#3A6358` is 2.7:1 on dark — use it as a wash or a shape fill for "pass", never as label ink.
- **Type:** three roles already on the page, no fourth. `var(--font-display)` for at most one number per figure; `var(--font-sans)` for names and labels; `var(--font-mono)` for ordinals, dates and measured values. Mono floor **11 px**, sans floor **12 px** — a 12.5 px label buys nothing and spends a type step.
- **One accent per figure.** The pivot, the delta, the round under discussion. Two accents is no accent.

## Authoring rules

1. **Whole-pixel grid.** Node edges, spine and text baselines snap to whole units of one column pitch. A 3 px misfit reads as sloppiness long before anyone can name it.
2. **One spine.** Flows and stacks hang from a single rule; timelines from a single axis. Do not draw a second framing device around the first.
3. **Text before shapes.** Set the words at the size they will render, then draw boxes that fit them. Box-first diagrams clip or shrink — and SVG text has no ellipsis (`clipToWidth` in `figures.ts` exists for that reason).
4. **Label at the node.** No legends, no leader lines, no key in a corner. If a shape needs a legend, the shape is wrong.
5. **Marks the claim needs only.** No drop shadow, no gradient, no glow, no icon set, no rounded-everything (`rx` identical on every box is `tell-radius-monotone`), no arrowheads purely for motion.
6. **Real values.** Every number, date and count in a figure comes from the brief, the capture or the run notes. An invented "83%" is a lie with a typeface.
7. **Responsive by viewBox.** `viewBox` + `width="100%"` + `height:auto`; no fixed pixel width, no fixed height that letterboxes.
8. **Accessible as one sentence.** `role="img"` and an `aria-label` stating the claim ("Three stages: capture, measure, replace, with the pivot at measure"). Decorative marks get `aria-hidden="true" focusable="false"`. Never bake words into paths.
9. **0 KB of JavaScript.** No `<script>`, no event handlers, no external sprite `<use>`, no Mermaid, D3, Rough.js, svg.js, Cytoscape or any auto-layout library. CSS-only motion is allowed only if the page already has it and the drawing reads complete with it switched off.

## Readable at 360 px

The failure is arithmetic, not taste. A `560`-wide plate at 360 px viewport with a `16 px` gutter renders `328 / 560 = 0.59` — an 11 px label lands at **6.4 px**.

- Author the figure at the width it will render on phone (≈`328`) so viewBox units are real pixels, or raise the label so `size × renderWidth / viewBoxWidth ≥ 11`.
- Check the actual number at 360: rendered label height, and `document.body.scrollWidth` — a figure that overflows sideways is a bug, not a bleed.
- Wide plates are allowed to scroll *inside* their own `overflow-x: auto` frame; they are not allowed to drag the page.
- Belt and braces: a shorter, wider layout at phone pitch beats the same drawing squeezed.

## Minimal figure

A process claim about DesignProof itself — replace the nouns with the subject's, keep the geometry. Authored at phone width (`328`) on purpose, so every number in the markup is a rendered pixel.

```html
<figure class="dp-figure">
  <svg viewBox="0 0 328 96" role="img" preserveAspectRatio="xMinYMin meet"
       aria-label="Three stages: capture, measure, replace — the same URL is captured again after each fix.">
    <!-- one spine, three stages, one accent at the pivot -->
    <line x1="16" y1="34" x2="312" y2="34" stroke="rgb(var(--border))" stroke-width="1"/>

    <circle cx="16" cy="34" r="4" style="fill:rgb(var(--text))"/>
    <text x="16" y="22" font-size="11" letter-spacing="1"
          style="fill:rgb(var(--text-muted));font-family:var(--font-mono)">01</text>
    <text x="16" y="58" font-size="15" font-weight="600"
          style="fill:rgb(var(--text));font-family:var(--font-sans)">Capture</text>
    <text x="16" y="76" font-size="11"
          style="fill:rgb(var(--text-muted));font-family:var(--font-mono)">1920 · 390</text>

    <circle cx="164" cy="34" r="5" style="fill:rgb(var(--accent))"/>
    <text x="164" y="22" font-size="11" letter-spacing="1"
          style="fill:rgb(var(--text-muted));font-family:var(--font-mono)">02</text>
    <text x="164" y="58" font-size="15" font-weight="600"
          style="fill:rgb(var(--text));font-family:var(--font-sans)">Measure</text>
    <text x="164" y="76" font-size="11"
          style="fill:rgb(var(--text-muted));font-family:var(--font-mono)">3 tells</text>

    <circle cx="312" cy="34" r="4" style="fill:rgb(var(--text))"/>
    <text x="312" y="22" font-size="11" letter-spacing="1" text-anchor="end"
          style="fill:rgb(var(--text-muted));font-family:var(--font-mono)">03</text>
    <text x="312" y="58" font-size="15" font-weight="600" text-anchor="end"
          style="fill:rgb(var(--text));font-family:var(--font-sans)">Replace</text>
    <text x="312" y="76" font-size="11" text-anchor="end"
          style="fill:rgb(var(--text-muted));font-family:var(--font-mono)">same URL</text>
  </svg>
  <figcaption>Fix one tell, recapture the same URL — three rounds, then a human reads the diff.</figcaption>
</figure>
```

Caption states the claim, not the drawing ("The pipeline", "Our process"). Ordinals and measured values in mono; names in sans; the pivot in accent and nothing else.

## Workflow

1. **Write the caption first.** One sentence, in the run notes, before any markup. Two sentences means two figures.
2. **Pick one of the four kinds** and write down why the other three cannot make this claim. If none can, stop and write prose.
3. **Set the words** at their rendered size inside the viewBox.
4. **Lay the grid**: column pitch, one baseline, one spine. Round every coordinate.
5. **Draw the minimum marks**: spine, nodes, ordinals, one accent, one measure.
6. **Measure at 360 and at desktop**: contrast per text role from the table, smallest rendered label ≥ 11 px, no horizontal page overflow.
7. **Confirm 0 KB JS**: search the diff for `<script`, `onclick`, `d3`, `mermaid`. Nothing.
8. **Hand the page to the gate** (below). The figure is part of the page, so the page is what gets verified.

## Handoff

```
1. Load designproof-anti-slop (findings, registry, triage order)
2. tell_proof_verify { url, patch, projectRoot } on the page that embeds the figure
3. Read proof.newTells / proof.bannedTellsAfter before the score delta
4. Figure-side tells that actually fire: tell-gray-mush, tell-radius-monotone,
   tell-blank-stretch, tell-system-font
5. Fix, recapture the same URL; the 3 rounds × 3 fixes cap still stands
```

The gate measures the page, not the drawing. A figure can pass every detector and still be wrong — read the 360 screenshot path in `critique.screenshots` and look at the label sizes yourself.

## Acceptance cues

- One dossier plate and one Tell Report figure redrawn, with a side-by-side against the current figure (`packages/design-skills/src/figures.ts` output) in the run notes.
- Every text role meets 4.5:1 on `#181614`; no label under 11 px rendered at 360 px; page does not overflow sideways.
- The diff adds **0 KB of JavaScript** and no new dependency.
- The caption's claim is true of the subject, and the drawing would be missed if deleted.
- `tell_proof_verify` reports no new tells on the page that embeds it.

## Non-goals

- Copying diagram-design's skill tree, vocabulary, file layout or examples — learn the pattern, draw our own.
- Mermaid, D3, Rough.js, svg.js, Cytoscape, Excalidraw, or any runtime/build-time diagram DSL or auto-layout engine.
- Off-brand stock diagrams: generic "workflow" chains, cloud-architecture shells, funnels, icon rows, handshake or ladder clip-art.
- The generate path. `planFigures` / `designFromFeatures` / `figures.ts` keep their drawn plates; promotion into generate needs the measured win first.
- A Phase 7 / catalog MCP tool, a new `tell_*` tool, or a public MCP host — the catalog stays at eleven today.
- Rewriting dossier templates, or adding a fifth diagram kind, in this skill.
- A figure that would be an improvement if deleted.

## Related

- Stub and plan: `docs/skills/designproof-diagram.md` (kept as the plan of record)
- Sibling runtime skills: `designproof-taste-loop` (subject, direction, imagery), `designproof-anti-slop` (detectors, registry, bounded critique), `tell-proof-verify` (the gate)
- Contracts: `docs/01_DESIGN_SYSTEM.md` §2–3 (tokens, type), `apps/web/src/app/globals.css` (chrome vars)
- Current figure quality to beat: `packages/design-skills/src/figures.ts` (`flowDiagram`, `stackDiagram`, `horizonPlot`, `dossierPlate`)
