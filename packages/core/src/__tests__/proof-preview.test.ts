import { describe, expect, it } from "vitest";
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
  it("captures generated HTML and returns preview-mode proof without a patch", async () => {
    const result = await verifyProofPreview({ previewHtml: MINIMAL_PREVIEW });
    expect(result.mode).toBe("preview");
    expect(result.previewUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);
    expect(result.reverted).toBe(false);
    expect(result.proof.scoreDelta).toBe(0);
    expect(result.proof.url).toBe(result.previewUrl);
    expect(result.afterReport.capture.screenshotBase64.length).toBeGreaterThan(100);
    // No before baseline → honest ceiling is review unless a gate ban fires.
    expect(["review", "failed"]).toContain(result.status);
    if (result.status === "failed") {
      expect(result.proof.bannedTellsAfter.length).toBeGreaterThan(0);
    }
  }, 60_000);

  it("rejects empty previewHtml", async () => {
    await expect(verifyProofPreview({ previewHtml: "   " })).rejects.toThrow(/previewHtml is required/);
  });
});
