import { describe, expect, it } from "vitest";
import { CapturePayload, type ComputedStyleSample, type FirstFold } from "@tell/schema";
import { buildFingerprint } from "../fingerprint/build-fingerprint";
import { detectFindings } from "../detectors";
import { detectFrameFindings } from "../detectors/frame";
import { TELLS_REGISTRY, fixHintFor } from "../detectors/tells-registry";

const tiny = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

type StyleInput = Partial<ComputedStyleSample> & Pick<ComputedStyleSample, "role">;

function style(input: StyleInput): ComputedStyleSample {
  return {
    selector: "p.sample",
    tellId: "t0",
    tag: "p",
    fontFamily: "Georgia, serif",
    fontSize: "16px",
    fontWeight: "400",
    color: "rgb(30,30,30)",
    backgroundColor: "rgb(250,250,250)",
    borderRadius: "0px",
    boxShadow: "none",
    padding: "16px",
    textAlign: "left",
    lineHeight: "1.5",
    backgroundImage: "none",
    ...input,
  } as ComputedStyleSample;
}

function block(role: StyleInput["role"], x: number, y: number, w: number, h: number, selector = "div.band"): ComputedStyleSample {
  return style({ role, selector, tag: "div", rect: { x, y, w, h } });
}

function fold(overrides: Partial<FirstFold> = {}): FirstFold {
  return {
    foldHeight: 1100,
    textChars: 620,
    headingCount: 2,
    buttonCount: 1,
    mediaAreaRatio: 0.12,
    largestTextPx: 64,
    titleTopY: 96,
    titleBottomY: 260,
    titleFontPx: 64,
    overflowXPx: 0,
    ...overrides,
  };
}

function capture(input: {
  styles: ComputedStyleSample[];
  fold?: FirstFold;
  viewport?: { width: number; height: number };
  viewportMatrix?: Array<{ preset: "desktop" | "tablet" | "mobile"; width: number; height: number; fold?: FirstFold }>;
}): CapturePayload {
  return CapturePayload.parse({
    url: "http://localhost:3000/",
    capturedAt: "2026-10-24T00:00:00.000Z",
    viewport: input.viewport ?? { width: 1440, height: 1100 },
    screenshotBase64: tiny,
    styles: input.styles,
    probes: [],
    fold: input.fold,
    viewportMatrix: (input.viewportMatrix ?? []).map((entry) => ({
      preset: entry.preset,
      width: entry.width,
      height: entry.height,
      screenshotBase64: tiny,
      fold: entry.fold,
      domSummary: { headingCount: 6, buttonCount: 4, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
    })),
    domSummary: { headingCount: 6, buttonCount: 4, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
  });
}

describe("TitleOnFoldTell", () => {
  it("fails a capture whose title starts below the fold", () => {
    const page = capture({ styles: [], fold: fold({ titleTopY: 1180, titleBottomY: 1246 }) });
    const finding = detectFrameFindings(page).find((f) => f.detector === "TitleOnFoldTell");
    expect(finding).toBeTruthy();
    expect(finding!.id).toBe("tell-title-on-fold");
    expect(finding!.severity).toBe("high");
    expect(finding!.facts.position).toBe("below-fold");
    expect(finding!.evidence.some((e) => e.kind === "screenshot-region" && e.region)).toBe(true);
    expect(finding!.fixHint).toBe(fixHintFor("TitleOnFoldTell"));
    expect(finding!.fixHint).not.toMatch(/Inter|#8B5CF6|font-family:/i);
  });

  it("fails a capture whose title is cut by the fold", () => {
    const page = capture({ styles: [], fold: fold({ titleTopY: 940, titleBottomY: 1160 }) });
    const finding = detectFrameFindings(page).find((f) => f.detector === "TitleOnFoldTell");
    expect(finding?.facts.position).toBe("cropped-by-fold");
    expect(finding?.severity).toBe("high");
  });

  it("passes a first screen with the title fully above the fold", () => {
    const page = capture({ styles: [], fold: fold() });
    expect(detectFrameFindings(page).some((f) => f.detector === "TitleOnFoldTell")).toBe(false);
  });

  it("stays silent when the capture has no fold sample (older fixtures)", () => {
    const page = capture({ styles: [] });
    expect(detectFrameFindings(page).some((f) => f.detector === "TitleOnFoldTell")).toBe(false);
  });
});

describe("FrameGutterTell", () => {
  const centred = [
    block("heading", 200, 80, 1040, 120),
    block("body", 200, 260, 1040, 90),
    block("body", 200, 380, 1040, 90),
    block("card", 200, 500, 1040, 220),
    block("body", 200, 760, 1040, 90),
    block("body", 200, 900, 1040, 90),
    block("button", 200, 1030, 1040, 44),
  ];

  it("fails a page where every wide band is one centred column", () => {
    const page = capture({ styles: centred, fold: fold() });
    const finding = detectFrameFindings(page).find((f) => f.detector === "FrameGutterTell");
    expect(finding).toBeTruthy();
    expect(finding!.id).toBe("tell-frame-gutter");
    expect(finding!.severity).toBe("medium");
    expect(finding!.facts.dominantGutterLeft).toBe(200);
    expect(finding!.facts.shareOnColumn).toBe(1);
    expect(finding!.evidence.some((e) => e.kind === "screenshot-region")).toBe(true);
    expect(finding!.fixHint).toBe(fixHintFor("FrameGutterTell"));
  });

  it("passes a page that breaks the frame with an asymmetric band", () => {
    const page = capture({
      styles: [
        block("heading", 120, 80, 900, 120),
        block("body", 120, 260, 900, 90),
        block("body", 60, 380, 1200, 90),
        block("body", 60, 500, 1200, 90),
        block("surface", 0, 640, 1440, 420),
      ],
      fold: fold(),
    });
    expect(detectFrameFindings(page).some((f) => f.detector === "FrameGutterTell")).toBe(false);
  });
});

describe("BlankStretchTell", () => {
  it("fails a page with a dead band taller than half a screen", () => {
    const page = capture({
      styles: [
        block("heading", 200, 80, 1040, 120),
        block("body", 200, 220, 1040, 90),
        block("body", 200, 1200, 1040, 90),
        block("body", 200, 1310, 1040, 90),
        block("card", 200, 1420, 1040, 200),
      ],
      fold: fold(),
    });
    const finding = detectFrameFindings(page).find((f) => f.detector === "BlankStretchTell");
    expect(finding).toBeTruthy();
    expect(finding!.id).toBe("tell-blank-stretch");
    expect(finding!.severity).toBe("medium");
    expect(finding!.facts.largestGapPx).toBeGreaterThanOrEqual(600);
    expect(finding!.evidence.some((e) => e.kind === "screenshot-region")).toBe(true);
    expect(finding!.fixHint).toBe(fixHintFor("BlankStretchTell"));
  });

  it("passes a page whose reading blocks run continuously", () => {
    const page = capture({
      styles: Array.from({ length: 8 }, (_, i) => block("body", 200, 80 + i * 180, 1040, 120)),
      fold: fold(),
    });
    expect(detectFrameFindings(page).some((f) => f.detector === "BlankStretchTell")).toBe(false);
  });
});

describe("MobileFirstScreenTell", () => {
  const desktopFold = fold({ textChars: 620, largestTextPx: 64, titleTopY: 96, titleBottomY: 260 });

  it("fails a phone first screen that is the desktop hero squeezed", () => {
    const page = capture({
      styles: [],
      viewport: { width: 390, height: 844 },
      fold: fold({ foldHeight: 844 }),
      viewportMatrix: [
        {
          preset: "mobile",
          width: 390,
          height: 844,
          fold: fold({
            foldHeight: 844,
            textChars: 14,
            headingCount: 0,
            buttonCount: 0,
            largestTextPx: 16,
            titleTopY: 900,
            titleBottomY: 1010,
            overflowXPx: 22,
            mediaAreaRatio: 0.82,
          }),
        },
        { preset: "desktop", width: 1440, height: 1100, fold: desktopFold },
      ],
    });
    const finding = detectFrameFindings(page).find((f) => f.detector === "MobileFirstScreenTell");
    expect(finding).toBeTruthy();
    expect(finding!.id).toBe("tell-mobile-first-screen");
    expect(finding!.severity).toBe("high");
    const reasons = (finding!.facts.reasons as Array<{ code: string }>).map((r) => r.code);
    expect(reasons).toContain("title-below-fold");
    expect(reasons).toContain("horizontal-overflow");
    expect(reasons).toContain("text-starved");
    expect(reasons).toContain("image-only-fold");
    expect(finding!.evidence.some((e) => e.kind === "screenshot-region" && e.region?.w === 390)).toBe(true);
    expect(finding!.fixHint).toBe(fixHintFor("MobileFirstScreenTell"));
  });

  it("passes a phone first screen composed for the phone", () => {
    const page = capture({
      styles: [],
      viewport: { width: 390, height: 844 },
      fold: fold({ foldHeight: 844 }),
      viewportMatrix: [
        {
          preset: "mobile",
          width: 390,
          height: 844,
          fold: fold({
            foldHeight: 844,
            textChars: 280,
            headingCount: 1,
            buttonCount: 1,
            largestTextPx: 34,
            titleTopY: 72,
            titleBottomY: 220,
            overflowXPx: 0,
            mediaAreaRatio: 0.2,
          }),
        },
        { preset: "desktop", width: 1440, height: 1100, fold: desktopFold },
      ],
    });
    expect(detectFrameFindings(page).some((f) => f.detector === "MobileFirstScreenTell")).toBe(false);
  });
});

describe("clean specimen", () => {
  const clean = capture({
    viewport: { width: 390, height: 844 },
    fold: fold({ foldHeight: 844, titleTopY: 72, titleBottomY: 220, largestTextPx: 34 }),
    styles: [
      // Asymmetric editorial column with one full-bleed plate.
      block("heading", 120, 80, 900, 120),
      block("body", 120, 220, 900, 90),
      block("body", 60, 340, 1200, 90),
      block("surface", 0, 460, 1440, 520),
      block("body", 60, 1010, 1200, 90),
      block("body", 120, 1130, 900, 90),
    ],
    viewportMatrix: [
      {
        preset: "mobile",
        width: 390,
        height: 844,
        fold: fold({
          foldHeight: 844,
          textChars: 280,
          headingCount: 1,
          buttonCount: 1,
          largestTextPx: 34,
          titleTopY: 72,
          titleBottomY: 220,
        }),
      },
      { preset: "desktop", width: 1440, height: 1100, fold: fold() },
    ],
  });

  it("reports zero new frame tells on a composed specimen", () => {
    expect(detectFrameFindings(clean)).toEqual([]);
  });

  it("still runs through the existing diagnose path", () => {
    const detectors = detectFindings(buildFingerprint(clean), clean).map((f) => f.detector);
    expect(detectors).not.toContain("TitleOnFoldTell");
    expect(detectors).not.toContain("MobileFirstScreenTell");
  });
});

describe("dated tells registry", () => {
  it("dates every frame tell and enforces only the bans", () => {
    const frame = TELLS_REGISTRY.filter((entry) =>
      ["TitleOnFoldTell", "FrameGutterTell", "BlankStretchTell", "MobileFirstScreenTell"].includes(entry.detector),
    );
    expect(frame).toHaveLength(4);
    for (const entry of frame) {
      expect(entry.since).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.fixProcedure.length).toBeGreaterThan(20);
      expect(entry.fixProcedure).not.toMatch(/use .*(font|colour|color|#)[^.]*instead/i);
    }
    expect(frame.filter((entry) => entry.status === "ban").map((entry) => entry.detector).sort()).toEqual([
      "MobileFirstScreenTell",
      "TitleOnFoldTell",
    ]);
    expect(frame.filter((entry) => entry.enforcedInProof).map((entry) => entry.detector).sort()).toEqual([
      "MobileFirstScreenTell",
      "TitleOnFoldTell",
    ]);
  });

  it("covers every tell detector with a registry row", () => {
    const registered = new Set(TELLS_REGISTRY.map((entry) => entry.detector));
    expect(registered.size).toBe(TELLS_REGISTRY.length);
    expect(registered.has("SystemFontTell")).toBe(true);
    expect(registered.has("BlankStretchTell")).toBe(true);
  });
});
