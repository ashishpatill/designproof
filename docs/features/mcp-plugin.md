# MCP plugin (Cursor / Grok Build)

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

## Goal

Design Proof ships as skills + CLI + **stdio MCP** that Cursor and Grok Build (and other hosts) consume. That plugin loop **is** the product. Not a Studio web app.

## Done

- Eleven `designproof_*` tools; docs ≡ `@designproof/schema` `MCP_TOOL_NAMES` (catalog honesty closed 2026-08-21).
- `.cursor/mcp.json` → `pnpm -F @designproof/mcp start`.
- `designproof mcp install <platform>` (Cursor project json + deeplink; Grok `--project`; others print-config or native add).
- `GET /api/install-info` + `designproof_install_info` + `designproof_resolve_intent`.
- MCP training writes (when sibling `dp-design-data` exists) — **not** the same as curated SFT/DPO (see [training-data-mcp-sink.md](./training-data-mcp-sink.md)).

## Remaining

- Web-only gaps by design: `/api/setup/*`, share links, health — not extra MCP tools.
- Do not add a twelfth tool without schema + drift-guard + docs in the same change.
- Plugin-first identity: do not spend a session polishing `/studio` as if it were the ship surface.

## How to verify

```bash
designproof mcp platforms
designproof mcp install cursor --print
pnpm -F @designproof/mcp start   # stdio; Agent chat: designproof_diagnose on http://localhost:3001
```

Catalog must stay at **eleven**. `designproof_apply` never writes files.

## Skills to load first

`dp-mcp-tools` · (install copy) `dp-demo-script`

MCP: the `designproof` server only. No in-repo Cursor plugin package.

## Related

[`docs/11_AGENT_PLATFORM_INTEGRATION_PLAN.md`](../11_AGENT_PLATFORM_INTEGRATION_PLAN.md) · [`docs/12_AUTH_SECURITY_BOUNDARIES_PLAN.md`](../12_AUTH_SECURITY_BOUNDARIES_PLAN.md) · [`README.md`](../../README.md) (Cursor MCP + platform table)
