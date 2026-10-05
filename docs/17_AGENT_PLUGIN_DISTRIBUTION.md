# 17 — Design Proof as a cross-agent plugin (Codex · Cursor · Claude Code · Grok Build)

> How the design engine reaches a coding agent as a **plugin**, on four hosts, from one source.
> This is the distribution plan for the product surface named in
> [`PROJECT-STATUS.md`](./PROJECT-STATUS.md) ("a Cursor / Grok Build **plugin** for world-class
> site and app design across many sessions").
>
> **Read with:** [`16_DESIGN_ENGINE_QUALITY.md`](./16_DESIGN_ENGINE_QUALITY.md) (what the plugin
> must generate) · [`11_AGENT_PLATFORM_INTEGRATION_PLAN.md`](./11_AGENT_PLATFORM_INTEGRATION_PLAN.md)
> (MCP install waves, already largely shipped) · [`09_PREMIUM_DESIGN_SKILLS.md`](./09_PREMIUM_DESIGN_SKILLS.md)
> (the skill graph) · [`TOOLS-AND-SKILLS.md`](./TOOLS-AND-SKILLS.md) (what exists in-repo)

**Status:** proposed. No new plugin package exists yet — see §2.

---

## 0. The honest starting point

The repo already ships two thirds of "a plugin":

| Already shipped | Where |
|---|---|
| MCP server, eleven `designproof_*` tools, stdio | `packages/mcp` |
| CLI mirroring the API one-to-one | `packages/cli` |
| One-command MCP install for **19 hosts** with verified project/user config paths | `packages/cli/src/mcp-install.ts`, `packages/schema/src/platform-compat.ts:212-360` |
| Install-info single source (JSON, TOML, YAML, CLI snippets, Cursor deeplink) | `packages/schema/src/install-info.ts` |
| 47 Cursor skills, 11 subagents, 19 rules, 2 hooks | `.cursor/{skills,agents,rules,hooks}` |
| Canonical craft playbooks | `agent-skills/web-design/**` |

`docs/TOOLS-AND-SKILLS.md` currently says, correctly: *"Cursor plugin package — No. Do not scaffold
a plugin unless Ashish asks."* **Ashish has now asked.** That line must change as part of this work;
this doc supersedes it for the packaging decision and leaves the honesty rule intact (see §6).

The gap is not MCP connection. The gap is that **everything that makes Design Proof good at design is
currently Cursor-shaped**: skills live in `.cursor/skills/`, rules in `.cursor/rules/*.mdc`, the
session hook in `.cursor/hooks.json`, subagents in `.cursor/agents/`. On Claude Code, Codex, and
Grok Build the same craft either does not arrive, or arrives as a text file the agent may never read.
Connecting the MCP server gives those hosts `designproof_diagnose` and `designproof_design_from_features`. It does
not give them the skill graph that decides *how* to design.

---

## 1. What each host actually gives a plugin author

Two classes of capability, and they are not the same on any two hosts.

**Class A — MCP tool access.** Verified in-repo. `platform-compat.ts` encodes the strategy and
config path for all nineteen IDs. This class is done.

**Class B — how the host learns Design Proof's craft.** Per host:

| | Cursor | Claude Code | Codex CLI | Grok Build |
|---|---|---|---|---|
| MCP config | `.cursor/mcp.json` (project) / `~/.cursor/mcp.json` — *verified* | `.mcp.json` / `claude mcp add-json` — *verified* | `.codex/config.toml` / `~/.codex/config.toml` — *verified* | `.grok/config.toml` / `~/.grok/config.toml` — *verified* |
| Install command | `designproof mcp install cursor --project` | `designproof mcp install claude` | `designproof mcp install codex --project` | `designproof mcp install grok --project` |
| Skill files | `.cursor/skills/<name>/SKILL.md` (frontmatter `name` + `description`) — *in use* | `.claude/skills/<name>/SKILL.md` — *unverified, not in repo* | *no skill directory* — project knowledge is `AGENTS.md` — *unverified* | *no skill directory*; project knowledge is a build/instructions file — *unverified* |
| Always-on rules | `.cursor/rules/*.mdc` (`alwaysApply` / glob) | *not verified* | `AGENTS.md` (root + nested) | *not verified* |
| Commands | `.cursor/commands/*.md` | `.claude/commands/*.md` | *not verified* | *not verified* |
| Subagents | `.cursor/agents/*.md` | `.claude/agents/*.md` | *not verified* | *not verified* |
| Hooks | `.cursor/hooks.json` (`sessionStart`, `afterFileEdit`) | *not verified* | *not verified* | *not verified* |

**Rule for this plan: nothing in the "unverified" cells may be claimed, documented, or generated
until a file exists in-repo that proves it and a test asserts the generated artifact.** This is the
existing `dp-mcp-tools` catalog-honesty rule (docs must equal code) extended to packaging. The
adapter layer is built so that an unverified host degrades to the *most portable* surface — an
instruction block plus MCP access — rather than shipping a guessed manifest that silently does
nothing.

What is portable across all four, and therefore what the plugin should be built on:

1. **MCP over stdio** — all four.
2. **A project-scoped markdown instruction file** the agent reads automatically — all four have a
   concept of it (name and path differ, but the shape does not).
3. **A skills directory**: verified on Cursor, widely conventional elsewhere. Treated as an
   *optional* render target, not the load-bearing one.
4. **A CLI** the agent can shell out to — all four.

---

## 2. Architecture: one engine, one registry, N renders

Do **not** fork the skills per host. The reason the Cursor surface has 47 skills and 19 rules is
that they accumulated; duplicating them into four dialects guarantees drift within a month.

```
packages/design-skills        the generator            (see docs/16)
packages/core · taste · redesign · schema             the critic + contracts
        │
        ▼
packages/mcp · packages/cli   the engine's two adapters (MCP stdio + command line)
        │
        ▼
agent-skills/                 ONE canonical playbook per skill      [registry]
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│ @designproof/pack  — capability-aware renderers (NEW)                    │
│   capabilities.ts   verified host facts, each with evidence       │
│   renderMcp(host)   ← wraps existing install-info/platform-compat │
│   renderInstructions(host) → AGENTS.md / CLAUDE.md / .mdc / .md   │
│   renderSkills(host)       → .cursor|.claude|.grok/skills/…       │
│   renderCommands(host)     → commands dir when verified           │
│   renderHooks(host)        → hooks file when verified, else a     │
│                              prompt-level checklist in instructions│
│   renderBundle(host)       → { files[], skipped[], reasons[] }    │
└───────────────────────────────────────────────────────────────────┘
        │                    │                    │                 │
        ▼                    ▼                    ▼                 ▼
  Cursor package        Claude Code          Codex CLI         Grok Build
```

Design rules:

- **`renderBundle` returns `skipped` with reasons.** A host that has no hooks gets
  `skipped: ["hooks"]` and the same behaviour expressed as an instruction step. Nothing is silently
  dropped, and nothing is invented.
- **Every render is deterministic** (no timestamps, no absolute paths in committed output, stable
  ordering) so `git diff` is meaningful and a test can assert byte equality.
- **The instructions file is the load-bearing artifact**, because it is the one surface all four
  hosts read. It carries: what Design Proof is, the standing rules (deterministic core, never auto-apply,
  tokens only), when to call which `designproof_*` tool, and a short craft contract — not the whole
  playbook. Detail stays in skills/CLI, pulled on demand.
- **One test asserts catalog honesty**: for every claimed capability, `renderBundle` must actually
  emit a file with that name; for every `skipped`, there must be a documented fallback.

### 2.1 The instruction block (all four hosts)

Draft of the block `@designproof/pack` writes into each host's instruction surface:

```markdown
## Design Proof — design quality

You are designing a website or app UI. Design Proof is installed as an MCP server (`designproof_*`) and a CLI
(`designproof`). Use it; do not redesign by vibes.

Before pixels:
1. `designproof_resolve_intent` on the user's request → scenario + defaults.
2. `designproof_design_from_features` with the brief → a design spec, an `ArtDirection` (thesis, fold
   decision, per-room rhythm, palette structure, type voice, motion beats, asset plan) and preview
   HTML. Read the direction, not just the HTML.
3. Research the domain first when the brief is a new vertical (`website-domain-research`).

After pixels:
4. Render it and run `designproof_diagnose` on the result. Supply the `ArtDirection` so the report can say
   which decisions were kept.
5. Fix measured findings. Re-diagnose. Do not report success on an unmeasured page.
6. `designproof_proof_verify` when a change is meant to prove an improvement.

Rules: deterministic core (never invent metrics or logos), never auto-apply a patch,
tokens only in component classNames, execute every research + craft node the engine routes.
```

That block is the minimum viable plugin. Everything else is additive.

---

## 3. Packaging per host

### 3.1 Cursor

Existing surface is the reference implementation. Change: generate it from `@designproof/pack` instead of
hand-maintaining it, so the other three hosts cannot drift from it.

- `.cursor/skills/**`, `.cursor/rules/**`, `.cursor/agents/**`, `.cursor/commands/**`, `.cursor/hooks.json`
- `.cursor/mcp.json` → `designproof mcp install cursor --project`
- Existing deeplink path stays (`install-info.deeplink.cursor`)

**Cost:** low — it is a refactor of already-working files plus a generator test.

### 3.2 Claude Code

- MCP: `designproof mcp install claude` (CLI strategy, `.mcp.json` fallback) — shipped.
- Instructions: `CLAUDE.md` — the repo already has one; `@designproof/pack` writes/updates a marked section
  rather than owning the file.
- Skills/commands/agents/hooks: **render only after a file exists in-repo that proves the path and
  format.** Until then `renderBundle("claude")` returns them in `skipped` with the reason
  `unverified_path`, and the instruction block carries the craft contract instead.

### 3.3 Codex CLI

- MCP: `designproof mcp install codex --project` → `.codex/config.toml` — shipped.
- Instructions: `AGENTS.md` — **this repo already uses `AGENTS.md` as its agent entry point**, so the
  Codex adapter is largely "write the Design Proof section into `AGENTS.md`", which is also the mechanism
  every other agent-nav convention in this repo already relies on.
- No skill directory: `skipped` until verified.

### 3.4 Grok Build

- MCP: `designproof mcp install grok --project` → `.grok/config.toml` — shipped.
- Instructions: same `AGENTS.md`-shaped block, path pending verification.
- `designproof_recursive_improve`-style flows: keep as CLI subcommands, not host features.

### 3.5 The other fifteen hosts in `platform-compat.ts`

They keep MCP access plus the print-config snippet they already have. `@designproof/pack` must not grow a
per-host special case for Zed or Trae. If a host cannot read an instruction file, its honest status
is "MCP tools only", and that is what the registry says.

---

## 4. What the plugin must actually do (the design-engine contract)

Distribution is worthless if the engine generates generic pages. `docs/16` defines the engine work;
this is what the *plugin* promises once that work lands:

| Plugin promise | Backed by |
|---|---|
| "Name what makes your UI generic, with evidence on the rendered page" | 14 detectors, 6-axis score, `designproof_diagnose` — **shipped** |
| "Produce a design direction before code: thesis, fold decision, per-room rhythm, palette structure, type voice, motion beats" | `ArtDirection` — **docs/16 M2** |
| "Generate a page from that direction, not from a template switch" | `PageProgram` compiler — **docs/16 M3** |
| "Give it real imagery, art-directed" | media system — **docs/16 M4** |
| "Measure the result against a calibrated corpus and refuse to call it done" | corpus corridors + layout audit in CI — **docs/16 M1/M7** |
| "Never auto-apply; hand back a reviewable patch" | `designproof_apply` returns patch text — **shipped** |
| "Prove an improvement in a disposable checkout" | `designproof_proof_verify` — **shipped** |

The first six lines are the plugin. Two of seven ship today. That ordering — engine before packaging
breadth — is deliberate and is the single most important judgement in this doc: **a Cursor/Codex/
Claude/Grok plugin that generates generic pages just makes the genericness available in four
editors.**

---

## 5. Workstreams

### W0 — Honesty and registry (small, do first)

- [ ] `packages/pack/src/capabilities.ts`: one entry per host with `verifiedAt`, `evidenceFile`, and
      the capability set. No entry without an evidence file in-repo.
- [ ] Extend the existing catalog-honesty test so it covers packaging, not just the eleven tool names.
- [ ] Update `docs/TOOLS-AND-SKILLS.md` §Plugins to reflect the decision (Ashish asked) and to point
      at this doc + `@designproof/pack`.
- [ ] `renderBundle` rejects any capability whose evidence file is missing at build time.

### W1 — `@designproof/pack` core

- [ ] `renderInstructions(host)` for all four, from one canonical block source.
- [ ] `renderMcp(host)` delegating to `platform-compat.ts` / `install-info.ts` (no second source of truth).
- [ ] `renderBundle(host)` → `{ files, skipped, reasons }`, deterministic, with golden tests.
- [ ] CLI: `tell pack <host> [--out <dir>] [--print]`.

### W2 — Generate the Cursor surface

- [ ] Move `.cursor/skills|rules|agents|commands|hooks` to generated-on-demand from
      `agent-skills/` + `capabilities.ts`; keep the committed output byte-identical where possible so
      the diff proves the generator is faithful.
- [ ] Delete any hand-maintained duplicate that the generator now owns.

### W3 — Claude Code, Codex, Grok

- [ ] Instructions section writers (`CLAUDE.md`, `AGENTS.md`, Grok equivalent when verified).
- [ ] Add skills/commands/hooks renders **only** for paths proven by a committed file.
- [ ] One integration check per host: the rendered bundle installs into a temp dir, `designproof` resolves,
      and the instruction file contains the craft contract.

### W4 — Product-facing install

- [ ] `/api/install-info` gains a `pack` section so the web UI can offer "Add Design Proof to <host>".
- [ ] `designproof doctor` reports which capabilities the current host actually got.
- [ ] README section: one row per host, with what it gets and what it does not.

### W5 — Prove it on a real site

- [ ] Build one complete marketing site through the plugin path on **each** of the four hosts, in a
      directory that is not this repo, using only the plugin surface (MCP + instructions + CLI).
- [ ] Publish the four resulting pages as templates. This is the plugin's demo, and it is also the
      acceptance test for `docs/16`.

---

## 6. Non-negotiables

1. **Deterministic core stays LLM-free.** The plugin never routes design generation through a host's
   own model.
2. **Never auto-apply.** `designproof_apply` returns patch text on every host.
3. **Zod at every boundary**, including the pack renderer's inputs.
4. **No invented connectors.** A host capability exists in `capabilities.ts` only with an in-repo
   evidence file. `docs/TOOLS-AND-SKILLS.md` stays the honest registry.
5. **No host-specific design output.** The page must be identical whichever agent asked for it.
   Otherwise the plugin is four products.
6. **No peer or third-party naming** in code, commits, docs, or copy — the existing anonymisation rule.
7. **Local CI only.** Do not gate packaging on GitHub Actions.
8. **The engine comes first.** Do not ship W3 breadth ahead of `docs/16` M2–M4; shipping a plugin
   that generates generic pages is a loss, not a launch.

---

## 7. Definition of done

A user on any of the four hosts:

1. runs one install command, and the host's config shows Design Proof's MCP server;
2. asks their agent for a marketing site for their product;
3. watches the agent call `designproof_resolve_intent` → `designproof_design_from_features`, read back an
   `ArtDirection`, and scaffold a page that uses real imagery and a composition the direction chose;
4. gets a `designproof_diagnose` report on the rendered result with named findings, and a patch proposal;
5. never has a file written without approval.

Until step 3 produces a page a designer would believe, steps 1, 2, 4, 5 are infrastructure. That is
the state of the world today, and it is why this doc is second to
[`16_DESIGN_ENGINE_QUALITY.md`](./16_DESIGN_ENGINE_QUALITY.md).

---

## 8. Open questions

1. **Package shape.** One `@designproof/pack` that renders every host from the registry, or a thin
   `.cursor-plugin` / `.claude-plugin` / Codex manifest per host that shells out to `@designproof/pack`? The
   first is maintainable; the second is what hosts' marketplaces expect. Likely both: `@designproof/pack` is
   the engine, and each host gets a ~20-line manifest that wraps it.
2. **Skills fidelity.** Does a skill need to be a file on the host at all, or is an MCP
   resource/prompt read on demand enough? The latter has one source of truth; the former is what
   agents actually auto-load.
3. **Verification budget.** Confirming the unverified cells in §1 needs a real install of each host.
   Who does that, and is it acceptable for the first release to ship Codex/Grok/Claude with MCP +
   instructions only?
4. **Training sink.** Four hosts writing episodes into `dp-design-data` multiplies raw data volume
   without a curation loop. `docs/14` says do not grow a collector here; packaging should not
   accidentally become one.
