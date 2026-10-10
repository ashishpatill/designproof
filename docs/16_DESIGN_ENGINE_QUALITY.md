# 16 — Design engine quality: diagnosis, benchmark, target

> Why `packages/design-skills` produces competent-but-generic pages, what the
> measured corpus actually says top-tier work does, and the target architecture
> that would make Design Proof's generator best-in-class.
>
> **Evidence in this file was measured on 2026-10-05** by rendering all 17
> `DESIGN_TEMPLATES` through `designFromFeatures`, screenshotting them at
> 1440×900, and running the repo's own probes over the output. Reproduction
> commands are in §9. Nothing here is a taste claim that is not backed by a
> measurement or a `file:line`.
>
> **M1 re-measured part of this on 2026-10-06 and one claim did not survive.**
> See §6 M1: the "repeated marks earn drawn matter" argument in §1.3 / RC5 is not
> supported once a drawing is fingerprinted with its captions stripped — the marks
> share dimensions but are different drawings. Treat §1.3 as a visual observation,
> not as evidence that the metric is gamed.
>
> Related: [`05_GENERICNESS_METHODOLOGY.md`](./05_GENERICNESS_METHODOLOGY.md) (the critic rubric) ·
> [`10_DESIGN_EVIDENCE.md`](./10_DESIGN_EVIDENCE.md) (the calibrated corridors) ·
> [`09_PREMIUM_DESIGN_SKILLS.md`](./09_PREMIUM_DESIGN_SKILLS.md) (the offering catalog) ·
> [`17_AGENT_PLUGIN_DISTRIBUTION.md`](./17_AGENT_PLUGIN_DISTRIBUTION.md) (shipping it)

**Status:** diagnosis closed · **M1 landed 2026-10-06** · target architecture proposed · M2–M7 not started
**Authority:** this doc is the source of truth for *generation* quality. `docs/05` stays the source of truth for *detection*.

---

## 0. One paragraph

Design Proof has a **measuring instrument** and a **critic**, and both are genuinely good: 14 detectors,
6-axis genericness scoring, an 82-reference calibrated corpus, and a layout audit that catches
overflow, clipping, vacancy, and repetition. What it does not have is a **generator**. The thing
called the design engine is a **single hand-written stylesheet plus a 15-branch switch statement**:
97.4% of the CSS lines emitted for any template are byte-identical to every other template, 65 CSS
classes appear on all 17 pages, every page ends with the same seven-section tail, only photography
exists in 2 of 17 offerings, and the engine's own craft score (0.989) is high precisely because the
instrument measures the scalars the engine already controls. The bar in the docs — *stacked images,
motion, artistic, unique* — is not a bar the current architecture can clear by any amount of
tuning, because there is no code path that produces an image stack, a scroll-driven composition, or
an art-directed palette.

---

## 1. Measured state of the 17 offerings

Rendered `designFromFeatures(DESIGN_TEMPLATES[i].brief)` → `previewHtml`, loaded in Chrome at
1440×900.

| Template | DOM nodes | HTML text chars | inline CSS bytes | `figure`/`img` | SVGs | section count |
|---|---|---|---|---|---|---|
| saas | 412 | 18 295 | 229 975 | 2 / **0** | 9 | 7 |
| dashboard | 385 | 16 099 | 227 102 | 2 / **0** | 8 | 6 |
| corporate | 511 | 19 553 | 230 215 | 4 / **0** | 16 | 8 |
| educational | 391 | 17 244 | 229 414 | 3 / **0** | 12 | 6 |
| fintech | 355 | 17 596 | 229 958 | 2 / **0** | 9 | 6 |
| studio | 542 | 18 891 | 231 241 | 4 / **0** | 14 | 9 |
| consumer | 467 | 18 645 | 231 229 | 4 / **0** | 12 | 8 |
| foundry | 531 | 18 917 | 231 158 | 4 / **0** | 13 | 7 |
| dossier | 658 | 19 276 | 230 486 | 4 / **0** | 14 | 7 |
| observatory | 638 | 19 186 | 230 131 | 4 / **0** | 13 | 7 |
| archive | 795 | 19 106 | 230 209 | 4 / **0** | 14 | 7 |
| loom | 759 | 18 666 | 230 429 | 4 / **0** | 15 | 7 |
| herbarium | 588 | 19 225 | 230 037 | 4 / **0** | 14 | 7 |
| press | 1 526 | 19 060 | 231 001 | 4 / **0** | 12 | 7 |
| lantern | 539 | 18 806 | 231 546 | 4 / **0** | 13 | 7 |
| clinic | 477 | 18 754 | 230 497 | 4 / **0** | 9 | 7 |
| harness | 464 | 17 623 | 227 229 | 4 / **0** | 13 | 7 |

**Zero `<img>` elements exist anywhere in `packages/design-skills/src`.** Exactly two templates embed
any raster at all, and both do it as SVG `<image href="data:image/jpeg;base64,…">`:

| Template | `<image>` elements | distinct payloads | where | drawn size |
|---|---|---|---|---|
| `loom` | 6 | 3 | `loomWeave` (figures.ts:2898) — a 3×2 warp/weft grid | 344×194 each |
| `herbarium` | 3 | 3 | `templatePlate` (figures.ts:3040) — one voucher window + two 20×20 chips | 388×252 + 20×20 ×2 |
| other 15 | **0** | — | — | — |

Six base64 JPEGs live in `free-assets.ts:8-15` and reach exactly those two call sites; `planFigures`
maps them only from `commerce-loom` (`figures.ts:3533`) and `field-guide` (`figures.ts:3535`). So the
engine's raster vocabulary is **four distinct photographs, on two offerings, at thumbnail scale** —
against a corpus whose median page carries 42 images.

The evidence corpus says the median reference page carries **42 images** and **52 inline SVG nodes**
(`docs/10 §Measured distributions`). The engine's median is **0 images**, 13 SVGs — and most of those
SVGs are the same decorative marks repeated (below).

### 1.1 Cross-template similarity

Measured over the 17 rendered documents:

| Comparison | Result |
|---|---|
| Non-empty CSS lines present in **all 17** templates | **2 773 of 2 846 (97.4%)**; 87.8% of the CSS *characters* |
| Union of all non-empty CSS lines across all 17 | 3 094 — the whole per-template delta is **321 lines** |
| CSS *declarations* per page (saas) | 4 209 |
| CSS classes appearing on **all 17** pages | **65** (of 517 distinct) |
| Copy (word-set) Jaccard, mean pairwise | **64.4%** |
| Structural HTML-token Jaccard, mean pairwise | 35.4% (42.9% saas↔dashboard) |
| `--gutter`, `--section-y`, `--w-content`, radius, shadow, borders | assigned **once** in a single `:root` (css.ts:1798-1826); no per-kind override |
| Per-`data-sitekind` custom-property overrides in 4 268 CSS lines | `--m-stagger/--m-entrance/--m-reveal` (16 rules) + `--align-rail` (3 rules) |

Read that 321-line delta precisely, because it is the whole thesis of this document. It is not 321
lines of *rules* the other templates lack; most of it is small per-kind override blocks for
backgrounds, motion keyframes, rails and hero plating. The measured effect is that the three
sub-agents' independent inventories and the 65 universally-shared classes agree: `--gutter`,
`--section-y`, `--w-content`, the radius ladder, the shadow ramp, the border treatment, the page
gradient, the film grain, the footer grid, the FAQ grid and the nav are one definition used by
seventeen pages. The only *per-template* visual difference in the stylesheet is three motion
durations and one alignment rail.

### 1.2 The pages are structurally the same page

`planSections` (`composition.ts:251-960`) is 15 hard-coded `siteKind` branches plus a generic tail.
Ten of the seventeen — foundry, dossier, observatory, archive, loom, herbarium, press, lantern,
clinic, harness — emit **the identical eight-section skeleton**:
`hero → features:feature-index → figure:figure-explainer → template:template-band → story:* →
faq:faq-columns → cta:cta-band → footer:footer-columns`, each with the same surface assignment and
the same `5fr 7fr` "bonded" FAQ. Only the hero layout and the single `story-*` variant differ.

The brief does not select a section kind. It influences only (a) how many feature bands,
(b) a handful of `featureCount`/`goal`-gated extras, and (c) for `saas-marketing` alone, hero and
proof layout via capability classification (`composition.ts:868`).

### 1.3 The figures are decorative marks, and the metric counts them as art

Every template emits the same figure families:

- `signature` mark — **byte-identical, 352×123, on all 17 pages**
- `horizon` plot — on all 17; the full-bleed variant is 1440×760 and is the **single largest figure
  on every page** (`figures.ts:776`)
- `capabilityMark` — the same 1px monochrome stamp repeated 4–6× per page at identical dimensions
  (e.g. five × `152×97` on saas, six × `144×92` on fintech)
- `scrub`, `stack`, `interface` — shared across 5–14 kinds each

`figureAreaRatio` — a scored craft dimension (`scripts/design-research/metrics.ts:216`, band
`0.05–0.40`) — sums the bounding boxes of `img, video, canvas, picture, svg`
(`scripts/design-research/forensics.ts:604-624`). So the repeated marks *are* what earns saas 0.16,
herbarium 0.20, and dashboard 0.26 on "drawn matter". The metric cannot distinguish a
1440×760 generated diagram from a photograph.

The figure geometry itself is seeded xorshift noise: `rng(seed)` (`figures.ts:33-43`) drives
`opacity = 0.25 + r()*0.35` (`:979`, `:1152`, `:1358`). Labels come from real feature names;
shapes do not come from anything.

### 1.4 The same seven hard defects appear in the rendered output

| Defect | Evidence |
|---|---|
| **The page is a document in a dark frame, not a full-bleed site.** `body[data-frame="paper-technical"] #main{max-width:min(100%,calc(var(--content-wide,72rem)+4rem))}` — **`--content-wide` is declared nowhere**, so `#main` is frozen at 1216px while `body` paints a dark field. At 1440px that is a 112px dark band down each side; at 1440×900 the 900px hero ends at y=965 with dead space under it. | `css.ts:3992`, `css.ts:3980-3982` |
| **A hero that names the same capability six times.** In `saas`, "Account scoring" reaches the reader 13× on the page and **6× inside the hero alone** — as a rail button's `data-rail-label`, its `data-view`, its visible `.ds-priority-label`, the rail caption, the queue-console SVG `<text>`, and the interface-plate SVG `<text>`. "Pipeline coaching" reaches 3× in the hero, 9× on the page. | rendered `saas`; `render.ts` hero-queue branch + `figures.ts:2436` `queue-console` |
| **Whitespace is eaten inside the flex h1.** The `loom` hero renders as `everySKU` in the browser: the `<h1>` is `"…every"` and `"SKU under one honest weave"` in two sibling `.ds-weft-pick` flex items, and the flex layout collapses the inter-item space. The underlying copy is correct (`"The press that keeps every SKU under one honest weave"`, `templates.ts`), so no test can see it. | screenshotted, template `loom`; `<h1><span class="ds-weft-pick">…every</span><span class="ds-weft-pick">SKU…` |
| **Overlapping, low-contrast chrome.** The herbarium fold prints `Kingdom→Species treadles under the press so ranks stay reachable without a left sticky rail` **on top of** the plate's own mono labels; `Trait`, `Hinge` and the pin labels are unreadable behind it. | screenshotted, template `herbarium`; `css.ts:2201-2223` band-overlap set |
| **Product mockups are skeleton bars.** `queue-console` (691×614) draws grey placeholder bars with invented durations (`91m`, `94m`, `52m`) beside a rail naming the same five capabilities. | screenshotted, templates `saas`, `dashboard`; `figures.ts:2436` |
| **Boilerplate footer on all 17.** Four columns — *Capabilities / Evaluate / Company / Trust* — with fifteen fixed literal link labels, `© 2026` hardcoded, and "All capabilities listed on this page are available today". | `sections.ts:1443-1468`, `render.ts:2295-2333` |
| **No mobile navigation.** `.ds-nav-links{display:none}` under 820px with no replacement menu. | `css.ts:4254` |
| **Four phantom custom properties**, three of which break behaviour silently. | see §5.5 |

### 1.5 Two of the engine's own instruments disagree with its score

The engine's committed craft score is **0.9890** (`research/critique.json`, 17 pages, holdout
0.9675). Running the repo's *other* instrument — `AUDIT_PROBE` from
`scripts/design-research/layout-audit.ts`, the tool written specifically for "defects the craft score
cannot see" — over the same 17 rendered pages produces:

```
dashboard   vacancy 1  {"section":"hero","height":900,"fill":0.78,"gap":"480x480"}
corporate   repetition 1  "a single system across product sales material and the contract you sign" (×3)
corporate   vacancy 1  {"section":"hero","height":900,"fill":0.64,"gap":"1160x320"}
fintech     vacancy 1  {"section":"hero","height":900,"fill":0.71,"gap":"1160x260"}
foundry     vacancy 1  {"section":"hero","height":900,"fill":0.84,"gap":"440x360"}
harness     clipped 1  span.ds-turn-label "You can redirect without starting over."
```

A **1160×320px empty rectangle inside the corporate hero** is a defect the layout audit names and the
craft score does not see, because the score reads populations of scalars, not rectangles. `pnpm
research:audit` is not part of `pnpm test`; nothing gates on it.

**Conclusion:** the craft score is a *specification-compliance* score, not a quality score. It
measures the scalars the generator already sets (padding, contrast, hue count, radius steps, shadow
coverage, transition duration). A page can be inside every band and still be a dark-framed document
with a 1160×320 void in its hero. Optimising it further cannot produce design quality; it can only
produce more compliance.

---

## 2. Root causes, ranked by how much quality each one suppresses

These are the reasons the output is generic. Each is structural — none is fixed by tuning a value.

### RC1 — The engine has no art-direction layer; it has one stylesheet with 17 `data-sitekind` attributes

97.4% of the emitted CSS is shared. There is exactly one geometry system (2-track `minmax()` splits
from a four-entry `SPLIT[lean]` table, `composition.ts:198-203`), one spacing ramp, one radius
ladder, one shadow ramp, one gutter, one page gradient, one film grain — declared once and never
varied. What the "17 offerings" actually vary is: hero layout id, one story variant, three motion
durations, and a palette hue.

*The architecture has no concept of "this offering looks different." It only has "this offering is
tagged differently."*

### RC2 — Sections are chosen by a switch statement, not by the brief

`planSections` is a 15-branch `switch` on `siteKind`. `analyze.ts:105-131` computes
`recommendedSections` — including a `workflow-proof` variant — and **it never reaches composition**;
its only consumer is `route.ts:95-108`. `CompositionInput.hasApprovalWorkflow` is declared
(`composition.ts:63`) and never read. `density` is destructured (`composition.ts:252`) and never
used. `heroLayout`'s eleven `siteKind` branches are unreachable because every early-return kind
exits before its only call site.

So two different products of the same kind get the same page shape, and a brief that describes a
fundamentally different product (a ledger, a marketplace, a scheduling tool) gets the same ten-band
skeleton unless someone adds a new `siteKind` branch by hand.

### RC3 — Information architecture is not modelled at all

There is no representation of "this page must make this argument." There is no notion of a
narrative arc, a proof obligation, a claim that needs a number, or a buyer question that must be
answered before the CTA. Sections are *templates of markup*, filled with copy. This is why the copy
reads the same across products (64.4% word-set overlap) and why `docs/09 §9` has to police it with a
sentence-sharing rule ("a sentence that would read the same for a different product does not ship")
instead of the engine producing brief-specific language by construction.

### RC4 — There is no imagery system

Six base64 JPEGs, two reachable figure kinds, no `<img>`, no illustration, no photographic
treatment, no per-brief asset direction. The bar in `AGENTS.md` and `PROJECT-STATUS.md` is literally
"**stacked images**, motion, artistic, unique" and the generator cannot emit a stack of images. This
is the single largest gap between the stated bar and the code.

### RC5 — The measurement is gamed by construction

The craft dimensions read scalars the generator controls, so the generator is at 0.989 while the
layout audit finds a 1160×320 void in a hero. Worse, the specific dimension that is supposed to
stand in for "drawn matter" counts repeated decorative SVG stamps, so adding *more marks* raises the
score without adding a single thing a buyer would look at.

An optimisation loop that closes on a gamed instrument converges on the game, not on the goal. The
history shows exactly this: `research/LOOP_LEDGER.md` records 84.4 → 95.8 → 97.1 → 97.7 → 98.3 →
99.8 across five loops, and the qualitative notes in the same file already name the remaining
failures the score cannot see ("still too many empty half-columns and hairline grids"; "vacancy the
score could not see").

### RC6 — The measurement is not in the generation path

`packages/design-skills/src` imports `node:fs` in exactly two places, both inside the training-data
sink. The engine **never reads** `research/aggregate.json` or `docs/10_DESIGN_EVIDENCE.md`. Every
corridor is a transcribed constant (`composition.ts:966-1013`, `tokens.ts:3-6`, `palette.ts:204-213`,
`scale.ts:148-176`). The corpus is a report the engine's authors read, not a signal the engine obeys.

### RC7 — 31 of 37 "skills" are decorative

`routeSkills` returns 37 nodes. Exactly **six** change a pixel: `paper-technical-frame`,
`ambient-atmosphere-craft`, `signal-beam-craft`, `responsive-performance`, `authored-motion-slot`,
`motion-stack-craft` (`render.ts:2905-2919`, `css.ts:4226`). The other 31 are read only by
`basics-checklist.ts`, `skill-wiring.ts`, and tests. The skill graph — the thing `docs/09` presents
as Design Proof's craft layer — is metadata that audits output it does not produce.

### RC8 — Only two composition axes exist, and both are bounded to four values

Layout: 4 split ratios. Type: a 10-step ladder with `displayPx` from an integer range of 44–88 and
`ratio` from {1.3, 1.32, 1.414, 1.5}. Colour: one achromatic ramp (`paperChroma ≤ 0.006`), one
accent, one inverse (chroma ≤ 0.028). Motion: 9 CSS verbs, 7 sticky rules in 4 268 lines, no
scroll-scrubbed transform, no parallax, no pin-and-swap. A page cannot change its own rhythm
mid-scroll because every scalar is a root token assigned once.

### RC9 — The corpus bands were not the right target

The bands were calibrated from 82 anonymised rendered pages and then collapsed to scalar
percentiles. What the corpus could have taught — composition recipes, figure vocabulary per
category, tonal sequencing, grid systems with asymmetric spans, photographic treatment — was
discarded in the aggregate. The raw measurements still contain far more than the bands use
(`research/measurements/ref-*.json` carries per-band ink ratios, column counts, asymmetric grid
ratios, network image counts, font files, and category signatures), so the fix is available without
re-running forensics.

### RC10 — The history is a subtractive campaign against a shared-component architecture

653 commits. The recurring verbs are *strip*, *drop*, *remove*, *no longer*, *says each thing once*.
Three templates (saas, dashboard, fintech) were each rewritten recently to delete sections and
de-duplicate copy — a **copy and section-count** fix for a **visual** problem. The shared
`marquee-proof` board was removed from craft kinds in `32453f7` and again in the 2026-10-05 series.
Every "unique" fix has been followed by a new shared component because the architecture's cheapest
move is always to build one section and reuse it. A subtractive campaign cannot win against that.

---

## 3. What the engine currently is, and what it is not

| | Is | Is not |
|---|---|---|
| Critic | 14 detectors, 6-axis score, calibrated corpus, layout audit | — |
| Generator | one 4 268-line stylesheet, one 15-branch plan switch, 25 SVG marks | an art-directed page composer |
| Variation | `data-sitekind` attribute, palette hue, hero layout id, 3 motion durations | a per-brief visual system |
| Content | `copy.ts` tables + optional Gemini author on 1 of 17 templates | brief-grounded information architecture |
| Media | six base64 JPEGs on two kinds | an imagery system |
| Feedback | offline research loop, not in CI, not in the render path | a closed generation loop |
| Skills | 37 routed nodes, 6 with pixel effect | a craft layer |
| Measurement | specification compliance | design quality |

---

## 4. Benchmark: what separates a tier-one site from this engine

This section answers "benchmarking top web designers' work and their templates" using the repo's own
evidence first, and the craft literature second. Reference identities stay anonymised
(`docs/10`, `research/README.md`); the corpus is the measurement, not a name list.

### 4.1 What the corpus actually measures that the engine ignores

From `docs/10 §Calibrated craft bands` and the raw `research/measurements/ref-*.json`:

| Signal | Corpus band | Engine | Gap |
|---|---|---|---|
| Images | p10 3, **median 42**, p90 107 | **0** | total |
| Inline SVG nodes | p10 2, median 52, p90 163 | 9–16, mostly repeated marks | >3× |
| Font files | p10 2, **median 5**, p90 11 | 1 Google request | ≥5× |
| Drawn matter ÷ page area | 0.196–0.778 | 0.16–0.26, counted from stamps | gamed |
| Layered / overlapping elements | 11–157 | 11–15 | at the floor |
| Alignment axes | 3–6 | 4–5 | inside, but only via fixed rails |
| Content width tiers | 5–10 | 6–9 | nominal |
| Distinct section shapes | 2–7 | 4–8 | inside |
| Section coverage variation | 0.447–0.96 | 0.36–0.57 | **below floor on the fold** |
| Full-bleed band share | 0.1–1.375 | 0.07 (saas), 0.11 (docs) | below floor |
| Gradients | 0–50 elements | 1 page gradient | minimal |
| Inverted band share | 0–0.889 | one inverse CTA + one template | at the floor |
| Declared tokens | 87–1983 | 170-ish declared, 4 209 declarations | fine |

Two numbers stand out: **images** (0 vs median 42) and **font files** (1 vs median 5). Both are
things a reader registers before they can name anything, and neither is expressible in the current
token system. The engine's three-family / one-request typography is the reason every template reads
in the *same voice*: `tokens.ts:69-90` picks from three pairings per lean via an FNV-1a hash of
`productName|siteKind`, so "different templates" mostly means "different hue".

### 4.2 The craft principles the corpus bands encode, stated as qualities

The bands are the residue of ten properties that top-tier pages share. Ordered by how much they
matter, and by how far the engine is from each:

1. **One dominant idea owns the first screen.** Not a nav, not a headline beside a list — one image,
   one drawing, one interface, one statement, at a scale nobody would call balanced.
   *Corpus:* hero display 22px–720px, p90 115px; drawn matter above fold 0.337–1.0.
   *Engine:* a two-column claim-plus-skeleton-console at 3.4vw; fold figure 0.26–0.45.
2. **The page is a sequence of distinct rooms, not one column of bands.** Shape variety 2–7,
   repeated-shape-run ≤0.5, coverage variation 0.447–0.96.
   *Engine:* ten kinds share the same eight rooms in the same order.
3. **Type carries the argument.** Display÷body median 3.44 (p90 6.67); weights 3–8; distinct sizes
   6–14; tight display leading 0.975–1.15; display measure 12.8–32.9ch.
   *Engine:* inside every one of these bands, and still reads uniform because the *same* ladder and
   the *same* three pairings are used on every page. Compliance is not identity.
4. **Colour is a decision, not a preference.** Hue discipline 0–5 distinct hues; accent coverage
   0–0.469; surfaces are layered (4–26 distinct) rather than shadowed (shadow share 0–0.014).
   *Engine:* one achromatic ramp + one accent + one inverse, capped at chroma 0.12/0.028. Inside the
   bands, and incapable of a duotone, a photographic overlay, a coloured field, or a section-level
   hue shift.
5. **Photography and illustration are the argument.** Median 42 images; the fold shows the thing.
   *Engine:* 0.
6. **Structure is carried by hairlines, not boxes.** Hairline share 0.947–1.0; rules per screen
   0.42–4.33.
   *Engine:* the one place it is genuinely strong.
7. **Motion is choreography, not sprinkle.** Transition coverage 0.021–0.154, median 150–300ms —
   *and* the qualitative note in `docs/15 §0`: "premium sites win on choreography: hero entrance,
   staggered section enters, scroll-linked chapters, intentional micro-feedback, authored product
   motion." The engine has 16 near-identical entrance fades.
8. **Every surface is art-directed, including the chrome.** Nothing ships a default footer.
   *Engine:* 15 fixed footer labels and a hardcoded `© 2026` on all 17 pages.
9. **The page works at every width.** *Engine:* nav links vanish under 820px.
10. **Nothing is generic because the content is specific.** Corpus category signatures differ
    structurally per category (display %vw 1.04 → 31.8; section pad 16 → 248; radius 1 → 400;
    shadow share 0 → 0.081). The engine's category signatures differ only in hue and hero id.

### 4.3 The pattern in one sentence

Award-tier pages are **composed** — a decision is made about the fold, the rooms, the imagery, the
type voice, and the scroll, and everything else is subordinate to it. The engine **assembles** — it
picks a plan branch, fills slots from copy tables, and emits a shared stylesheet. Assembly can be
made perfectly compliant; it cannot be made composed. That is the whole diagnosis.

---

## 5. Target architecture

The goal is not to patch `composition.ts`. It is to add the layer that is missing — an
**art-direction compiler** — and to put the instrument inside the loop.

### 5.1 Stage model

```
brief ─┬─► content model      (what must be argued, per buyer question)   [new]
       ├─► art direction       (director: a composition decision, zod)   [new]
       ├─► asset plan          (what imagery this page needs)            [new]
       └─► design tokens       (existing, but derived from the director)  [rework]
                                      │
                                      ▼
                          page program  (a sequence of rooms)
                                      │
                                      ▼
                  renderers: HTML · CSS · figures · media
                                      │
                                      ▼
                     measure (existing probes) ──► gate ──► refine
```

### 5.2 `ArtDirection` — the missing object

Today the top of the pipeline is a `DesignBrief`. It must become `DesignBrief → ArtDirection`, a
zod contract in `@designproof/schema` and a deterministic director in `packages/design-skills`. Sketch:

```ts
ArtDirection = {
  id: string
  thesis: string                 // one sentence: what a visitor should notice first
  fold: {
    kind: "image-stack" | "single-image" | "plate" | "type-statement" | "interface" | "product-in-hand"
    scale: "edge-to-edge" | "framed" | "inset"
    claimPlacement: "over" | "beside" | "below" | "interleaved"
    dominantElement: string      // the element that owns the screen
  }
  rhythm:            // per-room, not per-page — kills the "one scalar for the whole document" ceiling
    Room[] = { id, role: "claim"|"evidence"|"room"|"quiet"|"close", coverage: 0..1, surface: SurfaceLevel,
               shape: ShapeId, widthTier: WidthTier, layers: Layer[] }
  grid:      { system: "12col" | "2track" | "editorial", spans: string[], breakouts: string[] }
  palette:   { structure: "achromatic+accent" | "duotone" | "chromatic-field" | "photographic-overlay",
               roles: ..., contrastFloors: ... }
  type:      { voice: VoiceId, pairing: [display, body, mono?], ladder: number[], tracking: number[],
               displayUnit: "px" | "vw" | "ch" }
  motion:    { system: MotionSystemId, beats: Beat[] }   // beats = named, removable, missable
  media:     { plan: AssetPlan }
  antiPatterns: string[]     // what this page must not become
}
```

Design rules for this contract:

- **`rhythm` is per-room.** That alone removes ceilings 1, 2 and part of 8.
- **`fold` is a decision with a dominant element.** A page must name what owns the first screen.
- **Every field is derivable deterministically** from the brief + a seeded director. No LLM required;
  an LLM may *propose* an `ArtDirection` and the deterministic validator either accepts it or falls
  back — mirroring the existing `author.ts` pattern, which is the right shape already applied to the
  wrong three fields.
- **`antiPatterns` ships with the direction** so the same object can be handed to the critic.

### 5.3 `PageProgram` — composition as data, not a switch

Replace `planSections`'s 15 branches with a program compiled from `ArtDirection.rhythm`:

- Rooms are generated from a **job** (`establish`, `prove`, `differentiate`, `price`, `answer`,
  `close`) and a **shape** (`split`, `plate`, `index`, `ledger`, `stage`, `stack`, `sequence`,
  `table`, `media-wall`, `quiet`). `siteKind` becomes a *bias* on shape selection, not the key.
- Every room declares `coverage` (share of viewport it paints) and `surface`. A validator enforces
  `coverage variation ≥ 0.447`, `shape run ≤ 0.5`, `≥3 shapes`, `≤1 repeated shape adjacency` — the
  published bands, enforced at compile time instead of measured after the fact.
- The catalog of rooms is data, versioned next to the templates, not a `switch`.

### 5.4 Media system

The bar says stacked images. Build it:

1. `AssetPlan` per room: `{ role: "hero" | "product" | "texture" | "person" | "place" | "detail",
   count, aspect, treatment: "full-bleed"|"inset"|"collage"|"overlay"|"duotone", crop }`.
2. A committed, licence-clean base library (the pattern already exists as `free-assets.ts`) but
   **categorised and large enough to serve every `siteKind`**, referenced by role rather than by
   index, and fetched as real files (WebP, `srcset`, `sizes`, lazy) instead of base64 inside SVG.
3. An **art-direction transform** over assets: crop, duotone/overlay in the page's palette, plate
   treatment, shadow/hang — so the same photograph reads differently under two directions.
4. A hard gate: **any direction whose `fold.kind` is image-bearing must emit ≥1 real image, and a
   page must emit ≥N images for its `siteKind` floor.** This is the measurement that stops the
   engine scoring "drawn matter" with stamps.
5. Text-in-SVG is not text: `figures.ts` currently sets figure copy as SVG `<text>`. Move readable
   copy to HTML; keep SVG for drawing only. (Also fixes the vertical centring and the `ds-turn-label`
   clipping the audit found.)

### 5.5 Inside-the-loop measurement, and the phantom-property class of bug

Four changes to the instrument:

1. **Split the score.** Keep `craftScore` (compliance) and add `artDirectionScore` (composition:
   dominant-element presence, room-shape variety, coverage variation, media count, type-voice
   distinctness across the catalog, per-room rhythm delta). A page fails if either fails.
2. **Run `layout-audit` in `pnpm test`** on all 17 briefs and fail on any `vacancy`, `clipped`,
   `overflow`, `collision`, or `repetition` finding. It already catches the 1160×320 corporate hero
   void and the harness clip; it is simply not wired to anything.
3. **Add a cross-template distinctness gate.** Assert that no two offerings share more than X% of
   their emitted CSS lines, that their `ArtDirection.rhythm` room sequences differ, and that their
   type voices differ. Today 97.4% shared CSS passes every test.

And fix the four phantom custom properties, each of which is silently breaking something a reader
sees. These are the cheapest real wins in the repo:

| Declared as | Referenced as | Effect | Evidence |
|---|---|---|---|
| `--m-easeOut` (mapVars does no camel→kebab) | `--m-ease-out` ×34, 12 with no fallback | reveal `transition`/`animation` shorthand invalid → unset; the declared `0.16,1,0.3,1` curve never runs | `tokens.ts:190`, `css.ts:31-35`, `css.ts:154,156,170,178` |
| — | `--nav-h` ×17 | every sticky rail pins at the `4.5rem` fallback under a 64px nav | `css.ts:2287, 2311, 2354, 3598` |
| — | `--content-wide` | paper frame frozen at 72rem → the dark side bands | `css.ts:3992` |
| — | `--t-small-size` ×11, 3 different fallbacks | three different caption sizes for one step | `css.ts:693,708,728,…` |

Also dead and worth deleting so they stop confusing the model of the system:
`[data-sitekind="observatory-signal"]` (`css.ts:640-642` — the emitted value is `signal-observatory`),
`--nav-blur` (`css.ts:45`), the `.ds-bento` family (unreachable from all 17 plans,
`css.ts:3726-3731`), and the byte-identical `ROLE_PROOF` / `ROLE_PROOF_DISTINCT` maps
(`composition.ts:138-155`).

### 5.6 What to delete, deliberately

- `planSections`' 15-branch switch → replaced by the program compiler.
- 30 of the 37 routed skill nodes, or give them pixel effect. A registry where 84% of entries do
  nothing is a liability: it makes audits pass on work that was never done.
- The generic tail section list (`feature-index → figure → template → story → faq → cta → footer`) as
  a *default*. It may remain as one *option* among several.
- The shared footer columns, the hardcoded `© 2026`, and the no-mobile-nav nav.
- `heroLayout`'s eleven dead branches; `recommendedSections` unless it is given to the compiler.

### 5.7 Keep

- The deterministic core, zod at every boundary, never-auto-apply, offline fixture fallback.
- The detectors, the corpus, the layout audit, the research loop — these are the assets.
- `basics-checklist.ts` as an implementation floor.
- `author.ts`'s shape (LLM proposes → fact-token validation → deterministic fallback), applied to
  `ArtDirection` and to the asset plan rather than to three copy fields. Widen eligibility from
  `saas-marketing && demos` (1 of 17 templates) to every kind.
- The tokens/CSS/figures *renderers*. They are well built; they are being fed one direction.

---

## 6. Milestones

Each milestone must leave `pnpm test` green and must not regress the layout audit. Order matters:
M1 makes the problem visible, M2–M4 build the missing layer, M5–M6 give it material, M7 closes the
loop.

### M1 — Instrument honesty (small, do first)

**Status: landed 2026-10-06.** Baseline and side effects in
[`research/LOOP_LEDGER.md`](../research/LOOP_LEDGER.md) under *Loop — M1 instrument honesty*.
`pnpm test` 328 passing across 49 files, typecheck clean.

- [x] Move `layout-audit` into `pnpm test` over all 17 briefs; fail on vacancy/clipped/overflow/collision/repetition.
      Also scrolls before probing, so the gate and `pnpm research:audit` measure the same render — they did
      not before: the gate dropped any vacancy with fill ≥ 0.6, a number nobody had chosen, while the
      operator command reported 6 defects the gate could not see.
- [x] Split the score: `craftScore` + `artDirectionScore`; report both in `research/critique.json`.
      Eight composition dimensions (`ART_DIRECTION_DIMENSIONS`), none satisfiable by tuning a token.
      **craft 97.8 · direction 85.5** over 17 pages; holdout 91.1 / 55.0, craft gap 6.7 pts so the
      harness still prints OVERFIT. The direction bands are hand-set — no corpus run has measured them.
- [x] Re-score the "drawn matter" dimension so repeated `capabilityMark`s cannot earn it: count only
      *distinct* figures ≥ a size floor, and count raster images separately.
      **This one did not land, and the doc overstated its premise.** Each drawing is fingerprinted with
      its text stripped, so a mark differing only in the words inside it counts once — and
      `repeatedFigureAreaRatio` comes out **0 on all seventeen pages**, with distinct-matter at 100/100.
      The reason is `capabilityMark(b, i, seed)`: seeded per block *and* per index, the stamps share
      dimensions but are structurally different drawings. §1.3 treats them as one stamp repeated; under a
      definition that ignores captions they are not interchangeable. The probe is kept because it catches
      a genuine paste, but it did not recover the gaming it was built for. **§1.3 / RC5's wording should be
      corrected before M4 cites it.**
- [x] Add a cross-template distinctness test (shared CSS lines %, room-sequence equality, type-voice equality).
      `packages/design-skills/src/__tests__/cross-offering-distinctness.test.ts` — three ratchets pinned to
      measurement (2 772 of 3 092 CSS lines shared = 89.7%; 10 of 17 on one skeleton; 8 of 17 type voices,
      largest group 5). Measuring the skeleton with the hero and story positions collapsed **confirms
      §1.2**; keying on `id:layout` alone reports 17/17 distinct, because the two positions that vary are
      in the key. That is how the claim came to look wrong.
- [x] Fix the four phantom custom properties and delete the dead selectors/maps listed in §5.5.
      All four properties are now declared in `:root`; `[data-sitekind="observatory-signal"]` corrected to
      `signal-observatory`; `--nav-blur` gone. `ROLE_PROOF_DISTINCT` deleted — byte-identical to
      `ROLE_PROOF`, so the branch consulting it was a no-op that read as if a distinction were being made.
      **`.ds-bento` kept:** §5.5 calls it unreachable, and it is unreachable from all 17 *plans*, but
      `renderFeatures` still implements the `feature-bento` layout, so deleting it removes a capability
      rather than dead code. That is M3's call.
- [x] Fix the fixed defects a reader sees: the `loom` flex-`h1` whitespace loss, the herbarium label
      collision, the hardcoded `© 2026`, the missing mobile nav. The new gate also found the `harness`
      turn label clamped mid-sentence (a 2-line clamp inside a hard 88px rail, when the longest beat needs
      three lines) and `corporate-story`'s diligence lede painted three times.
- [x] Add a "a capability may be named at most twice per screen" gate.
      Was 3–6× across 50 (offering, section) pairs. Every instance was **one list rendered twice** — the
      interface plate used one `rows` list as both its view rail and its table rows; the app shell set its
      view list and its row list from the same names; cut slips and cross stamps listed *sibling* titles;
      the index ledger and loom weave **cycled** the feature list with `idx % base.length`. All 17 offerings
      now sit at 2 or fewer.

**Exit:** the repo reports the truth about its own output. Baseline numbers recorded in
`research/LOOP_LEDGER.md` with the side-effect, as the ledger requires.

**What M1 did not fix, because it cannot.** Six vacancies remain, now enumerated in the gate by offering
and section so the count cannot grow silently — `dashboard` hero 500×480, `corporate` hero 1160×320,
`fintech` hero 1160×260, `studio` features 960×260, `consumer` figure 540×300, `foundry` hero 440×360.
They are the same fact the art-direction score reports as `ad-fold-matter` at 91/100: the fold reserves a
screen and fills a corner of it. That is `ArtDirection.fold` naming a dominant element — M2. And
`raster-images` scores **0 on 16 of 17**, which is M4.


### M2 — `ArtDirection` schema + deterministic director

- [ ] `ArtDirection` in `@designproof/schema` with `thesis`, `fold`, per-room `rhythm`, `grid`, `palette`, `type`, `motion`, `media`, `antiPatterns`.
- [ ] Deterministic director in `packages/design-skills/src/director.ts` producing a direction from any brief; seeded, reproducible, zero LLM.
- [ ] Optional LLM proposer reusing `author.ts`'s validation shape; deterministic fallback is the default path and the only path in CI.
- [ ] Golden tests: two briefs of the same `siteKind` produce *different* theses, folds, and room sequences.
- [ ] `docs/08 §5` style-addition playbook wired to the director so a new style is a `ArtDirection` recipe, not a hex change.

**Exit:** every one of the 17 offerings has a written thesis and a fold decision that names its dominant element.

### M3 — `PageProgram` compiler

- [ ] Replace `planSections` with a compiler: rooms chosen from `rhythm` by job + shape; `siteKind` becomes a bias.
- [ ] Room catalog as data (`rooms.ts`), including at least three shapes that do not exist today: a media wall, a horizontal scroll rail, and a pin-and-swap sequence.
- [ ] Compile-time validators against the published bands: shape variety ≥3, shape run ≤0.5, coverage variation ≥0.447, width tiers ≥5, bleed share ≥0.1, alignment axes 3–6.
- [ ] Per-room rhythm: `--section-y` and `--w-content` become room-scoped, not root-scoped.
- [ ] Delete the 15-branch switch and the dead branches.

**Exit:** the 17 offerings no longer share a section tail; ten of them are demonstrably different page shapes.

### M4 — Media system

- [ ] `AssetPlan` + role-based asset library (licence-clean, committed, WebP, `srcset`/`sizes`/lazy), sized to serve every `siteKind`.
- [ ] Art-direction transforms: crop, duotone/overlay in the page palette, plate treatment, hang/overlap composition.
- [ ] `image-stack` fold kind; media wall and photographic-overlay rooms.
- [ ] Text out of SVG: readable copy renders as HTML; SVG keeps drawing only.
- [ ] Gate: image-bearing folds must emit real images; per-`siteKind` image floors enforced.

**Exit:** every one of the 17 offerings emits at least one real image, and image-bearing pages reach the corpus image band (median 42).

### M5 — Type and colour art direction

- [ ] Type voices: at least 8 distinct display voices with role-separated pairings, chosen by the director per brief — not by hash over three pools.
- [ ] Per-brief font loading with a real budget (the corpus median is 5 font files; the engine ships 1).
- [ ] Colour structures beyond "achromatic ramp + accent": duotone, chromatic field, photographic overlay, and per-room hue shift, each with contrast floors preserved.
- [ ] Delete the 23 `font-size:clamp()` overrides that bypass the ladder; every size comes from the direction.

**Exit:** no two offerings share a type voice; palette structure differs across at least three kinds.

### M6 — Motion as choreography

- [ ] Implement `docs/15`'s ladder for real: `hero-entrance-once`, `section-stagger-enter`, `scroll-chapter-pin`, `micro-feedback-interactive`, plus scroll-scrubbed progress.
- [ ] Every motion beat is named and removable; the visual test is "would a reader miss this if deleted?"
- [ ] `prefers-reduced-motion` and no-JS still show final states; keep the existing restraint bands.
- [ ] Fix `--m-ease-out` so the declared easing actually runs.

**Exit:** at least two beats per marketing page a reader would notice missing, and restraint metrics still in band.

### M7 — Close the loop

- [ ] Generation reads `research/aggregate.json` corridors at *build/dev* time (not runtime) and fails the build when an offering drifts outside them.
- [ ] `designproof_design_from_features` returns the `ArtDirection` alongside the HTML so an agent (and the critic) can reason about the decision, not just the pixels.
- [ ] Recursive-improve becomes champion/challenger over `ArtDirection`s, not over CSS diffs.
- [ ] Real photography for the templates in `docs/media/showcase/`.

**Exit:** `pnpm research:critique` scores both instruments, the layout audit is clean, and the eye
test passes on stacked images + motion + unique fold grammar — the actual bar.

---

## 7. What would falsify this diagnosis

If it were wrong, we would expect at least one of:

- a `DESIGN_TEMPLATE` pair whose emitted CSS differs by more than the 321-line union delta — it does not (97.4% identical lines);
- a template that emits more than one real image — none does;
- a craft dimension that the generator cannot influence — all of them are generator-controlled scalars;
- a layout-audit-clean corpus and a visibly clean page — the audit finds a 1160×320 hero void while the score reads 0.989.

None holds. The diagnosis stands.

---

## 8. Open questions for Ashish

1. **Bar confirmation.** Is "stacked images, motion, artistic, unique" the pass condition (it is the
   one written in `AGENTS.md` and `PROJECT-STATUS.md`), and is it acceptable for the 17 offerings to
   diverge so far that several are unrecognisable as siblings?
2. **Imagery licence.** Is a committed, licence-clean photographic base library acceptable in-repo,
   or must every asset come from the user's project?
3. **Scope of the rewrite.** M2–M4 replace the top of the generation pipeline. Is that in scope now,
   or should M1 (instrument honesty + the four phantom-property fixes) land first and alone?
4. **Attribution rule.** This doc deliberately keeps the corpus anonymised. Should the *benchmark*
   section be allowed to cite named studios, or does the anonymisation rule apply to all research?
5. **Attention.** `PROJECT-STATUS.md` parks Design Proof work behind DeepHarness honesty. This plan is
   ~4–8 focused sessions. Confirm when it is allowed to start.

---

## 9. Reproduction

Everything in §1 came from the committed research pipeline plus a scratch directory that is
git-ignored (`.audit/`, added 2026-10-05). Use the committed scripts to re-derive the numbers:

```bash
# the committed compliance score (writes research/critique.json)
pnpm research:critique

# the repo's own layout audit — the instrument §1.5 contrasts against the score.
# Accepts one brief id; run it per CRITIQUE_BRIEFS entry in scripts/design-research/briefs.ts.
pnpm research:audit saas-conversion

# re-derive the raw per-reference measurements
pnpm research:aggregate          # research/measurements/*.json -> research/aggregate.json
```

The scratch scripts behind §1.1–§1.4 and §1.5's 17-page sweep are not committed (they render all
seventeen `DESIGN_TEMPLATES`, screenshot them through Playwright's system-Chrome channel, and diff
the emitted CSS/markup/figure inventory). Their shape is described in the call sites below; if these
numbers are going to be cited or gated, the right move is to promote them into
`scripts/design-research/` under M1, not to keep a git-ignored instrument.

```bash
# shape of each scratch probe (recreate under .audit/ to re-measure):
#   render.ts            DESIGN_TEMPLATES.map(t => designFromFeatures(t.brief).previewHtml) -> files
#   shots.mts            Playwright page.setContent + fullPage screenshot + DOM stats per template
#   sim3.mts             pairwise structural / copy Jaccard + shared-CSS-line counts
#   marks.mts            inventory every <svg>: class, data-figure, box, <image> children
#   layout-audit-all.mts reuse AUDIT_PROBE from scripts/design-research/layout-audit.ts over all 17
```

---

*Sources: this repo's own measurements (`research/measurements/`, `research/aggregate.json`,
`research/critique.json`, `docs/10_DESIGN_EVIDENCE.md`), `scripts/design-research/forensics.ts` +
`layout-audit.ts` + `metrics.ts`, and the craft literature already cited in
[`05_GENERICNESS_METHODOLOGY.md §Sources`](./05_GENERICNESS_METHODOLOGY.md).*
