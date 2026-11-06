/**
 * Template uniqueness audit (revamp plan v2).
 *
 * The uniqueness contract: a template passes when (a) its concept is not derivable
 * from its siteKind alone, (b) it owns a concept device distinct from every sibling
 * template, and (c) the swap test still passes structurally on its concept. This
 * suite asserts (a)-(c) for templates that carry a per-template concept override
 * and pairwise distinctness across the whole catalog.
 */
import { describe, expect, it } from "vitest";
import {
  buildSwappedBrief,
  deriveConcept,
  getTemplateOverride,
  swapTest,
  TEMPLATE_OVERRIDES,
} from "../staged";
import { DESIGN_TEMPLATES, SHOWCASE_BRIEFS } from "../templates";

describe("template concept overrides", () => {
  it("registers the saas override and prefers it over the site-kind row", () => {
    const brief = SHOWCASE_BRIEFS.saas;
    const base = deriveConcept(brief);
    const overridden = deriveConcept(brief, "saas");
    expect(getTemplateOverride("saas")?.concept).toBeDefined();
    expect(overridden.metaphor).toBe(getTemplateOverride("saas")?.concept?.metaphor);
    expect(overridden.metaphor).not.toBe(base.metaphor);
    expect(overridden.oneLiner).not.toBe(base.oneLiner);
  });

  it("derives every registered concept override verbatim", () => {
    for (const [key, row] of Object.entries(TEMPLATE_OVERRIDES)) {
      if (!row.concept) continue;
      const brief = SHOWCASE_BRIEFS[key];
      const concept = deriveConcept(brief, key);
      expect(concept.metaphor).toBe(row.concept.metaphor);
      expect(concept.rejects).toEqual(row.concept.rejects);
      expect(concept.visibleTests).toEqual(row.concept.visibleTests);
    }
  });

  it("carries the saas template theme in the override, not in a site-kind default", () => {
    expect(getTemplateOverride("saas")?.theme).toBe("ember-clay");
    for (const [key, row] of Object.entries(TEMPLATE_OVERRIDES)) {
      expect(SHOWCASE_BRIEFS[key].theme).toBeUndefined();
    }
  });
});

describe("catalog pairwise distinctness", () => {
  it("gives every template a distinct concept signature", () => {
    const signatures = DESIGN_TEMPLATES.map((t) => {
      const concept = deriveConcept(t.brief, t.key);
      return `${concept.metaphor} :: ${concept.rejects.join("|")}`;
    });
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it("keeps saas and dashboard-webapp apart even with overrides applied", () => {
    const saas = deriveConcept(SHOWCASE_BRIEFS.saas, "saas");
    const dashboard = deriveConcept(SHOWCASE_BRIEFS.dashboard, "dashboard");
    expect(saas.metaphor).not.toBe(dashboard.metaphor);
    expect(saas.visibleTests).not.toEqual(dashboard.visibleTests);
  });
});

describe("swap test under the saas override", () => {
  it("still passes structurally when the brand is swapped", () => {
    const brief = SHOWCASE_BRIEFS.saas;
    const swappedBrief = buildSwappedBrief(brief);
    const original = {
      concept: deriveConcept(brief, "saas"),
      heroTitle: "Know which accounts are moving before the forecast call",
      bodyCopy: [
        "Account scoring ranks every account by fit and live intent",
        "Pipeline coaching flags quiet deals and names the next action",
      ],
      sectionOrder: ["nav", "hero", "features", "proof", "pricing"],
      firstScreenDevice: "hero:crosshair-field-instrument",
    };
    const swapped = {
      concept: deriveConcept(swappedBrief, "saas"),
      heroTitle: "Stranger Brand",
      bodyCopy: ["Swapped description 1", "Swapped description 2"],
      sectionOrder: ["nav", "hero", "chapters", "evidence", "register"],
      firstScreenDevice: "hero:plotted-bearings-rail",
    };
    const r = swapTest(original, swapped);
    expect(r.passed).toBe(true);
    expect(r.gate).toBe("string+structure");
  });
});
