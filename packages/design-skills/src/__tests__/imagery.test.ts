import { describe, expect, it } from "vitest";
import {
  MediaAsset,
  approveGatedStage,
  approveStage,
  createStagedRun,
  designFromFeatures,
  imageryGate,
  measureImageryHtml,
  planImagery,
  runVisualSwapTest,
  stageGate,
  visualSwapTest,
  STAGED_STAGES,
  type VisualSignature,
} from "../index";
import { DesignBrief } from "../types";

const FEATURES = [
  { id: "f1", name: "Ledger reconciliation", description: "Match every bank line to a ledger entry", priority: "p0" },
  { id: "f2", name: "Approval routing", description: "Route spend approvals to the right owner", priority: "p1" },
  { id: "f3", name: "Audit export", description: "Export a signed audit trail", priority: "p2" },
] as const;

function asset(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    src: `https://assets.example.com/${id}.jpg`,
    licence: "Client-owned",
    alt: `Photograph ${id}`,
    width: 2400,
    height: 1350,
    ...extra,
  };
}

function brief(extra: Record<string, unknown> = {}) {
  return DesignBrief.parse({
    productName: "Tallyhouse",
    tagline: "Close the books in a day",
    audience: "finance leads",
    siteKind: "saas-marketing",
    lockSiteKind: true,
    features: FEATURES,
    ...extra,
  });
}

describe("MediaAsset schema", () => {
  it("rejects SVG as imagery", () => {
    expect(() => MediaAsset.parse(asset("a", { src: "https://x.example.com/fig.svg" }))).toThrow(/SVG/);
    expect(() => MediaAsset.parse(asset("a", { src: "data:image/svg+xml;base64,AAAA" }))).toThrow();
  });

  it("rejects attribute-breaking or insecure sources", () => {
    expect(() => MediaAsset.parse(asset("a", { src: 'https://x.example.com/a.jpg" onerror="x' }))).toThrow();
    expect(() => MediaAsset.parse(asset("a", { src: "http://x.example.com/a.jpg" }))).toThrow();
    expect(() => MediaAsset.parse(asset("a", { src: "javascript:alert(1)" }))).toThrow();
  });

  it("requires alt unless decorative, and a poster for video / 3D", () => {
    expect(() => MediaAsset.parse(asset("a", { alt: "" }))).toThrow(/alt/);
    expect(MediaAsset.parse(asset("a", { alt: "", decorative: true })).decorative).toBe(true);
    expect(() => MediaAsset.parse(asset("v", { kind: "video", src: "https://x.example.com/v.mp4" }))).toThrow(/poster/);
  });
});

describe("planImagery", () => {
  it("places nothing and reports the fold gap when the brief has no assets", () => {
    const { spec, previewHtml } = designFromFeatures(brief());
    expect(spec.imagery?.heroHasMedia).toBe(false);
    expect(spec.imagery?.rasterSlots).toBe(0);
    expect(spec.imagery?.gaps.join(" ")).toMatch(/Fold has no real media/);
    expect(spec.sections.every((s) => !s.media)).toBe(true);
    expect(measureImageryHtml(previewHtml).rasterCount).toBe(0);
  });

  it("puts the explicit hero asset on the fold and never cycles an asset", () => {
    const b = brief({
      assets: [
        asset("wide-a"),
        asset("hero-shot", { preferredRole: "hero", width: 1200, height: 1600 }),
        asset("ledger", { subject: "ledger reconciliation bank lines" }),
      ],
    });
    const { spec, previewHtml } = designFromFeatures(b);
    const hero = spec.sections.find((s) => s.kind === "hero");
    expect(hero?.media?.[0]?.asset.id).toBe("hero-shot");
    expect(spec.imagery?.heroHasMedia).toBe(true);
    const ids = spec.imagery?.placed.map((p) => p.assetId) ?? [];
    expect(new Set(ids).size).toBe(ids.length);
    const bands = measureImageryHtml(previewHtml);
    expect(bands.heroHasMedia).toBe(true);
    expect(bands.duplicateSrcs).toEqual([]);
    expect(previewHtml).toContain('fetchpriority="high"');
    expect(previewHtml).not.toContain("Tallyhouse — illustrative");
  });

  it("matches a subject-tagged asset to the section that names it", () => {
    const b = brief({ assets: [asset("fold"), asset("approvals", { subject: "approval routing spend owner" })] });
    const sections = designFromFeatures(brief()).spec.sections;
    const result = planImagery(sections, b);
    const placed = result.plan.placed.find((p) => p.assetId === "approvals");
    expect(placed).toBeDefined();
    expect(placed?.reason).toMatch(/subject matches/);
  });

  it("emits explicit dimensions and focal point for placed media", () => {
    const b = brief({ assets: [asset("fold", { focalPoint: { x: 0.25, y: 0.7 } })] });
    const { previewHtml } = designFromFeatures(b);
    expect(previewHtml).toMatch(/width="2400" height="1350"/);
    expect(previewHtml).toContain("object-position:25% 70%");
  });
});

describe("imagery stage gate", () => {
  it("blocks approval when the fold is a drawing", () => {
    const { previewHtml } = designFromFeatures(brief());
    const report = imageryGate(previewHtml);
    expect(report.passed).toBe(false);
    expect(report.findings.find((f) => f.id === "hero-media")?.ok).toBe(false);
    expect(report.bands.creditedFigures).toBeLessThanOrEqual(2);
  });

  it("passes with a real fold asset and warns below the raster minimum", () => {
    const { previewHtml } = designFromFeatures(brief({ assets: [asset("fold")] }));
    const gate = stageGate("imagery", { previewHtml });
    expect(gate.passed).toBe(true);
    expect(gate.warnings.join(" ")).toMatch(/raster-slots/);
  });

  it("approveGatedStage refuses an imagery stage with no fold media", () => {
    let run = createStagedRun();
    for (const id of STAGED_STAGES.slice(0, STAGED_STAGES.indexOf("imagery"))) run = approveStage(run, id);
    const { previewHtml } = designFromFeatures(brief());
    expect(() => approveGatedStage(run, "imagery", { previewHtml })).toThrow(/hero-media/);
    const ok = designFromFeatures(brief({ assets: [asset("fold")] })).previewHtml;
    const next = approveGatedStage(run, "imagery", { previewHtml: ok });
    expect(next.stages.find((s) => s.id === "imagery")?.status).toBe("approved");
  });

  it("refinement gate requires a passing visual swap result", () => {
    const { previewHtml } = designFromFeatures(brief());
    expect(stageGate("refinement", { previewHtml }).passed).toBe(false);
    const failing = stageGate("refinement", {
      previewHtml,
      visualSwap: { passed: false, changedRatio: 0.1, reasons: ["layout-sequence survived the swap"] },
    });
    expect(failing.blocking.join(" ")).toMatch(/visual swap test failed/);
  });
});

describe("visual swap test", () => {
  const base: VisualSignature = {
    layoutSequence: ["nav", "hero-split", "feature-bento", "cta-band"],
    heroLayout: "hero-split",
    figureKinds: ["interface", "flow"],
    mediaSrcs: [],
    typePairing: "Fraunces|Inter",
    palette: "#fff #123 #000",
  };

  it("fails a palette-only change", () => {
    const r = visualSwapTest(base, { ...base, palette: "#fafafa #c50 #111" });
    expect(r.passed).toBe(false);
    expect(r.changedRatio).toBe(0);
    expect(r.paletteOnly).toBe(true);
    expect(r.reasons.join(" ")).toMatch(/palette swap is not a redesign/);
  });

  it("passes when composition, figures and imagery all follow the brief", () => {
    const r = visualSwapTest(base, {
      layoutSequence: ["nav", "hero-folio", "story-chapters", "story-marginalia", "footer-columns"],
      heroLayout: "hero-folio",
      figureKinds: ["dossier"],
      mediaSrcs: ["https://a.example.com/x.jpg"],
      typePairing: "Fraunces|Inter",
      palette: base.palette,
    });
    expect(r.passed).toBe(true);
    expect(r.changedRatio).toBeGreaterThanOrEqual(0.5);
  });

  it("reports honestly that same-kind briefs share one skeleton today", () => {
    const report = runVisualSwapTest(brief());
    expect(report.dimensions.find((d) => d.id === "layout-sequence")?.changed).toBe(0);
    expect(report.passed).toBe(false);
    expect(report.reasons.length).toBeGreaterThan(0);
  });
});
