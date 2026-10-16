# AGENTS.md — entry only

Tell Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions. Agents write code; Tell observes the **rendered** UI, names genericness tells and drift, takes plain-English art-direction, drafts patches, and proves them in a disposable checkout. Humans approve — `tell_apply` never writes files.

`/studio` and `/showcase` are dogfood and specimens. They are not the product.

**Do not load entire `docs/`. Open only the FEATURE-MAP rows that match this task.**

Status: [`CHANGELOG.md`](./CHANGELOG.md) · [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md)  
Registry: [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md) · [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md)

---

## Standing rules

- **Ship bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.

- **Design process (proposed):** the [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) replaces one-pass generation with seven reviewed stages (brief → concepts → mood board → art direction → key screen → sections → refine), an imagery step, motion as its own reviewed stage, performance budgets at every stage, an explicit colour `theme` instead of colour hashed from the product name, and an automatic swap test (a stranger's brand name on the page shouldn't still work). Proposed, waiting on Ashish's decision in [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the); nothing below is built yet.
- **Park:** secondary to DeepHarness honesty — do not pull eng attention here while that is open.
- **Local CI only:** never wait on or re-run GitHub Actions. Gate on `pnpm test` / `pnpm typecheck`.
- **Deterministic core** (`packages/core`): zero LLM. Zod at every boundary (`@tell/schema`).
- **Never auto-apply.** Tokens only in `apps/web` (no raw hex in classNames).
- **No invented connectors.** Skills/MCP/plugins: only what [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md) lists as in-repo.

Persona / copy: [`USER_STORY.md`](./USER_STORY.md). Engineering contracts: [`BUILD.md`](./BUILD.md). Checklists: [`PLAN.md`](./PLAN.md). Visuals: [`docs/01_DESIGN_SYSTEM.md`](./docs/01_DESIGN_SYSTEM.md). Model pins: [`ORCHESTRATION.md`](./ORCHESTRATION.md).

---

## Working loop

1. Read **this file only**.
2. Match the task to [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md) row(s).
3. Open **those** feature doc(s) + the listed skills / MCP.
4. Skip unrelated features.
5. When done: prepend [`CHANGELOG.md`](./CHANGELOG.md); refresh the matching row in [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md).

---

## Feature → doc

| Feature | Open | When |
|---|---|---|
| Capture → diagnose → prove | [`docs/features/capture-diagnose-prove.md`](./docs/features/capture-diagnose-prove.md) | Detectors, Report, seam, proof, fixture |
| MCP plugin (Cursor / Grok) | [`docs/features/mcp-plugin.md`](./docs/features/mcp-plugin.md) | `tell_*` tools, install-info, catalog honesty |
| Design dogfood loop | [`docs/features/design-dogfood-loop.md`](./docs/features/design-dogfood-loop.md) | Tell’s own UI, Studio bar, multi-session craft |
| Training-data / MCP sink | [`docs/features/training-data-mcp-sink.md`](./docs/features/training-data-mcp-sink.md) | `tell-design-data`, SFT/DPO, episode writes |
| Showcase / Tiller | [`docs/features/showcase-tiller.md`](./docs/features/showcase-tiller.md) | Specimens, GitHub README stills, Tiller gap |

> **Planned, not built: staged design tools.** Today `tell_design_from_features` builds a whole site design in one call. The [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) proposes replacing it with one MCP (Model Context Protocol) tool per reviewed design stage (brief, concepts, mood board, art direction, key screen, sections, refine and motion), plus a review tool. A stage can't run until the one before it is approved, and rejecting a stage reruns only that stage. Under the plan the catalog would go from 11 to 18 tools, and a colour `theme` setting would replace colour picked from the product name. None of this exists yet. It's waiting for Ashish's decision in Linear issue [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Until then the eleven tools listed here are the real catalog.

Full table (status, code paths, skills): [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md).

---

## Skill / MCP / plugin → load

| Load | How | When required |
|---|---|---|
| Feature skill | Read `.cursor/skills/<name>/SKILL.md` | Row in FEATURE-MAP lists it |
| Tell MCP | `.cursor/mcp.json` → `pnpm -F @tell/mcp start` | Diagnose / redesign / prove / design-from-features in Agent chat |
| Site research graph | `@website-domain-research` (auto on new sites) | Any new or redesigned website |
| Always-on media | `@responsive-performance` | After photography lands under `apps/web/public/**` |
| In-repo plugins | **None** | Do not invent grok-kit or other plugin packages |

Names, paths, and “when”: [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md).

```bash
pnpm test && pnpm -F @tell/schema build && pnpm -F @tell/web typecheck
```
