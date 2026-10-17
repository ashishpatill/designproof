import { afterEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDesignDoc, shouldApplyDesignDoc } from "./load-design-doc";
import { buildFingerprint } from "./fingerprint/build-fingerprint";
import { detectDesignSystemDrift, parseDesignTokens } from "./detectors/design-system-drift";
import { CapturePayload } from "@tell/schema";

const repoTokensPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../design-tokens.json");

describe("shouldApplyDesignDoc", () => {
  it("applies only for Tell-owned surfaces", () => {
    expect(shouldApplyDesignDoc("http://localhost:3000")).toBe(true);
    expect(shouldApplyDesignDoc("http://127.0.0.1:3000/report/abc")).toBe(true);
    expect(shouldApplyDesignDoc("https://tell-five.vercel.app")).toBe(true);
    expect(shouldApplyDesignDoc("http://localhost:3001")).toBe(false);
    expect(shouldApplyDesignDoc("https://superlearnai.com")).toBe(false);
    expect(shouldApplyDesignDoc("not-a-url")).toBe(false);
  });
});

describe("loadDesignDoc", () => {
  let tmpDir: string | undefined;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it("reads design tokens on a fresh clone without DESIGN.md", async () => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), "tell-tokens-"));
    writeFileSync(path.join(tmpDir, "design-tokens.json"), readFileSync(repoTokensPath, "utf8"));
    expect(existsSync(path.join(tmpDir, "DESIGN.md"))).toBe(false);

    const spec = await loadDesignDoc(tmpDir);
    expect(spec?.source).toBe("design-tokens.json");
    expect(spec?.fonts).toContain("Instrument Serif");
    expect(spec?.colors).toContain("#D4714A");

    const capture = CapturePayload.parse({
      url: "http://localhost:3000",
      capturedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 1100 },
      screenshotBase64: "a",
      styles: [{
        selector: "button", tellId: "t0", tag: "button", role: "button",
        fontFamily: '"Comic Sans MS", cursive', fontSize: "16px", fontWeight: "400",
        color: "rgb(255,0,0)", backgroundColor: "rgb(0,0,0)", borderRadius: "8px",
        boxShadow: "none", padding: "8px", textAlign: "left", lineHeight: "1.5", backgroundImage: "none",
      }],
      probes: [],
      domSummary: { headingCount: 1, buttonCount: 1, centeredBlockRatio: 0.1, emojiInUiCount: 0 },
    });
    const fingerprint = buildFingerprint(capture);
    const finding = detectDesignSystemDrift(fingerprint, spec);
    expect(finding?.id).toBe("drift-design-system");
    expect(finding?.facts.source).toBe("design-tokens.json");
  });

  it("repo-root design-tokens.json declares the fonts and colours", () => {
    const spec = parseDesignTokens(readFileSync(repoTokensPath, "utf8"));
    expect(spec.fonts).toHaveLength(3);
    expect(spec.colors).toHaveLength(12);
  });
});
