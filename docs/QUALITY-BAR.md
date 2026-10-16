# DesignProof quality bar (2026-10-01, revised 2026-10-16 for the redesign plan)

> **Redesign plan (proposed, pending decision):** DesignProof is moving to a concept-first, step-by-step design process: eight reviewed stages (brief, concepts, mood board, art direction, imagery, one key screen, section by section, refinement), colour from a theme setting, an automatic swap test, and Awwwards-weighted review with Open Design as the bar. Plan: [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) · Decision: [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Template keep, merge or drop calls are **proposals** until Ashish decides in BIM-203; nothing has been dropped.

Reference studied: OpenDesign site (open-design.ai) + nexu-io/open-design README.
We do **not** clone their Mac desktop app. Our wedge is **DesignProof web + Cursor plugin / Model Context Protocol (MCP)**.

## What OpenDesign does that DesignProof currently does not

1. **Runnable templates** — real HTML/CSS (or app) files you can open, click, and hand to an agent. Not static marketing shells.
2. **Live preview path** — brief → template → visible artifact; README thumbnails link to real examples.
3. **Brand contract** — a portable design system file (their `DESIGN.md`) that every render reads.
4. **Agent install story** — one clear MCP / plugin try-path in the README (install into Cursor, then ask the agent to generate).
5. **Catalog honesty** — modes and scenarios labeled; counts match what ships; no fake “works” buttons.

## DesignProof bar (must pass before more showcase paint)

### Product site ([designproof.site](https://designproof.site))
- Rename chrome: **DesignProof** everywhere user-facing (drop leftover “Tell” marketing voice).
- Hero shows **one** golden path: open Studio → pick/generate from the golden template → see a clickable preview → open Report (or honest empty if Report is not ready).
  - Proposed under the redesign plan (pending BIM-203): Hero shows **one** honest path: open Studio → start from a brief → step through the reviewed stages (or an honest empty state where a stage isn't built yet) → open Report.
- No hallucinated controls (buttons that look live but do nothing). Every primary control either works or is clearly disabled with why.
- Showcase strip: only list templates that are clickable end-to-end. Hide or mark the rest as “not ready” — do not fake depth.
- Screenshots in marketing only from real local/prod captures. No invented UI mockups as “product.”

### README (GitHub)
- Lead with what you can do **today** in under 60 seconds (clone/run or try MCP), not a vision essay.
- One golden template demo: screenshot + link to `/showcase/<key>` that actually navigates.
  - Proposed under the redesign plan (pending BIM-203): One demo of the staged flow (brief → concept → key screen) with real captures; no "golden template" claim while BIM-203 is open.
- Explicit wedge line: web studio + Cursor plugin / MCP — **not** a desktop Mac app.
- Honest status of Studio vs Report vs showcase specimens.
- Rename user-facing strings to DesignProof; keep git path notes until rename PR lands.

### One golden template = Crease

> **Proposed (pending BIM-203):** the lock below is superseded by the redesign plan; see "Golden template: superseded (2026-10-16)" at the end of this section. The original text is kept for history.

**Locked (2026-10-01):** golden = **Crease** (`crease` / `sport-matchday`). Baseline runner-up. Keel out.
See `CREASE-GOLDEN-BRIEF.md` (local only, not in the repo) for done-when and hero path.
Must stay a **working multipage mini-app** (~10 routes today), not a fold wallpaper:
- Real navigation across routes (not only anchor jumps).
- Real empty states and at least one working primary action.
- Distinct from Tiller / agent-harness and from thin single-document landings.
- Passes Report prove path for Crease, or we do not claim "prove."
- Pause all other showcase polish until Crease golden path is green.

### Golden template: superseded (2026-10-16)

The 2026-10-01 lock ("golden = Crease, Baseline runner-up, Keel out") is **superseded** by the redesign plan. There is no single golden template while the plan is under review. Instead:

- **Concept first.** No template or site is judged until it has a written concept: a one-line idea, a metaphor or material, what it rejects, and three visible tests.
- **Eight reviewed stages.** Brief → concept → mood board → art direction → imagery → key screen → section by section → refine and polish. Each stage is reviewed before the next starts.
- **Colour from a theme setting.** A template's colours come from a named theme the brief or reviewer selects, not from a hash of the product name.
- **Automatic swap test.** Render with an unrelated brand. If the concept, the first-screen metaphor and the copy don't change, the build fails.
- **Awwwards-weighted review.** Design 40%, usability 30%, creativity 20%, content 10%, plus developer checks (accessibility, performance, responsive layout). Open Design is the bar.
- **The old pass checklist is necessary but not sufficient.** No invented facts, no repeated lines, and working links are still required, but passing them doesn't mean a page is good.

**Template calls (PROPOSED, pending BIM-203; nothing dropped yet):** keep and rebuild research dossier and lantern (as a visual direction, not a template); merge agent harness (Tiller) with Keel; merge consumer craft into a new physical-product concept; drop merchandising loom and clinic. Crease and Baseline weren't in this assessment and are unaffected until Ashish decides.

## Freeze
- No new showcase skins.
- Keel is out of the golden track (`/showcase/keel` 404 / not in tree).
- Design + Web Designer own site IA / README visual bar against Crease; Frontend owns PR 1 (Crease + honesty) then PR 2 (DesignProof rename); MCP owns plugin try-path docs (local `tell_*` only).

