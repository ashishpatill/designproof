import { describe, expect, it, vi } from "vitest";
import { CapturePayload } from "@tell/schema";

/**
 * Browserless CI does not install Playwright browsers. Stub captureUrl at the
 * same module verifyProofPreview imports so handleProofVerify preview path
 * stays green without launching Chromium.
 */
vi.mock("../../core/src/capture/capture-url", () => ({
  captureUrl: vi.fn(async (url: string) =>
    CapturePayload.parse({
      url,
      capturedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 1100 },
      screenshotBase64: Buffer.from("mcp-preview-stub-screenshot-bytes").toString("base64"),
            styles: Array.from({ length: 10 }, (_, i) => ({
        selector: `p.s${i}`,
        tellId: `t${i}`,
        tag: i === 0 ? "h1" : "p",
        role: i === 0 ? "heading" : "body",
        rect: { x: 0, y: i * 24, w: 400, h: 20 },
        fontFamily: "serif",
        fontSize: i === 0 ? "32px" : "16px",
        fontWeight: i === 0 ? "700" : "400",
        color: "rgb(24,22,20)",
        backgroundColor: "rgba(0,0,0,0)",
        borderRadius: "0px",
        boxShadow: "none",
        padding: "0px",
        textAlign: "left",
        lineHeight: "1.2",
        backgroundImage: "none",
      })),
      probes: [],
      domSummary: { headingCount: 2, buttonCount: 1, centeredBlockRatio: 0.1, emojiInUiCount: 0 },
    }),
  ),
  resolveAuthStorageState: () => undefined,
}));

import { handleProofVerify } from "./tool-handlers";

const MINIMAL_PREVIEW = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MCP preview proof</title>
</head>
<body>
  <main>
    <h1>MCP preview proof</h1>
    <p>Hello from generated preview.</p>
    <button type="button">Go</button>
    <a href="#x">Link</a>
    <section id="x"><h2>More</h2><p>Content</p></section>
  </main>
</body>
</html>`;

describe("tell_proof_verify preview input", () => {
  it("rejects patch + previewHtml together", async () => {
    await expect(
      handleProofVerify({
        url: "http://127.0.0.1:3999/",
        patch: "diff --git a/x b/x\n",
        previewHtml: MINIMAL_PREVIEW,
      }),
    ).rejects.toThrow(/not both/);
  });

  it("rejects missing previewHtml and missing url+patch", async () => {
    await expect(handleProofVerify({})).rejects.toThrow(/previewHtml|url \+ patch/);
  });

  it("accepts previewHtml and returns mode preview (browserless)", async () => {
    const result = await handleProofVerify({ previewHtml: MINIMAL_PREVIEW });
    expect(result.mode).toBe("preview");
    expect(result.reverted).toBe(false);
    expect(result.proof.scoreDelta).toBe(0);
    // Honest no-before baseline: review unless a banned frame tell fails.
    expect(["review", "failed"]).toContain(result.status);
  });

  it("rejects preview HTML that fails the transfer-bytes budget before capture", async () => {
    const fat = MINIMAL_PREVIEW.replace(
      "</body>",
      `<div>${"x".repeat(2_100 * 1024)}</div></body>`,
    );
    await expect(handleProofVerify({ previewHtml: fat })).rejects.toThrow(/budget|transfer-bytes/i);
  });
});
