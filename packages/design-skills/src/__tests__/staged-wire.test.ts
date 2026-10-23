import { describe, expect, it } from "vitest";
import { designFromFeatures } from "../orchestrate";
import { DesignBrief } from "../types";

function minimalBrief(productName: string) {
  return DesignBrief.parse({
    productName,
    tagline: "tag",
    audience: "buyers",
    businessGoal: "demos",
    siteKind: "saas-marketing",
    lockSiteKind: true,
    features: [
      { id: "f1", name: "Feature One", description: "desc one", priority: "p0" },
      { id: "f2", name: "Feature Two", description: "desc two", priority: "p1" },
    ],
  });
}

describe("staged wiring", () => {
  it("returns concept with >=3 visibleTests and oneLiner containing productName", () => {
    const { spec } = designFromFeatures(minimalBrief("Freightlane"));
    expect(spec.concept).toBeDefined();
    expect(spec.concept!.visibleTests.length).toBeGreaterThanOrEqual(3);
    expect(spec.concept!.oneLiner).toContain("Freightlane");
  });

  it("same theme for two different productNames gives equal accent and spec.theme", () => {
    const theme = "ink-paper";
    const r1 = designFromFeatures(minimalBrief("AlphaCo"), { theme });
    const r2 = designFromFeatures(minimalBrief("BetaCo"), { theme });
    expect(r1.spec.tokens.color.accent).toBe(r2.spec.tokens.color.accent);
    expect(r1.spec.theme).toBe(theme);
    expect(r2.spec.theme).toBe(theme);
  });

  it("different themes give different accent", () => {
    const r1 = designFromFeatures(minimalBrief("Acme"), { theme: "ink-paper" });
    const r2 = designFromFeatures(minimalBrief("Acme"), { theme: "forest-ledger" });
    expect(r1.spec.tokens.color.accent).not.toBe(r2.spec.tokens.color.accent);
  });

  it("unknown theme throws", () => {
    expect(() => designFromFeatures(minimalBrief("Acme"), { theme: "nope-theme" })).toThrow();
  });
});