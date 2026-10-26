/**
 * Local-only prove (uncommitted): leave a durable raw/design dump under .mcp-prove-sink.
 * Not part of CI — filename *.local.test.ts is for humans; vitest include still picks it up.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resetTrainingSinkCache } from "@tell/design-skills/training-data-sink";
import { handleDesignFromFeatures } from "./tool-handlers";

describe("MCP prove dump (persistent)", () => {
  it("writes durable raw/design json under .mcp-prove-sink", async () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    const sinkRepo = path.join(repoRoot, ".mcp-prove-sink");
    await mkdir(sinkRepo, { recursive: true });
    await writeFile(
      path.join(sinkRepo, "package.json"),
      JSON.stringify({ name: "tell-design-data" }),
      "utf8",
    );

    process.env.TELL_DESIGN_DATA_REPO = sinkRepo;
    process.env.TELL_TRAINING_DATA = "1";
    process.env.TELL_TRAINING_DATA_SYNC = "0";
    delete process.env.VERCEL;
    resetTrainingSinkCache();

    const result = await handleDesignFromFeatures(
      {
        productName: "MCP Prove Dump",
        tagline: "Local stdio prove",
        features: [{ name: "Capture", description: "Rendered UI evidence", priority: "p0" }],
        siteKind: "saas-marketing",
        lockSiteKind: true,
      },
      { awaitSink: true },
    );
    expect(result.spec).toBeTruthy();

    const designDir = path.join(sinkRepo, "training-data", "raw", "design");
    const jsonFiles = (await readdir(designDir)).filter((f) => f.endsWith(".json"));
    expect(jsonFiles.length).toBeGreaterThanOrEqual(1);

    const dumpPath = path.join(designDir, jsonFiles[0]!);
    const body = JSON.parse(await readFile(dumpPath, "utf8")) as {
      kind: string;
      meta?: { via?: string };
    };
    expect(body.kind).toBe("design");
    expect(body.meta?.via).toBe("mcp.tell_design_from_features");
    // Absolute path for the room/parent report
    console.log("MCP_PROVE_DUMP_PATH=" + dumpPath);
  });
});
