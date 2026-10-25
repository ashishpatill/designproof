import { describe, expect, it, vi } from "vitest";
import { CapturePayload } from "@tell/schema";

/**
 * Browserless CI (`pnpm test` in the verify job) does not install Playwright
 * browsers. Stub captureUrl so verifyProofPreview still exercises listen →
 * diagnose → proof (scoreDelta 0 → review ceiling) without launching Chromium.
 * Real-browser capture: PLAYWRIGHT=1 pnpm exec vitest run … (optional below).
 */
vi.mock("../capture/capture-url", () => ({
  captureUrl: vi.fn(async (url: string) =>
    CapturePayload.parse({
      url,
      capturedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 1100 },
      // Non-trivial base64 so persistScreenshots / screenshot assertions stay meaningful.
      screenshotBase64: Buffer.from("preview-stub-screenshot-bytes-xxxxxxxx").toString("base64"),
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

import { listenPreviewHtml, verifyProofPreview } from "../proof-verify";

const MINIMAL_PREVIEW = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview proof fixture</title>
  <style>
    body { font-family: Georgia, serif; margin: 2rem; background: #faf6f0; color: #181614; }
    h1 { font-size: 2rem; }
    .card { padding: 1rem; border: 1px solid #ccc; max-width: 32rem; }
    button { padding: 0.5rem 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>Preview proof fixture</h1>
    <p class="card">Generated HTML under tell_proof_verify preview mode.</p>
    <button type="button">Primary action</button>
    <nav><a href="#more">More</a></nav>
    <section id="more"><h2>Details</h2><p>Second block for capture probes.</p></section>
  </main>
</body>
</html>`;

describe("listenPreviewHtml", () => {
  it("serves the document on an ephemeral 127.0.0.1 port", async () => {
    const { url, close } = await listenPreviewHtml("<html><body>ok</body></html>");
    try {
      expect(url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/);
      const res = await fetch(url);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/text\/html/);
      expect(await res.text()).toContain("ok");
    } finally {
      await close();
    }
  });
});

describe("verifyProofPreview", () => {
  it("routes generated HTML through preview mode without a patch (browserless)", async () => {
    const result = await verifyProofPreview({ previewHtml: MINIMAL_PREVIEW });
    expect(result.mode).toBe("preview");
    expect(result.previewUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);
    expect(result.reverted).toBe(false);
    expect(result.proof.scoreDelta).toBe(0);
    expect(result.proof.url).toBe(result.previewUrl);
    expect(result.afterReport.capture.screenshotBase64.length).toBeGreaterThan(20);
    // No before baseline → honest ceiling is review unless a gate ban fires.
    expect(["review", "failed"]).toContain(result.status);
    if (result.status === "failed") {
      expect(result.proof.bannedTellsAfter.length).toBeGreaterThan(0);
    }
  });

  it("rejects empty previewHtml", async () => {
    await expect(verifyProofPreview({ previewHtml: "   " })).rejects.toThrow(/previewHtml is required/);
  });

  it.skipIf(!process.env.PLAYWRIGHT)(
    "integration: real Chromium capture when PLAYWRIGHT=1",
    async () => {
      const { captureUrl } = await vi.importActual<typeof import("../capture/capture-url")>(
        "../capture/capture-url",
      );
      // Smoke that browsers exist; full verifyProofPreview still uses the mock above.
      const { url, close } = await listenPreviewHtml(MINIMAL_PREVIEW);
      try {
        const capture = await captureUrl(url);
        expect(capture.screenshotBase64.length).toBeGreaterThan(100);
      } finally {
        await close();
      }
    },
    60_000,
  );
});
