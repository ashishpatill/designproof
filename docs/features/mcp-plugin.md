# MCP plugin (Cursor / Grok Build)

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

## Goal

Tell ships as skills + CLI + **stdio MCP** that Cursor and Grok Build (and other hosts) consume. That plugin loop **is** the product. Not a Studio web app.

## Done

- Eleven `tell_*` tools; docs ≡ `@tell/schema` `MCP_TOOL_NAMES` (catalog honesty closed 2026-08-21).
- `.cursor/mcp.json` → `pnpm -F @tell/mcp start`.
- `tell mcp install <platform>` (Cursor project json + deeplink; Grok `--project`; others print-config or native add).
- `GET /api/install-info` + `tell_install_info` + `tell_resolve_intent`.
- MCP training writes (when sibling `tell-design-data` exists) — **not** the same as curated SFT/DPO (see [training-data-mcp-sink.md](./training-data-mcp-sink.md)).

## Remaining

- Web-only gaps by design: `/api/setup/*`, share links, health — not extra MCP tools.
- Do not add a twelfth tool without schema + drift-guard + docs in the same change.
- Plugin-first identity: do not spend a session polishing `/studio` as if it were the ship surface.

## How to verify

```bash
tell mcp platforms
tell mcp install cursor --print
pnpm -F @tell/mcp start   # stdio; Agent chat: tell_diagnose on http://localhost:3001
```

Catalog must stay at **eleven**. `tell_apply` never writes files.

> **Planned, not built: staged design tools.** Today `tell_design_from_features` builds a whole site design in one call. The [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3) proposes replacing it with one MCP (Model Context Protocol) tool for each of the eight reviewed design stages (brief, concepts, mood board, art direction, imagery, one key screen, section by section, and refinement), plus a review tool. Motion has its own review, after art direction and before refinement, through that same review tool. A stage can't run until the one before it is approved, and rejecting a stage reruns only that stage. Under the plan the catalog would go from 11 to 19 tools, and a colour `theme` setting would replace colour picked from the product name. None of this exists yet. It's waiting for Ashish's decision in Linear issue [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the). Until then the eleven tools listed here are the real catalog.

## Skills to load first

`tell-mcp-tools` · (install copy) `tell-demo-script`

MCP: the `tell` server only. No in-repo Cursor plugin package.

## Related

[`docs/11_AGENT_PLATFORM_INTEGRATION_PLAN.md`](../11_AGENT_PLATFORM_INTEGRATION_PLAN.md) · [`docs/12_AUTH_SECURITY_BOUNDARIES_PLAN.md`](../12_AUTH_SECURITY_BOUNDARIES_PLAN.md) · [`README.md`](../../README.md) (Cursor MCP + platform table)
