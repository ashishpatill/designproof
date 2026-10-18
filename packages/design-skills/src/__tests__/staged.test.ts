import { describe, expect, it } from "vitest";
import {
  STAGED_STAGES,
  createStagedRun,
  approveStage,
  rejectStage,
  assertStageCanRun,
  THEMES,
  getTheme,
  listThemes,
  applyTheme,
  applyThemeToBrief,
  deriveConcept,
  swapTest,
  buildSwappedBrief,
  PERFORMANCE_BUDGETS,
  checkPreviewBudgets,
  motionReviewFor,
  weightedReview,
  ConceptSpec,
  designFromFeatures,
} from "../index";
import { DesignBrief, TasteControls } from "../types";

function makeBrief(siteKind: string, productName: string) {
  return DesignBrief.parse({
    productName,
    tagline: "tag",
    audience: "buyers",
    businessGoal: "demos",
    siteKind,
    lockSiteKind: true,
    features: [
      { id: "f1", name: "Feature One", description: "desc one", priority: "p0" },
      { id: "f2", name: "Feature Two", description: "desc two", priority: "p1" },
    ],
  });
}

function approveAll(run: ReturnType<typeof createStagedRun>) {
  let r = run;
  for (const id of STAGED_STAGES) {
    r = approveStage(r, id);
  }
  return r;
}

describe("staged stages", () => {
  it("has the 8 stages in order", () => {
    expect(STAGED_STAGES).toEqual([
      "brief",
      "concepts",
      "moodboard",
      "art-direction",
      "imagery",
      "key-screen",
      "sections",
      "refinement",
    ]);
  });

  it("creates run with first stage in-review", () => {
    const run = createStagedRun();
    expect(run.stages[0].status).toBe("in-review");
    expect(run.stages.slice(1).every((s) => s.status === "pending")).toBe(true);
  });

  it("cannot run sections before brief approved", () => {
    const run = createStagedRun();
    expect(() => assertStageCanRun(run, "sections")).toThrow();
  });

  it("approve advances to next stage", () => {
    const run = createStagedRun();
    const next = approveStage(run, "brief");
    expect(next.stages.find((s) => s.id === "brief")?.status).toBe("approved");
    expect(next.stages.find((s) => s.id === "concepts")?.status).toBe("in-review");
    // immutable
    expect(run.stages.find((s) => s.id === "brief")?.status).toBe("in-review");
  });

  it("reject reruns only that stage and keeps earlier approvals", () => {
    let run = createStagedRun();
    run = approveStage(run, "brief");
    const before = run.stages.map((s) => ({ ...s }));
    const rejected = rejectStage(run, "concepts", "too generic");
    expect(rejected.stages.find((s) => s.id === "concepts")?.status).toBe("in-review");
    expect(rejected.stages.find((s) => s.id === "concepts")?.note).toBe("too generic");
    expect(rejected.stages.find((s) => s.id === "brief")?.status).toBe("approved");
    const later = rejected.stages.filter((s) => {
      const idx = STAGED_STAGES.indexOf(s.id);
      return idx > STAGED_STAGES.indexOf("concepts");
    });
    expect(later.every((s) => s.status === "pending")).toBe(true);
    // earlier unchanged
    expect(rejected.stages.find((s) => s.id === "brief")?.status).toBe(before.find((s) => s.id === "brief")?.status);
  });

  it("reject throws for non-current stage", () => {
    const run = createStagedRun();
    expect(() => rejectStage(run, "concepts", "x")).toThrow();
  });

  it("completing refinement finishes run", () => {
    const run = approveAll(createStagedRun());
    expect(run.stages.every((s) => s.status === "approved")).toBe(true);
  });
});

describe("themes", () => {
  it("has at least 6 themes", () => {
    expect(listThemes().length).toBeGreaterThanOrEqual(6);
  });

  it("getTheme works", () => {
    expect(getTheme("ink-paper")).toBeDefined();
    expect(getTheme("plum-press")?.brandAccent).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("applyTheme changes colorMood", () => {
    const taste = TasteControls.parse({});
    const theme = getTheme("nocturne-brass")!;
    const next = applyTheme(taste, theme);
    expect(next.colorMood).toBe(theme.colorMood);
    expect(taste.colorMood).not.toBe(theme.colorMood);
  });

  it("same theme for two different briefs gives same brandAccent", () => {
    const b1 = makeBrief("saas-marketing", "AlphaCo");
    const b2 = makeBrief("saas-marketing", "BetaCo");
    const t = getTheme("ink-paper")!;
    expect(t.brandAccent).toBe(getTheme("ink-paper")!.brandAccent);
    // applyTheme independent of product name
    const taste1 = TasteControls.parse(b1.taste ?? {});
    const taste2 = TasteControls.parse(b2.taste ?? {});
    expect(applyTheme(taste1, t).colorMood).toBe(applyTheme(taste2, t).colorMood);
  });
});

describe("concept", () => {
  it("has >=3 visible tests, includes productName, rejects non-empty", () => {
    const brief = makeBrief("saas-marketing", "Freightlane");
    const c = deriveConcept(brief);
    expect(c.visibleTests.length).toBeGreaterThanOrEqual(3);
    expect(c.oneLiner).toContain("Freightlane");
    expect(c.oneLiner).toContain(c.metaphor);
    expect(c.rejects.length).toBeGreaterThanOrEqual(2);
    expect(ConceptSpec.parse(c)).toBeTruthy();
  });

  it("differs between saas and dossier", () => {
    const saas = deriveConcept(makeBrief("saas-marketing", "Acme"));
    const dossier = deriveConcept(makeBrief("research-dossier", "Acme"));
    expect(saas.metaphor).not.toBe(dossier.metaphor);
  });
});

describe("swap test", () => {
  it("identical copies fail", () => {
    const brief = makeBrief("saas-marketing", "Acme");
    const c = deriveConcept(brief);
    const input = { concept: c, heroTitle: "Hello", bodyCopy: ["a", "b"] };
    const r = swapTest(input, { ...input, bodyCopy: [...input.bodyCopy] });
    expect(r.passed).toBe(false);
    expect(r.changedRatio).toBe(0);
  });

  it("fully changed copies pass", () => {
    const brief = makeBrief("saas-marketing", "Acme");
    const c = deriveConcept(brief);
    const swappedConcept = deriveConcept(makeBrief("saas-marketing", "Stranger Brand"));
    // force metaphor difference by using dossier concept
    const d = deriveConcept(makeBrief("research-dossier", "Stranger Brand"));
    const original = { concept: c, heroTitle: "Hello", bodyCopy: ["a", "b"] };
    const swapped = { concept: d, heroTitle: "Goodbye", bodyCopy: ["x", "y"] };
    const r = swapTest(original, swapped);
    expect(r.passed).toBe(true);
    expect(r.changedRatio).toBeGreaterThanOrEqual(0.5);
  });

  it("buildSwappedBrief changes name and features", () => {
    const brief = makeBrief("saas-marketing", "Acme");
    const swapped = buildSwappedBrief(brief);
    expect(swapped.productName).toBe("Stranger Brand");
    expect(swapped.tagline).toBe("Unrelated placeholder tagline");
    expect(swapped.features[0].name).toBe("Swapped feature 1");
    expect(swapped.features[0].description).toBe("Swapped description 1");
  });
});

describe("budgets", () => {
  it("small html passes bytes", () => {
    const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body>hi</body></html>';
    const r = checkPreviewBudgets(html);
    expect(r.findings.find((f) => f.id === "transfer-bytes")?.ok).toBe(true);
    expect(r.passed).toBe(true);
  });

  it("huge string fails bytes", () => {
    const html = "a".repeat(PERFORMANCE_BUDGETS.initialTransferKb * 1024 + 10);
    const r = checkPreviewBudgets(html);
    expect(r.findings.find((f) => f.id === "transfer-bytes")?.ok).toBe(false);
    expect(r.passed).toBe(false);
  });

  it("script count", () => {
    const many = "<script></script>".repeat(5);
    const html = `<meta name="viewport" content="w">${many}`;
    const r = checkPreviewBudgets(html);
    expect(r.findings.find((f) => f.id === "script-tags")?.ok).toBe(false);
  });

  it("svg xmlns does not count as insecure asset", () => {
    const html = `<svg xmlns='http://www.w3.org/2000/svg'><rect/></svg><meta name="viewport" content="w">`;
    const r = checkPreviewBudgets(html);
    expect(r.findings.find((f) => f.id === "no-insecure-assets")?.ok).toBe(true);
  });

  it("http src fails insecure check", () => {
    const html = `<img src='http://x'><meta name="viewport" content="w">`;
    const r = checkPreviewBudgets(html);
    expect(r.findings.find((f) => f.id === "no-insecure-assets")?.ok).toBe(false);
  });
});

describe("motion review", () => {
  it("after/before correct, 7 checks, idea mentions metaphor", () => {
    const brief = makeBrief("saas-marketing", "Acme");
    const c = deriveConcept(brief);
    const taste = TasteControls.parse({});
    const mr = motionReviewFor(c, taste);
    expect(mr.after).toBe("art-direction");
    expect(mr.before).toBe("refinement");
    expect(mr.checks.length).toBe(7);
    expect(mr.idea).toContain(c.metaphor);
  });
});

describe("weighted review", () => {
  it("weights math", () => {
    const r = weightedReview({ design: 100, usability: 0, creativity: 0, content: 0 });
    expect(r.score).toBe(40);
    expect(r.weights).toEqual({ design: 0.4, usability: 0.3, creativity: 0.2, content: 0.1 });
  });

  it("band thresholds", () => {
    expect(weightedReview({ design: 100, usability: 100, creativity: 100, content: 100 }).band).toBe("above-bar");
    expect(weightedReview({ design: 70, usability: 70, creativity: 70, content: 70 }).band).toBe("at-bar");
    expect(weightedReview({ design: 55, usability: 55, creativity: 55, content: 55 }).band).toBe("approaching");
    expect(weightedReview({ design: 10, usability: 10, creativity: 10, content: 10 }).band).toBe("below-bar");
  });
});


describe("applyThemeToBrief", () => {
  it("sets brandAccent and colorMood, preserves taste", () => {
    const brief = makeBrief("saas-marketing", "Acme");
    const b = DesignBrief.parse({ ...brief, taste: { density: "sparse", motion: "none" } });
    const theme = getTheme("nocturne-brass")!;
    const next = applyThemeToBrief(b, theme);
    expect(next.brandAccent).toBe(theme.brandAccent);
    expect(next.taste?.colorMood).toBe(theme.colorMood);
    expect(next.taste?.density).toBe("sparse");
    expect(next.taste?.motion).toBe("none");
    expect(b.brandAccent).toBeUndefined();
  });
});

describe("designFromFeatures concept/theme", () => {
  it("attaches concept and themeId when theme passed", () => {
    const brief = makeBrief("saas-marketing", "Freightlane");
    const res = designFromFeatures(brief, { theme: "ink-paper" });
    expect(res.spec.concept).toBeDefined();
    expect(res.spec.themeId).toBe("ink-paper");
    expect(res.spec.brief.brandAccent).toBe(getTheme("ink-paper")!.brandAccent);
  });
  it("attaches concept without theme", () => {
    const brief = makeBrief("saas-marketing", "Freightlane");
    const res = designFromFeatures(brief);
    expect(res.spec.concept).toBeDefined();
    expect(res.spec.themeId).toBeUndefined();
  });
});
