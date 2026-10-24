import { CapturePayload, Finding, type FirstFold } from "@tell/schema";
import { fixHintFor } from "./tells-registry";

/**
 * Frame / multi-width tells.
 *
 * These read rendered boxes and first-fold samples only — no screenshot decoding,
 * no model calls. Every threshold is documented in the fixture tests
 * (`packages/core/src/__tests__/detectors-frame.test.ts`).
 */

type Rect = { x: number; y: number; w: number; h: number };

const CONTENT_ROLES = new Set(["display", "heading", "body", "button", "card", "input", "link", "nav"]);

/** Roles that carry a reading block rather than a container. */
const READING_ROLES = new Set(["display", "heading", "body", "button", "card", "input", "link"]);

const clampRegion = (rect: Rect): Rect => ({
  x: Math.max(0, Math.round(rect.x)),
  y: Math.max(0, Math.round(rect.y)),
  w: Math.max(1, Math.round(rect.w)),
  h: Math.max(1, Math.round(rect.h)),
});

function contentRects(capture: CapturePayload): Array<Rect & { role: string; selector: string }> {
  return capture.styles.flatMap((style) => {
    if (!style.rect) return [];
    const { x, y, w, h } = style.rect;
    if (w <= 0 || h <= 0) return [];
    if (!CONTENT_ROLES.has(style.role)) return [];
    return [{ x, y, w, h, role: style.role, selector: style.selector }];
  });
}

function foldOf(capture: CapturePayload): FirstFold | undefined {
  return capture.fold;
}

/**
 * TitleOnFoldTell — the primary title must be readable on the first screen.
 * Fires when the title starts below the fold, or is cut by the fold line.
 */
function detectTitleOnFold(capture: CapturePayload): Finding | null {
  const fold = foldOf(capture);
  if (!fold || fold.foldHeight <= 0 || fold.titleTopY < 0) return null;

  const position = fold.titleTopY >= fold.foldHeight
    ? "below-fold"
    : fold.titleBottomY > fold.foldHeight
      ? "cropped-by-fold"
      : null;
  if (!position) return null;

  const region = clampRegion({
    x: 0,
    y: 0,
    w: capture.viewport.width,
    h: Math.min(fold.foldHeight, Math.max(240, fold.titleBottomY)),
  });

  return Finding.parse({
    id: "tell-title-on-fold",
    family: "tell",
    detector: "TitleOnFoldTell",
    verdictHint: "generic",
    severity: "high",
    facts: {
      position,
      titleTopY: fold.titleTopY,
      titleBottomY: fold.titleBottomY,
      titleFontPx: fold.titleFontPx,
      foldHeight: fold.foldHeight,
      viewportWidth: capture.viewport.width,
    },
    evidence: [
      {
        kind: "computed",
        label: "Primary title vs fold",
        value:
          position === "below-fold"
            ? `Title starts at ${fold.titleTopY}px, fold ends at ${fold.foldHeight}px`
            : `Title box ${fold.titleTopY}–${fold.titleBottomY}px is cut by the ${fold.foldHeight}px fold`,
      },
      {
        kind: "screenshot-region",
        label: "First screen",
        value: `First screen at ${capture.viewport.width}×${fold.foldHeight}`,
        region,
      },
    ],
    fixHint: fixHintFor("TitleOnFoldTell"),
  });
}

/**
 * FrameGutterTell — every wide band resolves to one centred column with equal
 * side margins, so the page never composes with its frame.
 * A tall full-bleed band counts as counter-evidence (the frame was used).
 */
function detectFrameGutter(capture: CapturePayload): Finding | null {
  const vw = capture.viewport.width;
  const foldHeight = capture.fold?.foldHeight ?? capture.viewport.height;
  if (vw <= 0) return null;

  const wide = contentRects(capture).filter((rect) => rect.w >= vw * 0.5 && rect.w <= vw + 2);
  const fullBleed = wide.filter(
    (rect) => rect.x <= 2 && vw - (rect.x + rect.w) <= 2 && rect.h >= foldHeight * 0.3,
  );
  const column = wide.filter((rect) => !(rect.x <= 2 && vw - (rect.x + rect.w) <= 2));
  if (column.length < 3) return null;

  const bucketOf = (rect: Rect) => {
    const left = Math.round(rect.x / 2) * 2;
    const right = Math.round((vw - rect.x - rect.w) / 2) * 2;
    return { key: `${left}:${right}`, left, right };
  };
  const buckets = new Map<string, Array<{ left: number; right: number; rect: Rect & { selector: string } }>>();
  for (const rect of column) {
    const bucket = bucketOf(rect);
    const list = buckets.get(bucket.key) ?? [];
    list.push({ left: bucket.left, right: bucket.right, rect });
    buckets.set(bucket.key, list);
  }

  const dominant = [...buckets.values()].sort((a, b) => b.length - a.length)[0]!;
  const denominator = column.length + fullBleed.length;
  const ratio = dominant.length / denominator;
  const gutterLeft = dominant[0]!.left;
  const gutterRight = dominant[0]!.right;
  const gutterFloor = Math.max(12, vw * 0.04);
  const gutterCeiling = vw * 0.32;
  const symmetric = Math.abs(gutterLeft - gutterRight) <= 8;

  if (ratio < 0.8) return null;
  if (!symmetric) return null;
  if (gutterLeft < gutterFloor || gutterLeft > gutterCeiling) return null;

  const sample = dominant[0]!.rect;

  return Finding.parse({
    id: "tell-frame-gutter",
    family: "tell",
    detector: "FrameGutterTell",
    verdictHint: "generic",
    severity: "medium",
    facts: {
      dominantGutterLeft: gutterLeft,
      dominantGutterRight: gutterRight,
      wideBands: column.length,
      fullBleedBands: fullBleed.length,
      shareOnColumn: Number(ratio.toFixed(2)),
      viewportWidth: vw,
      selector: sample.selector,
    },
    evidence: [
      {
        kind: "computed",
        label: "Equal side margins",
        value: `${dominant.length} of ${denominator} wide bands sit in a ${gutterLeft}px / ${gutterRight}px centred column`,
      },
      {
        kind: "screenshot-region",
        label: "Frame boundary",
        value: `Band at ${Math.round(sample.x)},${Math.round(sample.y)} ${Math.round(sample.w)}×${Math.round(sample.h)}`,
        region: clampRegion(sample),
        selector: sample.selector,
      },
    ],
    fixHint: fixHintFor("FrameGutterTell"),
  });
}

/**
 * BlankStretchTell — a dead vertical band between two content runs, taller than
 * half a screen. Reads merged reading-block spans so nests do not inflate gaps.
 */
function detectBlankStretch(capture: CapturePayload): Finding | null {
  const foldHeight = capture.fold?.foldHeight ?? capture.viewport.height;
  if (foldHeight <= 0) return null;

  const spans = capture.styles.flatMap((style) => {
    if (!style.rect) return [];
    const { y, h, w } = style.rect;
    if (h <= 0) return [];
    const reading = READING_ROLES.has(style.role);
    // A section band (full-bleed plate, feature band) is content too — but a
    // page-tall `main`/`body` wrapper is a container, not a rest.
    const band = style.role === "surface" && h <= foldHeight * 1.5 && w >= capture.viewport.width * 0.5;
    return reading || band ? [{ start: y, end: y + h }] : [];
  });
  if (spans.length < 4) return null;

  spans.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.start <= last.end + 2) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }

  const gapFloor = Math.max(320, foldHeight * 0.55);
  const gaps: Array<{ start: number; height: number }> = [];
  for (let i = 1; i < merged.length; i += 1) {
    const gap = merged[i]!.start - merged[i - 1]!.end;
    if (gap >= gapFloor) gaps.push({ start: Math.round(merged[i - 1]!.end), height: Math.round(gap) });
  }
  if (gaps.length === 0) return null;

  const largest = gaps.reduce((a, b) => (b.height > a.height ? b : a));
  const severe = largest.height >= foldHeight;

  return Finding.parse({
    id: "tell-blank-stretch",
    family: "tell",
    detector: "BlankStretchTell",
    verdictHint: "generic",
    severity: severe ? "high" : "medium",
    facts: {
      foldHeight,
      gapFloor: Math.round(gapFloor),
      gaps: gaps.slice(0, 5),
      largestGapPx: largest.height,
    },
    evidence: [
      {
        kind: "computed",
        label: "Dead vertical bands",
        value: gaps
          .slice(0, 3)
          .map((gap) => `${gap.height}px gap after y=${gap.start}`)
          .join("; "),
      },
      {
        kind: "screenshot-region",
        label: "Blank stretch",
        value: `${largest.height}px with no reading content`,
        region: clampRegion({ x: 0, y: largest.start, w: capture.viewport.width, h: largest.height }),
      },
    ],
    fixHint: fixHintFor("BlankStretchTell"),
  });
}

/**
 * MobileFirstScreenTell — the phone first screen must be composed for the phone,
 * not the desktop hero squeezed. Compares the mobile fold against desktop when
 * a desktop fold exists; structural checks (title, overflow) work alone.
 */
function detectMobileFirstScreen(capture: CapturePayload): Finding | null {
  const mobileEntry = capture.viewportMatrix.find((entry) => entry.preset === "mobile");
  const mobileFold = mobileEntry?.fold ?? (capture.viewport.width <= 430 ? capture.fold : undefined);
  if (!mobileFold || mobileFold.foldHeight <= 0) return null;

  const mobileWidth = mobileEntry?.width ?? capture.viewport.width;
  const desktopFold =
    capture.viewportMatrix.find((entry) => entry.preset === "desktop")?.fold ??
    (capture.viewport.width > 900 ? capture.fold : undefined);

  const reasons: Array<{ code: string; severity: "high" | "medium"; detail: string }> = [];

  if (mobileFold.titleTopY >= mobileFold.foldHeight) {
    reasons.push({
      code: "title-below-fold",
      severity: "high",
      detail: `Title starts at ${mobileFold.titleTopY}px, fold ends at ${mobileFold.foldHeight}px`,
    });
  } else if (mobileFold.titleTopY >= 0 && mobileFold.titleBottomY > mobileFold.foldHeight) {
    reasons.push({
      code: "title-cropped",
      severity: "high",
      detail: `Title box ${mobileFold.titleTopY}–${mobileFold.titleBottomY}px is cut by the ${mobileFold.foldHeight}px fold`,
    });
  }

  if (mobileFold.overflowXPx > 4) {
    reasons.push({
      code: "horizontal-overflow",
      severity: "high",
      detail: `Phone first screen overflows by ${mobileFold.overflowXPx}px — the desktop composition did not reflow`,
    });
  }

  if (desktopFold && desktopFold.textChars >= 80 && mobileFold.textChars < Math.max(24, desktopFold.textChars * 0.25)) {
    reasons.push({
      code: "text-starved",
      severity: "medium",
      detail: `Phone fold carries ${mobileFold.textChars} characters vs ${desktopFold.textChars} on desktop`,
    });
  }

  if (mobileFold.mediaAreaRatio >= 0.7 && mobileFold.textChars < 60) {
    reasons.push({
      code: "image-only-fold",
      severity: "medium",
      detail: `Media covers ${Math.round(mobileFold.mediaAreaRatio * 100)}% of the phone fold with ${mobileFold.textChars} characters of text`,
    });
  }

  if (desktopFold && desktopFold.largestTextPx >= 32 && mobileFold.largestTextPx > 0 && mobileFold.largestTextPx < 20) {
    reasons.push({
      code: "display-type-lost",
      severity: "medium",
      detail: `Phone fold's largest type is ${mobileFold.largestTextPx}px vs ${desktopFold.largestTextPx}px on desktop`,
    });
  }

  if (reasons.length === 0) return null;
  const severe = reasons.some((reason) => reason.severity === "high");

  return Finding.parse({
    id: "tell-mobile-first-screen",
    family: "tell",
    detector: "MobileFirstScreenTell",
    verdictHint: "generic",
    severity: severe ? "high" : "medium",
    facts: {
      mobile: {
        width: mobileWidth,
        foldHeight: mobileFold.foldHeight,
        textChars: mobileFold.textChars,
        headingCount: mobileFold.headingCount,
        buttonCount: mobileFold.buttonCount,
        mediaAreaRatio: mobileFold.mediaAreaRatio,
        largestTextPx: mobileFold.largestTextPx,
        overflowXPx: mobileFold.overflowXPx,
      },
      desktop: desktopFold
        ? {
            foldHeight: desktopFold.foldHeight,
            textChars: desktopFold.textChars,
            headingCount: desktopFold.headingCount,
            largestTextPx: desktopFold.largestTextPx,
          }
        : null,
      reasons,
    },
    evidence: [
      {
        kind: "computed",
        label: "Phone first screen",
        value: reasons.map((reason) => reason.code).join(", "),
      },
      ...reasons.slice(0, 3).map((reason) => ({
        kind: "probe" as const,
        label: `Mobile: ${reason.code}`,
        value: reason.detail,
      })),
      {
        kind: "screenshot-region",
        label: "Phone fold",
        value: `${mobileWidth}×${mobileFold.foldHeight} first screen`,
        region: clampRegion({ x: 0, y: 0, w: mobileWidth, h: mobileFold.foldHeight }),
      },
    ],
    fixHint: fixHintFor("MobileFirstScreenTell"),
  });
}

/** All frame / first-screen tells for one capture. Order is stable. */
export function detectFrameFindings(capture: CapturePayload): Finding[] {
  return [
    detectTitleOnFold(capture),
    detectFrameGutter(capture),
    detectBlankStretch(capture),
    detectMobileFirstScreen(capture),
  ].filter((finding): finding is Finding => finding !== null);
}
