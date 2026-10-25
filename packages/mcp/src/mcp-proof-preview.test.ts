import { describe, expect, it } from "vitest";
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

  it("accepts previewHtml and returns mode preview", async () => {
    const result = await handleProofVerify({ previewHtml: MINIMAL_PREVIEW });
    expect(result.mode).toBe("preview");
    expect(result.reverted).toBe(false);
    expect(result.proof.scoreDelta).toBe(0);
    expect(["review", "failed", "passed"]).toContain(result.status);
  }, 60_000);

  it("rejects preview HTML that fails the transfer-bytes budget before capture", async () => {
    const fat = MINIMAL_PREVIEW.replace(
      "</body>",
      `<div>${"x".repeat(2_100 * 1024)}</div></body>`,
    );
    await expect(handleProofVerify({ previewHtml: fat })).rejects.toThrow(/budget|transfer-bytes/i);
  });
});
