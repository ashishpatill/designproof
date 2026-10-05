import { NextResponse } from "next/server";
import { buildInstallInfo } from "@designproof/schema";

/** Single source of truth for MCP/CLI install snippets (docs/11). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const launch = url.searchParams.get("launch") === "dp-mcp" ? "dp-mcp" : "pnpm";
  const info = buildInstallInfo({
    launch,
    fixtureUrl: process.env.DP_FIXTURE_URL?.trim() || undefined,
    webUrl: process.env.DP_WEB_URL?.trim() || undefined,
    offlineReportPath: process.env.DP_REPORT_ARTIFACT?.trim() || undefined,
  });
  return NextResponse.json(info);
}
