---
name: dp-mcp-tools
description: Implements and uses Design Proof MCP tools for Cursor integration. Use when working on packages/mcp, designproof_* tools, .cursor/mcp.json, install-info, or driving Design Proof from Agent chat.
---

# Design Proof MCP tools

## Scope

- `packages/mcp/src/index.ts` — stdio MCP server
- `packages/schema` — `McpToolName` / `InstallInfo` / `buildInstallInfo`
- `.cursor/mcp.json` — registers `pnpm -F @designproof/mcp start`
- `GET /api/install-info` + `designproof mcp install <platform>` — Connect Agent / platform catalog

## Tools

| Tool | Args | Returns |
|---|---|---|
| `designproof_capture` | `{ url }` | `CapturePayload` |
| `designproof_diagnose` | `{ url?, reportPath? }` | `DesignProofReport` (with `id`) |
| `designproof_redesign` | `{ direction, findingId?, reportId? }` | `RedesignProposal` |
| `designproof_apply` | `{ proposalId?, projectRoot? }` | `{ patches, instruction }` |
| `designproof_capture_matrix` | `{ url, routes?, compare? }` | matrix + proof |
| `designproof_proof_verify` | `{ url, patch, projectRoot?, … }` | proof verdict |
| `designproof_proof_revert` | `{ projectRoot?, patch? }` | `{ reverted }` |
| `designproof_design_from_features` | brief fields | `DesignSpec` (+ HTML) |
| `designproof_voice` | `{ transcript }` | direction plan + source |
| `designproof_install_info` | `{ launch? }` | `InstallInfo` |
| `designproof_resolve_intent` | `{ text, fixtureUrl? }` | `ResolvedIntent` |

Web-only today: `/api/setup/*`, share links (see `docs/11`).

## Rules

1. Parse all inputs/outputs with `@designproof/schema`
2. `designproof_apply` returns patch text only — never writes files
3. `designproof_diagnose` without URL/report falls back to `fixtures/reports/dp-report.json`
4. Tool names must match `MCP_TOOL_NAMES` (vitest drift guard)
5. MCP and web API share the same engine contracts
6. When sibling `dp-design-data` exists, `designproof_diagnose` / `designproof_redesign` /
   `designproof_proof_verify` / `designproof_design_from_features` write raw episodes via the
   same sink as `/api/design` (`@designproof/design-skills/training-data-sink`). Missing
   sink ⇒ no-op. Still eleven tools; no public MCP host.

## One-click / install

```bash
designproof mcp install cursor --project   # upsert .cursor/mcp.json
designproof mcp install claude             # claude mcp add-json or .mcp.json
designproof mcp install opencode --project
designproof mcp install grok --project
designproof mcp platforms                  # compatibility table
designproof mcp print-config               # all agent snippets + deeplink
curl -s localhost:3000/api/install-info | jq .platforms
```

## Smoke test in Agent chat

```
Run designproof_diagnose on http://localhost:3001 and summarize generic tells.
Parse voice: warmer, editorial, less shadow via designproof_voice.
Draft an editorial redesign for SystemFontTell.
```

## Local dev

```bash
pnpm dev:fixture   # :3001
pnpm -F @designproof/mcp start
# or: pnpm tell -- doctor
```

## DoD

- All eleven tools return schema-valid JSON
- Offline artifact fallback works without live capture
- Apply instructions are explicit for human review
- install-info + multi-platform `designproof mcp install` paths work without hand-edited JSON

## Related

- Rules: `.cursor/rules/dp-mcp-api.mdc`
- Plans: `docs/11`–`docs/13`
- AGENTS.md MCP section
