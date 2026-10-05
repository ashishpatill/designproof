import { z } from "zod";
import { buildPlatformCatalog, PlatformCompatEntry } from "./platform-compat";

/** Every public MCP tool name. CI/docs must match this enum. */
export const McpToolName = z.enum([
  "designproof_capture",
  "designproof_diagnose",
  "designproof_redesign",
  "designproof_apply",
  "designproof_capture_matrix",
  "designproof_proof_verify",
  "designproof_proof_revert",
  "designproof_design_from_features",
  "designproof_voice",
  "designproof_install_info",
  "designproof_resolve_intent",
]);
export type McpToolName = z.infer<typeof McpToolName>;
export const MCP_TOOL_NAMES = McpToolName.options;

export const McpStdioServerConfig = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  env: z.record(z.string()).optional(),
});
export type McpStdioServerConfig = z.infer<typeof McpStdioServerConfig>;

export const InstallInfo = z.object({
  version: z.string(),
  schemaVersion: z.literal(1),
  requirements: z.object({
    node: z.string(),
    pnpm: z.string().optional(),
    playwright: z.boolean(),
  }),
  demo: z.object({
    fixtureUrl: z.string(),
    offlineReportPath: z.string(),
    webUrl: z.string(),
  }),
  mcp: z.object({
    serverName: z.literal("designproof"),
    tools: z.array(McpToolName),
    cursor: z.object({ mcpServers: z.record(McpStdioServerConfig) }),
    claudeCli: z.string(),
    vscode: z.object({
      servers: z.record(
        z.object({
          type: z.literal("stdio"),
          command: z.string(),
          args: z.array(z.string()).default([]),
          env: z.record(z.string()).optional(),
        }),
      ),
    }),
    windsurf: z.object({ mcpServers: z.record(McpStdioServerConfig) }),
    zed: z.object({
      context_servers: z.record(
        z.object({
          command: z.string(),
          args: z.array(z.string()).default([]),
          env: z.record(z.string()).optional(),
        }),
      ),
    }),
    codexToml: z.string(),
    manual: McpStdioServerConfig,
  }),
  /** Exhaustive agent/IDE catalog — source for README + `designproof mcp install`. */
  platforms: z.array(PlatformCompatEntry),
  cli: z.object({
    pnpmMcp: z.string(),
    dpDiagnose: z.string(),
    dpMcpInstallCursor: z.string(),
    dpMcpInstall: z.string(),
    dpDoctor: z.string(),
  }),
  deeplink: z.object({
    cursor: z.string(),
  }),
});
export type InstallInfo = z.infer<typeof InstallInfo>;

export type BuildInstallInfoOptions = {
  version?: string;
  /** Prefer monorepo pnpm launch (default) vs built dp-mcp bin. */
  launch?: "pnpm" | "dp-mcp";
  fixtureUrl?: string;
  webUrl?: string;
  offlineReportPath?: string;
};

function stdioLaunch(launch: "pnpm" | "dp-mcp"): McpStdioServerConfig {
  if (launch === "dp-mcp") {
    return { command: "dp-mcp", args: [] };
  }
  return {
    command: "pnpm",
    args: ["-F", "@designproof/mcp", "start"],
  };
}

/** UTF-8 → base64 for Cursor MCP deeplink config payloads. */
export function utf8ToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function buildCursorDeeplink(config: McpStdioServerConfig, name = "designproof"): string {
  const payload = utf8ToBase64(JSON.stringify(config));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${payload}`;
}

/**
 * Single source of truth for MCP/CLI install snippets (docs/11 Wave 1).
 * Pure data — no filesystem side effects.
 */
export function buildInstallInfo(options: BuildInstallInfoOptions = {}): InstallInfo {
  const launch = options.launch ?? "pnpm";
  const stdio = stdioLaunch(launch);
  const version = options.version ?? "0.1.0";
  const fixtureUrl = options.fixtureUrl ?? "http://localhost:3001";
  const webUrl = options.webUrl ?? "http://localhost:3000";
  const offlineReportPath = options.offlineReportPath ?? "fixtures/reports/dp-report.json";

  const claudeJson = JSON.stringify({
    command: stdio.command,
    args: stdio.args,
    ...(stdio.env ? { env: stdio.env } : {}),
  });

  const raw = {
    version,
    schemaVersion: 1 as const,
    requirements: {
      node: ">=20",
      pnpm: ">=9",
      playwright: true,
    },
    demo: {
      fixtureUrl,
      offlineReportPath,
      webUrl,
    },
    mcp: {
      serverName: "designproof" as const,
      tools: [...MCP_TOOL_NAMES],
      cursor: { mcpServers: { designproof: stdio } },
      claudeCli: `claude mcp add-json --scope user designproof '${claudeJson}'`,
      vscode: {
        servers: {
          designproof: {
            type: "stdio" as const,
            command: stdio.command,
            args: stdio.args,
            ...(stdio.env ? { env: stdio.env } : {}),
          },
        },
      },
      windsurf: { mcpServers: { designproof: stdio } },
      zed: {
        context_servers: {
          designproof: {
            command: stdio.command,
            args: stdio.args,
            ...(stdio.env ? { env: stdio.env } : {}),
          },
        },
      },
      codexToml: [
        "[mcp_servers.designproof]",
        `command = ${JSON.stringify(stdio.command)}`,
        `args = ${JSON.stringify(stdio.args)}`,
      ].join("\n"),
      manual: stdio,
    },
    platforms: buildPlatformCatalog(stdio),
    cli: {
      pnpmMcp: "pnpm -F @designproof/mcp start",
      dpDiagnose: `designproof diagnose --url ${fixtureUrl}`,
      dpMcpInstallCursor: "designproof mcp install cursor --project",
      dpMcpInstall: "designproof mcp install <platform> [--project|--user|--print]",
      dpDoctor: "designproof doctor",
    },
    deeplink: {
      cursor: buildCursorDeeplink(stdio),
    },
  };

  return InstallInfo.parse(raw);
}
