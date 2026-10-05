# AGENTS.md — entry only

Design Proof is the **Cursor / Grok Build plugin** for world-class site and app design across many sessions. Agents write code; Design Proof observes the **rendered** UI, names genericness tells and drift, takes plain-English art-direction, drafts patches, and proves them in a disposable checkout. Humans approve — `designproof_apply` never writes files.

`/studio` and `/showcase` are dogfood and templates. They are not the product.

**Do not load entire `docs/`. Open only the FEATURE-MAP rows that match this task.**

Status: [`CHANGELOG.md`](./CHANGELOG.md) · [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md)  
Registry: [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md) · [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md)

---

## Standing rules

- **Ship bar:** stacked images, motion, artistic, unique. Not one-shot AI generate.
- **Park:** secondary to DeepHarness honesty — do not pull eng attention here while that is open.
- **Local CI only:** never wait on or re-run GitHub Actions. Gate on `pnpm test` / `pnpm typecheck`.
- **Deterministic core** (`packages/core`): zero LLM. Zod at every boundary (`@designproof/schema`).
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
| Design engine quality (generation) | [`docs/16_DESIGN_ENGINE_QUALITY.md`](./docs/16_DESIGN_ENGINE_QUALITY.md) | Any change to `packages/design-skills`, `composition.ts`, templates, figures, or the critique loop — read §2 root causes and §5 target first |
| Agent plugin distribution (Codex / Cursor / Claude Code / Grok) | [`docs/17_AGENT_PLUGIN_DISTRIBUTION.md`](./docs/17_AGENT_PLUGIN_DISTRIBUTION.md) | Packaging, host manifests, instruction files, `@designproof/pack` |
| MCP plugin (Cursor / Grok) | [`docs/features/mcp-plugin.md`](./docs/features/mcp-plugin.md) | `designproof_*` tools, install-info, catalog honesty |
| Design dogfood loop | [`docs/features/design-dogfood-loop.md`](./docs/features/design-dogfood-loop.md) | Design Proof’s own UI, Studio bar, multi-session craft |
| Training-data / MCP sink | [`docs/features/training-data-mcp-sink.md`](./docs/features/training-data-mcp-sink.md) | `dp-design-data`, SFT/DPO, episode writes |
| Showcase / Tiller | [`docs/features/showcase-tiller.md`](./docs/features/showcase-tiller.md) | Templates, GitHub README stills, Tiller gap |

Full table (status, code paths, skills): [`docs/FEATURE-MAP.md`](./docs/FEATURE-MAP.md).

---

## Skill / MCP / plugin → load

| Load | How | When required |
|---|---|---|
| Feature skill | Read `.cursor/skills/<name>/SKILL.md` | Row in FEATURE-MAP lists it |
| Design Proof MCP | `.cursor/mcp.json` → `pnpm -F @designproof/mcp start` | Diagnose / redesign / prove / design-from-features in Agent chat |
| Site research graph | `@website-domain-research` (auto on new sites) | Any new or redesigned website |
| Always-on media | `@responsive-performance` | After photography lands under `apps/web/public/**` |
| In-repo plugins | **None built yet** — `@designproof/pack` is planned in [`docs/17`](./docs/17_AGENT_PLUGIN_DISTRIBUTION.md) | Do not invent host manifests, grok-kit, or plugin packages; a host capability exists only with an in-repo evidence file |

Names, paths, and “when”: [`docs/TOOLS-AND-SKILLS.md`](./docs/TOOLS-AND-SKILLS.md).

```bash
pnpm test && pnpm -F @designproof/schema build && pnpm -F @designproof/web typecheck
```
