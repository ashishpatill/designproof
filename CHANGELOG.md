# Changelog

Notable Tell Proof work, newest first. Dates follow `git log`. This is not a semver release log.

Tell Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions — an independent critic and craft layer beside the coding agent. It is not a Studio web app as the product.

**Quality bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

---

## 2026-10-08 — Foundry template says each thing once

- The editorial foundry page drops the figure band (which drew the type ladder a second time beside a "cost · cumulative" chart with made-up values under "how X changes with size") and the specimen band, which printed the names again under "X at reading size". It goes from nine sections to seven: first screen, one index, the marginalia (priorities), questions, closing, footer.
- Each cut description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) beside a "how it is put together" list that named them again, and the marginalia essay printed every description a second time. The index now holds every cut, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, cut by cut") instead of "Cuts drawn for real reading sizes", and the "not a style picker dressed as a product" lede is gone.
- The first screen names each cut once, on the type ladder. The ladder's rungs used to be "Display", "Title", "Deck", "Text", and "Caption" on every page, a pottery studio's included, with the first three names set beside the first three rungs and "Kilnroom · optical sizes" under them. It now has one rung per cut (up to eight), each labelled with its index number and its name; a short brief keeps five rungs and leaves the spare ones unnamed. The fold has one button, "Open the specimen", and no note; "See the cuts" and "Trial files ship with the optical sizes you will actually set" are gone.
- The marginalia group the cuts by the priority the brief gives (core, supporting, additional). Each beat names its cuts once, and its margin note, set beside it, says how many cuts the tier holds and where they sit in the index ("2 cuts · Index 01, 02"), each number jumping to its row. The essay used to reprint every description with the other names hung beside it as "cut slips" sized "Display", "Title", "Deck", with "Note 01" labels and a drawing on every beat, under "measure, hierarchy, and the notes that keep a layout from drifting". With a single priority the marginalia are left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, or that every capability ships "from day one". The close says "Start the Kilnroom specimen with kiln calendar." and "Four more cuts are set in the index above." instead of "Request a specimen of Kilnroom." and "Edition notes, trial files, and the cuts … actually set." The buttons read "Open the specimen" and "Read all five cuts" instead of "Request a specimen" and "See the cuts". The approval question appears only when the brief declares an approval step. The menu reads Cuts, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("editorial-foundry surface … 9 sections built from 5 declared capabilities").
- On four sample briefs, repeated lines fell from 14–37 to 2–5 (what is left is the "Open the specimen" button, on the first screen and in the close, and each name once on the ladder and once in the index), the lead cut name in the page text from 14 mentions to 4 on the marina and pottery briefs, lines that read the same on every product's page from 24 to 3, lines copied word for word from other templates from 14–35 to 2–20, and the most times one description is printed from 2 to 1. Page height on the sample fell from 8995px to 4919px. The craft critique for the foundry moved from 99.9 to 97.0, mostly because the page is now shorter than the measured corridor, its sections are closer in weight, and it carries less drawn matter now that the figure band and specimen band are gone.
- New test: `packages/design-skills/src/__tests__/foundry-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Observatory template says each thing once

- The signal observatory page drops the figure band (a "cost · cumulative" chart with made-up values under "how X reads a window", which named the channels twice more) and the specimen band, which printed the first four descriptions under "what it covers". It goes from nine sections to seven: first screen, one index, the waterfall (priorities), questions, closing, footer.
- Each channel description is printed once, in the index. Before, the first screen printed the lead description under the headline, the index printed bare names (three or four of them, whatever the brief gave) beside a "how it is put together" list that named them again, the specimen band printed four descriptions, and the event waterfall printed every description again. The index now holds every channel, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, channel by channel") instead of "Channels an on-call desk actually watches", and the "not a chart dressed as a product" lede is gone.
- The first screen names each channel once, in the scrub rail along its foot. The rail used to print "T−24h", "Live", "+6h", and "Calibrate" on every page, a pottery studio's included, with "Live" lit and pointing at the figure band. It now has one chip per channel, numbered like the index, and each jumps to its own index row; on a phone it scrolls sideways in one row. The signal lattice numbers its rows like the index and names no channels; it no longer pads a short brief to four rows by repeating the first, and no longer prints tolerances ("±0.5", "±1.0"), "LIVE", "WINDOW", "00:10", hours, "UTC", or the product name a second time. The chronometer down the left edge keeps its ticks but prints no hours and no "UTC".
- The event waterfall sorts the channels by the priority the brief gives (core, supporting, additional). Its ruler is numbered like the index, one column per channel; each span lights its own channels' columns and names them once. It used to print every description against a T+00h → T+24h ruler with "T+06h" stamps, "Note 01" labels, and a drawing on every span, below "tick beads, channel notes, and the handoffs that keep calm honest". With a single priority the waterfall is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, or that every capability ships "from day one". The close says "Start the Kilnroom desk on kiln calendar." and "Four more channels sit in the index above." instead of "Calibrate a Kilnroom window." and "Tolerance marks, channel maps, and the windows … actually watch.", and the made-up tolerance strip beside the first four names is gone. The buttons read "Open the desk" and "Read all five channels" instead of "Open a desk window" and "Read the channels". The approval question appears only when the brief declares an approval step. The authored path no longer carries the "windows ship with the channels you actually watch — not a demo theatre" note. The menu reads Channels, Priorities, Questions. The page description is the product's own tagline and audience instead of engine words ("signal-observatory surface … 9 sections built from 6 declared capabilities").
- On four sample briefs, repeated lines fell from 10–24 to 1, the lead channel name in the page text from up to 11 mentions to 3 on the three unrelated briefs, lines that read the same on every product's page from 26 to 4, lines copied word for word from other templates from 16–41 to 3–20, and the most times one description is printed from 3 to 1. Page height on the sample fell from 8778px to 5193px. The craft critique for the observatory moved from 99.9 to 98.8, mostly because the page is now shorter than the measured corridor and carries less drawn matter now that the figure band and specimen band are gone.
- New test: `packages/design-skills/src/__tests__/observatory-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Field guide template says each thing once

- The field guide (herbarium) page drops the figure band (a "cost · cumulative" chart with made-up values under "how X presses a voucher", which named the first four traits twice more) and the specimen strip of bare names. It goes from nine sections to seven: first screen, one index, the key (priorities), questions, closing, footer.
- Each trait description is printed once, in the index. Before, the specimen tag on the first screen printed the lead description, the index printed bare names (four of them, whatever the brief gave) beside a "how it is put together" list that named them again, and the dichotomous key printed every description a second time. The index now holds every trait, numbered 01 onward, each with its sentence. Its title is the product's own ("Kilnroom, trait by trait") instead of "Traits a field voucher actually keeps", and the "not a nature photo dressed as science" lede is gone.
- The first screen names each trait once, in the binomial strip along its foot. The strip used to print Kingdom → Species on every page, a pottery studio's included, with the first six ranks pointing at sections the page may not have and "Genus" always lit. It now has one chip per trait, numbered like the index, and each jumps to its own index row. The specimen plate no longer names the first three traits, and no longer prints "Voucher · herbarium", "Range · W → E", "Blot", rank letters, or the product name a second time; its photo window now runs the height of the pressed leaf. The masthead counts the brief's own traits ("Five traits") instead of "Hinged glassine · Dissecting plate", and the "Pin 02 · voucher" label is gone.
- The dichotomous key sorts the traits by the priority the brief gives (core, supporting, additional). Each couplet names its traits once and sends the reader to the next couplet ("Otherwise, go to 2"), instead of inventing leads such as "trait holds → photo inset" and "trait fails → re-key from kingdom" below "range beads, taxon ranks, and the notes that keep a voucher honest". The "Note 01" labels and the drawing on every sheet are gone. With a single priority the key is left out.
- The questions, the closing line, and the buttons are built from the brief. The answers no longer promise cancelling anytime, a comparison table, "one session" on the reader's data, a person for procurement, or that every capability ships "from day one". The close says "Start the Kilnroom guide at kiln calendar." and "Four more traits follow in the index above." instead of "Request a voucher of Kilnroom." and "Pressed plates, range notes, and the vouchers … actually keep." The buttons read "Open the guide" and "Read all five traits" instead of "Request a voucher" and "Open the plate". The approval question appears only when the brief declares an approval step. The authored path no longer carries the "vouchers ship with pressed plates and range notes — not a demo theatre" note. The menu reads Traits, Priorities, Questions. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–23 to 1, the lead trait name in the page text from up to 13 mentions to 3 (4 counting the binomial strip), lines that read the same on every product's page from 29 to 6, and lines copied word for word from other templates from 15–35 to 3–20. Page height on the sample fell from 8475px to 4522px. The craft critique for the field guide moved from 97.5 to 96.3, mostly because the page is now shorter than the measured corridor and carries less drawn matter now that the figure band is gone.
- New test: `packages/design-skills/src/__tests__/field-guide-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-08 — Educational template says each thing once

- The educational (mechanism explainer) page drops the specimen strip of bare part names and the "what is included" table, which set made-up Core / Standard / Full columns under a lede calling it "the same list as above, arranged the way a procurement review asks for it". It goes from eight sections to seven: first screen, one index, priorities, questions, closing, footer. The questions section is new; the page had none.
- Each part description is printed once, in the index. Before, the first screen printed the lead description under the headline, the drawing beside it cut the second one mid-word, and the chapters printed every description a second time. The index now holds every part, numbered 01 onward, each with its sentence and its own drawing, and no interface drawing or "how it is put together" list beside it names them again. Before, a five-part brief left its last two parts out of the index.
- The first screen names each part once, in the scrub list, headed by the count the brief gives ("Four parts") instead of "The scrub". The drawing beside it no longer sets a "cost · cumulative" chart with values of 100, 70, 40 and 10 that no brief gave, and no longer names the parts again or prints the active one under the slider. It draws one numbered column per part, as tall as the priority the brief gives that part, and the slider lights each column in turn. It used to stop at four parts; it now steps through up to six. The slider reads "Step through the parts" instead of "Step through the mechanism".
- The chapters now group the parts by the priority the brief gives (core, supporting, additional) and name the parts in each once, instead of reprinting every description below "placement, preemption, backpressure, failure — the cost function in order", a line written for one routing runtime and printed on a marina's page too. With a single priority the section is left out. The index title is "What each Signal Path part does" instead of "What Signal Path does with cost", which read "does with plot" on a garden's page, and the stock "two carry the argument, the other two remove reasons to say no" line is gone.
- The questions and the closing line are built from the brief's own names. The close says "Start with placement model." and "Three more parts follow in the index above." instead of "See it against your own material." and "Four capabilities, one conversation.", and the second button reads "Read all four parts". The approval question appears only when the brief declares an approval step. The authored path no longer adds "everything here is verifiable before you commit" to the first screen. The menu reads Parts, Priorities, Questions instead of pointing at a "Cost path" and a table the page no longer has. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–32 to 2–5, the lead part name from 9 mentions to 4 and every other part name to 3 (before, up to 9), lines that read the same on every product's page from 12 to 5, and lines copied word for word from other templates from 5–20 to 3–17. Page height on the sample fell from 5855px to 3739px. The craft critique for the explainer moved from 99.6 to 97.7, almost all of it because the page is now shorter than the measured corridor.
- New test: `packages/design-skills/src/__tests__/educational-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-07 — Archive index template says each thing once

- The archive index page drops the figure band (which named the first four entries twice more beside a "cost · cumulative" chart with made-up values) and the specimen strip of bare names, so it goes from nine sections to seven. The page is now first screen, one index, priorities, questions, closing, footer.
- Each entry description is printed once, in the index. Before, the index printed only names and the entry essay printed every description a second time. The index now holds every entry, numbered 001 onward, and no drawing beside its first row names them again. Before, every brief left two entries out of the index.
- The first-screen ledger draws each entry once, as a catalogue card with its number, its name, and its own initial. It used to fill twelve cells by cycling the entries, so a five-entry brief named its lead entry three times on the first screen, labelled the cells "Core" or "Included", and footed the plate "12 entries". The masthead and the ledger show the letters the brief's entries actually run across instead of a fixed "A–Z", and each letter of the side rail jumps to the first entry that starts with it instead of to sections the page may not have.
- The entry essay now groups the entries by the priority the brief gives (core, supporting, additional), stamped with their index numbers, instead of reprinting every description under the names of three other entries and beside a shelf index of every name. With a single priority the section is left out.
- The questions and the closing line are built from the brief's own names. They no longer promise cancelling anytime, a result in "one session" on your data, a comparison table, a person for procurement, or that everything ships "from day one". The page no longer says "each entry is a numbered stamp — not a search box dressed as an archive", "hanging folio, ruled measure, and the cross-refs that keep the roll honest", or "numbered stamps, cross-refs, and the entries … actually keep". The buttons read "Open the index" and "See every entry" instead of "Request an entry", which only fit one award index. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 16–45 to 3–9, the lead entry name from 2–17 mentions to 1–4, lines that read the same on every product's page from 23 to 6, and lines copied word for word from other templates from 15–35 to 3–16. Page height on the sample fell from 9040px to 4913px.
- New test: `packages/design-skills/src/__tests__/archive-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-06 — Design engine M1: the repo now measures itself honestly

[`docs/16_DESIGN_ENGINE_QUALITY.md`](./docs/16_DESIGN_ENGINE_QUALITY.md) diagnosed the generator on
2026-10-05 and left M1 open: make the repo report the truth about its own output before building
anything. M1 has landed. It did not make the pages better — it made the remaining work measurable.

**Two instruments instead of one.** The craft score reads populations of scalars the generator sets
itself, so it read 0.989 on a page with a 1160×320 hole in its hero. It is still reported (as
`overall`, unchanged for existing readers) and it is still a *compliance* number. Alongside it,
`ART_DIRECTION_DIMENSIONS` scores eight things no token tweak can satisfy: an element that owns the
fold, distinct matter above it, room-shape variety, the longest repeated room run, coverage change
down the scroll, distinct matter on the page, photographs, and repeated-drawing share.

> craft **97.8** · art-direction **85.5** · holdout 91.1 / **55.0** (craft gap 6.7 pts, so the harness
> still prints OVERFIT; the direction gap is much wider, which is the honest signal that sixteen tuned
> briefs are composed and the untuned one is not)

`pnpm research:critique` prints both and `research/critique.json` carries `.instruments`,
`.artDirection`, and per-page `artRows`. The art-direction bands are hand-set — no corpus run has
measured them yet.

**The layout audit is in `pnpm test`, and it agrees with the operator command.** It did not before:
the gate silently dropped any vacancy whose fill was ≥ 0.6, a threshold nobody had chosen, while
`pnpm research:audit` was reporting 6 defects. Both now use the probe's own thresholds, both scroll
before probing, and the six open vacancies are enumerated in the gate by offering and section so the
count cannot grow silently. They are `dashboard` hero 500×480, `corporate` 1160×320, `fintech`
1160×260, `studio` features 960×260, `consumer` figure 540×300, `foundry` hero 440×360 — all
fold-composition problems, which is what M2's `ArtDirection.fold` is for.

**A capability is named at most twice on one screen.** It was 3–6× across 50 (offering, section)
pairs. Every instance turned out to be **one list rendered twice**:

- `interfacePlate` fed one `rows` list into both its view rail and its table rows — a working surface's
  rail and its rows are different things, and using one list for both printed every name three times
  inside a single plate.
- The app shell set its view list (`aside`) and its row list (`blocks`) from the same capability names.
- Cut slips and cross stamps listed *sibling* titles, so a five-beat essay set each title five times.
- The index ledger and loom weave **cycled** the feature list with `idx % base.length` to fill cells.
- `queueConsole`'s panel heading fell back to the literal phrase "Operator console" — a stock tell the
  repo's own copy tests ban.

**Six more defects a reader would have seen.** The `harness` turn tape clamped its longest label
mid-sentence (a 2-line clamp inside a hard 88px rail, when the beat needs three lines).
`corporate-story` painted its diligence lede three times — the fold writes it from its first pillar's
sentence, and the catalogue/proof dedupe that prevents that was restricted to two site kinds, so it is
now general. `featuresTitle` interpolated the first capability into the heading directly above the index
printing that name. The features body kept reprinting its own title when no description was set. The
`[data-sitekind="observatory-signal"]` selector never matched anything — the emitted value is
`signal-observatory`.

**Dead code deleted, one claim withdrawn.** `ROLE_PROOF_DISTINCT` was byte-identical to `ROLE_PROOF`,
so the branch that consulted it was a no-op that read as if a distinction were being made.
`.ds-bento` was **kept** despite §5.5 calling it dead: it is unreachable from all 17 *plans*, but
`renderFeatures` still implements the `feature-bento` layout, so deleting it removes a capability
rather than dead code.

**One measurement did not land, and the doc overstated its premise.** The drawn-matter re-score
fingerprints every drawing with its text stripped, so a mark differing only in its caption counts once.
`repeatedFigureAreaRatio` comes out **0 on all seventeen pages** and distinct-matter at 100/100 —
because `capabilityMark(b, i, seed)` is seeded per block *and* per index, the repeated stamps share
dimensions but are structurally different drawings. §1.3 / RC5's "repeated marks earn drawn matter"
does not survive a stricter test. The probe stays (it catches a genuine paste), and §1.3 is now marked
as a visual observation rather than evidence that the metric is gamed.

**Cross-offering distinctness, as a ratchet.** Three floors pinned to measurement: 2 772 of 3 092 CSS
lines shared (89.7%), 10 of 17 offerings on one room skeleton, 8 of 17 type voices with the largest
group at 5. Measuring the skeleton properly — collapsing the hero and story positions, which is where
the two legitimate per-offering differences live — **confirms** §1.2; keying on `id:layout` reports
17/17 distinct and is how the claim came to look wrong. The floors sit at or above the measured values
deliberately: a ratchet pinned below reality is a test that cannot fail, and a test that cannot fail is
how the 0.989 happened.

Verification: **328 tests pass across 49 files**, `pnpm typecheck` clean, `pnpm research:audit` reports
its 6 enumerated vacancies, `pnpm research:critique` reports both scores. Baseline and side effects
recorded in [`research/LOOP_LEDGER.md`](./research/LOOP_LEDGER.md).

---

## 2026-10-06 — Renamed to Design Proof; review workspace rebuilt around the loop

**Naming.** The product is now **Design Proof**, and the gallery is **Design Templates** — everywhere a person reads or greps: UI copy, headings, page metadata, doc titles, code comments, skills, rules, filenames and paths. Under the hood the rename is complete too, so nothing is half-branded:

- Package scope `@tell/*` → `@designproof/*` (all eight workspace packages, lockfile, imports).
- CSS prefix `tell-` → `dp-`, custom properties `--tell-*` → `--dp-*`, DOM attribute `data-tell-id` → `data-dp-id` (capture, detectors, reconcile, fixtures and corpus all moved together).
- Env vars `TELL_*` → `DP_*`; localStorage keys `tell:*` → `dp:*`; MCP server key and tool namespace `tell_*` → `designproof_*`; CLI `tell` → `designproof`.
- Gallery artifacts: `Specimen*` → `Template*`, `specimenSrc` → `templateSrc`, `specimenBeats` → `templateBeats`, `docs/06_TELL_PROOF.md` → `docs/06_DESIGN_PROOF.md`.

**Kept on purpose.** The common noun *tell* (a genericness giveaway) and detector names ending in `Tell` still name the domain concept, not the product. External identifiers also stay: deployed hostnames (`tell-five.vercel.app`, `tell-capture.onrender.com`) and remote repo slugs cannot be renamed from inside this checkout without breaking live services. **Deploy note:** hosts with `TELL_*` environment variables must be updated to the `DP_*` names before the next deploy. See [`.env.example`](./.env.example).

**Layout + UX.** The review workspace is rebuilt around the four beats the product actually performs.

- **Home** is a two-column editorial surface: the composer on the left with its modes framed above the input and a labelled primary action, and a four-beat loop rail (Capture → Diagnose → Direct → Prove) on the right. The empty shelf carries its own next actions instead of dead space.
- **Project workspace** replaces the single long critic column with three focused panes — Findings, Direction, Proof. The findings list is scroll-bounded and filterable by verdict band, and the selected finding docks as an inspector so the verdict, evidence and primary action stay on screen. Drafting a fix moves you to Proof, where the patch, its measured changes and the agent wiring live. The split now fills the viewport, and notices dock bottom-centre instead of covering pane controls.
- **Studio** pins the preview to the viewport while the controls column scrolls, and groups controls into Product / What it does / Taste / Magic edit. Engine internals (routed skills, sections, generation, hints) fold into a collapsed *Engine detail* panel.
- **Templates** gallery gains job-based family filters — filtering by raw site kind returned one card per chip.
- **Report handoff** page gains a score summary, the captured surface, and per-finding verdicts with confidence.
- Narrow viewports stop trapping the review pane: it flows with the page so findings, inspector and actions are all reachable.

New shared layout primitives live in `apps/web/src/components/shell/layout.css`; the superseded home/composer/recent rules and the unrendered tabs bar left `shell.css`.

Verification: 323 tests pass, `pnpm typecheck` clean, `next build` clean.

---

## 2026-10-05 — Corporate template says each thing once

- The corporate page drops the specimen strip of bare capability names, the shared proof board, the "also included" second band, and the "what is included" table whose own lede called it "the same list as above", so it goes from ten sections (eleven on a five-capability brief) to seven. The page is now first screen, one catalogue, priorities, questions, closing, footer.
- Each capability description is printed once. Before, some were printed three times (fold drawing, catalogue, proof board), and on a five-capability brief one capability had no catalogue row at all. The catalogue now holds every capability; the lead row stays a bare name because the first screen already uses its sentence, and there is no second drawing beside the first row listing every name again.
- The first-screen posture grid names each capability once, up to six, with no descriptions, no "diligence posture" title, and no "Principle 01" labels. The spine beside it lists this page's own sections instead of the first four capability names.
- The chapters now group the work by the priority the brief gives (core, supporting, additional) and say how many capabilities sit in each, instead of listing every name again under "language, principles, outcomes, posture — the diligence path in order". With a single priority the section is left out.
- The questions and the closing line are built from the brief's own names. They no longer promise cancelling anytime, a result in "one session" on your data, a comparison table, a person for procurement and security, a human approval gate, or a rollback path. The approval question stays only when the brief itself declares an approval step, and its answer names that capability. The close no longer says "see it against your own material" or "one conversation", and the first screen no longer says "everything here is verifiable before you commit". The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–33 to 3–6, the lead capability name from 2–10 mentions to 2–4, lines that read the same on every product's page from 23 to 5, and lines copied word for word from other templates from 21–44 to 4–20. Page height on the sample fell from 8136px to 3899px.
- New test: `packages/design-skills/src/__tests__/corporate-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-05 — Studio template says each thing once

- The art-directed studio page drops the raised band of bare capability names, the specimen strip that drew them again as numbered stages, the step chart with its "cost · cumulative" axis, and the "also in practice" second band, so it goes from eleven sections to seven. The page is now first screen, one selected-work register, the order of work, questions, closing, footer.
- Each capability description is printed once. The register holds every capability; the lead row stays a bare name because the first screen already uses its sentence. The register no longer has a second drawing beside its first row that listed every name again.
- The first-screen work board names each capability once. Spare plates stay blank instead of naming the first capabilities a second time, and the board no longer reads "selected work · method board" or "plates · handoff-safe".
- The method chapters now group the work by the priority the brief gives (first, next, alongside) instead of listing every name again as "Step 01" to "Step 06". With a single priority the section is left out.
- Copy written for the sample design studio no longer lands on every studio page: "we take a few engagements at a time", "work that still holds after the launch week", "identity, product, and motion under one grid", "without the pitch theatre", and "see it against your own material". The questions and the closing line are built from the brief's own names, and no longer promise cancelling anytime, point at a comparison table the page never draws, or offer a person for procurement and security. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 11–36 to 3–8, the lead capability name from 4–13 mentions to 2–4, and lines that read the same on every product's page from 28 to 8. Page height on the sample fell from 7745px to 4975px.
- New test: `packages/design-skills/src/__tests__/studio-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-05 — Fintech template says each thing once

- The fintech page drops the "also included" second band, the shared proof board, the send-path chapters, and the table under the lanes, so it goes from twelve sections to eight. The page is now first screen, one catalogue, product picture, lanes, questions, closing, footer.
- Each capability description is printed once. Before, some were printed four times (fold drawing, catalogue, proof drawing, proof list) and one was never printed at all, because the catalogue's tail went to a second band as bare names. The catalogue now holds every capability with its description.
- The first-screen ledger names each capability once with its tier. It no longer shows wire cut-off times, made-up exchange rates, "clearing" or "posted" states, or a "±0.4% tolerance" line. The rail under the menu now lists this page's own sections instead of clock times.
- Lanes name only what each one adds and print no billing terms. The questions and the closing line are built from the brief's own names. They no longer promise cancelling anytime, a person for procurement or security, or a human approval gate with a rollback path, and copy written for the sample treasury product ("wire, wallet, approval, FX") no longer lands on a marina's or a pottery studio's page. The page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 18–40 to 6–16, the lead capability name from 3–14 mentions to 2–6, and lines that read the same on every product's page from 35 to 13. Page height on the sample fell from 11097px to 5710px.
- New test: `packages/design-skills/src/__tests__/fintech-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-05 — Workspace (operator console) template says each thing once

- The workspace page drops the shared proof board, the step chart, and the comparison table, so it goes from eleven sections to eight. The page is now first screen, product picture, the workspace itself, one catalogue, questions, closing, footer.
- Each capability description is printed once. The first-screen console draws each name once without invented rank changes or minutes, and the catalogue now holds all capabilities instead of quietly showing three of five.
- The workspace shows each capability once with its state, with no made-up ages or "live" labels. Its counts are counts of the rows it shows. The empty message stays hidden until a filter is empty and no longer claims anything is "handled automatically".
- Questions and the closing line are built from the brief's own names and promise nothing the brief never gave (no timelines, cancellation terms, security, or procurement answers). Engine words such as layout names and contrast ratios no longer show on the page, and the page description is the product's own tagline and audience.
- On four sample briefs, repeated lines fell from 26–56 to 5–19 and the lead capability name from 6–23 mentions to 2–10. Page height on the sample fell from 9432px to 5369px.
- New test: `packages/design-skills/src/__tests__/workspace-template-once.test.ts`. The other sixteen templates render byte-for-byte the same.

---

## 2026-10-05 — SaaS template says each thing once

- The SaaS page keeps one complete catalogue. The second "also included" band, the chapter list, and the matrix under the pricing lanes are gone, so the page goes from twelve sections to nine.
- Each capability description is printed once, in the catalogue. The fold console and the product picture draw names and rows instead of reprinting sentences cut mid-word.
- Pricing lanes name only what each lane adds and print no billing terms the brief never gave. The FAQ and closing line are built from the brief's own names, and copy written for the sample product ("moves an account", "booked walkthrough") no longer lands on other products.
- New test: `packages/design-skills/src/__tests__/saas-template-once.test.ts`. Other templates render byte-for-byte the same.

---

## 2026-09-15 — Agent-nav docs + status snapshot

- Slim [`AGENTS.md`](./AGENTS.md) to a thin entry (pointer tables + working loop). Do not load all of `docs/`.
- Add [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md), [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md), and [`docs/features/`](./docs/features/) (capture→prove, MCP plugin, design dogfood, training-data/MCP sink, showcase/Tiller).
- Add this changelog and [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md) (Done / Pending / Stuck / Needs from Ashish / Next).
- Registry lists only in-repo skills, the `tell` MCP server, and no Cursor plugin package. No app code.

---

## 2026-08-26 — Captioned product demo

- Record and recapture the 5-beat product loop for README (~47s, captioned): capture → named tells → seam → voice → draft fix, then Studio and specimens.
- Document the demo in README.

---

## 2026-08-25 — README as product surface + MCP training sink

- Rewrite README as a human-written product overview (masthead, one visual per concept, loop steps).
- Curate showcase stills and craft-reel policy so GitHub does not reprint the same fold twice.
- Recapture README media; ink-on-paper sidebar remains readable.
- MCP tools write training episodes through the shared `tell-design-data` sink when the sibling repo is present. Raw dumps → curated SFT/DPO is **not** closed (see PROJECT-STATUS).

---

## 2026-08-24 — Specimens: Tiller, Lattice, Ember Gate

- Agent-harness **Tiller** hero-helm; turn list reads as a session, not a feature reprint (`#74`, `#75`).
- Lattice: drop orange Z through cards and pipeline title rail (`#62`).
- Ember Gate PATH ATLAS: walk, not a broken diagram (`#63`).
- Ground deterministic CTA note and workflow roles (`#73`).
- Public showcase/GitHub still flags **Tiller as missing** — in-repo specimen exists; the public gap stays open.

---

## 2026-08-21 – 2026-08-23 — Honesty and product-proof

- Phase 0–1 Studio honesty: instrument the SaaS-demo blind spot; connective author for `saas` / `demos` briefs (`#72`).
- Ungate the SaaS product-proof quality bar from the approve workflow; gate workflow-proof on approval language and seed accent hue.
- Un-nest soft-brand-accent mood so the live wash paints.
- Close MCP catalog honesty: **eleven** `tell_*` tools (docs matched code; residual eight-tool claim removed).
- Settings and scenario matrix match real capture contracts.

---

## 2026-08-12 – 2026-08-18 — Template craft + product shell

- Shared DesignControls on Home and Studio; guard composer against third-party brand templates.
- Template craft audit: layout-audit clean across 16 briefs; vacancy slabs and alignment-axes collapse.
- Care pathway clinic specimen (Roundspool).
- Readable ink-on-paper product sidebar (`#64`).
- README specimens, craft reels, and demo refresh.

---

## 2026-08-09 – 2026-08-11 — Matchday specimens, skill graph, platform

- Crease (cricket) and Baseline (tennis) matchday specimens from sport vernacular + domain research; score spine / nested sets; instant nav.
- Auto-trigger `website-domain-research` (and sport extension) on site builds; wire research, craft, and media skills into every template run.
- Unify product nav to one left sidebar; stop silent demo fallback when live capture fails; critic rail simplified; seam pins removed.
- Phase 9 uniqueness: archive / studio / foundry loops; strip shared marquee-proof; unique mid-page instruments (field key, press forme, observatory waterfall, lantern trail, loom care-tags).
- Multi-agent MCP install catalog (Cursor, Grok Build, and peers).
- Local training-data sink into sibling `tell-design-data` (Studio routes + later MCP); agency-run-learn vs end-user session learn split.

---

## 2026-08-07 – 2026-08-08 — Motion, lantern, first-five plumbing

- Kinetic motion template (Mote); lantern-path cinematic night-walk.
- Product-proof-stage skill (HTMX workflow proof for SaaS).
- First-five template plumbing: instruments fill the viewport; dead chips become controls.
- Phase 8 stretch: `tell_resolve_intent` + Connect Agent UI — catalog stays at eleven tools.

---

## Earlier (through 2026-08)

Sprint MVP **M1–M10** and Phases **1–6** are closed: capture → fingerprint → 14 detectors → taste → Report/seam → voice → redesign diffs → MCP → proof verify → scenario matrix → auth harness. See [`PLAN.md`](./PLAN.md) and [`BUILD.md`](./BUILD.md).

Phase 7 premium craft floor, agency-quality pipeline, and most of Phase 8 (install-info, `tell mcp install`, `tell_voice`) shipped before the August specimen work. Remaining Phase 7 stretch (optional GSAP/Lenis + Rive) and Phase 9 dossier/consumer/marketing polish are still open in PLAN.md — they sit behind the items in PROJECT-STATUS.
